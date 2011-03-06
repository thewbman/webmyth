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

 
function WebviewAssistant(mythwebUrl, headerName) {

	   
	this.headerName = headerName;
	   
	this.fullUrl = "http://";
	this.fullUrl += WebMyth.prefsCookieObject.webserverName;
	this.fullUrl += mythwebUrl;

	   
	//this.firstLoad = true;
	   
}

WebviewAssistant.prototype.setup = function() {


	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	$('spinner-text').innerHTML = "Loading... ";//+this.fullUrl;


	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	//Setup view menu
	this.webviewViewMenuAttr = { spacerHeight: 0, menuClass: 'no-fade' };	
	this.webviewViewMenuModel = {
		visible: true,
		items: [{
			items: [
				{},
				{ label: this.headerName, width: 320},
				{}
			]
		}]
	}; 
	this.controller.setupWidget( Mojo.Menu.viewMenu, this.webviewViewMenuAttr, this.webviewViewMenuModel );
	
	/*
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Webview Menu'),
                            items: [{},
									{ label: $L('Reset Mythweb Layout'), command: 'do-resetMythweb' },
									{}
							]
						};
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	*/
	
	//Mojo.Log.info("Full URL is "+this.fullUrl);
	
	//Setup up the WebView widget
	this.controller.setupWidget("WebId",
		this.webviewAttributes = {
			url:    this.fullUrl,
		},
		this.webviewModel = {
		}
	); 
	
	this.controller.listen(this.controller.get( "WebId" ), Mojo.Event.webViewLoadStarted, this.loadingStarted.bind(this));
	this.controller.listen(this.controller.get( "WebId" ), Mojo.Event.webViewLoadStopped, this.loadingStopped.bind(this));
	
	  
};


WebviewAssistant.prototype.activate = function(event) {
};

WebviewAssistant.prototype.deactivate = function(event) {
	   
};

WebviewAssistant.prototype.cleanup = function(event) {
};


WebviewAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case 'do-resetMythweb':
				//adsf
				Mojo.Log.info("reseting page");
				
/*				//Restart spinner and show
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel, this);
				$('spinner-text').innerHTML = "Resetting .. ";
				$('myScrim').show();
*/					
				var resetUrl = "http://";
				resetUrl += WebMyth.prefsCookieObject.webserverName;
				resetUrl += "/mythweb/?RESET_SKIN&RESET_TMPL";
				
				$('WebId').mojo.clearCookies();
				$('WebId').mojo.clearCache();
				$('WebId').mojo.clearHistory();
				
				$('WebId').mojo.reloadPage();
				
				//$('WebId').mojo.openURL(resetUrl);
				$('WebId').mojo.openURL(this.fullUrl);

				
			  break;
			case 'do-topLevelMythweb':
				//adsf
				Mojo.Log.info("top level mythweb template");
					
				var resetUrl = "http://";
				resetUrl += WebMyth.prefsCookieObject.webserverName;
				resetUrl += "/mythweb/";
				
				$('WebId').mojo.openURL(resetUrl);

			  break;
			case 'do-settingsMythweb':
				//adsf
				Mojo.Log.info("settings mythweb template");
					
				var resetUrl = "http://";
				resetUrl += WebMyth.prefsCookieObject.webserverName;
				resetUrl += "/mythweb/settings/";
				
				$('WebId').mojo.openURL(resetUrl);

			  break;
		}
	}
}



WebviewAssistant.prototype.loadingStarted = function(event) {

	//Stop spinner and hide
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').show();
	
	Event.stop(event);
				
};

WebviewAssistant.prototype.loadingStopped = function(event) {

	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide();
	
	Event.stop(event);
				
};
