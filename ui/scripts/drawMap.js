// drawMap.js
//
// This file contains routines for drawing to the map canvas.  The logic for the organization of
// the nodes and their animation occurs here.

// verdana, arial, san seriff

var MAP_HEIGHT = 600;
var MAP_WIDTH = 800;
var SIDE_MAP_HEIGHT = 300;
var SIDE_MAP_WIDTH = 300;
var ROOT_HEIGHT = 30;
var ROOT_WIDTH = 100;
var NODE_HEIGHT = 20;
var NODE_WIDTH = 120;
var CORNER_ARC = 10;
var INITIAL_RADIUS = 23;
var SIDE_INITIAL_RADIUS = 15;
var CTX;
var SIDE_CTX;
var NODES = [];
var SIDE_NODES = [];
var CANVAS;
var SIDE_CANVAS;
var SIDE_COUNT;
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
var FONT_CENTER_SIZE = 12;
var FONT_NODE_SIZE = 11;
var DEPTH_COLORS = ['#0083FF', '#A2C3E2', '#D7D7D7', '#E2E2E2', '#F8F8F8'];
var DEPTH_BORDERS = ["#0083FF", "#0986FD", "#A2A2A2", "#AAAAAA", '#C5C5C5'];

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

// Draws a node for the center
function drawCenterNode(x, y, height, width, depth) {
	if (NODES[0].title.length < 12) {
		CTX.beginPath();
		CTX.lineWidth = 3;
		CTX.strokeStyle = DEPTH_BORDERS[depth];
		CTX.fillStyle = DEPTH_COLORS[depth];
		CTX.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
		CTX.stroke();
		CTX.fill();
		writeText(NODES[0].title, NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y - 7, 0, FONT_CENTER_SIZE, "bold", true);
	} else {
		CTX.drawImage(CENTER_IMAGE, x - 43, y - 27);
		if (NODES[0].title.indexOf(" ") > 12) {
			writeText(NODES[0].title.substring(0, 12), NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y - 14, 0, FONT_CENTER_SIZE - 1, "bold", true);
			writeText(NODES[0].title.substring(12, 24), NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y , 0, FONT_CENTER_SIZE - 1, "bold", true);
		} else {
			var titleString = NODES[0].title;
			var topString = "";
			var nextSpace;
			while (topString.length < 11) {
				if (titleString.indexOf(" ") != -1 && topString.length + titleString.indexOf(" ") - 1 < 12) {
					topString += titleString.substring(0, titleString.indexOf(" ")) + " ";
					titleString = titleString.substring(titleString.indexOf(" ") + 1, titleString.length);
				} else {
					break;
				}
			}
			writeText(topString.substring(0, topString.length -1), NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y - 14, 0, FONT_CENTER_SIZE - 1, "bold", true);
			writeText(titleString.substring(0, 12), NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y , 0, FONT_CENTER_SIZE - 1, "bold", true);
		}
	}
}

