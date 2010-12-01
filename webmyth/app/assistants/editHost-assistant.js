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


function EditHostAssistant() {

}

EditHostAssistant.prototype.setup = function() {

	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Widgets
	this.hostTextModel = {
             value: WebMyth.prefsCookieObject.currentFrontend,
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
             value: WebMyth.prefsCookieObject.currentFrontendAddress,
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
             value: WebMyth.prefsCookieObject.currentFrontendPort,
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
	
	
	this.controller.setupWidget("saveHostButtonId",
         {},
         {
             label : "SAVE",
             disabled: false
         }
     );
	
	Mojo.Event.listen(this.controller.get("saveHostButtonId"),Mojo.Event.tap, this.saveHost.bind(this));
	
};

EditHostAssistant.prototype.activate = function(event) {

	if(WebMyth.prefsCookieObject.currentFrontendAddress == "") {
		//empty frontend address, see if a backend
		Mojo.Log.info("empty address, trying to get backend IP address");
		
		this.addressTextModel.value = getBackendIP(WebMyth.backendsCookieObject,WebMyth.prefsCookieObject.currentFrontend,WebMyth.prefsCookieObject.masterBackendIp);
		this.controller.modelChanged(this.addressTextModel, this);
	}

};

EditHostAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

EditHostAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};




EditHostAssistant.prototype.saveHost = function(event) {

	var newHost = {
		'hostname': this.hostTextModel.value,
		'address': this.addressTextModel.value,
		'port': this.portTextModel.value
	};
	
	Mojo.Log.info("Updated hostname is %j", newHost);
	
	
	//Delete old host
	Mojo.Log.info("Deleting host: %s",newHost.hostname);
	var newList = cutoutHostname(WebMyth.hostsCookieObject, newHost.hostname);
	WebMyth.hostsCookieObject.clear();
	Object.extend(WebMyth.hostsCookieObject,newList);
	
	//Add in updated version
	WebMyth.hostsCookieObject.push(newHost);
	WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	 
	//Update prefs cookie
	WebMyth.prefsCookieObject.currentFrontend = newHost.hostname;
	WebMyth.prefsCookieObject.currentFrontendAddress = newHost.address;
	WebMyth.prefsCookieObject.currentFrontendPort = newHost.port;
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
	
	
	Mojo.Controller.stageController.popScene();

};