# CC Appunto - KANBAN型メモ管理アプリ 実装計画

## Context

camoneが考える「新しい形式のメモツール」をプロトタイプとして開発する。メモ・アイデア・バグ・新機能などをKANBAN型UIで一元管理し、Claude AIと連携して生産性を高めるWebアプリ。Auto Claudeプロジェクトの学習の一環として、KANBAN開発の実践を行う。

## 基本仕様

- **アプリ名**: CC Appunto（CC = Claude Code, Appunto = イタリア語で「メモ」）
- **フレームワーク**: Next.js 16.1.6（App Router）+ TypeScript
- **パッケージマネージャー**: pnpm
- **UI**: ダークモード、KANBAN ボード + ドラッグ&ドロップ
- **カラム**: TODO / In Progress / Done（3カラム）
- **タグ**: memo（青）, idea（黄）, bug（赤）, new feature（緑）
- **データ保存**: localStorage（将来の差し替え可能な抽象化層あり）
- **Claude連携**: 2段階アーキテクチャ
  - **通常**: Claude Code CLI（`claude -p`）経由 → Pro/MAXサブスクリプション範囲内、追加費用なし
  - **フォールバック**: `@anthropic-ai/sdk`（直接API）→ サブスク制限到達時のオプション、APIキー＋トークン課金

## 技術選定（2026-02-14 時点の最新バージョン）

### コア依存（必須）

| パッケージ | バージョン | 選定理由 |
|-----------|-----------|---------|
| `next` | 16.1.6 | App Router、Turbopackデフォルト、MCP組み込み |
| `react` / `react-dom` | 19.x (canary) | Next.js 16に同梱 |
| `@dnd-kit/react` | 0.2.4 | 新世代dnd-kit。DragDropProvider/useDraggable/useDroppable/useSortableの統合パッケージ |
| `tailwindcss` + `@tailwindcss/postcss` | 4.1.18 | CSSベース設定（`@import 'tailwindcss'`）。tailwind.config.ts不要 |
| `zustand` | 5.0.8 | 軽量状態管理、localStorage同期に便利 |
| `nanoid` | 5.1.6 | ユニークID生成 |

### オプション依存（API利用時のみ）

| パッケージ | バージョン | 選定理由 |
|-----------|-----------|---------|
| `@anthropic-ai/sdk` | 0.74.0 | サブスク制限到達時のフォールバック用。APIキーが必要、トークン課金 |

### 旧パッケージとの違い（重要）

| 変更点 | 旧 | 新 |
|--------|------|------|
| Next.js | 15+ | **16.1.6** — Turbopackデフォルト、MCP組み込み |
| Tailwind CSS設定 | `tailwind.config.ts` + `@tailwind base` | **CSSベース**: `postcss.config.mjs` + `@import 'tailwindcss'` |
| dnd-kit | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | **`@dnd-kit/react`** 単一パッケージ |
| create-next-app | 個別オプション指定 | **`--yes`** フラグで推奨デフォルト一括適用 |

## ディレクトリ構造

```
project/
├── .env.local                    # ANTHROPIC_API_KEY（オプション：API直接利用時のみ）
├── postcss.config.mjs            # Tailwind v4 PostCSS設定
├── src/
│   ├── app/
│   │   ├── layout.tsx            # ルートレイアウト（ダークモード）
│   │   ├── page.tsx              # メインページ
│   │   ├── globals.css           # @import 'tailwindcss' + カスタムCSS
│   │   └── api/claude/route.ts   # Claude API エンドポイント
│   ├── components/
│   │   ├── board/                # KanbanBoard, KanbanColumn, KanbanCard, ColumnHeader
│   │   ├── card/                 # CardModal, CardDetail, TagBadge
│   │   ├── search/               # SearchBar, TagFilter
│   │   ├── claude/               # ClaudePanel, ClaudeSettingsModal, UsageBanner
│   │   └── ui/                   # Button, Modal, Input, Toast
│   ├── stores/                   # boardStore, searchStore, claudeStore (zustand)
│   ├── lib/
│   │   ├── storage/              # interface.ts + localStorage.ts（抽象化層）
│   │   ├── claude/client.ts
│   │   └── utils.ts              # ID生成、タグ色設定
│   ├── types/                    # kanban.ts, claude.ts
│   └── hooks/                    # useBoard, useClaude, useSearch
└── _docs/templates/              # 実装ログ
```

## データモデル

```typescript
type CardTag = 'memo' | 'idea' | 'bug' | 'new-feature';
type ColumnStatus = 'todo' | 'in-progress' | 'done';

interface Card {
  id: string;                  // nanoid
  title: string;
  description: string;
  tag: CardTag | null;
  columnStatus: ColumnStatus;
  order: number;
  createdAt: string;           // ISO 8601
  updatedAt: string;
  aiGenerated: boolean;
}

interface Column {
  id: ColumnStatus;
  title: string;               // "TODO", "In Progress", "Done"
  cardIds: string[];
}

interface Board {
  columns: Record<ColumnStatus, Column>;
  cards: Record<string, Card>;
}
```

## 実装フェーズ（9段階）

### Phase 0: プロジェクト移行
1. 新プロジェクトディレクトリに Next.js アプリを作成: `pnpm create next-app@latest . --yes`（project/内で実行）
2. 既存ファイル群を新プロジェクトにコピー: `_docs/`, `_idea/`, `.claude/`, `try/`
3. `.claude/CLAUDE.md` の内容を新プロジェクトに合わせて更新
4. コア依存パッケージインストール: `pnpm add zustand@5 nanoid@5 @dnd-kit/react`
- **検証**: `pnpm dev` でデフォルトページ表示、コピーしたファイルが存在すること

