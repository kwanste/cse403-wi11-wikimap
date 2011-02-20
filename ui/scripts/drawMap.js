var MAP_HEIGHT = 600;
var MAP_WIDTH = 800;
var ROOT_HEIGHT = 30;
var ROOT_WIDTH = 100;
var NODE_HEIGHT = 20;
var NODE_WIDTH = 100;
var CORNER_ARC = 10;
var INITIAL_RADIUS = 20;
var CTX;
var CIRCLES_X = [];
var CIRCLES_Y = [];
var ARTICLE_TITLES = [];
var PREVIEW_CACHE = [];
var URL_CACHE = [];
var LINES_START_X = [];
var LINES_START_Y = [];
var LINES_END_X = []; 
var LINES_END_Y = []; 
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

function drawCircle(x, y, height, width, title) {
	CTX.beginPath();
	CTX.lineWidth = 3;
	CTX.strokeStyle = '#AAAAAA';
	CTX.fillStyle = '#CDCECE';
	CTX.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	CTX.stroke();
	CTX.fill();
}

function drawOutline(x, y, height, width, color, lineWidth) {
	CTX.beginPath();
	CTX.lineWidth = lineWidth;
	CTX.strokeStyle = color;
	CTX.roundRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2, CORNER_ARC);
	CTX.stroke();
}

function drawLine(xStart, yStart, xEnd, yEnd){
	//context.strokeStyle = '#CDCECE';
	CTX.beginPath();
	CTX.strokeStyle = '#BFB7B7';
	CTX.moveTo(xStart, yStart);
	CTX.lineTo(xEnd, yEnd);
	CTX.stroke();
}

function writeText(text, x, y, mid, fontSize){
	CTX.fillStyle    = '#000';
	CTX.font         = fontSize + 'px sanserif';
	CTX.textBaseline = 'top';
	CTX.fillText  (text.length > mid ? text.substring(0, mid) + ".." : text, x, y);
}

