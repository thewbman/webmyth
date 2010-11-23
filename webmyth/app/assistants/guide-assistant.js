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

 
function GuideAssistant(starttime_in) {

	this.layoutStyle = "time";
	this.channid, this.chanNum;
	this.timeObject, this.timeISO;
	this.timeJS = new Date();
	this.day, this.dayRange;
	this.index = 10000;
	
	this.currentTimeObject = {};
	this.currentDayRange = {};
	
	this.newStartTime = "";
	
	this.resultList = [];			//Results from XML
	this.channelList = [];			//List of channels
	this.subset = [];				//Actually displayed list

	if(starttime_in) {
		this.newStartTime = starttime_in;
	}
	
}

GuideAssistant.prototype.setup = function() {

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
	
	
	//Setup view menu
	this.guideViewMenuAttr = { spacerHeight: 0, menuClass: 'no-fade' };	
	this.guideViewMenuModel = {
		visible: true,
		items: [{
			items: [
				{},
				{ label: "Now Airing", width: 260, command: 'do-revealTop' },
				{ icon: 'forward', command: 'do-guideNext' }
			]
		}]
	}; 
	this.controller.setupWidget( Mojo.Menu.viewMenu, this.guideViewMenuAttr, this.guideViewMenuModel );
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Guide Menu'), items: [
        //{ toggleCmd: 'do-now', items: [{label: $L('Now'), command:'do-now'},{label: $L('Time'), command:'do-selectTime'},{label: $L('Channel'), command: 'do-selectChannel', submenu:'channel-menu'}]},
		{ label: 'Sort', submenu: 'sort-menu', width: 90 },
		{ icon: 'refresh', command: 'do-refresh' },
		{ label: 'View', submenu: 'view-menu', width: 90 }]
	};
	
	//this.channelMenuModel = { label: $L('Channel'), items: [] };
	this.viewMenuModel = { label: $L('View'), items: [ 
		{label: 'Now', command: 'do-now'},
		{label: 'Channel', command: 'do-selectChannel'} ,
		{label: 'Time', command: 'do-selectTime'} 
	] };
	
	this.sortMenuModel = { label: $L('Sort'), items: [ 
		{label: 'Default', command: 'do-sortDefault'},
		{label: 'Category', command: 'do-sortCategory'} ,
		{label: 'Recent Channels', command: 'do-sortRecent'} ,
		{label: 'Record Status', command: 'do-sortStatus'} ,
		{label: 'Title', command: 'do-sortTitle'}
	] };
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	//this.controller.setupWidget('channel-menu', '', this.channelMenuModel);
	this.controller.setupWidget('sort-menu', '', this.sortMenuModel);
	this.controller.setupWidget('view-menu', '', this.viewMenuModel);
	
	//Guide settings cookie
	if (WebMyth.guideCookieObject) {		//cookie exists
		
		//Setup default settings if missing due to old cookie versions
		if (WebMyth.guideCookieObject.manualSort == null) WebMyth.guideCookieObject.manualSort = false;
		this.updateSortMenu();
		
	} else {
		WebMyth.guideCookieObject = { "manualSort": false, "manualSortType" : '' };
		WebMyth.guideCookie.put(WebMyth.guideCookieObject);
		this.updateSortMenu();
	}
	
	
	// Guide filter list
	this.guideListAttribs = {
		itemTemplate: "guide/guideListItem",
		//listTemplate: "guide/guideListTemplate",
		dividerTemplate: "guide/guideDivider",
		renderLimit: 50,
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.guideDividerFunction.bind(this),
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.guideListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "guideList" , this.guideListAttribs, this.guideListModel);
	
	//Event listeners
	this.controller.listen(this.controller.get( "guideList" ), Mojo.Event.listTap, this.goGuideDetails.bind(this));
	
	
	//Get system time, not passed anything	
	this.controller.serviceRequest('palm://com.palm.systemservice/time', {
		method:"getSystemTime",
		parameters:{},
		onSuccess: function(response) {
			
			//Mojo.Log.info("time serivce reponse is %j", response);
			//Mojo.Log.info("time serivce localtime is %j", response.localtime);
			
			this.currentTimeObject = response.localtime;
			this.currentTimeISO = dateObjectToISO(this.currentTimeObject); 
			this.currentDayRange = dateObjectToDayRange(this.currentTimeObject);
			this.day = this.currentTimeObject.year+"-"+this.currentTimeObject.month+"-"+this.currentTimeObject.day;
				
			if(this.newStartTime == "") {
				//Not passed anything
					
				//Update header
				this.guideViewMenuModel.items[0].items[1].label = "Now: "+dateObjectToJS(response.localtime).toLocaleString().substring(0,21);
				this.controller.modelChanged(this.guideViewMenuModel);
				
				//Set variables to current
				this.timeObject = dateObjectTo30min(this.currentTimeObject);
				this.timeISO = this.currentTimeISO;
				
				this.timeObjectPlus30 = dateObjectAdd30Min(this.timeObject);
				this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
				
				this.timeObject = dateObjectSubtract30Min(this.timeObject);
				
				this.dayRange = this.currentDayRange;
				
				this.layoutStyle = "now";
				
				//Mojo.Log.error("current time is %j", this.currentTimeObject);
				//Mojo.Log.error("ISO date is "+this.currentTimeISO);
				//Mojo.Log.error("current day range is %j",this.currentDayRange);
				
				//Update list from backend XML
				this.getGuideData();
				
				
			} else {
				//Used the passed starttime
				Mojo.Log.info("Got starttime of "+this.newStartTime);
				
				this.timeJS = new Date(isoToJS(this.newStartTime));
				this.timeISO = this.newStartTime;
				this.timeObject = dateJSToObject(this.timeJS);
				this.dayRange = dateObjectToDayRange(this.timeObject);
				this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
					
				this.timeObjectPlus30 = dateObjectAdd30Min(this.timeObject);
				this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
					
				this.selectedTime();
			}
			
		}.bind(this),
		onFailure: function() {}
	}); 
		


};

