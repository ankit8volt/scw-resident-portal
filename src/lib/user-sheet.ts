import type { User, UserRole, UserStatus } from '@/types';

import { formatResidenceFlatNumber } from './residence-options';

export const USER_SHEET_HEADERS = [
  'Email',
  'Name',
  'Picture',
  'Tower',
  'Villament Number',
  'Role',
  'Status',
  'Added By',
  'Added On',
  'Approved On',
  'Action Reason',
] as const;

const VALID_ROLES = new Set<UserRole>(['Resident', 'Committee', 'SuperAdmin']);
const VALID_STATUSES = new Set<UserStatus>([
  'Pending',
  'Approved',
  'Rejected',
  'Suspended',
]);

function toStr(value?: string) {
  return (value ?? '').trim();
}

function rowIsEmpty(row: string[]) {
  return row.every((cell) => !toStr(cell));
}

function headerIndex(headers: string[], name: string, legacyName?: string) {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  let index = normalized.indexOf(name.toLowerCase());
  if (index >= 0) {
    return index;
  }
  if (legacyName) {
    index = normalized.indexOf(legacyName.toLowerCase());
    if (index >= 0) {
      return index;
    }
  }
  return -1;
}

function cell(row: string[], headers: string[], name: string, legacyName?: string) {
  const index = headerIndex(headers, name, legacyName);
  return index >= 0 ? toStr(row[index]) : '';
}

function parseRole(value: string): UserRole {
  return VALID_ROLES.has(value as UserRole) ? (value as UserRole) : 'Resident';
}

function parseStatus(value: string): UserStatus {
  return VALID_STATUSES.has(value as UserStatus) ? (value as UserStatus) : 'Pending';
}

export function parseUserSheetRow(
  row: string[],
  rowNumber: number,
  headers: string[],
): User | null {
  const email = cell(row, headers, 'Email');
  if (!email) {
    return null;
  }

  const hasTowerColumn = headerIndex(headers, 'Tower') >= 0;

  if (!hasTowerColumn) {
    const legacyFlat = cell(row, headers, 'Flat Number');
    return {
      email,
      name: cell(row, headers, 'Name'),
      picture: cell(row, headers, 'Picture'),
      tower: '',
      villamentNumber: legacyFlat,
      flatNumber: legacyFlat,
      role: parseRole(cell(row, headers, 'Role')),
      status: parseStatus(cell(row, headers, 'Status')),
      addedBy: cell(row, headers, 'Added By'),
      addedOn: cell(row, headers, 'Added On'),
      approvedOn: cell(row, headers, 'Approved On'),
      actionReason: cell(row, headers, 'Action Reason'),
      rowNumber,
    };
  }

  const tower = cell(row, headers, 'Tower');
  const villamentNumber = cell(row, headers, 'Villament Number');
  const flatNumber =
    formatResidenceFlatNumber(tower, villamentNumber) || villamentNumber;

  return {
    email,
    name: cell(row, headers, 'Name'),
    picture: cell(row, headers, 'Picture'),
    tower,
    villamentNumber,
    flatNumber,
    role: parseRole(cell(row, headers, 'Role')),
    status: parseStatus(cell(row, headers, 'Status')),
    addedBy: cell(row, headers, 'Added By'),
    addedOn: cell(row, headers, 'Added On'),
    approvedOn: cell(row, headers, 'Approved On'),
    actionReason: cell(row, headers, 'Action Reason'),
    rowNumber,
  };
}

export function pickCanonicalUser(users: User[], email: string): User | undefined {
  const matches = users.filter(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
  if (matches.length === 0) {
    return undefined;
  }
  if (matches.length === 1) {
    return matches[0];
  }

  return (
    matches.find((user) => user.role === 'SuperAdmin' && user.status === 'Approved') ??
    matches.find((user) => user.status === 'Approved') ??
    matches[matches.length - 1]
  );
}
