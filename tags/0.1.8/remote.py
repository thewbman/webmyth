#!/usr/bin/python
#
# Original script (C) Kyle Stoneman from http://www.legatissimo.info/node/355
# Modified and inlcuded as part of WebMyth app with permission
#
# This file needs to be saved on a local webserver in the 'cgi-bin' folder
# On my system running Ubuntu 9.10 (Karmic) the file is saved in /usr/lib/cgi-bin/ and is accessable as http://my-server/cgi-bin/remote.py
# This files needs to be accesible without authentication on the webserver
#
# You will also need to have a working copy of python installed on the server
#
version = 2

import cgi
import cgitb
import time
cgitb.enable()
from telnetlib import Telnet

form = cgi.FieldStorage()

command = form['cmd'].value
host = form['host'].value
try:
	port = form['port'].value
except KeyError:
	port = 6546

try:
	connection = Telnet(host, port)
	connection.read_until('#', 0.5)
	connection.write(command + '\r\n')

	result = connection.read_until('#', 0.5)

	time.sleep(1)

	connection.write('exit\r\n')
except IOError as err:
	result = 'ERROR ' + err.strerror + '...'


print "Content-type: text/plain"
print ""
print result[:-3]
