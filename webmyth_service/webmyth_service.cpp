/*
 *   WebMyth - An open source webOS app for controlling a MythTV frontend. 
 *   http://code.google.com/p/WebMyth/
 *   Copyright (C) 2010  Wes Brown
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this program; if not, write to the Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
 
 
 
#include <stdio.h>
#include <math.h>

//#include <signal.h>
//#include <unistd.h>
//#include <fcntl.h>
//#include <errno.h>
#include <arpa/inet.h>
//#include <sys/socket.h>
//#include <sys/types.h>
#include <netdb.h>
#include <string>
#include <syslog.h>


#include "SDL.h"
#include "PDL.h"

#include "my_global.h"
#include "mysql.h"



#define PACKAGEID "com.thewbman.webmyth.plugin"
#define MAX_BUFFER_LEN 1024
#define MAX_PROTOCOL_BUFFER_LEN 4048
#define concat(a, b)  a ## b

using namespace std;


//Some flags that the main loop looks for
bool doBackgroundFrontendSocket;
bool doBackgroundProtocolCommand;
bool doBackgroundMysqlQuery;
bool doBackgroundMysqlExecute;

bool activeMysql;

	
char logBuffer[MAX_BUFFER_LEN]; 
int logBufferSize;

//Frontend control variables
const char *frontend_host_name;
int frontend_port;

char sendBuffer[MAX_BUFFER_LEN]; 
int sendMsgSize; 
char receiveBuffer[MAX_BUFFER_LEN]; 
int recvMsgSize; 
char newlineBuffer[MAX_BUFFER_LEN]; 
int newlineMsgSize; 

int frontend_sock; 

//Mythprotocol variables
const char *protocol_host_name;
int protocol_port;
int protocolVersion;
const char *protocol_command;

char mpSendBuffer[MAX_BUFFER_LEN]; 
int mpSendMsgSize; 
char mpLengthSendBuffer[MAX_BUFFER_LEN]; 
int mpLengthSendMsgSize; 
char mpReceiveBuffer[MAX_PROTOCOL_BUFFER_LEN]; 
int mpRecvMsgSize; 

int protocol_sock;

//MySQL variables
const char * my_mysql_host;
const char * my_mysql_username;
const char * my_mysql_password;
const char * my_mysql_db;
int my_mysql_port;
const char *my_mysql_response_function;
char my_mysql_query_full[1024];



void pluginStatus(const char *theData){
    const char *params[1];
    params[0] = theData;
    PDL_Err mjErr = PDL_CallJS("pluginStatus", params, 1);
    if ( mjErr != PDL_NOERROR )
    {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
}

void didReceiveData(const char *theData){
    const char *params[1];
    params[0] = theData;
    PDL_Err mjErr = PDL_CallJS("didReceiveData", params, 1);
    if ( mjErr != PDL_NOERROR )
    {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
}

void pluginErrorMessage(const char *errorMessage){
    const char *params[1];
    params[0] = errorMessage;
    PDL_Err mjErr = PDL_CallJS("pluginErrorMessage", params, 1);
    if ( mjErr != PDL_NOERROR )
    {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
}

void pluginErrorMessage(char errorMessage){
    const char *params[1];
    params[0] = (const char *)(errorMessage);
    PDL_Err mjErr = PDL_CallJS("pluginErrorMessage", params, 1);
    if ( mjErr != PDL_NOERROR )
    {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
}

void pluginLogMessage(const char *errorMessage){
    const char *params[1];
    params[0] = errorMessage;
    PDL_Err mjErr = PDL_CallJS("pluginLogMessage", params, 1);
    if ( mjErr != PDL_NOERROR )
    {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
}

void pluginLogMessage(char errorMessage){
    const char *params[1];
    params[0] = (const char *)(errorMessage);
    PDL_Err mjErr = PDL_CallJS("pluginLogMessage", params, 1);
    if ( mjErr != PDL_NOERROR )
    {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
}

	
	
void backgroundFrontendSocketResponse(){

	//Unless we know otherwise, assume open frontend socket failed
    const char *params[2];
    params[0] = "0";						//success flag
    params[1] = "Unknown open frontend socket error";

	struct sockaddr_in my_sockaddr; 
	struct addrinfo hints, *servinfo, *p;
	int rv;
	
	char ipstr[INET_ADDRSTRLEN];
	
	char * ip_address;


    // Create socket for sending/receiving data
    if ((frontend_sock = socket(AF_INET, SOCK_STREAM, 0)) < 0){
        syslog(LOG_INFO, "Frontend socket() failed");
		params[1] = "Frontend socket() failed";
		PDL_Err mjErr = PDL_CallJS("backgroundFrontendSocketResponse", params, 2);
        return;
    } else {
        syslog(LOG_INFO, "frontend socket() success");
	}

	//Resolve IP with DNS
	if ((rv = getaddrinfo(frontend_host_name, NULL, NULL, &servinfo)) != 0) {
		syslog(LOG_INFO, "Frontend getaddrinfo: %s\0", gai_strerror(rv));
		params[1] = "Frontend getaddrinfo() failed";
		PDL_Err mjErr = PDL_CallJS("backgroundFrontendSocketResponse", params, 2);
        return;
	} else {
		syslog(LOG_INFO, "Success frontend getaddrinfo");
	}

	
    // Set up the server address structure 
    memset(&my_sockaddr, 0, sizeof(my_sockaddr)); 
    my_sockaddr.sin_family = AF_INET; 
    my_sockaddr.sin_port = htons(frontend_port); 
	
	
	for(p = servinfo; p != NULL; p = p->ai_next) {
		void *addr;
	
		struct sockaddr_in *ipv4 = (struct sockaddr_in *)p->ai_addr;
		addr = &(ipv4->sin_addr);
		
		inet_ntop(AF_INET, addr, ipstr, sizeof ipstr);
		
		//sprintf(my_sockaddr.sin_addr.s_addr, "%s", p->ai_addr);
		my_sockaddr.sin_addr.s_addr = inet_addr(ipstr); 
		my_sockaddr.sin_port = htons(frontend_port); 
		my_sockaddr.sin_family = AF_INET; 

		break; // if we get here, we must have connected successfully
	}

	freeaddrinfo(servinfo); // all done with this structure


    // Bind to the local address 
    if (connect(frontend_sock, (struct sockaddr *) &my_sockaddr, sizeof(my_sockaddr)) < 0){
        syslog(LOG_INFO, "Frontend connect() failed");
		params[1] = "Frontend connect() failed";
		PDL_Err mjErr = PDL_CallJS("backgroundFrontendSocketResponse", params, 2);
        return;
    } else {
        syslog(LOG_INFO, "frontend connect() success");
	}

	if ((recvMsgSize = recv(frontend_sock, receiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {
		//Got valid response
		receiveBuffer[recvMsgSize] = '\0';
		syslog(LOG_INFO, receiveBuffer);
		
	} else if (recvMsgSize == 0) {  
		params[1] = "Frontend recvMsgSize == 0";
		PDL_Err mjErr = PDL_CallJS("backgroundFrontendSocketResponse", params, 2); 
		return;
		
    } else {
		/* Only acceptable error: recvfrom() would have blocked */
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "initial recvfrom() failed");
			params[1] = "Frontend initial recvfrom() failed";
			PDL_Err mjErr = PDL_CallJS("backgroundFrontendSocketResponse", params, 2); 
            return;
        }
    }
	
	//If we got here we got a valid response
	params[0] = "1";
	params[1] = "Connected to frontend";
	
	syslog(LOG_INFO, "About to return backgroundFrontendSocketResponse with %s, %s", params[0], params[1]);
    PDL_Err mjErr = PDL_CallJS("backgroundFrontendSocketResponse", params, 2);

	return;

}



