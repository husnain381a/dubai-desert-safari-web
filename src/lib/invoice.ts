import { SITE, waLink } from "./site";
import { formatAED, roundPrice } from "./pricing";

export type InvoiceGuest = {
  full_name: string;
  email: string;
  phone: string;
  country?: string;
};

export type InvoiceLine = {
  label: string;
  detail?: string;
  qty: number;
  /** Price actually charged per unit (after any package discount). */
  unitPrice: number;
  /** Pre-discount unit price, only set when the line carries a discount. */
  listPrice?: number;
  total: number;
};

export type Invoice = {
  /** Human-friendly quote reference, e.g. RSD-250925-7K2Q. */
  ref: string;
  issuedAt: string;
  guest: InvoiceGuest;
  packageTitle: string;
  tourDate: string;
  guests: number;
  pickupSlot?: string;
  addOnLabels: string[];
  lines: InvoiceLine[];
  subtotal: number;
  discount: number;
  total: number;
  /** False when no price could be resolved — the invoice then reads "On request". */
  priced: boolean;
};

export type AddOnSelection = {
  label: string;
  price: number;
  qty: number;
};

type BuildInvoiceInput = {
  ref: string;
  guest: InvoiceGuest;
  packageTitle: string;
  tourDate: string;
  guests: number;
  pickupSlot?: string;
  /** Price charged per guest after discount. */
  unitPrice: number;
  /** Pre-discount price per guest, when the package is on offer. */
  listPrice?: number;
  addOns: AddOnSelection[];
  issuedAt?: string;
};

export function buildInvoice(input: BuildInvoiceInput): Invoice {
  const guests = Math.max(1, input.guests);
  const addOnTotal = input.addOns.reduce((sum, a) => sum + roundPrice(a.price * a.qty), 0);
  const hasPrice = input.unitPrice > 0 || addOnTotal > 0;

  const lines: InvoiceLine[] = [
    {
      label: input.packageTitle,
      detail: "per person",
      qty: guests,
      unitPrice: input.unitPrice,
      listPrice: input.listPrice && input.listPrice > input.unitPrice ? input.listPrice : undefined,
      total: roundPrice(input.unitPrice * guests),
    },
    ...input.addOns.map((a) => ({
      label: a.label,
      detail: "add-on",
      qty: a.qty,
      unitPrice: a.price,
      total: roundPrice(a.price * a.qty),
    })),
  ];

  const subtotal = roundPrice(
    lines.reduce((sum, l) => sum + (l.listPrice ?? l.unitPrice) * l.qty, 0),
  );
  const discount = roundPrice(
    lines.reduce((sum, l) => sum + ((l.listPrice ?? l.unitPrice) - l.unitPrice) * l.qty, 0),
  );

  return {
    ref: input.ref,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    guest: input.guest,
    packageTitle: input.packageTitle,
    tourDate: input.tourDate,
    guests,
    pickupSlot: input.pickupSlot,
    addOnLabels: input.addOns.map((a) => `${a.label} ×${a.qty}`),
    lines,
    subtotal,
    discount,
    total: roundPrice(subtotal - discount),
    priced: hasPrice,
  };
}

/** e.g. RSD-250925-7K2Q */
export function createInvoiceRef(date = new Date()): string {
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate(),
  ).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `RSD-${stamp}-${code}`;
}

export function formatTourDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function money(invoice: Invoice, value: number) {
  return invoice.priced ? formatAED(value) : "On request";
}

/** Plain-text invoice, used for the email body, the WhatsApp message and copy/paste. */
export function invoiceToText(invoice: Invoice): string {
  const { guest } = invoice;
  const rows = invoice.lines.map((l) => {
    const was = l.listPrice ? ` (was ${formatAED(l.listPrice)} each)` : "";
    return `• ${l.label}${was} — ${l.qty} × ${formatAED(l.unitPrice)} = ${formatAED(l.total)}`;
  });

  return [
    `${SITE.name.toUpperCase()} — BOOKING INVOICE`,
    `Ref: ${invoice.ref}`,
    `Issued: ${formatStamp(invoice.issuedAt)}`,
    "",
    "GUEST",
    `Name: ${guest.full_name}${guest.country ? ` (${guest.country})` : ""}`,
    `Email: ${guest.email}`,
    `Phone: ${guest.phone}`,
    "",
    "SELECTED ITEMS",
    ...rows,
    "",
    `Subtotal: ${money(invoice, invoice.subtotal)}`,
    ...(invoice.discount > 0 ? [`Offer discount: -${formatAED(invoice.discount)}`] : []),
    `TOTAL: ${money(invoice, invoice.total)}`,
    "",
    "TRIP DETAILS",
    `Package: ${invoice.packageTitle}`,
    `Tour date: ${formatTourDate(invoice.tourDate)}`,
    `Guests: ${invoice.guests}`,
    ...(invoice.pickupSlot ? [`Pickup window: ${invoice.pickupSlot}`] : []),
    ...(invoice.addOnLabels.length ? [`Add-ons: ${invoice.addOnLabels.join(", ")}`] : []),
    "",
    "No payment has been taken yet. To confirm the reservation please send this",
    `invoice back to us on WhatsApp ${SITE.whatsappDisplay} or email ${SITE.email}.`,
  ].join("\n");
}

export function invoiceMailto(invoice: Invoice): string {
  const subject = `Booking invoice ${invoice.ref} — ${invoice.packageTitle} (${formatTourDate(
    invoice.tourDate,
  )})`;
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    invoiceToText(invoice),
  )}`;
}

export function invoiceWhatsappLink(invoice: Invoice): string {
  return waLink(invoiceToText(invoice));
}

/**
 * Compact one-line summary stored alongside the booking row so the team can see
 * the quote (ref, total, add-ons) in the admin bookings list.
 */
export function invoiceNote(invoice: Invoice): string {
  const parts = [`Quote ${invoice.ref}`, `Total ${money(invoice, invoice.total)}`];
  if (invoice.pickupSlot) parts.push(`Pickup ${invoice.pickupSlot}`);
  if (invoice.addOnLabels.length) parts.push(`Add-ons: ${invoice.addOnLabels.join(", ")}`);
  return `[${parts.join(" · ")}]`;
}

/** Merges the guest's note with the quote summary, respecting the 1000-char limit. */
export function composeBookingMessage(userMessage: string | undefined, invoice: Invoice): string {
  const note = invoiceNote(invoice);
  const message = (userMessage ?? "").trim();
  if (!message) return note.slice(0, 1000);
  const room = Math.max(0, 1000 - note.length - 2);
  return `${message.slice(0, room)}\n\n${note}`;
}
