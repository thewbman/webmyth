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
    tx2.executeSql('CREATE TABLE IF NOT EXISTS recordedXML(id INTEGER PRIMARY KEY, title TEXT, subTitle TEXT, programFlags TEXT, category TEXT, fileSize TEXT, seriesId TEXT, hostname TEXT, catType TEXT, programId TEXT, repeat TEXT, endTime TEXT, startTime TEXT, lastModified TEXT, startTimeSpace TEXT, endTimeSpace TEXT, startTimeHourMinute TEXT, endTimeHourMinute TEXT, stars TEXT, airdate TEXT, description TEXT, inputId TEXT, chanFilters TEXT, commFree TEXT, channelName TEXT, sourceId TEXT, chanId TEXT, chanNum TEXT, callSign TEXT, recPriority TEXT, playGroup TEXT, recStatus TEXT, recStartTs TEXT, recGroup TEXT, dupMethod TEXT, recType TEXT, encoderID TEXT, recProfile TEXT, recEndTs TEXT, recordId TEXT, dupInType TEXT )', 
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
    tx3.executeSql('CREATE TABLE IF NOT EXISTS recgroupXML(groupname TEXT PRIMARY KEY, displayname TEXT)', 
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
		currentRemoteScene: 'masterRemote',
		previousScriptVersion: 0,
		allowRecordedDownloads: false,
		recordedDownloadsUrl: '',
		theme: 'palm-dark',
		remoteHeaderAction: 'Pause',
		remoteVibrate: false,
		remoteFullscreen: false,
		masterBackendIp: '',
		manualMasterBackend: false,
		playJumpRemote: true,
		guideJumpRemote: false,
		showUpcomingChannelIcons: true,
		dashboardRemote: true,
		dashboardRemoteIndex: 1,
		useWebmythScript: true,
		showUpcoming: true,
		showVideos: false
		
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

function defaultHostsCookieCurrent(newName) {

	//These values are initiated in 'welcome' scene if not set

	var newCookieObject = [{
		"hostname": newName,							
		"port": "6546"
	}];
	
	return newCookieObject;
};

function defaultRemoteCookie() {

	//These values are initiated in 'welcome' scene if not set

	var newCookieObject = [
		{ "name": "navigation", "enabled": false } ,
		{ "name": "playback", "enabled": false } ,
		{ "name": "music", "enabled": false } ,
		{ "name": "flick", "enabled": true } ,
		{ "name": "masterRemote", "enabled": true } ,
		{ "name": "numberpad", "enabled": true } 
	];
	
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
			if ((s.recgroup == myRecgroup)||(s.recGroup == myRecgroup)) {
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
			if ((s.chanId == chanid_in) && (s.startTime == starttime_in)) {
				//Matches chanid and starttime
				return s;
			} else {
				//Does not match
			}
		}
		return {"chanid_in":chanid_in, "starttime_in":starttime_in};

};

var trimGuideByChanidStarttime = function(fullList, chanid_in, starttime_in) {
	
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.chanId == chanid_in) && (s.startTime.substring(0,16) == starttime_in.substring(0,16))) {
				//Matches chanid and starttime
				return s;
			} else {
				//Does not match
			}
		}
		
		return {"chanid_in": chanid_in, "starttime_in": starttime_in};

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

var cleanupBackendsList = function(fullList, masterIP) {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
			s = fullList[i];
			
			if (s.ip == "") {
				//Does not have IP address
			} else {
				//Has IP address
				if(s.ip == masterIP) {
					s.master = true;
				}
				
				trimmedList.push(s);
			}
		}
		return trimmedList;

};

var updateChannelLastUpdate = function(fullList, channid, nowDateISO) {

	var updatedList = fullList;
	var i, s;
	
	for (i = 0; i < updatedList.length; i++) {
		s = updatedList[i];
		if (s.chanId == channid) {
			//Matches selected channel id
			s.lastUpdate = nowDateISO;
		} else {
			//Does not channel id
		}
	}
	
	return updatedList;

}

var updateProgramLastUpdateFromChannels = function(fullList, channelList) {

	this.updatedList = fullList;
	
	var i, j, s, t;
	
	for(i = 0; i < updatedList.length; i++) {
		s = updatedList[i];
		
		for(j = 0; j < channelList.length; j++) {
			t = channelList[j];
			
			if (t.chanId == s.chanId) {
				//Matches selected channel id
				updatedList[i].lastUpdate = t.lastUpdate;
			} 
		}
		
	}
	
	return updatedList;

}

