/**
    Palm disclaimer
**/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <iostream>
//#include <unistd.h>

#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>

#include "SDL.h"
//#include "SDL_net.h"
#include "PDL.h"


//Global variables
char hostName, ipChar;

int sockfd, portNum, n, haveMessage;
struct sockaddr_in serv_addr;
struct hostent *server;

const char *jsMessage[1];

char buffer[256];


PDL_bool OpenTelnetConnection(PDL_JSParameters *parms)
{

	hostName = *PDL_GetJSParamString(parms, 0);
	portNum = PDL_GetJSParamInt(parms, 1);

	
	//Open socket 
	sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        jsMessage[0]="Failed to open socket";
		haveMessage = 1;
		return PDL_FALSE;
	}
	
	//Hostname resolution
	server = gethostbyname(PDL_GetJSParamString(parms, 0));
	if (server == NULL) {
        jsMessage[0]="Failed to get hostname";
		haveMessage = 1;
		return PDL_FALSE;
    }
	
	//Setup for connection
	bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    bcopy((char *)server->h_addr, 
         (char *)&serv_addr.sin_addr.s_addr,
         server->h_length);
    serv_addr.sin_port = htons(portNum);
	
	//Connect to remote host
    if (connect(sockfd,(struct sockaddr *)&serv_addr,sizeof(serv_addr)) < 0) {
        jsMessage[0]="Could not connect";
		haveMessage = 1;
		return PDL_FALSE;
	}

	//Hopefully all went well
	//PDL_JSReply(parms, (const char *)ipChar);
	
	return PDL_TRUE;
};


PDL_bool SendTelnetWithReply(PDL_JSParameters *parms)
{
	const char command = *PDL_GetJSParamString(parms, 0);
	//const char* command = "key down\n";

    //Send command to open socket
    n = write(sockfd,&command,strlen(&command));
    if (n < 0) {
        jsMessage[0]="Failed to send last command";
		haveMessage = 1;
		return PDL_FALSE;
	}
	
	
	//Read response
    bzero(buffer,256);
    n = read(sockfd,buffer,255);
	if (n < 0) {
        jsMessage[0]="No reponse from server";
		haveMessage = 1;
		return PDL_FALSE;
	}
	PDL_JSReply(parms, buffer);   
 

	return PDL_TRUE;

};


PDL_bool SendTelnet(PDL_JSParameters *parms)
{
	const char command = *PDL_GetJSParamString(parms, 0);
	//const char* command = "key down\n";

    //Send command to open socket
    n = write(sockfd,&command,strlen(&command));
    if (n < 0) {
        jsMessage[0]="Failed to send last command";
		haveMessage = 1;
		return PDL_FALSE;
	}
	
	/*
	//Read response
    bzero(buffer,256);
    n = read(sockfd,buffer,255);
	if (n < 0) {
        jsMessage[0]="No reponse from server";
		haveMessage = 1;
		return PDL_FALSE;
	}
	PDL_JSReply(parms, buffer);   
	*/

	return PDL_TRUE;

};


PDL_bool CloseTelnetConnection(PDL_JSParameters *parms)
{
	//Close telnet socket
	close(sockfd);
	
	return PDL_TRUE;
};


int main(int argc, char **argv)
{
	// Initialize the SDL library with the Video subsystem
    int result = SDL_Init(SDL_INIT_VIDEO);
    
    if ( result != 0 )
    {
        printf("Could not init SDL: %s\n", SDL_GetError());
        exit(1);
    }
	
	
	PDL_Init(0);
	
	
	//Register PDL functions
	PDL_RegisterJSHandler("OpenTelnetConnection", OpenTelnetConnection); 
	PDL_RegisterJSHandler("SendTelnetWithReply", SendTelnetWithReply); 
	PDL_RegisterJSHandler("SendTelnet", SendTelnet); 
	PDL_RegisterJSHandler("CloseTelnetConnection", CloseTelnetConnection); 
	
	PDL_JSRegistrationComplete();

	
	//Add SDL event to monitor
	SDL_Event Event;
	
	//Initialize variables
	haveMessage = 0;

	do
	{
		SDL_Delay(100); //Wait 0.1 seconds to reduce CPU usage
		
		//For sending messages back to JS app
		if(haveMessage == 1) {
			PDL_CallJS("pluginMessageFunc", jsMessage, 1);
			haveMessage = 0;
			jsMessage[0] = "";
		}
		
	} while (Event.type != SDL_QUIT);
	
	PDL_Quit();
	SDL_Quit();

	return EXIT_SUCCESS;
	
}