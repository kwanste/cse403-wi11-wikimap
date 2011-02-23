package communication;

import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseConnection {
	private final static String DEFAULT_SRV = "localhost";
	private final static String DEFAULT_USER = "wikiwrite";
	private final static String DEFAULT_PASS = "WikipediaMaps123";
	private final static String DEFAULT_DB = "wikimapsdb_test";

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

	public static Connection getConnection() {
		return getConnection(DEFAULT_SRV, DEFAULT_USER, DEFAULT_PASS, DEFAULT_DB);
	}

}
