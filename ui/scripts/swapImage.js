/* This JavaScript file handles the swapping the "View Full Article" and "View Full Map" images
*  in the WikiMap sidebar.  It is modified from a script found at DevX (http://www.devx.com/tips/Tip/13653)
*  to ensure FireFox compatibility.
*/

var intImage = 2;

function swapImage(IMG1) {
	if(FOUND_ARTICLE) {
		switch (intImage) {
		 case 1:
		   IMG1.src = "images/view_full_article.jpg";
		   intImage = 2;
		   return(false);
		case 2:
		   IMG1.src = "images/view_full_map.jpg";
		   intImage = 1;
		   return(false);
		default: 
			return(false);
		 }
	}
}