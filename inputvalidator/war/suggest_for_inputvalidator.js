/**
 * -------------------------------------------------------- suggest.js - Input
 * Suggest Version 2.1 (Update 2008/04/02)
 *
 * Copyright (c) 2006-2008 onozaty (http://www.enjoyxstudy.com)
 *
 * Released under an MIT-style license.
 *
 * For details, see the web site: http://www.enjoyxstudy.com/javascript/suggest/
 *
 * modified by yaneuao 2009.03 http://lab.yaneu.com/
 *
 * modified by dyamanak 2012.03 http://www.bi3d.com/
 *
 * --------------------------------------------------------
 */

if (!Suggest) {
	var Suggest = {};
}
/*-- KeyCodes -----------------------------------------*/
// キーコード : http://www.openspc2.org/reibun/javascript/appendix/keydown.html
Suggest.Key = {
	TAB : 9,
	RETURN : 13,
	ESC : 27,
	UP : 38,
	DOWN : 40,
	LEFT : 37,
	RIGHT : 39,
	PAGEUP : 33,
	PAGEDOWN : 34
};

/*-- Utils --------------------------------------------*/
Suggest.copyProperties = function(dest, src) {
	for ( var property in src) {
		dest[property] = src[property];
	}
	return dest;
};

/*-- Suggest.Local ------------------------------------*/
Suggest.Local = function() {
	this.initialize.apply(this, arguments);
};
Suggest.Local.prototype = {
	initialize : function(input, candidateList) {

		this.input = this._getElement(input);
		this.suggestArea = this.createSuggestElement(this.input);
		this.candidateList = [];
		for ( var i = 0, len = candidateList.length; i < len; i++) {
			var candidate = candidateList[i];
			if (!(candidate instanceof Array)) {
				candidate = [ candidate ];
			}
			this.candidateList.push(candidate);
		}
		this.oldText = this.getInputText();

		if (arguments[3])
			this.setOptions(arguments[3]);

		// reg event
		this._addEvent(this.input, 'focus', this._bind(this.checkLoop));
		this._addEvent(this.input, 'blur', this._bind(this.inputBlur));

		var keyevent = 'keydown';
		if (window.opera
				|| (navigator.userAgent.indexOf('Gecko') >= 0 && navigator.userAgent
						.indexOf('KHTML') == -1)) {
			keyevent = 'keypress';
		}
		this._addEvent(this.input, keyevent, this._bindEvent(this.keyEvent));

		// init
		this.clearSuggestArea();
	},

	// options
	interval : 100,
	dispMax : 30,
	listTagName : 'div',
	prefix : false,
	ignoreCase : true,
	highlight : true,
	dispAllKey : true,
	classMouseOver : 'over',
	classSelect : 'select',
	// ctrl + ↓でdisplay allらしい。
	// これやめて、候補がなければ↓だけで出てくるように。

	onSelect : function(index) {
	}, // 選択したときに呼び出される。
	hookBeforeSearch : function() {
	},

	setOptions : function(options) {
		Suggest.copyProperties(this, options);
	},

	inputBlur : function() {

		this.changeUnactive();
		this.oldText = this.getInputText();

		if (this.timerId)
			clearTimeout(this.timerId);
		this.timerId = null;

		setTimeout(this._bind(this.clearSuggestArea), 500);
	},

	checkLoop : function() {
		var text = this.getInputText();
		if (text != this.oldText) {
			this.oldText = text;
			this.search();
		}
		if (this.timerId)
			clearTimeout(this.timerId);
		this.timerId = setTimeout(this._bind(this.checkLoop), this.interval);
	},

	search : function() {

		// init
		this.clearSuggestArea();

		var text = this.getInputText();

		// if (text == '' || text == null) return;

		this.hookBeforeSearch(text);
		var resultList = this._search(text);
		if (resultList != 0)
			this.createSuggestArea(resultList);
	},

	_search : function(text) {

		var resultList = [];
		var temp;
		this.suggestIndexList = [];

		// 全角スペースを半角化して、それでSplitをかける。
		var textParsed = text.replace(/　/g, ' ').split(' ');
		if (this.ignoreCase) {
			for ( var i = 0; i < textParsed.length; ++i)
				textParsed[i] = textParsed[i].toLowerCase();
		}

		for ( var i = 0, length = this.candidateList.length; i < length; i++) {
			if ((temp = this.isMatch(this.candidateList[i], textParsed)) != null) {
				resultList.push(temp);

				// まだあろうが、全列挙しておく。
				/*
				 * if (this.dispMax != 0 && resultList.length >= this.dispMax) { //
				 * 表示個数プラス一個見つかった。 etcExist = true; break; }
				 */

				this.suggestIndexList.push(i);

				// if (this.dispMax != 0 && resultList.length > this.dispMax)
				// break;
			}
		}

		return resultList;
	},

	// 一致するの判定。valueはデータベースの文字列
	// patternは入力された文字列の配列
	// 'ABC DEF'ならpattern = ['ABC','DEF'].

	isMatch : function(value, pattern) {

		// 入力項目がなければ一覧を表示するモードなら一覧を表示する。
		if (this.displayAuto && pattern.length == 1 && pattern[0] == '') {
			return this._escapeHTML(value[0]);
		}

		if (value == null)
			return null;

		// value=''なら、候補がないということなので候補を表示してやる。

		// これマッチングの判定なので、ここを改造する。
		{

			// 文字列の検索
			var found = -1;
			// var pos = [];

			// just matchなら、これは除外する
			if (pattern != value[0]) {
				for ( var i = 0; i < value.length; ++i) {
					var v = (this.ignoreCase) ? value[i].toLowerCase()
							: value[i];

					if (v == '')
						continue;

					found = -1;
					for ( var j = 0; j < pattern.length; ++j) {
						if (pattern[j] == '') {
							// pos[j] = -1;
							continue; // これはマッチしたと扱う。
						}

						found = v.indexOf(pattern[j]);
						if (found == -1)
							break;

						// alert(i+'/'+j+':'+value[i]
						// +','+pattern[j]+','+found);
						// pos[j] = found;

					}
					if (found != -1)
						break;
				}
			}

			// 結果書き出し
		}

		if ((found == -1) || (this.prefix && found != 0))
			return null;

		// 一致部分をハイライト
		if (this.highlight && i == 0) {
			// var pos = found;
			// 一致部分をすべて列挙すべきだが、これが結構難しいので保留。
			// return (this._escapeHTML(value[0].substr(0, pos)) + '<strong>'
			// + this._escapeHTML(value[0].substr(pos, pattern[0].length))
			// + '</strong>' + this._escapeHTML(value[0].substr(pos +
			// pattern[0].length)));
			// ↓修正。

			var v = value[0];
			// この文字列のうち、pattern[N]を含む部分を強調する。

			for ( var i = 0; i < pattern.length; ++i) {
				v = v
						.replace(pattern[i], "<strong>" + pattern[i]
								+ "</strong>");
			}

			return v;

		} else {
			return this._escapeHTML(value[0]);
		}
	},

	clearSuggestArea : function() {
		this.suggestArea.innerHTML = '';
		this.suggestArea.style.display = 'none';
		this.suggestList = null;
		this.suggestIndexList = null;
		this.activePosition = null;
		// これは、suggestエリアの上から何番目かを意味している。
		// ページを送っても、上から何番目かを意味しているので、
		// this.pageCounter*this.dispMaxを加算した値がsuggestListのindex
	},

	pageCounter : 0, // 候補の表示させているページ
	resultForRedraw : [], // 再描画用のcache

	redraw : function() {
		this.suggestArea.innerHTML = '';
		this.suggestArea.style.display = 'none';
		// this.suggestList = null;
		// this.suggestIndexList = null;
		this.activePosition = 0;
		this.createSuggestArea(this.resultForRedraw);
	},

	// suggest listの生成
	createSuggestArea : function(resultList) {

		// !== では同一のinstanceかどうかを判定できないのか?
		if (this.resultForRedraw !== resultList) {
			// 再描画要求ではないのでページカウンタをリセット
			this.PageCounter = 0;
			this.resultForRedraw = resultList;
		}

		this.suggestList = [];
		this.inputValueBackup = this.input.value;

		var counter = 0;
		var etcExist = false;

		// 上の!==ではリセットされていなかったりするんだな
		if (this.getPageMax() < this.pageCounter) {
			this.pageCounter = 0;
		}

		for ( var i = this.pageCounter * this.dispMax, length = resultList.length; i < length; i++) {
			counter++;
			if (this.dispMax < counter) {
				etcExist = true;
				break;
			}

			var element = document.createElement(this.listTagName);
			element.innerHTML = resultList[i];
			this.suggestArea.appendChild(element);

			// ここハンドラとしてiが返っていいのか？うーむ..
			this
					._addEvent(element, 'click', this._bindEvent(
							this.listClick, i));
			this._addEvent(element, 'mouseover', this._bindEvent(
					this.listMouseOver, i));
			this._addEvent(element, 'mouseout', this._bindEvent(
					this.listMouseOut, i));

			this.suggestList.push(element);
		}

		if (this.pageCounter != 0) {
			var element = document.createElement(this.listTagName);
			element.innerHTML = "<div style='padding-left:50px;background-color:LightCyan'>[PageUp]   前ページ</div>";
			this.suggestArea.appendChild(element);
		}

		// まだあるらしいで
		if (etcExist) {
			var element = document.createElement(this.listTagName);
			element.innerHTML = "<div style='padding-left:50px;background-color:LightCyan'>[PageDown]  次ページ</div>";
			this.suggestArea.appendChild(element);
		}

		if (this.pageCounter != 0 || etcExist) {
			var element = document.createElement(this.listTagName);
			element.innerHTML = "<div align='right' style='background-color:LightCyan'>"
					+ (this.pageCounter + 1)
					+ "/"
					+ (this.getPageMax() + 1)
					+ "</div>";
			this.suggestArea.appendChild(element);
		}

		this.suggestArea.style.display = '';
	},

	getInputText : function() {
		return this.input.value;
	},

	setInputText : function(text) {
		this.input.value = text;
	},

	// key event
	keyEvent : function(event) {

		if (!this.timerId) {
			this.timerId = setTimeout(this._bind(this.checkLoop), this.interval);
		}

		// ctrlいらんわ。
		if (this.dispAllKey /* && event.ctrlKey */
				&& this.getInputText() == '' && !this.suggestList
				&& event.keyCode == Suggest.Key.DOWN) {
			// dispAll
			this._stopEvent(event);
			this.keyEventDispAll();
		} else if (event.keyCode == Suggest.Key.UP
				|| event.keyCode == Suggest.Key.DOWN) {
			// key move
			if (this.suggestList && this.suggestList.length != 0) {
				this._stopEvent(event);
				this.keyEventMove(event.keyCode);
			}
		} else if (event.keyCode == Suggest.Key.RETURN) {
			// fix
			if (this.suggestList && this.suggestList.length != 0) {
				this._stopEvent(event);
				this.keyEventReturn();
			}
		} else if (event.keyCode == Suggest.Key.ESC) {
			// cancel
			if (this.suggestList && this.suggestList.length != 0) {
				this._stopEvent(event);
				this.keyEventEsc();
			}
		} else if (event.keyCode == Suggest.Key.PAGEDOWN) {
			if (this.isNextPageExist()) {
				this.pageCounter++;
				this.activePosition = 0;
				this.redraw();
				this.changeActive(this.activePosition);
			}
		} else if (event.keyCode == Suggest.Key.PAGEUP) {
			if (this.isPrevPageExist()) {
				this.pageCounter--;
				this.activePosition = 0;
				this.redraw();
				this.changeActive(this.activePosition);
			}
		} else {
			this.keyEventOther(event);
		}
	},

	// 最終ページは何ページ目なのか
	getPageMax : function() {
		return pageMax = Math.ceil(this.resultForRedraw.length / this.dispMax) - 1;
	},

	// 次ページが存在するのか。
	isNextPageExist : function() {

		return this.resultForRedraw.length != 0
				&& this.pageCounter < this.getPageMax();
	},
	// 前ページが存在するのか
	isPrevPageExist : function() {
		return this.pageCounter >= 1;
	},

	keyEventDispAll : function() {

		// init
		this.clearSuggestArea();

		this.oldText = this.getInputText();

		this.suggestIndexList = [];
		for ( var i = 0, length = this.candidateList.length; i < length; i++) {
			this.suggestIndexList.push(i);
		}

		// これこのまま表示でけへんのか。
		var candidateList_ = [];

		for ( var i = 0, length = this.candidateList.length; i < length; i++) {
			candidateList_[i] = this.candidateList[i][0];
		}

		this.createSuggestArea(candidateList_);
	},

	keyEventMove : function(keyCode) {

		this.changeUnactive();

		if (keyCode == Suggest.Key.UP) {
			// up
			if (this.activePosition == null) {
				this.activePosition = this.suggestList.length - 1;
			} else {
				this.activePosition--;
				if (this.activePosition < 0) {
					if (this.isPrevPageExist()) {
						this.pageCounter--;
						this.redraw();
						this.activePosition = this.dispMax - 1;
					} else {
						if (this.resultForRedraw.length != 0) {
							this.pageCounter = this.getPageMax();
							this.redraw();
							this.activePosition = (this.resultForRedraw.length - 1)
									% this.dispMax;
						} else {
							this.activePosition = null;
							this.input.value = this.inputValueBackup;
							return;
						}
					}
				}
			}
		} else {
			// down
			if (this.activePosition == null) {
				this.activePosition = 0;
			} else {
				this.activePosition++;
			}

			if (this.activePosition >= this.suggestList.length) {
				if (this.isNextPageExist()) {
					this.pageCounter++;
					this.activePosition = 0;
					this.redraw();
				} else {
					if (this.resultForRedraw.length != 0) { // スタート地点に戻す
						this.pageCounter = 0;
						this.activePosition = 0;
						this.redraw();
					} else {
						this.pageCounter = 0;
						this.activePosition = null;
						this.input.value = this.inputValueBackup;
						return;
					}
				}
			}
		}

		this.changeActive(this.activePosition);
	},

	keyEventReturn : function() {

		this.clearSuggestArea();
		this.moveEnd();
	},

	keyEventEsc : function() {

		this.clearSuggestArea();
		this.input.value = this.inputValueBackup;
		this.oldText = this.getInputText();

		if (window.opera)
			setTimeout(this._bind(this.moveEnd), 5);
	},

	keyEventOther : function(event) {
	},

	changeActive : function(index) {

		this.setStyleActive(this.suggestList[index]);

		// オフセットの補整
		index += this.pageCounter * this.dispMax;
		// 元リストの何番目かを求める。
		index = this.suggestIndexList[index];

		// ここで選択されていたものを設定している。indexが選択されていたもの。
		this.setInputText(this.candidateList[index][0]);
		// この時にコールバックが書けるようにしておく。

		// 選択されたのでcallbackしてみる。
		this.onSelect(index);

		this.oldText = this.getInputText();
		this.input.focus();
	},

	changeUnactive : function() {

		if (this.suggestList != null && this.suggestList.length > 0
				&& this.activePosition != null) {
			this.setStyleUnactive(this.suggestList[this.activePosition]);
		}
	},

	listClick : function(event, index) {

		index = index % this.dispMax;

		this.changeUnactive();
		this.activePosition = index;
		this.changeActive(index);

		this.moveEnd();
	},

	listMouseOver : function(event, index) {
		this.setStyleMouseOver(this._getEventElement(event));
	},

	listMouseOut : function(event, index) {
		index = index % this.dispMax;

		if (!this.suggestList)
			return;

		var element = this._getEventElement(event);

		if (index == this.activePosition) {
			this.setStyleActive(element);
		} else {
			this.setStyleUnactive(element);
		}
	},

	setStyleActive : function(element) {
		element.className = this.classSelect;
	},

	setStyleUnactive : function(element) {
		element.className = '';
	},

	setStyleMouseOver : function(element) {
		element.className = this.classMouseOver;
	},

	moveEnd : function() {

		if (this.input.createTextRange) {
			this.input.focus(); // Opera
			var range = this.input.createTextRange();
			range.move('character', this.input.value.length);
			range.select();
		} else if (this.input.setSelectionRange) {
			this.input.setSelectionRange(this.input.value.length,
					this.input.value.length);
		}
	},

	createSuggestElement : function(inputElement) {
		var suggestElement = document.createElement('div');
		var suggestStyle = suggestElement.style;
		suggestStyle.display = '';
		suggestStyle.zIndex = inputElement.style.zIndex + 1;
		suggestStyle.position = 'absolute';
		suggestStyle.cursor = 'default';
		suggestStyle.color = '#000';
		suggestStyle.backgroundColor = '#fff';
		suggestStyle.textAlign = 'left';
		inputElement.parentNode.appendChild(suggestElement);
		var inputElementOffset = InputValidator._getOffset(inputElement);
		var inputElementSize = InputValidator._getSize(inputElement);
		suggestStyle.left = inputElementOffset.left + 'px';
		suggestStyle.top = (inputElementOffset.top + inputElementSize.height)
				+ 'px';
		suggestStyle.display = 'none';
		return suggestElement;
	},

	// Utils
	_getElement : function(element) {
		return (typeof element == 'string') ? document.getElementById(element)
				: element;
	},
	_addEvent : (window.addEventListener ? function(element, type, func) {
		element.addEventListener(type, func, false);
	} : function(element, type, func) {
		element.attachEvent('on' + type, func);
	}),
	_stopEvent : function(event) {
		if (event.preventDefault) {
			event.preventDefault();
			event.stopPropagation();
		} else {
			event.returnValue = false;
			event.cancelBubble = true;
		}
	},
	_getEventElement : function(event) {
		return event.target || event.srcElement;
	},
	_bind : function(func) {
		var self = this;
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			func.apply(self, args);
		};
	},
	_bindEvent : function(func) {
		var self = this;
		var args = Array.prototype.slice.call(arguments, 1);
		return function(event) {
			event = event || window.event;
			func.apply(self, [ event ].concat(args));
		};
	},
	_escapeHTML : function(value) {
		return value.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(
				/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
	}
};

