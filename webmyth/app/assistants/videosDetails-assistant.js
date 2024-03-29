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
 
 
function VideosDetailsAssistant(detailsObject, videoBase) {

	this.videosObject = detailsObject;
	this.videoBase = videoBase;
	   
	this.standardFilename = '';
	this.downloadOrStream = '';
	   
	this.timeOffsetSeconds = 0;
	
	this.peopleList = [];
}

VideosDetailsAssistant.prototype.setup = function() {

	Mojo.Log.info("Starting videos details scene '%j'", this.videosObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{label: $L('Play'), submenu:'hosts-menu', width: 90},{},{label: $L('Web'), submenu:'web-menu', width: 90}]};
 
	this.hostsMenuModel = { label: $L('Hosts'), items: []};
	this.webMenuModel = { label: $L('WebMenu'), items: []};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('hosts-menu', '', this.hostsMenuModel);
	this.controller.setupWidget('web-menu', '', this.webMenuModel);

	//List of people
	this.peopleListAttribs = {
		itemTemplate: "videosDetails/peopleListItem",
		swipeToDelete: false
	};
	
    this.peopleListModel = {            
        items: this.peopleList
    };
	this.controller.setupWidget( "peopleList" , this.peopleListAttribs, this.peopleListModel);
	
	Mojo.Event.listen(this.controller.get( "peopleList" ), Mojo.Event.listTap, this.goPeopleDetails.bind(this));
	
	
	if(WebMyth.usePlugin){
		$('webmyth_service_id').mysqlVideosDetailsPeopleResponse = this.mysqlVideosDetailsPeopleResponse.bind(this);
		$('webmyth_service_id').mysqlVideosDetailsResponse = this.mysqlVideosDetailsResponse.bind(this);
	}

	
	//Fill in data values
	
	
	$('scene-title').innerText = this.videosObject.title;
	$('subtitle-title').innerText = this.videosObject.subtitle;
	$('fullEpisode-title').innerText = this.videosObject.fullEpisode;
	$('plot-title').innerText = this.videosObject.plot;
	$('category-title').innerText = this.videosObject.category;
	
	$('director-title').innerText = this.videosObject.director;
	$('rating-title').innerText = this.videosObject.rating;
	$('year-title').innerText = this.videosObject.year;
	$('releasedate-title').innerText = this.videosObject.releasedate;
	$('length-title').innerText = this.videosObject.length;
	
	$('insertdate-title').innerText = this.videosObject.insertdate.substring(0,10);
	$('host-title').innerText = this.videosObject.host;
	$('filename-title').innerText = this.videosObject.filename;
	//$('onlyFilename-title').innerText = this.videosObject.onlyFilename;
	$('coverfile-title').innerText = this.videosObject.coverfile;
	//$('screenshot-title').innerText = this.videosObject.screenshot;
	//$('banner-title').innerText = this.videosObject.banner;
	//$('fanart-title').innerText = this.videosObject.fanart;
	
	

	
	if(WebMyth.prefsCookieObject.showVideoDetailsImage) {
	
		this.imageUrl = "http://"+WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword+"@";
		this.imageUrl += WebMyth.prefsCookieObject.webserverName+"/mythweb/pl/";
		this.imageUrl += "/coverart/"+this.videosObject.coverfile;
	
		$('videos-coverfile').innerHTML = '<img id="coverfile-img" class="videos-coverfile" src="'+this.imageUrl+'" />';
	
	}
	
	
	this.controller.listen(this.controller.get( "videos-coverfile" ), Mojo.Event.tap, function(){
		Mojo.Controller.stageController.pushScene("imageview", this.imageUrl) ;
	}.bind(this));
	
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	
	//Update play list for hosts (check for download/stream later and update as needed)
	this.updateHostsList();
	
	//Look for video in upnp table on backend
	this.getUpnpmedia();
		
};

VideosDetailsAssistant.prototype.activate = function(event) {

	$('generalDetails-group-title').innerText = $L('General Details');
		$('subtitle-label').innerText = $L('Subtitle');
		$('fullEpisode-label').innerText = $L('Episode');
		$('category-label').innerText = $L('Category');
	$('programDetails-group-title').innerText = $L('Program Details');
		$('director-label').innerText = $L('Director');
		$('rating-label').innerText = $L('Rating');
		$('year-label').innerText = $L('Year');
		$('releasedate-label').innerText = $L('Release Date');
		$('length-label').innerText = $L('Length');
	$('files-group-title').innerText = $L('Files');
		$('insertdate-label').innerText = $L('Inserted');
		$('host-label').innerText = $L('Host');
		$('filename-label').innerText = $L('Filename');
		$('coverfile-label').innerText = $L('Coverart');

	//Update web list if we have homepage value
	
	var webList = [];
	
	if((this.videosObject.homepage != "None")&&(this.videosObject.homepage != "")) {
		webList.push({"label": $L("Homepage"), "command": "go-web--Homepage"});
	}
	
	webList.push({"label": $L('Wikipedia'), "command": "go-web--Wikipedia"});
	webList.push({"label": $L('themoviedb'), "command": "go-web--themoviedb"});
	webList.push({"label": $L('IMDB'), "command": "go-web--IMDB"});
	webList.push({"label": $L('TheTVDB'), "command": "go-web--TheTVDB"});
	webList.push({"label": $L('TV.com'), "command": "go-web--TV.com"});
	webList.push({"label": $L('Google'), "command": "go-web--Google"});
			
	this.webMenuModel.items = webList;
	this.controller.modelChanged(this.webMenuModel);
	
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

VideosDetailsAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

VideosDetailsAssistant.prototype.cleanup = function(event) {

};

VideosDetailsAssistant.prototype.handleCommand = function(event) {

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
    }
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};

