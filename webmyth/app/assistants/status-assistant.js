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
 
 
 function StatusAssistant() {
	
	this.encodersList = [];
	this.cardinputsList = [];
	this.scheduledList = [];
	this.jobqueueList = [{"id":"-1", "noJobs":"true"}];
	this.storageList = [];
	
	this.doneStatusXML = false;
	this.doneCardinputs = false;
	   
}

StatusAssistant.prototype.setup = function() {

	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	$('spinner-text').innerHTML = $L("Loading")+"...";
	
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Status'),
                            items: [{},{},{ icon: 'refresh', command: 'go-refresh' }]};
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	
	
	//Encoders drawer and list
	this.controller.setupWidget("encodersDrawer",
		this.encodersAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.encodersModel = {
			open: false
		}
	);
	this.encodersDrawer = this.controller.get("encodersDrawer");
	this.controller.listen(this.controller.get("encodersGroup"),Mojo.Event.tap,this.toggleEncodersDrawer.bindAsEventListener(this));
	
	this.encodersListAttribs = {
		itemTemplate: "status/encodersListItem",
		swipeToDelete: false,
		formatters:{myEncodersData: this.setEncodersData.bind(this)}
	};
    this.encodersListModel = {           
		items: this.encodersList
    };
	this.controller.setupWidget( 'encodersList' , this.encodersListAttribs, this.encodersListModel);
	
	
	//Scheduled drawer and list
	this.controller.setupWidget("scheduledDrawer",
		this.scheduledAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.scheduledModel = {
			open: false
		}
	);
	this.scheduledDrawer = this.controller.get("scheduledDrawer");
	this.controller.listen(this.controller.get("scheduledGroup"),Mojo.Event.tap,this.toggleScheduledDrawer.bindAsEventListener(this));
	
	this.scheduledListAttribs = {
		itemTemplate: "status/scheduledListItem",
		swipeToDelete: false
	};
    this.scheduledListModel = {          
		items: this.scheduledList
    };
	this.controller.setupWidget( 'scheduledList' , this.scheduledListAttribs, this.scheduledListModel);
	
	
	//jobqueue drawer and list
	this.controller.setupWidget("jobqueueDrawer",
		this.jobqueueAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.jobqueueModel = {
			open: false
		}
	);
	this.jobqueueDrawer = this.controller.get("jobqueueDrawer");
	this.controller.listen(this.controller.get("jobqueueGroup"),Mojo.Event.tap,this.toggleJobqueueDrawer.bindAsEventListener(this));
	
	this.jobqueueListAttribs = {
		itemTemplate: "status/jobqueueListItem",
		swipeToDelete: false,
		formatters:{myJobqueueData: this.setJobqueueData.bind(this)}
	};
    this.jobqueueListModel = {           
		items: this.jobqueueList
    };
	this.controller.setupWidget( 'jobqueueList' , this.jobqueueListAttribs, this.jobqueueListModel);
	
	
	//storage drawer and list
	this.controller.setupWidget("storageDrawer",
		this.storageAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.storageModel = {
			open: false
		}
	);
	this.storageDrawer = this.controller.get("storageDrawer");
	this.controller.listen(this.controller.get("storageGroup"),Mojo.Event.tap,this.toggleStorageDrawer.bindAsEventListener(this));
	
	this.storageListAttribs = {
		itemTemplate: "status/storageListItem",
		swipeToDelete: false
	};
    this.storageListModel = {            
		items: this.storageList
    };
	this.controller.setupWidget( 'storageList' , this.storageListAttribs, this.storageListModel);
	
	
	//guide drawer
	this.controller.setupWidget("guideDrawer",
		this.guideAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.guideModel = {
			open: false
		}
	);
	this.guideDrawer = this.controller.get("guideDrawer");
	this.controller.listen(this.controller.get("guideGroup"),Mojo.Event.tap,this.toggleGuideDrawer.bindAsEventListener(this));
	
	
	
	//General drawer
	this.controller.setupWidget("generalStatusDrawer",
		this.generalStatusAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.generalStatusModel = {
			open: false
		}
	);
	this.generalStatusDrawer = this.controller.get("generalStatusDrawer");
	this.controller.listen(this.controller.get("generalStatusGroup"),Mojo.Event.tap,this.toggleGeneralDrawer.bindAsEventListener(this));
	
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	if(WebMyth.usePlugin){
		$('webmyth_service_id').mysqlStatusEncodersResponse = this.mysqlStatusEncodersResponse.bind(this);
	}
	
	
	this.getStatus();
	
	this.getCardinputs();
	
};

