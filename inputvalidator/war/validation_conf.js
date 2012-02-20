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
				return false;
			}
		},
		onReset : function(evt) {
			if (confirm('入力内容をリセットします。よろしいですか？')) {
				document.getElementById('editFlag1').innerHTML = '未編集';
				return true;
			} else {
				return false;
			}
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
