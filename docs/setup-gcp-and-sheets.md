# SCW Villaments Portal setup

## 1) Google Cloud

1. Create project: `scw-villaments-portal`.
2. Enable APIs: Google Sheets API and Google Drive API.
3. Create OAuth 2.0 web client.
   - Add callback: `http://localhost:3000/api/auth/callback/google`
   - Add callback for production and Vercel previews.
4. Create service account key JSON.
5. Share the spreadsheet with service account email as Editor.

## 2) Spreadsheet bootstrap

Create one spreadsheet and set `GOOGLE_SHEETS_ID`.

Then run:

```bash
npm run seed:sheets
npm run validate:sheets
```

`validate:sheets` adds dropdown data validation on enum columns (Role, Status, Category, etc.) for rows 2–5000.

### Votes sheet columns

The `Votes` tab stores one row per villament per poll:

| Column | Purpose |
|--------|---------|
| Poll Question | Which poll |
| Tower | Voter residence tower (dedupe key) |
| Villament Number | Voter residence unit (dedupe key) |
| Flat Number | Display label (e.g. `6-203`) |
| Voter Email | Who submitted |
| Vote Chosen | Selected option(s) |
| Date & Time | When recorded |

Re-run `npm run seed:sheets` after upgrading if your sheet still has the older 5-column layout. Existing rows without Tower/Villament columns are parsed from `Flat Number` when possible.

## 3) Sheet read cache (portal performance)

Google Sheet reads are cached on the server **per tab** (Users, Polls, Votes, Announcements, etc.) using Next.js data cache tags. The cache is **shared for all residents** — not per user.

- **TTL:** 1 hour fallback (`SHEET_CACHE_MAX_AGE_SECONDS` in `src/lib/sheet-cache.ts`).
- **Invalidation:** Any portal write via `appendRow` / `updateRow` clears that tab’s cache immediately (`invalidateSheetCache`).
- **Assumption:** Data changes only through the portal (not manual sheet edits). If you edit the spreadsheet directly, restart the Vercel deployment or wait for the fallback TTL.

Writes that touch multiple tabs invalidate each tab (e.g. suggestion upvote updates both `Suggestions` and `Suggestion Upvotes`).

## 4) Config tab seed values

Insert rows in `Config` sheet:

- Portal Name
- Contact Email
- Quick Link 1 Title
- Quick Link 1 URL
- Quick Link 2 Title
- Quick Link 2 URL
- Welcome Message

## 5) Environment

Copy `.env.example` to `.env.local` and fill all values.

## 6) Local run

```bash
npm run dev
```

