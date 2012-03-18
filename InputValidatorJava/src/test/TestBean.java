package test;

import java.io.Serializable;

public class TestBean implements Serializable {

	/**
	 *
	 */
	private static final long serialVersionUID = 1L;

	private String name = "12345678";

	private String age = "20";

	private String email = "test@test.com";

	private String zipcode = "9876543";

	private String zipcode2 = "9876543";

	private String[] hobby = { "drive", "movie" };

	private String date1 = "2012/03/17";

	private String date2 = "20120317";

	private String date3 = "0317";

	private String hankaku1 = "abcde";

	private String zenkaku1 = "ａｂｃｄｅ";

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
	 * zipcode2を取得します。
	 * 
	 * @return zipcode2
	 */
	public String getZipcode2() {
		return zipcode2;
	}

	/**
	 * zipcode2を設定します。
	 * 
	 * @param zipcode2
	 *            zipcode2
	 */
	public void setZipcode2(String zipcode2) {
		this.zipcode2 = zipcode2;
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
	 * date1を取得します。
	 * 
	 * @return date1
	 */
	public String getDate1() {
		return date1;
	}

	/**
	 * date1を設定します。
	 * 
	 * @param date1
	 *            date1
	 */
	public void setDate1(String date1) {
		this.date1 = date1;
	}

	/**
	 * date2を取得します。
	 * 
	 * @return date2
	 */
	public String getDate2() {
		return date2;
	}

	/**
	 * date2を設定します。
	 * 
	 * @param date2
	 *            date2
	 */
	public void setDate2(String date2) {
		this.date2 = date2;
	}

	/**
	 * date3を取得します。
	 * 
	 * @return date3
	 */
	public String getDate3() {
		return date3;
	}

	/**
	 * date3を設定します。
	 * 
	 * @param date3
	 *            date3
	 */
	public void setDate3(String date3) {
		this.date3 = date3;
	}

	/**
	 * hankaku1を取得します。
	 * 
	 * @return hankaku1
	 */
	public String getHankaku1() {
		return hankaku1;
	}

	/**
	 * hankaku1を設定します。
	 * 
	 * @param hankaku1
	 *            hankaku1
	 */
	public void setHankaku1(String hankaku1) {
		this.hankaku1 = hankaku1;
	}

	/**
	 * zenkaku1を取得します。
	 * 
	 * @return zenkaku1
	 */
	public String getZenkaku1() {
		return zenkaku1;
	}

	/**
	 * zenkaku1を設定します。
	 * 
	 * @param zenkaku1
	 *            zenkaku1
	 */
	public void setZenkaku1(String zenkaku1) {
		this.zenkaku1 = zenkaku1;
	}

}
