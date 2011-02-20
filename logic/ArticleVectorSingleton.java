package logic;

class ArticleVectorSingleton{
    private static ArticleVector vector;

    private static void constructor(){
	vector = new ArticleVector();
    }

    public static ArticleVector getArticleVector(){
	if(vector == null){
	    constructor();
	}
	return vector;
    }
}