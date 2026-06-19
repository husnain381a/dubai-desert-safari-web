import { useEffect, useState } from "react";
import { Gift, MessageCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SITE, waLink } from "@/lib/site";
import heroDunes from "@/assets/hero-dunes.jpg";

export function SummerOfferPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden border-gold/40 bg-background p-0 shadow-[var(--shadow-gold)] sm:max-w-xl">
        <div className="relative min-h-44">
          <img src={heroDunes} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-gold/30" />
          <div className="relative flex min-h-44 flex-col justify-end p-6 text-white">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
              <Gift className="h-4 w-4" />
              Summer Offer
            </div>
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="font-display text-4xl font-bold leading-none tracking-normal md:text-5xl">
                50% OFF
              </DialogTitle>
              <DialogDescription className="text-base font-medium text-white/90">
                Book your desert safari adventure and enjoy half-price summer savings.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="grid gap-5 p-6">
          <div className="flex items-center gap-3 rounded-md border border-gold/30 bg-secondary/60 p-4">
            <Timer className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">Valid until August 31.</p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="sm:flex-1">
                Maybe Later
              </Button>
            </DialogClose>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-1"
            >
              <a
                href={waLink(
                  `Hi ${SITE.name}, I want to claim the 50% summer offer before August 31.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Claim Offer
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
