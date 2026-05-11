# テスト実行結果レポート（2026-05-11）

## サマリー

| テスト種別 | 合格 | 失敗 | スキップ | 合計 |
|-----------|------|------|---------|------|
| ユニットテスト（Vitest） | 50 | 0 | 0 | 50 |
| E2Eテスト（Playwright） | 25 | 0 | 1 | 26 |
| **合計** | **75** | **0** | **1** | **76** |

**結果: 全テスト合格（スキップ1件は仕様による意図的スキップ）**

---

## 検出されたエラー・問題

### 問題1: Vitest が E2E テストファイルを誤って取り込む

**重大度：中**

| 項目 | 内容 |
|------|------|
| 発生箇所 | `e2e/app.spec.ts` |
| エラーメッセージ | `Playwright Test did not expect test.describe() to be called here.` |
| テスト結果への影響 | テストスイート自体は失敗扱い（Test Files: 1 failed）だが、ユニットテスト50件は全合格 |

**原因:**  
`vite.config.ts` の Vitest 設定に `include` / `exclude` パターンが未設定のため、`e2e/app.spec.ts` が Vitest に誤って取り込まれている。

**修正案:**  
`vite.config.ts` の `test` セクションに `include` パターンを追加する。

```typescript
test: {
  environment: 'jsdom',
  globals: true,
  include: ['src/**/*.test.ts'],  // src配下のみ対象にする
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
  },
},
```

---

## E2Eテスト スキップ一覧

| テスト名 | スキップ理由 |
|---------|------------|
| Monaco Editor へのコード入力テスト（`app.spec.ts:172`） | Monaco Editor が WebComponent のため Playwright からのテキスト入力不可（既知の制約） |

---

### normalizeOutputForJudge の挙動（重大度：低）

**詳細:**
`normalizeOutputForJudge` は `.trim()` を最後に適用するため、入力文字列の**先頭が空白文字で始まる場合、その空白も除去**される。

```
入力: '  indented\n  also indented'
出力: 'indented\n  also indented'  // 先頭行の先頭空白が除去される
```

**影響:** 現状のレッスン（`expectedOutput`）はすべてインデントなしの出力を期待しているため実害はない。ただし、今後インデントを含む `expectedOutput` を持つレッスンを追加する場合は注意が必要。

### ts.transpileModule の isolatedModules 制限（重大度：低）

**詳細:**
`runTypeScript.ts` では `isolatedModules: true` でトランスパイルしているため、一部の型エラー（例: string 型の存在しないメソッド呼び出し）はトランスパイル時に**検出されない**。構文エラーや `import type` 違反などは検出される。

**影響:** 学習用サンドボックスとしての用途では許容範囲内。実行時エラーはサンドボックス側で捕捉されるため、致命的な問題にはならない。

---

## テスト対象外（カバレッジ除外）の機能

| 機能 | 除外理由 |
|------|----------|
| `executeInSandbox` | iframe / postMessage が必要なブラウザ固有の非同期通信 |
| `ensureSandboxFrame` | DOM への iframe 追加と非同期メッセージ待機が必要 |
| `installMessageListener` | window のグローバルイベントリスナー登録 |
| `getSandboxHtml` | HTML 文字列生成（副作用なし・単体テスト可能だが優先度低） |
| `cleanupSandbox` | モジュールスコープの変数操作（副作用あり） |
