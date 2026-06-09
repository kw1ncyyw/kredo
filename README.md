# KREDO

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run `supabase_setup.sql` in the Supabase SQL Editor.
5. Start the app with `npm run dev`.

## Email verification

Configure Supabase Auth SMTP with `kredo.verify@gmail.com` as the sender.
This address is only the sender. Supabase sends the code to the email entered by the registering user.

In **Authentication > Email Templates > Confirm sign up**, use `{{ .Token }}` in the message body. The app verifies that six-digit code with:

```ts
supabase.auth.verifyOtp({
  email,
  token: code,
  type: 'signup',
});
```

Do not replace the token with a confirmation URL.

## Contact form

Set `VITE_WEB3FORMS_ACCESS_KEY` to a Web3Forms access key. The contact form posts `name`, `email`, `topic`, and `message` to `https://api.web3forms.com/submit`.

When Supabase is configured, the form also stores the request in `contact_requests`. The only public contact address is `kredo.support.ua@gmail.com`.

KYC documents and requests are never emailed. They are stored privately in Supabase and reviewed through the protected admin panel.

When `VITE_WEB3FORMS_ACCESS_KEY` is configured, a successful KYC submission may send a metadata-only admin notice. It contains the user's name, email, submission date, and status. It never contains files, storage paths, or signed URLs.

## Admin access

New profiles receive `role = 'user'`. Promote an administrator only through a trusted database/backend operation:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

KYC files are stored in the private `kyc-documents` bucket. Users can access only their own folder; administrators receive short-lived signed links.

## Secret handling

Only the Supabase URL and anonymous key belong in frontend `VITE_` variables. Keep `SUPABASE_SERVICE_ROLE_KEY`, SMTP passwords, Gmail app passwords, database passwords, and email-provider API keys on the server.
