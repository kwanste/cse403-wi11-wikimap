<?php
	
	include("retriever.php");
	$db_ret = new DatabaseRetriever;
	//$db_ret = new DatabaseRetriever("iprojsrv.cs.washington.edu");
	$debug = false;
	if($debug) {
		$article = $_GET['s'];
		$function = $_GET['function'];
		$depthArray = $_GET['depthArray'];
		$maxDepth = $_GET['maxDepth'];
	} else {
		$article = $_POST['s'];
		$function = $_POST['function'];
		$depthArray = $_POST['depthArray'];
		$maxDepth = $_POST['maxDepth'];
	}
  
	// next line is a temporary hack just for the alpha
	//$foundarticle = $db_ret->getPreviewText($article) != null

	if ($function == 'getImageURL')
		echo $db_ret->getImageURL($article);
	
	else if ($function == 'getPreviewText') {
		echo $db_ret->getPreviewText($article);
	} else if ($function == 'getRelevancyTree') {
		//echo $db_ret->getRelevancyTree($article, array(6,2), 2);
		if ($maxDepth == null)
			$maxDepth = 0;
        echo $db_ret->getRelevancyTree($article, $depthArray, $maxDepth);
	}
?>