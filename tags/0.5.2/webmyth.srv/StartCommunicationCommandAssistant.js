TelnetService = {};


var StartCommunicationCommandAssistant = function(){

   TelnetService.net = IMPORTS.require('net');
  
	
}
  
StartCommunicationCommandAssistant.prototype.run = function(future) {  
   
		
		TelnetService.port = this.controller.args.port;
		TelnetService.address = this.controller.args.address;
		
		TelnetService.stream = TelnetService.net.createConnection(TelnetService.port, host=TelnetService.address);
	
	
	
   

   
    TelnetService.stream.addListener('connect',
        function(){
            future.result = { reply: 'connection established'};
        }
    );
    // TelnetService.stream.addListener('data',
       // function(data){
            // future.result = { reply: data.substring(0,data.length-2)};
        // }
    // );
    TelnetService.stream.addListener('close',
        function(){
            future.result = { reply: 'closed'};
            console.log('close');
        }
    );
    // stream.addListener('error',
        // function(exception){
            // future.result = { reply: 'error:' + exception};
            // console.log('close');
        // }
    // );
   
}