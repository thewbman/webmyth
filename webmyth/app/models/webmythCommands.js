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
		currentFrontendPort: '6546',
		currentRemoteScene: 'masterRemote',
		previousScriptVersion: 0,
		allowRecordedDownloads: false,
		recordedDownloadsUrl: '',
		theme: 'palm-dark',
		remoteHeaderAction: 'Pause',
		remoteVibrate: false,
		remoteFullscreen: false,
		masterBackendIp: '-',
		masterBackendPort: 6543,
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
		currentVideosGroup: 'Directory',
		currentMusicSort: 'artist-asc',
		currentUpcomingGroup: 'Upcoming',
		forceScriptScreenshots: false,
		showVideoImages: false,
		showVideoDetailsImage: true,
		currentSearchSort: 'date-asc',
		showLog: true,
		currentLogGroup: 'all',
		manualDatabase: false,
		databaseHost: '-',
		usePlugin: 0,
		protoVerSubmitted: false,
		currentSearchPeopleSort: 'date-asc',
		mythVer: 'TBD',
		debug: false,
		mythwebXml: false,
		MythXML_key: "DefaultKey",
		
		
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

function defaultHostsCookieCurrent(newName,newAddress) {

	//These values are initiated in 'welcome' scene if not set

	var newCookieObject = [{
		"hostname": newName,
		"address": newAddress,							
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

       a = a[field1]+"_"+a[field2];
       b = b[field1]+"_"+b[field2];

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
			if ((s.recStatus == '7')) {
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
			if ((s.recStatus == '7')||(s.recStatus == '-1')||(s.recStatus == '-2')) {
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
			if ((s.recType == '7')||(s.recType == '8')) {
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
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.videoType == "Video")||(s.videoType == "Special")||(s.videoType == "TV")) {
				//Matches video type
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		return trimmedList;
		
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

var trimByVideoDirectory = function(fullList, directory_in) {
	
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.directory == directory_in)) {
				//Matches video directory
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		
		return trimmedList;
		

};

var trimByVideoUpperDirectory = function(fullList, directory_in) {
	
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.upperDirectory == directory_in)&&(s.upperDirectory != s.directory)) {
				//Matches video directory
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		
		return trimmedList;
		

};

var trimLogByModule = function(fullList, myModule) {
	
		var trimmedList = [];
		var i, s;
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.module == myModule)) {
				//Matches artist
				trimmedList.push(s);
			} else {
				//Does not match
			}
		}
		return trimmedList;
		
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

var trimMusicPlaylist = function(fullList, myGroup) {
	
		var trimmedList = [];
		var i, s, matchGroup;
		
		if(myGroup == "inPlaylist") {
			matchGroup = true;
		} else {
			matchGroup = false;
		}
	
		for (i = 0; i < fullList.length; i++) {
	
			s = fullList[i];
			if ((s.inPlaylist == matchGroup)) {
				trimmedList.push(s);
			} else {
				//does not match
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

	var finalList = [];
	
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

	var finalList = [];
	
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

	var finalList = [];
	
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
		
		s.directory = s.filename.replace(s.onlyFilename,"");
			
			
		//Fix some blank values
		if(s.subtitle == 'None') s.subtitle = '';
		if(s.plot == 'None') s.plot = '';
		
		finalList.push(s);
		
	}
	
	
	return finalList;
	
}

var cleanVideosDirectory = function(fullList) {

	var finalList = [];
	
	var i, s = {}, t = {}, u = [];
	
	var lastDirectory1 = "asdf-fake-directory";
	var lastDirectory2 = "asdf-fake-directory";
	var lastDirectory3 = "asdf-fake-directory";
	var lastDirectory4 = "asdf-fake-directory";
	var lastDirectory5 = "asdf-fake-directory";
	var lastDirectory6 = "asdf-fake-directory";
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		t = {};
		u.clear();
		u = s.directory.split("/");
		
		
		if((s.fileLevels > 1)&&(lastDirectory1 != s.level1)){
			t = {};
			
			t.directory = s.level1+'/';
			t.directoryLevels = 2;
			t.localDirectory = u[t.directoryLevels-2];
			t.upperDirectory = t.directory.replace(t.localDirectory+'/',"");
			
			finalList.push(t);
			lastDirectory1 = s.level1;
		}
		
		
		if((s.fileLevels > 2)&&(lastDirectory2 != s.level2)){
			t = {};
			
			t.directory = s.level2+'/';
			t.directoryLevels = 3;
			t.localDirectory = u[t.directoryLevels-2];
			t.upperDirectory = t.directory.replace(t.localDirectory+'/',"");
			
			finalList.push(t);
			lastDirectory2 = s.level2;
		}
		
		if((s.fileLevels > 3)&&(lastDirectory3 != s.level3)){
			t = {};
			
			t.directory = s.level3+'/';
			t.directoryLevels = 4;
			t.localDirectory = u[t.directoryLevels-2];
			t.upperDirectory = t.directory.replace(t.localDirectory+'/',"");
			
			finalList.push(t);
			lastDirectory3 = s.level3;
		}
		
		if((s.fileLevels > 4)&&(lastDirectory4 != s.level4)){
			t = {};
			
			t.directory = s.level4+'/';
			t.directoryLevels = 5;
			t.localDirectory = u[t.directoryLevels-2];
			t.upperDirectory = t.directory.replace(t.localDirectory+'/',"");
			
			finalList.push(t);
			lastDirectory4 = s.level4;
		}
		
		if((s.fileLevels > 5)&&(lastDirectory5 != s.level5)){
			t = {};
			
			t.directory = s.level5+'/';
			t.directoryLevels = 6;
			t.localDirectory = u[t.directoryLevels-2];
			t.upperDirectory = t.directory.replace(t.localDirectory+'/',"");
			
			finalList.push(t);
			lastDirectory5 = s.level5;
		}
		
		if((s.fileLevels > 6)&&(lastDirectory4 != s.level6)){
			t = {};
			
			t.directory = s.level6+'/';
			t.directoryLevels = 7;
			t.localDirectory = u[t.directoryLevels-2];
			t.upperDirectory = t.directory.replace(t.localDirectory+'/',"");
			
			finalList.push(t);
			lastDirectory6 = s.level6;
		}
		
		
	}
	
	
	return finalList;
	
}

var cleanMusic = function(fullList) {

	var finalList = [];
	
	var i, j, k, s, t = [], u = [];
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		//Break down name if is has '/'
		t = s.name.split("/");
		j = t.length;
		s.name = t[j - 1];
		
		//Break down filename 
		//u = s.filename.split("/");
		//k = u.length;
		//s.filenameEnd = u[k - 1];
			
			
		if(s.track < 10) {
			s.track = '0'+s.track;
		}
		
		finalList.push(s);
		
	}
	
	
	return finalList;
	
}

