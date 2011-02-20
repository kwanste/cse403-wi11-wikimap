var ON_LOAD = true;
var FOUND_ARTICLE = true;
var SEARCH_STRING;
var jQuery = window.jQuery = window.$ = function(selector, context)
    {
    };
	
// Makes an asynchronous call to searchSuggestions.php to show a list of suggested results
// in the case that an article wasn't found.
function articleNotFound(search) {
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/searchSuggestions.php",
	   data: "s=" + search + "&function=getSearchSuggestions",
	   success: function(responseText){
			$('#mapView').css('display', 'none');
			$('#articleView').css('display', 'block');
			$('#articleView').html(responseText);
	   }
	 });
}	
	
// Parses an article html returned from wikipedia for the preview text and displays it	
function getPreviewText(articleHTML, previewCache, index){
	// Check if it is already cached
	if(previewCache[index] == "") {
		beginPreview = articleHTML.split("</table>\n<p>");
		// Error checks if it can't find a table 
		if (beginPreview.length != 1) {
			endPreview = beginPreview[1].split('<table');
			finalPreview = endPreview[0].length > 1800 ? endPreview[0].substring(0, 1800) + "..." : endPreview[0];
		} else {
			finalPreview = articleHTML.length > 1800 ? articleHTML.substring(0, 1800) + "..." : articleHTML;
		}
		previewCache[index] = finalPreview;
	} else {
		finalPreview = previewCache[index];
	}
	$('#previewText').html(finalPreview);
	return finalPreview;
}

function getImageURL(articleHTML, URLCache, index) {
	if (URLCache[index] == "") {
		beginImage = articleHTML.split('class="image"');
		if (beginImage.length != 1) {
			middleImage = beginImage[1].split('src="');
			endImage = middleImage[1].split("/>");
			imageURL = endImage[0].substring(0, endImage[0].indexOf('"'));
		} else {
			imageURL = "images/image_not_found.jpg";
		}
		URLCache[index] = imageURL;
	} else {
		imageURL = URLCache[index];
	}
	$('#loader').css("display", "none");	
	$('#thumbnailImage').attr("src", imageURL);
	$('#thumbnailImage').css("display", "block");	
	return imageURL;
}

function displayTitle(title) {
	$('#articleTitle').text(title);
}

// Find results similar to Bill Gates
	/*
	$.ajax({
				URL: 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&callback=?',
				dataType: 'json',
				data: { search: 'Bill Gates' },
				success: function(data) {
					//alert(responseText);
					//$('p#testing').html( '# ' + data[1] + '<br />' + $('p#testing').html() );	
					for (i in data[1]) $('#wholeSite').append( '<li>' + data[1][i] + '</li>' );
				}	
			});
	
	
	searchWiki = "http://en.wikipedia.org/wiki/" + search.replace(" ", "_");
	*/


function getFromWikipedia(search, URLCache, previewCache, articleTitles, index) {
	$.ajax({
		url: 'http://en.wikipedia.org/w/api.php',
		data: {
		  action:'parse',
		  prop:'text',
		  page:search,
		  format:'json',
		  redirects:''
		},
		dataType:'jsonp',
		success: function(data) {
			if (data.parse == null) {
					articleNotFound(search);
				} else {
				if (ON_LOAD || URLCache[index] == "") {
						$('#articleView').html(data.parse.text['*']);
					}
					ON_LOAD = false;
				displayTitle(articleTitles[index]);
				var imageURL = getImageURL(data.parse.text['*'], URLCache, index);
				var previewText = getPreviewText(data.parse.text['*'], previewCache, index);
				cacheArticle("insertImageURL", articleTitles[index], imageURL);
				cacheArticle("insertPreviewText", articleTitles[index], previewText);
			}
		}
	});
}

function getArticlePage(search, URLCache, previewCache, articleTitles, index) {
	if (previewCache[index] == "") {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: "scripts/retrieverAPI.php",
		   data: "s=" + search + "&function=getPreviewText",
		   success: function(responseText){
				if (responseText == "Not Found") {
					getFromWikipedia(search, URLCache, previewCache, articleTitles, index);
				} else {
					displayTitle(articleTitles[index]);
					previewCache[index] = responseText;
					$('#previewText').html(previewCache[index]);
					
					$.ajax({
					   type: "POST",
					   async: true,
					   URL: "scripts/retrieverAPI.php",
					   data: "s=" + search + "&function=getImageURL",
					   success: function(responseText){
							displayTitle(articleTitles[index]);
							URLCache[index] = responseText;
							$('#loader').css("display", "none");	
							$('#thumbnailImage').attr("src", URLCache[index]);
							$('#thumbnailImage').css("display", "block");
					   }
					 });
				}
		   }
		 });
		 
	} else {
		displayTitle(articleTitles[index]);
		getImageURL("", URLCache, index);
		getPreviewText("", previewCache, index);
	}
	 
}

function cacheArticle(functionCall, article, data) {
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/cacherAPI.php",
	   data: "article=" + article.replace("&", "%26") + 
			"&data=" + data.replace("&", "%26") + 
			"&function=" + functionCall
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
	var url = window.location.href;
	var URLbroken = url.split('?');
	var findSearch = URLbroken[1].split('=');
	SEARCH_STRING = findSearch[1].replace("%20", " ");
	URL_CACHE[0] = "";
	PREVIEW_CACHE[0] = "";
	getArticlePage(SEARCH_STRING , URL_CACHE, PREVIEW_CACHE, ARTICLE_TITLES, 0);
	mapInit();
	getRelevancyTree(SEARCH_STRING);
}
