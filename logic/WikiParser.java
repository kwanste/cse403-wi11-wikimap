package logic;

import java.io.*;
import java.util.*;

import communication.DatabaseUpdater;

class WikiParser {

    //private static final String WIKI_FILE_NAME = "enwiki-short.xml";
    //private static final int NUM_OF_PAGES_TO_BATCH = 100;
    private static final int PREVIEW_TEXT_CAP = 1500;
    private static final String LOG_FILE = "parser_log.log";
    private static final int NUM_OF_LINES = 40000000;
    private static final String OUTPUT_FILE = "batchInsert.sql";

    public static void main(String[] args) {
	long start = System.currentTimeMillis();
	if(args.length != 1) {
	    System.out.println("Please add a wiki xml file to use");
	    return;
	}
	File wikiFile = new File(args[0]);
	Scanner scanner;

	FileWriter sqlStream;
	BufferedWriter sqlOut;

	try{
	    // Create file 
	    sqlStream = new FileWriter(OUTPUT_FILE);
	    sqlOut = new BufferedWriter(sqlStream);
	    sqlOut.write("INSERT INTO 'ArticleRelations' VALUES ");
	}catch (Exception e){//Catch exception if any
	    System.err.println("Error: " + e.getMessage());
	    return;
	}
	
	try{
	    scanner = new Scanner(new FileInputStream(args[0]));
	} catch(FileNotFoundException e){
	    System.out.println("File: "+ args[0] + " not found");
	    return;
	}
	File logFileRead = new File(LOG_FILE);
	Scanner logFileScanner;
	try{
	    logFileScanner = new Scanner(logFileRead);
	} catch(FileNotFoundException e) {
	    System.out.println("File: " + LOG_FILE + " not found:");
	    return;
	}

	int row = 0;
	while(logFileScanner.hasNext()){
	    row = logFileScanner.nextInt();
	}
	logFileScanner.close();
	
	
	int thousandCount = 0;
	int count = 1000;
	//Map<String, ArticleVector> vectorMap = new HashMap<String, ArticleVector>();

	//int numberOfPages = 0;

	String articleName = "";
	int id;
	String articleText = "";
	String previewText = "";
	String imageUrl = "";
	String articleVector = "";
	boolean inText = false;
	boolean firstId = true;
	boolean redirect = false;
	    
	boolean canWrite = false;
	if (row == 0) canWrite = true;
	int currentRow = 0;
	int rowsDone = 0;
	while(scanner.hasNextLine() && currentRow <= Math.max(row - 1000, 0)){
	    scanner.nextLine();
	    currentRow++;
	    if(currentRow % 1000000 == 0){
		System.out.println("" + currentRow);
	    }
	}
	System.out.println(row);
	System.out.println("Before Enter Loop");

	while(scanner.hasNextLine()){
	    rowsDone++;
	    currentRow++;
	    String currentLine = scanner.nextLine().trim();
	    //System.out.println(currentLine);
	    
	    if(currentLine.matches("</page.*>")){
		//calculate relevancy
		//calculateRelevancy(articleText);
		if(articleText.contains("#REDIRECT")){
		    redirect = true;
		}
		else{
		    previewText = getPreviewText(articleText).replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
		    previewText = makeStringMySQLSafe(previewText); 
		}
		//previewText = getPreviewText(articleText).replaceAll("[^\\p{Alnum}\\s]","");
		/*
		      if(previewText.length() > 0){
		      previewText = previewText.substring(0, Math.min(1500, previewText.length()));
		          }
		*/
		imageUrl = makeStringMySQLSafe(getImageUrl(articleText));
		articleName = makeStringMySQLSafe(articleName);
		articleVector = makeStringMySQLSafe(calculateRelationships(articleText));
		/*
		  numberOfPages++;
		  if(numberOfPages == NUM_OF_PAGES_TO_BATCH){
		  //write to database
		  numberOfPages = 0;
		  }*/
		
		// Send to Database
		//ArticleVector vector = calculateRelationships(articleName, articleText);
		//vectorMap.put(articleName, vector);
		//System.out.println("Adding " + articleName);
		    
		if(canWrite){
		    //System.out.println("starting to write");
		    //DatabaseUpdater.updatePreviewText(articleName, previewText, redirect);
		    //DatabaseUpdater.updateImageURL(articleName, imageUrl);
		    //DatabaseUpdater.updateVector(articleName, articleVector, redirect);
		    insertRelevancy(articleName, articleVector, redirect, sqlOut);
		    //System.out.println("finishedWriting");
		}
		    
		// System.out.println(articleName);
		//System.out.println(previewText);
		//System.out.println("" + redirect);
		count--;
		if(count < 1){
		    count = 1000;
		    thousandCount++;
		    System.out.println("" + (thousandCount * 1000));
		    long elapsedTimeMillis = System.currentTimeMillis()-start;
		    float elapsedTimeSec = elapsedTimeMillis/1000F;
		    System.out.println(elapsedTimeSec);
		    try {      
			BufferedWriter logFileWrite = new BufferedWriter(new FileWriter(LOG_FILE, true));
			logFileWrite.newLine();
			logFileWrite.write("" + currentRow);
			logFileWrite.flush();
			logFileWrite.close();
		    } catch (IOException e) {
			System.out.println("couldn't write to log file");
		    } 
		}
		    
		firstId = true;
		articleName = "";
		articleText = "";
		previewText = "";
		imageUrl = "";
		articleVector = "";
		redirect = false;
		canWrite = true;
		if(rowsDone > NUM_OF_LINES){
		    System.out.println("breaking");
		    return;
		}
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
		//articleText = currentLine.replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
	    }
	    else if(inText){
		articleText += currentLine;//.replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
		if(currentLine.matches(".*</text>")){
		    articleText = articleText.replaceAll("</text>","");
		    articleText = articleText.replaceAll("<text.*>{1}","");
		    //articleText = articleText.replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
		    inText = false;
		    //System.out.println(articleText);
		}
	    }
	    else{
		inText = false;
	    }
	}
	//System.out.println(scanner.hasNextLine());
	//System.out.println("finished");
	//long finish = System.currentTimeMillis();
	//System.out.println("" + (finish - start));
	//calculateRelevancy(vectorMap);
	
	try{
	    sqlOut.write(";");
	    sqlOut.close();
	}catch(Exception e){
	    System.out.println("Unable to close file");
	}
    }
    
