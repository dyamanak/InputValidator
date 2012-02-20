package jp.co.cosmoroot.inputvalidator;

import java.io.Serializable;

public class ErrorElement implements Serializable {

	/**
	 *
	 */
	private static final long serialVersionUID = 1L;

	private String name;

	private String errorMessage;

	/**
	 * nameを取得します。
	 * 
	 * @return name
	 */
	public String getName() {
		return name;
	}

	/**
	 * nameを設定します。
	 * 
	 * @param name
	 *            name
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * errorMessageを取得します。
	 * 
	 * @return errorMessage
	 */
	public String getErrorMessage() {
		return errorMessage;
	}

	/**
	 * errorMessageを設定します。
	 * 
	 * @param errorMessage
	 *            errorMessage
	 */
	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

}
