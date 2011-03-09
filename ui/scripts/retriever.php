<?php

/**
 * This file contains the Database Retriever, which is a layer of abstraction
 * for all SQL queries. Anything a front-end would need to build a tree
 * goes in here. While we are using a HTML5 canvas front-end, this
 * code should work fine with any other implementation.
 *
 * For instance, say you want to get a tree of related nodes for "Bill Gates"
 * You'd call getRelevancyTree with the relevant parameters, get a serialized
 * string back, and could then parse that on an implementation to function
 * exactly as you wish.
 *
 * This is why some functions are more abstract than is obviously necessary-
 * for instance, the fine-tuning available in getRelevancyTree. We could
 * have a "zoom level" but likely the meaning would differ in implementation
 * and this offers finer control from front-end developers.
 */
include("cacher.php");

// Small helper struct to build trees
class Node
{

    public $name;
    public $relevancy;
    public $children;
    public $redirected;

    // constructor
    function __construct($n, $r = -1, $c = array())
    {
        $this->name = $n;
        $this->relevancy = $r;
        $this->children = $c;
        $this->redirected = false;
    }

}

class DatabaseRetriever
{

    private $server;
    //private $server = "127.0.0.1:3306";
    //private $server = "iprojsrv.cs.washington.edu";
    private $user = "wikiread";
    private $pass = "WikipediaMaps123";
    private $db;
    //private $db = "wikimapsDB_test_cache";
    private $debug = false;
    private $final = false; // temporary fix to keep robert's code while still working for usability

    function __construct($servername = "cse403.cdvko2p8yz0c.us-east-1.rds.amazonaws.com", $dbname = null)
    {
        if ($dbname == null)
        {
            if ($this->final)
                $this->user = "wikiwrite";
            $dbname = ($this->final) ? "wikimapsDB_final" : "wikimapsDB";
        }

        $this->server = $servername;
        $this->db = $dbname;
    }

    /**
     *
     * @method Returns a serialized tree of relevant nodes
     * @param string $article - unique name of Wikipedia entry
     * @param array $numNodes - maximum number of child nodes at given depth
     * (the first depth has numNodes[0] children, the second numNodes[1], etc.)
     * If there's a greater depth than the length of the array,
     *      then it repeats the last element.
     * This can also be sent as a string: "10,5,3" will automatically
     *      be converted to [10, 5, 3]
     * You can also just pass a single int instead of an array.
     * @param int $maxDepth - the maximum degrees of separation
     * @return String - a representation of our graph
     *
     */
    public function getRelevancyTree($article, $numNodes, $maxDepth, $enableCaching=false)
    {
        if (is_string($numNodes))   // do a bit of conversion to make $numNodes more flexible
            $numNodes = explode(",", $numNodes);
        else if (is_int($numNodes))   // ensure that this is an array
            $numNodes = array($numNodes);
        else if (!is_array($numNodes))
            die("Invalid parameter for numNodes");

        $numNodesString = implode(",", $numNodes);

        $maxDepth = sizeof($numNodes);

        $inCache = false;

        if ($enableCaching)
        {
            $inCache = $this->isCached($article, $maxDepth, $numNodesString); // looks for the tree in the cache
            $db_cache = new DatabaseCacher($this->server, $this->db);
        }

        if ($inCache)
        {
            $db_cache->updateTreeTS($article, $maxDepth, $numNodesString); // update timestamp
            return $inCache;
        }
        else
        {
            $root = $this->generateRelevancyTree($article, $numNodes, $maxDepth);
            $serializedTree = $this->serializeTree($root, $numNodes, $maxDepth);
            if ($enableCaching)
                $db_cache->insertTree($article, $maxDepth, $numNodesString, $serializedTree); // inserts tree into cache
            if ($serializedTree == "")
                return $article;
            return $serializedTree;
        }
    }

    /**
     * @method This function retrieves preview text from our database
     * @param string $article - unique name of Wikipedia Entry
     * @return string - Article preview text
     */
    public function getPreviewText($article)
    {
        return $this->getSpecificRowColumn("ArticleSummary", $article, "Summary");
    }

    /**
     * @method This function retrieves the preview image URL from our database
     * @param string $article - unique name of Wikipedia Entry
     * @return string - URL of article image
     */
    public function getImageURL($article)
    {
        $default = "images/image_not_found.jpg";
        $url = $this->getSpecificRowColumn("ArticleImages", $article, "ArticleURL");
        if ($url == "Not Found")
            return $default;
        else
            return $url;

        //return $this->getSpecificRowColumn("ArticleImages", $article, "ArticleURL");
    }

