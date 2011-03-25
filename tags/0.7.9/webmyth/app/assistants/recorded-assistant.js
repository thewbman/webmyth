f/*
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
 
 
 function RecordedAssistant() {
	   
	  this.nullHandleCount = 0;
	 
	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down based on 'recgroupXML'
	  
	  this.groupsList = [];			//List of recGroups
	  this.allGroupsList = [];		//List of recGroups from all recordings
	  
	  this.onWan = true;			//Assume on WAN and not wifi
	  
	  this.subset = [];				//Actually displayed list
	  
}

RecordedAssistant.prototype.setup = function() {

	Mojo.Log.info("RecordedAssistant setup");
	
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
    this.cmdMenuModel = { label: $L('Recorded Menu'),
                            items: [{label: $L('Sort'), submenu:'sort-menu', width: 90},{ icon: 'refresh', command: 'go-refresh' },{label: $L('Group'), submenu:'group-menu', width: 90}]};
 
	this.sortMenuModel = { label: $L('Sort'), items: [
			{"label": $L('Category-Asc'), "command": "go-sort-category-asc"},
			{"label": $L('Category-Desc'), "command": "go-sort-category-desc"},
			{"label": $L('Date-Asc'), "command": "go-sort-date-asc"},
			{"label": $L('Date-Desc'), "command": "go-sort-date-desc"},
			{"label": $L('Title-Asc'), "command": "go-sort-title-asc"},
			{"label": $L('Title-Desc'), "command": "go-sort-title-desc"}
			]};
	this.groupMenuModel = { label: $L('Group'), items: [{"label": WebMyth.prefsCookieObject.currentRecgroup, "command": "go-group"+WebMyth.prefsCookieObject.currentRecgroup }]};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('sort-menu', '', this.sortMenuModel);
	this.controller.setupWidget('group-menu', '', this.groupMenuModel);
	
	
	// 'recorded' widget filter list
	this.recordedListAttribs = {
		itemTemplate: "recorded/recordedListItem",
		listTemplate: "recorded/recordedListTemplate",
		dividerTemplate: "recorded/recordedDivider",
		swipeToDelete: false,
		renderLimit: 10,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.recorderDividerFunction.bind(this),
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.recordedListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "recordedList" , this.recordedListAttribs, this.recordedListModel);
	

	//Event listeners
	//this.controller.listen('recorded-header-menu-button', Mojo.Event.propertyChange, this.recgroupChanged.bindAsEventListener(this));
	this.controller.listen(this.controller.get( "recordedList" ), Mojo.Event.listTap, this.goRecordedDetails.bind(this));
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	//this.controller.listen(this.controller.get( "recordedList" ), Mojo.Event.filter, this.searchFilter.bind(this));
		
		
	//Check we are on WiFi 
	this.controller.serviceRequest('palm://com.palm.connectionmanager', {
			method: 'getstatus',
			parameters: {subscribe: false},
			onSuccess: function(response) {
				
				Mojo.Log.info("Got connection status of %j", response);
				
				
				if(response.wifi.state == "connected") {
					this.onWan = false;
				}
	
			}.bind(this),
			onFailure: function() {}
		}
	);
	
	
	
	this.getRecorded();
	
};

RecordedAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	Mojo.Event.listen(this.controller.stageController.document, "gesturestart", this.gestureStart.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.stageController.document, "gestureend", this.gestureEnd.bindAsEventListener(this));
	
};

RecordedAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	Mojo.Event.stopListening(this.controller.stageController.document, "gesturestart", this.gestureStart.bind(this));
	Mojo.Event.stopListening(this.controller.stageController.document, "gestureend", this.gestureStart.bind(this));
	   
	   
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	   
};

RecordedAssistant.prototype.cleanup = function(event) {
	   
};

RecordedAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.command) {
  	myCommand = event.command.substring(0,7);
	mySelection = event.command.substring(8);
	
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.error("command: "+myCommand+" host: "+mySelection);
	}
	
    switch(myCommand) {
      case 'go-sort':		//sort
		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.error("sorting ..."+mySelection);
		}
		this.controller.sceneScroller.mojo.revealTop();
		this.sortChanged(mySelection);
       break;
      case 'go-grou':		//group
		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.error("group select ... "+mySelection);
		}
		this.controller.sceneScroller.mojo.revealTop();
		this.recgroupChanged(mySelection);
       break;
      case 'go-refr':		//refresh
	  
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').show();
	
		this.getRecorded();
		
       break;
    }
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};

RecordedAssistant.prototype.handleKey = function(event) {

	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("handleKey %o, %o", event.originalEvent.metaKey, event.originalEvent.keyCode);
	}
	
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

RecordedAssistant.prototype.gestureStart = function(event) {
	
	this.gestureStartY = event.centerY;

};

RecordedAssistant.prototype.gestureEnd = function(event) {

	this.gestureEndY = event.centerY;
	this.gestureDistance = this.gestureEndY - this.gestureStartY;
	
	if(this.gestureDistance>0) {
		this.controller.getSceneScroller().mojo.revealTop();
	} else if(this.gestureDistance<0) {
		this.controller.getSceneScroller().mojo.revealBottom();
	}

};



RecordedAssistant.prototype.getRecorded = function() {

		//Update list from XML backend
		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.info('Starting recorded data gathering from XML backend');
		}
		
		this.controller.sceneScroller.mojo.revealTop();
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetRecorded";

		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.info("XML Recorded URL is: "+requestUrl);
			
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
				onSuccess: this.readRecordedXMLSuccess.bind(this),
				onFailure: this.useLocalDataTable.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
	
};

RecordedAssistant.prototype.sortChanged = function(newSort) {
	//Save selection back to cookie
	WebMyth.prefsCookieObject.currentRecSort = newSort;
	
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("The current sorting has changed to "+WebMyth.prefsCookieObject.currentRecSort);
	}
	
	//Sort list by selection
	switch(WebMyth.prefsCookieObject.currentRecSort) {
		case 'title-asc':
			this.fullResultList.sort(double_sort_by('title', 'recStartTs', false));
		  break;
		case 'title-desc':
			this.fullResultList.sort(double_sort_by('title', 'recStartTs', true));
		  break;
		case 'date-asc':
			this.fullResultList.sort(double_sort_by('recStartTs', 'title', false));
		  break;
		case 'date-desc':
			this.fullResultList.sort(double_sort_by('recStartTs', 'title', true));
		  break;
		case 'category-asc':
			this.fullResultList.sort(double_sort_by('category', 'title', false));
		  break;
		case 'category-desc':
			this.fullResultList.sort(double_sort_by('category', 'title', true));
		  break;
		default :
			this.fullResultList.sort(double_sort_by('recStartTs', 'title', false));
		  break;
	}

	
	this.recgroupChanged(WebMyth.prefsCookieObject.currentRecgroup);
	
	this.updateSortMenu();
	
};

RecordedAssistant.prototype.recgroupChanged = function(newRecgroup) {
	
	WebMyth.prefsCookieObject.currentRecgroup = newRecgroup;
	
	this.updateGroupMenu();
	
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("The current recgroup has changed to "+WebMyth.prefsCookieObject.currentRecgroup);
	}
	
	//Update results list from filter
	this.resultList.clear();
	Object.extend(this.resultList, trimByRecgroup(this.fullResultList, WebMyth.prefsCookieObject.currentRecgroup));
	
	var listWidget = this.controller.get('recordedList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	$("scene-title").innerHTML = $L("Recorded Shows")+" ("+this.resultList.length+" items)";
	
	
	//Save selection back to cookie
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
	   
};

RecordedAssistant.prototype.useLocalDataTable = function(event) {
	//Fall back to local data if cannot connect to remote server
	Mojo.Controller.getAppController().showBanner("Failed to get new data, using saved", {source: 'notification'});
	
	Mojo.Log.error("Failed to get Ajax response - using previous saved data");
	
	
	// Query recorded table
	var mytext = 'SELECT * FROM recordedXML ORDER BY startTime;'
	WebMyth.db.transaction( 
		(function (transaction) { 
			transaction.executeSql(mytext, [], 
				this.queryDataHandler.bind(this), 
				this.queryErrorHandler.bind(this)
			); 
		} 
		).bind(this)
	);
							
};

RecordedAssistant.prototype.queryDataHandler = function(transaction, results) { 
    // Handle the results 
    var string = ""; 
	
	Mojo.Log.info("Inside queryDataHandler with '%s' rows", results.rows.length);
	
	
    
	try {
		var list = [];
		for (var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
						
			string = {
				title: row.title, subTitle: row.subTitle, programFlags: row.programFlags, category: row.category, fileSize: row.fileSize, 
				seriesid: row.seriesid, hostname: row.hostname, catType: row.catType, programid: row.programid, repeat: row.repeat,
				endTime: row.endTime, startTime: row.startTime, lastmodified: row.lastmodified, startTimeSpace: row.startTimeSpace,
				endTimeSpace: row.endTimeSpace, startTimeHourMinute: row.startTimeHourMinute, endTimeHourMinute: row.endTimeHourMinute, 
				stars: row.stars, airdate: row.airdate, description: row.description, inputId: row.inputId, chanFilters: row.chanFilters, 
				commFree: row.commFree, channelName: row.channelName, sourceId: row.sourceId, chanId: row.chanId, chanNum: row.chanNum,
				callSign: row.callSign, recPriority: row.recPriority, playGroup: row.playGroup, recStatus: row.recStatus, recStartTs: row.recStartTs,
				recGroup: row.recGroup, dupMethod: row.dupMethod, recType: row.recType, encoderID: row.encoderID, recProfile: row.recProfile,
				recEndTs: row.recEndTs, recordId: row.recordId, dupInType: row.dupInType
			 };
			 
			list.push( string );
			//this.hostListModel.items.push( string );
			if(WebMyth.prefsCookieObject.debug){
				Mojo.Log.info("Just added '%j' to list", string);
			}
		}
		
		//Update the list widget
		this.fullResultList.clear();
		Object.extend(this.fullResultList,list);
		this.fullResultList.sort(double_sort_by('title', 'startTime', false));
		
		this.resultList.clear();
		Object.extend(this.resultList, trimByRecgroup(this.fullResultList, WebMyth.prefsCookieObject.currentRecgroup));
		
		
		//Initial display
		var listWidget = this.controller.get('recordedList');
		this.filterListFunction('', listWidget, 0, this.resultList.length);
		
		//Update the recgroup filter
		var recgroupSql = "SELECT * FROM recgroup ORDER BY groupname;";
		var string = "";
		WebMyth.db.transaction( 
			(function (transaction) {
				transaction.executeSql( recgroupSql,  [], 
					this.updateRecgroupList.bind(this),
					function(transaction, error) {      // error handler
						Mojo.Log.error("Could not get list of recgroup: " + error.message + " ... ");
					}
				);
			}
			).bind(this)
		);
		
		
		Mojo.Log.info("Done with data query");
		
		
		//Stop spinner and hide
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').hide()
	}
	catch (err)
	{
		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.error("Data query failed with " + err.message);	
		}
	} 

	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("Done with data query function");
	}
	
};

RecordedAssistant.prototype.queryErrorHandler = function(transaction, errors) { 
    Mojo.Log.error("Error was "+error.message+" (Code "+error.code+")"); 
};

RecordedAssistant.prototype.finishedReadingRecorded = function(event) {	

	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("Finished getting data, now saving");
	}
	
	this.sortChanged(WebMyth.prefsCookieObject.currentRecSort);
	
	this.updateRecgroupListJSON();
		
		/*
	//Save new values back to DB
 
	//Replace out old data
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql("DELETE FROM 'recordedXML'; ",  [], 
			function(transaction, results) {    // success handler
				Mojo.Log.info("Successfully truncated recorded");
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not truncate recorded because " + error.message);
			}
		);
	});
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql("DELETE FROM 'recgroupXML'; ",  [], 
			function(transaction, results) {    // success handler
				Mojo.Log.info("Successfully truncated recgroup");
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not truncate recgroup because " + error.message);
			}
		);
	});
	
	//Insert new data
	WebMyth.db.transaction( 
		(function (transaction) {
			transaction.executeSql("INSERT INTO 'recgroupXML' (groupname, displayname) VALUES ('AllRecgroupsOn', '"+$L('All')+"');",  [], 
					this.saveResults.bind(this),
					function(transaction, error) {      // error handler
						Mojo.Log.error("Could not insert AllRecgroupsOn because " + error.message);
					}
			);
		}
		).bind(this)
	);
	*/
};

