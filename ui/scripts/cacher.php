<?php
    class DatabaseCacher
    {
		private $server = "cse403.cdvko2p8yz0c.us-east-1.rds.amazonaws.com";
		private $user = "wikiwrite";
		private $pass = "WikipediaMaps123";
		private $db = "wikimapsDB";
		private $imageTable = "ArticleImages";
		private $previewTable = "ArticleSummary";
		private $treeCache = "TreeCache";

		private $debug = false;

		public function insertImageURL($article, $data) {
			$this->insertRow($this->imageTable, $article, $data, "");
		}
		
		public function insertPreviewText($article, $data) {
			$this->insertRow($this->previewTable, $article, $data, "FALSE");
		}
		
		public function insertTree($article, $zoom, $data){
			$this->insertRow($this->treeCache, $article, $zoom, $data);
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
