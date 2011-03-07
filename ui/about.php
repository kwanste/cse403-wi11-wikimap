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
			<h1>About WikiMap</h1>
			<p>WikiMap is an interactive, web-browser based visualization of Wikipedia articles and their relationships.
			It is targeted toward knowledge and Wikipedia enthusiasts: people who regularly browse Wikipedia for casual fun, research, homework,
			and more.  We believe that Wikipedia is an amazing tool, but often find it difficult to visualize how ideas are related from a linear
			page of text and article links.</p>
			
			<p>It's not always possible to know what a linked article is about without visiting it and reading at least the introductory
			paragraph, and you are limited to looking at one related article  at time, with no metric to determine how related that article
			actually is.  By providing a visual, interactive way to navigate Wikipedia, we hope to bring simplicity to the massive amount of human
			knowledge which Wikipedia has to offer.</p>
			
			<h1>Our Mission</h1><
			
			<p>WikiMap's mission is to visualize article relatedness by identifying and representing the strongest article relationships.  We are 
			all about finding new an interesting ways to explore knowledge and related ideas, and that's at the heart of our product.</p>

			<p>We want to provide a fun, easy-to-use, simple, and visually appealing way to explore Wikipedia at a high level while enabling users
			to interact with Wikipedia as a map of interconnected articles.  Simplifying the process of viewing many related articles' content and
			images and providing an extensible software product are also major interests.</p>

			 <h1>Our Beginning </h1>
			 
			 <p>WikiMap is a student project from the University of Washington's Computer Science and Engineering department.  It began as a
			 Software Engineering course student project in Winter 2011.</p>
			 
			 <p>The original idea of WikiMap was pitched by a team of three; we are now a team of eight working toward the common goal of making 
			 WikiMap a great tool for everyone to use.</p>
			 
			 <h1>Become a Contributor</h1>
			 
			 <p>WikiMap is open-source.  If you want to become a part of the WikiMap project, please <a href="contact.php">Contact Us</a>.  Our
			 source code is also <a href="#googlecodelink">available on Google Code</a>.</p>
		</div>
	</div>
   </body>
   </html>