RecordedAssistant.prototype.saveResults = function(transaction, results) {

	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("Saving results back to DB");
	}
	
	for(var i = 0; i < this.fullResultList.length; i++){
		title = this.fullResultList[i].title;
		subTitle = this.fullResultList[i].subTitle;
		insertRecordedRow(this.fullResultList[i]);
		//Mojo.Log.info('Row: ' + i + ' Title: ' + title + ' subTitle: ' + subTitle);	
	}
					
					
	//Update the recgroup filter
	var recgroupSql = "SELECT * FROM recgroupXML ORDER BY groupname;";
	var string = "";
    WebMyth.db.transaction( 
		(function (transaction) {
			transaction.executeSql( recgroupSql,  [], 
				this.updateRecgroupList.bind(this),
				function(transaction, error) {      // error handler
					Mojo.Log.error("Could not get list of recgroupXML: " + error.message + " ... ");
				}
			);
		}
		).bind(this)
	);
	
					
}

RecordedAssistant.prototype.readRemoteScriptSuccess = function(response) {

	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("Successfully gotten data from script %j",response.responseJSON);
	}
	
	//Update the list widget
	this.fullResultList.clear();
	Object.extend(this.fullResultList,response.responseJSON);
	
	this.finishedReadingRecorded();
	
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("After finished reading recorded");
	}
	
};

