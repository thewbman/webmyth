#!/usr/bin/python
#
# Original script impsired by Kyle Stoneman from http://www.legatissimo.info/node/355
# Modified beyond recognition for use in WebMyth   http://code.google.com/p/webmyth/
#
# This file needs to be saved on a local webserver in the 'cgi-bin' folder
# On my system running Ubuntu 9.10 (Karmic) the file is saved in /usr/lib/cgi-bin/ and is accessable as http://my-server/cgi-bin/webmyth.py
# This files needs to be accesible without authentication on the webserver
#
# You will also need to have a working copy of python installed on the server
#
# This script replaces previous scripts used by webmyth (remote.py and webmyth-mysql.php)
#
# You need to setup this configuration for your specifc setup - you can find these values in /etc/mythtv/mysql.txt
#

myDBHostName = 'localhost'
myDBName = 'mythconverg'
myDBUserName = 'mythtv'
myDBPassword = 'mythtv'

#
# end of configuration
#

version = 4

import cgi
import cgitb
import time
import json
import string
import os
import sys
#cgitb.enable()
from telnetlib import Telnet
from MythTV import MythDB, MythBE, Frontend, MythVideo, MythXML, MythLog, MythError, Video, ftopen


form = cgi.FieldStorage()

MythLog._setlevel('none')
#mythDB = MythDB()
mythDB = MythDB(args=(('DBHostName',myDBHostName),('DBName',myDBName),('DBUserName',myDBUserName),('DBPassword',myDBPassword)))
mythXML = MythXML()
mythVideo = MythVideo()

try :
	myBackend = form['backend'].value
	mythBE = MythBE(myBackend)
except KeyError:
	mythBE = MythBE()


createJson = 0
header = 'json'


ext2conttype = {"jpg": "image/jpeg",
				"jpeg": "image/jpeg",
				"png": "image/png",
				"gif": "image/gif", 
				"mp3": "audio/mpeg",
				"avi": "video/avi",
				"mpg": "video/mpeg",
				"mp4": "video/mpeg"}		


def content_type(filename):
	return ext2conttype[filename[filename.rfind(".")+1:].lower()]



try :
	op = form['op'].value
except KeyError:
	op = 'Missing'
	

	
if op == 'getScriptVersion':
	#return script version
	result = version
	
elif op == 'getFile':
	header = 'file'
	filename = form['filename'].value
	dir = form['dir'].value

elif op == 'downloadFile':
	header = 'download'
	filename = form['filename'].value
	dir = form['dir'].value
	
elif op == 'getPremadeImage':
	header = 'file'
	
	chanid_in = form['chanid'].value
	starttime_a = form['starttime'].value
	
	starttime_b = string.replace(starttime_a, '-', '')
	starttime_c = string.replace(starttime_b, ':', '')
	starttime_in = string.replace(starttime_c, ' ', '')
	
	
	filename = mythBE.getCheckfile(mythBE.getRecording(int(chanid_in), int(starttime_in)))+'.png'
	dir = '/'
	
elif op == 'getUpcoming':
	#asking for upcoming recordings - will record
	createJson = 1
	alldata = mythBE.getUpcomingRecordings()
	
elif op == 'getPending' :
	#asking for pending - matches recording rule
	createJson = 1
	alldata = mythBE.getPendingRecordings()
	
elif op == 'getScheduled' :
	#asking for scheduled - scheduled to recored
	createJson = 1
	alldata = mythBE.getScheduledRecordings()
	
elif op == 'getRecorded' :
	#asking for recorded programs
	createJson = 1
	alldata = mythBE.getRecordings()

elif op == 'getExpiring' :
	createJson = 1
	alldata = mythBE.getExpiring()

elif op == 'getStorageGroup' :
	#get all storage groups
	createJson = 1
	alldata = mythDB.getStorageGroup()

elif op == 'getChannels' :
	createJson = 1
	alldata = mythDB.getChannels()

