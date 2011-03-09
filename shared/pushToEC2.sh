#!/bin/bash

hg clone https://cse403-wi11-wikimap.googlecode.com/hg/ cse403-wi11-wikimap 
scp -i cse403.pem -r cse403-wi11-wikimap/ui/* bitnami@184.72.224.72:../../opt/bitnami/apache2/htdocs
rm -r cse403-wi11-wikimap