RecordedAssistant.prototype.readRecordedXMLSuccess = function(response) {
	
	Mojo.Log.info("About to start parsing recorded from XML");
	
	try{
	
		var xmlobject;
		
		if(response.responseXML) {
		
			xmlobject = response.responseXML;
		
			Mojo.Log.info("Using XML recorded response as responseXML");
			
			
		} else {
		
			var xmlstring = response.responseText.trim();
		
			Mojo.Log.info("Got XML recorded responseText from backend: "+xmlstring);
			
			xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
			
		}
			
		
		//Local variables
		var topNode, topNodesCount, topSingleNode, programsNode, programsNode;
		var singleProgramNode, singleProgramJson, singleRecordedGroupJson = {};
		var singleProgramChildNode;
		var protoVer;
		
		
		
		this.fullResultList.clear();
		//this.channelList.clear();
		
		//Start parsing
		topNode = xmlobject.getElementsByTagName("GetRecordedResponse")[0];
		var topNodesCount = topNode.childNodes.length;
		for(var i = 0; i < topNodesCount; i++) {
			topSingleNode = topNode.childNodes[i];
			switch(topSingleNode.nodeName) {
				case 'ProtoVer':
					protoVer = topSingleNode.childNodes[0].nodeValue;
					
					if(WebMyth.prefsCookieObject.protoVer != protoVer) WebMyth.prefsCookieObject.protoVerSumitted = false;
					
					WebMyth.prefsCookieObject.protoVer = protoVer;
					
					break;
				case 'Recorded':
					//Mojo.Log.info('Starting to parse Recorded');
					programsNode = topSingleNode.childNodes[0];
					for(var j = 0; j < programsNode.childNodes.length; j++) {
						programsSingleNode = programsNode.childNodes[j];
						//Mojo.Log.info("Node name is "+programsSingleNode.nodeName);
						if(programsSingleNode.nodeName == 'Program') {
							//Mojo.Log.info('Inside Program if');
							singleProgramNode = programsSingleNode;
							
									singleProgramJson = {
										"title": singleProgramNode.getAttributeNode("title").nodeValue, 
										"subTitle": singleProgramNode.getAttributeNode("subTitle").nodeValue, 
										"programFlags": singleProgramNode.getAttributeNode("programFlags").nodeValue, 
										"category": singleProgramNode.getAttributeNode("category").nodeValue, 
										"fileSize": singleProgramNode.getAttributeNode("fileSize").nodeValue, 
										"seriesId": singleProgramNode.getAttributeNode("seriesId").nodeValue, 
										"hostname": singleProgramNode.getAttributeNode("hostname").nodeValue, 
										"catType": singleProgramNode.getAttributeNode("catType").nodeValue, 
										"programId": singleProgramNode.getAttributeNode("programId").nodeValue, 
										"repeat": singleProgramNode.getAttributeNode("repeat").nodeValue, 
					//					"stars": singleProgramNode.getAttributeNode("stars").nodeValue, 
										"endTime": singleProgramNode.getAttributeNode("endTime").nodeValue, 
					//					"airdate": singleProgramNode.getAttributeNode("airdate").nodeValue, 
										"startTime": singleProgramNode.getAttributeNode("startTime").nodeValue,
										"lastModified": singleProgramNode.getAttributeNode("lastModified").nodeValue, 
										"startTimeSpace": singleProgramNode.getAttributeNode("startTime").nodeValue.replace("T"," "),
										"endTimeSpace": singleProgramNode.getAttributeNode("endTime").nodeValue.replace("T"," "),  
										"startTimeHourMinute": singleProgramNode.getAttributeNode("startTime").nodeValue.substring(11,16),
										"endTimeHourMinute": singleProgramNode.getAttributeNode("endTime").nodeValue.substring(11,16)
									}
									
									try {
										singleProgramJson.stars = singleProgramNode.getAttributeNode("stars").nodeValue;
										singleProgramJson.airdate = singleProgramNode.getAttributeNode("airdate").nodeValue;
									} catch(e) {
										Mojo.Log.info("Error with getting airdate and stars");
										singleProgramJson.stars = "";
										singleProgramJson.airdate = "";
									}
									
									for(var l = 0; l < singleProgramNode.childNodes.length; l++) {
										singleProgramChildNode = singleProgramNode.childNodes[l];
										
										if(l == 0) singleProgramJson.description = singleProgramChildNode.nodeValue;
										
										
										if(singleProgramChildNode.nodeName == "Channel") {
					//						singleProgramJson.inputId = singleProgramChildNode.getAttributeNode("inputId").nodeValue;
					//						singleProgramJson.chanFilters = singleProgramChildNode.getAttributeNode("chanFilters").nodeValue;
					//						singleProgramJson.commFree = singleProgramChildNode.getAttributeNode("commFree").nodeValue;
											singleProgramJson.channelName = singleProgramChildNode.getAttributeNode("channelName").nodeValue;
					//						singleProgramJson.sourceId = singleProgramChildNode.getAttributeNode("sourceId").nodeValue;
											singleProgramJson.chanId = singleProgramChildNode.getAttributeNode("chanId").nodeValue;
											singleProgramJson.chanNum = singleProgramChildNode.getAttributeNode("chanNum").nodeValue;
											singleProgramJson.callSign = singleProgramChildNode.getAttributeNode("callSign").nodeValue;
										} 
										
										if(singleProgramChildNode.nodeName == "Recording") {
					//						singleProgramJson.recPriority = singleProgramChildNode.getAttributeNode("recPriority").nodeValue;
					//						singleProgramJson.playGroup = singleProgramChildNode.getAttributeNode("playGroup").nodeValue;
											singleProgramJson.recStatus = singleProgramChildNode.getAttributeNode("recStatus").nodeValue;
											singleProgramJson.recStartTs = singleProgramChildNode.getAttributeNode("recStartTs").nodeValue;
											singleProgramJson.recStartTsSpace = singleProgramChildNode.getAttributeNode("recStartTs").nodeValue.replace("T"," ");
											singleProgramJson.recGroup = singleProgramChildNode.getAttributeNode("recGroup").nodeValue;
					//						singleProgramJson.dupMethod = singleProgramChildNode.getAttributeNode("dupMethod").nodeValue;
											singleProgramJson.recType = singleProgramChildNode.getAttributeNode("recType").nodeValue;
					//						singleProgramJson.encoderId = singleProgramChildNode.getAttributeNode("encoderId").nodeValue;
					//						singleProgramJson.recProfile = singleProgramChildNode.getAttributeNode("recProfile").nodeValue;
					//						singleProgramJson.recEndTs = singleProgramChildNode.getAttributeNode("recEndTs").nodeValue;
											singleProgramJson.recordId = singleProgramChildNode.getAttributeNode("recordId").nodeValue;
					//						singleProgramJson.dupInType = singleProgramChildNode.getAttributeNode("dupInType").nodeValue;
					
											singleRecordedGroupJson = {
												"label": singleProgramChildNode.getAttributeNode("recGroup").nodeValue,
												"recgroup": singleProgramChildNode.getAttributeNode("recGroup").nodeValue,
												"command": "go-group"+singleProgramChildNode.getAttributeNode("recGroup").nodeValue
											};
											
										}
										
									}
									
									this.fullResultList.push(singleProgramJson);
									this.allGroupsList.push(singleRecordedGroupJson);
									//Mojo.Log.info("Program json is %j", singleProgramJson);
								
							
						}
					}
					
					Mojo.Log.info('Done parsing Recorded');
					Mojo.Log.info("Recorded full json is %j", this.fullResultList);
		
					
					break;
				default:
					Mojo.Log.info("node name is "+topSingleNode.nodeName);
					break;
			}
		}
	
	} catch(e) {
	
		Mojo.Log.error(e);
	
	}
	
	Mojo.Log.info("Exited XML parsing");
	
	this.finishedReadingRecorded();

};

