
package communication;

/*
 * DatabaseUpdater - class with a collection of functions that will
 * interact with the database to update/insert/remove data.
 * 
 *  Note: Each method takes a Connection _con object to know where 
 *  execute the query/statement
 */

import java.sql.*;
import java.util.*;

public class DatabaseUpdater {
	// DB tables' names and column lengths
	private final static String ARTICLEIMAGES = "ArticleImages";
	private final static int ARTICLEIMAGES_ARTICLELENGTH = 300;
	private final static int ARTICLEIMAGES_ARTICLEURLLENGTH = 500;
	
	private final static String ARTICLERELATIONS = "ArticleRelations";
	private final static int ARTICLERELATIONS_ARTICLELENGTH = 300;
	private final static int ARTICLERELATIONS_RELATEDARTICLE = 300;
	
	private final static String ARTICLESUMMARY = "ArticleSummary";
	private final static int ARTICLESUMMARY_ARTICLELENGTH = 300;
	private final static int ARTICLESUMMARY_SUMMARYLENGTH = 10000;
	
	// updateRelevantNodes, will update/insert the ArticleRelations table 
	// with a map of the related articles and their stengths.
	public static void updateRelevantNodes(Connection _con, String article, Map<String, Integer> relatedArticles)
	{	
		//System.out.println("updating: " + article);
		if (article == null || relatedArticles == null) {
			return;
		} 
		
		if (article.length() > ARTICLERELATIONS_ARTICLELENGTH) {
			article = article.substring(0, ARTICLERELATIONS_ARTICLELENGTH - 1);
		}

		try 
		{
			Statement st = _con.createStatement();
			for(String key : relatedArticles.keySet())
			{
				if (key.length() > ARTICLERELATIONS_RELATEDARTICLE) {
					key.substring(0, ARTICLERELATIONS_RELATEDARTICLE - 1);
				}
				
				int strength = relatedArticles.get(key); 
				st.executeUpdate("INSERT INTO " + ARTICLERELATIONS + " (article, relatedArticle, strength) " 
						+ "VALUES ('" + article + "', '" + key + "', " + strength + ") "
						+ "ON DUPLICATE KEY UPDATE strength = " + strength);
			}
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}

	// updatePreviewText, will update/insert the preview text for a given 
	// article.  
	public static void updatePreviewText(Connection _con, String article, String summary, boolean redirect)
	{	
		//System.out.println("preview text: (" + article + ", " + summary + ", " + (redirect ? "true" : "false") + ")");
		if (article == null || summary == null) {
			return;
		}
		
		if (article.length() > ARTICLESUMMARY_ARTICLELENGTH) {
			article = article.substring(0, ARTICLESUMMARY_ARTICLELENGTH - 1);
		}
		
		if (summary.length() > ARTICLESUMMARY_SUMMARYLENGTH) {
			summary = summary.substring(0, ARTICLESUMMARY_SUMMARYLENGTH - 1);
		}

		try 
		{
			//EnsureConnection();	
			Statement st = _con.createStatement();
			st.executeUpdate("INSERT INTO " + ARTICLESUMMARY + " (article, summary, redirect) " 
					+ "VALUES ('" + article + "', '" + (redirect ? " " : summary) + "', " + (redirect ? "TRUE" : "FALSE") + ") "
					+ "ON DUPLICATE KEY UPDATE summary = '" + summary + "'");
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}

	// updateImageURL, will update/insert the url for an image for a given 
	// article.
	public static void updateImageURL(Connection _con, String article, String articleURL)
	{
		//System.out.println("image url: (" + article + ", " + articleURL + ")");
		if (article == null || articleURL == null) {
			return;
		}

		if (article.length() > ARTICLEIMAGES_ARTICLELENGTH) {
			article = article.substring(0, ARTICLEIMAGES_ARTICLELENGTH - 1);
		}
		
		if (articleURL.length() > ARTICLEIMAGES_ARTICLEURLLENGTH) {
			articleURL = articleURL.substring(0, ARTICLEIMAGES_ARTICLEURLLENGTH - 1);
		}
		
		try 
		{
			Statement st = _con.createStatement();
			st.executeUpdate("INSERT INTO " + ARTICLEIMAGES + " (article, articleURL) " 
					+ "VALUES ('" + article + "', '" + articleURL + "') "
					+ "ON DUPLICATE KEY UPDATE articleURL = '" + articleURL + "'");
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}

	/* DEPRECATED 
	public static void updateVector(Connection _con, String article, String vector, boolean redirect){
		if (article == null || vector == null) {
			return;
		}
		
		int bool;
		if(redirect){
			bool = 1;
		}
		else{
			bool = 0;
		}
		try
		{
			//EnsureConnection();
			Statement st = _con.createStatement();
			st.executeUpdate("INSERT INTO ArticleVector (Article, Links, Redirect) "
					+ "VALUES ('" + article + "', '" + vector + "', '" + bool + "') "
					+ "ON DUPLICATE KEY UPDATE Links = '" + vector + "', Redirect = '" + bool + "'");
		}
		catch (SQLException e)
		{
			e.printStackTrace();
		}

	}*/

	// Removes the article from the database.  
	public static void removeArticle(Connection _con, String article)
	{
		if (article == null) {
			return;
		}
		// Cannot assume on Cascade Delete.  Database was not designed that way.
		// Must remove from each table. 
		try
		{
			Statement st = _con.createStatement();
			st.executeUpdate("DELETE FROM " + ARTICLESUMMARY + 
					" WHERE Article = '" + article + "'");
			st.clearBatch();
			st.executeUpdate("DELETE FROM " + ARTICLERELATIONS +  
					" WHERE Article = '" + article + "'");
			st.clearBatch();
			st.executeUpdate("DELETE FROM " + ARTICLEIMAGES + 
					" WHERE Article = '" + article + "'");
		}
		catch (SQLException e)
		{
			e.printStackTrace();
		}
	}
}