void cleanProtocolVersion(int protoVer){
	
	switch(protoVer) {
		case 64:
			mpSendMsgSize = sprintf(mpSendBuffer, "%s", "MYTH_PROTO_VERSION 64 8675309J");
		  break;
		case 63:
			mpSendMsgSize = sprintf(mpSendBuffer, "%s", "MYTH_PROTO_VERSION 63 3875641D");
		  break;
		case 62:
			mpSendMsgSize = sprintf(mpSendBuffer, "%s", "MYTH_PROTO_VERSION 62 78B5631E");
		  break;
		default: 
			mpSendMsgSize = sprintf(mpSendBuffer, "%s %d", "MYTH_PROTO_VERSION", protoVer);
		  break;
	}
	
	
	syslog(LOG_INFO, mpSendBuffer);
	
	return;
	
}

void sendProtocolLength(void){

	//Have already prepared main message, need to send length header

	//syslog(LOG_INFO, "Starting to send MP length %d", mpSendMsgSize);
	
	/*
	if(mpSendMsgSize > 9999) {
		mpLengthSendMsgSize = sprintf(mpLengthSendBuffer, "%d   ", mpSendMsgSize);
	} else if(mpSendMsgSize > 999) {
		mpLengthSendMsgSize = sprintf(mpLengthSendBuffer, "%d    ", mpSendMsgSize);
	} else if(mpSendMsgSize > 99) {
		mpLengthSendMsgSize = sprintf(mpLengthSendBuffer, "%d     ", mpSendMsgSize);
	} else if(mpSendMsgSize > 9) {
		mpLengthSendMsgSize = sprintf(mpLengthSendBuffer, "%d      ", mpSendMsgSize);
	} else {
		mpLengthSendMsgSize = sprintf(mpLengthSendBuffer, "%d       ", mpSendMsgSize);
	} 
	*/
	
	mpLengthSendMsgSize = sprintf(mpLengthSendBuffer, "%-8d", mpSendMsgSize);
	
	
	if(sendto(protocol_sock, mpLengthSendBuffer, mpLengthSendMsgSize, 0, NULL, 0) != mpLengthSendMsgSize){
		syslog(LOG_INFO, "protocol length sendto() failed");
		return;
	}
	
	return;
}

