/*
 *   WebMyth - An open source webOS app for controlling a MythTV frontend. 
 *   http://code.google.com/p/webmyth/
 *   Copyright (C) 2010  Wes Brown
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this program; if not, write to the Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

var telnetClass = Class.create({
	initialize: function() {
	}
});


function createHostnameDb() {
	//Create DB or open it is exists.
	
	var newDb = openDatabase('hostnames', "0.1", "Hostname DB");
	
	newDb.transaction(function(tx1) {
    tx1.executeSql('CREATE TABLE IF NOT EXISTS hosts(id INTEGER PRIMARY KEY, hostname TEXT, port INTEGER, ipChar TEXT)', 
      []);
    });
	
	return newDb;
	
};

function is_int(value){
	  if((parseFloat(value) == parseInt(value)) && !isNaN(parseInt(value))){
	      return true;
	 } else {
	      return false;
	 }
};

function openTelnet(telnetPlug, hostname, port) {
	//Start telnet communication
	Mojo.Controller.errorDialog("Connecting to %s", $('telnetPlug'));
	telnetPlug.OpenTelnetConnection(hostname, port);
	Mojo.Log.info("Opened telnet connection to %s", hostname);
};

function sendKey(telnetPlug, value) {
	//Send key command to telnet host
	sendCommand(telnetPlug, "key "+value);
};

function sendCommand(telnetPlug, value) {
	//Send command to telnet host
	$('telnetPlug').SendTelnet(value);
	
	Mojo.Log.info("Sending command '%s' to host", value);
};

function sendCommandwithReply(telnetPlug, value) {
	//Not currently working ...
	var response = telnetPlug.SendTelnetWithReply(value);
	//var reponse = "response";
	
	return response;
};

function closeTelnet(telnetPlug) {
	//Close out telnet connection
	telnetPlug.CloseTelnetConnection();
	
	Mojo.Log.info("Closing telnet connection");
};

function defaultCookie() {
	var newCookieObject = {
		webserverName: '',
		allowMetrix: true
	};
	
	return newCookieObject;
};
