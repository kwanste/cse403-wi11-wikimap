package logic;

import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

import communication.DatabaseConnection;
import communication.DatabaseUpdater;

public class RelationshipBuilder {
	public static void build(Map<String, ArticleVector> parsedArticles) {
		// Return the default database credentials and name
		// Edit communication.DatabaseConnection to update this. 
		// 2/22/2011 - currently set as wikimapsdb_test
		Connection _con = DatabaseConnection.getConnection();
		
		for(ArticleVector article : parsedArticles.values()) {
		    System.out.println("Parsing: " + article.getArticleName());
			// Process articles:
			
			// Use links as relations (for now)
			int strength = 0;
			Map<String, Integer> relations = new HashMap<String, Integer>();
			for(String rel_article : article.getLinks()) {
			    if(article.getRedirect()) {
				System.out.println("\tFound a redirect: " + rel_article);
				relations.put(rel_article, -1);
			    } else {
				System.out.println("\tNormal relationship: " + rel_article);
				relations.put(rel_article, strength);
				strength++;
			    }
			    if(strength > 20) {
				System.out.println("\tStrength greater than 20.");
				break;
			    }
			}
			try {
			    DatabaseUpdater.updateRelevantNodes(_con, article.getArticleName(), relations);
			} catch (Exception ex) {
			    System.out.println(ex.getMessage());
			}
		}
	}
}
