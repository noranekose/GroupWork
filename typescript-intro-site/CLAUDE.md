# CLAUDE.md — typescript-intro-site

## 基本ルール
- 返答は必ず日本語で行う
- コメントも日本語で書く

## プロジェクト概要

ブラウザ上で TypeScript を編集・実行して学べる学習用 Web サイト。
Vite + React + TypeScript で構築されており、サーバーサイド不要でブラウザ内で TypeScript をトランスパイル・実行する。

## 技術スタック

| 項目 | バージョン/ツール |
|------|-----------------|
| フレームワーク | React 19 |
| 言語 | TypeScript 5.9 |
| バンドラー | Vite 8 |
| エディタ | Monaco Editor 0.55（VS Code と同じエンジン） |
| Linter | ESLint 9 (typescript-eslint) |
| ユニットテスト | Vitest 4.1 + jsdom |
| E2E テスト | Playwright 1.58（Chromium のみ） |
| 実行エンジン | `typescript` パッケージ（ブラウザ内トランスパイル） |

## ディレクトリ構成

```
typescript-intro-site/
├── src/
│   ├── App.tsx               # メインコンポーネント（エディタ・実行・判定 UI）
│   ├── App.css               # スタイル
│   ├── index.css             # グローバルスタイル（リセット）
│   ├── main.tsx              # エントリーポイント
│   ├── data/
│   │   ├── lessons.ts        # レッスン定義（Lesson 型 + lessons 配列）
│   │   └── lessons.test.ts   # レッスンデータのユニットテスト（20 件）
│   └── lib/
│       ├── runTypeScript.ts       # TypeScript のトランスパイル＆実行ロジック
│       ├── runTypeScript.test.ts  # runTypeScript のユニットテスト（11 件）
│       ├── normalizeOutput.ts     # 判定用の出力正規化
│       └── normalizeOutput.test.ts # normalizeOutput のユニットテスト（19 件）
├── e2e/
│   └── app.spec.ts           # Playwright E2E テスト（26 件）
├── .claude/
│   ├── settings.json         # Claude Code 権限設定
│   ├── settings.local.json   # ローカル権限拡張（npm run:* 許可）
│   └── agents/
│       ├── qa-agent.md       # QA 管理専門エージェント
│       ├── code-reviewer.md  # コードレビュー専門エージェント
│       └── market-researcher.md # 市場調査専門エージェント
├── .devcontainer/            # Dev Container 設定
├── public/
├── index.html
├── vite.config.ts            # Vite 設定（Vitest 設定も含む）
├── playwright.config.ts      # Playwright 設定
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── eslint.config.js
```

## よく使うコマンド

```bash
# 開発サーバー起動（http://localhost:5173）
npm run dev

# 型チェック＋本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# Lint 実行
npm run lint

# ユニットテスト（ウォッチモード）
npm run test

# ユニットテスト（単一実行）
npm run test:run

# ユニットテスト（カバレッジ計測）
npm run test:coverage

# E2E テスト（Playwright）
npm run e2e
```

## アーキテクチャの要点

### TypeScript 実行エンジン（`src/lib/runTypeScript.ts`）
- `ts.transpileModule` でブラウザ内トランスパイル（型エラーも検出）
- iframe（`sandbox="allow-scripts"`）内で隔離実行し、`console.log` をモックして出力を捕捉
- iframe と親フレームは `postMessage` で通信
- fetch / XMLHttpRequest / WebSocket をブロック。ネットワーク・ファイルアクセスなし
- `isolatedModules: true` のため、一部の型エラーはトランスパイル時に検出されない（構文エラーは検出される）

### レッスン構造（`src/data/lessons.ts`）
- `Lesson` 型: `id`, `title`, `description`, `hint?`, `initialCode`, `expectedOutput`
- 判定は `normalizeOutputForJudge` で正規化した上で `expectedOutput` と比較
- 不合格時はコードを `initialCode` に自動リセット

### 状態管理（`src/App.tsx`）
- `useState` のみ。外部ライブラリなし
- 各レッスンのコードは `Record<string, string>` で保持（切り替え時も内容を維持）
- 合格/不合格はモーダル（`role="dialog"`）で表示

### テスト構成
- **ユニットテスト**（Vitest + jsdom）: `src/**/*.test.ts` — 50 件
  - `normalizeOutputForJudge` の正規化ロジック
  - `ts.transpileModule` によるトランスパイル・エラー検出
  - `lessons` 配列のスキーマ検証・一意性チェック
- **E2E テスト**（Playwright + Chromium）: `e2e/**/*.spec.ts` — 26 件
  - ページ初期表示・レッスン切り替え・ヒント表示・ボタン操作・アクセシビリティ
  - Monaco Editor は WebComponent のため、コード入力を伴うテストは `test.skip()` で除外

## レッスン追加方法

`src/data/lessons.ts` の `lessons` 配列にオブジェクトを追加するだけ。

```typescript
{
  id: 'unique-id',          // 一意な識別子
  title: 'N. タイトル',
  description: '課題の説明文',
  hint: `// ヒントコード（任意）`,
  initialCode: '',           // 通常は空文字
  expectedOutput: '期待する console.log の出力',
}
```

レッスン追加後は `npm run test:run` で `lessons.test.ts` が自動検証する（スキーマ・一意性チェック）。

## 注意事項

- `new Function` を使った実行は ESLint で警告されるが、iframe 内のインラインスクリプトで使用しているため実質的に問題なし（学習用サンドボックス）
- TypeScript のトランスパイルは `isolatedModules: true` のため、型のみの import/export は `import type` を使うこと
- ビルドは `tsc -b && vite build` の順で実行される（型チェックが先）
- `normalizeOutputForJudge` は末尾の `.trim()` により文字列全体の先頭空白も除去する。インデントを含む `expectedOutput` を追加する際は注意
- Dev Container 対応のため `vite.config.ts` に `server.host: true`（0.0.0.0 バインド）が設定されている
- Playwright は CI 環境では `reuseExistingServer: false` になり、毎回新規サーバーを起動する
