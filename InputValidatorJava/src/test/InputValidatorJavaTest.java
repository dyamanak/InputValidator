package test;

import java.util.List;

import jp.co.cosmoroot.inputvalidator.ErrorElement;
import jp.co.cosmoroot.inputvalidator.InputValidatorJava;
import junit.framework.TestCase;

public class InputValidatorJavaTest extends TestCase {

	public void testValidateBean() {

		TestBean bean;
		List list;

		/**
		 * test required
		 */
		bean = new TestBean();
		bean.setName("");
		bean.setHobby(new String[] {});
		list = validate(bean);
		assertEquals(2, list.size());

		/**
		 * test minlength, maxlength
		 */
		bean = new TestBean();
		bean.setName("1234567890");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setName("12345678901");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setName("12345");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setName("1234");
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test number, min, max
		 */
		bean = new TestBean();
		bean.setAge("");
		list = validate(bean);
		assertEquals(0, list.size());

		bean = new TestBean();
		bean.setAge("0");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setAge("100");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setAge("-1");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setAge("101");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setAge("abc");
		list = validate(bean);
		assertEquals(1, list.size());

		bean = new TestBean();
		bean.setAge("1.23");
		list = validate(bean);
		assertEquals(0, list.size());

		bean = new TestBean();
		bean.setAge(".23");
		list = validate(bean);
		assertEquals(0, list.size());

		bean = new TestBean();
		bean.setAge("1.2.3.4.5");
		list = validate(bean);
		assertEquals(1, list.size());

		bean = new TestBean();
		bean.setAge("1,234"); // 金額の区切り文字（,）はエラーとみなす
		list = validate(bean);
		assertEquals(1, list.size());

		bean = new TestBean();
		bean.setAge("02"); // 8進数
		list = validate(bean);
		assertEquals(0, list.size());

		bean = new TestBean();
		bean.setAge("0x10"); // 16進数
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test email
		 */
		bean = new TestBean();
		bean.setEmail("");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setEmail("abc");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setEmail("abc@test");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setEmail("abc@test.com");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setEmail("abc@test.com.com");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setEmail("abc@test@com.com");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setEmail("abc＠test．com");
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test pattern
		 */
		bean = new TestBean();
		bean.setZipcode("");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setZipcode("1234567");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setZipcode("12345678");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setZipcode("123-4567");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setZipcode("abc");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setZipcode("１２３４５６７");
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test minchecked, maxchecked
		 */
		bean = new TestBean();
		bean.setHobby(new String[] { "1" });
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setHobby(new String[] { "1", "2" });
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setHobby(new String[] { "1", "2", "3" });
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setHobby(new String[] { "1", "2", "3", "4" });
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setHobby(new String[] {});
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setHobby(null);
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test custom rule
		 */
		bean = new TestBean();
		bean.setZipcode2("1234567");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setZipcode2("12345678");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setZipcode2("abcdefg");
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test date
		 */
		bean = new TestBean();
		bean.setDate1("");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setDate1("2012/03/17");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setDate1("2012/3/17");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("2012-03-17");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("2012/3/32");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("2012/13/01");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("20012/01/01");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("2012/01/02/03");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("9999/01/01");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setDate1("2012/01/00");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("2012-01-02");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate1("20120317");
		list = validate(bean);
		assertEquals(1, list.size());

		bean = new TestBean();
		bean.setDate2("20120317");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setDate2("2012317");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate2("2012/03/17");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate2("20120332");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate2("20121301");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate2("0317");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate2("317");
		list = validate(bean);
		assertEquals(1, list.size());

		bean = new TestBean();
		bean.setDate3("0317");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setDate3("0332");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate3("1301");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate3("317");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate3("2012/03/17");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate3("20120317");
		list = validate(bean);
		assertEquals(1, list.size());

		bean.setDate3("03/17");
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test hankaku
		 */
		bean = new TestBean();
		bean.setHankaku1("");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setHankaku1("あいうえお");
		list = validate(bean);
		assertEquals(1, list.size());

		/**
		 * test zenkaku
		 */
		bean = new TestBean();
		bean.setZenkaku1("");
		list = validate(bean);
		assertEquals(0, list.size());

		bean.setZenkaku1("abcde");
		list = validate(bean);
		assertEquals(1, list.size());

	}

	private List validate(TestBean bean) {
		InputValidatorJava validator = new InputValidatorJava();
		// validator.loadRuleScript("inputvalidator-rule.js", "UTF-8");
		List list = validator.validateBean(bean, "form1", "validation_conf.js",
				"UTF-8");
		for (int i = 0; i < list.size(); i++) {
			ErrorElement element = (ErrorElement) list.get(i);
			System.out.println(element.getName() + ":"
					+ element.getErrorMessage());
		}
		return list;
	}

}
