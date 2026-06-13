import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BookingDialog } from "@/components/site/BookingDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, Clock, MessageCircle, ChevronLeft } from "lucide-react";
import { waLink } from "@/lib/site";

export const Route = createFileRoute("/packages/$slug")({
  component: PackageDetail,
});

function PackageDetail() {
  const { slug } = Route.useParams();
  const [p, setP] = useState<any>(null);
  useEffect(() => {
    supabase.from("packages").select("*").eq("slug", slug).maybeSingle().then(({ data }) => setP(data));
  }, [slug]);

  if (!p) return <SiteLayout><div className="pt-32 mx-auto max-w-7xl px-4 py-20">Loading…</div></SiteLayout>;

  return (
    <SiteLayout>
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Link to="/packages" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" /> All packages</Link>
          <div className="mt-6 grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
              </div>
              <h1 className="mt-8 font-display text-4xl md:text-5xl font-bold">{p.title}</h1>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {p.duration}</span>
              </div>
              <p className="mt-6 text-lg text-foreground/85 leading-relaxed">{p.description}</p>
              {(p.highlights as string[])?.length > 0 && (
                <>
                  <h2 className="mt-10 font-display text-2xl font-bold">Highlights</h2>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                    {(p.highlights as string[]).map((h) => (
                      <li key={h} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-1 shrink-0" /> {h}</li>
                    ))}
                  </ul>
                </>
              )}
              {(p.inclusions as string[])?.length > 0 && (
                <>
                  <h2 className="mt-10 font-display text-2xl font-bold">What's included</h2>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                    {(p.inclusions as string[]).map((h) => (
                      <li key={h} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-1 shrink-0" /> {h}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <aside className="lg:col-span-2">
              <div className="sticky top-28 rounded-2xl bg-card border border-border p-6 shadow-lg">
                <div className="text-sm text-muted-foreground">From</div>
                <div className="mt-1 text-4xl font-bold text-primary">AED {p.price}<span className="text-base text-muted-foreground font-normal"> /person</span></div>
                <BookingDialog defaultPackage={p.title}>
                  <Button className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">Book Now</Button>
                </BookingDialog>
                <a href={waLink(`Hi, I'd like info on ${p.title}`)} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                  <Button variant="outline" className="w-full"><MessageCircle className="h-4 w-4" /> WhatsApp inquiry</Button>
                </a>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Free cancellation up to 24h</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Instant confirmation</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Pickup from your hotel</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
