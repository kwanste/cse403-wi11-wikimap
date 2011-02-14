package communication;

import java.sql.*;
import java.util.*;

public class DatabaseUpdater {
	
	private static Connection _con;

	private static void EnsureConnection()
	{
		try 
		{
			if(_con == null || _con.isClosed())
			{
				Class.forName("com.mysql.jdbc.Driver").newInstance();
				// This needs to be replaced with IPROJSVR.
				// Just put this here to test the format.
				
				// Cubist Database
				/*
				String server = "cubist.cs.washington.edu";
				String db = "liemdinh_wiki";
				String user = "liemdinh";
				String pass = "sgU5tJ4i";
				*/
				
				String server = "iprojsrv.cs.washington.edu";
				String db = "wikimapsDB";
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
	
	public static void updateRelevantNodes(String article, Map<String, Integer> relatedArticles)
	{	
		try 
		{
			EnsureConnection();	
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
	
	public static void updatePreviewText(String article, String summary)
	{	
		try 
		{
			EnsureConnection();	
			Statement st = _con.createStatement();
			st.executeUpdate("INSERT INTO ArticleSummary (article, summary) " 
					+ "VALUES ('" + article + "', '" + summary + "') "
					+ "ON DUPLICATE KEY UPDATE summary = '" + summary + "'");
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}
	
	public static void updateImageURL(String article, String articleURL)
	{
		try 
		{
			EnsureConnection();
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
	
	public static void RemoveArticle(String article)
	{
		// Assumes ON DELETE CASCADE
		try
		{
			EnsureConnection();
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
