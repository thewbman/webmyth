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


function RecordedDetailsAssistant(recorded_chanid, recorded_starttime) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.recorded_chanid = recorded_chanid;
	   this.recorded_starttime = recorded_starttime;
	   this.recordedObject = {};
	   
}

RecordedDetailsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	Mojo.Log.info("Starting scene with "+this.recorded_chanid+" and "+this.recorded_starttime);
	
	//Play button
	this.controller.setupWidget("goPlayButtonId", {}, { label : "Play", disabled: false } );
	Mojo.Event.listen(this.controller.get("goPlayButtonId"),Mojo.Event.tap, this.goPlay.bind(this));
	
	//Frontend text
	this.frontendTextModel = {
             value: WebMyth.prefsCookieObject.currentFrontend,
             disabled: false
    };
	this.controller.setupWidget("frontend-title-textfield",
        {
            hintText: $L(""),
            multiline: false,
            enterSubmits: false,
            focus: false
         },
         this.frontendTextModel
    ); 
	
	
	try {
	//Get data from table
	var recordedDetailsSql = "SELECT * FROM recorded WHERE ((chanid = ?) AND (starttime = ?))";
    WebMyth.db.transaction( 
		(function (transaction) {
			transaction.executeSql( recordedDetailsSql,  [this.recorded_chanid, this.recorded_starttime], 
				this.handleSuccessQuery.bind(this),
				this.handleErrorQuery.bind(this)
			);
		}
		).bind(this)
	);
	}
    catch(e) {
        Mojo.Log.error(e);
    }
	
	/* add event handlers to listen to events from widgets */
};

RecordedDetailsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

RecordedDetailsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

RecordedDetailsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

RecordedDetailsAssistant.prototype.handleSuccessQuery = function(transaction, results) {
	var string = "";
	
	
	if(results.rows.length == 0) {
	
	this.controller.showAlertDialog({
        onChoose: function(value) {},
        title: "WebMyth - v" + Mojo.Controller.appInfo.version,
        message: "Error trying to get details for chanid:"+this.recorded_chanid+" with starttime: "+this.recorded_starttime+"<br>",
        choices: [{
            label: "OK",
			value: ""
		}],
		allowHTMLMessage: true
    });
	
	Mojo.Log.error("results array is empty");
	
	}
	else {
	var row = results.rows.item(0);
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
		this.recordedObject = string;
	
	
						
	//Mojo.Log.info("New list is '%j' with length %s", this.recordedObject, this.recordedObject.length);
	}
	
	
	$('scene-title').innerText = this.recordedObject.title;
	$('subtitle-title').innerText = this.recordedObject.subtitle;
	$('description-title').innerText = this.recordedObject.description;
	
	
};

RecordedDetailsAssistant.prototype.handleErrorQuery = function(transaction, errors) {
	Mojo.Log.error("Error is %j%", errors);
};

RecordedDetailsAssistant.prototype.goPlay = function(event) {
	//Attempting to play
	Mojo.Log.error("Attempting to play");
	
	var clean_starttime = this.recordedObject.starttime.replace(' ','T');
	
	var cmdvalue = "play program "+this.recordedObject.chanid+" "+clean_starttime+" resume";
	
	Mojo.Log.info("Command to send is " + cmd);
/*	
};

RecordedDetailsAssistant.prototype.sendTelnet = function(cmdvalue){
*/

	var reply;
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		//Using cgi-bin on server
		var cmd = encodeURIComponent(cmdvalue);
		var requestURL="http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webserverRemoteFile+"?host="+this.frontendTextModel.value+"&cmd="+cmd;
	
		var request = new Ajax.Request(requestURL, {
			method: 'get',
			onSuccess: function(transport){
				reply = transport.responseText;
				Mojo.Log.info("Success AJAX: '%s'", reply);
			},
			onFailure: function() {
				Mojo.Log.info("Failed AJAX: '%s'", requestURL);
			}
		});
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
};