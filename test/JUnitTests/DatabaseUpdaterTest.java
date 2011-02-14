package test.JUnitTests;

import java.sql.*;
import java.util.*;

import junit.framework.*;
import org.junit.*;
import org.junit.Test;
import communication.DatabaseUpdater;

public class DatabaseUpdaterTest extends TestCase {
	private final int TEST_ARRAY_LENGTH = 5;
	
	/* Tables */
	private final String RELATIONS_TABLE = "articlerelations";
	private final String SUMMARY_TABLE = "articlesummary";
	private final String IMG_TABLE = "articleimages";
	
	/* Columns */
	private final String ARTICLE_COL = "Article";
	private final String STRENGTH_COL = "STRENGTH";
	private final String RELATED_ARTICLE_COL = "RelatedArticle";
	private final String IMG_URL_COL = "ArticleURL";
	private final String SUMMARY_COL = "Summary";
	private final String REDIRECT_COL = "Redirect";
	
	private String[] articleArray;
	private Map<String, Integer>[] relatedArticleArray;
	private String[] previewTextArray;
	private String[] imageURLArray;
	
	private Random rand;
	private static Connection _con;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		// Ensure the DatabaseUpdater is set to debug_mode = true
		DatabaseUpdater.setDebugMode(true);
		
		// Remove all rows from the test db
		resetTestDB();
		
		// Initialize article name array
		
