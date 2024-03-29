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


function MasterRemoteAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MasterRemoteAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Setup remote view menu
	this.remoteViewMenuAttr = { spacerHeight: 0, menuClass: 'no-fade' };	
	this.remoteViewMenuModel = {
		visible: true,
		items: [{
			items: [
				{ icon: 'back', command: 'go-remotePrevious'},
				{ label: $L("Master")+": " + WebMyth.prefsCookieObject.currentFrontend, command: 'do-remoteHeaderAction', width: 200 },
				{ icon: 'forward', command: 'go-remoteNext'}
			]
		}]
	};
	this.controller.setupWidget( Mojo.Menu.viewMenu, this.remoteViewMenuAttr, this.remoteViewMenuModel ); 

	
	
	//Buttons
		//navigation
	this.controller.setupWidget("backButton", {}, { buttonClass:'small-button', label : $L("ESC"), disabled: false } );
	this.controller.setupWidget("upButton", {}, { label : "-", disabled: false } );
	this.controller.setupWidget("leftButton", {}, { label : "-", disabled: false } );
	this.controller.setupWidget("selectButton", {}, { label : $L("OK"), disabled: false } );
	this.controller.setupWidget("rightButton", {}, { label : "-", disabled: false } );
	this.controller.setupWidget("downButton", {}, { label : "-", disabled: false } );
		//general
	this.controller.setupWidget("infoButton", {}, { buttonClass:'small-button', label : $L("Info"), disabled: false } );
	this.controller.setupWidget("menuButton", {}, { buttonClass:'small-button', label : $L("Menu"), disabled: false } );
		//playback
	//this.controller.setupWidget("playButton", {}, { label : "Play", disabled: false } );
	this.controller.setupWidget("pauseButton", {}, { label : "||", disabled: false } );
	//this.controller.setupWidget("fastforwardButton", {}, { label : ">>", disabled: false } );
	//this.controller.setupWidget("rewindButton", {}, { label : "<<", disabled: false } );
	this.controller.setupWidget("skipForwardButton", {}, { label : "-", disabled: false } );
	this.controller.setupWidget("skipBackButton", {}, { label : "-", disabled: false } );
	this.controller.setupWidget("deleteButton", {}, { buttonClass:'small-button', label : $L("Delete"), disabled: false } );
		//volume
	this.controller.setupWidget("volumeUpButton", {}, { label : "-", disabled: false } );
	this.controller.setupWidget("volumeDownButton", {}, { label : "-", disabled: false } );
	this.controller.setupWidget("muteButton", {}, { label : "-", disabled: false } );
		//jump buttons
	this.controller.setupWidget("livetvButton", {}, { buttonClass:'small-button', label : $L("LiveTV"), disabled: false } );
	this.controller.setupWidget("musicButton", {}, { buttonClass:'small-button', label : $L("Music"), disabled: false } );
	this.controller.setupWidget("videosButton", {}, { buttonClass:'small-button', label : $L("Videos"), disabled: false } );
	this.controller.setupWidget("recordedButton", {}, { buttonClass:'small-button', label : $L("Record"), disabled: false } );
	

	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	//Navigation button events
	Mojo.Event.listen(this.controller.get("backButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "escape"));
	Mojo.Event.listen(this.controller.get("upButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "up"));
	Mojo.Event.listen(this.controller.get("downButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "down"));
	Mojo.Event.listen(this.controller.get("leftButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "left"));
	Mojo.Event.listen(this.controller.get("rightButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "right"));
	Mojo.Event.listen(this.controller.get("selectButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "space"));
	Mojo.Event.listen(this.controller.get("infoButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "i"));
	Mojo.Event.listen(this.controller.get("menuButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "m"));
	
	//Volume button events
	Mojo.Event.listen(this.controller.get("volumeUpButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "f11"));
	Mojo.Event.listen(this.controller.get("volumeDownButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "f10"));
	Mojo.Event.listen(this.controller.get("muteButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "f9"));
	
	//Playback button events
	//Mojo.Event.listen(this.controller.get("playButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "p"));
	Mojo.Event.listen(this.controller.get("pauseButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "p"));
	//Mojo.Event.listen(this.controller.get("fastforwardButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "."));
	//Mojo.Event.listen(this.controller.get("rewindButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, ","));
	Mojo.Event.listen(this.controller.get("skipForwardButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "z"));
	Mojo.Event.listen(this.controller.get("skipBackButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "q"));
	Mojo.Event.listen(this.controller.get("deleteButton"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "d"));

	//Jump button events
	Mojo.Event.listen(this.controller.get("livetvButton"),Mojo.Event.tap, this.sendJumpPoint.bind(this, "livetv"));
	Mojo.Event.listen(this.controller.get("musicButton"),Mojo.Event.tap, this.sendJumpPoint.bind(this, "playmusic"));
	Mojo.Event.listen(this.controller.get("videosButton"),Mojo.Event.tap, this.sendJumpPoint.bind(this, "mythvideo"));
	Mojo.Event.listen(this.controller.get("recordedButton"),Mojo.Event.tap, this.sendJumpPoint.bind(this, "playbackrecordings"));
	
};

MasterRemoteAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
	   
	   
	WebMyth.prefsCookieObject.currentRemoteScene = 'masterRemote';
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject); 
	
	//View menu widget
	this.remoteViewMenuModel.items[0].items[1].label = $L("Master")+": " + WebMyth.prefsCookieObject.currentFrontend;  
	this.controller.modelChanged(this.remoteViewMenuModel);
	
	
	this.controller.enableFullScreenMode(WebMyth.prefsCookieObject.remoteFullscreen);
};

MasterRemoteAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MasterRemoteAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

MasterRemoteAssistant.prototype.handleCommand = function(event) {

	if(event.type == Mojo.Event.command) {
		Mojo.Log.error("command is %s",event.command);
		
		switch(event.command) {

			  case 'go-remotePrevious':
					var previousRemoteScene = getPreviousRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
					this.controller.stageController.swapScene({name: previousRemoteScene, disableSceneScroller: true});
			   break;

			  case 'go-remoteNext':
					var nextRemoteScene = getNextRemote(WebMyth.remoteCookieObject, WebMyth.prefsCookieObject.currentRemoteScene);
					this.controller.stageController.swapScene({name: nextRemoteScene, disableSceneScroller: true});
			   break;
	   
			  case 'do-remoteHeaderAction':
					switch(WebMyth.prefsCookieObject.remoteHeaderAction) {
						case 'Pause':
							this.sendTelnetKey('p');
						break;
						case 'Mute':
							this.sendTelnetKey('f9');
						break;
					}
			   break;
		}
	}
  
};

MasterRemoteAssistant.prototype.handleKey = function(event) {

	Mojo.Log.info("MasterRemoteAssistant.prototype.handleKey %o", event.originalEvent.keyCode);
	
	switch(event.originalEvent.keyCode)
	{
		case 8:
			this.sendTelnetKey("escape");
			break;
		case 9:
			this.sendTelnetKey("tab");
			break;
		case 10:
			this.sendTelnetKey("enter");
			break;
		case 32:
			this.sendTelnetKey("space");
			break;
		case 48:
			this.sendTelnetKey("0");
			break;
		case 49:
			this.sendTelnetKey("1");
			break;
		case 50:
			this.sendTelnetKey("2");
			break;
		case 51:
			this.sendTelnetKey("3");
			break;
		case 52:
			this.sendTelnetKey("4");
			break;
		case 53:
			this.sendTelnetKey("5");
			break;
		case 54:
			this.sendTelnetKey("6");
			break;
		case 55:
			this.sendTelnetKey("7");
			break;
		case 56:
			this.sendTelnetKey("8");
			break;
		case 57:
			this.sendTelnetKey("9");
			break;
		case 65:
			this.sendTelnetKey("a");
			break;
		case 66:
			this.sendTelnetKey("b");
			break;
		case 67:
			this.sendTelnetKey("c");
			break;
		case 68:
			this.sendTelnetKey("d");
			break;
		case 69:
			this.sendTelnetKey("e");
			break;
		case 70:
			this.sendTelnetKey("f");
			break;
		case 71:
			this.sendTelnetKey("g");
			break;
		case 72:
			this.sendTelnetKey("h");
			break;
		case 73:
			this.sendTelnetKey("i");
			break;
		case 74:
			this.sendTelnetKey("j");
			break;
		case 75:
			this.sendTelnetKey("k");
			break;
		case 76:
			this.sendTelnetKey("l");
			break;
		case 77:
			this.sendTelnetKey("m");
			break;
		case 78:
			this.sendTelnetKey("n");
			break;
		case 79:
			this.sendTelnetKey("o");
			break;
		case 80:
			this.sendTelnetKey("p");
			break;
		case 81:
			this.sendTelnetKey("q");
			break;
		case 82:
			this.sendTelnetKey("r");
			break;
		case 83:
			this.sendTelnetKey("s");
			break;
		case 84:
			this.sendTelnetKey("t");
			break;
		case 85:
			this.sendTelnetKey("u");
			break;
		case 86:
			this.sendTelnetKey("v");
			break;
		case 87:
			this.sendTelnetKey("w");
			break;
		case 88:
			this.sendTelnetKey("x");
			break;
		case 89:
			this.sendTelnetKey("y");
			break;
		case 90:
			this.sendTelnetKey("z");
			break;
		default:
			Mojo.Log.info("No known key");
	}
  
};

MasterRemoteAssistant.prototype.sendTelnetKey = function(value, event){
	
	if(WebMyth.useService) {
		WebMyth.sendServiceCmd(this, "key "+value);
	} else {
		WebMyth.sendKey(value);
	}
	
	if(WebMyth.prefsCookieObject.remoteVibrate) {
		this.controller.stageController.getAppController().playSoundNotification( "vibrate", "" );
	};
	
};

MasterRemoteAssistant.prototype.sendJumpPoint = function(value, event){
	
	if(WebMyth.useService) {
		WebMyth.sendServiceCmd(this, "jump "+value);
	} else {
		WebMyth.sendJump(value);
	}
	
	if(WebMyth.prefsCookieObject.remoteVibrate) {
		this.controller.stageController.getAppController().playSoundNotification( "vibrate", "" );
	};
	
	//Mojo.Log.info("Sending command '%s' to host", value);
};