var cleanMusicPlaylists = function(fullList) {

	var finalList = [];
	
	finalList.push({"type": "1 - New", "playlist_id": "-1", "playlist_name": "Create new", "display_name": "+ Create new +", "playlist_songs": "", "length": "0", "songcount": "0", "hostname": ""});
	
	var i, j, k, s, t = [], u = [];
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		if(s.hostname == ""){
			s.type = "3 - Named";
			s.display_name = s.playlist_name;
			finalList.push(s);
		} else if(s.playlist_name == "default_playlist_storage") {
			s.type = "2 - Host";
			s.display_name = "Frontend: "+s.hostname;
			finalList.push(s);
		}
		
	}
	
	finalList.sort(double_sort_by('type', 'hostname', false));
	
	return finalList;
	
}

var parseMusicInPlaylist = function(fullList, playlistObject) {
	
	var playlistOrderList = [];
	var	finalList = [];
	
	var myPlaylist = playlistObject.playlist_songs.split(",");
	
	var i, j, s = {};
	var sortListIndex = 0;
		
	//Flag music if in playlist
	for(j = 0; j < myPlaylist.length; j++) {
		
		if(myPlaylist[j] > 0) {
			//Make sure we are not getting playlists, just songs
			playlistOrderList.push({'song_id': myPlaylist[j], 'order': j});
		}	
	}
	
	playlistOrderList.sort(sort_by('song_id', false));
	
	
	//Prep music list
	fullList.sort(sort_by('song_id', false));
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		s.playlistOrder = 1000000;
		s.inPlaylist = false;
		
		if(playlistOrderList.length > 0) {		
			if(s.song_id == playlistOrderList[sortListIndex].song_id) {
				s.playlistOrder = playlistOrderList[sortListIndex].order;
				s.inPlaylist = true;
				
				sortListIndex++;
				
				if(sortListIndex >= playlistOrderList.length){
					sortListIndex--;
				}
				
				//Mojo.Log.info("Updated music item %j",s);
			
			}
		}
		
		finalList.push(s);
		
	}
	
	finalList.sort(sort_by('playlistOrder', false));
	
	return finalList;	
	
}

var parseMusicPlaylists = function(fullList, playlistObject) {
	
	var playlistOrderList = [];
	var finalList = [];
	
	var myPlaylist = playlistObject.playlist_songs.split(",");
	
	var i, j, s = {};
	var sortListIndex = 0;
	
	
	//Flag named playlists if in host playlist
	for(j = 0; j < myPlaylist.length; j++) {
		
		if(myPlaylist[j] < 0) {
			//Make sure we are not getting songs, just playlsits
			playlistOrderList.push({'playlist_id': parseInt(myPlaylist[j]), 'order': j});
		}	
	}
	
	playlistOrderList.sort(sort_by('song_id', false));
	
	//Mojo.Log.info("Sorted playlists list is %j",playlistOrderList);
	
	
	switch(playlistObject.type){
		case '1 - New':
			//do nothing
		  break;
		  
		
		case '2 - Host':
	
			//Get named playlists
			for(i = 0; i < fullList.length; i++) {
				s = fullList[i];
			
				if(s.type == "3 - Named") {
				
					s.inPlaylist = false;
		
					if(playlistOrderList.length > 0) {
						if(s.playlist_id == parseInt(playlistOrderList[sortListIndex].playlist_id)*(-1)) {
							s.playlistOrder = playlistOrderList[sortListIndex].order;
							s.inPlaylist = true;
							
							sortListIndex++;
							
							if(sortListIndex >= playlistOrderList.length){
								sortListIndex--;
							}
							
							//Mojo.Log.info("Updated playlist item %j",s);
						
						}
					}
				
					finalList.push(s);
				}
				
			}
	
		  break;
		  
		
		case '3 - Named':
			//do nothing
		  break;
	
	} 
		

	return finalList;	
	
}

var parseUpcomingPlugin = function(fullData) {

	//Determine how we should parse
	// http://www.mythtv.org/wiki/ProgramInfo_%28Myth_Protocol%29
	
	var finalList = [];
	var type = "upcoming";
	
	//Mojo.Log.error("about to start parsing upcoming plugin "+fullData);
	
	if(WebMyth.prefsCookieObject.protoVer == 23056){
		finalList = parsePrograms41(fullData, type);
	} else if(WebMyth.prefsCookieObject.protoVer >= 57){
		finalList = parsePrograms57(fullData, type);
	} else if(WebMyth.prefsCookieObject.protoVer >= 41){
		finalList = parsePrograms41(fullData, type);
	} else if(WebMyth.prefsCookieObject.protoVer >= 35){
		finalList = parsePrograms35(fullData, type);
	} else if(WebMyth.prefsCookieObject.protoVer >= 32){
		finalList = parsePrograms32(fullData, type);
	} else if(WebMyth.prefsCookieObject.protoVer >= 31){
		finalList = parsePrograms31(fullData, type);
	} else if(WebMyth.prefsCookieObject.protoVer >= 25){
		finalList = parsePrograms25(fullData, type);
	} 
	
	return finalList;

};

