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
 
 
function LogAssistant() {

	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down list

}

LogAssistant.prototype.setup = function() {

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
    this.cmdMenuModel = { label: $L('Log Menu'),
                            items: [{},{},{ icon: 'refresh', command: 'go-refresh' },{},{label: $L('Group'), submenu:'group-menu', width: 90}]};
 
	this.sortMenuModel = { label: $L('Sort'), items: []};
	
	this.groupMenuModel = { label: $L('Group'), items: [
		{"label": "All", "command": "go-groupall" }
	]};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('sort-menu', '', this.sortMenuModel);
	this.controller.setupWidget('group-menu', '', this.groupMenuModel);

	
	
	// Log filter list
	this.logListAttribs = {
		itemTemplate: "log/logListItem",
		dividerTemplate: "dialogs/listDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.logDividerFunction.bind(this)	
	};
    this.logListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "logList" , this.logListAttribs, this.logListModel);
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	if(WebMyth.usePlugin){
		$('webmyth_service_id').mysqlLogResponse = this.mysqlLogResponse.bind(this);
	}
	
	//List of log
	this.getLog();
	
};

LogAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));

};

LogAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);

};

LogAssistant.prototype.cleanup = function(event) {

};

LogAssistant.prototype.handleCommand = function(event) {

	 if(event.type == Mojo.Event.command) {
		myCommand = event.command.substring(0,7);
		mySelection = event.command.substring(8);
		//Mojo.Log.error("command: "+myCommand+" host: "+mySelection);

		switch(myCommand) {
		  case 'go-sort':		//sort
			//Mojo.Log.error("sorting ..."+mySelection);
			//Mojo.Controller.getAppController().showBanner("Sorting not yet working", {source: 'notification'});
			this.controller.sceneScroller.mojo.revealTop();
			this.sortChanged(mySelection);
		   break;
		  case 'go-grou':		//group
			//Mojo.Log.error("group select ... "+mySelection);
			this.controller.sceneScroller.mojo.revealTop();
			this.logGroupChanged(mySelection);
		   break;
		  case 'go-refr':		//refresh
		  
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show();
		
			this.getLog();
			
		   break;
		}
	  } else if(event.type == Mojo.Event.forward) {
		
			Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	  }
  
};

LogAssistant.prototype.handleKey = function(event) {

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





LogAssistant.prototype.getLog = function(event) {

	//Update list from webmyth python script
	Mojo.Log.info("Starting log data gathering");
	
	this.controller.sceneScroller.mojo.revealTop();
	
	
	//Start spinner and show
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show();
	
	
	
	
	var query = "SELECT * "; 
	query += " FROM mythlog ";
	
	if(WebMyth.prefsCookieObject.currentLogGroup != 'all') {
		query += " WHERE `module` = '"+WebMyth.prefsCookieObject.currentLogGroup+"' ";
	}
	
	query += " ORDER BY `logid` DESC ";
	query += " LIMIT 100 ";
	
	Mojo.Log.info("Log SQL query is "+query);
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlLogResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		//Mojo.Log.error("Log plugin response "+response1);
		
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
				onSuccess: this.readRemoteLogSuccess.bind(this),
				onFailure: this.readRemoteLogFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}
	
};

