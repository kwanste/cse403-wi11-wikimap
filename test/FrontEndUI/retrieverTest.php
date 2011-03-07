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
		$this->retriever = new DatabaseRetriever("iprojsrv.cs.washington.edu", "wikimapsdb_test");
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

        public function testHTMLInjection()
        {
            // Nearly identical to testArticleNotInDB()

            // Test tree returned correctly.
            // If the tree is correct it should not contain any children.
            $tree = $this->retriever->getRelevancyTree("Bill <i>Gates</i>", 10, 1);
            $this->assertTrue(strpos($tree, "//") === false);
            // Test image returned correctly.
            // Since the article is not found, the not found image should
            // be returned.
            $previewText = $this->retriever->getImageURL("Bill <i>Gates</i>");
            $this->assertFalse(strpos($previewText, "not_found") === false);
        }

        public function testSQLInjection()
        {
            // First, let's see if Bill Gates exists and has some children.

            $tree = $this->retriever->getRelevancyTree("Bill Gates", "6,2", 3);
//            $tree = $this->retriever->getRelevancyTree("Bill Gates; DELETE FROM ArticleRelations WHERE Article='Bill Gates';", "6,2", 3);
            $this->assertTrue(strncasecmp($tree, "bill gates//", 12) === 0 && strpos($tree, "//") !== false);

            // okay, Bill Gates has some relations... lets see if we can make him drop them.


            //$previewText = $this->retriever->getImageURL("Bill Gates; DELETE FROM ArticleRelations WHERE Article='Bill Gates';");
            //$this->assertFalse(strpos($previewText, "not_found") === false);

            // query to find Bill Gates
            // if not found, re-add him.
        }

        public function testUnusualCharacters()
        {
            $unusualSearches = array("Murphy's Law", "\"", "/", "ひらがな", "漢字", "ä", "عربي");

            foreach($unusualChars as $ch)
            {
                $tree = $this->retriever->getRelevancyTree($ch, 10, 1);
                $this->assertTrue(strpos($tree, "//") === false);
                // Test image returned correctly.
                // Since the article is not found, the not found image should
                // be returned.
                $previewText = $this->retriever->getImageURL("Bill <i>Gates</i>");
                $this->assertFalse(strpos($previewText, "not_found") === false);
            }

        }

        public function testTreeFormat()
        {
            
        }
	
	/**
	 * Constructs the test case.
	 */
	public function __construct() {
		$this->assertTrue(true);
	}

}

