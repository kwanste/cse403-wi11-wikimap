package test.JUnitTests;

/* This is skeleton code to test the logic.DumpUpdater module. */

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
	
	// Test with empty xml files to see if a new timestamp causes an update or not. 
	// Validate with timestamp logs.
	@Test
	public void testDumpUpdate() {
		
	}
	
	@After
	public void tearDown() throws Exception {
		super.tearDown();
	}
}
