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


function RecordedDetailsAssistant(detailsObject) {
	   
	   this.recordedObject = detailsObject;
	   this.standardFilename = '';
	   this.downloadOrStream = '';
	   
	   this.timeOffsetSeconds = 0;
	   
	   this.screenshotUrl = "";
  
		this.jobqueueList = [{"hostname": "N/A", "comment": "", "jobType": "N/A", "statusText": "Attempting to get queue data ..." }];
	   
}

RecordedDetailsAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Starting recorded details scene '%j'", this.recordedObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{label: $L('Play'), submenu:'hosts-menu', width: 90},{},{label: $L('More'), submenu:'more-menu', width: 90}]};
 
	this.hostsMenuModel = { label: $L('Hosts'), items: []};
	this.moreMenuModel = { label: $L('MoreMenu'), items: [
			{"label": $L('Delete'), items:[
				{"label": $L('Delete'), "command": "go-dele-delete"}
			]},
			{"label": $L('Queue a job'), items:[
				{"label": $L('Transcode'), "command": "go-queue1"},
				{"label": $L('Flag commercials'), "command": "go-queue2"},
				{"label": $L('User Job 1'), "command": "go-queue256"},
				{"label": $L('User Job 2'), "command": "go-queue512"},
				{"label": $L('User Job 3'), "command": "go-queue1024"},
				{"label": $L('User Job 4'), "command": "go-queue2048"}	
			]},	
			{"label": $L('Web'), items:[
				{"label": $L('Wikipedia'), "command": "go-web--Wikipedia"},
				{"label": $L('themoviedb'), "command": "go-web--themoviedb"},
				{"label": $L('IMDB'), "command": "go-web--IMDB"},
				{"label": $L('TheTVDB'), "command": "go-web--TheTVDB"},
				{"label": $L('TV.com'), "command": "go-web--TV.com"},
				{"label": $L('Google'), "command": "go-web--Google"}	
			]},	
			{"label": $L('MythWeb'), "command": "go-mythweb"},	
			{"label": $L('Guide'), "command": "go-guide"}
		]};
			
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('hosts-menu', '', this.hostsMenuModel);
	this.controller.setupWidget('more-menu', '', this.moreMenuModel);
	
	
	//List of jobqueue
	this.jobqueueListAttribs = {
		itemTemplate: "recordedDetails/jobqueueListItem",
		swipeToDelete: false
	};
	
    this.jobqueueListModel = {            
        items: this.jobqueueList
    };
	this.controller.setupWidget( "jobqueueList" , this.jobqueueListAttribs, this.jobqueueListModel);

	
		
	//Check we are on WiFi 
	this.controller.serviceRequest('palm://com.palm.connectionmanager', {
			method: 'getstatus',
			parameters: {subscribe: false},
			onSuccess: function(response) {
				//Mojo.Log.error("Got connection status of %j", response);
				
				if(((response.wifi.state != "connected")&&(WebMyth.prefsCookieObject.useWebmythScript))||(WebMyth.prefsCookieObject.forceScriptScreenshots)) {
					this.screenshotUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile+"?op=getPremadeImage&chanid=";
					this.screenshotUrl += this.recordedObject.chanId + "&starttime=" + this.recordedObject.recStartTs.replace("T"," ");
				} else {
					this.screenshotUrl = "http://"+getBackendIP(WebMyth.backendsCookieObject,this.recordedObject.hostname,WebMyth.prefsCookieObject.masterBackendIp)+":6544/Myth/GetPreviewImage?ChanId=";
					this.screenshotUrl += this.recordedObject.chanId + "&StartTime=" + this.recordedObject.recStartTs.replace("T"," ");
				}
				
	
				Mojo.Log.error("Screenshot URL is "+ this.screenshotUrl);

				$('recorded-screenshot').src = this.screenshotUrl;
				
			}.bind(this),
			onFailure: function() {}
		}
	);
	

	//Fill in data values
	
	$('scene-title').innerText = this.recordedObject.title;
	$('subtitle-title').innerText = this.recordedObject.subTitle;
	$('description-title').innerText = this.recordedObject.description;
	$('category-title').innerText = this.recordedObject.category;
	
	$('hostname-title').innerText = this.recordedObject.hostname;
	$('recgroup-title').innerText = this.recordedObject.recGroup;
	$('starttime-title').innerText = this.recordedObject.startTime.replace("T"," ");
	$('endtime-title').innerText = this.recordedObject.endTime.replace("T"," ");
	$('airdate-title').innerText = this.recordedObject.airdate;
	//$('storagegroup-title').innerText = this.recordedObject.storagegroup;
	//$('playgroup-title').innerText = this.recordedObject.playgroup;
	//$('programflags-title').innerText = this.recordedObject.programflags;
	$('programid-title').innerText = this.recordedObject.programId;
	$('seriesid-title').innerText = this.recordedObject.seriesId;
	$('channame-title').innerText = this.recordedObject.channelName;
	$('channum-title').innerText = this.recordedObject.chanNum;
	$('recstartts-title').innerText = this.recordedObject.recStartTs.replace("T"," ");
	$('filesize-title').innerText = Mojo.Format.formatNumber(parseInt(this.recordedObject.fileSize.substring(0,this.recordedObject.fileSize.length - 6)))+" MB";
	
	//Mojo.Event.listen(this.controller.get("recorded-screenshot"),Mojo.Event.tap, this.goScreenshot.bind(this));
	
	this.getJobqueue();
	
};

