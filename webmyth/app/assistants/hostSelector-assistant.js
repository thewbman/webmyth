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


function HostSelectorAssistant(jumpRemote) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	  this.jumpToRemote = jumpRemote;
	  
	  this.nullHandleCount = 0;
	 
	  this.resultList = [];
};


HostSelectorAssistant.prototype.setup = function() {
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	this.hostsCommandMenuModel = {
		visible: true,
		items: [
			{ items: [ { label: "Add", command: 'go-addHost', width: 90 } ] },
			{},
			{ items: [ { label: "Search", command: 'go-searchHost', width: 90 } ] }
		]
	};
	
	//Bottom of page menu widget
	this.controller.setupWidget( Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.hostsCommandMenuModel );
	
	
	//List of hosts widget
	this.hostListAttribs = {
		itemTemplate: "hostSelector/hostListItem",
		swipeToDelete: true
	};
	
    this.hostListModel = {            
        items: this.resultList
    };
	this.controller.setupWidget( "hostlist" , this.hostListAttribs, this.hostListModel);
	
	
	
	//Tap a host from list
	this.controller.listen(this.controller.get( "hostlist" ), Mojo.Event.listTap,
        this.chooseList.bind(this));
		
	//Delete host
	this.controller.listen(this.controller.get( "hostlist" ), Mojo.Event.listDelete,
        this.deleteHost.bind(this));
	
};

HostSelectorAssistant.prototype.activate = function(event) {
	
	//Populate list using cookie
	this.resultList.clear();
	Object.extend(this.resultList,WebMyth.hostsCookieObject);
	this.controller.modelChanged(this.hostListModel);
	
	if(this.jumpToRemote) {
		this.jumpToRemote = false;
		this.startCommunication();
	}
	
};

HostSelectorAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	   
	WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	  
	  	  
};

HostSelectorAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  
	//Close out any open telnet connection
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Closing out telnet", {source: 'notification'});
	}
	else {
		//$('telnetPlug').CloseTelnetConnection();
	}
};

HostSelectorAssistant.prototype.handleCommand = function(event) {
  if(event.type == Mojo.Event.command) {
    switch(event.command) {
      case 'go-addHost':
        Mojo.Controller.stageController.pushScene("addHost");
       break;
      case 'go-searchHost':
		Mojo.Controller.stageController.pushScene("searchHosts");
       break;
    }
  };
};



HostSelectorAssistant.prototype.errorHandler = function(transaction, error) { 
    Mojo.Log.error('Error was '+error.message+' (Code '+error.code+')'); 
    return true;
};

HostSelectorAssistant.prototype.deleteHost = function(event) {
	
	var selectedHost = event.item.hostname;
	var hostId = event.item.id;
	
	
	Mojo.Log.info("Deleting host: %s",event.item.hostname);
	
	
	var newList = cutoutHostname(WebMyth.hostsCookieObject, event.item.hostname);
	
	//Update cookie
	WebMyth.hostsCookieObject.clear();
	Object.extend(WebMyth.hostsCookieObject,newList);
	
	
	//WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	//WebMyth.hostsCookie.put(this.resultList);
	WebMyth.hostsCookie.put(newList);

	
};

HostSelectorAssistant.prototype.chooseList = function(event) {
	Mojo.Log.info("Selected host: "+event.item.hostname);
	
	WebMyth.prefsCookieObject.currentFrontend = event.item.hostname;
	WebMyth.prefsCookieObject.currentFrontendAddress = event.item.address;
	WebMyth.prefsCookieObject.currentRemotePort = event.item.port;
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	 
	
	this.startCommunication();
	
};

HostSelectorAssistant.prototype.startCommunication = function(event) {
	
	Mojo.Log.info("Starting communication ...");
	
	
	//Open initial communication scene
	Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
};

HostSelectorAssistant.prototype.startCommunication2 = function(event) {
	
	Mojo.Log.info("Starting communication ...");
	
	remoteStage = Mojo.Controller.getAppController().getStageController(WebMyth.prefsCookieObject.currentRemoteScene);
	
	
		if (remoteStage) {
			// Dashboard stage is already open
			Mojo.Log.info("DELEGATING TO SCENE ASST");
			remoteStage.popScenesTo();
			remoteStage.pushScene(WebMyth.prefsCookieObject.currentRemoteScene);
			remoteStage.activate();
		} else {
			//Mojo.Log.info("No dashboard Stage found.");
			pushCard = function (stageController) {
				stageController.pushScene(WebMyth.prefsCookieObject.currentRemoteScene);
			};
			Mojo.Controller.getAppController().createStageWithCallback({name: WebMyth.prefsCookieObject.currentRemoteScene, lightweight: true },
				pushCard, "card");
		}	
		
};




