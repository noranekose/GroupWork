import { test, expect } from '@playwright/test';

/**
 * TypeScript 入門サイト E2E テスト
 *
 * Monaco Editor は WebComponent のため page.fill() / page.type() が使えない。
 * エディタへの入力が必要なテストは test.skip() でスキップする。
 */

// ページ初期表示が完了するまで待つヘルパー
async function waitForAppReady(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  // h1 が表示されるまで待機（アプリの読み込み完了の目安）
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

// ------------------------------------------------------------------
// フロー1: ページ初期表示
// ------------------------------------------------------------------
test.describe('ページ初期表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('ページタイトル「TypeScript 入門」が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'TypeScript 入門' })).toBeVisible();
  });

  test('最初のレッスン「1. はじめての TypeScript」がアクティブ状態で表示される', async ({ page }) => {
    // アクティブボタンのテキストを確認
    const activeBtn = page.locator('.lesson-btn.active');
    await expect(activeBtn).toBeVisible();
    await expect(activeBtn).toContainText('1. はじめての TypeScript');
  });

  test('サイドバーに5件のレッスンボタンが表示される', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'レッスン一覧' });
    await expect(nav).toBeVisible();
    const buttons = nav.getByRole('button');
    await expect(buttons).toHaveCount(5);
  });

  test('「実行する」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: '実行する' })).toBeVisible();
  });

  test('「判定する」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: '判定する' })).toBeVisible();
  });

  test('「初期コードに戻す」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: '初期コードに戻す' })).toBeVisible();
  });
});

// ------------------------------------------------------------------
// フロー2: レッスン切り替え
// ------------------------------------------------------------------
test.describe('レッスン切り替え', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('サイドバーの「2. 基本的な型」をクリックするとレッスンが切り替わる', async ({ page }) => {
    // 「2. 基本的な型」ボタンをクリック
    const nav = page.getByRole('navigation', { name: 'レッスン一覧' });
    await nav.getByRole('button', { name: '2. 基本的な型' }).click();

    // アクティブボタンが変わっている
    const activeBtn = page.locator('.lesson-btn.active');
    await expect(activeBtn).toContainText('2. 基本的な型');
  });

  test('切り替え後、説明文が更新される', async ({ page }) => {
    // 初期レッスンの説明文を確認
    const description = page.locator('.description');
    await expect(description).toContainText('Hello, TypeScript');

    // レッスン2 に切り替え
    const nav = page.getByRole('navigation', { name: 'レッスン一覧' });
    await nav.getByRole('button', { name: '2. 基本的な型' }).click();

    // 説明文が変わっている（レッスン2 の description を確認）
    await expect(description).toContainText('number');
  });

  test('レッスン切り替え後、出力パネルがリセットされプレースホルダーが表示される', async ({ page }) => {
    // レッスン2 に切り替え
    const nav = page.getByRole('navigation', { name: 'レッスン一覧' });
    await nav.getByRole('button', { name: '2. 基本的な型' }).click();

    // 出力パネルにプレースホルダーが表示される
    const outputPanel = page.locator('section[aria-live="polite"]');
    await expect(outputPanel).toContainText('「実行する」を押すとここに表示されます');
  });

  test('すべての5レッスン間を順番に切り替えられる', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'レッスン一覧' });
    const lessonTitles = [
      '1. はじめての TypeScript',
      '2. 基本的な型',
      '3. インターフェース',
      '4. 関数の型',
      '5. ユニオン型',
    ];

    for (const title of lessonTitles) {
      await nav.getByRole('button', { name: title }).click();
      const activeBtn = page.locator('.lesson-btn.active');
      await expect(activeBtn).toContainText(title);
    }
  });
});

// ------------------------------------------------------------------
// フロー3: ヒント表示
// ------------------------------------------------------------------
test.describe('ヒント表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('details.hint の summary をクリックするとヒントが展開される', async ({ page }) => {
    const hintDetails = page.locator('details.hint');
    await expect(hintDetails).toBeVisible();

    // 展開前は open 属性がない
    await expect(hintDetails).not.toHaveAttribute('open');

    // summary「ヒント」をクリック
    await hintDetails.getByText('ヒント').click();

    // 展開後は open 属性が付与される
    await expect(hintDetails).toHaveAttribute('open', '');
  });

  test('ヒントを展開するとコードが表示される', async ({ page }) => {
    const hintDetails = page.locator('details.hint');
    await hintDetails.getByText('ヒント').click();

    // ヒントコードが表示される
    const hintCode = hintDetails.locator('pre.hint-code');
    await expect(hintCode).toBeVisible();
    await expect(hintCode).not.toBeEmpty();
  });

  test('ヒントを展開後にもう一度クリックすると閉じる', async ({ page }) => {
    const hintDetails = page.locator('details.hint');
    const summary = hintDetails.getByText('ヒント');

    // 開く
    await summary.click();
    await expect(hintDetails).toHaveAttribute('open', '');

    // 閉じる
    await summary.click();
    await expect(hintDetails).not.toHaveAttribute('open');
  });
});

