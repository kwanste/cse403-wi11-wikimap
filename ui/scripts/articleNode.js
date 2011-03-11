// articleNode.js
//
// This file contains the class for a node of the tree displayed.

// This is a class to hold information for each node in the map. the variables inputed are trivial.
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

// This function just sets a new x, y coordinate for the Node
function setXY(x, y) {
	this.x = x;
	this.y = y;
}