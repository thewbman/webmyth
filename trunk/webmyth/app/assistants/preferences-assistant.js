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
	   
	   
		//useWebmythScript;
		//showUpcoming;
		//showVideos;
	   
	   
}

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);	
		
		
	//Widgets
	
	//Server address
	this.webserverTextModel = {
             value: "",
             disabled: false
    };
	this.controller.setupWidget("webserverTextFieldId",
        {
            hintText: $L(""),
            multiline: true,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.webserverTextModel
    ); 
	//Username
	this.usernameTextModel = {
             value: "",
             disabled: false
    };
	this.controller.setupWidget("usernameFieldId",
        {
            hintText: $L("  Leave blank"),
            multiline: false,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.usernameTextModel
    );				
	//Password
	this.passwordTextModel = {
             value: "",
             disabled: false
    };
	this.controller.setupWidget("passwordFieldId",
        {
            hintText: $L("  if unsecured"),
            multiline: false,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.passwordTextModel
    );	
	//Download/Stream to device
	this.allowDownloadStreamToggleModel = {
             value: false
    };
	this.controller.setupWidget("allowDownloadStreamToggleId",
        {
			label: $L("Stream to Device"),
            modelProperty: "value"
         },
         this.allowDownloadStreamToggleModel
    );	
	this.controller.listen("allowDownloadStreamToggleId", Mojo.Event.propertyChange, this.streamChanged.bindAsEventListener(this));
/*	
	//Use script file
	this.useWebmythScriptToggleModel = {
             value: false
    };
	this.controller.setupWidget("useWebmythScriptToggleId",
        {
			label: $L("Use script file"),
            modelProperty: "value"
         },
         this.useWebmythScriptToggleModel
    );
	this.controller.listen('useWebmythScriptToggleId', Mojo.Event.propertyChange, this.useWebmythScriptChanged.bindAsEventListener(this));
*/
	//Script filename
	this.webmythPythonFileTextModel = {
             value: "/cgi-bin/webmyth.py",
             disabled: false
    };
	this.controller.setupWidget("webmythPythonFieldId",
        {
            hintText: $L("/cgi-bin/webmyth.py"),
            multiline: false,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.webmythPythonFileTextModel
    ); 						
	//Show upcoming recordings
	this.showUpcomingToggleModel = {
             value: false
    };
	this.controller.setupWidget("showUpcomingToggleId",
        {
			label: $L("show upcoming"),
            modelProperty: "value"
         },
         this.showUpcomingToggleModel
    );		
	
	//Show videos
	this.showVideosToggleModel = {
             value: false
    };
	this.controller.setupWidget("showVideosToggleId",
        {
			label: $L("show videos"),
            modelProperty: "value"
         },
         this.showVideosToggleModel
    );


	
	
	
	//Manual master backend
	this.manualMasterBackendToggleModel = {
             value: false
    };
	this.controller.setupWidget("manualMasterBackendToggleId",
        {
			label: $L("Manual Master Backend"),
            modelProperty: "value"
         },
         this.manualMasterBackendToggleModel
    );
	this.controller.listen('manualMasterBackendToggleId', Mojo.Event.propertyChange, this.manualMasterBackendChanged.bindAsEventListener(this));
	//Master backend IP - display or edit
	this.masterBackendTextModel = {
             value: "",
             disabled: true
    };
	this.controller.setupWidget("masterBackendTextFieldId",
        {
            hintText: $L(""),
            multiline: true,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.masterBackendTextModel
    ); 
	
	
/*	
	//Theme
	this.themeModel = {
			value: WebMyth.prefsCookieObject.theme,
            disabled: false
	};
	this.controller.setupWidget('theme',
		{
			label: $L("Theme"),
			choices:[
				{label:$L("Palm Default"),      value:'palm-default'},
				{label:$L("Palm Dark"),         value:'palm-dark'}
			]//,
			//modelProperty: 'theme'
		},
		this.themeModel
	);
	this.controller.listen('theme', Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
*/
	//Channel Icons in upcoming
	this.upcomingChannelIconsToggleModel = {
             value: false
    };
	this.controller.setupWidget("upcomingChannelIconsToggleId",
        {
			label: $L("Show Channel Icons on Upcoming"),
            modelProperty: "value"
         },
         this.upcomingChannelIconsToggleModel
    ); 
	//Remote header action
	this.remoteHeaderActionModel = {
			value: WebMyth.prefsCookieObject.remoteHeaderAction,
            disabled: false
	};
	this.controller.setupWidget('remoteHeaderAction',
		{
			label: $L("Remote Header"),
			choices:[
				{label:$L("Pause"),      value:'Pause'},
				{label:$L("Mute"),         value:'Mute'},
				{label:$L("Nothing"),         value:'Nothing'}
			]
		},
		this.remoteHeaderActionModel
	);
	//Remote keys vibrate
	this.vibrateToggleModel = {
             value: true
    };
	this.controller.setupWidget("vibrateToggleId",
        {
			label: $L("Vibrate remote"),
            modelProperty: "value"
         },
         this.vibrateToggleModel
    ); 
	//Remote scenes run in fullscreen
	this.remoteFullscreenToggleModel = {
             value: false
    };
	this.controller.setupWidget("remoteFullscreenToggleId",
        {
			label: $L("Fullscreen remote"),
            modelProperty: "value"
         },
         this.remoteFullscreenToggleModel
    ); 
	//Remote starts when playback starts
	this.playJumpRemoteToggleModel = {
             value: false
    };
	this.controller.setupWidget("playJumpRemoteToggleId",
        {
			label: $L("playJumpRemote"),
            modelProperty: "value"
         },
         this.playJumpRemoteToggleModel
    ); 
	//Remote starts when guide livetv starts
	this.guideJumpRemoteToggleModel = {
             value: false
    };
	this.controller.setupWidget("guideJumpRemoteToggleId",
        {
			label: $L("guideJumpRemote"),
            modelProperty: "value"
         },
         this.guideJumpRemoteToggleModel
    ); 
	//Dashboard remote when app deactivates
	this.dashboardRemoteToggleModel = {
             value: false
    };
	this.controller.setupWidget("dashboardRemoteToggleId",
        {
			label: $L("dashboardRemote"),
            modelProperty: "value"
         },
         this.dashboardRemoteToggleModel
    ); 
	
	
	
	//Remote scene - navigation
	this.remoteNavigationToggleModel = {
             value: true
    };
	this.controller.setupWidget("remoteNavigationToggleId",
        {
            modelProperty: "value"
         },
         this.remoteNavigationToggleModel
    ); 
	//Remote scene - playback
	this.remotePlaybackToggleModel = {
             value: true
    };
	this.controller.setupWidget("remotePlaybackToggleId",
        {
            modelProperty: "value"
         },
         this.remotePlaybackToggleModel
    ); 
	//Remote scene - music
	this.remoteMusicToggleModel = {
             value: true
    };
	this.controller.setupWidget("remoteMusicToggleId",
        {
            modelProperty: "value"
         },
         this.remoteMusicToggleModel
    ); 
	//Remote scene - flick
	this.remoteFlickToggleModel = {
             value: true
    };
	this.controller.setupWidget("remoteFlickToggleId",
        {
            modelProperty: "value"
         },
         this.remoteFlickToggleModel
    ); 
	//Remote scene - master
	this.remoteMasterToggleModel = {
             value: true
    };
	this.controller.setupWidget("remoteMasterToggleId",
        {
            modelProperty: "value"
         },
         this.remoteMasterToggleModel
    ); 
	//Remote scene - numberpad
	this.remoteNumberpadToggleModel = {
             value: true
    };
	this.controller.setupWidget("remoteNumberpadToggleId",
        {
            modelProperty: "value"
         },
         this.remoteNumberpadToggleModel
    ); 
	

	//Metrix
	this.metrixToggleModel = {
             value: true
    };
	this.controller.setupWidget("metrixToggleId",
        {
            modelProperty: "value"
         },
         this.metrixToggleModel
    ); 
	
};

PreferencesAssistant.prototype.activate = function(event) {

		if (WebMyth.prefsCookieObject) {
			
			Mojo.Log.error("initial cookie is %j", WebMyth.prefsCookieObject);
			
			//Update settings from cookie
			this.webserverTextModel.value = WebMyth.prefsCookieObject.webserverName;
			this.controller.modelChanged(this.webserverTextModel);
			
			this.usernameTextModel.value = WebMyth.prefsCookieObject.webserverUsername;
			this.controller.modelChanged(this.usernameTextModel);
			
			this.passwordTextModel.value = WebMyth.prefsCookieObject.webserverPassword;
			this.controller.modelChanged(this.passwordTextModel);
			
			this.allowDownloadStreamToggleModel.value = WebMyth.prefsCookieObject.allowRecordedDownloads;
			this.controller.modelChanged(this.allowDownloadStreamToggleModel);
			
			//this.useWebmythScriptToggleModel.value = WebMyth.prefsCookieObject.useWebmythScript;
			//this.controller.modelChanged(this.useWebmythScriptToggleModel);
			
			this.webmythPythonFileTextModel.value = WebMyth.prefsCookieObject.webmythPythonFile;
			this.controller.modelChanged(this.webmythPythonFileTextModel);
			
			this.showUpcomingToggleModel.value = WebMyth.prefsCookieObject.showUpcoming;
			this.controller.modelChanged(this.showUpcomingToggleModel);
			
			this.showVideosToggleModel.value = WebMyth.prefsCookieObject.showVideos;
			this.controller.modelChanged(this.showVideosToggleModel);
			
			
			
			this.manualMasterBackendToggleModel.value = WebMyth.prefsCookieObject.manualMasterBackend;
			this.controller.modelChanged(this.manualMasterBackendToggleModel);
			
			this.masterBackendTextModel.value = WebMyth.prefsCookieObject.masterBackendIp;
			this.masterBackendTextModel.disabled = !WebMyth.prefsCookieObject.manualMasterBackend;
			this.controller.modelChanged(this.masterBackendTextModel);
			
			
			
			this.upcomingChannelIconsToggleModel.value = WebMyth.prefsCookieObject.showUpcomingChannelIcons;
			this.controller.modelChanged(this.upcomingChannelIconsToggleModel);
			
			this.vibrateToggleModel.value = WebMyth.prefsCookieObject.remoteVibrate;
			this.controller.modelChanged(this.vibrateToggleModel);
			
			this.remoteFullscreenToggleModel.value = WebMyth.prefsCookieObject.remoteFullscreen;
			this.controller.modelChanged(this.remoteFullscreenToggleModel);
			
			this.playJumpRemoteToggleModel.value = WebMyth.prefsCookieObject.playJumpRemote;
			this.controller.modelChanged(this.playJumpRemoteToggleModel);
			
			this.guideJumpRemoteToggleModel.value = WebMyth.prefsCookieObject.guideJumpRemote;
			this.controller.modelChanged(this.guideJumpRemoteToggleModel);
			
			this.dashboardRemoteToggleModel.value = WebMyth.prefsCookieObject.dashboardRemote;
			this.controller.modelChanged(this.dashboardRemoteToggleModel);
			
			
			
			this.metrixToggleModel.value = WebMyth.prefsCookieObject.allowMetrix;
			this.controller.modelChanged(this.metrixToggleModel);
			
			
		} 
		
		//Active remote scenes
		if(WebMyth.remoteCookieObject) {
			
			this.remoteNavigationToggleModel.value = WebMyth.remoteCookieObject[0].enabled;
			this.controller.modelChanged(this.remoteNavigationToggleModel);
			
			this.remotePlaybackToggleModel.value = WebMyth.remoteCookieObject[1].enabled;
			this.controller.modelChanged(this.remotePlaybackToggleModel);
			
			this.remoteMusicToggleModel.value = WebMyth.remoteCookieObject[2].enabled;
			this.controller.modelChanged(this.remoteMusicToggleModel);
			
			this.remoteFlickToggleModel.value = WebMyth.remoteCookieObject[3].enabled;
			this.controller.modelChanged(this.remoteFlickToggleModel);
			
			this.remoteMasterToggleModel.value = WebMyth.remoteCookieObject[4].enabled;
			this.controller.modelChanged(this.remoteMasterToggleModel);
			
			this.remoteNumberpadToggleModel.value = WebMyth.remoteCookieObject[5].enabled;
			this.controller.modelChanged(this.remoteNumberpadToggleModel);
			
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

PreferencesAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.back) {
		this.checkSettings();
		Event.stop(event);
  }
  
};




PreferencesAssistant.prototype.manualMasterBackendChanged = function(event) {

	Mojo.Log.info("manual backend settings changed to "+this.manualMasterBackendToggleModel.value);
	
	this.masterBackendTextModel.disabled = !this.manualMasterBackendToggleModel.value;

	this.controller.modelChanged(this.masterBackendTextModel);
	
};

PreferencesAssistant.prototype.useWebmythScriptChanged = function(event) {

	var scriptMessage = 'Currently the app requires the webmyth.py script available on the app homepage.';
	
	if(this.allowDownloadStreamToggleModel.value) {
		
			this.controller.showAlertDialog({
				onChoose: function(value) {if (value=="instructions") {
					//Mojo.Log.error("appPath:" + Mojo.appPath);
					} 
				},
				title: "Script",
				message:  scriptMessage, 
				choices: [
                    {label: "OK", value: "ok"}
					],
				allowHTMLMessage: true
			});	
			
	};
	
};

PreferencesAssistant.prototype.streamChanged = function(event) {
	Mojo.Log.info("Stream/download settings changed to "+this.allowDownloadStreamToggleModel.value);
	
	var streamMessage = 'The ability to download and/or stream a recording to your phone is still a work in progress and will take some extra work to setup. <hr />';
	streamMessage += 'You will need to first transcode your recordings to a format playable on the phone. ';
	streamMessage += 'Then you can stream the recording to your phone using the mythweb stream interface.<hr />';
	streamMessage += 'Please see the <a href="http://code.google.com/p/webmyth/wiki/DownloadAndStreaming">homepage</a> to setup.';
	
	if(this.allowDownloadStreamToggleModel.value) {
		
			this.controller.showAlertDialog({
				onChoose: function(value) {if (value=="instructions") {
					//Mojo.Log.error("appPath:" + Mojo.appPath);
					} 
				},
				title: "Streaming/Downloading",
				message:  streamMessage, 
				choices: [
                    {label: "OK", value: "ok"}
					],
				allowHTMLMessage: true
			});	
			
	};	
	
};

PreferencesAssistant.prototype.themeChanged = function(event) {

	this.controller.document.body.className = event.value;
	
};

PreferencesAssistant.prototype.checkSettings = function() {
	
	Mojo.Log.error("starting check of settings");
	
	var saveOK = true, remoteError = false, currentRemoteScene = "";
	
	if((this.webserverTextModel.value.substring(0,4) == 'http') || (this.webserverTextModel.value.substring(0,4) == 'Http')) {
		
        this.controller.showAlertDialog({
                onChoose: function(value) {},
				title: "WebMyth - v" + Mojo.Controller.appInfo.version,
                message: "Do not put the 'http' at the beginning or your webserver",
                choices: [
					{label: "OK", value: false}
					],
                allowHTMLMessage: true
            });
		
		saveOK = false;
	} else {

	Mojo.Log.error("now checking remote scene");
	
	switch(WebMyth.prefsCookieObject.currentRemoteScene) {
		case 'navigation':
			if(this.remoteNavigationToggleModel.value == false) remoteError = true;
			currentRemoteScene = "Navigation";
		break;
		case 'playback':
			if(this.remotePlaybackToggleModel.value == false) remoteError = true;
			currentRemoteScene = "Playback";
		break;
		case 'music':
			if(this.remoteMusicToggleModel.value == false) remoteError = true;
			currentRemoteScene = "Music";
		break;
		case 'flick':
			if(this.remoteFlickToggleModel.value == false) remoteError = true;
			currentRemoteScene = "Flick";
		break;
		case 'masterRemote':
			if(this.remoteMasterToggleModel.value == false) remoteError = true;
			currentRemoteScene = "Master";
		break;
		case 'numberpad':
			if(this.remoteNumberpadToggleModel.value == false) remoteError = true;
			currentRemoteScene = "Numbers";
		break;
		
		default:
			Mojo.Log.error("current remote scene is: "+WebMyth.prefsCookieObject.currentRemoteScene);
		break;
	
	}
	
	//Mojo.Log.error("remote error is "+remoteError+" and current remote scene is: "+WebMyth.prefsCookieObject.currentRemoteScene);
	
	if(remoteError) {
		
        this.controller.showAlertDialog({
                onChoose: function(value) {},
				title: "WebMyth - v" + Mojo.Controller.appInfo.version,
                message: "You cannot disable the current remote scene ("+currentRemoteScene+").",
                choices: [
					{label: "OK", value: false}
					],
                allowHTMLMessage: true
            });
			
		saveOK = false;
			
	} else {
	
	if(saveOK) {

		Mojo.Log.info("New webserverName is %s", this.webserverTextModel.value);
		Mojo.Log.info("New python file is %s", this.webmythPythonFileTextModel.value);
		Mojo.Log.info("Metrix value is %s", this.metrixToggleModel.value);
		Mojo.Log.info("Remote vibrate value is %s", this.vibrateToggleModel.value);
		Mojo.Log.info("Remote fullscreen value is %s", this.remoteFullscreenToggleModel.value);
		//Mojo.Log.info("Theme value is %s", this.themeModel.value);

		if (WebMyth.prefsCookieObject) {
			//Nothing
		} else {
			//Create default cookie if doesnt exist
			var newPrefsCookieObject = defaultCookie();
			WebMyth.prefsCookieObject = newPrefsCookieObject;
		}
	
		WebMyth.prefsCookieObject.webserverName = this.webserverTextModel.value;
		WebMyth.prefsCookieObject.webserverUsername = this.usernameTextModel.value;
		WebMyth.prefsCookieObject.webserverPassword = this.passwordTextModel.value;
		WebMyth.prefsCookieObject.allowRecordedDownloads = this.allowDownloadStreamToggleModel.value;
		//WebMyth.prefsCookieObject.useWebmythScript = this.useWebmythScriptToggleModel.value;
		WebMyth.prefsCookieObject.webmythPythonFile = this.webmythPythonFileTextModel.value;
		WebMyth.prefsCookieObject.showUpcoming = this.showUpcomingToggleModel.value;
		WebMyth.prefsCookieObject.showVideos = this.showVideosToggleModel.value;
		
		
		WebMyth.prefsCookieObject.manualMasterBackend = this.manualMasterBackendToggleModel.value;
		WebMyth.prefsCookieObject.masterBackendIp = this.masterBackendTextModel.value;
		
		
		//WebMyth.prefsCookieObject.theme = this.themeModel.value;
		WebMyth.prefsCookieObject.showUpcomingChannelIcons = this.upcomingChannelIconsToggleModel.value;
		WebMyth.prefsCookieObject.remoteHeaderAction = this.remoteHeaderActionModel.value;
		WebMyth.prefsCookieObject.remoteVibrate = this.vibrateToggleModel.value;
		WebMyth.prefsCookieObject.remoteFullscreen = this.remoteFullscreenToggleModel.value;
		WebMyth.prefsCookieObject.playJumpRemote = this.playJumpRemoteToggleModel.value;
		WebMyth.prefsCookieObject.guideJumpRemote = this.guideJumpRemoteToggleModel.value;
		WebMyth.prefsCookieObject.dashboardRemote = this.dashboardRemoteToggleModel.value;
		
		
		WebMyth.prefsCookieObject.allowMetrix = this.metrixToggleModel.value;
		
		
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
		
		
		//Mojo.Log.info("Prefs cookie is %j",WebMyth.prefsCookieObject);
	
	
		//Enabled remote scenes
		WebMyth.remoteCookieObject[0].enabled = this.remoteNavigationToggleModel.value;
		WebMyth.remoteCookieObject[1].enabled = this.remotePlaybackToggleModel.value;
		WebMyth.remoteCookieObject[2].enabled = this.remoteMusicToggleModel.value;
		WebMyth.remoteCookieObject[3].enabled = this.remoteFlickToggleModel.value;
		WebMyth.remoteCookieObject[4].enabled = this.remoteMasterToggleModel.value;
		WebMyth.remoteCookieObject[5].enabled = this.remoteNumberpadToggleModel.value;
		
	
		WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);
		
		Mojo.Log.error("new cookie is %j", WebMyth.prefsCookieObject);

		Mojo.Controller.stageController.popScene();
	
	}
	
	}

	}
	
};
