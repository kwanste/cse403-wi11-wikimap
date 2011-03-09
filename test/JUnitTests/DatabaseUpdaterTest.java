package test.JUnitTests;

/*
 * Series of unit tests specifically for the communication.DatabaseUpdater.
 * Tests functionality according to the descriptions in the SDS and group 
 * discussion.
 */

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import communication.DatabaseUpdater;

public class DatabaseUpdaterTest extends WikiMapTestCase {
	/* Test data structures */
	
	/* inserts */
	private String[] articleArray;
	private ArrayList<Map<String,Integer>> relatedArticleArray;
	private String[] previewTextArray;
	private String[] imageURLArray;
	
	/* updates */
	/* do not need the articleArray to have updated text since that is the primary key */
	private ArrayList<Map<String,Integer>> relatedArticleUpdateArray;
	private String[] previewTextUpdateArray;
	private String[] imageURLUpdateArray;
	
	/* Duplicate Data Test Data Structures */
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		// Initialize article name array used for INSERTs
		articleArray = new String[3];
		articleArray[0] = "articleTest0";
		articleArray[1] = "articleTest1";
		articleArray[2] = "articleTest2";
		
		// Initialize strength values used for INSERTs
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
				
		// Initialize preview text array used for INSERTs
		previewTextArray = new String[3];
		previewTextArray [0] = "previewArticleTest0";
		previewTextArray [1] = "previewArticleTest1";
		previewTextArray [2] = "previewArticleTest2";
		
		// Initialize image URL array used for INSERTs
		imageURLArray = new String[3];
		imageURLArray [0] = "http://www.google.com/images/logos/ps_logo2.png";
		imageURLArray [1] = "http://www.google.com/images/logos/ps_logo2.png";
		imageURLArray [2] = "http://www.google.com/images/logos/ps_logo2.png";

		
		// Initialize strength values used for UPDATEs
		relatedArticleUpdateArray = new ArrayList<Map<String, Integer>>();
		
		HashMap<String, Integer> articleUpdateTest0ra = new HashMap<String, Integer>();
		articleUpdateTest0ra.put("aut00", 1);
		articleUpdateTest0ra.put("aut01", 1);
		articleUpdateTest0ra.put("aut02", 1);
		relatedArticleUpdateArray.add(articleUpdateTest0ra);
		
		HashMap<String, Integer> articleUpdateTest1ra = new HashMap<String, Integer>();
		articleUpdateTest1ra.put("aut10", 1);
		articleUpdateTest1ra.put("aut11", 1);
		articleUpdateTest1ra.put("aut12", 1);
		relatedArticleUpdateArray.add(articleUpdateTest1ra);
		
		HashMap<String, Integer> articleUpdateTest2ra = new HashMap<String, Integer>();
		articleUpdateTest2ra.put("aut20", 1);
		articleUpdateTest2ra.put("aut21", 1);
		articleUpdateTest2ra.put("aut22", 1);
		relatedArticleUpdateArray.add(articleUpdateTest2ra);
				
		// Initialize preview text array used for UPDATEs
		previewTextUpdateArray = new String[3];
		previewTextUpdateArray [0] = "previewArticleUpdateTest0";
		previewTextUpdateArray [1] = "previewArticleUpdateTest1";
		previewTextUpdateArray [2] = "previewArticleUpdateTest2";
		
		// Initialize image URL array used for UPDATEs
		imageURLUpdateArray = new String[3];
		imageURLUpdateArray [0] = "http://www.cs.washington.edu/images/csehead3.png";
		imageURLUpdateArray [1] = "http://www.cs.washington.edu/images/csehead3.png";
		imageURLUpdateArray [2] = "http://www.cs.washington.edu/images/csehead3.png";
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
		DatabaseUpdater.removeArticle(super._con, null);
		
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
		resetTestDB(); 
		
		// Insert the articles and their related nodes
		updateRelatedArticleHelper(articleArray, relatedArticleArray);
		
		// Ensure that the article and proper relation information is in the DB
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			Map<String, Integer> relatedArticle = relatedArticleArray.get(i);
			
			assertTrue(super.searchDBForArticle(article, super.RELATIONS_TABLE));
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
		// Ensure a clean isolated environment
		resetTestDB();

		// Insert the articles and their preview texts
		updatePreviewTextHelper(articleArray, previewTextArray);
		
		// Ensure that the article and proper summary information is in the DB
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String previewText = previewTextArray[i];

