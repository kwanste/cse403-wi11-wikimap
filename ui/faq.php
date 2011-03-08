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
		<SCRIPT LANGUAGE="JavaScript" type="text/javascript" SRC="scripts/articleNode.js" >
        </SCRIPT>
		<SCRIPT LANGUAGE="JavaScript" type="text/javascript" SRC="scripts/wikiSearch.js" >
        </SCRIPT>
		<SCRIPT LANGUAGE="JavaScript"  type="text/javascript" SRC="scripts/drawMap.js" >
        </SCRIPT>
		<SCRIPT LANGUAGE="JavaScript"  type="text/javascript" SRC="scripts/jquery-1_5.js" >
        </SCRIPT>
		<SCRIPT LANGUAGE="JavaScript" type="text/javascript" SRC="scripts/swapImage.js">
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
				Wiki<b>Map</b>
			</span>
			<?php include("searchbar.php") ?>
		</div>
		<div id="centerDiv">
			<div id="textArea">
			<h2>What is WikiMap?</h2>
			<p>WikiMap is an interactive, web-browser based visualization of Wikipedia articles and their relationships.
			It is targeted toward knowledge and Wikipedia enthusiasts: people who regularly browse Wikipedia for casual fun, research, homework,
			and more.  We believe that Wikipedia is an amazing tool, but often find it difficult to visualize how ideas are related from a linear
			page of text and article links.</p>
			
			<p>For more information on WikiMap and our goals, please visit the <a href="about.php">About</a> page.</p>
			
			<h2>How do I search for an article?</h2>
			<h2>How do I navigate the map?</h2>
			<h2>How can I get more information on an article?</h2>
			<h2>What does hovering do?</h2>
			<h2>How can I view a full Wikipedia article?</h2>
			<h2>Why is your article different than Wikipedia?</h2>
			<h2>I found a bug - how do I report it?</h2>
			<h2>Where can I find your source code?</h2>
			<h2>What if I'd like to contribute to the WikiMap project?</h2>
		</div>
	</div>
   </body>
   </html>
