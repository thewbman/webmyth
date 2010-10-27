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
}

VideosDetailsAssistant.prototype.setup = function() {

	//Mojo.Log.info("Starting videos details scene '%j'", this.videosObject);
	
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
	$('coverfile-title').innerText = this.videosObject.coverfile;
	$('screenshot-title').innerText = this.videosObject.screenshot;
	$('banner-title').innerText = this.videosObject.banner;
	$('fanart-title').innerText = this.videosObject.fanart;
	
	//$('channum-title').innerText = this.videosObject.chanNum;
	//$('recstartts-title').innerText = this.videosObject.recStartTs.replace("T"," ");
	//$('filesize-title').innerText = Mojo.Format.formatNumber(parseInt(this.videosObject.fileSize.substring(0,this.videosObject.fileSize.length - 6)))+" MB";
	
	
	
};

VideosDetailsAssistant.prototype.activate = function(event) {

	
	//Update list of current hosts
	var hostsList = [];
	var i, s;

	/*
	if(WebMyth.prefsCookieObject.allowRecordedDownloads) {
		var downloadCmd = { "label": "Download to Phone", "command": "go-down-download" }
		var streamCmd = { "label": "Stream to Phone", "command": "go-down-stream" }
		
		hostsList.push(downloadCmd);
		hostsList.push(streamCmd);
	}	
	*/
	
	
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
	
	
	
	var webList = [];
	
	if(this.videosObject.homepage != "None") {
		webList.push({"label": "Homepage", "command": "go-web--Homepage"});
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
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
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





VideosDetailsAssistant.prototype.openWeb = function(website) {

	  //Mojo.Log.error('got to openWeb with : '+website);
	  var url = "";
	  
	  switch(website) {
		case 'Homepage':
			url = this.videosObject.homepage;
		  break;
		case 'Wikipedia':
			url = "http://en.m.wikipedia.org/wiki/Special:Search?search="+this.videosObject.title;
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

	Mojo.Log.info("Asked to "+downloadOrStream_in+" recorded program");
	/*
	
	this.downloadOrStream = downloadOrStream_in;
	
	var dateJS = new Date(isoToJS(this.videosObject.recStartTs));
	
	Mojo.Log.info("Rec date JS is %j, %s", dateJS, this.videosObject.recStartTs);
	
	//requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
	
	var filenameRequestUrl = "http://"+WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword+"@";
	filenameRequestUrl += WebMyth.prefsCookieObject.webserverName+"/mythweb/pl/stream/";
	filenameRequestUrl += this.videosObject.chanId+"/";
	filenameRequestUrl += ((dateJS.getTime()/1000));
	filenameRequestUrl += ".mp4";
	
	Mojo.Log.info("Download/stream URL is "+filenameRequestUrl);
	
	var myFilename = this.videosObject.title + "-" + this.videosObject.subTitle + ".mp4";
	
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
	*/
 
};

VideosDetailsAssistant.prototype.playOnHost = function(host) {

	//Attempting to play
	var thisHostname = host;
	WebMyth.prefsCookieObject.currentFrontend = host;
	
	//var clean_starttime = this.videosObject.starttime.replace(' ','T');
	var clean_starttime = this.videosObject.recStartTs;
	
	var cmd = "file "+this.videoBase+"/"+this.videosObject.filename+"'";
	
	Mojo.Log.info("Command to send is " + cmd);
	
	
		
	WebMyth.sendPlay(cmd);
	
	
	if(WebMyth.prefsCookieObject.playJumpRemote)  Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
};