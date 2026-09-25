-- Admin booking notifications.
--
-- The booking-notification edge function claims a row by stamping notified_at
-- before mailing, which makes the send exactly-once even if the function is
-- invoked twice. Column is nullable so existing rows are "never notified".
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

COMMENT ON COLUMN public.bookings.notified_at IS
  'When the new-booking notification email was sent to the studio (set by the booking-notification edge function).';