RecordedDetailsAssistant.prototype.activate = function(event) {
	
	//Update list of current hosts
	var hostsList = [];
	var i, s;

	
	if(WebMyth.prefsCookieObject.allowRecordedDownloads) {
		var downloadCmd = { "label": "Download to Phone", "command": "go-down-download" }
		var streamCmd = { "label": "Stream to Phone", "command": "go-down-stream" }
		
		hostsList.push(downloadCmd);
		hostsList.push(streamCmd);
	}	
	
	
	for (i = 0; i < WebMyth.hostsCookieObject.length; i++) {

		s = { 
			"label": $L(WebMyth.hostsCookieObject[i].hostname),
			"command": "go-play-"+WebMyth.hostsCookieObject[i].hostname,
			"hostname": WebMyth.hostsCookieObject[i].hostname,
			"port": WebMyth.hostsCookieObject[i].port 
		};
		hostsList.push(s);
		
	};
		
	this.hostsMenuModel.items = hostsList;
	this.controller.modelChanged(this.hostsMenuModel);
	
	
	
	
	if(this.recordedObject.recGroup == "Deleted"){
	
		this.moreMenuModel.items[0].label = "Undelete";
		this.moreMenuModel.items[0].items = [
				{"label": $L('Undelete'), "command": "go-undelete"}
			];
			
	};	
	
	
	//Update jobs names
	this.moreMenuModel.items[1].items[2].label = WebMyth.settings.UserJobDesc1;
	this.moreMenuModel.items[1].items[3].label = WebMyth.settings.UserJobDesc2;
	this.moreMenuModel.items[1].items[4].label = WebMyth.settings.UserJobDesc3;
	this.moreMenuModel.items[1].items[5].label = WebMyth.settings.UserJobDesc4;
	
	
	this.controller.modelChanged(this.moreMenuModel);
	
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

RecordedDetailsAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
};

RecordedDetailsAssistant.prototype.cleanup = function(event) {

};

RecordedDetailsAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.command) {
  	myCommand = event.command.substring(0,7);
	mySelection = event.command.substring(8);
	Mojo.Log.info("Selected command: "+myCommand+" host: "+mySelection);

    switch(myCommand) {
      case 'go-play':
		this.playOnHost(mySelection);
       break;
      case 'go-web-':
		this.openWeb(mySelection);
       break;
      case 'go-down':
		this.handleDownload(mySelection);
       break;
      case 'go-dele':
		this.handleDelete(mySelection);
       break;
      case 'go-queu':
		this.queueJob(mySelection);
       break;
      case 'go-unde':
		this.handleUndelete(mySelection);
       break;
      case 'go-myth':
		this.openMythweb();
       break;
      case 'go-guid':
		this.openGuide();
       break;
    }
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};

