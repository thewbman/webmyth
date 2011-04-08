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
 
function SearchBackendsAssistant() {

	this.foundHosts = [];
	
	this.matchingHosts = [];

}

SearchBackendsAssistant.prototype.setup = function() {

	if(WebMyth.prefsCookieObject.debug) Mojo.Log.info("SearchBackendsAssistant starting");	
	
	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	$('spinner-text').innerHTML = $L("Searching")+"...";
	
		
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Search Menu'),
                            items: [{},{ icon: 'refresh', command: 'go-refresh' },{}]};
							
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	
	
	//List
	this.backendsListAttribs = {
		itemTemplate: "searchBackends/backendsListItem",
		swipeToDelete: false,
		//formatters:{myData: this.setMyData.bind(this)}
	};
    this.backendsListModel = {            
        items: this.matchingHosts,
		disabled: false
    };
	this.controller.setupWidget( "backendsList" , this.backendsListAttribs, this.backendsListModel);
 
 
	this.controller.listen(this.controller.get( "backendsList" ), Mojo.Event.listTap, this.selectedBackend.bind(this));
	
	
	
};

SearchBackendsAssistant.prototype.activate = function(event) {

	this.getBackends();

};

SearchBackendsAssistant.prototype.deactivate = function(event) {

};

SearchBackendsAssistant.prototype.cleanup = function(event) {

};

SearchBackendsAssistant.prototype.handleCommand = function(event) {

	if(WebMyth.prefsCookieObject.debug){
		Mojo.Log.error("command: "+event.command);
	}
	
	switch(event.command) {
		case 'go-refresh':
			this.getBackends();
		  break;
   }
  
};




SearchBackendsAssistant.prototype.getBackends = function(event) {

	//Stop spinner and hide
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show()

	this.foundHosts.clear();
	this.matchingHosts.clear();

	this.request = this.controller.serviceRequest("palm://com.palm.zeroconf", {
			method: "browse",
			parameters: {
				regType: "_workstation._tcp",
				subscribe: true
			},
			
			onSuccess: function(result) {
				if(WebMyth.prefsCookieObject.debug) Mojo.Log.error("Got browse result: "+JSON.stringify(result));
				
				this.foundHosts.push(result);
				
				var newLength = this.foundHosts.length;
				
				this.resolveHost(newLength-1);
				
			}.bind(this),
			
			onFailure: function(result) {
				Mojo.Log.error("zeroconf error: "+JSON.stringify(result));
				
			}
		}
	);
				
}

SearchBackendsAssistant.prototype.resolveHost = function(index) {

	if(WebMyth.prefsCookieObject.debug) Mojo.Log.error("resolveHost index "+index+" with "+JSON.stringify(this.foundHosts[index]));
	
	var info = this.foundHosts[index];
	
	this.controller.serviceRequest("palm://com.palm.zeroconf", {
			method: "resolve",
			parameters: {
				subscribe: true,
				regType: info.regType,
				domainName: info.domainName,
				instanceName: info.instanceName
			},
			
			onSuccess: function(result) {
				Mojo.Log.error("Got resolve result: "+JSON.stringify(result));
				
				this.foundHosts[index].IPv4Address = result.IPv4Address;
				this.foundHosts[index].fullName = result.fullName;
				this.foundHosts[index].instanceName = info.instanceName;
				
				this.testHost(index);
				
			}.bind(this),
			
			onFailure: function(result) {
				Mojo.Log.error("zeroconf resolve error: "+JSON.stringify(result));
				
			}
		}
	);
				
}

SearchBackendsAssistant.prototype.testHost = function(index) {

	if(WebMyth.prefsCookieObject.debug) Mojo.Log.error("testHost: "+index);
	
	var requestUrl = "http://"+this.foundHosts[index].IPv4Address+":6544/Myth/GetSetting?Key=MasterServerIP";
	
	var request = new Ajax.Request(requestUrl,{
		method: 'get',
		evalJSON: false,
		onSuccess: this.testHostSuccess.bind(this),
		onFailure: this.testHostFail.bind(this)  
	});

}

SearchBackendsAssistant.prototype.testHostSuccess = function(response) {

	if(WebMyth.prefsCookieObject.debug) Mojo.Log.error("testHostSuccess: "+response.responseText.trim());
	
	try {
	
		var xmlobject = (new DOMParser()).parseFromString(response.responseText, "text/xml");
		
		var valueNode = xmlobject.getElementsByTagName("Value")[0];
		
		var serverIP = valueNode.childNodes[0].nodeValue;
		
		if(WebMyth.prefsCookieObject.debug) Mojo.Log.error("Get MasterServerIP value of "+serverIP+" from "+JSON.stringify(response.request.url));
		
		this.matchingHosts.push({"ip": serverIP, url: JSON.stringify(response.request.url).replace("GetSetting?Key=MasterServerIP","")});
		this.controller.modelChanged(this.backendsListModel);
		
		//Stop spinner and hide
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').hide()
	
	} catch(e) {
	
		Mojo.Log.error("testHostSuccess XML error");
		Mojo.Log.error(e);
	
	}

}

SearchBackendsAssistant.prototype.testHostFail = function() {

	Mojo.Log.error("testHostFail");

}

SearchBackendsAssistant.prototype.selectedBackend = function(event) {

	if(WebMyth.prefsCookieObject.debug) Mojo.Log.error("selectedBackend ip: "+event.item.ip+" and url: "+event.item.url);
	
	this.request.cancel();
	
	var newBackend = event.item.ip;
	
	if((newBackend == "localhost")||(newBackend == "127.0.0.1")) {
		newBackend = event.item.url.replace("http://","").replace(":6544/Myth/","").replace('"','').replace('"','');
		
		Mojo.Log.error("changing backend to "+newBackend);
	}
	
	this.controller.showAlertDialog({
        onChoose: function(value) {
			switch(value) {
				case "Yes":
					
					WebMyth.prefsCookieObject.masterBackendIp = newBackend;
					
					if(WebMyth.prefsCookieObject.webserverName == '') {
						WebMyth.prefsCookieObject.webserverName = newBackend;
					}
					
					WebMyth.prefsCookie.put(WebMyth.prefsCookieObject); 
					
					//Delay close scene
					setTimeout(this.closeScene.bind(this), 500);
	
				  break;
				case "No":
				
					//Delay close scene
					setTimeout(this.closeScene.bind(this), 500);
					
				  break;
			}	
		},
        title: Mojo.Controller.appInfo.title+" - v" + Mojo.Controller.appInfo.version,
		message:  "Would you like to set the master backend to '"+newBackend+"'?", 
		choices: [
			{ label: $L("Yes"), value: "Yes"},
			{ label: $L("No"), value: "No"}
		],
		allowHTMLMessage: true
    });

}

SearchBackendsAssistant.prototype.closeScene = function() {

	Mojo.Controller.stageController.popScene();
	
};

