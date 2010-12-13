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


function AddHostAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
}

AddHostAssistant.prototype.setup = function() {

		
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Widgets
	this.hostTextModel = {
             value: "",
             disabled: false
    };
	this.controller.setupWidget("hostTextFieldId",
        {
            hintText: $L(""),
            multiline: false,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.hostTextModel
    ); 
	
	
	this.addressTextModel = {
             value: "",
             disabled: false
    };
	this.controller.setupWidget("addressTextFieldId",
        {
            hintText: $L(""),
            multiline: false,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.addressTextModel
    ); 
	
	
	this.portTextModel = {
             value: "6546",
             disabled: false
    };
	this.controller.setupWidget("portTextFieldId",
         {
            hintText: $L("default 6546"),
            multiline: false,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.portTextModel
    );
	
	
	this.controller.setupWidget("submitHostButtonId",
         {},
         {
             label : $L("Submit"),
             disabled: false
         }
     );
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("submitHostButtonId"),Mojo.Event.tap, this.submitNewHost.bind(this));
	
};

AddHostAssistant.prototype.activate = function(event) {

	$('scene-title').innerText = $L("Add new host");
	$('frontendGroupLabel').innerText = $L('Frontend');
	$('hostLabel').innerText = $L('Host');
	$('addressLabel').innerText = $L('Address');
	$('portLabel').innerText = $L('Port');

};

AddHostAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AddHostAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

AddHostAssistant.prototype.submitNewHost = function(event) {
	//Returns data to host selector scene
	var newHost = {
		'hostname': this.hostTextModel.value,
		'address': this.addressTextModel.value,
		'port': this.portTextModel.value
	};
	
	
	Mojo.Log.info("New hostname is %s", newHost.hostname);
	
	WebMyth.hostsCookieObject.push(newHost);
	WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	 

	
	
	//Return to host selector
	Mojo.Controller.stageController.popScene();

};
