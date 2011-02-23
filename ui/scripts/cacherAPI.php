<?php
	
	include("cacher.php");
	$db_cache = new DatabaseCacher;
	$article = $_POST['article'];
	$data = $_POST['data'];
	$function = $_POST['function'];
	
	/* For Debugging
	$article = $_GET['article'];
	$data = $_GET['data'];
	$function = $_GET['function'];
	*/
  
	// next line is a temporary hack just for the alpha
	//$foundarticle = $db_ret->getPreviewText($article) != null
	if ($function == 'insertImageURL') {
		$db_cache->insertImageURL($article, $data);
	}
	else if ($function == 'insertPreviewText') {
		$db_cache->insertPreviewText($article, $data);
	}
	else if ($function == 'insertTree'){
		$db_cache->insertTree($article, $zoom, $data);
	}
?>