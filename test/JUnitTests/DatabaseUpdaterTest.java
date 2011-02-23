package test.JUnitTests;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import communication.DatabaseUpdater;

public class DatabaseUpdaterTest extends WikiMapTestCase {
	/* Test data structures */
	private String[] articleArray;
	private ArrayList<Map<String,Integer>> relatedArticleArray;
	private String[] previewTextArray;
	private String[] imageURLArray;
	
	/* Duplicate Data Test Data Structures */
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		// Initialize article name array
		articleArray = new String[3];
		articleArray[0] = "articleTest0";
		articleArray[1] = "articleTest1";
		articleArray[2] = "articleTest2";
		
		// Initialize strength values
		relatedArticleArray = new ArrayList<Map<String, Integer>>();
		
		HashMap<String, Integer> articleTest0ra = new HashMap<String, Integer>();
		articleTest0ra.put("at00", 1);
		articleTest0ra.put("at01", 1);
		articleTest0ra.put("at02", 1);
		relatedArticleArray.add(articleTest0ra);
		
		HashMap<String, Integer> articleTest1ra = new HashMap<String, Integer>();
		articleTest1ra.put("at10", 1);
		articleTest1ra.put("at11", 1);
		articleTest1ra.put("at12", 1);
		relatedArticleArray.add(articleTest1ra);
		
		HashMap<String, Integer> articleTest2ra = new HashMap<String, Integer>();
		articleTest2ra.put("at20", 1);
		articleTest2ra.put("at21", 1);
		articleTest2ra.put("at22", 1);
		relatedArticleArray.add(articleTest2ra);
				
		// Initialize preview text array
		previewTextArray = new String[3];
		previewTextArray [0] = "previewArticleTest0";
		previewTextArray [1] = "previewArticleTest1";
		previewTextArray [2] = "previewArticleTest2";
		
