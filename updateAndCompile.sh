#!/bin/bash

rm -r wikimap
hg clone https://cse403-wi11-wikimap.googlecode.com/hg/ wikimap 
cd wikimap
make && java -jar wikimap.jar