void backgroundProtocolCommandResponse(){

	struct sockaddr_in my_sockaddr; 
	struct addrinfo hints, *servinfo, *p;
	int rv;
	
	char ipstr[INET_ADDRSTRLEN];
	
	char * ip_address;
	
	//char * tmpFinalResponse;
	string finalResponse;
	int finalResponseLength;
	
	
	// Create socket for sending/receiving data
    if ((protocol_sock = socket(AF_INET, SOCK_STREAM, 0)) < 0){
        syslog(LOG_INFO, "socket() failed");
		//PDL_JSException(params, "mp socket() failed - 1");
        return;
    } else {
        syslog(LOG_INFO, "mp socket() success");
	}

	//Resolve IP with DNS
	if ((rv = getaddrinfo(protocol_host_name, NULL, NULL, &servinfo)) != 0) {
		syslog(LOG_INFO, "mp getaddrinfo: %s\0", gai_strerror(rv));
		//PDL_JSException(params, "mp getaddrinfo() failed - 1");
        return;
	} else {
		syslog(LOG_INFO, "mp Success getaddrinfo");
	}

    // Set up the server address structure 
    memset(&my_sockaddr, 0, sizeof(my_sockaddr)); 
    my_sockaddr.sin_family = AF_INET; 
    //my_sockaddr.sin_addr.s_addr = inet_addr(ip_address); 
    my_sockaddr.sin_port = htons(protocol_port); 
	
	
	
	for(p = servinfo; p != NULL; p = p->ai_next) {
		void *addr;
	
		struct sockaddr_in *ipv4 = (struct sockaddr_in *)p->ai_addr;
		addr = &(ipv4->sin_addr);
		
		inet_ntop(AF_INET, addr, ipstr, sizeof ipstr);
		
		//sprintf(my_sockaddr.sin_addr.s_addr, "%s", p->ai_addr);
		my_sockaddr.sin_addr.s_addr = inet_addr(ipstr); 
		my_sockaddr.sin_port = htons(protocol_port); 
		my_sockaddr.sin_family = AF_INET; 

		break; // if we get here, we must have connected successfully
	}

	freeaddrinfo(servinfo); // all done with this structure


    // Bind to the local address 
    if (connect(protocol_sock, (struct sockaddr *) &my_sockaddr, sizeof(my_sockaddr)) < 0){
        syslog(LOG_INFO, "mp connect() failed");
		//PDL_JSException(params, "mp connect() failed - 1");
        return;
    } else {
        syslog(LOG_INFO, "mp connect() success");
	}
	
	sprintf(logBuffer, "Finished mp connect() success");
	pluginLogMessage(logBuffer);

	
	//Send initial protocol information
	cleanProtocolVersion(protocolVersion);
	//syslog(LOG_INFO, "Done cleanProtocolVersion");
	sendProtocolLength();
	//syslog(LOG_INFO, "Done cleanProtocolVersion sendProtocolLength");
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol version  sendto() failed");
		//PDL_JSReply(params, "protocol version sendto() failed");
		return;
	}
	
	//Should get an ACCEPT command
	if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {

		mpReceiveBuffer[mpRecvMsgSize] = '\0';
		syslog(LOG_INFO, mpReceiveBuffer);
		
		char *acceptSubstring;
		acceptSubstring=strndup(mpReceiveBuffer+8, 6);
		//syslog(LOG_INFO, acceptSubstring);
		
		if(strcmp(acceptSubstring,"ACCEPT") == 0) {
			//Got what we wanted
		} else {
			//PDL_JSException(params, "did not get ACCEPT response");
			return;
		}
		
	} else if (mpRecvMsgSize == 0) {
		//PDL_JSException(params, "mp ACCEPT recvMsgSize == 0");
		return;
    } else {
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "mp ACCEPT recvfrom() failed");
            return;
        }
    }
	
	
	//Now send announcement of self
	mpSendMsgSize = sprintf(mpSendBuffer, "ANN Monitor webmyth-app 0");
	sendProtocolLength();
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol ANN sendto() failed");
		//PDL_JSReply(params, "protocol ANN sendto() failed");
		return;
	}
	
	//Should get an OK command
	if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {

		mpReceiveBuffer[mpRecvMsgSize] = '\0';
		syslog(LOG_INFO, mpReceiveBuffer);
		
		if(strcmp(mpReceiveBuffer,"2       OK") == 0) {
			//Got what we wanted
		} else {
			//PDL_JSException(params, "did not get OK response");
			return;
		}
		
	} else if (mpRecvMsgSize == 0) {
		//PDL_JSException(params, "mp OK recvMsgSize == 0");
		return;
    } else {
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "mp OK recvfrom() failed");
            return;
        }
    }
	
	//Now we can send actual command
	mpSendMsgSize = sprintf(mpSendBuffer, protocol_command);
	sendProtocolLength();
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol command sendto() failed");
		//PDL_JSReply(params, "protocol command sendto() failed");
		return;
	}
	
	//Now just get actual response
	if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {
		mpReceiveBuffer[mpRecvMsgSize] = '\0';
		//syslog(LOG_INFO, mpReceiveBuffer);
		
	} else if (mpRecvMsgSize == 0) {
		//PDL_JSException(params, "mp command recvMsgSize == 0");
		return;
    } else {
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "mp command recvfrom() failed");
            return;
        }
    }
	
	//Determine if we need to get multiple packets together
	finalResponse = mpReceiveBuffer;
	//sprintf(tmpFinalResponse,"%s", mpReceiveBuffer);
	finalResponseLength = atoi(strndup(mpReceiveBuffer+0, 7));
	
	syslog(LOG_INFO, "Current length %d, total length %d", finalResponse.length(), finalResponseLength);
	
	while (finalResponse.length() < finalResponseLength) {
		//syslog(LOG_INFO, "Current length %d, total length %d", finalResponse.length(), finalResponseLength);
		
		//Get more data
		if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {
			mpReceiveBuffer[mpRecvMsgSize] = '\0';
			//syslog(LOG_INFO, mpReceiveBuffer);
			
		} else if (mpRecvMsgSize == 0) {
			//PDL_JSException(params, "mp repeat command recvMsgSize == 0");
			return;
		} else {
			if (errno != EWOULDBLOCK){
				syslog(LOG_INFO, "mp repeat command recvfrom() failed");
				return;
			}
		}
		
		//strcat(finalResponse,mpReceiveBuffer);
		//sprintf(tmpFinalResponse,"%s%s",finalResponse,mpReceiveBuffer);
		//sprintf(finalResponse,tmpFinalResponse);
		finalResponse += mpReceiveBuffer;
	
	} 
	
	
	//Send DONE
	mpSendMsgSize = sprintf(mpSendBuffer, "DONE");
	sendProtocolLength();
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol DONE sendto() failed");
		//PDL_JSReply(params, "protocol DONE sendto() failed");
		return;
	}
	close(protocol_sock);
	
	
	//PDL_JSReply(params, (const char*)finalResponse.c_str());

    //return PDL_TRUE;


    const char *params[1];
    params[0] = (const char*)finalResponse.c_str();
    PDL_Err mjErr = PDL_CallJS("backgroundProtocolCommandResponse", params, 1);
    if ( mjErr != PDL_NOERROR )
    {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
	
	return;

}	



string stringReplace(string originalString, string sought, string replacement){

	std::size_t foundIndex = originalString.find(sought);
	
	while(foundIndex != originalString.npos) {
		originalString.replace(foundIndex, sought.size(), replacement);
		
		//syslog(LOG_INFO,"Found substring, replacing from %s",originalString.c_str());
		
		foundIndex = originalString.find(sought);
	} 
	
	return originalString;

}

