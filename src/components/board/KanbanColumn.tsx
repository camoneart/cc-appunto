'use client';

import { useSortable } from '@dnd-kit/react/sortable';
import type { Card, ColumnStatus } from '@/types/kanban';
import { COLUMN_CONFIG } from '@/types/kanban';
import { COLUMN_COLORS } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/components/ui/Button';

interface KanbanColumnProps {
  status: ColumnStatus;
  cards: Card[];
  index: number;
  onCardClick?: (card: Card) => void;
  onAddCard?: (status: ColumnStatus) => void;
}

export function KanbanColumn({ status, cards, index, onCardClick, onAddCard }: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];
  const borderColor = COLUMN_COLORS[status];

  const { ref } = useSortable({
    id: status,
    index,
    type: 'column',
    accept: ['item', 'column'],
  });

  return (
    <div
      ref={ref}
      className={`flex flex-col rounded-xl bg-background border border-border border-t-2 ${borderColor} min-h-[200px]`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">{config.title}</h2>
          <span className="text-xs text-zinc-500 bg-surface rounded-full px-2 py-0.5">
            {cards.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddCard?.(status)}
          className="text-zinc-500 hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Button>
      </div>

      {/* Card List */}
      <div className="flex flex-col gap-2 px-3 pb-3 flex-1">
        {cards.map((card, index) => (
          <KanbanCard
            key={card.id}
            card={card}
            index={index}
            column={status}
            onClick={onCardClick}
          />
        ))}

        {cards.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-zinc-600">
            No cards yet
          </div>
        )}
      </div>
    </div>
  );
}
