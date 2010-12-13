MythprotocolService = {};


var MythprotocolCommandAssistant = function(){

   MythprotocolService.net = IMPORTS.require('net');
  
	
}
  
MythprotocolCommandAssistant.prototype.run = function(future) {  
   
		
	MythprotocolService.port = this.controller.args.port;
	MythprotocolService.address = this.controller.args.address;
	MythprotocolService.protocolVersionCommand = this.controller.args.protocolVersionCommand;
	MythprotocolService.command = this.controller.args.command;
	MythprotocolService.timeout = this.controller.args.timeout;
	
	MythprotocolService.returnData = "";
	
	MythprotocolService.returnStats = {};
	
		
	MythprotocolService.stream = MythprotocolService.net.createConnection(MythprotocolService.port, host=MythprotocolService.address);
	

   
	MythprotocolService.stream.addListener('connect',
		function(){
			
			MythprotocolService.stream.setEncoding("utf8");
			MythprotocolService.stream.write(addLengthToCommand(MythprotocolService.protocolVersionCommand));
			
			if(MythprotocolService.timeout){
				setTimeout(function() {
				
					MythprotocolService.returnStats.returnType = "timeout";
				
					if(MythprotocolService.command == "QUERY_GETALLPENDING") {
						future.result = { reply: parsePrograms(MythprotocolService.returnData, 2), stats: MythprotocolService.returnStats };
					} else if(MythprotocolService.command == "QUERY_RECORDINGS Play") {
						future.result = { reply: parsePrograms(MythprotocolService.returnData, 1), stats: MythprotocolService.returnStats };
					} else {
						future.result = { reply: MythprotocolService.returnData };
					}
					
					
					MythprotocolService.stream.write(addLengthToCommand("DONE"));
					MythprotocolService.stream.close();
					
					return 0;
					
				},MythprotocolService.timeout);
			}
			
		}
	);
	
	MythprotocolService.stream.addListener('data',
		function(data){
		
			if(data.search("ACCEPT") != -1){
				//Accepted protocol declaration, send connection name
				MythprotocolService.stream.write(addLengthToCommand("ANN Monitor webmyth-app 0"));
				
			} else if(data.search("REJECT") != -1){
				//Accepted protocol declaration, send connection name
				future.result = { reply: "ERROR: "+data };
				
				return 0;
				
			} else if(data == "2       OK"){
				//Accepted connection name
				MythprotocolService.stream.write(addLengthToCommand(MythprotocolService.command));
				
			} else if(MythprotocolService.timeout){
				//Will gets lots of data so put it all together
				if(MythprotocolService.returnData == "") {
					MythprotocolService.returnStats.payloadLength = parseInt(data.substring(0,7));
				}
				
				MythprotocolService.returnData += data;	
				
				if(MythprotocolService.returnData.length > MythprotocolService.returnStats.payloadLength){
					
					MythprotocolService.returnStats.returnType = "fullData";
					
					//If we are done with getting all the day
					if(MythprotocolService.command == "QUERY_GETALLPENDING") {
						future.result = { reply: parsePrograms(MythprotocolService.returnData, 2), stats: MythprotocolService.returnStats };
					} else if(MythprotocolService.command == "QUERY_RECORDINGS Play") {
						future.result = { reply: parsePrograms(MythprotocolService.returnData, 1), stats: MythprotocolService.returnStats };
					} else {
						future.result = { reply: MythprotocolService.returnData };
					}
					
					
					MythprotocolService.stream.write(addLengthToCommand("DONE"));
					MythprotocolService.stream.close();
					
					return 0;
					
				}
				
			
			} else {
				future.result = { reply: data };
				
				MythprotocolService.stream.write(addLengthToCommand("DONE"));
				MythprotocolService.stream.close();
				
				return 0;
			}
		}
	);
   
	MythprotocolService.stream.addListener('close',
		function(){
			future.result = { reply: 'Closed'};
			
			return 0;
		}
    );
   
	MythprotocolService.stream.addListener('error',
		function(exception){
			future.result = { reply: 'ERROR: '+exception};
			
			return 0;
		}
    );
	
   
};


var addLengthToCommand = function(originalCommand) {

	var strLength = originalCommand.length;
	var lengthPadding = "";
	
	if(strLength > 9999) {
		lengthPadding = strLength+"   ";
	} else if(strLength > 999) {
		lengthPadding = strLength+"    ";
	} else if(strLength > 99) {
		lengthPadding = strLength+"     ";
	} else if(strLength > 9) {
		lengthPadding = strLength+"      ";
	} else {
		lengthPadding = strLength+"       ";
	} 
	
	return lengthPadding+originalCommand;
	
}

