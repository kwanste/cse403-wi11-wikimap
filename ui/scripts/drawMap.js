// drawMap.js
//
// This file contains routines for drawing to the map canvas.  The logic for the organization of
// the nodes and their animation occurs here.


var MAP_HEIGHT = 600;
var MAP_WIDTH = 800;
var ROOT_HEIGHT = 30;
var ROOT_WIDTH = 100;
var NODE_HEIGHT = 20;
var NODE_WIDTH = 100;
var CORNER_ARC = 10;
var INITIAL_RADIUS = 20;
var CTX;
var NODES = [];
var CANVAS;
var COUNT;
var MOUSE_DOWN = false;
var MOUSE_MOVE = false;
var MOUSE_X;
var MOUSE_Y;
var OFFSET_X = 0;
var OFFSET_Y = 0;
var CURRENT_ARTICLE = "";
var HOVER = false;
var OFFSET_RADIUS = 0.0;
var CLEAR_INTERVAL;
var LAST_HOVER = 0;
var FONT_CENTER_SIZE = 15;
var FONT_NODE_SIZE = 15;

// Draw a round rectangle
CanvasRenderingContext2D.prototype.roundRect = function(sx,sy,ex,ey,r) {
    var r2d = Math.PI/180;
    if( ( ex - sx ) - ( 2 * r ) < 0 ) { r = ( ( ex - sx ) / 2 ); } //ensure that the radius isn't too large for x
    if( ( ey - sy ) - ( 2 * r ) < 0 ) { r = ( ( ey - sy ) / 2 ); } //ensure that the radius isn't too large for y
    this.beginPath();
    this.moveTo(sx+r,sy);
    this.lineTo(ex-r,sy);
    this.arc(ex-r,sy+r,r,r2d*270,r2d*360,false);
    this.lineTo(ex,ey-r);
    this.arc(ex-r,ey-r,r,r2d*0,r2d*90,false);
    this.lineTo(sx+r,ey);
    this.arc(sx+r,ey-r,r,r2d*90,r2d*180,false);
    this.lineTo(sx,sy+r);
    this.arc(sx+r,sy+r,r,r2d*180,r2d*270,false);
    this.closePath();
}

// Draws a node for each article that needs to be in the map
function drawCircle(x, y, height, width, title) {
	CTX.beginPath();
	CTX.lineWidth = 3;
	CTX.strokeStyle = '#AAAAAA';
	CTX.fillStyle = '#CDCECE';
	CTX.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	CTX.stroke();
	CTX.fill();
}

// Draws the outline when someone hovers or unhovers over a node
function drawOutline(x, y, height, width, color, lineWidth) {
	CTX.beginPath();
	CTX.lineWidth = lineWidth;
	CTX.strokeStyle = color;
	CTX.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	CTX.stroke();
}

// Draw a line between a node and it's child
function drawLine(xStart, yStart, xEnd, yEnd){
	CTX.beginPath();
	CTX.strokeStyle = '#BFB7B7';
	CTX.moveTo(xStart, yStart);
	CTX.lineTo(xEnd, yEnd);
	CTX.stroke();
}

// Write the text on top of a node
function writeText(text, x, y, mid, fontSize, bold){
	CTX.fillStyle    = '#000000';
	CTX.font         = bold + ' ' + fontSize + 'px sanserif';
	CTX.textBaseline = 'top';
	CTX.fillText  (text.length > mid ? text.substring(0, mid) + ".." : text, x, y);
}

