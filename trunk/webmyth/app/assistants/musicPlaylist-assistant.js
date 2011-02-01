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
 
 
function MusicPlaylistAssistant(playlistObject, allMusic, allPlaylists) {
	
	this.currentPlaylist = playlistObject;
	
	this.allMusic = allMusic;
	this.fullResultList = [];		//Full raw data 
	this.resultList = [];			//Filtered down list
	this.subset = [];				//List from filter function
	  
	this.playlistsList_in = allPlaylists;
	this.playlistsList = []
	//this.playlistsList.push({"type": "1 - New", "playlist_id": "-1", "playlist_name": "Create new", "display_name": "+ Create new +", "playlist_songs": "", "length": "0", "songcount": "0", "hostname": ""});
	  
	if(this.currentPlaylist.type == "3 - Named"){
		this.currentPlaylistGroup = 'inPlaylist';
	} else {
		this.currentPlaylistGroup = 'all';
	}
	  
}

MusicPlaylistAssistant.prototype.setup = function() {

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
    this.cmdMenuModel = { label: $L('Music Menu'),
                            items: [{label: $L('Save'), command:'go-save-new', width: 90},{label: $L('More'), submenu:'more-menu', width: 90},{label: $L('Group'), submenu:'group-menu', width: 90}]};

	
	this.moreMenuModel = { label: $L('More'), items: [
		{"label": $L("Select all songs"), "command": "go-sele-all" },
		{"label": $L("Deselect all songs"), "command": "go-sele-none" }
	]};
	this.groupMenuModel = { label: $L('Group'), items: [
		{"label": $L("All"), "command": "go-groupall" }
	]};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('more-menu', '', this.moreMenuModel);
	this.controller.setupWidget('group-menu', '', this.groupMenuModel);


	
	//Playlists drawer
	this.controller.setupWidget("playlistsDrawer",
		this.playlistsDrawerAttributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.playlistsDrawerModel = {
			open: true
		}
	);
	this.playlistsDrawer = this.controller.get("playlistsDrawer");
	this.controller.listen(this.controller.get("playlistsDrawerGroup"),Mojo.Event.tap,this.togglePlaylistsDrawer.bindAsEventListener(this));
	
	// Music playlists list
	this.musicPlaylistsListAttribs = {
		itemTemplate: "musicPlaylist/musicPlaylistsListItem",
		swipeToDelete: false,
		reorderable: false,
		formatters:{myData: this.setMyPlaylistData.bind(this)}
	};
    this.musicPlaylistsListModel = {            
        items: this.playlistsList,
		disabled: false
    };
	this.controller.setupWidget( "musicPlaylistsList" , this.musicPlaylistsListAttribs, this.musicPlaylistsListModel);
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "musicPlaylistsList" ), Mojo.Event.listTap, this.doMusicPlaylist.bind(this));
	
	
	
	// Music filter list
	this.musicListAttribs = {
		itemTemplate: "musicPlaylist/musicListItem",
		//dividerTemplate: "musicPlaylist/musicDivider",
		swipeToDelete: false,
		reorderable: true,
		filterFunction: this.filterListFunction.bind(this),
		//dividerFunction: this.musicDividerFunction.bind(this),
		formatters:{myData: this.setMySongData.bind(this)}
	};
    this.musicListModel = {            
        items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "musicList" , this.musicListAttribs, this.musicListModel);
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "musicList" ), Mojo.Event.listTap, this.doMusicDetails.bind(this));
	Mojo.Event.listen(this.controller.get( "musicList" ), Mojo.Event.listReorder, this.doMusicReorder.bind(this));
	
	
	Mojo.Event.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	this.setupSaveMenu();
	
	
	this.controller.window.setTimeout(this.parseMusicList.bind(this), 50);
	
};

