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
	
	
	//View upcoming button
	this.controller.setupWidget("goUpcomingButtonId",
         {},
         {
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
		};
		
		//Setup default settings if missing due to old cookie versions
		if (WebMyth.prefsCookieObject.webserverRemoteFile == null) WebMyth.prefsCookieObject.webserverRemoteFile = defaultCookie().webserverRemoteFile;
		//if (WebMyth.prefsCookieObject.webMysqlFile == null) WebMyth.prefsCookieObject.webMysqlFile = defaultCookie().webMysqlFile;
		//if (WebMyth.prefsCookieObject.webmythPythonFile == null) WebMyth.prefsCookieObject.webmythPythonFile = defaultCookie().webmythPythonFile;
		if (WebMyth.prefsCookieObject.currentRecgroup == null) WebMyth.prefsCookieObject.currentRecgroup = defaultCookie().currentRecgroup;
		if (WebMyth.prefsCookieObject.currentRecSort == null) WebMyth.prefsCookieObject.currentRecSort = defaultCookie().currentRecSort;
		if (WebMyth.prefsCookieObject.currentFrontend == null) WebMyth.prefsCookieObject.currentFrontend = defaultCookie().currentFrontend;
		if (WebMyth.prefsCookieObject.currentRemotePort == null) WebMyth.prefsCookieObject.currentRemotePort = defaultCookie().currentRemotePort;
		if (WebMyth.prefsCookieObject.currentRemoteScene == null) WebMyth.prefsCookieObject.currentRemoteScene = defaultCookie().currentRemoteScene;
		if (WebMyth.prefsCookieObject.allowRecordedDownloads == null) WebMyth.prefsCookieObject.allowRecordedDownloads = defaultCookie().allowRecordedDownloads;
		if (WebMyth.prefsCookieObject.recordedDownloadsUrl == null) WebMyth.prefsCookieObject.recordedDownloadsUrl = defaultCookie().recordedDownloadsUrl;
		if (WebMyth.prefsCookieObject.theme == null) WebMyth.prefsCookieObject.theme = defaultCookie().theme;
		if (WebMyth.prefsCookieObject.remoteVibrate == null) WebMyth.prefsCookieObject.remoteVibrate = defaultCookie().remoteVibrate;
		if (WebMyth.prefsCookieObject.remoteFullscreen == null) WebMyth.prefsCookieObject.remoteFullscreen = defaultCookie().remoteFullscreen;
		if (WebMyth.prefsCookieObject.masterBackendIp == null) WebMyth.prefsCookieObject.masterBackendIp = defaultCookie().masterBackendIp;
		if (WebMyth.prefsCookieObject.manualMasterBackend == null) WebMyth.prefsCookieObject.manualMasterBackend = defaultCookie().manualMasterBackend;
		if (WebMyth.prefsCookieObject.remoteHeaderAction == null) WebMyth.prefsCookieObject.remoteHeaderAction = defaultCookie().remoteHeaderAction;
		if (WebMyth.prefsCookieObject.playJumpRemote == null) WebMyth.prefsCookieObject.playJumpRemote = defaultCookie().playJumpRemote;
		if (WebMyth.prefsCookieObject.showUpcomingChannelIcons == null) WebMyth.prefsCookieObject.showUpcomingChannelIcons = defaultCookie().showUpcomingChannelIcons;
		
		//Check if scripts need an upgrade message
		if (WebMyth.prefsCookieObject.previousScriptVersion == null) {
			Mojo.Log.info("Previous script version in cookie not set");		//for upgrades
			WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
			this.alertNeedScript();
		} else if ( (WebMyth.prefsCookieObject.previousScriptVersion) < (WebMyth.currentScriptVersion) ) {
			Mojo.Log.info("Previous script version is old: "+WebMyth.prefsCookieObject.previousScriptVersion);
			this.alertScriptUpdate(WebMyth.prefsCookieObject.previousScriptVersion);
			WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
		} else {
			Mojo.Log.info("Previous script version matches current :"+WebMyth.prefsCookieObject.previousScriptVersion+" "+WebMyth.currentScriptVersion);
			WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
		}
		
		//Save cookie
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject); 
		//Use theme
		this.controller.document.body.className = WebMyth.prefsCookieObject.theme;
			
		if(WebMyth.prefsCookieObject.webserverName == '') {
			Mojo.Controller.getAppController().showBanner("Please configure app preferences", {source: 'notification'});
		}
		
	} else {		//for new installs
		//Mojo.Controller.getAppController().showBanner("Setup server in preferences", {source: 'notification'});
		WebMyth.prefsCookieObject = defaultCookie();
		WebMyth.prefsCookieObject.previousScriptVersion = WebMyth.currentScriptVersion;
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
		
		//Use theme
		this.controller.document.body.className = WebMyth.prefsCookieObject.theme;
		
		this.alertNeedScript();
	};

	//Hosts cookie
	if (WebMyth.hostsCookieObject) {		//cookie exist
		//do nothing?
	} else {
		WebMyth.hostsCookieObject = defaultHostsCookie();
		WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	}
	
	//Remote scenes cookie
	if (WebMyth.remoteCookieObject) {		//cookie exist
	
		if(WebMyth.remoteCookieObject.length == 4) {		//only 1st 4 remotes
			WebMyth.remoteCookieObject.push({ "name": "masterRemote", "enabled": true });
			WebMyth.remoteCookieObject.push({ "name": "numberpad", "enabled": true });
			WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);
			
		} else if(WebMyth.remoteCookieObject.length == 5) {		//only 1st 4 remotes
			WebMyth.remoteCookieObject.push({ "name": "numberpad", "enabled": true });
			WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);
		}
	} else {
		WebMyth.remoteCookieObject = defaultRemoteCookie();
		WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);
	}
	
	
};

