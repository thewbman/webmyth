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


function RecordedDetailsAssistant(detailsObject) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.recordedObject = detailsObject;
	   this.standardFilename = '';
	   this.downloadOrStream = '';
  
	   
}

RecordedDetailsAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Starting recorded details scene '%j'", this.recordedObject);
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Play Menu'),
                            items: [{label: $L('Play'), submenu:'hosts-menu', width: 90},{},{label: $L('Web'), submenu:'web-menu', width: 90}]};
 
	this.hostsMenuModel = { label: $L('Hosts'), items: []};
	this.webMenuModel = { label: $L('WebMenu'), items: [
			{"label": $L('themoviedb'), "command": "go-web--themoviedb"},
			{"label": $L('IMDB'), "command": "go-web--IMDB"},
			{"label": $L('TheTVDB'), "command": "go-web--TheTVDB"},
			{"label": $L('TV.com'), "command": "go-web--TV.com"},
			{"label": $L('Google'), "command": "go-web--Google"}
			]};

 
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('hosts-menu', '', this.hostsMenuModel);
	this.controller.setupWidget('web-menu', '', this.webMenuModel);


	
	var screenshotUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	screenshotUrl += "?op=getPremadeImage";
	screenshotUrl += "&chanid="+this.recordedObject.chanid;
	screenshotUrl += "&starttime="+this.recordedObject.recstartts;

	
	//Fill in data values
	$('recorded-screenshot').src = screenshotUrl;
	
	$('scene-title').innerText = this.recordedObject.title;
	$('subtitle-title').innerText = this.recordedObject.subtitle;
	$('description-title').innerText = this.recordedObject.description;
	
	$('hostname-title').innerText = this.recordedObject.hostname;
	$('recgroup-title').innerText = this.recordedObject.recgroup;
	$('starttime-title').innerText = this.recordedObject.starttime;
	$('endtime-title').innerText = this.recordedObject.endtime;
	$('airdate-title').innerText = this.recordedObject.airdate;
	//$('storagegroup-title').innerText = this.recordedObject.storagegroup;
	//$('playgroup-title').innerText = this.recordedObject.playgroup;
	//$('programflags-title').innerText = this.recordedObject.programflags;
	$('programid-title').innerText = this.recordedObject.programid;
	$('seriesid-title').innerText = this.recordedObject.seriesid;
	$('channame-title').innerText = this.recordedObject.channame;
	$('channum-title').innerText = this.recordedObject.channum;
	$('recstartts-title').innerText = this.recordedObject.recstartts;
	
	/*
	var filenameRequestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	filenameRequestUrl += "?op=getCheckfile&chanid=";
	filenameRequestUrl += this.recordedObject.chanid+"&starttime=";
	filenameRequestUrl += this.recordedObject.recstartts;
 
    try {
        var request = new Ajax.Request(filenameRequestUrl,{
            method: 'get',
            evalJSON: 'true',
            onSuccess: function(transport){
				this.standardFilename = transport.responseText;
				Mojo.Log.error('recording filename is '+this.standardFilename);
			},
            onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", filenameRequestUrl);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			} 
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	*/
};

RecordedDetailsAssistant.prototype.activate = function(event) {
	
	//Update list of current hosts
	var hostsList = [];
	var i, s;

	if(WebMyth.prefsCookieObject.allowRecordedDownloads) {
		var downloadCmd = { "label": "Download to device", "command": "go-down-download" }
		var streamCmd = { "label": "Stream to device", "command": "go-down-stream" }
		
		hostsList.push(downloadCmd);
		//hostsList.push(streamCmd);
	}	
	
	for (i = 0; i < WebMyth.hostsCookieObject.length; i++) {

		s = { 
			"label": $L(WebMyth.hostsCookieObject[i].hostname),
			"command": "go-play-"+WebMyth.hostsCookieObject[i].hostname,
			"hostname": WebMyth.hostsCookieObject[i].hostname,
			"port": WebMyth.hostsCookieObject[i].port 
		};
		hostsList.push(s);
		
	};
		
	this.hostsMenuModel.items = hostsList;
	this.controller.modelChanged(this.hostsMenuModel);
	
};

RecordedDetailsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

RecordedDetailsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

RecordedDetailsAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.command) {
  	myCommand = event.command.substring(0,7);
	mySelection = event.command.substring(8);
	//Mojo.Log.error("command: "+myCommand+" host: "+mySelection);

    switch(myCommand) {
      case 'go-play':
		this.playOnHost(mySelection);
       break;
      case 'go-web-':
		this.openWeb(mySelection);
       break;
      case 'go-down':
		this.handleDownload(mySelection);
       break;
    }
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene("hostSelector", true);
  }
  
};


RecordedDetailsAssistant.prototype.openWeb = function(website) {

  //Mojo.Log.error('got to openWeb with : '+website);
  var url = "";
  
  switch(website) {
	case 'themoviedb':
		url = "http://www.themoviedb.org/search/movies?search[text]="+this.recordedObject.title;
	  break;
	case 'IMDB':
		url = "http://www.imdb.com/find?s=all&q="+this.recordedObject.title;
	  break;
	case 'TheTVDB':
		url = "http://www.thetvdb.com/?string="+this.recordedObject.title+"&searchseriesid=&tab=listseries&function=Search";
	  break;
	case 'TV.com':
		url = "http://www.tv.com/search.php?type=11&stype=all&qs="+this.recordedObject.title;
	  break;
	case 'Google':
		url = "http://www.google.com/search?q="+this.recordedObject.title;
	  break;
  };
  
  this.controller.serviceRequest("palm://com.palm.applicationManager", {
   method: "open",
   parameters:  {
       id: 'com.palm.app.browser',
       params: {
           target: url
       }
   }
 });  
 
};