void backgroundMysqlResponse(){

	activeMysql = true;
	
	MYSQL mysql;
	MYSQL_RES *res;
	MYSQL_ROW row;
	MYSQL_FIELD *field;
	
	char output[1024];
	int count_fields, i, j;
	string tmpValue;
	
	string finalResponse;
	
	
    //syslog(LOG_INFO,"Starting background MySQL query");
	
	if(!mysql_init(&mysql)){
		syslog(LOG_INFO,"Failed to initilaize MySQL");
		pluginErrorMessage("Failed to initilaize MySQL");
		
		activeMysql = false;
		return;
	}
    
	syslog(LOG_INFO,"mysql connecting");
	
	sprintf(logBuffer, "MySQL query to %s at port %d, db: %s, username: %s\0", my_mysql_host,my_mysql_port,my_mysql_db,my_mysql_username);
	pluginLogMessage(logBuffer);
	
	
	//Should check for log times here for DNS problem   http://serverfault.com/questions/136954/4-7-second-delay-accessing-mysql-across-the-network
		
	if(!mysql_real_connect(&mysql,my_mysql_host,my_mysql_username,my_mysql_password,my_mysql_db,my_mysql_port,NULL,0)) {
		//char errorMessageText;
		//sprintf(errorMessageText,"Failed to connect to database: Error: %s\0",mysql_error(&mysql));
		syslog(LOG_INFO,"Failed to connect to database: Error: %s\0",mysql_error(&mysql));
		pluginErrorMessage(mysql_error(&mysql));
		
		activeMysql = false;
		return;
	}
	
	
	syslog(LOG_INFO,"mysql query: %s",my_mysql_query_full);
	
	sprintf(logBuffer, "Full mysql query: %s",my_mysql_query_full);
	pluginLogMessage(logBuffer);
  
	if(mysql_real_query(&mysql,my_mysql_query_full,(unsigned int)(strlen(my_mysql_query_full))) != 0){
		//char errorMessageText;
		//sprintf(errorMessageText,"Error in MySQL query: Error: %s\0",mysql_error(&mysql));
		syslog(LOG_INFO,"Error in MySQL query: Error: %s\0",mysql_error(&mysql));
		pluginErrorMessage(mysql_error(&mysql));
		
		activeMysql = false;
		return;
	
	}
   
	

	//syslog(LOG_INFO,"mysql result");
	
	res = mysql_use_result(&mysql);
	
	if(!res) {
		//char errorMessageText;
		//sprintf(errorMessageText,"Error in MySQL result: Error: %s\0",mysql_error(&mysql));
		syslog(LOG_INFO,"Error in MySQL result: Error: %s\0",mysql_error(&mysql));
		pluginErrorMessage(mysql_error(&mysql));
		
		activeMysql = false;
		return;
	
	}
	
	count_fields =  mysql_num_fields(res);
	syslog(LOG_INFO,"Total columns: %d",count_fields);
	
	char * field_names[count_fields];
	i = 0;
	
	while(field = mysql_fetch_field(res)) {
		//syslog(LOG_INFO,"field name %s\0", field->name);
		field_names[i] = field->name;
		i++;
	}

	finalResponse = "[ ";
	
	while(row = mysql_fetch_row(res)){
		//syslog(LOG_INFO,"%s",(const char*)finalResponse.c_str());
		
		finalResponse += " { \"";
		
		for(i = 0; i < count_fields; i++){
		
			if(i > 0){
				finalResponse += "\" , \"";
			}
		
			finalResponse += field_names[i];
			finalResponse += "\" : \"";
			if(row[i]){
				tmpValue = "";
				
				tmpValue = stringReplace(stringReplace(row[i],"\"","'"),"\\","\\\\");
				
				finalResponse += tmpValue;
				//syslog(LOG_INFO,"value is %s",row[i]);
			} else {
				//syslog(LOG_INFO,"value is null");
			}
			
		}
		
		finalResponse += "\" }, ";
		 
	}
	
	finalResponse += " ]";
	
	//syslog(LOG_INFO,"Full JSON: %s",(const char*)finalResponse.c_str());
	
	//syslog(LOG_INFO,"mysql after JSON");

	mysql_free_result(res);	
	mysql_close(&mysql);
	
	
	
	
    const char *params[1];
    params[0] = (const char*)finalResponse.c_str();
    //PDL_Err mjErr = PDL_CallJS("backgroundMysqlResponse", params, 1);
    PDL_Err mjErr = PDL_CallJS(my_mysql_response_function, params, 1);
	
    if ( mjErr != PDL_NOERROR ) {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
	
	
	activeMysql = false;
	
	return;

}	

void backgroundMysqlExecute(){

	activeMysql = true;
	
	MYSQL mysql;
	MYSQL_RES *res;
	MYSQL_ROW row;
	MYSQL_FIELD *field;
	
	char output[1024];
	int count_rows, i, j;
	string tmpValue;
	
	string finalResponse;
	
	
    syslog(LOG_INFO,"Starting background MySQL execute");
	
	if(!mysql_init(&mysql)){
		syslog(LOG_INFO,"Failed to initilaize MySQL");
		pluginErrorMessage("Failed to initilaize MySQL");
		
		activeMysql = false;
		return;
	}
    
	syslog(LOG_INFO,"mysql connecting");
	
	sprintf(logBuffer, "MySQL query to %s at port %d, db: %s, username: %s\0", my_mysql_host,my_mysql_port,my_mysql_db,my_mysql_username);
	pluginLogMessage(logBuffer);
	
	//Should check for log times here for DNS problem   http://serverfault.com/questions/136954/4-7-second-delay-accessing-mysql-across-the-network
		
	if(!mysql_real_connect(&mysql,my_mysql_host,my_mysql_username,my_mysql_password,my_mysql_db,my_mysql_port,NULL,0)) {
		//char errorMessageText;
		//sprintf(errorMessageText,"Failed to connect to database: Error: %s\0",mysql_error(&mysql));
		syslog(LOG_INFO,"Failed to connect to database: Error: %s\0",mysql_error(&mysql));
		pluginErrorMessage(mysql_error(&mysql));
		
		activeMysql = false;
		return;
	}
	
	
	syslog(LOG_INFO,"mysql query execute: %s",my_mysql_query_full);
	
	sprintf(logBuffer, "mysql query: %s",my_mysql_query_full);
	pluginLogMessage(logBuffer);

  
	if(mysql_real_query(&mysql,my_mysql_query_full,(unsigned int)(strlen(my_mysql_query_full))) != 0){
		//char errorMessageText;
		//sprintf(errorMessageText,"Error in MySQL query: Error: %s\0",mysql_error(&mysql));
		syslog(LOG_INFO,"Error in MySQL query: Error: %s\0",mysql_error(&mysql));
		pluginErrorMessage(mysql_error(&mysql));
		
		activeMysql = false;
		return;
	
	}
   
	

	syslog(LOG_INFO,"mysql execute result");
	
	count_rows = mysql_affected_rows(&mysql);
	
	syslog(LOG_INFO,"Total rows affected: %d",count_rows);
	
	
	
	
	syslog(LOG_INFO,"mysql after JSON");
	
	mysql_close(&mysql);
	
	
	
	
    const char *params[1];
    params[0] = "Done executing";
    //PDL_Err mjErr = PDL_CallJS("backgroundMysqlResponse", params, 1);
    PDL_Err mjErr = PDL_CallJS(my_mysql_response_function, params, 1);
	
    if ( mjErr != PDL_NOERROR ) {
        syslog(LOG_INFO, "error: %s\0", PDL_GetError());
    }
	
	
	activeMysql = false;
	
	return;

}	



PDL_bool openBackgroundFrontendSocket(PDL_JSParameters *params) {
	//function(frontend_host_name, port)

	frontend_host_name = PDL_GetJSParamString(params, 0);
	frontend_port = PDL_GetJSParamInt(params, 1);
	
	doBackgroundFrontendSocket = true;
	
	//Fake an event to trigger main loop
	SDL_Event Event;
	Event.active.type = SDL_ACTIVEEVENT;
	Event.active.gain = 1;
	Event.active.state = 0; // no state makes this event meaningless 
	SDL_PushEvent(&Event);
	
	//Return to JS, will do frontend connection in background
	PDL_JSReply(params, "Started frontend background command");
	syslog(LOG_INFO, "Started frontend background command");
    return PDL_TRUE;
}

PDL_bool openFrontendSocket(PDL_JSParameters *params) {
	//function(frontend_host_name, port)

	frontend_host_name = PDL_GetJSParamString(params, 0);
	frontend_port = PDL_GetJSParamInt(params, 1);
	
    const char *frontend_host_name = PDL_GetJSParamString(params, 0);
    int port = PDL_GetJSParamInt(params, 1);
	
	struct sockaddr_in my_sockaddr; 
	struct addrinfo hints, *servinfo, *p;
	int rv;
	
	char ipstr[INET_ADDRSTRLEN];
	
	char * ip_address;


    // Create socket for sending/receiving data
    if ((frontend_sock = socket(AF_INET, SOCK_STREAM, 0)) < 0){
        syslog(LOG_INFO, "socket() failed");
		PDL_JSException(params, "socket() failed - 1");
        return PDL_FALSE;
    } else {
        syslog(LOG_INFO, "socket() success");
	}

	//Resolve IP with DNS
	if ((rv = getaddrinfo(frontend_host_name, NULL, NULL, &servinfo)) != 0) {
		syslog(LOG_INFO, "getaddrinfo: %s\0", gai_strerror(rv));
		PDL_JSException(params, "getaddrinfo() failed - 1");
        return PDL_FALSE;
	} else {
		syslog(LOG_INFO, "Success getaddrinfo");
	}

    // Set up the server address structure 
    memset(&my_sockaddr, 0, sizeof(my_sockaddr)); 
    my_sockaddr.sin_family = AF_INET; 
    //my_sockaddr.sin_addr.s_addr = inet_addr(ip_address); 
    my_sockaddr.sin_port = htons(frontend_port); 
	
	
	
	for(p = servinfo; p != NULL; p = p->ai_next) {
		void *addr;
	
		struct sockaddr_in *ipv4 = (struct sockaddr_in *)p->ai_addr;
		addr = &(ipv4->sin_addr);
		
		inet_ntop(AF_INET, addr, ipstr, sizeof ipstr);
		
		//sprintf(my_sockaddr.sin_addr.s_addr, "%s", p->ai_addr);
		my_sockaddr.sin_addr.s_addr = inet_addr(ipstr); 
		my_sockaddr.sin_port = htons(port); 
		my_sockaddr.sin_family = AF_INET; 

		break; // if we get here, we must have connected successfully
	}

	freeaddrinfo(servinfo); // all done with this structure


    // Bind to the local address 
    if (connect(frontend_sock, (struct sockaddr *) &my_sockaddr, sizeof(my_sockaddr)) < 0){
        syslog(LOG_INFO, "connect() failed");
		PDL_JSException(params, "connect() failed - 1");
        return PDL_FALSE;
    } else {
        syslog(LOG_INFO, "connect() success");
	}

	if ((recvMsgSize = recv(frontend_sock, receiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {
		//Got valid response
		receiveBuffer[recvMsgSize] = '\0';
		
		//syslog(LOG_INFO, receiveBuffer);
		
	} else if (recvMsgSize == 0) {
	
		PDL_JSException(params, "recvMsgSize == 0");
            
		return PDL_FALSE;
		
    } else {
		/* Only acceptable error: recvfrom() would have blocked */
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "iniital recvfrom() failed");
            return PDL_FALSE;
        }
    }
	
	
	PDL_JSReply(params, receiveBuffer);

    return PDL_TRUE;
}

PDL_bool sendData(PDL_JSParameters *params){
	//function(dataToSend)
	
	const char * dataToSend = PDL_GetJSParamString(params, 0);
	
	//syslog(LOG_INFO, "Received sendData request: %s", dataToSend);
	
	sendMsgSize = sprintf(sendBuffer, "%s", dataToSend);
	newlineMsgSize = sprintf(newlineBuffer, "\n\r");
	
	//syslog(LOG_INFO, "About to sendto() with length %d", sendMsgSize);
	
	if(sendMsgSize == 0){
		syslog(LOG_INFO, "Tried to send message of zero length");
		PDL_JSReply(params, "Tried to send message of zero length");
		return PDL_FALSE;
	}
	
	//Send command
	if(sendto(frontend_sock, sendBuffer, sendMsgSize, 0, NULL, 0) != sendMsgSize){
		syslog(LOG_INFO, "sendto() failed");
		PDL_JSReply(params, "sendto() failed");
		return PDL_FALSE;
	}
	
	//Send new line
	if(sendto(frontend_sock, newlineBuffer, newlineMsgSize, 0, NULL, 0) != newlineMsgSize){
		syslog(LOG_INFO, "sendto() newline failed");
		PDL_JSReply(params, "sendto() newline failed");
		return PDL_FALSE;
	}
	
	
	
	//Get response
	if ((recvMsgSize = recv(frontend_sock, receiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {
		//Got valid response
		receiveBuffer[recvMsgSize] = '\0';
		PDL_JSReply(params, receiveBuffer);
		return PDL_TRUE;
	} else if (recvMsgSize == 0) {
		syslog(LOG_INFO, "recvMsgSize == 0");
		PDL_JSReply(params, "recvMsgSize == 0");
		return PDL_FALSE;
	} else {
		syslog(LOG_INFO, "Unknown sendto() error");
		PDL_JSReply(params, "Unknown sendto() error");
		return PDL_FALSE;
	}
		
}

PDL_bool closeSocket(PDL_JSParameters *params){

    close(frontend_sock);
		
	PDL_JSReply(params, "Socket closed");
    return PDL_TRUE;
	
}



PDL_bool mythprotocolBackgroundCommand(PDL_JSParameters *params){
	//function(protocol_host_name, port, protocolVersion, command)
	
	protocol_host_name = PDL_GetJSParamString(params, 0);
    protocol_port = PDL_GetJSParamInt(params, 1);
    protocolVersion = PDL_GetJSParamInt(params, 2);
	protocol_command = PDL_GetJSParamString(params, 3);
	
	doBackgroundProtocolCommand = true;
	
	//Fake an event to trigger main loop
	SDL_Event Event;
	Event.active.type = SDL_ACTIVEEVENT;
	Event.active.gain = 1;
	Event.active.state = 0; // no state makes this event meaningless 
	SDL_PushEvent(&Event);
	
	//Return to JS, will do protocol connection in background
	PDL_JSReply(params, "Started protocol background command");
    return PDL_TRUE;

}

PDL_bool mythprotocolCommand(PDL_JSParameters *params){
	//function(host_name, port, protocolVersion, command)
	
	const char *host_name = PDL_GetJSParamString(params, 0);
    int port = PDL_GetJSParamInt(params, 1);
    int protocolVersion = PDL_GetJSParamInt(params, 2);
	const char *command = PDL_GetJSParamString(params, 3);
		
	struct sockaddr_in my_sockaddr; 
	struct addrinfo hints, *servinfo, *p;
	int rv;
	
	char ipstr[INET_ADDRSTRLEN];
	
	char * ip_address;
	
	//char * tmpFinalResponse;
	string finalResponse;
	int finalResponseLength;
	
	
	// Create socket for sending/receiving data
    if ((protocol_sock = socket(AF_INET, SOCK_STREAM, 0)) < 0){
        syslog(LOG_INFO, "socket() failed");
		PDL_JSException(params, "mp socket() failed - 1");
        return PDL_FALSE;
    } else {
        syslog(LOG_INFO, "mp socket() success");
	}

	//Resolve IP with DNS
	if ((rv = getaddrinfo(host_name, NULL, NULL, &servinfo)) != 0) {
		syslog(LOG_INFO, "mp getaddrinfo: %s\0", gai_strerror(rv));
		PDL_JSException(params, "mp getaddrinfo() failed - 1");
        return PDL_FALSE;
	} else {
		syslog(LOG_INFO, "mp Success getaddrinfo");
	}

    // Set up the server address structure 
    memset(&my_sockaddr, 0, sizeof(my_sockaddr)); 
    my_sockaddr.sin_family = AF_INET; 
    //my_sockaddr.sin_addr.s_addr = inet_addr(ip_address); 
    my_sockaddr.sin_port = htons(port); 
	
	
	
	for(p = servinfo; p != NULL; p = p->ai_next) {
		void *addr;
	
		struct sockaddr_in *ipv4 = (struct sockaddr_in *)p->ai_addr;
		addr = &(ipv4->sin_addr);
		
		inet_ntop(AF_INET, addr, ipstr, sizeof ipstr);
		
		//sprintf(my_sockaddr.sin_addr.s_addr, "%s", p->ai_addr);
		my_sockaddr.sin_addr.s_addr = inet_addr(ipstr); 
		my_sockaddr.sin_port = htons(port); 
		my_sockaddr.sin_family = AF_INET; 

		break; // if we get here, we must have connected successfully
	}

	freeaddrinfo(servinfo); // all done with this structure


    // Bind to the local address 
    if (connect(protocol_sock, (struct sockaddr *) &my_sockaddr, sizeof(my_sockaddr)) < 0){
        syslog(LOG_INFO, "mp connect() failed");
		PDL_JSException(params, "mp connect() failed - 1");
        return PDL_FALSE;
    } else {
        syslog(LOG_INFO, "mp connect() success");
	}

	
	//Send initial protocol information
	cleanProtocolVersion(protocolVersion);
	//syslog(LOG_INFO, "Done cleanProtocolVersion");
	sendProtocolLength();
	//syslog(LOG_INFO, "Done cleanProtocolVersion sendProtocolLength");
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol version sendto() failed");
		PDL_JSReply(params, "protocol version sendto() failed");
		return PDL_FALSE;
	}
	
	//Should get an ACCEPT command
	if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {

		mpReceiveBuffer[mpRecvMsgSize] = '\0';
		syslog(LOG_INFO, mpReceiveBuffer);
		
		char *acceptSubstring;
		acceptSubstring=strndup(mpReceiveBuffer+8, 6);
		//syslog(LOG_INFO, acceptSubstring);
		
		if(strcmp(acceptSubstring,"ACCEPT") == 0) {
			//Got what we wanted
		} else {
			PDL_JSException(params, "did not get ACCEPT response");
			return PDL_FALSE;
		}
		
	} else if (mpRecvMsgSize == 0) {
		PDL_JSException(params, "mp ACCEPT recvMsgSize == 0");
		return PDL_FALSE;
    } else {
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "mp ACCEPT recvfrom() failed");
            return PDL_FALSE;
        }
    }
	
	
	//Now send announcement of self
	mpSendMsgSize = sprintf(mpSendBuffer, "ANN Monitor webmyth-app 0");
	sendProtocolLength();
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol ANN sendto() failed");
		PDL_JSReply(params, "protocol ANN sendto() failed");
		return PDL_FALSE;
	}
	
	//Should get an OK command
	if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {

		mpReceiveBuffer[mpRecvMsgSize] = '\0';
		syslog(LOG_INFO, mpReceiveBuffer);
		
		if(strcmp(mpReceiveBuffer,"2       OK") == 0) {
			//Got what we wanted
		} else {
			PDL_JSException(params, "did not get OK response");
			return PDL_FALSE;
		}
		
	} else if (mpRecvMsgSize == 0) {
		PDL_JSException(params, "mp OK recvMsgSize == 0");
		return PDL_FALSE;
    } else {
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "mp OK recvfrom() failed");
            return PDL_FALSE;
        }
    }
	
	//Now we can send actual command
	mpSendMsgSize = sprintf(mpSendBuffer, command);
	sendProtocolLength();
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol command sendto() failed");
		PDL_JSReply(params, "protocol command sendto() failed");
		return PDL_FALSE;
	}
	
	//Now just get actual response
	if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {
		mpReceiveBuffer[mpRecvMsgSize] = '\0';
		//syslog(LOG_INFO, mpReceiveBuffer);
		
	} else if (mpRecvMsgSize == 0) {
		PDL_JSException(params, "mp command recvMsgSize == 0");
		return PDL_FALSE;
    } else {
        if (errno != EWOULDBLOCK){
            syslog(LOG_INFO, "mp command recvfrom() failed");
            return PDL_FALSE;
        }
    }
	
	//Determine if we need to get multiple packets together
	finalResponse = mpReceiveBuffer;
	//sprintf(tmpFinalResponse,"%s", mpReceiveBuffer);
	finalResponseLength = atoi(strndup(mpReceiveBuffer+0, 7));
	
	syslog(LOG_INFO, "Current length %d, total length %d", finalResponse.length(), finalResponseLength);
	
	while (finalResponse.length() < finalResponseLength) {
		syslog(LOG_INFO, "Current length %d, total length %d", finalResponse.length(), finalResponseLength);
		
		//Get more data
		if ((mpRecvMsgSize = recv(protocol_sock, mpReceiveBuffer, MAX_BUFFER_LEN, 0)) > 0) {
			mpReceiveBuffer[mpRecvMsgSize] = '\0';
			//syslog(LOG_INFO, mpReceiveBuffer);
			
		} else if (mpRecvMsgSize == 0) {
			PDL_JSException(params, "mp repeat command recvMsgSize == 0");
			return PDL_FALSE;
		} else {
			if (errno != EWOULDBLOCK){
				syslog(LOG_INFO, "mp repeat command recvfrom() failed");
				return PDL_FALSE;
			}
		}
		
		//strcat(finalResponse,mpReceiveBuffer);
		//sprintf(tmpFinalResponse,"%s%s",finalResponse,mpReceiveBuffer);
		//sprintf(finalResponse,tmpFinalResponse);
		finalResponse += mpReceiveBuffer;
	
	} 
	
	
	//Send DONE
	mpSendMsgSize = sprintf(mpSendBuffer, "DONE");
	sendProtocolLength();
	if(sendto(protocol_sock, mpSendBuffer, mpSendMsgSize, 0, NULL, 0) != mpSendMsgSize){
		syslog(LOG_INFO, "protocol DONE sendto() failed");
		PDL_JSReply(params, "protocol DONE sendto() failed");
		return PDL_FALSE;
	}
	close(protocol_sock);
	
	
	PDL_JSReply(params, (const char*)finalResponse.c_str());

    return PDL_TRUE;
	
}



