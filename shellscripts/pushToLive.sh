#!/bin/bash

hg clone https://cse403-wi11-wikimap.googlecode.com/hg/ cse403-wi11-wikimap 
scp -r cse403-wi11-wikimap/ui/* iprojsrv.cs.washington.edu:../../inetpub/wwwroot/.
rm -r cse403-wi11-wikimap
