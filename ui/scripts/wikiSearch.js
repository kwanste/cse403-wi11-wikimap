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
	
//function getPreviewText(search, previewCache, index){
function getPreviewText(articleHTML, previewCache, index){
	if(previewCache[index] == "") {
		beginPreview = articleHTML.split("</table>\n<p>");
		endPreview = beginPreview[1].split('<table');
		finalPreview = endPreview[0].length > 1800 ? endPreview[0].substring(0, 1800) + "..." : endPreview[0];
		previewCache[index] = finalPreview;
	} else {
		finalPreview = previewCache[index];
	}
	$('#previewText').html(finalPreview);
}

//function getImageURL(search, urlCache, index){
function getImageURL(articleHTML, urlCache, index) {
	if (urlCache[index] == "") {
		beginImage = articleHTML.split('class="image"');
		middleImage = beginImage[1].split('src="');
		endImage = middleImage[1].split("/>");
		imageURL = endImage[0].substring(0, endImage[0].indexOf('"'));
		urlCache[index] = imageURL;
	} else {
		imageURL = urlCache[index];
	}
	$('#thumbnailImage').attr("src", imageURL);
	$('#thumbnailImage').css("display", "block");	
	
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




function getArticlePage(search, urlCache, previewCache, index) {
	if (previewCache[index] == "") {
		$.ajax({
			url: 'http://en.wikipedia.org/w/api.php',
			data: {
			  action:'parse',
			  prop:'text',
			  page:search,
			  format:'json'
			},
			dataType:'jsonp',
			success: function(data) {
				if (onLoad || urlCache[index] == "") {
					$('#articleView').html(data.parse.text['*']);
					onLoad = false;
				}
				getImageURL(data.parse.text['*'], urlCache, index);
				getPreviewText(data.parse.text['*'], previewCache, index);
			}
		});
	} else {
		getImageURL("", urlCache, index);
		getPreviewText("", previewCache, index);
	}
	 
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
	URL_CACHE[0] = "";
	PREVIEW_CACHE[0] = "";
	getArticlePage(searchString , URL_CACHE, PREVIEW_CACHE, 0);
	mapInit();
	getRelevancyTree(searchString);
}
