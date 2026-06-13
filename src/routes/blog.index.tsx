import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Search } from "lucide-react";
import hero from "@/assets/hero-camels.jpg";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Red Sand Dunes DXB" },
      { name: "description", content: "Desert travel tips, Dubai guides and stories from the dunes." },
      { property: "og:title", content: "Blog — Red Sand Dunes DXB" },
      { property: "og:description", content: "Desert travel tips and Dubai guides." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    supabase.from("blogs").select("*").eq("published", true).order("published_at", { ascending: false }).then(({ data }) => setPosts(data ?? []));
  }, []);
  const filtered = posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <SiteLayout>
      <PageHero title="Stories from the Dunes" subtitle="Travel guides, insider tips and desert inspiration." image={hero} />
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="relative max-w-md mb-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="pl-10" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <Link key={b.id} to="/blog/$slug" params={{slug:b.slug}} className="group block rounded-2xl overflow-hidden bg-card border border-border shadow-md hover-lift">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={b.cover_image} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wider text-primary font-medium">{b.category}</div>
                  <h2 className="mt-1 font-display text-xl font-bold line-clamp-2">{b.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{b.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Read more <ChevronRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && <p className="text-muted-foreground col-span-full">No posts yet.</p>}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
