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


function GuideDetailsAssistant(detailsObject, forceRefresh) {
	   
	   this.guideObject = detailsObject;
	   
	   this.forceRefresh = forceRefresh;
	   
}

GuideDetailsAssistant.prototype.setup = function() {

	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	$('spinner-text').innerHTML = $L("Loading")+"...";
	
	
	Mojo.Log.info("Starting upcoming details scene '%j'", this.guideObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	

	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{ label: $L('Setup'), command: 'go-setup--', width: 90 },
									{ icon: 'refresh', command: 'go-refresh' },
									{label: $L('More'), submenu:'more-menu', width: 90}
								]};
							
 
	WebMyth.prefsCookieObject.currentFrontendsMenuModel = { label: $L('Hosts'), items: []};
 
	this.moreMenuModel = { label: $L('moreMenu'), items: [
		{"label": $L('Web'), items:[
			{"label": $L('Wikipedia'), "command": "go-web-----Wikipedia"},
			{"label": $L('themoviedb'), "command": "go-web-----themoviedb"},
			{"label": $L('IMDB'), "command": "go-web-----IMDB"},
			{"label": $L('TheTVDB'), "command": "go-web-----TheTVDB"},
			{"label": $L('TV.com'), "command": "go-web-----TV.com"},
			{"label": $L('Google'), "command": "go-web-----Google"},
			]},	
		{"label": $L('MythWeb'), "command": "go-mythweb"},	
		{"label": $L('Guide'), items:[
			{"label": $L('Time'), "command": "go-guide---time"},
			{"label": $L('Title Search'), "command": "go-guide---search"}
		]}
	]};

 
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('more-menu', '', this.moreMenuModel);
	
	
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
	$('airdate-title').innerText = this.guideObject.airdate;
	//$('storagegroup-title').innerText = this.guideObject.storagegroup;
	//$('playgroup-title').innerText = this.guideObject.playgroup;
	//$('programflags-title').innerText = this.guideObject.programflags;
	$('programid-title').innerText = this.guideObject.programId;
	//$('seriesid-title').innerText = this.guideObject.seriesId;
	$('channame-title').innerText = this.guideObject.channelName;
	$('channum-title').innerText = this.guideObject.chanNum;
	//$('recstartts-title').innerText = this.guideObject.recStartTs;
	
	
	
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	

};

