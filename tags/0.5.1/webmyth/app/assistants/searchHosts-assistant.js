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
		swipeToDelete: false
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
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
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
	Mojo.Log.info("got response text: '%s'", response.responseText);
	Mojo.Log.info("got frontends json: '%j'", response.responseJSON);
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
