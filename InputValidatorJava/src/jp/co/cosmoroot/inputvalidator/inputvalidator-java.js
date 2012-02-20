/**
 * inputvalidator-java.js
 *
 * Version 3.00 beta
 *
 * MIT-style license. Copyright(C) 2012 Daisuke Yamanaka All Rights Reserved.
 * (http://www.bi3d.com)
 */
var InputValidator = {
	validateBean : function(bean, formName) {
		var errorElmenetList = [];
		var formRules = InputValidator.configure[formName];
		if (formRules) {
			for ( var key in formRules) {
				if (key === 'hashCode' || key === 'toString'
						|| key === 'getClass') {
					continue;
				}
				var isArray;
				var declaredField = bean.getClass().getDeclaredField(key);
				if (declaredField.type && declaredField.type.array) {
					isArray = true;
				} else {
					isArray = false;
				}
				if (isArray) {
					var value = bean[key] || [];
				} else {
					var value = '' + (bean[key] || '');
				}
				var srcElement = {
					form : bean,
					name : key,
					value : value
				};
				var rules = formRules[key];
				if (rules) {
					var result = InputValidator.validateRule.call(srcElement,
							value, rules);
					if (!result.isValid) {
						errorElmenetList.push({
							name : key,
							errorMessage : result.errorMessage
						});
					}
				}
			}
		}
		return errorElmenetList;
	}
}
alert = function(mes){
	java.lang.System.out.println(mes);
};