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


function FlickAssistant() {

}

FlickAssistant.prototype.setup = function() {
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Setup remote view menu
	this.remoteViewMenuAttr = { spacerHeight: 0, menuClass: 'no-fade' };	
	this.remoteViewMenuModel = {
		visible: true,
		items: [{
			items: [
				{ icon: 'back', command: 'go-remotePrevious'},
				{ label: $L("Flick")+": " + WebMyth.prefsCookieObject.currentFrontend, command: 'do-remoteHeaderAction', width: 200 },
				{ icon: 'forward', command: 'go-remoteNext'}
			]
		}]
	};
	this.controller.setupWidget( Mojo.Menu.viewMenu, this.remoteViewMenuAttr, this.remoteViewMenuModel ); 
	
		
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	
	//Escape button
	Mojo.Event.listen(this.controller.get("flickEscButtonId"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "escape"));
	Mojo.Event.listen(this.controller.get("flickDeleteButtonId"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "d"));
	Mojo.Event.listen(this.controller.get("flickMenuButtonId"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "m"));
	Mojo.Event.listen(this.controller.get("flickInfoButtonId"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "i"));
	//Nav flick button
	Mojo.Event.listen(this.controller.get("flickNavButtonId"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "space"));
	Mojo.Event.listen(this.controller.get("flickNavButtonId"),Mojo.Event.flick, this.handleNavFlick.bind(this));
	//Play flick button
	Mojo.Event.listen(this.controller.get("flickPlayButtonId"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "p"));
	Mojo.Event.listen(this.controller.get("flickPlayButtonId"),Mojo.Event.flick, this.handlePlayFlick.bind(this));
	//Volume flick button
	Mojo.Event.listen(this.controller.get("flickVolumeButtonId"),Mojo.Event.tap, this.sendTelnetKey.bind(this, "f9"));
	Mojo.Event.listen(this.controller.get("flickVolumeButtonId"),Mojo.Event.flick, this.handleVolumeFlick.bind(this));

	
};

FlickAssistant.prototype.activate = function(event) {
	
	WebMyth.prefsCookieObject.currentRemoteScene = 'flick';
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject); 
	
	//View menu widget
	this.remoteViewMenuModel.items[0].items[1].label = $L("Flick")+": " + WebMyth.prefsCookieObject.currentFrontend;  
	this.controller.modelChanged(this.remoteViewMenuModel);
	
	this.controller.enableFullScreenMode(WebMyth.prefsCookieObject.remoteFullscreen);
	
	$('flickVolumeButtonId').innerText = $L("Volume");
	

};

FlickAssistant.prototype.deactivate = function(event) {

};

FlickAssistant.prototype.cleanup = function(event) {

};

FlickAssistant.prototype.handleCommand = function(event) {

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

FlickAssistant.prototype.handleKey = function(event) {

	Mojo.Log.info("NavigationAssistant.prototype.handleKey %o", event.originalEvent.keyCode);
	
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





FlickAssistant.prototype.handleNavFlick = function(event) {

	var threshold = 500;
	
	  if(event.velocity.x > threshold) {
		this.sendTelnetKey("right");
	  } else if(Math.abs(event.velocity.x) > threshold){
		this.sendTelnetKey("left");
	  } else if(event.velocity.y > threshold){
		this.sendTelnetKey("down");
	  } else if(Math.abs(event.velocity.y) > threshold){
		this.sendTelnetKey("up");
	  } else {
		Mojo.Log.info("Nav flick not strong enough x:"+event.velocity.x+" and y: "+event.velocity.y);
	  }
	  
	  
	Event.stop(event);
}

FlickAssistant.prototype.handlePlayFlick = function(event) {

	var threshold = 500;
	
	  if(event.velocity.x > threshold) {
		this.sendTelnetKey("z");
	  } else if(Math.abs(event.velocity.x) > threshold){
		this.sendTelnetKey("q");
	  } else {
		Mojo.Log.info("Play flick not strong enough x:"+event.velocity.x+" and y: "+event.velocity.y);
	  }
	  
	  
	Event.stop(event);
}

FlickAssistant.prototype.handleVolumeFlick = function(event) {

	var threshold = 500;

	  if(event.velocity.x > threshold) {
		this.sendTelnetKey("f11");
	  } else if(Math.abs(event.velocity.x) > threshold){
		this.sendTelnetKey("f10");
	  } else {
		Mojo.Log.info("Volume flick not strong enough x:"+event.velocity.x+" and y: "+event.velocity.y);
	  }

	
	Event.stop(event);
  
};



FlickAssistant.prototype.sendTelnetKey = function(value, event){

	if(WebMyth.useService) {
		WebMyth.sendServiceCmd(this, "key "+value);
	} else {
		WebMyth.sendKey(value);
	}
	
	if(WebMyth.prefsCookieObject.remoteVibrate) {
		this.controller.stageController.getAppController().playSoundNotification( "vibrate", "" );
	};
	
};