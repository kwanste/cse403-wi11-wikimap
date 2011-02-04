<?php

	$search = $_GET["search"];
	echo "Search = ".$search;
	//connection to the database
	$connectionInfo = array('UID'=>'wikimap', 'PWD'=>'WikipediaMaps123', 'Database'=>'wiki_test');
	$conn = sqlsrv_connect('iprojsrv.cs.washington.edu', $connectionInfo);
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
?> 