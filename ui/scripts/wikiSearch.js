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


	} else {
		alert('You need Safari or Firefox 1.5+ to see this demo.');
	}
}

drawShape();