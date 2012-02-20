package sample.inputvalidator;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import jp.co.cosmoroot.inputvalidator.ErrorElement;
import jp.co.cosmoroot.inputvalidator.InputValidatorJava;

import org.apache.struts.action.ActionErrors;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionMessage;
import org.apache.struts.action.ActionMessages;

public class SampleActionForm extends ActionForm {

	private static final long serialVersionUID = 1L;

	/** 名前 */
	private String name;

	/** 年齢 */
	private String age;

	/** E-Mail */
	private String email;

	/** 郵便番号 */
	private String zipcode;

	/** 住所 */
	private String address;

	/** 性別 */
	private String sex;

	/** 趣味 */
	private String[] hobby;

	/** 好きな動物 */
	private String animal;

	/** 備考欄 */
	private String etc;

	@Override
	public ActionErrors validate(ActionMapping mapping,
			HttpServletRequest request) {
		ActionErrors errors = new ActionErrors();
		List list = new InputValidatorJava().validateBean(this,
				"SampleActionForm", "./validation_conf.js", "UTF-8");
		for (int i = 0; i < list.size(); i++) {
			ErrorElement element = (ErrorElement) list.get(i);
			errors.add(ActionMessages.GLOBAL_MESSAGE,
					new ActionMessage(element.getErrorMessage(), false));
		}
		return errors;
	}

	@Override
	public void reset(ActionMapping mapping, HttpServletRequest request) {
		hobby = null;
	}

	/**
	 * 名前を取得します。
	 * 
	 * @return 名前
	 */
	public String getName() {
		return name;
	}

	/**
	 * 名前を設定します。
	 * 
	 * @param name
	 *            名前
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * 年齢を取得します。
	 * 
	 * @return 年齢
	 */
	public String getAge() {
		return age;
	}

	/**
	 * 年齢を設定します。
	 * 
	 * @param age
	 *            年齢
	 */
	public void setAge(String age) {
		this.age = age;
	}

	/**
	 * E-Mailを取得します。
	 * 
	 * @return E-Mail
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * E-Mailを設定します。
	 * 
	 * @param email
	 *            E-Mail
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * 郵便番号を取得します。
	 * 
	 * @return 郵便番号
	 */
	public String getZipcode() {
		return zipcode;
	}

	/**
	 * 郵便番号を設定します。
	 * 
	 * @param zipcode
	 *            郵便番号
	 */
	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}

	/**
	 * 住所を取得します。
	 * 
	 * @return 住所
	 */
	public String getAddress() {
		return address;
	}

	/**
	 * 住所を設定します。
	 * 
	 * @param address
	 *            住所
	 */
	public void setAddress(String address) {
		this.address = address;
	}

	/**
	 * 性別を取得します。
	 * 
	 * @return 性別
	 */
	public String getSex() {
		return sex;
	}

	/**
	 * 性別を設定します。
	 * 
	 * @param sex
	 *            性別
	 */
	public void setSex(String sex) {
		this.sex = sex;
	}

	/**
	 * 趣味を取得します。
	 * 
	 * @return 趣味
	 */
	public String[] getHobby() {
		return hobby;
	}

	/**
	 * 趣味を設定します。
	 * 
	 * @param hobby
	 *            趣味
	 */
	public void setHobby(String[] hobby) {
		this.hobby = hobby;
	}

	/**
	 * 好きな動物を取得します。
	 * 
	 * @return 好きな動物
	 */
	public String getAnimal() {
		return animal;
	}

	/**
	 * 好きな動物を設定します。
	 * 
	 * @param animal
	 *            好きな動物
	 */
	public void setAnimal(String animal) {
		this.animal = animal;
	}

	/**
	 * 備考欄を取得します。
	 * 
	 * @return 備考欄
	 */
	public String getEtc() {
		return etc;
	}

	/**
	 * 備考欄を設定します。
	 * 
	 * @param etc
	 *            備考欄
	 */
	public void setEtc(String etc) {
		this.etc = etc;
	}
}
