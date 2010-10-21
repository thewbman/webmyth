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
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	  this.nullHandleCount = 0;
	 
	  //this.fullResultList = [];		//Full raw data 
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
	$('spinner-text').innerHTML = "Loading...";
	
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Upcoming Menu'),
                            items: [{},{},{ icon: 'refresh', command: 'go-refresh' }]};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	
	
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
	
	//Vibrate event
	Mojo.Event.listen(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
	
};

UpcomingAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Vibrate event
	Mojo.Event.stopListening(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
};

UpcomingAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

UpcomingAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.forward) {
  
	Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
  } else if(event.type == Mojo.Event.command) {

		switch(event.command) {
		  case 'go-refresh':		
		  
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show();
		
			this.getUpcoming();
			
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

UpcomingAssistant.prototype.handleShakestart = function(event) {

	Mojo.Log.info("Start Shaking");
	Event.stop(event);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show()	
	
	
	this.getUpcoming();
  
};




UpcomingAssistant.prototype.getUpcoming = function(event) {

	//Update list from webmyth python script
	Mojo.Log.info('Starting upcoming data gathering');
	
	this.controller.sceneScroller.mojo.revealTop();
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=getUpcoming";
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
            onSuccess: this.readRemoteDbTableSuccess.bind(this),
            onFailure: this.remoteDbTableFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

UpcomingAssistant.prototype.remoteDbTableFail = function(event) {
	Mojo.Log.error('Failed to get Ajax response');
	//
	
	this.resultList = [{ 'title':'Accesing remote table has failed.', 'subtitle':'Please check your server script.', 'starttime':''}];
	
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
	//return true;  //can escape this function for testing purposes
    
	//Mojo.Log.info('Got Ajax response: ' + response.responseText);
	
		
	//Update the list widget
	this.resultList.clear();
	Object.extend(this.resultList,response.responseJSON);
	
	$("scene-title").innerHTML = "Upcoming Recordings ("+this.resultList.length+" items)";
	
	for(var i = 0; i < this.resultList.length; i++) {
		this.resultList[i].startTime = this.resultList[i].starttime;
		this.resultList[i].chanId = this.resultList[i].chanid;
	}
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
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()

};

UpcomingAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	Mojo.Log.info("Started filtering with '%s'",filterString);
	
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
			else if (s.subtitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
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

UpcomingAssistant.prototype.goUpcomingDetails = function(event) {
	var upcoming_chanid = event.item.chanid;
	var upcoming_starttime = event.item.starttime;
	
	Mojo.Log.info("Selected individual recording: '%s' + '%s'", upcoming_chanid, upcoming_starttime);
	
	detailsObject = trimByChanidStarttime(this.resultList, upcoming_chanid, upcoming_starttime)

	//Mojo.Log.error("Selected object is: '%j'", detailsObject);
	
	//Open upcomingDetails communication scene
	//Mojo.Controller.stageController.pushScene("upcomingDetails", detailsObject);
	Mojo.Controller.stageController.pushScene("upcomingDetailsXML", upcoming_chanid, upcoming_starttime);
	
};

UpcomingAssistant.prototype.recorderDividerFunction = function(itemModel) {
	 
	//Divider function for list
    //return itemModel.title.toString()[0];	
	//return itemModel.starttime.substring(0,10);
	var date = new Date(isoToJS(itemModel.starttime));
	
	return date.toLocaleString().substring(0,15);
};

UpcomingAssistant.prototype.setMyData = function(propertyValue, model) {
	
	
	//And img source
	var channelIconUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetChannelIcon?ChanId=";
	channelIconUrl += model.chanid;
	
	//Mojo.Log.error("iconURL is "+channelIconUrl);
	
	//Mojo.Log.error('url is ' +screenshotUrl);
	model.myImgSrc = channelIconUrl;
	
	
	
	var upcomingDetailsText = '<div class="upcoming-list-item">';
	upcomingDetailsText += '<div class="title truncating-text left upcoming-list-title">&nbsp;'+model.title+'</div>';
	upcomingDetailsText += '<div class="palm-row-wrapper">';
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) upcomingDetailsText += '<div class="left-list-text">';
	
	upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subtitle+'&nbsp;</div>';
	upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.starttime+'&nbsp;</div>';
	upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.category+'</div>';
	upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.channum+" - "+model.channame+'</div>';
	
	
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		upcomingDetailsText += '</div>';
		upcomingDetailsText += '<div class="right-list-image">';
		upcomingDetailsText += '<img id="img-'+model.chanid+'T'+model.starttime+'" class="upcoming-channelicon-small" src="';
		upcomingDetailsText += 'http://'+WebMyth.prefsCookieObject.masterBackendIp+':6544/Myth/GetChannelIcon?ChanId='+model.chanid+'" />';
		upcomingDetailsText += '</div>';
	}
	
	upcomingDetailsText += '</div></div>';
		
	model.myData = upcomingDetailsText;
	
	
};