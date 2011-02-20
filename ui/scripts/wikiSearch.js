var url = window.location.href;
var FOUND_ARTICLE = true;
var urlBroken = url.split('?');
var findSearch = urlBroken[1].split('=');
var searchString = findSearch[1];
var onLoad = true;
searchString = searchString.replace("%20", " ");
var jQuery = window.jQuery = window.$ = function(selector, context)
    {
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
	
//function getPreviewText(search, previewCache, index){
function getPreviewText(articleHTML, previewCache, index){
	if(previewCache[index] == "") {
		beginPreview = articleHTML.split("</table>\n<p>");
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

//function getImageURL(search, urlCache, index){
function getImageURL(articleHTML, urlCache, index) {
	if (urlCache[index] == "") {
		beginImage = articleHTML.split('class="image"');
		if (beginImage.length != 1) {
			middleImage = beginImage[1].split('src="');
			endImage = middleImage[1].split("/>");
			imageURL = endImage[0].substring(0, endImage[0].indexOf('"'));
		} else {
			imageURL = "images/image_not_found.jpg";
		}
		urlCache[index] = imageURL;
	} else {
		imageURL = urlCache[index];
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
				url: 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&callback=?',
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


function getFromWikipedia(search, urlCache, previewCache, articleTitles, index) {
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
			if (onLoad || urlCache[index] == "") {
				$('#articleView').html(data.parse.text['*']);
				onLoad = false;
			}
			displayTitle(articleTitles[index]);
			var imageURL = getImageURL(data.parse.text['*'], urlCache, index);
			var previewText = getPreviewText(data.parse.text['*'], previewCache, index);
			cacheArticle("insertImageURL", articleTitles[index], imageURL);
			cacheArticle("insertPreviewText", articleTitles[index], previewText);
		}
	});
}

function getArticlePage(search, urlCache, previewCache, articleTitles, index) {
	if (previewCache[index] == "") {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: "scripts/retrieverAPI.php",
		   data: "s=" + search + "&function=getPreviewText",
		   success: function(responseText){
				if (responseText == "Not Found") {
					getFromWikipedia(search, urlCache, previewCache, articleTitles, index);
				} else {
					displayTitle(articleTitles[index]);
					previewCache[index] = responseText;
					$('#previewText').html(previewCache[index]);
					
					$.ajax({
					   type: "POST",
					   async: true,
					   url: "scripts/retrieverAPI.php",
					   data: "s=" + search + "&function=getImageURL",
					   success: function(responseText){
							displayTitle(articleTitles[index]);
							urlCache[index] = responseText;
							$('#loader').css("display", "none");	
							$('#thumbnailImage').attr("src", urlCache[index]);
							$('#thumbnailImage').css("display", "block");
					   }
					 });
				}
		   }
		 });
		 
	} else {
		displayTitle(articleTitles[index]);
		getImageURL("", urlCache, index);
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
				console.log(responseText);
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
	URL_CACHE[0] = "";
	PREVIEW_CACHE[0] = "";
	getArticlePage(searchString , URL_CACHE, PREVIEW_CACHE, ARTICLE_TITLES, 0);
	mapInit();
	getRelevancyTree(searchString);
}
