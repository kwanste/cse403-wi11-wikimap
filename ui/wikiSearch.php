<!DOCTYPE html>

<?php
	include("retriever.php");
	$db_ret = new DatabaseRetriever;
	$article = $_GET['s'];
?>

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

		<script type="text/javascript">
			function doSubmit()
			{
				var theForm=document.getElementById("searchForm");
				theForm.action = 'wikiSearch.php?s=' + document.getElementById("search").value;
				theForm.submit();
			}
		</script>
		
		<div id="wholeSite">
			<span id="mainSide"> 
				<div id="searchBar">
					<span id="title">
						Wiki<b>Map</b>
					</span>
					<form id="searchForm" method="post" action="test.php">
						<?php echo '<input id="search" name="search" type="search" value="'.$article.'" size="20">' ?>
						<select id="language">
							<option value="en">English</option>
							<option value="fr">French</option>
						<select>
						<input type="submit" value=" ->  " name="go" onClick="javascript:doSubmit();">
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
					<?php echo '<img class="thumbnail_image" src="'.$db_ret->getImageURL($article).'" />'; ?>
				</div>
				<div id="previewText">
					<?php echo $db_ret->getPreviewText($article); ?>
				</div>
			</span>
		</div>
		
	</body>
</html>
