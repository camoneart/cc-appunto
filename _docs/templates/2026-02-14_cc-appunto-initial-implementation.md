機能名: CC Appunto 初期実装（Phase 0〜8）

- セッション名: cc-appunto-kanban-implementation
- 日付: 2026-02-14 19:29:24
- 概要: CC Appunto（KANBAN型メモ管理アプリ）のプロトタイプを Phase 0〜Phase 8 まで一貫して実装。Next.js 16.1.6 + TypeScript + Tailwind CSS v4 + zustand + @dnd-kit/react の技術スタックで、ダークモードのKANBANボードUI、カードCRUD、ドラッグ&ドロップ、検索フィルター、Claude AI統合（CLI経由）を構築。

- 実装内容:
  - Phase 0: Next.js 16.1.6 アプリ作成、既存ファイル移行、コア依存パッケージインストール
  - Phase 1: 型定義（kanban.ts, claude.ts）、.gitignore調整
  - Phase 2: ストレージ抽象化層（interface + localStorage）、zustand v5 persist ストア（boardStore, searchStore）、SSR hydration対応（skipHydration + StoreProvider）
  - Phase 3: ダークモードCSS（Tailwind v4 @custom-variant）、共通UI（Button, Modal, Input）、KanbanBoard/Column/Card階層、TagBadge
  - Phase 4: CardModal（作成/編集/削除）、タグ選択UI、カラム変更UI
  - Phase 5: @dnd-kit/react（DragDropProvider + useSortable + move helper）、カラム間ドラッグ&ドロップ、ビジュアルフィードバック
  - Phase 6: SearchBar（テキスト検索）、TagFilter（タグ絞り込み）
  - Phase 7: Claude API Route（child_process.execFile で claude -p 呼び出し）、ClaudePanel（Summarize Board, Suggest Tasks）、CardModal AI説明文生成
  - Phase 8: Toast通知システム（zustand管理、自動消去）

- 設計意図:
  - ストレージ抽象化: Strategy PatternでlocalStorage実装を将来のバックエンドに差し替え可能にした
  - zustand skipHydration: Next.js App RouterのSSRとlocalStorage永続化の整合性確保。サーバーサイドではlocalStorageが存在しないため、クライアントマウント後にrehydrateする
  - @dnd-kit/react: 新世代APIのDragDropProvider + useSortable + move helperパターン採用。旧DndContext + SortableContextより簡潔
  - Claude CLI連携: execFile（not exec）使用でコマンドインジェクション防止。サブスクリプション範囲内の利用を優先するアーキテクチャ
  - package.jsonバージョン固定: camoneの指示により ^ 無しの固定バージョンで統一

- 副作用:
  - @dnd-kit/react 0.2.4 は experimental ステータス（27 dependents）。本番利用には注意が必要
  - Claude CLI連携はローカル開発環境でのみ動作（claude コマンドがPATHに必要）
  - Tailwind CSS v4 の @custom-variant はまだ新しい仕様。既存のdark:クラスとの互換性は確認済み
  - @dnd-kit/helpers は @dnd-kit/react と別パッケージで追加インストールが必要だった（計画では未記載）

- 関連ファイル:
  - プロジェクトルート: /Users/aoyamaisaoosamu/WebDev/Project./260214_cc-appunto/project/
  - 型定義: src/types/kanban.ts, src/types/claude.ts
  - ストア: src/stores/boardStore.ts, src/stores/searchStore.ts
  - ストレージ: src/lib/storage/interface.ts, src/lib/storage/localStorage.ts
  - ユーティリティ: src/lib/utils.ts, src/lib/claude/client.ts
  - ページ: src/app/page.tsx, src/app/layout.tsx, src/app/globals.css
  - API: src/app/api/claude/route.ts
  - コンポーネント: src/components/board/, src/components/card/, src/components/search/, src/components/claude/, src/components/ui/, src/components/providers/
  - 実装計画: _idea/plan-to-implement.md
  - CLAUDE.md: .claude/CLAUDE.md