WelcomeAssistant.prototype.activate = function(event) {
	//asdf
	
	$('masterIpAddress-title').innerHTML = WebMyth.prefsCookieObject.masterBackendIp;
	
		
	//Get backend IP
	//Mojo.Log.info('Getting MasterBackendIP');
	if((WebMyth.prefsCookieObject.manualMasterBackend == null)||(WebMyth.prefsCookieObject.manualMasterBackend == false)) {
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=getSetting";
		requestUrl += "&setting=MasterServerIP";
	
		try {
			var request = new Ajax.Request(requestUrl,{
				method: 'get',
				onSuccess: this.readSettingSuccess.bind(this),
				onFailure: this.readSettingFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
	} else {
		$('masterIpAddress-title').innerHTML = WebMyth.prefsCookieObject.masterBackendIp;
	}
};

WelcomeAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

WelcomeAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
};

WelcomeAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.forward) {
		Mojo.Controller.stageController.pushScene("hostSelector", true);
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

WelcomeAssistant.prototype.goGuide = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("guide");
};

WelcomeAssistant.prototype.goStatus = function(event) {
	//Start upcoming scene
	Mojo.Controller.stageController.pushScene("status");
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

WelcomeAssistant.prototype.alertScriptUpdate = function(oldversion) {
	
	/* Script history:
		remote.py version 2 from 0.1.8
		webmyth-mysql.php version 2 from 0.1.8
	*/
	
	Mojo.Log.error("Current version is " + WebMyth.currentScriptVersion + " but last version was " + oldversion);
	
	
	if( (WebMyth.currentScriptVersion) > oldversion ) {
	
		Mojo.Log.info("Inside remote alert if");
	
		var script_message = "This update to WebMyth includes a brand new script (webmyth.py) that replaces the previous scripts.  ";
		script_message += "Unfortunately this app breaks compatibility with the old scripts and will not work until you install the new script.  ";
		script_message += "If you recently installed webmyth.py version 3 and were having problems, this update to the script should fix all that.<hr/>";
		script_message += "The current script version is " + WebMyth.currentScriptVersion + ".";
       
		this.controller.showAlertDialog({
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
			message:  script_message, 
			choices: [
                    {label: "OK", value: false},
					{label: "Email Instructions", value: true}
					],
			allowHTMLMessage: true
		});
	};
	
	Mojo.Log.error("Leaving alert script update");
	
	
};


WelcomeAssistant.prototype.readSettingFail = function(response) {
	Mojo.Log.error("Failed to get backend setting information");
	
	
};

WelcomeAssistant.prototype.readSettingSuccess = function(response) {
	var masterIpAddress = response.responseText.trim()
	//Mojo.Log.info("Got master backend IP from settings: "+masterIpAddress);
	
	WebMyth.prefsCookieObject.masterBackendIp = masterIpAddress;
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
	$('masterIpAddress-title').innerHTML = masterIpAddress;
	
	
};
