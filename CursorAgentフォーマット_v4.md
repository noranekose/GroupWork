# やりたいこと
[TypeScript入門サイトのUPDATE]

# 目的
[コードレビュー0320.md の内容から放置するとバグ・脆弱性・ビルドエラーにつながる問題の改修]

# 作業範囲
- [- [ ] 【安全性】`new Function` の実行で `window`・`document`・`fetch` 等のグローバルオブジェクトへ無制限にアクセスできる。DOM 操作や `window.location` の書き換えが可能な状態。iframe サンドボックスへの移行を検討すること。（該当箇所: `runTypeScript.ts:63`）

- [ ] 【バグ】`setOutput(result.success ? result.output : result.output || '')` は成功・失敗どちらも `result.output` を設定しており、三項演算子の意図が不明瞭。メンテナンス時に誤読を招く。（該当箇所: `App.tsx:34`）

- [ ] 【可読性・バグリスク】`handleReset`（44-51行目）と `resetLessonToInitial`（53-57行目）が実質同一処理を2関数で持っている。一方を変更したときに他方の変更を忘れるリスクがある。関数を統合すること。（該当箇所: `App.tsx:43-57`）]

# 対象外
- [-]

# 使用技術
- [React / TypeScript / Vite など]

# 関連ファイル
- [C:\Users\Yu\OneDrive\Desktop\Cursor\GroupWork\typescript-intro-site]
- [ファイルパス]

# 条件
- [守ってほしいルール]
- [UIや仕様の条件]
- [バリデーション条件]

# 出力形式
- まず実装方針を書く
- 次に変更ファイルを書く
- その後コードを書く
- 最後に注意点を書く