		// Initialize strength values
	}

	/* 
	 * Reset the test database by deleting all rows
	 * from all tables
	 */
	private void resetTestDB() {
		try {
			EnsureConnection();
			Statement st = _con.createStatement();
			st.executeUpdate("DELETE FROM " + RELATIONS_TABLE);
			st.executeUpdate("DELETE FROM " + SUMMARY_TABLE);
			st.executeUpdate("DELETE FROM " + IMG_TABLE);
		} catch (SQLException e) {
			e.printStackTrace();
		}	
	}
	
	/*
	 * Returns TRUE if (at least one) article is found in a particular DB table
	 * for a particular article name
	 */
	private boolean searchDBForArticle(String article, String table) {
		try {
			EnsureConnection();
			Statement st = _con.createStatement();
			ResultSet result = st.executeQuery("SELECT * " +
					"FROM " + table + " " +
							"WHERE " + ARTICLE_COL + " = '" + article + "';");
			return result.next();	// if false, there were no rows returned; if true, at least one row was found
		} catch (SQLException e) {
			e.printStackTrace();
		}	
		return false;
	}
	
	/* Assumes we're using the RELATIONS_TABLE
	 * Returns TRUE if, for a particular article, all of the expected RelatedArticle and Strength
	 * data was in the database
	 */
	private boolean searchDBForRelated(String article, Map<String, Integer> relatedArticles) {
		boolean allFound = false;
		try {
			EnsureConnection();
			Statement st = _con.createStatement();
			for (String key : relatedArticles.keySet()) {
				int strength = relatedArticles.get(key); 
				ResultSet result = st.executeQuery("SELECT * " +
						"FROM " + RELATIONS_TABLE + " " +
								"WHERE " + ARTICLE_COL + " = '" + article + "' " +
									"AND " + STRENGTH_COL + " = " + strength + " " +
										"AND " + RELATED_ARTICLE_COL + " = '" + key + "';");
				allFound = result.next();	// a related article with the correct strength, name, and article was/wasn't found
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}	
		return allFound;
	}
	
	/* 
	 * Returns TRUE if the expected data was found for a particular article, column, and table
	 */
	private boolean searchDBForData(String article, String column, String data, String table) {
		String actualData;
		try {
			EnsureConnection();
			Statement st = _con.createStatement();
			ResultSet result = st.executeQuery("SELECT " + column + " " +
					"FROM " + table + " " +
						"WHERE " + ARTICLE_COL + " = '" + article + "';");
			if (result.next()) {	// assume only one row was returned
				// get the result data from the first (and only) column
				 actualData = result.getString(1);
			} else {
				return false;	// something went wrong (there were no rows returned by the query)
			}
			
			return (data.equals(actualData));	// true if the expected data matches the actual data
		} catch (SQLException e) {
			e.printStackTrace();
		}	
		return false; // something went wrong
	}
	
	/* Returns the number of rows in a particular table */
	private int getTableSize(String table) {
		int numRows = 0;
		try {
			EnsureConnection();
			Statement st = _con.createStatement();
			ResultSet result = st.executeQuery("SELECT * " +
					"FROM " + table + ";");
			while (result.next()) {	// count the number of rows returned
				numRows++;
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}	
		return numRows;
	}
	
	/*
	 * Establish and verify test database connection
	 */
	private void EnsureConnection()
	{
		try 
		{
			if(_con == null || _con.isClosed())
			{
				Class.forName("com.mysql.jdbc.Driver").newInstance();
				String server = "iprojsrv.cs.washington.edu";
				String db = "wikimapsdb_test";
				String user = "wikiwrite";
				String pass = "WikipediaMaps123";
				
				String url = "jdbc:mysql://" + server + "/" + db;
				_con = DriverManager.getConnection(url, user, pass);
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}
	
	@Test
	public void testNullQueries() {
		// Get the size of the database before
		int relations_before = getTableSize(RELATIONS_TABLE);
		int summary_before = getTableSize(SUMMARY_TABLE);
		int image_before = getTableSize(IMG_TABLE);
		
		// Attempt to query with null values
		DatabaseUpdater.updateRelevantNodes(null, null);
		DatabaseUpdater.updatePreviewText(null, null);
		DatabaseUpdater.updateImageURL(null, null);
		DatabaseUpdater.RemoveArticle(null);
		
		// All tables should be the same size afterward
		assertTrue(relations_before != getTableSize(RELATIONS_TABLE));
		assertTrue(summary_before != getTableSize(SUMMARY_TABLE));
		assertTrue(image_before != getTableSize(IMG_TABLE));
	}
	
	@Test
	public void testUpdateRelevantNodes() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
				Map<String, Integer> relatedArticle = relatedArticleArray[i];
				DatabaseUpdater.updateRelevantNodes(article, relatedArticle);
				// Ensure that the article is in the DB
				assertTrue(searchDBForArticle(article, RELATIONS_TABLE));
				// Ensure that the proper relation information is in the DB
				assertTrue(searchDBForRelated(article, relatedArticle));
		}
	}
	
	@Test
	public void testUpdatePreviewText() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String previewText = previewTextArray[i];
			DatabaseUpdater.updatePreviewText(article, previewText);
			// Ensure that the article is in the DB
			assertTrue(searchDBForArticle(article, SUMMARY_TABLE));
			// Ensure that the proper summary information is in the DB
			assertTrue(searchDBForData(article, SUMMARY_COL, previewText, SUMMARY_TABLE));
		}
	}
	
	@Test
	public void testUpdateImageURL() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			String imageURL = imageURLArray[i];
			DatabaseUpdater.updateImageURL(article, imageURL);
			// Ensure that the article is in the DB
			assertTrue(searchDBForArticle(article, IMG_TABLE));
			// Ensure that the proper URL information is in the DB
			assertTrue(searchDBForData(article, IMG_URL_COL, imageURL, IMG_TABLE));
		}
	}
	
	@Test
	/* 
	 * Deletes a series of articles from the database
	 */
	public void testRemoveArticle() {
		for (int i = 0; i < articleArray.length; i++) {
			String article = articleArray[i];
			
			// Add the article to each table
			DatabaseUpdater.updateRelevantNodes(article, relatedArticleArray[i]);
			DatabaseUpdater.updatePreviewText(article, previewTextArray[i]);
			DatabaseUpdater.updateImageURL(article, imageURLArray[i]);
			
			// Remove the article from the database
			DatabaseUpdater.RemoveArticle(article);
			
			// Ensure that the article is NOT in the DB
			assertFalse(searchDBForArticle(article, RELATIONS_TABLE));
			assertFalse(searchDBForArticle(article, SUMMARY_TABLE));
			assertFalse(searchDBForArticle(article, IMG_TABLE));
		}
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
		_con.close();
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
