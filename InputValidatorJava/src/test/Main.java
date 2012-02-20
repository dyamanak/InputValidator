package test;

import java.util.List;

import jp.co.cosmoroot.inputvalidator.ErrorElement;
import jp.co.cosmoroot.inputvalidator.InputValidatorJava;

public class Main {

	/**
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception {
		System.out.println("start");

		TestBean bean = new TestBean();
		bean.setName("１２３４５６７８９０1");
		bean.setZipcode("12345637");
		bean.setAge("38");
		bean.setEmail("aaaa@bbbb.com");
		bean.setHobby(new String[] { "テニス", "ドライブ" });

		InputValidatorJava validator = new InputValidatorJava();
		// validator.loadRuleScript("inputvalidator-rule.js", "UTF-8");
		List list = validator.validateBean(bean, "form1", "validation_conf.js",
				"UTF-8");
		for (int i = 0; i < list.size(); i++) {
			ErrorElement element = (ErrorElement) list.get(i);
			System.out.println(element.getName() + ":"
					+ element.getErrorMessage());
		}
		System.out.println("end");
	}

}
