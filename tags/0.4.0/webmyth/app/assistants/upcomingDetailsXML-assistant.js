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


function UpcomingDetailsXMLAssistant(upcoming_chanid, upcoming_starttime) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.chanid = upcoming_chanid;
	   this.starttime = upcoming_starttime;
	   
	   this.upcomingObject = {};
	   
}

UpcomingDetailsXMLAssistant.prototype.setup = function() {

	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	$('spinner-text').innerHTML = "Loading...";
	

	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	

	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{ label: 'Setup', command: 'go-setup', width: 90 },{ icon: 'refresh', command: 'go-refresh' },{label: $L('More'), submenu:'web-menu', width: 90}]};
 
	this.webMenuModel = { label: $L('WebMenu'), items: [
			{"label": $L('Guide'), "command": "go-guide"},
			{"label": $L('Web: Wikipedia'), "command": "go-web--Wikipedia"},
			{"label": $L('Web: themoviedb'), "command": "go-web--themoviedb"},
			{"label": $L('Web: IMDB'), "command": "go-web--IMDB"},
			{"label": $L('Web: TheTVDB'), "command": "go-web--TheTVDB"},
			{"label": $L('Web: TV.com'), "command": "go-web--TV.com"},
			{"label": $L('Web: Google'), "command": "go-web--Google"},
			]};

 
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('web-menu', '', this.webMenuModel);
	
	
	
	this.getDetailsXML();
	
	
};

UpcomingDetailsXMLAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
	
};

UpcomingDetailsXMLAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

UpcomingDetailsXMLAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

UpcomingDetailsXMLAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.command) {
  	myCommand = event.command.substring(0,7);
	mySelection = event.command.substring(8);
	//Mojo.Log.error("command: "+myCommand+" host: "+mySelection);

    switch(myCommand) {
      case 'go-guid':
		this.openGuide();
       break;
      case 'go-web-':
		this.openWeb(mySelection);
       break;
      case 'go-setu':
		this.openMythweb();
       break;
      case 'go-refr':
	  
		//Restart spinner and show
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').show();
	  
		this.controller.sceneScroller.mojo.revealTop();
		
		this.getDetailsXML();
		
       break;
    }
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};



UpcomingDetailsXMLAssistant.prototype.openGuide = function() {

	//Mojo.Log.error("Opening in guide "+this.starttime.replace(" ","T"));
	
	Mojo.Controller.stageController.pushScene("guide", this.starttime.replace(" ","T").substring(0,18)+01);
 
};

