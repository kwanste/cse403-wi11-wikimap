import java.io.*;
import java.util.*;

class WikiParser {

	private static final String WIKI_FILE_NAME = "enwiki-short.xml";	
	private static final int NUM_OF_PAGES_TO_BATCH = 100;
	private static final int PREVIEW_TEXT_CAP = 300;

	public static void main(String[] args) {
	
		File wikiFile = new File(WIKI_FILE_NAME);
		Scanner scanner;
		
		try{
			scanner = new Scanner(wikiFile);
		} catch(FileNotFoundException e){
			System.out.println("File: "+ WIKI_FILE_NAME + " not found");
			return;
		}

		int numberOfPages = 0;

		String articleName;
		int id;
		String articleText = "";
		String normalizedText = "";

		boolean inText = false;
		boolean firstId = true;

		while(scanner.hasNext()){
			String currentLine = scanner.nextLine().trim();
			if(currentLine.matches("</page.*>")){
				//calculate relevancy
				//calculateRelevancy(articleText);
				//normalizeText(articleText);  

				numberOfPages++;
				if(numberOfPages == NUM_OF_PAGES_TO_BATCH){
					//write to database
					numberOfPages = 0;
				}
				firstId = true;
				articleName = "";
				
			}
			if(currentLine.matches("<title.*>")){ //title
				articleName = currentLine.substring(7, currentLine.length() - 8);
				System.out.println(articleName);
			}
			else if(firstId && currentLine.matches("<id>.*")){ //id
				//String id1 = currentLine.substring(4, currentLine.length() - 5);
				id = Integer.parseInt(currentLine.substring(4, currentLine.length() - 5));
				System.out.println(id);
				firstId = false;

			}
			else if(currentLine.matches("<text.*>.*</text>")){ // text is only one line
				articleText = currentLine;
				articleText = articleText.replaceAll("</text>","");
				articleText = articleText.replaceAll("<text.*>","");
				System.out.println(articleText);
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
					System.out.println(articleText);
				}
			}
			else{
				inText = false;
			}
		}
    }
	
	//Steven TODO
	public static String normalizeText(String text){
		return "";
	}
}
