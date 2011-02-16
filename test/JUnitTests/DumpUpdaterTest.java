package test.JUnitTests;

import java.util.*;
import junit.framework.*;
import org.junit.*;
import org.junit.Test;
import logic.DumpUpdater;

public class DumpUpdaterTest extends TestCase {
	private String[] downloadFileURLInvalid;
	private String[] downloadFileURLValid;
	private String[] outputFileName;
	
	private String[] timeStampInvalid[];
	private String[] timeStampValid[];
	
	private String[] monthValid;
	private String[] monthInvalid;
	
	private String[] timeStampLogInvalid;
	private String[] timeStampLogValid;
	
	private String[] URLInvalid;
	private String[] URLValid;

	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		// Initialize all test arrays
	}
	
	@Test
	public void testDownload() {
	}
	
	@Test
	public void testCompareTimestamp() {
	}
	
	@Test
	public void testConvertToIntMonth() {
	}
	
	@Test
	public void writeTimestamp() {
	}
	
	@Test
	public void getPreviousTimestamp() {
	}
	
	@Test
	public void getLatestTimestamp() {
	}
	
	@Test
	public void testRead() {
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
}
