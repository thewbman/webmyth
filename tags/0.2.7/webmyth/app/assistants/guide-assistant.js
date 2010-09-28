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

 
function GuideAssistant() {

	this.layoutStyle = "time";
	this.channid, this.chanNum;
	this.timeObject, this.timeISO;
	this.timeJS = new Date();
	this.day, this.dayRange;
	
	this.currentTimeObject = {};
	this.currentTimeISO = "";
	this.currentDayRange = {};
	
	this.resultList = [];			//Results from XML
	this.channelList = [];			//List of channels
	this.subset = [];				//Actually displayed list
	
}

GuideAssistant.prototype.setup = function() {

	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Setup view menu
	this.guideViewMenuAttr = { spacerHeight: 0, menuClass: 'no-fade' };	
	this.guideViewMenuModel = {
		visible: true,
		items: [{
			items: [
				{},
				{ label: "Now Airing", width: 320, command: 'do-revealTop' },
				{}
			]
		}]
	}; 
	this.controller.setupWidget( Mojo.Menu.viewMenu, this.guideViewMenuAttr, this.guideViewMenuModel );
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Guide Menu'), items: [
		{},
        { toggleCmd: 'do-now', items: [{label: $L('Now'), command:'do-now'},{label: $L('Time'), command:'do-selectTime'},{label: $L('Channel'), command: 'do-selectChannel', submenu:'channel-menu'}]},
		{}]
	};
	this.channelMenuModel = { label: $L('Channel'), items: [] };
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('channel-menu', '', this.channelMenuModel);
	
	
	// Guide filter list
	this.guideListAttribs = {
		itemTemplate: "guide/guideListItem",
		//listTemplate: "guide/guideListTemplate",
		dividerTemplate: "guide/guideDivider",
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
			this.day = this.currentTimeObject.year+"-"+this.currentTimeObject.month+"-"+this.currentTimeObject.day;
			
			this.timeISO = this.currentTimeISO;
			this.dayRange = this.currentDayRange;
			
			//Mojo.Log.error("current time is %j", this.currentTimeObject);
			//Mojo.Log.error("ISO date is "+this.currentTimeISO);
			//Mojo.Log.error("current day range is %j",this.currentDayRange);
			
			//Update list from backend XML
			this.getGuideData();
		}.bind(this),
		onFailure: function() {}
	}); 
	
	
	//Update list from backend XML
	//this.getGuideData();
	
	
	
};

GuideAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

GuideAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

GuideAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

GuideAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'do-guidePrevious':
				//adsf
				Mojo.Log.error("selected guide previous");
				
				if(this.layoutStyle == 'channel') {
				
					//Restart spinner and show
					this.spinnerModel.spinning = true;
					this.controller.modelChanged(this.spinnerModel, this);
					$('myScrim').show()
				
					//Offset day -1
					this.timeObject = dateObjectSubtractOneDay(this.timeObject);
					this.dayRange = dateObjectToDayRange(this.timeObject);
					this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
					
					this.selectedChannel();
					
				} else {
					Mojo.Controller.getAppController().showBanner("More features coming soon", {source: 'notification'});
				}
				
			  break;
			case 'do-guideNext':
				//adsf
				Mojo.Log.error("selected guide next");
				
				if(this.layoutStyle == 'channel') {
				
					//Restart spinner and show
					this.spinnerModel.spinning = true;
					this.controller.modelChanged(this.spinnerModel, this);
					$('myScrim').show()
				
					//Offset day +1
					this.timeObject = dateObjectAddOneDay(this.timeObject);
					this.dayRange = dateObjectToDayRange(this.timeObject);
					this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
					
					this.selectedChannel();
					
				} else {
					Mojo.Controller.getAppController().showBanner("More features coming soon", {source: 'notification'});
				}
				
			  break;
			case 'do-revealTop':
				//adsf
				this.controller.sceneScroller.mojo.revealTop();
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
				//adsf
				Mojo.Log.info("selected time");
				this.timePicker();
					
			  break;
			default:
				if(event.command.substring(0,10) == 'go-channel') {
					//User tapped channel button
					
					//Restart spinner and show
					this.spinnerModel.spinning = true;
					this.controller.modelChanged(this.spinnerModel, this);
					$('myScrim').show()
					
					//Decode channel selection
					var chanString = event.command.substring(13);  //gets rid of 'go-channel___
					Mojo.Log.info("selected channel list: "+chanString);
					this.channid = chanString.substring(0, chanString.search('---'));
					this.chanNum = chanString.substring((chanString.search('---')+3));
					//Mojo.Log.info("channid is %s",this.channid);
					//Mojo.Log.info("chanNum is %s",this.chanNum);
					
					this.selectedChannel();
					
					break;
				}
				//asdf
				
				Mojo.Log.error("unknown command: "+event.command);
			  break;
		}
	} else if(event.type == Mojo.Event.forward) {
		Mojo.Controller.stageController.pushScene("hostSelector", true);
	}
		  
};





GuideAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	Mojo.Log.info("Filter string is "+filterString);
	
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
	

};


GuideAssistant.prototype.goGuideDetails = function(event) {
	
	this.newChannid = event.item.chanId;
	this.newChanNum = event.item.chanNum;
	this.newStartTime = event.item.startTime.substring(0,16)+":59";
	
	var nowDate = new Date();
	var popupItems = [];
	
	if(((event.item.startTime) <  dateJSToISO (nowDate)) && ((event.item.endTime) >  dateJSToISO(nowDate))) {
		popupItems = [
			{label: 'Play on '+WebMyth.prefsCookieObject.currentFrontend, command: 'do-playNow'},
			{label: 'Details', command: 'do-pickDetails'},
			{label: 'Guide: Channel '+this.newChanNum, command: 'do-pickChannel'},
			{label: 'Guide: '+event.item.startTime.replace("T"," ").substring(0,16), command: 'do-pickTime'}
		]
	} else {
		popupItems = [
			{label: 'Details', command: 'do-pickDetails'},
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
			Mojo.Log.error("playing on livetv");
			
			this.channid = this.newChannid;
			this.chanNum = this.newChanNum;
			
			this.checkLocation();
			
		break;
		case 'do-pickDetails':
			Mojo.Log.error("showing details scene");
			
			var detailsObject = trimGuideByChanidStarttime(this.resultList, this.newChannid, this.newStartTime)

			Mojo.Log.info("Selected object is: '%j'", detailsObject);
			
			//Open guideDetails communication scene
			Mojo.Controller.stageController.pushScene("guideDetails", detailsObject);
			
		break;
		case 'do-pickChannel':
			//Mojo.Log.error("showing channel list"+this.newChannid+this.newChanNum);
			
			//Restart spinner and show
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show()
			
			this.channid = this.newChannid;
			this.chanNum = this.newChanNum;
			
			this.selectedChannel();
			
		break;
		case 'do-pickTime':
			Mojo.Log.error("showing time list");
			
			//Restart spinner and show
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show()

			this.timeJS = new Date(isoToJS(this.newStartTime));
			Mojo.Log.error("time JS is %j",this.timeJS);
			this.timeISO = this.newStartTime;
			Mojo.Log.error("timeISO is %j",this.timeISO);
			this.timeObject = dateJSToObject(this.timeJS);
			Mojo.Log.error("time object is %j",this.timeObject);
			this.dayRange = dateObjectToDayRange(this.timeObject);
			this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
			
			this.selectedTime();
					
			
		break;
		default:
			Mojo.Log.error("event,newChan is %j",event);
		break;
	}
  
};


GuideAssistant.prototype.jumpLiveTV = function() {
	//Attempting to play livetv - have to start livetv then change channel
	Mojo.Log.info("Attempting to play "+this.channid+" on "+WebMyth.prefsCookieObject.currentFrontend);
	
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		var requestUrl1 = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl1 += "?op=remote&type=jump";
		requestUrl1 += "&host="+WebMyth.prefsCookieObject.currentFrontend+"&cmd=livetv";
		
		var requestUrl2 = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl2 += "?op=remote&type=play";
		requestUrl2 += "&host="+WebMyth.prefsCookieObject.currentFrontend+"&cmd=chanid+"+this.channid;
		
		Mojo.Log.error("requesting 1: "+requestUrl1);
		Mojo.Log.error("requesting 2: "+requestUrl2);
	
		var request1 = new Ajax.Request(requestUrl1, {
			method: 'get',
			onSuccess: function(transport1){
				//OK ?
				var request2 = new Ajax.Request(requestUrl2, {
					method: 'get',
					onSuccess: function(transport2){
						//OK ?
					},
					onFailure: function() {
						Mojo.Log.error("Failed AJAX: '%s'", requestURL);
						Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
					}
				});
			},
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		});
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
	
	if(WebMyth.prefsCookieObject.playJumpRemote)  Mojo.Controller.stageController.pushScene("hostSelector", true);
	
				
};


GuideAssistant.prototype.checkLocation = function() {
	//Attempting to play livetv - have to start livetv then change channel
	this.host = WebMyth.prefsCookieObject.currentFrontend;
	Mojo.Log.info("Checking current location as prep for "+this.channid+" on "+this.host);
	
	
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



GuideAssistant.prototype.jumpLive = function() {
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



GuideAssistant.prototype.startChannelPlay = function() {
	//Attempting to play livetv - have to start livetv then change channel
	Mojo.Log.info("Playing channel "+this.channid);
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=play";
		requestUrl += "&host="+this.host+"&cmd=chanid+"+this.channid;
		
		Mojo.Log.error("requesting channel URL : "+requestUrl);
	
		var request1 = new Ajax.Request(requestUrl, {
			method: 'get',
			onSuccess: function(transport1){
				//OK ?
			},
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		});
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
	
	if(WebMyth.prefsCookieObject.playJumpRemote)  Mojo.Controller.stageController.pushScene("hostSelector", true);
	
};


GuideAssistant.prototype.selectedChannel = function() {

	this.layoutStyle = 'channel';
					
	//Update channel command menu label
	this.cmdMenuModel.items[1].toggleCmd = 'do-selectChannel';
	this.cmdMenuModel.items[1].items[2].label = 'Channel: '+this.chanNum;
	this.controller.modelChanged(this.cmdMenuModel);
					
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
	this.filterListFunction(' ', this.controller.get('guideList'), 0, this.resultList.length);
	this.getGuideData();
				
};


GuideAssistant.prototype.selectedTime = function() {

	this.layoutStyle = 'time';
	
	//Update command menu
	this.cmdMenuModel.items[1].toggleCmd = 'do-selectTime';
	this.cmdMenuModel.items[1].items[2].label = 'Channel';
	this.controller.modelChanged(this.cmdMenuModel);
					
	//Update header label
	var date = new Date(dateObjectToJS(this.timeObject));
	this.guideViewMenuModel.items[0].items[0] = {};
	this.guideViewMenuModel.items[0].items[1].label = date.toLocaleString().substring(0,21);
	this.guideViewMenuModel.items[0].items[1].width = 320;
	this.guideViewMenuModel.items[0].items[2] = {};
	this.controller.modelChanged(this.guideViewMenuModel);
			
	//Request and show data
	this.controller.sceneScroller.mojo.revealTop();
	this.filterListFunction(' ', this.controller.get('guideList'), 0, this.resultList.length);
	this.getGuideData();
				
};


GuideAssistant.prototype.selectedNow = function() {

	//Update date values
	this.timeJS = new Date();	//defaults to now
	this.timeObject = dateJSToObject(this.timeJS);
	this.timeISO = dateJSToISO(this.timeJS);
	this.dayRange = dateObjectToDayRange(this.timeObject);
	this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;

	//Update command menu
	this.cmdMenuModel.items[1].toggleCmd = 'do-now';
	this.cmdMenuModel.items[1].items[2].label = 'Channel';
	this.controller.modelChanged(this.cmdMenuModel);
		
	//Update header label
	this.guideViewMenuModel.items[0].items[0] = {};
	this.guideViewMenuModel.items[0].items[1].label = "Now Airing";
	this.guideViewMenuModel.items[0].items[1].width = 320;
	this.guideViewMenuModel.items[0].items[2] = {};
	this.controller.modelChanged(this.guideViewMenuModel);
							
	//Add popup selector later
	this.layoutStyle = 'time';
	this.controller.sceneScroller.mojo.revealTop();
	this.filterListFunction(' ', this.controller.get('guideList'), 0, this.resultList.length);
	this.getGuideData();
				
				
};


GuideAssistant.prototype.guideDividerFunction = function(itemModel) {
	
	var divider = "Unknown";
	
	if(itemModel.endTime < this.currentTimeISO) {
		divider = "In the Past";
	} else if(itemModel.startTime < this.currentTimeISO) {
		divider = "Now Airing";
	} else {
		divider = "Upcoming";
	}
	
	return divider;
};


GuideAssistant.prototype.setMyData = function(propertyValue, model) {
	
	var guideDetailsText = '';
	
	if(model.recStatus == '-10') {
		guideDetailsText += '<div class="palm-row multi-line guide-list-item recordingStatus'+model.recStatus+'>';
		guideDetailsText += '<div class="palm-row-wrapper guide-list-item multi-line"><div>';
	} else {
		guideDetailsText += '<div class="palm-row guide-list-item-extended recordingStatus'+model.recStatus+'>';
		guideDetailsText += '<div class="palm-row-wrapper guide-list-item-extended multi-line"><div class="guide-list-item">';
	}
	
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		guideDetailsText += '<div class="guide-left-list-image">';
		guideDetailsText += '<img class="guide-channelicon-small" src="';
		guideDetailsText += 'http://'+WebMyth.prefsCookieObject.masterBackendIp+':6544/Myth/GetChannelIcon?ChanId='+model.chanId+'" />';
		guideDetailsText += '<div class="title truncating-text">'+model.chanNum+'</div>';
		guideDetailsText += '</div>';
	} else {
		guideDetailsText += '<div class="guide-left-list-image">';
		guideDetailsText += '<div class="title truncating-text chanNum-no-icon">'+model.chanNum+'</div>';
		guideDetailsText += '</div>';
	}
	
	guideDetailsText += '<div class="guide-right-list-text">';
	guideDetailsText += '<div class="title truncating-text left guide-list-title">'+model.title+'</div>';
	//guideDetailsText += '<div class="palm-info-text left">Start:&nbsp '+model.startTimeSpace+'<br>End:&nbsp &nbsp '+model.endTimeSpace+'</div>';
	guideDetailsText += '<div class="palm-info-text left">Start: '+model.startTimeSpace+'</div>';
	guideDetailsText += '<div class="palm-info-text truncating-text">'+model.channelName+'</div>';
	guideDetailsText += '</div>';
	
	
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
		requestUrl += "&EndTime="+this.timeISO;							//Can just provide date and not time
		requestUrl += "&NumOfChannels=10000";	
	} else if(this.layoutStyle == 'channel') {
		requestUrl += "&StartTime="+this.dayRange.StartTime;							//Can just provide date and not time
		requestUrl += "&EndTime="+this.dayRange.EndTime;							//Can just provide date and not time
		requestUrl += "&NumOfChannels=1";									//Assume nobody would have more than 10,000 channels
		requestUrl += "&StartChanId="+this.channid;
	} else {
		requestUrl += "&StartTime="+this.dayRange.StartTime;							//Can just provide date and not time
		requestUrl += "&EndTime="+this.dayRange.EndTime;							//Can just provide date and not time
		requestUrl += "&NumOfChannels=1";									//Assume nobody would have more than 10,000 channels
		requestUrl += "&StartChanId="+this.channid;
	}
	
	//Mojo.Log.info("URL is: "+requestUrl);
	
	
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


GuideAssistant.prototype.readStatusFail = function() {
	Mojo.Log.error("Failed to get guide information");	
	Mojo.Controller.errorDialog("Failed to get guide information");

};

GuideAssistant.prototype.readStatusSuccess = function(response) {
	
	var xmlstring = response.responseText.trim();
	//Mojo.Log.info("Got XML guide response from backend: "+xmlstring);
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, programGuideNode, programGuideSingleNode;
	var singleChannelNode, singleChannelChildNode, singleChannelJson;
	var singleProgramNode, singleProgramNode, singleProgramJson;
	var singleProgramChildNode;
	var StartTime, EndTime, StartChanId, EndChanId, NumOfChannels, Count, AsOf, Version, ProtoVer;
	
	var s = {};
	
	
	//Mojo.Log.error("about to start parsing");
	this.resultList.clear();
	this.channelList.clear();
	
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
							"chanNum": singleChannelNode.getAttributeNode("chanNum").nodeValue
						}	
						this.channelList.push(singleChannelJson);
						
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
									"stars": singleChannelChildNode.getAttributeNode("stars").nodeValue, 
									"endTime": singleChannelChildNode.getAttributeNode("endTime").nodeValue, 
				//					"airdate": singleChannelChildNode.getAttributeNode("airdate").nodeValue, 
									"startTime": singleChannelChildNode.getAttributeNode("startTime").nodeValue,
									"lastModified": singleChannelChildNode.getAttributeNode("lastModified").nodeValue, 
				//					"description": singleChannelChildNode.childNodes[0].nodeValue,
									"startTimeSpace": singleChannelChildNode.getAttributeNode("startTime").nodeValue.replace("T"," "),
									"endTimeSpace": singleChannelChildNode.getAttributeNode("endTime").nodeValue.replace("T"," "),  
									"recStatus": "-10"
								}
								if(singleProgramJson.chanNumInt == NaN) singleProgramJson.chanNumInt = 0;
								
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
				Mojo.Log.info('done parsing ProgramGuide');
				//Mojo.Log.error("full json is %j", this.resultList);
				//Mojo.Log.error("channels json is %j", this.channelList);
				if(this.channelMenuModel.items.length == 0) {
					this.channelList.sort(sort_by('chanNumInt', false));
					Mojo.Log.info("Didn't find any channels - adding now");
					Object.extend(this.channelMenuModel.items,this.channelList);
					
					this.controller.modelChanged(this.channelMenuModel);
					
				} 
				
				this.sortChanged();
				
				
				//Stop spinner and hide
				this.spinnerModel.spinning = false;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').hide()
	
				
				break;
			default:
				//Mojo.Log.error("node name is "+topSingleNode.nodeName);
				break;
		}
	}

};

