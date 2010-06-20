function AddHostAssistant(origdb) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	  this.db = origdb;
}

AddHostAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	this.hostTextModel = {
             value: "",
             disabled: false
    };
	
	this.portTextModel = {
             value: "",
             disabled: false
    };
		 
	this.controller.setupWidget("hostTextFieldId",
        {
            hintText: $L(""),
            multiline: false,
            enterSubmits: false,
            focus: false
         },
         this.hostTextModel
    ); 
	
	this.controller.setupWidget("portTextFieldId",
         {
            hintText: $L("default 6546"),
            multiline: false,
            enterSubmits: false,
            focus: false
         },
         this.portTextModel
    );
	
	this.controller.setupWidget("submitHostButtonId",
         {},
         {
             label : "SUBMIT",
             disabled: false
         }
     );
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("submitHostButtonId"),Mojo.Event.tap, this.submitNewHost.bind(this));
};

AddHostAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

AddHostAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AddHostAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

AddHostAssistant.prototype.submitNewHost = function(event) {
	//Returns data to host selector scene
	var newHost = {
		'hostname': this.hostTextModel.value,
		'port': this.portTextModel.value
	};
	
	
	//TODO: verify port is integer
	
	//TODO: resolve IP address to add into DB
	
	Mojo.Log.info("New hostname is %s", this.hostTextModel.value);
	Mojo.Log.info("New hostname is %s", newHost.hostname);
	 
	var sql = "INSERT INTO 'hosts' (hostname, port) VALUES (?, ?)";
 
	this.db.transaction( function (transaction) {
	  transaction.executeSql(sql,  [newHost.hostname, newHost.port], 
                         function(transaction, results) {    // success handler
                           Mojo.Log.info("Successfully inserted record"); 
                         },
                         function(transaction, error) {      // error handler
                           Mojo.Log.error("Could not insert record: " + error.message);
                         }
 	 );
	});
	
	
	
	//Return to host selector
	Mojo.Controller.stageController.popScene();

};