var parsePrograms57 = function(fullResponse, type) {	

	//Protocol verion 57 and up - 41 fields

	var finalList = [];
	var fullArray = fullResponse.split("[]:[]");
	var offset = 1;
	
	//Mojo.Log.error("Parsing upcoming total programs is "+fullArray[1]+", length is "+fullArray.length);
	
	if(type == "upcoming") {
		WebMyth.hasConflicts = fullArray[0].substring(8,9);
		WebMyth.expectedLength = fullArray[1];
		offset = 2;
	}
	
	var i, programNum = 0, fieldNum = 0;
	var singleProgramJson = {};
	var newDate = new Date();
	
	for(i = offset; i < fullArray.length; i++){
		switch(fieldNum){
			case 0:
				singleProgramJson.title = fullArray[i];
			  break;
			case 1:
				singleProgramJson.subTitle = fullArray[i];
			  break;
			case 2:
				singleProgramJson.description = fullArray[i];
			  break;
			case 3:
				singleProgramJson.category = fullArray[i];
			  break;
			case 4:
				singleProgramJson.chanId = fullArray[i];
			  break;
			case 5:
				singleProgramJson.channum = fullArray[i];
			  break;
			case 6:
				singleProgramJson.callsign = fullArray[i];
			  break;
			case 7:
				singleProgramJson.channame = fullArray[i];
			  break;
			case 8:
				//singleProgramJson.filename = fullArray[i];
			  break;
			case 9:
				//singleProgramJson.filesize = fullArray[i];
			  break; 
			  
			case 10:
				singleProgramJson.startTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.startTime = dateJSToISO(newDate);
				singleProgramJson.startTimeSpace = singleProgramJson.startTime.replace("T"," ");
				
			  break;
			case 11:
				singleProgramJson.endTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.endTime = dateJSToISO(newDate);
			  break;
		/*	case 12:
				//singleProgramJson.findId = fullArray[i];
			  break;
			case 13:
				//singleProgramJson.hostname = fullArray[i];
			  break;
			case 14:
				//singleProgramJson.sourceId = fullArray[i];
			  break;
			case 15:
				//singleProgramJson.cardId = fullArray[i];
			  break;
			case 16:
				//singleProgramJson.inputId = fullArray[i];
			  break;
			case 17:
				//singleProgramJson.recPriority = fullArray[i];
			  break;  */
			case 18:
				singleProgramJson.recStatus = fullArray[i];
				singleProgramJson.recStatusText = recStatusDecode(fullArray[i]);
			  break;
			case 19:
				//singleProgramJson.recordId = fullArray[i];
			  break;
			  
			case 20:
				singleProgramJson.recType = fullArray[i];
			  break;
			case 21:
				//singleProgramJson.dupin = fullArray[i];
			  break;
			case 22:
				//singleProgramJson.dupMethod = fullArray[i];
			  break;
			case 23:
				singleProgramJson.recStartTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recStartTs = dateJSToISO(newDate);
			  break;
			case 24:
				singleProgramJson.recEndTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recEndTs = dateJSToISO(newDate);
			  break;
		/*	case 25:
				//singleProgramJson.programflags = fullArray[i];
			  break;
			case 26:
				//singleProgramJson.recGroup = fullArray[i];
			  break;
			case 27:
				//singleProgramJson.outputFilters = fullArray[i];
			  break;
			case 28:
				//singleProgramJson.seriesId = fullArray[i];
			  break;
			case 29:
				//singleProgramJson.programId = fullArray[i];
			  break;
			  
			case 30:
				//singleProgramJson.lastModified = fullArray[i];
			  break;
			case 31:
				//singleProgramJson.stars = fullArray[i];
			  break;
			case 32:
				//singleProgramJson.airdate = fullArray[i];
			  break;
			case 33:
				//singleProgramJson.playgroup = fullArray[i];
			  break;
			case 34:
				//singleProgramJson.recpriority2 = fullArray[i];
			  break;
			case 35:
				//singleProgramJson.parentid = fullArray[i];
			  break;
			case 36:
				//singleProgramJson.storagegroup = fullArray[i];
			  break;
			case 37:
				//singleProgramJson.audio_props = fullArray[i];
			  break;
			case 38:
				//singleProgramJson.video_props = fullArray[i];
			  break;
			case 39:
				//singleProgramJson.subtitle_type = fullArray[i];
			  break;  */
			  
			case 40:
				//41st field, push and reset counters
				//singleProgramJson.year = fullArray[i];
				
				finalList.push(singleProgramJson);
				
				singleProgramJson = {};
				programNum++;
				fieldNum = -1;
			  break;
		}
		
		fieldNum++;
	}
	
	
	WebMyth.parsedPrograms = programNum;
	
	
	return finalList;
	
}

