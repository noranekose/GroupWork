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
| Linter | ESLint 9 (typescript-eslint) |
| 実行エンジン | `typescript` パッケージ（ブラウザ内トランスパイル） |

## ディレクトリ構成

```
typescript-intro-site/
├── src/
│   ├── App.tsx          # メインコンポーネント（エディタ・実行・判定 UI）
│   ├── App.css          # スタイル
│   ├── main.tsx         # エントリーポイント
│   ├── data/
│   │   └── lessons.ts   # レッスン定義（Lesson 型 + lessons 配列）
│   └── lib/
│       ├── runTypeScript.ts     # TypeScript のトランスパイル＆実行ロジック
│       └── normalizeOutput.ts  # 判定用の出力正規化
├── public/
├── index.html
├── vite.config.ts
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
```

## アーキテクチャの要点

### TypeScript 実行エンジン（`src/lib/runTypeScript.ts`）
- `ts.transpileModule` でブラウザ内トランスパイル（型エラーも検出）
- `new Function` でサンドボックス実行し、`console.log` をモックして出力を捕捉
- ネットワーク・ファイルアクセスなし。学習用簡易環境

### レッスン構造（`src/data/lessons.ts`）
- `Lesson` 型: `id`, `title`, `description`, `hint?`, `initialCode`, `expectedOutput`
- 判定は `normalizeOutputForJudge` で正規化した上で `expectedOutput` と比較
- 不合格時はコードを `initialCode` に自動リセット

### 状態管理（`src/App.tsx`）
- `useState` のみ。外部ライブラリなし
- 各レッスンのコードは `Record<string, string>` で保持（切り替え時も内容を維持）

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

## 注意事項

- `new Function` を使った実行は ESLint で警告されるが、`// eslint-disable-next-line no-new-func` で意図的に無効化している（学習用サンドボックスのため）
- TypeScript のトランスパイルは `isolatedModules: true` のため、型のみの import/export は `import type` を使うこと
- ビルドは `tsc -b && vite build` の順で実行される（型チェックが先）
