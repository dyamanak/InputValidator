<%@ page contentType="text/html; charset=UTF-8"%>
<%@ taglib uri="http://struts.apache.org/tags-html" prefix="html"%>
<%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean"%>
<%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>サーバ側(Java)とクライアント側(HTML)に入力値の妥当性チェックを追加する</title>

<link type="text/css" rel="stylesheet" href="SyntaxHighlighter.css" />
<script type="text/javascript" src="shCore.js"></script>
<script type="text/javascript" src="shBrushXml.js"></script>
<script type="text/javascript" src="shBrushJScript.js"></script>
<script type="text/javascript" src="shBrushJava.js"></script>
<script type="text/javascript">
	window.onload = function() {
		dp.SyntaxHighlighter.HighlightAll('code');
	}
</script>

<link type="text/css" rel="stylesheet" href="common.css" />
<script type="text/javascript" src="inputvalidator.js"></script>
<script type="text/javascript" src="inputvalidator-rule.js"></script>
<script type="text/javascript" src="validation_conf.js"></script>
</head>
<body>

	<div class="pankuzu">
		<a href="./index.html">トップページ</a>／サーバ側(Java)とクライアント側(HTML)に入力値の妥当性チェックを追加する
	</div>

	<div class="sourceCode">

		<h3>動作サンプル</h3>

		<div class="contentsBody">

			<html:form action="/Sample" method="post">
				<h2>
					ユーザ登録&nbsp;&nbsp;&nbsp;&nbsp;<span id="editFlag1">未編集</span>
				</h2>
				<div class="summary">
					<html:errors />
				</div>
				<table border="0" cellpadding="0" cellspacing="0" class="table1">
					<tr>
						<th>氏名</th>
						<td><html:text property="name" size="20" maxlength="20" /></td>
					</tr>
					<tr>
						<th>年齢</th>
						<td><html:text property="age" size="4" maxlength="3" /></td>
					</tr>
					<tr>
						<th>E-Mail</th>
						<td><html:text property="email" size="20" maxlength="50" />
						</td>
					</tr>
					<tr>
						<th>郵便番号</th>
						<td><html:text property="zipcode" size="10" maxlength="7" />
						</td>
					</tr>
					<tr>
						<th>住所</th>
						<td><html:text property="address" size="30" maxlength="50" />
						</td>
					</tr>
					<tr>
						<th>性別</th>
						<td><html:radio property="sex" value="male" />男性&nbsp;&nbsp;
							<html:radio property="sex" value="female" />女性<br />
						</td>
					</tr>
					<tr>
						<th>趣味</th>
						<td><html:multibox property="hobby" value="music" />音楽 <html:multibox
								property="hobby" value="movie" />映画 <html:multibox
								property="hobby" value="dance" />ダンス <html:multibox
								property="hobby" value="cooking" />料理 <html:multibox
								property="hobby" value="sports" />スポーツ</td>
					</tr>
					<tr>
						<th>好きな動物</th>
						<td><html:select property="animal">
								<html:option value=""></html:option>
								<html:option value="dog">犬</html:option>
								<html:option value="cat">猫</html:option>
								<html:option value="fish">魚</html:option>
							</html:select>
						</td>
					</tr>
					<tr>
						<th>備考欄</th>
						<td><html:textarea property="etc" cols="30" rows="3"></html:textarea><br />
						</td>
					</tr>
				</table>
				<br />
				<input type="reset" name="resetButton" value="reset" />&nbsp;&nbsp;
