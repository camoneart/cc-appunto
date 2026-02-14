// Card tags with associated display colors
export type CardTag = 'memo' | 'idea' | 'bug' | 'new-feature';

// Column statuses matching the 3-column KANBAN layout
export type ColumnStatus = 'todo' | 'in-progress' | 'done';

export interface Card {
  id: string;
  title: string;
  description: string;
  tag: CardTag | null;
  columnStatus: ColumnStatus;
  order: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  aiGenerated: boolean;
}

export interface Column {
  id: ColumnStatus;
  title: string;
  cardIds: string[];
}

export interface Board {
  columns: Record<ColumnStatus, Column>;
  cards: Record<string, Card>;
}

// Tag display configuration
export const TAG_CONFIG: Record<CardTag, { label: string; color: string }> = {
  memo: { label: 'Memo', color: 'blue' },
  idea: { label: 'Idea', color: 'yellow' },
  bug: { label: 'Bug', color: 'red' },
  'new-feature': { label: 'New Feature', color: 'green' },
} as const;

// Column display configuration
export const COLUMN_CONFIG: Record<ColumnStatus, { title: string }> = {
  todo: { title: 'TODO' },
  'in-progress': { title: 'In Progress' },
  done: { title: 'Done' },
} as const;

// All column statuses in display order
export const COLUMN_ORDER: ColumnStatus[] = ['todo', 'in-progress', 'done'];
