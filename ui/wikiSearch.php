<!DOCTYPE html>

<?php
	include("retriever.php");
	$db_ret = new DatabaseRetriever;
	$article = $_GET['s'];
        
        // next line is a temporary hack just for the alpha
        $foundarticle = $db_ret->getPreviewText($article) != null
?>

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>WikiMap</title>

		<link rel="stylesheet" href="css/main.css" type="text/css" />
		<link rel="stylesheet" href="css/wikiSearch.css" type="text/css" />
		<SCRIPT LANGUAGE="JavaScript" SRC="scripts/wikiSearch.js" >
                    </SCRIPT>

		<!--[if IE]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
		<!--[if lte IE 7]>
			<script src="js/IE8.js" type="text/javascript"></script><![endif]-->
		<!--[if lt IE 7]>
			<link rel="stylesheet" type="text/css" media="all" href="css/ie6.css"/><![endif]-->
	</head>

	<!--<body id="index" class="home" onload="drawShape();">-->
        <?php if (!$foundarticle)
            // this is a quick-fix for the alpha. 
                    echo '<body id="index" class="home" onload="drawShape();toggleMap();">';
              else
                    echo '<body id="index" class="home" onload="drawShape();">';
        ?>

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

                                        <?php
                                            if ($foundarticle)
                                                    include("dummyWikiPage.php");
                                            else
                                                    include("dummySearchResults.php");
                                        ?>


				</div>
			</span>

			<span id="sideBar">
				<div id="thumbnail">
                                    <a href = "javascript:toggleMap();" >
					<?php echo '<img class="thumbnail_image" src="'.$db_ret->getImageURL($article).'" />'; ?>
                                    </a>
				</div>
				<div id="previewText">
					<?php echo $db_ret->getPreviewText($article); ?>
				</div>
			</span>
		</div>

	</body>
</html>
