#!/bin/sh

# This script unzips and moves all Wikimap files to a directory
# for pushing directly to the internet on your web server.  
# The default web_folder value is 'www' but can be changed 
# (if necessary) to public_html or your web server's equivalent.
#
# It assumes you want to install the Wikimap Source distro or the binary
# distro, but not both.  If both exist, the Binary distro will overwrite
# the Source distro.

# Filenames - change this if the distribution filenames change
source_distro="wikimap_source_distribution"
binary_distro="wikimap_binary_distribution"

# Folder names - change this if your web server requires a different folder name
web_folder="www"

# Messages - don't change these
copy_msg="Directory $web_folder already exists: copying WikiMap files into $web_folder"
make_msg="Directory $web_folder does not exist: creating $web_folder for WikiMap installation"
notfound_msg="A file named ${source_distro}.zip or ${binary_distro}.zip was expected, but not found."
success_msg="Installation Complete: WikiMap was successfully installed to the $web_folder directory"

if [ -f ${source_distro}.zip ];
then
    unzip ${source_distro}.zip
    # does web_folder already exist?
    if [ -d $web_folder ];
    then
        # copy Wikimap files into existing web folder
        echo $copy_msg
        cp -a ${source_distro}/* $web_folder
		# remove the folder created by the unzip process
		rm -r $source_distro
    else
        # rename Wikimap directory to web folder name
        echo $make_msg
        mv $source_distro $web_folder
    fi
else
# source distribution was not found, look for binary distribution
    if [ -f ${binary_distro}.zip ];
    then
        unzip ${binary_distro}.zip
        # does web_folder already exist?
        if [ -d $web_folder ];
        then
            # copy wikimap files into existing web folder
            echo $copy_msg
            cp -a ${binary_distro}/* $web_folder
			# remove the folder created by the unzip process
            rm -r $binary_distro
        else
            # rename WikiMap directory to web folder name
            echo $make_msg
            mv $binary_distro $web_folder
        fi
    else
        echo $notfound_msg
        exit 1
    fi
fi
echo $success_msg
exit 0
