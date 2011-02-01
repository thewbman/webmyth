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
	   
}

PreferencesAssistant.prototype.setup = function() {
		
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);	
		
		
	//Widgets
	
	//Use C++ plugin selector
	this.usePluginSelectorModel = {
			value: 0,
            disabled: false
	};
	this.controller.setupWidget('usePluginSelector',
		{
			label: $L("Use Script"),
			choices:[
				{label:$L("Always"),      value:0},
				{label:$L("Non-remote"),         value:1},
				{label:$L("Never"),         value:2}
			]
		},
		this.usePluginSelectorModel
	);
	this.controller.listen("usePluginSelector", Mojo.Event.propertyChange, this.usePluginSelectorChanged.bindAsEventListener(this));
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
	
	//Show music
	this.showMusicToggleModel = {
             value: false
    };
	this.controller.setupWidget("showMusicToggleId",
        {
			label: $L("show music"),
            modelProperty: "value"
         },
         this.showMusicToggleModel
    );
	
	//Show backend log
	this.showLogToggleModel = {
             value: false
    };
	this.controller.setupWidget("showLogToggleId",
        {
			label: $L("show log"),
            modelProperty: "value"
         },
         this.showLogToggleModel
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


	
	
	
	//Manual database
	this.manualDatabaseToggleModel = {
             value: false
    };
	this.controller.setupWidget("manualDatabaseToggleId",
        {
			label: $L("Manual Database"),
            modelProperty: "value"
         },
         this.manualDatabaseToggleModel
    );
	this.controller.listen('manualDatabaseToggleId', Mojo.Event.propertyChange, this.manualDatabaseChanged.bindAsEventListener(this));
	//Database host IP - display or edit
	this.databaseHostTextModel = {
             value: "",
             disabled: true
    };
	this.controller.setupWidget("databaseHostTextFieldId",
        {
            hintText: $L(""),
            multiline: true,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.databaseHostTextModel
    ); 	
	//Database port
	this.databasePortTextModel = {
             value: "",
             disabled: true
    };
	this.controller.setupWidget("databasePortTextFieldId",
        {
            hintText: $L(""),
            multiline: true,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.databasePortTextModel
    );
	//Database username
	this.databaseUsernameTextModel = {
             value: "",
             disabled: true
    };
	this.controller.setupWidget("databaseUsernameTextFieldId",
        {
            hintText: $L(""),
            multiline: true,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.databaseUsernameTextModel
    );
	//Database password
	this.databasePasswordTextModel = {
             value: "",
             disabled: true
    };
	this.controller.setupWidget("databasePasswordTextFieldId",
        {
            hintText: $L(""),
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.databasePasswordTextModel
    );
	//Database name
	this.databaseNameTextModel = {
             value: "",
             disabled: true
    };
	this.controller.setupWidget("databaseNameTextFieldId",
        {
            hintText: $L(""),
            multiline: true,
            enterSubmits: false,
            focus: false,
			textCase: Mojo.Widget.steModeLowerCase
         },
         this.databaseNameTextModel
    );
	
	
	

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
	//Video images list
	this.videoImagesToggleModel = {
             value: false
    };
	this.controller.setupWidget("videoImagesToggleId",
        {
			label: $L("Show Video Images (List)"),
            modelProperty: "value"
         },
         this.videoImagesToggleModel
    ); 
	//Video images details
	this.showVideoDetailsImageToggleModel = {
             value: false
    };
	this.controller.setupWidget("showVideoDetailsImageToggleId",
        {
			label: $L("Show Video Images (Details)"),
            modelProperty: "value"
         },
         this.showVideoDetailsImageToggleModel
    ); 
	//showVideoDetailsImage
	//Use script for screenshots
	this.forceScriptScreenshotsToggleModel = {
             value: false
    };
	this.controller.setupWidget("forceScriptScreenshotsToggleId",
        {
			label: $L("Use script to display screenshots"),
            modelProperty: "value"
         },
         this.forceScriptScreenshotsToggleModel
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

	$('scene-title').innerText = $L('Preferences');
	$('webserver-group-title').innerText = $L('Webserver');
		$('webserver-label').innerText = $L('Address');
		$('username-label').innerText = $L('Username');
		$('password-label').innerText = $L('Password');
		$('stream-label').innerText = $L('Stream to Device');
		$('script-label').innerText = $L('Script');
		$('showUpcoming-label').innerText = $L('Show Upcoming');
		$('showVideos-label').innerText = $L('Show Videos');
		$('showMusic-label').innerText = $L('Show Music');
		$('showLog-label').innerText = $L('Show Log');
	$('backend-group-title').innerText = $L('Master Backend');
		$('manualBackend-label').innerText = $L('Manual Backend IP');
		$('backendAddress-label').innerText = $L('Address');
	$('database-group-title').innerText = $L('MySQL Database');
		$('manualDatabase-label').innerText = $L('Manual Settings');
		$('databaseHost-label').innerText = $L('Address');
		$('databasePort-label').innerText = $L('Port');
		$('databaseUsername-label').innerText = $L('Username');
		$('databasePassword-label').innerText = $L('Password');
		$('databaseName-label').innerText = $L('Database');
	$('images-group-title').innerText = $L('Images');
		$('showChannelIcons-label').innerText = $L('Show Channel Icons');
		$('showVideoImagesList-label').innerText = $L('Show Video Images (List)');
		$('showVideoImagesDetails-label').innerText = $L('Show Video Images (Details)');
		$('scriptScreenshots-label').innerText = $L('Use script to provide screenshots');
	$('remotePreferences-group-title').innerText = $L('Remote Preferences');
		$('remoteVibrates-label').innerText = $L('Remote Vibrates');
		$('remoteFullscreen-label').innerText = $L('Remote Fullscreen');
		$('startRemotePlayback-label').innerText = $L('Start Remote After Playback Start');
		$('startRemoteLivetv-label').innerText = $L('Start Remote After LiveTV Start');
		$('dashboardRemote-label').innerText = $L('Dashboard Remote');
	$('remoteScenes-group-title').innerText = $L('Remote Scenes');
		$('navigation-label').innerText = $L('Navigation');
		$('playback-label').innerText = $L('Playback');
		$('music-label').innerText = $L('Music');
		$('flick-label').innerText = $L('Flick');
		$('master-label').innerText = $L('Master');
		$('numbers-label').innerText = $L('Numbers');

	
		if (WebMyth.prefsCookieObject) {
			
			//Mojo.Log.error("initial cookie is %j", WebMyth.prefsCookieObject);
			
			//Update settings from cookie
			this.usePluginSelectorModel.value = WebMyth.prefsCookieObject.usePlugin;
			this.controller.modelChanged(this.usePluginSelectorModel);
			
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
			
			this.showMusicToggleModel.value = WebMyth.prefsCookieObject.showMusic;
			this.controller.modelChanged(this.showMusicToggleModel);
			
			this.showLogToggleModel.value = WebMyth.prefsCookieObject.showLog;
			this.controller.modelChanged(this.showLogToggleModel);
			
			
			
			this.manualMasterBackendToggleModel.value = WebMyth.prefsCookieObject.manualMasterBackend;
			this.controller.modelChanged(this.manualMasterBackendToggleModel);
			
			this.masterBackendTextModel.value = WebMyth.prefsCookieObject.masterBackendIp;
			this.masterBackendTextModel.disabled = !WebMyth.prefsCookieObject.manualMasterBackend;
			this.controller.modelChanged(this.masterBackendTextModel);
			
			
			
			this.manualDatabaseToggleModel.value = WebMyth.prefsCookieObject.manualDatabase;
			this.controller.modelChanged(this.manualDatabaseToggleModel);
			
			this.databaseHostTextModel.value = WebMyth.prefsCookieObject.databaseHost;
			this.databaseHostTextModel.disabled = !WebMyth.prefsCookieObject.manualDatabase;
			this.controller.modelChanged(this.databaseHostTextModel);
			
			this.databasePortTextModel.value = WebMyth.prefsCookieObject.databasePort;
			this.databasePortTextModel.disabled = !WebMyth.prefsCookieObject.manualDatabase;
			this.controller.modelChanged(this.databasePortTextModel);
			
			this.databaseUsernameTextModel.value = WebMyth.prefsCookieObject.databaseUsername;
			this.databaseUsernameTextModel.disabled = !WebMyth.prefsCookieObject.manualDatabase;
			this.controller.modelChanged(this.databaseUsernameTextModel);
			
			this.databasePasswordTextModel.value = WebMyth.prefsCookieObject.databasePassword;
			this.databasePasswordTextModel.disabled = !WebMyth.prefsCookieObject.manualDatabase;
			this.controller.modelChanged(this.databasePasswordTextModel);
			
			this.databaseNameTextModel.value = WebMyth.prefsCookieObject.databaseName;
			this.databaseNameTextModel.disabled = !WebMyth.prefsCookieObject.manualDatabase;
			this.controller.modelChanged(this.databaseNameTextModel);
			
			
			
			this.upcomingChannelIconsToggleModel.value = WebMyth.prefsCookieObject.showUpcomingChannelIcons;
			this.controller.modelChanged(this.upcomingChannelIconsToggleModel);
			
			this.videoImagesToggleModel.value = WebMyth.prefsCookieObject.showVideoImages;
			this.controller.modelChanged(this.videoImagesToggleModel);
			
			this.showVideoDetailsImageToggleModel.value = WebMyth.prefsCookieObject.showVideoDetailsImage;
			this.controller.modelChanged(this.showVideoDetailsImageToggleModel);
			
			this.forceScriptScreenshotsToggleModel.value = WebMyth.prefsCookieObject.forceScriptScreenshots;
			this.controller.modelChanged(this.forceScriptScreenshotsToggleModel);
			
			
			
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
	
	this.controller.sceneScroller.mojo.revealTop();
	
};

PreferencesAssistant.prototype.deactivate = function(event) {

};

PreferencesAssistant.prototype.cleanup = function(event) {

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
	
	if(!this.manualMasterBackendToggleModel.value) {
		this.masterBackendTextModel.value = "-";
	}
	
	this.controller.modelChanged(this.masterBackendTextModel);
	
};

PreferencesAssistant.prototype.manualDatabaseChanged = function(event) {

	Mojo.Log.error("Manual database settings changed to "+this.manualDatabaseToggleModel.value);
	
	
	this.databaseHostTextModel.disabled = !this.manualDatabaseToggleModel.value;
	this.databasePortTextModel.disabled = !this.manualDatabaseToggleModel.value;
	this.databaseUsernameTextModel.disabled = !this.manualDatabaseToggleModel.value;
	this.databasePasswordTextModel.disabled = !this.manualDatabaseToggleModel.value;
	this.databaseNameTextModel.disabled = !this.manualDatabaseToggleModel.value;
	
	if(!this.manualDatabaseToggleModel.value) {
		this.databaseHostTextModel.value = "-";
	}
	
	
	this.controller.modelChanged(this.databaseHostTextModel);
	this.controller.modelChanged(this.databasePortTextModel);
	this.controller.modelChanged(this.databaseUsernameTextModel);
	this.controller.modelChanged(this.databasePasswordTextModel);
	this.controller.modelChanged(this.databaseNameTextModel);
	
};

PreferencesAssistant.prototype.usePluginSelectorChanged = function(event) {
	
	this.usePluginSelectorModel.value = 0;
	this.controller.modelChanged(this.usePluginSelectorModel);
			
	var scriptMessage = "The version of WebMyth available in the Palm App Catalog requires the server-side script."
	scriptMessage += " You can get a beta version of the app by downloading it from the app homepage.";
	
	
	this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value=="ok") {
				//do nothing
			} else if  (value=="download") {
				
				var url = "http://code.google.com/p/webmyth/downloads/list";
							
				this.controller.serviceRequest("palm://com.palm.applicationManager", {
					method: "open",
					parameters:  {
						id: 'com.palm.app.browser',
						params: {
							target: url
						}
					}
				}); 
				
			}
		},
		title: "WebMyth Script",
		message:  scriptMessage, 
		choices: [
                  {label: "OK", value: "ok"},
                  {label: "Download Site", value: "download"}
			],
		allowHTMLMessage: true
	});	
	
}

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

PreferencesAssistant.prototype.checkSettings = function() {
	
	//Mojo.Log.error("starting check of settings");
	
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

	//Mojo.Log.error("now checking remote scene");
	
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

		//Mojo.Log.info("New webserverName is %s", this.webserverTextModel.value);
		//Mojo.Log.info("New python file is %s", this.webmythPythonFileTextModel.value);
		//Mojo.Log.info("Metrix value is %s", this.metrixToggleModel.value);
		//Mojo.Log.info("Remote vibrate value is %s", this.vibrateToggleModel.value);
		//Mojo.Log.info("Remote fullscreen value is %s", this.remoteFullscreenToggleModel.value);
		//Mojo.Log.info("Theme value is %s", this.themeModel.value);

		if (WebMyth.prefsCookieObject) {
			//Nothing
		} else {
			//Create default cookie if doesnt exist
			var newPrefsCookieObject = defaultCookie();
			WebMyth.prefsCookieObject = newPrefsCookieObject;
		}
	
		WebMyth.prefsCookieObject.usePlugin = this.usePluginSelectorModel.value;
		WebMyth.prefsCookieObject.webserverName = this.webserverTextModel.value;
		WebMyth.prefsCookieObject.webserverUsername = this.usernameTextModel.value;
		WebMyth.prefsCookieObject.webserverPassword = this.passwordTextModel.value;
		WebMyth.prefsCookieObject.allowRecordedDownloads = this.allowDownloadStreamToggleModel.value;
		//WebMyth.prefsCookieObject.useWebmythScript = this.useWebmythScriptToggleModel.value;
		WebMyth.prefsCookieObject.webmythPythonFile = this.webmythPythonFileTextModel.value;
		WebMyth.prefsCookieObject.showUpcoming = this.showUpcomingToggleModel.value;
		WebMyth.prefsCookieObject.showVideos = this.showVideosToggleModel.value;
		WebMyth.prefsCookieObject.showMusic = this.showMusicToggleModel.value;
		WebMyth.prefsCookieObject.showLog = this.showLogToggleModel.value;
		
		
		WebMyth.prefsCookieObject.manualMasterBackend = this.manualMasterBackendToggleModel.value;
		WebMyth.prefsCookieObject.masterBackendIp = this.masterBackendTextModel.value;
		
		
		WebMyth.prefsCookieObject.manualDatabase = this.manualDatabaseToggleModel.value;
		WebMyth.prefsCookieObject.databaseHost = this.databaseHostTextModel.value;
		WebMyth.prefsCookieObject.databasePort = this.databasePortTextModel.value;
		WebMyth.prefsCookieObject.databaseUsername = this.databaseUsernameTextModel.value;
		WebMyth.prefsCookieObject.databasePassword = this.databasePasswordTextModel.value;
		WebMyth.prefsCookieObject.databaseName = this.databaseNameTextModel.value;
		
		
		//WebMyth.prefsCookieObject.theme = this.themeModel.value;
		WebMyth.prefsCookieObject.showUpcomingChannelIcons = this.upcomingChannelIconsToggleModel.value;
		WebMyth.prefsCookieObject.showVideoImages = this.videoImagesToggleModel.value;
		WebMyth.prefsCookieObject.showVideoDetailsImage = this.showVideoDetailsImageToggleModel.value;
		WebMyth.prefsCookieObject.forceScriptScreenshots = this.forceScriptScreenshotsToggleModel.value;
		
		
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
		
		//Mojo.Log.error("new cookie is %j", WebMyth.prefsCookieObject);
		
		//Set plugin values from setting
		if(WebMyth.prefsCookieObject.usePlugin == 2) {
			WebMyth.usePlugin = true;
			WebMyth.usePluginFrontend = true;
		} else if(WebMyth.prefsCookieObject.usePlugin == 1) {
			WebMyth.usePlugin = false;
			WebMyth.usePluginFrontend = true;
		} else {
			WebMyth.usePlugin = false;
			WebMyth.usePluginFrontend = false;
		}

		Mojo.Controller.stageController.popScene();
	
	}
	
	}

	}
	
};
