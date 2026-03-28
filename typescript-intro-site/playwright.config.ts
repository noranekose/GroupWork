import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 * TypeScript 入門サイト専用
 */
export default defineConfig({
  // テストファイルのディレクトリ
  testDir: './e2e',

  // 各テストのタイムアウト（30秒）
  timeout: 30_000,

  // テスト期待値のタイムアウト
  expect: {
    timeout: 10_000,
  },

  // 失敗時のリトライ回数（CI では2回）
  retries: process.env.CI ? 2 : 0,

  // 並列実行
  fullyParallel: true,

  // レポーター設定
  reporter: [['list'], ['html', { open: 'never' }]],

  // 全テスト共通設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:5173',

    // ヘッドレスモード
    headless: true,

    // タイムアウト
    actionTimeout: 10_000,
    navigationTimeout: 30_000,

    // スクリーンショット（失敗時のみ）
    screenshot: 'only-on-failure',

    // トレース（失敗時のみ）
    trace: 'on-first-retry',
  },

  // テスト対象ブラウザ: Chromium のみ
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 開発サーバーを自動起動
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