UpcomingDetailsXMLAssistant.prototype.openMythweb = function() {

	Mojo.Log.error("opening in mythweb");
			
	var dateJS = new Date(isoSpaceToJS(this.starttime));
	var dateUTC = dateJS.getTime()/1000;				//don't need 59 second offset?
			
	Mojo.Log.info("Selected time is: '%j'", dateUTC);
			
	
	var mythwebUrl = "http://";
	mythwebUrl += WebMyth.prefsCookieObject.webserverName;
	mythwebUrl += "/mythweb/tv/detail/";
	mythwebUrl += this.chanid + "/";
	mythwebUrl += dateUTC;
	//mythwebUrl += "?RESET_TMPL=true";
			
	Mojo.Log.info("mythweb url is "+mythwebUrl);
	
	//Mojo.Controller.stageController.pushScene("webview", mythwebUrl, "Edit Upcoming Recording");
	
	
			
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

UpcomingDetailsXMLAssistant.prototype.openWeb = function(website) {

  //Mojo.Log.error('got to openWeb with : '+website);
  var url = "";
  
  switch(website) {
	case 'Wikipedia':
		url = "http://en.m.wikipedia.org/wiki/Special:Search?search="+this.upcomingObject.title;
	  break;
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

UpcomingDetailsXMLAssistant.prototype.getDetailsXML = function() {

	//Update details from XML backend
	Mojo.Log.info('Starting details data gathering from XML backend');
		
	this.requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetProgramDetails?StartTime=";
	this.requestUrl += this.starttime.replace(" ","T");
	this.requestUrl += "&ChanId=";
	this.requestUrl += this.chanid;

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

UpcomingDetailsXMLAssistant.prototype.readDetailsXMLFailure = function(response) {

	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()
	
	Mojo.Controller.getAppController().showBanner("Failed to get program information", {source: 'notification'});
	Mojo.Log.error('Failed to get Ajax response for program details because %j', response.responseText);
	
}

UpcomingDetailsXMLAssistant.prototype.readDetailsXMLSuccess = function(response) {

	
	Mojo.Log.info("About to start parsing recorded from XML");
	
	var xmlstring = response.responseText.trim();
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, programDetailsNode;
	var programNode, programChildNode;
	
	var StartTime, ChanId, Count, AsOf, Version, ProtoVer;
	
	
	var s = {};
	
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetProgramDetailsResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		switch(topSingleNode.nodeName) {
			case 'StartTime':
				StartTime = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'ChanId':
				ChanId = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'Count':
				Count = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'AsOf':
				AsOf = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'Version':
				Version = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'ProtoVer':
				ProtoVer = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'ProgramDetails':
				//Mojo.Log.info('Starting to parse ProgramDetails');
				programNode = topSingleNode.childNodes[0];
				
				this.upcomingObject = {
					"title": programNode.getAttributeNode("title").nodeValue, 
					"subTitle": programNode.getAttributeNode("subTitle").nodeValue, 
					"programFlags": programNode.getAttributeNode("programFlags").nodeValue, 
					"category": programNode.getAttributeNode("category").nodeValue, 
					"fileSize": programNode.getAttributeNode("fileSize").nodeValue, 
					"seriesId": programNode.getAttributeNode("seriesId").nodeValue, 
					"hostname": programNode.getAttributeNode("hostname").nodeValue, 
					"catType": programNode.getAttributeNode("catType").nodeValue, 
					"programId": programNode.getAttributeNode("programId").nodeValue, 
					"repeat": programNode.getAttributeNode("repeat").nodeValue, 
				//	"stars": programNode.getAttributeNode("stars").nodeValue, 
					"endTime": programNode.getAttributeNode("endTime").nodeValue, 
				//	"airdate": programNode.getAttributeNode("airdate").nodeValue, 
					"startTime": programNode.getAttributeNode("startTime").nodeValue,
					"lastModified": programNode.getAttributeNode("lastModified").nodeValue
				};
				
				try {
					this.upcomingObject.stars = programNode.getAttributeNode("stars").nodeValue;
					this.upcomingObject.airdate = programNode.getAttributeNode("airdate").nodeValue;
				} catch(e) {
					Mojo.Log.info("Error with getting airdate and stars");
					this.upcomingObject.stars = "";
					this.upcomingObject.airdate = "";
				}
				
				for(var j = 0; j < programNode.childNodes.length; j++) {
					programChildNode = programNode.childNodes[j];
					//Mojo.Log.info("Node name is "+programChildNode.nodeName);
					
					if(j == 0) this.upcomingObject.description =programChildNode.nodeValue;
									
					if(programChildNode.nodeName == 'Channel') {
						//Mojo.Log.info('Inside channel if');

						this.upcomingObject.inputId = programChildNode.getAttributeNode("inputId").nodeValue;
						this.upcomingObject.chanFilters = programChildNode.getAttributeNode("chanFilters").nodeValue;
						this.upcomingObject.commFree = programChildNode.getAttributeNode("commFree").nodeValue;
						this.upcomingObject.channelName = programChildNode.getAttributeNode("channelName").nodeValue;
						this.upcomingObject.sourceId = programChildNode.getAttributeNode("sourceId").nodeValue;
						this.upcomingObject.chanId = programChildNode.getAttributeNode("chanId").nodeValue;
						this.upcomingObject.chanNum = programChildNode.getAttributeNode("chanNum").nodeValue;
						this.upcomingObject.callSign = programChildNode.getAttributeNode("callSign").nodeValue;
					}
					
									
					if(programChildNode.nodeName == "Recording") {
						//Mojo.Log.info('Inside recording if');
						
						this.upcomingObject.recPriority = programChildNode.getAttributeNode("recPriority").nodeValue;
						this.upcomingObject.playGroup = programChildNode.getAttributeNode("playGroup").nodeValue;
						this.upcomingObject.recStatus = programChildNode.getAttributeNode("recStatus").nodeValue;
						this.upcomingObject.recStartTs = programChildNode.getAttributeNode("recStartTs").nodeValue;
						this.upcomingObject.recGroup = programChildNode.getAttributeNode("recGroup").nodeValue;
						this.upcomingObject.dupMethod = programChildNode.getAttributeNode("dupMethod").nodeValue;
						this.upcomingObject.recType = programChildNode.getAttributeNode("recType").nodeValue;
						this.upcomingObject.encoderId = programChildNode.getAttributeNode("encoderId").nodeValue;
						this.upcomingObject.recProfile = programChildNode.getAttributeNode("recProfile").nodeValue;
						this.upcomingObject.recEndTs = programChildNode.getAttributeNode("recEndTs").nodeValue;
						this.upcomingObject.recordId = programChildNode.getAttributeNode("recordId").nodeValue;
						this.upcomingObject.dupInType = programChildNode.getAttributeNode("dupInType").nodeValue;
						
						this.upcomingObject.recStatusText = recStatusDecode(this.upcomingObject.recStatus);
								
					}
						
				}
				
				Mojo.Log.info('Done parsing programDetails');
				//Mojo.Log.info("full upcoming details json is %j", this.upcomingObject); 
				
			break;
				
			default:
				//Mojo.Log.error("node name is "+topSingleNode.nodeName);
				break;
		}
	}
	
	this.finishedReadingDetails();

}

UpcomingDetailsXMLAssistant.prototype.finishedReadingDetails = function() {
	
	
	var channelIconUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetChannelIcon?ChanId=";
	channelIconUrl += this.chanid;
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		$('upcomingDetails-channel-icon').innerHTML = '<img class="upcomingDetails-channel-img" src="'+channelIconUrl+'" />';
	}
	
	//Fill in data values
	$('scene-title').innerText = this.upcomingObject.title;
	$('subtitle-title').innerText = this.upcomingObject.subTitle;
	$('description-title').innerText = this.upcomingObject.description;
	$('category-title').innerText = this.upcomingObject.category;
	$('recstartts-title').innerText = this.upcomingObject.recStartTs.replace("T"," ");
	$('recStatusText-title').innerText = this.upcomingObject.recStatusText;
	$('encoderId-title').innerText = this.upcomingObject.encoderId;
	
	//$('recgroup-title').innerText = this.upcomingObject.recgroup;
	$('starttime-title').innerText = this.upcomingObject.startTime.replace("T"," ");
	$('endtime-title').innerText = this.upcomingObject.endTime.replace("T"," ");
	$('airdate-title').innerText = this.upcomingObject.airdate;
	//$('storagegroup-title').innerText = this.upcomingObject.storagegroup;
	//$('playgroup-title').innerText = this.upcomingObject.playgroup;
	//$('programflags-title').innerText = this.upcomingObject.programflags;
	$('programid-title').innerText = this.upcomingObject.programId;
	$('seriesid-title').innerText = this.upcomingObject.seriesId;
	$('channame-title').innerText = this.upcomingObject.channelName;
	$('channum-title').innerText = this.upcomingObject.chanNum;
	

	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()
	
	
}