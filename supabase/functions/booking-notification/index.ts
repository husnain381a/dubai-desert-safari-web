// Sends the studio an email when a new booking request lands.
//
// Public endpoint (verify_jwt = false) because booking forms are filled in by
// anonymous visitors. It cannot be used to send arbitrary mail: the function
// only ever reads a row from `bookings` with the service-role key, and it
// stamps `notified_at` atomically before sending, so each booking produces at
// most one email no matter how often it is called.
//
//   POST /functions/v1/booking-notification
//   body: { id? | email?, phone?, package_title?, tour_date? }
//
// `id` pins one exact booking (used by the admin panel's manual resend). The
// booking form sends the guest details it just saved. With no body the function
// mails the oldest un-notified pending booking, so nothing is silently dropped.
//
// Secrets (supabase secrets set ...):
//   RESEND_API_KEY      required
//   ADMIN_EMAIL         optional, defaults to info@redsanddunesdxb.com
//   NOTIFY_FROM_EMAIL   optional, defaults to the Resend onboarding sender
//   SITE_URL            optional, used for the admin-panel link

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "info@redsanddunesdxb.com";
const FROM_EMAIL =
  Deno.env.get("NOTIFY_FROM_EMAIL") ?? "Red Sand Dunes DXB <onboarding@resend.dev>";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://redsanddunesdxb.com").replace(/\/$/, "");
const ADMIN_PHONE = "+971 58 272 5970";

const BRAND = {
  gold: "#D4A017",
  goldDark: "#8A6A0F",
  cream: "#FDF9F1",
  ink: "#2B2622",
  muted: "#6F6257",
  border: "#E8DCC4",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Booking = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string | null;
  package_title: string | null;
  tour_date: string;
  guests: number;
  message: string | null;
  status: string;
  created_at: string;
  notified_at: string | null;
};

/** Escapes untrusted guest input before it lands in the email HTML. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/**
 * Pulls the quote summary the booking form appends to `message`:
 *   "[Quote RSD-260925-7K2Q · Total AED 320 · Pickup 16:00 – 17:00 · Add-ons: Quad ×2]"
 */
function parseQuote(message: string | null | undefined) {
  const note = (message ?? "").match(/\[Quote ([^\]]+)\]/);
  const guestNote = (message ?? "").replace(/\s*\[Quote [^\]]+\]\s*$/, "").trim();
  if (!note) return { ref: null, total: null, pickup: null, addOns: null, guestNote };

  // The regex already consumed the "Quote " label, so the first field is the ref.
  const [ref, ...rest] = note[1].split(" · ");
  const fields: Record<string, string> = {};
  for (const part of rest) {
    const at = part.indexOf(" ");
    if (at === -1) continue;
    fields[part.slice(0, at)] = part.slice(at + 1);
  }
  return {
    ref: ref || null,
    total: fields.Total ?? null,
    pickup: fields.Pickup ?? null,
    addOns: fields["Add-ons:"] ?? null,
    guestNote,
  };
}

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function waLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

// ---------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------

function detailRow(label: string, value: string, last = false) {
  return `
    <tr>
      <td style="padding:10px 0;font:400 13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.muted};border-bottom:${last ? "none" : `1px solid ${BRAND.border}`};">${esc(label)}</td>
      <td style="padding:10px 0;text-align:right;font:600 14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.ink};border-bottom:${last ? "none" : `1px solid ${BRAND.border}`};">${esc(value)}</td>
    </tr>`;
}

function button(href: string, label: string, filled: boolean) {
  return `<a href="${esc(href)}" style="display:inline-block;padding:11px 18px;border-radius:8px;font:600 14px/1 -apple-system,Segoe UI,Roboto,sans-serif;text-decoration:none;${
    filled
      ? `background:${BRAND.gold};color:${BRAND.ink};`
      : `background:transparent;color:${BRAND.goldDark};border:1px solid ${BRAND.gold};`
  }">${esc(label)}</a>`;
}

