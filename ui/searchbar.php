<!-- This file contains the searchBar functionality for the WikiMap UI. -->

<script type="text/javascript">
	function doSubmit()
	{
		var theForm=document.getElementById("searchForm");
		theForm.action = 'wikiSearch.php?s=' + document.getElementById("search").value;
		theForm.submit();
	}
</script>

<form id="searchForm" method="post" action="wikiSearch.php">
	<input id="search" name="search" type="search" value="" size="20">
		<select id="language">
			<option value="en">English</option>
		</select>
	<input type="image" src="images/search_button.png" name="go" onClick="javascript:doSubmit();">
</form>
