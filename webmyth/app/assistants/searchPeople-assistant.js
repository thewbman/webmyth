/*
 *   WebMyth - An open source webOS app for controlling a MythTV frontend. 
 *   http://code.google.com/p/webmyth/
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
 
function SearchPeopleAssistant(personObject_in) {

	//this.fullResultList = [];		//Full raw data 
	this.programPeopleList = [];
	this.videoCastList = [];
	this.resultList = [];			//Filtered down list
	
	this.searchString = "";

	if(personObject_in) {
		this.personObject = personObject_in;
		this.currentMode = "program";	
	} else {
		this.personObject = {"name":"","videoPersonId":"","person":""};
		this.currentMode = "person";
	}
	
	//this.personName = "";
	
}

SearchPeopleAssistant.prototype.setup = function() {

	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: false
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	
	
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Search Menu'),
                            items: [ { label: $L('Sort'), submenu:'sort-menu', width: 90},
									 { label: $L('Search'), command: 'go-newSearch', width: 90 },
									 { label: $L('Web'), submenu:'web-menu', width: 90 }
								]};
								
	this.sortMenuModel = { label: $L('Sort'), items: [
			{"label": $L('Category-Asc'), "command": "go-sort-category-asc"},
			{"label": $L('Category-Desc'), "command": "go-sort-category-desc"},
			{"label": $L('Date-Asc'), "command": "go-sort-date-asc"},
			{"label": $L('Date-Desc'), "command": "go-sort-date-desc"},
			{"label": $L('Title-Asc'), "command": "go-sort-title-asc"},
			{"label": $L('Title-Desc'), "command": "go-sort-title-desc"}
			]};
								
	this.webMenuModel = { label: $L('Web'), items: [
			{"label": $L('Wikipedia'), "command": "go-web-wikipedia"},
			{"label": $L('IMDB'), "command": "go-web-imdb"},
			{"label": $L('Google'), "command": "go-web-google"},
			{"label": $L('Google Images'), "command": "go-web-images"}
		]};
			
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('sort-menu', '', this.sortMenuModel);
	this.controller.setupWidget('web-menu', '', this.webMenuModel);
	
	
	// List - dual use for searching for people/getting people results
	this.searchPeopleListAttribs = {
		itemTemplate: "searchPeople/searchPeopleListItem",
		dividerTemplate: "searchPeople/searchPeopleDivider",
		swipeToDelete: false,
		renderLimit: 50,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.searchDividerFunction.bind(this),
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.searchPeopleListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "searchPeopleList" , this.searchPeopleListAttribs, this.searchPeopleListModel);
	
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "searchPeopleList" ), Mojo.Event.listTap, this.goSearchDetails.bind(this));
	Mojo.Event.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	if(WebMyth.usePlugin){
		$('webmyth_service_id').mysqlPeopleSearchResponse = this.mysqlPeopleSearchResponse.bind(this);
		$('webmyth_service_id').mysqlVideoCastSearchResponse = this.mysqlVideoCastSearchResponse.bind(this);
		
		$('webmyth_service_id').mysqlPeopleProgramsResponse = this.mysqlPeopleProgramsResponse.bind(this);
		$('webmyth_service_id').mysqlPeopleVideosResponse = this.mysqlPeopleVideosResponse.bind(this);
	}
	
	
	if(this.personObject.name == "") {
		this.newSearch();
	} else {
		if((isNaN(this.personObject.videoPersonId))||(this.personObject.videoPersonId == "")){
			this.personObject.videoPersonId = -1;
		}
		if((isNaN(this.personObject.person))||(this.personObject.person == "")){
			this.personObject.person = -1;
		}
		
		this.getPrograms();
	}
								
								
};

SearchPeopleAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	Mojo.Event.listen(this.controller.stageController.document, "gesturestart", this.gestureStart.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.stageController.document, "gestureend", this.gestureEnd.bindAsEventListener(this));
	
};

SearchPeopleAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	Mojo.Event.stopListening(this.controller.stageController.document, "gesturestart", this.gestureStart.bind(this));
	Mojo.Event.stopListening(this.controller.stageController.document, "gestureend", this.gestureStart.bind(this));
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

SearchPeopleAssistant.prototype.cleanup = function(event) {

};

SearchPeopleAssistant.prototype.handleCommand = function(event) {

	if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
	} else if(event.type == Mojo.Event.command) {

		switch(event.command) {
			case 'go-newSearch':
				this.newSearch();

			  break;
			case 'go-sort-category-asc':
				this.sortChanged('category-asc');

			  break;
			case 'go-sort-category-desc':
				this.sortChanged('category-desc');

			  break;
			case 'go-sort-channel-asc':
				this.sortChanged('channel-asc');

			  break;
			case 'go-sort-channel-desc':
				this.sortChanged('channel-desc');

			  break;
			case 'go-sort-date-asc':
				this.sortChanged('date-asc');
			  break;
			case 'go-sort-date-desc':
				this.sortChanged('date-desc');

			  break;
			case 'go-sort-title-asc':
				this.sortChanged('title-asc');

			  break;
			case 'go-sort-title-desc':
				this.sortChanged('title-desc');

			  break;
			case 'go-web-wikipedia':
				this.openWeb('wikipedia');

			  break;
			case 'go-web-imdb':
				this.openWeb('imdb');

			  break;
			case 'go-web-google':
				this.openWeb('google');

			  break;
			case 'go-web-images':
				this.openWeb('images');

			  break;
			  
		}
	}
  
};

SearchPeopleAssistant.prototype.handleKey = function(event) {

	Mojo.Log.info("handleKey %o, %o", event.originalEvent.metaKey, event.originalEvent.keyCode);
	
	if(event.originalEvent.metaKey) {
		switch(event.originalEvent.keyCode) {
			case 72:
				Mojo.Log.info("h - shortcut key to recorded");
				Mojo.Controller.stageController.pushScene("hostSelector");
				break;
			case 82:
				Mojo.Log.info("r - shortcut key to recorded");
				Mojo.Controller.stageController.pushScene("recorded");
				break;
			case 85:
				Mojo.Log.info("u - shortcut key to upcoming");
				Mojo.Controller.stageController.pushScene("upcoming");
				break;
			case 71:
				Mojo.Log.info("g - shortcut key to guide");
				Mojo.Controller.stageController.pushScene("guide");	
				break;
			case 86:
				Mojo.Log.info("v - shortcut key to videos");
				Mojo.Controller.stageController.pushScene("videos");	
				break;
			case 77:
				Mojo.Log.info("m - shortcut key to musicList");
				Mojo.Controller.stageController.pushScene("musicList");	
				break;
			case 83:
				Mojo.Log.info("s - shortcut key to status");
				Mojo.Controller.stageController.pushScene("status");
				break;
			case 76:
				Mojo.Log.info("l - shortcut key to log");
				Mojo.Controller.stageController.pushScene("log");	
				break;
			default:
				Mojo.Log.info("No shortcut key");
				break;
		}
	}
	
	Event.stop(event); 
	
};

SearchPeopleAssistant.prototype.gestureStart = function(event) {
	
	this.gestureStartY = event.centerY;

};

SearchPeopleAssistant.prototype.gestureEnd = function(event) {

	this.gestureEndY = event.centerY;
	this.gestureDistance = this.gestureEndY - this.gestureStartY;
	
	if(this.gestureDistance>0) {
		this.controller.getSceneScroller().mojo.revealTop();
	} else if(this.gestureDistance<0) {
		this.controller.getSceneScroller().mojo.revealBottom();
	}

};








SearchPeopleAssistant.prototype.newSearch = function() {

	Mojo.Log.info("Starting new search");

	//Use dialog for getting search query
	
	this.controller.showDialog({
		template: 'dialogs/searchDialog',
		assistant: new SearchPeopleDialogAssistant(this, this.newSearchCallback.bind(this))
	});

};

SearchPeopleAssistant.prototype.newSearchCallback = function(value) {

	this.searchString = value;
	Mojo.Log.error("Got new search query: "+this.searchString);
	
	if(this.searchString == "") {
		this.searchString = "You must enter something";
	}
	
	
	this.currentMode = "person";
	this.resultList.clear();

	
	$('scene-title').innerHTML = $L("Search")+": '"+this.searchString+"'";


	//Restart spinner and show
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('spinner-text').innerHTML = $L("Loading")+"...";
	$('myScrim').show();


	//Programs people search
	var query = "SELECT `person`, `name` ";
	query += " FROM `people` "
	query += ' WHERE UPPER(`name`) LIKE "%'+this.searchString.toUpperCase()+'%" ';
	query += " ORDER BY name ";
	query += " LIMIT 1000 ";
	
	//Mojo.Log.error("query is "+query);
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlPeopleSearchResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		Mojo.Log.error("Search plugin response "+response1);
		
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
				onSuccess: this.peopleSearchSuccess.bind(this),
				onFailure: this.peopleSearchFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}
	
};

SearchPeopleAssistant.prototype.peopleSearchFail = function(event) {

	Mojo.Log.error('Failed to get search response');
	
	
	$('scene-title').innerHTML = $L("Error in searching")+"!!!";
	
	
	this.resultList.clear();
	this.resultList.push({ 'person': -1, 'name':'Error in searching' });
	
	
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//Initial display
	var listWidget = this.controller.get('searchPeopleList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();	
	
};

SearchPeopleAssistant.prototype.peopleSearchSuccess = function(response) {
    
	Mojo.Log.error('Got Ajax response: %j',response.responseJSON);
	
	this.programPeopleList.clear();
	
	if(response.responseJSON) {
		//We got back some rows
		Object.extend(this.programPeopleList,response.responseJSON);
		
	} else {
		//No matching results from program people
	
		Mojo.Log.error("No program people response results");
	
	}
	
	this.searchVideoCast();

};

SearchPeopleAssistant.prototype.mysqlPeopleSearchResponse = function(response) {

	Mojo.Log.error("Got search plugin response: "+response);
	
	var searchPeopleJson = JSON.parse(response);
	
	this.programPeopleList.clear();
	
	if(searchPeopleJson.length > 0) {
		//We got back some rows
		Object.extend(this.programPeopleList,searchPeopleJson);
		
	} else {
		//No matching results from program people search
	
		Mojo.Log.error("No program people response results");
	
	}
	
	this.controller.window.setTimeout(this.searchVideoCast.bind(this), 50);
	
}

SearchPeopleAssistant.prototype.searchVideoCast = function() {

	//Video cast search
	var query = "SELECT `intid` AS videoPersonId, `cast` AS name ";
	query += " FROM `videocast` "
	query += ' WHERE UPPER(`cast`) LIKE "%'+this.searchString.toUpperCase()+'%" ';
	query += " ORDER BY cast ";
	query += " LIMIT 1000 ";
	
	//Mojo.Log.error("query is "+query);
	
	
	
	if(WebMyth.usePlugin){
	
		var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlVideoCastSearchResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
		
		Mojo.Log.error("Search video cast plugin response "+response1);
		
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
				onSuccess: this.videoCastSearchSuccess.bind(this),
				onFailure: this.videoCastSearchFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}
	

};

SearchPeopleAssistant.prototype.videoCastSearchFail = function(event) {

	Mojo.Log.error('Failed to get video cast search response');
	
	
	$('scene-title').innerHTML = $L("Error in searching")+"!!!";
	
	
	this.resultList.clear();
	this.resultList.push({ 'person': -1, 'name':'Error in searching' });
	
	
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//Initial display
	var listWidget = this.controller.get('searchPeopleList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();	
	
};

SearchPeopleAssistant.prototype.videoCastSearchSuccess = function(response) {
    
	Mojo.Log.error('Got video cast response: %j',response.responseJSON);
	
	this.videoCastList.clear();
	
	if(response.responseJSON) {
		//We got back some rows
		Object.extend(this.videoCastList,response.responseJSON);
		
	} else {
		//No matching results from program people
	
		Mojo.Log.error("No video cast response results");
	
	}
	
	this.combinePeople();

};

SearchPeopleAssistant.prototype.mysqlVideoCastSearchResponse = function(response) {

	Mojo.Log.error("Got video cast plugin response: "+response);
	
	var searchPeopleJson = JSON.parse(response);
	
	this.videoCastList.clear();
	
	if(searchPeopleJson.length > 0) {
		//We got back some rows
		Object.extend(this.videoCastList,searchPeopleJson);
		
	} else {
		//No matching results from program people search
	
		Mojo.Log.error("No program people response results");
	
	}
	
	this.combinePeople();
	
}

SearchPeopleAssistant.prototype.combinePeople = function() {

	//Combine program people and video cast list
	this.resultList.clear();
	var s = {};
	
	if((this.videoCastList.length == 0)&&(this.programPeopleList.length == 0)) {
		Mojo.Log.info("No matching people in programs or video cast");
		
		this.resultList.push({ 'person': -1, 'name':'No people found', "videoPersonId": -1 });
		
	} else if(this.videoCastList.length == 0) {
		Mojo.Log.info("Only found matching program people");
		
		for(var i = 0; i < this.programPeopleList.length; i++){
			s = {};
			s = this.programPeopleList[i];
			
			s.videoPersonId = -1;
			
			this.resultList.push(s);
		
		}
	
	} else if(this.programPeopleList.length == 0) {
		Mojo.Log.info("Only found matching video cast");
		
		for(var i = 0; i < this.videoCastList.length; i++){
			s = {};
			s = this.videoCastList[i];
			
			s.person = -1;
			
			this.resultList.push(s);
		
		}
		
	} else {
		Mojo.Log.info("Found both program people and video cast");

		//Process the programs people list first
		for(var i = 0; i < this.programPeopleList.length; i++){
			s = {};
			s = this.programPeopleList[i];
			
			s.videoPersonId = -1;
			
			for(var j = 0; j < this.videoCastList.length; j++){
				
				if(this.videoCastList[j].name == s.name){
					s.videoPersonId = this.videoCastList[j].videoPersonId;
					
					this.videoCastList[j].matched = true;
				}
			
			}
			
			this.resultList.push(s);
			
		}
		
		//Add in any video cast-only people
		for(var i = 0; i < this.videoCastList.length; i++){
			s = {};
			s = this.videoCastList[i];
			
			s.person = -1;
			
			if(s.matched) {
				//We already added this using program people
			} else {
				this.resultList.push(s);
			}
			
		}
		
	}
	
	this.resultList.sort(sort_by('name'));
	
	Mojo.Log.info("Final resultList = %j",this.resultList);
	
	$('scene-title').innerHTML += " ("+this.resultList.length+" "+$L("people")+")";
	$('scene-title').innerHTML = $('scene-title').innerHTML.substring(0,40);
	
	this.sortChanged(WebMyth.prefsCookieObject.currentSearchPeopleSort);

}

SearchPeopleAssistant.prototype.getPrograms = function() {

	//Mojo.Log.error("Searching for programs with personId : "+this.personId);
	
	
	this.currentMode = "program";
	this.resultList.clear();
	
	$('scene-title').innerHTML = this.personObject.name;

	
	//Restart spinner and show
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('spinner-text').innerHTML = $L("Loading")+"...";
	$('myScrim').show();


	
	var query = "SELECT `people`.`person`, `people`.`name`,  ";
	query += " `credits`.`chanid`, `credits`.`starttime`, UPPER(`credits`.`role`) AS `role`,  ";
	query += " `program`.`title`, `program`.`subtitle`, `program`.`category`, `program`.`endtime` AS `endTime`, ";
	query += " `channel`.`name` AS channelName, `channel`.`channum`, ";
	query += " 'program' AS type ";
	query += " FROM `people` ";
	query += " LEFT OUTER JOIN `credits` ON `credits`.`person` = `people`.`person` ";
	query += " LEFT OUTER JOIN `program` ON (`program`.`chanid` = `credits`.`chanid` AND `program`.`starttime` = `credits`.`starttime`)";
	query += " LEFT OUTER JOIN `channel` ON `channel`.`chanid` = `program`.`chanid` ";
	query += ' WHERE `people`.`person` = '+parseInt(this.personObject.person)+' ';
	query += " LIMIT 1000 ";
	
	//Mojo.Log.error("query is "+query);
	
	
	if(this.personObject.person > -1){
		if(WebMyth.usePlugin){
		
			var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlPeopleProgramsResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
			
			Mojo.Log.error("Search plugin response "+response1);
			
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
					onSuccess: this.programsSearchSuccess.bind(this),
					onFailure: this.programsSearchFail.bind(this)  
				});
			}
			catch(e) {
				Mojo.Log.error(e);
			}
			
		}
		
	} else {
	
		//Wasn't a matching a program person
		this.getVideos();
	
	}
	
};

SearchPeopleAssistant.prototype.programsSearchFail = function(event) {

	Mojo.Log.error('Failed to get programs response');
	
	
	$('scene-title').innerHTML = $L("Error in searching")+"!!!";
	
	
	this.resultList.clear();
	this.resultList.push({ 'person': -1, 'name':'Error in searching', 'title':'Error in searching', 'subtitle':'Error in searching','role':'','starttime':'1900-01-01 00:00:00' } );
	
	
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//Initial display
	var listWidget = this.controller.get('searchPeopleList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();	
	
};

SearchPeopleAssistant.prototype.programsSearchSuccess = function(response) {
    
	Mojo.Log.error('Got programs search response: %j', response.responseJSON);
	
	if(response.responseJSON.length > 1) {
		//We got back some rows
		
		var nowDate = new Date();
		var nowDateISO = dateJSToISO(nowDate).replace("T"," ");
		
		//this.personName = response.responseJSON[0].name
		//$('scene-title').innerHTML = this.personName;
		
		//Update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,cleanSearchResults(response.responseJSON,nowDateISO));
		
		//Mojo.Log.error('Cleaned search results: %j',this.resultList);
		
		if(this.resultList.length == 0) {
			//this.resultList.clear();
			//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
			Mojo.Log.error("Had results but are old");
			
		} else {
		
			//$('scene-title').innerHTML += " ("+this.resultList.length+" "+$L("items")+")";
			//$('scene-title').innerHTML = $('scene-title').innerHTML.substring(0,40);
		}
		
	} else if((response.responseJSON.length == 1)&&((response.responseJSON[0].title == "") || (response.responseJSON[0].title == "None"))){
		//No matching results from guide
		
		//this.personName = response.responseJSON[0].name
		//$('scene-title').innerHTML = this.personName;
	
		//this.resultList.clear();
		//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
		Mojo.Log.error("No response results %j",this.resultList);
		
	} else if(response.responseJSON.length == 1) {
		//We got back a single valid row
		
		var nowDate = new Date();
		var nowDateISO = dateJSToISO(nowDate).replace("T"," ");
		
		//this.personName = response.responseJSON[0].name
		//$('scene-title').innerHTML = this.personName;
		
		//Update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,cleanSearchResults(response.responseJSON,nowDateISO));
		
		
		if(this.resultList.length == 0) {
			//this.resultList.clear();
			//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
			Mojo.Log.error("Had results but are old");
			
		} else {
		
			//$('scene-title').innerHTML += " ("+this.resultList.length+" "+$L("items")+")";
			//$('scene-title').innerHTML = $('scene-title').innerHTML.substring(0,40);
			
		}
	
	} else {
		//No matching results from guide
	
		//this.resultList.clear();
		//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
		Mojo.Log.error("No response results %j",this.resultList);
	
	}
	
	this.getVideos();

};

SearchPeopleAssistant.prototype.mysqlPeopleProgramsResponse = function(response) {

	Mojo.Log.error("Got search plugin response: "+response);
	
	var searchProgramsJson = JSON.parse(response);
	
	
	if(searchProgramsJson.length > 1) {
		//We got back some rows
		
		var nowDate = new Date();
		var nowDateISO = dateJSToISO(nowDate).replace("T"," ");
		
		//this.personName = searchProgramsJson[0].name
		//$('scene-title').innerHTML = this.personName;
		
		//Update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,cleanSearchResults(searchProgramsJson, nowDateISO));
		
		
		if(this.resultList.length == 0) {
			//this.resultList.clear();
			//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
			Mojo.Log.error("Had results but are old");
			
		} else {
		
			//$('scene-title').innerHTML += " ("+this.resultList.length+" "+$L("items")+")";
			//$('scene-title').innerHTML = $('scene-title').innerHTML.substring(0,40);
			
		}
		
	} else if((searchProgramsJson.length == 1)&&((searchProgramsJson[0].title == "") || (searchProgramsJson[0].title == "None"))){
		//No matching results from guide
		
		//this.personName = searchProgramsJson[0].name;
		//$('scene-title').innerHTML = this.personName;
	
		//this.resultList.clear();
		//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
		Mojo.Log.error("No response results %j",this.resultList);
	
	} else if(searchProgramsJson.length == 1) {
		//We got back a single valid row
		
		var nowDate = new Date();
		var nowDateISO = dateJSToISO(nowDate).replace("T"," ");
		
		//this.personName = searchProgramsJson[0].name;
		//$('scene-title').innerHTML = this.personName;
		
		//Update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,cleanSearchResults(response.responseJSON,nowDateISO));
		
		
		if(this.resultList.length == 0) {
			//this.resultList.clear();
			//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
			Mojo.Log.error("Had results but are old");
			
		} else {
		
			//$('scene-title').innerHTML += " ("+this.resultList.length+" "+$L("items")+")";
			//$('scene-title').innerHTML = $('scene-title').innerHTML.substring(0,40);
			
		}
		
	} else {
		//No matching results from guide
	
		//this.resultList.clear();
		//this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
	
		Mojo.Log.error("No response results %j",this.resultList);
	
	}
	
	this.controller.window.setTimeout(this.getVideos.bind(this), 50);
	
}

SearchPeopleAssistant.prototype.getVideos = function(){

	Mojo.Log.info("Starting to get videos for %j",this.personObject);


	
	var query = "SELECT `videocast`.`cast` AS name, `videocast`.`intid` AS videoPersonId,  ";
	query += " videometadata.intid, videometadata.title, videometadata.subtitle, videometadata.plot, videometadata.inetref,  "; 
	query += " videometadata.homepage, videometadata.releasedate, videometadata.season, videometadata.episode, videometadata.filename, ";
	query += " videometadata.director, videometadata.year, videometadata.rating, videometadata.length, videocategory.category, ";
	query += " videometadata.hash, videometadata.coverfile, videometadata.host, videometadata.insertdate, ";
	query += " 'video' AS type ";
	query += " FROM `videocast` ";
	query += " LEFT OUTER JOIN `videometadatacast` ON `videometadatacast`.`idcast` = `videocast`.`intid` ";
	query += " LEFT OUTER JOIN `videometadata` ON `videometadata`.`intid` = `videometadatacast`.`idvideo` ";
	query += " LEFT OUTER JOIN videocategory ON videocategory.intid = videometadata.category ";
	query += ' WHERE `videocast`.`intid` = '+parseInt(this.personObject.videoPersonId)+' ';
	query += " LIMIT 1000 ";
	
	//Mojo.Log.error("query is "+query);
	
	
	if(this.personObject.videoPersonId > -1){
		if(WebMyth.usePlugin){
		
			var response1 = $('webmyth_service_id').mysqlCommand(WebMyth.prefsCookieObject.databaseHost,WebMyth.prefsCookieObject.databaseUsername,WebMyth.prefsCookieObject.databasePassword,WebMyth.prefsCookieObject.databaseName,WebMyth.prefsCookieObject.databasePort,"mysqlPeopleVideosResponse",query.substring(0,250),query.substring(250,500),query.substring(500,750),query.substring(750,1000),query.substring(1000,1250),query.substring(1250,1500),query.substring(1500,1750),query.substring(1750,2000),query.substring(2000,2250),query.substring(2250,2500));
			
			Mojo.Log.error("Search videos from cast plugin response "+response1);
			
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
					onSuccess: this.videosSearchSuccess.bind(this),
					onFailure: this.videosSearchFail.bind(this)  
				});
			}
			catch(e) {
				Mojo.Log.error(e);
			}
			
		}
		
	} else {
	
		//Wasn't a matching a video cast
		this.sortChanged(WebMyth.prefsCookieObject.currentSearchPeopleSort);
	
	}
	
	

}

SearchPeopleAssistant.prototype.videosSearchFail = function(event) {

	Mojo.Log.error('Failed to get videos response');
	
	
	$('scene-title').innerHTML = $L("Error in searching")+"!!!";
	
	
	this.resultList.clear();
	this.resultList.push({ 'person': -1, 'name':'Error in searching', 'title':'Error in searching', 'subtitle':'Error in searching','role':'','starttime':'1900-01-01 00:00:00' } );
	
	
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//Initial display
	var listWidget = this.controller.get('searchPeopleList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();	
	
};

SearchPeopleAssistant.prototype.videosSearchSuccess = function(response) {
    
	Mojo.Log.error('Got videos search response: %j', cleanVideos(response.responseJSON));
	
	if(response.responseJSON.length > 1) {
		//We got back some rows
		
		for(var i = 0; i < response.responseJSON.length; i++) {
			
			if(((response.responseJSON[i].title != "None")&&(response.responseJSON[i].subtitle != "None"))||((response.responseJSON[i].title != "")&&(response.responseJSON[i].subtitle != ""))) {
				this.resultList.push(response.responseJSON[i]);
			}
		
		}
		
		
	} else if((response.responseJSON.length == 1)&&((response.responseJSON[0].title == "") || (response.responseJSON[0].title == "None"))){
		//No matching results from guide
		
		Mojo.Log.error("No valid videos results %j",response.responseJSON);
		
	} else if(response.responseJSON.length == 1) {
		//We got back a single valid row
		
		for(var i = 0; i < response.responseJSON.length; i++) {
			
			this.resultList.push(response.responseJSON[i]);
		
		}
	
	} else {
		//No matching results from guide
	
		Mojo.Log.error("No videos results %j",response.responseJSON);
	
	}
	
	
	this.sortChanged(WebMyth.prefsCookieObject.currentSearchPeopleSort);

};

SearchPeopleAssistant.prototype.mysqlPeopleVideosResponse = function(response) {

	Mojo.Log.error("Got search videos plugin response: "+response);
	
	var searchVideosJson = cleanVideos(JSON.parse(response));
	
	
	if(searchVideosJson.length > 1) {
		//We got back some rows
		
		for(var i = 0; i < searchVideosJson.length; i++) {
			
			this.resultList.push(searchVideosJson[i]);
		
		}
		
	} else if((searchVideosJson.length == 1)&&((searchVideosJson[0].title == "") || (searchVideosJson[0].title == "None"))){
		//No matching results from guide
		
		Mojo.Log.error("No valid videos results %j",searchVideosJson);
	
	} else if(searchVideosJson.length == 1) {
		//We got back a single valid row
		
		for(var i = 0; i < searchVideosJson.length; i++) {
			
			this.resultList.push(searchVideosJson[i]);
		
		}
		
	} else {
		//No matching results from guide
	
		Mojo.Log.error("No response results %j",searchVideosJson);
	
	}
	
	
	this.sortChanged(WebMyth.prefsCookieObject.currentSearchPeopleSort);
	
}

SearchPeopleAssistant.prototype.sortChanged = function(newSort) {

	WebMyth.prefsCookieObject.currentSearchPeopleSort = newSort;
	
	//Mojo.Log.error("The current search sorting has changed to "+WebMyth.prefsCookieObject.currentSearchPeopleSort);
	
	if(this.currentMode == "program") {
		
		$('scene-title').innerHTML = this.personObject.name+" ("+this.resultList.length+" "+$L("items")+")";
		$('scene-title').innerHTML = $('scene-title').innerHTML.substring(0,40);
	
		if(this.resultList.length == 0) {
			this.resultList.push({ 'person': -1, 'name':'No programs found', 'title':'No programs found', 'subtitle':'No programs found','role':'','starttime':'1900-01-01 00:00:00', 'channum':'', 'channelName':'', 'type':'program' } );
		}

		//Sort list by selection
		switch(WebMyth.prefsCookieObject.currentSearchPeopleSort) {
			case 'category-asc':
				this.resultList.sort(double_sort_by('category', 'title', false));
			  break;
			case 'category-desc':
				this.resultList.sort(double_sort_by('category', 'title', true));
			  break;
			case 'channel-asc':
				this.resultList.sort(double_sort_by('channum', 'starttime', false));
			  break;
			case 'channel-desc':
				this.resultList.sort(double_sort_by('channum', 'starttime', true));
			  break;
			case 'date-asc':
				this.resultList.sort(double_sort_by('starttime', 'title', false));
			  break;
			case 'date-desc':
				this.resultList.sort(double_sort_by('starttime', 'title', true));
			  break;
			case 'title-asc':
				this.resultList.sort(double_sort_by('title', 'starttime', false));
			  break;
			case 'title-desc':
				this.resultList.sort(double_sort_by('title', 'starttime', true));
			  break;
			default :
				this.resultList.sort(double_sort_by('starttime', 'title', false));
			  break;
		}
		
	}
	
	this.controller.sceneScroller.mojo.revealTop();
	
	this.finishedSorting();
	
	this.updateCommandMenu();
   
};

SearchPeopleAssistant.prototype.finishedSorting = function() {

	//Show data
	this.controller.sceneScroller.mojo.revealTop();
	
	var listWidget = this.controller.get('searchPeopleList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();	
	
};

SearchPeopleAssistant.prototype.updateCommandMenu = function() {

	Mojo.Log.info("Updating command menu to "+this.currentMode);

	if(this.currentMode == "person") {
		
		this.cmdMenuModel.items.clear();
		this.cmdMenuModel.items.push( {} );
		this.cmdMenuModel.items.push( { label: $L('Search'), command: 'go-newSearch', width: 90 } );
		this.cmdMenuModel.items.push( {} );
				
		this.controller.modelChanged(this.cmdMenuModel, this);
	
	} else {
		
		this.cmdMenuModel.items.clear();
		this.cmdMenuModel.items.push( { label: $L('Sort'), submenu:'sort-menu', width: 90} );
		this.cmdMenuModel.items.push( { label: $L('Search'), command: 'go-newSearch', width: 90 } );
		this.cmdMenuModel.items.push( { label: $L('Web'), submenu:'web-menu', width: 90 } );
				
		this.controller.modelChanged(this.cmdMenuModel, this);
		
		this.updateSortMenu();
		//this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
		//this.controller.setupWidget('sort-menu', '', this.sortMenuModel);
		//this.controller.setupWidget('web-menu', '', this.webMenuModel);
	
	}

}

SearchPeopleAssistant.prototype.updateSortMenu = function() {
	
	//Reset default sorting
	this.sortMenuModel.items = [ 
			{"label": $L('Category-Asc'), "command": "go-sort-category-asc"},
			{"label": $L('Category-Desc'), "command": "go-sort-category-desc"},
			{"label": $L('Channel-Asc'), "command": "go-sort-channel-asc"},
			{"label": $L('Channel-Desc'), "command": "go-sort-channel-desc"},
			{"label": $L('Date-Asc'), "command": "go-sort-date-asc"},
			{"label": $L('Date-Desc'), "command": "go-sort-date-desc"},
			{"label": $L('Title-Asc'), "command": "go-sort-title-asc"},
			{"label": $L('Title-Desc'), "command": "go-sort-title-desc"}
	] ;
	
	switch(WebMyth.prefsCookieObject.currentSearchPeopleSort) {
		case 'category-asc':
			this.sortMenuModel.items[0].label = '- '+this.sortMenuModel.items[0].label+' -';
		  break;
		case 'category-desc':
			this.sortMenuModel.items[1].label = '- '+this.sortMenuModel.items[1].label+' -';
		  break;
		case 'channel-asc':
			this.sortMenuModel.items[2].label = '- '+this.sortMenuModel.items[2].label+' -';
		  break;
		case 'channel-desc':
			this.sortMenuModel.items[3].label = '- '+this.sortMenuModel.items[3].label+' -';
		  break;
		case 'date-asc':
			this.sortMenuModel.items[4].label = '- '+this.sortMenuModel.items[4].label+' -';
		  break;
		case 'date-desc':
			this.sortMenuModel.items[5].label = '- '+this.sortMenuModel.items[5].label+' -';
		  break;
		case 'title-asc':
			this.sortMenuModel.items[6].label = '- '+this.sortMenuModel.items[6].label+' -';
		  break;
		case 'title-desc':
			this.sortMenuModel.items[7].label = '- '+this.sortMenuModel.items[7].label+' -';
		  break;
		default :
			//this.sortMenuModel.items[0].label = 'Default';
		  break;
	}
	
	
	this.controller.modelChanged(this.sortMenuModel, this);
  
};

SearchPeopleAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
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
			
			if(this.currentMode == "person") {
				if (s.name.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
					someList.push(s);
				}
			} else if(s.type == "program"){
				if (s.title.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
					someList.push(s);
				}	
				else if (s.subtitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
					someList.push(s);
				}	
				else if (s.channelName.toUpperCase().indexOf(filterString.toUpperCase())>=0){
					someList.push(s);
				}	
				else if (s.category.toUpperCase().indexOf(filterString.toUpperCase())>=0){
					someList.push(s);
				}		
				else if (s.role.toUpperCase().indexOf(filterString.toUpperCase())>=0){
					someList.push(s);
				}
			} else if(s.type == "video"){
				if (s.title.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
					someList.push(s);
				}	
				else if (s.subtitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
					someList.push(s);
				}	
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

SearchPeopleAssistant.prototype.goSearchDetails = function(event) {

	Mojo.Log.error("Selected details %j",event.item);
	
	if(this.currentMode == "person") {
		
		this.personObject = event.item;
		
		if(this.personObject.name == "No people found") {
			//do nothing
		
		} else {
		
			this.getPrograms();
			
		}
		
	} else if(event.item.type == "program") {
	
		//Mojo.Controller.getAppController().showBanner("Selected: "+event.item.title+" - "+event.item.name, {source: 'notification'});
		
		var newItem = event.item;
		
		newItem.chanId = newItem.chanid;
		newItem.subTitle = newItem.subtitle;
		newItem.startTime = newItem.starttime;
		newItem.endTime = "";
		newItem.description = "";
		
		if(newItem.title == "No programs found"){
			//do nothing
			
		} else {
			Mojo.Controller.stageController.pushScene("guideDetails", newItem, true);
			
		}
		
	} else if(event.item.type == "video") {
		
		Mojo.Controller.stageController.pushScene("videosDetails", event.item);
		
	}
	
};

SearchPeopleAssistant.prototype.searchDividerFunction = function(itemModel) {
	 
	//Divider function for list
	var divider = "";
	
	if(this.currentMode == "person") {
	
		divider = itemModel.name.substring(0,1);
		
	} else if(itemModel.type == "program") {
	
		divider = itemModel.title;				//as default
		var date = new Date(isoSpaceToJS(itemModel.starttime));
		
		switch(WebMyth.prefsCookieObject.currentSearchPeopleSort) {
		  case 'date-asc':
			//divider = itemModel.starttime.substring(0,10);
			divider = date.toLocaleString().substring(0,15);
		   break;
		  case 'date-desc':
			//divider = itemModel.starttime.substring(0,10);
			divider = date.toLocaleString().substring(0,15);
		   break;
		  case 'title-asc':
			divider = itemModel.title;
		   break;
		  case 'title-desc':
			divider = itemModel.title;
		   break;
		  case 'category-asc':
			divider = itemModel.category;
		   break;
		  case 'category-desc':
			divider = itemModel.category;
		   break;
		  case 'channel-asc':
			divider = itemModel.channum+" - "+itemModel.channelName;
		   break;
		  case 'channel-desc':
			divider = itemModel.channum+" - "+itemModel.channelName;
		   break;
		}

	} else if(itemModel.type == "video") {
	
		divider = itemModel.title;				//as default
		
		switch(WebMyth.prefsCookieObject.currentSearchPeopleSort) {
		  case 'date-asc':
			divider = "MythVideo";
		   break;
		  case 'date-desc':
			divider = "MythVideo";
		   break;
		  case 'title-asc':
			divider = itemModel.title;
		   break;
		  case 'title-desc':
			divider = itemModel.title;
		   break;
		  case 'category-asc':
			divider = itemModel.category;
		   break;
		  case 'category-desc':
			divider = itemModel.category;
		   break;
		  case 'channel-asc':
			divider = "MythVideo";
		   break;
		  case 'channel-desc':
			divider = "MythVideo";
		   break;
		}

	}
	 
	return divider;
	
};

SearchPeopleAssistant.prototype.setMyData = function(propertyValue, model) {


	//Mojo.Log.info("setting my data");
	
	var searchDetailsText = '';
	
	if(this.currentMode == "person"){
	
		searchDetailsText += '<div id='+model.name+' class="palm-row-wrapper"><div class="title">'+model.name+'</div></div>';
		
	} else if(model.type == "program") {
		
		searchDetailsText += '<div id='+model.chanid+model.starttime+' class="palm-row multi-line searchPeople-list-item>';
		searchDetailsText += '<div class="palm-row-wrapper searchPeople-list-item multi-line"><div class="searchPeople-list-item">';
		
		searchDetailsText += '<div class="searchPeople-left-list-image">';
		
		if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
			searchDetailsText += '<img class="searchPeople-channelicon-small" src="';
			searchDetailsText += 'http://'+WebMyth.prefsCookieObject.masterBackendIp+':6544/Myth/GetChannelIcon?ChanId='+model.chanid+'" />';
			searchDetailsText += '<div class="title truncating-text channum">'+model.channum+'</div>';
			searchDetailsText += '</div>';
		} else {
			searchDetailsText += '<div class="title channum channum-no-icon">'+model.channum+'</div>';
			searchDetailsText += '</div>';
		}
		
		
		searchDetailsText += '<div class="searchPeople-right-list-text">';
		
		searchDetailsText += '<div class="title truncating-text left searchPeople-list-title">'+model.title+'</div>';
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subtitle+'&nbsp;</div>';
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.starttime+'</div>';
		//searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.category+'</div>';
		//searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.channum+" - "+model.channelName+'</div>';
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.channum+" - "+model.channelName+'</div>';
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.role+'</div>';
		searchDetailsText += '</div>';
		
		
		searchDetailsText += '</div></div></div>';
	
	} else if(model.type == "video") {
	
		searchDetailsText += '<div class="palm-row multi-line searchPeople-list-item>';
		searchDetailsText += '<div class="palm-row-wrapper searchPeople-list-item multi-line"><div class="searchPeople-list-item">';
		
		searchDetailsText += '<div class="title truncating-text left searchPeople-list-title">&nbsp;'+model.title+'</div>';
		
		searchDetailsText += '<div class="palm-row-wrapper">';
		
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subtitle+'&nbsp;</div>';
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.plot+'&nbsp;</div>';
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+$L('Episode')+': '+model.fullEpisode+'</div>';
		searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+$L('Released')+': '+model.releasedate+'</div>';
		
		
		searchDetailsText += '</div></div></div></div>';
	
	}
		
	model.myData = searchDetailsText;
	
	
};

SearchPeopleAssistant.prototype.openWeb = function(value) {

	var url = "";
	
	switch(value) {
		case 'wikipedia':
			url = "http://"+Mojo.Locale.getCurrentLocale().substring(0,2)+".m.wikipedia.org/wiki/Special:Search?search="+this.personObject.name;
		  break;
		case 'imdb':
			url = "http://m.imdb.com/find?realm=name&field=bio&q="+this.personObject.name;
		  break;
		case 'google':
			url = "http://www.google.com/m/search?client=ms-palm-webOS&channel=iss&q="+this.personObject.name;
		  break;
		case 'images':
			url = "http://www.google.com/m/search?client=ms-palm-webOS&site=images&channel=iss&q="+this.personObject.name;
		  break;
		  
	}
	
  
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters:  {
			id: 'com.palm.app.browser',
			params: {
				target: url
			}
		}
	});  

}





/*
	Small controller class used for the search.
*/

var SearchPeopleDialogAssistant = Class.create({
	
	initialize: function(sceneAssistant, callbackFunc) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
		
		this.callbackFunc = callbackFunc;
	},
	
	setup : function(widget) {
	
		this.widget = widget;
		

		this.searchTextModel = {
				 value: "",
				 disabled: false
		};
		this.controller.setupWidget("searchTextFieldId",
			{
				hintText: $L("Person's Name"),
				multiline: false,
				enterSubmits: true,
				focus: true,
				textCase: Mojo.Widget.steModeLowerCase
			 },
			 this.searchTextModel
		); 
		
		
		//Button
		Mojo.Event.listen(this.controller.get('goSearchButton'),Mojo.Event.tap,this.searchButton.bind(this));

		$('searchButtonWrapper').innerText = $L('Search');
		
	},
	
	searchButton: function() {
	
		this.callbackFunc(this.searchTextModel.value);

		this.widget.mojo.close();
	}
	
	
});


