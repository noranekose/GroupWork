# Docker Composeに切替

## 必要ファイルの作成

1. `devcontainer.json` のルートに `Dockerfile` を作成する。
- `node:22-alpine` ベースのイメージ定義

2. `devcontainer.json` のルートに `docker-compose.yaml` を作成する。
- ポート・ボリューム・環境変数の設定

```
typescript-intro-site/
└── .devcontainer/
    └── devcontainer.json
    └── docker-compose.yaml
    └── Dockerfile
```

## `devcontainer.json` の変更
- `image` から `dockerComposeFile` に切り替え

## 使い方
1. VSCode でコンテナを起動する手順
- VSCode でプロジェクト`typescript-intro-site`を開く
- コマンドパレット（Ctrl+Shift+P）を開く
- `Dev Containers: Reopen in Container` を実行
- docker-compose.yaml に基づいてコンテナがビルドされ、開発環境が起動する
