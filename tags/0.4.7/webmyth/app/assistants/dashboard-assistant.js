function DashboardAssistant() {

	this.buttonsStarted = false;

	this.maxDashboardRemoteIndex = 4;
	
	this.dashboardRemoteButtons = [
		{ 'layoutName': 'navigation', 'buttons': [ { 'label': 'OK', 'className': 'dashboard-text', 'type': 'key', 'key': 'enter' },
													{'label': '', 'className': 'dashboard-left', 'type': 'key', 'key': 'left' },
													{'label': '', 'className': 'dashboard-down', 'type': 'key', 'key': 'down' },
													{'label': '', 'className': 'dashboard-up', 'type': 'key', 'key': 'up' },
													{'label': '', 'className': 'dashboard-right', 'type': 'key', 'key': 'right' }
												] },
		{ 'layoutName': 'playback', 'buttons': [ { 'label': '', 'className': 'disabled-thin', 'type': 'key', 'key': '' },
													{'label': '', 'className': 'dashboard-jumpback', 'type': 'key', 'key': 'q' },
													{'label': '', 'className': 'dashboard-pause', 'type': 'key', 'key': 'p' },
													{'label': '', 'className': 'dashboard-jumpforward', 'type': 'key', 'key': 'z' },
													{'label': '', 'className': 'disabled', 'type': 'key', 'key': '' }
												] },
		{ 'layoutName': 'volume', 'buttons': [ { 'label': '', 'className': 'disabled-thin', 'type': 'key', 'key': '' },
													{'label': '', 'className': 'dashboard-voldown', 'type': 'key', 'key': '[' },
													{'label': '', 'className': 'dashboard-mute', 'type': 'key', 'key': 'f9' },
													{'label': '', 'className': 'dashboard-volup', 'type': 'key', 'key': ']' },
													{'label': '', 'className': 'disabled', 'type': 'key', 'key': '' }
												] },
		{ 'layoutName': 'commands', 'buttons': [ { 'label': 'Esc', 'className': 'dashboard-text', 'type': 'key', 'key': 'escape' },
													{'label': 'OK', 'className': 'dashboard-text', 'type': 'key', 'key': 'enter' },
													{'label': '', 'className': 'disabled-thin', 'type': 'key', 'key': '' },
													{'label': 'Menu', 'className': 'dashboard-text-wide', 'type': 'key', 'key': 'm' },
													{'label': 'Info', 'className': 'dashboard-text-wide', 'type': 'key', 'key': 'i' }
												] },
		{ 'layoutName': 'jump', 'buttons': [ { 'label': 'LiveTV', 'className': 'dashboard-text-jump', 'type': 'jump', 'jump': 'livetv' },
													{'label': 'Music', 'className': 'dashboard-text-jump', 'type': 'jump', 'jump': 'playmusic' },
													{'label': 'Videos', 'className': 'dashboard-text-jump', 'type': 'jump', 'jump': 'mythvideo' },
													{'label': 'Record', 'className': 'dashboard-text-jump', 'type': 'jump', 'jump': 'playbackrecordings' },
													{'label': '', 'className': 'disabled', 'type': 'key', 'key': '' }
												] }
		];
}

DashboardAssistant.prototype.setup = function() {

	Mojo.Event.listen(this.controller.get("webmyth-dashboard-icon"),Mojo.Event.tap, this.nextLayout.bind(this));
	
	/*
	//Buttons
	Mojo.Event.listen(this.controller.get("dashboardButtonOne"),Mojo.Event.tap, this.buttonTap.bind(this, this.controller.get("dashboardButtonOne")));
	Mojo.Event.listen(this.controller.get("dashboardButtonTwo"),Mojo.Event.tap, this.buttonTap.bind(this, this.controller.get("dashboardButtonTwo")));
	Mojo.Event.listen(this.controller.get("dashboardButtonThree"),Mojo.Event.tap, this.buttonTap.bind(this, this.controller.get("dashboardButtonThree")));
	Mojo.Event.listen(this.controller.get("dashboardButtonFour"),Mojo.Event.tap, this.buttonTap.bind(this, this.controller.get("dashboardButtonFour")));
	Mojo.Event.listen(this.controller.get("dashboardButtonFive"),Mojo.Event.tap, this.buttonTap.bind(this, this.controller.get("dashboardButtonFive")));
	*/
	
	this.updateLayout();
	
};

DashboardAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

DashboardAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DashboardAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};




DashboardAssistant.prototype.closeDashboard = function(event) {

	//Mojo.Log.info("cookie object is %j",WebMyth.prefsCookieObject);

	WebMyth.prefsCookie.put(WebMyth.prefsCookieObject);
	
	this.controller.window.close();

};

