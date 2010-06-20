/**
    Palm disclaimer
**/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <iostream>

#include "SDL.h"
#include "SDL_net.h"
#include "pdl.h"

//Global variables
int quit;
char hostName, ipChar;
Uint16 portNumber;
IPaddress ip;
TCPsocket sd;

PDL_bool OpenTelnetConnection(PDL_MojoParameters *parms)
{

	hostName = *PDL_GetMojoParamString(parms, 0);
	portNumber = (int)PDL_GetMojoParamInt(parms, 1);

 
	//Resolve host
	if (SDLNet_ResolveHost(&ip, &hostName, portNumber) < 0)
	{
		fprintf(stderr, "SDLNet_ResolveHost: %s\n", SDLNet_GetError());
		exit(EXIT_FAILURE);
	}

	//Maybe convert hostname to IP address?  Might just return hostname
	ipChar = ip.host;
 
	//Start TCP connection
	if (!(sd = SDLNet_TCP_Open(&ip)))
	{
		fprintf(stderr, "SDLNet_TCP_Open: %s\n", SDLNet_GetError());
		exit(EXIT_FAILURE);
	}

	//Hopefully all went well
	PDL_MojoReply(parms, (const char *)ipChar);
	
	exit(EXIT_SUCCESS);
}


PDL_bool SendTelnetWithReply(PDL_MojoParameters *parms)
{
	const int MAXLEN = 1024;
	int len, result;
	char *response;

	const char *command = PDL_GetMojoParamString(parms, 0);
 
	len = strlen(command) + 1;

	if (SDLNet_TCP_Send(sd, (void *)command, len) < len)
	{
		fprintf(stderr, "SDLNet_TCP_Send: %command\n", SDLNet_GetError());
		exit(EXIT_FAILURE);
	}

	result = SDLNet_TCP_Recv(sd, (void *)response,MAXLEN-1);

	PDL_MojoReply(parms, response);
 
	exit(EXIT_SUCCESS);

}


PDL_bool SendTelnet(PDL_MojoParameters *parms)
{
	int len;

	const char *command = PDL_GetMojoParamString(parms, 0);
 
	len = strlen(command) + 1;

	if (SDLNet_TCP_Send(sd, (void *)command, len) < len)
	{
		fprintf(stderr, "SDLNet_TCP_Send: %command\n", SDLNet_GetError());
		exit(EXIT_FAILURE);
	}
 
	exit(EXIT_SUCCESS);

}


PDL_bool CloseTelnetConnection(PDL_MojoParameters *parms)
{
	SDLNet_TCP_Close(sd);

	exit(EXIT_SUCCESS);
}


int main(int argc, char **argv)
{
	//SDL init
	SDL_Init(SDL_INIT_VIDEO);
	
	//Register PDL functions
	PDL_Err errOpen = PDL_RegisterMojoHandler("PDLOpenTelnetConnection", OpenTelnetConnection); 
	PDL_Err errSendWith = PDL_RegisterMojoHandler("PDLSendTelnetWithReply", SendTelnetWithReply); 
	PDL_Err errSend = PDL_RegisterMojoHandler("PDLSendTelnet", SendTelnet); 
	PDL_Err errClose = PDL_RegisterMojoHandler("PDLCloseTelnetConnection", CloseTelnetConnection); 
	
	PDL_MojoRegistrationComplete();
	
	//Add SDL event to monitor
	SDL_Event Event;
	
	printf("Starting program ...");
	
	
	if (SDLNet_Init() < 0)
	{
		fprintf(stderr, "SDLNet_Init: %s\n", SDLNet_GetError());
		exit(EXIT_FAILURE);
	}

	do
	{
		//Run program commands as needed
	} while (Event.type != SDL_QUIT);
	
	SDLNet_Quit();

	PDL_Quit();

	SDL_Quit();

	return EXIT_SUCCESS;
	
}