function insertRecordedRow(newline){

	//added channel fields are not working for some reason

	//var recorded_sql = "INSERT INTO 'recordedXML' (title, subTitle, programFlags, category, fileSize, seriesid, hostname, catType, programid, repeat, endTime, startTime, lastmodified, startTimeSpace, endTimeSpace, startTimeHourMinute, endTimeHourMinute, stars, airdate, description, inputId, chanFilters, commFree, channelName, sourceId, chanId, chanNum, callSign, recPriority, playGroup, recStatus, recStartTs, recGroup, dupMethod, recType, encoderID, recProfile, recEndTs, recordId, dupInType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
	var recgroup_sql = "REPLACE INTO 'recgroupXML' (groupname, displayname) VALUES (?, ?);";
	
	var linerecgroup = newline.recGroup;
	
	/*
	//Insert individual recording into WebMyth.db
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql(recorded_sql,  [newline.title, newline.subTitle, newline.programFlags, newline.category, newline.fileSize, 
												newline.seriesid, newline.hostname, newline.catType, newline.programid, newline.repeat,
												newline.endTime, newline.startTime, newline.lastmodified, newline.startTimeSpace,
												newline.endTimeSpace, newline.startTimeHourMinute, newline.endTimeHourMinute, 
												newline.stars, newline.airdate, newline.description, newline.inputId, newline.chanFilters, 
												newline.commFree, newline.channelName, newline.sourceId, newline.chanId, newline.chanNum,
												newline.callSign, newline.recPriority, newline.playGroup, newline.recStatus, newline.recStartTs,
												newline.recGroup, newline.dupMethod, newline.recType, newline.encoderID, newline.recProfile,
												newline.recEndTs, newline.recordId, newline.dupInType
											], 
			function(transaction, results) {    // success handler
				Mojo.Log.info('Entered Row - Title: ' + newline.title + ' subTitle: ' + newline.subTitle);
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not insert in recorded: " + error.message);
			}
		);	
	});
	*/
	
	//Update recgroups table
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql(recgroup_sql,  [newline.recGroup, linerecgroup], 
			function(transaction, results) {    // success handler
				Mojo.Log.info('Entered new recgroup: ' + newline.recgroup);
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not insert in recgroup: " + error.message + " ... ");
			}
		);
	});
	
	
	
};

