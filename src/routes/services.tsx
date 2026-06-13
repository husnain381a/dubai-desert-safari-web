import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { BookingDialog } from "@/components/site/BookingDialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import hero from "@/assets/hero-dunebash.jpg";
import svcEvening from "@/assets/svc-evening.jpg";
import svcMorning from "@/assets/svc-morning.jpg";
import svcOvernight from "@/assets/svc-overnight.jpg";
import svcVip from "@/assets/svc-vip.jpg";
import svcCity from "@/assets/svc-city.jpg";
import svcAd from "@/assets/svc-abudhabi.jpg";
import svcBuggy from "@/assets/svc-buggy.jpg";
import svcQuad from "@/assets/svc-quad.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Red Sand Dunes DXB" },
      { name: "description", content: "Desert safaris, dune buggies, quad bikes, Dubai & Abu Dhabi city tours, VIP private experiences and more." },
      { property: "og:title", content: "Services — Red Sand Dunes DXB" },
      { property: "og:description", content: "All our tour services in one place." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const SERVICES = [
  { img: svcEvening, title: "Evening Desert Safari", price: 45, features: ["Hotel pickup & drop-off","Dune bashing in 4×4","Camel ride","BBQ dinner","Tanoura & belly dance","Sheesha lounge"] },
  { img: svcMorning, title: "Morning Desert Safari", price: 35, features: ["Hotel pickup & drop-off","Cooler morning dunes","Sandboarding","Camel ride","Refreshments"] },
  { img: svcOvernight, title: "Overnight Desert Safari", price: 120, features: ["Luxury Bedouin tent","BBQ dinner + breakfast","Stargazing","Sunrise dune walk"] },
  { img: svcVip, title: "VIP Premium Safari", price: 250, features: ["Private 4×4","Candlelit private dinner","Roses & champagne","Personal photographer","Premium camp"] },
  { img: svcCity, title: "Dubai City Tour", price: 60, features: ["Burj Khalifa view","Dubai Marina","Old Dubai & souks","Palm Jumeirah","Half / full day options"] },
  { img: svcAd, title: "Abu Dhabi City Tour", price: 90, features: ["Sheikh Zayed Mosque","Emirates Palace","Corniche","Heritage Village","Lunch included"] },
  { img: svcBuggy, title: "Dune Buggy Adventure", price: 180, features: ["4-seater buggy","Helmet & goggles","Guided route","30–60 min options"] },
  { img: svcQuad, title: "Quad Bike Ride", price: 50, features: ["Self-drive ATV","Safety briefing","Beginners welcome","30–60 min sessions"] },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHero title="Our Services" subtitle="Every desert adventure you've dreamt of — crafted by experts." image={hero} />
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid gap-8 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i*0.05}>
              <article className="grid md:grid-cols-2 overflow-hidden rounded-2xl bg-card border border-border shadow-md hover-lift">
                <img src={s.img} alt={s.title} loading="lazy" className="h-56 md:h-full w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold">{s.title}</h3>
                  <div className="mt-2 text-primary font-bold text-lg">From AED {s.price}<span className="text-sm text-muted-foreground font-normal">/person</span></div>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {s.features.map((f) => (
                      <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <BookingDialog defaultPackage={s.title}>
                    <Button className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90">Book {s.title}</Button>
                  </BookingDialog>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
