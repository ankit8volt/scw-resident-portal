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

## 3) Config tab seed values

Insert rows in `Config` sheet:

- Portal Name
- Contact Email
- Quick Link 1 Title
- Quick Link 1 URL
- Quick Link 2 Title
- Quick Link 2 URL
- Welcome Message

## 4) Environment

Copy `.env.example` to `.env.local` and fill all values.

## 5) Local run

```bash
npm run dev
```

