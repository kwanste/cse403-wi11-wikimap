package logic;

import java.util.*;
import communication.*;

public class RelationshipBuilder {
	public static void build(Map<String, ArticleVector> parsedArticles) {
		for(ArticleVector article : parsedArticles.values()) {
			System.out.println("-->>Parsing: " + article.articleName);
			// Process articles:
			
			// Use links as relations (for now)
			int strength = 0;
			Map<String, Integer> relations = new HashMap<String, Integer>();
			for(String rel_article : article.links) {
				ArticleVector current = parsedArticles.get(rel_article);
				if(current != null) {
					
					if(current.redirect) {
						System.out.println("Found a redirect: " + rel_article);
						relations.put(rel_article, -1);
					} else {
						System.out.println("Normal relationship: " + rel_article);
						relations.put(rel_article, strength);
						strength++;
					}
					if(strength > 20) {
						System.out.println("Strength greater than 20.");
						break;
					}
				} else {
					System.out.println("skipping null related article: " + rel_article);
				}
			}
			try {
			    DatabaseUpdater.updateRelevantNodes(article.articleName, relations);
			} catch (Exception ex) {
			    System.out.println(ex.getMessage());
			}
		}
	}
}
