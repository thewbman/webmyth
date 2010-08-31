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

 
 function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

WebMyth = {};

 
/********************Globals**************************/
//Setup App Menu
WebMyth.appMenuAttr = {omitDefaultItems: true};
WebMyth.appMenuModel = {
	visible: true,
	items: [
		{label: "About...", command: 'do-aboutApp'},
		{label: "Preferences", command: 'do-prefsApp'}
	]
};
//Create WebMyth.db for use or open existing
WebMyth.db;
	
	
//Setup remote commandmenu
WebMyth.remoteCommandMenuModel = {
	visible: true,
	items: [{},{
		items: [
			{label: "Nav", command: 'go-navigation', width: 90},
			{label: "Play", command: 'go-playback', width: 70},
			{label: "Music", command: 'go-music', width: 90}
		]
		},
	{}
	]
};
	
//Setup header menu button
WebMyth.headerMenuButtonModel = {
	 label: "...",
	 buttonClass:'small-button',
     disabled: false, 
	 command: 'go-headerMenu'
};
	
//Current frontend host
WebMyth.activeHost = 'Undefined';
WebMyth.activePort = '6546';
	
//Cookie for preferences
WebMyth.prefsCookie = new Mojo.Model.Cookie('prefs');
WebMyth.prefsCookieObject = WebMyth.prefsCookie.get();
//WebMyth.prefsCookieObject = checkCookieDefaults(WebMyth.prefsCookie.get());
//WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);




StageAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the stage is first created */
	
	//Instantiate Metrix Library
	WebMyth.Metrix = new Metrix(); 
	
	//Setup db
	WebMyth.db = createHostnameDb();
	
	//Handle message command from plug-in
	//$('telnetPlug').pluginMessageFunc = this.pluginMessageFunc.bind(this); 
	
	
	//Start first scene
	this.controller.pushScene("welcome");
	
};

StageAssistant.prototype.handleCommand = function(event) {
  var currentScene = this.controller.activeScene();
  if(event.type == Mojo.Event.command) {
    switch(event.command) {
      case 'do-aboutApp':
        
			aboutinfo = "<a href='http://code.google.com/p/WebMyth/'>WebMyth Homepage</a><hr/>";
			
			aboutinfo += "An open source webOS app for controlling a MythTV frontend.<br>";  
			aboutinfo += "Please see the homepage for system requirements.<hr/>"
			
			aboutinfo += "Licensed under <a href='http://www.gnu.org/licenses/gpl-2.0.html'>GPLv2</a>."

            currentScene.showAlertDialog({
                onChoose: function(value) {},
                title: "WebMyth - v" + Mojo.Controller.appInfo.version,
                message: "Copyright 2010, Wes Brown <br>" + aboutinfo,
                choices: [{
                    label: "OK",
                    value: ""
                }],
                allowHTMLMessage: true
            });

       break;
	   
	  case 'do-prefsApp':
			this.controller.pushScene("preferences");
       break;
	   
	  case 'do-recorded':
			this.controller.pushScene("recorded");
       break;
	   
	  case 'go-navigation':
			if(currentScene == 'navigation'){
				Mojo.Log.info("Already on navigation");
			} else {
				Mojo.Controller.stageController.swapScene("navigation");
			}
	   break;
	   
	  case 'go-playback':
			if(currentScene == 'playback'){
				Mojo.Log.info("Already on playback");
			} else {
				Mojo.Controller.stageController.swapScene("playback");
			}
	   break;
	   
	  case 'go-music':
			if(currentScene == 'music'){
				Mojo.Log.info("Already on music");
			} else {
				Mojo.Controller.stageController.swapScene("music");
			}
	   break;
    }
  }
};

pluginMessageFunc = function(a)       
{       
      //Send up an alert dialog with message from plug-in
	  currentScene.showAlertDialog({
                onChoose: function(value) {},
                title: "Message from plug-in:",
                message: String(a),
                choices: [{
                    label: "OK",
                    value: ""
                }],
                allowHTMLMessage: true
            });   
}; 
