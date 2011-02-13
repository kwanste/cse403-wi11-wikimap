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

function fileNotFound(search) {
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/dummySearchResults.php",
	   data: "s=" + search,
	   success: function(responseText){
			$('#mapView').css('display', 'none');
			$('#articleView').css('display', 'block');
			$('#articleView').html(responseText);
	   }
	 });
}	
	
function getPreviewText(search){
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/retrieverAPI.php",
	   data: "s=" + search + "&function=getPreviewText",
	   success: function(responseText){
			if(responseText != "Not Found"){
				$('#previewText').text(responseText);
				$('#articleTitle').text(search);
			} else 
				$('#previewText').text("Article Not Found");
	   }
	 });
}

function getImageURL(search){
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/retrieverAPI.php",
	   data: "s=" + search + "&function=getImageURL",
	   success: function(responseText){
			$('#thumbnailImage').attr("src", responseText);
			$('#thumbnailImage').css("display", "block");
			/*if (responseText == "images/image_not_found.png") {
				$('#thumbnailImage').css("width", "195px");
				$('#thumbnailImage').css("height", "200px");
			}*/
	   }
	 });
}

function getArticlePage(search) {
	// We should be getting an article for the current page
	// right now it just grabs the summary and makes the current page that. 
	// But we should really be getting the page from wikipedia and processing it
	console.log("searching" + search);
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/retrieverAPI.php",
	   data: "s=" + search + "&function=getPreviewText",
	   success: function(responseText){
			if(responseText == "Not Found")
				fileNotFound(search);
			else 
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
	mapInit();
	drawMap("Bill Gates//Amazon.com|Child2|Child3|Child4|Child5|Child6"
	 + "//Child1a|Child1b||Child2a|Child2b||Child3a|Child3b||Child4a|Child4b||Child5a|Child5b||Child6a|Child6b");
}
