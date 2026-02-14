'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useBoardStore } from '@/stores/boardStore';
import { callClaude } from '@/lib/claude/client';
import { COLUMN_ORDER, COLUMN_CONFIG } from '@/types/kanban';

export function ClaudePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const board = useBoardStore((s) => s.board);
  const addCard = useBoardStore((s) => s.addCard);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Build board summary for Claude
    const boardSummary = COLUMN_ORDER.map((status) => {
      const column = board.columns[status];
      const cards = column.cardIds.map((id) => board.cards[id]).filter(Boolean);
      const cardList = cards.map((c) => `  - ${c.title}${c.tag ? ` [${c.tag}]` : ''}`).join('\n');
      return `${COLUMN_CONFIG[status].title} (${cards.length}):\n${cardList || '  (empty)'}`;
    }).join('\n\n');

    const response = await callClaude('summarize-board', boardSummary);
    setIsLoading(false);

    if (response.success) {
      setResult(response.content);
    } else {
      setError(response.error || 'Failed to summarize');
    }
  };

  const handleSuggestTasks = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const allCards = Object.values(board.cards);
    const taskList = allCards
      .map((c) => `- ${c.title} (${c.columnStatus})${c.tag ? ` [${c.tag}]` : ''}`)
      .join('\n');

    const response = await callClaude('suggest-tasks', taskList || '(No tasks yet)');
    setIsLoading(false);

    if (response.success) {
      setResult(response.content);
    } else {
      setError(response.error || 'Failed to suggest tasks');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-3 shadow-lg transition-colors z-40"
        title="Claude AI"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
          <path d="M10 21h4" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 rounded-xl border border-border bg-surface shadow-2xl z-40">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm font-semibold">Claude AI</span>
          <span className="text-[10px] text-zinc-500 bg-purple-500/10 text-purple-400 rounded px-1.5 py-0.5">
            CLI
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-500 hover:text-foreground transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Actions */}
      <div className="p-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSummarize}
          disabled={isLoading}
          className="w-full justify-start"
        >
          <svg className="mr-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Summarize Board
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleSuggestTasks}
          disabled={isLoading}
          className="w-full justify-start"
        >
          <svg className="mr-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Suggest Tasks
        </Button>
      </div>

      {/* Result/Error */}
      {(isLoading || result || error) && (
        <div className="px-4 pb-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="h-3 w-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
              Thinking...
            </div>
          )}
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3">
              {error}
            </div>
          )}
          {result && (
            <div className="text-xs text-foreground bg-background rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
