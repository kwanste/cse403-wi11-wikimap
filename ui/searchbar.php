<!-- This file contains the searchBar functionality for the WikiMap UI. -->

<script type="text/javascript">
	function doSubmit()
	{
            var newURL = 'wikiSearch.php?s=' + encodeURIComponent(document.getElementById("search").value);
            /*if(window.history.pushState)    // on newer browsers, we can avoid the page reload
            {
                window.history.pushState('newsearch', 'Title', newURL);
                initialize();               // initialize is behaving funny if you call it a second time.
            }
            else
            {*/
		var theForm=document.getElementById("searchForm");
		theForm.action = newURL;
		theForm.submit();
            //}
	}
</script>

<form id="searchForm" method="post" action="wikiSearch.php">
	<input id="search" name="search" type="search" value="" size="20">
		<select id="language">
			<option value="en">English</option>
		</select>
	<input type="image" src="images/search_button.png" name="go" onClick="javascript:doSubmit();" style="vertical-align: bottom;">
	<div id="menu">
		<a href="about.php">About</a>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<a href="faq.php">FAQ</a>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<a href="contact.php">Contact</a>
	</div>
</form>