VideosDetailsAssistant.prototype.handleKey = function(event) {

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





VideosDetailsAssistant.prototype.openWeb = function(website) {

	  //Mojo.Log.error('got to openWeb with : '+website);
	  var url = "";
	  
	  switch(website) {
		case 'Homepage':
			url = this.videosObject.homepage;
		  break;
		case 'Wikipedia':
			url = "http://"+Mojo.Locale.getCurrentLocale().substring(0,2)+".m.wikipedia.org/wiki/Special:Search?search="+this.videosObject.title;
		  break;
		case 'themoviedb':
			url = "http://www.themoviedb.org/search/movies?search[text]="+this.videosObject.title;
		  break;
		case 'IMDB':
			url = "http://m.imdb.com/find?s=all&q="+this.videosObject.title;
		  break;
		case 'TheTVDB':
			url = "http://www.thetvdb.com/?string="+this.videosObject.title+"&searchseriesid=&tab=listseries&function=Search";
		  break;
		case 'TV.com':
			url = "http://www.tv.com/search.php?type=11&stype=all&qs="+this.videosObject.title;
		  break;
		case 'Google':
			url = "http://www.google.com/m/search?client=ms-palm-webOS&channel=iss&q="+this.videosObject.title;
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

VideosDetailsAssistant.prototype.handleDownload = function(downloadOrStream_in) {

	Mojo.Log.info("Asked to "+downloadOrStream_in+" video");
	
	
	this.downloadOrStream = downloadOrStream_in;
	
	
	var filenameRequestUrl = "";
		
	if(WebMyth.prefsCookieObject.mythwebXml) {
	
		//videos are not supported by mythweb XMl module
		//filenameRequestUrl += "http://"+WebMyth.prefsCookieObject.webserverName+"/mythweb/mythxml/GetVideo/Id";
		//filenameRequestUrl += this.upnpId;
		//filenameRequestUrl += "&MythXMLKey=";
		//filenameRequestUrl += WebMyth.prefsCookieObject.MythXML_key;
		
		filenameRequestUrl += "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetVideo/Id";
		filenameRequestUrl += this.upnpId;
			
	} else {
		
		filenameRequestUrl += "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetVideo/Id";
		filenameRequestUrl += this.upnpId;
		
	}
	
	
	Mojo.Log.info("Download/stream URL is "+filenameRequestUrl);
	
	var myFilename = this.videosObject.title.replace(":","-") + "-" + this.videosObject.subtitle.replace(":","-") + ".mp4";
	myFilename.replace(":","-");
	
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

VideosDetailsAssistant.prototype.playOnHost = function(frontend) {

	var frontendDecoder = frontend.split("[]:[]");

	var cmd = "file '";
	
	if(WebMyth.prefsCookieObject.protoVer >= 64) {
		//Fixed this playback at https://github.com/MythTV/mythtv/blob/7422f241a9c62216da5a3cfc698c3f22431cd084/mythtv/programs/mythfrontend/networkcontrol.cpp
		cmd += "myth://Videos@"+this.videosObject.host+"/"+this.videoBase+"/"+this.videosObject.filename+"'";
	} else if((this.videosObject.filename == this.videosObject.level1) && (true)) {
		//Try using a myth:// URL when not using subdirectories - FAILING IN 0.24 - using full filename for all
		cmd += "myth://"+this.videosObject.host+"/"+this.videosObject.filename+"'";
	} else {
		//Use a direct file reference as a backup
		cmd += this.videoBase+"/"+this.videosObject.filename+"'";
	}
	
	
	
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
	
	
	if(WebMyth.prefsCookieObject.playJumpRemote)  Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
};

VideosDetailsAssistant.prototype.updateHostsList = function() {
	
	var i, s;
	
	
	for (i = 0; i < WebMyth.hostsCookieObject.length; i++) {

		s = { 
			"label": $L(WebMyth.hostsCookieObject[i].hostname),
			"command": "go-play-"+WebMyth.hostsCookieObject[i].hostname+"[]:[]"+WebMyth.hostsCookieObject[i].address+"[]:[]"+WebMyth.hostsCookieObject[i].port,
			"hostname": WebMyth.hostsCookieObject[i].hostname,
			"port": WebMyth.hostsCookieObject[i].port 
		};
		this.hostsMenuModel.items.push(s);
		
	};
		
	this.controller.modelChanged(this.hostsMenuModel);

}

VideosDetailsAssistant.prototype.getUpnpmedia = function() {

	var query = 'SELECT * FROM `upnpmedia` WHERE `filename` = "'+this.videosObject.onlyFilename+'" LIMIT 1;' ;
	
	//Mojo.Log.error("UPNP query is "+query);
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlVideosDetailsResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		Mojo.Log.error("VideosDetails UPNP plugin response "+response1);
		
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
				onSuccess: this.getUpnpSuccess.bind(this),
				onFailure: this.getUpnpFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}

}

VideosDetailsAssistant.prototype.getUpnpFail = function() {

	Mojo.Log.error("Failed to get UPNP value from SQL");
	
	this.getPeople();
	
}

VideosDetailsAssistant.prototype.getUpnpSuccess = function(response) {

	//Mojo.Log.info('Got UPNP response: %j', response.responseJSON);
	
	var myResponse = response.responseJSON[0];
	
	
	//If nothing is returned this will crash, leaving default hosts for playback.
	this.upnpId = myResponse.intid;
	
	
	//Reset play menu so we can add download/stream
	this.hostsMenuModel.items = [];
	
	if(WebMyth.prefsCookieObject.allowRecordedDownloads) {
		var downloadCmd = { "label": $L("Download to Phone"), "command": "go-down-download" }
		var streamCmd = { "label": $L("Stream to Phone"), "command": "go-down-stream" }
		
		this.hostsMenuModel.items.push(downloadCmd);
		this.hostsMenuModel.items.push(streamCmd);
	}	
	
	
	this.updateHostsList();
	
	this.getPeople()
	
}

VideosDetailsAssistant.prototype.mysqlVideosDetailsResponse = function(response) {

	Mojo.Log.error("Got storagegroup plugin response: "+response);
	
	var upnpJson = JSON.parse(response);
	
	var myResponse = upnpJson[0];
	
	
	//If nothing is returned this will crash, leaving default hosts for playback.
	this.upnpId = myResponse.intid;
	
	
	//Reset play menu so we can add download/stream
	this.hostsMenuModel.items = [];
	
	if(WebMyth.prefsCookieObject.allowRecordedDownloads) {
		var downloadCmd = { "label": $L("Download to Phone"), "command": "go-down-download" }
		var streamCmd = { "label": $L("Stream to Phone"), "command": "go-down-stream" }
		
		this.hostsMenuModel.items.push(downloadCmd);
		this.hostsMenuModel.items.push(streamCmd);
	}	
	
	
	this.updateHostsList();
	
	this.controller.window.setTimeout(this.getPeople.bind(this), 50);

}	




VideosDetailsAssistant.prototype.getPeople = function(event) {

	//Mojo.Log.error("Searching for people for video");
	
	
	var query = 'SELECT `videometadatacast`.`idcast`, `videometadatacast`.`idvideo`, ';
	query += ' `videocast`.`intid` AS videoPersonId, `videocast`.`cast` AS name, ';
	query += ' `people`.`person` ';
	query += ' FROM `videometadatacast` ';
	query += ' LEFT OUTER JOIN `videocast` ON `videometadatacast`.`idcast` = `videocast`.`intid` ';
	query += ' LEFT OUTER JOIN `people` ON `videocast`.`cast` = `people`.`name` ';
	query += ' WHERE `videometadatacast`.`idvideo` = '+this.videosObject.intid+' ';
	query += ' ORDER BY `name` ';
	
	Mojo.Log.error("Query is "+query);
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlVideosDetailsPeopleResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
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

VideosDetailsAssistant.prototype.peopleSearchFail = function(event) {

	Mojo.Log.error('Failed to get video details people response');	
	
};

VideosDetailsAssistant.prototype.peopleSearchSuccess = function(response) {
    
	Mojo.Log.error('Got AJAX videos people response: %s,%j',response.responseJSON.length, response.responseJSON);
		
	//Update the list widget
	this.peopleList.clear();
	Object.extend(this.peopleList,response.responseJSON);
	
	this.controller.modelChanged(this.peopleListModel);

};

VideosDetailsAssistant.prototype.mysqlVideosDetailsPeopleResponse = function(response) {

	//Mojo.Log.error("Got guide details people plugin response: "+response);
	
	var videosDetailsPeopleJson = JSON.parse(response);
	
	//Update the list widget
	this.peopleList.clear();
	Object.extend(this.peopleList,videosDetailsPeopleJson);
	
	this.controller.modelChanged(this.peopleListModel);

}

VideosDetailsAssistant.prototype.goPeopleDetails = function(event) {

	Mojo.Log.info("Selected people details %j",event.item);
	
	Mojo.Controller.stageController.pushScene("searchPeople", event.item);

};