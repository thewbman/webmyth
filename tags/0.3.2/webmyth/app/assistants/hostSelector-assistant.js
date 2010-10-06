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

//Setup remote commandmenu
HostSelectorAssistant.hostsCommandMenuModel = {
	visible: true,
	items: [
		{ items: [ { label: "Add", command: 'go-addHost', width: 90 } ] },
		{},
		{ items: [ { label: "Search", command: 'go-searchHost', width: 90 } ] }
	]
};

HostSelectorAssistant.prototype.setup = function() {
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Bottom of page menu widget
	this.controller.setupWidget( Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, HostSelectorAssistant.hostsCommandMenuModel );
	
	
	//List of hosts widget
	this.hostListAttribs = {
		itemTemplate: "hostSelector/hostListItem",
		swipeToDelete: true
	};
	
    this.hostListModel = {            
        items: this.resultList
    };
	this.controller.setupWidget( "hostlist" , this.hostListAttribs, this.hostListModel);
	
	
	
	/* add event handlers to listen to events from widgets */
	
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
	Mojo.Log.info("Selected host.");
	
	WebMyth.prefsCookieObject.currentFrontend = event.item.hostname;
	WebMyth.prefsCookieObject.currentRemotePort = event.item.port;
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	 
	
	this.startCommunication();
	
};


HostSelectorAssistant.prototype.startCommunication = function(event) {
	
	Mojo.Log.info("Starting communication ...");
	
	//Start telnet communication with selected host
	if (Mojo.appInfo.skipPDK == "true") {
		//Do nothing if not using plug-in
	}
	else {
		Mojo.Log.info("Opened telnet connection to %s", WebMyth.prefsCookieObject.currentFrontend);
		//Mojo.Controller.getAppController().showBanner("Opened telnet connection",{source: 'notification'});
		
		$('telnetPlug').OpenTelnetConnection(WebMyth.prefsCookieObject.currentFrontend, WebMyth.prefsCookieObject.currentRemotePort);
	
		$('telnetPlug').SendTelnet("asdf");
		$('telnetPlug').SendTelnet("asdf");
	}

	
	//Open initial communication scene
	Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
	
};


HostSelectorAssistant.prototype.sendTelnet = function(value){
	var reply;
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		
		//Using cgi-bin on server
		var cmdvalue = encodeURIComponent(value);
		var requestURL="http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webserverRemoteFile+"?host="+WebMyth.prefsCookieObject.currentFrontend+"&cmd="+cmdvalue;
	
		var request = new Ajax.Request(requestURL, {
			method: 'get',
			onSuccess: function(transport){
				reply = transport.responseText;
				if (reply.substring(0,5) == "ERROR") {
					Mojo.Log.error("Error in response: '%s'", reply.substring(6));
					Mojo.Controller.getAppController().showBanner(reply, {source: 'notification'});
				} else {
					Mojo.Log.info("Success AJAX: '%s'", reply);
				}
			},
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		});
		
		
		
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
};



HostSelectorAssistant.prototype.sendKey = function(value){
		
		var cmdvalue = encodeURIComponent(value);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=key";
		requestUrl += "&host="+WebMyth.prefsCookieObject.currentFrontend;
		requestUrl += "&cmd="+cmdvalue;
		//var requestURL="http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webserverRemoteFile+"?host="+this.frontendTextModel.value+"&cmd="+cmd;  
	
		var request = new Ajax.Request(requestUrl, {
			method: 'get',
			onSuccess: function(transport){
				reply = transport.responseText;
				if (reply.substring(0,5) == "ERROR") {
					Mojo.Log.error("ERROR in response: '%s'", reply.substring(6));
					Mojo.Controller.getAppController().showBanner(reply, {source: 'notification'});
				} else {
					Mojo.Log.info("Success AJAX: '%s'", reply);
				}
			},
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		});
};



HostSelectorAssistant.prototype.sendJump = function(value){
		
		var cmdvalue = encodeURIComponent(value);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=jump";
		requestUrl += "&host="+WebMyth.prefsCookieObject.currentFrontend;
		requestUrl += "&cmd="+cmdvalue;
		//var requestURL="http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webserverRemoteFile+"?host="+this.frontendTextModel.value+"&cmd="+cmd;  
	
		var request = new Ajax.Request(requestUrl, {
			method: 'get',
			onSuccess: function(transport){
				reply = transport.responseText;
				if (reply.substring(0,5) == "ERROR") {
					Mojo.Log.error("ERROR in response: '%s'", reply.substring(6));
					Mojo.Controller.getAppController().showBanner(reply, {source: 'notification'});
				} else {
					Mojo.Log.info("Success AJAX: '%s'", reply);
				}
			},
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		});
};

