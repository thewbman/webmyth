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
 
function SearchAssistant(title_in) {

	//this.fullResultList = [];		//Full raw data 
	this.resultList = [];			//Filtered down list

	if(title_in) {
		this.searchString = title_in;
	} else {
		this.searchString = "";
	}

}

SearchAssistant.prototype.setup = function() {

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
									 { },
									 { label: $L('Search'), command: 'go-newSearch', width: 90 }
								]};
								
	this.sortMenuModel = { label: $L('Sort'), items: [
			{"label": $L('Category-Asc'), "command": "go-sort-category-asc"},
			{"label": $L('Category-Desc'), "command": "go-sort-category-desc"},
			{"label": $L('Date-Asc'), "command": "go-sort-date-asc"},
			{"label": $L('Date-Desc'), "command": "go-sort-date-desc"},
			{"label": $L('Title-Asc'), "command": "go-sort-title-asc"},
			{"label": $L('Title-Desc'), "command": "go-sort-title-desc"}
			]};
			
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('sort-menu', '', this.sortMenuModel);

	
	
	// Music filter list
	this.searchListAttribs = {
		itemTemplate: "search/searchListItem",
		dividerTemplate: "search/searchDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.searchDividerFunction.bind(this),
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.searchListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "searchList" , this.searchListAttribs, this.searchListModel);
	
	
	//Event listeners
	Mojo.Event.listen(this.controller.get( "searchList" ), Mojo.Event.listTap, this.goSearchDetails.bind(this));
	Mojo.Event.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	if(this.searchString == "") {
		this.newSearch();
	} else {
		this.newSearchCallback(this.searchString);
	}
	
};

SearchAssistant.prototype.activate = function(event) {

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

SearchAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

SearchAssistant.prototype.cleanup = function(event) {

};

SearchAssistant.prototype.handleCommand = function(event) {

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
		}
	}
  
};

SearchAssistant.prototype.handleKey = function(event) {

	Mojo.Log.info("handleKey %o, %o", event.originalEvent.metaKey, event.originalEvent.keyCode);
	
	if(event.originalEvent.metaKey) {
		switch(event.originalEvent.keyCode) {
			case 71:
				Mojo.Log.info("g - shortcut key to guide");
				Mojo.Controller.stageController.pushScene("guide");	
				break;
			case 82:
				Mojo.Log.info("r - shortcut key to recorded");
				Mojo.Controller.stageController.pushScene("recorded");
				break;
			case 83:
				Mojo.Log.info("s - shortcut key to status");
				Mojo.Controller.stageController.pushScene("status");
				break;
			case 85:
				Mojo.Log.info("u - shortcut key to upcoming");
				Mojo.Controller.stageController.pushScene("upcoming");
				break;
			default:
				Mojo.Log.info("No shortcut key");
				break;
		}
	}
	
	Event.stop(event); 
	
};






SearchAssistant.prototype.newSearch = function() {

	Mojo.Log.error("starting new search");

	//Use dialog for getting search query
	
	this.controller.showDialog({
		template: 'dialogs/searchDialog',
		assistant: new SearchDialogAssistant(this, this.newSearchCallback.bind(this))
	});
	

};

