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


function RecordedDetailsAssistant(detailsObject) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.recordedObject = detailsObject;
	   
}

RecordedDetailsAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Starting recorded details scene");
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
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
	

	
	//Fill in data values
	$('scene-title').innerText = this.recordedObject.title;
	$('subtitle-title').innerText = this.recordedObject.subtitle;
	$('description-title').innerText = this.recordedObject.description;
	
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


RecordedDetailsAssistant.prototype.goPlay = function(event) {
	//Attempting to play
	Mojo.Log.error("Attempting to play");
	
	var clean_starttime = this.recordedObject.starttime.replace(' ','T');
	
	var cmd = "play program "+this.recordedObject.chanid+" "+clean_starttime+" resume";
	
	Mojo.Log.info("Command to send is " + cmd);
/*	
};

RecordedDetailsAssistant.prototype.sendTelnet = function(cmd){
*/

	var reply;
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		//Using cgi-bin on server
		//var cmd = encodeURIComponent(cmd);
		var requestURL="http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webserverRemoteFile+"?host="+this.frontendTextModel.value+"&cmd="+cmd;
	
		var request = new Ajax.Request(requestURL, {
			method: 'get',
			onSuccess: function(transport){
				reply = transport.responseText;
				if (reply.substring(0,5) == "ERROR") {
					Mojo.Log.error("ERROR in response: '%s'", reply.substring(6));
					Mojo.Controller.getAppController().showBanner(reply, {source: 'notification'});
				} else {
					Mojo.Log.info("Success AJAX: '%s'", reply);
				}
			},
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		});
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
};