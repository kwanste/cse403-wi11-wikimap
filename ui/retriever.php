<?php
    class Node
    {
        public $name;
        public $relevancy;
        public $children = array();
    }

    class DatabaseRetriever
    {
	private $server = "iprojsrv.cs.washington.edu";
	private $user = "wikiread";
	private $pass = "WikipediaMaps123";
	private $db = "wikimapsDB";

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
		$default = "image/image_not_found.png"
		$url = $this->getSpecificRowColumn("ArticleImages", $article, "ArticleURL");
		if($url == "") return $default;
		else return $url;
		//return $this->getSpecificRowColumn("ArticleImages", $article, "ArticleURL");
        }

        // not supported in alpha release
        private function generateRelevancyTree($article)
        {

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
		if (row == null) return "";
		else return $row[$column];
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
                    die("Only use getUniqueRow when $article=".$article." is unique.");

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
	    sqlsrv_close();
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
