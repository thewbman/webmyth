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
 
}

WebMyth = {};


WebMyth.usePlugin = true;
WebMyth.usePluginFrontend = true;
WebMyth.nextFrontendCommand = "";

WebMyth.useService = false;
WebMyth.frontendLocation = "";
WebMyth.frontendRetries = 0;

//had to replace my service calls with a palm service to avoid app rejection
 
/********************Globals**************************/
//Setup App Menu
WebMyth.appMenuAttr = {omitDefaultItems: true};
WebMyth.appMenuModel = {
	visible: true,
	items: [
		{label: $L("About"), command: 'do-aboutApp'},
		{label: $L("Preferences"), command: 'do-prefsApp'},
		{label: $L("Shortcuts"), items: [
			{label: $L("Remote"), command: 'do-shortcutRemote', iconPath: 'images/palm/flat-button-next.png'},
			{label: $L("Select Host"), command: 'do-shortcutHostselector', shortcut: 'H'},
			{label: $L("Recorded"), command: 'do-shortcutRecorded', shortcut: 'R'},
			{label: $L("Upcoming"), command: 'do-shortcutUpcoming', shortcut: 'U'},
			{label: $L("Guide"), command: 'do-shortcutGuide', shortcut: 'G'},
			{label: $L("Videos"), command: 'do-shortcutVideo', shortcut: 'V'},
			{label: $L("Music"), command: 'do-shortcutMusic', shortcut: 'M'},
			{label: $L("Status"), command: 'do-shortcutStatus', shortcut: 'S'},
			{label: $L("Log"), command: 'do-shortcutLog', shortcut: 'L'}
			]
		},
		{label: $L("Help"), items: [
			{label: $L("Instructions"), command: 'do-helpSetup'},
			{label: $L("Tips"), command: 'do-helpTips'},
			{label: $L("FAQs"), command: 'do-helpFAQs'},
			{label: $L("Changelog"), command: 'do-helpChangelog'},
			{label: $L("Bulletin"), command: 'do-helpBulletin'},
			{label: $L("Email Developer"), command: 'do-helpEmail'}
			]
		}
	]
};


//Create WebMyth.db for use or open existing
//WebMyth.db;