RecordedDetailsAssistant.prototype.handleDownload = function(downloadOrStream_in) {

	//Mojo.Log.error("Asked to "+downloadOrStream_in+" recorded program");
	this.downloadOrStream = downloadOrStream_in;
	
	var filenameRequestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	filenameRequestUrl += "?op=getCheckfile&chanid=";
	filenameRequestUrl += this.recordedObject.chanid+"&starttime=";
	filenameRequestUrl += this.recordedObject.recstartts;
 
	//try {
        var request = new Ajax.Request(filenameRequestUrl,{
            method: 'get',
            evalJSON: 'true',
            onSuccess: this.downloadStream.bind(this),
		/*	function(transport){
				this.standardFilename = transport.responseText.trim();
				Mojo.Log.error('recording filename is *'+this.standardFilename+'*');
				
				if ( downloadOrStream == 'download' ) {
					Mojo.Log.error("opening downloadRecording with "+this.standardFilename+'.mp4');
					this.downloadRecording(this.standardFilename+'.mp4').bind(this);
				} else if( downloadOrStream == 'stream') { 
					Mojo.Log.error("opening streamRecording with "+this.standardFilename+'.mp4');
					this.streamRecording(this.standardFilename+'.mp4'.bind(this));
				}
			},
			*/
            onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", filenameRequestUrl);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
        }
		);
	/*	
	}
	catch(err) {
		Mojo.Log.error('AJAX error: ' + err.message);
	}
	*/	
 
};


RecordedDetailsAssistant.prototype.downloadStream = function(response) {

	//Mojo.Log.error("Asked to "+this.downloadOrStream+" with "+response.responseText);  
	this.standardFilename = response.responseText.trim();
	
	//Want to add more options here later
	var filename = this.standardFilename+".mp4";
	var filenameUrl = "http://"+WebMyth.prefsCookieObject.webserverName+WebMyth.prefsCookieObject.webmythPythonFile;
	filenameUrl += "?op=downloadFile&dir=/&filename=";
	filenameUrl += filename;
	
	var myFilename = this.recordedObject.title + "-" + this.recordedObject.subtitle + ".mp4";
	
	if( this.downloadOrStream == 'download' ) {
		//Mojo.Log.error("starting download of "+filename);
		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
				target: filenameUrl,		
				mime: "video/mp4",
				targetFilename: myFilename,
				subscribe: true,	
				targetDir: "/media/internal/mythtv/"
			},
			onSuccess: function(response) {
				if(response.completed) {
					this.controller.showBanner("Download finished!"+myFilename, "");
					/*
					this.controller.showAlertDialog({
						onChoose: function(value){},
						title: "Download Complete",
						message: "\"" + response.target + "\" downloaded successfully!",
						choices: [{label: "OK", value: "ok"}],
						allowHTMLMessage: true
					});
					*/
				} else {
					if(response.amountReceived && response.amountTotal) {
						var percent = (response.amountReceived / response.amountTotal)*100;
						percent = Math.round(percent);
						if(percent!=NaN) {
							if(this.currProgress != percent) {
								this.currProgress = percent;
								this.controller.showBanner("Downloading: " + percent + "%", "");
							}
						}
					}
					
				}
			}.bind(this)
		});	
	} else 	if( this.downloadOrStream == 'stream' ) {
		
		//Mojo.Log.error("Asked to stream "+filename);
	
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: "launch",
			parameters:  {
				id: 'com.palm.app.videoplayer',
				params: {
					target: filenameUrl	
				}
			}
		});	
	}
 
};


RecordedDetailsAssistant.prototype.playOnHost = function(host) {
	//Attempting to play
	Mojo.Log.info("Attempting to play on "+event.hostname);
	var thisHostname = host;
	
	//var clean_starttime = this.recordedObject.starttime.replace(' ','T');
	var clean_starttime = this.recordedObject.recstartts.replace(' ','T');
	
	var cmd = "program "+this.recordedObject.chanid+" "+clean_starttime+" resume";
	
	Mojo.Log.info("Command to send is " + cmd);
/*	
};

RecordedDetailsAssistant.prototype.sendTelnet = function(cmd){
*/

	var reply;
	
	if (Mojo.appInfo.skipPDK == "true") {
		//Mojo.Controller.getAppController().showBanner("Sending command to telnet", {source: 'notification'});
		
		//Using cgi-bin on server
		//var cmd = encodeURIComponent(cmd);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=remote&type=play";
		//requestUrl += "&host="+this.frontendTextModel.value;
		requestUrl += "&host="+thisHostname;
		requestUrl += "&cmd=program "+this.recordedObject.chanid+" "+clean_starttime+" resume";
		//var requestURL="http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webserverRemoteFile+"?host="+this.frontendTextModel.value+"&cmd="+cmd;  
	
	//Mojo.Log.error("requesting : "+requestUrl);
	
		var request = new Ajax.Request(requestUrl, {
			method: 'get',
			onSuccess: function(transport){
				reply = transport.responseText;
				if (reply.substring(0,5) == "ERROR") {
					Mojo.Log.error("ERROR in response: '%s'", reply.substring(6));
					Mojo.Controller.getAppController().showBanner(reply, {source: 'notification'});
				} else {
					Mojo.Log.info("Success AJAX: '%s'", reply);
				}
			},
			onFailure: function() {
				Mojo.Log.error("Failed AJAX: '%s'", requestURL);
				Mojo.Controller.getAppController().showBanner("ERROR - check remote.py scipt", {source: 'notification'});
			}
		});
	}
	else {
		$('telnetPlug').SendTelnet(value);
	}
};