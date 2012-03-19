/**
 * inputvalidator.js
 *
 * Version 3.00 beta
 *
 * MIT-style license. Copyright(C) 2012 Daisuke Yamanaka All Rights Reserved.
 * (http://www.bi3d.com)
 */
var InputValidator = {

	// モジュール内共通変数
	idIndex : 0, // 入力要素のID連番
	placeholderIndex : 0, // コメント表示要素のID連番
	errorIndex : 0, // コメント表示要素のID連番
	allElements : [], // 入力チェック対象の全入力要素（配列）
	forms : {}, // 入力チェック対象の全フォーム要素（オブジェクト）
	disabledResize : false, // resize無効フラグ(無限ループ防止用)
	windowWidth : 0, // resizeイベント用画面横幅
	styleSheet : null, // スタイルシート
	currentActiveElement : null, // 現在アクティブな要素
	previousActiveElement : null, // 前回アクティブな要素
	isCheckOnChange : true, // 入力値の変更時の即時チェックフラグ(true:する,false:しない)
	isCheckOnInput : false, // 入力中の即時チェックフラグ(true:する,false:しない)
	position : (navigator.userAgent.indexOf('MSIE 6.0') >= 0) ? 'inner'
			: 'down', // メッセージ表示位置(inner:内部, up:上, down:下)
	css : {
		focusClass : 'inputFocus',
		focusCssText : 'background-color:#dfd;',
		errorClass : 'inputError',
		errorCssText : 'background-color:#fdd;',
		placeholderClass : 'inputPlaceholder',
		placeholderCssText : 'color:#888;padding:1px;white-space:nowrap;font-size:small;padding-left:4px;padding-top:2px;',
		errorMessageClass : 'inputErrorMessage',
		errorMessageCssText : 'color:#000;background-color:#ffe;border:solid 1px #886;padding:2px;white-space:nowrap;font-size:small;',
		readonlyClass : 'inputReadonly',
		readonlyCssText : 'background-color:#eed;'
	},

	UserAgent : {
		MSIE6 : navigator.userAgent.indexOf('MSIE 6.0') >= 0,
		MSIE : navigator.userAgent.indexOf('MSIE') >= 0,
		AppleWebKit : navigator.userAgent.indexOf('AppleWebKit') >= 0
	},

	addEvent : function(element, eventName, func) {
		// InputValidator.console.log('addEvent()');
		if (element.addEventListener) {
			element.addEventListener(eventName, func, false);
		} else {
			element.attachEvent('on' + eventName, func);
		}
		element = null;
	},

	stopEventBubbling : function(evt) {
		// InputValidator.console.log('stopEventBubbling()');
		evt.stopped = true;
		if (evt.preventDefault) {
			evt.preventDefault();
		}
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}
	},

	getEventElement : function(evt) {
		// InputValidator.console.log('getEventElement()');
		var element = evt.srcElement || evt.target;
		if (element.tagName == 'OPTION') {
			// OPTION Node -> SELECT Node for Firefox
			element = element.parentNode;
		}
		return element;
	},

	hasStyleRule : function(selector) {
		// InputValidator.console.log('hasStyleRule()');
		var hasStyleRule = false;
		var styleSheets = document.styleSheets;
		for ( var i = 0, ilen = styleSheets.length; i < ilen; i++) {
			var styleSheet = styleSheets[i];
			var rules = styleSheet.rules || styleSheet.cssRules;
			for ( var j = 0, jlen = rules.length; j < jlen; j++) {
				var rule = rules[j];
				if ((' ' + rule.selectorText.toLowerCase() + ' ').indexOf(' '
						+ selector.toLowerCase() + ' ') >= 0) {
					hasStyleRule = true;
					break;
				}
			}
			if (hasStyleRule) {
				break;
			}
		}
		return hasStyleRule;
	},

	createStyleSheet : function() {
		// InputValidator.console.log('createStyleSheet()');
		var sheet;
		if (InputValidator.UserAgent.MSIE) {
			sheet = document.createStyleSheet();
		} else {
			var headElement = document.getElementsByTagName('HEAD')[0];
			if (!headElement) {
				return;
			}
			var styleElement = document.createElement('STYLE');
			headElement.appendChild(styleElement);
			sheet = styleElement.sheet;
		}
		return sheet;
	},

	addStyleRule : function(selector, declaration) {
		// InputValidator.console.log('addStyleRule()');
		var sheet = InputValidator.styleSheet;
		if (!sheet) {
			sheet = InputValidator.createStyleSheet();
		}
		if (InputValidator.UserAgent.MSIE) {
			sheet.addRule(selector, declaration);
		} else {
			sheet.insertRule(selector + '{' + declaration + '}',
					sheet.cssRules.length);
		}
	},

	// 入力チェック機能を注入する
	setRulesAll : function() {
		InputValidator.console.log('setRulesAll()');

		// disable resize event
		InputValidator.disabledResize = true;

		// InputValidator用のスタイルシートを追加する
		if (!InputValidator.hasStyleRule('.' + InputValidator.css.focusClass)) {
			InputValidator.addStyleRule('.' + InputValidator.css.focusClass,
					InputValidator.css.focusCssText);
		}
		if (!InputValidator.hasStyleRule('.' + InputValidator.css.errorClass)) {
			InputValidator.addStyleRule('.' + InputValidator.css.errorClass,
					InputValidator.css.errorCssText);
		}
		if (!InputValidator.hasStyleRule('.'
				+ InputValidator.css.placeholderClass)) {
			InputValidator.addStyleRule('.'
					+ InputValidator.css.placeholderClass,
					InputValidator.css.placeholderCssText);
		}
		if (!InputValidator.hasStyleRule('.'
				+ InputValidator.css.errorMessageClass)) {
			InputValidator.addStyleRule('.'
					+ InputValidator.css.errorMessageClass,
					InputValidator.css.errorMessageCssText);
		}
		if (!InputValidator
				.hasStyleRule('.' + InputValidator.css.readonlyClass)) {
			InputValidator.addStyleRule('.' + InputValidator.css.readonlyClass,
					InputValidator.css.readonlyCssText);
		}

		// 全フォームの全要素をキャッシュする
		var targetForms = document.forms;
		for ( var i = 0, len = targetForms.length; i < len; i++) {
			var form = targetForms[i];
			var formName = InputValidator._getAttributeValue(form, 'name');
			if (formName) {
				this.forms[formName] = form;
			}
			form.ecache = new InputValidator.ElementCache();
			form.ecache.scan(form);
		}

		// 入力チェック設定を取得する
		var elements = this._getElementsByConfigure();

		// 画面サイズの初期値を保持する（resizeイベント用）
		if (document.documentElement && document.documentElement.clientWidth) {
			InputValidator.windowWidth = document.documentElement.clientWidth;
		} else if (document.body && document.body.clientWidth) {
			InputValidator.windowWidth = document.body.clientWidth;
		} else if (window.innerWidth) {
			InputValidator.windowWidth = window.innerWidth;
		}

		// DOMイベント登録処理
		for ( var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			if (!element.tagName) {
				continue; // 入力要素以外はスキップ
			}
			var rules = element._rules;
			InputValidator.setRules.call(this, element, rules);
		}
		// onLoadイベントを実行する
		if (InputValidator.customEvent) {
			for ( var formName in InputValidator.forms) {
				var formElement = InputValidator.forms[formName];
				var formJson = InputValidator.customEvent[formName];
				if (formElement && formJson && formJson.onLoad) {
					formJson.onLoad.call(formElement);
				}
				if (formJson) {
					for ( var elementName in formJson) {
						var element = formElement.ecache.name[elementName];
						var elementJson = formJson[elementName];
						if (element && elementJson && elementJson.onLoad) {
							elementJson.onLoad.call(element);
						}
					}
				}
			}
			if (InputValidator.customEvent.onLoad) {
				InputValidator.customEvent.onLoad.call(window);
			}
		}

		// enable resize event
		InputValidator.disabledResize = false;
	},

	setRules : function(element, rules) {
		InputValidator.console.log('setRules()');
		// 引数に入力規則が指定された場合、要素に設定する
		if (rules) {
			element._rules = rules;
		}

		// チェック対象除外が指定された場合、除外する
		if (rules && rules.excluded) {
			return;
		}

		// 入力要素に入力チェックフラグのプロパティを追加する
		element._isValid = true;

		// プラグインを実施する
		var pluginRules = InputValidator.pluginRules;
		for ( var pluginRule in pluginRules) {
			if (rules[pluginRule]) {
				pluginRules[pluginRule].call(this, element, rules);
			}
		}

		// InputValidatorオブジェクトに入力チェック対象（要素）を追加する
		this.allElements.push(element);

		// フォームにイベントを追加する
		var form = element.form;
		if (!form._validatorElements) {
			// 全入力要素に対するイベントハンドラ設定
			InputValidator.addEvent(form, 'mousedown',
					function(evt) {
						InputValidator._eventHandlerMouseDown.call(
								InputValidator, evt);
					});
			InputValidator.addEvent(form, 'mouseup', function(evt) {
				InputValidator._eventHandlerClick.call(InputValidator, evt);
			});
			InputValidator.addEvent(form, 'keyup', function(evt) {
				InputValidator._eventHandlerKeyDown.call(InputValidator, evt);
				InputValidator._eventHandlerClick.call(InputValidator, evt);
			});
			// submit,resetイベントを追加する
			InputValidator.addEvent(form, 'submit', InputValidator._submitForm);
			InputValidator.addEvent(form, 'reset', InputValidator._resetForm);
			// form内の入力要素保存用配列
			form._validatorElements = [];
		}
		var formValidatorElements = form._validatorElements;
		formValidatorElements.push(element);

		// ヒントを表示する
		if (rules && rules.placeholder) {
			this._displayPlaceholder(element, this.getElementValue(element),
					false);
		}

		// スタイルを保存する
		element._defaultClassName = element.className;

		// 入力欄のタイプによって、イベントを付与する
		var tagName = element.tagName;
		var type = element.type;
		if (tagName == 'INPUT' && (type == 'checkbox' || type == 'radio')) {
			var groupElements = this._getGroupElements(element);
			for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
				var ge = groupElements[ri];
				if (ge && element !== ge) {
					ge._placeholderElement = element._placeholderElement;
					ge._rules = rules;
					// スタイルを保存する
					ge._defaultClassName = ge.className;
				}
			}
		}
	},

	pluginRule : function(value, rules) {
		var isValid = true;
		var errorMessage = null;
		for ( var ruleKey in rules) {
			var plugin = InputValidator.pluginRules[ruleKey];
			if (plugin) {
				var result = plugin.call(this, value, rules[ruleKey]);
				if (typeof result == 'object') {
					isValid = result.isValid;
					errorMessage = result.errorMessage;
				} else if (typeof result == 'boolean') {
					isValid = result;
				} else {
					alert('[' + ruleKey + ']の戻り値が不正です。\nプログラムを修正してください。');
				}
			} else {
				alert('[' + ruleKey + ']というチェックルールはありません。\n要素名[' + this.name
						+ ']のチェックルールを修正してください。');
			}
			if (!isValid) {
				break;
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},

	_getAttributeValue : function(element, attr) {
		// InputValidator.console.log('_getAttributeValue()');
		if (element && element.attributes
				&& element.attributes.getNamedItem(attr)) {
			return element.attributes.getNamedItem(attr).value;
		} else {
			return '';
		}
	},

	_eventHandlerKeyDown : function(evt) {
		var srcElement = InputValidator.getEventElement(evt);
		InputValidator.console.log('_eventHandlerKeyDown(' + srcElement.tagName
				+ ',' + srcElement.name + ')');
		if (srcElement._srcElement) {
			srcElement = srcElement._srcElement;
			InputValidator.console.log('_eventHandlerKeyDown('
					+ srcElement.tagName + ',' + srcElement.name + ')');
		}
		var value = InputValidator.getElementValue(srcElement);
		if (srcElement._realtimePreviousValue != value) {
			srcElement._realtimePreviousValue = value;
			if (srcElement._rules
					&& srcElement._rules.oninput instanceof Function) {
				srcElement._rules.oninput.call(srcElement, evt);
			}
			if (InputValidator.isCheckOnInput) {
				// Realtime check
				InputValidator.validateElement(srcElement, true);
			}
		}
		InputValidator._eventHandlerMouseDown.call(InputValidator, evt);
	},

	_eventHandlerMouseDown : function(evt) {
		var srcElement = InputValidator.getEventElement(evt);
		InputValidator.console.log('_eventHandlerMouseDown('
				+ srcElement.tagName + ',' + srcElement.name + ')');
		if (srcElement._srcElement) {
			srcElement = srcElement._srcElement;
			InputValidator.console.log('_eventHandlerMouseDown('
					+ srcElement.tagName + ',' + srcElement.name + ')');
			InputValidator.console.log('_eventHandlerMouseDown canceld.');
			InputValidator.stopEventBubbling(evt);
			InputValidator.console
					.log('_eventHandlerMouseDown delegate mousedown.');
			setTimeout(function(srcElement) {
				return function() {
					srcElement.focus();
					InputValidator.fireEvent(srcElement, 'mousedown');
				};
			}(srcElement), 0);
			return;
		}
		if (InputValidator.currentActiveElement !== srcElement) {
			if (InputValidator.currentActiveElement
					&& InputValidator
							._isInputElement(InputValidator.currentActiveElement)) {
				// blurイベント処理
				InputValidator._blurElement.call(
						InputValidator.currentActiveElement, evt);
			}
			InputValidator.currentActiveElement = srcElement;
		}
		if (InputValidator.currentActiveElement !== InputValidator.previousActiveElement) {
			if (InputValidator.currentActiveElement
					&& InputValidator
							._isInputElement(InputValidator.currentActiveElement)) {
				// focusイベント処理
				InputValidator._focusElement.call(
						InputValidator.currentActiveElement, evt);
			}
			InputValidator.previousActiveElement = InputValidator.currentActiveElement;
		}
	},

	_eventHandlerClick : function(evt) {
		var srcElement = InputValidator.getEventElement(evt);
		InputValidator.console.log('_eventHandlerClick(' + srcElement.tagName
				+ ',' + srcElement.name + ')');
		if (srcElement._srcElement) {
			srcElement = srcElement._srcElement;
			InputValidator.console.log('_eventHandlerClick('
					+ srcElement.tagName + ',' + srcElement.name + ')');
		}
		if (InputValidator.currentActiveElement === srcElement) {
			if (InputValidator._isLeftClick(evt) || evt.keyCode === 32
					&& InputValidator._isButtonRadioCheckbox(srcElement)) {
				if (InputValidator.currentActiveElement
						&& InputValidator
								._isInputElement(InputValidator.currentActiveElement)) {
					// clickイベント処理
					InputValidator._clickElement.call(
							InputValidator.currentActiveElement, evt);
				}
			}
			InputValidator.console.log('-- click --');
			InputValidator.currentActiveElement = srcElement;
		} else {
			InputValidator.console.log('-- not click --');
		}
	},

	_isLeftClick : function(evt) {
		// InputValidator.console.log('_isLeftClick()');
		if (InputValidator.UserAgent.MSIE) {
			return event.button === 1;
		} else if (InputValidator.UserAgent.AppleWebKit) {
			return evt.which === 1 && !evt.metaKey;
		} else {
			return evt.which ? (evt.which === 1) : (evt.button === 0);
		}
	},

	_isButtonRadioCheckbox : function(element) {
		// InputValidator.console.log('_isButtonRadioCheckbox()');
		if ((element.tagName == 'INPUT' && (element.type == 'button'
				|| element.type == 'radio' || element.type == 'checkbox'))
				|| element.tagName == 'BUTTON') {
			return true;
		} else {
			return false;
		}
	},

	_isInputElement : function(element) {
		// InputValidator.console.log('_isInputElement()');
		if ((element.tagName == 'INPUT' && element.type != 'hidden')
				|| element.tagName == 'BUTTON' || element.tagName == 'SELECT'
				|| element.tagName == 'TEXTAREA') {
			return true;
		} else {
			return false;
		}
	},

	resize : function() {
		InputValidator.console.log('resize()');

		// cancel resize loop
		if (InputValidator.disabledResize) {
			InputValidator.console.log('resize cancel.');
			return;
		}

		InputValidator.disabledResize = true;
		try {
			// IEでは、要素のスタイルを変更しただけで、window.resize()が発動する。
			// このため、ブラウザの横幅が変わったときだけ、redraw()を実施する。
			var windowWidth = 0;
			if (document.documentElement
					&& document.documentElement.clientWidth) {
				windowWidth = document.documentElement.clientWidth;
			} else if (document.body && document.body.clientWidth) {
				windowWidth = document.body.clientWidth;
			} else if (window.innerWidth) {
				windowWidth = window.innerWidth;
			}
			if (InputValidator.windowWidth != windowWidth) {
				InputValidator.windowWidth = windowWidth;
				InputValidator.redraw();
			}
		} finally {
			InputValidator.disabledResize = false;
		}
	},

	redraw : function() {
		InputValidator.console.log('redraw()');
		var allElements = InputValidator.allElements;
		for ( var i = 0, len = allElements.length; i < len; i++) {
			var srcElement = allElements[i];
			if (srcElement !== InputValidator.currentActiveElement) {
				if (srcElement._isValid) {
					InputValidator._displayPlaceholder(srcElement,
							InputValidator.getElementValue(srcElement), true);
				} else {
					InputValidator._displayError(srcElement);
				}
			}
		}
	},

	check : function(formElement) {
		InputValidator.console.log('check()');
		if (!formElement) {
			alert('check()の引数に、フォーム要素が指定されていません。');
			return false;
		}
		var formName = InputValidator._getAttributeValue(formElement, 'name');
		var isValid = true;
		var validatorElements = formElement._validatorElements;
		var errorElementList = [];
		var checkValid = function(element) {
			InputValidator.validateElement(element, false);
			if (!element._isValid) {
				errorElementList.push(element); // 入力エラー要素を保存する
				if (isValid) {
					isValid = false;
				}
			}
		};
		for ( var i = 0, len = validatorElements.length; i < len; i++) {
			var srcElement = validatorElements[i];
			if (srcElement._rules && srcElement._rules.group) {
				var groupElements = InputValidator
						._getGroupElements(srcElement);
				for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
					var ge = groupElements[ri];
					checkValid(ge);
					if (!ge._isValid) {
						break;
					}
				}
			} else {
				checkValid(srcElement);
			}
		}
		if (formElement._rules
				&& formElement._rules.onCheck instanceof Function) {
			formElement._rules.onCheck(errorElementList);
		} else if (InputValidator.customEvent
				&& InputValidator.customEvent[formName]
				&& InputValidator.customEvent[formName].onCheck instanceof Function) {
			InputValidator.customEvent[formName].onCheck(errorElementList);
		} else if (InputValidator.customEvent
				&& InputValidator.customEvent.onCheck instanceof Function) {
			InputValidator.customEvent.onCheck(errorElementList);
		}
		return isValid;
	},

	_submitForm : function(evt) {
		InputValidator.console.log('_submitForm()');
		var formElement = InputValidator.getEventElement(evt);
		var isValid = true;
		var errorMessage = null;
		var focusElement = null;
		var validatorElements = formElement._validatorElements;
		var errorElementList = [];
		var checkValid = function(element) {
			InputValidator.validateElement(element, false);
			if (!element._isValid) {
				errorElementList.push(element); // 入力エラー要素を保存する
				if (isValid) {
					// 一番最初の入力エラー情報を保存する
					isValid = false;
					focusElement = element;
					if (element._error) {
						errorMessage = element._error;
					}
				}
			}
		};
		for ( var i = 0, len = validatorElements.length; i < len; i++) {
			var srcElement = validatorElements[i];
			if (srcElement._rules && srcElement._rules.group) {
				var groupElements = InputValidator
						._getGroupElements(srcElement);
				for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
					var ge = groupElements[ri];
					checkValid(ge);
					if (!ge._isValid) {
						break;
					}
				}
			} else {
				checkValid(srcElement);
			}
		}
		var onSubmitResult = false;
		try {
			if (InputValidator.customEvent) {
				var cv = InputValidator.customEvent;
				var fn = InputValidator._getAttributeValue(formElement, 'name');
				if (cv[fn] && cv[fn].onSubmit instanceof Function) {
					onSubmitResult = cv[fn].onSubmit.call(formElement, evt,
							errorElementList);
				} else if (cv.onSubmit instanceof Function) {
					onSubmitResult = cv.onSubmit.call(formElement, evt,
							errorElementList);
				}
			}
		} catch (e) {
			onSubmitResult = false;
			alert(e.description);
		}
		if (!isValid || !onSubmitResult) {
			InputValidator.stopEventBubbling(evt); // submitしない
			return false;
		}
		return isValid;
	},

	_resetForm : function(evt) {
		InputValidator.console.log('_resetForm()');
		// form要素にreset時のコールバック関数が設定されている場合、コールする
		var isReset = true;
		var formElement = InputValidator.getEventElement(evt);
		var formName = InputValidator._getAttributeValue(formElement, 'name');
		if (InputValidator.customEvent
				&& InputValidator.customEvent[formName]
				&& InputValidator.customEvent[formName].onReset instanceof Function) {
			isReset = InputValidator.customEvent[formName].onReset.call(
					formElement, evt);
		} else if (InputValidator.customEvent
				&& InputValidator.customEvent.onReset instanceof Function) {
			isReset = InputValidator.customEvent.onReset.call(formElement, evt);
		}
		if (!isReset) {
			InputValidator.stopEventBubbling(evt); // resetしない
			return isReset;
		}
		// 全ての入力欄のエラーをクリア（必要に応じてヒントを表示）
		var validatorElements = formElement._validatorElements;
		for ( var i = 0, len = validatorElements.length; i < len; i++) {
			var srcElement = validatorElements[i];
			srcElement._isValid = true;
			srcElement._error = '';
			srcElement.className = srcElement._defaultClassName;
			InputValidator.setDefaultValue(srcElement);
			InputValidator._hideError(srcElement);
			InputValidator._displayPlaceholder(srcElement, InputValidator
					.getElementDefaultValue(srcElement), false);
		}
	},

	_changeValue : function(srcElement) {
		InputValidator.console.log('_changeValue()');
		// 入力欄の値編集時のコールバック関数が設定されている場合、コールする
		var formElement = srcElement.form;
		var formName = InputValidator._getAttributeValue(formElement, 'name');
		if (formElement) {
			if (InputValidator.customEvent
					&& InputValidator.customEvent[formName]
					&& InputValidator.customEvent[formName].onChange instanceof Function) {
				InputValidator.customEvent[formName].onChange.call(srcElement);
			} else if (InputValidator.customEvent
					&& InputValidator.customEvent.onChange instanceof Function) {
				InputValidator.customEvent.onChange.call(srcElement);
			}
		}
	},

	_setPreviousValue : function(srcElement) {
		// InputValidator.console.log('_setPreviousValue()');
		// 変更前の入力値を保存
		srcElement._previousValue = InputValidator.getElementValue(srcElement);
	},

	_checkChangeValue : function(srcElement) {
		InputValidator.console.log('_checkChangeValue()');
		var value = InputValidator.getElementValue(srcElement);
		var tag = srcElement.tagName;
		if (tag == 'INPUT') {
			var type = srcElement.type;
			if (type == 'checkbox' || type == 'radio') {
				if (value != srcElement._previousValue) {
					InputValidator._changeValue(srcElement);
				}
			} else {
				// type=text,password,...
				if (srcElement._previousValue) {
					if (srcElement.value != srcElement._previousValue) {
						InputValidator._changeValue(srcElement);
					}
				} else {
					if (value) {
						InputValidator._changeValue(srcElement);
					}
				}
			}
		} else if (tag == 'TEXTAREA' || tag == 'SELECT') {
			if (srcElement._previousValue) {
				if (value != srcElement._previousValue) {
					InputValidator._changeValue(srcElement);
				}
			} else {
				if (value) {
					InputValidator._changeValue(srcElement);
				}
			}
		}
	},

	_keypressElement : function(evt) {
		InputValidator.console.log('_keypressElement()');
		var kcode = evt.keyCode;
		if (kcode == Event.KEY_RETURN) {
			InputValidator.stopEventBubbling(evt);
		}
	},

	_focusElement : function(evt) {
		InputValidator.console.log('_focusElement()');
		var srcElement = this;
		if (srcElement.readOnly || srcElement.disabled) {
			return true;
		}
		var tagName = srcElement.tagName;
		var type = srcElement.type;
		if ((tagName == 'INPUT' && type != 'radio' && type != 'checkbox'
				&& type != 'button' && type != 'reset' && type != 'submit')
				|| tagName == 'TEXTAREA' || tagName == 'SELECT') {
			if (InputValidator.css.focusClass) {
				srcElement.className = InputValidator.css.focusClass;
			}
		}
		var ge = InputValidator._getGroupElements(srcElement);
		for ( var i = 0, len = ge.length; i < len; i++) {
			var e = ge[i];
			InputValidator._hidePlaceholder(e);
			InputValidator._hideError(e);
		}
		// 変更前の入力値を保存
		InputValidator._setPreviousValue(srcElement);
	},

	_blurElement : function(evt) {
		InputValidator.console.log('_blurElement()');
		var srcElement = this;
		if (srcElement.readOnly) {
			return true;
		}
		srcElement.className = srcElement._defaultClassName;

		// 入力値をフォーマット（補正）する
		var rules = srcElement._rules;
		var formatterRules = InputValidator.formatterRules;
		if (rules && formatterRules) {
			for ( var formatterRule in formatterRules) {
				if (rules[formatterRule]) {
					formatterRules[formatterRule].call(this, srcElement, rules);
				}
			}
		}

		// 変更前の入力値と比較し、異なっていたら、_changeValueメソッドを呼ぶ
		InputValidator._checkChangeValue(srcElement);

		if (InputValidator.isCheckOnChange) {
			// 即時チェックする場合、入力値をチェックする
			InputValidator.validateElement(srcElement, false);
		} else {
			// ヒントを表示する
			InputValidator._displayPlaceholder(srcElement, InputValidator
					.getElementValue(srcElement), false);
		}
	},

	_clickElement : function(evt) {
		InputValidator.console.log('_clickElement()');
		var srcElement = this;
		if (srcElement.readOnly) {
			return true;
		}
		if (srcElement.tagName == 'INPUT') {
			if (srcElement.type == 'radio') {
				if (srcElement._rules && srcElement._rules.group) {
					var groupElements = InputValidator
							._getGroupElements(srcElement);
					for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
						var ge = groupElements[ri];
						if (srcElement !== ge && ge.checked) {
							ge.checked = false;
							ge._checked = false;
						}
						ge.className = ge._defaultClassName;
					}
				} else {
					srcElement.className = srcElement._defaultClassName;
				}
				InputValidator._changeValue(srcElement);
			} else if (srcElement.type == 'checkbox') {
				srcElement.className = srcElement._defaultClassName;
				InputValidator._changeValue(srcElement);
			}
		}
		return true;
	},

	formatDateElement : function(srcElement, rules) {
		InputValidator.console.log('formatDateElement()');
		var value = InputValidator.getElementValue(srcElement);
		if (!value) {
			return;
		}
		if (rules.date && rules.date.format) {
			// 日付の年月日を抽出する
			var fullYear = new String((new Date()).getFullYear());
			var year = 0;
			var month = 0;
			var day = 0;
			if (/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.test(value)) {
				year = parseInt(RegExp.$1, 10);
				month = parseInt(RegExp.$2, 10);
				day = parseInt(RegExp.$3, 10);
			} else if (/^(\d{1,3})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.test(value)) {
				year = parseInt((fullYear.substring(0, 1) + "000").substring(0,
						4 - RegExp.$1.length), 10);
				month = parseInt(RegExp.$2, 10);
				day = parseInt(RegExp.$3, 10);
			} else if (/^(\d{4})(\d{2})(\d{1,2})$/.test(value)) {
				year = parseInt(RegExp.$1, 10);
				month = parseInt(RegExp.$2, 10);
				day = parseInt(RegExp.$3, 10);
			} else if (/^(\d{2})(\d{2})(\d{1,2})$/.test(value)) {
				year = parseInt(fullYear.substring(0, 2) + RegExp.$1, 10);
				month = parseInt(RegExp.$2, 10);
				day = parseInt(RegExp.$3, 10);
			} else if (/^(\d{1})(\d{2})$/.exec(value)) {
				year = parseInt(fullYear, 10);
				month = parseInt(RegExp.$1, 10);
				day = parseInt(RegExp.$2, 10);
			} else if (/^(\d{1,2})[\/\-]?(\d{1,2})$/.exec(value)) {
				year = parseInt(fullYear, 10);
				month = parseInt(RegExp.$1, 10);
				day = parseInt(RegExp.$2, 10);
			}
			// 日付の年月日が正しい場合のみ、フォーマットする
			var checkDate = new Date(year, month - 1, day);
			if (!isNaN(checkDate) && year == checkDate.getFullYear()
					&& month == (checkDate.getMonth() + 1)
					&& day == checkDate.getDate()) {
				// 正しい日付なので、フォーマットする
				srcElement.value = InputValidator.formatDate(checkDate,
						rules.date.format);
			}
		}
	},

	formatDate : function(date, format) {
		InputValidator.console.log('formatDate()');
		var getLpadZero = function(value, keta) {
			var intValue = parseInt(value, 10);
			var newValue = '000' + intValue;
			newValue = newValue.slice(newValue.length - keta);
			return newValue;
		};
		var parseFormat = format.toLowerCase();
		var result = parseFormat;
		if (parseFormat.indexOf('yyyy') >= 0) {
			result = result.replace(/yyyy/, date.getFullYear());
		} else if (parseFormat.indexOf('yy') >= 0) {
			result = result.replace(/yy/, getLpadZero(date.getFullYear() % 100,
					2));
		}
		if (parseFormat.indexOf('mm') >= 0) {
			result = result.replace(/mm/, getLpadZero(date.getMonth() + 1, 2));
		} else if (parseFormat.indexOf('m') >= 0) {
			result = result.replace(/m/, date.getMonth() + 1);
		}
		if (parseFormat.indexOf('dd') >= 0) {
			result = result.replace(/dd/, getLpadZero(date.getDate(), 2));
		} else if (parseFormat.indexOf('d') >= 0) {
			result = result.replace(/d/, date.getDate());
		}
		return result;
	},

	validateElement : function(srcElement, isOnInput) {
		InputValidator.console.log('validateElement()');
		var rules = srcElement._rules;
		if (!rules) {
			return;
		}
		var value = InputValidator.getValidateElementValue(srcElement);

		var result = InputValidator.validateRule.call(srcElement, value, rules);

		var errorMessage = result.errorMessage;
		var isValid = result.isValid;
		srcElement._error = errorMessage;
		srcElement._isValid = isValid;
		if (isValid) {
			// OK
			if (value) {
				// 入力エラーとヒントを消す
				InputValidator._hidePlaceholder(srcElement);
				InputValidator._hideError(srcElement);
				// oninputイベントの場合、セルのスタイルを直す
				if (isOnInput) {
					if (InputValidator.css.focusClass) {
						srcElement.className = InputValidator.css.focusClass;
					}
				}
			} else {
				if (!isOnInput) {
					// onblurイベントならヒントを表示する
					var displayPlaceholder = function(srcElement) {
						InputValidator._displayPlaceholder(srcElement,
								InputValidator.getElementValue(srcElement),
								false);
					};
					if (rules.group) {
						var ge = InputValidator._getGroupElements(srcElement);
						for ( var i = 0, len = ge.length; i < len; i++) {
							displayPlaceholder(ge[i]);
						}
					} else {
						displayPlaceholder(srcElement);
					}
				}
			}
		} else {
			// NG
			var tagName = srcElement.tagName;
			var type = srcElement.type;
			if ((tagName == 'INPUT' && type != 'radio' && type != 'checkbox'
					&& type != 'button' && type != 'reset' && type != 'submit')
					|| tagName == 'TEXTAREA' || tagName == 'SELECT') {
				if (InputValidator.css.errorClass) {
					srcElement.className = InputValidator.css.errorClass;
				}
			}
			if (!errorMessage) {
				errorMessage = '無効な値です';
			}
			if (errorMessage) {
				// 入力チェック結果のエラーメッセージを入力要素のプロパティに保存
				srcElement._error = errorMessage;
				// まず表示済みの入力エラーを消す（グループの他の要素のエラーを消すため）
				InputValidator._hideError(srcElement);
				// 入力エラー表示
				InputValidator._displayError(srcElement);
			}
		}
	},

	_getElementsByConfigure : function() {
		InputValidator.console.log('_getElementsByConfigure()');
		// InputValidator.configureの入力チェック設定を読み込む
		var elements, element, formElement, objList, objName, obj, formList, formName;
		formName = undefined;
		objList = undefined;
		objName = undefined;
		obj = undefined;
		elements = [];
		formList = InputValidator.configure;
		if (formList) {
			for (formName in formList) {
				formElement = InputValidator.forms[formName];
				if (!formElement) {
					try {
						formElement = this.forms[formName];
					} catch (e) {
					}
				}
				if (formElement && formElement.tagName == 'FORM') {
					try {
						objList = formList[formName];
					} catch (e) {
					}
					formElement._rules = {};
				} else {
					formName = null;
					objList = formList;
				}
				for (objName in objList) {
					try {
						obj = objList[objName];
					} catch (e) {
					}
					if (typeof (obj) == 'object') {
						element = null;
						try {
							element = this.forms[formName].ecache.name[objName];
						} catch (e) {
						}
						if (!element) {
							try {
								for ( var form in this.forms) {
									element = this.forms[form].ecache.name[objName];
									break;
								}
							} catch (e) {
							}
						}
						if (!element) {
							element = document.getElementById(objName);
						}
						if (element) {
							if (element.length > 1 && !element.tagName) { // FORM中に同じ名前の要素が複数存在する場合
								element[0]._elements = element;
								element[0]._rules = obj;
								elements.push(element[0]);

							} else { // FORM中でユニークな名前の要素が１つ存在する場合
								element._rules = obj;
								elements.push(element);
							}
						} else {
							alert('要素名[' + objName + ']は存在しません。\n設定を修正してください。');
						}
					}
				}
				if (!formName) {
					break;
				}
			}
		}
		return elements;
	},

	_displayPlaceholder : function(srcElement, value, isRedraw) {
		InputValidator.console.log('_displayPlaceholder()');
		if (!srcElement._placeholderDisplay) {
			srcElement._placeholderDisplay = true;
			var type = srcElement.type;
			var tagName = srcElement.tagName;
			if (tagName == 'BUTTON'
					|| (tagName == 'INPUT' && (type == 'hidden'
							|| type == 'submit' || type == 'reset' || type == 'button'))) {
				return;
			}
			if (srcElement._rules && srcElement._rules.placeholderfor) {
				var placeholderElement = srcElement._placeholderElement;
				if (!placeholderElement) {
					placeholderElement = document
							.getElementById(srcElement._rules.placeholderfor);
					if (placeholderElement) {
						srcElement._placeholderElement = placeholderElement;
						placeholderElement._srcElement = srcElement;
					}
				}
				if (placeholderElement) {
					placeholderElement.innerHTML = srcElement._rules.placeholder;
					var placeholderStyle = placeholderElement.style;
					if (InputValidator.css.placeholderClass) {
						placeholderElement.className = InputValidator.css.placeholderClass;
					}
					if (!value
							&& srcElement._rules
							&& srcElement._rules.placeholder
							&& (!isRedraw || srcElement !== this.currentActiveElement)) {
						placeholderStyle.display = '';
					} else {
						placeholderStyle.display = 'none';
					}
				}
			} else {
				var placeholderElement = srcElement._placeholderElement;
				if (!placeholderElement) {
					placeholderElement = InputValidator
							._appendPlaceholderElement(srcElement);
				}
				if (placeholderElement) {
					InputValidator._adjustLocationPlaceholder(srcElement);
					var placeholderStyle = placeholderElement.style;
					if (!value
							&& srcElement._rules
							&& srcElement._rules.placeholder
							&& (!isRedraw || srcElement !== this.currentActiveElement)) {
						var textElement = placeholderElement._textElement;
						var textStyle = textElement.style;
						textElement.innerHTML = srcElement._rules.placeholder;
						placeholderStyle.display = '';
					} else {
						placeholderStyle.display = 'none';
					}
				}
			}
		}
	},

	_hidePlaceholder : function(srcElement) {
		InputValidator.console.log('_hidePlaceholder()');
		if (srcElement._placeholderDisplay) {
			srcElement._placeholderDisplay = false;
			var hide = function(srcElement) {
				if (srcElement._rules && srcElement._rules.placeholderfor) {
					var displayPlaceholderElement = document
							.getElementById(srcElement._rules.placeholderfor);
					if (displayPlaceholderElement) {
						displayPlaceholderElement.style.display = 'none';
					}
				} else {
					var placeholderElement = srcElement._placeholderElement;
					if (placeholderElement) {
						placeholderElement.style.display = 'none';
					}
				}
			}
			var ge = InputValidator._getGroupElements(srcElement);
			for ( var i = 0, len = ge.length; i < len; i++) {
				hide(ge[i]);
			}
		}
	},

	_appendPlaceholderElement : function(srcElement) {
		InputValidator.console.log('_appendPlaceholderElement()');
		var srcElementId = srcElement.id;
		if (!srcElementId) {
			srcElementId = '_srcId_' + InputValidator.idIndex++;
			srcElement.id = srcElementId;
		}
		var placeholderElement = InputValidator
				._createPlaceholderElement(srcElement);

		// 表示メッセージ要素を追加
		var textElement = InputValidator._createPlaceholderTextElement(
				srcElement, placeholderElement);
		if (srcElement._rules.placeholder) {
			textElement.innerHTML = srcElement._rules.placeholder;
		}

		return placeholderElement;
	},

	_createPlaceholderElement : function(srcElement) {
		InputValidator.console.log('_createPlaceholderElement()');
		var placeholderElement = document.createElement('div');
		var placeholderId = '_placeholderId_'
				+ InputValidator.placeholderIndex++;
		placeholderElement.id = placeholderId;
		if (InputValidator.css.placeholderClass) {
			placeholderElement.className = InputValidator.css.placeholderClass;
		}
		var placeholderStyle = placeholderElement.style;
		placeholderStyle.display = '';
		placeholderStyle.zIndex = srcElement.style.zIndex + 1;
		placeholderStyle.position = 'absolute';
		placeholderStyle.cursor = 'text';
		srcElement.parentNode.appendChild(placeholderElement);
		srcElement._placeholderElement = placeholderElement;
		placeholderElement._srcElement = srcElement;
		return placeholderElement;
	},

	_createPlaceholderTextElement : function(srcElement, placeholderElement) {
		InputValidator.console.log('_createPlaceholderTextElement()');
		var textElement = document.createElement('div');
		placeholderElement.appendChild(textElement);
		placeholderElement._textElement = textElement;
		textElement._srcElement = srcElement;
		return textElement;
	},

	_adjustLocationPlaceholder : function(srcElement) {
		InputValidator.console.log('_adjustLocationPlaceholder()');
		var placeholderElement = srcElement._placeholderElement;
		var srcElementOffset = InputValidator._getOffset(srcElement);
		var srcElementSize = InputValidator._getSize(srcElement);
		var placeholderElementLeft = srcElementOffset.left;
		var placeholderElementTop = srcElementOffset.top;
		var placeholderElementSize = InputValidator
				._getSize(placeholderElement);
		var isIE6 = (navigator.userAgent.indexOf("MSIE 6") >= 0);
		if (isIE6 && srcElement.tagName == 'SELECT') {
			// IEではselect要素の上にdiv要素を表示できないため、入力欄の右側へ表示する
			placeholderElementLeft += srcElementSize.width;
		} else {
			placeholderElementLeft += 2;
			placeholderElementTop += 2;
		}
		placeholderElement.style.left = placeholderElementLeft + 'px';
		placeholderElement.style.top = placeholderElementTop + 'px';
	},

	_displayError : function(srcElement) {
		InputValidator.console.log('_displayError()');
		if (!srcElement._errorDisplay) {
			var ge = InputValidator._getGroupElements(srcElement);
			for ( var i = 0, len = ge.length; i < len; i++) {
				ge[i]._errorDisplay = true;
			}
			var type = srcElement.type;
			var tagName = srcElement.tagName;
			if (tagName == 'BUTTON'
					|| (tagName == 'INPUT' && (type == 'hidden'
							|| type == 'submit' || type == 'reset' || type == 'button'))) {
				return;
			}
			if (srcElement._rules && srcElement._rules.errorfor) {
				var errorElement = srcElement._errorElement;
				if (!errorElement) {
					errorElement = document
							.getElementById(srcElement._rules.errorfor);
					if (errorElement) {
						srcElement._errorElement = errorElement;
						errorElement._srcElement = srcElement;
					}
				}
				if (errorElement) {
					errorElement.innerHTML = srcElement._error;
					var errorStyle = errorElement.style;
					if (InputValidator.css.errorMessageClass) {
						errorElement.className = InputValidator.css.errorMessageClass;
					}
					errorStyle.display = '';
				}
			} else {
				var errorElement = srcElement._errorElement;
				if (!errorElement) {
					errorElement = InputValidator
							._appendErrorElement(srcElement);
				}
				if (errorElement) {
					InputValidator._adjustLocationError(srcElement);
					var errorStyle = errorElement.style;
					var textElement = errorElement._textElement;
					var textStyle = textElement.style;
					if (errorElement._triangleElement) {
						errorElement._triangleElement.style.display = '';
					}
					textElement.innerHTML = srcElement._error;
					errorStyle.display = '';
				}
			}
		}
	},

	_hideError : function(srcElement) {
		InputValidator.console.log('_hideError()');
		if (srcElement._errorDisplay) {
			var hide = function(srcElement) {
				srcElement._errorDisplay = false;
				if (srcElement._rules && srcElement._rules.errorfor) {
					var displayErrorElement = document
							.getElementById(srcElement._rules.errorfor);
					if (displayErrorElement) {
						displayErrorElement.style.display = 'none';
					}
				} else {
					var errorElement = srcElement._errorElement;
					if (errorElement) {
						errorElement.style.display = 'none';
					}
				}
			}
			var ge = InputValidator._getGroupElements(srcElement);
			for ( var i = 0, len = ge.length; i < len; i++) {
				hide(ge[i]);
			}
		}
	},

	_appendErrorElement : function(srcElement) {
		InputValidator.console.log('_appendErrorElement()');
		var srcElementId = srcElement.id;
		if (!srcElementId) {
			srcElementId = '_srcId_' + InputValidator.idIndex++;
			srcElement.id = srcElementId;
		}
		var errorElement = InputValidator._createErrorElement(srcElement);

		// 吹き出しの三角をCSSで追加
		if (InputValidator.position == 'down') {
			InputValidator._createDownTriangleElement(errorElement);
		}

		// 表示メッセージ要素を追加
		var textElement = InputValidator._createErrorTextElement(srcElement,
				errorElement);
		if (srcElement._error) {
			textElement.innerHTML = srcElement._error;
		}

		// 吹き出しの三角をCSSで追加
		if (InputValidator.position == 'up') {
			InputValidator._createUpTriangleElement(errorElement);
		}

		return errorElement;
	},

	_createErrorElement : function(srcElement) {
		InputValidator.console.log('_createErrorElement()');
		var errorElement = document.createElement('div');
		var errorId = '_errorId_' + InputValidator.errorIndex++;
		errorElement.id = errorId;
		if (InputValidator.css.errorMessageClass) {
			errorElement.className = InputValidator.css.errorMessageClass;
		}
		var errorStyle = errorElement.style;
		errorStyle.display = '';
		errorStyle.zIndex = srcElement.style.zIndex + 2;
		errorStyle.position = 'absolute';
		errorStyle.cursor = 'default';
		srcElement.parentNode.appendChild(errorElement);
		srcElement._errorElement = errorElement;
		errorElement._srcElement = srcElement;
		return errorElement;
	},

	_createDownTriangleElement : function(errorElement) {
		InputValidator.console.log('_createDownTriangleElement()');
		var triangleElement = document.createElement('div');

		var taLeft = document.createElement('div');
		var taLeftStyle = taLeft.style;
		taLeftStyle.position = 'absolute';
		taLeftStyle.borderRight = '4px solid #888866';
		taLeftStyle.borderTop = '10px solid transparent';
		triangleElement.appendChild(taLeft);

		var taRight = document.createElement('div');
		var taRightStyle = taRight.style;
		taRightStyle.position = 'absolute';
		taRightStyle.borderLeft = '4px solid #888866';
		taRightStyle.borderTop = '10px solid transparent';
		taRightStyle.left = '4px';
		triangleElement.appendChild(taRight);

		var triangleStyle = triangleElement.style;
		triangleStyle.position = 'absolute';
		triangleStyle.top = '-10px';
		triangleStyle.display = 'none';
		errorElement.appendChild(triangleElement);
		errorElement._triangleElement = triangleElement;
		return triangleElement;
	},

	_createUpTriangleElement : function(errorElement) {
		InputValidator.console.log('_createUpTriangleElement()');
		var triangleElement = document.createElement('div');

		var taLeft = document.createElement('div');
		var taLeftStyle = taLeft.style;
		taLeftStyle.position = 'absolute';
		taLeftStyle.borderRight = '4px solid #888866';
		taLeftStyle.borderBottom = '10px solid transparent';
		triangleElement.appendChild(taLeft);

		var taRight = document.createElement('div');
		var taRightStyle = taRight.style;
		taRightStyle.position = 'absolute';
		taRightStyle.borderLeft = '4px solid #888866';
		taRightStyle.borderBottom = '10px solid transparent';
		taRightStyle.left = '4px';
		triangleElement.appendChild(taRight);

		var triangleStyle = triangleElement.style;
		triangleStyle.position = 'absolute';
		triangleStyle.bottom = '-1px';
		triangleStyle.display = 'none';
		errorElement.appendChild(triangleElement);
		errorElement._triangleElement = triangleElement;
		return triangleElement;
	},

	_createErrorTextElement : function(srcElement, errorElement) {
		InputValidator.console.log('_createErrorTextElement()');
		var textElement = document.createElement('div');
		errorElement.appendChild(textElement);
		errorElement._textElement = textElement;
		textElement._srcElement = srcElement;
		return textElement;
	},

	_adjustLocationError : function(srcElement) {
		InputValidator.console.log('_adjustLocationError()');
		var errorElement = srcElement._errorElement;
		var srcElementOffset = InputValidator._getOffset(srcElement);
		var srcElementSize = InputValidator._getSize(srcElement);
		var errorElementLeft = srcElementOffset.left;
		var errorElementTop = srcElementOffset.top;
		var errorElementSize = InputValidator._getSize(errorElement);
		if (InputValidator.position == 'inner') {
			var isIE6 = (navigator.userAgent.indexOf("MSIE 6") >= 0);
			if (isIE6 && srcElement.tagName == 'SELECT') {
				// IEではselect要素の上にdiv要素を表示できないため、入力欄の右側へ表示する
				errorElementLeft += srcElementSize.width;
			} else {
				errorElementLeft += 2;
				errorElementTop += 2;
			}
		} else if (InputValidator.position == 'up') {
			errorElementTop -= (errorElementSize.height + 0);
		} else if (InputValidator.position == 'down') {
			errorElementTop += (srcElementSize.height + 2);
		}
		errorElement.style.left = errorElementLeft + 'px';
		errorElement.style.top = errorElementTop + 'px';

	},

	fireEvent : function(element, eventName) {
		InputValidator.console.log('fireEvent()');
		if (element.fireEvent) {
			var evt = document.createEventObject();
			element.fireEvent('on' + eventName, evt);
		} else if (document.createEvent) {
			var evt = document.createEvent('MouseEvent');
			evt.initEvent(eventName, true, true);
			element.dispatchEvent(evt);
		} else {
			alert('not support.');
		}
	},

	_getOffset : function(element) {
		// InputValidator.console.log('_getOffset()');
		var top = 0;
		var left = 0;
		while (element) {
			top += element.offsetTop || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent;
			if (element) {
				if (element.tagName == 'BODY') {
					break;
				}
				var p = element.style.position;
				if (p === 'absolute') {
					break;
				}
			}
		}
		return {
			left : left,
			top : top
		};
	},

	_getSize : function(element) {
		// InputValidator.console.log('_getSize()');
		var width = element.offsetWidth;
		var height = element.offsetHeight;
		return {
			width : width,
			height : height
		};
	},

	_getGroupElements : function(srcElement) {
		// InputValidator.console.log('_getGroupElements()');
		var formName = InputValidator._getAttributeValue(srcElement.form,
				'name');
		var eName = InputValidator._getAttributeValue(srcElement, 'name');
		if (eName) {
			if (srcElement._rules && srcElement._rules.group) {
				var groupList = srcElement._rules.group;
				var searchElements = [];
				for ( var ci = 0, cilen = groupList.length; ci < cilen; ci++) {
					var ge = InputValidator.forms[formName].ecache.name[groupList[ci]];
					if (!ge) {
						alert('フォーム名[' + formName + ']の要素名[' + eName
								+ ']のgroup[' + groupList[ci] + ']は存在しません。');
					}
					searchElements.push(ge);
				}
				return searchElements;
			} else {
				var searchElements = InputValidator.forms[formName].ecache.name[eName];
				if (searchElements instanceof Array) {
					return searchElements;
				} else {
					return [ searchElements ];
				}
			}
		} else {
			return [];
		}
	},

	getQueryString : function(form) {
		InputValidator.console.log('getQueryString()');
		var escaped_parts = [];
		var elements = form.ecache.name;
		var setParts = function(e) {
			if (e.tagName == 'INPUT') {
				if (e.type == 'radio' || e.type == 'checkbox') {
					// INPUT type=radio,checkbox
					if (e.checked) {
						escaped_parts.push(key + '='
								+ encodeURIComponent(e.value));
					}
				} else {
					// INPUT type=hidden,text,button,submit,reset
					escaped_parts.push(key + '=' + encodeURIComponent(e.value));
				}
			} else if (e.tagName == 'SELECT') {
				escaped_parts.push(key + '='
						+ encodeURIComponent(e.options[e.selectedIndex].value));
			} else if (e.tagName == 'TEXTAREA') {
				escaped_parts.push(key + '=' + encodeURIComponent(e.value));
			}
		};
		for ( var key in elements) {
			var e = elements[key];
			if (e instanceof Array) {
				for ( var i = 0, len = e.length; i < len; i++) {
					setParts(e[i]);
				}
			} else {
				setParts(e);
			}
		}
		return escaped_parts.join('&');
	},

	setDefaultValue : function(srcElement) {
		InputValidator.console.log('setDefaultValue()');
		var setDefault = function(srcElement) {
			if (srcElement.defaultValue !== undefined) {
				srcElement.value = srcElement.defaultValue;
			} else if (srcElement.defaultChecked !== undefined) {
				srcElement.checked = srcElement.defaultChecked;
			} else if (srcElement.tagName == 'SELECT') {
				var options = srcElement.options;
				for ( var i = 0, len = options.length; i < len; i++) {
					var option = options[i];
					option.selected = option.defaultSelected;
				}
			}
		}
		var groupElements = InputValidator._getGroupElements(srcElement);
		for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
			var ge = groupElements[ri];
			setDefault(ge);
		}
	},

	getElementDefaultValue : function(element) {
		InputValidator.console.log('getElementDefaultValue()');
		var value = InputValidator.getValidateElementDefaultValue(element);
		if (value instanceof Array) {
			return value.join(',');
		} else {
			return value;
		}
	},

	getValidateElementDefaultValue : function(element) {
		InputValidator.console.log('getValidateElementDefaultValue()');
		var values = [];
		var isArray;
		if (element.length > 1 && !element.tagName) {
			isArray = true;
			for ( var i = 0, len = element.length; i < len; i++) {
				if (element[i].defaultChecked) {
					values.push(element[i].value);
				}
			}
		} else if (element.tagName == 'SELECT') {
			isArray = true;
			var options = element.options;
			for ( var i = 0, len = options.length; i < len; i++) {
				if (options[i].defaultSelected) {
					if (InputValidator.UserAgent.MSIE) {
						var valueItem = options[i].attributes
								.getNamedItem('value');
						if (valueItem && !valueItem.specified) {
							values.push(options[i].text);
						} else {
							values.push(options[i].value);
						}
					} else {
						values.push(options[i].value);
					}
				}
			}
		} else if (element.tagName == 'INPUT'
				&& (element.type == 'checkbox' || element.type == 'radio')) {
			isArray = true;
			var groupElements = InputValidator._getGroupElements(element);
			for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
				var ge = groupElements[ri];
				if (ge && ge.defaultChecked) {
					values.push(ge.value);
				}
			}
		} else {
			isArray = false;
		}
		if (isArray) {
			return values;
		} else {
			return element.defaultValue
		}
	},

	getElementValue : function(element) {
		// InputValidator.console.log('getElementValue()');
		var value = InputValidator.getValidateElementValue(element);
		if (value instanceof Array) {
			return value.join(',');
		} else {
			return value;
		}
	},

	getValidateElementValue : function(element) {
		// InputValidator.console.log('getValidateElementValue()');
		var values = [];
		var isArray;
		if (element.length > 1 && !element.tagName) {
			isArray = true;
			for ( var i = 0, len = element.length; i < len; i++) {
				if (element[i].checked) {
					values.push(element[i].value);
				}
			}
		} else if (element.tagName == 'SELECT') {
			isArray = true;
			var options = element.options;
			for ( var i = 0, len = options.length; i < len; i++) {
				if (options[i].selected) {
					if (InputValidator.UserAgent.MSIE) {
						var valueItem = options[i].attributes
								.getNamedItem('value');
						if (valueItem && !valueItem.specified) {
							values.push(options[i].text);
						} else {
							values.push(options[i].value);
						}
					} else {
						values.push(options[i].value);
					}
				}
			}
		} else if (element.tagName == 'INPUT'
				&& (element.type == 'checkbox' || element.type == 'radio')) {
			isArray = true;
			var groupElements = InputValidator._getGroupElements(element);
			for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
				var ge = groupElements[ri];
				if (ge && ge.checked) {
					values.push(ge.value);
				}
			}
		} else {
			isArray = false;
		}
		if (isArray) {
			return values;
		} else {
			return element.value
		}
	},

	console : {
		log : function(message) {
			// デバッグ用
			// console.log(message);
		},
		show : function() {
		},
		hide : function() {
		}
	}
};

