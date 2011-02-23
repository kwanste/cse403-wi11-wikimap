#!/bin/bash

rm -r wikimap
hg clone https://cse403-wi11-wikimap.googlecode.com/hg/ wikimap 
cd wikimap
find . -name "*.java" -print -exec $JAVA_HOME/bin/javac -cp .:$CLASSPATH '{}' \;
