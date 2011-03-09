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
				<a href="index.php">Wiki<b>Map</b></a>
			</span>
			<?php include("searchbar.php") ?>
		</div>
		<div id="centerDiv">
			<div id="textArea">
			<h2>What is WikiMap?</h2>
			<p>WikiMap is an interactive, web-browser based visualization of Wikipedia articles and their relationships.  It is targeted toward knowledge and Wikipedia enthusiasts: people who regularly browse Wikipedia for casual fun, research, homework,
			and more.  For more information on WikiMap and our goals, please visit the <a href="about.php">About</a> page.</p>
			
			<h2>Why did you make WikiMap?</h2>
			<p>We believe that Wikipedia is an amazing tool, but often find it difficult to visualize how ideas are related from a linear page of text and article links.  That's one of the primary issues WikiMap is trying to solve.</p>
			
			<h2>What browsers are supported?</h2>
			<p>WikiMap is supported in Chrome 9+, Firefox 3.6+, and Safari 5+.  Internet Explorer is not supported at this time because WikiMap uses HTML5 and Canvas, which will not be supported until <a href="http://ie.microsoft.com/testdrive/" target="_blank">IE9</a>.</p>
			
			<h2>Why is WikiMap running slowly?</h2>
			<p>It's possible that you're using an outdated browser.  While we recommend Firefox 3.6+, Firefox support for HTML5 and Canvas more rough in pre-Firefox 4.  HTML5 and Canvas are both relatively new, so performance may be a little slow. Load on the Wikipedia API or our database are also possible contributors.  We're working hard to improve the performance of WikiMap, so thank you for your patience. That being said, if you think you've found a bug, please <a href="contact.php">contact us</a>.</p>
			<h2>How do I search for an article?</h2>
			<p>Enter your search term into the search box at the top of this (or any) page and hit "Enter" on your keyboard, or click the search button (blue magnifying glass).</p>
			<h2>How do I navigate the map?</h2>
			<p>You may click and drag on the map to move it around and explore article relationships beyond the edge of the map.  Clicking on an article bubble in the map will run a search on that article and re-draw the map depending on what's related to that article.  Hovering over an article bubble will provide an image preview and preview article text will load in the pane on the right.</p>
			<h2>How can I get more information on an article?</h2>
			<p>You have a few different options:</p>
			<ul>
				<li><p><b>Article Preview</b>: Hover your mouse cursor over an article bubble in 
				the map.  An image preview and preview article text will load in the pane on the 
				right.</p></li>
				<li><p><b>View Full Article:</b> Click the "View Full Article" button at the top 
				right.</p></li>
				<li><p><b>Explore the Map:</b>  Click on any article bubble in the map to see the relationship map for that article, or click and drag to move the map around.</p></li>
			</ul>
			<h2>What does hovering on an article bubble do?</h2>
			<p>Hovering over an article bubble provides an image preview and preview text in the pane on the right.</p>
			<h2>How can I view a full Wikipedia article?</h2>
			<p>Just click on the "View Full Article" button at the top right of the window. Note that this will swap you to the article that was centered in the map.</p>
			<h2>Why is your article different than Wikipedia?</h2>
			<p>We don't host all of the same content as Wikipedia, especially when it comes to multimedia such as sound clips or large image files.  For now, we remove these Wikipedia-specific functionalities.</p>
			<h2>I found a bug - how do I report it?</h2>
			<p>Please visit our <a href="contact.php">Contact</a> page for instructions on reporting a bug.</p>
			<h2>Where can I find your source code?</h2>
			<p>The WikiMap source code is available from our <a href="http://code.google.com/p/cse403-wi11-wikimap/" target="_blank">Google Code</a> repository.</p>
			<h2>What if I'd like to contribute to the WikiMap project?</h2>
			<p>We are not officially recruiting contributors to the WikiMap project, but we're always available for <a href="contact.php">contact</a> if you are highly interested.  Our code <i>is</i> open source if you would like to work with it.</p>
		</div>
	</div>
   </body>
   </html>
