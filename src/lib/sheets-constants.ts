/** Spreadsheet id for the active environment (avoids circular imports with sheet-cache). */
export const SHEET_ID =
  process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_SHEETS_ID
    : process.env.TEST_GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID;
