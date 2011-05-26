#!/bin/bash

mysql -h cse403.cdvko2p8yz0c.us-east-1.rds.amazonaws.com \
 $1 -P 3306 -u cse403 -p
