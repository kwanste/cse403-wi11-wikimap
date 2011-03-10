// articleNode.js
//
// This file contains the class for a node of the tree displayed.


function Node(x, y, px, py, title, depth, previewCache, urlCache) {
	this.x = x;
	this.y = y;
        this.title = title;
	this.lineEndX = px;
	this.lineEndY = py;
	this.previewCache = previewCache;
	this.urlCache = urlCache;
	this.setXY = setXY;
	this.depth = depth;
}

function setXY(x, y) {
	this.x = x;
	this.y = y;
}