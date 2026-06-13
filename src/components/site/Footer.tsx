import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone, ArrowUp } from "lucide-react";
import { SITE } from "@/lib/site";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    toast.success("Subscribed! Welcome to the dunes.");
    setEmail("");
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <footer className="bg-[oklch(0.16_0.02_60)] text-white/85">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">{SITE.name}</h3>
          <p className="mt-3 text-sm text-white/70">{SITE.description}</p>
          <div className="mt-5 flex gap-3">
            {[
              [SITE.socials.instagram, Instagram],
              [SITE.socials.facebook, Facebook]
            ].map(([href, Icon]: any, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-primary hover:text-ink transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/", "Home"],
              ["/about", "About"],
              ["/services", "Services"],
              ["/packages", "Packages"]
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />{SITE.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />{SITE.phone}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />{SITE.email}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-white">Newsletter</h4>
          <p className="mt-3 text-sm text-white/70">Deals, new tours, desert stories.</p>
          <form onSubmit={subscribe} className="mt-4 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-4 rounded-md bg-primary text-ink text-sm font-semibold hover:opacity-90">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div className="text-white/60">Developed by <a href="https://www.husnainmazhar.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">Husnain Mazhar</a></div>
          <button onClick={scrollToTop} className="flex items-center gap-1 hover:text-primary transition-colors md:mr-10">
            <ArrowUp className="h-4 w-4" /> Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