    private static String calculateRelationships(String text){
	/*
	      ArticleVector vector = new ArticleVector();
	      vector.articleName = name;
	      LinkedList<String> list = new LinkedList<String>();
	      vector.links = list;
	      
	      vector.redirect = text.contains("#REDIRECT");
	*/

	String vectors = "";
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
	    if(split.length > 1 && split[i] != null && !split[i].contains(":")){
		vectors += split[i] + '\n';
		//list.add(split[i]);
		//System.out.println(split[i]);
	    }
	}
	return vectors;
    }
    
    private static void calculateRelevancy(Map<String, ArticleVector> vector){
	RelationshipBuilder.build(vector);
    }
    
    private static String getPreviewText(String text){
	int splitMark = text.indexOf("==");
	
	String previewText = "";
	if (splitMark > 0) {
	    previewText = text.substring(0, Math.min(1500, text.length()));
	} else {
	    previewText = text.substring(0, Math.min(1500, text.length()));
	}

	//System.out.println(previewText + '\n');
	//previewText = previewText.replaceAll("\\{\\{[^\\}]*\\}\\}", "");//remove
	//previewText = previewText.replaceAll("<--.*-->", "");//remove html comments
	//previewText = previewText.replaceAll("\\[\\[([^\\])]*\\]\\]", "(a)");
	//System.out.println(previewText);
	return previewText;
    }
    
    private static String getImageUrl(String text){
	String imageUrl = "";
	int beginMark = text.indexOf("[[Image:");
	
	if (beginMark > 0) {
	    int endMark = text.indexOf("|", beginMark);
	    if(endMark > 0){
		imageUrl = text.substring(beginMark + 8, endMark);
	    }
	}
	
	return imageUrl;
    }
    
    private static void insertRelevancy(String article, String relations, boolean redirect, BufferedWriter sqlOut){
	String[] group = relations.split("\n");
	Map<String, Integer> relationMap = new HashMap<String, Integer>();
	
	try{
	for(int i = 0; i < group.length; i++){
            if(i > 20){
                break;
            }
            if(redirect){
                relationMap.put(group[i], -1);
		sqlOut.write("('" + article + "', '" + group[i] + "', " + -1 + "), ");
		sqlOut.newLine();
		
            }
            else if(group[i].length() > 0){
		//System.out.println("Article: " + group[i]);
		sqlOut.write("('" + article + "', '" + group[i] + "', " + ((i % 5) + 1) + "), ");
                sqlOut.newLine();

                relationMap.put(group[i], (i % 5) + 1);
            }
        }
	}
	catch(Exception e){
	    System.out.println("Write failed");
	}
	/*
        try {
            //DatabaseUpdater.updateRelevantNodes(article, relationMap);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
	*/
    }

    private static String makeStringMySQLSafe(String text){
	return text.replace("\\", "\\\\").replace("'", "\\'").replace("\"","\\\"").replace("%", "\\%").replace("_", "\\_");
    }
}