var parsePrograms41 = function(fullResponse, type) {	

	//Protocol verion 41 and up - 47 fields

	var finalList = [];
	var fullArray = fullResponse.split("[]:[]");
	var offset = 1;
	
	//Mojo.Log.error("Parsing upcoming total programs is "+fullArray[1]+", length is "+fullArray.length);
	
	if(type == "upcoming") {
		WebMyth.hasConflicts = fullArray[0].substring(8,9);
		WebMyth.expectedLength = fullArray[1];
		offset = 2;
	}
	
	
	var i, programNum = 0, fieldNum = 0;
	var singleProgramJson = {};
	var newDate = new Date();
	
	for(i = offset; i < fullArray.length; i++){
		switch(fieldNum){
			case 0:
				singleProgramJson.title = fullArray[i];
			  break;
			case 1:
				singleProgramJson.subTitle = fullArray[i];
			  break;
			case 2:
				singleProgramJson.description = fullArray[i];
			  break;
			case 3:
				singleProgramJson.category = fullArray[i];
			  break;
			case 4:
				singleProgramJson.chanId = fullArray[i];
			  break;
			case 5:
				singleProgramJson.channum = fullArray[i];
			  break;
			case 6:
				singleProgramJson.callsign = fullArray[i];
			  break;
			case 7:
				singleProgramJson.channame = fullArray[i];
			  break;
		/*	case 8:
				//singleProgramJson.filename = fullArray[i];
			  break;
			case 9:
				//singleProgramJson.fs_high = fullArray[i];
			  break; 
			case 10:
				//singleProgramJson.fs_low = fullArray[i];
			  break; */
			case 11:
				singleProgramJson.startTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.startTime = dateJSToISO(newDate);
				singleProgramJson.startTimeSpace = singleProgramJson.startTime.replace("T"," ");
				
			  break;
			case 12:
				singleProgramJson.endTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.endTime = dateJSToISO(newDate);
			  break;
			case 13:
		/*		//singleProgramJson.duplicate = fullArray[i];
			  break;
			case 14:
				//singleProgramJson.shareable = fullArray[i];
			  break;
			case 15:
				//singleProgramJson.findId = fullArray[i];
			  break;
			case 16:
				//singleProgramJson.hostname = fullArray[i];
			  break;
			case 17:
				//singleProgramJson.sourceId = fullArray[i];
			  break;
			case 18:
				//singleProgramJson.cardId = fullArray[i];
			  break;
			case 19:
				//singleProgramJson.inputId = fullArray[i];
			  break;
			  
			case 20:
				//singleProgramJson.recPriority = fullArray[i];
			  break;  */
			case 21:
				singleProgramJson.recStatus = fullArray[i];
				singleProgramJson.recStatusText = recStatusDecode(fullArray[i]);
			  break;
			case 22:
				//singleProgramJson.recordId = fullArray[i];
			  break;
			case 23:
				singleProgramJson.recType = fullArray[i];
			  break;
			case 24:
				//singleProgramJson.dupin = fullArray[i];
			  break;
			case 25:
				//singleProgramJson.dupMethod = fullArray[i];
			  break;
			case 26:
				singleProgramJson.recStartTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recStartTs = dateJSToISO(newDate);
			  break;
			case 27:
				singleProgramJson.recEndTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recEndTs = dateJSToISO(newDate);
			  break;
		/*	case 28:
				//singleProgramJson.repeat = fullArray[i];
			  break;
			case 29:
				//singleProgramJson.programflags = fullArray[i];
			  break;
			  
			case 30:
				//singleProgramJson.recGroup = fullArray[i];
			  break;
			case 31:
				//singleProgramJson.commfree = fullArray[i];
			  break;
			case 32:
				//singleProgramJson.outputFilters = fullArray[i];
			  break;
			case 33:
				//singleProgramJson.seriesId = fullArray[i];
			  break;
			case 34:
				//singleProgramJson.programId = fullArray[i];
			  break;
			case 35:
				//singleProgramJson.lastModified = fullArray[i];
			  break;
			case 36:
				//singleProgramJson.stars = fullArray[i];
			  break;
			case 37:
				//singleProgramJson.airdate = fullArray[i];
			  break;
			case 38:
				//singleProgramJson.hasairdate = fullArray[i];
			  break;
			case 39:
				//singleProgramJson.playgroup = fullArray[i];
			  break;
			  
			case 40:
				//singleProgramJson.recpriority2 = fullArray[i];
			  break;
			case 41:
				//singleProgramJson.parentid = fullArray[i];
			  break;
			case 42:
				//singleProgramJson.storagegroup = fullArray[i];
			  break;
			case 43:
				//singleProgramJson.audio_props = fullArray[i];
			  break;
			case 44:
				//singleProgramJson.video_props = fullArray[i];
			  break;
			case 45:
				//singleProgramJson.subtitle_type = fullArray[i];
			  break;  */
			case 46:
				//47th field, push and reset counters
				//singleProgramJson.year = fullArray[i];
				
				finalList.push(singleProgramJson);
				
				singleProgramJson = {};
				programNum++;
				fieldNum = -1;
			  break;
		}
		
		fieldNum++;
	}
	
	
	WebMyth.parsedPrograms = programNum;
	
	
	return finalList;
	
}

