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
 
 
 function VideosAssistant() {
 
	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down list
	  
	  this.storageGroups = [];		//Storage group directories
	  
}

VideosAssistant.prototype.setup = function() {

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
    this.cmdMenuModel = { label: $L('Videos Menu'),
                            items: [{label: $L('Sort'), submenu:'sort-menu', width: 90},{ icon: 'refresh', command: 'go-refresh' },{label: $L('Group'), submenu:'group-menu', width: 90}]};
 
	this.sortMenuModel = { label: $L('Sort'), items: []};
	
	this.groupMenuModel = { label: $L('Group'), items: [
		{"label": "All", "command": "go-groupall" },
		{"label": "Regular", "command": "go-groupVideo" },
		{"label": "TV", "command": "go-groupTV" },
		{"label": "Specials", "command": "go-groupSpecial" }
	]};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('sort-menu', '', this.sortMenuModel);
	this.controller.setupWidget('group-menu', '', this.groupMenuModel);

	
	
	// Videos widget filter list
	this.videosListAttribs = {
		itemTemplate: "videos/videosListItem",
		dividerTemplate: "videos/videosDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.videosDividerFunction.bind(this),
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.videosListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "videosList" , this.videosListAttribs, this.videosListModel);
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "videosList" ), Mojo.Event.listTap, this.goVideosDetails.bind(this));
	Mojo.Event.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	//Storage groups for video playback
	this.getStorageGroups();
	
	//List of videos
	this.getVideos();


};

VideosAssistant.prototype.activate = function(event) {


	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

VideosAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

VideosAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

VideosAssistant.prototype.handleCommand = function(event) {

	 if(event.type == Mojo.Event.command) {
		myCommand = event.command.substring(0,7);
		mySelection = event.command.substring(8);
		Mojo.Log.error("command: "+myCommand+" host: "+mySelection);

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
			this.videosGroupChanged(mySelection);
		   break;
		  case 'go-refr':		//refresh
		  
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show();
		
			this.getVideos();
			
		   break;
		}
	  } else if(event.type == Mojo.Event.forward) {
		
			Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	  }
  
};