InputValidator.ElementCache = function() {
	this.id = {};
	this.name = {};
};

InputValidator.ElementCache.prototype = {
	scan : function(form) {
		var idList = [];
		var nameList = [];
		var felements = form.elements;
		for ( var i = 0, len = felements.length; i < len; i++) {
			var e = felements[i];
			var eid = e.id;
			if (eid) {
				if (this.id[eid]) {
					if (this.id[eid] instanceof Array) {
						this.id[eid].push(e);
					} else {
						this.id[eid] = [ this.id[eid], e ];
					}
				} else {
					this.id[eid] = e;
					idList.push(eid);
				}
			}
			var ename = e.name;
			if (ename) {
				if (this.name[ename]) {
					if (this.name[ename] instanceof Array) {
						this.name[ename].push(e);
					} else {
						this.name[ename] = [ this.name[ename], e ];
					}
				} else {
					this.name[ename] = e;
					nameList.push(ename);
				}
			}
		}
		return {
			idList : idList,
			nameList : nameList
		};
	}
};

InputValidator.addEvent(window, 'load', function() {
	InputValidator.setRulesAll();
});

InputValidator.addEvent(window, 'resize', function() {
	InputValidator.resize();
});

if (!window.console) { // for IE6
	window.console = {
		log : function(message) {
			return true;
		},
		show : function() {
		},
		hide : function() {
		}
	}
}
