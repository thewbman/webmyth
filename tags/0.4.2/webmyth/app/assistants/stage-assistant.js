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
		{label: "Help", items: [
			{label: "Instructions", command: 'do-helpSetup'},
			{label: "Tips", command: 'do-helpTips'},
			{label: "FAQs", command: 'do-helpFAQs'},
			{label: "Changelog", command: 'do-helpChangelog'},
			{label: "Email Developer", command: 'do-helpEmail'}
			]
		}
	]
};
//Create WebMyth.db for use or open existing
WebMyth.db;


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
//2 = 0.1.8, 3 = 0.1.9, 4 = 0.2.0, 7 = 0.4.1 (recording rules, music)
WebMyth.currentScriptVersion = 7;


//Current frontend location
WebMyth.currentLocation = "";
WebMyth.usePlugin = false;


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
	WebMyth.db = createHostnameDb();
	
	
	//Notice focus changes for doign dashbaord remote
	window.document.addEventListener (Mojo.Event.deactivate, this.onBlurHandler.bind(this));
	window.document.addEventListener (Mojo.Event.activate, this.onFocusHandler.bind(this));
	
	
	//Setup plugin connection
	//this.handleConnect();
	
	//$('telnet_plugin_id').didReceiveData = this.didReceiveData.bind(this);
	//$('telnet_plugin_id').didQueryLocation = this.didQueryLocation.bind(this);
	//$('telnet_plugin_id').socketIsClosed = this.socketIsClosed.bind(this);
	
	
	Mojo.Log.info("About to start first scene - welcome");
	
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
                    {label: "OK", value: "ok"},
					{label: "Email Instructions", value: "instructions"}
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
	   
	  case 'go-remotePrevious':
			var previousRemoteScene = getPreviousRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
			Mojo.Controller.stageController.swapScene({name: previousRemoteScene, disableSceneScroller: true});
	   break;
	   
	  case 'go-remoteNext':
			//Mojo.Log.error("current scene is " + WebMyth.prefsCookieObject.currentRemoteScene);
			var nextRemoteScene = getNextRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
			//Mojo.Log.error("next scene is " + nextRemoteScene);
			Mojo.Controller.stageController.swapScene({name: nextRemoteScene, disableSceneScroller: true});
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




StageAssistant.prototype.onBlurHandler = function() {
	
	//Add card is minimized
	//Mojo.Log.info("Card is minimized");
	
	this.startDashboard();
	
};

StageAssistant.prototype.onFocusHandler = function() {

	//App card is now active
	//Mojo.Log.info("Card is active");
	
	dashboardStage = Mojo.Controller.getAppController().getStageController("dashboard");
	
	dashboardStage.delegateToSceneAssistant("closeDashboard", {});

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

StageAssistant.prototype.handleConnect = function(event) {

	$('telnet_plugin_id').openSocket(WebMyth.prefsCookieObject.currentFrontendAddress, WebMyth.prefsCookieObject.currentRemotePort);
	
	Mojo.Log.info("opening telnet socket");
	
};

StageAssistant.prototype.didReceiveData = function(a) {

	Mojo.Log.error("plugin response of %s", a);
	Mojo.Controller.getAppController().showBanner(a, {source: 'notification'});
	
};

StageAssistant.prototype.didQueryLocation = function(a) {

	//Mojo.Log.error("query location plugin response of %s", a);
	WebMyth.currentLocation = a;
	
};

StageAssistant.prototype.socketIsClosed = function(a) {

	Mojo.Log.error("socket is closed response of %s", a);
	Mojo.Controller.getAppController().showBanner(a, {source: 'notification'});
	
};






WebMyth.sendKey = function(value){
		
		Mojo.Log.info("Sending key ",value);
		
		var fullCmd = "key "+value
	
	if(WebMyth.usePlugin){
		//$('telnet_plugin_id').sendData(fullCmd);
		
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

	
	if(WebMyth.usePlugin){
		//$('telnet_plugin_id').sendData("jump "+value);
		
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
	
	if(WebMyth.usePlugin){
		//$('telnet_plugin_id').sendData("play "+value);
		
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
	
	var response = $('telnet_plugin_id').sendDataWithResponse("query "+value);
	
	
	Mojo.Log.error("inside query response of "+response);
	
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
								target: "file: ///media/internal/mythtv/"+input_parameters.myFilename,
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

