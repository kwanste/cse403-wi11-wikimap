#!/bin/bash

hg pull -u
scp -r ui/* iprojsrv.cs.washington.edu:../../inetpub/wwwroot/.

