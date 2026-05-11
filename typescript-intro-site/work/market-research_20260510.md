# 市場調査・機能改善提案レポート（2026-05-10）

## プロジェクト概要

ブラウザ上で TypeScript を編集・実行して学べる学習用 Web サイト。Vite + React + TypeScript で構築され、サーバーサイド不要で Monaco Editor（VS Code 同エンジン）を使ったコード編集と、iframe サンドボックスによるブラウザ内実行が可能。現在はレッスンが5件（基本型・インターフェース・関数・ユニオン型）のみで、コードはフロントエンドにハードコードされている。

---

## 類似サービス一覧

| サービス名 | 特徴 | URL |
|-----------|------|-----|
| TypeScript Playground (Microsoft 公式) | 公式・カテゴリ別サンプル多数・TSConfig カスタマイズ・CodeSandbox/StackBlitz エクスポート対応・進捗管理なし | https://www.typescriptlang.org/play/ |
| learn-ts.org | 無料インタラクティブ・29章（基礎11+応用18）・Solution 閲覧機能あり・ユーザー登録不要・進捗管理なし | https://www.learn-ts.org/ |
| Boot.dev | 105レッスン・ゲーミフィケーション（ゲームライクなカリキュラム）・修了証・無料+有料プラン | https://www.boot.dev/courses/learn-typescript |
| Exercism (TypeScript track) | 106エクササイズ・自動コード解析・メンタリング・完全無料 | https://exercism.org/tracks/typescript |
| サバイバルTypeScript | 日本語・実務寄り・ドキュメント形式（リファレンス中心）・インタラクティブ実行機能なし | https://typescriptbook.jp/ |
| Playcode | npm パッケージ対応・AI 支援開発（15+モデル）・React/Tailwind 対応・厳格型チェック | https://playcode.io/typescript |
| W3Schools TypeScript Tutorial | 初心者向け・簡潔な説明・演習付き・多言語対応・進捗管理なし | https://www.w3schools.com/typescript/ |

---

## 競合比較：強み・弱み

### 強み（現プロジェクトが優れている点）

- サーバーレス完結: バックエンド不要でデプロイが極めて簡単。インフラコストゼロ
- Monaco Editor 採用: VS Code 同エンジンによる型補完・エラーハイライトが競合（learn-ts.org 等）より高品質
- セキュリティ設計: iframe sandbox＋fetch/WebSocket ブロック＋タイムアウトによるサンドボックスが堅牢
- 日本語ファースト: UI・エラーメッセージ・ヒントがすべて日本語。日本語圏の初心者に最適化
- 合否判定の即時フィードバック: `expectedOutput` との一致判定でゲーム的な達成感を提供
- モバイル対応 CSS: `@media (max-width: 768px)` でレイアウト切り替えが実装済み

### 弱み（競合と比較して不足している点）

- レッスン数が極少: 現在5件のみ。learn-ts.org は29章、Boot.dev は105レッスン、Exercism は106エクササイズと大差がある
- 進捗管理ゼロ: どのレッスンを完了したか保存されない。ページを閉じるとリセットされる（競合はすべて対応）
- 合格後の導線なし: 合格モーダルを閉じても「次のレッスンへ」ボタンが存在せず、手動で選択が必要
- コードコピー/共有機能なし: TypeScript Playground は URL 共有・CodeSandbox エクスポートを提供
- レッスンがハードコード: `lessons.ts` にハードコードされており、管理者がブラウザから追加・編集できない（2026-04-26 の壁打ちで Supabase 導入を検討済み）
- 型エラーの制限: `isolatedModules: true` のため、クロスファイル型エラーが検出できない。学習者が型エラーを理解しにくい場面がある
- 学習難易度の説明不足: レッスン間の難易度の関係や学習パスが不明確

---

## 追加推奨機能

