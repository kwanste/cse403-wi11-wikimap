// wikiSearch.js
//
// This file contains functions that deal with high-level UI logic and communication with
// server-side php code.  Things such as caching of article information is also handled
// in this file.

var ON_LOAD = true;
var CAN_DRAW = false;
var FOUND_ARTICLE = true;
var SEARCH_STRING;
var ZOOM = ["6,2,2,2", "6,2", "15"];
var ZOOM_IN;
var ZOOM_OUT;
var CURRENT_ZOOM = 1;
var TREE_CACHE = [null, null, null, null, null, null, null];
var CURRENT_NODES;
var jQuery = window.jQuery = window.$ = function(selector, context)
    {
    };
	
// Makes an asynchronous call to searchSuggestions.php to show a list of suggested results
// in the case that an article wasn't found.
function articleNotFound(search, onLoad) {
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/searchSuggestions.php",
	   data: "s=" + search,
	   success: function(responseText){
			if (onLoad) {
				$('#mapView').css('display', 'none');
				$('#articleView').css('display', 'block');
				$('#articleView').html(responseText);
				$('#loader').css("display", "none");
				displayTitle('Article Not Found');
				FOUND_ARTICLE = false;
			}
	   }
	 });
}

function loadImageAndPreview() {
	$('#loader').css("display", "none");
	$('#thumbnailImage').css("display", "block");	
	$('#previewText').css("display", "block");
	$('#articleTitle').css("display", "block");
}

// This function just changes the title display above the image
function displayTitle(title) {
	$('#articleTitle').html(title);
	$('#articleTitle').css("display", "block");
}

// Does an asynchronous function which grabs data wikipedia and then parses the data
function getFromWikipedia(search, Nodes, index, loadArticleViewOnly, onLoad, isHover, onlyArticleView) {
	// If this is the initial article searched, then display the article in articleView
	if (onLoad) {
		$.getJSON('http://en.wikipedia.org/w/api.php?callback=?&action=parse&prop=text&format=json&redirects&page=' + search.replace("&", "%26"), 
			function(data) {
				if( data.parse != null) {
					CAN_DRAW = true;
					$('#articleView').html(data.parse.text['*']);
				}
			}
		);
	}
	if( !onlyArticleView) {
		// Get article summary
		$.getJSON('http://en.wikipedia.org/w/api.php?callback=?&action=parse&prop=text&section=0&format=json&redirects&page=' + search.replace("&", "%26"), 
			function(data) {
				// Check if the article was found
				if (data.parse == null) {
					articleNotFound(search, onLoad);
					return;
				}
				CAN_DRAW = true;
				
				// Parse Data
				var endPreview;
				var finalPreview = "";
				var beginPreview = data.parse.text['*'].split("</table>\n<p>");
				// Error checks if it can't find a table 
				if (beginPreview.length != 1) {
					endPreview = beginPreview[1].split('<table');
					finalPreview = endPreview[0].length > 1800 ? endPreview[0].substring(0, 1800) + "..." : endPreview[0];
				} else {
					finalPreview = beginPreview.length > 1800 ? beginPreview[0].substring(0, 1800) + "..." : beginPreview[0];
				}

				finalPreview = finalPreview.replace(/<img.*\/>/g, "");
				
				// Cache summary
				cacheArticle("insertPreviewText", Nodes[index].title, finalPreview);
				if(Nodes[index].previewCache == "") {
					Nodes[index].previewCache = finalPreview;
				}
				
			
				// Don't change preview text if not hovered over this node or this is root article
				if(!((HOVER && LAST_HOVER == index) || (!HOVER && LAST_HOVER == 0)))
					return;
			
				// Don't display sidebar changes if user has unhovered
				if(isHover && !intersects(NODES[index].x, NODES[index].y, MOUSE_X - OFFSET_X, MOUSE_Y - OFFSET_Y, NODE_HEIGHT, NODE_WIDTH))
					return;
				// Change title
				$('#articleTitle').html(Nodes[index].title);
				
				// Display the preview text
				$('#previewText').html(finalPreview);
				//loadImageAndPreview();
			}
		);
		// Get image URL
		$.getJSON('http://en.wikipedia.org/w/api.php?callback=?&action=query&generator=images&prop=imageinfo&iiprop=url&format=json&titles=' + search.replace("&", "%26"), 
			function(data) {
				image = null;
				// Check if the article was found
				if (data.query == null) {
					//articleNotFound(search, onLoad);
					//return;
					image = 'images/image_not_found.jpg';
				} else {
				
					for (var i in data.query.pages) {
						if (data.query.pages[i].imageinfo[0].url.indexOf(".ogg") == -1 && 
							//data.query.pages[i].imageinfo[0].url.indexOf(".svg") == -1 &&
							data.query.pages[i].imageinfo[0].url.indexOf("Ambox_content.png") == -1 &&
							data.query.pages[i].imageinfo[0].url.indexOf("Question_book-new.svg.png") == -1
							) {
							image = data.query.pages[i].imageinfo[0].url;
							break;
						} 
					}
					if (image == null) {
						image = 'images/image_not_found.jpg';
					}
				}
				
				// Cache image url
				cacheArticle("insertImageURL", Nodes[index].title, image);
				if(Nodes[index].urlCache == "")
					Nodes[index].urlCache = image;
					
				// Don't change preview text if not hovered over this node or this is root article
				if(!((HOVER && LAST_HOVER == index) || (!HOVER && LAST_HOVER == 0)))
					return;
			
				// Don't display sidebar changes if user has unhovered
				if(isHover && !intersects(NODES[index].x, NODES[index].y, MOUSE_X - OFFSET_X, MOUSE_Y - OFFSET_Y, NODE_HEIGHT, NODE_WIDTH))
					return;
					
				// Change title
				$('#articleTitle').html(Nodes[index].title);
				
				// Display the image
				$('#thumbnailImage').attr("src", image);
				$('#thumbnailImage').load(loadImageAndPreview);
			}
		);
	}
}