elif op == 'getRecorderList' :
	result = mythBE.getRecorderList()

elif op == 'getFreeRecorderList' :
	result = mythBE.getFreeRecorderList()

elif op == 'getCurrentRecording' :
	createJson = 2
	recorder = form['recorder'].value

	alldata = mythBE.getCurrentRecording(recorder)

elif op == 'isRecording' :
	recorder = form['recorder'].value

	result = mythBE.isRecording(recorder)

elif op == 'isActiveBackend' :
	host = form['host'].value

	result = mythBE.isActiveBackend(host)

elif op == 'getFreeSpace' :
	createJson = 1

	alldata = mythBE.getFreeSpace(1)

elif op == 'getLoad' :
	#createJson = 2

	result = mythBE.getLoad()

elif op == 'getUptime' :

	result = mythBE.getUptime()

elif op == 'getVideos':
	#asking for all videos
	createJson = 1
	
	alldata = mythVideo.searchVideos(insertedafter='1900-01-01 00:00:00')
	#alldata = mythVideo.searchVideos(insertedafter='2010-08-30 00:08:09')

elif op == 'getVideoData':
	#asking for a single video data
	createJson = 2
	
	filename = form['filename'].value
	
	alldata = mythVideo.getVideo(file=filename)
	#alldata = mythVideo.searchVideos(insertedafter='2010-08-30 00:08:09')

elif op == 'getVideo':
	#asking for a single video file
	header = 'filePointer'
	
	filename = form['filename'].value
	
	vid = mythVideo.getVideo(file=filename)
	
	myFile = vid.open()
	#alldata = mythVideo.searchVideos(insertedafter='2010-08-30 00:08:09')

elif op == 'getVideoScreenshot':
	#asking for a single video screenshot
	header = 'filePointer'
	
	filename = form['filename'].value
	
	vid = mythVideo.getVideo(file=filename)
	
	myFile = vid.openScreenshot()
	#alldata = mythVideo.searchVideos(insertedafter='2010-08-30 00:08:09')

elif op == 'getVideoFanart':
	#asking for a single video screenshot
	header = 'filePointer'
	
	filename = form['filename'].value
	
	vid = mythVideo.getVideo(file=filename)
	
	myFile = vid.openFanart()
	#alldata = mythVideo.searchVideos(insertedafter='2010-08-30 00:08:09')
	
elif op == 'scanVideos':
	#scns video storage groups on all backends
	
	videoData = mythVideo.scanStorageGroups()
	
	result = "scanned storage groups"
	
elif op == 'getRecording' :
	#asking for a singled recorded program
	createJson = 2
	
	chanid_in = form['chanid'].value
	starttime_a = form['starttime'].value
	
	starttime_b = string.replace(starttime_a, '-', '')
	starttime_c = string.replace(starttime_b, ':', '')
	starttime_in = string.replace(starttime_c, ' ', '')
	
	alldata = mythBE.getRecording(int(chanid_in), int(starttime_in))

elif op == 'getCheckfile' :
	# requires a single recording input method

	chanid_in = form['chanid'].value
	starttime_a = form['starttime'].value
	
	starttime_b = string.replace(starttime_a, '-', '')
	starttime_c = string.replace(starttime_b, ':', '')
	starttime_in = string.replace(starttime_c, ' ', '')
	
	result = mythBE.getCheckfile(mythBE.getRecording(int(chanid_in), int(starttime_in)))
	
elif op == 'getSetting' :
	#asking for a XML setting
	try :
		result = mythXML.getSetting(form['setting'].value, form['host'].value)
	except KeyError:
		result = mythXML.getSetting(form['setting'].value)
	
	#result = "getSettings currently not working"
	
elif op == 'getFrontends' :
	#asking for all frontends
	#initialresult = mythDB.getFrontends()
	
	result = "getFrontends not currently working"
	#result = initialresult[len(initialresult) - 1]

