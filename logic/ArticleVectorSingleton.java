package logic;

class ArticleVectorSingleton{
    private static ArticleVector vector;

    /*
     * Creates the new article vector
     */
    private static void constructor(){
	vector = new ArticleVector();
    }

    /*
     * Returns- ArticleVector
     */
    public static ArticleVector getArticleVector(){
	if(vector == null){
	    constructor();
	}
	return vector;
    }
}