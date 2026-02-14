import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Board, Card, CardTag, ColumnStatus } from '@/types/kanban';
import { createCard, createInitialBoard } from '@/lib/utils';

interface BoardState {
  board: Board;
  isHydrated: boolean;

  // Card CRUD
  addCard: (title: string, columnStatus?: ColumnStatus, tag?: CardTag | null) => Card;
  updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) => void;
  deleteCard: (id: string) => void;

  // Card movement
  moveCard: (cardId: string, toColumn: ColumnStatus, toIndex: number) => void;
  reorderCard: (columnStatus: ColumnStatus, fromIndex: number, toIndex: number) => void;

  // Hydration
  setHydrated: (value: boolean) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      board: createInitialBoard(),
      isHydrated: false,

      addCard: (title, columnStatus = 'todo', tag = null) => {
        const { board } = get();
        const column = board.columns[columnStatus];
        const card = createCard(title, columnStatus, {
          tag,
          order: column.cardIds.length,
        });

        set({
          board: {
            ...board,
            cards: { ...board.cards, [card.id]: card },
            columns: {
              ...board.columns,
              [columnStatus]: {
                ...column,
                cardIds: [...column.cardIds, card.id],
              },
            },
          },
        });

        return card;
      },

      updateCard: (id, updates) => {
        const { board } = get();
        const card = board.cards[id];
        if (!card) return;

        const updatedCard = {
          ...card,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        // Handle column change via tag update (columnStatus change)
        if (updates.columnStatus && updates.columnStatus !== card.columnStatus) {
          const fromColumn = board.columns[card.columnStatus];
          const toColumn = board.columns[updates.columnStatus];

          set({
            board: {
              ...board,
              cards: { ...board.cards, [id]: updatedCard },
              columns: {
                ...board.columns,
                [card.columnStatus]: {
                  ...fromColumn,
                  cardIds: fromColumn.cardIds.filter((cid) => cid !== id),
                },
                [updates.columnStatus]: {
                  ...toColumn,
                  cardIds: [...toColumn.cardIds, id],
                },
              },
            },
          });
        } else {
          set({
            board: {
              ...board,
              cards: { ...board.cards, [id]: updatedCard },
            },
          });
        }
      },

      deleteCard: (id) => {
        const { board } = get();
        const card = board.cards[id];
        if (!card) return;

        const column = board.columns[card.columnStatus];
        const { [id]: _, ...remainingCards } = board.cards;

        set({
          board: {
            ...board,
            cards: remainingCards,
            columns: {
              ...board.columns,
              [card.columnStatus]: {
                ...column,
                cardIds: column.cardIds.filter((cid) => cid !== id),
              },
            },
          },
        });
      },

      moveCard: (cardId, toColumn, toIndex) => {
        const { board } = get();
        const card = board.cards[cardId];
        if (!card) return;

        const fromColumnStatus = card.columnStatus;
        const fromColumn = board.columns[fromColumnStatus];
        const targetColumn = board.columns[toColumn];

        // Remove from source column
        const newFromCardIds = fromColumn.cardIds.filter((cid) => cid !== cardId);

        // Insert into target column at position
        const newToCardIds =
          fromColumnStatus === toColumn ? newFromCardIds : [...targetColumn.cardIds];
        newToCardIds.splice(toIndex, 0, cardId);

        set({
          board: {
            ...board,
            cards: {
              ...board.cards,
              [cardId]: {
                ...card,
                columnStatus: toColumn,
                updatedAt: new Date().toISOString(),
              },
            },
            columns: {
              ...board.columns,
              [fromColumnStatus]: { ...fromColumn, cardIds: newFromCardIds },
              [toColumn]: { ...targetColumn, cardIds: newToCardIds },
            },
          },
        });
      },

      reorderCard: (columnStatus, fromIndex, toIndex) => {
        const { board } = get();
        const column = board.columns[columnStatus];
        const newCardIds = [...column.cardIds];
        const [removed] = newCardIds.splice(fromIndex, 1);
        newCardIds.splice(toIndex, 0, removed);

        set({
          board: {
            ...board,
            columns: {
              ...board.columns,
              [columnStatus]: { ...column, cardIds: newCardIds },
            },
          },
        });
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'cc-appunto:board',
      skipHydration: true,
      partialize: (state) => ({ board: state.board }),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHydrated(true);
        };
      },
    }
  )
);