RecordedAssistant.prototype.goRecordedDetails = function(event) {
	var recorded_chanid = event.item.chanId;
	var recorded_startTime = event.item.startTime;
	var recorded_recStartTs = event.item.recStartTs;
	
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("Selected individual recording: '%s' + '%s'", recorded_chanid, recorded_recStartTs);
	}
	
	//detailsObject = trimByChanidRecstartts(this.fullResultList, recorded_chanid, recorded_recStartTs)

	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("Selected object is: '%j'", event.item);
	}
	
	//Open recordedDetails communication scene
	Mojo.Controller.stageController.pushScene("recordedDetails", event.item);
	

};

RecordedAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function

	var totalSubsetSize = 0;
 
	var i, s;
	var someList = [];  // someList will be the subset of this.myListData that contains the filterString...
 
	if (filterString !== '') {
 
		var len = this.resultList.length;
 
 
		//find the items that include the filterstring 
		for (i = 0; i < len; i++) {
			s = this.resultList[i];
			if (s.title.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
				//Mojo.Log.info("Found string in title", i);
				someList.push(s);
			}
			else if (s.subTitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subTitle", i);
				someList.push(s);
			}
			else if (s.category.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subTitle", i);
				someList.push(s);
			}
			else if (s.channelName.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subTitle", i);
				someList.push(s);
			}
		}
	}
	else {

		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.info("No filter string - length of "+this.resultList.length);
		}
		
		var len = this.resultList.length;
 
		for (i = 0; i < len; i++) {
			s = this.resultList[i];
			someList.push(s);
		}
	}
 
	// pare down list results to the part requested by widget (starting at offset & thru count)
	var cursor = 0;
	this.subset.clear();
	var totalSubsetSize = 0;
	while (true) {
		if (cursor >= someList.length) {
			break;
		}
		if (this.subset.length < count && totalSubsetSize >= offset) {
			this.subset.push(someList[cursor]);
		}
		totalSubsetSize ++;
		cursor ++;
	}
 
	// use noticeUpdatedItems to update the list
	// then update the list length 
	// and the FilterList widget's FilterField count (displayed in the upper right corner)
	
	Mojo.Log.info("done filtering down list - now displaying");
	
	
	listWidget.mojo.noticeUpdatedItems(offset, this.subset);
	listWidget.mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
	
	Mojo.Log.info("Done displaying");
	
	
	//this.addImages();

};	

