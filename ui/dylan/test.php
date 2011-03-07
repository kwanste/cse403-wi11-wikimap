<?php
	include("../scripts/retriever.php");

        /*
	$search = $_POST["search"];
	echo "Search = ".$search ."</p>";
	
	
	
	mysql_connect("iprojsrv.cs.washington.edu", "wikiread", "WikipediaMaps123") or die(mysql_error());
	mysql_select_db("wikimapsDB") or die(mysql_error());

	// Retrieve all the data from the "example" table
	$result = mysql_query("SELECT * FROM ArticleSummary")
	or die(mysql_error());  


	// Print out the contents of the entry 
	while($row = mysql_fetch_array( $result )) {
		echo "Article: ".$row['Article'];
		echo " Summary: ".$row['Summary'];
	}*/

	// Dylan's tests
	$db_ret = new DatabaseRetriever;
	echo "<p/><p/>Dylan Tests:<p/>";
	//echo $db_ret->getPreviewText("Amazon.com");
	
	
        echo "<p/>";
        //echo phpinfo();
        
        //$db_ret->getRelevancyTree("Bill Gates", 0, 5);
        //echo $db_ret->getRelevancyTree("foo",array(6,2), 2);
//        echo $db_ret->getRelevancyTree("bill gates",array(10,5,3,1), 5);

        //echo $db_ret->getRelevancyTree("Bill Gates", array(10,5,3,1), 5 )."<br/>";
        echo $db_ret->getRelevancyTree("BilL GaTeS", "6,2", 3)."<br/>";
        //echo $db_ret->getRelevancyTree("FrEuD", "6,2", 3)."<br/><br/><br/>";
        //echo $db_ret->getRelevancyTree("SiGmuNd FrEuD", "6,2", 3)."<br/>";

        echo mysql_real_escape_string("*f")."<br/>";


//        echo "<br/>bill gates//billion|business magnate//Jack Billion|Long and short scales||Bill Gates|petroleum <br/>";

        //$root = $db_ret->gRTree("bill gates", 5, 3);
        //echo $db_ret->serializeTree($root, 3);

	/*
	//connection to the database
	$connectionInfo = array('UID'=>'wikimap', 'PWD'=>'WikipediaMaps123', 'Database'=>'wiki_test');
	$conn = sqlsrv_connect('IPROJSRV.cs.washington.edu', $connectionInfo);
	if ($conn === false) die( print_r( sqlsrv_errors() ) );
	  

	//select a database to work with
	//$selected = sqlsrv_select_db($myDB, $dbhandle)
	//  or die("Couldn't open database $myDB");

	//declare the SQL statement that will query the database
	$query = "SELECT * ";
	$query .= "FROM ArticleSummary;";

	//execute the SQL query and return records
	$result = sqlsrv_query($conn, $query);

	//display the results
	while($row = sqlsrv_fetch_array($result))
	{
	  echo "<li>" . $row["Article"] ." ". $row["Summary"]. "</li>";
	}

	sqlsrv_close($dbhandle);
	*/

?> 