<input type="submit" name="submitButton" value="submit" />&nbsp;&nbsp;
<input type="button" name="forceSubmitButton" value="server"
					onclick="this.form.submit();" />
				<br />
				<br />
			</html:form>

		</div>

	</div>

	<br />

	<div class="sourceCode">

		<h3>サンプルの説明</h3>

		<div class="contentsBody">

			<div style="text-align: left; padding: 10px;">
				一つの「チェック仕様定義ファイル」を読み込んで、クライアント側（JavaScript）とサーバ側（Java）で入力値の妥当性を検証できます。<br />
				つまり、クライアント側のユーザビリティ向上と同時に、サーバ側のセキュリティ（妥当性検証）も確保されます。<br />
				<br /> このサンプルでは、挙動をわかりやすくするため、サーバ側の入力値妥当性チェックの結果を上部に赤文字で表示しています。<br />
				しかし実際の製造では、サーバ側の入力値妥当性チェックでエラーを検出した場合、エラーの詳細を画面に表示せず、共通のエラー画面に遷移させます。<br />
				<br /> このサンプルの例では、サーバ側の処理で Struts 1.3 を利用しています。<br /> 入力チェック処理は
				ActionForm クラスの validate() メソッド内で実施しています。<br /> （サーバ側の処理は、Struts
				に限らず、Java 標準のサーブレットやその他フレームワークでも実装できます。）<br /> <br /> 外部ライブラリーとして、<a
					href="http://www.mozilla.org/rhino/download.html" target="_blank">Rhino</a>を利用しています。<br />
			</div>

		</div>

	</div>

	<br />

	<div class="sourceCode">

		<h3>ソースコード</h3>

		<br />

		<!--javascript source-->
		<h4>validation_conf.js : チェック仕様定義ファイル</h4>
		<textarea name="code" class="javascript">
// 入力チェック設定
InputValidator.configure = {
	SampleActionForm : {
		name : {
			autofocus : true,
			placeholder : '必須入力',
			required : {
				error : '氏名を入力してください。'
			},
			maxlength : {
				maxlength : 10,
				error : '氏名を10文字以内で入力してください。'
			}
		},
		age : {
			placeholder : '必須入力',
			required : {
				error : '年齢を入力してください。'
			},
			number : {
				error : '年齢は数値で入力してください。'
			},
			min : 0,
			max : 100,
			error : '年齢は0～100の範囲で入力してください。'
		},
		email : {
			placeholder : '必須入力',
			required : {
				error : 'E-Mailアドレスを入力してください。'
			},
			maxlength : {
				maxlength : 50,
				error : 'E-Mailアドレスを50文字以内で入力してください。'
			},
			email : {
				error : 'E-Mailアドレスを正しく入力してください。'
			}
		},
		zipcode : {
			placeholder : '7桁の数字',
			zipcode : {
				error : '郵便番号を7桁の数字で入力してください。'
			}
		},
		address : {
			placeholder : '50文字まで',
			maxlength : {
				maxlength : 50,
				error : '住所を50文字以内で入力してください。'
			}
		},
		sex : {
			required : {
				error : '性別を選択してください。'
			}
		},
		hobby : {
			minchecked : {
				minchecked : 2,
				error : '趣味を2つ以上選択してください。'
			},
			maxchecked : {
				maxchecked : 3,
				error : '趣味は3つ以上選択できません。'
			}
		},
		animal : {
			required : {
				error : '好きな動物を選択してください。'
			}
		},
		etc : {
			placeholder : '必須入力',
			required : {
				error : '備考欄を入力してください。'
			},
			maxlength : {
				maxlength : 100,
				error : '備考欄を100文字以内で入力してください。'
			}
		}
	}
};

//送信・リセット・変更時イベント設定
InputValidator.customEvent = {
	SampleActionForm : {
		onSubmit : function(evt, errorElements) {
			var errorCount = errorElements.length;
			if (errorCount == 0) {
				if (confirm('入力内容を送信します。よろしいですか？')) {
					alert('送信');
					document.getElementById('editFlag1').innerHTML = '未編集';
					return true;
				} else {
					return false;
				}
			} else {
				alert('入力エラーが ' + errorCount + ' 件あります。');
				return false;
			}
		},
		onReset : function(evt) {
			document.getElementById('editFlag1').innerHTML = '未編集';
			return true;
		},
		onChange : function() {
			document.getElementById('editFlag1').innerHTML = '編集中';
		}
	}
};

