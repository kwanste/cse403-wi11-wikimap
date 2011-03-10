#!/bin/sh

# This script unzips and moves WikiMap UI files to a web folder
# for immediate hosting on your web server.
#
# All other back-end files (UI folder inclusive) are installed
# to a wikimap directory.
#
# The default web_folder value is 'www' but can be changed
# (if necessary) to public_html or your web server's equivalent.
#
# It assumes you want to install the Wikimap Source distro or the binary
# distro, but not both.  If both exist, you will be warned and the
# source distro will overwrite the binary distro.

# Location of distribution
download_url="http://www.kimberlykoenig.com/files/wikimap/wikimap_source.zip"

# Filenames - change this if the distribution filenames change
source_distro="wikimap_source"
binary_distro="wikimap_binary"

# Extensions - change this if the distribution filetype changes
extension=".zip"

# Folder names
web_folder="www"          # change this if your web server requires a different folder name
sub_folder="ui"           # subdirectory that contains UI components
backend_folder="wikimap"  # change this if you want back-end components to install to a different directory

# Messages - don't change these
copy_msg="Copying WikiMap files..."
webfolder_make_msg="Creating $web_folder directory for WikiMap installation..."
backendfolder_make_msg="Creating $backend_folder directory for WikiMap installation..."
notfound_msg="Installation failed: files named ${source_distro}.zip or ${binary_distro}.zip were expected, but not found."
success_msg="Installation complete: WikiMap successfully installed to $web_folder and $backend_folder directories."
clean_msg="Cleaning up installation files..."
warning_msg="Warning: both ${source_distro}.zip and ${binary_distro}.zip exist. Only ${source_distro}.zip will be installed."

# download the file specified
wget $download_url

# check to see if both files are absent
if [ ! -f ${source_distro}${extension} -a ! -f ${binary_distro}${extension} ];
then
    echo $notfound_msg
    exit 1
fi
# make front-end directory if it does not already exist
if [ ! -d $web_folder ];
then
        # create web folders
        echo $webfolder_make_msg
        mkdir $web_folder
fi

# make back-end directory if it does not already exist
if [ ! -d $backend_folder ];
then
    # create folder
    echo $backendfolder_make_msg
    mkdir $backend_folder
fi

# install the source distribution if it is found
if [ -f ${source_distro}${extension} ];
then
      then
       unzip ${source_distro}${extension}
       # copy Wikimap UI files into existing web folder
       echo $copy_msg
       cp -a ${source_distro}/${sub_folder}/ $web_folder
       # copy Wikimap back-end files into back-end folder
       cp -a ${source_distro}/* $backend_folder
       # remove the folder created by the unzip process
       echo $clean_msg
       rm -r $source_distro
else
       # install the binary distribution
       if [ -f ${binary_distro}${extension} ];
       then
               unzip ${binary_distro}${extension}
               # copy Wikimap UI files into existing web folder
               echo $copy_msg
               cp -a ${binary_distro}/${sub_folder}/ $web_folder
               # copy Wikimap back-end files into back-end folder
               cp -a ${binary_distro}/* $backend_folder
               # remove the folder created by the unzip process
               echo $clean_msg
               rm -r $binary_distro
        fi
fi
echo $success_msg
exit 0