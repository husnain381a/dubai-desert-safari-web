import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { waLink, SITE } from "@/lib/site";
import { MessageCircle, Loader2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  country: z.string().trim().max(80).optional(),
  package_title: z.string().trim().max(120),
  tour_date: z.string().min(8),
  guests: z.coerce.number().int().min(1).max(50),
  message: z.string().trim().max(1000).optional(),
});

export function BookingDialog({ children, defaultPackage }: { children: ReactNode; defaultPackage?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
    }
    setLoading(true);
    const { error } = await supabase.from("bookings").insert(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Booking received! We'll be in touch shortly.");
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Book Your Desert Adventure</DialogTitle>
          <DialogDescription>Fill the form and our team will confirm within hours.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Full name</Label><Input name="full_name" required /></div>
            <div><Label>Email</Label><Input name="email" type="email" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Phone</Label><Input name="phone" required placeholder="+971…" /></div>
            <div><Label>Country</Label><Input name="country" placeholder="UAE" /></div>
          </div>
          <div><Label>Tour package</Label><Input name="package_title" defaultValue={defaultPackage} required placeholder="Evening Desert Safari" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input name="tour_date" type="date" required /></div>
            <div><Label>Guests</Label><Input name="guests" type="number" min={1} defaultValue={2} required /></div>
          </div>
          <div><Label>Message (optional)</Label><Textarea name="message" rows={3} /></div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <a
              href={waLink(`Hi ${SITE.name}, I want to book ${defaultPackage ?? "a desert tour"}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
            <Button type="submit" disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Booking Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
