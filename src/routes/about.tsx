import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Award, Heart, Compass, ShieldCheck, Users, Star } from "lucide-react";
import hero from "@/assets/hero-camp.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Red Sand Dunes DXB" },
      { name: "description", content: "Meet the team behind Dubai's most-loved desert safari operator. Our story, mission and the values that guide every tour." },
      { property: "og:title", content: "About Red Sand Dunes DXB" },
      { property: "og:description", content: "Our story, mission, and values." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero title="Our Story" subtitle="A decade of guiding travellers across the golden Arabian wild." image={hero} />
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium">Our story</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Rooted in Bedouin tradition. Built for modern travellers.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Red Sand Dunes DXB was founded in 2011 by a small group of Emirati desert guides with one belief —
              the desert should be experienced, not just visited. Today we host travellers from over 80
              countries, blending traditional Arabian hospitality with the comfort and safety of a modern tour
              operator.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Every driver is safety-certified, every camp is sustainably operated, and every guest is treated
              like family — because in the desert, that's exactly what we are.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <img src={hero} alt="Desert camp" loading="lazy" className="rounded-2xl shadow-2xl" />
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-[var(--gradient-sand)]">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid md:grid-cols-2 gap-8">
          <Reveal>
            <div className="rounded-2xl bg-card p-8 shadow-md h-full">
              <Compass className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-display text-2xl font-bold">Our Mission</h3>
              <p className="mt-3 text-muted-foreground">To craft authentic, safe and unforgettable desert experiences that honour Bedouin heritage and create memories travellers carry home for life.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-card p-8 shadow-md h-full">
              <Heart className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-display text-2xl font-bold">Our Vision</h3>
              <p className="mt-3 text-muted-foreground">To be the most trusted, most loved luxury safari operator in the UAE — known for hospitality, sustainability and stories that last forever.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal><h2 className="text-center font-display text-4xl md:text-5xl font-bold">Why Choose Us</h2></Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Award, "Award-winning", "Recognized by Dubai Tourism for service excellence."],
              [ShieldCheck, "Safety first", "Certified drivers, modern fleet, full insurance."],
              [Users, "Local guides", "Born-and-raised Emirati storytellers."],
              [Star, "5-star reviews", "Thousands of happy travellers across the globe."],
            ].map(([Icon, t, d]: any, i) => (
              <Reveal key={t} delay={i*0.06}>
                <div className="rounded-2xl bg-card p-6 border border-border h-full">
                  <Icon className="h-7 w-7 text-primary" />
                  <h3 className="mt-3 font-display text-xl font-bold">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
