import { config as loadEnv } from 'dotenv';
import { google } from 'googleapis';

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

const headersBySheet: Record<string, string[]> = {
  Users: [
    'Email',
    'Name',
    'Picture',
    'Flat Number',
    'Role',
    'Status',
    'Added By',
    'Added On',
    'Approved On',
    'Action Reason',
  ],
  Projects: [
    'Project Name',
    'Category',
    'Status',
    'Description',
    'Start Date',
    'Expected End Date',
    'Added By',
    'Added On',
  ],
  'Project Updates': [
    'Project Name',
    'Update Details',
    'Photo Link',
    'Date',
    'Posted By',
    'Posted On',
  ],
  Announcements: [
    'Title',
    'Full Message',
    'Type',
    'Pin on Homepage?',
    'Show From Date',
    'Status',
    'Added By',
    'Added On',
  ],
  Polls: [
    'Question',
    'More Details',
    'Poll Type',
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Voting Opens',
    'Voting Closes',
    'Show Results To',
    'Status',
    'Created By',
    'Created On',
  ],
  Votes: ['Poll Question', 'Flat Number', 'Voter Email', 'Vote Chosen', 'Date & Time'],
  Documents: [
    'Document Title',
    'Category',
    'Year',
    'Short Description',
    'Google Drive Link',
    'Visible To',
    'Added By',
    'Added On',
  ],
  Suggestions: [
    'Title',
    'Description',
    'Category',
    'Status',
    'Admin Response',
    'Upvote Count',
    'Submitted By',
    'Submitted On',
    'Submitted By Email',
  ],
  'Suggestion Upvotes': [
    'Suggestion ID',
    'Voter Email',
    'Voter Flat Number',
    'Withdrawn',
    'Timestamp',
  ],
  Config: ['Setting Name', 'Value'],
  'Audit Log': ['Date & Time', 'Done By', 'Action', 'Details'],
};

async function upsertSheet(sheetTitle: string) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  const existing = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === sheetTitle,
  );

  if (!existing) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetTitle },
            },
          },
        ],
      },
    });
  }
}

async function run() {
  for (const sheetName of Object.keys(headersBySheet)) {
    await upsertSheet(sheetName);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headersBySheet[sheetName]],
      },
    });
    console.log(`Seeded headers for ${sheetName}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
