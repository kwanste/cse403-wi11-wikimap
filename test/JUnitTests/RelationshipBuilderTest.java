package test.JUnitTests;

/*
 * Series of unit tests specifically for the logic.RelationshipBuilder.
 * Tests functionality according to the descriptions in the SDS and group 
 * discussion.
 */

import java.util.*;
import org.junit.*;
import org.junit.Test;
import logic.ArticleVector;
import logic.RelationshipBuilder;

public class RelationshipBuilderTest extends WikiMapTestCase {
	private Map<String, ArticleVector> parsedArticlesValid;
	private Map<String, ArticleVector> parsedArticlesInvalid;

	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		/* Set up the valid test inputs */
		parsedArticlesValid = new HashMap<String, ArticleVector>();
		generateArticleVectorMap(parsedArticlesValid, true);
		
		/* Set up the invalid (null) test inputs */
		parsedArticlesInvalid = new HashMap<String, ArticleVector>();
		generateArticleVectorMap(parsedArticlesInvalid, false);
	}
	
	/*
	 * Generates some arbitrary test articles with test links
	 * if validValues is false, vectors with null "articleName" fields 
	 * and links with null "articleName" and "links" fields are used
	 */
	private void generateArticleVectorMap(Map<String,ArticleVector> map, boolean validValues) {
		// Create some arbitrary test articles with test links
		for (int i = 0; i < TEST_SAMPLE_SIZE; i++) {
			ArticleVector testVector;
			ArticleVector link;
			List<String> tempLinks = new ArrayList<String>();
			
			// Construct the list of links
			// Each vector will be related to articles with the names
			// "testLink#" where # is the values TEST_SAMPLE_SIZE to TEST_SAMPLE_SIZE*2-1
			for (int j = TEST_SAMPLE_SIZE; j < TEST_SAMPLE_SIZE*2; j++) {
				link = new ArticleVector(); 
				if (validValues) { 
				link.setArticleName("testLink" + j);
				// add this article to the list of linked articles
				tempLinks.add(link.getArticleName());
				
				// no third-degree relationships
				//temp2.links = new ArrayList<String>();
				} else {
					link.setArticleName(null);
					link.setLinks(null);
				}
			}
			
			// construct a test vector with the above links
			testVector = new ArticleVector();
			
			if (validValues) {
				testVector.setArticleName("testVector" + i);
			} else {
				testVector.setArticleName(null);
			}
			
			testVector.setLinks(tempLinks);
			
			// Add vector to the map
			// Vectors have the names "testVector#" where #
			// is the values 0 ... TEST_SAMPLE_SIZE-1
			map.put(testVector.getArticleName(), testVector);
		}
	}
	
	@Test
	public void testBuildWithValidData() {
		RelationshipBuilder.build(parsedArticlesValid);
		
		// TODO: Check the database to confirm that the data was added correctly
	}
	
	@Test
	public void testBuildWithInvalidData() {
		RelationshipBuilder.build(parsedArticlesInvalid);
		
		// TODO: Check the database to confirm that the data was not added
		// or was somehow handled elegantly
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
}
