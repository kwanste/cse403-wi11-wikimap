<!-- This file is one of the main UI components which divides the UI into a MainFrame,
SideBar, Thumbnail, etc. -->

<!DOCTYPE html>

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>WikiMap</title>

		<link rel="stylesheet" href="css/main.css" type="text/css" />
		<link rel="stylesheet" href="css/wikiSearch.css" type="text/css" /> 
		<link rel="stylesheet" href="css/wikipedia.css" type="text/css" />
		<SCRIPT LANGUAGE="JavaScript" SRC="scripts/articleNode.js" >
        </SCRIPT>
		<SCRIPT LANGUAGE="JavaScript" SRC="scripts/wikiSearch.js" >
        </SCRIPT>
		<SCRIPT LANGUAGE="JavaScript" SRC="scripts/drawMap.js" >
        </SCRIPT>
		<SCRIPT LANGUAGE="JavaScript" SRC="scripts/jquery-1_5.js" >
        </SCRIPT>

		<!--[if IE]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
		<!--[if lte IE 7]>
			<script src="js/IE8.js" type="text/javascript"></script><![endif]-->
		<!--[if lt IE 7]>
			<link rel="stylesheet" type="text/css" media="all" href="css/ie6.css"/><![endif]-->
	</head>

	<body id="index" class="home" onload="initialize();">
		<div id="wholeSite">
			<span id="mainSide">
				<div id="searchBar">
					<span id="title">
						Wiki<b>Map</b>
					</span>
					<?php include("searchbar.php") ?>
				</div>
				<div id="mainFrame">
					<canvas id="mapView" width="800" height="600" >
						Your browser is not compatible with this Canvas tool
					</canvas>
					<div id="articleView">
						<img src="images/loader.gif" />
					</div>
				</div>
			</span>
			<span id="sideBar">
				<div id="swap">
					<p align="center" class="swap">
						<a href = "javascript:toggleMap();" >
							<img src="images/view_article_logo_small.png" style="vertical-align: middle" 
							alt="Click to view full article" border="0" /></a>View Full Article
                    </p>
				</div>
				<b>
					<div id="articleTitle">
                    </div>
				</b>
				<div id="thumbnail">
					<img id="loader" src="images/loader.gif" />
					<a href = "javascript:toggleMap();">
						<img id="thumbnailImage" src="" alt="Click to view full article" border="0" />
					</a>
				</div>
				<div id="previewText">
				<p>
				</p>
				</div>
			</span>
		</div>
	</body>
</html>