//Setup remote view menu
WebMyth.remoteViewMenuAttr = { spacerHeight: 0, menuClass: 'no-fade' };	
WebMyth.remoteViewMenuModel = {
	visible: true,
	items: [{
		items: [
			{ icon: 'back', command: 'go-remotePrevious'},
			{ label: $L("Remote"), command: 'do-remoteHeaderAction', width: 200 },
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
	
	
//Cookie for hosts (frontends)
WebMyth.hostsCookie = new Mojo.Model.Cookie('hosts');
WebMyth.hostsCookieObject = WebMyth.hostsCookie.get();
	
	
//Cookie for hosts (frontends)
WebMyth.backendsCookie = new Mojo.Model.Cookie('backends');
WebMyth.backendsCookieObject = WebMyth.backendsCookie.get();
	
	
//Cookie for remote
WebMyth.remoteCookie = new Mojo.Model.Cookie('remote');
WebMyth.remoteCookieObject = WebMyth.remoteCookie.get();
	
	
//Cookie for guide settings
WebMyth.guideCookie = new Mojo.Model.Cookie('guide3');
WebMyth.guideCookieObject = WebMyth.guideCookie.get();

	
//Cookie for guide channels
WebMyth.guideChannelsCookie = new Mojo.Model.Cookie('guideChannelsList6');
WebMyth.guideChannelsCookieObject = WebMyth.guideChannelsCookie.get();


//Current script verion
//2 = 0.1.8, 3 = 0.1.9, 4 = 0.2.0, 7 = 0.4.1 (recording rules, music, SQL), 8 = 0.4.3 generic protocol access
WebMyth.currentScriptVersion = 8;


//Current frontend location
WebMyth.currentLocation = "";

//Selected channel in guide
WebMyth.channelObject = {};

//Live settings object
WebMyth.settings = [];

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
WebMyth.helpEmailText += "The file needs to be accesible to this device either without any authentication or with only Basic http authentication (Digest security is not supported).<hr/>";
WebMyth.helpEmailText += "Please report any issues you find with the system on the 'issues' tab of the homepage.  ";
WebMyth.helpEmailText += "Or you can email the developer directly at <a href=mailto:webmyth.help@gmail.com>webmyth.help@gmail.com</a>.";


StageAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the stage is first created */
	
	//Instantiate Metrix Library
	WebMyth.Metrix = new Metrix(); 
	
	//Setup db
	//WebMyth.db = createHostnameDb();
	
	
	//Notice focus changes for doing dashbaord remote
	window.document.addEventListener(Mojo.Event.deactivate, this.onBlurHandler.bind(this));
	window.document.addEventListener(Mojo.Event.activate, this.onFocusHandler.bind(this));
	
	if(WebMyth.usePlugin) {
		try {
			$('webmyth_service_id').pluginStatus = this.pluginStatus.bind(this);
			$('webmyth_service_id').backgroundFrontendSocketResponse = this.backgroundFrontendSocketResponse.bind(this);
			$('webmyth_service_id').didReceiveData = this.didReceiveData.bind(this);
			$('webmyth_service_id').pluginErrorMessage = this.pluginErrorMessage.bind(this);
			$('webmyth_service_id').pluginLogMessage = this.pluginLogMessage.bind(this);
			$('webmyth_service_id').didQueryLocation = this.didQueryLocation.bind(this);
			$('webmyth_service_id').socketIsClosed = this.socketIsClosed.bind(this);	
		} catch(e) {
			Mojo.Log.error(e);
		}
	}
	
	//Mojo.Log.info("About to start first scene - welcome");
	
	//Start first scene
	this.controller.pushScene("welcome");
	this.controller.setWindowOrientation("up");
	
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
					{label: $L("OK"), value: false},
					{label: $L("Email Instructions"), value: true}
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
	  case 'do-shortcutHostselector':
			this.controller.pushScene("hostSelector");
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
	   
	  case 'do-shortcutVideo':
			this.controller.pushScene("videos");
       break;
	   
	  case 'do-shortcutMusic':
			this.controller.pushScene("musicList");
       break;
	   
	  case 'do-shortcutStatus':
			this.controller.pushScene("status");
       break;
	   
	  case 'do-shortcutLog':
			this.controller.pushScene("log");
       break;
	   
	   //Help
	  case 'do-helpSetup':
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
					} 
				},
				title: "WebMyth - v" + Mojo.Controller.appInfo.version,
				message:  WebMyth.helpMessage, 
				choices: [
                    {label: $L("OK"), value: "ok"},
					{label: $L("Email Instructions"), value: "instructions"}
					],
				allowHTMLMessage: true
			});	
			
       break;
	   
	  case 'do-helpTips':
			//Tips
			this.controller.pushScene("tips");
			
       break;
	   
	  case 'do-helpFAQs':
			//FAQs
			this.controller.pushScene("faqs");
			
       break;
	   
	  case 'do-helpUpdate':
	  
			//Check for updates
			currentScene.serviceRequest("palm://com.palm.applicationManager", {
				method: "open",
				parameters:  {
					id: 'com.palm.app.findapps',
					params: {
						scene: 'page',
						target: "http://developer.palm.com/appredirect/?packageid=com.thewbman.webmyth"
					}
				}
			});
			
       break;
	   
	  case 'do-helpChangelog':
			//Changelog
			this.controller.pushScene("changelog");
			
       break;
	   
	  case 'do-helpBulletin':
			//Metrix bulletin
			
			Mojo.Log.info("opening metrix bulletin");
			
			WebMyth.Metrix.checkBulletinBoard(currentScene, 10, true);
			
       break;
	   
	  case 'do-helpEmail':
			//Email
			
			currentScene.serviceRequest(
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

       break;
	   
	  case 'do-recorded':
			this.controller.pushScene("recorded");
       break;
	   
	  case 'go-navigation':
			if(currentScene == 'navigation'){
				Mojo.Log.info("Already on navigation");
			} else {
				Mojo.Controller.stageController.swapScene({name: "navigation", disableSceneScroller: true});
			}
	   break;
	   
	  case 'go-playback':
			if(currentScene == 'playback'){
				Mojo.Log.info("Already on playback");
			} else {
				Mojo.Controller.stageController.swapScene({name: "playback", disableSceneScroller: true});
			}
	   break;
	   
	  case 'go-music':
			if(currentScene == 'music'){
				Mojo.Log.info("Already on music");
			} else {
				Mojo.Controller.stageController.swapScene({name: "music", disableSceneScroller: true});
			}
	   break;
	   
	  case 'go-flick':
			if(currentScene == 'flick'){
				Mojo.Log.info("Already on flick");
			} else {
				Mojo.Controller.stageController.swapScene({name: "flick", disableSceneScroller: true});
			}
	   break;
	   
	  case 'go-remotePrevious2':
			var previousRemoteScene = getPreviousRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
			Mojo.Controller.stageController.swapScene({name: previousRemoteScene, disableSceneScroller: true});
	   break;
	   
	  case 'go-remoteNext2':
			var nextRemoteScene = getNextRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
			Mojo.Controller.stageController.swapScene({name: nextRemoteScene, disableSceneScroller: true});
	   break;
	   
	  case 'do-remoteHeaderAction2':
			switch(WebMyth.prefsCookieObject.remoteHeaderAction) {
				case 'Pause':
				
					if(WebMyth.useService) {
						WebMyth.sendServiceCmd(currentScene, "key p");
					} else {
						WebMyth.sendKey('p');
					}
					
				break;
				case 'Mute':
				
					if(WebMyth.useService) {
						WebMyth.sendServiceCmd(currentScene, "key f9");
					} else {
						WebMyth.sendKey('f9');
					}
					
				break;
			}
	   break;

    }
  }
};




