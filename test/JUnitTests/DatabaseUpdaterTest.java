package test.JUnitTests;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import communication.DatabaseConnection;
import communication.DatabaseUpdater;

public class DatabaseUpdaterTest extends WikiMapTestCase {
// Kimberly is adding a random change
	
	/* Test database connection */
	private Connection _con;
	
	/* Test data structures */
	private String[] articleArray;
	private ArrayList<Map<String,Integer>> relatedArticleArray;
	private String[] previewTextArray;
	private String[] imageURLArray;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		_con = DatabaseConnection.getConnection(
				"localhost",
				"wikiwrite",
				"WikipediaMaps123",
				"wikimapsdb_unit_test");
		
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
		articleTest0ra.put("at10", 1);
		articleTest0ra.put("at11", 1);
		articleTest0ra.put("at12", 1);
		relatedArticleArray.add(articleTest1ra);
		
		HashMap<String, Integer> articleTest2ra = new HashMap<String, Integer>();
		articleTest0ra.put("at20", 1);
		articleTest0ra.put("at21", 1);
		articleTest0ra.put("at22", 1);
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
	 */
	@Test
	public void testNullQueries() {
		// Get the size of the database before
		int relations_before = super.getTableSize(super.RELATIONS_TABLE);
		int summary_before = getTableSize(super.SUMMARY_TABLE);
		int image_before = getTableSize(super.IMG_TABLE);
		
		// Attempt to query with null values
		DatabaseUpdater.updateRelevantNodes(_con, null, null);
		DatabaseUpdater.updatePreviewText(_con, null, null, false); 
		DatabaseUpdater.updateImageURL(_con, null, null);
		DatabaseUpdater.RemoveArticle(_con, null);
		
		// All tables should be the same size afterward
		assertTrue(relations_before == getTableSize(super.RELATIONS_TABLE));
		assertTrue(summary_before == getTableSize(super.SUMMARY_TABLE));
		assertTrue(image_before == getTableSize(super.IMG_TABLE));
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdateRelevantNodes method.
	 */
	@Test
	public void testUpdateRelevantNodes() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
				Map<String, Integer> relatedArticle = relatedArticleArray.get(i);
				DatabaseUpdater.updateRelevantNodes(_con, article, relatedArticle);
				
				// Ensure that the article is in the DB
				assertTrue(super.searchDBForArticle(article, super.RELATIONS_TABLE));
				
				// Ensure that the proper relation information is in the DB
				assertTrue(super.searchDBForRelated(article, relatedArticle));
		}
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdatePreviewText method.
	 */
	@Test
	public void testUpdatePreviewText() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String previewText = previewTextArray[i];
			DatabaseUpdater.updatePreviewText(_con, article, previewText, false);
			// Ensure that the article is in the DB
			assertTrue(super.searchDBForArticle(article, super.SUMMARY_TABLE));
			// Ensure that the proper summary information is in the DB
			assertTrue(super.searchDBForData(article, SUMMARY_COL, previewText, super.SUMMARY_TABLE));
		}
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdateImageURL method.
	 */
	@Test
	public void testUpdateImageURL() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String imageURL = imageURLArray[i];
			DatabaseUpdater.updateImageURL(_con, article, imageURL);
			// Ensure that the article is in the DB
			assertTrue(super.searchDBForArticle(article, super.IMG_TABLE));
			// Ensure that the proper URL information is in the DB
			assertTrue(super.searchDBForData(article, super.IMG_URL_COL, imageURL, super.IMG_TABLE));
		}
	}
	
	@Test
	/* 
	 * Adds and then deletes a series of articles from the database, verifying that they
	 * were removed correctly.
	 */
	public void testRemoveArticle() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			
			// Add the article to each table
			DatabaseUpdater.updateRelevantNodes(_con, article, relatedArticleArray.get(i));
			DatabaseUpdater.updatePreviewText(_con, article, previewTextArray[i], false);
			DatabaseUpdater.updateImageURL(_con, article, imageURLArray[i]);
			
			// Remove the article from the database
			DatabaseUpdater.RemoveArticle(_con, article);
			
			// Ensure that the article is NOT in the DB
			assertFalse(super.searchDBForArticle(article, super.RELATIONS_TABLE));
			assertFalse(super.searchDBForArticle(article, super.SUMMARY_TABLE));
			assertFalse(super.searchDBForArticle(article, super.IMG_TABLE));
		}
	}

	@Test
	/*
	 * Test behavior if we insert titles that are much longer than db can allow.
	 */
	public void testLongTitleTruncate() { 
		// Construct maximum string and extended string
		String testTitle = super.createXString(super.MAX_ARTICLE_NAME);
		String testTitleExtended = testTitle + "1";
		
		// Insert the article
		DatabaseUpdater.updatePreviewText(_con, testTitle, "test", false);
		
		// Ensure
		assertFalse(super.searchDBForArticle(testTitleExtended, super.SUMMARY_TABLE));
		assertTrue(super.searchDBForArticle(testTitle, super.SUMMARY_TABLE));
	}

	@Test
	/*
	 * Test behavior if we insert article previews that are longer than the allowed amount.
	 */
	public void testLongArticlePreviewTruncate() { 
		// Construct maximum string and extended string
		String testPreview = super.createXString(super.MAX_ARTICLE_NAME);
		String testPreviewExtended = testPreview + "1";
		
		// Insert the article
		DatabaseUpdater.updatePreviewText(_con, "-a", testPreview, false);
		
		// Ensure
		assertFalse(super.searchDBForData("-a", super.SUMMARY_COL, testPreviewExtended, super.SUMMARY_TABLE));
		assertTrue(super.searchDBForData("-a", super.SUMMARY_COL, testPreview, super.SUMMARY_TABLE));
	}
	
	@Test
	/*
	 * Test behavior if we insert URL's that are longer than they should be
	 */
	public void testLongURLTruncate() {
		String testURL = super.createXString(super.MAX_ARTICLE_URL);
		String testURLExtended = testURL + "1";
		
		DatabaseUpdater.updateImageURL(_con, "-a", testURLExtended);
		
		assertFalse(super.searchDBForData("-a", super.IMG_URL_COL, testURLExtended, super.IMG_TABLE));
		assertTrue(super.searchDBForData("-a", super.IMG_URL_COL, testURL, super.IMG_TABLE));
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
	
}