RecordedAssistant.prototype.recorderDividerFunction = function(itemModel) {
	 
	//Divider function for list
	var divider = itemModel.title;				//as default
	var date = new Date(isoSpaceToJS(itemModel.startTime));
	
	switch(WebMyth.prefsCookieObject.currentRecSort) {
      case 'date-asc':
		//divider = itemModel.startTime.substring(0,10);
		divider = date.toLocaleString().substring(0,15);
       break;
	  case 'date-desc':
		//divider = itemModel.startTime.substring(0,10);
		divider = date.toLocaleString().substring(0,15);
       break;
	  case 'title-asc':
		divider = itemModel.title;
       break;
	  case 'title-desc':
		divider = itemModel.title;
       break;
	  case 'category-asc':
		divider = itemModel.category;
       break;
	  case 'category-desc':
		divider = itemModel.category;
       break;
	}

	 
	return divider;
	
};

RecordedAssistant.prototype.searchFilter = function(event)    { 
	//Shows or hides default list
    if (event.filterString !== "")    { 
		//Showing filtered list is handled elsewhere
    }    else    { 
		//Shows default list with no searching
		var listWidget = this.controller.get('recordedList');
		this.filterListFunction('', listWidget, 0, this.resultList.length);
    } 
};

RecordedAssistant.prototype.updateRecgroupList = function(transaction, results)  { 
	
	//Mojo.Log.info('Updating RecgroupList with %j', results.rows);
	
	var updatedList = [];
	var string = "";
	
	for (var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		string = { label:row.displayname, "command": "go-group"+row.groupname };
		updatedList.push( string );
		//Mojo.Log.info("Just added '%j' to list", string);
	};
						
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("New recgroup list is '%j' with length %s", updatedList, updatedList.length);
	}
	
	if (updatedList.length == 0) {
		updatedList = [ {'label':$L('Default'), 'value':'Default' } ];
		//Mojo.Log.info("Updated initial recgroup list is '%j' ", updatedList);
		WebMyth.prefsCookieObject.currentRecgroup = 'Default';
	} else {
		if(WebMyth.prefsCookieObject.debug){
			Mojo.Log.info("New recgroup list is still '%j' ", updatedList);
		}
	}
				
				
	//this.recgroupFilterAttr.choices.clear();
	//Object.extend(this.recgroupFilterAttr.choices, updatedList);
	//this.controller.modelChanged(this.recgroupFilterAttr);
	//this.controller.modelChanged(this.selectorsModel);
	
	
	this.groupMenuModel.items = updatedList;
	this.controller.modelChanged(this.groupMenuModel);
	
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()

	
};