elif op == 'getServDesc' :

	result = mythXML.getServDesc()
	
elif op == 'getHosts' :
	#asking for all hosts - error-proof way to get all hosts
	initialresult = mythXML.getHosts()
	#count = 0
	
	result = string.replace(str(initialresult), "'", '"')
	result = string.replace(result, '[', '[ { "hostname": ')
	result = string.replace(result, ',', ', "port": "6546" }, { "hostname": ')
	result = string.replace(result, ']', ', "port": "6546" } ]')

elif op == 'getKeys' :
	#not sure what this is - just seems to list all keys but cannot execute

	result = mythXML.getKeys()


#try getSetting from XML

elif op == 'getProgramGuide' :
	#createJson = 1

	endtime_a = form['endtime'].value
	starttime_a = form['starttime'].value
	
	endtime_b = string.replace(endtime_a, '-', '')
	endtime_c = string.replace(endtime_b, ':', '')
	endtime_in = string.replace(endtime_c, ' ', '')
	
	starttime_b = string.replace(starttime_a, '-', '')
	starttime_c = string.replace(starttime_b, ':', '')
	starttime_in = string.replace(starttime_c, ' ', '')

	alldata = mythXML.getProgramGuide(int(starttime_in), int(endtime_in))

	#result = "getProgramGuide currently does not work"
	
elif op == 'remote':
	#remote to frontend
	try :
		type = form['type'].value
	except KeyError:
		type = 'unknown'
	
	host = form['host'].value
	command = string.replace(form['cmd'].value,"+", " ")
	
	frontend = mythDB.getFrontend(host)
	
	if type == 'key' :	
		frontend.sendKey(command)
		result = '{ "value" : "success" }'
	elif type == 'jump' :
		frontend.sendJump(command)
		result = '{ "value" : "success" }'
	elif type == 'query' :
		result = frontend.sendQuery(command)
	elif type == 'play' :
		frontend.sendPlay(command)
		result = '{ "value" : "success" }'
	else :
		result = '{ "value" : "ERROR - need to supply type or remote call" }'
		
else :
	#op parameter was not given
	result = "unknown"

	
if createJson == 1 :
	count = 0
	result = '[ '
	while (count < len(alldata)) :
		result += '{ "'
		singledata = alldata[count]
		for key,value in singledata.items():
			#try:
				#print value
			result += str(key)
			result += '": "'
			try :
				result += string.replace(str(value), '"', '')
			except UnicodeEncodeError :
				result += 'ERROR - unicode encooding error'
			result += '", "'
		result = result[:-3]
		result += ' }, \n'
		count = count+1

	result = result[:-3]
	result += ' ]'

elif createJson == 2 :
	count = 0
	singledata = alldata
	result = '[ { "'
	for key,value in singledata.items():
		result += str(key)
		result += '": "'
		try :
			result += string.replace(str(value), '"', '')
		except UnicodeEncodeError :
			result += 'ERROR - unicode encooding error'
		result += '", "'
	result = result[:-3]
	result += " } ]"

#


if header == 'json' :
	print "Content-type: application/json"
	print ""
	print result
elif header == 'file' :
	print "Content-type: %s " % (content_type(dir+filename))
	print "Content-Length: %d " % int(os.path.getsize(dir+filename))
	print ""
	print file(dir+filename, "r").read()
elif header == 'filePointer' :
	print "Content-type: %s " % (content_type(myFile))
	#print "Content-Length: %d " % int(os.path.getsize(file))
	print ""
	print myFile
elif header == 'download' :
	print "Content-type: application/octet-stream; name=%s " % filename
	print "Content-Disposition: attachment; filename=%s " % filename
	print "Content-Length: %d " % int(os.path.getsize(dir+filename))
	print ""
	#print str(os.path.getsize(dir+filename))
	print file(dir+filename, "r").read()
	