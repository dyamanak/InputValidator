// 入力チェック設定
InputValidator.configure = {
	form1 : {
		name : {
			placeholder : '必須入力',
			autofocus : true,
			readonly : true,
			required : {
				error : '氏名が入力されていません。'
			},
			minlength : {
				minlength : 5,
				error : '氏名を5文字以上で入力してください。'
			},
			maxlength : {
				maxlength : 10,
				error : '氏名を10文字以内で入力してください。'
			}
		},
		age : {
			number : {
				error : '年齢を数値で入力してください。'
			},
			min : {
				min : 0,
				error : '年齢は0～100の範囲で入力してください。'
			},
			max : {
				max : 100,
				error : '年齢は0～100の範囲で入力してください。'
			}
		},
		email : {
			email : {
				error : 'E-Mailアドレスを正しく入力してください。'
			}
		},
		zipcode : {
			pattern : {
				pattern : /^\d+$/,
				error : '郵便番号を数字で入力してください。'
			},
			func : {
				func : 'isValidZipCode',
				error : '郵便番号を7桁の数字で入力してください。'
			}
		},
		zipcode2 : {
			zipcode : true,
			error : '郵便番号を7桁の数字で入力してください。'
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
		date1 : {
			date : {
				format : 'yyyy/MM/dd'
			},
			error : '誕生日は日付を入力してください。'
		},
		date2 : {
			date : {
				format : 'yyyyMMdd'
			},
			error : '誕生日は日付を入力してください。'
		},
		date3 : {
			date : {
				format : 'MMdd'
			},
			error : '誕生日は日付を入力してください。'
		},
		hankaku1 : {
			hankaku : true,
			error : '半角で入力してください。'
		},
		zenkaku1 : {
			zenkaku : true,
			error : '全角で入力してください。'
		}
	}
};
InputValidator.customEvent = {
	form1 : {
		onSubmit : function(evt) {
			if (confirm("入力内容を送信します。よろしいですか？")) {
				alert("送信");
				$("editFlag1").innerHTML = "未編集";
				return true;
			} else {
				return false;
			}
		},
		onReset : function(evt) {
			if (confirm("入力内容をリセットします。よろしいですか？")) {
				$("editFlag1").innerHTML = "未編集";
				return true;
			} else {
				return false;
			}
		},
		onChange : function() {
			$("editFlag1").innerHTML = "編集中";
		}
	},
	isValidZipCode : function(value) {
		if (value) {
			return (/^(\d{7})$/.test(value));
		} else {
			return true;
		}
	}
};
InputValidator.validationRules.zipcode = function(value, rules) {
	if (value) {
		return (/^(\d{7})$/.test(value));
	} else {
		return true;
	}
};
