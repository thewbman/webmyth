Download app here: http://developer.palm.com/appredirect/?packageid=com.thewbman.webmyth

Script (required for WebMyth classic, optional for WebMyth): http://code.google.com/p/webmyth/downloads/list
_Note: the old script versions are also on that page as depreciated downloads_

The app supports downloading (transcoded) recordings to the phone: http://code.google.com/p/webmyth/wiki/DownloadAndStreaming

Optional MythWeb module for providing XML data: https://sites.google.com/a/thewhytehouse.org/mythtv/modification/mythxmlmoduleformythweb

# WebMyth #
An open source webOS app for controlling a MythTV frontend.

## Overview ##
WebMyth is able to control a MythTV frontend using it's built in network control interface. MythTV is an opensource DVR program that runs on Linux.  The app is designed to control a frontend over a local WiFi connection, though it is possible to forward the appropriate port on your router and control the frontend over a cellular network.

For users of WebMyth Classic the app requires installing one small script on a local webserver that the app communicates with.  The script is here: http://code.google.com/p/webmyth/downloads/list.  The 'webmyth.py' script needs to be installed on a webserver and be executable (i.e. in /usr/lib/cgi-bin/). By default the app expects webmyth.py to be in the /cgi-bin/ folder of the webserver, but this can be changed in the app preferences if desired.  The script needs to be accessible on the webserver with either Basic authentication or no authentication - Digest authentication is not supported (versions 0.3.8 and below required no authentication).  You can restrict access in apache to just your phone's IP address if desired for security purposes.  For devices running webOS 2.x the app has a built-in plugin that makes using the script optional.

MythTV is a very powerful DVR system, but setting up a MythTV system is not a trivial process.  If you are interested in setting up a MythTV system, check out the MythTV Wiki.  http://www.mythtv.org/wiki/Main_Page.

## Requirements ##
  * Working MythTV system. The script requires MythTV to be 0.23 due to changes in the python bindings.  If you are running an older version of MythTV you can try contacting the developer for some possible workarounds.  The regular WebMyth app with the plugin should work for all MythTV versions.
  * The MythTV python bindings must be installed on the computer where the script is installed.  If you don't already have the python bindings try downloading them from your normal package manager or try the method shown here: http://www.gossamer-threads.com/lists/mythtv/dev/389569
  * Currently the script requires MythVideo to be installed on your system.  If you do not have MythVideo installed you can comment out the lines in the script that include the function "MythVideo(...)" if you do not want to install MythVideo
  * Network control interface setup on the frontend(s) you wish to control. http://www.mythtv.org/wiki/Telnet_socket
  * Server script installed on local webserver
  * A Palm/HP webOS device.  Due to the app catalog restrictions the full WebMyth app is officially not available for devices running webOS 1.x, but it can be manually downloaded and installed without any problems.  Only the WebMyth Classic is available for devices on 1.x and that app version requires the script.

## Known Issues ##
  * Assumes default keymap for use for all frontends

## Planned features in future releases ##
  * Major development for the app is complete, only large bug fixes or compatibility fixes will be done
  * You can see a rough list of possible future improvements here: http://code.google.com/p/webmyth/source/browse/trunk/webmyth/todo.txt

## Getting Help ##
  * If you are having trouble with the app try checking out the FAQs page.  http://code.google.com/p/webmyth/wiki/FAQs
  * If all else fails, you can try shooting me an email to [webmyth.help@gmail.com](mailto:webmyth.help@gmail.com?subject=WebMyth+Support) or contact me on twitter [@webmyth\_dev](http://twitter.com/webmyth_dev).

## Donations ##
  * I don't want any donations myself.  But if you would like to donate you can donate to the WebOS Internals group.  They are a phenomenal group who have done so much for the WebOS community.  I am not personally affiliated with them in any way but think they deserve all the support they can get.  http://www.webos-internals.org/wiki/WebOS_Internals:Site_support

**_NOTE:_** WebMyth uses Metrix for some basic analytics.  The analytics are only used to provide basic information on the total number of users for the app and their country of usage.  http://metrix.webosroundup.com/privacy.
The app will not submit any information to Metrix on its first run.  The app will start submitting anonymous information with the second run of the app unless it is specifically disabled in the app's preferences.