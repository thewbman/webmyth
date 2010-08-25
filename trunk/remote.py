#!/usr/bin/python

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

result = connection.read_until('#', 0.5)

if form.has_key('addr'):
	print "Location: " + form['addr'].value
	print ""
else:
	print "Content-type: text/plain"
	print ""
	print result
