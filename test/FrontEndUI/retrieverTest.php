<?php

require_once 'PHPUnit/Framework.php';
require_once 'retriever.php';

/**
 * Tests retriever.php returns the correct results for articles
 * in the database and articles not in the database.
 */
class retrieverTest extends PHPUnit_Framework_TestCase {
	
	private $retriever;
	
	// Prepare for testing.
	protected function setUp() {
		parent::setUp ();
		$this->retriever = new DatabaseRetriever();
	}
	
	// Test correct behavior for article found in database.
	public function testArticleInDB() {
		// Test tree returned correctly.
		// If the tree is correct, Paul should show up in one of the nodes.
		$tree = $this->retriever->getRelevancyTree("Bill Gates", 10, 3);
		$this->assertFalse(strpos($tree, "Paul") === false);
		// Test preview text returned correctly.
		// If the preview text is correct, it should contain something
		// about microsoft.
		$previewText = $this->retriever->getPreviewText("Bill Gates");
		$this->assertFalse(strpos($previewText, "Microsoft") === false);
	}
	
	// Test correct behavior for article found in database.
	public function testArticleNotInDB() {
		// Test tree returned correctly.
		// If the tree is correct it should not contain any children.
		$tree = $this->retriever->getRelevancyTree("xxxxxxxxxxx", 10, 1);
		$this->assertTrue(strpos($tree, "//") === false);
		// Test image returned correctly.
		// Since the article is not found, the not found image should
		// be returned.
		$previewText = $this->retriever->getImageURL("xxxxxxxxxx");
		$this->assertFalse(strpos($previewText, "not_found") === false);
	}
	
	/**
	 * Constructs the test case.
	 */
	public function __construct() {
		$this->assertTrue(true);
	}

}

