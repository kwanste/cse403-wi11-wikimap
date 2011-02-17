var MAP_HEIGHT = 600;
var MAP_WIDTH = 800;
var ROOT_SIZE = 50;
var NODE_SIZE = 30;
var INITIAL_RADIUS = 20;
var circlesX = [];
var circlesY = [];
var circlesTitle = [];
var PREVIEW_CACHE = [];
var URL_CACHE = [];
var LINES_START_X = [];
var LINES_START_Y = [];
var LINES_END_X = []; 
var LINES_END_Y = []; 
var canvas;
var count;
var MOUSE_DOWN = false;
var MOUSE_MOVE = false;
var MOUSE_X;
var MOUSE_Y;
var OFFSET_X = 0;
var OFFSET_Y = 0;
var CURRENT_ARTICLE = "";
var HOVER = false;

function drawCircle(ctx, x, y, r, title) {
	ctx.beginPath();
	ctx.strokeStyle = '#AAAAAA';
	ctx.fillStyle = '#CDCECE';
	ctx.arc(x, y, r,0,Math.PI*2,true); // Outer circle
	ctx.stroke();
	ctx.fill();
}

function drawLine(ctx, xStart, yStart, xEnd, yEnd){
	//context.strokeStyle = '#CDCECE';
	ctx.beginPath();
	ctx.strokeStyle = '#BFB7B7';
	ctx.moveTo(xStart, yStart);
	ctx.lineTo(xEnd, yEnd);
	ctx.stroke();
}

function writeText(ctx, text, x, y){
	ctx.fillStyle    = '#000';
	ctx.font         = '15px sans-serif';
	ctx.textBaseline = 'top';
	ctx.fillText  (text, x, y);
}

