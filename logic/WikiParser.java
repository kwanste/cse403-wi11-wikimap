package logic;

import java.io.*;
import java.util.*;

import communication.DatabaseUpdater;

class WikiParser {

    private static final int PREVIEW_TEXT_CAP = 1500;
    private static final String LOG_FILE = "parser_log.log";
    private static final int NUM_OF_LINES = 40000000;
    private static final String OUTPUT_FILE = "batchInsert.sql";
    private static final String COUNT_FILE = "batchCountInsert.sql";

    public static void main(String[] args) {
	long start = System.currentTimeMillis();
	if(args.length != 1) {
	    System.out.println("Please add a wiki xml file to use");
	    return;
	}
	File wikiFile = new File(args[0]);
	Scanner scanner;

	BufferedWriter sqlOutRelation = initializeFileWriter(OUTPUT_FILE);
	BufferedWriter sqlOutCount = initializeFileWriter(COUNT_FILE);

	try{
	    scanner = new Scanner(new FileInputStream(args[0]));
	} catch(FileNotFoundException e){
	    System.out.println("File: "+ args[0] + " not found");
	    return;
	}
	File logFileRead = new File(LOG_FILE);
	Scanner logFileScanner;
	int row = 0;
	try{
	    logFileScanner = new Scanner(logFileRead);
	    while(logFileScanner.hasNext()){
		row = logFileScanner.nextInt();
	    }
	    logFileScanner.close();

	} catch(FileNotFoundException e) {
	    System.out.println("File: " + LOG_FILE + " not found:");
	    //return;
	}
	// initialize variables;
	int thousandCount = 0;
	int count = 1000;
	
	String articleName = "";
	int id;
	String articleText = "";
	String previewText = "";
	String imageUrl = "";
	//ArticleVector articleVector = new ArticleVector();
	boolean inText = false;
	boolean firstId = true;
	boolean redirect = false;
	    
	boolean canWrite = false;
	if (row == 0) canWrite = true;
	int currentRow = 0;
	int rowsDone = 0;
	/*
	while(scanner.hasNextLine() && currentRow <= Math.max(row - 1000, 0)){
	    scanner.nextLine();
	    currentRow++;
	    if(currentRow % 1000000 == 0){
		System.out.println("" + currentRow);
	    }
	}
	*/
	System.out.println(row);
	System.out.println("Before Enter Loop");

	while(scanner.hasNextLine()){
	    //rowsDone++;
	    //currentRow++;
	    String currentLine = scanner.nextLine().trim();
	    //System.out.println(currentLine);
	    
	    if(currentLine.matches("</page.*>")){
		if(articleText.contains("#REDIRECT")){
		    redirect = true;
		}
		else{
		    previewText = getPreviewText(articleText).replaceAll("[^\\p{Punct}\\p{Alnum}\\s]", "");
		    previewText = makeStringMySQLSafe(previewText);
		}
		imageUrl = makeStringMySQLSafe(getImageUrl(articleText));
		articleName = makeStringMySQLSafe(articleName);
		//articleVector = makeStringMySQLSafe(calculateRelationships(articleName, articleText));
		
		// Send to Database
		ArticleVector vector = ArticleVectorSingleton.getArticleVector();
		calculateRelationships(articleName, makeStringMySQLSafe(articleText), vector);
		//System.out.println("Adding " + articleName);
		
    
		if(!articleName.startsWith("category:") && !articleName.startsWith("template:") && !articleName.startsWith("wikipedia:")){
		    insertRelevancy(vector, sqlOutRelation);
		    Map<String, Integer> map = returnWordCounts(articleText);
		    for(String key: map.keySet()){
			try{
			    sqlOutCount.write("('" + articleName + "', '" + key + "', " + map.get(key) + "),");
			    sqlOutCount.newLine();
			} catch(Exception e){
			}
		    }
		}
		//System.out.println("finishedWriting");
		    
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
		//articleVector = "";
		redirect = false;
		canWrite = true;
		/*
		if(rowsDone > NUM_OF_LINES){
		    System.out.println("breaking");
		    return;
		}
		*/
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
		//System.out.println(articleText);
	    }
	    else if(currentLine.matches("<text.*>.*")){ //text is multiple lines
		inText = true;
	    }
	    else if(inText){
		articleText += currentLine;
		if(currentLine.matches(".*</text>")){
		    articleText = articleText.replaceAll("</text>","");
		    articleText = articleText.replaceAll("<text.*>{1}","");
		    inText = false;
		    //System.out.println(articleText);
		}
	    }
	    else{
		inText = false;
	    }
	}
	//calculateRelevancy(vectorMap);
	
	try{
	    sqlOutRelation.close();
            sqlOutCount.close();

	}catch(Exception e){
	    System.out.println("Unable to close file");
	}
    }
    /*
     * Calculates the article relationships
     * Parameters name- name of the article
     *            text- text of the article
     *            vector- stores the relationship data
     * Return-    ArticleVector
     */
    private static ArticleVector calculateRelationships(String name, String text, ArticleVector vector){
	
	vector.setArticleName(name);
	List<String> list = new LinkedList<String>();
	vector.setRedirect(text.contains("#REDIRECT"));

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
		    split[i] = split[i].substring(0, o);
		}
	    }
	    if(split.length > 1 && split[i] != null && !split[i].contains(":")){
		list.add(split[i]);
	    }
	}
	vector.setLinks(list);
	return vector;
    }

    private static BufferedWriter initializeFileWriter(String fileName){
	FileWriter fileWriter;
        BufferedWriter bufferedWriter;	
	try{
            // Create file

            fileWriter = new FileWriter(fileName);
            bufferedWriter = new BufferedWriter(fileWriter);
	    return bufferedWriter;
        }catch (Exception e){//Catch exception if any
            System.err.println("Error: " + e.getMessage());
            System.exit(-1);
        }
	return null;
    }
    
    /*
     * DEPRECATED
     */
    private static String getPreviewText(String text){
	int splitMark = text.indexOf("==");
	
	String previewText = "";
	if (splitMark > 0) {
	    previewText = text.substring(0, Math.min(1500, text.length()));
	} else {
	    previewText = text.substring(0, Math.min(1500, text.length()));
	}
	return previewText;
    }
    
    /*
     * DEPRECATED
     */
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
    
    /*
     * Writes the relevancy to file
     * Parameters vector- the article vector with relationship data
     *            sqlOut- writes to file
     */
    private static void insertRelevancy(ArticleVector vector, BufferedWriter sqlOut){
	//String[] group = relations.split("\n");
	//Map<String, Integer> relationMap = new HashMap<String, Integer>();
	List<String> links = vector.getLinks();
	try{
	    for(int i = 0; i < links.size(); i++){
		if(vector.getRedirect()){
		    //System.out.println("Article: " + vector.getArticleName() + "\nRelations: " + relations);
		    //relationMap.put(group[i], -1);
		    sqlOut.write("('" + vector.getArticleName() + "', '" + links.get(i) + "', " + -1 + "), ");
		    sqlOut.newLine();
		
		}
		else if(links.get(i).length() > 0){
		    //System.out.println("Article: " + group[i]);
		    sqlOut.write("('" + vector.getArticleName() + "', '" + links.get(i) + "', " + 0 + "), ");
		    sqlOut.newLine();

		    //relationMap.put(group[i], (i % 5) + 1);
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

    /*
     * Makes string safe for sql queries
     * Parameters text- text to be made safe
     * Return String- sql safe string
     */
    private static String makeStringMySQLSafe(String text){
	return text.replace("\\", "\\\\").replace("'", "\\'").replace("\"","\\\"").replace("%", "\\%").replace("_", "\\_");
    }

    private static Map<String, Integer> returnWordCounts(String articleText){
	Map<String,Integer> wordMap = new HashMap<String,Integer>();
	articleText = articleText.replaceAll("[^a-zA-Z0-9]", " ").toLowerCase();
	Scanner sc = new Scanner(articleText);
	while (sc.hasNext()){
	    String word = sc.next();
	    if (word.length() > 2)
		if (wordMap.containsKey(word)){
		    int value = wordMap.get(word) + 1;
		    wordMap.put(word, value);
		}else{
		    wordMap.put(word, 1);
		}
	}
	return wordMap;
    }
}