LogAssistant.prototype.readRemoteLogFail = function(event) {

	Mojo.Log.error("Failed to get log response");
	
	this.resultList = [{ 'title':'Accesing remote table has failed.', 'subtitle':'Please check your server script.', 'starttime':''}];
	
	//Initial display
	var listWidget = this.controller.get('logList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();
	
};

LogAssistant.prototype.readRemoteLogSuccess = function(response) {
	
	Mojo.Log.info('Got Log response: %j',response.responseJSON);
	
		
	//Update the list widget
	this.fullResultList.clear();
	Object.extend(this.fullResultList,response.responseJSON);

	
	this.finishedReadingLog();
	
};

LogAssistant.prototype.mysqlLogResponse = function(response) {

	try{
	
		Mojo.Log.info("Got log plugin response: "+response);
		
		var logJson = JSON.parse(response);
		
		Mojo.Log.info("Plugin log JSON %j",logJson);
		
			
		//Update the list widget
		this.fullResultList.clear();
		Object.extend(this.fullResultList,logJson);
		
	} catch(e){
		Mojo.Log.error(e);
	}
	
	this.finishedReadingLog();
	
};

LogAssistant.prototype.finishedReadingLog = function() {

	Mojo.Log.info("Doing finishedReadingLog");

	this.updateGroupMenu();
	
	
	Object.extend(this.resultList,this.fullResultList);
	
	$("scene-title").innerHTML = $L("Log")+" ("+this.resultList.length+" "+$L("items")+")";
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//Initial display
	var listWidget = this.controller.get('logList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	//Mojo.Controller.getAppController().showBanner("Updated with latest data", {source: 'notification'});
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();
	
};

LogAssistant.prototype.logGroupChanged = function(newGroup) {

	//May add filtering of results later
	Mojo.Log.info("new grouping is "+newGroup);
	
	WebMyth.prefsCookieObject.currentLogGroup = newGroup;
	
	
	this.getLog();

};

LogAssistant.prototype.updateGroupMenu = function() {
	
	//Reset default sorting
	this.groupMenuModel.items = [ 
		{"label": $L("All"), "command": "go-groupall" },
		{"label": $L("Autoexpire"), "command": "go-groupautoexpire" },
		{"label": $L("Commflag"), "command": "go-groupcommflag" },
		{"label": $L("Jobqueue"), "command": "go-groupjobqueue" },
		{"label": $L("Mythbackend"), "command": "go-groupmythbackend" },
		{"label": $L("Mythfilldatabase"), "command": "go-groupmythfilldatabase" },
		{"label": $L("Scheduler"), "command": "go-groupscheduler" }
	] ;
	
	switch(WebMyth.prefsCookieObject.currentLogGroup) {
		case 'all':
			this.groupMenuModel.items[0].label = '- '+this.groupMenuModel.items[0].label+' -';
		  break;
		case 'autoexpire':
			this.groupMenuModel.items[1].label = '- '+this.groupMenuModel.items[1].label+' -';
		  break;
		case 'commflag':
			this.groupMenuModel.items[2].label = '- '+this.groupMenuModel.items[2].label+' -';
		  break;
		case 'jobqueue':
			this.groupMenuModel.items[3].label = '- '+this.groupMenuModel.items[3].label+' -';
		  break;
		case 'mythbackend':
			this.groupMenuModel.items[4].label = '- '+this.groupMenuModel.items[4].label+' -';
		  break;
		case 'mythfilldatabase':
			this.groupMenuModel.items[5].label = '- '+this.groupMenuModel.items[5].label+' -';
		  break;
		case 'scheduler':
			this.groupMenuModel.items[6].label = '- '+this.groupMenuModel.items[6].label+' -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.groupMenuModel);
	
};

LogAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	//Mojo.Log.info("Started filtering with '%s'",filterString);
	
	var totalSubsetSize = 0;
 
	var i, s;
	var someList = [];  // someList will be the subset of this.myListData that contains the filterString...
 
	if (filterString !== '') {
 
		var len = this.resultList.length;
 
		//find the items that include the filterstring 
		for (i = 0; i < len; i++) {
			s = this.resultList[i];
			if (s.module.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
				someList.push(s);
			}	
			else if (s.host.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				someList.push(s);
			}	
			else if (s.message.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				someList.push(s);
			}	
			else if (s.details.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				someList.push(s);
			}
		}
	}
	else {

		Mojo.Log.info("No filter string");

		var len = this.resultList.length;
 
		for (i = 0; i < len; i++) {
			s = this.resultList[i];
			someList.push(s);
		}
	}
 
	// pare down list results to the part requested by widget (starting at offset & thru count)
	
	//Mojo.Log.info("paring down '%j'",someList);
	
	var cursor = 0;
	var subset = [];
	var totalSubsetSize = 0;
	while (true) {
		if (cursor >= someList.length) {
			break;
		}
		if (subset.length < count && totalSubsetSize >= offset) {
			subset.push(someList[cursor]);
		}
		totalSubsetSize ++;
		cursor ++;
	}
 
	// use noticeUpdatedItems to update the list
	// then update the list length 
	// and the FilterList widget's FilterField count (displayed in the upper right corner)
	
	//Mojo.Log.info("subset is %j",subset);
	
	listWidget.mojo.noticeUpdatedItems(offset, subset);
	listWidget.mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
	
};	

LogAssistant.prototype.logDividerFunction = function(itemModel) {
	 
	//Divider function for list
    //return itemModel.title.toString()[0];	
	//return itemModel.starttime.substring(0,10);
	//var date = new Date(isoToJS(itemModel.starttime));
	
	var dividerData = $L(itemModel.module);
	
	
	return dividerData;
	
};


