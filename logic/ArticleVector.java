package logic;

import java.util.*;

public class ArticleVector {
    // articleName must be unique
    private String articleName;
    // Put relevant data here
    private List<String> links;
    private boolean redirect;

    /*
     * Constructor
     */
    public ArticleVector(){
	articleName = null;
	links = null;
	redirect = false;
    }

    /*
     * returns article name
     */
    public String getArticleName(){
	return articleName;
    }

    /*
     * returns the links
     */
    public List<String> getLinks(){
	return links;
    }
    
    /*
     * returns if is a redirect
     */
    public boolean getRedirect(){
	return redirect;
    }

    /*
     * Sets article name
     */
    public void setArticleName(String name){
	articleName = name;
    }

    /*
     * sets article links
     */
    public void setLinks(List<String> list){
	links = list;
    }

    /*
     * sets if redirect
     */
    public void setRedirect(boolean redirect){
	this.redirect = redirect;
    }
}
