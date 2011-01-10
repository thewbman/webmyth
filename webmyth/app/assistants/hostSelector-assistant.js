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
	  
	  this.jumpToRemote = jumpRemote;
	  
	  this.pickType = "start";
	  
	  this.nullHandleCount = 0;
	 
	  this.resultList = [];
	  
};

HostSelectorAssistant.prototype.setup = function() {
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	this.hostsCommandMenuModel = {
		visible: true,
		items: [
			{ label: $L("Add"), command: 'go-addHost', width: 90 } ,
			{ label: $L("Edit"), command: 'go-editHost', width: 90 },
			{ label: $L("Search"), command: 'go-searchHost', width: 90 }
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
	
	
	//Reset from edit
	$('scene-title').innerText = $L("Select Host");
	this.pickType = "start";
	
	
	if(this.jumpToRemote) {
		this.jumpToRemote = false;
		this.startCommunication();
	}
	

	//Keypress event
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	
};

HostSelectorAssistant.prototype.deactivate = function(event) {
	   
	WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);

	//Keypress event
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKey.bind(this));
	  	  
};

HostSelectorAssistant.prototype.cleanup = function(event) {

};

HostSelectorAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.forward) {
  
	Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
  } else if(event.type == Mojo.Event.command) {
    switch(event.command) {
      case 'go-addHost':
        Mojo.Controller.stageController.pushScene("addHost");
       break;
      case 'go-editHost':
        this.pickType = "edit";
		this.updateCommandMenu();
		$('scene-title').innerText = $L("Edit Host");
       break;
      case 'go-searchHost':
		Mojo.Controller.stageController.pushScene("searchHosts");
       break;
      case 'go-cancelEdit':
        this.pickType = "start";
		this.updateCommandMenu();
		$('scene-title').innerText = $L("Select Host");
       break;
    }
  };
};

HostSelectorAssistant.prototype.handleKey = function(event) {

	//Mojo.Log.info("FAQs handleKey %o, %o", event.originalEvent.metaKey, event.originalEvent.keyCode);
	
	if(event.originalEvent.metaKey) {
		switch(event.originalEvent.keyCode) {
			case 72:
				Mojo.Log.info("h - shortcut key to hostSelector");
				Mojo.Controller.stageController.swapScene("hostSelector");
				break;
			case 82:
				Mojo.Log.info("r - shortcut key to recorded");
				Mojo.Controller.stageController.swapScene("recorded");
				break;
			case 85:
				Mojo.Log.info("u - shortcut key to upcoming");
				Mojo.Controller.stageController.swapScene("upcoming");
				break;
			case 71:
				Mojo.Log.info("g - shortcut key to guide");
				Mojo.Controller.stageController.swapScene("guide");	
				break;
			case 86:
				Mojo.Log.info("v - shortcut key to videos");
				Mojo.Controller.stageController.swapScene("videos");	
				break;
			case 77:
				Mojo.Log.info("m - shortcut key to musicList");
				Mojo.Controller.stageController.swapScene("musicList");	
				break;
			case 83:
				Mojo.Log.info("s - shortcut key to status");
				Mojo.Controller.stageController.swapScene("status");
				break;
			case 76:
				Mojo.Log.info("l - shortcut key to log");
				Mojo.Controller.stageController.swapScene("log");	
				break;
			default:
				Mojo.Log.info("No shortcut key");
				break;
		}
	}
	Event.stop(event); 
};



HostSelectorAssistant.prototype.deleteHost = function(event) {
	
	var selectedHost = event.item.hostname;
	var hostId = event.item.id;
	
	
	Mojo.Log.info("Deleting host: %s",event.item.hostname);
	
	
	var newList = cutoutHostname(WebMyth.hostsCookieObject, event.item.hostname);
	
	//Update cookie
	WebMyth.hostsCookieObject.clear();
	Object.extend(WebMyth.hostsCookieObject,newList);
	
	
	WebMyth.hostsCookie.put(newList);

	
};

HostSelectorAssistant.prototype.chooseList = function(event) {
	Mojo.Log.info("Selected host: "+event.item.hostname);
	
	WebMyth.prefsCookieObject.currentFrontend = event.item.hostname;
	WebMyth.prefsCookieObject.currentFrontendAddress = event.item.address;
	WebMyth.prefsCookieObject.currentFrontendPort = event.item.port;
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
	
	 
	if(this.pickType == "start") {
		this.startCommunication();
	} else if (this.pickType == "edit") {
        Mojo.Controller.stageController.pushScene("editHost");
	}
	
};

HostSelectorAssistant.prototype.startCommunication = function(event) {
	
	Mojo.Log.info("Starting communication ...");
	
	
	if(WebMyth.useService) {
		WebMyth.startNewCommunication(this);
	} else if (WebMyth.usePlugin) {
		WebMyth.newPluginSocket();
	}
	
	
	//Open initial communication scene
	Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
};

HostSelectorAssistant.prototype.updateCommandMenu = function() {
	
	this.hostsCommandMenuModel.items.clear();

	if(this.pickType == "edit") {
		this.hostsCommandMenuModel.items.push({});
		this.hostsCommandMenuModel.items.push({ label: $L("Cancel"), command: 'go-cancelEdit', width: 90 });
		this.hostsCommandMenuModel.items.push({});
		
	} else {
		this.hostsCommandMenuModel.items.push({ label: $L("Add"), command: 'go-addHost', width: 90 });
		this.hostsCommandMenuModel.items.push({ label: $L("Edit"), command: 'go-editHost', width: 90 });
		this.hostsCommandMenuModel.items.push({ label: $L("Search"), command: 'go-searchHost', width: 90 });

	};
	
	this.controller.modelChanged(this.hostsCommandMenuModel);
	
};
