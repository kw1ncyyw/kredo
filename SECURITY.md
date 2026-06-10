# KREDO Security Configuration

Security depends on both the React application and the deployed Supabase/Vercel configuration. Run `supabase_setup.sql` in the Supabase SQL Editor after reviewing it for the target project.

## Secrets

Only these public client variables may be exposed to Vite:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WEB3FORMS_ACCESS_KEY`

Never place `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_PASSWORD`, `GMAIL_APP_PASSWORD`, `BREVO_API_KEY`, or `DATABASE_PASSWORD` in frontend code, a `VITE_` variable, Git, or Vercel client-visible configuration. Store server-only secrets in protected server environment variables.

The repository ignores `.env`, `.env.local`, `node_modules`, and `dist`. Keep `.env.example` limited to empty public variable names.

## Required RLS

RLS must remain enabled on:

- `profiles`: authenticated users may select their own row and update only safe profile fields (`first_name` and `last_name`). Only admins may read or manage all profiles. A trigger prevents users from changing ownership, email, role, verification state, KYC state, or timestamps.
- `kyc_requests`: users may create/read their own request. Resubmission must remain owned by the same user and reset to `Pending Review` without admin notes. Admins may read/update all requests.
- `notifications`: users may read their own rows and update only `is_read`. A trigger rejects changes to ownership or notification content. Admin-controlled processes create notifications.
- `contact_requests`: anonymous and authenticated visitors may insert validated pending requests, but only admins may read or update them.
- `transactions`: only the buyer, seller, or an admin may read a transaction. Financial writes are admin/server controlled; use a trusted Edge Function or backend workflow for participant actions.

Admin status is determined only from `profiles.role = 'admin'`. Never trust route names, local storage, user metadata, or client-provided role values for authorization.

## Private KYC Storage

The `kyc-documents` bucket must have `public = false`.

- Store object paths as `<auth.uid()>/<generated-file-name>`.
- Authenticated users may upload, replace, and read only files in their own folder.
- Admins may read KYC objects for review through the `is_admin()` RLS check.
- Admin review uses signed URLs that expire after 300 seconds.
- Never call `getPublicUrl()` for KYC files or save permanent public document URLs.
- Store only bucket-relative object paths in `kyc_requests`.

Recheck the bucket privacy setting in the Supabase dashboard after every storage migration.

## Admin Routes

The application hides the admin navigation item unless Supabase is configured and the loaded profile has `role = 'admin'`. Direct visits to `/admin`, `/ua/admin`, `/ru/admin`, or `/en/admin` require an authenticated Supabase admin profile; normal users are redirected to the dashboard.

Client route checks improve UX only. Supabase RLS is the authorization boundary for profiles, KYC records, contact requests, notifications, transactions, and KYC files.

## Vercel

`vercel.json` keeps the SPA fallback to `index.html`, including language-prefixed routes, and applies:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Frame-Options: DENY`

## Operational Checks

Before deployment:

1. Run `npm run build`.
2. Confirm no forbidden secret names or values exist under `src`.
3. Verify RLS is enabled in Supabase for every listed table.
4. Confirm `kyc-documents` is private and signed URLs expire.
5. Test refreshes on `/ua`, `/ru`, `/en`, and their nested routes.
6. Test the contact form validation, 5,000-character limit, honeypot, loading state, and failure state.

## Deployment Checklist

- [ ] Run `supabase_setup.sql` in the correct Supabase project.
- [ ] Keep the `kyc-documents` bucket private.
- [ ] Never expose or prefix the service role key with `VITE_`.
- [ ] Grant `profiles.role = 'admin'` only through a trusted manual administrator process.
- [ ] Verify RLS is enabled and test every policy with non-admin and admin accounts.
- [ ] Check Vercel environment variables contain only the required public frontend values.
- [ ] Check the contact form honeypot, field limits, translated errors, and request timeout.
