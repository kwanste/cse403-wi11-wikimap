// drawMap.js
//
// This file contains routines for drawing to the map canvas.  The logic for the organization of
// the nodes and their animation occurs here.

// These are all the global variables to help concurrency control.
// For improvement, we could add all of these to a global class and then access these variables from the global class to make it cleaner

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
var SIDE_LAST_HOVER = 0;
var FONT_CENTER_SIZE = 12;
var FONT_NODE_SIZE = 11;
var DEPTH_COLORS = ['#0083FF', '#A2C3E2', '#D7D7D7', '#E2E2E2', '#F8F8F8'];
var DEPTH_BORDERS = ["#0083FF", "#0986FD", "#A2A2A2", "#AAAAAA", '#C5C5C5'];

// Draw a round rectangle by a prototype in the context2d
// Input the corners of the rounded rectangle and then the radius of how wide we want the rounded rectangles
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

// Draws the center node, determine if it needs two lines or 1 line
// Input: the canvas contex, (x, y) coordinate of the center, the height, the width, 
//        and the depth that this node is at (should be 0)
function drawCenterNode(ctx, x, y, height, width, depth) {
	// check if the title can fit on one line
	if (NODES[0].title.length < 12) {
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = DEPTH_BORDERS[depth];
		ctx.fillStyle = DEPTH_COLORS[depth];
		ctx.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
		ctx.stroke();
		ctx.fill();
		writeText(ctx, NODES[0].title, x, y - 7, 0, FONT_CENTER_SIZE, "bold", true);
	// else draw two lines
	} else {
		ctx.drawImage(CENTER_IMAGE, x - 50, y - 27);
		// try to break up lines by words rather than just pure text
		if (NODES[0].title.indexOf(" ") > 12) {
			writeText(ctx, NODES[0].title.substring(0, 12), x, y - 14, 0, FONT_CENTER_SIZE, "bold", true);
			writeText(ctx, NODES[0].title.substring(12, 24), x, y , 0, FONT_CENTER_SIZE , "bold", true);
		} else {
			var titleString = NODES[0].title;
			var topString = "";
			var nextSpace;
			// keep adding words into the top line until we can't fit anymore
			while (topString.length < 13) {
				if (titleString.indexOf(" ") != -1 && topString.length + titleString.indexOf(" ") - 1 < 14) {
					topString += titleString.substring(0, titleString.indexOf(" ")) + " ";
					titleString = titleString.substring(titleString.indexOf(" ") + 1, titleString.length);
				} else {
					break;
				}
			}
			writeText(ctx, topString.substring(0, topString.length -1), x, y - 14, 0, FONT_CENTER_SIZE, "bold", true);
			writeText(ctx, titleString.substring(0, 12), x, y , 0, FONT_CENTER_SIZE, "bold", true);
		}
	}
}

// Draws a node for each article that needs to be in the map
// Inputs: Canvas context, x and y coordinates for center, height and width of node, and the depth this node is at
function drawCircle(ctx, x, y, height, width, depth) {
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle = DEPTH_BORDERS[depth];
	ctx.fillStyle = DEPTH_COLORS[depth];
	ctx.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	ctx.stroke();
	ctx.fill();
}

// Draws the outline when someone hovers over a node
// Inputs: Canvas contex, x and y coordinates for center, height and width of the node, and depth this node is at
function drawOutline(ctx, x, y, height, width, color, lineWidth) {
	ctx.beginPath();
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;
	ctx.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	ctx.stroke();
}

// Draw a line between a node and it's child
// Inputs: Canvas contex, x and y coordinate of parent, x and y coordinate of children
function drawLine(ctx, xStart, yStart, xEnd, yEnd){
	ctx.beginPath();
	ctx.strokeStyle = '#BFB7B7';
	ctx.lineWidth = 1.3;
	ctx.moveTo(xStart, yStart);
	ctx.lineTo(xEnd, yEnd);
	ctx.stroke();
}

// Write the text on top of a node
//  Inputs: Canvas contex, the title, x and y coordinate of node, integer that gives the max of the string
//			fontSize to use for the base case if the title can fit in a node, and a boolean if this is the center node
function writeText(ctx, text, x, y, mid, fontSize, bold, middle){
	ctx.fillStyle    = middle ? '#FFFFFF' : '#000000';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';
	// if it is a long title, make the font smaller to fit more characters
	if (text.length >= 19 ) {
		ctx.font         = bold + ' ' + 9 + 'px verdana';
		ctx.fillText  (text.length > 19 ? text.substring(0, 19) + ".." : text, x, y);
	// if it is a somewhat long title, make the font just 1 size smaller to fit more characters
	} else if (text.length >= 17 ) {
		ctx.font         = bold + ' ' + 10 + 'px verdana';
		ctx.fillText  (text.length > 17 ? text.substring(0, 17) + ".." : text, x, y);
	// This title can fit in the node, just display it
	} else {
		ctx.font         = bold + ' ' + fontSize + 'px verdana';
		ctx.fillText  (text, x, y);
	}
}

