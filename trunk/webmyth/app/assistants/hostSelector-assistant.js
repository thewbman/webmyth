function HostSelectorAssistant(origdb) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	  this.nullHandleCount = 0;
	  this.db = origdb;
	  
	  this.resultList = [];
}

HostSelectorAssistant.prototype.setup = function() {
	
	//Setup database		
	//this.truncateDb();
	
	
	//Metrix command
	webmyth.Metrix.postDeviceData();	
	
	//Bottom of page menu widget
	this.bottomMenuModel = {
	items: [
		{},
		{
			label:'Host Selector Bottom Menu',
			items: [
				{ label: "Add", command: 'go-addHost', width: 80 }
			]
		},
		{}
	]
	};
	this.controller.setupWidget( Mojo.Menu.commandMenu, {}, this.bottomMenuModel );
	
	
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
        this.startCommunication);
		
	//Delete host
	this.controller.listen(this.controller.get( "hostlist" ), Mojo.Event.listDelete,
        this.deleteHost.bind(this));
	
};


HostSelectorAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	//Close out open telnet connections
	//TODO: Add check to only close if a connection exists
	closeTelnet();
	
	// Query `hosts` table
	var mytext = 'select * from hosts;'
    this.db.transaction( 
        (function (transaction) { 
            transaction.executeSql(mytext, [], this.queryDataHandler.bind(this), this.errorHandler.bind(this)); 
        }).bind(this) 
    );
	
};

HostSelectorAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

HostSelectorAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

HostSelectorAssistant.prototype.handleCommand = function(event) {
  if(event.type == Mojo.Event.command) {
    switch(event.command) {
      case 'go-addHost':
        Mojo.Controller.stageController.pushScene("addHost", this.db);
        break;
    }
  }
};

HostSelectorAssistant.prototype.queryDataHandler = function(transaction, results) { 
    // Handle the results 
    var string = ""; 
	
	Mojo.Log.info("inside queryData");
    
	try {
		var list = [];
		for (var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
						
			string = { id: row.id, hostname: row.hostname, port: row.port, ipChar: row.ipChar };

			list.push( string );
			//this.hostListModel.items.push( string );
			//Mojo.Log.info("Just added '%s' to list", string);
		}
		//update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,list);
		this.controller.modelChanged(this.hostListModel);
		
		Mojo.Log.info("Done with data query");
	}
	catch (err)
	{
		Mojo.Log.error("Data query failed");	
	} 

	Mojo.Log.info("Done with data query function");

}; 

HostSelectorAssistant.prototype.errorHandler = function(transaction, error) { 
    Mojo.Log.error('Error was '+error.message+' (Code '+error.code+')'); 
    return true;
};

HostSelectorAssistant.prototype.truncateDb = function() {
	 
	var sql = "DELETE FROM 'hosts' WHERE 1";
 
	this.db.transaction( function (transaction) {
	  transaction.executeSql(sql,  [], 
                         function(transaction, results) {    // success handler
                           Mojo.Log.info("Successfully truncated table"); 
                         },
                         function(transaction, error) {      // error handler
                           Mojo.Log.error("Could not truncate table: " + error.message);
                         }
 	 );
	});
	
	Mojo.Log.info("leaving truncate");
	
};


HostSelectorAssistant.prototype.deleteHost = function(event) {
	
	var selectedHost = event.item.hostname;
	var hostId = event.item.id;
	
	
	Mojo.Log.info("Deleting host: %s",hostId);
	
	var sql = "DELETE FROM hosts WHERE id = ?";
	
	this.db.transaction( function (transaction) {
	  transaction.executeSql(sql,  [hostId], 
                         function(transaction, results) {    // success handler
                           Mojo.Log.info("Successfully deleted record"); 
                         },
                         function(transaction, error) {      // error handler
                           Mojo.Log.error("Could not delete record: " + error.message);
                         }
 	 );
	});
	
};



HostSelectorAssistant.prototype.startCommunication = function(event) {
	Mojo.Log.info("Selected host.  Starting communication ...");
	 
	//var activeHost = "wes-htpc";
	var activeHost = event.item.hostname;
	var activePort = event.item.port;
	 
	Mojo.Log.info("active host is %s", activeHost);
	
	//Start telnet communication with selected host
	openTelnet(activeHost, activePort);
	
	Mojo.Log.info("Opened telnet connection to %s", activeHost);
	
	//Open initial communication scene
	Mojo.Controller.stageController.pushScene("navigation", activeHost);
	
};
