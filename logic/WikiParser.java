package logic;

import java.io.*;
import java.util.*;

import communication.DatabaseUpdater;

class WikiParser {

    //	private static final String WIKI_FILE_NAME = "enwiki-short.xml";	
//	private static final int NUM_OF_PAGES_TO_BATCH = 100;
	private static final int PREVIEW_TEXT_CAP = 1500;

	public static void main(String[] args) {
	
	    if(args.length != 1) {
		System.out.println("Please add a wiki xml file to use");
		return;
	    }
		File wikiFile = new File(args[0]);
		Scanner scanner;
		
		try{
			scanner = new Scanner(wikiFile);
		} catch(FileNotFoundException e){
			System.out.println("File: "+ args[0] + " not found");
			return;
		}
		
		Map<String, ArticleVector> vectorMap = new HashMap<String, ArticleVector>();

		//int numberOfPages = 0;

		String articleName = "";
		int id;
		String articleText = "";
		String previewText = "";
		String imageUrl = "";

		boolean inText = false;
		boolean firstId = true;
		

		while(scanner.hasNextLine()){
			String currentLine = scanner.nextLine().trim();
			if(currentLine.matches("</page.*>")){
				//calculate relevancy
				//calculateRelevancy(articleText);
			    if(articleText.contains("#REDIRECT")){
				articleText = "";
			    }
			    //previewText = getPreviewText(articleText).replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
			    previewText = getPreviewText(articleText).replaceAll("[^\\p{Alnum}\\s]","").substring(0, Math.min(PREVIEW_TEXT_CAP, previewText.length()));
			    imageUrl = getImageUrl(articleText);

				/*
				numberOfPages++;
				if(numberOfPages == NUM_OF_PAGES_TO_BATCH){
					//write to database
					numberOfPages = 0;
				}*/
				
				// Send to Database
			    ArticleVector vector = calculateRelationships(articleName, articleText);
			    vectorMap.put(articleName, vector);
			    
			    DatabaseUpdater.updatePreviewText(articleName, previewText, vector.redirect);
			    DatabaseUpdater.updateImageURL(articleName, imageUrl);
			    
				System.out.println(articleName);
				System.out.println(previewText);
				//System.out.println(imageUrl);
				
				firstId = true;
				articleName = "";
				articleText = "";
				previewText = "";
				imageUrl = "";
			}
			if(currentLine.matches("<title.*>")){ //title
			    articleName = currentLine.substring(7, currentLine.length() - 8).toLowerCase().replaceAll("[^\\p{Alnum}\\p{Punct}\\s]", "");
				//System.out.println(articleName);
			}
			else if(firstId && currentLine.matches("<id>.*")){ //id
				//String id1 = currentLine.substring(4, currentLine.length() - 5);
			    try {
				id = Integer.parseInt(currentLine.substring(4, currentLine.length() - 5));
				//System.out.println(id);
				firstId = false;
			    } catch (Exception ex) {
				System.out.println(ex.getMessage());
			    }
			}
			else if(currentLine.matches("<text.*>.*</text>")){ // text is only one line
				articleText = currentLine;
				articleText = articleText.replaceAll("</text>","");
				articleText = articleText.replaceAll("<text.*>","");
				//articleText = articleText.replaceAll("[^\\t{Punct}\\p{Alnum}\\s]", "");
				//System.out.println(articleText);
			}
			else if(currentLine.matches("<text.*>.*")){ //text is multiple lines
				inText = true;
				articleText = currentLine.replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
			}
			else if(inText){
			    articleText += currentLine.replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
				if(currentLine.matches(".*</text>")){
					articleText = articleText.replaceAll("</text>","");
					articleText = articleText.replaceAll("<text.*>","");
					//articleText = articleText.replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
					inText = false;
					//System.out.println(articleText);
				}
			}
			else{
				inText = false;
			}
		}
		
		calculateRelevancy(vectorMap);
    }
		
	public static ArticleVector calculateRelationships(String name, String text){
		ArticleVector vector = new ArticleVector();
		vector.articleName = name;
		LinkedList<String> list = new LinkedList<String>();
		vector.links = list;
		
		vector.redirect = text.contains("#REDIRECT");
		
		String[] split = text.split("]]");
		for(int i = 0; i < split.length; i++){
			int n = split[i].lastIndexOf("[[");
			if(n == -1){
				split[i] = null;
			}
			else{
				split[i] = split[i].substring(n + 2);
				if(split[i].contains("|")){
					int o = split[i].lastIndexOf("|");
					split[i] = split[i].substring(o + 1);
				}
			}
			if(split.length > 1 && split[1] != null){
				list.add(split[i]);
				//System.out.println(split[i]);
			}
		}
		return vector;
	}
	
	public static void calculateRelevancy(Map<String, ArticleVector> vector){	
		RelationshipBuilder.build(vector);
	}
	
	public static String getPreviewText(String text){
		int splitMark = text.indexOf("==");
		
		String previewText = "";
		if (splitMark > 0) {
			if (splitMark > 1499) {
				previewText = text.substring(0, 1499);
			} else {
				previewText = text.substring(0, splitMark);
			}
		} else {
			previewText = text;
		}
		return previewText;
	}
	
	public static String getImageUrl(String text){
		String imageUrl = "";
		int beginMark = text.indexOf("[[Image:");
		
		if (beginMark > 0) {
			int endMark = text.indexOf("|", beginMark);
			imageUrl = text.substring(beginMark + 8, endMark);
		}
		
		return imageUrl;
	}
}
