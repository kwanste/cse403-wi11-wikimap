var url = window.location.href;
var FOUND_ARTICLE = true;
var urlBroken = url.split('?');
var findSearch = urlBroken[1].split('=');
var searchString = findSearch[1];
var onLoad = true;
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
	
function getPreviewText(search, previewCache, index){
	if (onLoad || previewCache[index] == "") {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: "scripts/retrieverAPI.php",
		   data: "s=" + search + "&function=getPreviewText",
		   success: function(responseText){
				if(responseText != "Not Found"){
					$('#previewText').text(responseText);
					$('#articleTitle').text(search);
					previewCache[index] = responseText;
				} else  {
					$('#previewText').text("Article Not Found");
					previewCache[index] = "Article Not Found";
					if (onLoad)
						FOUND_ARTICLE = false;
				}
				onLoad = false;
		   }
		 });
	} else {
		$('#previewText').html(previewCache[index]);
		$('#articleTitle').text(search);
	}
}

function getImageURL(search, urlCache, index){
	
	if (onLoad || urlCache[index] == "") {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: "scripts/retrieverAPI.php",
		   data: "s=" + search + "&function=getImageURL",
		   success: function(responseText){
				$('#thumbnailImage').attr("src", responseText);
				$('#thumbnailImage').css("display", "block");
				urlCache[index] = responseText;
		   }
		 });
	} else {
		$('#thumbnailImage').attr("src", urlCache[index]);
		$('#thumbnailImage').css("display", "block");
	}
	/*
	
	searchWiki = "http://en.wikipedia.org/wiki/" + search.replace(" ", "_");
	//$('#wholeSite').load('http://google.com'); // SERIOUSLY!
	
	
	
	/*
	var container = $('#wholeSite');
	$('.ajaxtrigger').click(function(){
		doAjax($(this).attr('href'));
		return false;
	});
*/

	
	
 
	/*$.ajax({
		url: searchWiki,
		type: 'GET',
		success: function(res) {
			alert(res.responseText);

		}
	});*/
	
	/*
	if (onLoad || urlCache[index] == "") {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: searchWiki,
		   success: function(responseText){
				$('#thumbnailImage').attr("src", responseText);
				$('#thumbnailImage').css("display", "block");
				urlCache[index] = responseText;
		   }
		 });
	} else {
		$('#thumbnailImage').attr("src", urlCache[index]);
		$('#thumbnailImage').css("display", "block");
	}
	*/
}


/*
function doAjax(url){
	// if it is an external URI
	if(url.match('^http')){
	// call YQL
		$.getJSON("http://query.yahooapis.com/v1/public/yql?"+
				"q=select%20*%20from%20html%20where%20url%3D%22"+
				encodeURIComponent(url)+
				"%22&format=xml'&callback=?",
				// this function gets the data from the successful
				// JSON-P call
				function(data){
					// if there is data, filter it and render it out
					if(data.results[0]){
						var data = filterData(data.results[0]);
						container.html(data);
					// otherwise tell the world that something went wrong
					} else {
						var errormsg = '<p>Error: could not load the page.</p>';
						container.html(errormsg);
					}
				}
		);
	// if it is not an external URI, use Ajax load()
	} else {
		$('#wholeSite').load(url);
	}
}
// filter out some nasties
function filterData(data){
	data = data.replace(/<?/body[^>]*>/g,'');
	data = data.replace(/[r|n]+/g,'');
	data = data.replace(/<--[Ss]*?-->/g,'');
	data = data.replace(/<noscript[^>]*>[Ss]*?</noscript>/g,'');
	data = data.replace(/<script[^>]*>[Ss]*?</script>/g,'');
	//data = data.replace(/<script.*///>/,'');
	//return data;
//}


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

function getRelevancyTree(search) {
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/retrieverAPI.php",
	   data: "s=" + search + "&function=getRelevancyTree",
	   success: function(responseText){
				drawMap(responseText);
	   }
	 });
}

function toggleMap() {
	if(FOUND_ARTICLE) {
		if ($('#mapView').css('display') == 'none')
		{
			$('#mapView').css('display', 'block');
			$('#articleView').css('display', 'none');
		} else {
			$('#mapView').css('display', 'none');
			$('#articleView').css('display', 'block');
		}
	}
}

function initialize() {
	getImageURL(searchString, URL_CACHE, 0);
	getPreviewText(searchString, PREVIEW_CACHE, 0);
	getArticlePage(searchString);
	mapInit();
	getRelevancyTree(searchString);
}