StageAssistant.prototype.onBlurHandler = function() {
	
	//Add card is minimized
	//Mojo.Log.info("Card is minimized");
	
	this.startDashboard();
	
};

StageAssistant.prototype.onFocusHandler = function() {

	//App card is now active
	//Mojo.Log.info("Card is active");
	
	if(WebMyth.prefsCookieObject.dashboardRemote) {
	
		try {
			var dashboardStage = Mojo.Controller.getAppController().getStageController("dashboard");
			dashboardStage.delegateToSceneAssistant("closeDashboard", {});
		} catch(e) {
			Mojo.Log.error(e);
		}
	}
	
};

StageAssistant.prototype.startDashboard = function() {

	dashboardStage = Mojo.Controller.getAppController().getStageController("dashboard");
	
	if(WebMyth.prefsCookieObject.dashboardRemote) {
	
		if (dashboardStage) {
			// Dashboard stage is already open
			Mojo.Log.info("DELEGATING TO SCENE ASST");
			//dashboardStage.delegateToSceneAssistant("updateDashboard", launchParams.dashInfo);
		} else {
			//Mojo.Log.info("No dashboard Stage found.");
			pushDashboard = function (stageController) {
				stageController.pushScene('dashboard');
			};
			Mojo.Controller.getAppController().createStageWithCallback({name: "dashboard", lightweight: true, clickableWhenLocked: true },
				pushDashboard, 'dashboard');
		}	
	
	}
	
};



WebMyth.newPluginSocket = function(retryCommand) {

	try {
	
		if(retryCommand) {
			Mojo.Log.error("Had to restart socket and sending last command");
			WebMyth.nextFrontendCommand = retryCommand;
		}
		
		var response1 = $('webmyth_service_id').closeSocket();
		var response2 = $('webmyth_service_id').openBackgroundFrontendSocket(WebMyth.prefsCookieObject.currentFrontendAddress, WebMyth.prefsCookieObject.currentFrontendPort);
		Mojo.Log.info("Opening new plugin frontend socket: "+response1+response2);
		
	} catch(e) {
	
		Mojo.Log.error("ERROR telnet socket: %s",e);
		Mojo.Controller.getAppController().showBanner("Error connecting to frontend - check IP", {source: 'notification'});	
		
	}
};

