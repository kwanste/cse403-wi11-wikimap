#!/bin/bash

link="http://dumps.wikimedia.org/enwiki/latest/"
complete_url="${link}$1"
wget $complete_url
mv $1 wiki_dumps/
bunzip2 wiki_dumps/$1
