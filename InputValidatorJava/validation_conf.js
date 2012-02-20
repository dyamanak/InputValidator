// 入力チェック設定
InputValidator.configure = {
	form1 : {
		name : {
			placeholder : '必須入力',
			required : {
				error : '氏名が入力されていません。'
			},
			maxlength : {
				maxlength : 10,
				error : '氏名を10文字以内で入力してください。'
			}
		},
		age : {
			placeholder : '必須入力',
			required : {
				error : '年齢が入力されていません。'
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
			placeholder : '必須入力',
			required : {
				error : 'E-Mailアドレスが入力されていません。'
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
			pattern : {
				pattern : /^\d+$/,
				error : '郵便番号を数字で入力してください。'
			},
			func : {
				func : 'isValidZipCode',
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
				error : '性別を必ず選択してください。'
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
				error : '好きな動物を必ず選択してください。'
			}
		},
		etc : {
			placeholder : '必須入力',
			required : {
				error : '備考欄を必ず入力してください。'
			},
			maxlength : {
				maxlength : 100,
				error : '備考欄を100文字以内で入力してください。'
			}
		}
	}
};

// 送信・リセット・変更時イベント設定
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
