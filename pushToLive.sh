#!/bin/bash

hg pull -u
scp ui/* wikimaps@iprojsrv.cs.washington.edu:../../inetpub/wwwroot/.

