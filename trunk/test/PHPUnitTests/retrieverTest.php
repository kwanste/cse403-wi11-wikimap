<?php

require_once 'PHPUnit/Framework.php';
require_once './ui/scripts/retriever.php';

/**
 * Tests retriever.php returns the correct results for articles
 * in the database and articles not in the database.
 *
 * Also includes stress tests.
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
		// Though apparently this is not always the case.
		$tree = $this->retriever->getRelevancyTree("Bill Gates", "6,2", 2);
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
		$tree = $this->retriever->getRelevancyTree("xxxxxxxxxxx", "6,2", 2);
		$this->assertTrue(strpos($tree, "//") === false);
		// Test image returned correctly.
		// Since the article is not found, the not found image should
		// be returned.
		$previewText = $this->retriever->getImageURL("xxxxxxxxxx");
		$this->assertFalse(strpos($previewText, "not_found") === false);
	}	
	
	// Redirects should return the same tree.
	public function testRedirects(){
		$redirs = array('Bill Gate', 'bill gates', 'BillGates');
		$tree = $this->retriever->getRelevancyTree('Bill Gates', "6,2", 2);
		foreach($redirs as $article)
		{
			$this->assertEquals(0, strcasecmp($tree, $this->retriever->getRelevancyTree($article, "6,2", 2)));
		}
	}
	
	// Text variations should all return the same tree.
	public function testTextVariations(){
		$variations = array('Michael Jackson', 'MiCHAEL jackson', 'MICHAEL JACKSON', 'michael jackson');
		$tree = $this->retriever->getRelevancyTree('Michael Jackson', "6,2", 2);
		foreach($variations as $article)
		{
			$this->assertEquals(0, strcasecmp($tree, $this->retriever->getRelevancyTree($article, "6,2", 2)));
		}
	}
	
	// Search for Michael Jackson 100 times.
	public function testStress1(){
		$tree = $this->retriever->getRelevancyTree('Michael Jackson', "6,2", 2);
		for($i = 0; $i < 100; $i++)
		{
			$this->assertEquals(0, strcasecmp($tree, $this->retriever->getRelevancyTree('Michael Jackson', "6,2", 2)));
		}
	}
	
	public function testStress2(){
		// Grab 10 random articles from Wikipedia.
		$query = "http://www.wikirandom.org/json?languages=en&pages=10";
		$result = file_get_contents($query);
		$parsed = json_decode($result);
		$articles = $parsed->data;
		foreach($articles as $article)
		{
			$tree = $this->retriever->getRelevancyTree($article->title, "6,2,2,2", 4);
			if($tree != $article->title)
			{
				//All articles should now be cached.
				$this->assertTrue($this->retriever->isCached($article->title, 4, "6,2,2,2") != "");
			}
					
		}
	}

        // tests to see whether we get trees back for searches with odd characters
        // fails every time because we don't (yet) support Unicode stuff.
        public function testUnusualCharacters()
        {
            $unusualSearches = array("Murphy's Law", "\"", "/", "ひらがな", "漢字", "ä", "عربي");

            foreach($unusualSearches as $ch)
            {
                // test whether we get a tree for this. Assumes we have it in the DB.
                $tree = $this->retriever->getRelevancyTree($ch, 10, 1);
                $this->assertTrue($tree != "");
            }

        }

        // test that the serialized tree comes back in a valid format
        public function testTreeFormat()
        {
            $numKids = array(6, 2, 2);
            $depthTest = 3;
            $tree = $this->retriever->getRelevancyTree("bill gates", $numKids, $depthTest);

            if ($tree == "")
                return;

            $levels = explode("//", $tree);
            $this->assertTrue(sizeof($levels)==$depthTest+1);    // check we got 3+1 levels back (+1 is root)

            $this->assertTrue(sizeof(explode("|", $levels[0]))==1); // check there is only one root
            array_shift($levels);   // depthTest doesn't account for the root node
            $this->assertTrue(sizeof(explode("|", $levels[0]))==$numKids[0]); // check bill gates has 6 children


            for ($i=0; $i<$depthTest; $i++)     // for each depth, verify
            {
                $this->treeVerificationHelper($levels[$i], $numKids, $i);
            }
        }

        // helper function for testTreeFormat. Recursively breaks up a depth until it is just from a single parent, then verifies the number of nodes there.
        private function treeVerificationHelper($segment, $numKids, $curDepth)
        {
            $childrenFromDifferentParents = explode("||", $segment);

            if (sizeof($childrenFromDifferentParents) > 1)  // not the first depth out
            {
                $this->assertTrue($curDepth > 0);   // if curDepth==0 then the first row of children has multiple parents
                //$this->assertTrue(sizeof($childrenFromDifferentParents) == $numKids[$curDepth-1]-1);    // assert the right # of parents... this is implicit with the testing the proper # of children, since we are guaranteed a full tree. Lucky, since the math was confusing.
                for ($j=0; $j < sizeof($childrenFromDifferentParents); $j++)
                    $this->treeVerificationHelper($childrenFromDifferentParents[$j], $numKids, $curDepth);
            }
            else
            {
                $children = explode("|", $segment);
                $this->assertTrue(sizeof($children)==$numKids[$curDepth]);  // proper number of children for this depth
            }
        }
	
	/**
	 * Constructs the test case.
	 */
	public function __construct() {
		$this->assertTrue(true);
	}

}

