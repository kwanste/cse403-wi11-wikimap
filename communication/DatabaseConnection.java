package communication;

/*
 * Connection class.  Has one function that returns the current database
 * credentials including database to connect to in a single Connection 
 * object. A default is set, but can be overridden.
 */

import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseConnection {
	private final static String DEFAULT_SRV = "cse403.cdvko2p8yz0c.us-east-1.rds.amazonaws.com";
	private final static String DEFAULT_USER = "wikiread";
	private final static String DEFAULT_PASS = "WikipediaMaps123";
	private final static String DEFAULT_DB = "wikimapsDB";

	// Custom Connection
	public static Connection getConnection(
			String userServer, 
			String userUsername, 
			String userPassword, 
			String userDB) 
	{
		Connection _con = null;
		
		try 
		{
			if(_con == null || _con.isClosed())
			{
				Class.forName("com.mysql.jdbc.Driver").newInstance();

				String server = userServer;
				String user = userUsername;
				String pass = userPassword;
				String db = userDB;

				String url = "jdbc:mysql://" + server + "/" + db;
				_con = DriverManager.getConnection(url, user, pass);
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		
		return _con;
	}

	// Create a default connection if no parameters are passed through.
	public static Connection getConnection() {
		return getConnection(DEFAULT_SRV, DEFAULT_USER, DEFAULT_PASS, DEFAULT_DB);
	}

}