// This is a recursive function to iterate through the tree by depth.
// Inputs:  the string of this depth, the pipe that splits each node, the radius of how far we should have between the center node and this depth
// 			the start angle each node should start, the angle size to split each node, the parent (x, y) locations, the depth we are currently parsing
// Returns: the current depth we are at
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
		if (COUNT < 7) SIDE_NODES[COUNT] = new Node(SIDE_MAP_WIDTH / 2 + SIDE_INITIAL_RADIUS*6 * Math.cos(angle), 
									SIDE_MAP_HEIGHT / 2 + SIDE_INITIAL_RADIUS*6 * Math.sin(angle), 
									SIDE_MAP_WIDTH / 2, SIDE_MAP_HEIGHT / 2, 
									string.replace("&amp;", "&"), depth, "", "");
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
// Inputs the tree string given by the retriever.php
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

		// center node
		CURRENT_ARTICLE = depthSplit[0].replace("&amp;", "&");
		// Node[0] is already created in wikiSearch.js function initialize();
		NODES[0].setXY(MAP_WIDTH / 2, MAP_HEIGHT / 2);
		NODES[0].title = CURRENT_ARTICLE;
		SIDE_NODES[0].setXY(SIDE_MAP_WIDTH / 2, SIDE_MAP_WIDTH / 2);
		SIDE_NODES[0].title = CURRENT_ARTICLE;
		COUNT++;

		var parentStr = (MAP_WIDTH / 2) + "," + (MAP_HEIGHT / 2);
		// draw all the other depths
		for (var i = 1; i < depths; i++){
			levelPipes = "||";
			parentStr = drawMapHelper(depthSplit[i], levelPipes, INITIAL_RADIUS, 0, 2 * Math.PI, parentStr, i);
		}

		// draw the map once the coordinates have been made
		drawSideMap();
		firstDraw();
	} else {
		alert('You need Safari or Firefox 1.5+ or Google Chrome to see this Map.');
	}
}

// for the first draw, do an animation for the map. iterate every 25 ms
function firstDraw() {
	removeEvents();
	OFFSET_RADIUS = 0.025;
	CLEAR_INTERVAL = setInterval(drawChange, 25);
}

