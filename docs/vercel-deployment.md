# Vercel deployment

## Is Vercel setup required?

Yes, if you want a **hosted production URL** for residents. The app is a Next.js server app (Auth.js + Google Sheets API), so it needs a Node/serverless host. Vercel is the natural fit and the repo already includes `vercel.json` for API cache headers.

Local `npm run dev` does not require Vercel.

## 1) Connect GitHub to Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New Project** → import [ankit8volt/scw-resident-portal](https://github.com/ankit8volt/scw-resident-portal).
3. **Root Directory**: leave as repo root (the Next.js app is at the repository root).
4. Framework preset: **Next.js** (auto-detected).
5. Deploy once; note the production URL (e.g. `https://scw-resident-portal.vercel.app`).

Alternatively, from this folder after `vercel login`:

```bash
vercel link
vercel --prod
```

## 2) Environment variables (Vercel → Project → Settings → Environment Variables)

Copy values from your local `.env.local` into **Production** (and **Preview** if you want preview deployments to work):

| Variable | Notes |
|----------|--------|
| `GOOGLE_CLIENT_ID` | OAuth web client |
| `GOOGLE_CLIENT_SECRET` | OAuth web client |
| `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Production URL, e.g. `https://scw-resident-portal.vercel.app` |
| `GOOGLE_SHEETS_ID` | Live spreadsheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account |
| `GOOGLE_PRIVATE_KEY` | Full PEM; paste with `\n` for newlines or use Vercel multiline |

Optional: `TEST_GOOGLE_SHEETS_ID` for a separate test sheet on preview branches.

Redeploy after saving env vars.

## 3) Google OAuth redirect URIs

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth client, add:

- `https://<your-vercel-domain>/api/auth/callback/google`
- For preview deploys: `https://*.vercel.app/api/auth/callback/google` (if your OAuth client type allows wildcard; otherwise add each preview URL or use a fixed production-only callback)

Keep `http://localhost:3000/api/auth/callback/google` for local dev.

## 4) Google Sheets access

Ensure the spreadsheet is shared with the **service account email** as Editor (same as local setup). See [setup-gcp-and-sheets.md](./setup-gcp-and-sheets.md).

## 5) Verify

1. Open the Vercel production URL.
2. Sign in with Google.
3. Confirm dashboard loads data from Sheets.

If auth fails, double-check `NEXTAUTH_URL`, OAuth redirect URIs, and that env vars are set for the environment you deployed (Production vs Preview).
