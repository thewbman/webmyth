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
 
 
function MusicListAssistant(allMusic) {

	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down list
	  
	  if(allMusic){
		Object.extend(this.fullResultList,allMusic); 
	  }
	  
	  this.playlistsList = [];
	  
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
	$('spinner-text').innerHTML = $L("Loading")+"...<br />("+$L("this may take a while")+")";
	
	
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

	
	
	
	//Playlists drawer
	this.controller.setupWidget("playlistsDrawer",
		this.playlistsDrawerAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.scheduledModel = {
			open: false
		}
	);
	this.playlistsDrawer = this.controller.get("playlistsDrawer");
	this.controller.listen(this.controller.get("playlistsDrawerGroup"),Mojo.Event.tap,this.togglePlaylistsDrawer.bindAsEventListener(this));
	
	// Music playlists list
	this.musicPlaylistsListAttribs = {
		itemTemplate: "musicList/musicPlaylistsListItem",
		dividerTemplate: "musicList/musicDivider",
		swipeToDelete: false,
		//dividerFunction: this.musicPlaylistsDividerFunction.bind(this),
		reorderable: false
	};
    this.musicPlaylistsListModel = {            
        items: this.playlistsList,
		disabled: false
    };
	this.controller.setupWidget( "musicPlaylistsList" , this.musicPlaylistsListAttribs, this.musicPlaylistsListModel);
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "musicPlaylistsList" ), Mojo.Event.listTap, this.goMusicPlaylist.bind(this));
	
	
	
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
	
	
	
	if(WebMyth.usePlugin){
		$('webmyth_service_id').mysqlMusicListResponse = this.mysqlMusicListResponse.bind(this);
		$('webmyth_service_id').mysqlMusicPlaylistResponse = this.mysqlMusicPlaylistResponse.bind(this);
	}
	
	
	//List of music
	if(this.fullResultList.length == 0){
		//Will gather music if first opened
		this.getMusic();
	} else {
		//If returned from music playlist, can go straight to getting playlists and showing
		this.controller.window.setTimeout(this.finishedReadingMusic.bind(this), 50);
	}
	
};

MusicListAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

MusicListAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

