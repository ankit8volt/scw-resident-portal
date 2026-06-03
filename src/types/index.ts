export type UserRole = 'Resident' | 'Committee' | 'SuperAdmin';
export type UserStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';

export interface User {
  email: string;
  name: string;
  picture: string;
  tower: string;
  villamentNumber: string;
  /** Derived display id, e.g. "8-203" */
  flatNumber: string;
  role: UserRole;
  status: UserStatus;
  addedBy: string;
  addedOn: string;
  approvedOn?: string;
  actionReason?: string;
  rowNumber?: number;
}

export type ProjectCategory =
  | 'Infrastructure'
  | 'Amenities'
  | 'Maintenance'
  | 'Events'
  | 'Other';
export type ProjectStatus =
  | 'Planned'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Archived';

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  description: string;
  startDate: string;
  expectedEndDate: string;
  addedBy: string;
  addedOn: string;
}

export interface ProjectUpdate {
  id: string;
  projectName: string;
  updateDetails: string;
  photoLink: string;
  date: string;
  postedBy: string;
  postedOn: string;
}

export type AnnouncementType =
  | 'Notice'
  | 'News'
  | 'Alert'
  | 'Meeting Minutes'
  | 'Event Alert';
export type AnnouncementStatus = 'Published' | 'Draft' | 'Archived';

export interface Announcement {
  id: string;
  title: string;
  fullMessage: string;
  type: AnnouncementType;
  pinOnHomepage: 'Yes' | 'No';
  showFromDate: string;
  status: AnnouncementStatus;
  addedBy: string;
  addedOn: string;
}

export type PollType = 'Single Choice' | 'Multiple Choice' | 'Yes or No';
export type PollStatus = 'Draft' | 'Open' | 'Closed';
export type PollResultVisibility =
  | 'Everyone after voting'
  | 'Everyone after closing'
  | 'Admins only';

export interface Poll {
  id: string;
  question: string;
  moreDetails: string;
  pollType: PollType;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  votingOpens: string;
  votingCloses: string;
  showResultsTo: PollResultVisibility;
  status: PollStatus;
  createdBy: string;
  createdOn: string;
}

export interface Vote {
  id: string;
  pollQuestion: string;
  flatNumber: string;
  voterEmail: string;
  voteChosen: string;
  dateTime: string;
}

export type DocumentCategory =
  | 'Meeting Minutes'
  | 'Financial Report'
  | 'Rules & Bylaws'
  | 'Vendor Contract'
  | 'Notice'
  | 'Other';
export type DocumentVisibility = 'Everyone' | 'Admins Only';

export interface DocumentItem {
  id: string;
  documentTitle: string;
  category: DocumentCategory;
  year: string;
  shortDescription: string;
  googleDriveLink: string;
  visibleTo: DocumentVisibility;
  addedBy: string;
  addedOn: string;
}

export type SuggestionStatus =
  | 'Open'
  | 'Under Review'
  | 'Implemented'
  | 'Declined'
  | 'Removed';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  status: SuggestionStatus;
  adminResponse: string;
  upvoteCount: number;
  submittedBy: string;
  submittedOn: string;
  submittedByEmail: string;
}

export interface SuggestionUpvote {
  id: string;
  suggestionId: string;
  voterEmail: string;
  voterFlatNumber: string;
  withdrawn: 'TRUE' | 'FALSE';
  timestamp: string;
}

export interface ConfigSetting {
  key: string;
  value: string;
}

export interface AuditLog {
  id: string;
  dateTime: string;
  doneBy: string;
  action: string;
  details: string;
}
