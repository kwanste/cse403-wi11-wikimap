package wikimap.logic;

import java.io.*;
import java.util.*;

import communication.DatabaseUpdater;

class WikiParser {

	private static final String WIKI_FILE_NAME = "enwiki-short.xml";	
//	private static final int NUM_OF_PAGES_TO_BATCH = 100;
//	private static final int PREVIEW_TEXT_CAP = 300;

	public static void main(String[] args) {
	
		File wikiFile = new File(WIKI_FILE_NAME);
		Scanner scanner;
		
		try{
			scanner = new Scanner(wikiFile);
		} catch(FileNotFoundException e){
			System.out.println("File: "+ WIKI_FILE_NAME + " not found");
			return;
		}

		//int numberOfPages = 0;

		String articleName = "";
		int id;
		String articleText = "";
		String previewText = "";
		String imageUrl = "";

		boolean inText = false;
		boolean firstId = true;

		while(scanner.hasNext()){
			String currentLine = scanner.nextLine().trim();
			if(currentLine.matches("</page.*>")){
				//calculate relevancy
				//calculateRelevancy(articleText);
				previewText = getPreviewText(articleText);
				imageUrl = getImageUrl(articleText);

				/*
				numberOfPages++;
				if(numberOfPages == NUM_OF_PAGES_TO_BATCH){
					//write to database
					numberOfPages = 0;
				}*/
				
				// Send to Database
				DatabaseUpdater.updatePreviewText(articleName, previewText);
				DatabaseUpdater.updateImageURL(articleName, imageUrl);
				
				System.out.println(articleName);
				System.out.println(previewText);
				System.out.println(imageUrl);
				
				firstId = true;
				articleName = "";
				articleText = "";
				previewText = "";
				imageUrl = "";
			}
			if(currentLine.matches("<title.*>")){ //title
				articleName = currentLine.substring(7, currentLine.length() - 8);
				//System.out.println(articleName);
			}
			else if(firstId && currentLine.matches("<id>.*")){ //id
				//String id1 = currentLine.substring(4, currentLine.length() - 5);
				id = Integer.parseInt(currentLine.substring(4, currentLine.length() - 5));
				//System.out.println(id);
				firstId = false;

			}
			else if(currentLine.matches("<text.*>.*</text>")){ // text is only one line
				articleText = currentLine;
				articleText = articleText.replaceAll("</text>","");
				articleText = articleText.replaceAll("<text.*>","");
				//System.out.println(articleText);
			}
			else if(currentLine.matches("<text.*>.*")){ //text is multiple lines
				inText = true;
				articleText = currentLine;
			}
			else if(inText){
				articleText += currentLine;
				if(currentLine.matches(".*</text>")){
					articleText = articleText.replaceAll("</text>","");
					articleText = articleText.replaceAll("<text.*>","");
					inText = false;
					//System.out.println(articleText);
				}
			}
			else{
				inText = false;
			}
		}
		
		calculateRelevancy();
    	}
	
	public static void calculateRelevancy(){
		List<String> BillGates = new LinkedList<String>();
		BillGates.add("Microsoft");
		BillGates.add("Paul Allen");
		BillGates.add("Seattle");
		BillGates.add("Bill and Melinda Gates Foundation");
		List<String> PaulAllen = new LinkedList<String>();
		PaulAllen.add("Bill Gates");
		PaulAllen.add("Microsoft");
		PaulAllen.add("Seattle Seahawks");
		PaulAllen.add("Vulcan Inc.");
		List<String> Microsoft = new LinkedList<String>();
		Microsoft.add("Windows");
		Microsoft.add("Paul Allen");
		Microsoft.add("Zune");
		Microsoft.add("Bill Gates");
		
		ArticleVector vector1 = new ArticleVector();
		ArticleVector vector2 = new ArticleVector();
		ArticleVector vector3 = new ArticleVector();
		
		vector1.articleName = "Bill Gates";
		vector1.relatedArticles = BillGates;
		vector2.articleName = "Paul Allen";
		vector2.relatedArticles = PaulAllen;
		vector3.articleName = "Microsoft";
		vector3.relatedArticles = Microsoft;
		
		Map<String, ArticleVector> vector = new HashMap<String, ArticleVector>();
		vector.put("Bill Gates", vector1);
		vector.put("Paul Allen", vector2);
		vector.put("Microsoft", vector3);
		
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