RecordedDetailsAssistant.prototype.handleKey = function(event) {

	Mojo.Log.info("handleKey %o, %o", event.originalEvent.metaKey, event.originalEvent.keyCode);
	
	if(event.originalEvent.metaKey) {
		switch(event.originalEvent.keyCode) {
			case 71:
				Mojo.Log.info("g - shortcut key to guide");
				Mojo.Controller.stageController.swapScene("guide");	
				break;
			case 82:
				Mojo.Log.info("r - shortcut key to recorded");
				Mojo.Controller.stageController.swapScene("recorded");
				break;
			case 83:
				Mojo.Log.info("s - shortcut key to status");
				Mojo.Controller.stageController.swapScene("status");
				break;
			case 85:
				Mojo.Log.info("u - shortcut key to upcoming");
				Mojo.Controller.stageController.swapScene("upcoming");
				break;
			default:
				Mojo.Log.info("No shortcut key");
				break;
		}
	}
	Event.stop(event); 
};




RecordedDetailsAssistant.prototype.openGuide = function() {

	//Mojo.Log.error("Opening in guide "+this.starttime.replace(" ","T"));
	
	Mojo.Controller.stageController.pushScene("guide", this.recordedObject.startTime.replace(" ","T").substring(0,18)+01);
 
};

RecordedDetailsAssistant.prototype.openMythweb = function() {

	Mojo.Log.error("opening mythweb");
			
			
	var dateJS = new Date(isoToJS(this.recordedObject.recStartTs));
	var dateUTC = dateJS.getTime()/1000;				//don't need 59 second offset?
			
	Mojo.Log.info("Selected time is: '%j'", dateUTC);
			
	
	var mythwebUrl = "http://";
	mythwebUrl += WebMyth.prefsCookieObject.webserverName;
	mythwebUrl += "/mythweb/tv/detail/";
	mythwebUrl += this.recordedObject.chanId + "/";
	mythwebUrl += dateUTC;
	//mythwebUrl += "?RESET_TMPL=true";
			
	Mojo.Log.info("mythweb url is "+mythwebUrl);
	
	
			
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters:  {
			id: 'com.palm.app.browser',
			params: {
				target: mythwebUrl
			}
		}
	}); 
	
};

RecordedDetailsAssistant.prototype.openWeb = function(website) {

  //Mojo.Log.error('got to openWeb with : '+website);
  var url = "";
  
  switch(website) {
	case 'Wikipedia':
		url = "http://en.m.wikipedia.org/wiki/Special:Search?search="+this.recordedObject.title;
	  break;
	case 'themoviedb':
		url = "http://www.themoviedb.org/search/movies?search[text]="+this.recordedObject.title;
	  break;
	case 'IMDB':
		url = "http://m.imdb.com/find?s=all&q="+this.recordedObject.title;
	  break;
	case 'TheTVDB':
		url = "http://www.thetvdb.com/?string="+this.recordedObject.title+"&searchseriesid=&tab=listseries&function=Search";
	  break;
	case 'TV.com':
		url = "http://www.tv.com/search.php?type=11&stype=all&qs="+this.recordedObject.title;
	  break;
	case 'Google':
		url = "http://www.google.com/m/search?client=ms-palm-webOS&channel=iss&q="+this.recordedObject.title;
	  break;
	default:	
		url = "";
	  break;
  };
  
  this.controller.serviceRequest("palm://com.palm.applicationManager", {
   method: "open",
   parameters:  {
       id: 'com.palm.app.browser',
       params: {
           target: url
       }
   }
 });  
 
};

