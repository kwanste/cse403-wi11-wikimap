// wikiSearch.js
//
// This file contains functions that deal with high-level UI logic and communication with
// server-side php code.  Things such as caching of article information is also handled
// in this file.

var ON_LOAD = true;
var CAN_DRAW = false;
var FOUND_ARTICLE = true;
var FOUND_INDB = true;
var SEARCH_STRING;
var ZOOM = ["6,2,2,2"];
var CENTER_IMAGE;
var CURRENT_ZOOM = 0;
var TREE_CACHE = [null, null, null, null, null, null, null];
var CURRENT_NODES;
var ARTICLE_NODES = [];
var LINK_HOVER = false; 
var LINK_CURRENT = "";
var jQuery = window.jQuery = window.$ = function(selector, context)
    {

    };
	
// Makes an asynchronous call to searchSuggestions.php to show a list of suggested results
// in the case that an article wasn't found. 
// Inputs: search string and a boolean if this was the first article loaded
function articleNotFound(search, onLoad) {
	if (onLoad) {
		$.ajax({
		   type: "POST",
		   async: true,
		   url: "scripts/searchSuggestions.php",
		   data: "s=" + search,
		   success: function(responseText){
					$('#swap').css('display', 'none');
					$('#mapView').css('display', 'none');
					$('#articleView').css('display', 'block');
					$('#articleView').html(responseText);
					$('#loader').css("display", "none");
					displayTitle('Article Not Found');
					FOUND_ARTICLE = false;
		   }
		 });
	}
}

