/*
 *   WebMyth - An open source webOS app for controlling a MythTV frontend. 
 *   http://code.google.com/p/WebMyth/
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
	
	//Create WebMyth.db or open it is exists.
	
	var newdb = openDatabase('hostnames', "0.1", "Hostname db");
	
	//Host (frontends) table
	newdb.transaction(function(transaction) {
    transaction.executeSql('CREATE TABLE IF NOT EXISTS hosts(id INTEGER PRIMARY KEY, hostname TEXT, port INTEGER, ipChar TEXT)', 
      []);
    });
	
	
	//Recorded table
	newdb.transaction(function(transaction) {
    transaction.executeSql('CREATE TABLE IF NOT EXISTS recorded(id INTEGER PRIMARY KEY, chanid INTEGER, starttime TEXT, endtime TEXT, title TEXT, subtitle TEXT, description TEXT, category TEXT, hostname TEXT, bookmark INTEGER, editing INTEGER, cutlist INTEGER, autoexpire INTEGER, commflagged INTEGER, recgroup TEXT, recordid INTEGER, seriesid TEXT, programid TEXT, lastmodified TEXT, filesize INTEGER, stars REAL, previouslyshown INTEGER, originalairdate TEXT, preserve INTEGER, findid INTEGER, deletepending INTEGER, transcoder INTEGER, timestretch REAL, recpriority INTEGER, basename TEXT, progstart TEXT, progend TEXT, playgroup TEXT, profile TEXT, duplicate INTEGER, transcoded INTEGER, watched INTEGER, storagegroup TEXT, bookmarkupdate TEXT)', 
      []);
    });
	
	return newdb;
	
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
		webserverName: '',							//included in initial cookie version
		allowMetrix: true,							//included in initial cookie version
		webserverRemoteFile: '/cgi-bin/remote.py',
		webMysqlFile: '/webmyth-mysql.php'
	};
	
	return newCookieObject;
};


var sort_by = function(field, reverse, primer){

   reverse = (reverse) ? -1 : 1;

   return function(a,b){

       a = a[field];
       b = b[field];

       if (typeof(primer) != 'undefined'){
           a = primer(a);
           b = primer(b);
       }

       if (a<b) return reverse * -1;
       if (a>b) return reverse * 1;
       return 0;

   }
};

var double_sort_by = function(field1, field2, reverse, primer){

   reverse = (reverse) ? -1 : 1;

   return function(a,b){

       a = a[field1]+a[field2];
       b = b[field1]+b[field2];

       if (typeof(primer) != 'undefined'){
           a = primer(a);
           b = primer(b);
       }

       if (a<b) return reverse * -1;
       if (a>b) return reverse * 1;
       return 0;

   }
};
