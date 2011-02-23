package logic;

import java.nio.*;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;

// This class can be used as one time run, or run as we please program for updating our Wikipedia
// database periodically. A dump is defined as the file containing all the diffs.  This includes 
// new articles, article contents, and article image urls.
private class DumpUpdater {

	private static void main(String[] args) throws Exception {
		String previousTimestamp = getPreviousTimestamp("timestamp.txt"); //get previous timestamp from our log
		String latestTimestamp = getLatestTimestamp();	// get latest timestamp from Wikipedia's webpage
		
		if (previousTimestamp.equals("") || compareTimestamp(previousTimestamp,latestTimestamp) == true){
			// if we have no previous timestamp or have an outdated timestamp, then we need to download a new wikipedia dump
			
			// This URL will need to be updated to point at the latest dump.
			// It is temporarily set to a smaller file for functionality
			if (download("http://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2-rss.xml","enwiki-latest-pages-articles.xml.bz2-rss.xml") == true)
				writeTimestamp(latestTimestamp,"timestamp.txt"); // write timestamp if download succesfully finishes
		}
					
	}

	private static boolean download(String downloadFileURL, String outputFileName) throws IOException{
		//downloads dump file at downloadFileURL and names it outputFileName
		URL fileURL = new URL(downloadFileURL);
		ReadableByteChannel rbc = Channels.newChannel(fileURL.openStream());
	    FileOutputStream fos = new FileOutputStream(outputFileName);
	    fos.getChannel().transferFrom(rbc, 0, 1 << 24);
	    fos.close();
		return true;
	}
		
	// Timestamps are in the form of year-month-day with the year being 4 digits long, the month being the first 3 letters
	// of the month name, and the day as 2 digits long.
	private static boolean compareTimestamp(String previousTS,String latestTS){
		//returns false: if the latest timestamp is not more recent than the previous timestamp
		//		  true: if the latest TS is more recent than the previous TS (which means we need to download a new dump)
		
		//seperating the timestamp strings into year, month, and day for comparison purposes:
		String previousY = previousTS.substring(0,4); 
		String latestY = latestTS.substring(0,4);
		String previousM = previousTS.substring(5,8);
		String latestM = latestTS.substring(5,8);
		String previousD = previousTS.substring(9,11);
		String latestD = latestTS.substring(9,11);
		int previousIntM = convertToIntMonth(previousM);
		int latestIntM = convertToIntMonth(latestM);
			
		if (latestY.compareTo(previousY) > 0){
			return true;
		}else if (latestY.compareTo(previousY) == 0 && latestIntM > previousIntM){
			return true;
		}else if (latestY.compareTo(previousY) == 0 && latestIntM == previousIntM && latestD.compareTo(previousD) > 0){
			return true;
		}else
			return false;
	}
	
	private static int convertToIntMonth(String month){
		// converts a 3-letter month string to its corresponding month number
		int n;
		if (month.compareTo("Jan") == 0)
			n = 1;
		else if (month.compareTo("Feb") == 0)
			n = 2;
		else if (month.compareTo("Mar") == 0)
			n = 3;
		else if (month.compareTo("Apr") == 0)
			n = 4;
		else if (month.compareTo("May") == 0)
			n = 5;
		else if (month.compareTo("Jun") == 0)
			n = 6;
		else if (month.compareTo("Jul") == 0)
			n = 7;
		else if (month.compareTo("Aug") == 0)
			n = 8;
		else if (month.compareTo("Sep") == 0)
			n = 9;
		else if (month.compareTo("Oct") == 0)
			n = 10;
		else if (month.compareTo("Nov") == 0)
			n = 11;
		else
			n = 12;
		return n;
	}
	
	private static boolean writeTimestamp(String timestamp, String timestampLog){
		//writes timestamp to local text file timestamp.txt
		//returns true if succesful
		try {
			FileWriter outFile = new FileWriter(timestampLog);
			PrintWriter out = new PrintWriter(outFile);
			out.println(timestamp);
			out.close();
		} catch (IOException e){
			e.printStackTrace();
			return false;
		}
		return true;
	}
	
	private static String getPreviousTimestamp(String timestampLog){
		//returns the timestamp of the most recent Wikipedia dump we have processed, stored in a local text file
			// if we have not yet downloaded a Wikipedia dump, return an empty string.
		File file = new File(timestampLog); 
		BufferedReader reader = null;
		String timestamp = "";
		
		try{
			reader = new BufferedReader(new FileReader(file));
			String line = reader.readLine();
			timestamp = line;			
		}catch(FileNotFoundException e) {
			
		}catch(IOException e) {
		      e.printStackTrace();
		}
		//System.out.println(timestamp);
		return timestamp;
	}
	
	
	private static String getLatestTimestamp() throws Exception {
		//returns the timestamp of the most recent Wikipedia article dump
		String url = "http://dumps.wikimedia.org/enwiki/latest";
		BufferedReader reader = read(url);
		String line = reader.readLine();
		String dumpfile = "<tr><td class=\"n\"><a href=\"enwiki-latest-pages-articles.xml.bz2\">";
		String date = "";
		
		while (line != null) {
			if (line.startsWith(dumpfile)){
				date = line.substring(124,135);
				//System.out.println(date);	
			}
			line = reader.readLine();
		}
						
		return date;
	}
	
	private static BufferedReader read(String url) throws Exception{
		return new BufferedReader(
			new InputStreamReader(
				new URL(url).openStream()));}
	}
