//Code for creating hostnameDb

function is_int(value){
	  if((parseFloat(value) == parseInt(value)) && !isNaN(parseInt(value))){
	      return true;
	 } else {
	      return false;
	 }
};

function openTelnet(hostname, port) {
	//asdf
	telnetPlug.PDLOpenTelnetConnection(hostname, port);
};

function sendCommand(value) {
	//asdf
	telnetPlug.PDLSendTelnet(value);
};

function sendCommandwithReply(value) {
	//asdf
	var response = telnetPlug.PDLSendTelnetWithReply(value);
	
	return ressponse;
};

function closeTelnet() {
	//asdf
	telnetPlug.PDLCloseTelnetConnection();
};
