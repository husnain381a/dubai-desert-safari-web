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
supabase link --project-ref bfvbbpwxfjdqqvxjgjix

# 2. Apply the migration that adds bookings.notified_at
supabase db push

# 3. Store the Resend API key
#    Get one at https://resend.com/api-keys
supabase secrets set RESEND_API_KEY=re_xxxxxxxx

# 4. Deploy
supabase functions deploy booking-notification --no-verify-jwt
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

`onboarding@resend.dev` only delivers to the Resend account's own address. Once
`redsanddunesdxb.com` is verified in Resend, set a real sender, e.g.:

```bash
supabase secrets set NOTIFY_FROM_EMAIL="Red Sand Dunes DXB <bookings@redsanddunesdxb.com>"
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
