#!/usr/bin/python
#
# Original script (C) Kyle Stoneman from http://www.legatissimo.info/node/355
# Modified and inlcuded as part of WebMyth app with permission

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