    /**
     * Beginings of a new JSON style relevancytree builder
     * @param <type> $article
     * @param <type> $maxNodesAtDepth
     * @param <type> $maxDepth
     * @return int
     */
//    private function newGenerateRelevancyTree($article, $maxNodesAtDepth, $maxDepth) {
//        $this->openSQL();
//        $originalArticle = $article;
//        $article = strtolower($article);
//
//        // Build root node
//        $root = array(
//            $this->nameID => $originalArticle,
//            $this->strengthID => 0,
//            $this->childrenID => array()
//        );
//
//        $used[$article] =& $root;
//
//        $parents[] = $article;
//        for ($d = 0; $d < $maxDepth; $d++) {
//            if(sizeof($parents) == 0)
//                break;
//            $children = array();
//
//            // Build query string
//            $querystring = "SELECT * FROM ArticleRelations WHERE Strength != -1 AND ( Article = '" . mysql_real_escape_string($used[$parents[0]][$this->nameID]) . "'";
//            foreach($parents as $parent)
//                $querystring .= " OR Article = '" . mysql_real_escape_string($used[$parent][$this->nameID]) . "'";
//            $querystring .= " ) ORDER BY Strength";
//            if ($this->debug)
//                echo $querystring . "<p/>";
//
//            // Run query
//            $result = mysql_query($querystring);
//
//            // Process query
//            while ($row = mysql_fetch_array($result)) {
//                // Unpack row
//                $parentName = strtolower($row['Article']);
//                $childName = $row['RelatedArticle'];
//                $strength = $row['Strength'];
//
//                // Stop adding if number of children is at allowed amount
//                if(sizeof($children) >= $maxNodesAtDepth[$d])
//                    break;
//
//                // Ignore this article if its a redirect or if its already in the tree
//                if($row['Strength'] == -1 || array_key_exists($parentName, $used))
//                    continue;
//
//                // Add node to tree
//                array_push($used[$parentName][$this->childrenID], array(
//                    $this->nameID => $childName,
//                    $this->strengthID => $strength,
//                    $this->childrenID => array()
//                ));
//                $used[strtolower($childName)] =& $used[$parentName][$this->childrenID][sizeof($used[$parentName][$this->childrenID])];
//                $children[] = strtolower($childName);
//            }
//
//            $parent = $children;
//        }
//
//        $this->closeSQL();
//
//        return $root;
//    }

