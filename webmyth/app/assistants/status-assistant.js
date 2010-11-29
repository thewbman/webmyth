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
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.encodersList = [];
	   this.scheduledList = [];
	   this.jobqueueList = [{"id":"-1", "noJobs":"true"}];
	   this.storageList = [];
	   
}

StatusAssistant.prototype.setup = function() {

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
	
	this.getStatus();
	
};

StatusAssistant.prototype.activate = function(event) {
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
};

StatusAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
};

StatusAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
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



StatusAssistant.prototype.getStatus = function() {
	
	//Getting settings information
	//Mojo.Log.info("Got master backend IP from settings: "+WebMyth.prefsCookieObject.masterBackendIp);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/xml";
	
	//Mojo.Log.info("Status request URL is "+requestUrl);
	
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

StatusAssistant.prototype.toggleGeneralDrawer = function() {
	this.generalStatusDrawer.mojo.setOpenState(!this.generalStatusDrawer.mojo.getOpenState());
	
	//Mojo.Log.error("toggling general drawer");

	if (this.generalStatusDrawer.mojo.getOpenState() == true){
		this.controller.get("generalStatusArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("generalStatusArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleEncodersDrawer = function() {
	this.encodersDrawer.mojo.setOpenState(!this.encodersDrawer.mojo.getOpenState());
	
	//Mojo.Log.error("toggling encoders drawer");

	if (this.encodersDrawer.mojo.getOpenState() == true){
		this.controller.get("encodersArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("encodersArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleScheduledDrawer = function() {
	this.scheduledDrawer.mojo.setOpenState(!this.scheduledDrawer.mojo.getOpenState());
	
	//Mojo.Log.error("toggling scheduled drawer");

	if (this.scheduledDrawer.mojo.getOpenState() == true){
		this.controller.get("scheduledArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("scheduledArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleJobqueueDrawer = function() {
	this.jobqueueDrawer.mojo.setOpenState(!this.jobqueueDrawer.mojo.getOpenState());
	
	//Mojo.Log.error("toggling jobqueue drawer");

	if (this.jobqueueDrawer.mojo.getOpenState() == true){
		this.controller.get("jobqueueArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("jobqueueArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleStorageDrawer = function() {
	this.storageDrawer.mojo.setOpenState(!this.storageDrawer.mojo.getOpenState());
	
	//Mojo.Log.error("toggling storage drawer");

	if (this.storageDrawer.mojo.getOpenState() == true){
		this.controller.get("storageArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("storageArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

StatusAssistant.prototype.toggleGuideDrawer = function() {
	this.guideDrawer.mojo.setOpenState(!this.guideDrawer.mojo.getOpenState());
	
	//Mojo.Log.error("toggling guide drawer");

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
	
	var xmlstring = response.responseText.trim();
	//Mojo.Log.info("Got XML status response from backend: "+xmlstring);
	
	var singleEncoderNode, singleEncoderChildNode, singleEncoderJson;
	var singleScheduledNode, singleScheduledRecordingNode, singleScheduleJson;
	var singleJobqueueNode, singleJobqueueProgramNode, singleJobqueueJson;
	var hasJobs = false, tempJobsList = [];
	var singleStorageNode, singleStorageJson;
	
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	
	
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
									"connected" : singleEncoderNode.getAttributeNode("connected").nodeValue
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
									"recStartTs" : singleScheduledRecordingNode.getAttributeNode("recStartTs").nodeValue.replace("T"," ")
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
									"free" : Mojo.Format.formatNumber(parseInt(singleStorageNode.getAttributeNode("free").nodeValue)),
									"total" : Mojo.Format.formatNumber(parseInt(singleStorageNode.getAttributeNode("total").nodeValue)),
									"used" : Mojo.Format.formatNumber(parseInt(singleStorageNode.getAttributeNode("used").nodeValue))
								};
			//Mojo.Log.info("Added storage group %j to list", singleStorageJson);
			this.storageList.push(singleStorageJson);
		}
	} 
	//Mojo.Log.info("Full storagelist is %j", this.storageList);
	this.controller.modelChanged(this.storageListModel);
	
	
	//Guide
	var guideNode=xmlobject.getElementsByTagName("Guide")[0];
	
	var guideContent = '<div class="palm-row first">';
	guideContent += '	<div class="palm-row-wrapper">';
    guideContent += '        <div class="label" id="guideStart-label">last run</div>';
	guideContent += '		<div class="title" id="guideStart-title">'+guideNode.getAttributeNode("start").nodeValue.replace("T", " ")+'</div>';
	guideContent += '	</div>';
    guideContent += '</div>';
	guideContent += '<div class="palm-row">';
	guideContent += '	<div class="palm-row-wrapper">';
    guideContent += '        <div class="label" id="guideStatus-label">Last status</div>';
	guideContent += '		<div class="title" id="guideStatus-title">'+guideNode.getAttributeNode("status").nodeValue+'</div>';
	guideContent += '	</div>';
    guideContent += '</div>';
	guideContent += '<div class="palm-row">';
	guideContent += '	<div class="palm-row-wrapper">';
    guideContent += '        <div class="label" id="guideThru-label">data until</div>';
	guideContent += '		<div class="title" id="guideThru-title">'+guideNode.getAttributeNode("guideThru").nodeValue.replace("T", " ")+'</div>';
	guideContent += '	</div>';
    guideContent += '</div>';
	guideContent += '<div class="palm-row">';
	guideContent += '	<div class="palm-row-wrapper">';
    guideContent += '        <div class="label" id="guideDays-label">Days</div>';
	guideContent += '		<div class="title" id="guideDays-title">'+guideNode.getAttributeNode("guideDays").nodeValue+'</div>';
	guideContent += '	</div>';
    guideContent += '</div>';
	guideContent += '<div class="palm-row">';
	guideContent += '	<div class="palm-row-wrapper">';
    guideContent += '        <div class="label" id="guideNext-label">Next run</div>';
	guideContent += '		<div class="title" id="guideNext-title">'+guideNode.getAttributeNode("next").nodeValue.replace("T", " ")+'</div>';
	guideContent += '	</div>';
    guideContent += '</div>	';
	guideContent += '<div class="palm-row last">';
	guideContent += '	<div class="palm-row-wrapper">';
    guideContent += '        <div class="label" id="guideComments-label">Comments</div>';
	guideContent += '		<div class="title" id="guideComments-title">'+guideNode.childNodes[0].nodeValue+'</div>';
	guideContent += '	</div>';
    guideContent += '</div>';
	
	$('guideContent').innerHTML = guideContent;
	
	
	//General drawer
	var statusNode=xmlobject.getElementsByTagName("Status")[0];
	var loadNode=xmlobject.getElementsByTagName("Load")[0];
	
	var generalStatusContent = '<div class="palm-row first">';
	generalStatusContent +=	'	<div class="palm-row-wrapper">';
    generalStatusContent +=	'		<div class="label" id="masterBackendIP-label">Master Backend</div>';
	generalStatusContent +=	'		<div class="title" id="masterBackendIP-title">'+WebMyth.prefsCookieObject.masterBackendIp+'</div>';
	generalStatusContent +=	'	</div>';
    generalStatusContent +=	'</div>';
	generalStatusContent +=	'<div class="palm-row">';
	generalStatusContent +=	'	<div class="palm-row-wrapper">';
    generalStatusContent +=	'        <div class="label" id="version-label">Status Version</div>';
	generalStatusContent +=	'		<div class="title" id="version-title">'+statusNode.getAttributeNode("version").nodeValue+'</div>';
	generalStatusContent +=	'	</div>';
    generalStatusContent +=	'</div>';
	generalStatusContent +=	'<div class="palm-row">';
	generalStatusContent +=	'	<div class="palm-row-wrapper">';
    generalStatusContent +=	'        <div class="label" id="currentdate-label">Current Date</div>';
	generalStatusContent +=	'		<div class="title" id="currentdate-title">'+statusNode.getAttributeNode("date").nodeValue+'</div>';
	generalStatusContent +=	'	</div>';
    generalStatusContent +=	'</div>';
	generalStatusContent +=	'<div class="palm-row">';
	generalStatusContent +=	'	<div class="palm-row-wrapper">';
    generalStatusContent +=	'        <div class="label" id="currenttime-label">Current Time</div>';
	generalStatusContent +=	'		<div class="title" id="currenttime-title">'+statusNode.getAttributeNode("time").nodeValue+'</div>';
	generalStatusContent +=	'	</div>';
    generalStatusContent +=	'</div>';
	generalStatusContent +=	'<div class="palm-row last">';
	generalStatusContent +=	'	<div class="palm-row-wrapper">';
    generalStatusContent +=	'        <div class="label" id="avg3-label">Load Avg</div>';
	generalStatusContent +=	'		<div class="title" id="all-avgs-title">';
	generalStatusContent += loadNode.getAttributeNode("avg1").nodeValue+", "+loadNode.getAttributeNode("avg2").nodeValue+", "+loadNode.getAttributeNode("avg3").nodeValue;
	generalStatusContent += '</div>';
	generalStatusContent +=	'	</div>';
	generalStatusContent +=	' </div>';
	
	$('generalStatusContent').innerHTML = generalStatusContent;
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()	
	
};


StatusAssistant.prototype.setJobqueueData = function(propertyValue, model)  { 
	
	var jobType, statusText;
	
	switch(parseInt(model.type)) {
		case 0:
			jobType = "System Job";
			break;
		case 1:
			jobType = "Transcode";
			break;
		case 2:
			jobType = "Commercial Flagging";
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
			statusText = "Unknown";
			break;
		case 1:
			statusText = "Queued";
			break;
		case 2:
			statusText = "Pending";
			break;
		case 3:
			statusText = "Starting";
			break;
		case 4:
			statusText = "Running";
			break;
		case 5:
			statusText = "Stopped";
			break;
		case 6:
			statusText = "Paused";
			break;
		case 7:
			statusText = "Retry";
			break;
		case 8:
			statusText = "Erroring";
			break;
		case 9:
			statusText = "Aborting";
			break;
		case 256:
			statusText = "Done";
			break;
		case 272:
			statusText = "Finished";
			break;
		case 288:
			statusText = "Aborted";
			break;
		case 304:
			statusText = "Errored";
			break;
		case 320:
			statusText = "Cancelled";
			break;
		default:
			jobType = "Unknown";
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


StatusAssistant.prototype.setEncodersData = function(propertyValue, model)  { 
	
	var state;
	
	switch(parseInt(model.state)) {
		case -1:
			state = "Disconnected";
			break;
		case 0:
			state = "Idle";
			break;
		case 1:
			state = "Watching Live TV";
			break;
		case 2:
			state = "Unknown Status 2";
			break;
		case 3:
			state = "Unknown Status 3";
			break;
		case 4:
			state = "Unknown Status 4";
			break;
		case 5:
			state = "Unknown Status 5";
			break;
		case 6:
			state = "Recording";
			break;
		default:
			state = "Unknown";
			break;
	};
	
			
	
	var myDataModel = '<div class="palm-row-wrapper">';
	//myDataModel += '<div class="title"> ';
    myDataModel += '<div class="title">Encoder #'+model.id+' on '+model.hostname+' is '+state+'</div>';
    //myDataModel += '</div>';
	
	if(model.title) {
		myDataModel += '<div class="palm-info-text">'+model.title+': '+model.subTitle+'<br />';
		myDataModel += 'Program finishes at '+model.endTime+'</div>';
	}
	
	myDataModel += '</div>';
	
	model.myEncodersData = myDataModel;
	

};