StatusAssistant.prototype.activate = function(event) {

	$('scene-title').innerText = $L('Backend Status');
	$('encodersDivider-label').innerText = $L('Encoders');
	$('scheduledDivider-label').innerText = $L('Scheduled');
	$('jobqueueDivider-label').innerText = $L('Job Queue');
	$('storageLocationsDivider-label').innerText = $L('Storage Locations');
	$('guideInformationDivider-label').innerText = $L('Guide Information');
	$('otherInfoDivider-label').innerText = $L('Other Info');
	

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

StatusAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

StatusAssistant.prototype.cleanup = function(event) {

};

StatusAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.forward) {
		//Mojo.Controller.stageController.pushScene("hostSelector", true);
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
		
  } else if(event.type == Mojo.Event.command) {
  

		switch(event.command) {
			case 'go-refresh':		
			  
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').show();
			
				this.getStatus();
				
			  break;
		}
	}
  
};

StatusAssistant.prototype.handleKey = function(event) {

	//Mojo.Log.info("handleKey %o, %o", event.originalEvent.metaKey, event.originalEvent.keyCode);
	
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



StatusAssistant.prototype.getStatus = function() {
	
	//Getting settings information
	//Mojo.Log.info("Got master backend IP from settings: "+WebMyth.prefsCookieObject.masterBackendIp);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/xml";
	
		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.info("XML status URL is: "+requestUrl);
			
			this.controller.serviceRequest("palm://com.palm.applicationManager", {
				method: "open",
				parameters:  {
					id: 'com.palm.app.browser',
					params: {
						target: requestUrl
					}
				}
			});
			
		}
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
			evalJSON: false,
            onSuccess: this.readStatusSuccess.bind(this),
            onFailure: this.readStatusFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

StatusAssistant.prototype.getCardinputs = function() {
	
	//Getting encoder names from table 'cardinput'
	
	var query = "SELECT cardid, displayname FROM cardinput ;";
	
	
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlStatusEncodersResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		Mojo.Log.info("Status plugin response "+response1);
		
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
				onSuccess: this.readCardinputsSuccess.bind(this),
				onFailure: function() {
							Mojo.Log.info("Failed to get encoder names from SQL")	
					}   
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
	
	}
	
};

StatusAssistant.prototype.readCardinputsSuccess = function(response) {

	Mojo.Log.info("Got encoders SQL response: %j",response.responseJSON);
	
	this.cardinputsList.clear();
	
	Object.extend(this.cardinputsList, response.responseJSON);
	
	
	//Show encoders names only after we get both XML status and SQL response
	this.doneCardinputs = true;
	
	if(this.doneStatusXML) {
		this.combineEncoders();
	}

}

StatusAssistant.prototype.mysqlStatusEncodersResponse = function(response) {

	Mojo.Log.info("Got status encoders plugin response: "+response);
	
	var statusEncodersJson = JSON.parse(response);
	
	Mojo.Log.info("Plugin status encoders JSON %j",statusEncodersJson);

	
	this.cardinputsList.clear();
	
	Object.extend(this.cardinputsList, statusEncodersJson);
	
	
	//Show encoders names only after we get both XML status and SQL response
	this.doneCardinputs = true;
	
	if(this.doneStatusXML) {
		this.combineEncoders();
	}

}



