import type { Vote } from '@/types';

import { formatResidenceFlatNumber } from './residence-options';

export const VOTE_SHEET_HEADERS = [
  'Poll Question',
  'Tower',
  'Villament Number',
  'Flat Number',
  'Voter Email',
  'Vote Chosen',
  'Date & Time',
] as const;

function toStr(value?: string) {
  return (value ?? '').trim();
}

function headerIndex(headers: string[], name: string, legacyName?: string) {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  let index = normalized.indexOf(name.toLowerCase());
  if (index >= 0) return index;
  if (legacyName) {
    index = normalized.indexOf(legacyName.toLowerCase());
    if (index >= 0) return index;
  }
  return -1;
}

function cell(row: string[], headers: string[], name: string, legacyName?: string) {
  const index = headerIndex(headers, name, legacyName);
  return index >= 0 ? toStr(row[index]) : '';
}

export function parseFlatToResidence(flatNumber: string) {
  const flat = flatNumber.trim();
  if (!flat) {
    return { tower: '', villamentNumber: '' };
  }
  const dash = flat.indexOf('-');
  if (dash > 0) {
    return {
      tower: flat.slice(0, dash),
      villamentNumber: flat.slice(dash + 1),
    };
  }
  return { tower: '', villamentNumber: flat };
}

export function residenceVoteKey(input: {
  tower?: string;
  villamentNumber?: string;
  flatNumber?: string;
}) {
  const tower = toStr(input.tower);
  const villamentNumber = toStr(input.villamentNumber);
  if (tower && villamentNumber) {
    return `${tower}|${villamentNumber}`.toLowerCase();
  }
  const flat = toStr(input.flatNumber);
  if (flat) {
    const parsed = parseFlatToResidence(flat);
    if (parsed.tower && parsed.villamentNumber) {
      return `${parsed.tower}|${parsed.villamentNumber}`.toLowerCase();
    }
    return `flat:${flat.toLowerCase()}`;
  }
  return '';
}

export function parseVoteSheetRow(
  row: string[],
  rowNumber: number,
  headers: string[],
): Vote | null {
  const pollQuestion = cell(row, headers, 'Poll Question');
  if (!pollQuestion) {
    return null;
  }

  const hasTowerColumn = headerIndex(headers, 'Tower') >= 0;

  if (!hasTowerColumn) {
    const flatNumber = cell(row, headers, 'Flat Number');
    const parsed = parseFlatToResidence(flatNumber);
    return {
      id: String(rowNumber),
      pollQuestion,
      tower: parsed.tower,
      villamentNumber: parsed.villamentNumber,
      flatNumber,
      voterEmail: cell(row, headers, 'Voter Email'),
      voteChosen: cell(row, headers, 'Vote Chosen'),
      dateTime: cell(row, headers, 'Date & Time'),
    };
  }

  const tower = cell(row, headers, 'Tower');
  const villamentNumber = cell(row, headers, 'Villament Number');
  const flatNumber =
    cell(row, headers, 'Flat Number') ||
    formatResidenceFlatNumber(tower, villamentNumber) ||
    villamentNumber;

  return {
    id: String(rowNumber),
    pollQuestion,
    tower,
    villamentNumber,
    flatNumber,
    voterEmail: cell(row, headers, 'Voter Email'),
    voteChosen: cell(row, headers, 'Vote Chosen'),
    dateTime: cell(row, headers, 'Date & Time'),
  };
}

export function villamentAlreadyVotedOnPoll(
  votes: Vote[],
  pollQuestion: string,
  residenceKey: string,
) {
  if (!residenceKey) {
    return false;
  }
  return votes
    .filter((vote) => vote.pollQuestion === pollQuestion)
    .some((vote) => residenceVoteKey(vote) === residenceKey);
}

export function emailAlreadyVotedOnPoll(
  votes: Vote[],
  pollQuestion: string,
  email: string,
) {
  const normalized = email.toLowerCase();
  return votes
    .filter((vote) => vote.pollQuestion === pollQuestion)
    .some((vote) => vote.voterEmail.toLowerCase() === normalized);
}
