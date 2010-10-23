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
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

FlickAssistant.prototype.setup = function() {
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	//Bottom of remote page command menu widget
	//this.controller.setupWidget( Mojo.Menu.commandMenu, WebMyth.remoteCommandMenuAttr, WebMyth.remoteCommandMenuModel );
	//WebMyth.remoteCommandMenuModel.items[1].toggleCmd = 'go-flick';  
	//this.controller.modelChanged(WebMyth.remoteCommandMenuModel);
	
	//View menu widget
	WebMyth.remoteViewMenuModel.items[0].items[1].label = "Flick: " + WebMyth.prefsCookieObject.currentFrontend; 
	this.controller.setupWidget( Mojo.Menu.viewMenu, WebMyth.remoteViewMenuAttr, WebMyth.remoteViewMenuModel ); 
	//this.controller.modelChanged(WebMyth.remoteViewMenuModel);
	
	
	
		
	
	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
	
	//Escape button
	Mojo.Event.listen(this.controller.get("flickEscButtonId"),Mojo.Event.tap, this.handleTap.bind(this, this.controller.get("flickEscButtonId")));
	//Nav flick button
	Mojo.Event.listen(this.controller.get("flickNavButtonId"),Mojo.Event.tap, this.handleTap.bind(this, this.controller.get("flickNavButtonId")));
	Mojo.Event.listen(this.controller.get("flickNavButtonId"),Mojo.Event.flick, this.handleFlick.bind(this, this.controller.get("flickNavButtonId")));
	//Play flick button
	Mojo.Event.listen(this.controller.get("flickPlayButtonId"),Mojo.Event.tap, this.handleTap.bind(this, this.controller.get("flickPlayButtonId")));
	Mojo.Event.listen(this.controller.get("flickPlayButtonId"),Mojo.Event.flick, this.handleFlick.bind(this, this.controller.get("flickPlayButtonId")));
	//Volume flick button
	Mojo.Event.listen(this.controller.get("flickVolumeButtonId"),Mojo.Event.tap, this.handleTap.bind(this, this.controller.get("flickVolumeButtonId")));
	Mojo.Event.listen(this.controller.get("flickVolumeButtonId"),Mojo.Event.flick, this.handleFlick.bind(this, this.controller.get("flickVolumeButtonId")));

	
};

FlickAssistant.prototype.activate = function(event) {
	
	//$('scene-title').innerHTML = 'Remote: '+WebMyth.prefsCookieObject.currentFrontend;
	
	WebMyth.prefsCookieObject.currentRemoteScene = 'flick';
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject); 
	
	
	this.controller.enableFullScreenMode(WebMyth.prefsCookieObject.remoteFullscreen);
};

FlickAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

FlickAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};


// Send tap commands to telnet connection
FlickAssistant.prototype.handleTap = function(element, event) {

	var name = element;
	
	switch(name)
	{
		case flickEscButtonId:
			this.sendTelnetKey("escape");
			break;
		case flickNavButtonId:
			this.sendTelnetKey("enter");
			break;
		case flickPlayButtonId:
			this.sendTelnetKey("p");
			break;
		case flickVolumeButtonId:
			this.sendTelnetKey("f9");
			break;

		  
		default:
			Mojo.Controller.errorDialog("no matching command for %$s", name);
			break;
		
	}
  
};


// Send tap commands to telnet connection
FlickAssistant.prototype.handleFlick = function(element, event) {

	var name = element;
	var threshold = 500;
	
	//$("flickDebug").innerHTML = " velocity x: "+event.velocity.x+" and y: "+event.velocity.y;
	
	switch(name)
	{
	//Navigation commands
	case flickNavButtonId:
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
	  break;
	//Play commands
	case flickPlayButtonId:
	  if(event.velocity.x > threshold) {
		this.sendTelnetKey("z");
	  } else if(Math.abs(event.velocity.x) > threshold){
		this.sendTelnetKey("q");
	  } else {
		Mojo.Log.info("Play flick not strong enough x:"+event.velocity.x+" and y: "+event.velocity.y);
	  }
	  break;
	//Volume commands
	case flickVolumeButtonId:
	  if(event.velocity.x > threshold) {
		this.sendTelnetKey("]");
	  } else if(Math.abs(event.velocity.x) > threshold){
		this.sendTelnetKey("[");
	  } else {
		Mojo.Log.info("Volume flick not strong enough x:"+event.velocity.x+" and y: "+event.velocity.y);
	  }
	  break;

	  
	default:
	  Mojo.Controller.errorDialog("no matching command for %$s", name);
	}
	
	Event.stop(event);
  
};


// Send commands to telnet connection
FlickAssistant.prototype.handleKey = function(event) {

	Mojo.Log.info("NavigationAssistant.prototype.handleKey %o", event.originalEvent.keyCode);
	
	switch(event.originalEvent.keyCode)
	{
		case 8:
			this.sendTelnetKey("backspace");
			break;
		case 9:
			this.sendTelnetKey("tab");
			break;
		case 10:
			this.sendTelnetKey("enter");
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

FlickAssistant.prototype.sendTelnetKey = function(value, event){
	//this.sendTelnet("key "+value);
	
	
	//this.controller.stageController.parentSceneAssistant(this).sendKey(value); 
	WebMyth.sendKey(value);
	
	if(WebMyth.prefsCookieObject.remoteVibrate) {
		this.controller.stageController.getAppController().playSoundNotification( "vibrate", "" );
	};
	
	//Mojo.Log.info("Sending key '%s' to host", value);
};