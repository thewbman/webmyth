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
 
 
 function UpcomingAssistant() {
	   
	  this.nullHandleCount = 0;
	 
	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down list
	  
}

UpcomingAssistant.prototype.setup = function() {

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
    this.cmdMenuModel = { label: $L('Upcoming Menu'),
                            items: [{},{},{ icon: 'refresh', command: 'go-refresh' },{},{label: $L('Group'), submenu:'group-menu', width: 90}]};
	this.groupMenuModel = { label: $L('Group'), items: [{"label": WebMyth.prefsCookieObject.currentUpcomingGroup, "command": "go-group--"+WebMyth.prefsCookieObject.currentUpcomingGroup }]};
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('group-menu', '', this.groupMenuModel);
	
	
	
	// 'upcoming' widget filter list
	this.upcomingListAttribs = {
		itemTemplate: "upcoming/upcomingListItem",
		listTemplate: "upcoming/upcomingListTemplate",
		dividerTemplate: "upcoming/upcomingDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.recorderDividerFunction.bind(this),
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.upcomingListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "upcomingList" , this.upcomingListAttribs, this.upcomingListModel);
	
	
	//Event listeners
	this.controller.listen(this.controller.get( "upcomingList" ), Mojo.Event.listTap, this.goUpcomingDetails.bind(this));
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	this.getUpcoming();
	
	
};

UpcomingAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

UpcomingAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
};

UpcomingAssistant.prototype.cleanup = function(event) {

};

UpcomingAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.forward) {
  
	Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
  } else if(event.type == Mojo.Event.command) {
		myCommand = event.command.substring(0,10);
		mySelection = event.command.substring(10);
		//Mojo.Log.error("command: "+myCommand+" selection: "+mySelection);

		switch(myCommand) {
			case 'go-refresh':		
			  
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel, this);
				$('myScrim').show();
			
				this.getUpcoming();
				
			  break;
			case 'go-group--':	

				this.controller.sceneScroller.mojo.revealTop();			
			  
				this.groupChanged(mySelection);
				
			  break;
		}
	}
  
};

UpcomingAssistant.prototype.handleKey = function(event) {

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




UpcomingAssistant.prototype.getUpcoming = function(event) {

	//Update list from webmyth python script
	Mojo.Log.info('Starting upcoming data gathering');
	
	this.controller.sceneScroller.mojo.revealTop();
	
	
	if(WebMyth.usePlugin){
		
		this.controller.window.setTimeout(this.getUpcomingPlugin.bind(this), 100);
		
	} else if(WebMyth.useService){
		Mojo.Log.info("Using protocol service to get upcoming");
	
		//adsf - Add back service command here
		
				this.controller.serviceRequest('palm://com.thewbman.webmyth.service', {
			method:"mythprotocolCommand",
				parameters:{
					"port":"6543", 
					"address":WebMyth.prefsCookieObject.masterBackendIp,
					"protocolVersion": WebMyth.prefsCookieObject.protoVer,
					"command": "QUERY_GETALLPENDING",
					"timeout": 8000								//gives service 8 full seconds to get all data, will return earlier if done
					},
				onSuccess: this.readUpcomingServiceSuccess.bind(this),
				onFailure: this.remoteDbTableFail.bind(this)
			});
		
		//asdf
		
	} else { 
	
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=getPending";				//matches any recording rule
	
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.readRemoteDbTableSuccess.bind(this),
            onFailure: this.remoteDbTableFail.bind(this)  
        });
		
    }
	
};

UpcomingAssistant.prototype.getUpcomingPlugin = function() {

	//Mojo.Log.error("Using protocol plugin to get upcoming");
	
	WebMyth.hasConflicts = 0;
		
	try{ 
	
		var response1 = $('webmyth_service_id').mythprotocolBackgroundCommand(WebMyth.prefsCookieObject.masterBackendIp, WebMyth.prefsCookieObject.masterBackendPort, WebMyth.prefsCookieObject.protoVer, "QUERY_GETALLPENDING");
	
		Mojo.Log.info("Got mythprotocolBackgroundCommand response: "+response1);
		$('webmyth_service_id').backgroundProtocolCommandResponse = this.backgroundProtocolCommandResponse.bind(this);    
   
	
		//var response1 = $('webmyth_service_id').mythprotocolCommand(WebMyth.prefsCookieObject.masterBackendIp, WebMyth.prefsCookieObject.masterBackendPort, WebMyth.prefsCookieObject.protoVer, "QUERY_GETALLPENDING");
	
		//$('debugText').innerText = response1;
		//Mojo.Log.error("plugin response with length "+response1.length+" is "+response1);
		
		//var pluginResponseList = parseUpcomingPlugin(response1);
		
		//Mojo.Log.info('parseUpcomingPlugin: %j', pluginResponseList);
		/*
		this.fullResultList.clear();
		//Object.extend(this.fullResultList,cleanUpcoming(pluginResponseList));
		//Object.extend(this.fullResultList,cleanUpcoming(parseUpcomingPlugin(response1)));
		Object.extend(this.fullResultList,parseUpcomingPlugin(response1));
			
		//Mojo.Log.error('Cleaned upcoming: %j', this.fullResultList);
			
		if(WebMyth.hasConflicts != 0){
			Mojo.Controller.getAppController().showBanner("There are conflicting recordings", {source: 'notification'});
		} 
			
		this.groupChanged(WebMyth.prefsCookieObject.currentUpcomingGroup);
		*/
	
	} catch(e) {
	
		Mojo.Log.error('Failed to get Upcoming plugin response: %s',e);
		
		Mojo.Controller.getAppController().showBanner("Plugin failed, trying script method", {source: 'notification'});
		
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=getPending";				//matches any recording rule
	
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.readRemoteDbTableSuccess.bind(this),
            onFailure: this.remoteDbTableFail.bind(this)  
        });
		
	}
	
};