MusicListAssistant.prototype.cleanup = function(event) {

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
			
			this.getMusicPlaylists();
		
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





MusicListAssistant.prototype.togglePlaylistsDrawer = function() {

	this.playlistsDrawer.mojo.setOpenState(!this.playlistsDrawer.mojo.getOpenState());	

	if (this.playlistsDrawer.mojo.getOpenState() == true){
		this.controller.get("playlistsArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("playlistsArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
	
};

MusicListAssistant.prototype.getMusic = function(event) {

	//Update list from webmyth python script
	Mojo.Log.error('Starting music data gathering');
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	//requestUrl += "?op=getMusic";	
	
	//SELECT music_songs.song_id, music_songs.name, music_songs.filename, music_songs.year, music_songs.track, music_artists.artist_name, music_albums.album_name, music_albums.year AS album_year, music_albums.compilation FROM music_songs, music_artists, music_albums WHERE music_songs.artist_id = music_artists.artist_id AND music_songs.album_id = music_albums.album_id
	
	var query = "SELECT music_songs.song_id, music_songs.name, music_songs.filename, music_songs.year, music_songs.track, music_songs.length, "; 
	query += " music_songs.artist_id, music_songs.album_id, ";
	query += " music_artists.artist_name, ";
	query += " music_albums.album_name, music_albums.compilation, ";
	query += " music_albumart.albumart_id ";
	query += " FROM music_songs ";
	query += " LEFT JOIN music_artists ON music_songs.artist_id = music_artists.artist_id "
	query += " LEFT JOIN music_albums ON music_songs.album_id = music_albums.album_id ";
	query += " LEFT JOIN music_albumart ON music_songs.directory_id = music_albumart.directory_id ";
	
	
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlMusicListResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		Mojo.Log.error("MusicList plugin response "+response1);
		
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
				onSuccess: this.readMusicSuccess.bind(this),
				onFailure: this.readMusicFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}
	
};

MusicListAssistant.prototype.readMusicFail = function(event) {

	Mojo.Log.error('Failed to get music response');
	
	this.resultList = [{ 'title':'Accesing remote table has failed.', 'subtitle':'Please check your server script.', 'starttime':''}];
	
	//Initial display
	var listWidget = this.controller.get('musicList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();
	
};

MusicListAssistant.prototype.readMusicSuccess = function(response) {
    
	//Mojo.Log.info('Got Ajax response: %j',response.responseJSON);
	
		
	//Update the list widget
	this.fullResultList.clear();
	Object.extend(this.fullResultList,cleanMusic(response.responseJSON));

	
	this.finishedReadingMusic();
	
};

MusicListAssistant.prototype.mysqlMusicListResponse = function(response) {

	Mojo.Log.error("Got musicList plugin response: "+response);
	
		
	//Update the list widget
	this.fullResultList.clear();
	Object.extend(this.fullResultList,cleanMusic(JSON.parse(response)));

	
	this.finishedReadingMusic();
	
};

MusicListAssistant.prototype.finishedReadingMusic = function() {

	$('playlistsDivider-label').innerText = $L('Playlists');
	
	//Playlists
	this.playlistsList.clear();
	this.controller.modelChanged(this.musicPlaylistsListModel);
	
	this.controller.window.setTimeout(this.getMusicPlaylists.bind(this), 50);
	
	
	this.sortChanged(WebMyth.prefsCookieObject.currentMusicSort);
	
};

MusicListAssistant.prototype.getMusicPlaylists = function(event) {

	//Update list from webmyth python script
	//Mojo.Log.error('Starting music playlists gathering');
	
	var query = "SELECT * ";
	query += " FROM music_playlists ;";
	
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlMusicPlaylistResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		Mojo.Log.error("MusicList playlists plugin response "+response1);
		
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
				onSuccess: this.readMusicPlaylistsSuccess.bind(this),
				onFailure: this.readMusicPlaylistsFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}
	
};

MusicListAssistant.prototype.readMusicPlaylistsFail = function(event) {

	Mojo.Log.error('Failed to get music playlists');
	
};

MusicListAssistant.prototype.readMusicPlaylistsSuccess = function(response) {
    
	//Mojo.Log.info('Got playlists response: %j',response.responseJSON);
	
	this.playlistsList.clear();
	Object.extend(this.playlistsList,cleanMusicPlaylists(response.responseJSON));
	
	//Mojo.Log.info("Cleaned music playlists if %j",this.playlistsList);
	
	this.controller.modelChanged(this.musicPlaylistsListModel);
	
};

MusicListAssistant.prototype.mysqlMusicPlaylistResponse = function(response) {
    
	Mojo.Log.error("Got musicList playlists plugin response: "+response);
	
	
	this.playlistsList.clear();
	Object.extend(this.playlistsList,cleanMusicPlaylists(JSON.parse(response)));
	
	//Mojo.Log.info("Cleaned music playlists if %j",this.playlistsList);
	
	this.controller.modelChanged(this.musicPlaylistsListModel);
	
};

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
			this.sortMenuModel.items[0].label = '- '+this.sortMenuModel.items[0].label+' -';
		  break;
		case 'album-desc':
			this.sortMenuModel.items[1].label = '- '+this.sortMenuModel.items[1].label+' -';
		  break;
		case 'artist-asc':
			this.sortMenuModel.items[2].label = '- '+this.sortMenuModel.items[2].label+' -';
		  break;
		case 'artist-desc':
			this.sortMenuModel.items[3].label = '- '+this.sortMenuModel.items[3].label+' -';
		  break;
		case 'name-asc':
			this.sortMenuModel.items[4].label = '- '+this.sortMenuModel.items[4].label+' -';
		  break;
		case 'name-desc':
			this.sortMenuModel.items[5].label = '- '+this.sortMenuModel.items[5].label+' -';
		  break;
		case 'year-asc':
			this.sortMenuModel.items[6].label = '- '+this.sortMenuModel.items[6].label+' -';
		  break;
		case 'year-desc':
			this.sortMenuModel.items[7].label = '- '+this.sortMenuModel.items[7].label+' -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.sortMenuModel);
	
};

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
	
	
	$("scene-title").innerHTML = $L("Music")+" ("+this.resultList.length+" "+$L("items")+")";
	
	this.controller.sceneScroller.mojo.revealTop();
	
	
	//Initial display
	try {
		var listWidget = this.controller.get('musicList');
		this.filterListFunction('', listWidget, 0, this.resultList.length);
		listWidget.mojo.close();
	} catch(e) {
		Mojo.Log.error("Error in initial music list filtering");
	}
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()

};

MusicListAssistant.prototype.updateGroupMenu = function() {
	
	//Reset default sorting
	this.groupMenuModel.items = [ 
		{"label": $L("All"), "command": "go-groupall" },
		{"label": $L("Artist"), "command": "go-groupartist" },
		{"label": $L("Album"), "command": "go-groupalbum" }
	] ;
	
	switch(this.currentMusicGroup) {
		case 'all':
			this.groupMenuModel.items = [ {"label": "- "+$L("All")+" -", "command": "go-groupall" } ] ;
		  break;
		case 'artist':
			this.groupMenuModel.items[1].label = '- '+this.groupMenuModel.items[1].label+': '+this.newArtist+' -';
			this.groupMenuModel.items[2].label += ': '+this.newAlbum;
		  break;
		case 'album':
			this.groupMenuModel.items[1].label += ': '+this.newArtist;
			this.groupMenuModel.items[2].label = '- '+this.groupMenuModel.items[2].label+': '+this.newAlbum+' -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.groupMenuModel);
	
};

MusicListAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	//Mojo.Log.info("Started filtering with '%s'",filterString);
	
	var totalSubsetSize = 0;
 
	var i, s = {};
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
	
	//Mojo.Log.info("offset is %s",offset);
	
	listWidget.mojo.noticeUpdatedItems(offset, subset);
	listWidget.mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
	
};	

