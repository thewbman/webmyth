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
	   
	   this.backendsList = [];
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
         this.recordedButtonModel = {
             label : "Recorded Shows",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goRecordedButtonId"),Mojo.Event.tap, this.goRecorded.bind(this));
	
	
	//View upcoming button
	this.controller.setupWidget("goUpcomingButtonId",
		 {},
		 this.upcomingButtonModel = {
			 label : "Upcoming Recordings",
			 disabled: false
		 }
	 );
	Mojo.Event.listen(this.controller.get("goUpcomingButtonId"),Mojo.Event.tap, this.goUpcoming.bind(this));
	
	
	//View guide button
	this.controller.setupWidget("goGuideButtonId",
         {},
         {
             label : "Program Guide",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goGuideButtonId"),Mojo.Event.tap, this.goGuide.bind(this));
	
	
	//Videos button
	this.controller.setupWidget("goVideosButtonId",
         {},
         {
             label : "Videos",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goVideosButtonId"),Mojo.Event.tap, this.goVideos.bind(this));
	
	
	//Music button
	this.controller.setupWidget("goMusicButtonId",
         {},
         {
             label : "Music",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goMusicButtonId"),Mojo.Event.tap, this.goMusic.bind(this));
	
	
	//View status button
	this.controller.setupWidget("goStatusButtonId",
         {},
         {
             label : "Status",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goStatusButtonId"),Mojo.Event.tap, this.goStatus.bind(this));
	
	

	if (WebMyth.prefsCookieObject) {		//cookie exists
			
		//Do Metrix submission if allowed
		if (WebMyth.prefsCookieObject.allowMetrix == true) {
			Mojo.Log.info("Submitting data to Metrix");
			
			//Metrix command
			WebMyth.Metrix.postDeviceData();
			
			//Metrix bulletin
			//0.4.6 - bulletin 10
			WebMyth.Metrix.checkBulletinBoard(this.controller, 10);
		};
		
		
		//Setup default settings if missing due to old cookie versions
		//if (WebMyth.prefsCookieObject.webserverRemoteFile == null) WebMyth.prefsCookieObject.webserverRemoteFile = defaultCookie().webserverRemoteFile;
		//if (WebMyth.prefsCookieObject.webMysqlFile == null) WebMyth.prefsCookieObject.webMysqlFile = defaultCookie().webMysqlFile;
		if (WebMyth.prefsCookieObject.webmythPythonFile == null) WebMyth.prefsCookieObject.webmythPythonFile = defaultCookie().webmythPythonFile;
		if (WebMyth.prefsCookieObject.currentRecgroup == null) WebMyth.prefsCookieObject.currentRecgroup = defaultCookie().currentRecgroup;
		if (WebMyth.prefsCookieObject.currentRecSort == null) WebMyth.prefsCookieObject.currentRecSort = defaultCookie().currentRecSort;
		if (WebMyth.prefsCookieObject.currentFrontend == null) WebMyth.prefsCookieObject.currentFrontend = defaultCookie().currentFrontend;
		if (WebMyth.prefsCookieObject.currentFrontendPort == null) WebMyth.prefsCookieObject.currentFrontendPort = defaultCookie().currentFrontendPort;
		if (WebMyth.prefsCookieObject.currentRemoteScene == null) WebMyth.prefsCookieObject.currentRemoteScene = defaultCookie().currentRemoteScene;
		if (WebMyth.prefsCookieObject.allowRecordedDownloads == null) WebMyth.prefsCookieObject.allowRecordedDownloads = defaultCookie().allowRecordedDownloads;
		if (WebMyth.prefsCookieObject.recordedDownloadsUrl == null) WebMyth.prefsCookieObject.recordedDownloadsUrl = defaultCookie().recordedDownloadsUrl;
		//if (WebMyth.prefsCookieObject.theme == null) WebMyth.prefsCookieObject.theme = defaultCookie().theme;
		if (WebMyth.prefsCookieObject.remoteVibrate == null) WebMyth.prefsCookieObject.remoteVibrate = defaultCookie().remoteVibrate;
		if (WebMyth.prefsCookieObject.remoteFullscreen == null) WebMyth.prefsCookieObject.remoteFullscreen = defaultCookie().remoteFullscreen;
		if (WebMyth.prefsCookieObject.masterBackendIp == null) WebMyth.prefsCookieObject.masterBackendIp = defaultCookie().masterBackendIp;
		if (WebMyth.prefsCookieObject.manualMasterBackend == null) WebMyth.prefsCookieObject.manualMasterBackend = defaultCookie().manualMasterBackend;
		if (WebMyth.prefsCookieObject.remoteHeaderAction == null) WebMyth.prefsCookieObject.remoteHeaderAction = defaultCookie().remoteHeaderAction;
		if (WebMyth.prefsCookieObject.playJumpRemote == null) WebMyth.prefsCookieObject.playJumpRemote = defaultCookie().playJumpRemote;
		if (WebMyth.prefsCookieObject.guideJumpRemote == null) WebMyth.prefsCookieObject.guideJumpRemote = defaultCookie().guideJumpRemote;
		if (WebMyth.prefsCookieObject.showUpcomingChannelIcons == null) WebMyth.prefsCookieObject.showUpcomingChannelIcons = defaultCookie().showUpcomingChannelIcons;
		if (WebMyth.prefsCookieObject.dashboardRemote == null) WebMyth.prefsCookieObject.dashboardRemote = defaultCookie().dashboardRemote;
		if (WebMyth.prefsCookieObject.dashboardRemoteIndex == null) WebMyth.prefsCookieObject.dashboardRemoteIndex = defaultCookie().dashboardRemoteIndex;
		if (WebMyth.prefsCookieObject.useWebmythScript == null) WebMyth.prefsCookieObject.useWebmythScript = defaultCookie().useWebmythScript;
		if (WebMyth.prefsCookieObject.showUpcoming == null) WebMyth.prefsCookieObject.showUpcoming = defaultCookie().showUpcoming;
		if (WebMyth.prefsCookieObject.showVideos == null) WebMyth.prefsCookieObject.showVideos = defaultCookie().showVideos;
		if (WebMyth.prefsCookieObject.showMusic == null) WebMyth.prefsCookieObject.showMusic = defaultCookie().showMusic;
		if (WebMyth.prefsCookieObject.currentVideosSort == null) WebMyth.prefsCookieObject.currentVideosSort = defaultCookie().currentVideosSort;
		if (WebMyth.prefsCookieObject.currentVideosGroup == null) WebMyth.prefsCookieObject.currentVideosGroup = defaultCookie().currentVideosGroup;
		if (WebMyth.prefsCookieObject.currentFrontendAddress == null) WebMyth.prefsCookieObject.currentFrontendAddress = defaultCookie().currentFrontend;
		if (WebMyth.prefsCookieObject.currentMusicSort == null) WebMyth.prefsCookieObject.currentMusicSort = defaultCookie().currentMusicSort;
		if (WebMyth.prefsCookieObject.currentUpcomingGroup == null) WebMyth.prefsCookieObject.currentUpcomingGroup = defaultCookie().currentUpcomingGroup;
		if (WebMyth.prefsCookieObject.forceScriptScreenshots == null) WebMyth.prefsCookieObject.forceScriptScreenshots = defaultCookie().forceScriptScreenshots;
		if (WebMyth.prefsCookieObject.showVideoImages == null) WebMyth.prefsCookieObject.showVideoImages = defaultCookie().showVideoImages;
		
		
		//Check if scripts need an upgrade message
		if (WebMyth.prefsCookieObject.previousScriptVersion == null) {
			//Mojo.Log.info("Previous script version in cookie not set");		//for upgrades
			WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
			this.alertNeedScript();
		} else if ( (WebMyth.prefsCookieObject.previousScriptVersion) < (WebMyth.currentScriptVersion) ) {
			//Mojo.Log.info("Previous script version is old: "+WebMyth.prefsCookieObject.previousScriptVersion);
			this.alertScriptUpdate(WebMyth.prefsCookieObject.previousScriptVersion);
			WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
		} else {
			//Mojo.Log.info("Previous script version matches current :"+WebMyth.prefsCookieObject.previousScriptVersion+" "+WebMyth.currentScriptVersion);
			WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
		}
		
		//Save cookie
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject); 
		
		//Use theme
		this.controller.document.body.className = 'palm-dark';
		this.controller.document.body.className += " device-"+Mojo.Environment.DeviceInfo.modelNameAscii;
		this.controller.document.body.className += " width-"+Mojo.Environment.DeviceInfo.screenWidth;
		this.controller.document.body.className += " height-"+Mojo.Environment.DeviceInfo.screenHeight;
			
		if(WebMyth.prefsCookieObject.webserverName == '') {
			Mojo.Controller.getAppController().showBanner("Please configure app preferences", {source: 'notification'});
		}
		
	} else {		//for new installs
		//Mojo.Controller.getAppController().showBanner("Setup server in preferences", {source: 'notification'});
		WebMyth.prefsCookieObject = defaultCookie();
		WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
		
		//Use theme
		this.controller.document.body.className = 'palm-dark';
		this.controller.document.body.className += " device-"+Mojo.Environment.DeviceInfo.modelNameAscii;
		this.controller.document.body.className += " width-"+Mojo.Environment.DeviceInfo.screenWidth;
		this.controller.document.body.className += " height-"+Mojo.Environment.DeviceInfo.screenHeight;
		
		this.alertNeedScript();
	};

	//Hosts cookie
	if (WebMyth.hostsCookieObject) {		//cookie exist
		//Mojo.Log.info("Hosts cookie is %j",WebMyth.hostsCookieObject);
		//cleanHostsCookie(WebMyth.hostsCookieObject);
		//WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	} else {
		//Mojo.Log.info("Missing hosts cookie.  Using default.");
		WebMyth.hostsCookieObject = defaultHostsCookieCurrent(WebMyth.prefsCookieObject.currentFrontend);
		WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	}
	//Mojo.Log.error("Hosts cookie is %j",WebMyth.hostsCookieObject);
	

	//Backends cookie
	if (WebMyth.backendsCookieObject) {		//cookie exist
		//Mojo.Log.info("Backends cookie is %j",WebMyth.backendsCookieObject);
	} else {
		Mojo.Log.info("Missing backends cookie.  Using default.");
		WebMyth.backendsCookieObject = [{hostname: "backend", ip: "192.168.1.1", master: true}];
		WebMyth.backendsCookie.put(WebMyth.backendsCookieObject);
	}
		
	
	//Remote scenes cookie
	if (WebMyth.remoteCookieObject) {		//cookie exist
	
		if(WebMyth.remoteCookieObject.length == 4) {		//only 1st 4 remotes
			WebMyth.remoteCookieObject.push({ "name": "masterRemote", "enabled": true });
			WebMyth.remoteCookieObject.push({ "name": "numberpad", "enabled": true });
			WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);
			
		} else if(WebMyth.remoteCookieObject.length == 5) {		//only 1st 5 remotes
			WebMyth.remoteCookieObject.push({ "name": "numberpad", "enabled": true });
			WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);
		}
	} else {
		WebMyth.remoteCookieObject = defaultRemoteCookie();
		WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);
	}

	//Check for app updates
	this.puchkDoUpdateCheck(24);
	
	//Get backend IPs
	this.checkConnectionStatus();
	
	//Get script veriosn
	this.getScriptVersion();
	
};

WelcomeAssistant.prototype.activate = function(event) {
	
	if(WebMyth.prefsCookieObject.webserverName == '') {
	
		$('masterIpAddress-title').innerHTML = "Please configure app preferences in menu at top-left";
		
	} else {
	
		$('masterIpAddress-title').innerHTML = WebMyth.prefsCookieObject.masterBackendIp;
			
		//Get backend IP
		//Mojo.Log.info('Getting MasterBackendIP');
		if( ((WebMyth.prefsCookieObject.manualMasterBackend == null)||(WebMyth.prefsCookieObject.manualMasterBackend == false))&&
			(WebMyth.prefsCookieObject.masterBackendIp == "-") ) {

			var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
			requestUrl += "?op=getSetting";
			requestUrl += "&setting=MasterServerIP";
		
			try {
				var request = new Ajax.Request(requestUrl,{
					method: 'get',
					onSuccess: this.readMasterBackendSuccess.bind(this),
					onFailure: this.readMasterBackendFail.bind(this)  
				});
			}
			catch(e) {
				Mojo.Log.error(e);
			}
			
		} else {
			$('masterIpAddress-title').innerHTML = WebMyth.prefsCookieObject.masterBackendIp;
			
			//Get backend IPs
			//this.checkConnectionStatus();
		}
	
	}
	
	
	this.showButtons();
	
	
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Help button
	Mojo.Event.listen(this.controller.get("helpButton"),Mojo.Event.tap, this.doHelpButton.bind(this));
	
};

WelcomeAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

WelcomeAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   
};

WelcomeAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.forward) {
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};

WelcomeAssistant.prototype.handleKey = function(event) {

	Mojo.Log.info("handleKey %o, %o", event.originalEvent.metaKey, event.originalEvent.keyCode);
	
	if(event.originalEvent.metaKey) {
		switch(event.originalEvent.keyCode) {
			case 71:
				Mojo.Log.info("g - shortcut key to guide");
				Mojo.Controller.stageController.pushScene("guide");	
				break;
			case 82:
				Mojo.Log.info("r - shortcut key to recorded");
				Mojo.Controller.stageController.pushScene("recorded");
				break;
			case 83:
				Mojo.Log.info("s - shortcut key to status");
				Mojo.Controller.stageController.pushScene("status");
				break;
			case 85:
				Mojo.Log.info("u - shortcut key to upcoming");
				Mojo.Controller.stageController.pushScene("upcoming");
				break;
			default:
				Mojo.Log.info("No shortcut key");
				break;
		}
	}
	Event.stop(event); 
};




WelcomeAssistant.prototype.showButtons = function() {
	
	if((WebMyth.prefsCookieObject.showUpcoming)&&(WebMyth.prefsCookieObject.useWebmythScript)) {
		$('goUpcomingButtonId').show();
	} else {
		$('goUpcomingButtonId').hide();
	}
	
	if((WebMyth.prefsCookieObject.showVideos)&&(WebMyth.prefsCookieObject.useWebmythScript)) {
		$('goVideosButtonId').show();
	} else {
		$('goVideosButtonId').hide();
	}
	
	if((WebMyth.prefsCookieObject.showMusic)&&(WebMyth.prefsCookieObject.useWebmythScript)) {
		$('goMusicButtonId').show();
	} else {
		$('goMusicButtonId').hide();
	}
	
	if((WebMyth.prefsCookieObject.showMusic)&&(WebMyth.prefsCookieObject.showVideos)&&(WebMyth.prefsCookieObject.showUpcoming)) {
		$('videoButtonWrapper').className = 'column1of2';
		$('musicButtonWrapper').className = 'column2of2';
	} else {
		$('videoButtonWrapper').className = "";
		$('musicButtonWrapper').className = "";
	}
	
	
	
	
	if((Mojo.Environment.DeviceInfo.screenHeight == "400")&&(WebMyth.prefsCookieObject.showUpcoming)) {
		$('recordedButtonWrapper').className = 'column1of2';
		$('upcomingButtonWrapper').className = 'column2of2';
		
		this.recordedButtonModel.label = "Recorded";
			this.controller.modelChanged(this.recordedButtonModel, this);
		this.upcomingButtonModel.label = "Upcoming";
			this.controller.modelChanged(this.upcomingButtonModel, this);
			
	} else {
		$('recordedButtonWrapper').className = "";
		$('upcomingButtonWrapper').className = "";
		
		this.recordedButtonModel.label = "Recorded shows";
			this.controller.modelChanged(this.recordedButtonModel, this);
		this.upcomingButtonModel.label = "Upcoming recordings";
			this.controller.modelChanged(this.upcomingButtonModel, this);
	}
	
};

WelcomeAssistant.prototype.goRemote = function(event) {
	//Start remote scene 
	Mojo.Controller.stageController.pushScene("hostSelector", false);
};

WelcomeAssistant.prototype.goRecorded = function(event) {
	//Start recorded scene
	Mojo.Controller.stageController.pushScene("recorded");
};

WelcomeAssistant.prototype.goUpcoming = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("upcoming");
};

WelcomeAssistant.prototype.goUpcomingXML = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("upcomingXML");
};

