// Claude integration mode
export type ClaudeMode = 'cli' | 'api';

// AI feature types available on the board
export type AIFeature = 'generate-description' | 'suggest-tasks' | 'summarize-board';

export interface ClaudeSettings {
  mode: ClaudeMode;
  apiKey: string | null; // Only needed for 'api' mode
}

export interface ClaudeRequest {
  feature: AIFeature;
  payload: string; // Context passed to Claude
}

export interface ClaudeResponse {
  success: boolean;
  content: string;
  error?: string;
}

export interface ClaudeState {
  settings: ClaudeSettings;
  isLoading: boolean;
  lastError: string | null;
}
