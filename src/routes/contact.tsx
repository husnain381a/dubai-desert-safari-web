import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { SITE, waLink } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import hero from "@/assets/hero-dunes.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Red Sand Dunes DXB" },
      { name: "description", content: "Get in touch with our Dubai team. Phone, WhatsApp, email or visit our office." },
      { property: "og:title", content: "Contact — Red Sand Dunes DXB" },
      { property: "og:description", content: "Phone, WhatsApp, email, office address." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim() || "n/a",
      package_title: "General Inquiry",
      tour_date: new Date().toISOString().slice(0,10),
      guests: 1,
      message: String(fd.get("message") ?? "").trim(),
    };
    if (!payload.full_name || !payload.email || !payload.message) return toast.error("Please fill all required fields");
    setLoading(true);
    const { error } = await supabase.from("bookings").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent! We'll get back to you shortly.");
    (e.target as HTMLFormElement).reset();
  };
  return (
    <SiteLayout>
      <PageHero title="Get in Touch" subtitle="Our concierge team replies within hours, 7 days a week." image={hero} />
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Talk to a desert expert</h2>
            <p className="mt-3 text-muted-foreground">Have questions about a package, custom itinerary or group booking? Reach out — we'd love to help plan your adventure.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex gap-3"><MapPin className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-semibold">Office</div><div className="text-muted-foreground text-sm">{SITE.address}</div></div></li>
              <li className="flex gap-3"><Phone className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-semibold">Phone</div><a href={`tel:${SITE.phone}`} className="text-muted-foreground text-sm hover:text-primary">{SITE.phone}</a></div></li>
              <li className="flex gap-3"><Mail className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-semibold">Email</div><a href={`mailto:${SITE.email}`} className="text-muted-foreground text-sm hover:text-primary">{SITE.email}</a></div></li>
              <li className="flex gap-3"><MessageCircle className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-semibold">WhatsApp</div><a href={waLink()} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-primary">{SITE.whatsappDisplay}</a></div></li>
            </ul>
            <div className="mt-8 aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-border">
              <iframe src={SITE.mapEmbed} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Office location" />
            </div>
          </div>
          <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-8 shadow-md space-y-4 h-fit">
            <h3 className="font-display text-2xl font-bold">Send us a message</h3>
            <div><Label>Full name *</Label><Input name="name" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email *</Label><Input name="email" type="email" required /></div>
              <div><Label>Phone</Label><Input name="phone" /></div>
            </div>
            <div><Label>Message *</Label><Textarea name="message" rows={5} required /></div>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Send Message</Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
