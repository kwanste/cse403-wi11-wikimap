#!/bin/bash

mkdir wiki_dumps
mkdir word_counts
mkdir related_articles

chmod 744 cleanupscript.sh

for i in {1..14}
do
    wikiName="enwiki-latest-pages-articles$i.xml.bz2"
    parseName="enwiki-latest-pages-articles$i.xml"
    wordName="word_counts/enwiki-latest-pages-articles${i}_BatchCountInsert.sql"
    relationName="related_articles/enwiki-latest-pages-articles${i}_BatchInsert.sql"

    echo $wikiName
    echo $wordName
    echo $relationName
    #download wiki dumps
    ./wikiDownloader.sh $wikiName
    #parse file
    echo "Parsing file"
    java -jar ../build/parser.jar $parseName
    ./cleanupscript.sh $wordName
    echo ")" >> $wordName
    ./cleanupscript.sh $relationName
done