// helper function for the animation on the initial load
function drawChange() {
	ctx = CTX;
	if (OFFSET_RADIUS <= 1.01) {
		ctx.clearRect(0,0,CANVAS.width,CANVAS.height);
		ctx.beginPath();
		var centerX = (MAP_WIDTH / 2);
		var centerY = (MAP_HEIGHT / 2);
		// Draws the lines first
		for (var i = 1; i < NODES.length; i++) {
		        if (NODES[i].title != " "&& NODES[i].title.indexOf("#") == -1) {
				drawLine(ctx, centerX + ((NODES[i].x + OFFSET_X) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, 
						centerX + ((NODES[i].lineEndX + OFFSET_X) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].lineEndY + OFFSET_Y) - centerY) * OFFSET_RADIUS);
			}
		}
		// Draw the center node
		drawCenterNode(ctx, centerX + ((NODES[0].x + OFFSET_X) - centerX) * OFFSET_RADIUS, centerY + ((NODES[0].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, ROOT_HEIGHT, ROOT_WIDTH, 0)
		// Draw all the other nodes
		for (var i = 1; i < NODES.length; i++) {
		        if (NODES[i].title != " " && NODES[i].title != "" && NODES[i].title.indexOf("#") == -1) {
				drawCircle(ctx, centerX + ((NODES[i].x + OFFSET_X) - centerX) * OFFSET_RADIUS, 
						centerY + ((NODES[i].y + OFFSET_Y) - centerY) * OFFSET_RADIUS, NODE_HEIGHT, NODE_WIDTH, NODES[i].depth);
				writeText(ctx, NODES[i].title, 
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
// This function is used when someone drags the map or someone unhovers a node
function redrawMap() {
	ctx = CTX;
	ctx.clearRect(0,0,CANVAS.width,CANVAS.height);
	ctx.beginPath();
	// Draw the lines first
	for (var i = 1; i < NODES.length; i++) {
	        if (NODES[i].title != " " && NODES[i].title != "" && NODES[i].title.indexOf("#") == -1) {
			drawLine(ctx, NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y, NODES[i].lineEndX + OFFSET_X, NODES[i].lineEndY + OFFSET_Y);
		}
	}
	// Draw the center node
	drawCenterNode(ctx, NODES[0].x + OFFSET_X, NODES[0].y + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH, 0);
	// Draw all the other nodes
	for (var i = 1; i < NODES.length; i++) {
	        if (NODES[i].title != " " && NODES[i].title != "" && NODES[i].title.indexOf("#") == -1) {
			drawCircle(ctx, NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, NODES[i].depth);
			writeText(ctx, NODES[i].title, NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y - 8, 12, FONT_NODE_SIZE, '');
			
		}
	}
	
}

// draw the sidemap, should be used on loadup and also when someone unhovers
function drawSideMap() {
	var ctx = SIDE_CTX;
	SIDE_CTX.clearRect(0,0,SIDE_CANVAS.width,SIDE_CANVAS.height);
	SIDE_CTX.beginPath();
	// Draw the lines first
	for (var i = 1; i < SIDE_NODES.length; i++) {
	        if (SIDE_NODES[i].title != " " && SIDE_NODES[i].title != "" && SIDE_NODES[i].title.indexOf("#") == -1) {
			drawLine(ctx, SIDE_NODES[i].x, SIDE_NODES[i].y, SIDE_NODES[i].lineEndX, SIDE_NODES[i].lineEndY);
		}
	}
	// Draw the center node
	drawCenterNode(ctx, SIDE_MAP_WIDTH / 2, SIDE_MAP_HEIGHT / 2, ROOT_HEIGHT, ROOT_WIDTH, 0);
	
	// Draw all the other nodes
	for (var i = 1; i < SIDE_NODES.length; i++) {
	        if (SIDE_NODES[i].title != " " && SIDE_NODES[i].title != "" && SIDE_NODES[i].title.indexOf("#") == -1) {
			drawCircle(ctx, SIDE_NODES[i].x, SIDE_NODES[i].y, NODE_HEIGHT, NODE_WIDTH, 1);
			writeText(ctx, SIDE_NODES[i].title, SIDE_NODES[i].x, SIDE_NODES[i].y + OFFSET_Y - 8, 12, FONT_NODE_SIZE, '', 0);
		}
	}
	
}

// Check if a user clicked on an article, if so then treat it as a new search
// Inputs: the (x, y) coordinate of what was clicked
function clickedMouse(cx, cy) {
	for (var i = 1; i < NODES.length; i++) {
	        if (intersects(NODES[i].x, NODES[i].y, cx, cy, NODE_HEIGHT, NODE_WIDTH)) {
			location.href = "wikiSearch.php?s=" + NODES[i].title.replace("&", "%26");
		}
	}
}

// On mouse event, check if user hovers over a node, if so, then get the preview text and draw an outline
// Inputs: the users current (x, y) coordinates
function mouseMove(cx, cy) {
	var oldHover = HOVER;
	var currentlyHover = false;
	// iterate through all the nodes and detect if it hovered
	for (var i = 1; i < NODES.length; i++) {
	        if (intersects(NODES[i].x, NODES[i].y, cx, cy, NODE_HEIGHT, NODE_WIDTH)) {
		        if (NODES[i].title != " " && NODES[i].title.indexOf("#") == -1) {
				currentlyHover = true;
				LAST_HOVER = i;
				// outline the node
				if (!HOVER) {
					HOVER = true;
					drawOutline(CTX, NODES[i].x + OFFSET_X, NODES[i].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, '#000000', 1);
					// show the loading bar
					$('#articleTitle').css("display", "none");	
					$('#loader').css("display", "block");	
					$('#thumbnailImage').css("display", "none");
					$('#previewText').css("display", "none");
					$('#articleTitle').text(NODES[i].title);
					getArticlePage(NODES[i].title, NODES, i, true);//*******
				}
			}
		}
	}
	// if not hoverd anymore, then don't outline the node
	if (!currentlyHover && HOVER) {
		HOVER = false;
		//drawOutline(CTX, NODES[LAST_HOVER].x + OFFSET_X, NODES[LAST_HOVER].y + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, DEPTH_BORDERS[NODES[LAST_HOVER].depth] , 1);
		redrawMap();
		LAST_HOVER = 0;
		getArticlePage(NODES[0].title, NODES, 0, false);
	}
	if (!currentlyHover && $('#articleTitle').text() != CURRENT_ARTICLE) {
		getArticlePage(NODES[0].title, NODES, 0, false);
	}
}

// On mouse event, check if user hovers over a node in the side map
// Inputs: (x, y) coordinates the user is at
function sideMouseMove(cx, cy) {
	
	// iterate through all the nodes and detect if it hovered
	for (var i = 1; i < SIDE_NODES.length; i++) {
		if (intersects(SIDE_NODES[i].x, SIDE_NODES[i].y, cx, cy, NODE_HEIGHT, NODE_WIDTH)) {
			if (NODES[i].title != " ") {
				SIDE_LAST_HOVER = i;
				drawOutline(SIDE_CTX, SIDE_NODES[i].x, SIDE_NODES[i].y, NODE_HEIGHT, NODE_WIDTH, '#000000', 1);
				return;
			}
		}
	}
	// if not hoverd anymore, then don't outline the node
	if (SIDE_LAST_HOVER != 0) drawSideMap();
}

// Detect if the xy coordinate of the mouse is inside of a node's parameters
function intersects(x, y, cx, cy, height, width) {
	return cx >= x - width/2 && cx <= x + width/2 
			&& cy >= y - height/2 && cy <= y + height/2;
}

// on mouse down, start moving the map and detect where it is being moved
// Inputs: the event for the mouse to find the x , y coordinates
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
	// calculate the offsets
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	MOUSE_X = x;
	MOUSE_Y = y;
}

// On mouse up, stop moving the map. if the downclick is the same as the upclick, then detect if user clicked on a node
// Inputs: the event for the mouse to find the x , y coordinates
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
	// calculate the offsets
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	if (!MOUSE_MOVE) {
		clickedMouse(x - OFFSET_X, y - OFFSET_Y);
	}
}

// on mouse out, check if we are moving the map, if so, treat this like a mosue up event
// Inputs: the event for the mouse to find the x , y coordinates
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
	// calculate the offsets
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	if (!MOUSE_MOVE) {
		clickedMouse(x - OFFSET_X, y - OFFSET_Y);
	}
}

// on mouse move, detect if we are hovering
// Inputs: the event for the mouse to find the x , y coordinates
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
	//calculates the offsets
	x -= CANVAS.offsetLeft;
	y -= CANVAS.offsetTop;
	// cacluate if we are dragging the map
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


// on mouse down of the side map, determine if it is clicking on a node, if so, treat it as a new search
// Inputs: the event for the mouse to find the x , y coordinates
function sideMouseDown(e) { 
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
	// find the offsets
	x -= SIDE_CANVAS.offsetLeft;
	y -= SIDE_CANVAS.offsetTop;
	// detect if we are clicking on a node
	for (var i = 1; i < SIDE_NODES.length; i++) {
		if (intersects(SIDE_NODES[i].x, SIDE_NODES[i].y, x, y, NODE_HEIGHT, NODE_WIDTH)) {
			location.href = "wikiSearch.php?s=" + SIDE_NODES[i].title.replace("&", "%26") + "&view=article";
		}
	}
}

// on mouse move of the side map, detect if we are hovering
v
function sideMouseMovement(e) { 
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
	// find the offsets
	x -= SIDE_CANVAS.offsetLeft;
	y -= SIDE_CANVAS.offsetTop;
	sideMouseMove(x, y);
}

// Remove all the event handlers so when person zooms, they can't hover over nodes
// This is not being used anymore in the Final release because zoom was removed
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
	SIDE_CANVAS.addEventListener("mousedown", sideMouseDown, false);
	SIDE_CANVAS.addEventListener("mousemove", sideMouseMovement, false);
}


// Initialize the map size when user starts up. Sets up the appropriate map width and starts all the canvas contexts
function mapInit() {
	MAP_HEIGHT = Math.max(480, $(window).height()*.7);
	MAP_WIDTH = Math.max(800, $(window).width()*.55);
	$("#mainSide").css("width", ($(window).width() - 400) + "px");
	$("#mapView").attr("height", MAP_HEIGHT);
	$("#mapView").css("height", MAP_HEIGHT + "px");
	$("#mapView").attr("width", MAP_WIDTH);
	$("#mapView").css("width", MAP_WIDTH + "px");
	$("#articleView").css("height", MAP_HEIGHT);
	// Asigns an event when user resizes the window to change the mapview area
	$(window).resize(function() {
		MAP_HEIGHT = Math.max(480, $(window).height()*.7);
		MAP_WIDTH = Math.max(800, $(window).width()*.55);
		$("#mainSide").css("width", ($(window).width() - 400) + "px");
		$("#mapView").attr("height", MAP_HEIGHT);
		$("#mapView").css("height", MAP_HEIGHT + "px");
		$("#mapView").attr("width", MAP_WIDTH);
		$("#mapView").css("width", MAP_WIDTH + "px");
		$("#articleView").css("height", MAP_HEIGHT);
		if (CAN_DRAW) redrawMap();
	});
	COUNT = 0;
	CANVAS = document.getElementById('mapView');
	SIDE_CANVAS = document.getElementById('previewMap');
	CTX = CANVAS.getContext('2d');
	SIDE_CTX = SIDE_CANVAS.getContext('2d');
}

