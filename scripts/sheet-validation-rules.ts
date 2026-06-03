/**
 * Dropdown options for Google Sheets data validation.
 * Keep in sync with src/types/index.ts and src/lib/residence-options.ts
 */
import {
  TOWER_OPTIONS,
  VILLAMENT_NUMBER_OPTIONS,
} from '../src/lib/residence-options';
export type ColumnValidation = {
  /** 0-based column index (A = 0) */
  columnIndex: number;
  header: string;
  options: string[];
};

export type SheetValidationSpec = {
  sheetName: string;
  columns: ColumnValidation[];
  /**
   * Clear existing validations in this column range before applying rules.
   * Use when sheet columns were reorganized and stale rules may remain.
   * Indices are 0-based; endColumnIndex is exclusive.
   */
  clearValidationRange?: {
    startColumnIndex: number;
    endColumnIndex: number;
  };
};

export const USERS_SHEET_HEADERS = [
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

export const sheetValidationSpecs: SheetValidationSpec[] = [
  {
    sheetName: 'Users',
    clearValidationRange: { startColumnIndex: 3, endColumnIndex: 11 },
    columns: [
      {
        columnIndex: 3,
        header: 'Tower',
        options: [...TOWER_OPTIONS],
      },
      {
        columnIndex: 4,
        header: 'Villament Number',
        options: [...VILLAMENT_NUMBER_OPTIONS],
      },
      {
        columnIndex: 5,
        header: 'Role',
        options: ['Resident', 'Committee', 'SuperAdmin'],
      },
      {
        columnIndex: 6,
        header: 'Status',
        options: ['Pending', 'Approved', 'Rejected', 'Suspended'],
      },
    ],
  },
  {
    sheetName: 'Projects',
    columns: [
      {
        columnIndex: 1,
        header: 'Category',
        options: ['Infrastructure', 'Amenities', 'Maintenance', 'Events', 'Other'],
      },
      {
        columnIndex: 2,
        header: 'Status',
        options: ['Planned', 'In Progress', 'On Hold', 'Completed', 'Archived'],
      },
    ],
  },
  {
    sheetName: 'Announcements',
    columns: [
      {
        columnIndex: 2,
        header: 'Type',
        options: ['Notice', 'News', 'Alert', 'Meeting Minutes', 'Event Alert'],
      },
      {
        columnIndex: 3,
        header: 'Pin on Homepage?',
        options: ['Yes', 'No'],
      },
      {
        columnIndex: 5,
        header: 'Status',
        options: ['Published', 'Draft', 'Archived'],
      },
    ],
  },
  {
    sheetName: 'Polls',
    columns: [
      {
        columnIndex: 2,
        header: 'Poll Type',
        options: ['Single Choice', 'Multiple Choice', 'Yes or No'],
      },
      {
        columnIndex: 9,
        header: 'Show Results To',
        options: [
          'Everyone after voting',
          'Everyone after closing',
          'Admins only',
        ],
      },
      {
        columnIndex: 10,
        header: 'Status',
        options: ['Draft', 'Open', 'Closed'],
      },
    ],
  },
  {
    sheetName: 'Documents',
    columns: [
      {
        columnIndex: 1,
        header: 'Category',
        options: [
          'Meeting Minutes',
          'Financial Report',
          'Rules & Bylaws',
          'Vendor Contract',
          'Notice',
          'Other',
        ],
      },
      {
        columnIndex: 5,
        header: 'Visible To',
        options: ['Everyone', 'Admins Only'],
      },
    ],
  },
  {
    sheetName: 'Suggestions',
    columns: [
      {
        columnIndex: 2,
        header: 'Category',
        options: [
          'Amenities',
          'Safety & Security',
          'Events & Community',
          'Rules & Policies',
          'Green & Environment',
          'Other',
        ],
      },
      {
        columnIndex: 3,
        header: 'Status',
        options: ['Open', 'Under Review', 'Implemented', 'Declined', 'Removed'],
      },
    ],
  },
  {
    sheetName: 'Suggestion Upvotes',
    columns: [
      {
        columnIndex: 3,
        header: 'Withdrawn',
        options: ['TRUE', 'FALSE'],
      },
    ],
  },
];

/** First data row (1-based row 2); validations apply through this many rows. */
export const VALIDATION_FIRST_DATA_ROW = 2;
export const VALIDATION_LAST_DATA_ROW = 5000;
