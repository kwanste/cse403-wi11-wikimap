var MAP_HEIGHT = 600;
var MAP_WIDTH = 800;
var ROOT_SIZE = 50;
var NODE_SIZE = 30;
var INITIAL_RADIUS = 100;

function drawCircle(ctx, x, y, r) {
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

function drawMapHelper(string, pipe, radius, startAngle, angleSize){
	if(radius >= MAP_WIDTH / 2 || radius >= MAP_HEIGHT / 2){
		// out of ctx range
	}else if(pipe == ""){
		var angle = startAngle + angleSize / 2;
		drawCircle(ctx, MAP_WIDTH / 2 + Math.cos(angle), MAP_HEIGHT / 2 + Math.sin(angle), NODE_SIZE);
	}else{
		var items = string.split(pipe);
		for(var i = 0; i < items.length; i++){
			drawMapHelper(items[i], pipe.substring(1), radius * items.length, startAngle + angleSize / (items.length), angleSize / (items.length));
		}
	}
}

// FORMAT
// 	PARENT//Child1|Child2|Child3//Child1a|Child1b||Child2a|Child2b||Child3a|Child3b//
function drawMap(treeString){
	var depthSplit = treeString.split("//");
	var depths = depthSplit.length;
	var levelPipes = "";

	// draw parent
	drawCircle(ctx, MAP_WIDTH / 2, MAP_HEIGHT / 2, ROOT_SIZE);

	for (var i = 1; i < depths; i++){
		levelPipes.concat("|");
		drawMapHelper(depthSplit[i], levelPipes, INITIAL_RADIUS, 0, 2 * Math.PI);
	}
}

function drawShape(){
	// get the canvas element using the DOM
	var canvas = document.getElementById('mapView');
	// Make sure we don't execute when canvas isn't supported
	if (canvas.getContext){

		// use getContext to use the canvas for drawing
		var ctx = canvas.getContext('2d');

		// Draw shapes
		drawCircle(ctx, 400, 300, 50);
		drawCircle(ctx, 300, 200, 30);
		drawCircle(ctx, 500, 200, 30);
		drawCircle(ctx, 500, 400, 30);
		drawCircle(ctx, 300, 400, 30);

		drawCircle(ctx, 400 + 141.42, 300, 30);
		drawCircle(ctx, 400 - 141.42, 300, 30);
		drawCircle(ctx, 400, 300 + 141.42, 30);
		drawCircle(ctx, 400, 300 - 141.42, 30);

		drawLine(ctx, 400 + 50, 300, 541.42 - 30, 300);
		drawLine(ctx, 400 - 50, 300, 400 - 141.42 + 30, 300);
		drawLine(ctx, 400, 300 - 50, 400, 300 - 141.42 + 30);
		drawLine(ctx, 400, 300 + 50, 400, 300 + 141.42 - 30);
		
		writeText(ctx, searchString, 400 - 30, 300 - 7.5);


	} else {
		alert('You need Safari or Firefox 1.5+ to see this demo.');
	}
}
