package test.JUnitTests;

import java.util.*;
import junit.framework.*;
import org.junit.*;
import org.junit.Test;

import communication.DatabaseUpdater;

public class DatabaseUpdaterTest extends WikiMapTestCase {	
	
	/* Test data structures */
	private String[] articleArray;
	private Map<String, Integer>[] relatedArticleArray;
	private String[] previewTextArray;
	private String[] imageURLArray;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		// TODO: Initialize article name array
		
		// TODO: Initialize strength values
		
		// TODO: Initialize preview text array
		
		// TODO: Initialize image URL array
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
		DatabaseUpdater.updateRelevantNodes(null, null);
		DatabaseUpdater.updatePreviewText(null, null, false); 
		DatabaseUpdater.updateImageURL(null, null);
		DatabaseUpdater.RemoveArticle(null);
		
		// All tables should be the same size afterward
		assertTrue(relations_before != getTableSize(super.RELATIONS_TABLE));
		assertTrue(summary_before != getTableSize(super.SUMMARY_TABLE));
		assertTrue(image_before != getTableSize(super.IMG_TABLE));
	}
	
	/*
	 * Tests the DatabaseUpdater.UpdateRelevantNodes method.
	 */
	@Test
	public void testUpdateRelevantNodes() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
				Map<String, Integer> relatedArticle = relatedArticleArray[i];
				DatabaseUpdater.updateRelevantNodes(article, relatedArticle);
				
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
			DatabaseUpdater.updatePreviewText(article, previewText, false);
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
			DatabaseUpdater.updateImageURL(article, imageURL);
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
			DatabaseUpdater.updateRelevantNodes(article, relatedArticleArray[i]);
			DatabaseUpdater.updatePreviewText(article, previewTextArray[i], false);
			DatabaseUpdater.updateImageURL(article, imageURLArray[i]);
			
			// Remove the article from the database
			DatabaseUpdater.RemoveArticle(article);
			
			// Ensure that the article is NOT in the DB
			assertFalse(super.searchDBForArticle(article, super.RELATIONS_TABLE));
			assertFalse(super.searchDBForArticle(article, super.SUMMARY_TABLE));
			assertFalse(super.searchDBForArticle(article, super.IMG_TABLE));
		}
	}

	// TODO: Test behavior if we insert titles that are much longer than db can allow.
	// TODO: Test behavior if we insert article previews that are longer than the allowed amount.
	// TODO: Test behavior if we insert URL's that are longer than they should be
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
	
	/*
	 * Not entirely sure how test suites work just yet... but here it is.
	 */
	public static TestSuite suite(){
		TestSuite suite = new TestSuite();
		suite.addTest(new DatabaseUpdaterTest());
		return suite;
	}

}