| 優先度 | 機能名 | 概要 | 根拠 |
|--------|--------|------|------|
| 高 | レッスン進捗の永続化 | `localStorage` に合格済みレッスン ID を保存し、サイドバーに合格バッジ（チェックマーク等）を表示する | 競合（Boot.dev・Exercism）はすべて進捗管理を持つ。進捗が消えることは継続学習の最大の阻害要因。サーバーレス構成のまま `localStorage` のみで実現可能 |
| 高 | 合格後の自動次レッスン遷移 | 合格モーダルに「次のレッスンへ進む」ボタンを追加し、クリックで自動的に次のレッスンをアクティブにする | 現状は合格後に手動でレッスンを選ぶ必要があり学習フローが途切れる。App.tsx の `setActiveId` を呼ぶだけで実装可能 |
| 高 | レッスン数の大幅拡充 | 型エイリアス・ジェネリクス・列挙型・クラス・非同期処理（async/await）・型アサーションなど中級トピックを追加し、20件以上にする | 現在の5件は入門の入口にすぎず、ユーザーが早期に学習を終えてしまう。`lessons.ts` にオブジェクトを追加するだけで対応可能で実装コストが低い |
| 中 | コード URL 共有機能 | 現在のコードを Base64 エンコードして URL パラメータに埋め込み、コピーリンクを生成する | TypeScript Playground が同機能を持ち、学習者が「こういうコードを書いたが正しいか」を他者に共有する際に有用 |
| 中 | レッスンコンテンツの動的管理（Supabase 連携） | 2026-04-26 の壁打ちで検討済みの Supabase 案を実装し、管理画面からレッスンを追加・編集できるようにする | 現状ハードコードのため非エンジニアがレッスンを追加できない。レッスン拡充の持続性のために必要 |
| 低 | 実行結果のコピーボタン | 出力パネルにクリップボードコピーボタンを追加する | 小規模な UX 改善。TypeScript コードや出力を外部に貼り付ける場面で有用 |

---

## 改善推奨機能

| 優先度 | 改善対象 | 現状の問題 | 改善案 |
|--------|----------|------------|--------|
| 高 | 不合格時のコードリセット動作 | 判定失敗時にコードが即座に `initialCode`（空文字）にリセットされるため、学習者が書いた途中のコードが消えてしまい、何が悪かったか確認できない | リセット前に確認ダイアログを挟む、または不合格モーダルに「コードを保持して閉じる」と「リセットして最初から」の2択ボタンを設ける |
| 中 | モバイルでのエディタ高さ | `min-height: 220px` のみの指定で、スマートフォンでは Monaco Editor が非常に狭くなる | モバイルブレークポイントでエディタ高さを画面の40%程度に設定する（`height: 40svh` 等） |
| 中 | レッスン説明のマークダウン非対応 | `description` はプレーンテキストとして `<p>` タグに渡されるため、コード片（\`string\` 等）がコードフォントで表示されない | `description` 内のバッククォートで囲まれた部分を `<code>` タグに変換する簡易パーサーを追加する |
| 低 | ヒント表示後の誘導 | ヒントを展開した後、そのままコードをコピーして実行すれば合格できてしまう（学習効果が薄い） | ヒント展開後に「まずは自分で試してみよう」といった注意文を表示する、またはヒント閲覧回数を記録して学習レポートに活用する |

---

## 出典

- [TypeScript: TS Playground](https://www.typescriptlang.org/play/)
- [learn-ts.org](https://www.learn-ts.org/)
- [Boot.dev - Learn TypeScript](https://www.boot.dev/courses/learn-typescript)
- [Exercism TypeScript track](https://exercism.org/tracks/typescript)
- [サバイバルTypeScript](https://typescriptbook.jp/)
- [Playcode TypeScript Playground](https://playcode.io/typescript)
- [Class Central - Best TypeScript Courses 2026](https://www.classcentral.com/report/best-typescript-courses/)
- [codeparrot.ai - TS Playground Top Online Compilers](https://codeparrot.ai/blogs/ts-playground-top-online-compilers-for-typescript-beginners)
