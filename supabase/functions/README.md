# Supabase Edge Functions

## `booking-notification`

Emails `info@redsanddunesdxb.com` whenever a new booking request is saved.

The booking form writes straight to Supabase from the browser, then calls this
function. The function never trusts the caller's payload: it re-reads the row
with the service-role key and stamps `bookings.notified_at` atomically *before*
mailing, so a booking can produce at most one email however often the endpoint
is hit. If Resend rejects the request, the stamp is rolled back so a retry works.

The email carries the quote summary (ref, pickup window, add-ons, total) that
the form stores in `bookings.message`, plus:

- **Reply** goes straight to the guest (`reply_to` is their address)
- **Open admin panel** → `/admin/bookings`
- **WhatsApp guest** → `wa.me` link pre-filled with the booking reference
- **Email guest** → pre-filled subject

### One-time setup

```bash
# 1. Link the CLI to the project (project_id is already in ../config.toml)
supabase login
supabase link --project-ref cwkztwvubclysvxjhvby

# 2. Apply the migration that adds bookings.notified_at
#    Do NOT use `supabase db push` — this project has no recorded migration
#    history, so it would try to replay every migration from scratch. Run the
#    statement below in Dashboard → SQL Editor instead:
#      ALTER TABLE public.bookings
#        ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

# 3. Store the Resend API key
#    Get one at https://resend.com/api-keys
supabase secrets set RESEND_API_KEY=re_xxxxxxxx

# 4. Deploy
supabase functions deploy booking-notification --project-ref cwkztwvubclysvxjhvby --no-verify-jwt
```

`verify_jwt = false` is already set in `supabase/config.toml`: visitors are not
signed in, so there is no user JWT for the gateway to check. The function
verifies itself by loading a real booking row instead.

### Optional secrets

| Secret              | Default                                     |
| ------------------- | ------------------------------------------- |
| `ADMIN_EMAIL`       | `info@redsanddunesdxb.com`                  |
| `NOTIFY_FROM_EMAIL` | `Red Sand Dunes DXB <onboarding@resend.dev>` |
| `SITE_URL`          | `https://redsanddunesdxb.com`               |

Currently `ADMIN_EMAIL` is `redsanddunesdxb0@gmail.com`.

The `onboarding@resend.dev` sender can only deliver to an address that belongs to
the Resend account — the owner's own address, or an address added as a team
member. Sending to anyone else fails with a 403 and the booking is left
un-notified so it can be retried.

To use a different recipient, either add it as a team member in Resend, or
verify `redsanddunesdxb.com` and set a real sender:

```bash
supabase secrets set NOTIFY_FROM_EMAIL="Red Sand Dunes DXB <bookings@redsanddunesdxb.com>"
supabase secrets set ADMIN_EMAIL=info@redsanddunesdxb.com
```

### Manual sends

The admin panel shows a **Studio emailed** badge once a notification went out.
Bookings without one get an **Email me this** button, which invokes the function
with the booking `id` and works for any status. That covers bookings created
before the function was deployed, or sent while the API key was missing.

### Checking it worked

```bash
supabase functions logs booking-notification --tail
```

Each send logs `notified <admin email> about booking <id> (<ref>) for <package>`.
A `resend rejected the request` or `resend call failed` line means the stamp was
rolled back and the booking can be re-sent.
