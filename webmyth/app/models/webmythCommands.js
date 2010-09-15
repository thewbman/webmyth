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
	

	try {
	/*
	//Hosts (frontends) table
	newdb.transaction(function(tx1) {
    tx1.executeSql('CREATE TABLE IF NOT EXISTS hosts(id INTEGER PRIMARY KEY, hostname TEXT, port INTEGER, ipChar TEXT)', 
      []);
    });
	*/
	
	//Recorded table
	newdb.transaction(function(tx2) {
    tx2.executeSql('CREATE TABLE IF NOT EXISTS recorded(id INTEGER PRIMARY KEY, chanid INTEGER, starttime TEXT, endtime TEXT, title TEXT, subtitle TEXT, description TEXT, category TEXT, hostname TEXT, bookmark INTEGER, editing INTEGER, cutlist INTEGER, autoexpire INTEGER, commflagged INTEGER, recgroup TEXT, recordid INTEGER, seriesid TEXT, programid TEXT, lastmodified TEXT, filesize INTEGER, stars REAL, previouslyshown INTEGER, originalairdate TEXT, preserve INTEGER, findid INTEGER, deletepending INTEGER, transcoder INTEGER, timestretch REAL, recpriority INTEGER, basename TEXT, progstart TEXT, progend TEXT, playgroup TEXT, profile TEXT, duplicate INTEGER, transcoded INTEGER, watched INTEGER, storagegroup TEXT, bookmarkupdate TEXT,  channnum TEXT, name TEXT)', 
      []);
    });
	//Release 0.1.7 add in channel columns
	newdb.transaction(function(tx4) {
    tx4.executeSql('ALTER TABLE recorded ADD channnum TEXT', 
      []);
    });
	newdb.transaction(function(tx5) {
    tx5.executeSql('ALTER TABLE recorded ADD name TEXT', 
      []);
    });

	
	//Recgroup table for filtering of recorded table
	newdb.transaction(function(tx3) {
    tx3.executeSql('CREATE TABLE IF NOT EXISTS recgroup(groupname TEXT PRIMARY KEY, displayname TEXT)', 
      []);
    });
	} catch (err) {
		Mojo.Log.error('DB error: ' + err.message);
	}
	
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

	//These values are initiated in 'welcome' scene if not set

	var newCookieObject = {
		webserverName: '',							
		allowMetrix: true,							
		//webserverRemoteFile: '/cgi-bin/remote.py',
		//webMysqlFile: '/webmyth-mysql.php',
		webmythPythonFile: '/cgi-bin/webmyth.py',
		currentRecgroup: 'Default',
		currentRecSort: 'date-desc',
		currentFrontend: 'frontend',
		currentRemotePort: '6546',
		currentRemoteScene: 'navigation',
		previousScriptVersion: 0,
		allowRecordedDownloads: false,
		recordedDownloadsUrl: '',
		theme: 'palm-dark'
	};
	
	return newCookieObject;
};

function defaultHostsCookie() {

	//These values are initiated in 'welcome' scene if not set

	var newCookieObject = [{
		"hostname": "frontend",							
		"port": "6546"
	}];
	
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


var trimByRecgroup = function(fullList, myRecgroup) {
	
	//Check for keyword for no filtering
	if (myRecgroup == 'AllRecgroupsOn') {
		return fullList;
	} else {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if (s.recgroup == myRecgroup) {
				//Matches selected recgroup
				trimmedList.push(s);
			} else {
				//Does not match recgroup
			}
		}
		return trimmedList;
	}
};


var trimByChanidStarttime = function(fullList, chanid_in, starttime_in) {
	
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.chanid == chanid_in) && (s.starttime == starttime_in)) {
				//Matches chanid and starttime
				return s;
			} else {
				//Does not match
			}
		}
		return {};

};


var trimByEnabled = function(fullList, enabled) {
	
	//Check for remoteIsEnabled for no filtering
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if (s.remoteIsEnabled == enabled) {
				//Matches selected recgroup
				trimmedList.push(s);
			} else {
				//Does not match recgroup
			}
		}
		return trimmedList;

};


var cutoutHostname = function(fullList, myHostname) {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if (s.hostname == myHostname) {
				//Matches selected recgroup
			} else {
				//Does not match recgroup
				trimmedList.push(s);
			}
		}
		
		if(trimmedList.length == 0) {
			return defaultHostsList();
		} else {
			return trimmedList;
		}
};


var isEmpty = function(object) { 
	for(var i in object) { 
		return false; 
	};
	return true; 
};


var isoToDate = function(isoDate) { 
    
	var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "( ([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = isoDate.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    //offset -= date.getTimezoneOffset();
    time = (Number(date));
	
	return Number(time);
 
};


function doHelpEmail() {
	
	this.controller.serviceRequest(
    "palm://com.palm.applicationManager", {
        method: 'open',
        parameters: {
            id: "com.palm.app.email",
            params: {
                summary: "test subject",
                text: "Test email text.",
                recipients: [{
                    type:"email",
                    role:1,
                    value:"adsf@asdf.com",
                    contactDisplay:"Your name"
                }]
            }
        }
    }
);
	
	Mojo.Log.error("do send email");
}