/*-- Suggest.LocalMulti ---------------------------------*/
Suggest.LocalMulti = function() {
	this.initialize.apply(this, arguments);
};
Suggest.copyProperties(Suggest.LocalMulti.prototype, Suggest.Local.prototype);

Suggest.LocalMulti.prototype.delim = ' '; // delimiter

Suggest.LocalMulti.prototype.keyEventReturn = function() {

	this.clearSuggestArea();
	this.input.value += this.delim;
	this.moveEnd();
};

Suggest.LocalMulti.prototype.keyEventOther = function(event) {

	if (event.keyCode == Suggest.Key.TAB) {
		// fix
		if (this.suggestList && this.suggestList.length != 0) {
			this._stopEvent(event);

			if (!this.activePosition) {
				this.activePosition = 0;
				this.changeActive(this.activePosition);
			}

			this.clearSuggestArea();
			this.input.value += this.delim;
			if (window.opera) {
				setTimeout(this._bind(this.moveEnd), 5);
			} else {
				this.moveEnd();
			}
		}
	}
};

Suggest.LocalMulti.prototype.listClick = function(event, index) {

	this.changeUnactive();
	this.activePosition = index;
	this.changeActive(index);

	this.input.value += this.delim;
	this.moveEnd();
};

Suggest.LocalMulti.prototype.getInputText = function() {

	var pos = this.getLastTokenPos();

	if (pos == -1) {
		return this.input.value;
	} else {
		return this.input.value.substr(pos + 1);
	}
};

Suggest.LocalMulti.prototype.setInputText = function(text) {

	var pos = this.getLastTokenPos();

	if (pos == -1) {
		this.input.value = text;
	} else {
		this.input.value = this.input.value.substr(0, pos + 1) + text;
	}
};

Suggest.LocalMulti.prototype.getLastTokenPos = function() {
	return this.input.value.lastIndexOf(this.delim);
};

InputValidator.validationRules.list = function(value, rules) {
	return true;
}
