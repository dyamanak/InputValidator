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
	win : window,
	doc : document,
	idIndex : 0, // 入力要素のID連番
	noteIndex : 0, // コメント表示要素のID連番
	allElements : [], // 入力チェック対象の全入力要素（配列）
	forms : {}, // 入力チェック対象の全フォーム要素（オブジェクト）
	isInjected : false, // 初期化完了フラグ
	currentActiveElement : null, // 現在アクティブな要素
	previousActiveElement : null, // 前回アクティブな要素
	isDisplayNote : true, // 入力欄エラーメッセージ表示フラグ(true:表示,false:非表示)
	isCheckChanged : true, // 入力値の変更時の即時チェックフラグ(true:する,false:しない)
	position : 'down', // メッセージ表示位置(inner:内部, up:上, down:下)
	color : {
		placeholderColor : '#888888',
		placeholderBackGroundColor : '',
		errorColor : '#000000',
		errorBackGroundColor : '#ffffe1',
		errorBorderColor : '#888866',
		readOnlyColor : '#222222'
	},

	UserAgent : {
		MSIE : navigator.userAgent.indexOf('MSIE') >= 0,
		AppleWebKit : navigator.userAgent.indexOf('AppleWebKit') >= 0
	},

	addEvent : function(element, eventName, func) {
		if (element.addEventListener) {
			element.addEventListener(eventName, func, false);
		} else {
			element.attachEvent('on' + eventName, func);
		}
		element = null;
	},

	stopEventBubbling : function(evt) {
		evt.stopped = true;
		if (evt.preventDefault) {
			evt.preventDefault();
		}
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}
	},

	getEventElement : function(evt) {
		var element = evt.srcElement || evt.target;
		if (element.tagName == 'OPTION') {
			// OPTION Node -> SELECT Node for Firefox
			element = element.parentNode;
		}
		return element;
	},

	// 入力チェック機能を注入する
	inject : function() {

		if (InputValidator.customEvent) {
			// customEventに入力欄エラーメッセージ表示フラグが設定されていたら適用する
			if (InputValidator.customEvent.isDisplayNote != undefined) {
				this.isDisplayNote = InputValidator.customEvent.isDisplayNote;
			}
		}

		// 全フォームの全要素をキャッシュする
		var targetForms = this.doc.forms;
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

		// DOMイベント登録処理
		for ( var i = 0, len = elements.length; i < len; i++) {

			var element = elements[i];
			if (!element.tagName) {
				continue; // 入力要素以外はスキップ
			}
			var rules = element._rules;
			if (element.tagName == 'FORM') {
				// form要素の場合
				if (!element._validatorElements) {
					// 全入力要素に対するイベントハンドラ設定
					InputValidator.addEvent(element, 'mousedown',
							function(evt) {
								InputValidator._eventHandlerMouseDown.call(
										InputValidator, evt);
							});
					InputValidator.addEvent(element, 'mouseup', function(evt) {
						InputValidator._eventHandlerClick.call(InputValidator,
								evt);
					});
					InputValidator.addEvent(element, 'keyup', function(evt) {
						InputValidator._eventHandlerMouseDown.call(
								InputValidator, evt);
						InputValidator._eventHandlerClick.call(InputValidator,
								evt);
					});
					// submit,resetイベントを追加する
					InputValidator.addEvent(element, 'submit',
							InputValidator._submitForm);
					InputValidator.addEvent(element, 'reset',
							InputValidator._resetForm);
					// form内の入力要素保存用配列
					element._validatorElements = [];
				}

			} else {
				// form要素以外の場合

				// 入力要素に入力チェックフラグのプロパティを追加する
				element._isValid = true;

				// 入力規則として、フォーカスが指定されている場合、フォーカスする
				if (rules.autofocus) {
					element.focus();
				}

				// 入力規則として、半角での入力が指定されている場合、テキストの入力モードは「ime-mode:disabled」とする
				if (rules.hankaku || rules.number) {
					element.style.imeMode = 'disabled';
				}

				// 入力規則として、半角での入力が指定されている場合、テキストの入力モードは「ime-mode:disabled」とする
				if (rules.zenkaku) {
					element.style.imeMode = 'active';
				}

				// 入力規則として、readOnlyが指定されている場合、変更不可とする
				if (rules.readOnly) {
					element.readOnly = true;
					element.style.color = InputValidator.color.readOnlyColor;
				}

				// 入力規則として、maxlengthが指定されている場合、maxlengthを設定する
				if (rules.maxlength) {
					var maxlength;
					if (typeof (rules.maxlength) == 'object') {
						maxlength = parseInt(rules.maxlength.maxlength, 10);
					} else {
						maxlength = parseInt(rules.maxlength, 10);
					}
					element.maxlength = maxlength;
				}

				// 入力規則として、数値が指定されている場合、右寄せを設定する
				if (rules.number) {
					if (!element.style.textAlign) {
						element.style.textAlign = 'right';
					}
				}

				// InputValidatorオブジェクトに入力チェック対象（要素）を追加する
				this.allElements.push(element);

				// submit,resetイベントを追加する
				if (!element.form._validatorElements) {
					// 全入力要素に対するイベントハンドラ設定
					InputValidator.addEvent(element.form, 'mousedown',
							function(evt) {
								InputValidator._eventHandlerMouseDown.call(
										InputValidator, evt);
							});
					InputValidator.addEvent(element.form, 'mouseup', function(
							evt) {
						InputValidator._eventHandlerClick.call(InputValidator,
								evt);
					});
					InputValidator.addEvent(element.form, 'keyup',
							function(evt) {
								InputValidator._eventHandlerMouseDown.call(
										InputValidator, evt);
								InputValidator._eventHandlerClick.call(
										InputValidator, evt);
							});
					// submit,resetイベントを追加する
					InputValidator.addEvent(element.form, 'submit',
							InputValidator._submitForm);
					InputValidator.addEvent(element.form, 'reset',
							InputValidator._resetForm);
					// form内の入力要素保存用配列
					element.form._validatorElements = [];
				}
				var formValidatorElements = element.form._validatorElements;
				formValidatorElements.push(element);

				// 入力説明（入力エラー）表示オブジェクトの生成
				if (this.isDisplayNote && rules) {
					this._appendNoteElement(element);
				}

				// 入力欄のタイプによって、イベントを付与する
				var tagName = element.tagName;
				var type = element.type;
				if (tagName == 'INPUT'
						&& (type == 'checkbox' || type == 'radio')) {
					// チェックボックス、またはラジオボタン押下時のイベント追加
					var groupElements = this._getGroupElements(element);
					for ( var ri = 0, rilen = groupElements.length; ri < rilen; ri++) {
						var ge = groupElements[ri];
						if (ge && element !== ge) {
							ge._noteElement = element._noteElement;
							ge._rules = rules;
						}
					}
				}
			}

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
		this.isInjected = true;
	},

	_getAttributeValue : function(element, attr) {
		if (element && element.attributes
				&& element.attributes.getNamedItem(attr)) {
			return element.attributes.getNamedItem(attr).value;
		} else {
			return '';
		}
	},

	_eventHandlerMouseDown : function(evt) {
		var srcElement = InputValidator.getEventElement(evt);
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
		}
	},

	_isLeftClick : function(evt) {
		if (InputValidator.UserAgent.MSIE) {
			return event.button === 1;
		} else if (InputValidator.UserAgent.AppleWebKit) {
			return evt.which === 1 && !evt.metaKey;
		} else {
			return evt.which ? (evt.which === 1) : (evt.button === 0);
		}
	},

	_isButtonRadioCheckbox : function(element) {
		if ((element.tagName == 'INPUT' && (element.type == 'button'
				|| element.type == 'radio' || element.type == 'checkbox'))
				|| element.tagName == 'BUTTON') {
			return true;
		} else {
			return false;
		}
	},

	_isInputElement : function(element) {
		if ((element.tagName == 'INPUT' && element.type != 'hidden')
				|| element.tagName == 'BUTTON' || element.tagName == 'SELECT'
				|| element.tagName == 'TEXTAREA') {
			return true;
		} else {
			return false;
		}
	},

	redraw : function() {
		if (!InputValidator.isInjected) {
			setTimeout(InputValidator.redraw, 200);
			return;
		}
		var allElements = InputValidator.allElements;
		for ( var i = 0, len = allElements.length; i < len; i++) {
			var srcElement = allElements[i];
			if (srcElement._isValid) {
				InputValidator._displayPlaceholder(srcElement, InputValidator
						.getElementValue(srcElement));
			} else {
				InputValidator._displayError(srcElement);
			}
			InputValidator._adjustLocation(srcElement);
		}
	},

	check : function(formElement) {
		if (!InputValidator.isInjected) {
			return false;
		}
		if (!formElement) {
			alert('check()の引数に、フォーム要素が指定されていません。');
			return false;
		}
		var formName = InputValidator._getAttributeValue(formElement, 'name');
		var isValid = true;
		var validatorElements = formElement._validatorElements;
		var errorElementList = [];
		var checkValid = function(element) {
			InputValidator.validateElement(element);
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
		if (formElement._rules && formElement._rules.check instanceof Function) {
			formElement._rules.check(errorElementList);
		} else if (InputValidator.customEvent
				&& InputValidator.customEvent[formName]
				&& InputValidator.customEvent[formName].check instanceof Function) {
			InputValidator.customEvent[formName].check(errorElementList);
		} else if (InputValidator.customEvent
				&& InputValidator.customEvent.check instanceof Function) {
			InputValidator.customEvent.check(errorElementList);
		}
		return isValid;
	},

	_submitForm : function(evt) {
		var formElement = InputValidator.getEventElement(evt);
		var isValid = true;
		var errorMessage = null;
		var focusElement = null;
		var validatorElements = formElement._validatorElements;
		var errorElementList = [];
		var checkValid = function(element) {
			InputValidator.validateElement(element);
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
		var hasSubmitAlert = false;
		try {
			if (InputValidator.customEvent) {
				var cv = InputValidator.customEvent;
				var fn = InputValidator._getAttributeValue(formElement, 'name');
				if (cv[fn] && cv[fn].onSubmitAlert instanceof Function) {
					isValid = cv[fn].onSubmitAlert.call(formElement, evt,
							errorElementList);
					hasSubmitAlert = true;
				} else if (cv.onSubmitAlert instanceof Function) {
					isValid = cv.onSubmitAlert.call(formElement, evt,
							errorElementList);
					hasSubmitAlert = true;
				}
			}
		} catch (e) {
			isValid = false;
			alert(e.description);
		}
		if (!isValid) {
			InputValidator.stopEventBubbling(evt); // submitしない
			return false;
		}
		if (!hasSubmitAlert && !isValid) {
			// form要素にsubmit時のコールバック関数が設定されている場合、コールする
			if (!errorMessage) {
				errorMessage = '入力内容にエラーがあります。';
			}
			// 一度スクロールを先頭に戻す
			InputValidator.win.scrollTo(0, 0);
			try {
				// その後、エラーの発生した入力欄にフォーカスをあてる
				focusElement.focus();
			} catch (e) {
			}
			// エラーメッセージを表示する
			alert(errorMessage.stripTags());
			InputValidator.stopEventBubbling(evt); // submitしない
			return isValid;
		}
		if (isValid) {
			// form要素にsubmit時のコールバック関数が設定されている場合、コールする
			try {
				if (InputValidator.customEvent) {
					var cv = InputValidator.customEvent;
					var fn = InputValidator._getAttributeValue(formElement,
							'name');
					if (cv[fn] && cv[fn].onSubmit instanceof Function) {
						isValid = cv[fn].onSubmit.call(formElement, evt);
					} else if (cv.onSubmit instanceof Function) {
						isValid = cv.onSubmit.call(formElement, evt);
					}
				}
			} catch (e) {
				isValid = false;
				alert(e.description);
			}
		}
		if (!isValid) {
			InputValidator.stopEventBubbling(evt); // submitしない
			return isValid;
		}
		return isValid;
	},

	_resetForm : function(evt) {
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
		// リセットボタン押下時もonLoadイベントを呼ぶ
		if (InputValidator.customEvent) {
			for ( var formName in InputValidator.forms) {
				var formElement = InputValidator.forms[formName];
				if (formElement && InputValidator.customEvent[formName]
						&& InputValidator.customEvent[formName].onLoad) {
					InputValidator.customEvent[formName].onLoad
							.call(formElement);
				}
			}
			if (InputValidator.customEvent.onLoad) {
				InputValidator.customEvent.onLoad.call(window);
			}
		}
		// 全ての入力欄のメモ表示をクリア
		var validatorElements = formElement._validatorElements;
		for ( var i = 0, len = validatorElements.length; i < len; i++) {
			var srcElement = validatorElements[i];
			var noteElement = srcElement._noteElement;
			srcElement._isValid = true;
			srcElement._error = '';
			var ge = InputValidator._getGroupElements(srcElement);
			for ( var gi = 0, glen = ge.length; gi < glen; gi++) {
				var e = ge[gi];
				if (e._noteElement) {
					var neStyle = e._noteElement.style;
					if (e._noteElement._triangleElement) {
						e._noteElement._triangleElement.style.display = 'none';
					}
					e._noteElement.style.display = 'none';
				}
			}
			InputValidator._displayPlaceholder(srcElement, InputValidator
					.getElementDefaultValue(srcElement));
			InputValidator._adjustLocation(srcElement);
		}
	},

	_changeValue : function(srcElement) {
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
		// 変更前の入力値を保存
		srcElement._previousValue = InputValidator.getElementValue(srcElement);
	},

	_checkChangeValue : function(srcElement) {
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
		var kcode = evt.keyCode;
		if (kcode == Event.KEY_RETURN) {
			InputValidator.stopEventBubbling(evt);
		}
	},

	_focusElement : function(evt) {
		var srcElement = this;
		if (srcElement.readOnly || srcElement.disabled) {
			return true;
		}
		var tag = srcElement.tagName;
		var type = srcElement.type;
		if (tag == 'INPUT' && (type == 'radio' || type == 'checkbox')) {
			var ge = InputValidator._getGroupElements(srcElement);
			for ( var i = 0, len = ge.length; i < len; i++) {
				var e = ge[i];
				if (e._noteElement) {
					e._noteElement.style.display = 'none';
				}
			}
		} else {
			if (srcElement._noteElement) {
				srcElement._noteElement.style.display = 'none';
			}
		}
		// 変更前の入力値を保存
		InputValidator._setPreviousValue(srcElement);
	},

	_blurElement : function(evt) {
		var srcElement = this;
		if (srcElement.readOnly) {
			return true;
		}

		// 入力値をフォーマットする（フォーマットが指定されている場合のみ）
		InputValidator.formatDateElement(srcElement);

		// 変更前の入力値と比較し、異なっていたら、_changeValueメソッドを呼ぶ
		InputValidator._checkChangeValue(srcElement);

		if (InputValidator.isCheckChanged) {
			// 即時チェックする場合、入力値をチェックする
			InputValidator.validateElement(srcElement);
		}
	},

	_clickElement : function(evt) {
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
						if (ge._noteElement) {
							ge._noteElement.style.display = 'none';
						}
					}
				} else {
					if (srcElement._noteElement) {
						srcElement._noteElement.style.display = 'none';
					}
				}
				InputValidator._changeValue(srcElement);
			} else if (srcElement.type == 'checkbox') {
				if (srcElement._noteElement) {
					srcElement._noteElement.style.display = 'none';
				}
				InputValidator._changeValue(srcElement);
			}
		}
		if (InputValidator.customEvent) {
			var formName = InputValidator._getAttributeValue(srcElement.form,
					'name');
			var formCustomEvent = InputValidator.customEvent[formName];
			if (formCustomEvent) {
				var srcElementName = InputValidator._getAttributeValue(
						srcElement, 'name');
				var srcElementCustomEvent = formCustomEvent[srcElementName];
				if (srcElementCustomEvent) {
					if (srcElementCustomEvent.onClick) {
						if (typeof (srcElementCustomEvent.onClick) == 'function') {
							srcElementCustomEvent.onClick.call(srcElement, evt);
						}
					}
				}
			}
		}
		return true;
	},

	formatDateElement : function(srcElement) {
		var rules = srcElement._rules;
		if (!rules) {
			return;
		}
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
		var getLpadZero = function(value, keta) {
			var intValue = parseInt(value, 10);
			var newValue = '000' + intValue;
			newValue = newValue.slice(newValue.length - keta);
			return newValue;
		};
		var result = format;
		if (format.indexOf('yyyy') >= 0) {
			result = result.replace(/yyyy/, date.getFullYear());
		} else if (format.indexOf('yy') >= 0) {
			result = result.replace(/yy/, getLpadZero(date.getFullYear() % 100,
					2));
		}
		if (format.indexOf('MM') >= 0) {
			result = result.replace(/MM/, getLpadZero(date.getMonth() + 1, 2));
		} else if (format.indexOf('M') >= 0) {
			result = result.replace(/M/, date.getMonth() + 1);
		}
		if (format.indexOf('dd') >= 0) {
			result = result.replace(/dd/, getLpadZero(date.getDate(), 2));
		} else if (format.indexOf('d') >= 0) {
			result = result.replace(/d/, date.getDate());
		}
		return result;
	},

	validateElement : function(srcElement) {
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

		var noteElement = srcElement._noteElement;
		if (isValid) {
			// OK
			if (value) {
				// 入力エラーを消す
				if (rules.group) {
					var ge = InputValidator._getGroupElements(srcElement);
					for ( var i = 0, len = ge.length; i < len; i++) {
						var e = ge[i];
						if (e._noteElement) {
							e._noteElement.style.display = 'none';
						}
					}
				} else {
					if (noteElement) {
						noteElement.style.display = 'none';
					}
				}
			} else {
				// 入力メモの表示
				var displayNote = function(srcElement) {
					InputValidator._displayPlaceholder(srcElement,
							InputValidator.getElementValue(srcElement));
					InputValidator._adjustLocation(srcElement);
				};
				if (rules.group) {
					var ge = InputValidator._getGroupElements(srcElement);
					for ( var i = 0, len = ge.length; i < len; i++) {
						displayNote(ge[i]);
					}
				} else {
					displayNote(srcElement);
				}
			}
		} else {
			// NG
			var tagName = srcElement.tagName;
			var type = srcElement.type;
			if (!errorMessage) {
				errorMessage = rules.error;
			}
			if (!errorMessage) {
				errorMessage = '無効な値です';
			}
			if (errorMessage) {
				// 入力チェック結果のエラーメッセージを入力要素のプロパティに保存
				srcElement._error = errorMessage;
				// radioボタンとcheckboxの場合、要素のグループ全てをいったん非表示にする
				if (tagName == 'INPUT'
						&& (type == 'radio' || type == 'checkbox')) {
					var ge = InputValidator._getGroupElements(srcElement);
					for ( var i = 0, len = ge.length; i < len; i++) {
						var e = ge[i];
						if (e && e._noteElement) {
							e._noteElement.style.display = 'none';
						}
					}
				}
				// 入力エラー表示
				InputValidator._displayError(srcElement);
				InputValidator._adjustLocation(srcElement);
			}
		}
	},

	_getElementsByConfigure : function() {
		// InputValidator.configureの入力チェック情報を取得する
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
					elements.push(formElement);
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

	_appendNoteElement : function(srcElement) {
		var srcElementId = srcElement.id;
		if (!srcElementId) {
			srcElementId = '_srcId_' + InputValidator.idIndex++;
			srcElement.id = srcElementId;
		}
		var noteElement = InputValidator._createNoteElement(srcElement);

		// 吹き出しの三角をCSSで追加
		if (InputValidator.position == 'down') {
			InputValidator._createDownTriangleElement(noteElement);
		}

		// 表示メッセージ要素を追加
		var textElement = InputValidator._createTextElement(noteElement);
		if (srcElement._rules.placeholder) {
			textElement.innerHTML = srcElement._rules.placeholder;
		}

		// 吹き出しの三角をCSSで追加
		if (InputValidator.position == 'up') {
			InputValidator._createUpTriangleElement(noteElement);
		}

		InputValidator.addEvent(noteElement, 'click', function(evt) {
			noteElement.style.display = 'none';
			srcElement.focus();
			InputValidator.fireEvent(srcElement, 'mousedown');
		});
		InputValidator._displayPlaceholder(srcElement, InputValidator
				.getElementDefaultValue(srcElement));
		InputValidator._adjustLocation(srcElement);
	},

	_createNoteElement : function(srcElement) {
		var noteElement = InputValidator.doc.createElement('div');
		var noteId = '_noteId_' + InputValidator.noteIndex++;
		noteElement.id = noteId;
		noteElement._isError = false;
		var noteStyle = noteElement.style;
		noteStyle.display = '';
		noteStyle.backgroundColor = InputValidator.color.placeholderBackGroundColor;
		noteStyle.zIndex = srcElement.style.zIndex;
		noteStyle.position = 'absolute';
		noteStyle.border = 'none';
		noteStyle.padding = '0.1em 0.2em 0.1em 0.2em';
		noteStyle.cursor = 'default';
		srcElement.parentNode.appendChild(noteElement);
		srcElement._noteElement = noteElement;
		return noteElement;
	},

	_createDownTriangleElement : function(noteElement) {
		var triangleElement = InputValidator.doc.createElement('div');

		var taLeft = InputValidator.doc.createElement('div');
		var taLeftStyle = taLeft.style;
		taLeftStyle.position = 'absolute';
		taLeftStyle.borderRight = '4px solid '
				+ InputValidator.color.errorBorderColor;
		taLeftStyle.borderTop = '10px solid transparent';
		triangleElement.appendChild(taLeft);

		var taRight = InputValidator.doc.createElement('div');
		var taRightStyle = taRight.style;
		taRightStyle.position = 'absolute';
		taRightStyle.borderLeft = '4px solid '
				+ InputValidator.color.errorBorderColor;
		taRightStyle.borderTop = '10px solid transparent';
		taRightStyle.left = '4px';
		triangleElement.appendChild(taRight);

		var triangleStyle = triangleElement.style;
		triangleStyle.position = 'absolute';
		triangleStyle.top = '-10px';
		triangleStyle.display = 'none';
		noteElement.appendChild(triangleElement);
		noteElement._triangleElement = triangleElement;
		return triangleElement;
	},

	_createUpTriangleElement : function(noteElement) {
		var triangleElement = InputValidator.doc.createElement('div');

		var taLeft = InputValidator.doc.createElement('div');
		var taLeftStyle = taLeft.style;
		taLeftStyle.position = 'absolute';
		taLeftStyle.borderRight = '4px solid '
				+ InputValidator.color.errorBorderColor;
		taLeftStyle.borderBottom = '10px solid transparent';
		triangleElement.appendChild(taLeft);

		var taRight = InputValidator.doc.createElement('div');
		var taRightStyle = taRight.style;
		taRightStyle.position = 'absolute';
		taRightStyle.borderLeft = '4px solid '
				+ InputValidator.color.errorBorderColor;
		taRightStyle.borderBottom = '10px solid transparent';
		taRightStyle.left = '4px';
		triangleElement.appendChild(taRight);

		var triangleStyle = triangleElement.style;
		triangleStyle.position = 'absolute';
		triangleStyle.bottom = '-1px';
		triangleStyle.display = 'none';
		noteElement.appendChild(triangleElement);
		noteElement._triangleElement = triangleElement;
		return triangleElement;
	},

	_createTextElement : function(noteElement) {
		var textElement = InputValidator.doc.createElement('div');
		var textStyle = textElement.style;
		textStyle.whiteSpace = 'nowrap';
		textStyle.color = InputValidator.color.placeholderColor;
		textStyle.fontSize = 'small';
		noteElement.appendChild(textElement);
		noteElement._textElement = textElement;
		return textElement;
	},

	_displayPlaceholder : function(srcElement, value) {
		var noteElement = srcElement._noteElement;
		if (noteElement) {
			noteElement._isError = false;
			var noteStyle = noteElement.style;
			if (!value && srcElement._rules && srcElement._rules.placeholder) {
				if (noteElement._triangleElement) {
					noteElement._triangleElement.style.display = 'none';
				}
				var textElement = noteElement._textElement;
				textElement.innerHTML = srcElement._rules.placeholder;
				textElement.style.color = InputValidator.color.placeholderColor;
				noteStyle.zIndex = 1;
				noteStyle.border = 'none';
				noteStyle.backgroundColor = InputValidator.color.placeholderBackGroundColor;
				noteStyle.display = '';
			} else {
				noteStyle.display = 'none';
			}
		}
	},

	_displayError : function(srcElement) {
		var noteElement = srcElement._noteElement;
		if (noteElement) {
			noteElement._isError = true;
			if (noteElement._triangleElement) {
				noteElement._triangleElement.style.display = '';
			}
			var textElement = noteElement._textElement;
			textElement.innerHTML = srcElement._error;
			textElement.style.color = InputValidator.color.errorColor;
			var noteStyle = noteElement.style;
			noteStyle.zIndex = 2;
			noteStyle.border = 'solid 1px '
					+ InputValidator.color.errorBorderColor;
			noteStyle.backgroundColor = InputValidator.color.errorBackGroundColor;
			noteStyle.display = '';
		}
	},

	_adjustLocation : function(srcElement) {
		// 入力欄が表示されているかどうか判別する
		var noteElement = srcElement._noteElement;
		var srcElementOffset = InputValidator._getOffset(srcElement);
		var srcElementSize = InputValidator._getSize(srcElement);
		var noteElementLeft = srcElementOffset.left;
		var noteElementTop = srcElementOffset.top;
		var noteElementSize = InputValidator._getSize(noteElement);
		if (InputValidator.position == 'inner' || !noteElement._isError) {
			var isIE6 = (navigator.userAgent.indexOf("MSIE 6") >= 0);
			if (isIE6 && srcElement.tagName == 'SELECT') {
				// IEではselect要素の上にdiv要素を表示できないため、入力欄の右側へ表示する
				noteElementLeft += srcElementSize.width;
			} else {
				noteElementLeft += 2;
				noteElementTop += 2;
			}
		} else if (InputValidator.position == 'up') {
			noteElementTop -= (noteElementSize.height + 0);
		} else if (InputValidator.position == 'down') {
			noteElementTop += (srcElementSize.height + 2);
		}
		noteElement.style.left = noteElementLeft + 'px';
		noteElement.style.top = noteElementTop + 'px';
	},

	fireEvent : function(element, eventName) {
		var doc = InputValidator.doc;
		if (element.fireEvent) {
			var evt = doc.createEventObject();
			element.fireEvent('on' + eventName, evt);
		} else if (doc.createEvent) {
			var evt = doc.createEvent('MouseEvent');
			evt.initEvent(eventName, true, true);
			element.dispatchEvent(evt);
		} else {
			alert('not support.');
		}
	},

	_getOffset : function(element) {
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
		var width = element.offsetWidth;
		var height = element.offsetHeight;
		return {
			width : width,
			height : height
		};
	},

	_getGroupElements : function(srcElement) {
		var formName = InputValidator._getAttributeValue(srcElement.form,
				'name');
		var eName = InputValidator._getAttributeValue(srcElement, 'name');
		if (srcElement._rules && srcElement._rules.group) {
			var groupList = srcElement._rules.group;
			var searchElements = [];
			for ( var ci = 0, cilen = groupList.length; ci < cilen; ci++) {
				var ge = InputValidator.forms[formName].ecache.name[groupList[ci]];
				if (!ge) {
					ge = InputValidator.forms[formName].ecache.id[groupList[ci]];
				}
				if (!ge) {
					alert('フォーム名[' + formName + ']の要素名[' + eName + ']のgroup['
							+ groupList[ci] + ']は存在しません。');
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
	},

	getQueryString : function(form) {
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

	getElementDefaultValue : function(element) {
		var value = InputValidator.getValidateElementDefaultValue(element);
		if (value instanceof Array) {
			return value.join(',');
		} else {
			return value;
		}
	},

	getValidateElementDefaultValue : function(element) {
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
		var value = InputValidator.getValidateElementValue(element);
		if (value instanceof Array) {
			return value.join(',');
		} else {
			return value;
		}
	},

	getValidateElementValue : function(element) {
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
	InputValidator.inject();
});
InputValidator.addEvent(window, 'resize', function() {
	InputValidator.redraw();
});