WelcomeAssistant.prototype.goGuide = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("guide");
};

WelcomeAssistant.prototype.goSearch = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("search");
};

WelcomeAssistant.prototype.goVideos = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("videos");
};

WelcomeAssistant.prototype.goMusic = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("musicList");
};

WelcomeAssistant.prototype.goStatus = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("status");
};

WelcomeAssistant.prototype.goWebview = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("webview");
};

WelcomeAssistant.prototype.alertNeedScript = function() {
	
	this.controller.showAlertDialog({
        onChoose: function(value) {},
        title: "WebMyth - v" + Mojo.Controller.appInfo.version,
        message:  WebMyth.helpMessage, 
		choices: [{
            label: "OK",
			value: ""
		}],
		allowHTMLMessage: true
    });
	
};



WelcomeAssistant.prototype.doHelpButton = function(event) {
	
		//Mojo.Log.info("Inside doHelpButton");
	
		this.controller.showAlertDialog({
			onChoose: function(value) {
				switch(value) {
					case 'faqs':
					
						//FAQs
						Mojo.Controller.stageController.pushScene("faqs");
						
					break;
					case 'instructions':
						
						this.controller.showAlertDialog({
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
					case 'tips':
								
						//Tips
						Mojo.Controller.stageController.pushScene("tips");
						
					break;
					case 'email':
					
						var request = new Mojo.Service.Request( "palm://com.palm.applicationManager", {
								method: 'open',
								parameters: {
									id: "com.palm.app.email",
									params: {
										summary: "Help with WebMyth v"+ Mojo.Controller.appInfo.version+", script version "+WebMyth.prefsCookieObject.liveScriptVersion,
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
					case 'updates':
									
						//Check for updates
						var request = new Mojo.Service.Request("palm://com.palm.applicationManager", {
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
					}
				},
			title: "WebMyth - v" + Mojo.Controller.appInfo.version,
			//message:  script_message, 
			choices: [
					{label: "FAQs", value: 'faqs'},
                    {label: "Instructions", value: 'instructions'},
					{label: "Tips", value: 'tips'},
					{label: "Email Developer", value: 'email'}
					],
			allowHTMLMessage: true
		});

	
}

WelcomeAssistant.prototype.alertScriptUpdate = function(oldversion) {
	
	//Mojo.Log.error("Current version is " + WebMyth.currentScriptVersion + " but last version was " + oldversion);
	
	
	if( (WebMyth.currentScriptVersion) > oldversion ) {
	
		//Mojo.Log.info("Inside remote alert if");
	
		var script_message = "This update to WebMyth includes a new script version that replaces the previous scripts.  ";
		script_message += "While all of the existig functionality of the prvious version should still be intact, you will not be able to access music or setup recordings from the app.  <hr/>";
		script_message += "The current script version is " + WebMyth.currentScriptVersion + ".";
       
		this.controller.showAlertDialog({
			onChoose: function(value) {if (value==true) {
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
			message:  script_message, 
			choices: [
                    {label: "OK", value: false},
					{label: "Email Instructions", value: true}
					],
			allowHTMLMessage: true
		});
	};
	
	//Mojo.Log.error("Leaving alert script update");
	
	
};

WelcomeAssistant.prototype.readMasterBackendFail = function(response) {
	Mojo.Log.error("Failed to get backend setting information");
	
	
};

WelcomeAssistant.prototype.readMasterBackendSuccess = function(response) {
	var masterIpAddress = response.responseText.trim()
	//Mojo.Log.info("Got master backend IP from settings: "+masterIpAddress);
	
	if(WebMyth.prefsCookieObject.masterBackendIp != masterIpAddress) {
	
		//Mojo.Log.info("Master backend IP changed - updating");
		
		WebMyth.prefsCookieObject.masterBackendIp = masterIpAddress;
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
		
		$('masterIpAddress-title').innerHTML = masterIpAddress;
		
		
	} else {
		//Mojo.Log.info("Master backend IP has not changed");
	}
	
	
	//Get backend IPs
	//this.checkConnectionStatus();

};

WelcomeAssistant.prototype.getHostsList = function() {
	
	//This function has been depreciated and replaced with getSettings();
	
	//Mojo.Log.error("Starting to get hosts");
		
	var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetHosts";

	//Mojo.Log.info("XML hosts URL is: "+requestUrl);
			
		try {
				var request = new Ajax.Request(requestUrl,{
				method: 'get',
				evalJSON: false,
				onSuccess: this.readHostsSuccess.bind(this),
				onFailure: function() {
						Mojo.Log.info("failed to get hosts from backend")	
					}  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
	
}

WelcomeAssistant.prototype.getSettings = function() {
	
	//Mojo.Log.error("Starting to get settingss");
		
	var query = "SELECT * FROM `settings`  WHERE `value` != 'MythWelcomeDateFormat' ;";
	
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQLwithResponse";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
			onSuccess: this.readSettingsSuccess.bind(this),
            onFailure: function() {
						Mojo.Log.info("failed to get settings table from backend")	
					}   
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
}

WelcomeAssistant.prototype.readSettingsSuccess = function(response) {

	//Mojo.Log.info('Got settings table rule responseJSON: %j', response.responseJSON);
	
	this.settings = cleanSettings(response.responseJSON);
	
	Mojo.Log.info("Cleaned settings is %j",this.settings);
	
	WebMyth.settings.clear();
	Object.extend(WebMyth.settings,this.settings);
	
	this.backendsList = this.settings.hosts;
	
	//Mojo.Log.info("Cleaned backends list is %j",this.backendsList);
	
	WebMyth.backendsCookieObject.clear();
	Object.extend(WebMyth.backendsCookieObject,this.backendsList);
	WebMyth.backendsCookie.put(WebMyth.backendsCookieObject);
	
	this.getConnectionInfo();
	
	
};

WelcomeAssistant.prototype.getConnectionInfo = function() {
	
	//Mojo.Log.error("Starting to get connection info");
		
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetConnectionInfo";
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			onSuccess: this.readConnectionInfoSuccess.bind(this),
            onFailure: function() {
						Mojo.Log.info("failed to get connection info")	
					}   
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
}

WelcomeAssistant.prototype.readConnectionInfoSuccess = function(response) {

	//Mojo.Log.info('Got connection info', response.responseText.trim());
	
	var xmlstring = response.responseText.trim();
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, infoNode, databaseNode, databaseChildNode;
	var singleHostJson = {};
	var Count;
	
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetConnectionInfoResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		switch(topSingleNode.nodeName) {
			case 'Info':
				//Mojo.Log.info('Starting to parse Info');
				infoNode = topSingleNode;
				
				for(var j = 0; j < infoNode.childNodes.length; j++) {
					switch(infoNode.childNodes[j].nodeName) {
						case 'Database':
							//Mojo.Log.info('Starting to parse Database');
							databaseChildNode = infoNode.childNodes[j];
							
							for(var k = 0; k < databaseChildNode.childNodes.length; k++) {
								//Mojo.Log.info("database child node name is "+databaseChildNode.childNodes[k].nodeName);
								switch(databaseChildNode.childNodes[k].nodeName) {
									case 'Host':
										//Mojo.Log.info("DB host is "+databaseChildNode.childNodes[k].childNodes[0].nodeValue);
										WebMyth.prefsCookieObject.databaseHost = databaseChildNode.childNodes[k].childNodes[0].nodeValue;
									  break;
									  
									case 'Port':
										//Mojo.Log.info("DB port is "+databaseChildNode.childNodes[k].childNodes[0].nodeValue);
										WebMyth.prefsCookieObject.databasePort = databaseChildNode.childNodes[k].childNodes[0].nodeValue;
									  break;
									  
									case 'UserName':
										//Mojo.Log.info("DB username is "+databaseChildNode.childNodes[k].childNodes[0].nodeValue);
										WebMyth.prefsCookieObject.databaseUsername = databaseChildNode.childNodes[k].childNodes[0].nodeValue;
									  break;
									  
									case 'Password':
										//Mojo.Log.info("DB password is "+databaseChildNode.childNodes[k].childNodes[0].nodeValue);
										WebMyth.prefsCookieObject.databasePassword = databaseChildNode.childNodes[k].childNodes[0].nodeValue;
									  break;
									  
									case 'Name':
										//Mojo.Log.info("DB name is "+databaseChildNode.childNodes[k].childNodes[0].nodeValue);
										WebMyth.prefsCookieObject.databaseName = databaseChildNode.childNodes[k].childNodes[0].nodeValue;
									  break;
									  
								}
							}
						
						  break;
						  
					}
				}
			
			  break;
		}
		
	}
	
	Mojo.Log.info("Finished gettig SQL connection info");
	
	
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);						
			
	
};


WelcomeAssistant.prototype.getScriptVersion = function() {
	
	//Mojo.Log.error("Starting to get script version");
		
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=getScriptVersion";	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
			onSuccess: this.readScriptVersionSuccess.bind(this),
            onFailure: function() {
						Mojo.Log.info("failed to get script version")	
					}   
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
}

WelcomeAssistant.prototype.readScriptVersionSuccess = function(response) {

	Mojo.Log.info('Got script version', response.responseText.trim());
	
	WebMyth.prefsCookieObject.liveScriptVersion = response.responseText.trim();
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
};

WelcomeAssistant.prototype.gotConnectionFailed = function(response) {
	Mojo.Log.error("failed to get connection status");
	
}

WelcomeAssistant.prototype.checkConnectionStatus = function() {
	
	//Update backends from XML
	Mojo.Log.info('Starting to get connection status');
	
	
	//Check we are on WiFi before trying to get backends
	this.controller.serviceRequest('palm://com.palm.connectionmanager', {
			method: 'getstatus',
			parameters: {subscribe: false},
			onSuccess: function(response) {
				//Mojo.Log.info("Got connection status of %j", response);
				
				if(response.wifi.state == "connected") {
					//this.getHostsList();
					
					this.getSettings();
				}
	
			}.bind(this),
			onFailure: this.gotConnectionFailure
		}
	);
		
};

WelcomeAssistant.prototype.readHostsSuccess = function(response) {
	
	var xmlstring = response.responseText.trim();
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	//Mojo.Log.info("Hosts response is %s",xmlstring);
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, hostsNode, singleHostNode;
	var singleHostJson = {};
	var Count;
	
	var s = {};		//individual JSON for each program parsing
	
	
	//Mojo.Log.error("about to start parsing hosts");
	this.backendsList.clear();
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetHostsResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		switch(topSingleNode.nodeName) {
			case 'Count':
				Count = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'Hosts':
				//Mojo.Log.info('Starting to parse Hosts');
				hostsNode = topSingleNode;
				for(var j = 0; j < hostsNode.childNodes.length; j++) {
					singleHostNode = hostsNode.childNodes[j];
					//Mojo.Log.info("Node name is "+singleHostNode.nodeName);
					if(singleHostNode.nodeName == 'Host') {
						//Mojo.Log.info('Inside Host if');
						singleHostJson = {
									"hostname": singleHostNode.childNodes[0].nodeValue, 
									"ip": "", 
									"master": false
						}
										
						this.backendsList.push(singleHostJson);
						//Mojo.Log.info("Single host json is %j", singleHostJson);
							
						
					}
				}
				//Mojo.Log.info('Done parsing Hosts');
				//Mojo.Log.error("Hosts full json is %j", this.backendsList);
	
				
				break;
			default:
				break;
		}
	}
	
	//Mojo.Log.info("Exited XML host parsing");
	
	this.getBackendIPs();
	
};

WelcomeAssistant.prototype.getBackendIPs = function() {

	//Update backend IPs from XML
	//Mojo.Log.info('Starting backend IPs data gathering from XML backend');
	
	var i = 0, s = {};
	
	for(i = 0; i < this.backendsList.length; i++) {
		s = this.backendsList[i];
		
		//Mojo.Log.info("Trying to get IP for %j", s);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetSetting?Key=BackendServerIP&HostName="+s.hostname;
		
		//Mojo.Log.info("XML backend IP URL is: "+requestUrl);
			
		try {
				var request = new Ajax.Request(requestUrl,{
				method: 'get',
				evalJSON: false,
				onSuccess: this.readBackendIPSuccess.bind(this),
				onFailure: function() {
						Mojo.Log.info("failed to get backend IP for "+s.hostname)	
					}  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
	
	}
	
	//Mojo.Log.info("Getting master backend IP");
		
	var requestUrl2 = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetSetting?Key=MasterServerIP";
		
	//Mojo.Log.info("XML master backend IP URL is: "+requestUrl2);
			
	try {
			var request = new Ajax.Request(requestUrl2,{
			method: 'get',
			evalJSON: false,
			onSuccess: this.readMasterBackendIPSuccess.bind(this),
			onFailure: function() {
					Mojo.Log.info("failed to get master backend IP")	
				}  
		});
	}
	catch(e) {
		Mojo.Log.error(e);
	}
	
};

WelcomeAssistant.prototype.readBackendIPSuccess = function(response) {
	
	var xmlstring = response.responseText.trim();
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	//Mojo.Log.info("Backend IP response is %s",xmlstring);
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, valuesNode, singleValueNode;
	var singleHostJson = {};
	var Count, Hostname;
	
	
	
	//Mojo.Log.error("about to start parsing hosts");
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetSettingResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		switch(topSingleNode.nodeName) {
			case 'Count':
				Count = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'HostName':
				Hostname = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'Values':
				//Mojo.Log.info('Starting to parse settings values');
				valuesNode = topSingleNode;
				for(var j = 0; j < valuesNode.childNodes.length; j++) {
					singleValueNode = valuesNode.childNodes[j];
					//Mojo.Log.info("Node name is "+singleValueNode.nodeName);
					if(singleValueNode.nodeName == 'Value') {
						//Mojo.Log.info('Inside Value if');
						singleHostJson = {
									"hostname": Hostname, 
									"ip": singleValueNode.childNodes[0].nodeValue, 
									"master": false
						}
										
						this.backendsList.push(singleHostJson);
						//Mojo.Log.info("Single host json is %j", singleHostJson);
							
						
					}
				}
				//Mojo.Log.info('Done parsing Hosts');
				//Mojo.Log.error("Hosts full json is %j", this.backendsList);
	
				
				break;
			default:
				break;
		}
	}
	
	//Mojo.Log.info("Exited XML Backend IP parsing for "+Hostname);
	
	
};

WelcomeAssistant.prototype.readMasterBackendIPSuccess = function(response) {
	
	var xmlstring = response.responseText.trim();
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	//Mojo.Log.info("Backend IP response is %s",xmlstring);
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, valuesNode, singleValueNode;
	var singleHostJson = {};
	var Count, masterServerIP;
	
	
	
	//Mojo.Log.error("about to start parsing hosts");
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetSettingResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		switch(topSingleNode.nodeName) {
			case 'Count':
				Count = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'Values':
				//Mojo.Log.info('Starting to parse settings values');
				valuesNode = topSingleNode;
				for(var j = 0; j < valuesNode.childNodes.length; j++) {
					singleValueNode = valuesNode.childNodes[j];
					//Mojo.Log.info("Node name is "+singleValueNode.nodeName);
					if(singleValueNode.nodeName == 'Value') {
						//Mojo.Log.info('Inside Value if');
						masterServerIP = singleValueNode.childNodes[0].nodeValue; 
					}
				}
				//Mojo.Log.info('Done parsing master backend IP');
	
				
				break;
			default:
				break;
		}
	}
	
	//Mojo.Log.info("Finished XML Backend IP parsing for master backend - "+masterServerIP);
	
	this.backendsList = cleanupBackendsList(this.backendsList, masterServerIP);
	
	Mojo.Log.info("Cleaned backends list is %j",this.backendsList);
	
	WebMyth.backendsCookieObject.clear();
	Object.extend(WebMyth.backendsCookieObject,this.backendsList);
	WebMyth.backendsCookie.put(WebMyth.backendsCookieObject);
	
	
};



WelcomeAssistant.prototype.puchkDoUpdateCheck = function(interval) {

	this.puchkInterval = interval;

	// reference to the cookie, if it exists
	this.puchkCookieRef = new Mojo.Model.Cookie(Mojo.Controller.appInfo.title + "_puchk");

	// get the cookie
	this.puchkCookie = this.puchkCookieRef.get();

	// if there's no cookie, then this is the first run, or the interval has expired
	// because the cookie expires after the given amount of time
	if (!this.puchkCookie) {
	
		// URL to your app details page on Palm's web site
		var url = "http://developer.palm.com/webChannel/index.php?packageid=" + Mojo.Controller.appInfo.id;
	
		// do AJAX request
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'false',
			onSuccess: this.puchkGotResults.bind(this), // if you get results, check to see if there's an update
			// we're only concerned with success
		});
	}

	// else if the cookie exists, do nothing since the interval hasn't expired
	
}

WelcomeAssistant.prototype.puchkGotResults = function(transport) {

	// if we have success in the AJAX request, then we have an actual check occurring and we can
	// set a cookie

	// expire is now + (interval(hours) * 3600000 milliseconds per hour)
	var expire = new Date();
	expire.setTime(expire.getTime()+(this.puchkInterval*3600000));

	// set a new cookie to expire at interval hours from now
	this.puchkCookieRef.put({},expire);
	
	// the entire HTML source of the Palm app details web page into a string	
	var HTMLStr = transport.responseText;
	
	// regular expression that looks for a string of the form "Version: #.#.#<br/>" in the web page
	// and returns only the "Version: #.#.#" part (JavaScript supports lookaheads but not lookbehinds)
	var patt = /Version:\s[0-9\.]+(?=<br\/>)/;

	// use the pattern to get the match from the web page
	var toSlice = HTMLStr.match(patt).toString();

	// JavaScript doesn't support lookbehinds, so we need to slice "Version: " (9 chars) from the beginning of the string
	// leaving us with a nice "#.#.#"
	var version = toSlice.slice(9);
		
	// if the returned version is greater than the current version
	if (this.puchkVerComp(version)) {

		var appData = {
				title: $L(Mojo.Controller.appInfo.title),
				version: version
				};
				
		// show update dialog
		this.controller.showAlertDialog({                            
            		onChoose: function(value) {                                         
                		if (value === "update") {                                      
                			this.puchkLaunchUpdate();
					window.close();                            
                		}                                                           
            		},                                                                  
            		title: $L({value: "Update Available", key: "puchk_dialog_title"}),                                 
			message: $L({value: "#{title} v#{version} is available. Would you like to update?", key: "puchk_dialog_message"}).interpolate(appData),
            		choices: [                                                          
            			{ label: $L({value: "Download Update", key: "puchk_download_label"}), value: "update", type: "affirmative" },
            			{ label: $L({value: "Cancel", key: "puchk_cancel_label"}), value: "cancel", type: "negative" }      
            		]                                                                   
        	});          	
	}
			
	// if there's no update, do nothing
}

WelcomeAssistant.prototype.puchkLaunchUpdate = function() {
	// when the update button is tapped, send the user to the App Catalog for your app	
	var url = "http://developer.palm.com/appredirect/?packageid=" + Mojo.Controller.appInfo.id;

	this.controller.serviceRequest('palm://com.palm.applicationManager',
		{
		method:'open',
		parameters:{target: url}
		});
}

WelcomeAssistant.prototype.puchkVerComp = function(v) {
	
	var upd = this.puchkSplitVer(v); // most up-to-date version, from the Palm app details page
	var cur = this.puchkSplitVer(Mojo.Controller.appInfo.version); // get current app version from appinfo.js
	
	Mojo.Log.info("Current version is "+Mojo.Controller.appInfo.version+", new version is "+v);
	
	// upd can't be lower than cur or it wouldn't be published
	if (	(upd.major > cur.major) // this is a new major version
			|| ( (upd.major == cur.major) && (upd.minor > cur.minor) ) // this is a new minor version
			|| ( (upd.major == cur.major) && (upd.minor == cur.minor) && (upd.build > cur.build) ) // this is a new build version
		) { return true;}
	
	// otherwise, return false, that there isn't an update
	else { return false; }
}

WelcomeAssistant.prototype.puchkSplitVer = function(v) {
	
	var x = v.split('.');
	
    // get the integers of the version parts, or 0 if it can't parse (i.e. 1.4.0 = 1, 4, 0) 
    var major = parseInt(x[0]) || 0;
    var minor = parseInt(x[1]) || 0;
    var build = parseInt(x[2]) || 0;
    return {
        major: major,
        minor: minor,
        build: build
    };
    	
}

