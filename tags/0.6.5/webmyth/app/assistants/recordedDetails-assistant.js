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
	   
	this.peopleList = [ ];
	   
}

RecordedDetailsAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Starting recorded details scene '%j'", this.recordedObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{label: $L('Play'), submenu:'hosts-menu', width: 90},
									{ icon: 'refresh', command: 'go-refresh' },
									{label: $L('More'), submenu:'more-menu', width: 90}]};
 
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
			{"label": $L('Setup Schedule'), "command": "go-setup"},	
			{"label": $L('Guide'), items:[
				{"label": $L('Time'), "command": "go-guid-time"},
				{"label": $L('Title Search'), "command": "go-guid-search"}
			]}
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
	
	
	//List of people
	this.peopleListAttribs = {
		itemTemplate: "guideDetails/peopleListItem",
		swipeToDelete: false
	};
	
    this.peopleListModel = {            
        items: this.peopleList
    };
	this.controller.setupWidget( "peopleList" , this.peopleListAttribs, this.peopleListModel);
	
	Mojo.Event.listen(this.controller.get( "peopleList" ), Mojo.Event.listTap, this.goPeopleDetails.bind(this));

	
		
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
				
	
				//Mojo.Log.error("Screenshot URL is "+ this.screenshotUrl);

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
	
	if((this.recordedObject.recStatus == -2)) {
		$('currently-recording-title').innerText = $L("Currently Recording");
	} else {
		$('currently-recording-title').innerText = "";
	}
	
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	

	if(WebMyth.usePlugin){
		$('webmyth_service_id').mysqlRecordedDetailsPeopleResponse = this.mysqlRecordedDetailsPeopleResponse.bind(this);
		$('webmyth_service_id').mysqlRecordedUndeleteResponse = this.mysqlRecordedUndeleteResponse.bind(this);
		$('webmyth_service_id').mysqlRecordedJobqueueResponse = this.mysqlRecordedJobqueueResponse.bind(this);
		$('webmyth_service_id').mysqlRecordedNewjobResponse = this.mysqlRecordedNewjobResponse.bind(this);
		
	}
	
	//this.getJobqueue();
	this.getPeople();
	
};

RecordedDetailsAssistant.prototype.activate = function(event) {

	$('generalDetails-group-title').innerText = $L('General Details');
		$('subtitle-label').innerText = $L('Subtitle');
		$('category-label').innerText = $L('Category');
	$('programDetails-group-title').innerText = $L('Program Details');
		$('airdate-label').innerText = $L('Original Airdate');
		$('seriesid-label').innerText = $L('Series ID');
		$('programid-label').innerText = $L('Program ID');
		$('channum-label').innerText = $L('Channel Number');
		$('channame-label').innerText = $L('Channel Name');
		$('starttime-label').innerText = $L('Start Time');
		$('endtime-label').innerText = $L('End Time');
	$('recordingDetails-group-title').innerText = $L('Recording Details');
		$('hostname-label').innerText = $L('Hostname');
		$('recgroup-label').innerText = $L('Recording Group');
		$('recstartts-label').innerText = $L('Recording Start');
		$('filesize-label').innerText = $L('Filesize');
	$('jobqueue-group-title').innerText = $L('Queued or Recent Jobs');
	
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
			"command": "go-play-"+WebMyth.hostsCookieObject[i].hostname+"[]:[]"+WebMyth.hostsCookieObject[i].address+"[]:[]"+WebMyth.hostsCookieObject[i].port,
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
		this.openGuide(mySelection);
       break;
      case 'go-setu':
		this.openSetup();
       break;
      case 'go-refr':
		this.getJobqueue();
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
			case 72:
				Mojo.Log.info("h - shortcut key to hostSelector");
				Mojo.Controller.stageController.swapScene("hostSelector");
				break;
			case 82:
				Mojo.Log.info("r - shortcut key to recorded");
				Mojo.Controller.stageController.swapScene("recorded");
				break;
			case 85:
				Mojo.Log.info("u - shortcut key to upcoming");
				Mojo.Controller.stageController.swapScene("upcoming");
				break;
			case 71:
				Mojo.Log.info("g - shortcut key to guide");
				Mojo.Controller.stageController.swapScene("guide");	
				break;
			case 86:
				Mojo.Log.info("v - shortcut key to videos");
				Mojo.Controller.stageController.swapScene("videos");	
				break;
			case 77:
				Mojo.Log.info("m - shortcut key to musicList");
				Mojo.Controller.stageController.swapScene("musicList");	
				break;
			case 83:
				Mojo.Log.info("s - shortcut key to status");
				Mojo.Controller.stageController.swapScene("status");
				break;
			case 76:
				Mojo.Log.info("l - shortcut key to log");
				Mojo.Controller.stageController.swapScene("log");	
				break;
			default:
				Mojo.Log.info("No shortcut key");
				break;
		}
	}
	Event.stop(event); 
};





