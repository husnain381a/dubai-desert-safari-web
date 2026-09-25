import {
  formatTourDate,
  formatStamp,
  invoiceMailto,
  invoiceWhatsappLink,
  money,
  type Invoice,
} from "@/lib/invoice";
import { formatAED } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Download, Mail, MessageCircle, ShieldCheck } from "lucide-react";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={`text-sm text-right ${strong ? "font-bold text-foreground" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function InvoicePaper({ invoice }: { invoice: Invoice }) {
  return (
    <div
      data-print-invoice
      className="rounded-xl border border-border bg-white text-ink p-6 space-y-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold">{SITE.name}</h2>
          <p className="text-xs text-muted-foreground mt-1">{SITE.tagline}</p>
          <p className="text-xs text-muted-foreground">{SITE.address}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Booking invoice
          </div>
          <div className="font-display text-xl font-bold text-primary mt-0.5">{invoice.ref}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Issued {formatStamp(invoice.issuedAt)}
          </div>
          <div className="text-xs text-muted-foreground">Status: awaiting confirmation</div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Guest</h3>
          <p className="font-semibold">{invoice.guest.full_name}</p>
          <p className="text-sm text-muted-foreground">{invoice.guest.email}</p>
          <p className="text-sm text-muted-foreground">{invoice.guest.phone}</p>
          {invoice.guest.country && (
            <p className="text-sm text-muted-foreground">{invoice.guest.country}</p>
          )}
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            Trip details
          </h3>
          <p className="font-semibold">{invoice.packageTitle}</p>
          <p className="text-sm text-muted-foreground">{formatTourDate(invoice.tourDate)}</p>
          <p className="text-sm text-muted-foreground">
            {invoice.guests} {invoice.guests === 1 ? "guest" : "guests"}
          </p>
          {invoice.pickupSlot && (
            <p className="text-sm text-muted-foreground">Pickup {invoice.pickupSlot}</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Selected items
        </h3>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="text-left font-semibold px-3 py-2">Item</th>
                <th className="text-right font-semibold px-3 py-2 w-16">Qty</th>
                <th className="text-right font-semibold px-3 py-2 w-28">Unit</th>
                <th className="text-right font-semibold px-3 py-2 w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={`${line.label}-${line.detail}`} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-medium">{line.label}</div>
                    {line.listPrice ? (
                      <div className="text-xs text-muted-foreground line-through">
                        {money(invoice, line.listPrice)} each
                      </div>
                    ) : (
                      line.detail && (
                        <div className="text-xs text-muted-foreground">{line.detail}</div>
                      )
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{line.qty}</td>
                  <td className="px-3 py-2 text-right">{money(invoice, line.unitPrice)}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {money(invoice, line.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex justify-end">
        <div className="w-full sm:w-72 space-y-1">
          <Row label="Subtotal" value={money(invoice, invoice.subtotal)} />
          {invoice.discount > 0 && (
            <Row label="Summer offer" value={`- ${formatAED(invoice.discount)}`} />
          )}
          <div className="border-t border-border pt-2 mt-1">
            <Row label="Total payable" value={money(invoice, invoice.total)} strong />
          </div>
          <p className="text-xs text-muted-foreground text-right pt-1">
            No payment has been taken yet.
          </p>
        </div>
      </section>

      <section className="rounded-lg bg-muted/60 border border-border p-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
          How to confirm your reservation
        </h3>
        <p className="text-sm">
          Send this invoice back to us using either channel below. Your seats are held as{" "}
          <strong>pending</strong> until we reply with a confirmation.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-md bg-white border border-border px-3 py-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
            <div className="text-sm font-semibold break-all">{SITE.email}</div>
          </div>
          <div className="rounded-md bg-white border border-border px-3 py-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</div>
            <div className="text-sm font-semibold">{SITE.whatsappDisplay}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Quote reference <strong>{invoice.ref}</strong> in your message so we can find your
          request.
        </p>
      </section>
    </div>
  );
}

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
        <a href={invoiceMailto(invoice)}>
          <Mail className="h-4 w-4" /> Email invoice
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={invoiceWhatsappLink(invoice)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" /> WhatsApp invoice
        </a>
      </Button>
      <Button variant="outline" onClick={() => window.print()}>
        <Download className="h-4 w-4" /> Save as PDF
      </Button>
    </div>
  );
}

export function InvoiceFooterNote() {
  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
      Prices are per person in AED and include the current summer offer. Anything not listed here
      (private transfers, special menus) is confirmed in writing before you pay.
    </p>
  );
}
