import { create } from 'zustand';
import type { CardTag } from '@/types/kanban';

interface SearchState {
  query: string;
  selectedTags: CardTag[];
  setQuery: (query: string) => void;
  toggleTag: (tag: CardTag) => void;
  clearFilters: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: '',
  selectedTags: [],

  setQuery: (query) => set({ query }),

  toggleTag: (tag) => {
    const { selectedTags } = get();
    if (selectedTags.includes(tag)) {
      set({ selectedTags: selectedTags.filter((t) => t !== tag) });
    } else {
      set({ selectedTags: [...selectedTags, tag] });
    }
  },

  clearFilters: () => set({ query: '', selectedTags: [] }),
}));