RecordedAssistant.prototype.updateRecgroupListJSON = function()  { 
	
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info('Starting to update RecgroupList');
	}
	
	this.groupsList.clear();
	this.groupsList = cleanRecordedGroup(this.allGroupsList);
					
	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.info("Cleaned groupsList is %j",this.groupsList);
	}
	
	this.updateGroupMenu();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()
	
};

RecordedAssistant.prototype.setMyData = function(propertyValue, model)  { 

	if(((this.onWan == true)&&(WebMyth.prefsCookieObject.usePlugin < 2))||(WebMyth.prefsCookieObject.forceScriptScreenshots)) {
		var screenshotUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile+"?op=getPremadeImage&chanid=";
		screenshotUrl += model.chanId + "&starttime=" + model.recStartTsSpace;
		
	} else {
		var screenshotUrl = "http://"+getBackendIP(WebMyth.backendsCookieObject,model.hostname,WebMyth.prefsCookieObject.masterBackendIp)+":6544/Myth/GetPreviewImage?ChanId=";
		screenshotUrl += model.chanId + "&StartTime=" + model.recStartTsSpace;
	}
	
	if(WebMyth.prefsCookieObject.debug){
		//Mojo.Log.info("Screenshot URL is "+screenshotUrl);
	}
	
	var recordedDetailsText = '<div class="recorded-list-item '+model.recGroup+'">';
	recordedDetailsText += '<div class="title truncating-text left recorded-list-title">&nbsp;'+model.title+'</div>';
	recordedDetailsText += '<div class="palm-row-wrapper">';
	
	recordedDetailsText += '<div class="left-list-image"><div class="left-list-image-wrapper">';
	recordedDetailsText += '<img id="img-'+model.chanid+'T'+model.startTime+'" class="recorded-screenshot-small" src="'+screenshotUrl+'" />';
	recordedDetailsText += '</div></div>';
	
	
	recordedDetailsText += '<div class="right-list-text">';
	recordedDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subTitle+'&nbsp;</div>';
	recordedDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.startTimeSpace+'&nbsp;</div>';
	recordedDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.category+'</div>';
	
	if(model.recStatus == -2){
		recordedDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+$L('Currently Recording')+'</div>';
	} else {
		recordedDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.chanNum+" - "+model.channelName+'</div>';
	}
	
	recordedDetailsText += '</div>';
	
	recordedDetailsText += '</div></div>';
		
	model.myData = recordedDetailsText;
	
};

