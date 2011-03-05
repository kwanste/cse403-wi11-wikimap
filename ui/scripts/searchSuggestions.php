<?php
	$debug = false;
	if ($debug)
		$search = $_GET['s'];
	else
		$search = $_POST['s'];
	echo getSearchSuggestions($search);
	
	function getSearchSuggestions($search)
	{
                $search = preg_replace("/\s/", "+", $search);   // turn whitespace into +

		$appID = "CAA056181AE100040438EF456936CE6E1763E75A";
		$query = "http://api.search.live.net/json.aspx?Appid=".$appID."&query="
			.$search."+site%3Aen.wikipedia.org&sources=web+spell";
		$result = file_get_contents($query);
		$parsed = json_decode($result);
		$returnText = "Article Not Found";

		if(isset($parsed->SearchResponse->Spell))
		{
			$suggestion = $parsed->SearchResponse->Spell->Results[0]->Value;
			$returnText .= "<br><br>Did you mean: ";
			$suggestion = str_replace(" site:en.wikipedia.org", "", $suggestion);
			$returnText .= GenerateLink($suggestion);
			$search = $suggestion;
		}
		if(isset($parsed->SearchResponse->Web->Results))
		{
			$searchResults = $parsed->SearchResponse->Web->Results;
			foreach($searchResults as $value)
			{
				$articleTitle = str_replace(" - Wikipedia, the free encyclopedia", "", $value->Title);
				$returnText .= "<br><br>";	
				$returnText .= GenerateLink($articleTitle);
				$description = str_ireplace($search, "<b>".$search."</b>", $value->Description);
				$returnText .= "<br>".$description;						
			}
		}
		return $returnText;
	}		
	
	function GenerateLink($article)
	{
		return "<a href = \"wikiSearch.php?s=".$article."\">"
			.$article."</a>"; 
	}		
?>