PDL_bool mysqlCommand(PDL_JSParameters *params){
	//function(host, username, password, db, port, response_function, query[10])
	
	my_mysql_host = PDL_GetJSParamString(params, 0);
    my_mysql_username = PDL_GetJSParamString(params, 1);
	my_mysql_password = PDL_GetJSParamString(params, 2);
	my_mysql_db = PDL_GetJSParamString(params, 3);
    my_mysql_port = PDL_GetJSParamInt(params, 4);
	my_mysql_response_function = PDL_GetJSParamString(params, 5);
	
	if(activeMysql) {
		//We are in the middle of some other MySQL query/command
		
        PDL_JSException(params, "ERROR: Another query is still active");  
		pluginErrorMessage("ERROR: Another query is still active.  Try again later.");   
		
        return PDL_FALSE; 
	
	} else {
	
		syslog(LOG_INFO, "Will try MySQL query to %s at port %d, db: %s, username: %s\0", my_mysql_host,my_mysql_port,my_mysql_db,my_mysql_username);
		
		/*
		logMessage += "  mysqlCommand: ";
		logMessage += ", DB Host: ";
		logMessage += my_mysql_host;
		logMessage += ", DB Port: ";
		logMessage += my_mysql_port;
		logMessage += ", DB Name: ";
		logMessage += my_mysql_db;
		logMessage += ", DB Username: ";
		logMessage += my_mysql_username;
		*/
	}
	
	const char * query_1 = PDL_GetJSParamString(params, 6);
	const char * query_2 = PDL_GetJSParamString(params, 7);
	const char * query_3 = PDL_GetJSParamString(params, 8);
	const char * query_4 = PDL_GetJSParamString(params, 9);
	const char * query_5 = PDL_GetJSParamString(params, 10);
	const char * query_6 = PDL_GetJSParamString(params, 11);
	const char * query_7 = PDL_GetJSParamString(params, 12);
	const char * query_8 = PDL_GetJSParamString(params, 13);
	const char * query_9 = PDL_GetJSParamString(params, 14);
	const char * query_10 = PDL_GetJSParamString(params, 15);
	
	sprintf(my_mysql_query_full, "%s%s%s%s%s%s%s%s%s%s",query_1,query_2,query_3,query_4,query_5,query_6,query_7,query_8,query_9,query_10);
	
   
	doBackgroundMysqlQuery = true;
	
	
	
	//Fake an event to trigger main loop
	SDL_Event Event;
	Event.active.type = SDL_ACTIVEEVENT;
	Event.active.gain = 1;
	Event.active.state = 0;  
	SDL_PushEvent(&Event);
	
	
	//Return to JS, will do protocol connection in background
	PDL_JSReply(params, "Started mysql command");
	
    return PDL_TRUE;
	
}

