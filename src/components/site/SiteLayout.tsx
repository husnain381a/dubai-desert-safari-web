import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFloating } from "./WhatsAppButton";
import { Toaster } from "@/components/ui/sonner";
import { SummerOfferPopup } from "./SummerOfferPopup";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloating />
      <SummerOfferPopup />
      <Toaster richColors position="top-right" />
    </div>
  );
}

export function PageHero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-6 text-white">
        <h1 className="font-display text-4xl md:text-6xl font-bold drop-shadow-lg">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/85 text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
