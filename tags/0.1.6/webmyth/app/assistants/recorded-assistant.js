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
 
 
 function RecordedAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	  this.nullHandleCount = 0;
	 
	  this.fullResultList = [];		//Full raw data 
	  this.resultList = [];			//Filtered down based on 'recgroup'
	  
}

RecordedAssistant.prototype.setup = function() {
	
	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// 'recorded' widget filter list
	this.recordedListAttribs = {
		itemTemplate: "recorded/recordedListItem",
		listTemplate: "recorded/recordedListTemplate",
		dividerTemplate: "recorded/recordedDivider",
		swipeToDelete: false,
		filterFunction: this.filterListFunction.bind(this),
		dividerFunction: this.recorderDividerFunction.bind(this)
	};
    this.recordedListModel = {            
        //items: this.resultList,
		disabled: false
    };
	this.controller.setupWidget( "recordedList" , this.recordedListAttribs, this.recordedListModel);
	
	
	//Recgroup filter widget
	this.selectorsModel = {currentRecgroup: WebMyth.prefsCookieObject.currentRecgroup};
	this.groups = [
		{label:$L('All'), value:"AllRecgroupsOn"},
		{label:$L('Default'), value:"Default"},
		{label:$L('Deleted'), value:"Deleted"} ];
	this.recgroupFilterAttr = {label: $L(''),
                             choices: [
								{label:$L('All'), value:"AllRecgroupsOn"},
								{label:$L('Default'), value:"Default"},
								{label:$L('Deleted'), value:"Deleted"} 
							],
                             modelProperty:'currentRecgroup'};
	this.controller.setupWidget('recorded-header-menu-button', this.recgroupFilterAttr, this.selectorsModel);


	//Event listeners
	
	this.controller.listen('recorded-header-menu-button', Mojo.Event.propertyChange, this.recgroupChanged.bindAsEventListener(this));
	this.controller.listen(this.controller.get( "recordedList" ), Mojo.Event.listTap, this.goRecordedDetails.bind(this));
	//this.controller.listen(this.controller.get( "recordedList" ), Mojo.Event.filter, this.searchFilter.bind(this));
		
	
	
	//Update list from mysql script
	Mojo.Log.info('Starting remote data gathering');
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webMysqlFile;
 
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'post',
            parameters: {'op': 'getAllRecords', 'table': 'recorded', 'sort': 'starttime'},
            evalJSON: 'true',
            onSuccess: this.readRemoteDbTableSuccess.bind(this),
            onFailure: this.useLocalDataTable.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	   
	
};

RecordedAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
	   
};

RecordedAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	   
};

RecordedAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   
};

RecordedAssistant.prototype.recgroupChanged = function(propertyChangeEvent) {
	Mojo.Log.info("The current recgroup has changed to "+this.selectorsModel.currentRecgroup);
	
	//Update results list from filter
	this.resultList.clear();
	Object.extend(this.resultList, trimByRecgroup(this.fullResultList, this.selectorsModel.currentRecgroup));
	
	var listWidget = this.controller.get('recordedList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	
	//Save selection back to cookie
	WebMyth.prefsCookieObject.currentRecgroup = this.selectorsModel.currentRecgroup;
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);

	
	/*
	this.controller.showAlertDialog({
        onChoose: function(value) {},
        title: "WebMyth - v" + Mojo.Controller.appInfo.version,
        message: "Filtering of list not yet implimented<br>",
        choices: [{
            label: "OK",
			value: ""
		}],
		allowHTMLMessage: true
    });
	*/
	   
};

RecordedAssistant.prototype.useLocalDataTable = function(event) {
	//Fall back to local data if cannot connect to remote server
	Mojo.Controller.getAppController().showBanner("Failed to get new data, using saved", {source: 'notification'});
	Mojo.Log.error('Failed to get Ajax response - using previoius saved data');
	
	// Query recorded table
	var mytext = 'SELECT * FROM recorded ORDER BY starttime;'
	WebMyth.db.transaction( 
		(function (transaction) { 
			transaction.executeSql(mytext, [], 
				this.queryDataHandler.bind(this), 
				this.queryErrorHandler.bind(this)
			); 
		} 
		).bind(this)
	);
							
};


