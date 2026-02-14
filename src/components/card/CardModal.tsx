'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TagBadge } from './TagBadge';
import { useBoardStore } from '@/stores/boardStore';
import { callClaude } from '@/lib/claude/client';
import type { Card, CardTag, ColumnStatus } from '@/types/kanban';
import { COLUMN_CONFIG, COLUMN_ORDER } from '@/types/kanban';

const ALL_TAGS: CardTag[] = ['memo', 'idea', 'bug', 'new-feature'];

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  defaultColumn?: ColumnStatus;
}

export function CardModal({ isOpen, onClose, card, defaultColumn = 'todo' }: CardModalProps) {
  const addCard = useBoardStore((s) => s.addCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState<CardTag | null>(null);
  const [columnStatus, setColumnStatus] = useState<ColumnStatus>(defaultColumn);
  const [isGenerating, setIsGenerating] = useState(false);

  const isEditing = card !== null;

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setTag(card.tag);
      setColumnStatus(card.columnStatus);
    } else {
      setTitle('');
      setDescription('');
      setTag(null);
      setColumnStatus(defaultColumn);
    }
  }, [card, defaultColumn, isOpen]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (isEditing) {
      updateCard(card.id, { title, description, tag, columnStatus });
    } else {
      addCard(title, columnStatus, tag);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!card) return;
    deleteCard(card.id);
    onClose();
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);

    const response = await callClaude('generate-description', title);
    if (response.success) {
      setDescription(response.content);
    }

    setIsGenerating(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Card' : 'New Card'}
    >
      <div className="flex flex-col gap-4">
        <Input
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter card title..."
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="description" className="text-sm font-medium text-zinc-400">
              Description
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={!title.trim() || isGenerating}
              className="text-[10px] text-purple-400 hover:text-purple-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="h-2.5 w-2.5 rounded-full border border-purple-400 border-t-transparent animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                  </svg>
                  AI Generate
                </>
              )}
            </button>
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        {/* Tag Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-400">Tag</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTag(null)}
              className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                tag === null
                  ? 'border-zinc-500 text-foreground bg-surface'
                  : 'border-border text-zinc-500 hover:border-zinc-600'
              }`}
            >
              None
            </button>
            {ALL_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`transition-opacity ${tag === t ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
              >
                <TagBadge tag={t} size="md" />
              </button>
            ))}
          </div>
        </div>

        {/* Column Selection (edit mode only) */}
        {isEditing && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Status</label>
            <div className="flex gap-2">
              {COLUMN_ORDER.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setColumnStatus(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                    columnStatus === status
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                      : 'border-border text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {COLUMN_CONFIG[status].title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {isEditing ? (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim()}
            >
              {isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
