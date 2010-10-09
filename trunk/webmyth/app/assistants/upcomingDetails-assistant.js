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


function UpcomingDetailsAssistant(detailsObject) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   
	   this.upcomingObject = detailsObject;
}

UpcomingDetailsAssistant.prototype.setup = function() {
	
	//Mojo.Log.info("Starting upcoming details scene '%j'", this.upcomingObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	

	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{ label: 'Setup', command: 'go-setup', width: 90 },{},{label: $L('Web'), submenu:'web-menu', width: 90}]};
 
	this.webMenuModel = { label: $L('WebMenu'), items: [
			{"label": $L('themoviedb'), "command": "go-web--themoviedb"},
			{"label": $L('IMDB'), "command": "go-web--IMDB"},
			{"label": $L('TheTVDB'), "command": "go-web--TheTVDB"},
			{"label": $L('TV.com'), "command": "go-web--TV.com"},
			{"label": $L('Google'), "command": "go-web--Google"},
			]};

 
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('web-menu', '', this.webMenuModel);
	
	
	var channelIconUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetChannelIcon?ChanId=";
	channelIconUrl += this.upcomingObject.chanid;
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		$('upcomingDetails-channel-icon').innerHTML = '<img class="upcomingDetails-channel-img" src="'+channelIconUrl+'" />';
	}
	
	//Fill in data values
	$('scene-title').innerText = this.upcomingObject.title;
	$('subtitle-title').innerText = this.upcomingObject.subtitle;
	$('description-title').innerText = this.upcomingObject.description;
	
	$('hostname-title').innerText = this.upcomingObject.hostname;
	//$('recgroup-title').innerText = this.upcomingObject.recgroup;
	$('starttime-title').innerText = this.upcomingObject.starttime;
	$('endtime-title').innerText = this.upcomingObject.endtime;
	$('airdate-title').innerText = this.upcomingObject.airdate;
	//$('storagegroup-title').innerText = this.upcomingObject.storagegroup;
	//$('playgroup-title').innerText = this.upcomingObject.playgroup;
	//$('programflags-title').innerText = this.upcomingObject.programflags;
	$('programid-title').innerText = this.upcomingObject.programid;
	$('seriesid-title').innerText = this.upcomingObject.seriesid;
	$('channame-title').innerText = this.upcomingObject.channame;
	$('channum-title').innerText = this.upcomingObject.channum;
	$('recstartts-title').innerText = this.upcomingObject.recstartts;
	
};

UpcomingDetailsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

UpcomingDetailsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

UpcomingDetailsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};


UpcomingDetailsAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.command) {
  	myCommand = event.command.substring(0,7);
	mySelection = event.command.substring(8);
	//Mojo.Log.error("command: "+myCommand+" host: "+mySelection);

    switch(myCommand) {
      case 'go-web-':
		this.openWeb(mySelection);
       break;
      case 'go-setu':
		this.openMythweb();
       break;
    }
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};


UpcomingDetailsAssistant.prototype.openMythweb = function() {

	Mojo.Log.error("opening in mythweb");
			
	var dateJS = new Date(isoSpaceToJS(this.upcomingObject.starttime));
	var dateUTC = dateJS.getTime()/1000;				//don't need 59 second offset?
			
	Mojo.Log.info("Selected time is: '%j'", dateUTC);
			
	var mythwebUrl = "http://";
	mythwebUrl += WebMyth.prefsCookieObject.webserverName+"/mythweb/tv/detail/"
	mythwebUrl += this.upcomingObject.chanid + "/";
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


UpcomingDetailsAssistant.prototype.openWeb = function(website) {

  //Mojo.Log.error('got to openWeb with : '+website);
  var url = "";
  
  switch(website) {
	case 'themoviedb':
		url = "http://www.themoviedb.org/search/movies?search[text]="+this.upcomingObject.title;
	  break;
	case 'IMDB':
		url = "http://m.imdb.com/find?s=all&q="+this.upcomingObject.title;
	  break;
	case 'TheTVDB':
		url = "http://www.thetvdb.com/?string="+this.upcomingObject.title+"&searchseriesid=&tab=listseries&function=Search";
	  break;
	case 'TV.com':
		url = "http://www.tv.com/search.php?type=11&stype=all&qs="+this.upcomingObject.title;
	  break;
	case 'Google':
		url = "http://www.google.com/m/search?client=ms-palm-webOS&channel=iss&q="+this.upcomingObject.title;
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