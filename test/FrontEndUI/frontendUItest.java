import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.SeleneseTestCase;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.server.SeleniumServer;

public class FrontendUITest extends SeleneseTestCase {
	
	private SeleniumServer server;
		
	@Before
	public void setUp() throws Exception {
		server = new SeleniumServer();
		server.start();
		selenium = new DefaultSelenium("localhost", 4444, "*firefox", "http://iprojsrv.cs.washington.edu/");
		selenium.start();
		}

	// Search that returns a specific article on Wikipedia.
	@Test 
	public void testOneArticle() throws Exception {
		selenium.open("/");
		selenium.type("search", "Bill Gates");
		selenium.click("go");
		selenium.waitForPageToLoad("30000");
		verifyTrue(selenium.isTextPresent("October 28, 1955"));
		verifyEquals("Bill Gates", selenium.getValue("search"));
	}

	// Misspelled query.
	@Test
	public void testMisspelled() throws Exception {
		selenium.open("/");
		selenium.type("search", "Bil Gate");
		selenium.click("go");
		selenium.waitForPageToLoad("30000");
		verifyTrue(selenium.isTextPresent("Bill Gates"));
		verifyTrue(selenium.isTextPresent("Article Not Found"));		
		String src = selenium.getAttribute("xpath=//*[@id='thumbnailImage']@src");
		verifyTrue(src.endsWith("images/image_not_found.png"));	
	}
		
	@After
	public void tearDown() throws Exception {
		selenium.stop();
		server.stop();
	}
}
