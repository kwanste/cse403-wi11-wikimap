<?php
	
	include("retriever.php");
	$db_ret = new DatabaseRetriever;
	$article = $_POST['s'];
        
	// next line is a temporary hack just for the alpha
	//$foundarticle = $db_ret->getPreviewText($article) != null

	echo $db_ret->getImageURL($article)
?>