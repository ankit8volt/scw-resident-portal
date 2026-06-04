import { google } from 'googleapis';

import { hasCompleteResidence } from '@/lib/residence-options';
import {
  parseUserSheetRow,
  pickCanonicalUser,
  USER_SHEET_HEADERS,
} from '@/lib/user-sheet';
import { parseVoteSheetRow, VOTE_SHEET_HEADERS } from '@/lib/vote-residence';
import type {
  Announcement,
  AuditLog,
  ConfigSetting,
  DocumentItem,
  Poll,
  Project,
  ProjectUpdate,
  Suggestion,
  SuggestionUpvote,
  User,
  Vote,
} from '@/types';

const credentials = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export const SHEET_ID =
  process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_SHEETS_ID
    : process.env.TEST_GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID;

function ensureSheetId() {
  if (!SHEET_ID) {
    throw new Error('Missing GOOGLE_SHEETS_ID/TEST_GOOGLE_SHEETS_ID');
  }
}

export async function readSheetRows(sheetName: string) {
  ensureSheetId();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A2:ZZ`,
  });
  return res.data.values ?? [];
}

export async function appendRow(
  sheetName: string,
  values: Array<string | number | boolean>,
) {
  ensureSheetId();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function updateRow(
  sheetName: string,
  rowNumber: number,
  values: Array<string | number | boolean>,
) {
  ensureSheetId();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

function toStr(value?: string) {
  return value ?? '';
}

function toNum(value?: string) {
  return Number(value || 0);
}

export function userToRowValues(user: {
  email: string;
  name: string;
  picture: string;
  tower: string;
  villamentNumber: string;
  role: string;
  status: string;
  addedBy: string;
  addedOn: string;
  approvedOn?: string;
  actionReason?: string;
}): string[] {
  return [
    user.email,
    user.name,
    user.picture,
    user.tower,
    user.villamentNumber,
    user.role,
    user.status,
    user.addedBy,
    user.addedOn,
    user.approvedOn ?? '',
    user.actionReason ?? '',
  ];
}

export async function readUsers(): Promise<User[]> {
  ensureSheetId();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Users!A:K',
  });

  const rows = res.data.values ?? [];
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((cell) => toStr(cell));
  const users: User[] = [];

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index] ?? [];
    if (rowIsEmpty(row)) {
      continue;
    }
    const sheetRowNumber = index + 1;
    const user = parseUserSheetRow(row, sheetRowNumber, headers);
    if (user) {
      users.push(user);
    }
  }

  return users;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await readUsers();
  return pickCanonicalUser(users, email);
}

function rowIsEmpty(row: string[]) {
  return row.every((cell) => !toStr(cell));
}

export { USER_SHEET_HEADERS };

export async function updateUserRow(user: User) {
  if (!user.rowNumber) {
    throw new Error('Missing row number for user update');
  }
  await updateRow(
    'Users',
    user.rowNumber,
    userToRowValues({
      email: user.email,
      name: user.name,
      picture: user.picture,
      tower: user.tower,
      villamentNumber: user.villamentNumber,
      role: user.role,
      status: user.status,
      addedBy: user.addedBy,
      addedOn: user.addedOn,
      approvedOn: user.approvedOn,
      actionReason: user.actionReason,
    }),
  );
}

export { hasCompleteResidence };

export async function readProjects(): Promise<Project[]> {
  const rows = await readSheetRows('Projects');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    name: toStr(r[0]),
    category: (toStr(r[1]) || 'Other') as Project['category'],
    status: (toStr(r[2]) || 'Planned') as Project['status'],
    description: toStr(r[3]),
    startDate: toStr(r[4]),
    expectedEndDate: toStr(r[5]),
    addedBy: toStr(r[6]),
    addedOn: toStr(r[7]),
  }));
}

export async function readProjectUpdates(): Promise<ProjectUpdate[]> {
  const rows = await readSheetRows('Project Updates');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    projectName: toStr(r[0]),
    updateDetails: toStr(r[1]),
    photoLink: toStr(r[2]),
    date: toStr(r[3]),
    postedBy: toStr(r[4]),
    postedOn: toStr(r[5]),
  }));
}

export async function readAnnouncements(): Promise<Announcement[]> {
  const rows = await readSheetRows('Announcements');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    title: toStr(r[0]),
    fullMessage: toStr(r[1]),
    type: (toStr(r[2]) || 'Notice') as Announcement['type'],
    pinOnHomepage: toStr(r[3]) === 'Yes' ? 'Yes' : 'No',
    showFromDate: toStr(r[4]),
    status: (toStr(r[5]) || 'Draft') as Announcement['status'],
    addedBy: toStr(r[6]),
    addedOn: toStr(r[7]),
  }));
}

export async function readPolls(): Promise<Poll[]> {
  const rows = await readSheetRows('Polls');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    question: toStr(r[0]),
    moreDetails: toStr(r[1]),
    pollType: (toStr(r[2]) || 'Single Choice') as Poll['pollType'],
    option1: toStr(r[3]),
    option2: toStr(r[4]),
    option3: toStr(r[5]),
    option4: toStr(r[6]),
    votingOpens: toStr(r[7]),
    votingCloses: toStr(r[8]),
    showResultsTo: (toStr(r[9]) || 'Everyone after closing') as Poll['showResultsTo'],
    status: (toStr(r[10]) || 'Draft') as Poll['status'],
    createdBy: toStr(r[11]),
    createdOn: toStr(r[12]),
  }));
}

export async function readVotes(): Promise<Vote[]> {
  ensureSheetId();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Votes!A:G',
  });

  const rows = res.data.values ?? [];
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((cell) => toStr(cell));
  const votes: Vote[] = [];

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index] ?? [];
    if (rowIsEmpty(row)) {
      continue;
    }
    const vote = parseVoteSheetRow(row, index + 1, headers);
    if (vote) {
      votes.push(vote);
    }
  }

  return votes;
}

export { VOTE_SHEET_HEADERS };

export async function readDocuments(): Promise<DocumentItem[]> {
  const rows = await readSheetRows('Documents');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    documentTitle: toStr(r[0]),
    category: (toStr(r[1]) || 'Other') as DocumentItem['category'],
    year: toStr(r[2]),
    shortDescription: toStr(r[3]),
    googleDriveLink: toStr(r[4]),
    visibleTo: (toStr(r[5]) || 'Everyone') as DocumentItem['visibleTo'],
    addedBy: toStr(r[6]),
    addedOn: toStr(r[7]),
  }));
}

export async function readSuggestions(): Promise<Suggestion[]> {
  const rows = await readSheetRows('Suggestions');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    title: toStr(r[0]),
    description: toStr(r[1]),
    category: toStr(r[2]),
    status: (toStr(r[3]) || 'Open') as Suggestion['status'],
    adminResponse: toStr(r[4]),
    upvoteCount: toNum(r[5]),
    submittedBy: toStr(r[6]),
    submittedOn: toStr(r[7]),
    submittedByEmail: toStr(r[8]),
  }));
}

export async function readSuggestionUpvotes(): Promise<SuggestionUpvote[]> {
  const rows = await readSheetRows('Suggestion Upvotes');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    suggestionId: toStr(r[0]),
    voterEmail: toStr(r[1]),
    voterFlatNumber: toStr(r[2]),
    withdrawn: toStr(r[3]) === 'TRUE' ? 'TRUE' : 'FALSE',
    timestamp: toStr(r[4]),
  }));
}

export async function readConfig(): Promise<ConfigSetting[]> {
  const rows = await readSheetRows('Config');
  return rows.map((r) => ({
    key: toStr(r[0]),
    value: toStr(r[1]),
  }));
}

export async function appendAuditLog(
  actorEmail: string,
  action: string,
  details: string,
) {
  const now = new Date().toISOString();
  await appendRow('Audit Log', [now, actorEmail, action, details]);
}

export async function readAuditLog(): Promise<AuditLog[]> {
  const rows = await readSheetRows('Audit Log');
  return rows.map((r, idx) => ({
    id: String(idx + 2),
    dateTime: toStr(r[0]),
    doneBy: toStr(r[1]),
    action: toStr(r[2]),
    details: toStr(r[3]),
  }));
}