WebMyth.startTelnetPlugin = function() {

	try {
	
		var response = $('webmyth_service_id').openFrontendSocket(WebMyth.prefsCookieObject.currentFrontendAddress, WebMyth.prefsCookieObject.currentFrontendPort);
		Mojo.Log.info("Opening telnet socket: "+response);
		
	} catch(e) {
	
		Mojo.Log.error("ERROR telnet socket: %s",e);
		Mojo.Controller.getAppController().showBanner("Error connecting to frontend", {source: 'notification'});	
		
	}
};

WebMyth.playPluginChannel = function(value){

	Mojo.Log.info("Sending plugin play channel "+value);
	
	try {
		var response1 = $('webmyth_service_id').sendData("query location");
	
		Mojo.Log.info("Plugin location response of '%s'", response1);
				
			if(response1.search("LiveTV") == -1){
				//Not on liveTV
				Mojo.Log.info("Not on livetv, jumping now ");
			
				var response2 = $('webmyth_service_id').sendData("jump livetv");
				
				//App will pause JS until we get plugin response
				var response3 = $('webmyth_service_id').sendData("play chanid "+value);
				
			} else {
				//On livetv
				Mojo.Log.info("On livetv, changing channel");
					
				var response3 = $('webmyth_service_id').sendData("play chanid "+value);
					
					
			}

	} catch(e) {
		Mojo.Log.error("Error sending playPluginChannel: %s",e);
	}
	
};



StageAssistant.prototype.startTelnetPlugin = function() {

	try {
	
		var response = $('webmyth_service_id').openFrontendSocket(WebMyth.prefsCookieObject.currentFrontendAddress, WebMyth.prefsCookieObject.currentFrontendPort);
		Mojo.Log.info("Opening telnet socket: "+response);
		
	} catch(e) {
	
		Mojo.Log.error("ERROR telnet socket: %s",e);
		Mojo.Controller.getAppController().showBanner("Error connecting to frontend", {source: 'notification'});	
		
	}
};

StageAssistant.prototype.pluginStatus = function(a) {

	Mojo.Log.info("Plugin status of '%s'", a);
	
	if(a == "Initialized") {
		WebMyth.pluginInitialized = true;
	}
	

};

StageAssistant.prototype.backgroundFrontendSocketResponse = function(success, message) {

	Mojo.Log.info("backgroundFrontendSocketResponse of '%s', '%s'", success, message);
	
	if(success == 0){
        Mojo.Controller.getAppController().showBanner("Error conecting to frontend", {source: 'notification'});
	} else if (WebMyth.nextFrontendCommand == ""){
		
		//do nothing
		
	} else {
		
		setTimeout(function() {
			WebMyth.sendCommand(WebMyth.nextFrontendCommand);
			
			WebMyth.nextFrontendCommand = "";
		}, 100);
		
	}

};

StageAssistant.prototype.didReceiveData = function(a) {

	Mojo.Log.info("Plugin response of '%s'", a);
	Mojo.Controller.getAppController().showBanner(a, {source: 'notification'});

};

StageAssistant.prototype.pluginErrorMessage = function(a) {

	Mojo.Log.error("Plugin ERROR of '%s'", a);
	Mojo.Controller.errorDialog(a);

};

StageAssistant.prototype.pluginLogMessage = function(a) {

	Mojo.Log.info("Plugin log message of: "+a);

};

StageAssistant.prototype.didQueryLocation = function(a) {

        //Mojo.Log.error("query location plugin response of %s", a);
        WebMyth.currentLocation = a;

};

StageAssistant.prototype.socketIsClosed = function(a) {

	Mojo.Log.error("Socket is closed %s", a);
	Mojo.Controller.getAppController().showBanner("Socket is closed", {source: 'notification'});

};