GuideDetailsAssistant.prototype.activate = function(event) {

	$('generalDetails-group-title').innerText = $L('General Details');
		$('subtitle-label').innerText = $L('Subtitle');
		$('starttime-label').innerText = $L('Start Time');
		$('endtime-label').innerText = $L('End Time');
		$('recstatustext-label').innerText = $L('Status');
	$('programDetails-group-title').innerText = $L('Program Details');
		$('airdate-label').innerText = $L('Original Airdate');
		$('programid-label').innerText = $L('Program ID');
		$('channum-label').innerText = $L('Channel Number');
		$('channame-label').innerText = $L('Channel Name');
		
		
	var nowDate = new Date();
	var nowDatePlus15 = new Date();
	var nowDateMinus15 = new Date();
	
	nowDatePlus15.setTime(nowDatePlus15.getTime() + 900000);
	nowDateMinus15.setTime(nowDateMinus15.getTime() - 900000);
	
	var nowDateISO = dateJSToISO(nowDate);
	var nowDatePlus15ISO = dateJSToISO(nowDatePlus15);
	var nowDateMinus15ISO = dateJSToISO(nowDateMinus15);
	
	
	if(((this.guideObject.startTime) <  nowDatePlus15ISO) && ((this.guideObject.endTime) >  nowDateMinus15ISO)) {
		
		//Update list of current hosts
		var hostsList = [];
		var i, s;
		
		for (i = 0; i < WebMyth.hostsCookieObject.length; i++) {

			s = { 
				"label": $L(WebMyth.hostsCookieObject[i].hostname),
				"command": "go-play----"+WebMyth.hostsCookieObject[i].hostname+"[]:[]"+WebMyth.hostsCookieObject[i].address+"[]:[]"+WebMyth.hostsCookieObject[i].port,
				"hostname": WebMyth.hostsCookieObject[i].hostname,
				"port": WebMyth.hostsCookieObject[i].port 
			};
			hostsList.push(s);
			
		};
			
		WebMyth.prefsCookieObject.currentFrontendsMenuModel.items = hostsList;
		this.controller.modelChanged(WebMyth.prefsCookieObject.currentFrontendsMenuModel);
		
		this.cmdMenuModel.items[0].label = $L('Play');
		this.cmdMenuModel.items[0].submenu = 'hosts-menu';
		this.cmdMenuModel.items[0].width =  90;
		
		this.cmdMenuModel.items[1].label = $L('Setup');
		this.cmdMenuModel.items[1].command = 'go-setup--';
		this.cmdMenuModel.items[1].width =  90;
		this.cmdMenuModel.items[1].icon =  '';
		
				
		this.controller.setupWidget('hosts-menu', '', WebMyth.prefsCookieObject.currentFrontendsMenuModel);
		this.controller.modelChanged(this.cmdMenuModel);
			
	}
	
	

	if(this.forceRefresh){
		this.forceRefresh = false;
		
		this.refreshData();
		
	} else {
	
		//Stop spinner and hide
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').hide();
		
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
      case 'go-setup--':
		this.openSetup();
       break;
      case 'go-play---':
		this.checkLocation(mySelection);
       break;
      case 'go-web----':
		this.openWeb(mySelection);
       break;
      case 'go-mythweb':
		this.openMythweb();
       break;
      case 'go-guide--':
		this.openGuide(mySelection);
       break;
      case 'go-refresh':
		this.refreshData();
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





GuideDetailsAssistant.prototype.openSetup = function() {

	Mojo.Log.error("opening setup");
	
	Mojo.Controller.stageController.pushScene("setupRecording", this.guideObject);

};

GuideDetailsAssistant.prototype.openGuide = function(guideType) {

	Mojo.Log.error("Opening in guide "+guideType);
	
	if(guideType == "time"){
		Mojo.Controller.stageController.pushScene("guide", this.guideObject.startTime.replace(" ","T").substring(0,18)+01);
	} else if(guideType == "search"){
		Mojo.Controller.stageController.pushScene("search", this.guideObject.title);
	}
 
};

GuideDetailsAssistant.prototype.openMythweb = function() {

			
	var dateJS = new Date(isoToJS(this.guideObject.startTime));
	var dateUTC = dateJS.getTime()/1000;				//don't need 59 second offset?
			
	var mythwebUrl = "http://";
	mythwebUrl += WebMyth.prefsCookieObject.webserverName;
	mythwebUrl += "/mythweb/tv/detail/";
	mythwebUrl += this.guideObject.chanId + "/";
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


GuideDetailsAssistant.prototype.openWeb = function(website) {

  //Mojo.Log.error('got to openWeb with : '+website);
  var url = "";
  
  switch(website) {
	case 'Wikipedia':
		url = "http://"+Mojo.Locale.getCurrentLocale().substring(0,2)+".m.wikipedia.org/wiki/Special:Search?search="+this.guideObject.title;
	  break;
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



GuideDetailsAssistant.prototype.checkLocation = function(frontend) {

	//Attempting to play livetv - have to start livetv then change channel

	//Using MythTV's field seperator for decoding
	var frontendDecoder = frontend.split("[]:[]");
	
	
	
	if((WebMyth.prefsCookieObject.currentFrontend != frontendDecoder[0])){
		Mojo.Log.info("Changing frontend to "+frontendDecoder[0]);

		WebMyth.prefsCookieObject.currentFrontend = frontendDecoder[0];
		WebMyth.prefsCookieObject.currentFrontendAddress = frontendDecoder[1];
		WebMyth.prefsCookieObject.currentFrontendPort = frontendDecoder[2];
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
		if(WebMyth.usePluginFrontend) {
			WebMyth.startTelnetPlugin();
			
			setTimeout(function () {}, 250);		//Pause a little bit to let new telnet connection setup
			
		} else if(WebMyth.useService) {
			WebMyth.startNewCommunication(this);
		}
		
	}
	
	Mojo.Log.info("Checking current location as prep for "+this.guideObject.chanId+" on "+WebMyth.prefsCookieObject.currentFrontend);
	
	
	if(WebMyth.usePluginFrontend){
		WebMyth.playPluginChannel(this.guideObject.chanId);
		
	} else if(WebMyth.useService){
		WebMyth.playServiceChannel(this, this.guideObject.chanId);
			
	} else {
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=query";
		requestUrl += "&host="+WebMyth.prefsCookieObject.currentFrontend+"&cmd=location";
		
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
	
};



GuideDetailsAssistant.prototype.jumpLive = function() {
	//Attempting to play livetv - have to start livetv then change channel
	Mojo.Log.info("jumping to live tv");
	
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=jump";
		requestUrl += "&host="+WebMyth.prefsCookieObject.currentFrontend+"&cmd=livetv";
		
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


GuideDetailsAssistant.prototype.refreshData = function() {

		//Stop spinner and hide
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').show();
		
	//Update details from XML backend
	Mojo.Log.info('Starting details data gathering from XML backend');
		
	this.requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetProgramDetails?StartTime=";
	this.requestUrl += this.guideObject.startTime;
	this.requestUrl += "&ChanId=";
	this.requestUrl += this.guideObject.chanId;

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



GuideDetailsAssistant.prototype.readDetailsXMLFailure = function(response) {

	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()
	
	Mojo.Controller.getAppController().showBanner("Failed to get program information", {source: 'notification'});
	Mojo.Log.error('Failed to get Ajax response for program details because %j', response.responseText);
	
}

GuideDetailsAssistant.prototype.readDetailsXMLSuccess = function(response) {

	
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
				
				this.guideObject = {
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
					this.guideObject.stars = programNode.getAttributeNode("stars").nodeValue;
					this.guideObject.airdate = programNode.getAttributeNode("airdate").nodeValue;
				} catch(e) {
					Mojo.Log.info("Error with getting airdate and stars");
					this.guideObject.stars = "";
					this.guideObject.airdate = "";
				}
				
				for(var j = 0; j < programNode.childNodes.length; j++) {
					programChildNode = programNode.childNodes[j];
					//Mojo.Log.info("Node name is "+programChildNode.nodeName);
					
					if(j == 0) this.guideObject.description =programChildNode.nodeValue;
									
					if(programChildNode.nodeName == 'Channel') {
						//Mojo.Log.info('Inside channel if');

						this.guideObject.inputId = programChildNode.getAttributeNode("inputId").nodeValue;
						this.guideObject.chanFilters = programChildNode.getAttributeNode("chanFilters").nodeValue;
						this.guideObject.commFree = programChildNode.getAttributeNode("commFree").nodeValue;
						this.guideObject.channelName = programChildNode.getAttributeNode("channelName").nodeValue;
						this.guideObject.sourceId = programChildNode.getAttributeNode("sourceId").nodeValue;
						this.guideObject.chanId = programChildNode.getAttributeNode("chanId").nodeValue;
						this.guideObject.chanNum = programChildNode.getAttributeNode("chanNum").nodeValue;
						this.guideObject.callSign = programChildNode.getAttributeNode("callSign").nodeValue;
					}
					
									
					if(programChildNode.nodeName == "Recording") {
						//Mojo.Log.info('Inside recording if');
						
						this.guideObject.recPriority = programChildNode.getAttributeNode("recPriority").nodeValue;
						this.guideObject.playGroup = programChildNode.getAttributeNode("playGroup").nodeValue;
						this.guideObject.recStatus = programChildNode.getAttributeNode("recStatus").nodeValue;
						this.guideObject.recStartTs = programChildNode.getAttributeNode("recStartTs").nodeValue;
						this.guideObject.recGroup = programChildNode.getAttributeNode("recGroup").nodeValue;
						this.guideObject.dupMethod = programChildNode.getAttributeNode("dupMethod").nodeValue;
						this.guideObject.recType = programChildNode.getAttributeNode("recType").nodeValue;
						this.guideObject.encoderId = programChildNode.getAttributeNode("encoderId").nodeValue;
						this.guideObject.recProfile = programChildNode.getAttributeNode("recProfile").nodeValue;
						this.guideObject.recEndTs = programChildNode.getAttributeNode("recEndTs").nodeValue;
						this.guideObject.recordId = programChildNode.getAttributeNode("recordId").nodeValue;
						this.guideObject.dupInType = programChildNode.getAttributeNode("dupInType").nodeValue;
						
						
						this.guideObject.recStatusText = recStatusDecode(this.guideObject.recStatus);
								
					} 
						
				}
				
				if(this.guideObject.recStatusText == null) this.guideObject.recStatusText = recStatusDecode(-10);
				
				Mojo.Log.info('Done parsing programDetails');
				Mojo.Log.info("full guide details json is %j", this.guideObject); 
				
			break;
				
			default:
				//Mojo.Log.error("node name is "+topSingleNode.nodeName);
				break;
		}
	}
	
	this.finishedReadingDetails();

}


GuideDetailsAssistant.prototype.finishedReadingDetails = function() {
	
		//Stop spinner and hide
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').hide();
		

	//Fill in data values
	$('scene-title').innerText = this.guideObject.title;
	$('subtitle-title').innerText = this.guideObject.subTitle;
	$('description-title').innerText = this.guideObject.description;
	
	//$('hostname-title').innerText = this.guideObject.hostname;
	//$('recgroup-title').innerText = this.guideObject.recgroup;
	$('starttime-title').innerText = this.guideObject.startTime.replace("T"," ");
	$('endtime-title').innerText = this.guideObject.endTime.replace("T"," ");
	$('recstatustext-title').innerText = this.guideObject.recStatusText;
	$('airdate-title').innerText = this.guideObject.airdate;
	//$('storagegroup-title').innerText = this.guideObject.storagegroup;
	//$('playgroup-title').innerText = this.guideObject.playgroup;
	//$('programflags-title').innerText = this.guideObject.programflags;
	$('programid-title').innerText = this.guideObject.programId;
	//$('seriesid-title').innerText = this.guideObject.seriesId;
	$('channame-title').innerText = this.guideObject.channelName;
	$('channum-title').innerText = this.guideObject.chanNum;
	//$('recstartts-title').innerText = this.guideObject.recStartTs;
	
}