var updateGuideChannelsFromCookie = function(fullList, cookieList) {

	this.updatedList = fullList;
	
	var i, j, s, t;
	
	for(i = 0; i < updatedList.length; i++) {
		s = updatedList[i];
		
		for(j = 0; j < cookieList.length; j++) {
			t = cookieList[j];
			
			if (t.chanId == s.chanId) {
				//Matches selected channel id
				updatedList[i].lastUpdate = t.lastUpdate;
			} 
		}
		
	}
	
	return updatedList;
	
}

var cleanGuideChannels = function(fullList) {

	this.updatedList = [], finalList = [];
	var listLength = 10;
	
	var i, j, s, t;
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		t = { 'chanId': s.chanId, 'lastUpdate': s.lastUpdate } ;
		
		updatedList.push(t);
		
	}
	
	updatedList.sort(sort_by('lastUpdate', true));
	
	for(j = 0; j < listLength; j++) {
		finalList.push(updatedList[j]);
	}
	
	return finalList;
	
}
		
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
			return fullList;
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

var isoSpaceToJS = function(isoDate) { 
    
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

var isoToJS = function(isoDate) { 
    
	var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
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

var dateObjectToJS = function(dateObject) { 
    
    var newDate = new Date();

    newDate.setYear(dateObject.year);
    newDate.setMonth(dateObject.month - 1);
    newDate.setDate(dateObject.day);
    newDate.setHours(dateObject.hour);
    newDate.setMinutes(dateObject.minute);
    newDate.setSeconds(dateObject.second);

	
	return newDate;
 
};

var dateObjectToISO = function(dateObject) { 

	var newDate = dateObject.year;
	newDate += "-";
	if(dateObject.month.toString().length == 2) {
		newDate += dateObject.month.toString();
	} else {
		newDate += '0'+dateObject.month.toString();
	}
	newDate += "-";
	if(dateObject.day.toString().length == 2) {
		newDate += dateObject.day.toString();
	} else {
		newDate += '0'+dateObject.day.toString();
	}
	newDate += "T";
	if(dateObject.hour.toString().length == 2) {
		newDate += dateObject.hour.toString();
	} else {
		newDate += '0'+dateObject.hour.toString();
	}
	newDate += ":";
	if(dateObject.minute.toString().length == 2) {
		newDate += dateObject.minute.toString();
	} else {
		newDate += '0'+dateObject.minute.toString();
	}
	newDate += ":";
	if(dateObject.second.toString().length == 2) {
		newDate += dateObject.second.toString();
	} else {
		newDate += '0'+dateObject.second.toString();
	}
    
	return newDate;
	
};

var dateJSToISO = function(dateJS) { 

	var newDate = dateJS.getFullYear();
	newDate += "-";
	
	var month = dateJS.getMonth() + 1;
	
	if(month.toString().length == 2) {
		newDate += month.toString();
	} else {
		newDate += '0'+month.toString();
	}
	newDate += "-";
	if(dateJS.getDate().toString().length == 2) {
		newDate += dateJS.getDate().toString();
	} else {
		newDate += '0'+dateJS.getDate().toString();
	}
	newDate += "T";
	if(dateJS.getHours().toString().length == 2) {
		newDate += dateJS.getHours().toString();
	} else {
		newDate += '0'+dateJS.getHours().toString();
	}
	newDate += ":";
	if(dateJS.getMinutes().toString().length == 2) {
		newDate += dateJS.getMinutes().toString();
	} else {
		newDate += '0'+dateJS.getMinutes().toString();
	}
	newDate += ":";
	if(dateJS.getSeconds().toString().length == 2) {
		newDate += dateJS.getSeconds().toString();
	} else {
		newDate += '0'+dateJS.getSeconds().toString();
	}
    
	return newDate;
	
};

var dateJSToObject = function(dateJS) { 

	var newDate = {
		"year": dateJS.getFullYear(),
		"month": dateJS.getMonth() + 1,
		"day": dateJS.getDate(),
		"hour": dateJS.getHours(),
		"minute": dateJS.getMinutes(),
		"second": dateJS.getSeconds()
	}
    
	return newDate;
	
};

var dateObjectToDayRange = function(dateObject) { 

	var newDateStart = dateObject.year;
	newDateStart += "-";
	if(dateObject.month.toString().length == 2) {
		newDateStart += dateObject.month.toString();
	} else {
		newDateStart += '0'+dateObject.month.toString();
	}
	newDateStart += "-";
	if(dateObject.day.toString().length == 2) {
		newDateStart += dateObject.day.toString();
	} else {
		newDateStart += '0'+dateObject.day.toString();
	}
	newDateStart += "T00:00:01";
	
	var newDateEnd = dateObject.year;
	newDateEnd += "-";
	if(dateObject.month.toString().length == 2) {
		newDateEnd += dateObject.month.toString();
	} else {
		newDateEnd += '0'+dateObject.month.toString();
	}
	newDateEnd += "-";
	if(dateObject.day.toString().length == 2) {
		newDateEnd += dateObject.day.toString();
	} else {
		newDateEnd += '0'+dateObject.day.toString();
	}
	newDateEnd += "T23:59:59";
    
	return {'StartTime': newDateStart, 'EndTime': newDateEnd};
	
};

var dateObjectAddOneDay = function(dateObject) { 

	var newDate = dateObject;
	newDate.day++;
	
	switch(newDate.month) {
		case 1:		//january
			if(newDate.day == 32) {
				newDate.day = 1;
				newDate.month = 2;
			} 
			break;
		case 2:		//feb
			if(newDate.day == 29) {
				newDate.day = 1;
				newDate.month = 3;
			} 
			break;
		case 3:		//mar
			if(newDate.day == 32) {
				newDate.day = 1;
				newDate.month = 4;
			} 
			break;
		case 4:		//apr
			if(newDate.day == 31) {
				newDate.day = 1;
				newDate.month = 5;
			} 
			break;
		case 5:		//may
			if(newDate.day == 32) {
				newDate.day = 1;
				newDate.month = 6;
			} 
			break;
		case 6:		//june
			if(newDate.day == 31) {
				newDate.day = 1;
				newDate.month = 7;
			} 
			break;
		case 7:		//jul
			if(newDate.day == 32) {
				newDate.day = 1;
				newDate.month = 8;
			} 
			break;
		case 8:		//aug
			if(newDate.day == 32) {
				newDate.day = 1;
				newDate.month = 9;
			} 
			break;
		case 9:		//sep
			if(newDate.day == 31) {
				newDate.day = 1;
				newDate.month = 10;
			} 
			break;
		case 10:		//oct
			if(newDate.day == 32) {
				newDate.day = 1;
				newDate.month = 11;
			} 
			break;
		case 11:		//nov
			if(newDate.day == 31) {
				newDate.day = 1;
				newDate.month = 12;
			} 
			break;
		case 12:		//dec
			if(newDate.day == 32) {
				newDate.day = 1;
				newDate.month = 1;
				newDate.year++;
			} 
			break;
	}
    
	return newDate;
	
};

var dateObjectSubtractOneDay = function(dateObject) { 

	var newDate = dateObject;
	newDate.day--;
	
	if(newDate.day == 0) {
		switch(newDate.month) {
			case 1:		//january
				newDate.day = 31;
				newDate.month = 12;
				newDate.year--;
			break;
			case 2:		//feb
				newDate.day = 31;
				newDate.month = 1;
			break;
			case 3:		//mar
				newDate.day = 28;
				newDate.month = 2;
			break;
			case 4:		//apr
				newDate.day = 31;
				newDate.month = 3;
			break;
			case 5:		//may
				newDate.day = 30;
				newDate.month = 4;
			break;
			case 6:		//june
				newDate.day = 31;
				newDate.month = 5;
			break;
			case 7:		//jul
				newDate.day = 30;
				newDate.month = 6;
			break;
			case 8:		//aug
				newDate.day = 31;
				newDate.month = 7;
			break;
			case 9:		//sep
				newDate.day = 31;
				newDate.month = 8;
			break;
			case 10:		//oct
				newDate.day = 30;
				newDate.month = 9;
			break;
			case 11:		//nov
				newDate.day = 31;
				newDate.month = 10;
			break;
			case 12:		//dec
				newDate.day = 30;
				newDate.month = 11;
			break;
		}
	}
		
	return newDate;
	
};

var dateObjectTo30min = function(dateObject) { 

	var newDate = dateObject;
	
	if(newDate.minute >= 30) {
		newDate.minute = 30;
	} else {
		newDate.minute = 00;
	}
	
	newDate.second = 01;
		
	return newDate;
	
};

function dateObjectAdd30Min(dateObject) { 

	var newDate = dateObject;
	newDate.minute = 30+newDate.minute;
	
	if(newDate.minute >= 60) {		//if we need to wrap to next hour
		newDate.minute = newDate.minute - 60;
		newDate.hour++;
		
		if(newDate.hour == 24) {
			newDate.hour = 0;
			newDate = dateObjectAddOneDay(newDate);
		}
		
	}
		
	return newDate;
	
};

function dateObjectSubtract30Min(dateObject) { 

	var newDate = dateObject;
	newDate.minute = newDate.minute-30;
	
	if(newDate.minute == -30) {		//if we need to wrap to next hour
		newDate.minute = 30;
		newDate.hour--;
		
		if(newDate.hour == -1) {
			newDate.hour = 23;
			newDate = dateObjectSubtractOneDay(newDate);
		}
		
	}
		
	return newDate;
	
};

var getPreviousRemote = function(fullRemoteList, currentRemote) {   
	
	var listLength = fullRemoteList.length;
	var currentIndex, newIndex = -1, lowestIndex = 100, highestIndex = -1, i, j, s;
	
	//Populate list indexes
	for (i = 0; i < listLength; i++) {
		s = fullRemoteList[i];
		
		if (s.enabled == true) {
			if(i < lowestIndex) lowestIndex = i;
			if(i > highestIndex) highestIndex = i;
			
			if(s.name == currentRemote) currentIndex = i;
		}	
	} 
	
	//If at start of list start over
	if(currentIndex == lowestIndex) {
		newIndex = highestIndex;
	} else {
	
		//Loop to get previous list
		for (j = currentIndex - 1; j >= 0; j--) {
			s = fullRemoteList[j];
		
			if (s.enabled == true) {
				newIndex = j;
				j = 0;
			}	
		}
	}
	
	//Fall back to same if cannot get next
	if(newIndex == -1) {
		return currentRemote;
	} else {
		return fullRemoteList[newIndex].name;
	}

};

var getNextRemote = function(fullRemoteList, currentRemote) {   
	
	var listLength = fullRemoteList.length;
	var currentIndex, newIndex = -1, lowestIndex = 100, highestIndex = -1, i, j, s;
	
	//Populate list indexes
	for (i = 0; i < listLength; i++) {
		s = fullRemoteList[i];
		
		if (s.enabled == true) {
			if(i < lowestIndex) lowestIndex = i;
			if(i > highestIndex) highestIndex = i;
			
			if(s.name == currentRemote) currentIndex = i;
		}	
	} 
	
	//If at end of list start over
	if(currentIndex == highestIndex) {
		newIndex = lowestIndex;
	} else {
	
		//Loop to get next list
		for (j = currentIndex + 1; j < listLength; j++) {
			s = fullRemoteList[j];
		
			if (s.enabled == true) {
				newIndex = j;
				j = listLength;
			}	
		}
	}
	
	//Fall back to same if cannot get next
	if(newIndex == -1) {
		return currentRemote;
	} else {
		return fullRemoteList[newIndex].name;
	}

};

var getBackendIP = function(fullBackendList, backendName, masterBackend) {   
	
	var returnIP = "unknown";
	var i = 0;
	
	for(i = 0; i < fullBackendList.length; i++) {
		s = fullBackendList[i];
		
		if ((s.hostname == backendName)) {
			//Matches backend name
			if(s.master == true) {
				returnIP = masterBackend;
			} else {
				returnIP = s.ip;
			}
		} else {
			//Does not match
		}	
	
	}
	
	return returnIP;

};

var recStatusDecode = function(recStatusInt) { 

	var newStatusText = "";
	
		switch(parseInt(recStatusInt)) {
			case -8:		
				newStatusText = "Tuner Busy";
			break;
			case -7:		
				newStatusText = "Low Disk Space";
			break;
			case -6:		
				newStatusText = "Cancelled";
			break;
			case -5:		
				newStatusText = "Deleted";
			break;
			case -4:		
				newStatusText = "Aborted";
			break;
			case -3:		
				newStatusText = "Recorded";
			break;
			case -2:		
				newStatusText = "Recording";
			break;
			case -1:		
				newStatusText = "Will Record";
			break;
			case 0:		
				newStatusText = "Unknown";
			break;
			case 1:		
				newStatusText = "Don't Record";
			break;
			case 2:		
				newStatusText = "Previously Recorded";
			break;
			case 3:		
				newStatusText = "Current Recording";
			break;
			case 4:		
				newStatusText = "Don't Record";
			break;
			case 5:		
				newStatusText = "Earlier Showing";
			break;
			case 6:		
				newStatusText = "Not Listed";
			break;
			case 7:		
				newStatusText = "Conflict";
			break;
			case 8:		
				newStatusText = "Later Showing";
			break;
			case 9:		
				newStatusText = "Repeat";
			break;
			case 10:		
				newStatusText = "Inactive";
			break;
			case 11:		
				newStatusText = "Never Record";
			break;
			
			default:
				newStatusText = " No matching recording rule";
			break;
		}	
		
	return newStatusText;
	
};