var parsePrograms35 = function(fullResponse, type) {	

	//Protocol verion 35 and up - 46 fields

	var finalList = [];
	var fullArray = fullResponse.split("[]:[]");
	var offset = 1;
	
	//Mojo.Log.error("Parsing upcoming total programs is "+fullArray[1]+", length is "+fullArray.length);
	
	if(type == "upcoming") {
		WebMyth.hasConflicts = fullArray[0].substring(8,9);
		WebMyth.expectedLength = fullArray[1];
		offset = 2;
	}
	
	
	var i, programNum = 0, fieldNum = 0;
	var singleProgramJson = {};
	var newDate = new Date();
	
	for(i = offset; i < fullArray.length; i++){
		switch(fieldNum){
			case 0:
				singleProgramJson.title = fullArray[i];
			  break;
			case 1:
				singleProgramJson.subTitle = fullArray[i];
			  break;
			case 2:
				singleProgramJson.description = fullArray[i];
			  break;
			case 3:
				singleProgramJson.category = fullArray[i];
			  break;
			case 4:
				singleProgramJson.chanId = fullArray[i];
			  break;
			case 5:
				singleProgramJson.channum = fullArray[i];
			  break;
			case 6:
				singleProgramJson.callsign = fullArray[i];
			  break;
			case 7:
				singleProgramJson.channame = fullArray[i];
			  break;
		/*	case 8:
				//singleProgramJson.filename = fullArray[i];
			  break;
			case 9:
				//singleProgramJson.fs_high = fullArray[i];
			  break; 
			case 10:
				//singleProgramJson.fs_low = fullArray[i];
			  break; */
			case 11:
				singleProgramJson.startTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.startTime = dateJSToISO(newDate);
				singleProgramJson.startTimeSpace = singleProgramJson.startTime.replace("T"," ");
				
			  break;
			case 12:
				singleProgramJson.endTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.endTime = dateJSToISO(newDate);
			  break;
			case 13:
		/*		//singleProgramJson.duplicate = fullArray[i];
			  break;
			case 14:
				//singleProgramJson.shareable = fullArray[i];
			  break;
			case 15:
				//singleProgramJson.findId = fullArray[i];
			  break;
			case 16:
				//singleProgramJson.hostname = fullArray[i];
			  break;
			case 17:
				//singleProgramJson.sourceId = fullArray[i];
			  break;
			case 18:
				//singleProgramJson.cardId = fullArray[i];
			  break;
			case 19:
				//singleProgramJson.inputId = fullArray[i];
			  break;
			  
			case 20:
				//singleProgramJson.recPriority = fullArray[i];
			  break;  */
			case 21:
				singleProgramJson.recStatus = fullArray[i];
				singleProgramJson.recStatusText = recStatusDecode(fullArray[i]);
			  break;
			case 22:
				//singleProgramJson.recordId = fullArray[i];
			  break;
			case 23:
				singleProgramJson.recType = fullArray[i];
			  break;
			case 24:
				//singleProgramJson.dupin = fullArray[i];
			  break;
			case 25:
				//singleProgramJson.dupMethod = fullArray[i];
			  break;
			case 26:
				singleProgramJson.recStartTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recStartTs = dateJSToISO(newDate);
			  break;
			case 27:
				singleProgramJson.recEndTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recEndTs = dateJSToISO(newDate);
			  break;
		/*	case 28:
				//singleProgramJson.repeat = fullArray[i];
			  break;
			case 29:
				//singleProgramJson.programflags = fullArray[i];
			  break;
			  
			case 30:
				//singleProgramJson.recGroup = fullArray[i];
			  break;
			case 31:
				//singleProgramJson.commfree = fullArray[i];
			  break;
			case 32:
				//singleProgramJson.outputFilters = fullArray[i];
			  break;
			case 33:
				//singleProgramJson.seriesId = fullArray[i];
			  break;
			case 34:
				//singleProgramJson.programId = fullArray[i];
			  break;
			case 35:
				//singleProgramJson.lastModified = fullArray[i];
			  break;
			case 36:
				//singleProgramJson.stars = fullArray[i];
			  break;
			case 37:
				//singleProgramJson.airdate = fullArray[i];
			  break;
			case 38:
				//singleProgramJson.hasairdate = fullArray[i];
			  break;
			case 39:
				//singleProgramJson.playgroup = fullArray[i];
			  break;
			  
			case 40:
				//singleProgramJson.recpriority2 = fullArray[i];
			  break;
			case 41:
				//singleProgramJson.parentid = fullArray[i];
			  break;
			case 42:
				//singleProgramJson.storagegroup = fullArray[i];
			  break;
			case 43:
				//singleProgramJson.audio_props = fullArray[i];
			  break;
			case 44:
				//singleProgramJson.video_props = fullArray[i];
			  break;  */
			case 45:
				//last field, push and reset counters
				//singleProgramJson.subtitle_type = fullArray[i];
				
				finalList.push(singleProgramJson);
				
				singleProgramJson = {};
				programNum++;
				fieldNum = -1;
			  break;
		}
		
		fieldNum++;
	}
	
	
	WebMyth.parsedPrograms = programNum;
	
	
	return finalList;
	
}

var parsePrograms32 = function(fullResponse, type) {	

	//Protocol verion 32 and up - 43 fields

	var finalList = [];
	var fullArray = fullResponse.split("[]:[]");
	var offset = 1;
	
	//Mojo.Log.error("Parsing upcoming total programs is "+fullArray[1]+", length is "+fullArray.length);
	
	if(type == "upcoming") {
		WebMyth.hasConflicts = fullArray[0].substring(8,9);
		WebMyth.expectedLength = fullArray[1];
		offset = 2;
	}
	
	
	var i, programNum = 0, fieldNum = 0;
	var singleProgramJson = {};
	var newDate = new Date();
	
	for(i = offset; i < fullArray.length; i++){
		switch(fieldNum){
			case 0:
				singleProgramJson.title = fullArray[i];
			  break;
			case 1:
				singleProgramJson.subTitle = fullArray[i];
			  break;
			case 2:
				singleProgramJson.description = fullArray[i];
			  break;
			case 3:
				singleProgramJson.category = fullArray[i];
			  break;
			case 4:
				singleProgramJson.chanId = fullArray[i];
			  break;
			case 5:
				singleProgramJson.channum = fullArray[i];
			  break;
			case 6:
				singleProgramJson.callsign = fullArray[i];
			  break;
			case 7:
				singleProgramJson.channame = fullArray[i];
			  break;
		/*	case 8:
				//singleProgramJson.filename = fullArray[i];
			  break;
			case 9:
				//singleProgramJson.fs_high = fullArray[i];
			  break; 
			case 10:
				//singleProgramJson.fs_low = fullArray[i];
			  break; */
			case 11:
				singleProgramJson.startTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.startTime = dateJSToISO(newDate);
				singleProgramJson.startTimeSpace = singleProgramJson.startTime.replace("T"," ");
				
			  break;
			case 12:
				singleProgramJson.endTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.endTime = dateJSToISO(newDate);
			  break;
			case 13:
		/*		//singleProgramJson.duplicate = fullArray[i];
			  break;
			case 14:
				//singleProgramJson.shareable = fullArray[i];
			  break;
			case 15:
				//singleProgramJson.findId = fullArray[i];
			  break;
			case 16:
				//singleProgramJson.hostname = fullArray[i];
			  break;
			case 17:
				//singleProgramJson.sourceId = fullArray[i];
			  break;
			case 18:
				//singleProgramJson.cardId = fullArray[i];
			  break;
			case 19:
				//singleProgramJson.inputId = fullArray[i];
			  break;
			  
			case 20:
				//singleProgramJson.recPriority = fullArray[i];
			  break;  */
			case 21:
				singleProgramJson.recStatus = fullArray[i];
				singleProgramJson.recStatusText = recStatusDecode(fullArray[i]);
			  break;
			case 22:
				//singleProgramJson.recordId = fullArray[i];
			  break;
			case 23:
				singleProgramJson.recType = fullArray[i];
			  break;
			case 24:
				//singleProgramJson.dupin = fullArray[i];
			  break;
			case 25:
				//singleProgramJson.dupMethod = fullArray[i];
			  break;
			case 26:
				singleProgramJson.recStartTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recStartTs = dateJSToISO(newDate);
			  break;
			case 27:
				singleProgramJson.recEndTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recEndTs = dateJSToISO(newDate);
			  break;
		/*	case 28:
				//singleProgramJson.repeat = fullArray[i];
			  break;
			case 29:
				//singleProgramJson.programflags = fullArray[i];
			  break;
			  
			case 30:
				//singleProgramJson.recGroup = fullArray[i];
			  break;
			case 31:
				//singleProgramJson.commfree = fullArray[i];
			  break;
			case 32:
				//singleProgramJson.outputFilters = fullArray[i];
			  break;
			case 33:
				//singleProgramJson.seriesId = fullArray[i];
			  break;
			case 34:
				//singleProgramJson.programId = fullArray[i];
			  break;
			case 35:
				//singleProgramJson.lastModified = fullArray[i];
			  break;
			case 36:
				//singleProgramJson.stars = fullArray[i];
			  break;
			case 37:
				//singleProgramJson.airdate = fullArray[i];
			  break;
			case 38:
				//singleProgramJson.hasairdate = fullArray[i];
			  break;
			case 39:
				//singleProgramJson.playgroup = fullArray[i];
			  break;
			  
			case 40:
				//singleProgramJson.recpriority2 = fullArray[i];
			  break;
			case 41:
				//singleProgramJson.parentid = fullArray[i];
			  break;  */
			case 42:
				//last field, push and reset counters
				//singleProgramJson.storagegroup = fullArray[i];
				
				finalList.push(singleProgramJson);
				
				singleProgramJson = {};
				programNum++;
				fieldNum = -1;
			  break;
		}
		
		fieldNum++;
	}
	
	
	WebMyth.parsedPrograms = programNum;
	
	
	return finalList;
	
}

