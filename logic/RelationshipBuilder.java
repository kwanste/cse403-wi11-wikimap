package logic;

import java.util.*;
import communication.*;

public class RelationshipBuilder {
	public static void build(Map<String, ArticleVector> parsedArticles) {
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
			    DatabaseUpdater.updateRelevantNodes(article.getArticleName(), relations);
			} catch (Exception ex) {
			    System.out.println(ex.getMessage());
			}
		}
	}
}
