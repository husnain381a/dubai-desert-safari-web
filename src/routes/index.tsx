import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Star, Users, Award, Clock, ShieldCheck, MessageCircle,
  Mountain, Building2, Bike, Sparkles, Sunset, Sunrise, Moon, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { BookingDialog } from "@/components/site/BookingDialog";
import { waLink, SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

import hero1 from "@/assets/hero-dunes.jpg";
import hero2 from "@/assets/hero-camp.jpg";
import hero3 from "@/assets/hero-dunebash.jpg";
import hero4 from "@/assets/hero-camels.jpg";
import svcQuad from "@/assets/svc-quad.jpg";
import svcBuggy from "@/assets/svc-buggy.jpg";
import svcCity from "@/assets/svc-city.jpg";
import svcAd from "@/assets/svc-abudhabi.jpg";
import svcEvening from "@/assets/svc-evening.jpg";
import svcMorning from "@/assets/svc-morning.jpg";
import svcOvernight from "@/assets/svc-overnight.jpg";
import svcVip from "@/assets/svc-vip.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Red Sand Dunes DXB — Luxury Desert Safari Dubai" },
      { name: "description", content: "Award-winning desert safaris, dune bashing, BBQ camps, dune buggies and Dubai city tours. Premium experiences. Book online today." },
      { property: "og:title", content: "Red Sand Dunes DXB — Luxury Desert Safari Dubai" },
      { property: "og:description", content: "Premium desert safaris in Dubai. Dune bashing, BBQ camps, city tours and more." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const HERO = [
  { img: hero1, eyebrow: "Welcome to the Arabian wild", title: "Where Golden Dunes Meet Luxury", sub: "Premium desert safari experiences hand-crafted in Dubai." },
  { img: hero2, eyebrow: "Stars above, fire below", title: "Bedouin Camps Under the Milky Way", sub: "Live music, BBQ feasts and starlit silence." },
  { img: hero3, eyebrow: "Adrenaline meets the desert", title: "Heart-Racing Dune Bashing", sub: "Pro drivers. Top-spec 4×4s. Unforgettable rides." },
  { img: hero4, eyebrow: "Timeless Arabian beauty", title: "Sunset Camel Caravans", sub: "Walk in the footsteps of the Bedouins." },
];

const SERVICES = [
  { icon: Sunset, img: svcEvening, title: "Evening Desert Safari", desc: "Dune bashing, BBQ dinner & live shows.", price: 45 },
  { icon: Sunrise, img: svcMorning, title: "Morning Desert Safari", desc: "Cooler mornings, sandboarding and quad add-ons.", price: 35 },
  { icon: Moon, img: svcOvernight, title: "Overnight Safari", desc: "Sleep under the stars in a luxury Bedouin camp.", price: 120 },
  { icon: Crown, img: svcVip, title: "VIP Premium Safari", desc: "Private 4×4, candlelit dinner, royal treatment.", price: 250 },
  { icon: Building2, img: svcCity, title: "Dubai City Tour", desc: "Burj Khalifa, marinas, souks & old Dubai.", price: 60 },
  { icon: Building2, img: svcAd, title: "Abu Dhabi City Tour", desc: "Grand Mosque, Emirates Palace, Corniche.", price: 90 },
  { icon: Bike, img: svcBuggy, title: "Dune Buggy Adventure", desc: "Roar across the dunes in a 4-seater buggy.", price: 180 },
  { icon: Mountain, img: svcQuad, title: "Quad Bike Ride", desc: "30 / 60-minute self-drive ATV experiences.", price: 50 },
];

const GALLERY = [g1, g2, g3, g4, g5, g6];

function Home() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO.length), 6000);
    return () => clearInterval(t);
  }, []);

  const [packages, setPackages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("packages").select("*").eq("featured", true).order("sort_order").limit(6).then(({ data }) => setPackages(data ?? []));
    supabase.from("testimonials").select("*").eq("approved", true).limit(6).then(({ data }) => setReviews(data ?? []));
    supabase.from("blogs").select("*").eq("published", true).order("published_at", { ascending: false }).limit(3).then(({ data }) => setBlogs(data ?? []));
  }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img src={HERO[slide].img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center md:justify-end px-4 pb-12 md:pb-32 md:px-6 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium">{HERO[slide].eyebrow}</p>
              <h1 className="mt-4 font-display text-5xl md:text-7xl font-bold leading-[1.05]">{HERO[slide].title}</h1>
              <p className="mt-5 max-w-xl text-lg text-white/85">{HERO[slide].sub}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <BookingDialog>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30">
                    Book Now <ChevronRight className="h-4 w-4" />
                  </Button>
                </BookingDialog>
                <a href={waLink("Hello, I'd like to book a desert safari.")} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Us
                  </Button>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-8 right-4 md:right-6 flex gap-2">
            {HERO.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-10 bg-primary" : "w-5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid gap-10 lg:grid-cols-2 items-center">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium">About us</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Dubai's most loved desert storytellers</h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              For over a decade, Red Sand Dunes DXB has guided travellers across the golden Arabian
              landscape — pairing Bedouin tradition with five-star hospitality. From the first dune you
              climb to the last star you count, every moment is yours.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
              {["Licensed by Dubai Tourism","10+ years experience","Professional safety-trained drivers","All-inclusive luxury camps"].map((t)=>(
                <li key={t} className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> {t}</li>
              ))}
            </ul>
            <Link to="/about" className="mt-7 inline-flex items-center gap-2 text-primary font-semibold story-link">
              Discover our story <ChevronRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative">
              <img src={hero2} alt="Bedouin camp" width={800} height={600} loading="lazy" className="rounded-2xl shadow-2xl" />
              <div className="absolute -bottom-6 -left-6 hidden md:block glass rounded-2xl p-5 shadow-xl">
                <div className="flex gap-1 text-primary">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-2 text-sm font-semibold">4.9 / 5 — 2,300+ reviews</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[var(--gradient-night)] text-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            [Users, "25,000+", "Happy Travellers"],
            [Award, "8,500+", "Tours Completed"],
            [Clock, "12", "Years of Adventure"],
            [Star, "98%", "Satisfaction Rate"],
          ].map(([Icon, num, label]: any, i) => (
            <Reveal key={i} delay={i*0.08}>
              <div className="grid place-items-center">
                <Icon className="h-8 w-8 text-primary" />
                <div className="mt-3 font-display text-4xl md:text-5xl font-bold text-yellow-400">{num}</div>
                  <div className="text-black text-sm mt-1">{label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED PACKAGES */}
      <section className="section-pad bg-[var(--gradient-sand)]">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium text-center">Featured packages</p>
            <h2 className="mt-2 text-center font-display text-4xl md:text-5xl font-bold">Hand-Picked Desert Escapes</h2>
            <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">Our most-booked, most-loved experiences — fully inclusive and ready to book.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal key={p.id} delay={i*0.06}>
                <article className="group relative overflow-hidden rounded-2xl bg-card shadow-md hover-lift">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.image_url || hero1} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-bold">{p.title}</h3>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold text-primary">AED {p.price}</div>
                        <div className="text-xs text-muted-foreground">per person</div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.short_description}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {p.duration}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <BookingDialog defaultPackage={p.title}>
                        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Book Now</Button>
                      </BookingDialog>
                      <a href={waLink(`Hi, I'm interested in: ${p.title}`)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></Button>
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/packages"><Button variant="outline" size="lg">View all packages <ChevronRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium text-center">Our services</p>
            <h2 className="mt-2 text-center font-display text-4xl md:text-5xl font-bold">Every Way to Experience the Desert</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i*0.05}>
                <div className="group relative overflow-hidden rounded-2xl bg-card border border-border hover-lift">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={s.img} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <s.icon className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-lg font-bold">{s.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.desc}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm">From <span className="font-bold text-primary">AED {s.price}</span></div>
                      <BookingDialog defaultPackage={s.title}>
                        <button className="text-sm font-semibold text-primary story-link">Book</button>
                      </BookingDialog>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="section-pad bg-[var(--gradient-night)]">
        <div className="mx-auto max-w-5xl px-4 md:px-6 text-center">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium">Watch & be inspired</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">A Glimpse of the Magic</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 aspect-video overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <iframe
                src="https://www.youtube.com/embed/Xa8O85xIVb0"
                title="Dubai Desert Safari"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium text-center">Gallery</p>
            <h2 className="mt-2 text-center font-display text-4xl md:text-5xl font-bold">Moments from the Dunes</h2>
          </Reveal>
          <div className="mt-12 columns-2 md:columns-3 gap-4 [&>*]:mb-4">
            {GALLERY.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt={`Desert moment ${i+1}`}
                loading="lazy"
                whileHover={{ scale: 1.02 }}
                className="w-full rounded-xl shadow-md break-inside-avoid cursor-zoom-in"
              />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad bg-[var(--gradient-sand)]">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium text-center">Travellers say</p>
            <h2 className="mt-2 text-center font-display text-4xl md:text-5xl font-bold">Five-Star Stories</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(reviews.length ? reviews : Array.from({length:3}).map((_,i)=>({
              id: i,
              name: ["Sophie L.","Rajat K.","Emma W."][i],
              country: ["France","India","UK"][i],
              rating: 5,
              comment: [
                "Best day of our Dubai trip. The dune bashing was thrilling and the camp dinner was magical.",
                "World-class service from pickup to drop-off. The VIP package was worth every dirham.",
                "Stars, fire, music — pure desert magic. Our guide Hamad was unforgettable.",
              ][i],
            }))).slice(0,3).map((r:any, i)=>(
              <Reveal key={r.id} delay={i*0.08}>
                <div className="rounded-2xl bg-card p-7 shadow-md h-full flex flex-col">
                  <div className="flex gap-1 text-primary">{Array.from({length:r.rating}).map((_,k)=><Star key={k} className="h-4 w-4 fill-current" />)}</div>
                  <p className="mt-4 text-foreground/90 italic flex-1">"{r.comment}"</p>
                  <div className="mt-5">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.country}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      {blogs.length > 0 && (
        <section className="section-pad">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium text-center">Latest stories</p>
              <h2 className="mt-2 text-center font-display text-4xl md:text-5xl font-bold">From the Journal</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {blogs.map((b, i) => (
                <Reveal key={b.id} delay={i*0.08}>
                  <Link to="/blog/$slug" params={{slug: b.slug}} className="group block rounded-2xl overflow-hidden bg-card shadow-md hover-lift">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={b.cover_image || hero1} alt={b.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <div className="text-xs uppercase tracking-wider text-primary font-medium">{b.category}</div>
                      <h3 className="mt-1 font-display text-xl font-bold line-clamp-2">{b.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{b.excerpt}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Read more <ChevronRight className="h-4 w-4" /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative section-pad overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={hero4} alt="" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>
        <div className="mx-auto max-w-5xl px-4 md:px-6 text-white">
          <Reveal>
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-display text-4xl md:text-6xl font-bold">Your Arabian story starts at sunset.</h2>
            <p className="mt-4 text-white/85 text-lg max-w-2xl">Reserve your spot today — limited seats per camp to keep every experience intimate.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BookingDialog>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl">Book Now</Button>
              </BookingDialog>
              <a href={waLink()} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