RecordedDetailsAssistant.prototype.handleDownload = function(downloadOrStream_in) {

	Mojo.Log.info("Asked to "+downloadOrStream_in+" recorded program");
	this.downloadOrStream = downloadOrStream_in;
	
	var dateJS = new Date(isoToJS(this.recordedObject.recStartTs));
	
	Mojo.Log.info("Rec date JS is %j, %s", dateJS, this.recordedObject.recStartTs);
	
	//requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
	
	var filenameRequestUrl = "http://"+WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword+"@";
	filenameRequestUrl += WebMyth.prefsCookieObject.webserverName+"/mythweb/pl/stream/";
	filenameRequestUrl += this.recordedObject.chanId+"/";
	filenameRequestUrl += ((dateJS.getTime()/1000));
	filenameRequestUrl += ".mp4";
	
	Mojo.Log.info("Download/stream URL is "+filenameRequestUrl);
	
	var myFilename = this.recordedObject.title + "-" + this.recordedObject.subTitle + ".mp4";
	
	Mojo.Log.info("Filename is "+myFilename);
 
 
	if( this.downloadOrStream == 'download' ) {
		Mojo.Log.info("starting download");
		
		parameters = {
				target: filenameRequestUrl,		
				mime: "video/mp4",
				targetFilename: myFilename,
				subscribe: true,	
				targetDir: "/media/internal/mythtv/"
			};
		
		//WebMyth.downloadToPhone(parameters);
		
		
		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
				target: filenameRequestUrl,		
				mime: "video/mp4",
				targetFilename: myFilename,
				subscribe: true,	
				targetDir: "/media/internal/mythtv/"
			},
			onSuccess: function(response) {
				if(response.completed) {
					this.controller.showBanner("Download finished! "+myFilename, "");
					
					this.controller.serviceRequest('palm://com.palm.applicationManager', {
						method:'launch',							
						parameters: {
							id:"com.palm.app.videoplayer"
						}
					});	
						
				} else {
					if(response.amountReceived && response.amountTotal) {
						var percent = (response.amountReceived / response.amountTotal)*100;
						percent = Math.round(percent);
						if(percent!=NaN) {
							if(this.currProgress != percent) {
								this.currProgress = percent;
								this.controller.showBanner("Downloading: " + percent + "%", "");
							}
						}
					}
					
				}
			}.bind(this)
		});	
		
		
		
	} else if( this.downloadOrStream == 'stream' ) {
		
		Mojo.Log.info("Starting to stream");
	
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: "launch",
			parameters:  {
				id: 'com.palm.app.videoplayer',
				params: {
					target: filenameRequestUrl	
				}
			}
		});	
	}
 
};

RecordedDetailsAssistant.prototype.playOnHost = function(host) {

	//Attempting to play
	var thisHostname = host;
	WebMyth.prefsCookieObject.currentFrontend = host;
	
	//var clean_starttime = this.recordedObject.starttime.replace(' ','T');
	var clean_starttime = this.recordedObject.recStartTs;
	
	var cmd = "program "+this.recordedObject.chanId+" "+clean_starttime+" resume";
	
	Mojo.Log.info("Command to send is " + cmd);

		
	WebMyth.sendPlay(cmd);
	
	
	if(WebMyth.prefsCookieObject.playJumpRemote)  Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
};

