import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/gallery")({ component: Gallery });

function Gallery() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => supabase.from("gallery_images").select("*").order("sort_order").then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("gallery_images").insert({ url: String(fd.get("url") ?? ""), caption: String(fd.get("caption") ?? "") || null, category: String(fd.get("category") ?? "") || "desert" });
    if (error) return toast.error(error.message);
    (e.target as HTMLFormElement).reset();
    load();
  };
  const del = async (id: string) => { await supabase.from("gallery_images").delete().eq("id", id); load(); };
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Gallery</h1>
      <form onSubmit={add} className="mt-6 rounded-2xl bg-card border border-border p-5 grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
        <div><Label>Image URL</Label><Input name="url" required /></div>
        <div><Label>Caption</Label><Input name="caption" /></div>
        <div><Label>Category</Label><Input name="category" defaultValue="desert" /></div>
        <Button type="submit" className="bg-primary text-primary-foreground">Add</Button>
      </form>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((g) => (
          <div key={g.id} className="rounded-xl bg-card border border-border overflow-hidden">
            <img src={g.url} alt={g.caption || ""} className="aspect-video w-full object-cover" />
            <div className="p-3 flex justify-between items-center">
              <div className="text-sm truncate">{g.caption || g.category}</div>
              <Button size="sm" variant="destructive" onClick={() => del(g.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
