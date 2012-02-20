package jp.co.cosmoroot.inputvalidator;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class InputValidatorJava {

	private boolean debugMode;
	private String ruleScript;

	public InputValidatorJava() {
		this.debugMode = false;
	}

	public InputValidatorJava(boolean debugMode) {
		this.debugMode = debugMode;
	}

	public void loadRuleScript(String ruleScriptFilename, String encoding) {
		ruleScript = loadFile(ruleScriptFilename, encoding);
	}

	public List validateBean(Object bean, String formName,
			String validationFilename, String encoding) {

		String inputValidatorScript = loadResource("inputvalidator-java.js",
				"UTF-8");
		if (null == ruleScript || 0 == ruleScript.length()) {
			ruleScript = loadResource("inputvalidator-rule.js", "UTF-8");
		}
		String validationScript = loadFile(validationFilename, encoding);

		try {
			Context cx = getContext();
			Scriptable globalScope = cx.initStandardObjects();
			Scriptable localScope = cx.newObject(globalScope);
			localScope.setPrototype(globalScope);
			localScope.setParentScope(null);
			cx.evaluateString(localScope, inputValidatorScript,
					"inputvalidator-java.js", 1, null);
			cx.evaluateString(localScope, ruleScript, "inputvalidator-rule.js",
					1, null);
			cx.evaluateString(localScope, validationScript, "validationScript",
					1, null);

			Object beanObject = Context.javaToJS(bean, localScope);
			ScriptableObject.putProperty(globalScope, "__bean", beanObject);

			NativeArray result = (NativeArray) cx.evaluateString(localScope,
					"InputValidator.validateBean(__bean, '" + formName + "');",
					"validationScript", 1, null);

			List errorList = new ArrayList();
			for (int i = 0; i < result.size(); i++) {
				NativeObject obj = (NativeObject) result.get(i);
				ErrorElement error = new ErrorElement();
				error.setName((String) obj.get("name"));
				error.setErrorMessage((String) obj.get("errorMessage"));
				errorList.add(error);
			}

			return errorList;

		} finally {
			Context.exit();
		}

	}

	private Context getContext() {
		ContextFactory contextFactory = new ContextFactory();
		if (debugMode) {
			final org.mozilla.javascript.tools.debugger.Main debugger = new org.mozilla.javascript.tools.debugger.Main(
					"InputValidatorJava Debugger");
			debugger.attachTo(contextFactory);
			debugger.pack();
			debugger.setSize(1000, 800);
			debugger.setVisible(true);
			debugger.setBreakOnEnter(true);
			debugger.setExitAction(new Runnable() {
				public void run() {
					debugger.dispose();
				}
			});
		}
		Context cx = contextFactory.enterContext();
		return cx;
	}

	private String loadResource(String resourcePath, String encode) {
		BufferedReader bufferReader = null;
		StringBuffer s = new StringBuffer();
		String buf;
		try {
			bufferReader = new BufferedReader(new InputStreamReader(this
					.getClass().getResourceAsStream(resourcePath), encode));
			while ((buf = bufferReader.readLine()) != null) {
				s.append(buf);
				s.append("\r\n");
			}
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		} catch (FileNotFoundException e) {
			throw new RuntimeException(e);
		} catch (IOException e) {
			throw new RuntimeException(e);
		} finally {
			try {
				if (bufferReader != null) {
					bufferReader.close();
				}
			} catch (Exception e) {
			}
		}
		return new String(s);
	}

	private String loadFile(String filePath, String encoding) {
		BufferedReader bufferReader = null;
		StringBuffer s = new StringBuffer();
		String buf;
		try {
			bufferReader = new BufferedReader(new InputStreamReader(
					new FileInputStream(filePath), encoding));
			while ((buf = bufferReader.readLine()) != null) {
				s.append(buf);
				s.append("\r\n");
			}
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		} catch (FileNotFoundException e) {
			throw new RuntimeException(e);
		} catch (IOException e) {
			throw new RuntimeException(e);
		} finally {
			try {
				if (bufferReader != null) {
					bufferReader.close();
				}
			} catch (Exception e) {
			}
		}
		return new String(s);
	}
}
