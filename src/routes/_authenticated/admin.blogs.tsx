import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/blogs")({ component: BlogsAdmin });

function BlogsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => supabase.from("blogs").select("*").order("published_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "");
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("blogs").insert({
      title, slug,
      excerpt: String(fd.get("excerpt") ?? ""),
      content: String(fd.get("content") ?? ""),
      cover_image: String(fd.get("cover_image") ?? ""),
      category: String(fd.get("category") ?? "") || "travel",
    });
    if (error) return toast.error(error.message);
    toast.success("Post created");
    (e.target as HTMLFormElement).reset();
    load();
  };
  const del = async (id: string) => { if (!confirm("Delete post?")) return; await supabase.from("blogs").delete().eq("id", id); load(); };
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Blog Posts</h1>
      <form onSubmit={create} className="mt-6 rounded-2xl bg-card border border-border p-6 grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Title</Label><Input name="title" required /></div>
          <div><Label>Category</Label><Input name="category" placeholder="travel" /></div>
        </div>
        <div><Label>Cover image URL</Label><Input name="cover_image" /></div>
        <div><Label>Excerpt</Label><Textarea name="excerpt" rows={2} required /></div>
        <div><Label>Content</Label><Textarea name="content" rows={6} required /></div>
        <Button type="submit" className="bg-primary text-primary-foreground w-fit">Publish</Button>
      </form>
      <div className="mt-8 grid gap-3">
        {rows.map((b) => (
          <div key={b.id} className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">{b.excerpt}</div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => del(b.id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