SearchAssistant.prototype.newSearchCallback = function(value) {

	this.searchString = value;
	Mojo.Log.error("Got new search query: "+this.searchString);
	
	if(this.searchString == "") {
		this.searchString = "You must enter something";
	}

	
	
	$('scene-title').innerHTML = $L("Search")+": '"+this.searchString+"'";


	//Restart spinner and show
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('spinner-text').innerHTML = $L("Loading")+"...";
	$('myScrim').show();


	
	var query = "SELECT `program`.title, `program`.subtitle AS subTitle, `program`.description, `program`.chanid AS chanId";
	query += ", `program`.starttime AS startTime, `program`.starttime AS startTimeSpace, `program`.endtime AS endTimeSpace";
	query += ", `program`.endtime AS endTime, `program`.category, `program`.programid AS programId, `program`.originalairdate AS airdate";
	query += ", `channel`.chanNum, `channel`.callsign, `channel`.name AS channelName";
	query += " FROM `program` "
	query += " LEFT OUTER JOIN `channel` ON `program`.chanid = `channel`.chanid ";
	query += ' WHERE `title` LIKE "%'+this.searchString+'%" ';
	query += " ORDER BY startTime, chanNum ";
	query += " LIMIT 1000 ";
	
	
	//Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQLwithResponse";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	

	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.readSearchSuccess.bind(this),
            onFailure: this.readSearchFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

SearchAssistant.prototype.readSearchFail = function(event) {

	Mojo.Log.error('Failed to get search response');
	
	
	$('scene-title').innerHTML = $L("Error in searching")+"!!!";
	
	
	this.resultList.clear();
	this.resultList.push({ 'title':'Accesing remote table has failed.', 'subTitle':'Please check your server script.', 'startTime':'1900-01-01 00:00:00', 'channelName':'', 'category':'', 'chanNum':''});
	
	
	
	this.controller.sceneScroller.mojo.revealTop();
	
	//Initial display
	var listWidget = this.controller.get('searchList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();	
	
};

SearchAssistant.prototype.readSearchSuccess = function(response) {
    
	//Mojo.Log.error('Got Ajax response: %j',response.responseJSON);
	
	if(response.responseJSON) {
		//We got back some rows
		
		var nowDate = new Date();
		var nowDateISO = dateJSToISO(nowDate).replace("T"," ");
		
		//Update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,cleanSearchResults(response.responseJSON, nowDateISO));
		
		
		//Mojo.Log.error('Cleaned search results: %j',this.resultList);
		
		
		$('scene-title').innerHTML += " ("+this.resultList.length+" "+$L("items")+")";
		$('scene-title').innerHTML = $('scene-title').innerHTML.substring(0,40);
		
	} else {
		//No matching results from guide
	
		this.resultList.clear();
		this.resultList.push({ 'title':$L('No matches'), 'subTitle':$L('Sorry')+' :(', 'startTime':'1900-01-01 00:00:00', 'channelName':'', 'category':'', 'chanNum':''});
	
		Mojo.Log.error("no response results %j",this.resultList);
	
	}
	
	this.sortChanged(WebMyth.prefsCookieObject.currentSearchSort);

	
};

SearchAssistant.prototype.sortChanged = function(newSort) {
	//Save selection back to cookie
	WebMyth.prefsCookieObject.currentSearchSort = newSort;
	
	Mojo.Log.error("The current search sorting has changed to "+WebMyth.prefsCookieObject.currentSearchSort);
	
	
	//Sort list by selection
	switch(WebMyth.prefsCookieObject.currentSearchSort) {
		case 'category-asc':
			this.resultList.sort(double_sort_by('category', 'title', false));
		  break;
		case 'category-desc':
			this.resultList.sort(double_sort_by('category', 'title', true));
		  break;
		case 'channel-asc':
			this.resultList.sort(double_sort_by('chanNum', 'startTime', false));
		  break;
		case 'channel-desc':
			this.resultList.sort(double_sort_by('chanNum', 'startTime', true));
		  break;
		case 'date-asc':
			this.resultList.sort(double_sort_by('startTime', 'title', false));
		  break;
		case 'date-desc':
			this.resultList.sort(double_sort_by('startTime', 'title', true));
		  break;
		case 'title-asc':
			this.resultList.sort(double_sort_by('title', 'startTime', false));
		  break;
		case 'title-desc':
			this.resultList.sort(double_sort_by('title', 'startTime', true));
		  break;
		default :
			this.resultList.sort(double_sort_by('startTime', 'title', false));
		  break;
	}

	
	this.finishedSorting();
	
	this.updateSortMenu();
   
};

SearchAssistant.prototype.finishedSorting = function() {

	//Show data
	this.controller.sceneScroller.mojo.revealTop();
	
	var listWidget = this.controller.get('searchList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	listWidget.mojo.close();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();	
	
};

SearchAssistant.prototype.updateSortMenu = function() {
	
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
	
	switch(WebMyth.prefsCookieObject.currentSearchSort) {
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
	
	
	this.controller.modelChanged(this.sortMenuModel);
  
};

SearchAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
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
				someList.push(s);
			}	
			else if (s.subTitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				someList.push(s);
			}	
			else if (s.channelName.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				someList.push(s);
			}	
			else if (s.category.toUpperCase().indexOf(filterString.toUpperCase())>=0){
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

SearchAssistant.prototype.goSearchDetails = function(event) {

	Mojo.Log.error("Selected details %j",event.item);
	
	Mojo.Controller.stageController.pushScene("guideDetails", event.item, true);

};

SearchAssistant.prototype.searchDividerFunction = function(itemModel) {
	 
	//Divider function for list
	var divider = itemModel.title;				//as default
	var date = new Date(isoSpaceToJS(itemModel.startTime));
	
	switch(WebMyth.prefsCookieObject.currentSearchSort) {
      case 'date-asc':
		//divider = itemModel.startTime.substring(0,10);
		divider = date.toLocaleString().substring(0,15);
       break;
	  case 'date-desc':
		//divider = itemModel.startTime.substring(0,10);
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
		divider = itemModel.chanNum+" - "+itemModel.channelName;
       break;
	  case 'channel-desc':
		divider = itemModel.chanNum+" - "+itemModel.channelName;
       break;
	}

	 
	return divider;
	
};

SearchAssistant.prototype.setMyData = function(propertyValue, model) {


	//Mojo.Log.info("setting my data");
	
	var searchDetailsText = '';
	
	
	searchDetailsText += '<div id='+model.chanId+model.startTime+' class="palm-row multi-line search-list-item>';
	searchDetailsText += '<div class="palm-row-wrapper search-list-item multi-line"><div class="search-list-item">';
	 
	
	searchDetailsText += '<div class="search-left-list-image">';
	
	if(WebMyth.prefsCookieObject.showUpcomingChannelIcons) {
		searchDetailsText += '<img class="search-channelicon-small" src="';
		searchDetailsText += 'http://'+WebMyth.prefsCookieObject.masterBackendIp+':6544/Myth/GetChannelIcon?ChanId='+model.chanId+'" />';
		searchDetailsText += '<div class="title truncating-text chanNum">'+model.chanNum+'</div>';
		searchDetailsText += '</div>';
	} else {
		searchDetailsText += '<div class="title chanNum chanNum-no-icon">'+model.chanNum+'</div>';
		searchDetailsText += '</div>';
	}
	
	
	searchDetailsText += '<div class="search-right-list-text">';
	
	searchDetailsText += '<div class="title truncating-text left search-list-title">'+model.title+'</div>';
	searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;'+model.subTitle+'&nbsp;</div>';
	searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;'+model.startTime+'</div>';
	searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;'+model.category+'</div>';
	searchDetailsText += '<div class="palm-info-text truncating-text left">&nbsp;&nbsp;&nbsp;&nbsp;'+model.channelName+'</div>';
	searchDetailsText += '</div>';
	
	
	searchDetailsText += '</div></div></div>';
	
		
	model.myData = searchDetailsText;
	
	
};







/*
	Small controller class used for the search.
*/

var SearchDialogAssistant = Class.create({
	
	
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
				hintText: $L("Title"),
				multiline: false,
				enterSubmits: true,
				focus: true,
				textCase: Mojo.Widget.steModeLowerCase
			 },
			 this.searchTextModel
		); 
		
		
		//Button
		Mojo.Event.listen(this.controller.get('goSearchButton'),Mojo.Event.tap,this.searchButton.bind(this));

		$('searchButtonWrapper').innerText = $L('Title Search');
		
	},
	
	searchButton: function() {
	
		this.callbackFunc(this.searchTextModel.value);

		this.widget.mojo.close();
	}
	
	
});

