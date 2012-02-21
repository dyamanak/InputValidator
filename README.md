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

&lt;!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"&gt;
&lt;html&gt;
&lt;head&gt;
&lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /&gt;
&lt;script type="text/javascript" src="inputvalidator.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="inputvalidator-rule.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
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
&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;form name="form1" method="post" action=""&gt;
ユーザID
&lt;input type="text" name="user" size="20" maxlength="20" /&gt;&lt;br /&gt;
&lt;br /&gt;
パスワード
&lt;input type="password" name="pass" size="20" maxlength="20" /&gt;&lt;br /&gt;
&lt;br /&gt;
&lt;input type="reset" value="リセット" /&gt;&nbsp;&nbsp;
&lt;input type="submit" value="送信" /&gt;&lt;br /&gt;
&lt;br /&gt;
&lt;/form&gt;
&lt;/body&gt;
&lt;/html&gt;

### License

[MIT-style license.][2]

 [1]: http://inputvalidator.appspot.com/
 [2]: http://inputvalidator.appspot.com/license.txt