RecordedDetailsAssistant.prototype.openSetup = function() {

	//Mojo.Log.error("Opening in guide "+this.starttime.replace(" ","T"));
	
	Mojo.Controller.stageController.pushScene("setupRecording", this.recordedObject);
 
};

RecordedDetailsAssistant.prototype.openGuide = function(guideType) {

	//Mojo.Log.error("Opening in guide "+guideType);
	
	if(guideType == "time"){
		Mojo.Controller.stageController.pushScene("guide", this.recordedObject.startTime.replace(" ","T").substring(0,18)+01);
	} else if(guideType == "search"){
		Mojo.Controller.stageController.pushScene("search", this.recordedObject.title);
	}
	
};

RecordedDetailsAssistant.prototype.openMythweb = function() {

	//Mojo.Log.error("opening mythweb");
			
			
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
		url = "http://"+Mojo.Locale.getCurrentLocale().substring(0,2)+".m.wikipedia.org/wiki/Special:Search?search="+this.recordedObject.title;
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
	
	var myFilename = this.recordedObject.title.replace(":","-") + "-" + this.recordedObject.subTitle.replace(":","-") + ".mp4";
	myFilename.replace(/:/g,"-");
	
	Mojo.Log.info("Filename is "+myFilename);

	if( this.downloadOrStream == 'download' ) {
		Mojo.Log.info("starting download");
		
		parameters = {
				target: filenameRequestUrl,		
				mime: "video/mp4",
				targetFilename: myFilename,
				subscribe: true,	
				targetDir: "/media/internal/video/"
			};
		
		//WebMyth.downloadToPhone(parameters);
		
		
		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
				target: filenameRequestUrl,		
				mime: "video/mp4",
				targetFilename: myFilename,
				subscribe: true,	
				targetDir: "/media/internal/video/"
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

RecordedDetailsAssistant.prototype.playOnHost = function(frontend) {

	var frontendDecoder = frontend.split("[]:[]");
	var cmd = "program "+this.recordedObject.chanId+" "+this.recordedObject.recStartTs+" resume";
	
	
	Mojo.Log.info("Frontend is "+frontend);
	Mojo.Log.info("Command to send is " + cmd);
	
	
	if((WebMyth.prefsCookieObject.currentFrontend != frontendDecoder[0])){
		Mojo.Log.info("Changing frontend to "+frontendDecoder[0]);

		WebMyth.prefsCookieObject.currentFrontend = frontendDecoder[0];
		WebMyth.prefsCookieObject.currentFrontendAddress = frontendDecoder[1];
		WebMyth.prefsCookieObject.currentFrontendPort = frontendDecoder[2];
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
		if(WebMyth.useService) {
			WebMyth.startNewCommunication(this);
		}
		
	}
	
	
	

	
	if(WebMyth.useService) {
		WebMyth.sendServiceCmd(this, "play "+cmd);
	} else {
		WebMyth.sendPlay(cmd);
	}
	
	
	if(WebMyth.prefsCookieObject.playJumpRemote) {
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	}
	
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
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mythprotocolCommand(WebMyth.prefsCookieObject.masterBackendIp, WebMyth.prefsCookieObject.masterBackendPort, WebMyth.prefsCookieObject.protoVer, command);
		Mojo.Log.info("Plugin protocol response: "+response1);
		
		Mojo.Controller.getAppController().showBanner("Successfully deleted", {source: 'notification'});
		
	} else if(WebMyth.useService){
		WebMyth.mythprotocolCommand(this, command, "Successfully deleted");
		
	} else { 
	
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
	
};

RecordedDetailsAssistant.prototype.handleUndelete = function() {
	
	Mojo.Log.info("Undeleting recorded");
	
	
	
	var query = 'UPDATE `recorded` SET `recgroup` = "Default" WHERE `chanid` = '
	query += this.recordedObject.chanId;
	query += ' AND `starttime` = "';
	query += this.recordedObject.recStartTs.replace("T"," ");
	query += '" LIMIT 1; ';
	
	//Mojo.Log.error("Undelete query is "+query);
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlExecute(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlRecordedUndeleteResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		//Mojo.Log.error("Recorded undelete plugin response "+response1);
		
	} else {
	
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=executeSQL";				
		requestUrl += "&query64=";		
		requestUrl += Base64.encode(query);	
		
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
	
};

RecordedDetailsAssistant.prototype.mysqlRecordedUndeleteResponse = function(response) {

	//Mojo.Log.error("Got undelete plugin response: "+response);
	
	Mojo.Controller.getAppController().showBanner("Successfully undeleted", {source: 'notification'});
	
};

RecordedDetailsAssistant.prototype.getPeople = function(event) {

	Mojo.Log.error("Searching for people for program");
	
	
	var query = 'SELECT UPPER(`credits`.`role`) AS `role`, ';
	query += ' `people`.`name`, `people`.`person` ';
	query += ' FROM `credits` ';
	query += ' LEFT OUTER JOIN `people` ON `credits`.`person` = `people`.`person` ';
	query += ' WHERE (`credits`.`chanid` = '+this.recordedObject.chanId+' AND `credits`.`starttime` = "'+this.recordedObject.startTime.replace("T"," ")+'" ) ';
	query += ' ORDER BY `role` ';
	
	//Mojo.Log.error("Query is "+query);
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlRecordedDetailsPeopleResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		Mojo.Log.error("Search plugin response "+response1);
		
	} else {
	
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=executeSQLwithResponse";				
		requestUrl += "&query64=";		
		requestUrl += Base64.encode(query);	
		

		
		try {
			var request = new Ajax.Request(requestUrl,{
				method: 'get',
				evalJSON: 'true',
				requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
				onSuccess: this.peopleSearchSuccess.bind(this),
				onFailure: this.peopleSearchFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}
	

}

RecordedDetailsAssistant.prototype.peopleSearchFail = function(response) {

	Mojo.Log.error('Failed to get guide details people response');
	
	this.getJobqueue();	
	
};

RecordedDetailsAssistant.prototype.peopleSearchSuccess = function(response) {
    
	Mojo.Log.error('Got Ajax response: %j', response.responseJSON);
		
	//Update the list widget only if had data
	if(response.responseJSON) {
	
		this.peopleList.clear();
		Object.extend(this.peopleList,response.responseJSON);
		
		this.controller.modelChanged(this.peopleListModel);
		
	}
	
	this.getJobqueue();

};

RecordedDetailsAssistant.prototype.mysqlRecordedDetailsPeopleResponse = function(response) {

	Mojo.Log.error("Got guide details people plugin response: "+response);
	
	var guideDetailsPeopleJson = JSON.parse(response);
	
	//Update the list widget
	this.peopleList.clear();
	Object.extend(this.peopleList,guideDetailsPeopleJson);
	
	this.controller.modelChanged(this.peopleListModel);
	
	setTimeout(this.getJobqueue.bind(this), 50);

}

RecordedDetailsAssistant.prototype.getJobqueue = function() {
	
	Mojo.Log.info("Getting jobqueue");
	
	
	var query = 'SELECT * FROM `jobqueue` WHERE `chanid` = "'+this.recordedObject.chanId+'" AND `starttime` = "'+this.recordedObject.recStartTs+'" ;';
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlRecordedJobqueueResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		//Mojo.Log.error("Recorded jobqueue plugin response "+response1);
		
	} else {
	
		try {
		
			var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
			requestUrl += "?op=executeSQLwithResponse";				
			requestUrl += "&query64=";		
			requestUrl += Base64.encode(query);	
			
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
	
	}
	
};

RecordedDetailsAssistant.prototype.failJobqueue = function() {

	Mojo.Log.info("Failed to get jobqueue data ");
	
	this.jobqueueList.clear();
	
	this.jobqueueList.push({"hostname": "N/A", "comment": "", "jobType": "ERROR", "statusText": "Failed to get jobqueue data" });	
	
	this.controller.modelChanged(this.jobqueueListModel);
	
	this.getDetailsXML();

}

RecordedDetailsAssistant.prototype.successJobqueue = function(response) {

	Mojo.Log.info("Got matching jobqueue data %j",response.responseJSON);
	
	if(response.responseJSON) {
		//Got some recent jobqueues
		this.jobqueueList.clear();
		Object.extend(this.jobqueueList, cleanJobqueue(response.responseJSON));
		
	} else {
		//Got empty response
		this.jobqueueList.clear();
		this.jobqueueList.push({"hostname": "N/A", "comment": "", "jobType": "N/A", "statusText": "No recent or queued jobs" });
		
	}
	
	this.controller.modelChanged(this.jobqueueListModel);
	
	this.getDetailsXML();

}

RecordedDetailsAssistant.prototype.mysqlRecordedJobqueueResponse = function(response) {

	//Mojo.Log.error("Got jobqueue plugin response: "+response);
	
	var jobqueueJson = JSON.parse(response);
	
	if(jobqueueJson.length>0) {
		//Got some recent jobqueues
		this.jobqueueList.clear();
		Object.extend(this.jobqueueList, cleanJobqueue(jobqueueJson));
		
	} else {
		//Got empty response
		this.jobqueueList.clear();
		this.jobqueueList.push({"hostname": "N/A", "comment": "", "jobType": "N/A", "statusText": "No recent or queued jobs" });
		
	}
	
	this.controller.modelChanged(this.jobqueueListModel);
	
	this.getDetailsXML();
	
}

RecordedDetailsAssistant.prototype.getDetailsXML = function() {

	//Update details from XML backend
	Mojo.Log.info('Starting details data gathering from XML backend');
	
		
	this.requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetProgramDetails?StartTime=";
	this.requestUrl += this.recordedObject.startTime.replace(" ","T");
	this.requestUrl += "&ChanId=";
	this.requestUrl += this.recordedObject.chanId;

	Mojo.Log.info("XML details URL is: "+this.requestUrl);
			
	try {
		var request = new Ajax.Request(this.requestUrl,{
			method: 'get',
			evalJSON: false,
			onSuccess: this.readDetailsXMLSuccess.bind(this),
			onFailure: this.readDetailsXMLFailure.bind(this)  
		});
	}
	catch(e) {
		Mojo.Log.error(e);
	}
 
};

RecordedDetailsAssistant.prototype.readDetailsXMLFailure = function(response) {
	
	//If program is too old and program guide is gone cannot get update data
	Mojo.Log.error('Failed to get Ajax response for program details because %j', response.responseText);
	
}

RecordedDetailsAssistant.prototype.readDetailsXMLSuccess = function(response) {

	//We really only need to get the recStatus here
	Mojo.Log.info("About to start parsing recorded from XML");
	
	var xmlstring = response.responseText.trim();
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	
	//Local variables
	var topNode, topNodesCount, topSingleNode;
	var programNode, programChildNode;
	
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetProgramDetailsResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		switch(topSingleNode.nodeName) {
			case 'ProtoVer':
				WebMyth.prefsCookieObject.protoVer = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'ProgramDetails':
				//Mojo.Log.info('Starting to parse ProgramDetails');
				programNode = topSingleNode.childNodes[0];
				
				for(var j = 0; j < programNode.childNodes.length; j++) {
				
					programChildNode = programNode.childNodes[j];
									
					if(programChildNode.nodeName == "Recording") {
						
						this.recordedObject.recStatus = programChildNode.getAttributeNode("recStatus").nodeValue;
						this.recordedObject.recStatusText = recStatusDecode(this.recordedObject.recStatus);
						
						this.recordedObject.recGroup = programChildNode.getAttributeNode("recGroup").nodeValue;
								
					}
						
				}
				
				Mojo.Log.info('Done parsing programDetails');
				
			break;
				
			default:
				//Mojo.Log.error("node name is "+topSingleNode.nodeName);
				break;
		}
	}
	
	
	if((this.recordedObject.recStatus == -2)) {
		$('currently-recording-title').innerText = $L("Currently Recording");
	} else {
		$('currently-recording-title').innerText = "";
	}
	
	$('recgroup-title').innerText = this.recordedObject.recGroup;

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
	query += '", flags = "0" ;';
		
	//Mojo.Log.error("query is "+query);
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlExecute(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlRecordedNewjobResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		//Mojo.Log.error("Recorded queue a newjob response "+response1);
		
	} else {
	
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
					
					//Update job queue list
					this.getJobqueue();
					
				}.bind(this),
				onFailure: function() {
					Mojo.Log.error("Error in queueing job");
					Mojo.Controller.getAppController().showBanner("Error queueing", {source: 'notification'});
				}  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
	
	}
	
};

RecordedDetailsAssistant.prototype.mysqlRecordedNewjobResponse = function(response) {

	//Mojo.Log.error("Got recorded new job plugin response: "+response);
	
	Mojo.Controller.getAppController().showBanner("Successfully queued", {source: 'notification'});
	
	
	
	//Update job queue list
	setTimeout(this.getJobqueue.bind(this), 50);
	
};

RecordedDetailsAssistant.prototype.goPeopleDetails = function(event) {

	Mojo.Log.info("Selected people details %j",event.item);
	
	Mojo.Controller.stageController.pushScene("searchPeople", event.item.person);

};
