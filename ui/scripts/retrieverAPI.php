<?php
	
	include("retriever.php");
	$db_ret = new DatabaseRetriever;
	$article = $_POST['s'];
	$function = $_POST['function'];
  
	// next line is a temporary hack just for the alpha
	//$foundarticle = $db_ret->getPreviewText($article) != null

	if ($function == 'getImageURL')
		echo $db_ret->getImageURL($article);
	
	else if ($function == 'getPreviewText') {
		echo $db_ret->getPreviewText($article);
	} else if ($function == 'getRelevancyTree') {
		//echo $db_ret->getRelevancyTree($article, array(6,2), 2);
                echo $db_ret->getRelevancyTree($article, "6,2", 2);
	}
?>