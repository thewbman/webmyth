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
		{label: "About", command: 'do-aboutApp'},
		{label: "Preferences", command: 'do-prefsApp'},
		{label: "Shortcuts", items: [
			{label: "Remote", command: 'do-shortcutRemote', iconPath: 'images/palm/flat-button-next.png'},
			{label: "Recorded", command: 'do-shortcutRecorded', shortcut: 'R'},
			{label: "Upcoming", command: 'do-shortcutUpcoming', shortcut: 'U'},
			{label: "Guide", command: 'do-shortcutGuide', shortcut: 'G'},
			{label: "Status", command: 'do-shortcutStatus', shortcut: 'S'}
			]
		},
		{label: "Help", command: 'do-helpApp'}
	]
};
//Create WebMyth.db for use or open existing
WebMyth.db;
	

/*
//Setup remote commandmenu
WebMyth.remoteCommandMenuAttr = { menuClass: 'no-fade' };	
WebMyth.remoteCommandMenuModel = {
	visible: true,
	items: [{},{
		items: [
			{label: "Nav", command: 'go-navigation', width: 80},
			{label: "Play", command: 'go-playback', width: 80},
			{label: "Music", command: 'go-music', width: 80},
			{label: "Flick", command: 'go-flick', width: 80}
		]
		},
	{}
	]
};
*/


//Setup remote view menu
WebMyth.remoteViewMenuAttr = { spacerHeight: 0, menuClass: 'no-fade' };	
WebMyth.remoteViewMenuModel = {
	visible: true,
	items: [{
		items: [
			{ icon: 'back', command: 'go-remotePrevious'},
			{ label: "Remote", command: 'do-remoteHeaderAction', width: 200 },
			{ icon: 'forward', command: 'go-remoteNext'}
		]
	}]
};


	
//Setup header menu button
WebMyth.headerMenuButtonModel = {
	 label: "...",
	 buttonClass3:'small-button',
     disabled: false, 
	 command: 'go-headerMenu'
};
	
	
//Cookie for preferences
WebMyth.prefsCookie = new Mojo.Model.Cookie('prefs');
WebMyth.prefsCookieObject = WebMyth.prefsCookie.get();
	
	
//Cookie for hosts
WebMyth.hostsCookie = new Mojo.Model.Cookie('hosts');
WebMyth.hostsCookieObject = WebMyth.hostsCookie.get();
	
	
//Cookie for remote
WebMyth.remoteCookie = new Mojo.Model.Cookie('remote');
WebMyth.remoteCookieObject = WebMyth.remoteCookie.get();
	
	
//Cookie for guide settings
WebMyth.guideCookie = new Mojo.Model.Cookie('quide');
WebMyth.guideCookieObject = WebMyth.guideCookie.get();


//Current script verion
//2 = 0.1.8, 3 = 0.1.9, 4 = 0.2.0
WebMyth.currentScriptVersion = 4;


//Help and first-run message
WebMyth.helpMessage = "This app requires the installation of 1 script on a local webserver on your network.  ";
WebMyth.helpMessage += "You can get the file <a href='http://code.google.com/p/webmyth/downloads/list'>here</a><hr/>";
WebMyth.helpMessage += "If you have installed previous verions of the script files please upgrade them to the latest versions.";
//WebMyth.helpMessage += "The remote script (<a href='http://code.google.com/p/webmyth/source/browse/trunk/remote.py'>remote.py</a>) ";
//WebMyth.helpMessage += "needs to be in executable as cgi-bin while the mysql script (<a href='http://code.google.com/p/webmyth/source/browse/trunk/webmyth-mysql.php'>webmyth-mysql.php</a>) can be in any standard directory.  ";
//WebMyth.helpMessage += "Both files needs to be accesible to this device without any authentication.<hr/>";


