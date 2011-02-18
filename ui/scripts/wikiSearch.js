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
function getPreviewText(articleHTML){
	beginPreview = articleHTML.split("</table>\n<p>");
	//alert(beginPreview[0]);
	//alert(beginPreview[1]);
	endPreview = beginPreview[1].split('<table');
	$('#previewText').html(endPreview[0]);
/*
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
	*/
}

//function getImageURL(search, urlCache, index){
function getImageURL(articleHTML) {
	
	beginImage = articleHTML.split('class="image"');
	middleImage = beginImage[1].split('src="');
	endImage = middleImage[1].split("/>");
	imageURL = endImage[0].substring(0, endImage[0].indexOf('"'));
	$('#thumbnailImage').attr("src", imageURL);
	$('#thumbnailImage').css("display", "block");
	//http://en.wikipedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg&prop=imageinfo&iiprop=url&format=json
	
	
	/*
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
	
	*/
	
	/*$.ajax({
				url: 'http://en.wikipedia.org/w/api.php?action=raw',
				dataType: 'json',
				data: { title: 'Bill Gates' },
				success: function(data) {
					//alert(responseText);
					//$('p#testing').html( '# ' + data[1] + '<br />' + $('p#testing').html() );	
					for (i in data[1]) $('#wholeSite').append( '<li>' + data[1][i] + '</li>' );
				}	
			});*/
	
	/*
	
	// Find results similar to Bill Gates
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
	
}



function getAreaMetaInfo_Wikipedia(page_id) {
  $.ajax({
    url: 'http://en.wikipedia.org/w/api.php',
    data: {
      action:'query',
      pageids:page_id,
      format:'json'
    },
    dataType:'jsonp',
    success: function(data) {
      title = data.query.pages[page_id].title.replace(' ','_');
      $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        data: {
          action:'parse',
          prop:'text',
          page:title,
          format:'json'
        },
        dataType:'jsonp',
        success: function(data) {
          wikipage = $("<div>"+data.parse.text['*']+"<div>").children('p:first');
          wikipage.find('sup').remove();
          wikipage.find('a').each(function() {
            $(this)
              .attr('href', 'http://en.wikipedia.org'+$(this).attr('href'))
              .attr('target','wikipedia');
          });
          $("#wiki_container").append(wikipage);
          $("#wiki_container").append("<a href='http://en.wikipedia.org/wiki/"+title+"' target='wikipedia'>Read more on Wikipedia</a>");
        }
      });
    }
  });
}




function getArticlePage(search) {
	// We should be getting an article for the current page
	// right now it just grabs the summary and makes the current page that. 
	// But we should really be getting the page from wikipedia and processing it
	/*
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
	 */
	 
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
			$('#articleView').html(data.parse.text['*']);
			getImageURL(data.parse.text['*']);
			getPreviewText(data.parse.text['*']);
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
	//getImageURL(searchString, URL_CACHE, 0);
	//getPreviewText(searchString, PREVIEW_CACHE, 0);
	getArticlePage(searchString);
	mapInit();
	getRelevancyTree(searchString);
}