// Parses an article html returned from wikipedia for the preview text and displays it
// Inputs: the html of the article to parse, all the Nodes in the map, an index of what node referring to, 
// 			image url, and a boolean to determine if we need to display the preview text.
// Returns the preview text	of article at index
function getPreviewText(articleHTML, Nodes, index, displayIt){
        var formattedHTML;
        var fittedHTML;

        //Check if it is not already cached
        if(Nodes[index].previewCache == "") {
			// parse the html of the article to get the preview text
			articleHTML = articleHTML.replace(/&#160;/g," ");
			formattedHTML = formatPreText(articleHTML);	// remove tags/boxes/tables/etc.
			if (formattedHTML.length > 4000)
					formattedHTML = formattedHTML.substring(0,4000);

			formattedHTML = formattedHTML.replace(/<img.*\/>/g, "");
	        formattedHTML = parseHTML(formattedHTML);
	        formattedHTML = formattedHTML.replace(/view=article&/g, "");
				
			fittedHTML = fitPreText(formattedHTML); // cuts HTML text to fit sidepane
			// cache the preview text
			Nodes[index].previewCache = fittedHTML;
        }else{
                fittedHTML = Nodes[index].previewCache;
        }

        if(displayIt)
                $('#previewText').html(fittedHTML);
        return formattedHTML;
}

// parses HTML text and removes boxes, redirect information, tables, etc.
// inputs the text to parse
// returns a cleaner preview text
function formatPreText(text){
        var newPreviewText = "";
        var inHTML = false;
        var i;

        var unclosedDIV = 0;
        var unclosedTABLE = 0;
        var unclosedSUP = 0;
        var unclosedDD = 0;
        var badlink = 0;
        var HTMLfunc = "";

        for (i = 0; i< text.length;i++){
                var currentChar = text.charAt(i);
				
				// Find all the html tags
                if (inHTML){
                        HTMLfunc += currentChar;
                        if (HTMLfunc == "<div"){
                                unclosedDIV++;
                        }else if (HTMLfunc == "<table"){
                                unclosedTABLE++;
                        }else if (HTMLfunc == "<sup"){
                                unclosedSUP++;
                        }else if (HTMLfunc == "<dd"){
                                unclosedDD++;
                        }else if (HTMLfunc == "<a href=\"/wiki/Wikipedia:IPA"){
                                badlink = 1;
                        }
						// end of the html tag. Now figure out what it is
                        if (currentChar == ">"){
                                inHTML = false;
                                if (HTMLfunc == "</div>"){
                                        unclosedDIV--;
                                }else if (HTMLfunc == "</table>"){
                                        unclosedTABLE--;
                                }else if (HTMLfunc == "</sup>"){
                                        unclosedSUP--;
                                }else if (HTMLfunc == "</dd>"){
                                        unclosedDD--;
                                }else if (HTMLfunc == "</a>" && badlink == 1){
                                        badlink = 0;
                                }else if (unclosedDIV == 0 && unclosedTABLE == 0 && unclosedSUP == 0 && unclosedDD == 0 && badlink == 0){
                                        newPreviewText += HTMLfunc;
                                }
                                HTMLfunc = "";
                        }
				// find the start of an html tag
                }else{
                        if (currentChar == "<"){
                                inHTML = true;
                                HTMLfunc += currentChar;
                        }else if (unclosedDIV == 0 && unclosedTABLE == 0 && unclosedSUP == 0 && unclosedDD == 0){
                                newPreviewText += currentChar;
                        }

                }
        }
        return newPreviewText;
}

// cuts the preview text according to length of text, image size, window size, etc.
// Inputs the text to parse, and the image source to assign the image to
// returns the finalized preview text
function fitPreText(text){
        var windowHeight = 0;
        if( typeof( window.innerWidth ) == 'number' ) {
                //Non-IE
                windowHeight = window.innerHeight;
        } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                //IE 6+ in 'standards compliant mode'
                windowHeight = document.documentElement.clientHeight;
        } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                //IE 4 compatible
                windowHeight = document.body.clientHeight;
        }

        var availHeight = windowHeight - 300 - 150; // 300 max height for preview image, 150 pixels for switch view button & frames
        var maxLines = availHeight / 20;        // estimated 20 pixels per line
        var maxChar = 40 * maxLines;            // estimated 40 characters per line

        var newPreviewText = "";
        var inHTML = false;
        var charCount = 0;
        var i;
        var HTMLfunc = "";

		// go through the text to find the correct place to cut preview text
        for (i = 0; i< text.length;i++){
                var currentChar = text.charAt(i);
				
				// check if we are at the end of an html tag
                if (inHTML){
                        HTMLfunc += currentChar;
                        if (currentChar == ">"){
                                inHTML = false;
                                if (HTMLfunc == "<li>"){
                                        charCount += 40;
                                }else if (HTMLfunc == "<p>"){
                                        charCount += 30;
                                }else if (HTMLfunc == "<strong class=\"error\">"){
                                        newPreviewText = newPreviewText.replace(/<a href=\"\/wiki\//g, "<a href=\"wikiSearch.php?s=");
                                        return newPreviewText;
                                }else if (HTMLfunc == "<h2>"){
                                        newPreviewText = newPreviewText.replace(/<a href=\"\/wiki\//g, "<a href=\"wikiSearch.php?s=");
                                        return newPreviewText;
                                }
                                newPreviewText += HTMLfunc;
                                HTMLfunc = "";
                        }

				// find beginning of the end of an html tag
                }else{
                        if (charCount >= maxChar){
                                return newPreviewText + "...";
                        }else if (currentChar == "<"){
                                inHTML = true;
                                HTMLfunc += currentChar;
                        }else{
                                charCount++;
                                newPreviewText += currentChar;
                        }

                }
        }

        newPreviewText = newPreviewText.replace(/<a href=\"\/wiki\//g, "<a href=\"wikiSearch.php?s=");
        return newPreviewText + "...";
}