GuideAssistant.prototype.sortChanged = function() {

		
	//Sort list by selection
	switch(this.layoutStyle) {
		case 'time':
			//Mojo.Log.error("layout style is time");
			this.resultList.sort(sort_by('chanNumInt', false));
		  break;
		case 'channel':
			//Mojo.Log.error("layout style is channel");
			this.resultList.sort(sort_by('startTime', false));
		  break;
		default :
			//Mojo.Log.error("layout style is unknpwn");
			this.resultList.sort(sort_by('chanNumInt', false));
		  break;
	}
	
	var listWidget = this.controller.get('guideList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	   
};

GuideAssistant.prototype.timePicker = function() {

	this.controller.showDialog({
		template: 'dialogs/dateAndTimePicker',
		assistant: new DateAndTimePickerAssistant(this, this.timeObject, this.timePickerCallback.bind(this))
	});
	
};


GuideAssistant.prototype.timePickerCallback = function(value) {


	//Restart spinner and show
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show()


	//Mojo.Log.error("callback is %j", value);
	//this.timeObject = dateJSToObject(value);
	this.timeJS = value;
	this.timeObject = dateJSToObject(value);
	this.timeISO = dateJSToISO(value);
	this.dayRange = dateObjectToDayRange(this.timeObject);
	this.day = this.timeObject.year+"-"+this.timeObject.month+"-"+this.timeObject.day;
	
	this.selectedTime();
	
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
		
		Mojo.Log.error("time object 2 is %j", this.timeObject2);
		
		this.newTime = new Date(this.timeObject2.year, (this.timeObject2.month-1), this.timeObject2.day, this.timeObject2.hour, this.timeObject2.minute, this.timeObject2.second);
		Mojo.Log.error("time is %j", this.newTime);
		
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

