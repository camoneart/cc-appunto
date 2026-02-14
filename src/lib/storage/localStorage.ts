import type { Board } from '@/types/kanban';
import type { ClaudeSettings } from '@/types/claude';
import type { StorageAdapter } from './interface';

const STORAGE_KEYS = {
  board: 'cc-appunto:board',
  claudeSettings: 'cc-appunto:claude-settings',
} as const;

export const localStorageAdapter: StorageAdapter = {
  loadBoard(): Board | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.board);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveBoard(board: Board): void {
    try {
      localStorage.setItem(STORAGE_KEYS.board, JSON.stringify(board));
    } catch {
      console.error('Failed to save board to localStorage');
    }
  },

  loadClaudeSettings(): ClaudeSettings | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.claudeSettings);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveClaudeSettings(settings: ClaudeSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.claudeSettings, JSON.stringify(settings));
    } catch {
      console.error('Failed to save Claude settings to localStorage');
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.board);
      localStorage.removeItem(STORAGE_KEYS.claudeSettings);
    } catch {
      console.error('Failed to clear localStorage');
    }
  },
};
