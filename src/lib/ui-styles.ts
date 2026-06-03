export const announcementTypeStyles: Record<string, string> = {
  Alert: 'bg-destructive/10 text-destructive border-destructive/20',
  Notice: 'bg-accent/10 text-accent-foreground border-accent/20',
  News: 'bg-primary/10 text-primary border-primary/20',
  'Meeting Minutes': 'bg-muted text-muted-foreground border-border',
  'Event Alert': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  Event: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
};

export const suggestionStatusStyles: Record<string, string> = {
  Open: 'bg-primary/10 text-primary border-primary/20',
  'Under Review': 'bg-accent/10 text-accent-foreground border-accent/20',
  Implemented: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  Declined: 'bg-muted text-muted-foreground border-border',
};

export const projectStatusStyles: Record<string, string> = {
  'In Progress': 'bg-primary/10 text-primary border-primary/20',
  Completed: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  Planned: 'bg-accent/10 text-accent-foreground border-accent/20',
  'On Hold': 'bg-muted text-muted-foreground border-border',
  Archived: 'bg-muted text-muted-foreground border-border',
};