// Checks if the article is already cached in our db
function getArticlePage(search, Nodes, index, isHover) {
	if (Nodes[index].previewCache == "" || Nodes[index].urlCache == "") {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: "scripts/retrieverAPI.php",
		   data: "s=" + search + "&function=getPreviewText",
		   success: function(responseText){
				// if article not cached, then get it from wikipedia and parse it.
				if (responseText == "Not Found") {
					getFromWikipedia(search, Nodes, index, false, ON_LOAD, isHover, false);
					ON_LOAD = false;
				} else {
					CAN_DRAW = true;
					if (ON_LOAD) {
						getFromWikipedia(search, Nodes, index, true, ON_LOAD, isHover, true);
						ON_LOAD = false;
					}
					if (!ON_LOAD) {
						ON_LOAD = false;
						if (isHover && !intersects(NODES[index].x, NODES[index].y, MOUSE_X - OFFSET_X, MOUSE_Y - OFFSET_Y, NODE_HEIGHT, NODE_WIDTH))
							return;
						if (!isHover && HOVER)
							return;
					}
					Nodes[index].title = search;
					Nodes[index].previewCache = responseText;
					// Go grab the image since we know it is cached
					$.ajax({
					   type: "POST",
					   async: true,
					   url: "scripts/retrieverAPI.php",
					   data: "s=" + search + "&function=getImageURL",
					   success: function(responseText){
							// update the display
							Nodes[index].urlCache = responseText;
							if(isHover && !intersects(NODES[index].x, NODES[index].y, MOUSE_X - OFFSET_X, MOUSE_Y - OFFSET_Y, NODE_HEIGHT, NODE_WIDTH)){
								return;
							}
							if (!isHover && HOVER)
								return;
							$('#articleTitle').html(search);	
							$('#thumbnailImage').attr("src", responseText);
							$('#previewText').html(Nodes[index].previewCache);
							$('#thumbnailImage').load(loadImageAndPreview);
					   }
					 });
				}
		   }
		 });
		 
	} else {
		// If it is cached then just display it.
		$('#articleTitle').html(Nodes[index].title);
	    $('#thumbnailImage').attr("src", Nodes[index].urlCache);
	    $('#previewText').html(Nodes[index].previewCache);
		loadImageAndPreview();
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
function getRelevancyTree(search, depthArray, zoomLevel, onLoad) {
	$.ajax({
	   type: "POST",
	   async: true,
	   url: "scripts/retrieverAPI.php",
	   data: "s=" + search.replace("&", "%26amp;") + "&depthArray=" + depthArray + "&function=getRelevancyTree" + "&maxDepth=" + zoomLevel,
	   success: function(responseText){
			COUNT = 0;
			if (!onLoad)
				NODES = [];
			CURRENT_NODES = zoomLevel;
			waitDrawMap(responseText);
	   }
	 });
}

function waitDrawMap(tree) {
	if (CAN_DRAW) {
		drawMap(tree);
	} else if (FOUND_ARTICLE) {
		var x = setTimeout("waitDrawMap('" + tree + "')", 100); 
	}
}

// if the user toggles the map, swap the article view and map view
function toggleMap() {
	if(FOUND_ARTICLE) {
		if ($('#mapView').css('display') == 'none')
		{
			$('#mapView').css('display', 'block');
			$('#articleView').css('display', 'none');
			$('#mapText').css('display', 'block');
			$('#sideMap').css('display', 'none');
		} else {
			$('#mapView').css('display', 'none');
			$('#articleView').css('display', 'block');
			$('#mapText').css('display', 'none');
			$('#sideMap').css('display', 'block');
		}
	}
}



/** Event handler for mouse wheel event.
 */
function wheel(event){
        var delta = 0;
        if (!event) /* For IE. */
                event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta/120;
                /** In Opera 9, delta differs in sign as compared to IE.
                 */
                if (window.opera)
                        delta = -delta;
        } else if (event.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event.detail/3;
        }
		delta = delta > 0 ? 1 : -1;
		var tempZoom = CURRENT_ZOOM;
		var newZoom = tempZoom + delta;
        if (newZoom >= 0 && newZoom < ZOOM.length) {
			if (TREE_CACHE[tempZoom] == null && CURRENT_NODES == tempZoom) {
				TREE_CACHE[tempZoom] = NODES;
			}
			CURRENT_ZOOM = newZoom;
			if (TREE_CACHE[newZoom] != null ) {
				NODES = TREE_CACHE[newZoom];
				firstDraw();
			} else {
				getRelevancyTree(SEARCH_STRING, ZOOM[CURRENT_ZOOM], CURRENT_ZOOM);
			}
		}
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault)
                event.preventDefault();
	event.returnValue = false;
}


function drawZoom() {

    ZOOM_IN = new Image();
	ZOOM_OUT = new Image();
    ZOOM_IN.src = 'images/zoom_in.png';
	ZOOM_OUT.src = 'images/zoom_out.png';
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
	SEARCH_STRING = decodeURI(findSearch[1]).replace(/%26/g, "&");
	$("#search").attr("value", SEARCH_STRING);
	NODES[0] = new Node(0, 0, 0, 0, SEARCH_STRING, "", "");
	drawZoom();
	// Get the article page from wiki or cache
	mapInit();
	getArticlePage(SEARCH_STRING , NODES, 0, false);
	getRelevancyTree(SEARCH_STRING, ZOOM[CURRENT_ZOOM], CURRENT_ZOOM, ON_LOAD);

	var map = document.getElementById('mapView');
	if (map.addEventListener) {
		// DOMMouseScroll is for mozilla
		map.addEventListener('DOMMouseScroll', wheel, false);
		// mousewheel is for chrome
		map.addEventListener('mousewheel', wheel, false);
	}
}
