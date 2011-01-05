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
 
 
function MusicListAssistant() {

	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down list
	  
	  this.currentMusicGroup = 'all';
	  
}

MusicListAssistant.prototype.setup = function() {

	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	$('spinner-text').innerHTML = "Loading...<br />(this may take a while)";
	
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Music Menu'),
                            items: [{label: $L('Sort'), submenu:'sort-menu', width: 90},{ icon: 'refresh', command: 'go-refresh' },{label: $L('Group'), submenu:'group-menu', width: 90}]};
 
	this.sortMenuModel = { label: $L('Sort'), items: []};
	
	this.groupMenuModel = { label: $L('Group'), items: [
		{"label": "All", "command": "go-groupall" }
	]};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('sort-menu', '', this.sortMenuModel);
	this.controller.setupWidget('group-menu', '', this.groupMenuModel);

	
	
	// Music filter list
	this.musicListAttribs = {
		itemTemplate: "musicList/musicListItem",
		dividerTemplate: "musicList/musicDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.musicDividerFunction.bind(this),
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.musicListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "musicList" , this.musicListAttribs, this.musicListModel);
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "musicList" ), Mojo.Event.listTap, this.goMusicDetails.bind(this));
	Mojo.Event.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	//List of music
	this.getMusic();
	
};

MusicListAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Vibrate event
	Mojo.Event.listen(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
	
};

MusicListAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Vibrate event
	Mojo.Event.stopListening(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

MusicListAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

MusicListAssistant.prototype.handleCommand = function(event) {

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
			this.musicGroupChanged(mySelection);
		   break;
		  case 'go-refr':		//refresh
		  
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel, this);
			$('myScrim').show();
		
			this.getMusic();
			
		   break;
		}
	  } else if(event.type == Mojo.Event.forward) {
		
			Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	  }
  
};