// This is a recursive function to iterate through the tree by depth.
function drawMapHelper(string, pipe, radius, startAngle, angleSize, parentLoc){
	if(pipe == ''){
		var angle = startAngle + angleSize / 2;
		parentLoc = parentLoc.replace("|", "");
		var px = parseFloat(parentLoc.split(',')[0]);
		var py = parseFloat(parentLoc.split(',')[1]);
		var x = MAP_WIDTH / 2 + radius * Math.cos(angle);
		var y = MAP_HEIGHT / 2 + radius * Math.sin(angle);

		// Store all the nodes and its coordinates
		NODES[COUNT] = new Node(x, y, px, py, string.replace("&amp;", "&"), "", "");
		COUNT++;
		return x + "," + y;
	}else{
		var items = string.split(pipe);
		var parentLocs = parentLoc.split(pipe);
		var retval = '';
		for(var i = 0; i < items.length; i++){
			if(i != 0){
				retval += pipe + '|';
			}
			// keep recursing until you find all the nodes
			retval += drawMapHelper(items[i], 
									pipe.substring(1), 
									radius * items.length, 
									startAngle + i * angleSize / (items.length), 
									angleSize / (items.length),
									(pipe == '|') ? parentLoc : parentLocs[i]);
		}
		return retval;
	}
}

// Draws the map with the given string input
function drawMap(treeString){
	CANVAS = document.getElementById('mapView');
	
	// Make sure we don't execute when CANVAS isn't supported
	if (CANVAS.getContext){
		COUNT = 0;

		// use getContext to use the CANVAS for drawing
		CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
		CTX.beginPath();
		var depthSplit = treeString.split("//");
		var depths = depthSplit.length;
		var levelPipes = "";

		// draw parent
		CURRENT_ARTICLE = depthSplit[0].replace("&amp;", "&");
		if (NODES[0] == null)
			NODES[0] = new Node(0, 0, 0, 0, CURRENT_ARTICLE, "", "");
		// Node[0] is already created in wikiSearch.js function initialize();
		NODES[0].setXY(MAP_WIDTH / 2, MAP_HEIGHT / 2);
		NODES[0].title = CURRENT_ARTICLE;
		COUNT++;
		drawCircle(MAP_WIDTH / 2, MAP_HEIGHT / 2, ROOT_HEIGHT, ROOT_WIDTH);
		writeText(CURRENT_ARTICLE, MAP_WIDTH / 2 - 30, MAP_HEIGHT / 2 - 10, 10, FONT_CENTER_SIZE, 'bold');

		var parentStr = (MAP_WIDTH / 2) + "," + (MAP_HEIGHT / 2);
		// draw all the other depths
		for (var i = 1; i < depths; i++){
			levelPipes = "||";
			parentStr = drawMapHelper(depthSplit[i], levelPipes, INITIAL_RADIUS, 0, 2 * Math.PI, parentStr);
		}
		// draw the map once the coordinates have been made
		firstDraw();
	} else {
		alert('You need Safari or Firefox 1.5+ or Google Chrome to see this Map.');
	}
}

// for the first draw, do an animation
function firstDraw() {
	removeEvents();
	OFFSET_RADIUS = 0.025;
	CLEAR_INTERVAL = setInterval(drawChange, 25);
}