UpcomingAssistant.prototype.backgroundProtocolCommandResponse = function(response2) {

	this.fullResultList.clear();
	Object.extend(this.fullResultList,parseUpcomingPlugin(response2));
			
	//Mojo.Log.error('Cleaned upcoming: %j', this.fullResultList);
			
	if(WebMyth.hasConflicts != 0){
		Mojo.Controller.getAppController().showBanner("There are conflicting recordings", {source: 'notification'});
	} 
			
	this.groupChanged(WebMyth.prefsCookieObject.currentUpcomingGroup);

}

UpcomingAssistant.prototype.readUpcomingServiceSuccess = function(response) {
	
	//Mojo.Log.info('Got service response: %j', response.reply);
	
	Mojo.Log.info('Got service response stats: %j', response.stats);
	
	if(response.stats.expectedLength != response.stats.parsedPrograms){
		Mojo.Log.error("Got response mismatch: %j",response.stats);
		Mojo.Controller.getAppController().showBanner("ERROR - should have "+response.stats.expectedLength+" programs", {source: 'notification'});
		
	}
	
		
	//Update the list widget
	this.fullResultList.clear();
	//var cleanedUpcomingResponse = cleanUpcoming(response.reply);
	Object.extend(this.fullResultList,cleanUpcoming(response.reply));
	
	Mojo.Log.info('Cleaned upcoming: %j', this.fullResultList);
	
	if(response.stats.conflicts != 0){
		Mojo.Controller.getAppController().showBanner("There are conflicting recordings", {source: 'notification'});
	} 
	
	this.groupChanged(WebMyth.prefsCookieObject.currentUpcomingGroup);
	
}

