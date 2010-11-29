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
		currentFrontendAddress: 'frontend-address',
		currentRemotePort: '6546',
		currentRemoteScene: 'masterRemote',
		previousScriptVersion: 0,
		allowRecordedDownloads: false,
		recordedDownloadsUrl: '',
		theme: 'palm-dark',
		remoteHeaderAction: 'Pause',
		remoteVibrate: false,
		remoteFullscreen: false,
		masterBackendIp: '-',
		manualMasterBackend: false,
		playJumpRemote: true,
		guideJumpRemote: false,
		showUpcomingChannelIcons: true,
		dashboardRemote: true,
		dashboardRemoteIndex: 1,
		useWebmythScript: true,
		showUpcoming: true,
		showVideos: true,
		showMusic: true,
		currentVideosSort: 'title-asc',
		currentVideosGroup: 'all',
		currentMusicSort: 'artist-asc',
		currentUpcomingGroup: 'Upcoming',
		forceScriptScreenshots: false,
		showVideoImages: true,
		currentSearchSort: 'date-asc'
		
	};
	
	return newCookieObject;
};

function defaultHostsCookie() {

	//These values are initiated in 'welcome' scene if not set

	var newCookieObject = [{
		"hostname": "frontend",		
		"address": "frontend-address",						
		"port": "6546"
	}];
	
	return newCookieObject;
};

function defaultHostsCookieCurrent(newName) {

	//These values are initiated in 'welcome' scene if not set

	var newCookieObject = [{
		"hostname": newName,
		"address": newName,							
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

var intToBool = function(int_in) {
	if(int_in == 0) {
		return false;
	} else {
		return true;
	}
};

var boolToInt = function(bool_in) {
	if(bool_in == true) {
		return 1;
	} else {
		return 0;
	}
};

var splitDupin = function(dupin_in) {
	if(dupin_in >= 96) {
		return { dupin1: dupin_in - 96, dupin2: 96}
	} else if(dupin_in >= 64) {
		return { dupin1: dupin_in - 64, dupin2: 64}
	} else if(dupin_in >= 32) {
		return { dupin1: dupin_in - 32, dupin2: 32}
	} else if(dupin_in >= 16) {
		return { dupin1: dupin_in - 16, dupin2: 16}
	} else {
		return { dupin1: dupin_in, dupin2: 0 }
	}

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

var triple_sort_by = function(field1, field2, field3, reverse, primer){

   reverse = (reverse) ? -1 : 1;

   return function(a,b){

       a = a[field1]+"_"+a[field2]+"_"+a[field3];
       b = b[field1]+"_"+b[field2]+"_"+b[field3];

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

var trimByUpcomingGroup = function(fullList, myUpcomingType) {
	
	//Check for keyword for no filtering
	if ((myUpcomingType == 'All')||(myUpcomingType == 'all')) {
		return fullList;
	} else if (myUpcomingType == 'Conflicting') {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.recstatus == '7')) {
				//Matches conflicting
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		
		return trimmedList;
		
	} else if (myUpcomingType == 'Upcoming') {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.recstatus == '7')||(s.recstatus == '-1')||(s.recstatus == '-2')) {
				//Matches conflicting, will record, recording
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		
		return trimmedList;
		
	} else if (myUpcomingType == 'Overrides') {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.rectype == '7')||(s.rectype == '8')) {
				//Matches forced do and don't record
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		
		return trimmedList;
		
	}
	
	//If all else fails
	return fullList;
	
};

var trimByVideoType = function(fullList, myVideoType) {
	
	//Check for keyword for no filtering
	if (myVideoType == 'all') {
		return fullList;
	} else {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.videoType == myVideoType)||(s.videoType == myVideoType)) {
				//Matches video type
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		return trimmedList;
	}
};

var trimMusicByArtist = function(fullList, myArtist) {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.artist_name == myArtist)) {
				//Matches artist
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		return trimmedList;
		
};

var trimMusicByAlbum = function(fullList, myAlbum) {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.album_name == myAlbum)) {
				//Matches artist
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		return trimmedList;
		
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

var trimByChanidRecstartts = function(fullList, chanid_in, recstartts_in) {
	
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.chanId == chanid_in) && (s.recStartTs == recstartts_in)) {
				//Matches chanid and starttime
				return s;
			} else {
				//Does not match
			}
		}
		return {"chanid_in":chanid_in, "recstartts_in":recstartts_in};

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

var trimByIntid = function(fullList, intid_in) {
	
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.intid == intid_in)) {
				//Matches id
				return s;
			} else {
				//Does not match
			}
		}
		
		return {};

};

