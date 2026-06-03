import { config as loadEnv } from 'dotenv';
import { google, sheets_v4 } from 'googleapis';

import {
  sheetValidationSpecs,
  USERS_SHEET_HEADERS,
  VALIDATION_FIRST_DATA_ROW,
  VALIDATION_LAST_DATA_ROW,
} from './sheet-validation-rules';

loadEnv({ path: '.env.local' });

const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
  throw new Error('Missing GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_PRIVATE_KEY');
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: serviceAccountEmail,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

function dropdownRule(options: string[]): sheets_v4.Schema$DataValidationRule {
  return {
    condition: {
      type: 'ONE_OF_LIST',
      values: options.map((value) => ({ userEnteredValue: value })),
    },
    showCustomUi: true,
    strict: true,
  };
}

async function getSheetIdByTitle(title: string): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === title);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) {
    throw new Error(`Sheet not found: ${title}. Run npm run seed:sheets first.`);
  }
  return sheetId;
}

async function verifyUsersHeaders() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Users!A1:K1',
  });
  const headers = (response.data.values?.[0] ?? []).map((cell) => String(cell).trim());
  const expected = [...USERS_SHEET_HEADERS];

  const mismatch = expected.some((header, index) => headers[index] !== header);
  if (mismatch) {
    console.warn('Users sheet headers do not match expected layout:');
    console.warn(`  Expected: ${expected.join(' | ')}`);
    console.warn(`  Found:    ${headers.join(' | ')}`);
    console.warn('Run npm run seed:sheets to fix headers, then npm run validate:sheets again.');
    throw new Error('Users sheet headers are out of sync with validation rules.');
  }
}

async function run() {
  await verifyUsersHeaders();

  const requests: sheets_v4.Schema$Request[] = [];

  for (const spec of sheetValidationSpecs) {
    const sheetId = await getSheetIdByTitle(spec.sheetName);

    if (spec.clearValidationRange) {
      requests.push({
        setDataValidation: {
          range: {
            sheetId,
            startRowIndex: VALIDATION_FIRST_DATA_ROW - 1,
            endRowIndex: VALIDATION_LAST_DATA_ROW,
            startColumnIndex: spec.clearValidationRange.startColumnIndex,
            endColumnIndex: spec.clearValidationRange.endColumnIndex,
          },
        },
      });
    } else {
      const columnIndices = spec.columns.map((column) => column.columnIndex);
      const startColumnIndex = Math.min(...columnIndices);
      const endColumnIndex = Math.max(...columnIndices) + 1;
      requests.push({
        setDataValidation: {
          range: {
            sheetId,
            startRowIndex: VALIDATION_FIRST_DATA_ROW - 1,
            endRowIndex: VALIDATION_LAST_DATA_ROW,
            startColumnIndex,
            endColumnIndex,
          },
        },
      });
    }

    for (const column of spec.columns) {
      requests.push({
        setDataValidation: {
          range: {
            sheetId,
            startRowIndex: VALIDATION_FIRST_DATA_ROW - 1,
            endRowIndex: VALIDATION_LAST_DATA_ROW,
            startColumnIndex: column.columnIndex,
            endColumnIndex: column.columnIndex + 1,
          },
          rule: dropdownRule(column.options),
        },
      });
    }
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  console.log(`Cleared stale validations and applied dropdown rules to ${sheetValidationSpecs.reduce((count, spec) => count + spec.columns.length, 0)} columns:`);
  for (const spec of sheetValidationSpecs) {
    for (const column of spec.columns) {
      console.log(
        `  ${spec.sheetName} → column ${column.columnIndex + 1} (${column.header}): ${column.options.join(', ')}`,
      );
    }
  }
  console.log(
    `\nRows ${VALIDATION_FIRST_DATA_ROW}-${VALIDATION_LAST_DATA_ROW} on each sheet now use dropdowns.`,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