function drawMapHelper(ctx, string, pipe, radius, startAngle, angleSize, parentLoc){
	if(radius >= Math.sqrt(MAP_WIDTH * MAP_WIDTH / 4 + MAP_HEIGHT * MAP_HEIGHT / 4)){
		console.log("out of range");
		return '';
	}else if(pipe == ''){
		var angle = startAngle + angleSize / 2;
		var px = parseFloat(parentLoc.split(',')[0]);
		var py = parseFloat(parentLoc.split(',')[1]);
		var x = MAP_WIDTH / 2 + radius * Math.cos(angle);
		var y = MAP_HEIGHT / 2 + radius * Math.sin(angle);
		//drawLine(ctx, px, py, x, y);
		LINES_START_X[count] = px;
		LINES_START_Y[count] = py;
		LINES_END_X[count] = x; 
		LINES_END_Y[count] = y; 
		PREVIEW_CACHE[count] = "";
		URL_CACHE[count] = "";
		
		circlesX[count] = x;
		circlesY[count] = y;
		circlesTitle[count] = string;
		count++;
		//drawCircle(ctx, x, y, NODE_SIZE, string);
		//writeText(ctx, string, x - 22, y - 10); 
		return x + "," + y;
	}else{
		var items = string.split(pipe);
		var parentLocs = parentLoc.split(pipe);
		var retval = '';
		for(var i = 0; i < items.length; i++){
			if(i != 0){
				retval += pipe + '|';
			}
			retval += drawMapHelper(ctx, 
									items[i], 
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
// 	PARENT//Child1|Child2|Child3//Child1a|Child1b||Child2a|Child2b||Child3a|Child3b//
function drawMap(treeString){
	canvas = document.getElementById('mapView');
	
	// Make sure we don't execute when canvas isn't supported
	if (canvas.getContext){
		console.log("start");
		circlesX = [];
		circlesY = [];
		circlesTitle = [];
		count = 0;

		// use getContext to use the canvas for drawing
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.beginPath();
		var depthSplit = treeString.split("//");
		var depths = depthSplit.length;
		var levelPipes = "";

		// draw parent
		CURRENT_ARTICLE = depthSplit[0];
		circlesX[count] = MAP_WIDTH / 2;
		circlesY[count] = MAP_HEIGHT / 2;
		circlesTitle[count] = CURRENT_ARTICLE;
		count++;
		drawCircle(ctx, MAP_WIDTH / 2, MAP_HEIGHT / 2, ROOT_SIZE);
		writeText(ctx, CURRENT_ARTICLE, MAP_WIDTH / 2 - 30, MAP_HEIGHT / 2 - 10);

		var parentStr = (MAP_WIDTH / 2) + "," + (MAP_HEIGHT / 2);
		for (var i = 1; i < depths; i++){
			levelPipes = levelPipes.concat("|");
			parentStr = drawMapHelper(ctx, depthSplit[i], levelPipes, INITIAL_RADIUS, 0, 2 * Math.PI, parentStr);
		}
		redrawMap();
	} else {
		alert('You need Safari or Firefox 1.5+ or Google Chrome to see this Map.');
	}
}

function redrawMap() {
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.beginPath();
	for (var i = 1; i < circlesX.length; i++) {
		drawLine(ctx, LINES_START_X[i] + OFFSET_X, LINES_START_Y[i] + OFFSET_Y, LINES_END_X[i] + OFFSET_X, LINES_END_Y[i] + OFFSET_Y);
	}
	drawCircle(ctx, MAP_WIDTH / 2 + OFFSET_X, MAP_HEIGHT / 2 + OFFSET_Y, ROOT_SIZE);
	writeText(ctx, CURRENT_ARTICLE, MAP_WIDTH / 2 - 30 + OFFSET_X, MAP_HEIGHT / 2 - 10 + OFFSET_Y);

	for (var i = 1; i < circlesX.length; i++) {
		drawCircle(ctx, circlesX[i] + OFFSET_X, circlesY[i] + OFFSET_Y, NODE_SIZE);
		writeText(ctx, circlesTitle[i], circlesX[i] + OFFSET_X - 22, circlesY[i] + OFFSET_Y - 10);
	}
	
}

function clickedMouse(cx, cy) {
	for (var i = 1; i < circlesX.length; i++) {
		if (intersects(circlesX[i], circlesY[i], cx, cy, 30)) {
			location.href = "wikiSearch.php?s=" + circlesTitle[i];
			/*
			console.log(circlesTitle[i]);
			getPreviewText(circlesTitle[i]);
			getImageURL(circlesTitle[i]);
			getArticlePage(circlesTitle[i]);
			getRelevancyTree(circlesTitle[i]);
			*/
			OFFSET_X = 0;
			OFFSET_Y = 0;
		}
	}
}

function mouseMove(cx, cy) {
	var oldHover = HOVER;
	var currentlyHover = false;
	for (var i = 1; i < circlesX.length; i++) {
		if (intersects(circlesX[i], circlesY[i], cx, cy, 30)) {
			currentlyHover = true;
			if (!HOVER) {
				//console.log(circlesTitle[i]);
				getPreviewText(circlesTitle[i], PREVIEW_CACHE, i);
				getImageURL(circlesTitle[i], URL_CACHE, i);
				HOVER = true;
			}
		}
	}
	if (!currentlyHover && HOVER) {
		HOVER = false;
		//console.log(CURRENT_ARTICLE);
		getPreviewText(CURRENT_ARTICLE, PREVIEW_CACHE, 0);
		getImageURL(CURRENT_ARTICLE, URL_CACHE, 0);
			
	}
}

function intersects(x, y, cx, cy, r) {
    dx = x-cx
    dy = y-cy
    return dx*dx+dy*dy <= r*r
}


function mapInit() {
	count = 0;
	canvas = document.getElementById('mapView');
	
	canvas.addEventListener("mousedown", 
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
							x -= canvas.offsetLeft;
							y -= canvas.offsetTop;
							MOUSE_X = x;
							MOUSE_Y = y;
						}, false);
	canvas.addEventListener("mouseup", 
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
							x -= canvas.offsetLeft;
							y -= canvas.offsetTop;
							if (!MOUSE_MOVE) {
								clickedMouse(x - OFFSET_X, y - OFFSET_Y);
							}
						}, false);
	canvas.addEventListener("mouseout", 
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
							x -= canvas.offsetLeft;
							y -= canvas.offsetTop;
							if (!MOUSE_MOVE) {
								clickedMouse(x - OFFSET_X, y - OFFSET_Y);
							}
						}, false);
	canvas.addEventListener("mousemove", 
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
							x -= canvas.offsetLeft;
							y -= canvas.offsetTop;
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