MusicListAssistant.prototype.goMusicPlaylist = function(event) {
	
	Mojo.Log.info("Selected individual music playlist: '%j'", event.item);
	
	Mojo.Controller.stageController.swapScene("musicPlaylist", event.item, this.fullResultList, this.playlistsList);
	
}

MusicListAssistant.prototype.goMusicDetails = function(event) {
	//var upcoming_chanid = event.item.chanid;
	//var upcoming_starttime = event.item.starttime;
	
	Mojo.Log.info("Selected individual music: '%s' - '%s'", event.item.song_id, event.item.name);
	
	
	this.musicObject = event.item;
	this.newArtist = event.item.artist_name;
	this.newAlbum = event.item.album_name;
	
	
	var popupItems = [
		{label: $L('Download to phone'), command: 'do-pickDownload'},
		{label: $L('Stream to phone'), command: 'do-pickStream'},
		{label: $L('Details'), command: 'do-pickDetails'},
		{label: $L('Artist')+': '+this.newArtist, command: 'do-pickArtist'},
		{label: $L('Album')+': '+this.newAlbum, command: 'do-pickAlbum'}
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
		case 'do-pickDownload':
			this.handleDownload("download");
			
		  break;
		  
		case 'do-pickStream':
			this.handleDownload("stream");
			
		  break;
		  
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
			
		
};

MusicListAssistant.prototype.handleDownload = function(downloadOrStream_in) {

	Mojo.Log.info("Asked to "+downloadOrStream_in+" music");
	this.downloadOrStream = downloadOrStream_in;
	
	
	var filenameRequestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetMusic?Id="
	filenameRequestUrl += this.musicObject.song_id;
	
	Mojo.Log.info("Download/stream URL is "+filenameRequestUrl);
	
	var myDirectory = "/media/internal/music/"+this.musicObject.artist_name+"/"+this.musicObject.album_name+"/";
	
	var myFilename = this.musicObject.filenameEnd;
	
	Mojo.Log.info("Filename is "+myDirectory+myFilename);
 
 
	if( this.downloadOrStream == 'download' ) {
		Mojo.Log.info("starting download");

		
		
		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
				target: filenameRequestUrl,		
				targetFilename: myFilename,
				subscribe: true,	
				targetDir: myDirectory
			},
			onSuccess: function(response) {
				if(response.completed) {
					this.controller.showBanner("Download finished! "+myFilename, "");
					
					this.controller.serviceRequest('palm://com.palm.applicationManager', {
						method:'launch',							
						parameters: {
							id:"com.palm.app.musicplayer"
						}
					});
					
						
				} else {
					if(response.amountReceived && response.amountTotal) {
						var percent = (response.amountReceived / response.amountTotal)*100;
						percent = Math.round(percent);
						if(percent!=NaN) {
							if(this.currProgress != percent) {
								this.currProgress = percent;
								this.controller.showBanner("Downloading: " + percent + "%", "");
							}
						}
					}
					
				}
			}.bind(this)
		});	
		
		
		
	} else if( this.downloadOrStream == 'stream' ) {
		
		Mojo.Log.info("Starting to stream");
	
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: "launch",
			parameters:  {
				id: 'com.palm.app.streamingmusicplayer',
				params: {
					target: filenameRequestUrl	
				}
			}
		});	
	}
 
};

MusicListAssistant.prototype.musicPlaylistsDividerFunction = function(itemModel) {
	 	
	var dividerData = "Playlists";
		
	return dividerData;
	
};

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

	var albumArtUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetAlbumArt?Id=";
	albumArtUrl += model.albumart_id;
	
	var musicDetailsText = '<div class="music-list-item">';
	musicDetailsText += '<div class="title truncating-text left  music-list-title">&nbsp;'+model.name+'</div>';
	
	musicDetailsText += '<div class="palm-row-wrapper">';
	
	musicDetailsText += '<div class="left-music-image"> <div class="left-list-music-image-wrapper">';
	musicDetailsText += '<img class="music-albumart-small" src="'+albumArtUrl+'" />';
	musicDetailsText += '</div> </div>';
	
	
	musicDetailsText += '<div class="right-music-text">';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+$L('Artist')+': '+model.artist_name+'&nbsp;</div>';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+$L('Album')+': '+model.album_name+'&nbsp;</div>';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+$L('Track')+' #: '+model.track+'</div>';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+$L('Year')+': '+model.year+'</div>';
	musicDetailsText += '</div>';
	
	
	musicDetailsText += '</div></div>';

	
	model.myData = musicDetailsText;
	
};
