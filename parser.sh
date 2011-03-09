#!/bin/bash

mkdir wiki_dumps
mkdir word_counts
mkdir related_articles


for i in {1..14}
do
    wikiName="enwiki-latest-pages-articles$i.xml.bz2"
    parseName="enwiki-latest-pages-articles$i.xml"
    #echo $wikiName
    #echo $parseName
    #download wiki dumps
    logic/wikiDownloader.sh $wikiName
    #parse file
    java -jar build/parser.jar $parseName
done
