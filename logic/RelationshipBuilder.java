package logic;

import java.util.*;
import communication.*;

public class RelationshipBuilder {
	public static void build(Map<String, ArticleVector> parsedArticles) {
		for(ArticleVector article : parsedArticles.values()) {
			// Process articles:
			
			// Use links as relations (for now)
			int strength = 0;
			Map<String, Integer> relations = new HashMap<String, Integer>();
			for(String rel_article : article.links) {
			    if(parsedArticles.get(rel_article).redirect) {
				relations.put(rel_article, -1);
			    } else {
				relations.put(rel_article, strength);
				strength++;
			    }
			    if(strength > 20)
				break;
			}
			try {
			    DatabaseUpdater.updateRelevantNodes(article.articleName, relations);
			} catch (Exception ex) {
			    System.out.println(ex.getMessage());
			}
		}
	}
}
