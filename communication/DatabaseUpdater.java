
package communication;

import java.sql.*;
import java.util.*;

public class DatabaseUpdater {
	public static void updateRelevantNodes(Connection _con, String article, Map<String, Integer> relatedArticles)
	{	
		//System.out.println("updating: " + article);
		if (article == null || relatedArticles == null) {
			return;
		}

		try 
		{
			//EnsureConnection();	
			Statement st = _con.createStatement();
			for(String key : relatedArticles.keySet())
			{
				int strength = relatedArticles.get(key); 
				st.executeUpdate("INSERT INTO ArticleRelations (article, relatedArticle, strength) " 
						+ "VALUES ('" + article + "', '" + key + "', " + strength + ") "
						+ "ON DUPLICATE KEY UPDATE strength = " + strength);
			}
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}

	public static void updatePreviewText(Connection _con, String article, String summary, boolean redirect)
	{	
		//System.out.println("preview text: (" + article + ", " + summary + ", " + (redirect ? "true" : "false") + ")");
		if (article == null || summary == null) {
			return;
		}

		try 
		{
			//EnsureConnection();	
			Statement st = _con.createStatement();
			st.executeUpdate("INSERT INTO ArticleSummary (article, summary, redirect) " 
					+ "VALUES ('" + article + "', '" + (redirect ? " " : summary) + "', " + (redirect ? "TRUE" : "FALSE") + ") "
					+ "ON DUPLICATE KEY UPDATE summary = '" + summary + "'");
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}

	public static void updateImageURL(Connection _con, String article, String articleURL)
	{
		//System.out.println("image url: (" + article + ", " + articleURL + ")");
		if (article == null || articleURL == null) {
			return;
		}

		try 
		{
			//EnsureConnection();
			Statement st = _con.createStatement();
			st.executeUpdate("INSERT INTO ArticleImages (article, articleURL) " 
					+ "VALUES ('" + article + "', '" + articleURL + "') "
					+ "ON DUPLICATE KEY UPDATE articleURL = '" + articleURL + "'");
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}

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

	}

	public static void RemoveArticle(Connection _con, String article)
	{
		if (article == null) {
			return;
		}
		// Assumes ON DELETE CASCADE
		try
		{
			//EnsureConnection();
			Statement st = _con.createStatement();
			st.executeUpdate("DELETE " + article
					+ " FROM ArticleSummary");
		}
		catch (SQLException e)
		{
			e.printStackTrace();
		}
	}
}
