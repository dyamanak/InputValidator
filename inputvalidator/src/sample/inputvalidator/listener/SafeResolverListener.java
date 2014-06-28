package sample.inputvalidator.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.commons.beanutils.BeanUtilsBean;

public class SafeResolverListener implements ServletContextListener {

	public void contextInitialized(ServletContextEvent event) {
		SafeResolver resolver = new SafeResolver();
		BeanUtilsBean.getInstance().getPropertyUtils().setResolver(resolver);
	}

	public void contextDestroyed(ServletContextEvent event) {
	}
}
