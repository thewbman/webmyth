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
 
 
function UpcomingXMLAssistant() {

	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down list
	  
	  this.failedGet = false;		//Assume we got a response unles told otherwise
}

UpcomingXMLAssistant.prototype.setup = function() {

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
		//listTemplate: "upcoming/upcomingListTemplate",
		dividerTemplate: "upcoming/upcomingDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.upcomingDividerFunction.bind(this),
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

UpcomingXMLAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Vibrate event
	Mojo.Event.listen(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
	
};

UpcomingXMLAssistant.prototype.deactivate = function(event) {
	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Vibrate event
	Mojo.Event.stopListening(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
};

UpcomingXMLAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

UpcomingXMLAssistant.prototype.handleCommand = function(event) {

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

UpcomingXMLAssistant.prototype.handleKey = function(event) {

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

UpcomingXMLAssistant.prototype.handleShakestart = function(event) {

	Mojo.Log.info("Start Shaking");
	Event.stop(event);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show()	
	
	
	this.getUpcoming();
  
};



UpcomingXMLAssistant.prototype.getUpcoming = function(event) {

	//Update list from webmyth python script
	Mojo.Log.info('Starting upcoming data gathering');
	
	this.controller.sceneScroller.mojo.revealTop();
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/mythweb/tv/upcoming";
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: false,
            evalXML: true,
            onSuccess: this.readRemoteDbTableSuccess.bind(this),
            onFailure: this.readRemoteDbTableFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

UpcomingXMLAssistant.prototype.readRemoteDbTableFail = function(response) {
	
	Mojo.Log.error('Failed to get response: %j',response);
	
	this.failedGet = true;
	
	var errorJson = { 'title':response.transport.status+' - Error Status', 'subTitle':'Please check your settings.', 'responseText':response.responseText};
	
	
	this.fullResultList.clear();
	this.fullResultList.push(errorJson);
	
	this.finishedReadingUpcoming();
	
};

UpcomingXMLAssistant.prototype.readRemoteDbTableSuccess = function(response) {

	this.failedGet = false;
    
	//Mojo.Log.info('Got HTML response: %j%', response.responseText);
	Mojo.Log.info('Got HTML response');
	
	//var singleUpcomingJson = {};
	
	this.fullResultList.clear();
	
	
	var scheduledPattern1 = /(<tr class="scheduled">[\s]+<td class="list">&nbsp;<\/td>[\s]+<td class=[^>]*>[-A-Za-z0-9_]+<\/td>[\s]+<td[^>]*><span[^>]*>[-A-Za-z0-9_\s]+<\/span><a[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/a>[\s]+<\/td>[\s]+<td[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/td>[\s]+<td[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/td>[\s]+<td[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/td>)/g;
	var scheduledMatches1 = response.responseText.match(scheduledPattern1);
	Mojo.Log.info("%s scheduled matches1 span are %j", scheduledMatches1.length, scheduledMatches1[0]);
	
	
	var scheduledPattern2 = /(<tr class="scheduled">[\s]+<td class="list">&nbsp;<\/td>[\s]+<td class=[^>]*>[-A-Za-z0-9_]+<\/td>[\s]+<td[^>]*><a[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/a>[\s]+<\/td>[\s]+<td[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/td>[\s]+<td[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/td>[\s]+<td[^>]*>[-A-Za-z0-9_\s:,\(\)]+<\/td>)/g;
	var scheduledMatches2 = response.responseText.match(scheduledPattern2);	
	Mojo.Log.info("%s scheduled matches2 a are %j", scheduledMatches2.length, scheduledMatches2[0]);
	
	
	//Parse recordings with HD
	var i = 0;
	for(i = 0; i < scheduledMatches1.length; i++) {
		//Mojo.Log.info("Parsing span match "+i);
		var match = scheduledMatches1[i].replace("&nbsp;"," ").replace("nowrap","") + "</tr>";
		//Mojo.Log.info("Text is "+match);
		
		var xmlobject = (new DOMParser()).parseFromString(match, "text/xml");
		
		var tableRowNode = xmlobject.childNodes[0];
		
		/*
		for(var j = 0; j < tableRowNode.childNodes.length; j++) {
			if(tableRowNode.childNodes[j].nodeName == "td") {
				//Mojo.Log.info("Node name "+j+" is "+tableRowNode.childNodes[j].nodeName+" and value is "+tableRowNode.childNodes[j].childNodes[0].nodeValue);
			} else {
				//Mojo.Log.info("Node name "+j+" is "+tableRowNode.childNodes[j].nodeName+" and value is "+tableRowNode.childNodes[j].nodeValue);
			}
		}
		*/
		
		var singleUpcomingJson = {
			
			hdtv: true,
			
			//child node 1 is blank list spacer
			encoderId: tableRowNode.childNodes[3].childNodes[0].nodeValue,
			program: tableRowNode.childNodes[5].childNodes[1].getAttributeNode("id").nodeValue,
			chanId: tableRowNode.childNodes[5].childNodes[1].getAttributeNode("id").nodeValue.split("-")[1],
			startEpoch: tableRowNode.childNodes[5].childNodes[1].getAttributeNode("id").nodeValue.split("-")[2],
			recording: tableRowNode.childNodes[5].childNodes[1].childNodes[0].nodeValue,
			title: tableRowNode.childNodes[5].childNodes[1].childNodes[0].nodeValue.split(":")[0],
			subTitle: tableRowNode.childNodes[5].childNodes[1].childNodes[0].nodeValue.split(":")[1],
			channel: tableRowNode.childNodes[7].childNodes[0].nodeValue,
			startDate: tableRowNode.childNodes[9].childNodes[0].nodeValue,
			length: tableRowNode.childNodes[11].childNodes[0].nodeValue
		
		}
		
		try {
			var myDate = new Date(parseInt(tableRowNode.childNodes[5].childNodes[1].getAttributeNode("id").nodeValue.split("-")[2])*1000);
			singleUpcomingJson.startTime = dateJSToISO(myDate).replace("T"," ");
		} catch(e) {
			singleUpcomingJson.startTime = tableRowNode.childNodes[5].childNodes[1].getAttributeNode("id").nodeValue.split("-")[2];
		}
		
		if(singleUpcomingJson.subTitle) {
			singleUpcomingJson.subTitle = singleUpcomingJson.subTitle.trim();
		} else {
			singleUpcomingJson.subTitle = "";
		}
		
		//Mojo.Log.info("Recording json is %j",singleUpcomingJson);
		
		this.fullResultList.push(singleUpcomingJson);
		
	}
	
	
	
	
	Mojo.Log.info("Done parsing HTML");
	
	
	this.finishedReadingUpcoming();
	
};

UpcomingXMLAssistant.prototype.finishedReadingUpcoming = function() {
	
	
		
	//Update the list widget
	this.resultList.clear();
	Object.extend(this.resultList,this.fullResultList);
	
	$("scene-title").innerHTML = "Upcoming Recordings ("+this.resultList.length+" items)";
	
	/*
	for(var i = 0; i < this.resultList.length; i++) {
		this.resultList[i].startTime = this.resultList[i].startTime;
		this.resultList[i].chanId = this.resultList[i].chanid;
	}
	//this.fullResultList.sort(double_sort_by('startTime', 'title', false));
	*/
	
	
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

UpcomingXMLAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	Mojo.Log.info("Started filtering with '%s' length of %s",filterString,count);
	
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
			else if (s.channel.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in channel name", i);
				someList.push(s);
			}/*
			else if (s.category.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in category", i);
				someList.push(s);
			}
			*/
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
	
	
	//Mojo.Log.info("finsihed filtering");
	
};	

UpcomingXMLAssistant.prototype.goUpcomingDetails = function(event) {
	var upcoming_chanid = event.item.chanId;
	var upcoming_startTime = event.item.startTime;
	
	Mojo.Log.info("Selected individual recording: '%s' + '%s'", upcoming_chanid, upcoming_startTime);
	
	detailsObject = trimByChanidStarttime(this.resultList, upcoming_chanid, upcoming_startTime)

	//Mojo.Log.error("Selected object is: '%j'", detailsObject);
	
	//Open upcomingDetails communication scene
	//Mojo.Controller.stageController.pushScene("upcomingDetails", detailsObject);
	Mojo.Controller.stageController.pushScene("upcomingDetailsXML", upcoming_chanid, upcoming_startTime);
	
};

UpcomingXMLAssistant.prototype.upcomingDividerFunction = function(itemModel) {
	 
	//Divider function for list
    //return itemModel.title.toString()[0];	
	//return itemModel.startTime.substring(0,10);
	//var date = new Date(isoToJS(itemModel.startTime));
	
	//return date.toLocaleString().substring(0,15);
	//return itemModel.channel;
	if(this.failedGet) {
		return "ERROR";
	} else {
		return itemModel.startDate.substring(0,16);
	}
};

UpcomingXMLAssistant.prototype.setMyData = function(propertyValue, model) {

	if(this.failedGet) {
		var upcomingDetailsText = '<div class="upcoming-list-item">';
		upcomingDetailsText += '<div class="title truncating-text left upcoming-list-title">&nbsp;'+model.title+'</div>';
		upcomingDetailsText += '<div class="palm-row-wrapper">';
		
		
		upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subTitle+'&nbsp;</div>';
		upcomingDetailsText += '<div class="palm-info-text left">&nbsp;&nbsp;'+model.responseText+'&nbsp;</div>';
		
		
		
		upcomingDetailsText += '</div></div>';
	
	} else {
		var upcomingDetailsText = '<div class="upcoming-list-item">';
		upcomingDetailsText += '<div class="title truncating-text left upcoming-list-title">&nbsp;'+model.title+'</div>';
		upcomingDetailsText += '<div class="palm-row-wrapper">';
		
		if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) upcomingDetailsText += '<div class="left-list-text">';
		
		upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subTitle+'&nbsp;</div>';
		upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.startTime+'&nbsp;</div>';
		//asdf fix category
		upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.length+'</div>';
		upcomingDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.channel+'</div>';
		
		
		
		if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
			upcomingDetailsText += '</div>';
			upcomingDetailsText += '<div class="right-list-image">';
			upcomingDetailsText += '<img id="img-'+model.chanId+'T'+model.startTime+'" class="upcoming-channelicon-small" src="';
			upcomingDetailsText += 'http://'+WebMyth.prefsCookieObject.masterBackendIp+':6544/Myth/GetChannelIcon?ChanId='+model.chanId+'" />';
			upcomingDetailsText += '</div>';
		}
		
		upcomingDetailsText += '</div></div>';
	}
		
	model.myData = upcomingDetailsText;
	
	
	//model.myData = model.recording;
	
	
};