package logic;

import java.sql.*;
import java.util.*;
import communication.DatabaseConnection;

public class RelationshipBuilder {
    private static Connection _con;
    private static PreparedStatement _occurStatement;
    private static PreparedStatement _relStatement;
    private static PreparedStatement _updateStrength;
    private static PreparedStatement _wordStatement;

    public static void main(String[] args) throws SQLException {
	// Use default connection. See DatabaseConnection to see what this is.
	_con = DatabaseConnection.getConnection();

	_occurStatement = _con.prepareStatement("SELECT * FROM WordCounts WHERE Article = ?");
	_relStatement = _con.prepareStatement("SELECT * FROM ArticleRelations WHERE Strength = 0 LIMIT 100000");
	_updateStrength = _con.prepareStatement("UPDATE ArticleRelations SET Strength = ? WHERE Article = ? AND RelatedArticle = ?");
	
	_con.setAutoCommit(false);

	int i = 0;
	int j = 0;
	while(true) {
	    String first = "", last = "", prev = null;
	    Map<String, Integer> currentArticleInfo = new HashMap<String, Integer>();
	    
	    // Iterate through articlerelations
	    ResultSet relations = _relStatement.executeQuery();
	    if(!relations.next())
		return;
	    do {
		String article = relations.getString("Article"), relatedArticle = relations.getString("RelatedArticle");
		last = "(" + article + ", " + relatedArticle + ")";
		if(first.equals(""))
		    first = last;
		if(prev == null || !article.equals(prev)){
		    currentArticleInfo.clear();
		}
		_updateStrength.clearParameters();
		_updateStrength.setDouble(1, distance(article, relatedArticle, currentArticleInfo));
		_updateStrength.setString(2, article);
		_updateStrength.setString(3, relatedArticle);
		_updateStrength.executeUpdate();
	       
		if(j % 1000 == 0){
		    System.out.println("\r" + j + ": " + last);
		    _con.commit();
		}
		j++;
		prev = article;
	    } while(relations.next());
	    
	    relations.close();
	    System.out.println(i + ": " + first + "  |  " + last);
	}
    }

    private static double distance(String articleName1, String articleName2, Map<String, Integer> article1) throws SQLException {
	//System.out.print("Calculating distance of: (" + articleName1 + ", " + articleName2 + ")... ");
	
	Map<String, Integer> article2 = new HashMap<String, Integer>();
	double result = 0.0;
	
	// Fill Maps
	if(article1.isEmpty()){
	    _occurStatement.clearParameters();
	    _occurStatement.setString(1, articleName1);
	    mapFromResult(_occurStatement.executeQuery(), article1);
	}
	_occurStatement.clearParameters();
	_occurStatement.setString(1, articleName2);
	mapFromResult(_occurStatement.executeQuery(), article2);
	
	// Generate Word Set
	Set<String> language = new HashSet<String>();
	language.addAll(article1.keySet());
	language.addAll(article2.keySet());
	
	// calculate 
	for(String word : language) {
	    Integer a1counts = article1.get(word);
	    Integer a2counts = article2.get(word);
	    result += Math.pow(Math.log(Math.abs(((a1counts == null) ? 0 : a1counts) - ((a2counts == null) ? 0 : a2counts)) + 1), 2);
	}
	
	//System.out.println(result);
	return result;
    }
    
    private static void mapFromResult(ResultSet result, Map<String, Integer> outMap) throws SQLException {
	while(result.next()) {
	    outMap.put(result.getString("Word"), result.getInt("Occurrences"));
	}
	result.close();
    }

    private static String makeStringMySQLSafe(String text){
        return text.replace("\\", "\\\\").replace("'", "\\'").replace("\"","\\\"").replace("%", "\\%").replace("_", "\\_");
    }

}
