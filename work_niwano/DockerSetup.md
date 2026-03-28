# 概要
* WindowsでDockerを動かす手順

## システム要件
* Windows 10 (64bit) バージョン1903以降、またはWindows 11
* RAM 4GB以上（推奨8GB以上）
* BIOSで仮想化（Virtualization）が有効になっていること
	- [タスクマネージャー] > [パフォーマンス]タブ で「仮想化：有効」を確認

## WSL2（Windows Subsystem for Linux 2）のインストール
1. PowerShellを管理者で開いて実行

	``` 
	## WSLをインストール
	wsl --install
	```

2. インストール後、PCを再起動

3. PowerShellでコマンドを実行して、インストール結果を確認

	``` 
	## WSL2が有効か確認
	wsl --status
	```

## ディストリビューションのインストール
1. PowerShellでコマンドを実行して、ディストリビューションをインストール

	```
	## ディストリビューションの一覧表示
	wsl --list --online
	```

	```
	## Ubuntu 24.04 LTS をインストール
	wsl --install Ubuntu-24.04
	```

2. インストール後、ユーザーアカウントとパスワードの設定を要求されるので設定
- Ubuntuに接続した状態になる
- exit でPowerShellに戻る

	```
	## ディストリビューションのリスト表示、起動状態も確認できる
	wsl -l -v
	```

3. Linux用 Windowsサブシステム設定画面が表示されるので、リソースを適宜設定

## WSLの操作
1. 起動

	``` 
	## ユーザー ホーム ディレクトリで WSLを起動
	wsl ~
	```

2. 停止

	``` 
	## WSLに関連するすべてをシャットダウン
	wsl --shutdown
	```

	```
	## ディストリビューションを指定して停止
	wsl --terminate <Distribution Name>
	```

* WSLのコマンド（参考サイト）
	- https://learn.microsoft.com/ja-jp/windows/wsl/basic-commands

## Docker Desktopのインストール
1. 公式サイトからダウンロード
	https://www.docker.com/products/docker-desktop/
	→「Download for Windows」をクリック

2. インストーラーを実行
	* Docker Desktop Installer.exe を実行
	* インストール完了後、再起動

3. 起動確認
	* スタートメニューから「Docker Desktop」を起動。タスクトレイにクジラのアイコンが出ればOK

## 動作確認
1. PowerShellまたはコマンドプロンプトで以下を実行

	```
	## バージョン確認
	docker -- version
	docker compose version
	```

	```
	## テスト実行
	docker run hello-world
	```
	
	以下のように表示されれば成功
	Hello from Docker!
	This message shows that your installation appears to be working correctly.

## Docker Desktopの推奨設定
1. 起動後、右上の歯車アイコンから設定を開く
	* General
		- 「Start Docker Desktop when you sign in」→ お好みで
	* Resources > WSL Integration
		- 「Enable integration with my default WSL distro」をON
		- 使いたいLinuxディストリビューション（Ubuntu等）をONにする

	* Resources > Advanced
		- CPUとメモリの上限を調整（メモリは4GB程度を目安に）