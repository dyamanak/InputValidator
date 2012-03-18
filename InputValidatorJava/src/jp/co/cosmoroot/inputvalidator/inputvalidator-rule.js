/**
 * inputvalidator-rule.js
 */
InputValidator.pluginRules = {
	autofocus : function(element, rules) {
		setTimeout(function(element) {
			return function() {
				element.focus();
				InputValidator.fireEvent(element, 'mousedown');
			};
		}(element), 0);
	},
	readonly : function(element, rules) {
		element.readOnly = true;
		if (InputValidator.css.readonlyClass) {
			element.className = InputValidator.css.readonlyClass;
		}
	},
	hankaku : function(element, rules) {
		element.style.imeMode = 'disabled';
	},
	zenkaku : function(element, rules) {
		element.style.imeMode = 'active';
	},
	maxlength : function(element, rules) {
		var maxlength;
		if (typeof (rules.maxlength) == 'object') {
			maxlength = parseInt(rules.maxlength.maxlength, 10);
		} else {
			maxlength = parseInt(rules.maxlength, 10);
		}
		element.maxLength = maxlength;
	},
	number : function(element, rules) {
		element.style.imeMode = 'disabled';
		if (!element.style.textAlign) {
			element.style.textAlign = 'right';
		}
	}
};

InputValidator.validationRules = {
	placeholder : function(value, rules) {
		return true;
	},
	group : function(value, rules) {
		return true;
	},
	error : function(value, rules) {
		return true;
	},
	errorfor : function(value, rules) {
		return true;
	},
	errorclass : function(value, rules) {
		return true;
	},
	placeholderfor : function(value, rules) {
		return true;
	},
	placeholderclass : function(value, rules) {
		return true;
	},
	oninput : function(value, rules) {
		return true;
	},
	required : function(value, rules) {
		// 入力必須チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			var isArray = value instanceof Array; // for checkbox and radio
			if (isArray) {
				if (value.join()) {
					isValid = true;
				} else {
					isValid = false;
				}
			} else {
				isValid = true;
			}
		} else {
			isValid = false;
		}
		if (!isValid) {
			if (typeof (rules) == 'object') {
				errorMessage = rules.error;
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	email : function(value, rules) {
		// E-Mailチェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			if (!/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
				isValid = false;
				if (typeof (rules) == 'object') {
					errorMessage = rules.error;
				}
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	hankaku : function(value, rules) {
		// 半角チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			if (InputValidator.isIncludeZenkakuChar(value)) {
				isValid = false;
				if (typeof (rules) == 'object') {
					errorMessage = rules.error;
				}
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	zenkaku : function(value, rules) {
		// 全角チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			if (InputValidator.isIncludeHankakuChar(value)) {
				isValid = false;
				if (typeof (rules) == 'object') {
					errorMessage = rules.error;
				}
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	number : function(value, rules) {
		// 数値チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			if (!value.match(/^[+\\-]?[0-9\\.]+$/)) {
				isValid = false;
			}
			if (isValid && isNaN(value)) {
				isValid = false;
			}
			if (!isValid) {
				if (typeof (rules) == 'object') {
					errorMessage = rules.error;
				}
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	date : function(value, rules) {
		// 日付チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			// 日付の年月日が正しい場合のみ、フォーマットする
			var nowDate = new Date();
			var fullYear = new String(nowDate.getFullYear());
			var year = 0;
			var month = 0;
			var day = 0;
			if (rules.format) {
				var dateObj = InputValidator.parseDate(value, rules.format);
				var parsedDate = new Date(dateObj.year, dateObj.month - 1,
						dateObj.day);
				if (!isNaN(parsedDate)) {
					if (dateObj.year < 100) {
						year = fullYear - (fullYear % 100) + dateObj.year;
					} else {
						year = dateObj.year;
					}
					month = dateObj.month;
					day = dateObj.day;
				}
			} else {
				// 日付の年月日を抽出する
				var year, month, day;
				if (/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.test(value)) {
					year = parseInt(RegExp.$1, 10);
					month = parseInt(RegExp.$2, 10);
					day = parseInt(RegExp.$3, 10);
				} else if (/^(\d{1,3})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
						.test(value)) {
					year = parseInt((fullYear.substring(0, 1) + "000")
							.substring(0, 4 - RegExp.$1.length), 10);
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
			}
			var checkDate = new Date(year, month - 1, day);
			if (!isNaN(checkDate) && year == checkDate.getFullYear()
					&& month == (checkDate.getMonth() + 1)
					&& day == checkDate.getDate()) {
			} else {
				isValid = false;
				if (typeof (rules) == 'object') {
					errorMessage = rules.error;
				}
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	pattern : function(value, rules) {
		// 正規表現チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			var isPatternMatch = function(pattern) {
				var isMatch = false;
				if (pattern instanceof RegExp) {
					if (value.match(pattern)) {
						isMatch = true;
					}
				} else if (typeof pattern == 'string') {
					if (value.match(new RegExp(pattern))) {
						isMatch = true;
					}
				} else {
					isMatch = false;
				}
				return isMatch;
			}
			if (rules instanceof RegExp) {
				isValid = isPatternMatch(rules);
			} else if (typeof (rules) == 'object') {
				if (!isPatternMatch(rules.pattern)) {
					isValid = false;
					errorMessage = rules.error;
				}
			} else {
				isValid = isPatternMatch(rules);
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	minlength : function(value, rules) {
		// 文字数下限チェック
		var isValid = true;
		var errorMessage = '';
		var minlength;
		if (typeof (rules) == 'object') {
			minlength = parseInt(rules.minlength, 10);
		} else {
			minlength = parseInt(rules, 10);
		}
		if (value.length < minlength) {
			isValid = false;
			if (typeof (rules) == 'object') {
				errorMessage = rules.error;
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	maxlength : function(value, rules) {
		// 文字数上限チェック
		var isValid = true;
		var errorMessage = '';
		var maxlength;
		if (typeof (rules) == 'object') {
			maxlength = parseInt(rules.maxlength, 10);
		} else {
			maxlength = parseInt(rules, 10);
		}
		if (value.length > maxlength) {
			isValid = false;
			if (typeof (rules) == 'object') {
				errorMessage = rules.error;
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	minchecked : function(value, rules) {
		// 最小チェック数チェック
		var isValid = true;
		var errorMessage = '';
		var minchecked;
		if (typeof (rules) == 'object') {
			minchecked = parseInt(rules.minchecked, 10);
		} else {
			minchecked = parseInt(rules, 10);
		}
		var isArray = value instanceof Array; // for checkbox and radio
		if (isArray && value.length < minchecked) {
			isValid = false;
			if (typeof (rules) == 'object') {
				errorMessage = rules.error;
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	maxchecked : function(value, rules) {
		// 最大チェック数チェック
		var isValid = true;
		var errorMessage = '';
		var maxchecked;
		if (typeof (rules) == 'object') {
			maxchecked = parseInt(rules.maxchecked, 10);
		} else {
			maxchecked = parseInt(rules, 10);
		}
		var isArray = value instanceof Array; // for checkbox and radio
		if (isArray && value.length > maxchecked) {
			isValid = false;
			if (typeof (rules) == 'object') {
				errorMessage = rules.error;
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	min : function(value, rules) {
		// 最小値チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			var min;
			if (typeof (rules) == 'object') {
				min = parseInt(rules.min, 10);
			} else {
				min = parseInt(rules, 10);
			}
			if (value < min) {
				isValid = false;
				if (typeof (rules) == 'object') {
					errorMessage = rules.error;
				}
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	max : function(value, rules) {
		// 最大値チェック
		var isValid = true;
		var errorMessage = '';
		if (value) {
			var max;
			if (typeof (rules) == 'object') {
				max = parseInt(rules.max, 10);
			} else {
				max = parseInt(rules, 10);
			}
			if (value > max) {
				isValid = false;
				if (typeof (rules) == 'object') {
					errorMessage = rules.error;
				}
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	},
	func : function(value, rules) {
		// オリジナル関数での入力チェック
		var isValid = true;
		var errorMessage = '';
		if (typeof (rules) == 'object') {
			var srcFunc, funcType, func, funcList, e;
			if (rules.constructor == Array) {
				funcList = rules;
				for ( var fi = 0, flen = funcList.length; fi < flen; fi++) {
					srcFunc = funcList[fi];
					funcType = typeof srcFunc.func;
					if (funcType == 'function') {
						func = srcFunc.func;
						isValid = func.call(this, value);
					} else if (funcType == 'string') {
						if (InputValidator.customEvent
								&& InputValidator.customEvent[srcFunc.func]) {
							isValid = InputValidator.customEvent[srcFunc.func]
									.call(this, value);
						} else if (window[srcFunc.func]) {
							isValid = window[srcFunc.func].call(this, value);
						}
					}
					if (!isValid) {
						errorMessage = srcFunc.error;
						break;
					}
				}
			} else {
				srcFunc = rules;
				funcType = typeof (srcFunc.func);
				if (funcType == 'function') {
					func = srcFunc.func;
					isValid = func.call(this, value);
				} else if (funcType == 'string') {
					if (InputValidator.customEvent
							&& InputValidator.customEvent[srcFunc.func]) {
						isValid = InputValidator.customEvent[srcFunc.func]
								.call(this, value);
					} else if (window[srcFunc.func]) {
						isValid = window[srcFunc.func].call(this, value);
					}
				}
				if (!isValid) {
					errorMessage = srcFunc.error;
				}
			}
		} else if (typeof (rules) == 'function') {
			isValid = rules.call(this, value);
		} else if (typeof (rules) == 'string') {
			if (InputValidator.customEvent && InputValidator.customEvent[rules]) {
				isValid = InputValidator.customEvent[rules].call(this, value);
			} else if (window[rules]) {
				isValid = window[rules].call(this, value);
			}
		}
		return {
			isValid : isValid,
			errorMessage : errorMessage
		};
	}
};

InputValidator.isIncludeHankakuChar = function(in_value) {
	return this.isIncludeChar(in_value, false);
};

InputValidator.isIncludeZenkakuChar = function(in_value) {
	return this.isIncludeChar(in_value, true);
};

InputValidator.isIncludeChar = function(in_value, in_checkType) {
	for ( var i = 0, len = in_value.length; i < len; i++) {
		var c = in_value.charCodeAt(i);
		// Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
		if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0)
				|| (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
			if (!in_checkType)
				return true;
		} else {
			if (in_checkType)
				return true;
		}
	}
	return false;
};

InputValidator.getNumberZ2H = function(src) {
	return src.replace(/([０-９])/g, function($0) {
		return String.fromCharCode($0.charCodeAt(0) - 65248);
	}).replace(/．|。/g, '.');
};

InputValidator.parseDate = function(dateString, format) {
	// value : '-2012年12月16日-'
	// format = '-yyyy年M月d日-'
	// mList = ['-','yyyy','年','M','月','d','日-']
	var targetDate = dateString;
	var targetFormat = format;
	var dateRegex = new RegExp(/yyyy|yy|mm|m|dd|d/i);
	var mList = [];
	var m;
	while (m = dateRegex.exec(targetFormat)) {
		if (m.index > 0) {
			mList.push(targetFormat.substring(0, m.index));
		}
		mList.push(m[0]);
		targetFormat = targetFormat.substring(m.index + m[0].length);
	}
	if (targetFormat) {
		mList.push(targetFormat);
	}
	var nowDate = new Date();
	var year = nowDate.getFullYear();
	var month = nowDate.getMonth() + 1;
	var day = nowDate.getDate();
	var getValue = function(re) {
		var val = re.exec(targetDate);
		if (val) {
			targetDate = targetDate.replace(re, '');
			return parseInt(val, 10);
		} else {
			return 0;
		}
	}
	for ( var i = 0, len = mList.length; i < len; i++) {
		var m = mList[i];
		if (m === 'YYYY' || m === 'yyyy') {
			year = getValue(/[0-9]{1,4}/);
		} else if (m === 'YY' || m === 'yy') {
			year = getValue(/[0-9]{1,2}/)
					+ (Math.floor(nowDate.getFullYear() / 100) * 100);
		} else if (m === 'MM' || m === 'mm') {
			month = getValue(/[0|1][0-9]/);
		} else if (m === 'M' || m === 'm') {
			month = getValue(/[0|1]?[0-9]/);
		} else if (m === 'DD' || m === 'dd') {
			day = getValue(/[0-3][0-9]/);
		} else if (m === 'D' || m === 'd') {
			day = getValue(/[0-3]?[0-9]/);
		} else {
			if (targetDate.indexOf(m) != 0) {
				year = month = day = 0;
				break;
			} else {
				targetDate = targetDate.substring(m.length);
			}
		}
	}
	if (targetDate) {
		year = month = day = 0;
	}
	return {
		year : year,
		month : month,
		day : day
	};
};

InputValidator.validateRule = function(value, rules) {
	var isValid = true;
	var errorMessage = null;
	for ( var ruleKey in rules) {
		var validator = InputValidator.validationRules[ruleKey];
		if (validator) {
			var result = validator.call(this, value, rules[ruleKey]);
			if (typeof result == 'object') {
				isValid = result.isValid;
				errorMessage = result.errorMessage;
			} else if (typeof result == 'boolean') {
				isValid = result;
			} else {
				alert('[' + ruleKey + ']の戻り値が不正です。\nプログラムを修正してください。');
			}
		} else {
			if (InputValidator.pluginRules[ruleKey]) {
				// プラグインの場合、validateRule は省略可能。
			} else {
				alert('[' + ruleKey + ']というチェックルールはありません。\n要素名[' + this.name
						+ ']のチェックルールを修正してください。');
			}
		}
		if (!isValid) {
			break;
		}
	}
	if (!isValid && !errorMessage && rules.error) {
		errorMessage = rules.error;
	}
	return {
		isValid : isValid,
		errorMessage : errorMessage
	};
};