GuideAssistant.prototype.activate = function(event) {
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	if(WebMyth.channelObject.channelName) {
		//Channel is set from channelPicker
		
		Mojo.Log.info("found matching channel object %j",WebMyth.channelObject);
		
		//Restart spinner and show
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').show();
		
		
		var nowDate = new Date();
		var nowDateISO = dateJSToISO(nowDate);
		
		
		this.channid = WebMyth.channelObject.chanId;
		this.chanNum = WebMyth.channelObject.chanNum;
		
		
		this.channelList = updateChannelLastUpdate(this.channelList, this.channid, nowDateISO);
	
		
		WebMyth.channelObject = {};
		
		this.selectedChannel();
	}
	
};

GuideAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

GuideAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   
	WebMyth.guideCookie.put(WebMyth.guideCookieObject); 

};

GuideAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'do-sortDefault':
				//adsf
				Mojo.Log.info("selected sort default");
					
				this.controller.sceneScroller.mojo.revealTop();
				
				WebMyth.guideCookieObject.manualSort = false;
				WebMyth.guideCookieObject.manualSortType = '';
				
				this.sortChanged();
				
			  break;
			case 'do-sortCategory':
				//adsf
				Mojo.Log.info("selected sort category");
					
				this.controller.sceneScroller.mojo.revealTop();
				
				WebMyth.guideCookieObject.manualSort = true;
				WebMyth.guideCookieObject.manualSortType = 'category';
				
				this.sortChanged();
				
			  break;
			case 'do-sortStatus':
				//adsf
				Mojo.Log.info("selected sort status");
					
				this.controller.sceneScroller.mojo.revealTop();
				
				WebMyth.guideCookieObject.manualSort = true;
				WebMyth.guideCookieObject.manualSortType = 'status';
				
				this.sortChanged();
				
			  break;
			case 'do-sortRecent':
				//adsf
				Mojo.Log.info("selected sort recent");
					
				this.controller.sceneScroller.mojo.revealTop();
				
				WebMyth.guideCookieObject.manualSort = true;
				WebMyth.guideCookieObject.manualSortType = 'recent';
				
				this.sortChanged();
				
			  break;
			case 'do-sortTitle':
				//adsf
				Mojo.Log.info("selected sort title");
					
				this.controller.sceneScroller.mojo.revealTop();
				
				WebMyth.guideCookieObject.manualSort = true;
				WebMyth.guideCookieObject.manualSortType = 'title';
				
				this.sortChanged();
				
			  break;
			case 'do-guidePrevious':
				//adsf
				Mojo.Log.info("selected guide previous");
					
				//Restart spinner and show
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').show();
				
				this.guidePrevious();
				
			  break;
			case 'do-guideNext':
				//adsf
				Mojo.Log.info("selected guide next");
				
				//Restart spinner and show
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').show();
				
				this.guideNext();
				
			  break;
			case 'do-revealTop':
				//adsf
				this.controller.sceneScroller.mojo.revealTop();
			  break;
			case 'do-refresh':
				//adsf
				Mojo.Log.info("refreshing data");
				
				
				this.controller.sceneScroller.mojo.revealTop();
				
				
				//Restart spinner and show
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').show();
				
				this.refreshData();
								
			  break;
			case 'do-now':
				//adsf
				Mojo.Log.info("selected now");
				
				
				//Restart spinner and show
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').show();
				
				this.selectedNow();
								
			  break;
			case 'do-selectTime':
			
			
				Mojo.Log.info("selected time");
				this.timePicker();
					
			  break;
			case 'do-selectChannel':
			
			
				Mojo.Log.info("selected channel");
				this.channelPicker();
					
			  break;
			default:

				Mojo.Log.error("unknown command: "+event.command);
			  break;
		}
	} else if(event.type == Mojo.Event.forward) {
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	}
		  
};

GuideAssistant.prototype.handleKey = function(event) {

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





GuideAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	//Mojo.Log.info("Filter string is "+filterString);
	
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
				//Mojo.Log.info("Found string in subtitle", i);
				someList.push(s);
			}
			else if (s.channelName.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in channel name", i);
				someList.push(s);
			}
			else if (s.category.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in category name", i);
				someList.push(s);
			}
		}
	}
	else {

		var len = this.resultList.length;
 
		for (i = 0; i < len; i++) {
			s = this.resultList[i];
			someList.push(s);
		}
	}
 
	// pare down list results to the part requested by widget (starting at offset & thru count)
	var cursor = 0;
	this.subset.clear();
	
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
	listWidget.mojo.noticeUpdatedItems(offset, this.subset);
	listWidget.mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
	
	if(	(this.layoutStyle == "channel")&&
		(WebMyth.guideCookieObject.manualSort == false)&&
		(this.currentDayRange.EndTime == this.dayRange.EndTime)&&
		(this.currentTimeObject.hour > 2)
		) {
		
		this.controller.sceneScroller.mojo.revealElement(this.controller.get("Now Airing"));
		this.controller.sceneScroller.mojo.adjustBy(0,-300);
		
	} else {
		//Mojo.Log.info("Not adjusting sorting because hour is ",this.currentTimeObject.hour);
	}
	

};

