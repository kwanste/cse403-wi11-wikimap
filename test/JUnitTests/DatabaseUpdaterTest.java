package test.JUnitTests;

import java.util.*;
import junit.framework.*;
import org.junit.*;
import org.junit.Test;
import communication.DatabaseUpdater;

public class DatabaseUpdaterTest extends TestCase {
	private final int testArrayLength = 5;
	private String[] articleArray;
	private Map<String, Integer>[] relatedArticleArray;
	private String[] previewTextArray;
	private String[] imageURLArray;
	private Random rand;

	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		// Initialize  article names
		
		// Initialize some strength values
	}
	
	@Test
	// Iterates through the arrays of values and tests different values
	private void runTestArrays(String test) {
		// Test with all other values 
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			if (test.equals("updateRelevantNodes")) {
				Map<String, Integer> relatedArticle = relatedArticleArray[i];
				DatabaseUpdater.updateRelevantNodes(article, relatedArticle);
			} else if (test.equals("updatePreviewText")) {
				String previewText = previewTextArray[i];
				DatabaseUpdater.updatePreviewText(article, previewText);
			} else if (test.equals("updateImageURL")) {
				String imageURL = imageURLArray[i];
				DatabaseUpdater.updateImageURL(article, imageURL);
			} else if (test.equals("removeArticle")) {
				DatabaseUpdater.RemoveArticle(article);
			}
		}
	}
	
	public void testUpdateRelevantNodes() {
		//  Null inputs
		DatabaseUpdater.updateRelevantNodes(null, null);
		// Test all other options
		runTestArrays("updateRelevantNodes");
	}
	
	@Test
	public void testUpdatePreviewText() {
		// Null inputs
		DatabaseUpdater.updatePreviewText(null, null);
		// Test all other options
		runTestArrays("updatePreviewText");
	}
	
	@Test
	public void testUpdateImageURL() {
		// Null inputs
		DatabaseUpdater.updatePreviewText(null, null);
		// Test all other options
		runTestArrays("updateImageURL");
	}
	
	@Test
	public void testRemoveArticle() {
		// Null inputs
		DatabaseUpdater.updatePreviewText(null, null);
		// Test all other options
		runTestArrays("removeArticle");
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
	
	public static TestSuite suite(){
		TestSuite suite = new TestSuite();
		suite.addTest(new DatabaseUpdaterTest());
		return suite;
	}

}
