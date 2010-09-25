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
	this.timeISO;
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
				{ icon: 'back', command: 'do-guidePrevious'},
				{ label: "Program Guide", width: 200, command: 'do-revealTop' },
				{ icon: 'forward', command: 'do-guideNext'}
			]
		}]
	}; 
	this.controller.setupWidget( Mojo.Menu.viewMenu, this.guideViewMenuAttr, this.guideViewMenuModel );
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Guide Menu'), items: [
		{},
        { toggleCmd: 'do-selectTime', items: [{label: $L('Time'), command:'do-selectTime'},{label: $L('Channel'), command: 'do-selectChannel', submenu:'channel-menu'}]},
		{}]
	};
	this.channelMenuModel = { label: $L('Channel'), items: [] };
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('channel-menu', '', this.channelMenuModel);
	
	
	// Guide filter list
	this.guideListAttribs = {
		itemTemplate: "guide/guideListItem",
		//listTemplate: "guide/guideListTemplate",
		//dividerTemplate: "guide/guideDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this)//,
		//dividerFunction: this.guideDividerFunction.bind(this),
		//formatters:{myData: this.setMyData.bind(this)}
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
			this.currentTimeObject = response.localtime;
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
			  break;
			case 'do-guideNext':
				//adsf
				Mojo.Log.error("selected guide next");
			  break;
			case 'do-revealTop':
				//adsf
				this.controller.sceneScroller.mojo.revealTop();
			  break;
			case 'do-selectTime':
				//adsf
				Mojo.Log.info("selected time");
				
				//Update command menu
				this.cmdMenuModel.items[1].toggleCmd = 'do-selectTime';
				this.cmdMenuModel.items[1].items[1].label = 'Channel';
				this.controller.modelChanged(this.cmdMenuModel);
				
				//Update header label
				this.guideViewMenuModel.items[0].items[1].label = this.timeISO;
				this.controller.modelChanged(this.guideViewMenuModel);
				
				//Add popup selector later
				this.layoutStyle = 'time';
				this.controller.sceneScroller.mojo.revealTop();
				this.filterListFunction(' ', this.controller.get('guideList'), 0, this.resultList.length);
				this.getGuideData();
					
			  break;
			default:
				if(event.command.substring(0,10) == 'go-channel') {
					//User tapped channel button
					
					var chanString = event.command.substring(13);  //gets rid of 'go-channel___
					Mojo.Log.info("selected channel list: "+chanString);
					this.channid = chanString.substring(0, chanString.search('---'));
					this.chanNum = chanString.substring((chanString.search('---')+3));
					//Mojo.Log.info("channid is %s",this.channid);
					//Mojo.Log.info("chanNum is %s",this.chanNum);
					
					this.layoutStyle = 'channel';
					
					//Update channel command menu label
					this.cmdMenuModel.items[1].toggleCmd = 'do-selectChannel';
					this.cmdMenuModel.items[1].items[1].label = 'Channel: '+this.chanNum;
					this.controller.modelChanged(this.cmdMenuModel);
					
					//Update header label
					this.guideViewMenuModel.items[0].items[1].label = this.day;
					this.controller.modelChanged(this.guideViewMenuModel);
					
					//Request and show data
					this.controller.sceneScroller.mojo.revealTop();
					this.filterListFunction(' ', this.controller.get('guideList'), 0, this.resultList.length);
					this.getGuideData();
					
					
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

		Mojo.Log.info("No filter string");

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
	//
};


GuideAssistant.prototype.guideDividerFunction = function(itemModel) {
	itemModel.startTime;
};


GuideAssistant.prototype.setMyData = function(propertyValue, model) {
	//
};


GuideAssistant.prototype.getGuideData = function() {
	
	//Use XML to get guide data
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetProgramGuide?Details=0";
	
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


GuideAssistant.prototype.readStatusFail = function(response) {
	Mojo.Log.error("Failed to get guide information");	
};

GuideAssistant.prototype.readStatusSuccess = function(response) {
	
	var xmlstring = response.responseText.trim();
	//Mojo.Log.info("Got XML guide response from backend: "+xmlstring);
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, programGuideNode, programGuideSingleNode;
	var singleChannelNode, singleChannelChildNode, singleChannelJson;
	var singleProgramNode, singleProgramNode, singleProgramJson;
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
							command: "go-channel___"+singleChannelNode.getAttributeNode("chanId").nodeValue+"---"+singleChannelNode.getAttributeNode("chanNum").nodeValue
						}	
						this.channelList.push(singleChannelJson);
						
						for(var k = 0; k < singleChannelNode.childNodes.length; k++) {
							singleChannelChildNode = singleChannelNode.childNodes[k];
							//Mojo.Log.error("node name is "+singleChannelChildNode.nodeName);
							if(singleChannelChildNode.nodeName == 'Program') {
								singleProgramJson = {
									"channelName": singleChannelNode.getAttributeNode("channelName").nodeValue, 
									"chanId": singleChannelNode.getAttributeNode("chanId").nodeValue, 
									"chanNum": singleChannelNode.getAttributeNode("chanNum").nodeValue, 
									"chanNumInt": parseInt(singleChannelNode.getAttributeNode("chanNum").nodeValue), 
									"callSign": singleChannelNode.getAttributeNode("callSign").nodeValue, 
									"title": singleChannelChildNode.getAttributeNode("title").nodeValue, 
									"subTitle": singleChannelChildNode.getAttributeNode("subTitle").nodeValue, 
									"category": singleChannelChildNode.getAttributeNode("category").nodeValue, 
									"catType": singleChannelChildNode.getAttributeNode("catType").nodeValue, 
									"repeat": singleChannelChildNode.getAttributeNode("repeat").nodeValue, 
									"endTime": singleChannelChildNode.getAttributeNode("endTime").nodeValue, 
									"startTime": singleChannelChildNode.getAttributeNode("startTime").nodeValue
								}
								if(singleProgramJson.chanNumInt == NaN) singleProgramJson.chanNumInt = 0;
								this.resultList.push(singleProgramJson);
								//Mojo.Log.error("program json is %j", singleProgramJson);
							}
						}
					}
				}
				//Mojo.Log.error('done parsing ProgramGuide');
				//Mojo.Log.error("full json is %j", this.resultList);
				//Mojo.Log.error("channels json is %j", this.channelList);
				if(this.channelMenuModel.items.length == 0) {
					this.channelList.sort(sort_by('chanNumInt', false));
					Mojo.Log.error("didn't find any channels - adding now");
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
			this.resultList.sort(sort_by('startTime', false));
		  break;
	}
	
	var listWidget = this.controller.get('guideList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	   
};