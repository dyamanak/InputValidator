## Input Validator

InputValidator is a library for JAVA( or JavaScript) 
to check validity of the input value only by simple setting.

InputValidatorとは簡単な設定だけで
入力値の妥当性チェックを行う Java 用、または JavaScript 用ライブラリです。

### Demo

[Input Validator 3.00 Demo][1]

### Sample Code (for JavaScript)

This sample code sets that each input value is required.

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

### License

[MIT-style license.][2]

 [1]: http://inputvalidator.appspot.com/
 [2]: http://inputvalidator.appspot.com/license.txt