RecordedAssistant.prototype.queryDataHandler = function(transaction, results) { 
    // Handle the results 
    var string = ""; 
	
	//Mojo.Log.error("Inside queryData with '%s' rows", results.rows.length);
    
	try {
		var list = [];
		for (var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
						
			string = {
				chanid: row.chanid, starttime: row.starttime, endtime: row.endtime, title: row.title, subtitle: row.subtitle, 
				description: row.description, category: row.category, hostname: row.hostname, bookmark: row.bookmark, editing: row.editing, 
				cutlist: row.cutlist, autoexpire: row.autoexpire, commflagged: row.commflagged, recgroup: row.recgroup, recordid: row.recordid, 
				seriesid: row.seriesid, programid: row.programid, lastmodified: row.lastmodified, filesize: row.filesize, stars: row.stars, 
				previouslyshown: row.previouslyshown, originalairdate: row.originalairdate, preserve: row.preserve, findid: row.findid,	deletepending: row.deletepending, 
				transcoder: row.transcoder, timestretch: row.timestretch, recpriority: row.recpriority, basename: row.basename,	progstart: row.progstart, 
				progend: row.progend, playgroup: row.playgroup, profile: row.profile, duplicate: row.duplicate, transcoded: row.transcoded, 
				watched: row.watched, storagegroup: row.storagegroup, bookmarkupdate: row.bookmarkupdate
			 };
			 
			list.push( string );
			//this.hostListModel.items.push( string );
			//Mojo.Log.error("Just added '%j' to list", string);
		}
		
		//Update the list widget
		this.fullResultList.clear();
		Object.extend(this.fullResultList,list);
		this.fullResultList.sort(double_sort_by('title', 'starttime', false));
		
		this.resultList.clear();
		Object.extend(this.resultList, trimByRecgroup(this.fullResultList, this.selectorsModel.currentRecgroup));
		
		
		//Initial display
		var listWidget = this.controller.get('recordedList');
		this.filterListFunction('', listWidget, 0, this.resultList.length);
		
		//Update the recgroup filter
		var recgroupSql = "SELECT * FROM recgroup ORDER BY groupname;";
		var string = "";
		WebMyth.db.transaction( 
			(function (transaction) {
				transaction.executeSql( recgroupSql,  [], 
					this.updateRecgroupList.bind(this),
					function(transaction, error) {      // error handler
						Mojo.Log.error("Could not get list of recgroup: " + error.message + " ... ");
					}
				);
			}
			).bind(this)
		);
		
		
		Mojo.Log.info("Done with data query");
		
		//Stop spinner and hide
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').hide()
	}
	catch (err)
	{
		Mojo.Log.error("Data query failed with " + err.message);	
	} 

	//Mojo.Log.info("Done with data query function");

};


RecordedAssistant.prototype.queryErrorHandler = function(transaction, errors) { 
    Mojo.Log.error('Error was '+error.message+' (Code '+error.code+')'); 
};


RecordedAssistant.prototype.readRemoteDbTableSuccess = function(response) {
	//return true;  //can escape this function for testing purposes
    
	//Mojo.Log.error('Got Ajax response: ' + response.responseText);
	
		
	//Update the list widget
	this.fullResultList.clear();
	Object.extend(this.fullResultList,response.responseJSON);
	this.fullResultList.sort(double_sort_by('title', 'starttime', false));
	
	this.resultList.clear();
	Object.extend(this.resultList, trimByRecgroup(this.fullResultList, this.selectorsModel.currentRecgroup));

	//Initial display
	var listWidget = this.controller.get('recordedList');
	this.filterListFunction('', listWidget, 0, this.resultList.length);
	//Mojo.Controller.getAppController().showBanner("Updated with latest data", {source: 'notification'});
	
	//Update the recgroup filter
	var recgroupSql = "SELECT * FROM recgroup ORDER BY groupname;";
	var string = "";
    WebMyth.db.transaction( 
		(function (transaction) {
			transaction.executeSql( recgroupSql,  [], 
				this.updateRecgroupList.bind(this),
				function(transaction, error) {      // error handler
					Mojo.Log.error("Could not get list of recgroup: " + error.message + " ... ");
				}
			);
		}
		).bind(this)
	);
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()
		
	//Save new values back to DB
    var json = response.responseJSON;
	var title;
	var subtitle;
 
 
	//Replace out old data
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql("DELETE FROM 'recorded'; ",  [], 
			function(transaction, results) {    // success handler
				Mojo.Log.info("Successfully truncated recorded");
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not truncate recorded because " + error.message);
			}
		);
	});
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql("DELETE FROM 'recgroup'; ",  [], 
			function(transaction, results) {    // success handler
				Mojo.Log.info("Successfully truncated recgroup");
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not truncate recgroup because " + error.message);
			}
		);
	});
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql("INSERT INTO 'recgroup' (groupname, displayname) VALUES ('AllRecgroupsOn', 'All');",  [], 
				function(transaction, results) {    // success handler
					Mojo.Log.info("Successfully inserted AllRecgroupsOn");
					
					//Nest parsing actions here		
					for(var i = 0; i < json.length; i++){
						title = json[i].title;
						subtitle = json[i].subtitle;
						insertRecordedRow(json[i]);
						//Mojo.Log.error('Row: ' + i + ' Title: ' + title + ' Subtitle: ' + subtitle);	
					}
					
				},
				function(transaction, error) {      // error handler
					Mojo.Log.error("Could not insert AllRecgroupsOn because " + error.message);
				}
		);
	});
};

