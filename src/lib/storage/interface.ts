import type { Board } from '@/types/kanban';
import type { ClaudeSettings } from '@/types/claude';

// Storage abstraction layer
// Swap localStorage implementation with any backend (Supabase, Firebase, etc.)
export interface StorageAdapter {
  loadBoard(): Board | null;
  saveBoard(board: Board): void;
  loadClaudeSettings(): ClaudeSettings | null;
  saveClaudeSettings(settings: ClaudeSettings): void;
  clear(): void;
}
