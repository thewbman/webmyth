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
 
 function PreferencesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, appMenuAttr, appMenuModel);	
		
	//Widgets
	this.webserverTextModel = {
             value: "",
             disabled: false
    };
	this.controller.setupWidget("webserverTextFieldId",
        {
            hintText: $L(""),
            multiline: false,
            enterSubmits: false,
            focus: false
         },
         this.webserverTextModel
    ); 
	
	this.metrixToggleModel = {
             value: true
    };
	this.controller.setupWidget("metrixToggleId",
        {
            modelProperty: "value"
         },
         this.metrixToggleModel
    ); 
	
	this.controller.setupWidget("saveWebserverButtonId",
         {},
         {
             label : "SAVE",
             disabled: false
         }
     );
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("saveWebserverButtonId"),Mojo.Event.tap, this.saveWebserver.bind(this));
	
	/* add event handlers to listen to events from widgets */
};

PreferencesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
		if (prefsCookieObject) {	
			Mojo.Log.info("Existing webserverName is %s", prefsCookieObject.webserverName);
			
			//Update webserver from cookie
			this.webserverTextModel.value = prefsCookieObject.webserverName;
			this.controller.modelChanged(this.webserverTextModel);
			
			//Update metrix toggle from cookie
			this.metrixToggleModel.value = prefsCookieObject.allowMetrix;
			this.controller.modelChanged(this.metrixToggleModel);
			
		} 
};

PreferencesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

PreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

PreferencesAssistant.prototype.saveWebserver = function(event) {
	
	Mojo.Log.info("New webserverName is %s", this.webserverTextModel.value);
	Mojo.Log.info("Metrix value is %s", this.metrixToggleModel.value);

	if (prefsCookieObject) {
		//Nothing
	} else {
		//Create default cookie if doesnt exist
		var newPrefsCookieObject = defaultCookie();
		prefsCookieObject = newPrefsCookieObject;
	}
	
	prefsCookieObject.webserverName = this.webserverTextModel.value;
	prefsCookieObject.allowMetrix = this.metrixToggleModel.value;
	prefsCookie.put(prefsCookieObject);
	
	Mojo.Controller.stageController.popScene();
};
