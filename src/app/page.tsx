'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CardModal } from '@/components/card/CardModal';
import { SearchBar } from '@/components/search/SearchBar';
import { TagFilter } from '@/components/search/TagFilter';
import { ClaudePanel } from '@/components/claude/ClaudePanel';
import { ToastContainer } from '@/components/ui/Toast';
import type { Card, ColumnStatus } from '@/types/kanban';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [addToColumn, setAddToColumn] = useState<ColumnStatus>('todo');

  const handleAddCard = (status: ColumnStatus) => {
    setEditingCard(null);
    setAddToColumn(status);
    setIsModalOpen(true);
  };

  const handleCardClick = (card: Card) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                CC Appunto
              </h1>
              <span className="text-[10px] text-zinc-500 bg-surface rounded-full px-2 py-0.5 font-medium">
                KANBAN
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchBar />
          </div>
          <TagFilter />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <KanbanBoard
          onCardClick={handleCardClick}
          onAddCard={handleAddCard}
        />
      </main>

      {/* Card Modal */}
      <CardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        card={editingCard}
        defaultColumn={addToColumn}
      />

      {/* Claude AI Panel */}
      <ClaudePanel />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
