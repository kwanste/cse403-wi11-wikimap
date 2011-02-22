package test.JUnitTests;

import java.sql.*;
import java.util.*;
import junit.framework.*;
import org.junit.*;
import communication.DatabaseUpdater;

public abstract class WikiMapTestCase extends TestCase {
	/* DB Connection */
	private Connection _con;
	private final String TEST_DB = "wikimapsdb_unit_test";
	private final String DB_USER = "wikiwrite";
	private final String DB_PASS = "WikipediaMaps123";
	private final String DB_SRV = "iprojsrv.cs.washington.edu";
	
	/* DB Tables */
	protected final String RELATIONS_TABLE = "articlerelations";
	protected final String SUMMARY_TABLE = "articlesummary";
	protected final String IMG_TABLE = "articleimages";
	
	/* DB Columns */
	protected final String ARTICLE_COL = "Article";
	protected final String STRENGTH_COL = "STRENGTH";
	protected final String RELATED_ARTICLE_COL = "RelatedArticle";
	protected final String IMG_URL_COL = "ArticleURL";
	protected final String SUMMARY_COL = "Summary";
	protected final String REDIRECT_COL = "Redirect";
	
	/* DB Char Column Lengths */
	protected final int MAX_ARTICLE_NAME = 300;
	protected final int MAX_ARTICLE_SUMMARY = 1800;
	protected final int MAX_ARTICLE_URL = 300;
	
	/* Test data structures */
	protected final int TEST_SAMPLE_SIZE = 5;	
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		// Ensure the DatabaseUpdater is set to debug_mode = true
		DatabaseUpdater.setDebugMode(true);
		
		// Remove all rows from the test db
		resetTestDB();
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
	protected boolean searchDBForArticle(String article, String table) {
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
	protected boolean searchDBForRelated(String article, Map<String, Integer> relatedArticles) {
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
	protected boolean searchDBForData(String article, String column, String data, String table) {
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
	
	/* 
	 * Counts and returns the number of rows in a particular table 
	 */
	protected int getTableSize(String table) {
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
	 * Create a string of length x
	 */
	protected String createXString(int x) {
		String xString = "";
		for (int i = 0; i < MAX_ARTICLE_NAME; i++) {
			xString += "x";
		}
		return xString; 
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
				String server = DB_SRV;
				String db = TEST_DB;
				String user = DB_USER;
				String pass = DB_PASS;
				
				String url = "jdbc:mysql://" + server + "/" + db;
				_con = DriverManager.getConnection(url, user, pass);
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
		
		// Close DB connection
		_con.close();
		
		// Return DB Updater to non-debug mode
		DatabaseUpdater.setDebugMode(false);
	}

}