VideosAssistant.prototype.handleKey = function(event) {

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




VideosAssistant.prototype.getStorageGroups = function(event) {

	//Update list from webmyth python script
	Mojo.Log.info('Starting storage groups data gathering');
	
	this.controller.sceneScroller.mojo.revealTop();
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=getStorageGroup";				
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.readStorageGroupsSuccess.bind(this),
            onFailure: this.readStorageGroupsFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

VideosAssistant.prototype.readStorageGroupsFail = function(event) {

	Mojo.Log.error('Failed to get storage group response');
	
};

VideosAssistant.prototype.readStorageGroupsSuccess = function(response) {
	//return true;  //can escape this function for testing purposes
    
	//Mojo.Log.info('Got storage group response: %j',response.responseJSON);
	
	//Update the storage group list
	this.storageGroups.clear();
	Object.extend(this.storageGroups,response.responseJSON);
	
	
}

VideosAssistant.prototype.getVideos = function(event) {

	//Update list from webmyth python script
	Mojo.Log.info('Starting videos data gathering');
	
	this.controller.sceneScroller.mojo.revealTop();
	
	
	
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	//requestUrl += "?op=getVideos";	
	requestUrl += "?op=getSQL&table=videometadata";
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.readRemoteDbTableSuccess.bind(this),
            onFailure: this.readRemoteDbTableFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

VideosAssistant.prototype.readRemoteDbTableFail = function(event) {

	Mojo.Log.error('Failed to get Videos response');
	
	this.resultList = [{ 'title':'Accesing remote table has failed.', 'subtitle':'Please check your server script.', 'starttime':''}];
	
	//Initial display
	var listWidget = this.controller.get('videosList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()	
	//$('failtext').innerHtml = "Failed to connect to remote script.  Please check you script setup.";
	
};

VideosAssistant.prototype.readRemoteDbTableSuccess = function(response) {
	//return true;  //can escape this function for testing purposes
    
	//Mojo.Log.info('Got Videos response: %j',response.responseJSON);
	
		
	//Update the list widget
	this.fullResultList.clear();
	Object.extend(this.fullResultList,cleanVideos(response.responseJSON));
	
	
	//Mojo.Log.info('Cleaned Videos is: %j',this.fullResultList);
	
	
	//$("scene-title").innerHTML = "Videos ("+this.fullResultList.length+" items)";
	
	this.finishedReadingVideos();
	
}

VideosAssistant.prototype.finishedReadingVideos = function() {

	this.sortChanged(WebMyth.prefsCookieObject.currentVideosSort);
	
}

VideosAssistant.prototype.sortChanged = function(newSort) {

	//Add sorting options here
	Mojo.Log.info("new sort is "+newSort);
	
	WebMyth.prefsCookieObject.currentVideosSort = newSort;
	
	//Sort list
	switch(WebMyth.prefsCookieObject.currentVideosSort) {
		case 'insert-asc':
			this.fullResultList.sort(double_sort_by('insertdate', 'title', false));
		  break;
		case 'insert-desc':
			this.fullResultList.sort(double_sort_by('insertdate', 'title', true));
		  break;
		case 'released-asc':
			this.fullResultList.sort(triple_sort_by('releasedate', 'title', 'fullEpisode', false));
		  break;
		case 'released-desc':
			this.fullResultList.sort(triple_sort_by('releasedate', 'title', 'fullEpisode', true));
		  break;
		case 'season-asc':
			this.fullResultList.sort(triple_sort_by('season', 'title', 'fullEpisode', false));
		  break;
		case 'season-desc':
			this.fullResultList.sort(triple_sort_by('season', 'title', 'fullEpisode', true));
		  break;
		case 'title-asc':
			this.fullResultList.sort(double_sort_by('title', 'fullEpisode', false));
		  break;
		case 'title-desc':
			this.fullResultList.sort(double_sort_by('title', 'fullEpisode', true));
		  break;
		default :
			this.fullResultList.sort(double_sort_by('startTime', 'title', false));
		  break;
	}
	
	
	this.videosGroupChanged(WebMyth.prefsCookieObject.currentVideosGroup);
	
	this.updateSortMenu();

}

VideosAssistant.prototype.updateSortMenu = function() {
	
	//Reset default sorting
	this.sortMenuModel.items = [ 
			{"label": $L('Date Added-Asc'), "command": "go-sort-insert-asc"},
			{"label": $L('Date Added-Desc'), "command": "go-sort-insert-desc"},
			{"label": $L('Released-Asc'), "command": "go-sort-released-asc"},
			{"label": $L('Released-Desc'), "command": "go-sort-released-desc"},
			{"label": $L('Season-Asc'), "command": "go-sort-season-asc"},
			{"label": $L('Season-Desc'), "command": "go-sort-season-desc"},
			{"label": $L('Title-Asc'), "command": "go-sort-title-asc"},
			{"label": $L('Title-Desc'), "command": "go-sort-title-desc"}
	] ;
	
	switch(WebMyth.prefsCookieObject.currentVideosSort) {
		case 'insert-asc':
			this.sortMenuModel.items[0].label = '- Date Added-Asc -';
		  break;
		case 'insert-desc':
			this.sortMenuModel.items[1].label = '- Date Added-Desc -';
		  break;
		case 'released-asc':
			this.sortMenuModel.items[2].label = '- Released-Asc -';
		  break;
		case 'released-desc':
			this.sortMenuModel.items[3].label = '- Released-Desc -';
		  break;
		case 'season-asc':
			this.sortMenuModel.items[4].label = '- Season-Asc -';
		  break;
		case 'season-desc':
			this.sortMenuModel.items[5].label = '- Season-Desc -';
		  break;
		case 'title-asc':
			this.sortMenuModel.items[6].label = '- Title-Asc -';
		  break;
		case 'title-desc':
			this.sortMenuModel.items[7].label = '- Title-Desc -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.sortMenuModel);
}

VideosAssistant.prototype.videosGroupChanged = function(newGroup) {

	//May add filtering of results later
	Mojo.Log.info("new grouping is "+newGroup);
	
	WebMyth.prefsCookieObject.currentVideosGroup = newGroup
	
	this.updateGroupMenu();
	
	this.resultList.clear();
	Object.extend(this.resultList,trimByVideoType(this.fullResultList, newGroup));
	
	$("scene-title").innerHTML = "Videos ("+this.resultList.length+" items)";
	
	//Initial display
	var listWidget = this.controller.get('videosList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	//Mojo.Controller.getAppController().showBanner("Updated with latest data", {source: 'notification'});
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()

};

VideosAssistant.prototype.updateGroupMenu = function() {
	
	//Reset default sorting
	this.groupMenuModel.items = [ 
		{"label": "All", "command": "go-groupall" },
		{"label": "Regular", "command": "go-groupVideo" },
		{"label": "TV", "command": "go-groupTV" },
		{"label": "Specials", "command": "go-groupSpecial" }
	] ;
	
	switch(WebMyth.prefsCookieObject.currentVideosGroup) {
		case 'all':
			this.groupMenuModel.items[0].label = '- All -';
		  break;
		case 'Video':
			this.groupMenuModel.items[1].label = '- Regular -';
		  break;
		case 'TV':
			this.groupMenuModel.items[2].label = '- TV -';
		  break;
		case 'Special':
			this.groupMenuModel.items[3].label = '- Specials -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.groupMenuModel);
}

VideosAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
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
			else if (s.subtitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subtitle", i);
				someList.push(s);
			}	
			else if (s.fullEpisode.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in full episode name", i);
				someList.push(s);
			}	
			else if (s.releasedate.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in release date", i);
				someList.push(s);
			}
			else if (s.plot.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in plot", i);
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

VideosAssistant.prototype.goVideosDetails = function(event) {
	//var upcoming_chanid = event.item.chanid;
	//var upcoming_starttime = event.item.starttime;
	
	//Mojo.Log.info("Selected individual recording: '%s' - '%s'", event.item.intid, event.item.title);
	
	var videosObject = trimByIntid(this.resultList, event.item.intid);

	//Mojo.Log.error("Selected object is: '%j'", videosObject);
	
	var detailsStorageGroup = trimByHostnameGroupname(this.storageGroups, videosObject.host, "Videos");
	
	Mojo.Log.error("Hostname: "+videosObject.host+" has Videos directory: "+detailsStorageGroup.dirname);
	
	//Open upcomingDetails communication scene
	Mojo.Controller.stageController.pushScene("videosDetails", videosObject, detailsStorageGroup.dirname);
	
	Event.stop(event);
	
};

VideosAssistant.prototype.videosDividerFunction = function(itemModel) {
	 
	//Divider function for list
    //return itemModel.title.toString()[0];	
	//return itemModel.starttime.substring(0,10);
	//var date = new Date(isoToJS(itemModel.starttime));
	
	var dividerData = '';
	
	switch(WebMyth.prefsCookieObject.currentVideosSort) {
		case 'insert-asc':
			dividerData = itemModel.insertdate.substring(0,10);
		  break;
		case 'insert-desc':
			dividerData = itemModel.insertdate.substring(0,10);
		  break;
		case 'released-asc':
			dividerData = itemModel.releasedate;
		  break;
		case 'released-desc':
			dividerData = itemModel.releasedate;
		  break;
		case 'season-asc':
			dividerData = itemModel.season;
		  break;
		case 'season-desc':
			dividerData = itemModel.season;
		  break;
		case 'title-asc':
			dividerData = itemModel.title;
		  break;
		case 'title-desc':
			dividerData = itemModel.title;
		  break;
		default :
			dividerData = itemModel.title;
		  break;
	}
	
	return dividerData;
	
};

VideosAssistant.prototype.setMyData = function(propertyValue, model) {
	
	/*
	//And img source
	var channelIconUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetChannelIcon?ChanId=";
	channelIconUrl += model.chanid;
	
	//Mojo.Log.error("iconURL is "+channelIconUrl);
	
	//Mojo.Log.error('url is ' +screenshotUrl);
	model.myImgSrc = channelIconUrl;
	
	
	*/
	var videosDetailsText = '<div class="videos-list-item">';
	videosDetailsText += '<div class="title truncating-text left videos-list-title">&nbsp;'+model.title+'</div>';
	
	videosDetailsText += '<div class="palm-row-wrapper">';
	
	//if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) videosDetailsText += '<div class="left-list-text">';
	
	videosDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subtitle+'&nbsp;</div>';
	videosDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.plot+'&nbsp;</div>';
	videosDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;Episode: '+model.fullEpisode+'</div>';
	videosDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;Released: '+model.releasedate+'</div>';
	
	
	videosDetailsText += '</div></div>';
	
	//videosDetailsText += '</div>';
	
	model.myData = videosDetailsText;
	
	
};