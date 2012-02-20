package test;

import java.io.Serializable;

public class TestBean implements Serializable {

	/**
	 *
	 */
	private static final long serialVersionUID = 1L;

	private String name;

	private String age;

	private String email;

	private String zipcode;

	private String address;

	private String sex;

	private String[] hobby;

	private String[] animal;

	private String etc;

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
	 * ageを取得します。
	 * 
	 * @return age
	 */
	public String getAge() {
		return age;
	}

	/**
	 * ageを設定します。
	 * 
	 * @param age
	 *            age
	 */
	public void setAge(String age) {
		this.age = age;
	}

	/**
	 * emailを取得します。
	 * 
	 * @return email
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * emailを設定します。
	 * 
	 * @param email
	 *            email
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * zipcodeを取得します。
	 * 
	 * @return zipcode
	 */
	public String getZipcode() {
		return zipcode;
	}

	/**
	 * zipcodeを設定します。
	 * 
	 * @param zipcode
	 *            zipcode
	 */
	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}

	/**
	 * addressを取得します。
	 * 
	 * @return address
	 */
	public String getAddress() {
		return address;
	}

	/**
	 * addressを設定します。
	 * 
	 * @param address
	 *            address
	 */
	public void setAddress(String address) {
		this.address = address;
	}

	/**
	 * sexを取得します。
	 * 
	 * @return sex
	 */
	public String getSex() {
		return sex;
	}

	/**
	 * sexを設定します。
	 * 
	 * @param sex
	 *            sex
	 */
	public void setSex(String sex) {
		this.sex = sex;
	}

	/**
	 * hobbyを取得します。
	 * 
	 * @return hobby
	 */
	public String[] getHobby() {
		return hobby;
	}

	/**
	 * hobbyを設定します。
	 * 
	 * @param hobby
	 *            hobby
	 */
	public void setHobby(String[] hobby) {
		this.hobby = hobby;
	}

	/**
	 * animalを取得します。
	 * 
	 * @return animal
	 */
	public String[] getAnimal() {
		return animal;
	}

	/**
	 * animalを設定します。
	 * 
	 * @param animal
	 *            animal
	 */
	public void setAnimal(String[] animal) {
		this.animal = animal;
	}

	/**
	 * etcを取得します。
	 * 
	 * @return etc
	 */
	public String getEtc() {
		return etc;
	}

	/**
	 * etcを設定します。
	 * 
	 * @param etc
	 *            etc
	 */
	public void setEtc(String etc) {
		this.etc = etc;
	}

}
