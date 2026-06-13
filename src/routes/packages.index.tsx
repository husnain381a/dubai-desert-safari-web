import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { BookingDialog } from "@/components/site/BookingDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, MessageCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { waLink } from "@/lib/site";
import hero from "@/assets/hero-dunes.jpg";

export const Route = createFileRoute("/packages/")({
  head: () => ({
    meta: [
      { title: "Packages — Red Sand Dunes DXB" },
      { name: "description", content: "Browse and book all our desert safari and tour packages: evening, morning, overnight, VIP and more." },
      { property: "og:title", content: "All Tour Packages — Red Sand Dunes DXB" },
      { property: "og:description", content: "Browse and book all our desert safari packages." },
      { property: "og:url", content: "/packages" },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const [data, setData] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  useEffect(() => {
    supabase.from("packages").select("*").order("sort_order").then(({ data }) => setData(data ?? []));
  }, []);
  const categories = useMemo(() => ["all", ...Array.from(new Set(data.map((d) => d.category)))], [data]);
  const filtered = data.filter((p) =>
    (cat === "all" || p.category === cat) &&
    (q === "" || p.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <SiteLayout>
      <PageHero title="All Packages" subtitle="Find your perfect Arabian adventure." image={hero} />
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search packages…" className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${cat===c?"bg-primary text-primary-foreground":"bg-secondary text-secondary-foreground hover:bg-accent"}`}>{c.replace("-"," ")}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.id} className="group overflow-hidden rounded-2xl bg-card border border-border shadow-md hover-lift">
                <Link to="/packages/$slug" params={{slug:p.slug}} className="block aspect-[4/3] overflow-hidden">
                  <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </Link>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold">{p.title}</h3>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-primary">AED {p.price}</div>
                      <div className="text-xs text-muted-foreground">per person</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.short_description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {p.duration}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <BookingDialog defaultPackage={p.title}>
                      <Button className="flex-1 bg-primary text-primary-foreground">Book Now</Button>
                    </BookingDialog>
                    <a href={waLink(`Hi, about: ${p.title}`)} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></Button>
                    </a>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No packages match your search.</p>}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
