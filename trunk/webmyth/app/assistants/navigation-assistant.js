function NavigationAssistant(activeHostIn) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	  this.nullHandleCount = 0;
	  this.activeHost = activeHostIn;
}

NavigationAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	//Header menu widget
	this.viewMenuAttribs = {
            spacerHeight: 0,
            menuClass: 'no-fade'
	};
		
	this.viewMenuModel = {
		visible: true,
		items: [
				{ }, 
				{ label: "mythtv://" + this.activeHost, width: 300 },
				{  }
		]
	};
	this.controller.setupWidget( Mojo.Menu.viewMenu, this.viewMenuAttibs , this.viewMenuModel );
	
		
	//Bottom of page menu widget
	this.bottomMenuModel = {
		visible: true,
		items: [{},{
			toggleCmd: 'swapNavigation',
			items: [{}, {
				label: 'Communication Bottom Menu',
				items: [{
					label: "Nav",
					command: 'go-navigation',
					width: 75
				}, {
					label: "Play",
					command: 'go-playback',
					width: 70
				}, {
					label: "Music",
					command: 'go-music',
					width: 90
				}]
			}, {}]
		},
		{}
		]
	};
	this.controller.setupWidget( Mojo.Menu.commandMenu, {}, this.bottomMenuModel );
	
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("backButton"),Mojo.Event.tap, this.sendCommand);
};

NavigationAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

NavigationAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

NavigationAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

// Handlers to go to next and previous stories
NavigationAssistant.prototype.handleCommand = function(event) {
  if(event.type == Mojo.Event.command) {
    switch(event.command) {
      case 'go-navigation':
        Mojo.Controller.errorDialog("Already on navigation");
        break;
      case 'go-playback':
        Mojo.Controller.errorDialog("Playback scene not yet implimented");
        break;      
	  case 'go-music':
        Mojo.Controller.errorDialog("Music scene not yet implimented");
        break;
    }
  }
};


// Send commands to telnet connection
NavigationAssistant.prototype.sendCommand = function(event) {
  Mojo.Controller.errorDialog(event.id);
	
  switch(event.id)
	{
	case backButton:
	  Mojo.Controller.errorDialog("sending escape ...");
	  break;
	case upButton:
	  Mojo.Controller.errorDialog("sending up ...");
	  break;
	default:
	  Mojo.Controller.errorDialog("no matching command");
	}
  

  

};

