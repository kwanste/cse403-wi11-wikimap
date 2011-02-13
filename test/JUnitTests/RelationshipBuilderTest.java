package test.JUnitTests;

import java.util.Map;

import junit.framework.*;
import org.junit.*;
import org.junit.Test;
import logic.ArticleVector;

public class RelationshipBuilderTest extends TestCase {
	private Map<String, ArticleVector> parsedArticlesValid;
	private Map<String, ArticleVector> parsedArticlesInvalid;

	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		// Initialize all test arrays
	}
	
	@Test
	public void testBuild() {
	
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
}
