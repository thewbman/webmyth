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
 
 function WelcomeAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

WelcomeAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Remote button
	this.controller.setupWidget("goRemoteButtonId",
         {},
         {
             label : "Remote",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goRemoteButtonId"),Mojo.Event.tap, this.goRemote.bind(this));
	
	//View recorded button
	this.controller.setupWidget("goRecordedButtonId",
         {},
         {
             label : "Recorded Shows",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goRecordedButtonId"),Mojo.Event.tap, this.goRecorded.bind(this));
	
	
	
	//Do Metrx submission if allowed
	if (WebMyth.prefsCookieObject.allowMetrix == true) {
		Mojo.Log.info("Submitting data to Metrix");
		//Metrix command
		WebMyth.Metrix.postDeviceData();
	}
};

WelcomeAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

WelcomeAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

WelcomeAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

WelcomeAssistant.prototype.goRemote = function(event) {
	//Start remote scene 
	
	Mojo.Controller.stageController.pushScene("hostSelector");
};

WelcomeAssistant.prototype.goRecorded = function(event) {
	//Start recorded scene
	
	//Mojo.Controller.stageController.pushScene("recorded");
	
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