RecordedDetailsAssistant.prototype.handleDelete = function(selection_in) {
	
	Mojo.Log.info("Deleting with "+selection_in+" option");
	
	var intdate = this.recordedObject.recStartTs.replace("T","").replace(":","").replace(":","").replace("-","").replace("-","");
	
	if(selection_in == "rerecord"){
		intdate += " FORGET";
	}
	
	
	var command = 'DELETE_RECORDING '+this.recordedObject.chanId+" "+intdate;
	
	
	Mojo.Log.error("command is "+command);
	
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=backendCommand";				
	requestUrl += "&command64=";		
	requestUrl += Base64.encode(command);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: function() {
				Mojo.Log.info("Success in sending command");
				Mojo.Controller.getAppController().showBanner("Successfully deleted", {source: 'notification'});
			},
            onFailure: function() {
				Mojo.Log.error("Error in sending command");
				Mojo.Controller.getAppController().showBanner("Error deleting recording", {source: 'notification'});
			}  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

RecordedDetailsAssistant.prototype.handleUndelete = function() {
	
	Mojo.Log.info("Undeleting recorded");
	
	
	
	var query = 'UPDATE `recorded` SET `recgroup` = "Default" WHERE `chanid` = '
	query += this.recordedObject.chanId;
	query += ' AND `starttime` = "';
	query += this.recordedObject.recStartTs.replace("T"," ");
	query += '" LIMIT 1; ';
	
	
	Mojo.Log.error("query is "+query);
	
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: function() {
				Mojo.Log.info("Success in sending command");
				Mojo.Controller.getAppController().showBanner("Successfully undeleted", {source: 'notification'});
			},
            onFailure: function() {
				Mojo.Log.error("Error in sending command");
				Mojo.Controller.getAppController().showBanner("Error undeleting recording", {source: 'notification'});
			}  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

RecordedDetailsAssistant.prototype.getJobqueue = function() {
	
	Mojo.Log.info("Getting jobqueue");
	
	
	var query = 'SELECT * FROM `jobqueue` WHERE `chanid` = "'+this.recordedObject.chanId+'" AND `starttime` = "'+this.recordedObject.recStartTs+'" ;';
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQLwithResponse";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.successJobqueue.bind(this),
            onFailure: this.failJobqueue.bind(this)
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

RecordedDetailsAssistant.prototype.failJobqueue = function() {

	Mojo.Log.info("Failed to get jobqueue data ");
	
	this.jobqueueList.clear();
	
	this.jobqueueList.push({"hostname": "N/A", "comment": "", "jobType": "ERROR", "statusText": "Failed to get jobqueue data" });	
	
	this.controller.modelChanged(this.jobqueueListModel);

}

RecordedDetailsAssistant.prototype.successJobqueue = function(response) {

	Mojo.Log.info("Got matching jobqueue data %j",response.responseJSON);
	
	if(response.responseJSON) {
		//Got some recent jobqueues
		this.jobqueueList.clear();
		
		Object.extend(this.jobqueueList, cleanJobqueue(response.responseJSON));
		
		this.controller.modelChanged(this.jobqueueListModel);
	
		
	} else {
		//Got empty response
		this.jobqueueList.clear();
		
		this.jobqueueList.push({"hostname": "N/A", "comment": "", "jobType": "N/A", "statusText": "No recent jobs" });
		
		this.controller.modelChanged(this.jobqueueListModel);
	
	}

}

RecordedDetailsAssistant.prototype.queueJob = function(jobTypeNum) {
	
	Mojo.Log.info("Queueing job "+jobTypeNum);
	
	var nowDate = new Date();
	var nowDateISO = dateJSToISO(nowDate);
	
	
	
	var query = 'INSERT INTO `jobqueue` SET `chanid` = "'+this.recordedObject.chanId;
	query += '", starttime = "'+this.recordedObject.recStartTs.replace("T"," ");
	query += '", inserttime = "'+nowDateISO.replace("T"," ");
	query += '", type = "'+jobTypeNum;
	query += '", hostname = "';
	query += '", args = "';
	query += '", status = "1';
	query += '", statustime = "'+nowDateISO.replace("T"," ");
	query += '", schedruntime = "'+nowDateISO.replace("T"," ");
	query += '", comment = "Queued by WebMyth app';
	query += '", flags = "0"';
		
	
	Mojo.Log.error("query is "+query);
	
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: function() {
				Mojo.Log.info("Success in queueing job");
				Mojo.Controller.getAppController().showBanner("Successfully queued", {source: 'notification'});
			},
            onFailure: function() {
				Mojo.Log.error("Error in queueing job");
				Mojo.Controller.getAppController().showBanner("Error queueing", {source: 'notification'});
			}  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

};