var parsePrograms = function(fullResponse, startOffset) {

	finalList = [];
	fullArray = fullResponse.split("[]:[]");
	
	//Mojo.Log.info("Parsing upcoming total programs is "+fullArray[1]+", length is "+fullArray.length);
	
	MythprotocolService.returnStats.expectedLength = fullArray[startOffset - 1];
	
	
	var i, programNum = 0, fieldNum = 0;
	var singleProgramJson = {};
	var newDate = new Date();
	
	for(i = startOffset; i < fullArray.length; i++){
		switch(fieldNum){
			case 0:
				singleProgramJson.title = fullArray[i];
			  break;
			case 1:
				singleProgramJson.subTitle = fullArray[i];
			  break;
			case 2:
				singleProgramJson.description = fullArray[i];
			  break;
			case 3:
				singleProgramJson.category = fullArray[i];
			  break;
			case 4:
				singleProgramJson.chanId = fullArray[i];
			  break;
			case 5:
				singleProgramJson.channum = fullArray[i];
			  break;
			case 6:
				singleProgramJson.callsign = fullArray[i];
			  break;
			case 7:
				singleProgramJson.channame = fullArray[i];
			  break;
			case 8:
				//singleProgramJson.filename = fullArray[i];
			  break;
			case 9:
				//singleProgramJson.filesize = fullArray[i];
			  break; 
			  
			case 10:
				singleProgramJson.startTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.startTime = dateJSToISO(newDate);
				
			  break;
			case 11:
				singleProgramJson.endTimeInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.endTime = dateJSToISO(newDate);
			  break;
			case 12:
				//singleProgramJson.findId = fullArray[i];
			  break;
			case 13:
				//singleProgramJson.hostname = fullArray[i];
			  break;
			case 14:
				//singleProgramJson.sourceId = fullArray[i];
			  break;
			case 15:
				//singleProgramJson.cardId = fullArray[i];
			  break;
			case 16:
				//singleProgramJson.inputId = fullArray[i];
			  break;
			case 17:
				//singleProgramJson.recPriority = fullArray[i];
			  break;
			case 18:
				singleProgramJson.recStatus = fullArray[i];
			  break;
			case 19:
				//singleProgramJson.recordId = fullArray[i];
			  break;
			  
			case 20:
				singleProgramJson.recType = fullArray[i];
			  break;
			case 21:
				//singleProgramJson.dupin = fullArray[i];
			  break;
			case 22:
				//singleProgramJson.dupMethod = fullArray[i];
			  break;
			case 23:
				singleProgramJson.recStartTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recStartTs = dateJSToISO(newDate);
			  break;
			case 24:
				singleProgramJson.recEndTsInt = fullArray[i];
				
				newDate.setTime(fullArray[i]*1000);
				
				singleProgramJson.recEndTs = dateJSToISO(newDate);
			  break;
			case 25:
				//singleProgramJson.programflags = fullArray[i];
			  break;
			case 26:
				//singleProgramJson.recGroup = fullArray[i];
			  break;
			case 27:
				//singleProgramJson.outputFilters = fullArray[i];
			  break;
			case 28:
				//singleProgramJson.seriesId = fullArray[i];
			  break;
			case 29:
				//singleProgramJson.programId = fullArray[i];
			  break;
			  
			case 30:
				//singleProgramJson.lastModified = fullArray[i];
			  break;
			case 31:
				//singleProgramJson.stars = fullArray[i];
			  break;
			case 32:
				//singleProgramJson.airdate = fullArray[i];
			  break;
			case 33:
				//singleProgramJson.playgroup = fullArray[i];
			  break;
			case 34:
				//singleProgramJson.recpriority2 = fullArray[i];
			  break;
			case 35:
				//singleProgramJson.parentid = fullArray[i];
			  break;
			case 36:
				//singleProgramJson.storagegroup = fullArray[i];
			  break;
			case 37:
				//singleProgramJson.audio_props = fullArray[i];
			  break;
			case 38:
				//singleProgramJson.video_props = fullArray[i];
			  break;
			case 39:
				//singleProgramJson.subtitle_type = fullArray[i];
			  break;
			  
			case 40:
				//41st field, push and reset counters
				//singleProgramJson.year = fullArray[i];
				
				finalList.push(singleProgramJson);
				
				singleProgramJson = {};
				programNum++;
				fieldNum = -1;
			  break;
		}
		
		fieldNum++;
	}
	
	
	MythprotocolService.returnStats.parsedPrograms = programNum;
	
	
	return finalList;
	
}



var dateJSToISO = function(dateJS) { 

	var newDate = dateJS.getFullYear();
	newDate += "-";
	
	var month = dateJS.getMonth() + 1;
	
	if(month.toString().length == 2) {
		newDate += month.toString();
	} else {
		newDate += '0'+month.toString();
	}
	newDate += "-";
	if(dateJS.getDate().toString().length == 2) {
		newDate += dateJS.getDate().toString();
	} else {
		newDate += '0'+dateJS.getDate().toString();
	}
	newDate += "T";
	if(dateJS.getHours().toString().length == 2) {
		newDate += dateJS.getHours().toString();
	} else {
		newDate += '0'+dateJS.getHours().toString();
	}
	newDate += ":";
	if(dateJS.getMinutes().toString().length == 2) {
		newDate += dateJS.getMinutes().toString();
	} else {
		newDate += '0'+dateJS.getMinutes().toString();
	}
	newDate += ":";
	if(dateJS.getSeconds().toString().length == 2) {
		newDate += dateJS.getSeconds().toString();
	} else {
		newDate += '0'+dateJS.getSeconds().toString();
	}
    
	return newDate;
	
};
