## Input Validator 3.00

InputValidatorとは簡単な設定だけで
入力値の妥当性チェックを行う Java 用、または JavaScript 用ライブラリです。

### サンプル & チュートリアル

 [Input Validator 3.00 Demo Site][1]

### 使い方の例 (HTML & JavaScript)

以下のサンプルコードでは、各入力欄が必須であることを設定しています。

	<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
	<html>
	<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<script type="text/javascript" src="inputvalidator.js"></script>
	<script type="text/javascript" src="inputvalidator-rule.js"></script>
	<script type="text/javascript">
	InputValidator.configure = {
		form1 : {
			user : {
				required : true,
				error : 'ユーザIDが入力されていません。'
			},
			pass : {
				required : true,
				error : 'パスワードが入力されていません。'
			}
		}
	};
	</script>
	</head>
	<body>
	<form name="form1" method="post" action="">
	ユーザID
	<input type="text" name="user" size="20" maxlength="20" /><br />
	<br />
	パスワード
	<input type="password" name="pass" size="20" maxlength="20" /><br />
	<br />
	<input type="reset" value="リセット" />&nbsp;&nbsp;
	<input type="submit" value="送信" /><br />
	<br />
	</form>
	</body>
	</html>

### 対応ブラウザ

 InternetExplorer / Firefox / Chrome / Safari / Opera

### ライセンス

 [MIT-style license.][2]

### メリット

このライブラリを使うと、一つの「チェック仕様定義ファイル（JSON形式）」を読み込んで、
クライアント側（JavaScript）とサーバ側（Java）で入力値の妥当性を検証できます。

何が目新しいかと言いますと、
「クライアント側のユーザビリティ向上と同時に、サーバ側のセキュリティ（妥当性検証）も確保される」
ということなんです。

InputValidator は容易に拡張でき、必要に応じて案件ごとにチェック仕様をカスタマイズできます。
チェック仕様を JavaScript で記述できるので、要望に応じて柔軟な対応が可能です。

### ご意見・ご要望

 [ご意見・ご要望はこちら][4]

### 更新履歴 & 残課題

 [更新履歴 & 残課題][3]

###

 [1]: http://inputvalidator.appspot.com/
 [2]: http://inputvalidator.appspot.com/license.txt
 [3]: http://inputvalidator.appspot.com/changes.txt
 [4]: https://github.com/dyamanak/InputValidator/issues