// Parses an article thml returned from wikipedia for the image url and displays it
// Inputs: the article html to search for the image, the Nodes to store the cache, ,
//          the index of where the current node we are at, and the boolean to determine if we need to display it on the sidepane
// Returns the image url
function getImageURL(articleHTML, Nodes, index, displayIt) {
	// Check if it is cached already
	if (Nodes[index].urlCache === undefined || Nodes[index].urlCache == "") {
		beginImage = articleHTML.split('class="image"');
		// Make sure that the articleHTML has an image
		if (beginImage.length != 1) {
			for (var i = 1; i < beginImage.length; i++) {
				middleImage = beginImage[i].split('src="');
				endImage = middleImage[1].split("/>");
				imageURL = endImage[0].substring(0, endImage[0].indexOf('"'));
				// filter out all bad images! we need to add more to make the site look cleaner
				if (imageURL.indexOf("Question_book-new.svg") == -1 &&
					imageURL.indexOf("Disambig_gray.svg") == -1 &&
					imageURL.indexOf("Portal-puzzle.svg") == -1 &&
					imageURL.indexOf("Merge-arrows.svg") == -1 &&
					imageURL.indexOf("Edit-clear.svg") == -1 &&
					imageURL.indexOf("Text_document_with_red_question_mark.svg") == -1 &&
					imageURL.indexOf("Wiki_letter_w_cropped.svg") == -1) {
					break;
				} else {
					if (i == beginImage.length - 1) imageURL = "images/image_not_found.jpg";
				}
			}
		} else {
			imageURL = "images/image_not_found.jpg";
		}
		// cache the url image
		Nodes[index].urlCache = imageURL;
	} else {
		imageURL = Nodes[index].urlCache;
	}
	// Display the image
	if(displayIt) {
		$('#loader').css("display", "none");	
		$('#thumbnailImage').attr("src", imageURL);
		$('#thumbnailImage').load(loadImageAndPreview);
	}
	
	return imageURL;
}

// This funtion turns off the loader gif and loads the image and preview text on the side.
// Should only be called if the image has been loaded! 
function loadImageAndPreview() {
	if (LINK_HOVER && LINK_CURRENT != $('#articleTitle').text()) return;
	$('#loader').css("display", "none");
	$('#thumbnailImage').css("display", "block");	
	$('#previewText').css("display", "block");
	$('#articleTitle').css("display", "block");
}

// Show the loader gif and turn off the preview text and thumbnail
function showLoader() {
	$('#loader').css("display", "block");
	$('#thumbnailImage').css("display", "none");	
	$('#previewText').css("display", "none");
	$('#articleTitle').css("display", "none");
}

// This function just changes the title display above the image
function displayTitle(title) {
	$('#articleTitle').html(title);
}

// Does an asynchronous function which grabs data wikipedia and then parses the data
// Inputs: search string, map Nodes, index of current node, boolean if we only want to change the article view, 
//			boolean if this is the first load, boolean if we are currently hovered over a node in the graph
function getFromWikipedia(search, Nodes, index, loadArticleViewOnly, onLoad, isHover) {

		$.getJSON('http://en.wikipedia.org/w/api.php?callback=?&action=parse&prop=text&format=json&redirects&page=' + search.replace("&", "%26"), 
		function(data) {
			// Check if the article was found
			if (data.parse == null) {
				articleNotFound(search, onLoad);
				return;
			}		
			CAN_DRAW = true;
			// Changes the title and parses the articleHTML
			if(!(isHover && !intersects(NODES[index].x, NODES[index].y, MOUSE_X - OFFSET_X, MOUSE_Y - OFFSET_Y, NODE_HEIGHT, NODE_WIDTH)))
				displayTitle(Nodes[index].title);

			// If this is the initial article searched, then display the article in articleView
			if (loadArticleViewOnly && onLoad) {
			        var text = data.parse.text['*'];
			        text = parseHTML(text);
			        text = "<h1 id=\"firstHeading\" class=\"firstHeading\">" + NODES[0].title + "</h1>" + text; 
                                $('#articleView').html(text);
					// Assign hover functions when you hover over a link in the articleview
					$("#articleView a").mouseenter(
								function() {
										var link = $(this).attr("href").split("s=")[1].replace(/_/g, " ");
										LINK_HOVER = true;
										LINK_CURRENT = link;
										showLoader();
										$('#mapText').css('display', 'block');
										$('#sideMap').css('display', 'none');
										getArticlePage(link, ARTICLE_NODES, ARTICLE_NODES.length, false, true);
									});
					$("#articleView a").mouseleave(
								function() {
										getArticlePage(NODES[0].title, NODES, 0, false, false);
										$('#mapText').css('display', 'none');
										$('#sideMap').css('display', 'block');
										LINK_HOVER = false;
								});
				return;
			}
			// If this is the first time loading the page and the preview text and image url isn't cached, then go into here and cache stuff
			if (onLoad) {
			        var text = data.parse.text['*'];
                                text = "<h1 id=\"firstHeading\" class=\"firstHeading\">" + NODES[0].title + "</h1>" + text;
			        text = parseHTML(text);
			        $('#articleView').html(text);
					$("#articleView a").mouseenter(
								function() {
										var link = $(this).attr("href").split("s=")[1].replace(/_/g, " ");
										LINK_HOVER = true;
										LINK_CURRENT = link;
										showLoader();
										$('#mapText').css('display', 'block');
										$('#sideMap').css('display', 'none');
										getArticlePage(link, ARTICLE_NODES, ARTICLE_NODES.length, false, true);
									});
					$("#articleView a").mouseleave(
								function() {
										getArticlePage(NODES[0].title, NODES, 0, false, false);
										$('#mapText').css('display', 'none');
										$('#sideMap').css('display', 'block');
										LINK_HOVER = false;
								});
			}
			// parse and cache the image url and preview text
			if ((HOVER && LAST_HOVER == index) || (!HOVER && LAST_HOVER == 0)) {
                var displayIt = !(isHover && !intersects(NODES[index].x, NODES[index].y, MOUSE_X - OFFSET_X, MOUSE_Y - OFFSET_Y, NODE_HEIGHT, NODE_WIDTH));
                var imageURL = getImageURL(data.parse.text['*'], Nodes, index, displayIt);
				var previewText = getPreviewText(data.parse.text['*'], Nodes, index, displayIt);
				cacheArticle("insertImageURL", Nodes[index].title, imageURL);
				cacheArticle("insertPreviewText", Nodes[index].title, previewText);
			}
			
		}
	);
	//});
}