// 独自のチェックルールを追加
InputValidator.validationRules.zipcode = function(value, rules) {
	var isValid = true;
	var errorMessage = '';
	if (value) {
		if (/^(\d{7})$/.test(value)) {
			isValid = true;
		} else {
			isValid = false;
		}
	} else {
		isValid = true;
	}
	if (!isValid) {
		if (typeof rules == 'object') {
			errorMessage = rules.error;
		}
	}
	return {
		isValid : isValid,
		errorMessage : errorMessage
	};
};
</textarea>

		<!--/javascript source-->

		<br />

		<!--java source-->

		<h4>SampleAction.java</h4>
		<textarea name="code" class="java">
package sample.inputvalidator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;

public class SampleAction extends Action {

	@Override
	public ActionForward execute(ActionMapping mapping, ActionForm form,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		return mapping.findForward("success");
	}

}
</textarea>

		<!--java source-->

		<br />

		<!--java source-->

		<h4>SampleActionForm.java</h4>
		<textarea name="code" class="java">
package sample.inputvalidator;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import jp.co.cosmoroot.inputvalidator.ErrorElement;
import jp.co.cosmoroot.inputvalidator.InputValidatorJava;

import org.apache.struts.action.ActionErrors;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionMessage;
import org.apache.struts.action.ActionMessages;

public class SampleActionForm extends ActionForm {

	private static final long serialVersionUID = 1L;

	/** 名前 */
	private String name;

	/** 年齢 */
	private String age;

	/** E-Mail */
	private String email;

	/** 郵便番号 */
	private String zipcode;

	/** 住所 */
	private String address;

	/** 性別 */
	private String sex;

	/** 趣味 */
	private String[] hobby;

	/** 好きな動物 */
	private String animal;

	/** 備考欄 */
	private String etc;

	@Override
	public ActionErrors validate(ActionMapping mapping,
			HttpServletRequest request) {
		ActionErrors errors = new ActionErrors();
		List list = new InputValidatorJava().validateBean(this,
				"SampleActionForm", "./validation_conf.js", "UTF-8");
		for (int i = 0; i < list.size(); i++) {
			ErrorElement element = (ErrorElement) list.get(i);
			errors.add(ActionMessages.GLOBAL_MESSAGE,
					new ActionMessage(element.getErrorMessage(), false));
		}
		return errors;
	}

	@Override
	public void reset(ActionMapping mapping, HttpServletRequest request) {
		hobby = null;
	}

	/**
	 * 名前を取得します。
	 *
	 * @return 名前
	 */
	public String getName() {
		return name;
	}

	/**
	 * 名前を設定します。
	 *
	 * @param name
	 *            名前
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * 年齢を取得します。
	 *
	 * @return 年齢
	 */
	public String getAge() {
		return age;
	}

	/**
	 * 年齢を設定します。
	 *
	 * @param age
	 *            年齢
	 */
	public void setAge(String age) {
		this.age = age;
	}

	/**
	 * E-Mailを取得します。
	 *
	 * @return E-Mail
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * E-Mailを設定します。
	 *
	 * @param email
	 *            E-Mail
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * 郵便番号を取得します。
	 *
	 * @return 郵便番号
	 */
	public String getZipcode() {
		return zipcode;
	}

	/**
	 * 郵便番号を設定します。
	 *
	 * @param zipcode
	 *            郵便番号
	 */
	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}

	/**
	 * 住所を取得します。
	 *
	 * @return 住所
	 */
	public String getAddress() {
		return address;
	}

	/**
	 * 住所を設定します。
	 *
	 * @param address
	 *            住所
	 */
	public void setAddress(String address) {
		this.address = address;
	}

	/**
	 * 性別を取得します。
	 *
	 * @return 性別
	 */
	public String getSex() {
		return sex;
	}

	/**
	 * 性別を設定します。
	 *
	 * @param sex
	 *            性別
	 */
	public void setSex(String sex) {
		this.sex = sex;
	}

	/**
	 * 趣味を取得します。
	 *
	 * @return 趣味
	 */
	public String[] getHobby() {
		return hobby;
	}

	/**
	 * 趣味を設定します。
	 *
	 * @param hobby
	 *            趣味
	 */
	public void setHobby(String[] hobby) {
		this.hobby = hobby;
	}

	/**
	 * 好きな動物を取得します。
	 *
	 * @return 好きな動物
	 */
	public String getAnimal() {
		return animal;
	}

	/**
	 * 好きな動物を設定します。
	 *
	 * @param animal
	 *            好きな動物
	 */
	public void setAnimal(String animal) {
		this.animal = animal;
	}

	/**
	 * 備考欄を取得します。
	 *
	 * @return 備考欄
	 */
	public String getEtc() {
		return etc;
	}

	/**
	 * 備考欄を設定します。
	 *
	 * @param etc
	 *            備考欄
	 */
	public void setEtc(String etc) {
		this.etc = etc;
	}
}
</textarea>

		<!--java source-->

		<br />

		<!--html source-->

		<h4>sample.jsp</h4>
		<textarea name="code" class="javascript">
