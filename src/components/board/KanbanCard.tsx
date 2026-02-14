'use client';

import { useSortable } from '@dnd-kit/react/sortable';
import type { Card, ColumnStatus } from '@/types/kanban';
import { TagBadge } from '@/components/card/TagBadge';

interface KanbanCardProps {
  card: Card;
  index: number;
  column: ColumnStatus;
  onClick?: (card: Card) => void;
}

export function KanbanCard({ card, index, column, onClick }: KanbanCardProps) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    type: 'item',
    accept: 'item',
    group: column,
  });

  return (
    <div
      ref={ref}
      className={`group rounded-lg border border-border bg-surface p-3 cursor-grab active:cursor-grabbing hover:bg-surface-hover hover:border-zinc-600 transition-colors ${
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-500/30' : ''
      }`}
      onClick={() => {
        if (!isDragging) onClick?.(card);
      }}
      data-dragging={isDragging || undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground leading-snug flex-1">
          {card.title}
        </h3>
        {card.aiGenerated && (
          <span className="shrink-0 text-[10px] text-purple-400 bg-purple-500/10 rounded px-1.5 py-0.5">
            AI
          </span>
        )}
      </div>

      {card.description && (
        <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2">
          {card.description}
        </p>
      )}

      {card.tag && (
        <div className="mt-2">
          <TagBadge tag={card.tag} />
        </div>
      )}
    </div>
  );
}