var parsePrograms31 = function(fullResponse, type) {	

	//Protocol verion 31 and up - 42 fields

	var finalList = [];
	var fullArray = fullResponse.split("[]:[]");
	var offset = 1;
	
	//Mojo.Log.error("Parsing upcoming total programs is "+fullArray[1]+", length is "+fullArray.length);
	
	if(type == "upcoming") {
		WebMyth.hasConflicts = fullArray[0].substring(8,9);
		WebMyth.expectedLength = fullArray[1];
		offset = 2;
	}
	
	
	var i, programNum = 0, fieldNum = 0;
	var singleProgramJson = {};
	var newDate = new Date();
	
	for(i = offset; i < fullArray.length; i++){
		switch(fieldNum){
			case 0:
				singleProgramJson.title = fullArray[i];
			  break;
			case 1:
				singleProgramJson.subTitle = fullArray[i];
			  break;
			case 2:
				singleProgramJson.description = fullArray[i];
			  break;
			case 3:
				singleProgramJson.category = fullArray[i];
			  break;
			case 4:
				singleProgramJson.chanId = fullArray[i];
			  break;
			case 5:
				singleProgramJson.channum = fullArray[i];
			  break;
			case 6:
				singleProgramJson.callsign = fullArray[i];
			  break;
			case 7:
				singleProgramJson.channame = fullArray[i];
			  break;
		/*	case 8:
				//singleProgramJson.filename = fullArray[i];
			  break;
			case 9:
				//singleProgramJson.fs_high = fullArray[i];
			  break; 
			case 10:
				//singleProgramJson.fs_low = fullArray[i];
			  break; */
			case 11:
				singleProgramJson.startTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.startTime = dateJSToISO(newDate);
				singleProgramJson.startTimeSpace = singleProgramJson.startTime.replace("T"," ");
				
			  break;
			case 12:
				singleProgramJson.endTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.endTime = dateJSToISO(newDate);
			  break;
			case 13:
		/*		//singleProgramJson.duplicate = fullArray[i];
			  break;
			case 14:
				//singleProgramJson.shareable = fullArray[i];
			  break;
			case 15:
				//singleProgramJson.findId = fullArray[i];
			  break;
			case 16:
				//singleProgramJson.hostname = fullArray[i];
			  break;
			case 17:
				//singleProgramJson.sourceId = fullArray[i];
			  break;
			case 18:
				//singleProgramJson.cardId = fullArray[i];
			  break;
			case 19:
				//singleProgramJson.inputId = fullArray[i];
			  break;
			  
			case 20:
				//singleProgramJson.recPriority = fullArray[i];
			  break;  */
			case 21:
				singleProgramJson.recStatus = fullArray[i];
				singleProgramJson.recStatusText = recStatusDecode(fullArray[i]);
			  break;
			case 22:
				//singleProgramJson.recordId = fullArray[i];
			  break;
			case 23:
				singleProgramJson.recType = fullArray[i];
			  break;
			case 24:
				//singleProgramJson.dupin = fullArray[i];
			  break;
			case 25:
				//singleProgramJson.dupMethod = fullArray[i];
			  break;
			case 26:
				singleProgramJson.recStartTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recStartTs = dateJSToISO(newDate);
			  break;
			case 27:
				singleProgramJson.recEndTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recEndTs = dateJSToISO(newDate);
			  break;
		/*	case 28:
				//singleProgramJson.repeat = fullArray[i];
			  break;
			case 29:
				//singleProgramJson.programflags = fullArray[i];
			  break;
			  
			case 30:
				//singleProgramJson.recGroup = fullArray[i];
			  break;
			case 31:
				//singleProgramJson.commfree = fullArray[i];
			  break;
			case 32:
				//singleProgramJson.outputFilters = fullArray[i];
			  break;
			case 33:
				//singleProgramJson.seriesId = fullArray[i];
			  break;
			case 34:
				//singleProgramJson.programId = fullArray[i];
			  break;
			case 35:
				//singleProgramJson.lastModified = fullArray[i];
			  break;
			case 36:
				//singleProgramJson.stars = fullArray[i];
			  break;
			case 37:
				//singleProgramJson.airdate = fullArray[i];
			  break;
			case 38:
				//singleProgramJson.hasairdate = fullArray[i];
			  break;
			case 39:
				//singleProgramJson.playgroup = fullArray[i];
			  break;
			  
			case 40:
				//singleProgramJson.recpriority2 = fullArray[i];
			  break;  */
			case 41:
				//last field, push and reset counters
				//singleProgramJson.parentid = fullArray[i];
				
				finalList.push(singleProgramJson);
				
				singleProgramJson = {};
				programNum++;
				fieldNum = -1;
			  break;
		}
		
		fieldNum++;
	}
	
	
	WebMyth.parsedPrograms = programNum;
	
	
	return finalList;
	
}

