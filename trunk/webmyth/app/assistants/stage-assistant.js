function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

webmyth = {};

StageAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the stage is first created */
	
	webmyth.Metrix = new Metrix(); //Instantiate Metrix Library
	
	//this.controller.pushScene("pluginScene"); //setup for telnet plugin
	
	var startDb = createHostnameDb();
	
	this.controller.pushScene("hostSelector", startDb);
	
	var telnetPlug = document.getElementById("TelnetPlugin");  
};

StageAssistant.prototype.showScene = function(directory, sceneName, arguments) {
	if (arguments === undefined){
		this.controller.pushScene({name: sceneName,
					       		   sceneTemplate: directory + "/" + sceneName + "-scene"})		
	}
	else{
		this.controller.pushScene({name: sceneName,
					       		   sceneTemplate: directory + "/" + sceneName + "-scene"},
								   arguments)				
	}
};