StatusAssistant.prototype.toggleGeneralDrawer = function() {
	this.generalStatusDrawer.mojo.setOpenState(!this.generalStatusDrawer.mojo.getOpenState());
	
	//Mojo.Log.info("toggling general drawer");

	if (this.generalStatusDrawer.mojo.getOpenState() == true){
		this.controller.get("generalStatusArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("generalStatusArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleEncodersDrawer = function() {
	this.encodersDrawer.mojo.setOpenState(!this.encodersDrawer.mojo.getOpenState());
	
	//Mojo.Log.info("toggling encoders drawer");

	if (this.encodersDrawer.mojo.getOpenState() == true){
		this.controller.get("encodersArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("encodersArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleScheduledDrawer = function() {
	this.scheduledDrawer.mojo.setOpenState(!this.scheduledDrawer.mojo.getOpenState());
	
	//Mojo.Log.info("toggling scheduled drawer");

	if (this.scheduledDrawer.mojo.getOpenState() == true){
		this.controller.get("scheduledArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("scheduledArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleJobqueueDrawer = function() {
	this.jobqueueDrawer.mojo.setOpenState(!this.jobqueueDrawer.mojo.getOpenState());
	
	//Mojo.Log.info("toggling jobqueue drawer");

	if (this.jobqueueDrawer.mojo.getOpenState() == true){
		this.controller.get("jobqueueArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("jobqueueArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleStorageDrawer = function() {
	this.storageDrawer.mojo.setOpenState(!this.storageDrawer.mojo.getOpenState());
	
	//Mojo.Log.info("toggling storage drawer");

	if (this.storageDrawer.mojo.getOpenState() == true){
		this.controller.get("storageArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("storageArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleGuideDrawer = function() {
	this.guideDrawer.mojo.setOpenState(!this.guideDrawer.mojo.getOpenState());
	
	//Mojo.Log.info("toggling guide drawer");

	if (this.guideDrawer.mojo.getOpenState() == true){
		this.controller.get("guideArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("guideArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};





StatusAssistant.prototype.readStatusFail = function(response) {
	Mojo.Log.error("Failed to get status information");	
};

StatusAssistant.prototype.readStatusSuccess = function(response) {
		
	Mojo.Log.info("Starting readStatusSuccess");
	
	try {
	
		var xmlobject;
		
		if(response.responseXML) {
		
			xmlobject = response.responseXML;
		
			Mojo.Log.info("Using XML status response as responseXML");
			
		} else {
		
			var xmlstring = response.responseText.trim();
		
			Mojo.Log.info("Got XML status responseText from backend: "+xmlstring);
			
			
			xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
			
		}
		
		var singleEncoderNode, singleEncoderChildNode, singleEncoderJson;
		var singleScheduledNode, singleScheduledRecordingNode, singleScheduleJson;
		var singleJobqueueNode, singleJobqueueProgramNode, singleJobqueueJson;
		var hasJobs = false, tempJobsList = [];
		var singleStorageNode, singleStorageJson;
		
		
		//Encoders
		var encodersNode=xmlobject.getElementsByTagName("Encoders")[0];
		var encodersCount = encodersNode.getAttributeNode("count").nodeValue;
		//Mojo.Log.info("Count of encoders is "+encodersCount);
		//Mojo.Log.info("Count of child encoder nodes is "+encodersNode.childNodes.length);
		this.encodersList.clear();
		for(var i = 0; i < encodersNode.childNodes.length; i++) {
			//Mojo.Log.info("Encoder nodeName is "+encodersNode.childNodes[i].nodeName);
			singleEncoderNode = encodersNode.childNodes[i];
			if(singleEncoderNode.nodeName == "Encoder") {
				singleEncoderJson = { 
										"hostname" : singleEncoderNode.getAttributeNode("hostname").nodeValue,
										"state" : singleEncoderNode.getAttributeNode("state").nodeValue,
										"id" : singleEncoderNode.getAttributeNode("id").nodeValue,
										"local" : singleEncoderNode.getAttributeNode("local").nodeValue,
										"sleepstatus" : singleEncoderNode.getAttributeNode("sleepstatus").nodeValue,
										"connected" : singleEncoderNode.getAttributeNode("connected").nodeValue,
										"encoderName" : ""
									};
				for(var j = 0; j < singleEncoderNode.childNodes.length; j++) {
					singleEncoderChildNode = singleEncoderNode.childNodes[j];
					if(singleEncoderChildNode.nodeName == "Program") {
						singleEncoderJson.title = singleEncoderChildNode.getAttributeNode("title").nodeValue;
						singleEncoderJson.subTitle = singleEncoderChildNode.getAttributeNode("subTitle").nodeValue;
						singleEncoderJson.endTime = singleEncoderChildNode.getAttributeNode("endTime").nodeValue.replace("T", " ");
					}
				}
					
				//Mojo.Log.info("Added encoder %j to list", singleEncoderJson);
				this.encodersList.push(singleEncoderJson);
			}
		} 
		//Mojo.Log.info("Full encoder list is %j", this.encodersList);
		this.controller.modelChanged(this.encodersListModel);
			
		
		//Scheduled
		var scheduledNode=xmlobject.getElementsByTagName("Scheduled")[0];
		var scheduledCount = scheduledNode.getAttributeNode("count").nodeValue;
		//Mojo.Log.info("Count of scheduled is "+scheduledCount);
		//Mojo.Log.info("Count of child scheduled nodes is "+scheduledNode.childNodes.length);
		this.scheduledList.clear();
		for(var i = 0; i < scheduledNode.childNodes.length; i++) {
			//Mojo.Log.info("scheduled nodeName is "+scheduledNode.childNodes[i].nodeName);
			singleScheduledNode = scheduledNode.childNodes[i];
			if(singleScheduledNode.nodeName == "Program") {
				singleScheduledRecordingNode = singleScheduledNode.getElementsByTagName("Recording")[0];
				singleScheduledJson = { 
										"startTime" : singleScheduledNode.getAttributeNode("startTime").nodeValue.replace("T", " "),
										"title" : singleScheduledNode.getAttributeNode("title").nodeValue,
										"hostname" : singleScheduledNode.getAttributeNode("hostname").nodeValue,
										"subTitle" : singleScheduledNode.getAttributeNode("subTitle").nodeValue,
										"description" : singleScheduledNode.childNodes[0].nodeValue,
										"chanid" : singleScheduledNode.getElementsByTagName("Channel")[0].getAttributeNode("chanId").nodeValue,
										"encoderId" : singleScheduledRecordingNode.getAttributeNode("encoderId").nodeValue,
										"recStartTs" : singleScheduledRecordingNode.getAttributeNode("recStartTs").nodeValue.replace("T"," "),
										"encoderName" : ""
									};
				//Mojo.Log.info("Added scheduled %j to list", singleScheduledJson);
				this.scheduledList.push(singleScheduledJson);
			}
		} 
		//Mojo.Log.info("Full scheduled is %j", this.scheduledList);
		this.controller.modelChanged(this.scheduledListModel);
		
		
		//JobQueue
		var jobqueueNode=xmlobject.getElementsByTagName("JobQueue")[0];
		var jobqueueCount = jobqueueNode.getAttributeNode("count").nodeValue;
		//Mojo.Log.info("Count of jobqueue is "+jobqueueCount);
		//Mojo.Log.info("Count of child jobqueue nodes is "+jobqueueNode.childNodes.length);
		for(var i = 0; i < jobqueueNode.childNodes.length; i++) {
			//Mojo.Log.info("jobqueue nodeName is "+jobqueueNode.childNodes[i].nodeName);
			singleJobqueueNode = jobqueueNode.childNodes[i];
			if(singleJobqueueNode.nodeName == "Job") {
				hasJobs = true;
				singleJobqueueProgramNode = singleJobqueueNode.getElementsByTagName("Program")[0];
				singleJobqueueJson = { 
										"startTime" : singleJobqueueNode.getAttributeNode("startTime").nodeValue.replace("T", " "),
										"id" : singleJobqueueNode.getAttributeNode("id").nodeValue,
										"status" : singleJobqueueNode.getAttributeNode("status").nodeValue,
										"type" : singleJobqueueNode.getAttributeNode("type").nodeValue,
										"hostname" : singleJobqueueNode.getAttributeNode("hostname").nodeValue,
										"comments" : singleJobqueueNode.childNodes[0].nodeValue,
										"title" : singleJobqueueProgramNode.getAttributeNode("title").nodeValue,
										"subTitle" : singleJobqueueProgramNode.getAttributeNode("subTitle").nodeValue,
										"fullTitle" : singleJobqueueProgramNode.getAttributeNode("title").nodeValue+": "+singleJobqueueProgramNode.getAttributeNode("subTitle").nodeValue
									};
				//Mojo.Log.info("Added jobqueue %j to list", singleJobqueueJson);
				tempJobsList.push(singleJobqueueJson);
			}
		} 
		if(hasJobs) {
			//Only update jobs list if we had jobs
		
			this.jobqueueList.clear();
			Object.extend(this.jobqueueList, tempJobsList);
			this.controller.modelChanged(this.jobqueueListModel);
			
		}
		//Mojo.Log.info("Full jobqueue is %j", this.jobqueueList);
		
		
		//Storage
		var storageNode=xmlobject.getElementsByTagName("Storage")[0];
		//Mojo.Log.info("Count of child storage nodes is "+storageNode.childNodes.length);
		this.storageList.clear();
		for(var i = 0; i < storageNode.childNodes.length; i++) {
			//Mojo.Log.info("Storage nodeName is "+storageNode.childNodes[i].nodeName);
			singleStorageNode = storageNode.childNodes[i];
			if(singleStorageNode.nodeName == "Group") {
				singleStorageJson = { 
					"dir" : singleStorageNode.getAttributeNode("dir").nodeValue,
					"id" : singleStorageNode.getAttributeNode("id").nodeValue,
					"free" : parseInt(singleStorageNode.getAttributeNode("free").nodeValue),
					"freeText": $L("Free")+": "+Mojo.Format.formatNumber(parseInt(singleStorageNode.getAttributeNode("free").nodeValue))+" MB",
					"total" : parseInt(singleStorageNode.getAttributeNode("total").nodeValue),
					"totalText": $L("Total")+": "+Mojo.Format.formatNumber(parseInt(singleStorageNode.getAttributeNode("total").nodeValue))+" MB",
					"used" : parseInt(singleStorageNode.getAttributeNode("used").nodeValue),
					"usedText": $L("Used")+": "+Mojo.Format.formatNumber(parseInt(singleStorageNode.getAttributeNode("used").nodeValue))+" MB"
				};
				
				singleStorageJson.freePercentage = Mojo.Format.formatNumber(100*singleStorageJson.free/singleStorageJson.total, {fractionDigits: 1})+"%";
				singleStorageJson.usedPercentage = Mojo.Format.formatNumber(100*singleStorageJson.used/singleStorageJson.total, {fractionDigits: 1})+"%";
				
				//Mojo.Log.info("Added storage group %j to list", singleStorageJson);
				this.storageList.push(singleStorageJson);
			}
		} 
		//Mojo.Log.info("Full storagelist is %j", this.storageList);
		this.controller.modelChanged(this.storageListModel);
		
		
		var guideStart = "";
		var guideStatus = "";
		var guideThru = "";
		var guideDays = "";
		var guideNext = "";
		var guideComments = "";
		
		try {
			var guideNode=xmlobject.getElementsByTagName("Guide")[0];
		
			guideStart = guideNode.getAttributeNode("start").nodeValue.replace("T", " ");
			guideStatus = guideNode.getAttributeNode("status").nodeValue.replace("T", " ");
			guideThru = guideNode.getAttributeNode("guideThru").nodeValue.replace("T", " ");
			guideDays = guideNode.getAttributeNode("guideDays").nodeValue.replace("T", " ");
			guideNext = guideNode.getAttributeNode("next").nodeValue.replace("T", " ");
			
			guideComments = guideNode.childNodes[0].nodeValue;
		} catch (e) {
			Mojo.Log.error(e);
		}
		
		//Guide
		
		var guideContent = '<div class="palm-row first">';
		guideContent += '	<div class="palm-row-wrapper">';
		guideContent += '        <div class="label" id="guideStart-label">'+$L('Last Run')+'</div>';
		guideContent += '		<div class="title" id="guideStart-title">'+guideStart+'</div>';
		guideContent += '	</div>';
		guideContent += '</div>';
		guideContent += '<div class="palm-row">';
		guideContent += '	<div class="palm-row-wrapper">';
		guideContent += '        <div class="label" id="guideStatus-label">'+$L('Last Status')+'</div>';
		guideContent += '		<div class="title" id="guideStatus-title">'+guideStatus+'</div>';
		guideContent += '	</div>';
		guideContent += '</div>';
		guideContent += '<div class="palm-row">';
		guideContent += '	<div class="palm-row-wrapper">';
		guideContent += '        <div class="label" id="guideThru-label">'+$L('Data Until')+'</div>';
		guideContent += '		<div class="title" id="guideThru-title">'+guideThru+'</div>';
		guideContent += '	</div>';
		guideContent += '</div>';
		guideContent += '<div class="palm-row">';
		guideContent += '	<div class="palm-row-wrapper">';
		guideContent += '        <div class="label" id="guideDays-label">'+$L('Days')+'</div>';
		guideContent += '		<div class="title" id="guideDays-title">'+guideDays+'</div>';
		guideContent += '	</div>';
		guideContent += '</div>';
		guideContent += '<div class="palm-row">';
		guideContent += '	<div class="palm-row-wrapper">';
		guideContent += '        <div class="label" id="guideNext-label">'+$L('Next Run')+'</div>';
		guideContent += '		<div class="title" id="guideNext-title">'+guideNext+'</div>';
		guideContent += '	</div>';
		guideContent += '</div>	';
		guideContent += '<div class="palm-row last">';
		guideContent += '	<div class="palm-row-wrapper">';
		guideContent += '        <div class="label" id="guideComments-label">'+$L('Comments')+'</div>';
		guideContent += '		<div class="title" id="guideComments-title">'+guideComments+'</div>';
		guideContent += '	</div>';
		guideContent += '</div>';
		
		$('guideContent').innerHTML = guideContent;
		
		
		
		//General drawer
		var statusVersion = "";
		var statusDate = "";
		var statusTime = "";
		var allLoads = "";
		
		try {
			var statusNode=xmlobject.getElementsByTagName("Status")[0];
			var loadNode=xmlobject.getElementsByTagName("Load")[0];
		
			statusVersion = statusNode.getAttributeNode("version").nodeValue;
			statusDate = statusNode.getAttributeNode("date").nodeValue;
			statusTime = statusNode.getAttributeNode("time").nodeValue;
			allLoads = loadNode.getAttributeNode("avg1").nodeValue+", "+loadNode.getAttributeNode("avg2").nodeValue+", "+loadNode.getAttributeNode("avg3").nodeValue;
			
		} catch (e) {
			Mojo.Log.error(e);
		}
		
		WebMyth.prefsCookieObject.mythVer = statusNode.getAttributeNode("version").nodeValue;
		
		var generalStatusContent = '<div class="palm-row first">';
		generalStatusContent +=	'	<div class="palm-row-wrapper">';
		generalStatusContent +=	'		<div class="label" id="masterBackendIP-label">'+$L('Master Backend')+'</div>';
		generalStatusContent +=	'		<div class="title" id="masterBackendIP-title">'+WebMyth.prefsCookieObject.masterBackendIp+'</div>';
		generalStatusContent +=	'	</div>';
		generalStatusContent +=	'</div>';
		generalStatusContent +=	'<div class="palm-row">';
		generalStatusContent +=	'	<div class="palm-row-wrapper">';
		generalStatusContent +=	'        <div class="label" id="version-label">'+$L('Version')+'</div>';
		generalStatusContent +=	'		<div class="title" id="version-title">'+statusVersion+'</div>';
		generalStatusContent +=	'	</div>';
		generalStatusContent +=	'</div>';
		generalStatusContent +=	'<div class="palm-row">';
		generalStatusContent +=	'	<div class="palm-row-wrapper">';
		generalStatusContent +=	'        <div class="label" id="version-label">'+$L('MythTV Protocol Version')+'</div>';
		generalStatusContent +=	'		<div class="title" id="version-title">'+WebMyth.prefsCookieObject.protoVer+'</div>';
		generalStatusContent +=	'	</div>';
		generalStatusContent +=	'</div>';
		generalStatusContent +=	'<div class="palm-row">';
		generalStatusContent +=	'	<div class="palm-row-wrapper">';
		generalStatusContent +=	'        <div class="label" id="currentdate-label">'+$L('Current Date')+'</div>';
		generalStatusContent +=	'		<div class="title" id="currentdate-title">'+statusDate+'</div>';
		generalStatusContent +=	'	</div>';
		generalStatusContent +=	'</div>';
		generalStatusContent +=	'<div class="palm-row">';
		generalStatusContent +=	'	<div class="palm-row-wrapper">';
		generalStatusContent +=	'        <div class="label" id="currenttime-label">'+$L('Current Time')+'</div>';
		generalStatusContent +=	'		<div class="title" id="currenttime-title">'+statusTime+'</div>';
		generalStatusContent +=	'	</div>';
		generalStatusContent +=	'</div>';
		generalStatusContent +=	'<div class="palm-row last">';
		generalStatusContent +=	'	<div class="palm-row-wrapper">';
		generalStatusContent +=	'        <div class="label" id="avg3-label">'+$L('Load Avg')+'</div>';
		generalStatusContent +=	'		<div class="title" id="all-avgs-title">'+allLoads+'</div>';
		generalStatusContent +=	'	</div>';
		generalStatusContent +=	' </div>';
		
		$('generalStatusContent').innerHTML = generalStatusContent;
		
		
		
		
		//Show encoders names only after we get both XML status and SQL response
		this.doneStatusXML = true;
		
		if(this.doneCardinputs) {
			this.combineEncoders();
		}
		
	} catch(e) {
		Mojo.Log.error(e);
	}
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()	
	
};

StatusAssistant.prototype.combineEncoders = function() {

	Mojo.Log.info("Combining encoders data from XML and SQL");
	
	var i, j;
	
	for(i = 0; i < this.encodersList.length; i++){
	
		for(j = 0; j < this.cardinputsList.length; j++){
			
			if((this.cardinputsList[j].cardid == this.encodersList[i].id)&&(this.cardinputsList[j].displayname.length > 0)){
				this.encodersList[i].encoderName = "("+this.cardinputsList[j].displayname+") ";
			}
			
		}
	
	}
	
	this.controller.modelChanged(this.encodersListModel);
	
	
	
	for(i = 0; i < this.scheduledList.length; i++){
	
		for(j = 0; j < this.cardinputsList.length; j++){
			
			if((this.cardinputsList[j].cardid == this.scheduledList[i].encoderId)&&(this.cardinputsList[j].displayname.length > 0)){
				this.scheduledList[i].encoderName = "("+this.cardinputsList[j].displayname+") ";
			}
			
		}
	
	}
	
	this.controller.modelChanged(this.scheduledListModel);
	
}


StatusAssistant.prototype.setEncodersData = function(propertyValue, model)  { 
	
	var state;
	
	switch(parseInt(model.state)) {
		case -1:
			state = $L("Disconnected");
			break;
		case 0:
			state = $L("Idle");
			break;
		case 1:
			state = $L("Watching Live TV");
			break;
		case 2:
			state = $L("Watching Pre-Recorded");
			break;
		case 3:
			state = $L("Watching Video");
			break;
		case 4:
			state = $L("Watching DVD");
			break;
		case 5:
			state = $L("Watching BD");
			break;
		case 6:
			state = $L("Recording");
			break;
		case 7:
			state = $L("Recording");
			break;
		case 8:
			state = $L("Unknown Status 8");
			break;
		case 9:
			state = $L("Unknown Status 9");
			break;
		default:
			state = $L("Unknown");
			break;
	};
	
			
	
	var myDataModel = '<div class="palm-row-wrapper">';
	//myDataModel += '<div class="title"> ';
    myDataModel += '<div class="title">'+$L('Encoder')+' #'+model.id+' '+model.encoderName+'on '+model.hostname+' is '+state+'</div>';
    //myDataModel += '</div>';
	
	if(model.title) {
		myDataModel += '<div class="palm-info-text">'+model.title+': '+model.subTitle+'<br />';
		myDataModel += 'Program finishes at '+model.endTime+'</div>';
	}
	
	myDataModel += '</div>';
	
	model.myEncodersData = myDataModel;
	

};

StatusAssistant.prototype.setJobqueueData = function(propertyValue, model)  { 
	
	var jobType, statusText;
	
	switch(parseInt(model.type)) {
		case 0:
			jobType = $L("System Job");
			break;
		case 1:
			jobType = $L("Transcode");
			break;
		case 2:
			jobType = $L("Commercial Flagging");
			break;
		case 256:
				if(WebMyth.settings.UserJobDesc1) {
					jobType = WebMyth.settings.UserJobDesc1;
				} else {
					jobType = "User Job 1";
				}
			break;
		case 512:
				if(WebMyth.settings.UserJobDesc1) {
					jobType = WebMyth.settings.UserJobDesc2;
				} else {
					jobType = "User Job 2";
				}
			break;
		case 1024:
				if(WebMyth.settings.UserJobDesc1) {
					jobType = WebMyth.settings.UserJobDesc3;
				} else {
					jobType = "User Job 3";
				}
			break;
		case 2048:
				if(WebMyth.settings.UserJobDesc4) {
					jobType = WebMyth.settings.UserJobDesc4;
				} else {
					jobType = "User Job 4";
				}
			break;
		default:
			jobType = "Unknown";
			break;
	};
	
	switch(parseInt(model.status)) {
		case 0:
			statusText = $L("Unknown");
			break;
		case 1:
			statusText = $L("Queued");
			break;
		case 2:
			statusText = $L("Pending");
			break;
		case 3:
			statusText = $L("Starting");
			break;
		case 4:
			statusText = $L("Running");
			break;
		case 5:
			statusText = $L("Stopped");
			break;
		case 6:
			statusText = $L("Paused");
			break;
		case 7:
			statusText = $L("Retry");
			break;
		case 8:
			statusText = $L("Erroring");
			break;
		case 9:
			statusText = $L("Aborting");
			break;
		case 256:
			statusText = $L("Done");
			break;
		case 272:
			statusText = $L("Finished");
			break;
		case 288:
			statusText = $L("Aborted");
			break;
		case 304:
			statusText = $L("Errored");
			break;
		case 320:
			statusText = $L("Cancelled");
			break;
		default:
			statusText = $L("Unknown");
			break;
	};
			
	
	var myDataModel = '<div class="title truncating-text left">'+model.fullTitle+'</div>';
    myDataModel += '<div class="palm-info-text left">'+model.startTime+'</div>';
    myDataModel += '<div class="palm-info-text right italics">'+jobType+' on '+model.hostname;
    myDataModel += '<br />'+statusText+'</div>';
	
	if(model.comments) myDataModel += '<div class="title truncating-text right italics">'+model.comments+'</div>';
	
	if(model.noJobs) {
		model.myJobqueueData = '<div class="title truncating-text left">No recent or queued jobs</div>';
	} else {
		model.myJobqueueData = myDataModel;
	}
	

};