DashboardAssistant.prototype.nextLayout = function() {

	WebMyth.prefsCookieObject.dashboardRemoteIndex++;
	
	if(WebMyth.prefsCookieObject.dashboardRemoteIndex > this.maxDashboardRemoteIndex) {
		WebMyth.prefsCookieObject.dashboardRemoteIndex = 0;
	}
	
	//Mojo.Log.info("new dashboard layout index is "+WebMyth.prefsCookieObject.dashboardRemoteIndex);
	
	this.updateLayout();

};

DashboardAssistant.prototype.updateLayout = function() {

	//Mojo.Log.info("New layout is %s, %s",WebMyth.prefsCookieObject.dashboardRemoteIndex,this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].layoutName);
	
	
	var props = {
		class1: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[0].className,
		label1: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[0].label, 
		class2: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[1].className,
		label2: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[1].label, 
		class3: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[2].className,
		label3: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[2].label, 
		class4: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[3].className,
		label4: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[3].label, 
		class5: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[4].className,
		label5: this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[4].label, 
	};
	
	var messageText = Mojo.View.render({object: props, template: 'dashboard/dashboard-scene-template'});
	var messageDiv = this.controller.get('dashboard-template-content');
	Element.update(messageDiv, messageText);
	
	
	this.startButtonListening();

};

DashboardAssistant.prototype.startButtonListening = function() {

	//Mojo.Log.info("starting to listen to buttons");
	
	
	//Buttons
	Mojo.Event.listen(this.controller.get("dashboardButtonOne"),Mojo.Event.tap, this.buttonTap.bind(this, "dashboardButtonOne"));
	Mojo.Event.listen(this.controller.get("dashboardButtonTwo"),Mojo.Event.tap, this.buttonTap.bind(this, "dashboardButtonTwo"));
	Mojo.Event.listen(this.controller.get("dashboardButtonThree"),Mojo.Event.tap, this.buttonTap.bind(this, "dashboardButtonThree"));
	Mojo.Event.listen(this.controller.get("dashboardButtonFour"),Mojo.Event.tap, this.buttonTap.bind(this, "dashboardButtonFour"));
	Mojo.Event.listen(this.controller.get("dashboardButtonFive"),Mojo.Event.tap, this.buttonTap.bind(this, "dashboardButtonFive"));
	
};

DashboardAssistant.prototype.buttonTap = function(element, event) {

	var name = element;
	
	switch(name)
	{
		//Navigation commands
		case 'dashboardButtonOne':
			if(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[0].type == 'key') {
				this.sendTelnetKey(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[0].key);
			} else {
				this.sendJumpPoint(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[0].jump);
			}
		  break;
		case 'dashboardButtonTwo':
			if(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[1].type == 'key') {
				this.sendTelnetKey(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[1].key);
			} else {
				this.sendJumpPoint(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[1].jump);
			}
		  break;
		case 'dashboardButtonThree':
			if(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[2].type == 'key') {
				this.sendTelnetKey(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[2].key);
			} else {
				this.sendJumpPoint(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[2].jump);
			}
		  break;
		case 'dashboardButtonFour':
			if(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[3].type == 'key') {
				this.sendTelnetKey(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[3].key);
			} else {
				this.sendJumpPoint(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[3].jump);
			}
		  break;
		case 'dashboardButtonFive':
			if(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[4].type == 'key') {
				this.sendTelnetKey(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[4].key);
			} else {
				this.sendJumpPoint(this.dashboardRemoteButtons[WebMyth.prefsCookieObject.dashboardRemoteIndex].buttons[4].jump);
			}
		  break;
	
	}
	
};

DashboardAssistant.prototype.sendTelnetKey = function(value) {
	//this.sendTelnet("key "+value);
	
	//this.controller.stageController.parentSceneAssistant(this).sendKey(value); 
	WebMyth.sendKey(value);
	
	if(WebMyth.prefsCookieObject.remoteVibrate) {
		this.controller.stageController.getAppController().playSoundNotification( "vibrate", "" );
	};
	
	//Mojo.Log.info("Sending command '%s' to host", value);
};

DashboardAssistant.prototype.sendJumpPoint = function(value){
	//this.sendTelnet("key "+value);
	
	//this.controller.stageController.parentSceneAssistant(this).sendJump(value); 
	WebMyth.sendJump(value);
	
	if(WebMyth.prefsCookieObject.remoteVibrate) {
		this.controller.stageController.getAppController().playSoundNotification( "vibrate", "" );
	};
	
	//Mojo.Log.info("Sending jump '%s' to host", value);
};
