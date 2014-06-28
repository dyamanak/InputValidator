package sample.inputvalidator.listener;

import org.apache.commons.beanutils.expression.DefaultResolver;

public class SafeResolver extends DefaultResolver {
	public String next(String expression) {
		String property = super.next(expression);
		if ("class".equalsIgnoreCase(property) && !property.equals(expression)) {
			return "";
		}
		return property;
	}
}
