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


function GuideDetailsAssistant(detailsObject) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.guideObject = detailsObject;
	   
	   this.host = WebMyth.prefsCookieObject.currentFrontend;
}

GuideDetailsAssistant.prototype.setup = function() {
	Mojo.Log.info("Starting upcoming details scene '%j'", this.guideObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	

	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{ label: $L('Setup'), command: 'go-mythweb' },{},{label: $L('Web'), submenu:'web-menu', width: 90}]};
							
 
	this.hostsMenuModel = { label: $L('Hosts'), items: []};
 
	this.webMenuModel = { label: $L('WebMenu'), items: [
			{"label": $L('themoviedb'), "command": "go-web-----themoviedb"},
			{"label": $L('IMDB'), "command": "go-web-----IMDB"},
			{"label": $L('TheTVDB'), "command": "go-web-----TheTVDB"},
			{"label": $L('TV.com'), "command": "go-web-----TV.com"},
			{"label": $L('Google'), "command": "go-web-----Google"},
			]};

 
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('web-menu', '', this.webMenuModel);
	
	
	var channelIconUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetChannelIcon?ChanId=";
	channelIconUrl += this.guideObject.chanId;
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		$('guideDetails-channel-icon').innerHTML = '<img class="guideDetails-channel-img" src="'+channelIconUrl+'" />';
	}
	
	//Fill in data values
	$('scene-title').innerText = this.guideObject.title;
	$('subtitle-title').innerText = this.guideObject.subTitle;
	$('description-title').innerText = this.guideObject.description;
	
	//$('hostname-title').innerText = this.guideObject.hostname;
	//$('recgroup-title').innerText = this.guideObject.recgroup;
	$('starttime-title').innerText = this.guideObject.startTimeSpace;
	$('endtime-title').innerText = this.guideObject.endTimeSpace;
	$('recstatustext-title').innerText = this.guideObject.recStatusText;
	//$('airdate-title').innerText = this.guideObject.airdate;
	//$('storagegroup-title').innerText = this.guideObject.storagegroup;
	//$('playgroup-title').innerText = this.guideObject.playgroup;
	//$('programflags-title').innerText = this.guideObject.programflags;
	$('programid-title').innerText = this.guideObject.programId;
	//$('seriesid-title').innerText = this.guideObject.seriesId;
	$('channame-title').innerText = this.guideObject.channelName;
	$('channum-title').innerText = this.guideObject.chanNum;
	//$('recstartts-title').innerText = this.guideObject.recStartTs;
	

};

GuideDetailsAssistant.prototype.activate = function(event) {
	
	var nowDate = new Date();
	
	if(((this.guideObject.startTime) <  dateJSToISO(nowDate)) && ((this.guideObject.endTime) >  dateJSToISO(nowDate))) {
		
		//Update list of current hosts
		var hostsList = [];
		var i, s;
		
		for (i = 0; i < WebMyth.hostsCookieObject.length; i++) {

			s = { 
				"label": $L(WebMyth.hostsCookieObject[i].hostname),
				"command": "go-play----"+WebMyth.hostsCookieObject[i].hostname,
				"hostname": WebMyth.hostsCookieObject[i].hostname,
				"port": WebMyth.hostsCookieObject[i].port 
			};
			hostsList.push(s);
			
		};
			
		this.hostsMenuModel.items = hostsList;
		this.controller.modelChanged(this.hostsMenuModel);
		
		this.cmdMenuModel.items[0].label = $L('Play');
		this.cmdMenuModel.items[0].submenu = 'hosts-menu';
		this.cmdMenuModel.items[0].width =  90;
		
		this.cmdMenuModel.items[1].label = $L('Setup');
		this.cmdMenuModel.items[1].command = 'go-mythweb';
		
				
		this.controller.setupWidget('hosts-menu', '', this.hostsMenuModel);
		this.controller.modelChanged(this.cmdMenuModel);
			
	}
	
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

GuideDetailsAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
};

GuideDetailsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};


GuideDetailsAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.command) {
  	myCommand = event.command.substring(0,10);
	mySelection = event.command.substring(11);
	Mojo.Log.info("command: "+myCommand+" host: "+mySelection);

    switch(myCommand) {
      case 'go-mythweb':
		this.openMythweb();
       break;
      case 'go-play---':
		this.checkLocation(mySelection);
       break;
      case 'go-web----':
		this.openWeb(mySelection);
       break;
    }
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};


GuideDetailsAssistant.prototype.handleKey = function(event) {

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


GuideDetailsAssistant.prototype.openMythweb = function() {

	Mojo.Log.error("opening in mythweb");
			
	var dateJS = new Date(isoToJS(this.guideObject.startTime));
	var dateUTC = dateJS.getTime()/1000;				//don't need 59 second offset?
			
	Mojo.Log.info("Selected time is: '%j'", dateUTC);
			
	//var mythwebUrl = "http://";
	//mythwebUrl += WebMyth.prefsCookieObject.webserverName;
	var mythwebUrl = "/mythweb/tv/detail/";
	mythwebUrl += this.guideObject.chanId + "/";
	mythwebUrl += dateUTC;
	//mythwebUrl += "?RESET_TMPL=true";
			
	Mojo.Log.info("mythweb url is "+mythwebUrl);
			
	Mojo.Controller.stageController.pushScene("webview", mythwebUrl, "Setup Recording");
			
	/*
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters:  {
			id: 'com.palm.app.browser',
			params: {
				target: mythwebUrl
			}
		}
	}); 
	*/
	
};


GuideDetailsAssistant.prototype.openWeb = function(website) {

  //Mojo.Log.error('got to openWeb with : '+website);
  var url = "";
  
  switch(website) {
	case 'themoviedb':
		url = "http://www.themoviedb.org/search/movies?search[text]="+this.guideObject.title;
	  break;
	case 'IMDB':
		url = "http://m.imdb.com/find?s=all&q="+this.guideObject.title;
	  break;
	case 'TheTVDB':
		url = "http://www.thetvdb.com/?string="+this.guideObject.title+"&searchseriesid=&tab=listseries&function=Search";
	  break;
	case 'TV.com':
		url = "http://www.tv.com/search.php?type=11&stype=all&qs="+this.guideObject.title;
	  break;
	case 'Google':
		url = "http://www.google.com/m/search?client=ms-palm-webOS&channel=iss&q="+this.guideObject.title;
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



GuideDetailsAssistant.prototype.checkLocation = function(host) {
	//Attempting to play livetv - have to start livetv then change channel
	this.host = host;
	Mojo.Log.info("Checking current location as prep for "+this.guideObject.chanId+" on "+this.host);
	
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=query";
		requestUrl += "&host="+this.host+"&cmd=location";
		
		Mojo.Log.error("requesting check URL: "+requestUrl);
	
		var request1 = new Ajax.Request(requestUrl, {
			method: 'get',
			onSuccess: function(response){
				Mojo.Log.info("got query response: %s, %s",response.responseText,response.responseText.search("LiveTV"));
				
				if(response.responseText.search("LiveTV") == -1) {
					//Is not on LiveTV
					this.jumpLive();
				} else {
					//Is already on LiveTV
					this.startChannelPlay();
				}
			}.bind(this),
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		}
		);
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
	
	
};



GuideDetailsAssistant.prototype.jumpLive = function() {
	//Attempting to play livetv - have to start livetv then change channel
	Mojo.Log.info("jumping to live tv");
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=jump";
		requestUrl += "&host="+this.host+"&cmd=livetv";
		
		Mojo.Log.error("requesting jump live : "+requestUrl);
	
		var request1 = new Ajax.Request(requestUrl, {
			method: 'get',
			onSuccess: this.startChannelPlay.bind(this),
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		}
		);
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
	
	
};



GuideDetailsAssistant.prototype.startChannelPlay = function(host) {
	//Attempting to play livetv - have to start livetv then change channel
	Mojo.Log.info("Playing channel "+this.guideObject.chanId);
	
	var cmd = "chanid+"+this.guideObject.chanId;
	WebMyth.sendPlay(cmd);
	
	
	if(WebMyth.prefsCookieObject.guideJumpRemote)  {
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	}
	
};

