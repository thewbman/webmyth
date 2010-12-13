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


function SearchHostsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	  this.resultList = [];
	  this.enabledResultList = [];
	  this.disabledResultList = [];
}

SearchHostsAssistant.prototype.setup = function() {

	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//List of hosts widget
	this.enabledHostsListAttribs = {
		itemTemplate: "searchHosts/foundHostsListItem",
		swipeToDelete: false,
		formatters:{myData: this.setMyData.bind(this)}
	};
    this.enabledHostsListModel = {            
        //items: this.enabledResultList
		items: this.resultList
    };
	this.controller.setupWidget( 'enabledHostsList' , this.enabledHostsListAttribs, this.enabledHostsListModel);
	
	/*
	this.disabledHostsListAttribs = {
		itemTemplate: "searchHosts/foundHostsListItem",
		swipeToDelete: false
	};
    this.disabledHostsListModel = {            
        items: this.disabledResultList
    };
	this.controller.setupWidget( 'disabledHostsList' , this.disabledHostsListAttribs, this.disabledHostsListModel);
	*/
	
	
	
	//Tap a host from enabled list
	this.controller.listen(this.controller.get( 'enabledHostsList' ) , Mojo.Event.listTap, this.selectedHost.bind(this));
	//Tap a host from disabled list
	//this.controller.listen(this.controller.get( 'disabledHostsList' ), Mojo.Event.listTap, this.selectedHost.bind(this));
	
	
};

SearchHostsAssistant.prototype.activate = function(event) {
	   
	Mojo.Log.info("Searching for hosts...");
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=getHosts";
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
            onSuccess: this.getFrontendsSuccess.bind(this),
            onFailure: this.getFrontendsFailure.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
	
	
	$('scene-title').innerText = $L("Hosts on Backend");
	$('frontendsGroupLabel').innerText = $L('Frontends');
	
};

SearchHostsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SearchHostsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};




SearchHostsAssistant.prototype.getFrontendsSuccess = function(response) {
	//Mojo.Log.info("got response text: '%s'", response.responseText);
	//Mojo.Log.info("got frontends json: '%j'", response.responseJSON);
	
	var i, s;
	 
	this.resultList.clear();
	Object.extend(this.resultList,response.responseJSON.sort(sort_by('hostname', false)));
	
	//Object.extend(this.enabledResultList,trimByEnabled(this.resultList, 1));
	//Object.extend(this.disabledResultList,trimByEnabled(this.resultList, 0));
	
	this.controller.modelChanged(this.enabledHostsListModel);
	//this.controller.modelChanged(this.disabledHostsListModel);
		
	//Mojo.Log.info("Done with data query function");
};

SearchHostsAssistant.prototype.getFrontendsFailure = function(event) {
	Mojo.Log.error("failed to get frontends");
};

SearchHostsAssistant.prototype.selectedHost = function(event) {
	Mojo.Log.info("chosen a host "+event.item.hostname+" with port "+event.item.port);
	var newHost = {
		'hostname': event.item.hostname,
		'port': event.item.port,
		'address': ""
	};
	
	//Mojo.Log.info("New hostname is %s", this.hostTextModel.value);
	Mojo.Log.info("New hostname is %s", newHost.hostname);
	
	WebMyth.hostsCookieObject.push(newHost);
	WebMyth.hostsCookie.put(WebMyth.hostsCookieObject);
	

	//Update prefs cookie
	WebMyth.prefsCookieObject.currentFrontend = newHost.hostname;
	WebMyth.prefsCookieObject.currentFrontendPort = newHost.port;
	WebMyth.prefsCookieObject.currentFrontendAddress = newHost.address;
	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
	
	//Return to host selector
	Mojo.Controller.stageController.swapScene("editHost");
	
};

SearchHostsAssistant.prototype.setMyData = function(propertyValue, model) {

	var hostDetailsText = "";
	
	hostDetailsText += '<div class="palm-row-wrapper">';
	hostDetailsText += '<div class="title">';                          
	hostDetailsText += '<div class="label">'+$L('Port')+": "+model.port+'</div>';
	hostDetailsText += '<div class="textFieldClass truncating-text">'+model.hostname+'</div>';
	hostDetailsText += '</div>';
	hostDetailsText += '</div>';
	
	
	model.myData = hostDetailsText;
		
}