    /**
     *
     * @method Returns a tree of relevant nodes (as a tree, not a String)
     * @param string $article - unique name of Wikipedia entry
     * @param array $numNodes - maximum number of child nodes at given depth
     * (the first depth has numNodes[0] children, the second numNodes[1], etc.)
     * If there's a greater depth than the length of the array,
     *      then it repeats the last element.
     * This can also be sent as a string: "10,5,3" will automatically
     *      be converted to [10, 5, 3]
     * You can also just pass a single int instead of an array.
     * @param int $maxDepth - the maximum degrees of separation
     * @return String - a representation of our graph
     *
     */
    private function generateRelevancyTree($article, $maxNodesAtDepth, $maxDepth)
    {
        $this->openSQL();

        $root = new Node($article);

        $nextDepth[strtolower($article)] = $root;

        $articlesUsed = array();
        $articlesUsed[] = strtolower($article);

        /*
         * Level by level, build SQL queries for depth=0, depth=1, depth=2
         * discovering children level by level.
         * Done in this way to reduce the SQL query overhead
         * and reduce server load
         */
        for ($d = 0; $d < $maxDepth; $d++)
        {
            $currentDepth = $nextDepth; // previous RelatedArticles or root $article
            $nextDepth = null;
            $names = null;

            foreach ($currentDepth as $key => $val)
                $names[] = $val->name;

            $sz = sizeof($names);

            if ($sz > 0)
            {
                $querystring = "SELECT * FROM ArticleRelations WHERE ( Article = '" . mysql_real_escape_string($names[0]) . "'";
                for ($i = 1; $i < $sz; ++$i)
                    $querystring .= " OR Article = '" . mysql_real_escape_string($names[$i]) . "'";

                $querystring .= " ) ORDER BY Article, STRENGTH, RelatedArticle";    // rob

                if ($this->debug)
                    echo $querystring . "<p/>";

                $result = mysql_query($querystring);

                $anyRedirects = false;

                while ($row = mysql_fetch_array($result))
                {
                    if ($row['Strength'] != -1)
                    {
                        if ($anyRedirects)// if we've found any redirects, don't look at the children
                            continue;

                        $parentname = strtolower($row['Article']);

                        $childn = $row['RelatedArticle'];
                        $strength = $row['Strength'];
                        $childstr = $strength + $currentDepth[$parentname]->relevancy;   // strength is strictly increasing (i.e. getting weaker)

                        if (!in_array(strtolower($childn), $articlesUsed))
                        {
                            if ($d >= sizeof($maxNodesAtDepth))
                                $maxNodes = end($maxNodesAtDepth);
                            else
                                $maxNodes = $maxNodesAtDepth[$d];

                            if (sizeof($currentDepth[$parentname]->children) < $maxNodes)
                            {
                                // Check to see if the strength is cached or not.  If not, calculate it now and cache it.
                                if ($this->final && $d == 0 && $strength == 0)
                                    $childstr = $this->calculateStrength($parentname, $childn); // PROBLEM: This doesn't resort again! So you have truly nondeterministic ordering the first time around

                                if ($this->debug)
                                    echo $d . $parentname . $childn . '<br/>';

                                $articlesUsed[] = strtolower($childn);

                                $next = new Node($childn, $childstr);

                                $nextDepth[strtolower($childn)] = $next;
                                $currentDepth[$parentname]->children[] = $next;
                            }
                        }
                    }
                    else    // we have ourselves a redirect
                    {
                        $parent = $row['Article'];
                        $redir = $row['RelatedArticle'];

                        $lowerparent = strtolower($parent);

                        $nodeInQuestion = $currentDepth[$lowerparent];

                        if (!$nodeInQuestion->redirected)
                        {
                            if (strcasecmp($parent, $article) == 0)
                                $article = $redir;

                            if ($this->debug)
                                echo "Redirect: $parent -> $redir<br/>";

                            unset($currentDepth[$lowerparent]);

                            $nodeInQuestion->name = $redir;  // okay, fix the redirect.
                            $nodeInQuestion->redirected = true; // ensure we don't loop on redirects
                            unset($nodeInQuestion->children);

                            $currentDepth[strtolower($redir)] = $nodeInQuestion;

                            //$articlesUsed[] = $lowerparent;
                            //$articlesUsed[] = strtolower($redir);

                            $anyRedirects = true;
                        }
                    }
                }


                if ($anyRedirects)  // we've seen at least one redirect, so we need to redo this layer
                {
                    foreach ($nextDepth as $key => $val)   // since we're redoing the layer, discard children
                    {
                        if ($this->debug)
                            echo "Removing children: $key<br/>";
                        unset($articlesUsed[array_search(strtolower($key), $articlesUsed)]);
                    }

                    $nextDepth = $currentDepth; // start the layer over, with the redirects taken care of
                    $d--;


                    if ($this->debug)
                    {
                        echo "Remaining articles: ";
                        foreach ($articlesUsed as $key)
                            echo $key . " ";
                        echo "<br/>";
                    }
                }

                if (sizeof($nextDepth) == 0)    // no results
                    return null;
            }
        }

        $this->closeSQL();

        $root = $this->fillTree($root, $maxNodesAtDepth, 0, $maxDepth);

        return $root;
    }

    /*
     * generateRelevancyTree doesn't return a "full" tree
     * That is, if a node has no children, it doesn't make "dummy children"
     * This function makes those dummy children so there aren't gaps
     * when we serialize a tree
     */

    private function fillTree($current, $maxNodesAtDepth, $depth, $maxDepth)
    {
        if ($current == null || $depth >= $maxDepth)
            return null;

        $emptynode = new Node(" ");

        if ($depth >= sizeof($maxNodesAtDepth))
            $maxNodes = end($maxNodesAtDepth);
        else
            $maxNodes = $maxNodesAtDepth[$depth];

        while (sizeof($current->children) < $maxNodes)
            $current->children[] = $emptynode;

        foreach ($current->children as $key => $child)
            $child = $this->fillTree($child, $maxNodesAtDepth, $depth + 1, $maxDepth);

        return $current;
    }

