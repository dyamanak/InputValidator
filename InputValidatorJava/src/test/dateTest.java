package test;

import java.util.List;

import jp.co.cosmoroot.inputvalidator.ErrorElement;
import jp.co.cosmoroot.inputvalidator.InputValidatorJava;
import junit.framework.TestCase;

public class dateTest extends TestCase {

	public void testValidateBean() {

		TestBean bean;
		List list;

		/**
		 * test date
		 */
		bean = new TestBean();
		bean.setDate2("2012/03/17");
		list = validate(bean);
		assertEquals(1, list.size());

	}

	private List validate(TestBean bean) {
		InputValidatorJava validator = new InputValidatorJava(true);
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
