var intImage = 2;

function swapImage(IMG1) {
switch (intImage) {
 case 1:
   IMG1.src = "images/view_full_article.png";
   intImage = 2;
   return(false);
case 2:
   IMG1.src = "images/view_full_map.png";
   intImage = 1;
   return(false);
default: 
	return(false);
 }
}