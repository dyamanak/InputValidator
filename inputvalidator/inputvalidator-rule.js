/**
 * inputvalidator-rule.js
 */
InputValidator.validateRule = function(value, rules) {
	var isValid = true;
	var errorMessage = null;
	var isArray = value instanceof Array; // for checkbox and radio
	var validators = {
		placeholder : function() {
		},
		group : function() {
		},
		error : function() {
		},
		autofocus : function() {
		},
		required : function() {
			// 入力必須チェック
			if (value) {
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
				if (typeof (rules.required) == 'object') {
					errorMessage = rules.required.error;
				}
			}
		},
		email : function() {
			// E-Mailチェック
			if (value) {
				if (!/\w+@\w+\.\w+/.test(value)) {
					isValid = false;
					if (typeof (rules.email) == 'object') {
						errorMessage = rules.email.error;
					}
				}
			}
		},
		hankaku : function() {
			// 半角チェック
			if (value) {
				if (InputValidator.isIncludeZenkakuChar(value)) {
					isValid = false;
					if (typeof (rules.hankaku) == 'object') {
						errorMessage = rules.hankaku.error;
					}
				}
			}
		},
		zenkaku : function() {
			// 全角チェック
			if (value) {
				if (InputValidator.isIncludeHankakuChar(value)) {
					isValid = false;
					if (typeof (rules.zenkaku) == 'object') {
						errorMessage = rules.zenkaku.error;
					}
				}
			}
		},
		number : function() {
			// 数値チェック
			if (value) {
				if (value.match(/[^0-9,\\.]/)) {
					isValid = false;
					if (typeof (rules.number) == 'object') {
						errorMessage = rules.number.error;
					}
				}
			}
		},
		date : function() {
			if (value) {
				// 日付の年月日が正しい場合のみ、フォーマットする
				var nowDate = new Date();
				var fullYear = new String(nowDate.getFullYear());
				var year = 0;
				var month = 0;
				var day = 0;
				if (rules.date.format) {
					var dateObj = InputValidator.parseDate(value,
							rules.date.format);
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
						year = parseInt(fullYear.substring(0, 2) + RegExp.$1,
								10);
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
					if (typeof (rules.date) == 'object') {
						errorMessage = rules.date.error;
					}
				}
			}
		},
		pattern : function() {
			// 正規表現チェック
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
				if (rules.pattern instanceof RegExp) {
					isValid = isPatternMatch(rules.pattern);
				} else if (typeof (rules.pattern) == 'object') {
					if (!isPatternMatch(rules.pattern.pattern)) {
						isValid = false;
						errorMessage = rules.pattern.error;
					}
				} else {
					isValid = isPatternMatch(rules.pattern);
				}
			}
		},
		minlength : function() {
			// 文字数下限チェック
			var minlength;
			if (typeof (rules.minlength) == 'object') {
				minlength = parseInt(rules.minlength.minlength, 10);
			} else {
				minlength = parseInt(rules.minlength, 10);
			}
			if (value.length < minlength) {
				isValid = false;
				if (typeof (rules.minlength) == 'object') {
					errorMessage = rules.minlength.error;
				}
			}
		},
		maxlength : function() {
			// 文字数上限チェック
			var maxlength;
			if (typeof (rules.maxlength) == 'object') {
				maxlength = parseInt(rules.maxlength.maxlength, 10);
			} else {
				maxlength = parseInt(rules.maxlength, 10);
			}
			if (value.length > maxlength) {
				isValid = false;
				if (typeof (rules.maxlength) == 'object') {
					errorMessage = rules.maxlength.error;
				}
			}
		},
		minchecked : function() {
			// 最小チェック数チェック
			var minchecked;
			if (typeof (rules.minchecked) == 'object') {
				minchecked = parseInt(rules.minchecked.minchecked, 10);
			} else {
				minchecked = parseInt(rules.minchecked, 10);
			}
			if (isArray && value.length < minchecked) {
				isValid = false;
				if (typeof (rules.minchecked) == 'object') {
					errorMessage = rules.minchecked.error;
				}
			}
		},
		maxchecked : function() {
			// 最大チェック数チェック
			var maxchecked;
			if (typeof (rules.maxchecked) == 'object') {
				maxchecked = parseInt(rules.maxchecked.maxchecked, 10);
			} else {
				maxchecked = parseInt(rules.maxchecked, 10);
			}
			if (isArray && value.length > maxchecked) {
				isValid = false;
				if (typeof (rules.maxchecked) == 'object') {
					errorMessage = rules.maxchecked.error;
				}
			}
		},
		min : function() {
			// 最小値チェック
			if (value) {
				var min;
				if (typeof (rules.min) == 'object') {
					min = parseInt(rules.min.min, 10);
				} else {
					min = parseInt(rules.min, 10);
				}
				if (value < min) {
					isValid = false;
					if (typeof (rules.min) == 'object') {
						errorMessage = rules.min.error;
					}
				}
			}
		},
		max : function() {
			// 最大値チェック
			if (value) {
				var max;
				if (typeof (rules.max) == 'object') {
					max = parseInt(rules.max.max, 10);
				} else {
					max = parseInt(rules.max, 10);
				}
				if (value > max) {
					isValid = false;
					if (typeof (rules.max) == 'object') {
						errorMessage = rules.max.error;
					}
				}
			}
		},
		func : function() {
			// オリジナル関数での入力チェック
			if (typeof (rules.func) == 'object') {
				var srcFunc, funcType, func, funcList, e;
				if (rules.func.constructor == Array) {
					funcList = rules.func;
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
								isValid = window[srcFunc.func]
										.call(this, value);
							}
						}
						if (!isValid) {
							errorMessage = srcFunc.error;
							break;
						}
					}
				} else {
					srcFunc = rules.func;
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
			} else if (typeof (rules.func) == 'function') {
				isValid = rules.func.call(this, value);
			} else if (typeof (rules.func) == 'string') {
				if (InputValidator.customEvent
						&& InputValidator.customEvent[rules.func]) {
					isValid = InputValidator.customEvent[rules.func].call(this,
							value);
				} else if (window[rules.func]) {
					isValid = window[rules.func].call(this, value);
				}
			}
		}
	};
	for ( var validateRule in rules) {
		var validator = validators[validateRule];
		if (validator) {
			validator.call(this);
		} else {
			alert('[' + validateRule + ']というチェックルールはありません。\n要素名[' + this.name
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
	var dateRegex = new RegExp(/yyyy|yy|MM|M|dd|d/);
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
			targetDate = targetDate.substring(val.index + val[0].length);
			return parseInt(val, 10);
		} else {
			return 0;
		}
	}
	for ( var i = 0, len = mList.length; i < len; i++) {
		var m = mList[i];
		switch (m) {
		case 'yyyy':
			year = getValue(/[0-9]{1,4}/);
			break;
		case 'yy':
			year = getValue(/[0-9]{1,2}/)
					+ (Math.floor(nowDate.getFullYear() / 100) * 100);
			break;
		case 'MM':
			month = getValue(/[0|1][0-9]/);
			break;
		case 'M':
			month = getValue(/[0|1]?[0-9]/);
			break;
		case 'dd':
			day = getValue(/[0-3][0-9]/);
			break;
		case 'd':
			day = getValue(/[0-3]?[0-9]/);
			break;
		default:
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
