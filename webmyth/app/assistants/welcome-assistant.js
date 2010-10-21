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
	/*
	//View upcoming XML button
	this.controller.setupWidget("goUpcomingXMLButtonId",
         {},
         {
             label : "Upcoming Recordings XML",
             disabled: false
         }
     );
	Mojo.Event.listen(this.controller.get("goUpcomingXMLButtonId"),Mojo.Event.tap, this.goUpcomingXML.bind(this));
	*/
	
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
		if (WebMyth.prefsCookieObject.guideJumpRemote == null) WebMyth.prefsCookieObject.guideJumpRemote = defaultCookie().guideJumpRemote;
		if (WebMyth.prefsCookieObject.showUpcomingChannelIcons == null) WebMyth.prefsCookieObject.showUpcomingChannelIcons = defaultCookie().showUpcomingChannelIcons;
		if (WebMyth.prefsCookieObject.dashboardRemote == null) WebMyth.prefsCookieObject.dashboardRemote = defaultCookie().dashboardRemote;
		if (WebMyth.prefsCookieObject.dashboardRemoteIndex == null) WebMyth.prefsCookieObject.dashboardRemoteIndex = defaultCookie().dashboardRemoteIndex;
		
		
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
		this.controller.document.body.className = WebMyth.prefsCookieObject.theme;
		this.controller.document.body.className += " device-"+Mojo.Environment.DeviceInfo.modelNameAscii;
		this.controller.document.body.className += " width-"+Mojo.Environment.DeviceInfo.screenWidth;
		this.controller.document.body.className += " height-"+Mojo.Environment.DeviceInfo.screenHeight;
		
		this.alertNeedScript();
	};

	//Hosts cookie
	if (WebMyth.hostsCookieObject) {		//cookie exist
		//Mojo.Log.info("Hosts cookie is %j",WebMyth.hostsCookieObject);
		//do nothing?
	} else {
		Mojo.Log.info("Missing hosts cookie.  Using default.");
		WebMyth.hostsCookieObject = defaultHostsCookieCurrent(WebMyth.prefsCookieObject.currentFrontend);
		WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	}

	//Backends cookie
	if (WebMyth.backendsCookieObject) {		//cookie exist
		Mojo.Log.info("Backends cookie is %j",WebMyth.backendsCookieObject);
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
	
	
	//Start dashboard remote
	//this.startDashboard();
	
	this.startBackendGathering();
	
};

WelcomeAssistant.prototype.activate = function(event) {
	//asdf
	
	if(WebMyth.prefsCookieObject.webserverName == '') {
		$('masterIpAddress-title').innerHTML = "Please configure app preferences";
	} else {
	
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
	
	}
	
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Vibrate event
	Mojo.Event.listen(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
	
};

WelcomeAssistant.prototype.deactivate = function(event) {

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Vibrate event
	Mojo.Event.stopListening(document, 'shakestart', this.handleShakestart.bindAsEventListener(this));
};

WelcomeAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
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

WelcomeAssistant.prototype.handleShakestart = function(event) {
	Mojo.Log.info("Start Shaking");
	Event.stop(event);
	
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
	
	if(WebMyth.prefsCookieObject.masterBackendIp != masterIpAddress) {
	
		Mojo.Log.info("Master backend IP changed - updating");
		
		WebMyth.prefsCookieObject.masterBackendIp = masterIpAddress;
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
		
		$('masterIpAddress-title').innerHTML = masterIpAddress;
		
		this.startBackendGathering();
		
	} else {
		Mojo.Log.info("Master backend IP has not changed");
	}
}

WelcomeAssistant.prototype.startBackendGathering = function() {
	
	//Update backends from XML
	Mojo.Log.info('Starting hosts data gathering from XMl backend');
		
	var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetHosts";

	Mojo.Log.info("XML hosts URL is: "+requestUrl);
			
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
	Mojo.Log.info('Starting backend IPs data gathering from XML backend');
	
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