    /**
     * @method This takes the output of generateRelevancyTree
     * And serializes it in a form easily passed between formats.
     * That is, as a string.
     * "//" delimits a new level in the tree, "|" separates nodes, and "||"
     * separates nodes from different parents.
     * @param Node $root Root node of the tree
     * @param int $maxDepth how deep the tree goes
     * @return String tree in serialized format
     */
    private function serializeTree($root, $maxDepth)
    {
        $bar = new Node("|");
        $newlevel = new Node("//");

        $nodes[] = $root;
        $nodes[] = $newlevel;

        $s = "";

        while (sizeof($nodes) > 0)
        {
            $next = array_shift($nodes);

            if ($next == $newlevel)
            {
                if (sizeof($nodes) > 0) // causing // on last one
                    array_push($nodes, $newlevel);
            }

            $s .= $next->name;

            if ($next == $newlevel || $next == $bar)
                continue;

            $ch = array_values($next->children);

            for ($i = 0; $i < sizeof($ch); $i++)
            {
                array_push($nodes, $ch[$i]);
                if ($i + 1 < sizeof($ch))
                    array_push($nodes, $bar);
                else if ($nodes[0] != $newlevel)
                {
                    array_push($nodes, $bar);
                    array_push($nodes, $bar);
                }
            }
        }

        return substr(str_replace("||//", "//", $s), 0, -2);
    }

    /**
     * Calculates strength of two articles and caches it.  Use this only if the strength isn't already cached.
     * @param string $article The article in question
     * @param string $relatedArticle The related article to find relation strength with respect to
     * @return double The strength between $article and $relatedArticle
     */
    private function calculateStrength($article, $relatedArticle)
    {
        if (!$this->final)
            die("Should only try using calculateStrength with final database");
        
        // Get first set of words and put them in $difference (associative array)
        $result = mysql_query("SELECT * FROM WordCounts WHERE Article = '" . mysql_real_escape_string($article) . "'");
        while ($row = mysql_fetch_array($result))
            $difference[$row['Word']] = $row['Occurrences'];

        // Get second set of words and calculate difference
        $result = mysql_query("SELECT * FROM WordCounts WHERE Article = '" . mysql_real_escape_string($relatedArticle) . "'");
        while ($row = mysql_fetch_array($result))
        // Not the best coding style, but its speeds things up.  This assumes that an undefined index == 0.
            $difference[$row['Word']] -= $row['Occurrences'];

        // Calculate length of distance vector
        $distance = 0.0;
        foreach ($difference as $val)
            $distance += pow(log(abs($val) + 1), 2);

        if ($this->debug)
            echo 'distance between (' . $article . ', ' . $relatedArticle . '): ' . $distance . '<br/>';

        // Cache distance value
        mysql_query("UPDATE ArticleRelations SET Strength = " . $distance . " WHERE Article = '" . mysql_real_escape_string($article) . "' AND RelatedArticle = '" . mysql_real_escape_string($relatedArticle) . "'");

        return $distance;
    }

    /**
     * @method Returns a single row. Expects that there will only be one
     *          such row, otherwise behavior undefined.
     * @param string $table The table to query
     * @param string $article The unique article name you're interested in
     * @param string $column The field you're interested in
     * @return string (?)
     */
    private function getSpecificRowColumn($table, $article, $column)
    {
        $row = $this->getUniqueRow($table, $article);
        if ($row == null)
        {
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
            die("Only use getUniqueRow when article=" . $article . " is unique.");

        return mysql_fetch_array($result);
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

        $result = mysql_query("SELECT * FROM " . $table . " WHERE Article = '" . mysql_real_escape_string($article) . "'")
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
     * Closes our mySQL connection.
     */
    private function closeSQL()
    {
        mysql_close();
    }

    /**
     * @param string $article article we are looking for in the cache
     * @param int $maxDepth the maximum depth of the tree
     * @return tree string or empty string if article & maxDepth does not exist in cache
     */
    public function isCached($article, $maxDepth, $numNodes)
    {
        $this->openSQL();
        $result = mysql_query("SELECT Tree FROM TreeCache WHERE Article = '" . mysql_real_escape_string($article) . "' AND MaxDepth = " . mysql_real_escape_string($maxDepth) . " AND DepthArray = '" . mysql_real_escape_string($numNodes) . "'") or die(mysql_error());

        $result_array = mysql_fetch_array($result);
        return $result_array[0];
    }

}
?>