&lt;%@ page contentType="text/html; charset=UTF-8"%&gt;
&lt;%@ taglib uri="http://struts.apache.org/tags-html" prefix="html"%&gt;
&lt;%@ taglib uri="http://struts.apache.org/tags-bean" prefix="bean"%&gt;
&lt;%@ taglib uri="http://struts.apache.org/tags-logic" prefix="logic"%&gt;
&lt;!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"&gt;
&lt;html&gt;
&lt;head&gt;
&lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /&gt;
&lt;title&gt;InputValidator3.00 サンプル&lt;/title&gt;
&lt;link type="text/css" rel="stylesheet" href="common.css" /&gt;
&lt;script type="text/javascript" src="inputvalidator.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="inputvalidator-rule.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="validation_conf.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;

&lt;div class="sourceCode"&gt;

&lt;h3&gt;動作サンプル&lt;/h3&gt;

&lt;div class="contentsBody"&gt;

&lt;html:form action="/Sample" method="post"&gt;
&lt;h2&gt;ユーザ登録&nbsp;&nbsp;&nbsp;&nbsp;&lt;span id="editFlag1"&gt;未編集&lt;/span&gt;&lt;/h2&gt;
&lt;div class="summary"&gt;
&lt;html:errors/&gt;
&lt;/div&gt;
&lt;table border="0" cellpadding="0" cellspacing="0" class="table1"&gt;
 &lt;tr&gt;
  &lt;th&gt;氏名&lt;/th&gt;
  &lt;td&gt;&lt;html:text property="name" size="20" maxlength="20" /&gt;&lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;年齢&lt;/th&gt;
  &lt;td&gt;&lt;html:text property="age" size="4" maxlength="3" /&gt;&lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;E-Mail&lt;/th&gt;
  &lt;td&gt;&lt;html:text property="email" size="20" maxlength="50" /&gt;&lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;郵便番号&lt;/th&gt;
  &lt;td&gt;&lt;html:text property="zipcode" size="10" maxlength="7" /&gt;&lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;住所&lt;/th&gt;
  &lt;td&gt;&lt;html:text property="address" size="30" maxlength="50" /&gt;&lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;性別&lt;/th&gt;
  &lt;td&gt;
&lt;html:radio property="sex" value="male"/&gt;男性&nbsp;&nbsp;
&lt;html:radio property="sex" value="female"/&gt;女性&lt;br /&gt;
  &lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;趣味&lt;/th&gt;
  &lt;td&gt;
&lt;html:multibox property="hobby" value="music" /&gt;音楽
&lt;html:multibox property="hobby" value="movie" /&gt;映画
&lt;html:multibox property="hobby" value="dance" /&gt;ダンス
&lt;html:multibox property="hobby" value="cooking" /&gt;料理
&lt;html:multibox property="hobby" value="sports" /&gt;スポーツ
  &lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;好きな動物&lt;/th&gt;
  &lt;td&gt;
&lt;html:select property="animal"&gt;
&lt;html:option value=""&gt;&lt;/html:option&gt;
&lt;html:option value="dog"&gt;犬&lt;/html:option&gt;
&lt;html:option value="cat"&gt;猫&lt;/html:option&gt;
&lt;html:option value="fish"&gt;魚&lt;/html:option&gt;
&lt;/html:select&gt;
  &lt;/td&gt;
 &lt;/tr&gt;
 &lt;tr&gt;
  &lt;th&gt;備考欄&lt;/th&gt;
  &lt;td&gt;
