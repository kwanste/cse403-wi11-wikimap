package logic;

import java.sql.*;
import java.util.*;
import communication.DatabaseUpdater;

public class RelationshipBuilder {
    private static Connection _con;
    private static PreparedStatement _occurStatement;
    private static PreparedStatement _relStatement;
    private static PreparedStatement _updateStrength;

    public static void main(String[] args) {
	_con = DatabaseConnection.getConnection("cse403.cdvko2p8yz0c.us-east-1.rds.amazonaws.com", "wikiwrite", "WikipediaMaps123", "wikimapsdb_final");

	_occurStatement = con.prepareStatement("SELECT * FROM WordCounts WHERE Article = ?");
	_relStatement = con.prepareStatement("SELECT * FROM ArticleRelations");
	_updateStrength = con.prepareStatement("UPDATE ArticleRelations SET Strength = ? WHERE Article = ? AND RelatedArticle = ?");
	
	// Iterate through articlerelations
	ResultSet relations = _relStatement.executeQuery();
	while(relations.next()) {
	    String article = relations.getString("Article"), relatedArticle = relations.getString("RelatedArticle");
	    _updateStrength.clearParameters();
	    _updateStrength.setDouble(1, distance(article, relatedArticle));
	    _updateStrength.setString(2, article);
	    _updateStrength.setString(3, relatedArticle);
	}
    }

    private static double distance(String articleName1, String articleName2) {
	System.out.print("Calculating distance of: (" + articleName1 + ", " + articleName2 + ")... ");
	Map<String, Integer> article1 = new HashMap<String, Integer>(),
	    article2 = new HashMap<String, Integer>();
	double result = 0.0;

	// Fill Maps
	_occurStatement.clearParameters();
	_occurStatement.setString(1, articleName1);
	mapFromResult(_occurStatement.executeQuery(), article1);
	_occurStatement.clearParameters();
	_occurStatement.setString(1, articleName2);
	mapFromResult(_occurStatement.executeQuery(), article2);

	// Generate Word Set
	Set<String> language = new HashSet<String>();
	language.addAll(article1.keySet());
	language.addAll(article2.keySet());

	// calculate 
	for(String word : language)
	    result += Math.pow(Math.log(article1.get(word) - article2.get(word)), 2);

	System.out.println(result);
	return result;
    }

    private static void mapFromResult(ResultSet result, Map<String, Integer> outMap) {
	while(result.next()) {
	    outMap.put(result.getString("Word"), result.getInt("Occurrences"));
	}
    }
}