// This function parses the html to remove bad syntax
function parseHTML(text) {
    text = text.replace(/<span class="editsection">[^\]]*]<\/span>/g, "");//remove edit tags
    text = text.replace(/<a href=[^>]*wiki\/File:[^>]*>/g, "");//remove all file links
    text = text.replace(/<a href[^>]*title="Listen">/g, "");//remove links to music
    text = text.replace(/<button.*\/button>/g, "");//remove buttons
    text = text.replace(/<a href[^>]*class="new"[^>]*>/g, "");//remove no page links
    text = text.replace(/<a href=\"\/wiki\//g, "<a href=\"wikiSearch.php?view=article&s=");//change wiki to wikigraph syntax
    return text;
}

// Checks if the article is already cached in our db, if not, then go get data from wikipedia
// inputs: search string, map or articleView Nodes, index of which node we are at, boolean if we are hovered, boolean if we are in articleView
function getArticlePage(search, Nodes, index, isHover, articleView) {
	// if we are in article view, we know we have hovered over a node if we got here
	// check if the article is already cached, else
	if (articleView) {
		for (var i = 0; i < Nodes.length; i++) {
			if (Nodes[i].title == search && Nodes[i].urlCache != "") {
				$('#articleTitle').html(Nodes[i].title);
				$('#thumbnailImage').attr("src", Nodes[i].urlCache);
				$('#previewText').html(Nodes[i].previewCache);
				$('#thumbnailImage').load(loadImageAndPreview);
				return;
			}
		}
		Nodes[index] = new Node(0, 0, 0, 0, search, "", "");
	}

	// Try to get the article from our database
	if (articleView || (Nodes[index].previewCache == "" || Nodes[index].urlCache == "")) {
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
					Nodes[index].title = search;
					Nodes[index].previewCache = fitPreText(responseText);
					// Go grab the image url since we know it is cached
					$.ajax({
					   type: "POST",
					   async: true,
					   url: "scripts/retrieverAPI.php",
					   data: "s=" + search + "&function=getImageURL",
					   success: function(responseText){
							// update the display
							Nodes[index].urlCache = responseText;
							// return if we are not hovered anymore
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
// inputs: the function to call the cacherAPI, the name of the article, the data to be cached
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

// Get the relevancy tree for this search from the retrieverAPI and then draw the map
// Input: the article title, a string of a comma split values, the current zoom level, boolean if this is first load
function getRelevancyTree(search, depthArray, zoomLevel, onLoad) {
        $.ajax({
           type: "POST",
           async: true,
           url: "scripts/retrieverAPI.php",
           data: "s=" + search.replace("&", "%26amp;") + "&depthArray=" + depthArray + "&function=getRelevancyTree" + "&maxDepth=" + zoomLevel,
           success: function(responseText){
                        // Couldn't find any relations in our database (even though Wikipedia has the article), so show an error
                        if (FOUND_ARTICLE && responseText == ""){
                                FOUND_INDB = false;
                                var mview = document.getElementById("mapView");
                                var newmview = document.createElement("div");
                                mview.id = "trash";
                                newmview.id = "mapView";
                                newmview.innerHTML = "<p>No map data is currently available for <b>" + SEARCH_STRING + "</b>.<br/>"
                                                + "To view the Wikipedia page, please switch to <a href=\"javascript:toggleMap();\">article view</a>.</p>";
                                mview.parentNode.replaceChild(newmview,mview);
                                //mview.style.height
                                $("#mapView").css("height", MAP_HEIGHT + "px");
                                $("#mapView").css("width", MAP_WIDTH + "px");
                                if (getURLParameter('view') == 'article'){
                                        $("#mapView").css('display', 'none');
                                }
								
                                return;
                        }
                        // else draw the tree
                        COUNT = 0;
                        CURRENT_NODES = zoomLevel;
                        waitDrawMap(responseText);
           }
         });
}


// function waits until the preview text and image has been loaded, then we will draw the map
function waitDrawMap(tree) {
	if (CAN_DRAW) {
		drawMap(tree);
		for(var i = 1; i < NODES.length; i++)
            if (NODES[i].title != "" && NODES[i].title != " ")  getArticlePage(NODES[i].title, NODES, i, true);
	} else if (FOUND_ARTICLE) {
		var x = setTimeout('waitDrawMap("' + tree + '")', 100); 
	}
}

// This function just enables all the mapview html tags to display
function mapView(){
        $('#mapView').css('display', 'block');
        $('#articleView').css('display', 'none');
        $('#mapText').css('display', 'block');
        $('#sideMap').css('display', 'none');
}

// This function just enables all the articleview html tags to display
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
		if (getURLParameter('view')=='article') mapView();// go to map view
		else articleView();

		var inMapView = $('#mapView').css('display') == 'none';

		var newURL = 'wikiSearch.php?s='
			+ encodeURIComponent(document.getElementById("search").value)
			+ (inMapView ? "&view=article" : "");

		 // make sure the browser supports this...
		if(window.history.pushState)
			window.history.pushState('toggledmap', 'Title', newURL);
		else{
			var theForm=document.getElementById("searchForm");
			theForm.action = newURL;
			theForm.submit();
		}
	}
}

// from mini-tutorial at http://www.netlobo.com/url_query_string_javascript.html
// grabs the URL Parameters
// Input the url
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

// Decides if we should swap to article view if the url says to
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

// run on startup. Find the searched string and then draw the tree and get all the loadup information needed
function initialize() {
	if(getURLParameter('s') == ""){
		location.href = 'index.php';
		return;
	}

	if(window.history.pushState){
			window.onpopstate = function(event) {
				pickWindowMode();
			};
	}
	else{   // for browsers that don't support this event handler
		pickWindowMode();
	}

	SEARCH_STRING = decodeURIComponent(getURLParameter('s')).replace(/_/g, " ");;

        document.title = "WikiMap " + ((getURLParameter('view')=='article') ? "(Article View) - " : "- ") + SEARCH_STRING;

	$("#search").attr("value", SEARCH_STRING);
	NODES[0] = new Node(0, 0, 0, 0, SEARCH_STRING, "", "");
	SIDE_NODES[0] = new Node(0, 0, 0, 0, CURRENT_ARTICLE, 0, "", "");
	CENTER_IMAGE = new Image();
	CENTER_IMAGE.src = 'images/main_node.png';
	// Get the article page from wiki or cache
	mapInit();
	getArticlePage(SEARCH_STRING , NODES, 0, false);
	getRelevancyTree(SEARCH_STRING, ZOOM[CURRENT_ZOOM], (ZOOM[CURRENT_ZOOM].split(",")).length, ON_LOAD);
	
	//var map = document.getElementById('mapView');
}

