# CC Appunto - KANBAN型メモ管理アプリ

## プロジェクト概要

CC Appunto（CC = Claude Code, Appunto = イタリア語で「メモ」）は、メモ・アイデア・バグ・新機能をKANBAN型UIで一元管理し、Claude AIと連携して生産性を高めるWebアプリ。

## 技術スタック

- **フレームワーク**: Next.js 16.1.6（App Router, Turbopack）
- **言語**: TypeScript 5.9
- **スタイリング**: Tailwind CSS 4.1.18（CSSベース設定, ダークモード）
- **状態管理**: zustand 5.x + localStorage永続化
- **D&D**: @dnd-kit/react 0.2.4
- **ID生成**: nanoid 5.x
- **パッケージマネージャー**: pnpm

## ディレクトリ構造

```
src/
├── app/           # Next.js App Router ページ
├── components/    # UIコンポーネント
│   ├── board/     # KanbanBoard, KanbanColumn, KanbanCard
│   ├── card/      # CardModal, CardDetail, TagBadge
│   ├── search/    # SearchBar, TagFilter
│   ├── claude/    # ClaudePanel, ClaudeSettingsModal
│   └── ui/        # Button, Modal, Input, Toast
├── stores/        # zustand ストア
├── lib/           # ユーティリティ、ストレージ抽象化層
├── types/         # 型定義
└── hooks/         # カスタムフック
```

## データモデル

- **Card**: id, title, description, tag, columnStatus, order, createdAt, updatedAt, aiGenerated
- **Column**: TODO / In Progress / Done（3カラム）
- **Tag**: memo（青）, idea（黄）, bug（赤）, new-feature（緑）

## Claude連携アーキテクチャ

1. **Primary**: Claude Code CLI（`claude -p`）→ Pro/MAXサブスクリプション範囲
2. **Fallback**: @anthropic-ai/sdk → APIキー＋トークン課金（オプション）

## 開発コマンド

```bash
pnpm dev    # 開発サーバー起動（Turbopack）
pnpm build  # プロダクションビルド
pnpm lint   # ESLint実行
```

## reference

- [Auto Claude](https://github.com/AndyMik90/Auto-Claude)
- [実装計画](./../_idea/plan-to-implement.md)

## Gitルール

このプロジェクトの "\_docs/templates/" はGitの管理対象とする。
.gitignore には追加しないこと。

# currentDate
Today's date is 2026-02-14.
