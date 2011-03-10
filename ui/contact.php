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
				<li>Dylan Horkin</li>
				<li>Gordon Chu</li>
				<li>Kimberly Koenig</li>
				<li>Liem Dinh</li>
				<li>Michael Amorozo</li>
				<li>Robert Chu</li>
				<li>Steven Kwan</li>
			</ul>
			</p>
			<h1>Contact Us</h1>
			<p>The WikiMap team may be contacted via email at our <a href="mailto: cse-403-wikimap@googlegroups.com">Google Group</a></a> address.  You may also send bugs to this email address.</p>  
			<p></p>
		</div>
	</div>
   </body>
   </html>