PDL_bool mysqlExecute(PDL_JSParameters *params){
	//function(host, username, password, db, port, response_function, query[10])
	
	my_mysql_host = PDL_GetJSParamString(params, 0);
    my_mysql_username = PDL_GetJSParamString(params, 1);
	my_mysql_password = PDL_GetJSParamString(params, 2);
	my_mysql_db = PDL_GetJSParamString(params, 3);
    my_mysql_port = PDL_GetJSParamInt(params, 4);
	my_mysql_response_function = PDL_GetJSParamString(params, 5);
	
	
	if(activeMysql) {
		//We are in the middle of some other MySQL query/command
		
        PDL_JSException(params, "ERROR: Another query is still active");   
		pluginErrorMessage("ERROR: Another query is still active.  Try again later.");   
		    
        return PDL_FALSE; 
	
	}  else {
	
		syslog(LOG_INFO, "Will try MySQL query to %s at port %d, db: %s, username: %s\0", my_mysql_host,my_mysql_port,my_mysql_db,my_mysql_username);
		
		/*
		logMessage += "  mysqlExecute: ";
		logMessage += ", DB Host: ";
		logMessage += my_mysql_host;
		logMessage += ", DB Port: ";
		logMessage += my_mysql_port;
		logMessage += ", DB Name: ";
		logMessage += my_mysql_db;
		logMessage += ", DB Username: ";
		logMessage += my_mysql_username;
		*/
		
	}

	const char * query_1 = PDL_GetJSParamString(params, 6);
	const char * query_2 = PDL_GetJSParamString(params, 7);
	const char * query_3 = PDL_GetJSParamString(params, 8);
	const char * query_4 = PDL_GetJSParamString(params, 9);
	const char * query_5 = PDL_GetJSParamString(params, 10);
	const char * query_6 = PDL_GetJSParamString(params, 11);
	const char * query_7 = PDL_GetJSParamString(params, 12);
	const char * query_8 = PDL_GetJSParamString(params, 13);
	const char * query_9 = PDL_GetJSParamString(params, 14);
	const char * query_10 = PDL_GetJSParamString(params, 15);
	
	sprintf(my_mysql_query_full, "%s%s%s%s%s%s%s%s%s%s",query_1,query_2,query_3,query_4,query_5,query_6,query_7,query_8,query_9,query_10);
	
	doBackgroundMysqlExecute = true;

	
	
	//Fake an event to trigger main loop
	SDL_Event Event;
	Event.active.type = SDL_ACTIVEEVENT;
	Event.active.gain = 1;
	Event.active.state = 0;  
	SDL_PushEvent(&Event);
	
	//Return to JS, will do protocol connection in background
	PDL_JSReply(params, "Started mysql command");
	
    return PDL_TRUE;
	
}


