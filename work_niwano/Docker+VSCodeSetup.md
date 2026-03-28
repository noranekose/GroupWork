# Dev Containers 移行手順（typescript-intro-site）

## 必要ファイルの作成

プロジェクトルートに `.devcontainer/devcontainer.json` を作成する。

```
typescript-intro-site/
└── .devcontainer/
    └── devcontainer.json
```

### `.devcontainer/devcontainer.json`

```json
{
  "name": "typescript-intro-site",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-22",
  "forwardPorts": [5173],
  "portsAttributes": {
    "5173": {
      "label": "Vite Dev Server",
      "onAutoForward": "openBrowser"
    }
  },
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
      }
    }
  }
}
```

## vite.config.ts の変更（必須）

コンテナ内では `localhost` がホストに届かないため、`server.host` を追加する。

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // 追加（0.0.0.0 にバインド）
    port: 5173,
  },
})
```

## 起動手順

1. VSCode に **Dev Containers 拡張機能**（`ms-vscode-remote.remote-containers`）をインストール
2. Docker Desktop を起動
3. VSCode でコマンドパレット → `Dev Containers: Reopen in Container`
4. コンテナ起動後、`npm run dev` を実行

## ポイント整理

| 項目 | 内容 |
|------|------|
| ベースイメージ | `devcontainers/typescript-node:1-22`（Node 22 + TS 付属） |
| ポートフォワード | 5173（Vite のデフォルト） |
| `postCreateCommand` | コンテナ作成時に自動で `npm install` |
| Vite の `host: true` | コンテナ外からアクセスするために必須 |

## 備考

- 現状はシングルコンテナ構成で十分
- 将来的にバックエンドや DB を追加する場合は `.devcontainer/docker-compose.yml` を使う構成に拡張できる

- `typescript-intro-site`フォルダを開くと開発コンテナに接続する