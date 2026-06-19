import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Percent, Plus, Pencil, Trash2 } from "lucide-react";
import { formatAED, getPackagePricing, roundPrice, SUMMER_DISCOUNT_RATE } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/admin/packages")({
  component: PackagesAdmin,
});

type Pkg = {
  id?: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price: number;
  old_price: number | null;
  duration: string;
  category: string;
  image_url: string;
  highlights: string[];
  inclusions: string[];
  featured: boolean;
  published: boolean;
  sort_order: number;
};

const empty: Pkg = {
  slug: "",
  title: "",
  short_description: "",
  description: "",
  price: 0,
  old_price: 0,
  duration: "",
  category: "safari",
  image_url: "",
  highlights: [],
  inclusions: [],
  featured: false,
  published: true,
  sort_order: 0,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function PackagesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pkg>(empty);
  const [reordering, setReordering] = useState(false);

  const load = () =>
    supabase
      .from("packages")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setRows(data ?? []));
  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(empty);
    setOpen(true);
  };
  const openEdit = (p: any) => {
    const pricing = getPackagePricing(p);
    setEditing({
      ...p,
      old_price: pricing.originalPrice,
      price: pricing.discountedPrice,
      highlights: p.highlights ?? [],
      inclusions: p.inclusions ?? [],
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      price: Number(editing.price) || 0,
      old_price: Number(editing.old_price) || null,
      sort_order: Number(editing.sort_order) || 0,
    };
    const { id, ...data } = payload as any;
    const res = id
      ? await supabase.from("packages").update(data).eq("id", id)
      : await supabase.from("packages").insert(data as any);
    if (res.error) return toast.error(res.error.message);
    toast.success(id ? "Updated" : "Created");
    setOpen(false);
    load();
  };

  const toggleFeatured = async (p: any) => {
    await supabase.from("packages").update({ featured: !p.featured }).eq("id", p.id);
    load();
  };
  const togglePublished = async (p: any) => {
    await supabase.from("packages").update({ published: !p.published }).eq("id", p.id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    error ? toast.error(error.message) : (toast.success("Deleted"), load());
  };

  const movePackage = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= rows.length) return;

    const nextRows = [...rows];
    [nextRows[index], nextRows[nextIndex]] = [nextRows[nextIndex], nextRows[index]];
    const orderedRows = nextRows.map((pkg, orderIndex) => ({
      ...pkg,
      sort_order: orderIndex + 1,
    }));

    setRows(orderedRows);
    setReordering(true);

    const updates = await Promise.all(
      orderedRows.map((pkg) =>
        supabase.from("packages").update({ sort_order: pkg.sort_order }).eq("id", pkg.id),
      ),
    );

    setReordering(false);
    const error = updates.find((res) => res.error)?.error;
    if (error) {
      toast.error(error.message);
      load();
      return;
    }

    toast.success("Package order updated");
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Packages</h1>
          <p className="text-muted-foreground mt-1">Create, edit and manage your tour packages.</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> New package
        </Button>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.map((p, index) => (
          <div
            key={p.id}
            className="rounded-2xl bg-card border border-border p-5 flex gap-4 items-center flex-wrap"
          >
            <div className="flex items-center gap-1">
              <div className="mr-2 grid h-8 w-8 place-items-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
                {index + 1}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => movePackage(index, -1)}
                disabled={index === 0 || reordering}
                aria-label={`Move ${p.title} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => movePackage(index, 1)}
                disabled={index === rows.length - 1 || reordering}
                aria-label={`Move ${p.title} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <img src={p.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-muted-foreground">
                <span className="line-through">
                  {formatAED(getPackagePricing(p).originalPrice)}
                </span>
                <span className="ml-2 font-semibold text-primary">
                  {formatAED(getPackagePricing(p).discountedPrice)}
                </span>
                <span>
                  {" "}
                  · {p.duration} · {p.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Published</span>
              <Switch checked={p.published} onCheckedChange={() => togglePublished(p)} />
            </div>
            <Button
              variant={p.featured ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFeatured(p)}
            >
              {p.featured ? "Featured" : "Feature"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => del(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-muted-foreground">No packages yet. Click "New package" to add one.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit package" : "New package"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      title: e.target.value,
                      slug: editing.slug || slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Original price (AED)</Label>
                <Input
                  type="number"
                  value={editing.old_price ?? 0}
                  onChange={(e) => {
                    const originalPrice = Number(e.target.value);
                    setEditing({
                      ...editing,
                      old_price: originalPrice,
                      price: roundPrice(originalPrice * SUMMER_DISCOUNT_RATE),
                    });
                  }}
                />
              </div>
              <div>
                <Label>Discounted price (AED)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        price: roundPrice(Number(editing.old_price ?? 0) * SUMMER_DISCOUNT_RATE),
                      })
                    }
                    aria-label="Apply 50% discount"
                  >
                    <Percent className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={editing.duration}
                  onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                  placeholder="6 hours"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  placeholder="safari"
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={editing.image_url}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label>Short description</Label>
              <Input
                value={editing.short_description}
                onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
              />
            </div>
            <div>
              <Label>Full description</Label>
              <Textarea
                rows={4}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Highlights (one per line)</Label>
              <Textarea
                rows={3}
                value={editing.highlights.join("\n")}
                onChange={(e) =>
                  setEditing({ ...editing, highlights: e.target.value.split("\n").filter(Boolean) })
                }
              />
            </div>
            <div>
              <Label>Inclusions (one per line)</Label>
              <Textarea
                rows={3}
                value={editing.inclusions.join("\n")}
                onChange={(e) =>
                  setEditing({ ...editing, inclusions: e.target.value.split("\n").filter(Boolean) })
                }
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={editing.featured}
                  onCheckedChange={(v) => setEditing({ ...editing, featured: v })}
                />{" "}
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={editing.published}
                  onCheckedChange={(v) => setEditing({ ...editing, published: v })}
                />{" "}
                Published
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} className="bg-primary text-primary-foreground">
              {editing.id ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
