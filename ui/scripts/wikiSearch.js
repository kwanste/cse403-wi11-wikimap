// wikiSearch.js
//
// This file contains functions that deal with high-level UI logic and communication with
// server-side php code.  Things such as caching of article information is also handled
// in this file.

var ON_LOAD = true;
var CAN_DRAW = false;
var FOUND_ARTICLE = true;
var SEARCH_STRING;
var ZOOM = ["6,2,2,2"];
var CENTER_IMAGE;
var CURRENT_ZOOM = 0;
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
	if (Nodes[index].urlCache === undefined || Nodes[index].urlCache == "") {
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
	$('#thumbnailImage').load(loadImageAndPreview);
	
	return imageURL;
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
function getFromWikipedia(search, Nodes, index, loadArticleViewOnly, onLoad, isHover) {
	/*$.ajax({
		url: 'http://en.wikipedia.org/w/api.php',
		data: {
		  action:'parse',
		  prop:'text',
		  format:'json',
		  redirects:'', 
		  page:search
		},
		dataType:'jsonp',
		success: */
		$.getJSON('http://en.wikipedia.org/w/api.php?callback=?&action=parse&prop=text&format=json&redirects&page=' + search.replace("&", "%26"), 
		function(data) {
			// Check if the article was found
			if (data.parse == null) {
				articleNotFound(search, onLoad);
				return;
			}
			
			CAN_DRAW = true;

			// Changes the title and parses the articleHTML
			if(isHover && !intersects(NODES[index].x, NODES[index].y, MOUSE_X - OFFSET_X, MOUSE_Y - OFFSET_Y, NODE_HEIGHT, NODE_WIDTH)){
				return;
			}
			displayTitle(Nodes[index].title);

			// If this is the initial article searched, then display the article in articleView
			if (loadArticleViewOnly && onLoad) {
			        var text = data.parse.text['*'];
                                text = text.replace(/<a href=\"\/wiki\//g, "<a href=\"wikiSearch.php?s=");
			        text = text.replace(/<a href=[^>]*class="image"[^>]*>/g, "");
                                //text = text.replace(/_/g, "%20");
			        $('#articleView').html(text);
				return;
			}
			if (onLoad) {
			        var text = data.parse.text['*'];
                                text = text.replace(/<a href=\"\/wiki\//g, "<a href=\"wikiSearch.php?s=");
                                text = text.replace(/<a href=[^>]*class="image"[^>]*>/g, "");
			        //text = text.replace(/_/g, "%20");
				$('#articleView').html(text);
			}
			// parse and cache the image url and preview text
			if ((HOVER && LAST_HOVER == index) || (!HOVER && LAST_HOVER == 0)) {
				var imageURL = getImageURL(data.parse.text['*'], Nodes, index);
				var previewText = getPreviewText(data.parse.text['*'], Nodes, index);
				cacheArticle("insertImageURL", Nodes[index].title, imageURL);
				cacheArticle("insertPreviewText", Nodes[index].title, previewText);
			}
			
		}
	);
	//});
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
			CURRENT_NODES = zoomLevel;
			waitDrawMap(responseText);
	   }
	 });
}

function waitDrawMap(tree) {
	if (CAN_DRAW) {
		drawMap(tree);
	} else if (FOUND_ARTICLE) {
		var x = setTimeout('waitDrawMap("' + tree + '")', 100); 
	}
}

function mapView(){
        $('#mapView').css('display', 'block');
        $('#articleView').css('display', 'none');
        $('#mapText').css('display', 'block');
        $('#sideMap').css('display', 'none');
}

function articleView(){
        // go to article view
        $('#mapView').css('display', 'none');
        $('#articleView').css('display', 'block');
        $('#mapText').css('display', 'none');
        $('#sideMap').css('display', 'block');
}

