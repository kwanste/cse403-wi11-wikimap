package logic;

import java.util.*;

public class ArticleVector {
    // articleName must be unique
    private String articleName;
    // Put relevant data here
    private List<String> links;
    private boolean redirect;
    
    public ArticleVector(){
	articleName = null;
	links = null;
	redirect = false;
    }

    public String getArticleName(){
	return articleName;
    }

    public List<String> getLinks(){
	return links;
    }

    public boolean getRedirect(){
	return redirect;
    }

    public void setArticleName(String name){
	articleName = name;
    }

    public void setLinks(List<String> list){
	links = list;
    }

    public void setRedirect(boolean redirect){
	this.redirect = redirect;
    }
}
