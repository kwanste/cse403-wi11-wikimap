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
source_distro="wikimap_source"
binary_distro="wikimap_binary"

# Folder names - change this if your web server requires a different folder name
web_folder="www"
backend_folder="wikimap"

# Messages - don't change these
copy_msg="Copying WikiMap files into $web_folder"
make_msg="Directory $web_folder does not exist: creating $web_folder for WikiMap installation"
notfound_msg="A file named ${source_distro}.zip or ${binary_distro}.zip was expected, but not found."
success_msg="Installation Complete: WikiMap was successfully installed to the $web_folder directory"
clean_msg="Cleaning up installation files"

if [ ! -d $web_folder ];
then
	# create web folder
	echo $make_msg
	mkdir www
else
	if [ -f ${source_distro}.zip ];
	then
		# copy Wikimap UI files into existing web folder
        echo $copy_msg
		cp -a ${source_distro}/wikimap_ui/ $web_folder
		# copy Wikimap back-end files into back-end folder
		cp -a ${source_distro}/* $backend_folder
		# remove the folder created by the unzip process
		echo $clean_msg
		rm -r $source_distro
	else
		if [ -f ${binary_distro}.zip ];
		then
			# copy Wikimap UI files into existing web folder
			echo $copy_msg
			cp -a ${source_distro}/wikimap_ui/ $web_folder
			# copy Wikimap back-end files into back-end folder
			cp -a ${binary_distro}/* $backend_folder
			# remove the folder created by the unzip process
			echo $clean_msg
			rm -r $binary_distro
		else
			# no files found
			echo $notfound_msg
			exit 1
		fi
	fi
fi
echo $success_msg
exit 0