function buildEmail(booking: Booking) {
  const quote = parseQuote(booking.message);
  const guestWa = waLink(
    booking.phone,
    `Hi ${booking.full_name}, this is Red Sand Dunes DXB about your ${booking.package_title} request${
      quote.ref ? ` (ref ${quote.ref})` : ""
    }. `,
  );
  const adminBookingsUrl = `${SITE_URL}/admin/bookings`;

  const rows = [
    detailRow("Guest", booking.full_name),
    booking.country ? detailRow("Country", booking.country) : "",
    detailRow("Email", booking.email),
    detailRow("Phone", booking.phone),
    detailRow("Package", booking.package_title ?? "—"),
    detailRow("Tour date", formatDate(booking.tour_date)),
    detailRow("Guests", String(booking.guests)),
    quote.pickup ? detailRow("Pickup window", quote.pickup) : "",
    quote.addOns ? detailRow("Add-ons", quote.addOns) : "",
    detailRow("Quoted total", quote.total ?? "On request", true),
  ].join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:${BRAND.cream};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">

      <tr><td style="background:${BRAND.ink};padding:22px 26px;">
        <div style="font:700 20px/1.2 Georgia,serif;color:${BRAND.gold};letter-spacing:.5px;">Red Sand Dunes DXB</div>
        <div style="font:400 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;color:#B9AFA2;margin-top:4px;">New booking request</div>
      </td></tr>

      <tr><td style="padding:24px 26px 6px;">
        <div style="font:700 24px/1.2 Georgia,serif;color:${BRAND.ink};">
          ${esc(quote.ref ?? "Booking request")}
        </div>
        <div style="margin-top:8px;">
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:#FDF3D8;color:${BRAND.goldDark};font:600 11px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;text-transform:uppercase;letter-spacing:.6px;">Awaiting confirmation</span>
        </div>
        <p style="margin:14px 0 0;font:400 14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.muted};">
          A guest sent a booking request from the website. Reply to this email or open WhatsApp to
          confirm the reservation — seats stay on hold until you do.
        </p>
      </td></tr>

      <tr><td style="padding:10px 26px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td></tr>

      ${
        quote.guestNote
          ? `<tr><td style="padding:18px 26px 0;">
              <div style="background:${BRAND.cream};border-left:3px solid ${BRAND.gold};border-radius:6px;padding:12px 14px;font:400 13px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.ink};">${esc(quote.guestNote)}</div>
            </td></tr>`
          : ""
      }

      <tr><td style="padding:22px 26px 6px;">
        <div>${button(adminBookingsUrl, "Open admin panel", true)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="padding:10px 8px 0 0;">${button(guestWa, "WhatsApp guest", false)}</td>
          <td style="padding:10px 0 0;">${button(
            `mailto:${booking.email}?subject=${encodeURIComponent(
              `Your Red Sand Dunes DXB booking${quote.ref ? ` ${quote.ref}` : ""}`,
            )}`,
            "Email guest",
            false,
          )}</td>
        </tr></table>
      </td></tr>

      <tr><td style="padding:26px 26px 24px;border-top:1px solid ${BRAND.border};">
        <div style="font:400 12px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.muted};">
          Reply directly to reach ${esc(booking.email)}.<br>
          Or call the studio on ${esc(ADMIN_PHONE)}.
        </div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = [
    `NEW BOOKING REQUEST — Red Sand Dunes DXB`,
    `Ref: ${quote.ref ?? "—"}`,
    ``,
    `Guest:   ${booking.full_name}${booking.country ? ` (${booking.country})` : ""}`,
    `Email:   ${booking.email}`,
    `Phone:   ${booking.phone}`,
    ``,
    `Package: ${booking.package_title ?? "—"}`,
    `Date:    ${formatDate(booking.tour_date)}`,
    `Guests:  ${booking.guests}`,
    ...(quote.pickup ? [`Pickup:  ${quote.pickup}`] : []),
    ...(quote.addOns ? [`Add-ons: ${quote.addOns}`] : []),
    `Total:   ${quote.total ?? "On request"}`,
    ...(quote.guestNote ? ["", `Guest note: ${quote.guestNote}`] : []),
    ``,
    `Confirm: ${adminBookingsUrl}`,
    `WhatsApp guest: ${guestWa}`,
  ].join("\n");

  return { html, text, ref: quote.ref };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/** Claims the booking for notification. Returns null if it was already sent. */
async function claimBooking(admin: ReturnType<typeof createClient>, id: string) {
  const { data, error } = await admin
    .from("bookings")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", id)
    .is("notified_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`claim failed: ${error.message}`);
  return (data as Booking | null) ?? null;
}

/** Un-claims so a later invocation can retry after a transient failure. */
async function releaseBooking(admin: ReturnType<typeof createClient>, id: string) {
  await admin.from("bookings").update({ notified_at: null }).eq("id", id);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — run: supabase secrets set RESEND_API_KEY=re_...");
    return json({ error: "Email provider not configured" }, 500);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  let hint: {
    id?: string;
    email?: string;
    phone?: string;
    package_title?: string;
    tour_date?: string;
  } = {};
  try {
    hint = await req.json();
  } catch {
    hint = {};
  }

  // Resolve the row. `id` is what the admin panel sends for a manual resend and
  // pins the exact booking; the booking form sends the guest details it just
  // saved; an empty body sweeps the oldest un-notified request.
  let query = admin
    .from("bookings")
    .select("*")
    .is("notified_at", null)
    .order("created_at", { ascending: true })
    .limit(5);

  if (hint.id) {
    query = query.eq("id", hint.id);
  } else {
    query = query.eq("status", "pending");
    if (hint.email) query = query.eq("email", hint.email);
    if (hint.phone) query = query.eq("phone", hint.phone);
    if (hint.package_title) query = query.eq("package_title", hint.package_title);
    if (hint.tour_date) query = query.eq("tour_date", hint.tour_date);
  }

  const { data, error } = await query;
  if (error) return json({ error: error.message }, 500);

  const candidate = (data as Booking[] | null)?.[0];
  if (!candidate) {
    // Nothing to do: already notified, or the row does not exist.
    return json({ ok: true, notified: false, reason: "no pending booking to notify" });
  }

  // `bookings.email` is guest-supplied and the client-side zod schema is
  // bypassable, so refuse to put a malformed value into the Reply-To header.
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(candidate.email)) {
    console.error("booking has an unusable email address", candidate.id);
    return json({ error: "Booking has an invalid email address" }, 422);
  }

  const booking = await claimBooking(admin, candidate.id);
  if (!booking) return json({ ok: true, notified: false, reason: "already notified" });

  const { html, text, ref } = buildEmail(booking);

  try {
    const resend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        // Resend de-duplicates retries that share this key.
        "Idempotency-Key": `booking-${booking.id}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        reply_to: booking.email,
        subject: `New booking ${ref ?? ""} — ${booking.package_title ?? "desert tour"} (${
          booking.full_name
        })`.replace(/\s+/g, " "),
        html,
        text,
      }),
    });

    if (!resend.ok) {
      const detail = await resend.text();
      console.error("resend rejected the request", resend.status, detail);
      await releaseBooking(admin, booking.id);
      return json({ error: "Email provider rejected the request", detail }, 502);
    }
  } catch (err) {
    console.error("resend call failed", err);
    await releaseBooking(admin, booking.id);
    return json({ error: "Email provider unreachable" }, 502);
  }

  console.log(
    `notified ${ADMIN_EMAIL} about booking ${booking.id} (${ref ?? "no ref"}) for ${booking.package_title}`,
  );
  return json({ ok: true, notified: true, id: booking.id, ref });
});
