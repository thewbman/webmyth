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
	 
	  this.resultList = [];
	  //this.resultList = [ { title: 'FAKE', subtitle: 'sub' } ];
}

RecordedAssistant.prototype.setup = function() {
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	// filter field
	this.controller.setupWidget( 'recordedFilterFieldId' ,
        this.attributes = {
            delay: 350,
            //filterFieldHeight: 100
        }, 
        this.model = {
            disabled: false
        }
    );
	
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


	//Tap a host from list
	this.controller.listen(this.controller.get( "recordedList" ), Mojo.Event.listTap, this.goRecordedDetails.bind(this));
	this.controller.listen(this.controller.get( "recordedList" ), Mojo.Event.filter, this.searchFilter.bind(this));
		
		
	//Populate recorded table from mysql script
	//this.populateRecorded();
	//Get remote data
	Mojo.Log.info('Starting mysql readout');
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webMysqlFile;
 
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'post',
            parameters: {'op': 'getAllRecords', 'table': 'recorded'},
            evalJSON: 'true',
            onSuccess: this.readRemoteDbTableSuccess.bind(this),
            onFailure: function(){
                //Stuff to do if the request fails, ie. display error
                Mojo.Log.error('Failed to get Ajax response');
            }
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
	/*
	//Display local data
	   var mytext = 'select * from recorded;'
			WebMyth.db.transaction( 
				(function (transaction) { 
					transaction.executeSql(mytext, [], this.queryDataHandler.bind(this), this.errorHandler.bind(this)); 
				}).bind(this) 
			);
	   */
	   
	
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


RecordedAssistant.prototype.readRemoteDbTableSuccess = function(response) {
 
    Mojo.Log.error('Got Ajax response: ' + response.responseText);
		//update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,response.responseJSON);
		this.resultList.sort(sort_by('starttime', false));		//sort by date first
		this.resultList.sort(sort_by('title', false));			//then by show title 
		
		var listWidget = this.controller.get('recordedList');
		this.filterListFunction('', listWidget, 0, this.resultList.length);
		
    var json = response.responseJSON;
	var title;
	var subtitle;
 
 
	//Clear out old data
	WebMyth.db.transaction( function (transaction) {
		transaction.executeSql("DELETE FROM recorded",  [], 
				function(transaction, results) {    // success handler
					Mojo.Log.error("Successfully truncated");
					
		//Nest parsing actions here	to be sure we truncated		
		for(var i = 0; i < json.length; i++){
			title = json[i].title;
			subtitle = json[i].subtitle
			
			insertRecordedRow(json[i]);

            //Mojo.Log.error('Row: ' + i + ' Title: ' + title + ' Subtitle: ' + subtitle);			
        }
		//end nesting
		
		
					
				},
				function(transaction, error) {      // error handler
					Mojo.Log.error("Could not truncate because" + error.message);
				}
		);
	});
};

function insertRecordedRow(newRow){
			
	var sql = "INSERT INTO 'recorded' (title, subtitle) VALUES (?, ?);";
			
			//Insert into WebMyth.db
			WebMyth.db.transaction( function (transaction) {
				transaction.executeSql(sql,  [newRow.title, newRow.subtitle], 
					function(transaction, results) {    // success handler
						//Mojo.Log.error('Entered Row - Title: ' + newRow.title + ' Subtitle: ' + newRow.subtitle);
					},
					function(transaction, error) {      // error handler
						Mojo.Log.error("Could not insert record: " + error.message);
					}
				);
	});
};


RecordedAssistant.prototype.showRecordedList = function() {

	Mojo.Log.error('Now populating display');
			// Query recorded table
			var mytext = 'select * from recorded;'
			WebMyth.db.transaction( 
				(function (transaction) { 
					transaction.executeSql(mytext, [], this.queryDataHandler, this.errorHandler); 
				}) 
			);
};

RecordedAssistant.prototype.queryDataHandler = function(transaction, results) { 
    // Handle the results 
    var string = ""; 
	
	//Mojo.Log.error("inside queryData with '%s' rows", results.rows.length);
    
	try {
		var list = [];
		for (var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
						
			string = { id: row.id, title: row.title, subtitle: row.subtitle };

			list.push( string );
			//this.hostListModel.items.push( string );
			//Mojo.Log.error("Just added '%s' to list", string);
		}
		//update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,list);
		this.controller.modelChanged(this.recordedListModel);
		
		Mojo.Log.error("Done with data query");
	}
	catch (err)
	{
		Mojo.Log.error("Data query failed with " + err.message);	
	} 

	//Mojo.Log.info("Done with data query function");

};


RecordedAssistant.prototype.errorHandler = function(transaction, error) { 
    Mojo.Log.error('Error was '+error.message+' (Code '+error.code+')'); 
    return true;
};

RecordedAssistant.prototype.goRecordedDetails = function(event) {
	 
	this.controller.showAlertDialog({
        onChoose: function(value) {},
        title: "WebMyth - v" + Mojo.Controller.appInfo.version,
        message: "More features comming soon ... <br>",
        choices: [{
            label: "OK",
			value: ""
		}],
		allowHTMLMessage: true
    });
	
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
        //$("defaultList").hide(); 
    }    else    { 
	
		var listWidget = this.controller.get('recordedList');
		this.filterListFunction('', listWidget, 0, this.resultList.length);
    } 
};