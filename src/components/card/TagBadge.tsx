'use client';

import type { CardTag } from '@/types/kanban';
import { TAG_CONFIG } from '@/types/kanban';
import { TAG_COLORS } from '@/lib/utils';

interface TagBadgeProps {
  tag: CardTag;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, size = 'sm' }: TagBadgeProps) {
  const config = TAG_CONFIG[tag];
  const colors = TAG_COLORS[tag];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {config.label}
    </span>
  );
}
