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


function MusicDetailsAssistant(detailsObject) {

	   this.musicObject = detailsObject;

}

MusicDetailsAssistant.prototype.setup = function() {

	Mojo.Log.info("Starting music details scene '%j'", this.musicObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Music Menu'),
                            items: [{label: $L('Play'), submenu:'play-menu', width: 90},{},{label: $L('Web'), submenu:'web-menu', width: 90}]};
 
	this.playMenuModel = { label: $L('Play'), items: []};
	this.webMenuModel = { label: $L('WebMenu'), items: [
			{"label": $L('Wikipedia'), "command": "go-web--Wikipedia"},
			{"label": $L('Google'), "command": "go-web--Google"}
			]};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('play-menu', '', this.playMenuModel);
	this.controller.setupWidget('web-menu', '', this.webMenuModel);
	
	
	var albumArtUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetAlbumArt?Id=";
	albumArtUrl += this.musicObject.albumart_id;
	
	//Fill in data values
	$('albumart-image').src = albumArtUrl;
	
	$('scene-title').innerText = this.musicObject.name;
	
	$('artist-title').innerText = this.musicObject.artist_name;
	
	$('album-title').innerText = this.musicObject.album_name;
	$('track-title').innerText = this.musicObject.track;
	$('year-title').innerText = this.musicObject.year;
	
	
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
};

MusicDetailsAssistant.prototype.activate = function(event) {

	$('artist-group-title').innerText = $L('Artist');
	$('album-group-title').innerText = $L('Album Details');
	$('album-label').innerText = $L('Album');
	$('track-label').innerText = $L('Track')+' #';
	$('year-label').innerText = $L('Year');
	
	
	//Update list of current hosts
	var hostsList = [];
	var i, s;

	
		var downloadCmd = { "label": $L("Download to phone"), "command": "go-down-download" }
		var streamCmd = { "label": $L("Stream to phone"), "command": "go-down-stream" }
		
		hostsList.push(downloadCmd);
		hostsList.push(streamCmd);
		
	
	/*
	for (i = 0; i < WebMyth.hostsCookieObject.length; i++) {

		s = { 
			"label": $L(WebMyth.hostsCookieObject[i].hostname),
			"command": "go-play-"+WebMyth.hostsCookieObject[i].hostname,
			"hostname": WebMyth.hostsCookieObject[i].hostname,
			"port": WebMyth.hostsCookieObject[i].port 
		};
		hostsList.push(s);
		
	};
	*/	
	this.playMenuModel.items = hostsList;
	this.controller.modelChanged(this.playMenuModel);
	
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

MusicDetailsAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
};

MusicDetailsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

MusicDetailsAssistant.prototype.handleCommand = function(event) {

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

MusicDetailsAssistant.prototype.handleKey = function(event) {

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

}




MusicDetailsAssistant.prototype.openWeb = function(website) {

  //Mojo.Log.error('got to openWeb with : '+website);
  var url = "";
  
  switch(website) {
	case 'Wikipedia':
		url = "http://"+Mojo.Locale.getCurrentLocale().substring(0,2)+".m.wikipedia.org/wiki/Special:Search?search="+this.musicObject.artist_name;
	  break;
	case 'Google':
		url = "http://www.google.com/m/search?client=ms-palm-webOS&channel=iss&q="+this.musicObject.artist_name+"+"+this.musicObject.name;
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

MusicDetailsAssistant.prototype.handleDownload = function(downloadOrStream_in) {

	Mojo.Log.info("Asked to "+downloadOrStream_in+" music");
	this.downloadOrStream = downloadOrStream_in;
	
	
	var filenameRequestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetMusic?Id="
	filenameRequestUrl += this.musicObject.song_id;
	
	Mojo.Log.info("Download/stream URL is "+filenameRequestUrl);
	
	var myDirectory = "/media/internal/music/"+this.musicObject.artist_name+"/"+this.musicObject.album_name+"/";
	
	var myFilename = this.musicObject.filenameEnd;
	
	Mojo.Log.info("Filename is "+myDirectory+myFilename);
 
 
	if( this.downloadOrStream == 'download' ) {
		Mojo.Log.info("starting download");

		
		
		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
				target: filenameRequestUrl,		
				targetFilename: myFilename,
				subscribe: true,	
				targetDir: myDirectory
			},
			onSuccess: function(response) {
				if(response.completed) {
					this.controller.showBanner("Download finished! "+myFilename, "");
					
					this.controller.serviceRequest('palm://com.palm.applicationManager', {
						method:'launch',							
						parameters: {
							id:"com.palm.app.musicplayer"
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
				id: 'com.palm.app.streamingmusicplayer',
				params: {
					target: filenameRequestUrl	
				}
			}
		});	
	}
 
};

MusicDetailsAssistant.prototype.playOnHost = function(host) {

	//not yet implimented

/*
	//Attempting to play
	var thisHostname = host;
	WebMyth.prefsCookieObject.currentFrontend = host;
	
	//var clean_starttime = this.musicObject.starttime.replace(' ','T');
	var clean_starttime = this.musicObject.recStartTs;
	
	var cmd = "program "+this.musicObject.chanId+" "+clean_starttime+" resume";
	
	Mojo.Log.info("Command to send is " + cmd);

		
	WebMyth.sendPlay(cmd);
	
	
	if(WebMyth.prefsCookieObject.playJumpRemote)  Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
*/	
};