// Draws a node for each article that needs to be in the map
function drawCircle(x, y, height, width, depth) {
	CTX.beginPath();
	CTX.lineWidth = 3;
	CTX.strokeStyle = DEPTH_BORDERS[depth];
	CTX.fillStyle = DEPTH_COLORS[depth];
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
function writeText(text, x, y, mid, fontSize, bold, middle){
	CTX.fillStyle    = middle ? '#FFFFFF' : '#000000';
	CTX.textAlign = 'center';
	CTX.textBaseline = 'top';
	//CTX.fillText  (text.length > 18 ? text.substring(0, 18) + ".." : text, x, y);
	//if (text.length >= 24 ) {
	//	CTX.font         = bold + ' ' + 8 + 'px verdana';
	//	CTX.fillText  (text.length > 24 ? text.substring(0, 24) + ".." : text, x, y);
	//} else if 
	if (text.length >= 19 ) {
		CTX.font         = bold + ' ' + 9 + 'px verdana';
		CTX.fillText  (text.length > 19 ? text.substring(0, 19) + ".." : text, x, y);
	} else if (text.length >= 17 ) {
		CTX.font         = bold + ' ' + 10 + 'px verdana';
		CTX.fillText  (text.length > 17 ? text.substring(0, 17) + ".." : text, x, y);
	} else {
		CTX.font         = bold + ' ' + fontSize + 'px verdana';
		CTX.fillText  (text, x, y);
	}
}

// This is a recursive function to iterate through the tree by depth.
function drawMapHelper(string, pipe, radius, startAngle, angleSize, parentLoc, depth){
	if(pipe == ''){
		var angle = startAngle + angleSize / 2;
		parentLoc = parentLoc.replace("|", "");
		var px = parseFloat(parentLoc.split(',')[0]);
		var py = parseFloat(parentLoc.split(',')[1]);
		var x = MAP_WIDTH / 2 + radius * Math.cos(angle);
		var y = MAP_HEIGHT / 2 + radius * Math.sin(angle);

		// Store all the nodes and its coordinates
		NODES[COUNT] = new Node(x, y, px, py, string.replace("&amp;", "&"), depth, "", "");
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
									(pipe == '|') ? parentLoc : parentLocs[i], depth);
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
			NODES[0] = new Node(0, 0, 0, 0, CURRENT_ARTICLE, 0, "", "");
		// Node[0] is already created in wikiSearch.js function initialize();
		NODES[0].setXY(MAP_WIDTH / 2, MAP_HEIGHT / 2);
		NODES[0].title = CURRENT_ARTICLE;
		COUNT++;
		drawCircle(MAP_WIDTH / 2, MAP_HEIGHT / 2, ROOT_HEIGHT, ROOT_WIDTH, 0);
		writeText(CURRENT_ARTICLE, MAP_WIDTH / 2 , MAP_HEIGHT / 2 - 10, 10, FONT_CENTER_SIZE, 'bold', true);

		var parentStr = (MAP_WIDTH / 2) + "," + (MAP_HEIGHT / 2);
		// draw all the other depths
		for (var i = 1; i < depths; i++){
			levelPipes = "||";
			parentStr = drawMapHelper(depthSplit[i], levelPipes, INITIAL_RADIUS, 0, 2 * Math.PI, parentStr, i);
		}
		var sideMapTree = CURRENT_ARTICLE + "//";
		//console.log(treeString);
		/*for (var i = 1; i < (COUNT >= 7 ? 7 : COUNT); i++) {
			console.log(NODES[i].title);
			sideMapTree += NODES[i].title;
			if (i != 6) sideMapTree += "|";
		}
		drawSideMap(sideMapTree);
		*/
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
		drawCenterNode(centerX + ((NODES[0].x + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, ROOT_HEIGHT, ROOT_WIDTH, 0)
		//drawCircle(centerX + ((NODES[0].x + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, ROOT_HEIGHT, ROOT_WIDTH, 0);
		//writeText(CURRENT_ARTICLE, centerX + ((NODES[0].x + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y - 10 + OFFSET_Y) - centerY) * OFFSET_RADIUS, 10, FONT_CENTER_SIZE, 'bold', true);
		//drawOutline(centerX + ((NODES[0].x + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, ROOT_HEIGHT, ROOT_WIDTH, DEPTH_BORDERS[0], 1);
		// Draw all the other nodes
		for (var i = 1; i < NODES.length; i++) {
			if (NODES[i].title != " " && NODES[i].title != "") {
				drawCircle(centerX + ((NODES[i].x + OFFSET_X) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, NODE_HEIGHT, NODE_WIDTH, NODES[i].depth);
				writeText(NODES[i].title, 
						centerX + ((NODES[i].x + OFFSET_X) - centerX) * OFFSET_RADIUS, 
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
	drawCenterNode(NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH, 0);
	//drawCircle(NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH, 0);
	//writeText(CURRENT_ARTICLE, NODES[0].x + OFFSET_X, NODES[0].y - 10 + OFFSET_Y, 10, FONT_CENTER_SIZE, 'bold', true);
	//drawOutline(NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH, DEPTH_BORDERS[0], 1);

	// Draw all the other nodes
	for (var i = 1; i < NODES.length; i++) {
		if (NODES[i].title != " " && NODES[i].title != "") {
			drawCircle(NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, NODES[i].depth);
			writeText(NODES[i].title, NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y - 8, 12, FONT_NODE_SIZE, '');
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
		drawOutline(NODES[LAST_HOVER].x + OFFSET_X, NODES[LAST_HOVER].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, DEPTH_BORDERS[NODES[LAST_HOVER].depth] , 3);
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


// NOTE CODE BELOW IS VERY REDUNDANT. WE NEED TO IMPROVE FOR FUTURE



// This is a recursive function to iterate through the tree by depth.
function drawSideMapHelper(string, pipe, radius, startAngle, angleSize, parentLoc){
	if(pipe == ''){
		var angle = startAngle + angleSize / 2;
		parentLoc = parentLoc.replace("|", "");
		var px = parseFloat(parentLoc.split(',')[0]);
		var py = parseFloat(parentLoc.split(',')[1]);
		var x = SIDE_MAP_WIDTH / 2 + radius * Math.cos(angle);
		var y = SIDE_MAP_HEIGHT / 2 + radius * Math.sin(angle);

		// Store all the nodes and its coordinates
		SIDE_NODES[SIDE_COUNT] = new Node(x, y, px, py, string.replace("&amp;", "&"), "", "");
		SIDE_COUNT++;
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
			retval += drawSideMapHelper(items[i], 
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
function drawSideMap(treeString){
	SIDE_CANVAS = document.getElementById('previewMap');
	SIDE_CTX = SIDE_CANVAS.getContext('2d');
	
	// Make sure we don't execute when SIDE_CANVAS isn't supported
	if (SIDE_CANVAS.getContext){
		SIDE_COUNT = 0;

		// use getContext to use the SIDE_CANVAS for drawing
		SIDE_CTX.clearRect(0,0,SIDE_CANVAS.width,SIDE_CANVAS.height);
		SIDE_CTX.beginPath();
		var depthSplit = treeString.split("//");
		var depths = depthSplit.length;
		var levelPipes = "";

		// draw parent
		CURRENT_ARTICLE = depthSplit[0].replace("&amp;", "&");
		if (SIDE_NODES[0] == null)
			SIDE_NODES[0] = new Node(0, 0, 0, 0, CURRENT_ARTICLE, "", "");
		// Node[0] is already created in wikiSearch.js function initialize();
		SIDE_NODES[0].setXY(MAP_WIDTH / 2, MAP_HEIGHT / 2);
		SIDE_NODES[0].title = CURRENT_ARTICLE;
		SIDE_COUNT++;

		var parentStr = (SIDE_MAP_WIDTH / 2) + "," + (SIDE_MAP_HEIGHT / 2);
		// draw all the other depths
		for (var i = 1; i < depths; i++){
			levelPipes = "||";
			parentStr = drawSideMapHelper(depthSplit[i], levelPipes, SIDE_INITIAL_RADIUS, 0, 2 * Math.PI, parentStr);
		}
		// draw the map once the coordinates have been made
		redrawSideMap();
	} else {
		alert('You need Safari or Firefox 1.5+ or Google Chrome to see this Map.');
	}
}


// Draws a node for each article that needs to be in the map
function drawSideCircle(x, y, height, width, title) {
	SIDE_CTX.beginPath();
	SIDE_CTX.lineWidth = 3;
	SIDE_CTX.strokeStyle = '#AAAAAA';
	SIDE_CTX.fillStyle = '#CDCECE';
	SIDE_CTX.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	SIDE_CTX.stroke();
	SIDE_CTX.fill();
}

// Draws the outline when someone hovers or unhovers over a node
function drawSideOutline(x, y, height, width, color, lineWidth) {
	SIDE_CTX.beginPath();
	SIDE_CTX.lineWidth = lineWidth;
	SIDE_CTX.strokeStyle = color;
	SIDE_CTX.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	SIDE_CTX.stroke();
}

// Draw a line between a node and it's child
function drawSideLine(xStart, yStart, xEnd, yEnd){
	SIDE_CTX.beginPath();
	SIDE_CTX.strokeStyle = '#BFB7B7';
	SIDE_CTX.moveTo(xStart, yStart);
	SIDE_CTX.lineTo(xEnd, yEnd);
	SIDE_CTX.stroke();
}

// Write the text on top of a node
function writeSideText(text, x, y, mid, fontSize, bold){
	SIDE_CTX.fillStyle    = '#000000';
	SIDE_CTX.font         = bold + ' ' + fontSize + 'px sanserif';
	SIDE_CTX.textBaseline = 'top';
	SIDE_CTX.fillText  (text.length > mid ? text.substring(0, mid) + ".." : text, x, y);
}

// Redraw the map with new offsets
function redrawSideMap() {
	SIDE_CTX.clearRect(0,0,SIDE_CANVAS.width,SIDE_CANVAS.height);
	SIDE_CTX.beginPath();
	// Draw the lines first
	for (var i = 1; i < SIDE_NODES.length; i++) {
		if (SIDE_NODES[i].title != " " && SIDE_NODES[i].title != "") {
			drawSideLine(SIDE_NODES[i].x, SIDE_NODES[i].y, SIDE_NODES[i].lineEndX, SIDE_NODES[i].lineEndY);
		}
	}
	// Draw the center node
	drawSideCircle(SIDE_MAP_WIDTH / 2, SIDE_MAP_HEIGHT / 2, ROOT_HEIGHT, ROOT_WIDTH);
	writeSideText(CURRENT_ARTICLE, SIDE_MAP_WIDTH / 2 - 30, SIDE_MAP_HEIGHT / 2 - 10, 10, FONT_CENTER_SIZE, 'bold');

	// Draw all the other nodes
	for (var i = 1; i < SIDE_NODES.length; i++) {
		if (NODES[i].title != " " && NODES[i].title != "") {
			drawSideCircle(SIDE_NODES[i].x, SIDE_NODES[i].y, NODE_HEIGHT, NODE_WIDTH);
			writeSideText(SIDE_NODES[i].title, SIDE_NODES[i].x - 45, SIDE_NODES[i].y + OFFSET_Y - 8, 12, FONT_NODE_SIZE, '');
		}
	}
	
}
