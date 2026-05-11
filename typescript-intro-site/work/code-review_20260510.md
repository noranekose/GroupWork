# コードレビュー結果

実行日: 2026-05-10

## 対象ファイル

- `.claude/agents/code-reviewer.md`
- `.claude/agents/market-researcher.md`
- `.claude/agents/qa-agent.md`
- `.claude/settings.local.json`

---

## 🔴 必須修正

> 放置するとバグ・脆弱性・ビルドエラーにつながる問題

- [ ] 【安全性】`settings.local.json` にて `WebSearch` が無条件に許可されている。`WebFetch` は特定ドメインに限定しているにもかかわらず `WebSearch` はドメイン制限なしで許可されており、意図しない外部サービスへのアクセスを招く恐れがある。`WebSearch` も同様にドメインや用途を制限するか、必要なエージェント（market-researcher）の tools リストにのみ含める形で制御すべき。（該当箇所: `.claude/settings.local.json`:9）

---

## 🟡 提案

> 改善すると品質が上がるが、必須ではない項目

- [ ] 【可読性】`code-reviewer.md` の `description` フィールドに「レビュー観点」「出力フォーマット」の記述がなく、エージェントを呼び出す側が何が返ってくるかを把握しにくい。description にレビュー結果の形式（必須修正・提案・良い点の3段階）を簡潔に補記すると、他のエージェントや人間が適切に利用しやすくなる。（該当箇所: `.claude/agents/code-reviewer.md`:3）

- [ ] 【可読性】`qa-agent.md` の `description` フィールドは技術スタックを列挙しているが、エージェントが何を出力するか（テストレポート、テスト修正提案など）が記述されていない。market-researcher.md のように「何をして何を出力するか」を description に明示すると呼び出し側の理解が向上する。（該当箇所: `.claude/agents/qa-agent.md`:3）

- [ ] 【安全性】`market-researcher.md` に `WebSearch` と `WebFetch` が tools として宣言されているが、`settings.local.json` 側では `WebSearch` が全エージェント共通で許可されている。エージェント定義と permissions 設定が二重管理になっており、将来的に設定が乖離するリスクがある。`WebSearch` の許可はエージェントの tools 宣言で管理し、`settings.local.json` からは削除するか、コメントで明示的に意図を記録することが望ましい。（該当箇所: `.claude/settings.local.json`:9 / `.claude/agents/market-researcher.md`:9-10）

- [ ] 【可読性】3つのエージェントファイルすべてで `work/` ディレクトリ確認・作成ルールが重複記述されている（各ファイルの末尾2行）。将来エージェントが増えた場合にメンテナンスコストが増える。共通設定として `CLAUDE.md` や共通プロンプトに切り出し、各エージェントからは参照する形にすることを検討してほしい。（該当箇所: `.claude/agents/code-reviewer.md`:21-22 / `.claude/agents/market-researcher.md`:23-24 / `.claude/agents/qa-agent.md`:21-22）

- [ ] 【可読性】`settings.local.json` の `WebFetch` ドメインリストに `learningtypescript.org`（ハイフンなし）と `learn-ts.org` が混在しており、同一プロジェクトの調査目的で登録されたドメインなのか判別しにくい。意図が異なるなら、コメントや別ファイルで用途を説明することが望ましい（JSONにはコメントが書けないため、隣接する `settings.json` またはドキュメントで補足する）。（該当箇所: `.claude/settings.local.json`:5-11）

---

## 良い点

> 積極的に維持・横展開してほしい実装

- 3エージェントともに「コードの変更は行わない」「返答は必ず日本語」という共通制約が明文化されており、エージェント間の一貫性が保たれている。

- `market-researcher.md` で「優先度『高』は3件以内に絞る」という定量的な制約を明示しているのは、出力品質のブレを防ぐ良い実践である。横展開として `code-reviewer.md` の必須修正件数にも上限ガイドラインを設けることを検討できる。

- `settings.local.json` の `WebFetch` 許可を特定ドメインに限定している点は、最小権限の原則に沿った適切な設計である。

- `qa-agent.md` が `Bash` ツールを明示的に許可しており、テスト実行（`npm run test:run` 等）に必要な権限が適切に付与されている。