GuideAssistant.prototype.updateSortMenu = function() {
	
	Mojo.Log.info("updating sort menu");
	
	//Reset default sorting
	this.sortMenuModel.items = [ 
		{label: '- Default -', command: 'do-sortDefault'},
		{label: 'Category', command: 'do-sortCategory'} ,
		{label: 'Recent Channels', command: 'do-sortRecent'} ,
		{label: 'Recording Status', command: 'do-sortStatus'} ,
		{label: 'Title', command: 'do-sortTitle'}
	] ;
	
	if(WebMyth.guideCookieObject.manualSort) {
		switch(WebMyth.guideCookieObject.manualSortType) {
			case 'category':
				this.sortMenuModel.items[0].label = 'Default';
				this.sortMenuModel.items[1].label = '- Category -';
			break;
			case 'recent':
				this.sortMenuModel.items[0].label = 'Default';
				this.sortMenuModel.items[2].label = '- Recent Channels -';
			break;
			case 'status':
				this.sortMenuModel.items[0].label = 'Default';
				this.sortMenuModel.items[3].label = '- Recording Status -';
			break;
			case 'title':
				this.sortMenuModel.items[0].label = 'Default';
				this.sortMenuModel.items[4].label = '- Title -';
			break;
		}
	}
	
	this.controller.modelChanged(this.sortMenuModel);
	
	this.updateViewMenu();
  
};

GuideAssistant.prototype.updateViewMenu = function() {

	Mojo.Log.info("updating view menu with "+this.layoutStyle);
	
	//Reset default sorting
	this.viewMenuModel.items = [ 
		{label: '- Now -', command: 'do-now'},
		{label: 'Channel', command: 'do-selectChannel'} ,
		{label: 'Time', command: 'do-selectTime'} 
	] ;
	
		switch(this.layoutStyle) {
			case 'now':
				//Use default
			break;
			case 'channel':
				this.viewMenuModel.items[0].label = 'Now';
				this.viewMenuModel.items[1].label = '- Channel: '+this.chanNum+' -';
			break;
			case 'time':
				this.viewMenuModel.items[0].label = 'Now';
				this.viewMenuModel.items[2].label = '- Time -';
			break;
		}
	
	this.controller.modelChanged(this.viewMenuModel);
  
};

GuideAssistant.prototype.goGuideDetails = function(event) {
	
	this.newChannid = event.item.chanId;
	this.newChanNum = event.item.chanNum;
	this.newStartTime = event.item.startTime.substring(0,16)+":59";
	
	var nowDate = new Date();
	var nowDateISO = dateJSToISO(nowDate);
	
	this.channelList = updateChannelLastUpdate(this.channelList, this.newChannid, nowDateISO);
	
	//Save channels cookie
	WebMyth.guideChannelsCookieObject = cleanGuideChannels(this.channelList);
	WebMyth.guideChannelsCookie.put(WebMyth.guideChannelsCookieObject);
	
	//Mojo.Log.info("new channels cookie is %j",WebMyth.guideChannelsCookieObject);
	
	var popupItems = [];
	
	if((event.item.startTime <  nowDateISO) && (event.item.endTime >  nowDateISO)) {
		popupItems = [
			{label: 'Play on '+WebMyth.prefsCookieObject.currentFrontend, command: 'do-playNow'},
			{label: 'Details', command: 'do-pickDetails'},
			{label: 'Setup Recording', command: 'do-pickSetupRecording'},
			{label: 'Guide: Channel '+this.newChanNum, command: 'do-pickChannel'},
			{label: 'Guide: '+event.item.startTime.replace("T"," ").substring(0,16), command: 'do-pickTime'}
		]
	} else {
		popupItems = [
			{label: 'Details', command: 'do-pickDetails'},
			{label: 'Setup Recording', command: 'do-pickSetupRecording'},
			{label: 'Guide: Channel '+this.newChanNum, command: 'do-pickChannel'},
			{label: 'Guide: '+event.item.startTime.replace("T"," ").substring(0,16), command: 'do-pickTime'}
		]
	}
	
	
	
	this.popupIndex = event.index;
    this.controller.popupSubmenu({
      onChoose: this.popupHandler.bind(this),
      placeNear: event.target,
      items: popupItems
    });
  

};

GuideAssistant.prototype.popupHandler = function(event) {
	
	switch(event) {
		case 'do-playNow':
			//Mojo.Log.info("playing on livetv");
			
			this.channid = this.newChannid;
			this.chanNum = this.newChanNum;
			
			this.checkLocation();
			
		break;
		case 'do-pickDetails':
			//Mojo.Log.info("showing details scene");
			
			var detailsObject = trimGuideByChanidStarttime(this.resultList, this.newChannid, this.newStartTime)

			//Mojo.Log.info("Selected object is: '%j'", detailsObject);
			
			//Open guideDetails communication scene
			Mojo.Controller.stageController.pushScene("guideDetails", detailsObject);
			
		break;
		case 'do-pickSetupRecording':
		
			Mojo.Log.error("opening setup");
			
			var detailsObject = trimGuideByChanidStarttime(this.resultList, this.newChannid, this.newStartTime)

			Mojo.Controller.stageController.pushScene("setupRecording", detailsObject);

						

		break;
		case 'do-pickChannel':
			//Mojo.Log.info("showing channel list"+this.newChannid+this.newChanNum);
			
			//Restart spinner and show
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show();
			
			this.channid = this.newChannid;
			this.chanNum = this.newChanNum;
					
			var nowDate = new Date();
			var nowDateISO = dateJSToISO(nowDate);
			
			this.channelList = updateChannelLastUpdate(this.channelList, this.newChannid, nowDateISO);
			this.resultList = updateProgramLastUpdateFromChannels(this.resultList, this.channelList);
			
			//Save channels cookie
			WebMyth.guideChannelsCookieObject = cleanGuideChannels(this.channelList);
			WebMyth.guideChannelsCookie.put(WebMyth.guideChannelsCookieObject);
			
			//Mojo.Log.info("new channels cookie is %j",WebMyth.guideChannelsCookieObject);
			
			this.selectedChannel();
			
		break;
		case 'do-pickTime':
			//Mojo.Log.info("showing time list");
			
			//Restart spinner and show
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show();

			this.timeJS = new Date(isoToJS(this.newStartTime));
			this.timeISO = this.newStartTime;
			this.timeObject = dateJSToObject(this.timeJS);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
			
			this.timeObjectPlus30 = dateObjectAdd30Min(this.timeObject);
			this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
			
			this.selectedTime();
					
			
		break;
		default:
			Mojo.Log.error("unknown event is %j",event);
		break;
	}
  
};

