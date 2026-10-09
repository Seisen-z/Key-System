
# Reiya Premium deployment

Prices: EUR 3/month; EUR 30/year (10 paid months + 2 free). Both are recurring PayPal subscriptions, with no trial period. Free users remain accountless.

## Server configuration
The local `.env` contains the reused PayPal merchant credentials from the user-specified Seisen Premium project, plus freshly generated Premium hashing/wrapping secrets. Seisen Premium itself is unchanged. Keep these private; none belong in `VITE_*` variables.
Required server environment: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`), `PREMIUM_KEY_PEPPER`, `PREMIUM_WRAPPING_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_SANDBOX`, `PAYPAL_PREMIUM_MONTHLY_PLAN_ID`, `PAYPAL_PREMIUM_YEARLY_PLAN_ID`, `PAYPAL_WEBHOOK_ID`, `SITE_URL`.

1. Run `node scripts/configure-premium.mjs --create-plans` to create dedicated Reiya products/plans/webhook. It never creates a buyer subscription or charges a customer.
2. Apply `supabase/migrations/202610090001_reiya_premium.sql` in the intended Supabase project. `node scripts/premium-database.mjs` tests in a rolled-back transaction; `--apply` installs it. Management API needs a current `SUPABASE_PAT`.
3. Add the private `.env` server variables to the Vercel deployment environment, then deploy this website. Vite alone serves only frontend files: the `/api/premium` Vercel function is required.
4. Confirm PayPal webhook URL is `SITE_URL/api/premium?action=webhook`. Do not treat the return URL as payment confirmation.
5. Complete a PayPal SANDBOX purchase, activate the returned key in the desktop build, back up synthetic accounts/settings, restore on another Windows device, and test cancellation/refund/expiry. A passed local test is not a live payment or connected-client test.

## Data and authorization
256-bit random Premium keys are hashed with a server-only pepper. The client exchanges a key for a short-lived session; every cloud operation verifies ownership, subscription status, revocation and paid-until time on the server. New devices are limited transactionally (default three); deactivation frees one slot. Patching the UI does not grant cloud API access. Ordinary client reverse engineering is still possible; no client binary can make server secrets inaccessible if they are shipped, so no Premium privileged server secret is shipped.

Cloud snapshots are encrypted with AES-256-GCM in native Rust, with fresh nonces and owner-bound authenticated data. Supabase stores ciphertext. Each cloud encryption key is separately wrapped by a server-only AES key. This is client encryption with server-held key recovery, NOT end-to-end encryption against the service operator. Preserve both server secrets: replacing them blindly breaks license checks or backup-key recovery.

Snapshots include managed accounts (cookies/passwords converted to a portable encrypted snapshot), app JSON data, groups, notes, saved/recent games, session history/events, app settings, `reiya_*` UI preferences and bootstrapper FastFlags/version labels. Runtime PIDs, downloaded Roblox binaries, browser login-profile databases and local vault key/config are machine-specific and are not restored. The source device must have its vault unlocked. Restore re-encrypts credentials for the destination's own vault and is applied before background tasks start, with a local rollback directory. Cloud retains five snapshots, each up to 2 MB plaintext.

Windows DPAPI protects the local Premium key. Keys/session tokens/cloud encryption keys are not persisted in renderer localStorage. The key is a bearer credential: anyone holding it can activate a device and access its profile. Store it privately. First delivery uses a random browser-held recovery proof, expires after 48 hours and is tied to the purchase. Display name is optional, not an authentication mechanism.

## Validation
`node scripts/test-premium.mjs` tests backend authorization/payment checks using synthetic mocks; `npm run build` builds the website. App tests: `cargo test --manifest-path src-tauri/Cargo.toml --lib premium::tests:: -- --test-threads=1`. Native release strips symbols and uses optimized thin-LTO; server enforcement is the primary protection.
