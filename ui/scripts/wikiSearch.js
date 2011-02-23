var ON_LOAD = true;
var FOUND_ARTICLE = true;
var SEARCH_STRING;
var jQuery = window.jQuery = window.$ = function(selector, context)
    {
    };
	
// Makes an asynchronous call to searchSuggestions.php to show a list of suggested results
// in the case that an article wasn't found.
function articleNotFound(search) {
/*
	$.ajax({
		URL: 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5',
		dataType: 'json',
		data: { search: 'Bill Gates' },
		success: function(data) {
			alert('hello');
			//$('p#testing').html( '# ' + data[1] + '<br />' + $('p#testing').html() );	
			var didYouMean = "";
			for (i in data[1]) 
				didYouMean += '<li>' + data[1][i] + '</li>';
			$('#articleView').html(didYouMean);
			toggleMap();
		}	
	});
	*/
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/searchSuggestions.php",
	   data: "s=" + search + "&function=getSearchSuggestions",
	   success: function(responseText){
			if (ON_LOAD) {
				$('#mapView').css('display', 'none');
				$('#articleView').css('display', 'block');
				$('#articleView').html(responseText);
			}
	   }
	 });
}	
	
// Parses an article html returned from wikipedia for the preview text and displays it
// Returns the preview text	
function getPreviewText(articleHTML, Nodes, index){
	// Check if it is already cached
	if(Nodes[index].previewCache == "") {
		beginPreview = articleHTML.split("</table>\n<p>");
		// Error checks if it can't find a table 
		if (beginPreview.length != 1) {
			endPreview = beginPreview[1].split('<table');
			finalPreview = endPreview[0].length > 1800 ? endPreview[0].substring(0, 1800) + "..." : endPreview[0];
		} else {
			finalPreview = articleHTML.length > 1800 ? articleHTML.substring(0, 1800) + "..." : articleHTML;
		}
		// Now caches it
		Nodes[index].previewCache = finalPreview;
	} else {
		finalPreview = Nodes[index].previewCache;
	}
	// Now Display preview Text
	$('#previewText').html(finalPreview);
	return finalPreview;
}

// Parses an article thml returned from wikipedia for the image url and displays it
// Returns the image url
function getImageURL(articleHTML, Nodes, index) {
	// Check if it is cached already
	if (Nodes[index].urlCache == "") {
		beginImage = articleHTML.split('class="image"');
		// Make sure that the articleHTML has an image
		if (beginImage.length != 1) {
			middleImage = beginImage[1].split('src="');
			endImage = middleImage[1].split("/>");
			imageURL = endImage[0].substring(0, endImage[0].indexOf('"'));
		} else {
			imageURL = "images/image_not_found.jpg";
		}
		Nodes[index].urlCache = imageURL;
	} else {
		imageURL = Nodes[index].urlCache;
	}
	// Display the image
	$('#loader').css("display", "none");	
	$('#thumbnailImage').attr("src", imageURL);
	$('#thumbnailImage').css("display", "block");	
	return imageURL;
}

// This function just changes the title display above the image
function displayTitle(title) {
	$('#articleTitle').text(title);
}

// Does an asynchronous function which grabs data wikipedia and then parses the data
function getFromWikipedia(search, Nodes, index, loadArticleViewOnly, onLoad) {
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
			// Changes the title and parses the articleHTML
			displayTitle(Nodes[index].title);
			// If this is the initial article searched, then display the article in articleView
			if (loadArticleViewOnly && onLoad) {
				$('#articleView').html(data.parse.text['*']);
				return;
			}
			// Check if the article was found
			if (data.parse == null) {
				articleNotFound(search);
			} else {
				if (onLoad) {
					$('#articleView').html(data.parse.text['*']);
				}
				// parse and cache the image url and preview text
				var imageURL = getImageURL(data.parse.text['*'], Nodes, index);
				var previewText = getPreviewText(data.parse.text['*'], Nodes, index);
				cacheArticle("insertImageURL", Nodes[index].title, imageURL);
				cacheArticle("insertPreviewText", Nodes[index].title, previewText);
			}
		}
	});
}

// Checks if the article is already cached in our db
function getArticlePage(search, Nodes, index) {
	if (Nodes[index].previewCache == "") {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: "scripts/retrieverAPI.php",
		   data: "s=" + search + "&function=getPreviewText",
		   success: function(responseText){
				// if article not cached, then get it from wikipedia and parse it.
				if (responseText == "Not Found") {
					getFromWikipedia(search, Nodes, index, false, ON_LOAD);
					ON_LOAD = false;
				} else {
					getFromWikipedia(search, Nodes, index, true, ON_LOAD);
					ON_LOAD = false;
					Nodes[index].title = search;
					displayTitle(search);
					Nodes[index].previewCache = responseText;
					// Go grab the image since we know it is cached
					$.ajax({
					   type: "POST",
					   async: true,
					   url: "scripts/retrieverAPI.php",
					   data: "s=" + search + "&function=getImageURL",
					   success: function(responseText){
							// update the display
							displayTitle(search);
							Nodes[index].urlCache = responseText;
							$('#loader').css("display", "none");	
							$('#thumbnailImage').attr("src", responseText);
							$('#thumbnailImage').css("display", "block");
							$('#previewText').html(Nodes[index].previewCache);
					   }
					 });
				}
		   }
		 });
		 
	} else {
		// If it is cached then just display it.
		displayTitle(Nodes[index].title);
		getImageURL("", Nodes, index);
		getPreviewText("", Nodes, index);
	}
	 
}

// call the cacherAPI.php and cache this article
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

// Get the relevancy tree for this search and then draw the map
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

// if the user toggles the map, swap the article view and map view
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

// run on startup. Find the searched string and then draw the tree
function initialize() {
	// parse the url to get the search string
	var url = window.location.href;
	var URLbroken = url.split('?');
	// redirect if no search string
	if(URLbroken.length == 1) location.href = 'index.php';
	var findSearch = URLbroken[1].split('=');
	// redirect if no search string
	if (findSearch[1] == "") location.href = 'index.php';
	SEARCH_STRING = findSearch[1].replace("%20", " ");
	NODES[0] = new Node(0, 0, 0, 0, SEARCH_STRING, "", "");
	// Get the article page from wiki or cache
	getArticlePage(SEARCH_STRING , NODES, 0);
	mapInit();
	getRelevancyTree(SEARCH_STRING);
}
