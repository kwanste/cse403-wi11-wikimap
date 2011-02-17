<?php
    class Node
    {
        public $name;
        public $relevancy;
        public $children;

        function __construct($n, $r = -1, $c = array())
        {
            $this->name = $n;
            $this->relevancy = $r;
            $this->children = $c;
        }
    }

    class DatabaseRetriever
    {
	private $server = "iprojsrv.cs.washington.edu";
	private $user = "wikiread";
	private $pass = "WikipediaMaps123";
	private $db = "wikimapsDB_test";

        private $debug = false;

        /**
         *
         * @method Returns a full tree of relevant nodes
         * @param string $article - unique name of Wikipedia entry
         * @param int $numNodes - maximum number of child nodes from any given node
         * @param int $maxDepth - the maximum degrees of separation
         * @return Tree - a representation of our graph
         *
         */
        public function getRelevancyTree($article, $numNodes, $maxDepth)
        {
            /*
			if (strtolower($article) == "bill gates") {
				return "Bill Gates//Amazon.com|Child2|Child3|Child4|Child5|Child6"
					. "//Child1a|Child1b||Child2a|Child2b||Child3a|Child3b||Child4a|Child4b||Child5a|Child5b||Child6a|Child6b";
			} elseif (strtolower($article) == "amazon.com") {
				return "Amazon.com//Bill Gates|Child2|Child3|Child4|Child5|Child6"
					. "//Child1a|Child1b||Child2a|Child2b||Child3a|Child3b||Child4a|Child4b||Child5a|Child5b||Child6a|Child6b";
			} else
				return "";
             *
             */
            $root = $this->generateRelevancyTree($article, $numNodes, $maxDepth );
            return $this->serializeTree($root, $numNodes);
        }

        /**
         *
         * @param string $article - unique name of Wikipedia Entry
         * @return string - Article preview text
         */
        public function getPreviewText($article)
        {
		return $this->getSpecificRowColumn("ArticleSummary", $article, "Summary");
        }

        /**
        *
        * @param string $article - unique name of Wikipedia Entry
        * @return string - URL of article image
        */
        public function getImageURL($article)
        {
			$default = "images/image_not_found.jpg";
			$url = $this->getSpecificRowColumn("ArticleImages", $article, "ArticleURL");
			if($url == "Not Found") return $default;
			else return $url;
			
			//return $this->getSpecificRowColumn("ArticleImages", $article, "ArticleURL");
        }

        private function generateRelevancyTree($article, $maxNodesAtDepth, $maxDepth)
        {
            $this->openSQL();

            $root = new Node($article);

            $nextDepth[strtolower($article)] = $root;

            for ($d=0; $d<$maxDepth; $d++)
            {
                $currentDepth = $nextDepth; // previous RelatedArticles or root $article
                $nextDepth = null;
                $names = null;

                foreach ($currentDepth as $key => $val)
                        $names[] = $val->name;

                $sz = sizeof($names);

                if ($sz > 0)
                {
                    $querystring = "SELECT * FROM articlerelations WHERE Article = '".mysql_real_escape_string($names[0])."'";
                    for ($i=1; $i<$sz; ++$i)
                        $querystring .= " OR Article = '".mysql_real_escape_string($names[$i])."'";

                    $querystring .= " ORDER BY Article, STRENGTH, RelatedArticle";

                    if ($debug)
                        echo $querystring."<p/>";

                    $result = mysql_query($querystring);

                    while($row = mysql_fetch_array( $result ))
                    {
                        $parentname = $row['Article'];
                        $childn = $row['RelatedArticle'];
                        $childstr = $row['STRENGTH'] + $currentDepth[$parentname]->relevancy;   // strength is strictly increasing (i.e. getting weaker)

                        if (sizeof($currentDepth[$parentname]->children) < $maxNodesAtDepth)
                        {
                            $next = new Node($childn, $childstr);

                            $nextDepth[$childn] = $next;
                            $currentDepth[$parentname]->children[] = $next;
                        }
                    }
                }
            }

            $this->closeSQL();

            return $root;
        }

        private function serializeTree($root, $numPerDepth)
        {
            $bar = new Node("|");
            $newlevel = new Node("//");

            $nodes[] = $root;
            $nodes[] = $newlevel;

            $s = "";

            while (sizeof($nodes) > 0)
            {
                $next = array_shift($nodes);

                $s .= $next->name;

                if ($next == $bar)
                        continue;
                else if ($next == $newlevel)
                {
                    if (sizeof($nodes) > 0)
                        array_push($nodes, $newlevel);
                    continue;
                }

                $ch = array_values($next->children);

                for ($i=0; $i<$numPerDepth; $i++ )
                {
                    if ($ch[$i] != null)
                    {
                        array_push($nodes, $ch[$i]);
                    }

                    if ($i+1 < $numPerDepth)
                            array_push($nodes, $bar);

                }

                if ($nodes[0] != $newlevel)
                    array_push($nodes, $bar);
            }

            return $s;
        }

        /**
         *
         * @param string $table The table to query
         * @param string $article The unique article name you're interested in
         * @param string $column The field you're interested in
         * @return string (?)
         */
		private function getSpecificRowColumn($table, $article, $column)
		{
			$row = $this->getUniqueRow($table, $article);
			if($row == null) {
				return "Not Found";
			}
			return $row[$column];
		}

        /**
         * Returns a unique row from a table.
         * Since most tables have only one summary per article, pretty useful
         *
         * @param <type> $table table to query from
         * @param <type> $article unique article ID
         * @return array requested row from table
         */
        private function getUniqueRow($table, $article)
        {
                $result = $this->getRows($table, $article);

                if (mysql_num_rows($result) > 1)
                    die("Only use getUniqueRow when article=".$article." is unique.");

                return mysql_fetch_array( $result );
        }

        /**
         * Returns a row from the database
         *
         * @param string $table table to query from
         * @param string $article unique article ID
         * @return resource SQL query result
         */
		private function getRows($table, $article)
		{
			$this->openSQL();

				$result = mysql_query("SELECT * FROM " . $table . " WHERE Article = '".mysql_real_escape_string($article)."'")
			or die(mysql_error());

				return $result;
		}

        /**
         * Simply opens a mySQL connection to our database
         */
		private function openSQL()
		{
			mysql_connect($this->server, $this->user, $this->pass) or die(mysql_error());
			mysql_select_db($this->db) or die(mysql_error());
		}

        /**
         * Closes our mySQL connection. Not currently used, since it closes the connection at the end of SQL script anyway
         */
		private function closeSQL()
		{
			mysql_close();
		}

        /**
         * Not currently used
         * @param <type> $article
         * @return <type>
         */
        private function isCached($article)
        {
            return false;
        }

        /**
         * Not currently used
         *
         * @param <type> $article
         */
        private function rebuildCachedTree($article)
        {

        }
    }

?>