var parsePrograms25 = function(fullResponse, type) {	

	//Protocol verion 25 and up - 41 fields
	//MythTV version 0.19 - won't support any older versions

	var finalList = [];
	var fullArray = fullResponse.split("[]:[]");
	var offset = 1;
	
	//Mojo.Log.error("Parsing upcoming total programs is "+fullArray[1]+", length is "+fullArray.length);
	
	if(type == "upcoming") {
		WebMyth.hasConflicts = fullArray[0].substring(8,9);
		WebMyth.expectedLength = fullArray[1];
		offset = 2;
	}
	
	
	var i, programNum = 0, fieldNum = 0;
	var singleProgramJson = {};
	var newDate = new Date();
	
	for(i = offset; i < fullArray.length; i++){
		switch(fieldNum){
			case 0:
				singleProgramJson.title = fullArray[i];
			  break;
			case 1:
				singleProgramJson.subTitle = fullArray[i];
			  break;
			case 2:
				singleProgramJson.description = fullArray[i];
			  break;
			case 3:
				singleProgramJson.category = fullArray[i];
			  break;
			case 4:
				singleProgramJson.chanId = fullArray[i];
			  break;
			case 5:
				singleProgramJson.channum = fullArray[i];
			  break;
			case 6:
				singleProgramJson.callsign = fullArray[i];
			  break;
			case 7:
				singleProgramJson.channame = fullArray[i];
			  break;
		/*	case 8:
				//singleProgramJson.filename = fullArray[i];
			  break;
			case 9:
				//singleProgramJson.fs_high = fullArray[i];
			  break; 
			case 10:
				//singleProgramJson.fs_low = fullArray[i];
			  break; */
			case 11:
				singleProgramJson.startTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.startTime = dateJSToISO(newDate);
				singleProgramJson.startTimeSpace = singleProgramJson.startTime.replace("T"," ");
				
			  break;
			case 12:
				singleProgramJson.endTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.endTime = dateJSToISO(newDate);
			  break;
			case 13:
		/*		//singleProgramJson.duplicate = fullArray[i];
			  break;
			case 14:
				//singleProgramJson.shareable = fullArray[i];
			  break;
			case 15:
				//singleProgramJson.findId = fullArray[i];
			  break;
			case 16:
				//singleProgramJson.hostname = fullArray[i];
			  break;
			case 17:
				//singleProgramJson.sourceId = fullArray[i];
			  break;
			case 18:
				//singleProgramJson.cardId = fullArray[i];
			  break;
			case 19:
				//singleProgramJson.inputId = fullArray[i];
			  break;
			  
			case 20:
				//singleProgramJson.recPriority = fullArray[i];
			  break;  */
			case 21:
				singleProgramJson.recStatus = fullArray[i];
				singleProgramJson.recStatusText = recStatusDecode(fullArray[i]);
			  break;
			case 22:
				//singleProgramJson.recordId = fullArray[i];
			  break;
			case 23:
				singleProgramJson.recType = fullArray[i];
			  break;
			case 24:
				//singleProgramJson.dupin = fullArray[i];
			  break;
			case 25:
				//singleProgramJson.dupMethod = fullArray[i];
			  break;
			case 26:
				singleProgramJson.recStartTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recStartTs = dateJSToISO(newDate);
			  break;
			case 27:
				singleProgramJson.recEndTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recEndTs = dateJSToISO(newDate);
			  break;
		/*	case 28:
				//singleProgramJson.repeat = fullArray[i];
			  break;
			case 29:
				//singleProgramJson.programflags = fullArray[i];
			  break;
			  
			case 30:
				//singleProgramJson.recGroup = fullArray[i];
			  break;
			case 31:
				//singleProgramJson.commfree = fullArray[i];
			  break;
			case 32:
				//singleProgramJson.outputFilters = fullArray[i];
			  break;
			case 33:
				//singleProgramJson.seriesId = fullArray[i];
			  break;
			case 34:
				//singleProgramJson.programId = fullArray[i];
			  break;
			case 35:
				//singleProgramJson.lastModified = fullArray[i];
			  break;
			case 36:
				//singleProgramJson.stars = fullArray[i];
			  break;
			case 37:
				//singleProgramJson.airdate = fullArray[i];
			  break;
			case 38:
				//singleProgramJson.hasairdate = fullArray[i];
			  break;
			case 39:
				//singleProgramJson.playgroup = fullArray[i];
			  break;  */
			  
			case 40:
				//last field, push and reset counters
				//singleProgramJson.recpriority2 = fullArray[i];
				
				finalList.push(singleProgramJson);
				
				singleProgramJson = {};
				programNum++;
				fieldNum = -1;
			  break;
		}
		
		fieldNum++;
	}
	
	
	WebMyth.parsedPrograms = programNum;
	
	
	return finalList;
	
}

var cleanUpcoming = function(fullList) {

	var finalList = [];
	
	var i, s = {};
	var conflicts = 0;
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		if(s.recstatus){
			s.recStatusText = recStatusDecode(s.recstatus);
			s.recStatus = s.recstatus;
		} else {
			s.recStatusText = recStatusDecode(s.recStatus);
		} 
		
		
		if(s.starttime){
			s.startTime = s.starttime;
		}
		
		if(s.subtitle){
			s.subTitle = s.subtitle;
		}
		
		if(s.chanid){
			s.chanId = s.chanid;
		}
		
		if(s.rectype){
			s.recType = s.rectype;
		}
		
		
		if(s.recStatus == 7){
			conflicts++;
		}
		
		s.startTimeSpace = s.startTime.replace("T"," ");

		finalList.push(s);
		
	}
	
	//return {'fullUpcomingList': finalList, 'conflicts': conflicts} ;
	return finalList;
}