		// Initialize image URL array
		imageURLArray = new String[3];
		imageURLArray [0] = "http://www.google.com/images/logos/ps_logo2.png";
		imageURLArray [1] = "http://www.google.com/images/logos/ps_logo2.png";
		imageURLArray [2] = "http://www.google.com/images/logos/ps_logo2.png";
	}
	
	/*
	 * Tests the all DatabaseUpdater methods with null data.
	 * Null data should not be able to be added to the database.
	 * Methods should be able to handle the null case.
	 */
	@Test
	public void testNullQueries() {
		// Get the size of the database before
		int relations_before = super.getTableSize(super.RELATIONS_TABLE);
		int summary_before = getTableSize(super.SUMMARY_TABLE);
		int image_before = getTableSize(super.IMG_TABLE);
		
		// Attempt to query with null values
		DatabaseUpdater.updateRelevantNodes(super._con, null, null);
		DatabaseUpdater.updatePreviewText(super._con, null, null, false); 
		DatabaseUpdater.updateImageURL(super._con, null, null);
		DatabaseUpdater.RemoveArticle(super._con, null);
		
		// All tables should be the same size afterward
		assertTrue(relations_before == getTableSize(super.RELATIONS_TABLE));
		assertTrue(summary_before == getTableSize(super.SUMMARY_TABLE));
		assertTrue(image_before == getTableSize(super.IMG_TABLE));
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdateRelevantNodes method.
	 * Test will add new relevancy data to RelatedArticles table.  
	 * Data should be searchable.
	 */
	@Test
	public void testAddRelevantNodes() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
				Map<String, Integer> relatedArticle = relatedArticleArray.get(i);
				DatabaseUpdater.updateRelevantNodes(super._con, article, relatedArticle);
				
				// Ensure that the article is in the DB
				assertTrue(super.searchDBForArticle(article, super.RELATIONS_TABLE));
				
				// Ensure that the proper relation information is in the DB
				assertTrue(super.searchDBForRelated(article, relatedArticle));
		}
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdatePreviewText method.
	 * Tests will add new preview texts to the ArticleSummary table.
	 * Data should be searchable.
	 */
	@Test
	public void testAddPreviewText() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String previewText = previewTextArray[i];
			DatabaseUpdater.updatePreviewText(super._con, article, previewText, false);
			// Ensure that the article is in the DB
			assertTrue(super.searchDBForArticle(article, super.SUMMARY_TABLE));
			// Ensure that the proper summary information is in the DB
			assertTrue(super.searchDBForData(article, SUMMARY_COL, previewText, super.SUMMARY_TABLE));
		}
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdateImageURL method.
	 * Tests will add new image urls to the ArticleImageURL table.
	 */
	@Test
	public void testAddImageURL() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String imageURL = imageURLArray[i];
			DatabaseUpdater.updateImageURL(super._con, article, imageURL);
			// Ensure that the article is in the DB
			assertTrue(super.searchDBForArticle(article, super.IMG_TABLE));
			// Ensure that the proper URL information is in the DB
			assertTrue(super.searchDBForData(article, super.IMG_URL_COL, imageURL, super.IMG_TABLE));
		}
	}
	
	/*
	 * Tests the DatabaseUpdater.updateRelevant method.
	 * Given that there already exists an article with relevant nodes,
	 * Update the relevant nodes and verify.
	 */
	@Test
	public void testUpdateRelevantNodes() {
		
	}
	
	@Test
	/*
	 * Tests the DatabaseUpdater.updatePreviewText method.
	 * Given that there already exists an article with preview text,
	 * Update the text and verify.
	 */
	public void testUpdatePreviewText() {
		
	}
	
	
	/*
	 * Tests the DatabaseUpdater.updateImageURL method.
	 * Given that there already exists an article with the image URL,
	 * Update the image url and verify.
	 */
	@Test
	public void testUpdateImageURL() {
		
	}
	
	/* 
	 * Tests the DatabaseUpdater.RemoveArticle method.
	 * Adds and then deletes a series of articles from the database, verifying that they
	 * were removed correctly.  This should update all tables that have the article 
	 * title in it.
	 */
	@Test
	public void testRemoveArticle() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			
			// Add the article to each table
			DatabaseUpdater.updateRelevantNodes(super._con, article, relatedArticleArray.get(i));
			DatabaseUpdater.updatePreviewText(super._con, article, previewTextArray[i], false);
			DatabaseUpdater.updateImageURL(super._con, article, imageURLArray[i]);
			
			// Remove the article from the database
			DatabaseUpdater.RemoveArticle(super._con, article);
			
			// Ensure that the article is NOT in the DB
			assertFalse(super.searchDBForArticle(article, super.RELATIONS_TABLE));
			assertFalse(super.searchDBForArticle(article, super.SUMMARY_TABLE));
			assertFalse(super.searchDBForArticle(article, super.IMG_TABLE));
		}
	}

	/*
	 * Tests the DatabaseUpdater.updatePreviewText method.
	 * Test behavior if we insert titles that are much longer than db can allow.
	 * Article titles should truncate or error. Final behavior has not been defined.
	 * TODO: Define this behavior
	 */
	@Test
	public void testLongTitleTruncate() { 
		// Construct maximum string and extended string
		String testTitle = super.createXString(super.MAX_ARTICLE_NAME);
		String testTitleExtended = testTitle + "1";
		
		// Insert the article
		DatabaseUpdater.updatePreviewText(super._con, testTitle, "test", false);
		
		// Ensure
		assertFalse(super.searchDBForArticle(testTitleExtended, super.SUMMARY_TABLE));
		assertTrue(super.searchDBForArticle(testTitle, super.SUMMARY_TABLE));
	}

	/*
	 * Tests the DatabaseUpdater.updatePreviewText method.
	 * Test behavior if we insert article previews that are longer than the allowed amount.
	 * Article previews should truncate or error. Final behavior has not been defined.
	 * TODO: Define this behavior
	 */
	@Test
	public void testLongArticlePreviewTruncate() { 
		// Construct maximum string and extended string
		String testPreview = super.createXString(super.MAX_ARTICLE_NAME);
		String testPreviewExtended = testPreview + "1";
		
		// Insert the article
		DatabaseUpdater.updatePreviewText(super._con, "-a", testPreview, false);
		
		// Ensure
		assertFalse(super.searchDBForData("-a", super.SUMMARY_COL, testPreviewExtended, super.SUMMARY_TABLE));
		assertTrue(super.searchDBForData("-a", super.SUMMARY_COL, testPreview, super.SUMMARY_TABLE));
	}
	
	/* 
	 * Tests the DatabaseUpdater.updateImageUrl
	 * Test behavior if we insert URL's that are longer than they should be
	 * Article image URLs should truncate or error. Final behavior has not been defined.
	 * TODO: Define this behavior
	 */
	@Test
	public void testLongURLTruncate() {
		String testURL = super.createXString(super.MAX_ARTICLE_URL);
		String testURLExtended = testURL + "1";
		
		DatabaseUpdater.updateImageURL(super._con, "-a", testURLExtended);
		
		assertFalse(super.searchDBForData("-a", super.IMG_URL_COL, testURLExtended, super.IMG_TABLE));
		assertTrue(super.searchDBForData("-a", super.IMG_URL_COL, testURL, super.IMG_TABLE));
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
	
}