			assertTrue(super.searchDBForArticle(article, super.SUMMARY_TABLE));
			assertTrue(super.searchDBForData(article, SUMMARY_COL, previewText, super.SUMMARY_TABLE));
		}
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdateImageURL method.
	 * Tests will add new image urls to the ArticleImageURL table.
	 */
	@Test
	public void testAddImageURL() {
		// Ensure a clean isolated environment
		resetTestDB();
		
		// Insert the articles and their proper image urls
		updateImageURLHelper(articleArray, imageURLArray);
		
		// Ensure that the article and proper image url information is in the DB
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String imageURL = imageURLArray[i];
			
			assertTrue(super.searchDBForArticle(article, super.IMG_TABLE));
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
		// Ensure a clean isolated environment
		resetTestDB();
		
		// Add the relevant nodes initially
		updateRelatedArticleHelper(articleArray, relatedArticleArray);
		
		// Update the article's related articles
		updateRelatedArticleHelper(articleArray, relatedArticleUpdateArray);
		
		// Ensure that the article and proper relation information are in the DB		
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			Map<String, Integer> relatedArticle = relatedArticleUpdateArray.get(i);
			
			assertTrue(super.searchDBForArticle(article, super.RELATIONS_TABLE));
			assertTrue(super.searchDBForRelated(article, relatedArticle));
		}
	}
	
	@Test
	/*
	 * Tests the DatabaseUpdater.updatePreviewText method.
	 * Given that there already exists an article with preview text,
	 * Update the text and verify.
	 */
	public void testUpdatePreviewText() {
		// Ensure a clean isolated environment
		resetTestDB();
		
		// Add the preview texts initially
		updatePreviewTextHelper(articleArray, previewTextArray);
		
		// Update the preview texts
		updatePreviewTextHelper(articleArray, previewTextUpdateArray);

		// Ensure that the article and proper summary information are in the DB
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String previewText = previewTextUpdateArray[i];

			assertTrue(super.searchDBForArticle(article, super.SUMMARY_TABLE));
			assertTrue(super.searchDBForData(article, SUMMARY_COL, previewText, super.SUMMARY_TABLE));
		}
	}
	
	
	/*
	 * Tests the DatabaseUpdater.updateImageURL method.
	 * Given that there already exists an article with the image URL,
	 * Update the image url and verify.
	 */
	@Test
	public void testUpdateImageURL() {
		// Ensure a clean isolated environment
		resetTestDB();
		
		// Add the image URLs initially
		updateImageURLHelper(articleArray, imageURLArray);
		
		// Update the image URLs
		updateImageURLHelper(articleArray, imageURLUpdateArray);
		
		// Ensure that the article and the proper URL information are in the DB
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String imageURL = imageURLUpdateArray[i];

			assertTrue(super.searchDBForArticle(article, super.IMG_TABLE));
			assertTrue(super.searchDBForData(article, super.IMG_URL_COL, imageURL, super.IMG_TABLE));
		}
	}
	
	/* 
	 * Tests the DatabaseUpdater.removeArticle method.
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
			DatabaseUpdater.removeArticle(super._con, article);
			
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
	
	/**
	 * Inserts/Updates articles and related articles.
	 * Used by the following tests:
	 * - testAddRelevantNodes 
	 * - testUpdateRelevantNodes 
	 * @param articleArray
	 * @param relatedArticleArray
	 */
	private void updateRelatedArticleHelper(String[] articleArray, ArrayList<Map<String,Integer>> relatedArticleArray) {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			Map<String, Integer> relatedArticle = relatedArticleArray.get(i);
			DatabaseUpdater.updateRelevantNodes(super._con, article, relatedArticle);
		}
	}
	
	/**
	 * Inserts/Updates articles and their preview texts
	 * @param articleArray
	 * @param previewTextArray
	 */
	private void updatePreviewTextHelper(String[] articleArray, String[] previewTextArray) {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String previewText = previewTextArray[i];
			DatabaseUpdater.updatePreviewText(super._con, article, previewText, false);
		}
	}
	
	/**
	 * Inserts/Updates articles and their image urls
	 * @param articleArray
	 * @param imageURLArray
	 */
	private void updateImageURLHelper(String[] articleArray, String[] imageURLArray) {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String imageURL = imageURLArray[i];
			DatabaseUpdater.updateImageURL(super._con, article, imageURL);
		}
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
	
}
