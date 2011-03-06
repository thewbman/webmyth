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


function ImageviewAssistant(imageUrl) {

	this.imageUrl = imageUrl;

}

ImageviewAssistant.prototype.setup = function() {

	
	this.imageAttributes = {
		noExtractFS : true 
	};
	this.imageModel = {};
	this.controller.setupWidget('myScreenshot', this.imageAttributes, this.imageModel);
	
	
	this.controller.enableFullScreenMode(true);

};

ImageviewAssistant.prototype.activate = function(event) {

	$('myScreenshot').mojo.centerUrlProvided(this.imageUrl);
	$('myScreenshot').mojo.manualsize('500','320');

};

ImageviewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ImageviewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