// ------------------------------------------------------------------
// フロー4: コード実行（Monaco Editor 入力は SKIP）
// ------------------------------------------------------------------
test.describe('コード実行', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('Monaco Editor へのコード入力テストは SKIP（WebComponent のため入力不可）', async () => {
    test.skip(true, 'Monaco Editor は WebComponent のため page.fill() / page.type() が利用できない');
  });

  test('「実行する」ボタンがクリック可能である', async ({ page }) => {
    const runBtn = page.getByRole('button', { name: '実行する' });
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toBeEnabled();
  });

  test('「実行する」ボタンをクリックすると処理が実行される（エラーにならない）', async ({ page }) => {
    const runBtn = page.getByRole('button', { name: '実行する' });

    // クリック実行（エラーなく完了することを確認）
    await runBtn.click();

    // ボタンが再び enabled になるまで待つ（実行完了の目安）
    await expect(runBtn).toBeEnabled({ timeout: 15_000 });
  });
});

// ------------------------------------------------------------------
// フロー5: 出力パネルの初期状態確認
// ------------------------------------------------------------------
test.describe('出力パネルの初期状態', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('「実行する」を押す前はプレースホルダーが表示される', async ({ page }) => {
    const outputPanel = page.locator('section[aria-live="polite"]');
    await expect(outputPanel).toBeVisible();
    await expect(outputPanel).toContainText('「実行する」を押すとここに表示されます');
  });

  test('出力パネルに「実行結果」見出しが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 3, name: '実行結果' })).toBeVisible();
  });

  test('出力パネルが aria-live="polite" を持つ', async ({ page }) => {
    const outputPanel = page.locator('section[aria-live="polite"]');
    await expect(outputPanel).toHaveAttribute('aria-live', 'polite');
  });
});

// ------------------------------------------------------------------
// フロー6: 初期コードに戻す
// ------------------------------------------------------------------
test.describe('初期コードに戻す', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('「初期コードに戻す」ボタンをクリックしてもエラーにならない', async ({ page }) => {
    const resetBtn = page.getByRole('button', { name: '初期コードに戻す' });
    await expect(resetBtn).toBeEnabled();

    // クリックしてもページがクラッシュしないことを確認
    await resetBtn.click();

    // ページが正常に表示されている
    await expect(page.getByRole('heading', { level: 1, name: 'TypeScript 入門' })).toBeVisible();
  });

  test('「初期コードに戻す」をクリックすると出力パネルがリセットされる', async ({ page }) => {
    const resetBtn = page.getByRole('button', { name: '初期コードに戻す' });
    await resetBtn.click();

    // プレースホルダーが表示される（出力がリセットされた）
    const outputPanel = page.locator('section[aria-live="polite"]');
    await expect(outputPanel).toContainText('「実行する」を押すとここに表示されます');
  });

  test('レッスン切り替え後に「初期コードに戻す」をクリックしてもエラーにならない', async ({ page }) => {
    // レッスン3 に切り替え
    const nav = page.getByRole('navigation', { name: 'レッスン一覧' });
    await nav.getByRole('button', { name: '3. インターフェース' }).click();

    const resetBtn = page.getByRole('button', { name: '初期コードに戻す' });
    await resetBtn.click();

    // ページが正常に表示されている
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

// ------------------------------------------------------------------
// ボーナス: アクセシビリティ・構造確認
// ------------------------------------------------------------------
test.describe('ページ構造とアクセシビリティ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('header 要素が存在する', async ({ page }) => {
    await expect(page.locator('header.header')).toBeVisible();
  });

  test('footer 要素が存在する', async ({ page }) => {
    await expect(page.locator('footer.footer')).toBeVisible();
  });

  test('Monaco エディタコンテナが aria-label を持つ', async ({ page }) => {
    const editorContainer = page.locator('div[aria-label="TypeScript コードエディタ"]');
    await expect(editorContainer).toBeVisible();
  });

  test('ナビゲーションが aria-label="レッスン一覧" を持つ', async ({ page }) => {
    await expect(page.locator('nav[aria-label="レッスン一覧"]')).toBeVisible();
  });
});
