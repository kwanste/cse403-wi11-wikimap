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
		$query = "http://www.wikirandom.org/json?languages=en,en,it,es&pages=10";
		$result = file_get_contents($query);
		$parsed = json_decode($result);
		$articles = $parsed->data;
		foreach($articles as $article)
		{
			//Query articles.
			$this->backgroundPost('http://wikimap.kimberlykoenig.com/wikiSearch.php?s='.
                       urlencode($article->title));
		}
		foreach($articles as $article)
		{
			//All articles should now be cached.
			$this->assertTrue($this->retriever->isCached($article->title, 2, "6,2"));
		}
	}
	
	// Code found here: http://robert.accettura.com/blog/2006/09/14/asynchronous-processing-with-php/
	// Posts a query, then continues without waiting for the results of that query.
	protected function backgroundPost($url){
		  $parts=parse_url($url);
		 
		  $fp = fsockopen($parts['host'], 
		          isset($parts['port'])?$parts['port']:80, 
		          $errno, $errstr, 30);
		 
		  if (!$fp) {
		      return false;
		  } else {
		      $out = "POST ".$parts['path']." HTTP/1.1\r\n";
		      $out.= "Host: ".$parts['host']."\r\n";
		      $out.= "Content-Type: application/x-www-form-urlencoded\r\n";
		      $out.= "Content-Length: ".strlen($parts['query'])."\r\n";
		      $out.= "Connection: Close\r\n\r\n";
		      if (isset($parts['query'])) $out.= $parts['query'];
		 
		      fwrite($fp, $out);
		      fclose($fp);
		      return true;
	  }
	}
	
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


            for ($i=0; $i<$depthTest; $i++)
            {
                $this->treeVerificationHelper($levels[$i], $numKids, $i);
            }
        }

        private function treeVerificationHelper($segment, $numKids, $curDepth)
        {
            $childrenFromDifferentParents = explode("||", $segment);

            if (sizeof($childrenFromDifferentParents) > 1)
            {
                $this->assertTrue($curDepth > 0);   // if curDepth==0 then the first row of children has multiple parents
                //$this->assertTrue(sizeof($childrenFromDifferentParents) == $numKids[$curDepth-1]-1);    // assert the right # of parents...
                for ($j=0; $j < sizeof($childrenFromDifferentParents); $j++)
                    $this->treeVerificationHelper($childrenFromDifferentParents[$j], $numKids, $curDepth);
            }
            else
            {
                $children = explode("|", $segment);
                $this->assertTrue(sizeof($children)==$numKids[$curDepth]);
            }
        }
	
	/**
	 * Constructs the test case.
	 */
	public function __construct() {
		$this->assertTrue(true);
	}

}