MusicListAssistant.prototype.handleKey = function(event) {

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

MusicListAssistant.prototype.handleShakestart = function(event) {

	Mojo.Log.info("Start Shaking");
	Event.stop(event);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show()	
	
	
	this.getMusic();
  
};





MusicListAssistant.prototype.getMusic = function(event) {

	//Update list from webmyth python script
	Mojo.Log.error('Starting music data gathering');
	
	this.controller.sceneScroller.mojo.revealTop();
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=getMusic";	
	
	
	
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

MusicListAssistant.prototype.readRemoteDbTableFail = function(event) {

	Mojo.Log.error('Failed to get music response');
	
	this.resultList = [{ 'title':'Accesing remote table has failed.', 'subtitle':'Please check your server script.', 'starttime':''}];
	
	//Initial display
	var listWidget = this.controller.get('musicList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()	
	//$('failtext').innerHtml = "Failed to connect to remote script.  Please check you script setup.";
	
};

MusicListAssistant.prototype.readRemoteDbTableSuccess = function(response) {
	//return true;  //can escape this function for testing purposes
    
	Mojo.Log.info('Got Ajax response: %j',response.responseJSON);
	
		
	//Update the list widget
	this.fullResultList.clear();
	Object.extend(this.fullResultList,cleanMusic(response.responseJSON));

	
	this.finishedReadingMusic();
	
}

MusicListAssistant.prototype.finishedReadingMusic = function() {

	this.sortChanged(WebMyth.prefsCookieObject.currentMusicSort);
	
}

MusicListAssistant.prototype.sortChanged = function(newSort) {

	//Add sorting options here
	Mojo.Log.info("new sort is "+newSort);
	
	WebMyth.prefsCookieObject.currentMusicSort = newSort;
	
	
	//Sort list
	switch(WebMyth.prefsCookieObject.currentMusicSort) {
		case 'album-asc':
			this.fullResultList.sort(triple_sort_by('album_name', 'track', 'name', false));
		  break;
		case 'album-desc':
			this.fullResultList.sort(triple_sort_by('album_name', 'track', 'name', true));
		  break;
		case 'artist-asc':
			this.fullResultList.sort(triple_sort_by('artist_name', 'album_name', 'name', false));
		  break;
		case 'artist-desc':
			this.fullResultList.sort(triple_sort_by('artist_name', 'album_name', 'name', true));
		  break;
		case 'name-asc':
			this.fullResultList.sort(triple_sort_by('name', 'artist_name', 'album_name', false));
		  break;
		case 'name-desc':
			this.fullResultList.sort(triple_sort_by('name', 'artist_name', 'album_name', true));
		  break;
		case 'year-asc':
			this.fullResultList.sort(triple_sort_by('year', 'name', 'artist_name', false));
		  break;
		case 'year-desc':
			this.fullResultList.sort(triple_sort_by('year', 'name', 'artist_name', true));
		  break;
		default :
			this.fullResultList.sort(triple_sort_by('artist_name', 'album_name', 'name', false));
		  break;
	}
	
	
	this.musicGroupChanged(this.currentMusicGroup);
	
	this.updateSortMenu();

}

MusicListAssistant.prototype.updateSortMenu = function() {
	
	
	//Reset default sorting
	this.sortMenuModel.items = [ 
			{"label": $L('Album-Asc'), "command": "go-sort-album-asc"},
			{"label": $L('Album-Desc'), "command": "go-sort-album-desc"},
			{"label": $L('Artist-Asc'), "command": "go-sort-artist-asc"},
			{"label": $L('Artist-Desc'), "command": "go-sort-artist-desc"},
			{"label": $L('Title-Asc'), "command": "go-sort-name-asc"},
			{"label": $L('Title-Desc'), "command": "go-sort-name-desc"},
			{"label": $L('Year-Asc'), "command": "go-sort-year-asc"},
			{"label": $L('Year-Desc'), "command": "go-sort-year-desc"}
	] ;
	
	switch(WebMyth.prefsCookieObject.currentMusicSort) {
		case 'album-asc':
			this.sortMenuModel.items[0].label = '- Album-Asc -';
		  break;
		case 'album-desc':
			this.sortMenuModel.items[1].label = '- Album-Desc -';
		  break;
		case 'artist-asc':
			this.sortMenuModel.items[2].label = '- Artist-Asc -';
		  break;
		case 'artist-desc':
			this.sortMenuModel.items[3].label = '- Artist-Desc -';
		  break;
		case 'name-asc':
			this.sortMenuModel.items[4].label = '- Title-Asc -';
		  break;
		case 'name-desc':
			this.sortMenuModel.items[5].label = '- Title-Desc -';
		  break;
		case 'year-asc':
			this.sortMenuModel.items[6].label = '- Year-Asc -';
		  break;
		case 'year-desc':
			this.sortMenuModel.items[7].label = '- Year-Desc -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.sortMenuModel);
	
}

MusicListAssistant.prototype.musicGroupChanged = function(newGroup) {

	//May add filtering of results later
	Mojo.Log.info("new grouping is "+newGroup);
	
	this.currentMusicGroup = newGroup
	
	this.updateGroupMenu();
	
	this.resultList.clear();
	
	switch(this.currentMusicGroup) {
		case 'all':
			Object.extend(this.resultList,this.fullResultList);
		  break;
		case 'album':
			Object.extend(this.resultList,trimMusicByAlbum(this.fullResultList, this.newAlbum));
		  break;
		case 'artist':
			Object.extend(this.resultList,trimMusicByArtist(this.fullResultList, this.newArtist));
		  break;
		default:
			Object.extend(this.resultList,this.fullResultList);
		  break;
	}
	
	
	$("scene-title").innerHTML = "Music ("+this.resultList.length+" items)";
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//Initial display
	var listWidget = this.controller.get('musicList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	//Mojo.Controller.getAppController().showBanner("Updated with latest data", {source: 'notification'});
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()

};

MusicListAssistant.prototype.updateGroupMenu = function() {
	
	//Reset default sorting
	this.groupMenuModel.items = [ 
		{"label": "All", "command": "go-groupall" },
		{"label": "Artist", "command": "go-groupartist" },
		{"label": "Album", "command": "go-groupalbum" }
	] ;
	
	switch(this.currentMusicGroup) {
		case 'all':
			this.groupMenuModel.items = [ {"label": "- All -", "command": "go-groupall" } ] ;
		  break;
		case 'artist':
			this.groupMenuModel.items[1].label = '- Artist: '+this.newArtist+' -';
			this.groupMenuModel.items[2].label = 'Album: '+this.newAlbum;
		  break;
		case 'album':
			this.groupMenuModel.items[1].label = 'Artist: '+this.newArtist;
			this.groupMenuModel.items[2].label = '- Album: '+this.newAlbum+' -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.groupMenuModel);
	
}

MusicListAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
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
			if (s.name.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
				//Mojo.Log.info("Found string in title", i);
				someList.push(s);
			}	
			else if (s.artist_name.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subtitle", i);
				someList.push(s);
			}	
			else if (s.album_name.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in full episode name", i);
				someList.push(s);
			}	/*
			else if (s.releasedate.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in release date", i);
				someList.push(s);
			}
			else if (s.plot.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in plot", i);
				someList.push(s);
			}	*/
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

MusicListAssistant.prototype.goMusicDetails = function(event) {
	//var upcoming_chanid = event.item.chanid;
	//var upcoming_starttime = event.item.starttime;
	
	Mojo.Log.info("Selected individual music: '%s' - '%s'", event.item.song_id, event.item.name);
	
	
	this.musicObject = event.item;
	this.newArtist = event.item.artist_name;
	this.newAlbum = event.item.album_name;
	
	
	var popupItems = [
		{label: 'Details', command: 'do-pickDetails'},
		{label: 'Artist: '+this.newArtist, command: 'do-pickArtist'},
		{label: 'Album: '+this.newAlbum, command: 'do-pickAlbum'}
	];
	
	
	this.popupIndex = event.index;
    this.controller.popupSubmenu({
      onChoose: this.popupHandler.bind(this),
      placeNear: event.target,
      items: popupItems
    });
	
	
};

MusicListAssistant.prototype.popupHandler = function(event) {
	
	switch(event) {
		case 'do-pickDetails':
			//Open upcomingDetails communication scene
			Mojo.Controller.stageController.pushScene("musicDetails", this.musicObject);
			
		  break;
		  
		case 'do-pickAlbum':
			
			this.musicGroupChanged("album");
			
		  break;
		  
		case 'do-pickArtist':
			
			this.musicGroupChanged("artist");
	
		  break;
		  
		default:
			//adsf
		  break;
	}
			
		
}

MusicListAssistant.prototype.musicDividerFunction = function(itemModel) {
	 
	//Divider function for list
    //return itemModel.title.toString()[0];	
	//return itemModel.starttime.substring(0,10);
	//var date = new Date(isoToJS(itemModel.starttime));
	
	var dividerData = itemModel.artist_name;
	
	
	switch(WebMyth.prefsCookieObject.currentMusicSort) {
		case 'album-asc':
			dividerData = itemModel.album_name;
		  break;
		case 'album-desc':
			dividerData = itemModel.album_name;
		  break;
		case 'artist-asc':
			dividerData = itemModel.artist_name;
		  break;
		case 'artist-desc':
			dividerData = itemModel.artist_name;
		  break;
		case 'name-asc':
			dividerData = itemModel.name;
		  break;
		case 'name-desc':
			dividerData = itemModel.name;
		  break;
		case 'year-asc':
			dividerData = itemModel.year;
		  break;
		case 'year-desc':
			dividerData = itemModel.year;
		  break;
		default :
			dividerData = itemModel.artist_name;
		  break;
	}
	
	
	return dividerData;
	
};

MusicListAssistant.prototype.setMyData = function(propertyValue, model) {
	
	var musicDetailsText = '<div class="music-list-item">';
	musicDetailsText += '<div class="title truncating-text left  music-list-title">&nbsp;'+model.name+'</div>';
	
	musicDetailsText += '<div class="palm-row-wrapper">';
	
	//if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) musicDetailsText += '<div class="left-list-text">';
	
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;Artist: '+model.artist_name+'&nbsp;</div>';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;Album: '+model.album_name+'&nbsp;</div>';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;Track #: '+model.track+'</div>';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;Year: '+model.year+'</div>';
	
	
	musicDetailsText += '</div></div>';
	
	//musicDetailsText += '</div>';
	
	model.myData = musicDetailsText;
	
	
};