// if the user toggles the map, swap the article view and map view
function toggleMap() {
	if(FOUND_ARTICLE) {

                if ($('#mapView').css('display') == 'none')
                        mapView();// go to map view
		else
                        articleView();

                var inMapView = $('#mapView').css('display') == 'none';

                var newURL = 'wikiSearch.php?s='
                    + encodeURI(document.getElementById("search").value)
                    + (inMapView ? "&view=article" : "");

                if(window.history.pushState)    // make sure the browser supports this...
                    window.history.pushState('toggledmap', 'Title', newURL);
                else{
                    var theForm=document.getElementById("searchForm");
                    theForm.action = newURL;
                    theForm.submit();
                }

                //window.location.hash = newURL;
	}
}



/** Event handler for mouse wheel event.
 */
// function wheel(event){
        // var delta = 0;
        // if (!event) /* For IE. */
                // event = window.event;
        // if (event.wheelDelta) { /* IE/Opera. */
                // delta = event.wheelDelta/120;
                // /** In Opera 9, delta differs in sign as compared to IE.
                 // */
                // if (window.opera)
                        // delta = -delta;
        // } else if (event.detail) { /** Mozilla case. */
                // /** In Mozilla, sign of delta is different than in IE.
                 // * Also, delta is multiple of 3.
                 // */
                // delta = -event.detail/3;
        // }
		// delta = delta > 0 ? 1 : -1;
		// zoomChange(delta);
        // /** Prevent default actions caused by mouse wheel.
         // * That might be ugly, but we handle scrolls somehow
         // * anyway, so don't bother here..
         // */
        // if (event.preventDefault)
                // event.preventDefault();
	// event.returnValue = false;
// }

/*
function drawZoom() {

    ZOOM_IN = new Image();
	ZOOM_OUT = new Image();
    ZOOM_IN.src = 'images/zoom_in.png';
	ZOOM_OUT.src = 'images/zoom_out.png';
}

function zoomChange(delta) {
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
}
*/


// from mini-tutorial at http://www.netlobo.com/url_query_string_javascript.html
function getURLParameter( name )
{
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return "";
    else
        return results[1];
}

function pickWindowMode(){
    if (getURLParameter('view')=='article')    {
        articleView();
        intImage = 2;
    }
    else{
        mapView();
        intImage = 1;
    }

    swapImage(document.getElementById('IMG1'));
}

// run on startup. Find the searched string and then draw the tree
function initialize() {
        if(window.history.pushState){
                window.onpopstate = function(event) {
                    pickWindowMode();
                };
        }
        else{   // for browsers that don't support this event handler
            pickWindowMode();
        }

        SEARCH_STRING = decodeURI(getURLParameter('s')).replace(/%26/g, "&").replace(/_/g, " ");
        //
          //  toggleMap(true);

        /*
	// parse the url to get the search string
	var url = window.location.href;
	var URLbroken = url.split('?');
	// redirect if no search string
	if(URLbroken.length == 1) location.href = 'index.php';
	var findSearch = URLbroken[1].split('=');
	// redirect if no search string
	if (findSearch[1] == "") location.href = 'index.php';
        SEARCH_STRING = decodeURI(findSearch[1]).replace(/%26/g, "&").replace(/_/g, " ");
        */
	$("#search").attr("value", SEARCH_STRING);
	NODES[0] = new Node(0, 0, 0, 0, SEARCH_STRING, "", "");
	SIDE_NODES[0] = new Node(0, 0, 0, 0, CURRENT_ARTICLE, 0, "", "");
	CENTER_IMAGE = new Image();
	CENTER_IMAGE.src = 'images/main_node.png';
	// Get the article page from wiki or cache
	mapInit();
	getArticlePage(SEARCH_STRING , NODES, 0, false);
	getRelevancyTree(SEARCH_STRING, ZOOM[CURRENT_ZOOM], CURRENT_ZOOM, ON_LOAD);

	// Move this to the drawMap function
	//for(var i = 1; i < NODES.length; i++)
	//    getArticlePage(NODES[i].title, NODES, i, true);

	var map = document.getElementById('mapView');
	// if (map.addEventListener) {
		// // DOMMouseScroll is for mozilla
		// map.addEventListener('DOMMouseScroll', wheel, false);
		// // mousewheel is for chrome
		// map.addEventListener('mousewheel', wheel, false);
	// }
}
