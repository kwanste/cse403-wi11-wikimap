<?php
        // This class is used by the front-end to store image URLs and preview texts of articles that
        // are retrieved later. It is also used by the database retriever to cache relevancy trees and
        // for removing expired relevancy trees.
    class DatabaseCacher
    {
		private $server = "cse403.cdvko2p8yz0c.us-east-1.rds.amazonaws.com";
		//private $server = "iprojsrv.cs.washington.edu";
		private $user = "wikiwrite";
		private $pass = "WikipediaMaps123";
		private $db = "wikimapsDB";
		//private $db = "wikimapsDB_test_cache";
		private $imageTable = "ArticleImages";
		private $previewTable = "ArticleSummary";
		private $treeCache = "TreeCache";

		private $debug = false;

		// inserts image URL into database
		public function insertImageURL($article, $data) {
			$this->insertRow($this->imageTable, $article, $data, "");
		}

		// inserts preview text into database
		public function insertPreviewText($article, $data) {
			$this->insertRow($this->previewTable, $article, $data, "FALSE");
		}

		// inserts the tree into the cache
		public function insertTree($article, $zoom, $data){
			$this->openSQL();
			$timestamp = time();
			mysql_query("INSERT IGNORE INTO " . $this->treeCache . " VALUES ('".mysql_real_escape_string($article)."', '".mysql_real_escape_string($zoom)."', '".mysql_real_escape_string($data)."', ".$timestamp.")")
			or die(mysql_error());
		}
	
        public function updateTreeTS($article, $zoom){
			$this->openSQL();
            $timestamp = time();
            mysql_query("UPDATE " . $this->treeCache . " SET Timestamp = " . $timestamp . " WHERE Article = '".mysql_real_escape_string($article)."' AND ZoomLevel = " . $zoom) or die(mysql_error());

        }
	
		// deletes all trees from the cache that are over 24 hours old
		public function refreshCache(){
			$this->openSQL();
			date_default_timezone_set('America/Los_Angeles');
			$timestamp = time();
			$timestamp24HrsAgo = $timestamp - 86400;

			mysql_query("DELETE FROM " . $this->treeCache . " WHERE Timestamp < " . $timestamp24HrsAgo)
			or die(mysql_error());
		}

		// Insert this row into
		private function insertRow($table, $article, $data, $redirect)
		{
			$this->openSQL();

			if ($redirect == "")
				mysql_query("INSERT IGNORE INTO " . $table . " VALUES ('".mysql_real_escape_string($article)."', '".mysql_real_escape_string($data)."')")
				or die(mysql_error());
			else
				mysql_query("INSERT IGNORE INTO " . $table . " VALUES ('".mysql_real_escape_string($article)."', '".mysql_real_escape_string($data)."', ".$redirect.")")
				or die(mysql_error());
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

    }
?>