function drawMapHelper(string, pipe, radius, startAngle, angleSize, parentLoc){
	if(radius >= Math.sqrt(MAP_WIDTH * MAP_WIDTH / 4 + MAP_HEIGHT * MAP_HEIGHT / 4)){
		return '';
	}else if(pipe == ''){
		var angle = startAngle + angleSize / 2;
		var px = parseFloat(parentLoc.split(',')[0]);
		var py = parseFloat(parentLoc.split(',')[1]);
		var x = MAP_WIDTH / 2 + radius * Math.cos(angle);
		var y = MAP_HEIGHT / 2 + radius * Math.sin(angle);

		LINES_START_X[COUNT] = px;
		LINES_START_Y[COUNT] = py;
		LINES_END_X[COUNT] = x; 
		LINES_END_Y[COUNT] = y; 
		PREVIEW_CACHE[COUNT] = "";
		URL_CACHE[COUNT] = "";	
		CIRCLES_X[COUNT] = x;
		CIRCLES_Y[COUNT] = y;
		ARTICLE_TITLES[COUNT] = string.replace("&amp;", "&");
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

// FORMAT
// 	PARENT//Child1|Child2|Child3//Child1a|Child1b||Child2a|Child2b||Child3a|Child3b
function drawMap(treeString){
	CANVAS = document.getElementById('mapView');
	
	// Make sure we don't execute when CANVAS isn't supported
	if (CANVAS.getContext){
		CIRCLES_X = [];
		CIRCLES_Y = [];
		ARTICLE_TITLES = [];
		COUNT = 0;

		// use getContext to use the CANVAS for drawing
		CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
		CTX.beginPath();
		var depthSplit = treeString.split("//");
		var depths = depthSplit.length;
		var levelPipes = "";

		// draw parent
		CURRENT_ARTICLE = depthSplit[0].replace("&amp;", "&");
		CIRCLES_X[COUNT] = MAP_WIDTH / 2;
		CIRCLES_Y[COUNT] = MAP_HEIGHT / 2;
		ARTICLE_TITLES[COUNT] = CURRENT_ARTICLE;
		COUNT++;
		drawCircle(MAP_WIDTH / 2, MAP_HEIGHT / 2, ROOT_HEIGHT, ROOT_WIDTH);
		writeText(CURRENT_ARTICLE, MAP_WIDTH / 2 - 30, MAP_HEIGHT / 2 - 10, 10, FONT_CENTER_SIZE);

		var parentStr = (MAP_WIDTH / 2) + "," + (MAP_HEIGHT / 2);
		for (var i = 1; i < depths; i++){
			levelPipes = levelPipes.concat("|");
			parentStr = drawMapHelper(depthSplit[i], levelPipes, INITIAL_RADIUS, 0, 2 * Math.PI, parentStr);
		}
		firstDraw();
		//redrawMap();
	} else {
		alert('You need Safari or Firefox 1.5+ or Google Chrome to see this Map.');
	}
}

function firstDraw() {
	OFFSET_RADIUS = 0.025;
	CLEAR_INTERVAL = setInterval(drawChange, 25);
}

function drawChange() {
	if (OFFSET_RADIUS <= 1.01) {
		CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
		CTX.beginPath();
		var centerX = (MAP_WIDTH / 2);
		var centerY = (MAP_HEIGHT / 2);
		for (var i = 1; i < CIRCLES_X.length; i++) {
			drawLine(centerX + ((LINES_START_X[i] + OFFSET_X) - centerX) * OFFSET_RADIUS, 
					centerY + ((LINES_START_Y[i] + OFFSET_Y) - centerY) * OFFSET_RADIUS, 
					centerX + ((LINES_END_X[i] + OFFSET_X) - centerX) * OFFSET_RADIUS, 
					centerY + ((LINES_END_Y[i] + OFFSET_Y) - centerY) * OFFSET_RADIUS);
		}
		drawCircle(CIRCLES_X[0] + OFFSET_X, CIRCLES_Y[0] + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH);
		writeText(CURRENT_ARTICLE, CIRCLES_X[0] - 45 + OFFSET_X, CIRCLES_Y[0] - 10 + OFFSET_Y, 10, FONT_CENTER_SIZE);
		for (var i = 1; i < CIRCLES_X[i]; i++) {
			drawCircle(centerX + ((CIRCLES_X[i] + OFFSET_X) - centerX) * OFFSET_RADIUS, 
					centerY + ((CIRCLES_Y[i] + OFFSET_Y) - centerY) * OFFSET_RADIUS, NODE_HEIGHT, NODE_WIDTH);
			writeText(ARTICLE_TITLES[i], 
					centerX + ((CIRCLES_X[i] + OFFSET_X - 45) - centerX) * OFFSET_RADIUS, 
					centerY + ((CIRCLES_Y[i] + OFFSET_Y - 8) - centerY) * OFFSET_RADIUS, 12, FONT_NODE_SIZE);
		}
		OFFSET_RADIUS += 0.025;
	} else {
		initEvents();
		clearInterval(CLEAR_INTERVAL);
	}
}

function redrawMap() {
	CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
	CTX.beginPath();
	for (var i = 1; i < CIRCLES_X.length; i++) {
		drawLine(LINES_START_X[i] + OFFSET_X, LINES_START_Y[i] + OFFSET_Y, LINES_END_X[i] + OFFSET_X, LINES_END_Y[i] + OFFSET_Y);
	}
	drawCircle(CIRCLES_X[0] + OFFSET_X, CIRCLES_Y[0] + OFFSET_Y, ROOT_HEIGHT, ROOT_WIDTH);
	writeText(CURRENT_ARTICLE, CIRCLES_X[0] - 42 + OFFSET_X, CIRCLES_Y[0] - 10 + OFFSET_Y, 10, FONT_CENTER_SIZE);

	for (var i = 1; i < CIRCLES_X.length; i++) {
		drawCircle(CIRCLES_X[i] + OFFSET_X, CIRCLES_Y[i] + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH);
		writeText(ARTICLE_TITLES[i], CIRCLES_X[i] + OFFSET_X - 45, CIRCLES_Y[i] + OFFSET_Y - 8, 12, FONT_NODE_SIZE);
	}
	
}

function clickedMouse(cx, cy) {
	for (var i = 1; i < CIRCLES_X.length; i++) {
		if (intersects(CIRCLES_X[i], CIRCLES_Y[i], cx, cy, 30)) {
			location.href = "wikiSearch.php?s=" + ARTICLE_TITLES[i];
			
			OFFSET_X = 0;
			OFFSET_Y = 0;
		}
	}
}

function mouseMove(cx, cy) {
	var oldHover = HOVER;
	var currentlyHover = false;
	for (var i = 1; i < CIRCLES_X.length; i++) {
		if (intersects(CIRCLES_X[i], CIRCLES_Y[i], cx, cy, 30)) {
			currentlyHover = true;
			LAST_HOVER = i;
			if (!HOVER) {
				drawOutline(CIRCLES_X[i] + OFFSET_X, CIRCLES_Y[i] + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, '#000000', 1);
				getArticlePage(ARTICLE_TITLES[i], URL_CACHE, PREVIEW_CACHE, ARTICLE_TITLES, i);
				HOVER = true;
			}
		}
	}
	if (!currentlyHover && HOVER) {
		HOVER = false;
		getArticlePage(ARTICLE_TITLES[0], URL_CACHE, PREVIEW_CACHE, ARTICLE_TITLES, 0);
		drawOutline(CIRCLES_X[LAST_HOVER] + OFFSET_X, CIRCLES_Y[LAST_HOVER] + OFFSET_Y, NODE_HEIGHT, NODE_WIDTH, '#AAAAAA' , 3);
	}
}

function intersects(x, y, cx, cy, r) {
    dx = x-cx;
    dy = y-cy;
    return dx*dx+dy*dy <= r*r;
}

function initEvents() {
	CANVAS.addEventListener("mousedown", 
						function(e) { 
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
						}, false);
	CANVAS.addEventListener("mouseup", 
						function(e) { 
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
						}, false);
	CANVAS.addEventListener("mouseout", 
						function(e) { 
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
						}, false);
	CANVAS.addEventListener("mousemove", 
						function(e) { 
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
								mouseMove(x - OFFSET_X, y - OFFSET_Y);
							}
						}, false);
}


function mapInit() {
	MAP_HEIGHT = Math.max(600, $(window).height()*.8);
	MAP_WIDTH = Math.max(800, $(window).width()*.65);
	$("#mainSide").css("width", ($(window).width() - 400) + "px");
	$("#mapView").attr("height", MAP_HEIGHT);
	$("#mapView").attr("width", MAP_WIDTH);
	$(window).resize(function() {
		MAP_HEIGHT = Math.max(600, $(window).height()*.8);
		MAP_WIDTH = Math.max(800, $(window).width()*.65);
		$("#mainSide").css("width", ($(window).width() - 400) + "px");
		$("#mapView").attr("height", MAP_HEIGHT);
		$("#mapView").attr("width", MAP_WIDTH);
		redrawMap();
	});
	COUNT = 0;
	CANVAS = document.getElementById('mapView');
	CTX = CANVAS.getContext('2d');
	

}