GuideAssistant.prototype.guidePrevious = function() {

	switch(this.layoutStyle) {
		case 'channel':
						
			//Offset day -1
			this.timeObject = dateObjectSubtractOneDay(this.timeObject);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
							
			this.selectedChannel();
							
		break;
					
		case 'time':
				
			//Offset -30 mins
			
			this.timeObjectPlus30 = this.timeObject;
			this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
			
			this.timeObject = dateObjectSubtract30Min(this.timeObject);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.timeISO = dateObjectToISO(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
			
			this.selectedTime();
							
		break;
					
		case 'now':
			
			this.layoutStyle = "time";
				
			//Offset -30 mins
			
			this.timeObjectPlus30 = this.timeObject;
			this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
			
			this.timeObject = dateObjectSubtract30Min(this.timeObject);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.timeISO = dateObjectToISO(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
			
			this.selectedTime();
							
		break;
		
	}
				
};

GuideAssistant.prototype.guideNext = function() {

	switch(this.layoutStyle) {
		case 'channel':
					
			//Offset day +1
			this.timeObject = dateObjectAddOneDay(this.timeObject);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
						
			this.selectedChannel();
					
		break;
					
		case 'time':
					
			//Offset 30 mins
			this.timeObject = dateObjectTo30min(this.timeObject);
			this.timeObject = dateObjectAdd30Min(this.timeObject);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.timeISO = dateObjectToISO(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
			
			this.timeObjectPlus30 = dateObjectAdd30Min(this.timeObject);
			this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
			
			this.timeObject = dateObjectSubtract30Min(this.timeObject);
			
			//Mojo.Log.info("time added 30 min to %j",this.timeObject);
						
			this.selectedTime();
						
		break;
					
		case 'now':
			
			this.layoutStyle = "time";
					
			//Offset 30 mins
			this.timeObject = dateObjectTo30min(this.timeObject);
			this.timeObject = dateObjectAdd30Min(this.timeObject);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.timeISO = dateObjectToISO(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
			
			this.timeObjectPlus30 = dateObjectAdd30Min(this.timeObject);
			this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
			
			this.timeObject = dateObjectSubtract30Min(this.timeObject);
			
			//Mojo.Log.info("time added 30 min to %j",this.timeObject);
						
			this.selectedTime();
						
		break;
					
	} 
				
};

GuideAssistant.prototype.refreshData = function(event) {

	Mojo.Log.info("Refreshing guide data");
	
	
	//Get system time
	this.controller.serviceRequest('palm://com.palm.systemservice/time', {
		method:"getSystemTime",
		parameters:{},
		onSuccess: function(response) {
		
			//Mojo.Log.info("time serivce reponse is %j", response);
			//Mojo.Log.info("time serivce localtime is %j", response.localtime);
		
			this.currentTimeObject = response.localtime;
			this.timeObject = this.currentTimeObject;
			this.currentTimeISO = dateObjectToISO(this.currentTimeObject); 
			this.currentDayRange = dateObjectToDayRange(this.currentTimeObject);
			
			//Mojo.Log.error("current time is %j", this.currentTimeObject);
			//Mojo.Log.error("ISO date is "+this.currentTimeISO);
			//Mojo.Log.error("current day range is %j",this.currentDayRange);
			
			//Update list from backend XML
			this.getGuideData();
			
		}.bind(this),
		
		onFailure: function() {}
	}); 
	
};

GuideAssistant.prototype.selectedChannel = function() {

	this.layoutStyle = 'channel';

					
	//Update header label
	var date = new Date(dateObjectToJS(this.timeObject));
	this.guideViewMenuModel.items[0].items[0].icon = 'back';
	this.guideViewMenuModel.items[0].items[0].command = 'do-guidePrevious';
	this.guideViewMenuModel.items[0].items[1].label = date.toLocaleString().substring(0,15);
	this.guideViewMenuModel.items[0].items[1].width = 200;
	this.guideViewMenuModel.items[0].items[2].icon = 'forward';
	this.guideViewMenuModel.items[0].items[2].command = 'do-guideNext';
	this.controller.modelChanged(this.guideViewMenuModel);
			
	//Request and show data
	this.controller.sceneScroller.mojo.revealTop();
	
	var listWidget = this.controller.get('guideList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	this.getGuideData();
				
};

GuideAssistant.prototype.selectedTime = function() {

	this.layoutStyle = 'time';

					
	//Update header label
	var date = new Date(dateObjectToJS(this.timeObject));
	this.guideViewMenuModel.items[0].items[0].icon = 'back';
	this.guideViewMenuModel.items[0].items[0].command = 'do-guidePrevious';
	this.guideViewMenuModel.items[0].items[1].label = date.toLocaleString().substring(0,21);
	this.guideViewMenuModel.items[0].items[1].width = 200;
	this.guideViewMenuModel.items[0].items[2].icon = 'forward';
	this.guideViewMenuModel.items[0].items[2].command = 'do-guideNext';
	this.controller.modelChanged(this.guideViewMenuModel);
			
	//Request and show data
	this.controller.sceneScroller.mojo.revealTop();
	
	var listWidget = this.controller.get('guideList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	this.getGuideData();
				
};

GuideAssistant.prototype.selectedNow = function() {

	Mojo.Log.info("starting selectedNow.");

	this.layoutStyle = 'now';

	//Update date values
	this.timeJS = new Date();	//defaults to now
	this.timeObject = dateJSToObject(this.timeJS);
	this.timeISO = dateJSToISO(this.timeJS);
	this.dayRange = dateObjectToDayRange(this.timeObject);
	this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
	
	this.currentTimeObject = this.timeObject;
	this.currentTimeISO = this.timeISO;
	
	this.timeObjectPlus30 = dateObjectAdd30Min(this.timeObject);
	this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
	
	this.timeObject = dateObjectSubtract30Min(this.timeObject);

	
	//Update header label
	var date = new Date(dateObjectToJS(this.timeObject));
	this.guideViewMenuModel.items[0].items[0] = {};
	this.guideViewMenuModel.items[0].items[1].label = "Now: "+date.toLocaleString().substring(0,21);
	this.guideViewMenuModel.items[0].items[1].width = 260;
	this.guideViewMenuModel.items[0].items[2].icon = 'forward';
	this.guideViewMenuModel.items[0].items[2].command = 'do-guideNext';
	this.controller.modelChanged(this.guideViewMenuModel);
							
							
	this.controller.sceneScroller.mojo.revealTop();
	
	var listWidget = this.controller.get('guideList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	this.getGuideData();
				
				
};

GuideAssistant.prototype.guideDividerFunction = function(itemModel) {

	//Mojo.Log.error("item model is %j",itemModel);
	
	var divider = "Unknown";
	
	if(WebMyth.guideCookieObject.manualSort) {
		if(WebMyth.guideCookieObject.manualSortType == 'category') divider = itemModel.category;
		if(WebMyth.guideCookieObject.manualSortType == 'status') divider = itemModel.recStatusText;
		if(WebMyth.guideCookieObject.manualSortType == 'recent') divider = itemModel.lastUpdate.replace("T"," ").substring(0,16);
		if(WebMyth.guideCookieObject.manualSortType == 'title') divider = itemModel.title.substring(0,1);
	} else {
	
		if(itemModel.endTime < this.currentTimeISO) {
			divider = "In the Past";
		} else if(itemModel.startTime < this.currentTimeISO) {
			divider = "Now Airing";
		} else {
			divider = "Upcoming";
		}
	
	}
	
	return divider;
};

GuideAssistant.prototype.updateChannelListCookie = function() {

	//Mojo.Log.error("Updateing channel list with cookie");
	
	//Guide channels cookie
	if (WebMyth.guideChannelsCookieObject) {		//cookie exists
	
		//Mojo.Log.info("Cookie exists, updating last update");
		
		//Mojo.Log.info("channels cookie is %j",WebMyth.guideChannelsCookieObject);
		
		//Mojo.Log.info("lengths are "+this.channelList.length+" and "+WebMyth.guideChannelsCookieObject.length);
		
		//Update channel list from cookie
		this.channelList = updateGuideChannelsFromCookie(this.channelList,WebMyth.guideChannelsCookieObject);
		
		
		WebMyth.guideChannelsCookieObject.clear();
		Object.extend(WebMyth.guideChannelsCookieObject,cleanGuideChannels(this.channelList));
		WebMyth.guideChannelsCookie.put(WebMyth.guideChannelsCookieObject);
		
	} else {
	
		Mojo.Log.info("Cookie does not exist");
		
		WebMyth.guideChannelsCookieObject = cleanGuideChannels(this.channelList);
		WebMyth.guideChannelsCookie.put(WebMyth.guideChannelsCookieObject);
	}
	
	//Mojo.Log.info("Done with if-else in update cookie list");
	
	//Object.extend(this.channelMenuModel.items,this.channelList);
					
	//this.controller.modelChanged(this.channelMenuModel);
	
};

GuideAssistant.prototype.setMyData = function(propertyValue, model) {
	
	//Mojo.Log.info("setting my data");
	
	var guideDetailsText = '';
	
	//Mojo.Log.info("timeplus30 is "+this.timeISOPlus30+" end time "+model.endTime);
	
	if(model.recStatus == '-10') {
		guideDetailsText += '<div id='+model.chanId+model.startTime+' class="palm-row multi-line guide-list-item recordingStatus'+model.recStatus+'>';
		guideDetailsText += '<div class="palm-row-wrapper guide-list-item multi-line"><div class="guide-list-item">';
	} else {
		guideDetailsText += '<div class="palm-row guide-list-item-extended recordingStatus'+model.recStatus+'>';
		guideDetailsText += '<div class="palm-row-wrapper guide-list-item-extended multi-line"><div class="guide-list-item">';
	}
	
	guideDetailsText += '<div class="guide-left-program-earlier">';
	
	//If program started earlier
	if((model.startTime < this.timeISO.substring(0,16)) && (this.layoutStyle == 'time')) {
		guideDetailsText += '<div class="arrow"><</div>';
	} 
	
	guideDetailsText += '</div><div class="guide-left-list-image-earlier">';
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		guideDetailsText += '<img class="guide-channelicon-small" src="';
		guideDetailsText += 'http://'+WebMyth.prefsCookieObject.masterBackendIp+':6544/Myth/GetChannelIcon?ChanId='+model.chanId+'" />';
		guideDetailsText += '<div class="title truncating-text chanNum">'+model.chanNum+'</div>';
		guideDetailsText += '</div>';
	} else {
		guideDetailsText += '<div class="title chanNum chanNum-no-icon">'+model.chanNum+'</div>';
		guideDetailsText += '</div>';
	}
	
	//Mojo.Log.error("Guide channel icon URL is :"+'http://'+WebMyth.prefsCookieObject.masterBackendIp+':6544/Myth/GetChannelIcon?ChanId='+model.chanId);
	
	guideDetailsText += '<div class="guide-right-list-text-later">';
	
	guideDetailsText += '<div class="title truncating-text left guide-list-title">'+model.title+'</div>';
	guideDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subTitle+'&nbsp;</div>';
	guideDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.startTimeHourMinute+' to '+model.endTimeHourMinute+'&nbsp;</div>';
	guideDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.category+'</div>';
	guideDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.channelName+'</div>';
	guideDetailsText += '</div>';
	
	//If program goes later
	if((model.endTime > this.timeISOPlus30) && (this.layoutStyle == 'time')) {
		guideDetailsText += '<div class="guide-right-list-later"><div class="arrow">></div></div>';
	} 
	
	
	if(model.recStatus == '-10') {
		guideDetailsText += '</div></div></div>';
	} else {
		guideDetailsText += '</div><div class="guide-recStatusRow"><div class="guide-recStatusText">'+model.recStatusText+'</div></div></div></div>';
	}
		
	model.myData = guideDetailsText;
};

GuideAssistant.prototype.getGuideData = function() {
	
	//Use XML to get guide data
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetProgramGuide?Details=1";

	
	if(this.layoutStyle == 'time') {
		requestUrl += "&StartTime="+this.timeISO;
		requestUrl += "&EndTime="+this.timeISO;							
		requestUrl += "&NumOfChannels=10000";								//Assume nobody would have more than 10,000 channels
	} else if(this.layoutStyle == 'now') {
		requestUrl += "&StartTime="+this.timeISO;
		requestUrl += "&EndTime="+this.timeISO;							
		requestUrl += "&NumOfChannels=10000";								//Assume nobody would have more than 10,000 channels
	} else if(this.layoutStyle == 'channel') {
		requestUrl += "&StartTime="+this.dayRange.StartTime;							
		requestUrl += "&EndTime="+this.dayRange.EndTime;							
		requestUrl += "&NumOfChannels=1";
		requestUrl += "&StartChanId="+this.channid;
	} else {
		requestUrl += "&StartTime="+this.dayRange.StartTime;							
		requestUrl += "&EndTime="+this.dayRange.EndTime;							
		requestUrl += "&NumOfChannels=1";									
		requestUrl += "&StartChanId="+this.channid;
	}
	
	Mojo.Log.info("Guide URL is: "+requestUrl);
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
			evalJSON: false,
            onSuccess: this.readGuideSuccess.bind(this),
            onFailure: this.readGuideFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
	
		
};

GuideAssistant.prototype.readGuideFail = function() {
	Mojo.Log.error("Failed to get guide information");	
	Mojo.Controller.errorDialog("Failed to get guide information");

};

GuideAssistant.prototype.readGuideSuccess = function(response) {
	
	var xmlstring = response.responseText.trim();
	
	//Mojo.Log.info("Got XML guide response from backend: "+xmlstring);
	
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, programGuideNode, programGuideSingleNode;
	var singleChannelNode, singleChannelChildNode, singleChannelJson;
	var singleProgramNode, singleProgramNode, singleProgramJson;
	var singleProgramChildNode;
	var StartTime, EndTime, StartChanId, EndChanId, NumOfChannels, Count, AsOf, Version, ProtoVer;
	var newChannelList = [];
	
	
	//Time used for sorting recent channels
	var nowDateJS = new Date();	//defaults to now
	var nowDateISO = dateJSToISO(nowDateJS);
	
	
	
	var s = {};
	
	
	Mojo.Log.error("about to start parsing guide data");
	this.resultList.clear();
	//this.channelList.clear();
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetProgramGuideResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		switch(topSingleNode.nodeName) {
			case 'StartTime':
				StartTime = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'EndTime':
				EndTime = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'StartChanId':
				StartChanId = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'EndChanId':
				EndChanId = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'NumOfChannels':
				NumOfChannels = topSingleNode.childNodes[0].nodeValue;
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
			case 'ProgramGuide':
				//Mojo.Log.error('starting to parse ProgramGuide');
				programGuideNode = topSingleNode.childNodes[0];
				for(var j = 0; j < programGuideNode.childNodes.length; j++) {
					programGuideSingleNode = programGuideNode.childNodes[j];
					//Mojo.Log.error("node name is "+programGuideSingleNode.nodeName);
					if(programGuideSingleNode.nodeName == 'Channel') {
						//Mojo.Log.error('inside channel if');
						singleChannelNode = programGuideSingleNode;
						singleChannelJson = {
							label: singleChannelNode.getAttributeNode("chanNum").nodeValue+": "+singleChannelNode.getAttributeNode("channelName").nodeValue,
							command: "go-channel___"+singleChannelNode.getAttributeNode("chanId").nodeValue+"---"+singleChannelNode.getAttributeNode("chanNum").nodeValue,
							"chanNumInt": parseInt(singleChannelNode.getAttributeNode("chanNum").nodeValue),
							"chanNum": singleChannelNode.getAttributeNode("chanNum").nodeValue,
							"channelName": singleChannelNode.getAttributeNode("channelName").nodeValue,
							"chanId": singleChannelNode.getAttributeNode("chanId").nodeValue,
							"lastUpdate": ' Earlier'
						}	
						newChannelList.push(singleChannelJson);
						
						for(var k = 0; k < singleChannelNode.childNodes.length; k++) {
							singleChannelChildNode = singleChannelNode.childNodes[k];
							if(singleChannelChildNode.nodeName == 'Program') {
								singleProgramJson = {
									"channelName": singleChannelNode.getAttributeNode("channelName").nodeValue, 
									"chanId": singleChannelNode.getAttributeNode("chanId").nodeValue, 
									"chanNum": singleChannelNode.getAttributeNode("chanNum").nodeValue, 
									"chanNumInt": parseInt(singleChannelNode.getAttributeNode("chanNum").nodeValue), 
									"callSign": singleChannelNode.getAttributeNode("callSign").nodeValue, 
									"title": singleChannelChildNode.getAttributeNode("title").nodeValue, 
									"subTitle": singleChannelChildNode.getAttributeNode("subTitle").nodeValue, 
									"programFlags": singleChannelChildNode.getAttributeNode("programFlags").nodeValue, 
									"category": singleChannelChildNode.getAttributeNode("category").nodeValue, 
									"fileSize": singleChannelChildNode.getAttributeNode("fileSize").nodeValue, 
									"seriesId": singleChannelChildNode.getAttributeNode("seriesId").nodeValue, 
									"hostname": singleChannelChildNode.getAttributeNode("hostname").nodeValue, 
									"catType": singleChannelChildNode.getAttributeNode("catType").nodeValue, 
									"programId": singleChannelChildNode.getAttributeNode("programId").nodeValue, 
									"repeat": singleChannelChildNode.getAttributeNode("repeat").nodeValue, 
				//					"stars": singleChannelChildNode.getAttributeNode("stars").nodeValue, 
									"endTime": singleChannelChildNode.getAttributeNode("endTime").nodeValue, 
				//					"airdate": singleChannelChildNode.getAttributeNode("airdate").nodeValue, 
									"startTime": singleChannelChildNode.getAttributeNode("startTime").nodeValue,
									"lastModified": singleChannelChildNode.getAttributeNode("lastModified").nodeValue, 
									"startTimeSpace": singleChannelChildNode.getAttributeNode("startTime").nodeValue.replace("T"," "),
									"endTimeSpace": singleChannelChildNode.getAttributeNode("endTime").nodeValue.replace("T"," "),  
									"startTimeHourMinute": singleChannelChildNode.getAttributeNode("startTime").nodeValue.substring(11,16),
									"endTimeHourMinute": singleChannelChildNode.getAttributeNode("endTime").nodeValue.substring(11,16),
									"lastUpdate": ' Earlier',
									"recStatus": "-10"
								}
								if(singleProgramJson.chanNumInt == NaN) singleProgramJson.chanNumInt = 0;
								
								try {
									singleProgramJson.airdate = singleChannelChildNode.getAttributeNode("airdate").nodeValue;
									singleProgramJson.stars = singleChannelChildNode.getAttributeNode("stars").nodeValue; 
								} catch(e) {
									singleProgramJson.airdate = "";
									singleProgramJson.stars = ""; 
								}
								
								
								singleProgramJson.description = "";
								
								for(var l = 0; l < singleChannelChildNode.childNodes.length; l++) {
									singleProgramChildNode = singleChannelChildNode.childNodes[l];
									
									if(l == 0) singleProgramJson.description = singleProgramChildNode.nodeValue;
									
									if(singleProgramChildNode.nodeName == "Recording") {
										singleProgramJson.recPriority = singleProgramChildNode.getAttributeNode("recPriority").nodeValue;
										singleProgramJson.playGroup = singleProgramChildNode.getAttributeNode("playGroup").nodeValue;
										singleProgramJson.recStatus = singleProgramChildNode.getAttributeNode("recStatus").nodeValue;
										singleProgramJson.recStartTs = singleProgramChildNode.getAttributeNode("recStartTs").nodeValue;
										singleProgramJson.recGroup = singleProgramChildNode.getAttributeNode("recGroup").nodeValue;
										singleProgramJson.dupMethod = singleProgramChildNode.getAttributeNode("dupMethod").nodeValue;
										singleProgramJson.recType = singleProgramChildNode.getAttributeNode("recType").nodeValue;
										singleProgramJson.encoderId = singleProgramChildNode.getAttributeNode("encoderId").nodeValue;
										singleProgramJson.recProfile = singleProgramChildNode.getAttributeNode("recProfile").nodeValue;
										singleProgramJson.recEndTs = singleProgramChildNode.getAttributeNode("recEndTs").nodeValue;
										singleProgramJson.recordId = singleProgramChildNode.getAttributeNode("recordId").nodeValue;
										singleProgramJson.dupInType = singleProgramChildNode.getAttributeNode("dupInType").nodeValue;
									}
								}
								
								
								singleProgramJson.recStatusText = recStatusDecode(singleProgramJson.recStatus);
								
								this.resultList.push(singleProgramJson);
								//Mojo.Log.error("program "+k+" json is %j", singleProgramJson);
							}
						}
					}
				}
				Mojo.Log.info('Done parsing ProgramGuide');
				//Mojo.Log.error("full json is %j", this.resultList);
				//Mojo.Log.error("channels json is %j", this.channelList);
				
				
				if(this.channelList.length == 0) {
					Mojo.Log.info("Didn't find any channels - adding now");
					this.channelList = newChannelList;
					
					this.channelList.sort(sort_by('chanNumInt', false));
					
					this.updateChannelListCookie();
					
					//Object.extend(this.channelMenuModel.items,this.channelList);
					
					//this.controller.modelChanged(this.channelMenuModel);
					
				} 
				
				
				this.sortChanged();
				
				
				//Stop spinner and hide
				this.spinnerModel.spinning = false;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').hide();
	
				
				break;
			default:
				//Mojo.Log.error("node name is "+topSingleNode.nodeName);
				break;
		}
	}

};

GuideAssistant.prototype.sortChanged = function() {

	var originalSortType = ''
	
	Mojo.Log.info("starting sort with "+this.layoutStyle);

	//Sort list by layout first
	switch(this.layoutStyle) {
		case 'time':
			//Mojo.Log.error("layout style is time");
			this.resultList.sort(sort_by('chanNumInt', false));
			originalSortType = 'chanNumInt';
		  break;
		case 'channel':
			//Mojo.Log.error("layout style is channel");
			this.resultList.sort(sort_by('startTime', false));
			originalSortType = 'startTime';
		  break;
		default :
			//Mojo.Log.error("layout style is unknown");
			this.resultList.sort(sort_by('chanNumInt', false));
			originalSortType = 'chanNumInt';
		  break;
	}

	if(WebMyth.guideCookieObject.manualSort) {
	
		//Sort list by manual selection second if needed
		switch(WebMyth.guideCookieObject.manualSortType) {
			case 'category':
				this.resultList.sort(double_sort_by('category', originalSortType, false));
			  break;
			case 'status':
				this.resultList.sort(triple_sort_by('recStatusText', 'chanNumInt', 'startTime', true));
			  break;
			case 'recent':
				//have to update program list with channel list 'lastUpdate'
				this.resultList = updateProgramLastUpdateFromChannels(this.resultList, this.channelList);
				
				this.resultList.sort(double_sort_by('lastUpdate', originalSortType, true));
			  break;
			case 'title':
				this.resultList.sort(double_sort_by('title', originalSortType, false));
			  break;
			default :
				//Mojo.Log.error("layout style is unknown");
				this.resultList.sort(double_sort_by('startTime', originalSortType, false));
			  break;
		}
		
	} 
	
	
	var listWidget = this.controller.get('guideList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	listWidget.mojo.close();

	
	this.updateSortMenu();
	   
};

GuideAssistant.prototype.timePicker = function() {

	this.controller.showDialog({
		template: 'dialogs/dateAndTimePicker',
		assistant: new DateAndTimePickerAssistant(this, dateObjectTo30min(this.timeObject), this.timePickerCallback.bind(this))
	});
	
};

GuideAssistant.prototype.timePickerCallback = function(value) {


	//Restart spinner and show
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show();


	//Mojo.Log.error("callback is %j", value);
	//this.timeObject = dateJSToObject(value);
	this.timeJS = value;
	this.timeObject = dateJSToObject(value);
	this.timeISO = dateJSToISO(value);
	this.dayRange = dateObjectToDayRange(this.timeObject);
	this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
	
	this.timeObjectPlus30 = dateObjectAdd30Min(this.timeObject);
	this.timeISOPlus30 = dateObjectToISO(this.timeObjectPlus30);
	
	this.timeObject = dateObjectSubtract30Min(this.timeObject);
	
	this.selectedTime();
	
};

GuideAssistant.prototype.channelPicker = function() {

	Mojo.Controller.stageController.pushScene("channelPicker", this.channelList);

};



GuideAssistant.prototype.checkLocation = function() {
	//Attempting to play livetv - have to start livetv then change channel
	this.host = WebMyth.prefsCookieObject.currentFrontend;
	//Mojo.Log.info("Checking current location as prep for "+this.channid+" on "+this.host);
	
	
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=query";
		requestUrl += "&host="+this.host+"&cmd=location";
		
		//Mojo.Log.error("requesting check URL: "+requestUrl);
	
		var request1 = new Ajax.Request(requestUrl, {
			method: 'get',
			onSuccess: function(response){
				//Mojo.Log.info("got query response: %s, %s",response.responseText,response.responseText.search("LiveTV"));
				
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
			
		});
	
};

GuideAssistant.prototype.jumpLive = function() {
	//Attempting to play livetv - have to start livetv then change channel
	//Mojo.Log.info("jumping to live tv");
	
	//WebMyth.sendJump("livetv");
	
	this.startChannelPlay();
	
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=jump";
		requestUrl += "&host="+this.host+"&cmd=livetv";
		
		//Mojo.Log.error("requesting jump live : "+requestUrl);
	
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

GuideAssistant.prototype.startChannelPlay = function() {
	//Attempting to play livetv - have to start livetv then change channel
	Mojo.Log.info("Playing channel "+this.channid);
	
	var cmd = "chanid "+this.channid;
	
	WebMyth.sendPlay(cmd);
	
	
	if(WebMyth.prefsCookieObject.guideJumpRemote)  {
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	}
	
};

/*
	Small controller class used for the date and time picker.
*/

var DateAndTimePickerAssistant = Class.create({
	
	initialize: function(sceneAssistant, timeObject2, callbackFunc) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
		
		this.timeObject2 = timeObject2;
		this.callbackFunc = callbackFunc;
	},
	
	setup : function(widget) {
	
		this.widget = widget;
		
		//Mojo.Log.error("time object 2 is %j", this.timeObject2);
		
		this.newTime = new Date(this.timeObject2.year, (this.timeObject2.month-1), this.timeObject2.day, this.timeObject2.hour, this.timeObject2.minute, this.timeObject2.second);
		//Mojo.Log.error("time is %j", this.newTime);
		
		this.controller.setupWidget("datepickerid",
        this.dateAttributes = {
             modelProperty: 'time' 
        },
        this.dateModel = {
            time: this.newTime
        }
		); 
		this.controller.setupWidget("timepickerid",
        this.timeAttributes = {
             modelProperty: 'time' 
        },
        this.timeModel = {
            time: this.newTime
        }
		); 
		
		Mojo.Event.listen(this.controller.get('goDate_button'),Mojo.Event.tap,this.okButton.bind(this));

		
	},
	
	okButton: function() {
	
		this.callbackFunc(this.newTime);

		this.widget.mojo.close();
	}
	
	
});