var trimByHostnameGroupname = function(fullList, hostname_in, groupname_in) {
	
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.hostname == hostname_in) && (s.groupname == groupname_in)) {
				//Matches
				return s;
			} else {
				//Does not match
			}
		}
		
		return {};

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

var cleanJobqueue = function(fullList) {

	finalList = [];
	
	var i, j, s, t = [];
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		switch(parseInt(s.type)) {
			case 0:
				s.jobType = "System Job";
				break;
			case 1:
				s.jobType = "Transcode";
				break;
			case 2:
				s.jobType = "Commercial Flagging";
				break;
			case 256:
				if(WebMyth.settings.UserJobDesc1) {
					s.jobType = WebMyth.settings.UserJobDesc1;
				} else {
					s.jobType = "User Job 1";
				}
				//s.jobType = "User Job 1";
				break;
			case 512:
				if(WebMyth.settings.UserJobDesc1) {
					s.jobType = WebMyth.settings.UserJobDesc2;
				} else {
					s.jobType = "User Job 2";
				}
				//s.jobType = "User Job 2";
				break;
			case 1024:
				if(WebMyth.settings.UserJobDesc1) {
					s.jobType = WebMyth.settings.UserJobDesc3;
				} else {
					s.jobType = "User Job 3";
				}
				//s.jobType = "User Job 3";
				break;
			case 2048:
				if(WebMyth.settings.UserJobDesc4) {
					s.jobType = WebMyth.settings.UserJobDesc4;
				} else {
					s.jobType = "User Job 4";
				}
				//s.jobType = "User Job 4";
				break;
			default:
				s.jobType = "Unknown";
				break;
		};
	
		switch(parseInt(s.status)) {
			case 0:
				s.statusText = "Unknown";
				break;
			case 1:
				s.statusText = "Queued";
				break;
			case 2:
				s.statusText = "Pending";
				break;
			case 3:
				s.statusText = "Starting";
				break;
			case 4:
				s.statusText = "Running";
				break;
			case 5:
				s.statusText = "Stopped";
				break;
			case 6:
				s.statusText = "Paused";
				break;
			case 7:
				s.statusText = "Retry";
				break;
			case 8:
				s.statusText = "Erroring";
				break;
			case 9:
				s.statusText = "Aborting";
				break;
			case 256:
				s.statusText = "Done";
				break;
			case 272:
				s.statusText = "Finished";
				break;
			case 288:
				s.statusText = "Aborted";
				break;
			case 304:
				s.statusText = "Errored";
				break;
			case 320:
				s.statusText = "Cancelled";
				break;
			default:
				s.statusText = "Unknown";
				break;
		};
				
		
		finalList.push(s);
		
	}
	
	
	return finalList;
	
}

var cleanSearchResults = function(fullList, nowDateISO) {

	finalList = [];
	
	var i, s = {};
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		if(s.endTime < nowDateISO) {
			//Program in past - ignore
		} else {
			finalList.push(s);
		}
	}
	
	
	return finalList;
	
}

var cleanVideos = function(fullList) {

	finalList = [];
	
	var i, j, s, t = [];
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		if(s.season == 0) {
			if(s.episode == 0) {	
				//No TV data - assuming full movie
				s.fullEpisode = 'N/A';
				s.season = "None";
				s.videoType = "Video";
			} else if(s.episode < 10) {
				//Specials as listed on thetvdb.com
				s.fullEpisode = 'Special0'+s.episode;
				s.season = "Specials";
				s.videoType = "Special";
			} else {
				//Specials as listed on thetvdb.com
				s.fullEpisode = 'Special'+s.episode;
				s.season = "Specials";
				s.videoType = "Special";
			}
		} else {
			//TV episodes
			if(s.season < 10) {
				s.fullEpisode = "S0"+s.season;
			} else {
				s.fullEpisode = "S"+s.season;
			}
			
			if(s.episode < 10) {
				s.fullEpisode += "E0"+s.episode;
			} else {
				s.fullEpisode += "E"+s.episode;
			}
			
			if(s.season < 10) {
				s.season = "Season  "+s.season;
			} else {
				s.season = "Season "+s.season;
			}
			
			s.videoType = "TV";
				
		}
		
		//Break down file name
		t = s.filename.split("/");
		
		s.fileLevels = t.length;
		
		s.level1 = t[0];
		s.level2 = t[0]+"/"+t[1];
		s.level3 = t[0]+"/"+t[1]+"/"+t[2];
		s.level4 = t[0]+"/"+t[1]+"/"+t[2]+"/"+t[3];
		s.level5 = t[0]+"/"+t[1]+"/"+t[2]+"/"+t[3]+"/"+t[4];
		s.level6 = t[0]+"/"+t[1]+"/"+t[2]+"/"+t[3]+"/"+t[4]+"/"+t[5];
		
		s.onlyFilename = t[s.fileLevels-1];
			
			
		//Fix some blank values
		if(s.subtitle == 'None') s.subtitle = '';
		if(s.plot == 'None') s.plot = '';
		
		finalList.push(s);
		
	}
	
	
	return finalList;
	
}

