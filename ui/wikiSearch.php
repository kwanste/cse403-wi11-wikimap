<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>WikiMap</title>

		<link rel="stylesheet" href="css/main.css" type="text/css" />
		<link rel="stylesheet" href="css/wikiSearch.css" type="text/css" />
		<SCRIPT LANGUAGE="JavaScript" SRC="scripts/wikiSearch.js">
		</SCRIPT>

		<!--[if IE]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
		<!--[if lte IE 7]>
			<script src="js/IE8.js" type="text/javascript"></script><![endif]-->
		<!--[if lt IE 7]>
			<link rel="stylesheet" type="text/css" media="all" href="css/ie6.css"/><![endif]-->
	</head>

	<body id="index" class="home" onload="drawShape();">
		
		<div id="wholeSite">
			<span id="mainSide"> 
				<div id="searchBar">
					<span id="title">
						Wiki<b>Map</b>
					</span>
					<form id="searchForm" method="post" action="test.php">
						<input id="search" name="search" type="search" size="20">
						<select id="language">
							<option value="en">English</option>
							<option value="fr">French</option>
						<select>
						<input type="submit" value=" ->  " name="go">
					</form>
				</div>
				<div id="mainFrame">
					<canvas id="mapView" width="800" height="600" style="border: 1px gray dashed">
						Your browser is not compatible with this Canvas tool
					</canvas>

				</div>
			</span>
			
			<span id="sideBar"> 
				<div id="thumbnail">
					<img src="images/image.jpg" height="360px" width="280px"/>
				</div>
				<div id="previewText">
					William Henry "Bill" Gates III, (born October 28, 1955)[2] is an American business magnate, philanthropist, 
					author and was chairman[3] of Microsoft until 2008, the software company he founded with Paul Allen. He is 
					consistently ranked among the world's wealthiest people[4] and was the wealthiest overall from 1995 to 2009, 
					excluding 2008, when he was ranked third.[5] During his career at Microsoft, Gates held the positions of CEO 
					and chief software architect, and remains the largest individual shareholder with more than 8 percent of the 
					common stock.[6] He has also authored or co-authored several books.
				</div>
			</span>
		</div>
		
	</body>
</html>
