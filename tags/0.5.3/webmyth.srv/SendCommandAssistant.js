var SendCommandAssistant = function(){
	
}
  
SendCommandAssistant.prototype.run = function(future) {

	this.toSend = this.controller.args.toSend;
  
	if(TelnetService.stream == null) {
		//disconnected
		
		TelnetService.net = IMPORTS.require('net');
        TelnetService.stream = TelnetService.net.createConnection(TelnetService.port, host=TelnetService.address);
		
	}
	
	if(TelnetService.stream.readyState != 'open') {
	
		TelnetService.net = IMPORTS.require('net');
        TelnetService.stream = TelnetService.net.createConnection(TelnetService.port, host=TelnetService.address);
	}
		
		
	try {
		TelnetService.stream.setEncoding("ascii");
		TelnetService.stream.write(this.controller.args.toSend+'\r\n');
	}
	catch(e) {
		TelnetService.stream.destroy();
		
		TelnetService.net = IMPORTS.require('net');
        TelnetService.stream = TelnetService.net.createConnection(TelnetService.port, host=TelnetService.address);
		
		future.result = { reply: "restarting..."};
	}
	
	
    TelnetService.stream.addListener('data',
		function(data){
            future.result = { reply: data.replace("\r\n# ","")};
            //future.result = { "reply": data};
        }
    );
	
   
}


SendCommandAssistant.prototype.sendData = function() {	

	TelnetService.stream.setEncoding("ascii");
	
	TelnetService.stream.write(this.toSend+'\r\n');
	
    TelnetService.stream.addListener('data',
		function(data){
            future.result = { reply: data.replace("\r\n# ","")};
            //future.result = { "reply": data};
        }
    );
   
}