### Phase 1: 型定義とプロジェクト基盤
- 型定義ファイル作成（`types/kanban.ts`, `types/claude.ts`）
- `.gitignore` の確認と調整
- **検証**: TypeScriptコンパイルエラーなし

### Phase 2: データ層とストア
- ストレージ抽象化層（`lib/storage/interface.ts` + `localStorage.ts`）
- zustand v5 ストア（`stores/boardStore.ts`, `stores/searchStore.ts`）
- SSR/クライアント整合性のためのhydration処理（`isHydrated`フラグ）
- **検証**: DevToolsでlocalStorageにデータ保存・復元を確認

### Phase 3: 静的UIコンポーネント（ドラッグなし）
- Tailwind v4 のCSSベース設定でダークモードスタイル
- 共通UIコンポーネント（Button, Modal, Input）
- KanbanBoard → KanbanColumn → KanbanCard のコンポーネント階層
- TagBadge（色分けバッジ）
- **検証**: 3カラム横並び表示、ダークモード適用、サンプルカード表示

### Phase 4: カードのCRUD操作
- CardModal（作成/編集モーダル）
- CardDetail（詳細表示）
- useBoard フック
- **検証**: カード作成・編集・削除、localStorage更新

### Phase 5: ドラッグ&ドロップ（@dnd-kit/react）
- `DragDropProvider` でボードをラップ（旧DndContextの代替）
- `useDroppable`（カラム）、`useSortable`（カード）
- ドラッグ中のビジュアルフィードバック
- moveCard / reorderCard ロジック
- **検証**: カラム内並替、カラム間移動、リロード後の位置保持

### Phase 6: 検索・フィルター
- SearchBar（テキスト検索）
- TagFilter（タグ絞り込み）
- **検証**: テキスト・タグでのフィルタリング、組合せ動作

### Phase 7: Claude AI統合（2段階アーキテクチャ）

**7a. Claude Code CLI 連携（サブスクリプション利用）**
- API Route（`api/claude/route.ts`）でClaude Code CLIを `child_process.exec` で呼び出し
- コマンド例: `claude -p "タスクの説明を生成して: ${title}"`
- Pro/MAXサブスクリプション範囲内で追加費用なし
- 3つのAI機能:
  1. **説明文自動生成**: タイトルから詳細説明を生成
  2. **関連タスク提案**: 既存カード情報をもとに提案
  3. **タスク要約**: ボード全体を要約

**7b. API直接利用フォールバック（オプション）**
- サブスク制限到達時の切替オプション
- `@anthropic-ai/sdk` をインストールして直接API呼び出し
- ClaudeSettingsModal（APIキー設定、モード切替: CLI ↔ API）
- UsageBanner（サブスク制限警告 → API切替提案）

- **検証**: CLI経由でAI機能動作、サブスクなし/制限時のエラーハンドリング

### Phase 8: 仕上げ
- Toast通知
- ローディングスピナー
- キーボードショートカット（Escでモーダル閉じる等）
- レスポンシブ最終調整
- **検証**: 全操作の一連フローを手動E2E確認、Next.js MCP経由でのエラー確認

## 検証方針

各フェーズ完了時に以下を確認:
1. `pnpm dev` でエラーなく動作（Turbopack）
2. ブラウザでの目視確認
3. Chrome DevTools で localStorage の中身確認
4. Next.js MCP（`nextjs_index` / `nextjs_call`）でランタイムエラー確認
5. Phase 7以降は Claude API の応答確認

## 初期化コマンド

```bash
# Phase 0: プロジェクト移行
cd "/Users/aoyamaisaoosamu/WebDev/Project./260214_cc-appunto/project"

# Next.js 16 + TypeScript + Tailwind v4 + ESLint + App Router + Turbopack
pnpm create next-app@latest . --yes

# 既存ファイルをコピー
SRC="/Users/aoyamaisaoosamu/WebDev/cc-learn/cc-playground/260213_【世界で話題】Auto ClaudeでKANBAN開発！実装〜AIレビューまで自動化できるClaude Codeのアプリ/playground"
cp -r "$SRC/_docs" "$SRC/_idea" "$SRC/.claude" "$SRC/try" .

# コア依存パッケージインストール
pnpm add zustand@5 nanoid@5 @dnd-kit/react

# オプション: Phase 7bでAPI直接利用を実装する場合のみ
# pnpm add @anthropic-ai/sdk
```

## バージョン確認ソース

- [Next.js 16.1.6 公式ドキュメント](https://nextjs.org/docs)
- [Tailwind CSS 4.1.18 - npm](https://www.npmjs.com/package/tailwindcss)
- [@dnd-kit/react 0.2.4 - npm](https://www.npmjs.com/package/@dnd-kit/react)
- [@dnd-kit/react Quickstart](https://next.dndkit.com/react/quickstart)
- [zustand 5.0.8 - GitHub](https://github.com/pmndrs/zustand)
- [@anthropic-ai/sdk 0.74.0 - npm](https://www.npmjs.com/package/@anthropic-ai/sdk)
- [nanoid 5.1.6 - npm](https://www.npmjs.com/package/nanoid)
