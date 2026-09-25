import { supabase } from "@/integrations/supabase/client";

export type NotifyBookingInput = {
  email: string;
  phone: string;
  package_title: string;
  tour_date: string;
};

/**
 * Emails the studio about a booking that was just saved.
 *
 * Fire-and-forget on purpose: the booking row is already committed, so a
 * notification failure must never cost the guest their request. The edge
 * function dedupes on `bookings.notified_at`, so a retry is harmless.
 *
 * Returns the failure reason, or null when the notification went out.
 */
export async function notifyAdminOfBooking(input: NotifyBookingInput): Promise<string | null> {
  try {
    const { error } = await supabase.functions.invoke("booking-notification", { body: input });
    if (error) {
      console.warn("[booking] admin notification failed:", error.message);
      return error.message;
    }
    return null;
  } catch (err) {
    console.warn("[booking] admin notification failed:", err);
    return err instanceof Error ? err.message : String(err);
  }
}
