/**
 * -------------------------------------------------------- suggest.js - Input
 * Suggest Version 2.2 (Update 2010/09/14)
 *
 * Copyright (c) 2006-2010 onozaty (http://www.enjoyxstudy.com)
 *
 * Released under an MIT-style license.
 *
 * For details, see the web site: http://www.enjoyxstudy.com/javascript/suggest/
 *
 * --------------------------------------------------------
 *
 * modified by dyamanak 2012/03/10 http://www.bi3d.com/
 *
 * Released under an MIT-style license.
 *
 * --------------------------------------------------------
 */

if (!Suggest) {
	var Suggest = {};
}
/*-- KeyCodes -----------------------------------------*/
Suggest.Key = {
	TAB : 9,
	RETURN : 13,
	ESC : 27,
	UP : 38,
	DOWN : 40
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
		this.candidateList = candidateList;
		this.oldText = this.getInputText();
		this.isDisplaySuggestArea = false;

		if (arguments[3])
			this.setOptions(arguments[3]);

		// reg event
		this._addEvent(this.input, 'focus', this._bind(this.checkLoop));
		this._addEvent(this.input, 'blur', this._bind(this.inputBlur));
		this._addEvent(this.input, 'mousedown', this
				._bindEvent(this.mousedownEvent));

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
	prefix : false,
	ignoreCase : true,
	highlight : true,
	dispAllKey : true,
	classMouseOver : 'over',
	classSelect : 'suggest_select',
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

		setTimeout(this._bind(this.clearSuggestArea), 300);
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

		if (text == '' || text == null)
			return;

		this.hookBeforeSearch(text);
		var resultList = this._search(text);
		if (resultList.length != 0)
			this.createSuggestArea(resultList);
	},

	_search : function(text) {

		var resultList = [];
		var temp;
		this.suggestIndexList = [];

		for ( var i = 0, length = this.candidateList.length; i < length; i++) {
			if ((temp = this.isMatch(this.candidateList[i], text)) != null) {
				resultList.push(temp);
				this.suggestIndexList.push(i);

				if (this.dispMax != 0 && resultList.length >= this.dispMax)
					break;
			}
		}
		return resultList;
	},

	isMatch : function(value, pattern) {

		if (value == null)
			return null;

		var pos = (this.ignoreCase) ? value.toLowerCase().indexOf(
				pattern.toLowerCase()) : value.indexOf(pattern);

		if ((pos == -1) || (this.prefix && pos != 0))
			return null;

		if (this.highlight) {
			return (this._escapeHTML(value.substr(0, pos)) + '<strong>'
					+ this._escapeHTML(value.substr(pos, pattern.length))
					+ '</strong>' + this._escapeHTML(value.substr(pos
					+ pattern.length)));
		} else {
			return this._escapeHTML(value);
		}
	},

	clearSuggestArea : function() {
console.log('clearSuggestArea');
		this.isDisplaySuggestArea = false;
		this.suggestArea.innerHTML = '';
		this.suggestArea.style.display = 'none';
		this.suggestList = null;
		this.suggestIndexList = null;
		this.activePosition = null;
	},

	createSuggestArea : function(resultList) {
console.log('createSuggestArea');
		this.suggestList = [];
		this.inputValueBackup = this.input.value;

		for ( var i = 0, length = resultList.length; i < length; i++) {
			var element = document.createElement('div');
			element.innerHTML = resultList[i];
			this.suggestArea.appendChild(element);

			this
					._addEvent(element, 'click', this._bindEvent(
							this.listClick, i));
			this._addEvent(element, 'mouseover', this._bindEvent(
					this.listMouseOver, i));
			this._addEvent(element, 'mouseout', this._bindEvent(
					this.listMouseOut, i));

			this.suggestList.push(element);
		}

		this.suggestArea.style.display = '';
		this.suggestArea.scrollTop = 0;
		this.isDisplaySuggestArea = true;
	},

	getInputText : function() {
		return this.input.value;
	},

	setInputText : function(text) {
		this.input.value = text;
	},

	// mousedown event
	mousedownEvent : function(event) {
console.log('mousedownEvent');
		if (this.isDisplaySuggestArea) {
			this.clearSuggestArea();
		} else {
			this._stopEvent(event);
			this.keyEventDispAll();
		}
	},

	// key event
	keyEvent : function(event) {
console.log('keyEvent');

		if (!this.timerId) {
			this.timerId = setTimeout(this._bind(this.checkLoop), this.interval);
		}

		if (this.dispAllKey
				&& this.getInputText() == ''
				&& !this.suggestList
				&& (event.keyCode == Suggest.Key.UP || event.keyCode == Suggest.Key.DOWN)) {
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
		} else {
			this.keyEventOther(event);
		}
	},

	keyEventDispAll : function() {
console.log('keyEventDispAll');

		// init
		this.clearSuggestArea();

		this.oldText = this.getInputText();

		this.suggestIndexList = [];
		for ( var i = 0, length = this.candidateList.length; i < length; i++) {
			this.suggestIndexList.push(i);
		}

		this.createSuggestArea(this.candidateList);
	},

	keyEventMove : function(keyCode) {
console.log('keyEventMove');

		this.changeUnactive();

		if (keyCode == Suggest.Key.UP) {
			// up
			if (this.activePosition == null) {
				this.activePosition = this.suggestList.length - 1;
			} else {
				this.activePosition--;
				if (this.activePosition < 0) {
					this.activePosition = null;
					this.input.value = this.inputValueBackup;
					this.suggestArea.scrollTop = 0;
					return;
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
				this.activePosition = null;
				this.input.value = this.inputValueBackup;
				this.suggestArea.scrollTop = 0;
				return;
			}
		}

		this.setStyleActive(this.suggestList[this.activePosition]);
	},

	keyEventReturn : function() {
console.log('keyEventReturn');

		this
				.setInputText(this.candidateList[this.suggestIndexList[this.activePosition]]);
		this.clearSuggestArea();
		this.moveEnd();
	},

	keyEventEsc : function() {
console.log('keyEventEsc');

		this.clearSuggestArea();
		this.input.value = this.inputValueBackup;
		this.oldText = this.getInputText();

		if (window.opera)
			setTimeout(this._bind(this.moveEnd), 5);
	},

	keyEventOther : function(event) {
	},

	changeActive : function(index) {
console.log('changeActive');

		this.setStyleActive(this.suggestList[index]);

		this.setInputText(this.candidateList[this.suggestIndexList[index]]);

		this.oldText = this.getInputText();
		this.input.focus();
	},

	changeUnactive : function() {
console.log('changeUnactive');

		if (this.suggestList != null && this.suggestList.length > 0
				&& this.activePosition != null) {
			this.setStyleUnactive(this.suggestList[this.activePosition]);
		}
	},

	listClick : function(event, index) {
console.log('listClick');

		this.changeUnactive();
		this.activePosition = index;
		this.changeActive(index);

		this.moveEnd();
	},

	listMouseOver : function(event, index) {
		this.setStyleMouseOver(this._getEventElement(event));
	},

	listMouseOut : function(event, index) {

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
		// element.className = this.classSelect;
		var style = element.style;
		style.color = '#FFFFFF';
		style.backgroundColor = '#316AC5';

		// auto scroll
		var offset = element.offsetTop;
		var offsetWithHeight = offset + element.clientHeight;

		if (this.suggestArea.scrollTop > offset) {
			this.suggestArea.scrollTop = offset
		} else if (this.suggestArea.scrollTop + this.suggestArea.clientHeight < offsetWithHeight) {
			this.suggestArea.scrollTop = offsetWithHeight
					- this.suggestArea.clientHeight;
		}
	},

	setStyleUnactive : function(element) {
		// element.className = '';
		var style = element.style;
		style.color = '';
		style.backgroundColor = '';
	},

	setStyleMouseOver : function(element) {
		// element.className = this.classMouseOver;
		var style = element.style;
		style.color = '#FFFFFF';
		style.backgroundColor = '#316AC5';
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
		suggestStyle.width = inputElementSize.width + 'px';
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

InputValidator.pluginRules.datalist = function(value, rules) {
	return true;
};
