#!/bin/bash

hg clone https://cse403-wi11-wikimap.googlecode.com/hg/ wikimap 
cd wikimap
javac *.java

if [ $? -eq 0 ]
then
  echo "compile worked!"
fi
