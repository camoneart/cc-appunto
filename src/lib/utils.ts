import { nanoid } from 'nanoid';
import type { CardTag, ColumnStatus, Card, Board, Column } from '@/types/kanban';

// Generate unique ID for cards
export function generateId(): string {
  return nanoid();
}

// Tag color mapping for Tailwind classes
export const TAG_COLORS: Record<CardTag, { bg: string; text: string; border: string }> = {
  memo: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  idea: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  bug: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  'new-feature': {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
};

// Column header colors
export const COLUMN_COLORS: Record<ColumnStatus, string> = {
  todo: 'border-t-slate-500',
  'in-progress': 'border-t-blue-500',
  done: 'border-t-green-500',
};

// Create a new card with defaults
export function createCard(
  title: string,
  columnStatus: ColumnStatus = 'todo',
  overrides?: Partial<Card>
): Card {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    description: '',
    tag: null,
    columnStatus,
    order: 0,
    createdAt: now,
    updatedAt: now,
    aiGenerated: false,
    ...overrides,
  };
}

// Create the initial empty board
export function createInitialBoard(): Board {
  const columns: Record<ColumnStatus, Column> = {
    todo: { id: 'todo', title: 'TODO', cardIds: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', cardIds: [] },
    done: { id: 'done', title: 'Done', cardIds: [] },
  };
  return { columns, cards: {} };
}
