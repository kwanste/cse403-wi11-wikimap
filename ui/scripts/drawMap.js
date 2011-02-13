var MAP_HEIGHT = 600;
var MAP_WIDTH = 800;
var ROOT_SIZE = 50;
var NODE_SIZE = 30;
var INITIAL_RADIUS = 20;
var circlesX = [];
var circlesY = [];
var circlesTitle = [];
var canvas;
var count;
var CURRENT_ARTICLE = "";
var HOVER = false;

function drawCircle(ctx, x, y, r, title) {
	circlesX[count] = x;
	circlesY[count] = y;
	circlesTitle[count] = title;
	count++;
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

function drawMapHelper(ctx, string, pipe, radius, startAngle, angleSize){
	var x;
	var y;
	console.log("running on: " + string + ", with pipe: " + pipe);
	if(radius >= MAP_WIDTH / 2 || radius >= MAP_HEIGHT / 2){
		console.log("out of range");
		// out of ctx range
	}else if(pipe == ""){
		console.log("drawing base case");
		var angle = startAngle + angleSize / 2;
		x = MAP_WIDTH / 2 + radius * Math.cos(angle);
		y = MAP_HEIGHT / 2 + radius * Math.sin(angle);
		drawCircle(ctx, x, y, NODE_SIZE, string);
		writeText(ctx, string, x - 22, y - 10); 
	}else{
		var items = string.split(pipe);
		console.log("iterating helper method");
		for(var i = 0; i < items.length; i++){
			drawMapHelper(ctx, items[i], pipe.substring(1), radius * items.length, startAngle + i * angleSize / (items.length), angleSize / (items.length));
		}
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
		drawCircle(ctx, MAP_WIDTH / 2, MAP_HEIGHT / 2, ROOT_SIZE);
		writeText(ctx, CURRENT_ARTICLE, MAP_WIDTH / 2 - 30, MAP_HEIGHT / 2 - 10);

		for (var i = 1; i < depths; i++){
			levelPipes = levelPipes.concat("|");
			console.log("depth: " + i);
			drawMapHelper(ctx, depthSplit[i], levelPipes, INITIAL_RADIUS, 0, 2 * Math.PI);
		}
	} else {
		alert('You need Safari or Firefox 1.5+ or Google Chrome to see this Map.');
	}
}



function clickedMouse(cx, cy) {
	for (var i = 1; i < circlesX.length - 1; i++) {
		if (intersects(circlesX[i], circlesY[i], cx, cy, 30)) {
			//alert(circlesTitle[i]);
			console.log(circlesTitle[i]);
			getPreviewText(circlesTitle[i]);
			getImageURL(circlesTitle[i]);
			getArticlePage(circlesTitle[i]);
			getRelevancyTree(circlesTitle[i]);
		}
	}
}

function mouseMove(cx, cy) {
	var oldHover = HOVER;
	var currentlyHover = false;
	for (var i = 1; i < circlesX.length - 1; i++) {
		if (intersects(circlesX[i], circlesY[i], cx, cy, 30)) {
			currentlyHover = true;
			if (!HOVER) {
				console.log(circlesTitle[i]);
				getPreviewText(circlesTitle[i]);
				getImageURL(circlesTitle[i]);
				HOVER = true;
			}
		}
	}
	if (!currentlyHover && HOVER) {
		HOVER = false;
		console.log(CURRENT_ARTICLE);
		getPreviewText(CURRENT_ARTICLE);
		getImageURL(CURRENT_ARTICLE);
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
	canvas.addEventListener("click", 
						function(e) { 
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
							clickedMouse(x, y);
						}, false);
	canvas.addEventListener("mousemove", 
						function(e) { 
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
							mouseMove(x, y);
						}, false);
}

