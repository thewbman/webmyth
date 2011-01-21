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
	

		var requestUrl = "http://"+WebMyth.prefsCookieObject.masterBackendIp+":6544/Myth/GetHosts";
		
		try {
			var request = new Ajax.Request(requestUrl,{
				method: 'get',
				evalJSON: 'false',
				onSuccess: this.getFrontendsXMLSuccess.bind(this),
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

};

SearchHostsAssistant.prototype.cleanup = function(event) {

};




SearchHostsAssistant.prototype.getFrontendsXMLSuccess = function(response) {
	
	//Mojo.Log.info("Got frontends XML: '%j'", response.responseText);
	
	var hostsList = [];
	
	var xmlstring = response.responseText.trim();
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	//Mojo.Log.error("Hosts response is %s",xmlstring);
	
	//Local variables
	var topNode, topNodesCount, topSingleNode, hostsNode, singleHostNode;
	var singleHostJson = {};
	var Count;
	
	
	
	//Start parsing
	topNode = xmlobject.getElementsByTagName("GetHostsResponse")[0];
	var topNodesCount = topNode.childNodes.length;
	for(var i = 0; i < topNodesCount; i++) {
		topSingleNode = topNode.childNodes[i];
		//Mojo.Log.info("Node name is "+topSingleNode.nodeName);
		
		switch(topSingleNode.nodeName) {
			case 'Count':
				//Count = topSingleNode.childNodes[0].nodeValue;
				break;
			case 'Hosts':
				//Mojo.Log.info('Starting to parse Hosts');
				hostsNode = topSingleNode;
				for(var j = 0; j < hostsNode.childNodes.length; j++) {
					singleHostNode = hostsNode.childNodes[j];
					//Mojo.Log.info("Node name is "+singleHostNode.nodeName);
					if(singleHostNode.nodeName == 'Host') {
						//Mojo.Log.info('Inside Host if');
						singleHostJson = {
									"hostname": singleHostNode.childNodes[0].nodeValue, 
									"port": 6546
						}
										
						hostsList.push(singleHostJson);
						//Mojo.Log.info("Single host json is %j", singleHostJson);
							
						
					}
				}
				//Mojo.Log.info('Done parsing Hosts');
				//Mojo.Log.error("Hosts full json is %j", hostsList);
				
				break;
			default:
				break;
		}
	}
	
	//Mojo.Log.info("Done with XML parsing");
	
	
	try{
		var i, j, s = {};
		//Search for changed port in settings
		for(i = 0; i < hostsList.length; i++) {
			s = hostsList[i];
			
			for(j = 0; j < WebMyth.settings.hosts.length; j++){
				if(s.hostname == WebMyth.settings.hosts[j].hostname) {
					s.port = WebMyth.settings.hosts[j].controlPort;
				}
			}
		
		}
	} catch(e) {
		Mojo.Log.error("Could not add ports to hosts: %s",e);
	}
	 
	this.resultList.clear();
	Object.extend(this.resultList,hostsList.sort(sort_by('hostname', false)));

	this.controller.modelChanged(this.enabledHostsListModel);
	
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