'use client';

import { useMemo } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import { useBoardStore } from '@/stores/boardStore';
import { useSearchStore } from '@/stores/searchStore';
import { COLUMN_ORDER } from '@/types/kanban';
import type { Card, ColumnStatus } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  onCardClick?: (card: Card) => void;
  onAddCard?: (status: ColumnStatus) => void;
}

export function KanbanBoard({ onCardClick, onAddCard }: KanbanBoardProps) {
  const board = useBoardStore((state) => state.board);
  const isHydrated = useBoardStore((state) => state.isHydrated);
  const moveCard = useBoardStore((s) => s.moveCard);

  const query = useSearchStore((s) => s.query);
  const selectedTags = useSearchStore((s) => s.selectedTags);

  // Build column-to-cardIds mapping for @dnd-kit/helpers move()
  const items = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const status of COLUMN_ORDER) {
      result[status] = board.columns[status].cardIds;
    }
    return result;
  }, [board.columns]);

  // Filter cards by search query and selected tags
  const filterCards = (cards: Card[]): Card[] => {
    let filtered = cards;

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.title.toLowerCase().includes(lowerQuery) ||
          card.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((card) => card.tag && selectedTags.includes(card.tag));
    }

    return filtered;
  };

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_ORDER.map((status) => (
          <div
            key={status}
            className="rounded-xl bg-background border border-border border-t-2 border-t-zinc-700 min-h-[200px] animate-pulse"
          >
            <div className="px-4 py-3">
              <div className="h-4 w-20 bg-surface rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const { source } = event.operation;
        if (source?.type === 'column') return;

        const newItems = move(items, event);

        const sourceId = source?.id as string;
        if (!sourceId) return;

        for (const status of COLUMN_ORDER) {
          const idx = newItems[status]?.indexOf(sourceId);
          if (idx !== undefined && idx >= 0) {
            moveCard(sourceId, status as ColumnStatus, idx);
            break;
          }
        }
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_ORDER.map((status, colIndex) => {
          const column = board.columns[status];
          const allCards = column.cardIds
            .map((id) => board.cards[id])
            .filter(Boolean);
          const cards = filterCards(allCards);

          return (
            <KanbanColumn
              key={status}
              status={status}
              cards={cards}
              index={colIndex}
              onCardClick={onCardClick}
              onAddCard={onAddCard}
            />
          );
        })}
      </div>
    </DragDropProvider>
  );
}
