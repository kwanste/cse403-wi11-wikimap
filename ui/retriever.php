<?php
    class Node
    {
        public $name;
        public $relevancy;
        public $children = array();
    }

    class DatabaseRetriever
    {
	private $server = "cubist.cs.washington.edu";
	private $user = "liemdinh";
	private $pass = "sgU5tJ4i";
	private $db = "liemdinh_wiki";

        public function getRelevancyTree($article, $numNodes, $maxDepth)
        {

        }

        public function getPreviewText($article)
        {
		return $this->getSpecificRowColumn("ArticleSummary", $article, "Summary");
        }

        public function getImageURL($article)
        {
		return $this->getSpecificRowColumn("ArticleImages", $article, "ArticleURL");
        }

        private function generateRelevancyTree($article)
        {

        }

	private function getSpecificRowColumn($table, $article, $column)
	{
		$row = $this->getUniqueRow($table, $article);
		return $row[$column];
	}

	private function getUniqueRow($table, $article)	// only works for a unique $article
	{
	    $this->openSQL();

            $result = mysql_query("SELECT * FROM " . $table . " WHERE Article = '".mysql_real_escape_string($article)."'")
	    or die(mysql_error());

            // since there is one summary per article, there should be one unique row.
            $row = mysql_fetch_array( $result )
	    or die(mysql_error());

            return $row;
	}

	private function openSQL()
	{
	    mysql_connect($this->server, $this->user, $this->pass) or die(mysql_error());
	    mysql_select_db($this->db) or die(mysql_error());
	}

	private function closeSQL()
	{
	    sqlsrv_close();
	}

        private function isCached($article)
        {
            return false;
        }

        private function rebuildCachedTree($article)
        {

        }
    }

?>
