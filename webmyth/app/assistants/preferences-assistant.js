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
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);	
		
		
	//Widgets
	
	//Server configuration
	this.webserverTextModel = {
             value: "",
             disabled: false
    };
	this.controller.setupWidget("webserverTextFieldId",
        {
            hintText: $L(""),
            multiline: true,
            enterSubmits: false,
            focus: false
         },
         this.webserverTextModel
    ); 
	//Script location
	this.webmythPythonFileTextModel = {
             value: "/cgi-bin/webmyth.py",
             disabled: false
    };
	this.controller.setupWidget("webmythPythonFieldId",
        {
            hintText: $L("/cgi-bin/webmyth.py"),
            multiline: false,
            enterSubmits: false,
            focus: false
         },
         this.webmythPythonFileTextModel
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
            focus: false
         },
         this.masterBackendTextModel
    ); 
	
	
	
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
			]//,
			//modelProperty: 'theme'
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
	
	/*
	//Save button
	this.controller.setupWidget("saveWebserverButtonId",
         {},
         {
             label : "SAVE",
             disabled: false
         }
     );
	
	Mojo.Event.listen(this.controller.get("saveWebserverButtonId"),Mojo.Event.tap, this.saveWebserver.bind(this));
	*/
};

PreferencesAssistant.prototype.activate = function(event) {

		if (WebMyth.prefsCookieObject) {	
			Mojo.Log.info("Existing webserverName is %s", WebMyth.prefsCookieObject.webserverName);
			
			//Update webserver address from cookie
			this.webserverTextModel.value = WebMyth.prefsCookieObject.webserverName;
			this.controller.modelChanged(this.webserverTextModel);
			
			this.masterBackendTextModel.value = WebMyth.prefsCookieObject.masterBackendIp;
			this.masterBackendTextModel.disabled = !WebMyth.prefsCookieObject.manualMasterBackend;
			this.controller.modelChanged(this.masterBackendTextModel);
			
			
			//Update filenames on web server if set
			/*
			if ( WebMyth.prefsCookieObject.webserverRemoteFile == null ) {
				Mojo.Log.error("Did not find remote file in cookie");
			} else {
				Mojo.Log.info("Found remote file in cookie '%s'", WebMyth.prefsCookieObject.webserverRemoteFile);
				this.webserverRemoteFileTextModel.value = WebMyth.prefsCookieObject.webserverRemoteFile;
				this.controller.modelChanged(this.webserverRemoteFileTextModel);
			}
			if ( WebMyth.prefsCookieObject.webMysqlFile == null ) {
				Mojo.Log.error("Did not find mysql file in cookie");
			} else {
				Mojo.Log.info("Found mysql file in cookie '%s'", WebMyth.prefsCookieObject.webMysqlFile);
				this.webMysqlFileTextModel.value = WebMyth.prefsCookieObject.webMysqlFile;
				this.controller.modelChanged(this.webMysqlFileTextModel);
			}
			*/
			if ( WebMyth.prefsCookieObject.webmythPythonFile == null ) {
				Mojo.Log.error("Did not find python file in cookie");
			} else {
				Mojo.Log.info("Found python file in cookie '%s'", WebMyth.prefsCookieObject.webmythPythonFile);
				this.webmythPythonFileTextModel.value = WebMyth.prefsCookieObject.webmythPythonFile;
				this.controller.modelChanged(this.webmythPythonFileTextModel);
			}
			
			
			//Update toggles from cookie
			this.manualMasterBackendToggleModel.value = WebMyth.prefsCookieObject.manualMasterBackend;
			this.controller.modelChanged(this.manualMasterBackendToggleModel);
			
			this.upcomingChannelIconsToggleModel.value = WebMyth.prefsCookieObject.showUpcomingChannelIcons;
			this.controller.modelChanged(this.upcomingChannelIconsToggleModel);
			
			this.vibrateToggleModel.value = WebMyth.prefsCookieObject.remoteVibrate;
			this.controller.modelChanged(this.vibrateToggleModel);
			
			this.remoteFullscreenToggleModel.value = WebMyth.prefsCookieObject.remoteFullscreen;
			this.controller.modelChanged(this.remoteFullscreenToggleModel);
			
			this.playJumpRemoteToggleModel.value = WebMyth.prefsCookieObject.playJumpRemote;
			this.controller.modelChanged(this.playJumpRemoteToggleModel);
			
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
	Mojo.Log.error("manual backend settings changed to "+this.manualMasterBackendToggleModel.value);
	
	this.masterBackendTextModel.disabled = !this.manualMasterBackendToggleModel.value;
	/*
	if(this.manualMasterBackendToggleModel.value) {
		this.masterBackendToggleModel.value = false
	} else {
		this.manualMasterBackendToggleModel.value = true
	}
	*/
	this.controller.modelChanged(this.masterBackendTextModel);
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
	
	Mojo.Log.error("remote error is "+remoteError+" and current remote scene is: "+WebMyth.prefsCookieObject.currentRemoteScene);
	
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
		//Mojo.Log.info("New remote file is %s", this.webserverRemoteFileTextModel.value);
		//Mojo.Log.info("New mysql file is %s", this.webMysqlFileTextModel.value);
		Mojo.Log.info("New python file is %s", this.webmythPythonFileTextModel.value);
		Mojo.Log.info("Metrix value is %s", this.metrixToggleModel.value);
		Mojo.Log.info("Remote vibrate value is %s", this.vibrateToggleModel.value);
		Mojo.Log.info("Remote fullscreen value is %s", this.remoteFullscreenToggleModel.value);
		Mojo.Log.info("Theme value is %s", this.themeModel.value);

		if (WebMyth.prefsCookieObject) {
			//Nothing
		} else {
			//Create default cookie if doesnt exist
			var newPrefsCookieObject = defaultCookie();
			WebMyth.prefsCookieObject = newPrefsCookieObject;
		}
	
		WebMyth.prefsCookieObject.webserverName = this.webserverTextModel.value;
		WebMyth.prefsCookieObject.webmythPythonFile = this.webmythPythonFileTextModel.value;
		WebMyth.prefsCookieObject.manualMasterBackend = this.manualMasterBackendToggleModel.value;
		WebMyth.prefsCookieObject.masterBackendIp = this.masterBackendTextModel.value;
		
		WebMyth.prefsCookieObject.theme = this.themeModel.value;
		WebMyth.prefsCookieObject.showUpcomingChannelIcons = this.upcomingChannelIconsToggleModel.value;
		WebMyth.prefsCookieObject.remoteHeaderAction = this.remoteHeaderActionModel.value;
		WebMyth.prefsCookieObject.remoteVibrate = this.vibrateToggleModel.value;
		WebMyth.prefsCookieObject.remoteFullscreen = this.remoteFullscreenToggleModel.value;
		WebMyth.prefsCookieObject.playJumpRemote = this.playJumpRemoteToggleModel.value;
		
		WebMyth.prefsCookieObject.allowMetrix = this.metrixToggleModel.value;
		
		WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
	
		//Enabled remote scenes
		WebMyth.remoteCookieObject[0].enabled = this.remoteNavigationToggleModel.value;
		WebMyth.remoteCookieObject[1].enabled = this.remotePlaybackToggleModel.value;
		WebMyth.remoteCookieObject[2].enabled = this.remoteMusicToggleModel.value;
		WebMyth.remoteCookieObject[3].enabled = this.remoteFlickToggleModel.value;
		WebMyth.remoteCookieObject[4].enabled = this.remoteMasterToggleModel.value;
		WebMyth.remoteCookieObject[5].enabled = this.remoteNumberpadToggleModel.value;
		
	
		WebMyth.remoteCookie.put(WebMyth.remoteCookieObject);

		Mojo.Controller.stageController.popScene();
	
	}
	
	}

	}
	
};