&lt;html:textarea property="etc" cols="30" rows="3"&gt;&lt;/html:textarea&gt;&lt;br /&gt;
  &lt;/td&gt;
 &lt;/tr&gt;
&lt;/table&gt;
&lt;br /&gt;
&lt;input type="reset" name="resetButton" value="reset" /&gt;&nbsp;&nbsp;
&lt;input type="submit" name="submitButton" value="submit" /&gt;&nbsp;&nbsp;
&lt;input type="button" name="forceSubmitButton" value="server" onclick="this.form.submit();" /&gt;&lt;br /&gt;
&lt;br /&gt;
&lt;/html:form&gt;
&lt;/body&gt;
&lt;/html&gt;
</textarea>

		<!--html source-->

		<br />

		<!--xml source-->

		<h4>MessageResources.properties</h4>
		<textarea name="code" class="xml">
errors.header=&lt;ul&gt;
errors.prefix=&lt;li&gt;
errors.suffix=&lt;/li&gt;
errors.footer=&lt;/ul&gt;
</textarea>

		<!--xml source-->

		<br />

		<!--xml source-->

		<h4>struts-config.xml</h4>
		<textarea name="code" class="xml">
&lt;?xml version="1.0" encoding="utf-8"?&gt;
&lt;!DOCTYPE struts-config PUBLIC
          "-//Apache Software Foundation//DTD Struts Configuration 1.3//EN"
          "http://struts.apache.org/dtds/struts-config_1_3.dtd"&gt;
&lt;struts-config&gt;

	&lt;form-beans&gt;
		&lt;form-bean name="SampleActionForm" type="sample.inputvalidator.SampleActionForm" /&gt;
	&lt;/form-beans&gt;

	&lt;global-exceptions&gt;
	&lt;/global-exceptions&gt;

	&lt;action-mappings&gt;
		&lt;action path="/Sample" type="sample.inputvalidator.SampleAction"
			name="SampleActionForm" input="/sample.jsp"&gt;
			&lt;forward name="success" path="/sample.jsp" /&gt;
		&lt;/action&gt;
	&lt;/action-mappings&gt;

	&lt;message-resources parameter="MessageResources" /&gt;

&lt;/struts-config&gt;
</textarea>

		<!--xml source-->

		<br />

		<!--xml source-->

		<h4>web.xml</h4>
		<textarea name="code" class="xml">
&lt;?xml version="1.0" encoding="utf-8"?&gt;
&lt;web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns="http://java.sun.com/xml/ns/javaee" xmlns:web="http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
	xsi:schemaLocation="http://java.sun.com/xml/ns/javaee
http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
	version="2.5"&gt;

	&lt;display-name&gt;InputValidator&lt;/display-name&gt;

	&lt;servlet&gt;
		&lt;servlet-name&gt;action&lt;/servlet-name&gt;
		&lt;servlet-class&gt;org.apache.struts.action.ActionServlet&lt;/servlet-class&gt;
		&lt;init-param&gt;
			&lt;param-name&gt;config&lt;/param-name&gt;
			&lt;param-value&gt;/WEB-INF/struts-config.xml&lt;/param-value&gt;
		&lt;/init-param&gt;
		&lt;load-on-startup&gt;2&lt;/load-on-startup&gt;
	&lt;/servlet&gt;

	&lt;servlet-mapping&gt;
		&lt;servlet-name&gt;action&lt;/servlet-name&gt;
		&lt;url-pattern&gt;*.do&lt;/url-pattern&gt;
	&lt;/servlet-mapping&gt;

	&lt;message-resources parameter="MessageResources" /&gt;

&lt;/web-app&gt;
</textarea>

		<!--xml source-->

		<br />

		<!--xml source-->

		<h4>外部ライブラリー（追加分のみ）</h4>
		<textarea name="code" class="xml">
WEB-INF
　└lib
　　　├inputvalidatorjava-3.0-beta.jar
　　　└js-14.jar
</textarea>

		<!--xml source-->

		<br />

	</div>

	<br />

	<input type="button" value="戻る" onclick="history.back();" />
	<br />

	<br />
</body>
</html>
