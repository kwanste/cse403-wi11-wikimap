#!/bin/bash

sed '$s/.$//' $1 > test.sql
sed '$s/.$//' test.sql > $1
