# 壁打ち要約 2026-04-26

## 相談テーマ
レッスン情報をDBで保持し、管理画面から動的に追加・編集できるようにする

## 状況の整理
- 目的: 管理画面からレッスンを動的に追加・編集できるようにする
- 課題: 現状はフロントエンドのみの静的構成でDBもサーバーもない（`src/data/lessons.ts` にハードコード）
- 制約: デプロイ・インフラの制約なし／認証機能は現状不要／オフライン開発が必要

## 検討した案

### 案A: Supabase（BaaS）
- PostgreSQL + REST API + 管理画面（Supabase Studio）がセット
- TypeScript 型自動生成あり
- 実装コスト: 低、運用負荷: 低
- リスク: ベンダーロックイン（ただし PostgreSQL 標準なので移行は容易）

### 案B: 自前APIサーバー（Hono + SQLite/PostgreSQL）
- 完全なコントロールが可能
- 実装コスト: 高、認証・管理画面も自作が必要

### 案C: Headless CMS（Strapi/Sanity）
- 管理画面が最初から付属
- カスタマイズ性が中程度

## 結論・推奨
**案A: Supabase を採用**

理由: 移行コストが最小で、認証・DB・API・管理画面がすべてセット。ローカル開発は Supabase CLI（Docker）で完全オフライン動作が可能。

## 次のアクション
1. `npx supabase init` → `supabase start` でローカル環境を立ち上げる
2. `lessons` テーブルのマイグレーション作成 + 既存データの seed
3. `@supabase/supabase-js` を追加し、`lessons.ts` のハードコードをAPIフェッチに差し替え
4. React Router を追加して `/admin` ルートに CRUD UI を実装
5. 本番用 Supabase Cloud プロジェクトを作成し、マイグレーションを適用

## lessons テーブル設計（案）
```sql
create table lessons (
  id               text primary key,
  title            text not null,
  description      text not null,
  hint             text,
  initial_code     text not null default '',
  expected_output  text not null,
  sort_order       integer not null default 0
);
```

## 積み残し・懸念点
- 認証は「現状不要」だが、本番公開時は管理画面の保護が必要になる可能性がある
- RLS（Row Level Security）の設定方針は実装時に再検討が必要
- `/admin` ルートの UI 設計（React Router の導入可否も含む）は未検討
