import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { waLink, SITE } from "@/lib/site";
import { ADD_ONS, PICKUP_SLOTS, lookupServicePrice } from "@/lib/catalog";
import { formatAED, getPackagePricing, roundPrice } from "@/lib/pricing";
import { buildInvoice, composeBookingMessage, createInvoiceRef, type Invoice } from "@/lib/invoice";
import { InvoiceActions, InvoiceFooterNote, InvoicePaper } from "./InvoicePaper";
import { usePrintInvoice } from "@/hooks/use-print-invoice";
import { Check, Loader2, MessageCircle, Minus, Plus, Receipt } from "lucide-react";

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

type Props = {
  children: ReactNode;
  defaultPackage?: string;
  /** Price charged per guest (after discount), when the caller already knows it. */
  defaultPrice?: number;
  /** Pre-discount price per guest, when the package is on offer. */
  defaultOldPrice?: number;
};

type Quote = {
  unitPrice: number;
  listPrice?: number;
  source: "prop" | "service" | "package" | "none";
};

const EMPTY_QUOTE: Quote = { unitPrice: 0, listPrice: undefined, source: "none" };

export function BookingDialog({ children, defaultPackage, defaultPrice, defaultOldPrice }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "invoice">("form");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  usePrintInvoice(step === "invoice" && invoice != null);

  const [title, setTitle] = useState(defaultPackage ?? "");
  const [tourDate, setTourDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [pickup, setPickup] = useState("");
  const [addOnQty, setAddOnQty] = useState<Record<string, number>>({});
  const [quote, setQuote] = useState<Quote>(
    defaultPrice != null
      ? { unitPrice: defaultPrice, listPrice: defaultOldPrice, source: "prop" }
      : EMPTY_QUOTE,
  );

  // Reset to a blank form every time the dialog is opened.
  useEffect(() => {
    if (!open) return;
    setStep("form");
    setInvoice(null);
    formRef.current?.reset();
    setTitle(defaultPackage ?? "");
    setTourDate("");
    setGuests(2);
    setPickup("");
    setAddOnQty({});
    setQuote(
      defaultPrice != null
        ? { unitPrice: defaultPrice, listPrice: defaultOldPrice, source: "prop" }
        : EMPTY_QUOTE,
    );
  }, [open, defaultPackage, defaultPrice, defaultOldPrice]);

  /**
   * Resolve the price of whatever title the guest typed. Props win (the package
   * page knows the price), then the hard-coded service catalog, then the
   * packages table. Keeps the "Book Now" buttons working from the header too.
   */
  useEffect(() => {
    const isDefaultTitle = !defaultPackage || title.trim() === defaultPackage.trim();
    if (defaultPrice != null && isDefaultTitle) return;
    const trimmed = title.trim();
    if (trimmed.length < 3) {
      setQuote(EMPTY_QUOTE);
      return;
    }
    const servicePrice = lookupServicePrice(trimmed);
    if (servicePrice != null) {
      setQuote({ unitPrice: servicePrice, listPrice: undefined, source: "service" });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      supabase
        .from("packages")
        .select("title, price, old_price")
        .eq("title", trimmed)
        .maybeSingle()
        .then(({ data }) => {
          if (cancelled) return;
          if (!data) {
            setQuote(EMPTY_QUOTE);
            return;
          }
          const { discountedPrice, originalPrice } = getPackagePricing(data);
          setQuote({
            unitPrice: discountedPrice,
            listPrice: originalPrice > discountedPrice ? originalPrice : undefined,
            source: "package",
          });
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [title, defaultPrice, defaultPackage]);

  const selectedAddOns = useMemo(
    () =>
      ADD_ONS.filter((a) => (addOnQty[a.id] ?? 0) > 0).map((a) => ({
        label: a.label,
        price: a.price,
        qty: addOnQty[a.id],
      })),
    [addOnQty],
  );

  const estimatedTotal = useMemo(() => {
    if (quote.unitPrice <= 0 && selectedAddOns.length === 0) return null;
    return roundPrice(
      quote.unitPrice * guests + selectedAddOns.reduce((s, a) => s + a.price * a.qty, 0),
    );
  }, [quote.unitPrice, guests, selectedAddOns]);

  const setAddOn = (id: string, next: number) =>
    setAddOnQty((prev) => ({ ...prev, [id]: Math.max(0, next) }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
    }
    if (!pickup) return toast.error("Please choose a pickup window");

    const guest = {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      country: parsed.data.country || undefined,
    };
    const draft = buildInvoice({
      ref: createInvoiceRef(),
      guest,
      packageTitle: parsed.data.package_title,
      tourDate: parsed.data.tour_date,
      guests: parsed.data.guests,
      pickupSlot: pickup,
      unitPrice: quote.unitPrice,
      listPrice: quote.listPrice,
      addOns: selectedAddOns,
    });

    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      ...parsed.data,
      message: composeBookingMessage(parsed.data.message, draft),
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    setInvoice(draft);
    setStep("invoice");
    toast.success("Booking request received — your invoice is ready.");
    form.reset();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={
          step === "invoice"
            ? "max-w-3xl max-h-[92vh] overflow-y-auto"
            : "max-w-lg max-h-[90vh] overflow-y-auto"
        }
      >
        {step === "invoice" && invoice ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Your booking invoice
              </DialogTitle>
              <DialogDescription>
                Booking request {invoice.ref} is saved. Send the invoice below to us to lock in your
                reservation.
              </DialogDescription>
            </DialogHeader>
            <InvoicePaper invoice={invoice} />
            <div className="space-y-3 pt-1">
              <InvoiceActions invoice={invoice} />
              <InvoiceFooterNote />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Book Your Desert Adventure
              </DialogTitle>
              <DialogDescription>
                Fill the form, pick your add-ons — we&apos;ll prepare an instant invoice for you to
                send back for final confirmation.
              </DialogDescription>
            </DialogHeader>
            <form ref={formRef} onSubmit={onSubmit} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Full name</Label>
                  <Input name="full_name" required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" required placeholder="+971…" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input name="country" placeholder="UAE" />
                </div>
              </div>

              <div>
                <Label>Tour package / service</Label>
                <Input
                  name="package_title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Evening Desert Safari"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {quote.source === "none"
                    ? "We couldn't match this to a price — the invoice will say “on request” and our team will quote you."
                    : `${formatAED(quote.unitPrice)} per person` +
                      (quote.listPrice ? ` · was ${formatAED(quote.listPrice)}` : "")}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input
                    name="tour_date"
                    type="date"
                    min={today}
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Guests</Label>
                  <Input
                    name="guests"
                    type="number"
                    min={1}
                    max={50}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                    required
                  />
                </div>
                <div>
                  <Label>Pickup window</Label>
                  <select
                    name="pickup_slot"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="">Select…</option>
                    {PICKUP_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="rounded-lg border border-border p-3">
                <legend className="px-1 text-sm font-medium">Add-ons (optional)</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ADD_ONS.map((a) => {
                    const qty = addOnQty[a.id] ?? 0;
                    return (
                      <div key={a.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`addon-${a.id}`}
                          checked={qty > 0}
                          onCheckedChange={(checked) => setAddOn(a.id, checked ? 1 : 0)}
                        />
                        <label
                          htmlFor={`addon-${a.id}`}
                          className="flex-1 text-sm cursor-pointer select-none"
                        >
                          {a.label}
                          <span className="block text-xs text-muted-foreground">
                            {formatAED(a.price)} {a.per === "person" ? "per person" : "per booking"}
                          </span>
                        </label>
                        {qty > 0 && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={`Remove one ${a.label}`}
                              onClick={() => setAddOn(a.id, qty - 1)}
                              className="grid h-6 w-6 place-items-center rounded border border-input hover:bg-accent"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm tabular-nums">{qty}</span>
                            <button
                              type="button"
                              aria-label={`Add one ${a.label}`}
                              onClick={() => setAddOn(a.id, qty + 1)}
                              className="grid h-6 w-6 place-items-center rounded border border-input hover:bg-accent"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <Label>Message (optional)</Label>
                <Textarea name="message" rows={3} />
              </div>

              {estimatedTotal != null && (
                <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5 text-secondary-foreground">
                    <Check className="h-4 w-4 text-primary" /> Estimated total
                  </span>
                  <span className="font-bold text-secondary-foreground">
                    {formatAED(estimatedTotal)}
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <a
                  href={waLink(
                    `Hi ${SITE.name}, I want to book ${defaultPackage ?? "a desert tour"}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Us
                </a>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Booking Request
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
