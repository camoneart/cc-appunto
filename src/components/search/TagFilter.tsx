'use client';

import { useSearchStore } from '@/stores/searchStore';
import { TagBadge } from '@/components/card/TagBadge';
import type { CardTag } from '@/types/kanban';

const ALL_TAGS: CardTag[] = ['memo', 'idea', 'bug', 'new-feature'];

export function TagFilter() {
  const selectedTags = useSearchStore((s) => s.selectedTags);
  const toggleTag = useSearchStore((s) => s.toggleTag);
  const clearFilters = useSearchStore((s) => s.clearFilters);

  const hasFilters = selectedTags.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ALL_TAGS.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            <TagBadge tag={tag} size="md" />
          </button>
        );
      })}

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-zinc-500 hover:text-foreground transition-colors ml-1"
        >
          Clear
        </button>
      )}
    </div>
  );
}