UpcomingAssistant.prototype.remoteDbTableFail = function(response) {
	Mojo.Log.error('Failed to get Upcoming response = %j',response);
	
	
	this.resultList = [{ 'title':'Accesing remote table has failed.', 'subTitle':'Please check your settings', 'startTime':'1900-01-01T00:00:00'}];
	
	//Initial display
	var listWidget = this.controller.get('upcomingList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()	
	//$('failtext').innerHtml = "Failed to connect to remote script.  Please check you script setup.";
};

UpcomingAssistant.prototype.readRemoteDbTableSuccess = function(response) {
    
	//Mojo.Log.info('Got Ajax response: ' + response.responseText);
	var conflicts = 0, s = {};
	
		
	//Update the list widget
	this.fullResultList.clear();
	//var cleanedUpcomingResponse = cleanUpcoming(response.responseJSON);
	//Object.extend(this.fullResultList,cleanedUpcomingResponse.fullUpcomingList);
	Object.extend(this.fullResultList,cleanUpcoming(response.responseJSON));
	
	Mojo.Log.info('Cleaned upcoming: %j', this.fullResultList);
	
	for(var i = 0; i < this.fullResultList.length; i++){
		//s = this.fullResultList[i];
		
		//Mojo.Log.info("checking upcoming program %j",s);
		if(this.fullResultList[i].recStatus == 7){
			conflicts++;
		}
	}
	
	Mojo.Log.info("Found "+conflicts+" conflicts");
	
	if(conflicts > 0){
		Mojo.Controller.getAppController().showBanner("There are conflicting recordings", {source: 'notification'});
	} 
	
	this.groupChanged(WebMyth.prefsCookieObject.currentUpcomingGroup);
	
};

UpcomingAssistant.prototype.groupChanged = function(newGroup) {

	WebMyth.prefsCookieObject.currentUpcomingGroup = newGroup;
	
	Mojo.Log.info("The current upcoming group has changed to "+WebMyth.prefsCookieObject.currentUpcomingGroup);
	
	//Update results list from filter
	this.resultList.clear();
	Object.extend(this.resultList, trimByUpcomingGroup(this.fullResultList, WebMyth.prefsCookieObject.currentUpcomingGroup));
	//Object.extend(this.resultList, this.fullResultList);
	
	//Mojo.Log.info("grouped upcoming list is %j",this.resultList);
	
	
	$("scene-title").innerHTML = $L("Upcoming Recordings")+" ("+this.resultList.length+" items)";
	
	//this.fullResultList.sort(double_sort_by('starttime', 'title', false));
	
	
	//this.resultList.clear();
	//Object.extend(this.resultList,response.responseJSON);
	//this.resultList.sort(double_sort_by('starttime', 'title', false));
	//Object.extend(this.resultList, trimByRecgroup(this.fullResultList, this.selectorsModel.currentRecgroup));
	
	
	
	//Initial display
	var listWidget = this.controller.get('upcomingList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	//Mojo.Controller.getAppController().showBanner("Updated with latest data", {source: 'notification'});
	
	this.updateGroupMenu();
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()

};

UpcomingAssistant.prototype.updateGroupMenu = function() {
	
	//Reset default sorting
	this.groupMenuModel.items = [ 
			{"label": $L('All'), "command": "go-group--All"},
			{"label": $L('Conflicting'), "command": "go-group--Conflicting"},
			{"label": $L('Overrides'), "command": "go-group--Overrides"},
			{"label": $L('Upcoming'), "command": "go-group--Upcoming"}
	] ;
	
	switch(WebMyth.prefsCookieObject.currentUpcomingGroup) {
		case 'All':
			this.groupMenuModel.items[0].label = '- '+this.groupMenuModel.items[0].label+' -';
		  break;
		case 'Conflicting':
			this.groupMenuModel.items[1].label = '- '+this.groupMenuModel.items[1].label+' -';
		  break;
		case 'Overrides':
			this.groupMenuModel.items[2].label = '- '+this.groupMenuModel.items[2].label+' -';
		  break;
		case 'Upcoming':
			this.groupMenuModel.items[3].label = '- '+this.groupMenuModel.items[3].label+' -';
		  break;
		default :
			//this.groupMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.groupMenuModel);
	
}

UpcomingAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
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
			if (s.title.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
				//Mojo.Log.info("Found string in title", i);
				someList.push(s);
			}
			else if (s.subTitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subtitle", i);
				someList.push(s);
			}
			else if (s.channame.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in channel name", i);
				someList.push(s);
			}
			else if (s.category.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in category", i);
				someList.push(s);
			}
			else if (s.recStatusText.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in recStatusText", i);
				someList.push(s);
			}
		}
	}
	else {

		//Mojo.Log.info("No filter string");

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

UpcomingAssistant.prototype.goUpcomingDetails = function(event) {
	var upcoming_chanid = event.item.chanId;
	var upcoming_starttime = event.item.startTime;
	
	Mojo.Log.info("Selected individual recording: '%s' + '%s'", upcoming_chanid, upcoming_starttime);
	
	detailsObject = trimByChanidStarttime(this.resultList, upcoming_chanid, upcoming_starttime)

	//Mojo.Log.error("Selected object is: '%j'", detailsObject);
	
	//Open upcomingDetails communication scene
	//Mojo.Controller.stageController.pushScene("upcomingDetails", detailsObject);
	Mojo.Controller.stageController.pushScene("upcomingDetailsXML", upcoming_chanid, upcoming_starttime);
	
};

UpcomingAssistant.prototype.recorderDividerFunction = function(itemModel) {
	
	if((WebMyth.useService)||(WebMyth.usePlugin)){
		var date = new Date(isoToJS(itemModel.startTime));
	
		return date.toLocaleString().substring(0,15);
	} else {
		var date = new Date(isoToJS(itemModel.starttime));
	
		return date.toLocaleString().substring(0,15);
	}
};

UpcomingAssistant.prototype.setMyData = function(propertyValue, model) {
	
	
	//And img source
	var channelIconUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetChannelIcon?ChanId=";
	channelIconUrl += model.chanId;
	
	//Mojo.Log.info("iconURL is "+channelIconUrl);
	
	
	
	var upcomingDetailsText = '<div class="upcoming-list-item">';
	upcomingDetailsText += '<div class="title truncating-text left upcoming-list-title">&nbsp;'+model.title+'</div>';
	upcomingDetailsText += '<div class="palm-row-wrapper">';
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) upcomingDetailsText += '<div class="left-list-text">';
	
	upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subTitle+'&nbsp;</div>';
	upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.startTimeSpace+'&nbsp;</div>';
	upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.category+'</div>';
	
	if(model.recStatus == '-1') {
		if((model.recType == '8')||(model.recType == '7')) {
			upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;(Forced) '+model.channum+" - "+model.channame+'</div>';
		} else {
			upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.channum+" - "+model.channame+'</div>';
		}
	} else {
		upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.recStatusText+'</div>';
	}
	
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		upcomingDetailsText += '</div>';
		upcomingDetailsText += '<div class="right-list-image">';
		upcomingDetailsText += '<img id="img-'+model.chanId+'T'+model.startTime+'" class="upcoming-channelicon-small" src="';
		upcomingDetailsText += channelIconUrl+'" />';
		upcomingDetailsText += '</div>';
	}
	
	upcomingDetailsText += '</div></div>';
		
	model.myData = upcomingDetailsText;
	
	
};