var cleanRecordedGroup = function(fullList) {

	var finalList = [];
	
	finalList.push({label: $L('All'), recgroup: $L('All'), command: "go-groupAllRecgroupsOn", id: 0});
	
	var i, s = {}, currentLabel = 'All';
	
	fullList.sort(sort_by('label', false));
	
	for(i = 0; i < fullList.length; i++) {
		s = {};
		s = fullList[i];
		s.id = i+1;
		
		if(s.label == currentLabel) {
			//Same recgroup as last, don't add to list
			//Mojo.Log.info("not adding to recgroup %j",s);
		} else {
			currentLabel = s.label;
			s.id = i+1;
			finalList.push(s);
		}

		
	}
	
	return finalList;
	
}

var cleanInputs = function(fullList) {

	var finalList = [];
	
	var i, j, k, s, t = {}, u = [];
	
	finalList.push( { label: "None", value: "0" } );
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		t = {};
		
		t.value = s.cardinputid;
		
		if(s.displayname.length > 0){
			t.label = s.displayname;
		} else {
			t.label = "Input "+s.cardinputid;
		}
			
		
		finalList.push(t);
		
	}
	
	
	return finalList;
	
}

var cleanSettings = function(fullList) {

	//When updating this be sure to check query in welcome scene

	var settingsObject = { hosts: [] };
	var hosts = [];
	var controlPorts = [];
	var backendPorts = [];
	var hostObject = {}, portObject = {}, backendObject = {};
	
	var i, j, k, l, s = {}, t = {};
	
	//Set defaults
	settingsObject.AutoCommercialFlag = 1;
	settingsObject.AutoTranscode = 0;
	settingsObject.AutoRunUserJob1 = 0;
	settingsObject.AutoRunUserJob2 = 0;
	settingsObject.AutoRunUserJob3 = 0;
	settingsObject.AutoRunUserJob4 = 0;
	settingsObject.DefaultStartOffset = 0;
	settingsObject.DefaultEndOffset = 0;
	settingsObject.UserJobDesc1 = "User Job 1";
	settingsObject.UserJobDesc2 = "User Job 2";
	settingsObject.UserJobDesc3 = "User Job 3";
	settingsObject.UserJobDesc4 = "User Job 4";
	
	
	for(i = 0; i < fullList.length; i++) {
		s = fullList[i];
		
		//Mojo.Log.error("Single settings is %j",s);
		
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
			settingsObject.DefaultStartOffset = parseInt(s.data);
		} else if(s.value == "DefaultEndOffset") {
			settingsObject.DefaultEndOffset = parseInt(s.data);
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
		} else if(s.value == "MasterServerPort") {
			settingsObject.MasterServerPort = s.data;
		} else if(s.value == "BackendServerIP") {
			hostObject = { "hostname": s.hostname, "ip": s.data, "master": false };
			settingsObject.hosts.push(hostObject);
		} else if(s.value == "NetworkControlPort") {
			portObject = { "hostname": s.hostname, "controlPort": s.data };
			controlPorts.push(portObject);
		} else if(s.value == "BackendServerPort") {
			backendObject = { "hostname": s.hostname, "BackendServerPort": s.data };
			backendPorts.push(backendObject);
		}
		
	}
	
	//Mojo.Log.error("Clean settings initial JSON is %j",settingsObject);
	
	
	for(j = 0; j < settingsObject.hosts.length; j++) {
		t = settingsObject.hosts[j];
		
		if(t.ip == settingsObject.MasterServerIP) {
			t.master = true;
		}
		
		for(k = 0; k < controlPorts.length; k++) {
			if(t.hostname == controlPorts[k].hostname) {
				t.controlPort = controlPorts[k].controlPort;
			}
		}
		
		for(l = 0; l < backendPorts.length; l++) {
			if(t.hostname == backendPorts[l].hostname) {
				t.BackendServerPort = backendPorts[l].BackendServerPort;
			}
		}
	}
	
	
	//Mojo.Log.error("Final settings JSON is %j",settingsObject);
	
	return settingsObject;
	
}

var cleanHostsCookie = function(fullList) {

	var finalList = [];
	
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
				newStatusText = $L("Tuner Busy");
			break;
			case -7:		
				newStatusText = $L("Low Disk Space");
			break;
			case -6:		
				newStatusText = $L("Cancelled");
			break;
			case -5:		
				newStatusText = $L("Deleted");
			break;
			case -4:		
				newStatusText = $L("Aborted");
			break;
			case -3:		
				newStatusText = $L("Recorded");
			break;
			case -2:		
				newStatusText = $L("Recording");
			break;
			case -1:		
				newStatusText = $L("Will Record");
			break;
			case 0:		
				newStatusText = $L("Unknown");
			break;
			case 1:		
				newStatusText = $L("Force Don't Record");
			break;
			case 2:		
				newStatusText = $L("Previously Recorded");
			break;
			case 3:		
				newStatusText = $L("Current Recording");
			break;
			case 4:		
				newStatusText = $L("Don't Record");
			break;
			case 5:		
				newStatusText = $L("Earlier Showing");
			break;
			case 6:		
				newStatusText = $L("Not Listed");
			break;
			case 7:		
				newStatusText = $L("Conflict");
			break;
			case 8:		
				newStatusText = $L("Later Showing");
			break;
			case 9:		
				newStatusText = $L("Repeat");
			break;
			case 10:		
				newStatusText = $L("Inactive");
			break;
			case 11:		
				newStatusText = $L("Never Record");
			break;
			
			default:
				newStatusText = " "+$L("No matching recording rule");
			break;
		}	
		
	return newStatusText;
	
};