var cleanMusic = function(fullList) {

	finalList = [];
	
	var i, j, k, s, t = [], u = [];
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		//Break down name if is has '/'
		t = s.name.split("/");
		j = t.length;
		s.name = t[j - 1];
		
		//Break down filename 
		u = s.filename.split("/");
		k = u.length;
		s.filenameEnd = u[k - 1];
			
			
		if(s.track < 10) {
			s.track = '0'+s.track;
		}
		
		finalList.push(s);
		
	}
	
	
	return finalList;
	
}

var cleanUpcoming = function(fullList) {

	finalList = [];
	
	var i, s = {};
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		s.recStatusText = recStatusDecode(s.recstatus);
		s.startTime = s.starttime;
		s.chanId = s.chanid;

		finalList.push(s);
		
	}
	
	return finalList;
	
}

var cleanInputs = function(fullList) {

	finalList = [];
	
	var i, j, k, s, t = {}, u = [];
	
	finalList.push( { label: "None", value: "0" } );
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		t = {};
		
		t.label = s.displayname;
		t.value = s.cardinputid;

		
		finalList.push(t);
		
	}
	
	
	return finalList;
	
}

var cleanSettings = function(fullList) {

	settingsObject = { hosts: [] };
	hosts = [];
	hostObject = {};
	
	var i, j, s = {}, t = {};
	
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		if(s.value == "AutoCommercialFlag") {
			settingsObject.AutoCommercialFlag = s.data;
		} else if(s.value == "AutoTranscode") {
			settingsObject.AutoTranscode = s.data;
		} else if(s.value == "AutoRunUserJob1") {
			settingsObject.AutoRunUserJob1 = s.data;
		} else if(s.value == "AutoRunUserJob2") {
			settingsObject.AutoRunUserJob2 = s.data;
		} else if(s.value == "AutoRunUserJob3") {
			settingsObject.AutoRunUserJob3 = s.data;
		} else if(s.value == "AutoRunUserJob4") {
			settingsObject.AutoRunUserJob4 = s.data;
		} else if(s.value == "DefaultStartOffset") {
			settingsObject.DefaultStartOffset = s.data;
		} else if(s.value == "DefaultEndOffset") {
			settingsObject.DefaultEndOffset = s.data;
		} else if(s.value == "UserJobDesc1") {
			settingsObject.UserJobDesc1 = s.data;
		} else if(s.value == "UserJobDesc2") {
			settingsObject.UserJobDesc2 = s.data;
		} else if(s.value == "UserJobDesc3") {
			settingsObject.UserJobDesc3 = s.data;
		} else if(s.value == "UserJobDesc4") {
			settingsObject.UserJobDesc4 = s.data;
		} else if(s.value == "MasterServerIP") {
			settingsObject.MasterServerIP = s.data;
		} else if(s.value == "BackendServerIP") {
			//Mojo.Log.error("backend ip of "+s.data);
			hostObject = { "hostname": s.hostname, "ip": s.data, "master": false };
			settingsObject.hosts.push(hostObject);
		}
		
	}
	
	
	for(j = 0; j < settingsObject.hosts.length; j++) {
		t = settingsObject.hosts[j];
		
		if(t.ip == settingsObject.MasterServerIP) {
			t.master = true;
		}
	}
	
	
	return settingsObject;
	
}

var cleanHostsCookie = function(fullList) {

	finalList = [];
	
	var i, s = {};
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		if(s.address == null) {
			s.address = s.hostname;
		}
		
		finalList.push(s);
		
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

var dateDayAdjust = function(JSdayOfWeek) { 
    
    var newDay = JSdayOfWeek - 1;

    if(JSdayOfWeek < 0) {
		JSdayOfWeek = JSdayOfWeek + 7;
	}

	
	return newDay;
 
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
	
	var returnIP = masterBackend;
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
				newStatusText = "Force Don't Record";
			break;
			case 2:		
				newStatusText = "Previously Recorded";
			break;
			case 3:		
				newStatusText = "Current Recording";
			break;
			case 4:		
				newStatusText = "Won't Record";
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