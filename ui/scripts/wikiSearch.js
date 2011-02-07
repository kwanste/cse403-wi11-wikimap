var url = window.location.href;
var urlBroken = url.split('?');
var findSearch = urlBroken[1].split('=');
var searchString = findSearch[1];
searchString = searchString.replace("%20", " ");

var jQuery = window.jQuery = window.$ = function(selector, context)
    {
       // ...
       // other internal initialization code goes here
    };

function getPreviewText(search){
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/getPreviewText.php",
	   data: "s=" + search,
	   success: function(responseText){
		 $('#previewText').text(responseText);
	   }
	 });
}

function getImageURL(search){
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/getImageURL.php",
	   data: "s=" + search,
	   success: function(responseText){
		 $('#thumbnailImage').attr("src", responseText);
		 $('#thumbnailImage').css("display", "block");
	   }
	 });
}

function getArticlePage(search) {
	// We should be getting an article for the current page
	// right now it just grabs the summary and makes the current page that. 
	// But we should really be getting the page from wikipedia and processing it
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/getPreviewText.php",
	   data: "s=" + search,
	   success: function(responseText){
		 $('#articleView').text(responseText);
	   }
	 });
}

function toggleMap() {
	if ($('#mapView').css('display') == 'none')
	{
		$('#mapView').css('display', 'block');
		$('#articleView').css('display', 'none');
	} else {
		$('#mapView').css('display', 'none');
		$('#articleView').css('display', 'block');
	}
}

function initialize() {
	getPreviewText(searchString);
	getImageURL(searchString);
	getArticlePage(searchString);
	drawShape();
}