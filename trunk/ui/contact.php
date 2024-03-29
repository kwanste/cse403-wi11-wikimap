<!-- This file is one of the main UI components which divides the UI into a MainFrame,
SideBar, Thumbnail, etc. -->

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>WikiMap</title>
		<link rel="stylesheet" href="css/wikipedia.css" type="text/css" />
		<link rel="stylesheet" href="css/main.css" type="text/css" />
		<link rel="stylesheet" href="css/wikiSearch.css" type="text/css" /> 
		<SCRIPT LANGUAGE="JavaScript" type=text/javascript" SRC="scripts/googleAnalytics.js">
		</SCRIPT>

		<!--[if IE]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
		<!--[if lte IE 7]>
			<script src="js/IE8.js" type="text/javascript"></script><![endif]-->
		<!--[if lt IE 7]>
			<link rel="stylesheet" type="text/css" media="all" href="css/ie6.css"/><![endif]-->
	</head>

	<body id="pageBody" class="home">
		<div id="searchBar">
			<span id="title">
				<a href="index.php">Wiki<b>Map</b></a>
			</span>
			<?php include("searchbar.php") ?>
		</div>
		<div id="centerDiv">
			<div id="textArea">
			<h1>Our Team</h1>
			<p>
			<ul>
				<li>Alana Killeen</li>
				<li><a href="http://www.linkedin.com/in/horkind" target="_blank">Dylan Horkin</a></li>
				<li>Gordon Chu</li>
				<li><a href="http://www.linkedin.com/in/koenigkimberly" target="_blank">Kimberly Koenig</a></li>
				<li>Liem Dinh</li>
				<li>Michael Amorozo</li>
				<li>Robert Chu</li>
				<li><a href="http://www.linkedin.com/in/stevenkwan" target="_blank">Steven Kwan</a></li>
			</ul>
			</p>
			<h1>Contact Us</h1>
			<p>Have a question, comment, or bug?  Contact our team via our <a href="mailto: cse-403-wikimap@googlegroups.com">Google Group</a></a> address.</p>  
			<p></p>
		</div>
	</div>
   </body>
   </html>