function insertRecordedRow(newline){

	var recorded_sql = "INSERT INTO 'recorded' (chanid, starttime, endtime, title, subtitle, description, category, hostname, bookmark, editing, cutlist, autoexpire, commflagged, recgroup, recordid, seriesid, programid, lastmodified, filesize, stars, previouslyshown, originalairdate, preserve, findid, deletepending, transcoder, timestretch, recpriority, basename, progstart, progend, playgroup, profile, duplicate, transcoded, watched, storagegroup, bookmarkupdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
	var recgroup_sql = "REPLACE INTO 'recgroup' (groupname, displayname) VALUES (?, ?);";
	
	var linerecgroup = newline.recgroup;
	
	//Insert into WebMyth.db
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql(recorded_sql,  [newline.chanid, newline.starttime, newline.endtime, newline.title, newline.subtitle, newline.description, newline.category, newline.hostname, newline.bookmark, newline.editing,
									newline.cutlist, newline.autoexpire, newline.commflagged, newline.recgroup, newline.recordid, newline.seriesid, newline.programid, newline.lastmodified, newline.filesize, newline.stars, 
									newline.previouslyshown, newline.originalairdate, newline.preserve, newline.findid, newline.deletepending, newline.transcoder, newline.timestretch, newline.recpriority, newline.basename, newline.progstart, 
									newline.progend, newline.playgroup, newline.profile, newline.duplicate, newline.transcoded, newline.watched, newline.storagegroup, newline.bookmarkupdate], 
			function(transaction, results) {    // success handler
				//Mojo.Log.info('Entered Row - Title: ' + newline.title + ' Subtitle: ' + newline.subtitle);
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not insert in recorded: " + error.message);
			}
		);	
	});
	
	//Update recgroups table
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql(recgroup_sql,  [newline.recgroup, linerecgroup], 
			function(transaction, results) {    // success handler
				//Mojo.Log.info('Entered new recgroup: ' + newline.recgroup);
			},
			function(transaction, error) {      // error handler
				Mojo.Log.error("Could not insert in recgroup: " + error.message + " ... ");
			}
		);
	});
	
};


RecordedAssistant.prototype.goRecordedDetails = function(event) {
	var recorded_chanid = event.item.chanid;
	var recorded_starttime = event.item.starttime;
	
	Mojo.Log.info("Selected individual recording: '%s' + '%s'", recorded_chanid, recorded_starttime);
	
	/*
	this.controller.showAlertDialog({
        onChoose: function(value) {},
        title: "WebMyth - v" + Mojo.Controller.appInfo.version,
        message: "Details screen comming soon ... <br>",
        choices: [{
            label: "OK",
			value: ""
		}],
		allowHTMLMessage: true
    });
	*/

	
	//Open recordedDetails communication scene
	Mojo.Controller.stageController.pushScene("recordedDetails", recorded_chanid, recorded_starttime);
	

};

RecordedAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
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
			else if (s.subtitle.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subtitle", i);
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
	listWidget.mojo.noticeUpdatedItems(offset, subset);
	listWidget.mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
};	


RecordedAssistant.prototype.recorderDividerFunction = function(itemModel) {
	 
	//Divider function for list
    //return itemModel.title.toString()[0];	
	return itemModel.title;
};

RecordedAssistant.prototype.searchFilter = function(event)    { 
	//Shows or hides default list
    if (event.filterString !== "")    { 
		//Showing filtered list is handled elsewhere
    }    else    { 
		//Shows default list with no searching
		var listWidget = this.controller.get('recordedList');
		this.filterListFunction('', listWidget, 0, this.resultList.length);
    } 
};

RecordedAssistant.prototype.updateRecgroupList = function(transaction, results)  { 
	Mojo.Log.info('inside updateRecgroupList');
	
	var updatedList = [];
	var string = "";
	
	for (var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		string = { label:row.displayname, value:row.groupname };
		updatedList.push( string );
		//Mojo.Log.error("Just added '%j' to list", string);
	};
						
	//Mojo.Log.info("New recgroup list is '%j' with length %s", updatedList, updatedList.length);
	
	if (updatedList.length == 0) {
		updatedList = [ {'label':'Default', 'value':'Default' } ];
		Mojo.Log.info("Updated initial recgroup list is '%j' ", updatedList);
		this.selectorsModel.currentRecgroup = 'Default';
	} else {
		//Mojo.Log.info("New recgroup list is still '%j' ", updatedList);
	}
				
				
	this.recgroupFilterAttr.choices.clear();
	Object.extend(this.recgroupFilterAttr.choices, updatedList);
	this.controller.modelChanged(this.recgroupFilterAttr);
	this.controller.modelChanged(this.selectorsModel);

	
};