WebMyth.helpEmailText = "This app requires the installation of 1 script on a local webserver on your network.  ";
WebMyth.helpEmailText += "You can get the file <a href='http://code.google.com/p/webmyth/downloads/list'>here</a><hr/>";
WebMyth.helpEmailText += "The script (<a href='http://code.google.com/p/webmyth/source/browse/trunk/webmyth.py'>webmyth.py</a>) ";
WebMyth.helpEmailText += "needs to be in executable as cgi-bin on your local webserver.  ";
WebMyth.helpEmailText += "The script has some database settings that you need to manually set.  You can find the correct values for your system by looking at /etc/mythtv/mysql.txt on your frontend or backend machine.<hr/>";
WebMyth.helpEmailText += "The file needs to be accesible to this device without any authentication.<hr/>";
WebMyth.helpEmailText += "Please report any issues you find with the system on the 'issues' tab of the homepage.  ";
WebMyth.helpEmailText += "Or you can email the developer directly at <a href=mailto:webmyth.help@gmail.com>webmyth.help@gmail.com</a>.";


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
        
			aboutinfo = "<a href='http://code.google.com/p/webmyth/'>WebMyth Homepage</a><hr/>";
			
			aboutinfo += "An open source webOS app for controlling a MythTV frontend.<br>";  
			aboutinfo += "Please see the homepage for system requirements and setup instructions.<hr/>"
			
			aboutinfo += "Licensed under <a href='http://www.gnu.org/licenses/gpl-2.0.html'>GPLv2</a>."

            currentScene.showAlertDialog({
                onChoose: function(value) {if (value==true) {
					Mojo.Log.error("appPath:" + Mojo.appPath);
					this.controller.serviceRequest(
						"palm://com.palm.applicationManager", {
							method: 'open',
							parameters: {
								id: "com.palm.app.email",
								params: {
									summary: "WebMyth setup instructions",
									text: WebMyth.helpEmailText
								}
							}
						}
					);
					}
				},
				title: "WebMyth - v" + Mojo.Controller.appInfo.version,
                message: "Copyright 2010, Wes Brown <br>" + aboutinfo,
                choices: [
					{label: "OK", value: false},
					{label: "Email Instructions", value: true}
					],
                allowHTMLMessage: true
            });

       break;
	   
	  case 'do-prefsApp':
			this.controller.pushScene("preferences");
       break;
	   
	   //Shortcuts
	  case 'do-shortcutRemote':
			this.controller.pushScene(WebMyth.prefsCookieObject.currentRemoteScene);
       break;
	   
	  case 'do-shortcutRecorded':
			this.controller.pushScene("recorded");
       break;
	   
	  case 'do-shortcutUpcoming':
			this.controller.pushScene("upcoming");
       break;
	   
	  case 'do-shortcutGuide':
			this.controller.pushScene("guide");
       break;
	   
	  case 'do-shortcutStatus':
			this.controller.pushScene("status");
       break;
	   
	   //Help
	  case 'do-helpApp':
			//helpAlert();
	
			currentScene.showAlertDialog({
				onChoose: function(value) {if (value=="instructions") {
					//Mojo.Log.error("appPath:" + Mojo.appPath);
					this.controller.serviceRequest(
						"palm://com.palm.applicationManager", {
							method: 'open',
							parameters: {
								id: "com.palm.app.email",
								params: {
									summary: "WebMyth setup instructions",
									text: WebMyth.helpEmailText
								}
							}
						}
					);
					} else if (value=="developer") {
					this.controller.serviceRequest(
						"palm://com.palm.applicationManager", {
							method: 'open',
							parameters: {
								id: "com.palm.app.email",
								params: {
									summary: "Help with WebMyth v"+ Mojo.Controller.appInfo.version,
									recipients: [{
										type:"email",
										value:"webmyth.help@gmail.com",
										contactDisplay:"WebMyth Developer"
									}]
								}
							}
						}
					);
					}
				},
				title: "WebMyth - v" + Mojo.Controller.appInfo.version,
				message:  WebMyth.helpMessage, 
				choices: [
                    {label: "OK", value: "ok"},
					{label: "Email Instructions", value: "instructions"},
					{label: "Contact Developer", value: "developer"}
					],
				allowHTMLMessage: true
			});	
			
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
	   
	  case 'go-flick':
			if(currentScene == 'flick'){
				Mojo.Log.info("Already on flick");
			} else {
				Mojo.Controller.stageController.swapScene("flick");
			}
	   break;
	   
	  case 'go-remotePrevious':
			var previousRemoteScene = getPreviousRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
			Mojo.Controller.stageController.swapScene(previousRemoteScene);
	   break;
	   
	  case 'go-remoteNext':
			//Mojo.Log.error("current scene is " + WebMyth.prefsCookieObject.currentRemoteScene);
			var nextRemoteScene = getNextRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
			//Mojo.Log.error("next scene is " + nextRemoteScene);
			Mojo.Controller.stageController.swapScene(nextRemoteScene);
	   break;
	   
	  case 'do-remoteHeaderAction':
			switch(WebMyth.prefsCookieObject.remoteHeaderAction) {
				case 'Pause':
					currentScene.assistant.sendTelnetKey('p');
				break;
				case 'Mute':
					currentScene.assistant.sendTelnetKey('f9');
				break;
			}
	   break;

    }
  }
};




WebMyth.sendKey = function(value){
		
		Mojo.Log.info("Sending key ",value);
		
		var cmdvalue = encodeURIComponent(value);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=key";
		requestUrl += "&host="+WebMyth.prefsCookieObject.currentFrontend;
		requestUrl += "&cmd="+cmdvalue;
		
		var request = new Ajax.Request(requestUrl, {
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
};


WebMyth.sendJump = function(value) {

		var cmdvalue = encodeURIComponent(value);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=jump";
		requestUrl += "&host="+WebMyth.prefsCookieObject.currentFrontend;
		requestUrl += "&cmd="+cmdvalue;
		
		var request = new Ajax.Request(requestUrl, {
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
	
};


WebMyth.sendPlay = function(value) {

		var cmdvalue = encodeURIComponent(value);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=play";
		requestUrl += "&host="+WebMyth.prefsCookieObject.currentFrontend;
		requestUrl += "&cmd="+cmdvalue;
		
		var request = new Ajax.Request(requestUrl, {
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
	
};