int main(int argc, char** argv) {
    // open syslog in case we want to print out some debugging
    openlog(PACKAGEID, 0, LOG_USER);

    // Initialize the SDL library
    int result = SDL_Init(SDL_INIT_VIDEO);
    if ( result != 0 )
    {
        syslog(LOG_INFO, "Could not init SDL: %s\0", SDL_GetError());
        exit(1);
    }

    PDL_Init(0);

    // register the JS callbacks
    PDL_RegisterJSHandler("openBackgroundFrontendSocket", openBackgroundFrontendSocket);
    PDL_RegisterJSHandler("openFrontendSocket", openFrontendSocket);
    PDL_RegisterJSHandler("sendData", sendData);
    PDL_RegisterJSHandler("closeSocket", closeSocket);
	
    PDL_RegisterJSHandler("mythprotocolCommand", mythprotocolCommand);
    PDL_RegisterJSHandler("mythprotocolBackgroundCommand", mythprotocolBackgroundCommand);
	
    PDL_RegisterJSHandler("mysqlCommand", mysqlCommand);
    PDL_RegisterJSHandler("mysqlExecute", mysqlExecute);

    PDL_JSRegistrationComplete();
	
    pluginStatus("Initialized");
	
	//Reset variables
	doBackgroundFrontendSocket = false;
	doBackgroundProtocolCommand = false;
	doBackgroundMysqlQuery = false;
	
	activeMysql = false;
	
	//logMessage = "done initializing plugin";
	
	//PDL_SetFirewallPortStatus(1900, PDL_TRUE);

    // Event descriptor
    SDL_Event Event;

    do {
       
            while (SDL_WaitEvent(&Event)) {
			
				/*
				if(logMessage.length() > 0) {
					pluginLogMessage();
				}
				*/
				
				//Start the frontend socket command
				if(doBackgroundFrontendSocket) {
					
					backgroundFrontendSocketResponse();
					doBackgroundFrontendSocket = false;
				}
			
				//Start the background protocol command
				if(doBackgroundProtocolCommand) {
					
					backgroundProtocolCommandResponse();
					doBackgroundProtocolCommand = false;
				}
			
				//Start the background mysql query
				if(doBackgroundMysqlQuery) {
					
					backgroundMysqlResponse();
					doBackgroundMysqlQuery = false;
				}
			
				//Start the background mysql execute
				if(doBackgroundMysqlExecute) {
					
					backgroundMysqlExecute();
					doBackgroundMysqlExecute = false;
				}
				
				
			
                switch (Event.type)
                {
                    // List of keys that have been pressed
                    case SDL_KEYDOWN:
                        switch (Event.key.keysym.sym)
                        {
                            // Escape forces us to quit the app
                            case SDLK_ESCAPE:
                                Event.type = SDL_QUIT;
                                break;
                        }
                        break;

                    default:
						
						//syslog(LOG_INFO, "SDL_Event: %s\0", Event.type);		//crashes
                        
						break;
                }
				
				
				//SDL_Delay(1000);		//delay to keep process from trying too hard
			
            }
			
			
		
		//SDL_Delay(1000);
		
    } while (Event.type != SDL_QUIT);


    PDL_Quit();
    SDL_Quit();

    return 0;
}