// helper function for the animation
function drawChange() {
	if (OFFSET_RADIUS <= 1.01) {
		CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
		CTX.beginPath();
		var centerX = (MAP_WIDTH / 2);
		var centerY = (MAP_HEIGHT / 2);
		// Draws the lines first
		for (var i = 1; i < NODES.length; i++) {
			if (NODES[i].title != " ") {
				drawLine(centerX + ((NODES[i].x + OFFSET_X) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, 
						centerX + ((NODES[i].lineEndX + OFFSET_X) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].lineEndY + OFFSET_Y) - centerY) * OFFSET_RADIUS);
			}
		}
		// Draw the center node
		drawCircle(centerX + ((NODES[0].x + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, ROOT_HEIGHT, ROOT_WIDTH);
		writeText(CURRENT_ARTICLE, centerX + ((NODES[0].x - 45 + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y - 10 + OFFSET_Y) - centerY) * OFFSET_RADIUS, 10, FONT_CENTER_SIZE, 'bold');
		drawOutline(centerX + ((NODES[0].x + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, ROOT_HEIGHT, ROOT_WIDTH, '#000000', 1);
		// Draw all the other nodes
		for (var i = 1; i < NODES.length; i++) {
			if (NODES[i].title != " " && NODES[i].title != "") {
				drawCircle(centerX + ((NODES[i].x + OFFSET_X) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, NODE_HEIGHT, NODE_WIDTH);
				writeText(NODES[i].title, 
						centerX + ((NODES[i].x + OFFSET_X - 45) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].y + OFFSET_Y - 8) - centerY) * OFFSET_RADIUS, 12, FONT_NODE_SIZE, '');
			}
		}
		OFFSET_RADIUS += 0.025;
	} else {
		// initialize the event handlers for the map and then stop the animation
		initEvents();
		clearInterval(CLEAR_INTERVAL);
	}
}

// Redraw the map with new offsets
function redrawMap() {
	CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
	CTX.beginPath();
	// Draw the lines first
	for (var i = 1; i < NODES.length; i++) {
		if (NODES[i].title != " " && NODES[i].title != "") {
			drawLine(NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y, NODES[i].lineEndX + OFFSET_X, NODES[i].lineEndY + OFFSET_Y);
		}
	}
	// Draw the center node
	drawCircle(NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH);
	writeText(CURRENT_ARTICLE, NODES[0].x - 45 + OFFSET_X, NODES[0].y - 10 + OFFSET_Y, 10, FONT_CENTER_SIZE, 'bold');
	drawOutline(NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH, '#000000', 1);

	// Draw all the other nodes
	for (var i = 1; i < NODES.length; i++) {
		if (NODES[i].title != " " && NODES[i].title != "") {
			drawCircle(NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH);
			writeText(NODES[i].title, NODES[i].x + OFFSET_X - 45, NODES[i].y + OFFSET_Y - 8, 12, FONT_NODE_SIZE, '');
		}
	}
	
}

// Update the page to be the article clicked
function clickedMouse(cx, cy) {
	for (var i = 1; i < NODES.length; i++) {
		if (intersects(NODES[i].x, NODES[i].y, cx, cy, NODE_HEIGHT, NODE_WIDTH)) {
			location.href = "wikiSearch.php?s=" + NODES[i].title.replace("&", "%26");
		}
	}
}

// On mouse event, check if user hovers over a node
function mouseMove(cx, cy) {
	var oldHover = HOVER;
	var currentlyHover = false;
	// iterate through all the nodes and detect if it hovered
	for (var i = 1; i < NODES.length; i++) {
		if (intersects(NODES[i].x, NODES[i].y, cx, cy, NODE_HEIGHT, NODE_WIDTH)) {
			if (NODES[i].title != " ") {
				currentlyHover = true;
				LAST_HOVER = i;
				// outline the node
				if (!HOVER) {
					HOVER = true;
					drawOutline(NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, '#000000', 1);
					// show the loading bar
					$('#articleTitle').css("display", "none");	
					$('#loader').css("display", "block");	
					$('#thumbnailImage').css("display", "none");
					$('#previewText').css("display", "none");
					getArticlePage(NODES[i].title, NODES, i, true);//*******
				}
			}
		}
	}
	// if not hoverd anymore, then don't outline the node
	if (!currentlyHover && HOVER) {
		HOVER = false;
		drawOutline(NODES[LAST_HOVER].x + OFFSET_X, NODES[LAST_HOVER].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, '#AAAAAA' , 3);
		LAST_HOVER = 0;
		getArticlePage(NODES[0].title, NODES, 0, false);
	}
	//if (!currentlyHover){//(!currentlyHover && $('#articleTitle').text() != CURRENT_ARTICLE) {
	//	getArticlePage(NODES[0].title, NODES, 0, false);
	//}
}

// Detect if the xy coordinate of the mouse is inside of a node's parameters
function intersects(x, y, cx, cy, height, width) {
	return cx >= x - width/2 && cx <= x + width/2 
			&& cy >= y - height/2 && cy <= y + height/2;
}

// on mouse down, start moving the map and detect where it is being moved
function mouseDown(e) { 
	MOUSE_DOWN = true;
	MOUSE_MOVE = false;
	var x;
	var y;
	if (e.pageX || e.pageY) { 
	  x = e.pageX;
	  y = e.pageY;
	}
	else { 
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	MOUSE_X = x;
	MOUSE_Y = y;
}

// On mouse up, stop moving the map.
function mouseUp(e) { 
	MOUSE_DOWN = false;
	var x;
	var y;
	if (e.pageX || e.pageY) { 
	  x = e.pageX;
	  y = e.pageY;
	}
	else { 
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	if (!MOUSE_MOVE) {
		clickedMouse(x - OFFSET_X, y - OFFSET_Y);
	}
}

// on mouse out, check if we are moving the map, if so, treat this like a mosue up event
function mouseOut(e){ 
	MOUSE_DOWN = false;
	var x;
	var y;
	if (e.pageX || e.pageY) { 
	  x = e.pageX;
	  y = e.pageY;
	}
	else { 
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	if (!MOUSE_MOVE) {
		clickedMouse(x - OFFSET_X, y - OFFSET_Y);
	}
}

// on mouse move, detect if we are hovering
function mouseMovement(e) { 
	var x;
	var y;
	MOUSE_MOVE = true;
	if (e.pageX || e.pageY) { 
	  x = e.pageX;
	  y = e.pageY;
	}
	else { 
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	if (MOUSE_DOWN) {
		OFFSET_X = OFFSET_X + x - MOUSE_X;
		OFFSET_Y = OFFSET_Y + y - MOUSE_Y;
		MOUSE_X = x;
		MOUSE_Y = y;
		redrawMap();
	} else {
		MOUSE_X = x;
		MOUSE_Y = y;
		mouseMove(x - OFFSET_X, y - OFFSET_Y);
	}
}

// Remove all the event handlers so when person zooms, they can't hover over nodes
function removeEvents() {
	CANVAS.removeEventListener("mousedown", mouseDown, false);
	CANVAS.removeEventListener("mouseup", mouseUp, false);
	CANVAS.removeEventListener("mouseout", mouseOut, false);
	CANVAS.removeEventListener("mousemove", mouseMovement, false);
}

// Add event handlers to detect mouse movement and clicks
function initEvents() {
	CANVAS.addEventListener("mousedown", mouseDown, false);
	CANVAS.addEventListener("mouseup", mouseUp, false);
	CANVAS.addEventListener("mouseout", mouseOut, false);
	CANVAS.addEventListener("mousemove", mouseMovement, false);
}


// Initialize the map size when user starts up
function mapInit() {
	MAP_HEIGHT = Math.max(520, $(window).height()*.8);
	MAP_WIDTH = Math.max(800, $(window).width()*.55);
	$("#mainSide").css("width", ($(window).width() - 400) + "px");
	$("#mapView").attr("height", MAP_HEIGHT);
	$("#mapView").attr("width", MAP_WIDTH);
	$("#articleView").css("height", MAP_HEIGHT);
	// Asigns an event when user resizes the window to change the mapview area
	$(window).resize(function() {
		MAP_HEIGHT = Math.max(500, $(window).height()*.8);
		MAP_WIDTH = Math.max(800, $(window).width()*.60);
		$("#mainSide").css("width", ($(window).width() - 400) + "px");
		$("#mapView").attr("height", MAP_HEIGHT);
		$("#mapView").attr("width", MAP_WIDTH);
		$("#articleView").css("height", MAP_HEIGHT);
		redrawMap();
	});
	COUNT = 0;
	CANVAS = document.getElementById('mapView');
	CTX = CANVAS.getContext('2d');
	

}


