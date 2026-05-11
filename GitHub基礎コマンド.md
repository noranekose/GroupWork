# Git / GitHub 基礎コマンド（説明付き）

Git はバージョン管理ツール、GitHub はリモートでリポジトリを共有・協業するサービスです。ローカルで使うのは主に **Git のコマンド** です。

---

## 1. 最初の設定（1 台につき 1 回程度）

| コマンド | 説明 |
|----------|------|
| `git config --global user.name "あなたの名前"` | コミットに付く作者名を設定する |
| `git config --global user.email "mail@example.com"` | コミットに付くメールを設定する（GitHub と一致させると貢献がアカウントに紐づきやすい） |
| `git config --list` | 現在の設定一覧を表示する |

---

## 2. リポジトリの用意

| コマンド | 説明 |
|----------|------|
| `git init` | 今いるフォルダを Git 管理下にする（`.git` ができる） |
| `git clone <URL>` | GitHub などの URL からリポジトリを丸ごとコピーしてくる |

例: `git clone https://github.com/ユーザー名/リポジトリ名.git`

---

## 3. 状態の確認

| コマンド | 説明 |
|----------|------|
| `git status` | 変更・ステージング・ブランチなどの状態を表示する |
| `git log` | コミット履歴を表示する（`--oneline` で 1 行ずつ見やすく） |
| `git diff` | まだステージしていない変更内容を表示する |
| `git diff --staged` | ステージ済みの変更（次のコミットに入る内容）を表示する |

---

## 4. 変更の記録（コミットまで）

| コマンド | 説明 |
|----------|------|
| `git add <ファイル>` | 指定ファイルを「次のコミットに含める」リスト（ステージ）に載せる |
| `git add .` | カレント以下の変更をまとめてステージする |
| `git commit -m "メッセージ"` | ステージした内容を 1 つのコミットとして保存する |
| `git commit --amend` | 直前のコミットを修正する（メッセージや内容の取り消し・追記に使う。共有済みブランチでは注意） |

---

## 5. リモート（GitHub）との同期

| コマンド | 説明 |
|----------|------|
| `git remote -v` | 登録されているリモート（origin など）の URL を表示する |
| `git remote add origin <URL>` | 名前 `origin` でリモートを追加する（初回 push 前など） |
| `git fetch` | リモートの最新情報を取ってくる（ローカルの作業ブランチはまだマージしない） |
| `git pull` | リモートの変更を取り込み、現在のブランチにマージする（`fetch` + `merge` に近い） |
| `git push` | ローカルのコミットをリモート（多くは `origin`）に送る |
| `git push -u origin main` | `main` を初めて `origin` に送り、以降は `git push` だけでよいように追跡を設定する（ブランチ名は `main` / `master` などリポジトリに合わせる） |

---

## 6. ブランチ

| コマンド | 説明 |
|----------|------|
| `git branch` | ローカルブランチ一覧を表示する（`*` が現在のブランチ） |
| `git branch <名前>` | 新しいブランチを作る（まだ切り替えない） |
| `git checkout <名前>` | 指定ブランチに切り替える |
| `git switch <名前>` | 同上（新しい推奨コマンド） |
| `git checkout -b <名前>` | ブランチを作って同時に切り替える |
| `git switch -c <名前>` | 同上（`switch` 版） |
| `git merge <ブランチ名>` | 指定ブランチの変更を、今いるブランチに取り込む |

GitHub で **Pull Request（PR）** を出すときは、多くの場合 feature ブランチを切って `push` し、Web 上で PR を作成します。

---

## 7. 取り消し・巻き戻し（よく使うもの）

| コマンド | 説明 |
|----------|------|
| `git restore <ファイル>` | ワークツリーのファイルを最後のコミット（またはステージ）の状態に戻す |
| `git restore --staged <ファイル>` | ステージから外す（ファイルの中身はそのまま） |
| `git reset --soft HEAD~1` | 直前のコミットだけ取り消し、変更はステージされたまま残す |
| **注意** | すでに `push` したコミットを書き換えると、共有リポジトリで履歴が食い違うことがある。チーム開発では `revert` や相談が安全なことが多い |

---

## 8. GitHub 上でよくする操作（コマンドではない）

- **Fork**: 他人のリポジトリを自分のアカウントにコピーしてから変更する
- **Pull Request**: ブランチの差分をレビュー・マージしてもらう依頼
- **Issue**: バグ報告やタスクのチケット

---

## 9. 最小の日常フロー（例）

```text
git pull                    # 作業前にリモートと揃える
# ファイルを編集
git status                  # 何が変わったか確認
git add .                   # コミットに含めるファイルを選ぶ
git commit -m "変更内容"   # ローカルに記録
git push                    # GitHub に送る
```

---

## 参考

- コマンドの詳細は `git help <コマンド>` や `git <コマンド> --help` で確認できる
- GitHub 公式ドキュメント: [https://docs.github.com/](https://docs.github.com/)


# 1) リポジトリへ移動
cd "C:\Users\kyuu0\OneDrive\Desktop\Cursor\EFU_GW\GroupWork"

# 2) 変更確認
git status

# 3) 追加（全変更を含める場合）
git add .

# 4) コミット
git commit -m "報告レポート_260423_01.md"

# 5) いまのブランチ名を確認
git branch --show-current

# 6) 初回push（例: main の場合）
git push -u origin main
# main 以外なら:
# git push -u origin <ブランチ名>

# 7) 2回目以降
git push