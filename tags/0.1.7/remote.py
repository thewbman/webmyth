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
version = 1

import cgi
import cgitb
cgitb.enable()
from telnetlib import Telnet

form = cgi.FieldStorage()

command = form['cmd'].value
host = form['host'].value

connection = Telnet(host, 6546)
connection.read_until('#', 0.5)
connection.write(command + '\r\n')

result = connection.read_until('\r', 0.5)

print "Content-type: text/plain"
print ""
print result