MusicPlaylistAssistant.prototype.activate = function(event) {

	$('playlistsDivider-label').innerText = $L('Playlists');
	$('musicDivider-label').innerText = $L('Songs');
	
	if(this.currentPlaylist.type == "2 - Host"){
		//this.playlistsList.clear();
		//this.controller.modelChanged(this.musicPlaylistsListModel);
		this.showPlaylists();
	} else {
		$('playlist-wrapper').hide();
	}

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

MusicPlaylistAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

MusicPlaylistAssistant.prototype.cleanup = function(event) {

};

MusicPlaylistAssistant.prototype.handleCommand = function(event) {

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
		  case 'go-sele':		//select all/none
			//Mojo.Log.error("Select all/none... "+mySelection);
			this.controller.sceneScroller.mojo.revealTop();
			this.selectAll(mySelection);
		   break;
		  case 'go-save':		//save
		
			this.doSave(mySelection);
			
		   break;
		}
		
	} else if(event.type == Mojo.Event.forward) {
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
		
	} else if(event.type == Mojo.Event.back) {
	
		this.askExit();
		Event.stop(event);
		
	}
  
};

MusicPlaylistAssistant.prototype.handleKey = function(event) {

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







MusicPlaylistAssistant.prototype.askExit = function() {

	this.controller.showAlertDialog({
		onChoose: function(value) {
			switch(value) {
				case 'yes':
					Mojo.Controller.stageController.swapScene("musicList", this.allMusic);
				  break;
				case 'no':
				  break;
				}
			},
		title: "WebMyth - v" + Mojo.Controller.appInfo.version,
		message:  "You have not saved any changes to the playlist.  Are you sure you want to exit now?", 
		choices: [
				{label: $L("Yes"), value: 'yes', type: 'affirmative'},
				{label: $L("No"), value: 'no', type: 'negative'}
			],
		allowHTMLMessage: true
	});
	
};

MusicPlaylistAssistant.prototype.togglePlaylistsDrawer = function() {

	this.playlistsDrawer.mojo.setOpenState(!this.playlistsDrawer.mojo.getOpenState());	

	if (this.playlistsDrawer.mojo.getOpenState() == true){
		this.controller.get("playlistsArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("playlistsArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
	
};

MusicPlaylistAssistant.prototype.setupSaveMenu = function() {

	//Mojo.Log.info("Starting to update save menu");

	if(this.currentPlaylist.type == "1 - New") {
		//Mojo.Log.info("Setting up 'new' menu to save playlist");
		this.cmdMenuModel.items[0].command = 'go-save-new';
		
	} else if(this.currentPlaylist.type == "2 - Host") {
		//Mojo.Log.info("Setting up 'host' menu to save playlist");
		this.cmdMenuModel.items[0].command = '';
		this.cmdMenuModel.items[0].submenu = 'save-menu';
		
		this.saveMenuModel = { label: $L('Save'), items: [
			{"label": "As New Playlist", "command": "go-save-new" },
			{"label": "Update '"+this.currentPlaylist.hostname+"'", "command": "go-save-host" }
		]};

		this.controller.setupWidget('save-menu', '', this.saveMenuModel);
	
	} else if(this.currentPlaylist.type == "3 - Named") {
		//Mojo.Log.info("Setting up 'named' menu to save playlist");
		this.cmdMenuModel.items[0].command = '';
		this.cmdMenuModel.items[0].submenu = 'save-menu';
		
		this.saveMenuModel = { label: $L('Save'), items: [
			{"label": "As New Playlist", "command": "go-save-new" },
			{"label": "Update '"+this.currentPlaylist.playlist_name+"'", "command": "go-save-update" },
			{"label": "Delete '"+this.currentPlaylist.playlist_name+"'", "command": "go-save-delete" }
		]};

		this.controller.setupWidget('save-menu', '', this.saveMenuModel);

	}
	
	this.controller.modelChanged(this.cmdMenuModel, this);
	
};

MusicPlaylistAssistant.prototype.showPlaylists = function() {

	//Mojo.Log.info("About to parse playlists");
	this.playlistsList.clear();
	Object.extend(this.playlistsList, parseMusicPlaylists(this.playlistsList_in, this.currentPlaylist));
	//Mojo.Log.info("Parsed music playlists is %j",this.playlistsList);

	this.controller.modelChanged(this.musicPlaylistsListModel, this);
	
};

MusicPlaylistAssistant.prototype.parseMusicList = function() {

	//Mojo.Log.info("About to parse music against playlist");
	Object.extend(this.fullResultList, parseMusicInPlaylist(this.allMusic, this.currentPlaylist));
	//Mojo.Log.info("Parsed playlist music is %j",this.fullResultList);

	this.finishedReadingMusic();
	
};

MusicPlaylistAssistant.prototype.finishedReadingMusic = function() {

	this.musicGroupChanged(this.currentPlaylistGroup);
	
};

MusicPlaylistAssistant.prototype.selectAll = function(value) {
	
	Mojo.Log.info("Selecting: "+value);
	
	var set_inPlaylist = true;
	
	if(value == "none"){
		set_inPlaylist = false;
	}
	
	for(var i = 0; i < this.fullResultList.length; i++){
		this.fullResultList[i].inPlaylist = set_inPlaylist;
	}
	
	this.musicGroupChanged(this.currentPlaylistGroup);
	
};

MusicPlaylistAssistant.prototype.musicGroupChanged = function(newGroup) {

	//May add filtering of results later
	//Mojo.Log.info("New grouping is "+newGroup);
	
	this.currentPlaylistGroup = newGroup;
	
	this.updateGroupMenu();
	
	this.resultList.clear();
	
	switch(this.currentPlaylistGroup) {
		case 'all':
			Object.extend(this.resultList,this.fullResultList);
		  break;
		case 'inPlaylist':
			Object.extend(this.resultList,trimMusicPlaylist(this.fullResultList, this.currentPlaylistGroup));
		  break;
		case 'notInPlaylist':
			Object.extend(this.resultList,trimMusicPlaylist(this.fullResultList, this.currentPlaylistGroup));
		  break;
		default:
			Object.extend(this.resultList,this.fullResultList);
		  break;
	}
	
	if(this.currentPlaylist.type == "2 - Host"){
		$("scene-title").innerHTML = $L("Frontend")+": "+this.currentPlaylist.hostname;
	} else {
		$("scene-title").innerHTML = $L("Playlist")+": "+this.currentPlaylist.playlist_name;
	}
	
	this.controller.sceneScroller.mojo.revealTop();
	
	
	//Initial display
	var listWidget = this.controller.get('musicList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	try {
		listWidget.mojo.close();
	} catch(e) {
		Mojo.Log.error(e);
	}
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()

};

MusicPlaylistAssistant.prototype.updateGroupMenu = function() {
	
	//Reset default sorting
	this.groupMenuModel.items = [ 
		{"label": $L("All"), "command": "go-groupall" },
		{"label": $L("In Playlist"), "command": "go-groupinPlaylist" },
		{"label": $L("Not in Playlist"), "command": "go-groupnotInPlaylist" }
	] ;
	
	switch(this.currentPlaylistGroup) {
		case 'all':
			this.groupMenuModel.items[0].label = '- '+this.groupMenuModel.items[0].label+' -';
		  break;
		case 'inPlaylist':
			this.groupMenuModel.items[1].label = '- '+this.groupMenuModel.items[1].label+' -';
		  break;
		case 'notInPlaylist':
			this.groupMenuModel.items[2].label = '- '+this.groupMenuModel.items[2].label+' -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.groupMenuModel, this);
	
};

MusicPlaylistAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	//Mojo.Log.info("Started filtering with '%s'",filterString);
	
	this.offset = offset;
	
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
	this.subset.clear();
	var totalSubsetSize = 0;
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
	
	//Mojo.Log.info("subset is %j",subset);
	
	//Mojo.Log.info("offset is %s",offset);
	
	try {
		listWidget.mojo.noticeUpdatedItems(offset, this.subset);
		listWidget.mojo.setLength(totalSubsetSize);
		listWidget.mojo.setCount(totalSubsetSize);
    } catch(e) {
        Mojo.Log.error(e);
    }
	
};	

MusicPlaylistAssistant.prototype.doMusicPlaylist = function(event) {
	
	Mojo.Log.info("Selected individual music playlist: '%j'", event.item);
	
	for(var j = 0; j < this.playlistsList.length; j++) {
		
		if(this.playlistsList[j].playlist_id == event.item.playlist_id){
			this.playlistsList[j].inPlaylist = !this.playlistsList[j].inPlaylist;
			//Mojo.Log.info("Updating playlistsList #"+j);
		}
	}

	var listWidget = this.controller.get('musicPlaylistsList');
	listWidget.mojo.noticeUpdatedItems(0, this.playlistsList);
	
};

MusicPlaylistAssistant.prototype.doMusicDetails = function(event) {
	//var upcoming_chanid = event.item.chanid;
	//var upcoming_starttime = event.item.starttime;
	
	Mojo.Log.info("Selected individual music: '%j'", event.item.song_id, event.item.name, event.item.inPlaylist);
	
	for(var j = 0; j < this.fullResultList.length; j++) {
		
		if(this.fullResultList[j].song_id == event.item.song_id){
			this.fullResultList[j].inPlaylist = !this.fullResultList[j].inPlaylist;
			//Mojo.Log.info("Updating fullResultList #"+j);
		}
	}

	var listWidget = this.controller.get('musicList');
	listWidget.mojo.noticeUpdatedItems(this.offset, this.subset);
	
};

MusicPlaylistAssistant.prototype.doMusicReorder = function(event) {

	Mojo.Log.info("Got reorder event: %s, %s, '%j'", event.fromIndex, event.toIndex, event.item);
	
	var fullIndex = this.fullResultList.indexOf(event.item);
	var newFullIndex = fullIndex + event.toIndex - event.fromIndex;
	
	Mojo.Log.info("Full index of "+fullIndex+" new index is "+newFullIndex);
	
    this.fullResultList.splice(fullIndex, 1);
    this.fullResultList.splice(newFullIndex, 0, event.item);
	
};

MusicPlaylistAssistant.prototype.doSave = function(mySelection) {
	
	Mojo.Log.info("Now saving..."+mySelection);
	
	var songArray = new Array();
	var songList = [];
	var arrayIndex = 0, totalLength = 0, i, s = {};
	
	for(i = 0; i < this.playlistsList.length; i++){
		
		s = this.playlistsList[i];
		
		if(s.inPlaylist) {
			s.index = this.playlistsList.indexOf(s);
			s.song_id = parseInt(s.playlist_id)*(-1);
			s.type = 'playlist';
			
			//songList.push(s);
			
			songArray[arrayIndex] = s.song_id;
			totalLength += parseInt(s.length);
			arrayIndex++;
			
			//Mojo.Log.info("matching playlist %s, %s",s.display_name, s.song_id);
			
		}
		
	}
	
	for(i = 0; i < this.fullResultList.length; i++){
		
		s = this.fullResultList[i];
		
		if(s.inPlaylist) {
			s.index = this.fullResultList.indexOf(s);
			s.type = 'song';
			
			//songList.push(s);
			
			Mojo.Log.info("matching song %s, %s",s.name, s.index);
			
			songArray[arrayIndex] = s.song_id;
			totalLength += parseInt(s.length);
			arrayIndex++;
		}
		
	}
	/*
	Mojo.Log.info("Found "+songList.length+" songs to add, now getting order");
	
	songList.sort(double_sort_by('type', 'index', false));
	
	for(i = 0; i < songList.length; i++){
			
		songArray[arrayIndex] = songList[i].song_id;
		totalLength += parseInt(songList[i].length);
		arrayIndex++;
		
	}
	*/
	
	this.songArrayString = songArray.toString();
	this.newSongcount = arrayIndex;
	this.newLength = totalLength;
	
	Mojo.Log.info("New array list is "+this.songArrayString+" with length "+this.newLength);
	
	
	switch(mySelection) {
		case 'new':
			Mojo.Log.error("Saving new playlist");

			//Use dialog for getting name
			
			this.controller.showDialog({
				template: 'dialogs/nameDialog',
				assistant: new NameDialogAssistant(this, this.newNameCallback.bind(this))
			});
		  break;
		  
		case 'update':
			Mojo.Log.error("Updating playlist");

			this.updatePlaylist();

		  break;
		  
		case 'delete':
			Mojo.Log.error("Deleting playlist");
			
			this.controller.showAlertDialog({
				onChoose: function(value) {
					switch(value) {
						case 'yes':
						
							this.deletePlaylist();
							
						  break;
						case 'no':
							
						  break;
						
						}
					},
				title: "WebMyth - v" + Mojo.Controller.appInfo.version,
				message:  "Are you sure you want to delete the playlist '"+this.currentPlaylist.playlist_name+"'?", 
				choices: [
						{label: $L("Yes"), value: 'yes', type: 'affirmative'},
						{label: $L("No"), value: 'no', type: 'negative'}
						],
				allowHTMLMessage: true
			});

		  break;
		  
		case 'host':
			Mojo.Log.error("Saving host playlist");
			
			this.controller.showAlertDialog({
				onChoose: function(value) {
					switch(value) {
						case 'save':
						
							this.updatePlaylist();
							
						  break;
						case 'wait':
							//do nothing
						  break;
						
						}
					},
				title: "WebMyth - v" + Mojo.Controller.appInfo.version,
				message:  "If you are currently listening to music or have done so recently on this frontend your updates will not be saved.  <hr />You must close out of the MythTV frontend completely before your changes can be saved.", 
				choices: [
						{label: $L("Save Now"), value: 'save', type: 'affirmative'},
						{label: $L("Don't Save"), value: 'wait', type: 'negative'}
						],
				allowHTMLMessage: true
			});

		  break;

		  break;
		  
		default:
			Mojo.Log.info("Unknown save command: "+mySelection);
			
		  break;
	}
		
}

MusicPlaylistAssistant.prototype.newNameCallback = function(value) {

	Mojo.Log.info("Got playlist name: "+value);
	
	var query = 'INSERT INTO `music_playlists` SET `playlist_name` = "'+value+'", `playlist_songs` = "'+this.songArrayString;
	query += '", `length` = "'+this.newLength+'", `songcount` = "'+this.newSongcount;
	query += '" ;';
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

MusicPlaylistAssistant.prototype.updatePlaylist = function() {

	Mojo.Log.info("Saving updates to playlist");
	
	var query = 'UPDATE `music_playlists` SET `playlist_songs` = "'+this.songArrayString;
	query += '", `length` = "'+this.newLength+'", `songcount` = "'+this.newSongcount;
	query += '" WHERE `playlist_id` = "'+this.currentPlaylist.playlist_id+'" LIMIT 1 ;';
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

}

MusicPlaylistAssistant.prototype.deletePlaylist = function() {

	Mojo.Log.info("Inside deleting playlist");
	
	var query = 'DELETE FROM `music_playlists` ';
	query += ' WHERE `playlist_id` = "'+this.currentPlaylist.playlist_id+'" LIMIT 1 ;';
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

}

MusicPlaylistAssistant.prototype.executeSqlFail = function() {

    Mojo.Log.error('FAIL SQL!!!');
	
	Mojo.Controller.getAppController().showBanner("Error saving playlist", {source: 'notification'});
	
};

MusicPlaylistAssistant.prototype.executeSqlSuccess = function(response) {

    Mojo.Log.info('Got execute SQL response : ' + response.responseText);
	
	Mojo.Controller.getAppController().showBanner("Success saving playlist", {source: 'notification'});
	
	Mojo.Controller.stageController.swapScene("musicList", this.allMusic);
	
};

MusicPlaylistAssistant.prototype.musicDividerFunction = function(itemModel) {
	 
	//Divider function for list
    //return itemModel.title.toString()[0];	
	//return itemModel.starttime.substring(0,10);
	//var date = new Date(isoToJS(itemModel.starttime));
	
	var dividerData = itemModel.inPlaylist;
	
	return dividerData;
	
};

MusicPlaylistAssistant.prototype.setMyPlaylistData = function(propertyValue, model) {

	var playlistDetailsText = '<div class="palm-row music-playlists-item">';
	playlistDetailsText += '<div class="title truncating-text left music-playlist-title">&nbsp;';
	
	if(model.inPlaylist) {
		playlistDetailsText += '<img class="inPlaylist-true" src="images/palm/checkmark-dark.png" /><div class="title truncating-text left music-playlist-title-checked">';
		playlistDetailsText += model.display_name+'</div></div>';
	} else {
		playlistDetailsText += '&nbsp;&nbsp;'+model.display_name+'</div>';
	}
	
	
	
	playlistDetailsText += '</div>';

	
	model.myData = playlistDetailsText;
	
};

MusicPlaylistAssistant.prototype.setMySongData = function(propertyValue, model) {

	var albumArtUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetAlbumArt?Id=";
	albumArtUrl += model.albumart_id;
	
	var musicDetailsText = '<div class="musicPlaylist-list-item">';
	musicDetailsText += '<div class="title truncating-text left music-list-title">&nbsp;';
	
	if(model.inPlaylist) {
		musicDetailsText += '<img class="inPlaylist-true" src="images/palm/checkmark-dark.png" /><div class="title truncating-text left music-list-title-checked">';
		musicDetailsText += model.name+'</div></div>';
	} else {
		musicDetailsText += model.name+'</div>';
	}
	
	musicDetailsText += '<div class="palm-row-wrapper">';
	
	musicDetailsText += '<div class="left-music-image"> <div class="left-list-music-image-wrapper">';
	musicDetailsText += '<img class="musicPlaylist-albumart-small" src="'+albumArtUrl+'" />';
	musicDetailsText += '</div> </div>';
	
	
	musicDetailsText += '<div class="right-music-text">';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+$L('Artist')+': '+model.artist_name+'&nbsp;</div>';
	musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+$L('Album')+': '+model.album_name+'&nbsp;</div>';
	//musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+$L('Track')+' #: '+model.track+'</div>';
	//musicDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+$L('Year')+': '+model.year+'</div>';
	musicDetailsText += '</div>';
	
	
	musicDetailsText += '</div></div>';

	
	model.myData = musicDetailsText;
	
};





/*
	Small controller class used for entering new playlsit name.
*/

var NameDialogAssistant = Class.create({
	
	
	initialize: function(sceneAssistant, callbackFunc) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
		
		this.callbackFunc = callbackFunc;
	},
	
	setup : function(widget) {
	
		this.widget = widget;
		

		this.nameTextModel = {
				 value: "",
				 disabled: false
		};
		this.controller.setupWidget("nameTextFieldId",
			{
				hintText: $L("Playlist Name"),
				multiline: false,
				enterSubmits: true,
				focus: true,
				textCase: Mojo.Widget.steModeLowerCase
			 },
			 this.nameTextModel
		); 
		
		
		//Button
		Mojo.Event.listen(this.controller.get('goSaveButton'),Mojo.Event.tap,this.saveButton.bind(this));

		$('saveButtonWrapper').innerText = $L('Save');
		
	},
	
	saveButton: function() {
	
		this.callbackFunc(this.nameTextModel.value);

		this.widget.mojo.close();
	}
	
	
});