RecordedAssistant.prototype.updateSortMenu = function() {
	
	//Reset default sorting
	this.sortMenuModel.items = [ 
			{"label": $L("Category-Asc"), "command": "go-sort-category-asc"},
			{"label": $L("Category-Desc"), "command": "go-sort-category-desc"},
			{"label": $L("Date-Asc"), "command": "go-sort-date-asc"},
			{"label": $L("Date-Desc"), "command": "go-sort-date-desc"},
			{"label": $L("Title-Asc"), "command": "go-sort-title-asc"},
			{"label": $L("Title-Desc"), "command": "go-sort-title-desc"}
	] ;
	
	switch(WebMyth.prefsCookieObject.currentRecSort) {
		case 'category-asc':
			this.sortMenuModel.items[0].label = '- '+this.sortMenuModel.items[0].label+' -';
		  break;
		case 'category-desc':
			this.sortMenuModel.items[1].label = '- '+this.sortMenuModel.items[1].label+' -';
		  break;
		case 'date-asc':
			this.sortMenuModel.items[2].label = '- '+this.sortMenuModel.items[2].label+' -';
		  break;
		case 'date-desc':
			this.sortMenuModel.items[3].label = '- '+this.sortMenuModel.items[3].label+' -';
		  break;
		case 'title-asc':
			this.sortMenuModel.items[4].label = '- '+this.sortMenuModel.items[4].label+' -';
		  break;
		case 'title-desc':
			this.sortMenuModel.items[5].label = '- '+this.sortMenuModel.items[5].label+' -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.sortMenuModel);
  
};

RecordedAssistant.prototype.updateGroupMenu = function() {
	
	this.groupMenuModel.items = [];
	
	var s = {};
	
	for(var i = 0; i < this.groupsList.length; i++) {
		s = {};
		s = this.groupsList[i];
		
		if(s.recgroup == WebMyth.prefsCookieObject.currentRecgroup) {
			s.label = '- '+s.recgroup+' -';
		} else if (( s.recgroup == $L('All') )&&( WebMyth.prefsCookieObject.currentRecgroup == "AllRecgroupsOn" )) {
			s.label = '- '+s.recgroup+' -';
		} else {
			s.label = s.recgroup;
		}
		
		this.groupMenuModel.items.push(s);
	}
	
	
	this.controller.modelChanged(this.groupMenuModel);
  
};