WebMyth.sendCommand = function(fullCmd){
			
	var response = "";
	
	if(WebMyth.usePluginFrontend){
	
		try{
			response = $('webmyth_service_id').sendData(fullCmd);
			
			Mojo.Log.info("Plugin command response of '%s'", response);
			
			if((response == "sendto() failed")||(response == "recvMsgSize == 0")){
				Mojo.Controller.getAppController().showBanner("Failed to send to frontend", {source: 'notification'});
			}
			
		} catch(e) {
			Mojo.Log.error("WebMyth.sendCommand error: %s",e);
		}
        
	} else {
	
		//
		
	}
	
};

WebMyth.sendKey = function(value){
		
	Mojo.Log.info("Sending key ",value);
		
	var fullCmd = "key "+value;
	var response = "";
	
	if(WebMyth.usePluginFrontend){
		response = $('webmyth_service_id').sendData(fullCmd);
		
        Mojo.Log.info("Plugin key response of '%s'", response);
        //Mojo.Controller.getAppController().showBanner(response, {source: 'notification'});

		if((response == "sendto() failed")||(response == "recvMsgSize == 0")){
			//Send failed - restart socket and try again
			WebMyth.newPluginSocket(fullCmd);
		}
		
	} else {
	
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
		
	}
	
};

WebMyth.sendJump = function(value) {

	var fullCmd = "jump "+value;
	var response = "";
	
	if(WebMyth.usePluginFrontend){
	
		response = $('webmyth_service_id').sendData("jump "+value);
		
        Mojo.Log.info("Plugin 'jump' response of '%s'", response);
        //Mojo.Controller.getAppController().showBanner(response, {source: 'notification'});

		if((response == "sendto() failed")||(response == "recvMsgSize == 0")){
			//Send failed - restart socket and try again
			WebMyth.newPluginSocket(fullCmd);
		}
		
	} else {
	
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
		
	}	
	
};

WebMyth.sendPlay = function(value) {
	
	var fullCmd = "play "+value;
	var response = "";
	
	if(WebMyth.usePluginFrontend){
	
		response = $('webmyth_service_id').sendData("play "+value);
		
        Mojo.Log.info("Plugin 'play' response of '%s'", response);
        //Mojo.Controller.getAppController().showBanner(response, {source: 'notification'});

		if((response == "sendto() failed")||(response == "recvMsgSize == 0")){
			//Send failed - restart socket and try again
			WebMyth.newPluginSocket(fullCmd);
		}
		
	} else {
	
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
	
	}
	
};

WebMyth.sendQuery = function(value) {
	
	var response = $('webmyth_service_id').sendDataWithResponse("query "+value);
	
	Mojo.Log.info("Inside query response of "+response);
	
	return response;
	
};

WebMyth.downloadToPhone = function(input_parameters) {

	Mojo.Log.info("about to start downloading %j",input_parameters);

		var request = new Mojo.Service.Request('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: input_parameters,
			onSuccess: function(response) {
				if(response.completed) {
					Mojo.Controller.getAppController().showBanner("Finished: "+myFilename, "");
					
					this.controller.serviceRequest('palm://com.palm.applicationManager', {
						method:'launch',							
						parameters: {
							id:"com.palm.app.videoplayer",
							params:{
								target: "file: ///media/internal/video/"+input_parameters.myFilename,
								videoTitle: input_parameters.myFilename
							}
						}
					});	
					
				} else {
					if(response.amountReceived && response.amountTotal) {
						var percent = (response.amountReceived / response.amountTotal)*100;
						percent = Math.round(percent);
						if(percent!=NaN) {
							if(this.currProgress != percent) {
								this.currProgress = percent;
								Mojo.Controller.getAppController().showBanner("Downloading: " + percent + "%", "");
							}
						}
					}
					
				}
			}.bind(this)
		});	
	
};



//adsf - Add back service commands here

//adsf - JS commands


//asdf