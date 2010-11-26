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


function SetupRecordingAssistant(programObject) {

	this.programObject = programObject;
	
	this.inputs = [];
	
	this.finishedGettingRule = false;
	this.finishedGettingInputs = false;
	this.finishedGettingSettings = false;	
	
	this.finishedGettingDefaults = true;	//preloaded on welcome scene
	

}

SetupRecordingAssistant.prototype.setup = function() {

	Mojo.Log.info("program object is %j", this.programObject);

	//Show and start the animated spinner
	this.spinnerAttr= {
		spinnerSize: "large"
	}; this.spinnerModel= {
		spinning: true
	}; 
	this.controller.setupWidget('spinner', this.spinnerAttr, this.spinnerModel);
	$('spinner-text').innerHTML = "Loading...";
	
	//App menu widget
	this.controller.setupWidget(Mojo.Menu.appMenu, WebMyth.appMenuAttr, WebMyth.appMenuModel);
	
	// Menu grouping at bottom of scene
    this.cmdMenuModel = { label: $L('Setup'),
                            items: [{},{label: $L('Save'), command: 'do-save', width: 90},{},{label: $L('More'), submenu:'more-menu', width: 90},{}]};
 
	this.moreMenuModel = { label: $L('More'), items: [
			{"label": $L('Force record'), "command": "do-override-record"},
			{"label": $L("Force don't record"), "command": "do-override-dontrecord"},
			{"label": $L("Never record"), "command": "do-override-neverrecord"},
			{"label": $L("Delete schedule"), "command": "do-cancel-rule"}
			]};
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.cmdMenuModel);
	this.controller.setupWidget('more-menu', '', this.moreMenuModel);
	
	//Header
	this.controller.listen(this.controller.get( "header-menu" ), Mojo.Event.tap, function(){this.controller.sceneScroller.mojo.revealTop();}.bind(this));
	
	
	
	
	//Rule type drawer
	this.controller.setupWidget("ruleTypeDrawer",
		this.ruleTypeAttributes = { modelProperty: 'open', unstyled: true },
		this.ruleTypeModel = { open: true }
	);
	this.ruleTypeDrawer = this.controller.get("ruleTypeDrawer");
	this.controller.listen(this.controller.get("ruleTypeGroup"),Mojo.Event.tap,this.toggleRuleTypeDrawer.bindAsEventListener(this));
	
		//Rule list selector
		this.controller.setupWidget("ruleTypeListId",
			this.ruleTypeListAttributes = {
				choices: [
					{label: "Record anytime", value: 4},
					{label: "Anytime on channel", value: 3},
					{label: "Find one each week", value: 10},
					{label: "Find one each day", value: 9},
					{label: "Find one showing", value: 6},
					{label: "This timeslot every week", value: 5},
					{label: "This timeslot every day", value: 2},
					{label: "Only this showing", value: 1}
				]},
			this.ruleTypeListModel = { value: 'None', disabled: false }
		);
		
	
	
	//Program drawer
	this.controller.setupWidget("programDrawer",
		this.programAttributes = { modelProperty: 'open', unstyled: true },
		this.programModel = { open: true }
	);
	this.programDrawer = this.controller.get("programDrawer");
	this.controller.listen(this.controller.get("programGroup"),Mojo.Event.tap,this.toggleProgramDrawer.bindAsEventListener(this));
	
	
	
	//Program details drawer
	this.controller.setupWidget("programDetailsDrawer",
		this.programDetailsAttributes = { modelProperty: 'open', unstyled: true },
		this.programDetailsModel = { open: false }
	);
	this.programDetailsDrawer = this.controller.get("programDetailsDrawer");
	this.controller.listen(this.controller.get("programDetailsGroup"),Mojo.Event.tap,this.toggleProgramDetailsDrawer.bindAsEventListener(this));
	
	
	
	//Recording Options drawer
	this.controller.setupWidget("recordingOptionsDrawer",
		this.recordingOptionsAttributes = { modelProperty: 'open', unstyled: true },
		this.recordingOptionsModel = { open: false }
	);
	this.recordingOptionsDrawer = this.controller.get("recordingOptionsDrawer");
	this.controller.listen(this.controller.get("recordingOptionsGroup"),Mojo.Event.tap,this.toggleRecordingOptionsDrawer.bindAsEventListener(this));
		
		//Recroding profile - not editable currently
		this.controller.setupWidget("profileId",
			this.profileAttributes = {
				multiline: false,
				enterSubmits: false,
				focus: false,
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.profileModel = { value: "Default", disabled: true }
		);
		
		//transcoder - not editable currently
		this.controller.setupWidget("transcoderId",
			this.transcoderAttributes = {
				multiline: false,
				enterSubmits: false,
				focus: false,
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.transcoderModel = { value: "0", disabled: true }
		);
		
		//recgroup - not currently editable
		this.controller.setupWidget("recgroupId",
			this.recgroupAttributes = {
				multiline: false,
				enterSubmits: false,
				focus: false,
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.recgroupModel = { value: "Default", disabled: true }
		);
		
		//storagegroup - not currently editable
		this.controller.setupWidget("storagegroupId",
			this.storagegroupAttributes = {
				multiline: false,
				enterSubmits: false,
				focus: false,
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.storagegroupModel = { value: "Default", disabled: true }
		);
		
		//playgroup - not currently editable
		this.controller.setupWidget("playgroupId",
			this.playgroupAttributes = {
				multiline: false,
				enterSubmits: false,
				focus: false,
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.playgroupModel = { value: "Default", disabled: true }
		);
				
		//recording priority
		this.controller.setupWidget("recpriorityFieldId",
			this.recpriorityAttributes = {
				label: '.',
				modelProperty: 'value',
				min: -100,
				max: 100
			},
			this.recpriorityModel = { value: 0 }
		); 
		
		//duplicate check 
		this.controller.setupWidget("dupmethodListId",
			this.dupmethodListAttributes = {
				choices: [
					{label: "None", value: 1},
					{label: "Subtitle", value: 2},
					{label: "Description", value: 4},
					{label: "Subtitle and Description", value: 6},
					{label: "Subtitle then Description", value: 8}
				]},
			this.dupmethodListModel = { value: 6, disabled: false }
		);
		
		//check in
		this.controller.setupWidget("dupinListId",
			this.dupinListAttributes = {
				choices: [
					{label: "All recordings", value: 15},
					{label: "Current recordings", value: 1},
					{label: "Previous recordings", value: 2}
				]},
			this.dupinListModel = { value: 15, disabled: false }
		);
		
		//filter - dupin2?
		this.controller.setupWidget("filterListId",
			this.filterListAttributes = {
				choices: [
					{label: "None", value: 0},
					{label: "New Episodes Only", value: 16},
					{label: "Exclude Repeat Episodes", value: 32},
					{label: "Exclude Generic Episodes", value: 64},
					{label: "Exclude Repeat and Generic Episodes", value: 96}
				]},
			this.filterListModel = { value: 0, disabled: false }
		);
		
		//preferred input - asdf
		this.controller.setupWidget("prefinputListId",
			this.prefinputListAttributes = {
				choices: [
					{label: "None", value: 0},
					{label: "One", value: 1}
				]},
			this.prefinputListModel = { value: 0, disabled: false }
		);
				
		//inactive
		this.controller.setupWidget("inactiveFieldId",
			this.inactiveAttributes = { label: $L("inactive"), modelProperty: "value" },
			this.inactiveModel = { value: false }
		);
				
		//auto expire
		this.controller.setupWidget("autoexpireFieldId",
			this.autoexpireAttributes = { label: $L("autoexpire"), modelProperty: "value" },
			this.autoexpireModel = { value: true }
		);
				
		//record new, expire old
		this.controller.setupWidget("maxnewestFieldId",
			this.maxnewestAttributes = { label: $L("maxnewest"), modelProperty: "value" },
			this.maxnewestModel = { value: false }
		);
	
		//max episodes
		this.controller.setupWidget("maxepisodesFieldId",
			this.maxepisodesAttributes = {
				label: 'Count',
				modelProperty: 'value',
				min: 0,
				max: 100
			},
			this.maxepisodesModel = { value: 0 }
		); 
		
		//start early offset
		this.controller.setupWidget("startoffsetFieldId",
			this.startoffsetAttributes = {
				label: 'minutes',
				modelProperty: 'value',
				min: -100,
				max: 100
			},
			this.startoffsetModel = { value: 0 }
		); 
		
		//end late offset
		this.controller.setupWidget("endoffsetFieldId",
			this.endoffsetAttributes = {
				label: 'minutes',
				modelProperty: 'value',
				min: -100,
				max: 100
			},
			this.endoffsetModel = { value: 0 }
		); 
	
	
	//Job Options drawer
	this.controller.setupWidget("jobOptionsDrawer",
		this.jobOptionsAttributes = { modelProperty: 'open', unstyled: true },
		this.jobOptionsModel = { open: false}
	);
	this.jobOptionsDrawer = this.controller.get("jobOptionsDrawer");
	this.controller.listen(this.controller.get("jobOptionsGroup"),Mojo.Event.tap,this.toggleJobOptionsDrawer.bindAsEventListener(this));
					
		//Commercial flagging
		this.controller.setupWidget("autocommflagFieldId",
			this.autocommflagAttributes = { label: $L("commflag"), modelProperty: "value" },
			this.autocommflagModel = { value: true }
		);
				
		//Transcode
		this.controller.setupWidget("autotranscodeFieldId",
			this.autotranscodeAttributes = { label: $L("transcode"), modelProperty: "value" },
			this.autotranscodeModel = { value: false }
		);
				
		//Userjob1
		this.controller.setupWidget("autouserjob1FieldId",
			this.autouserjob1Attributes = { label: $L("userjob1"), modelProperty: "value" },
			this.autouserjob1Model = { value: false }
		);
				
		//Userjob2
		this.controller.setupWidget("autouserjob2FieldId",
			this.autouserjob2Attributes = { label: $L("userjob2"), modelProperty: "value" },
			this.autouserjob2Model = { value: false }
		);
				
		//Userjob3
		this.controller.setupWidget("autouserjob3FieldId",
			this.autouserjob3Attributes = { label: $L("userjob3"), modelProperty: "value" },
			this.autouserjob3Model = { value: false }
		);
				
		//Userjob4
		this.controller.setupWidget("autouserjob4FieldId",
			this.autouserjob4Attributes = { label: $L("userjob4"), modelProperty: "value" },
			this.autouserjob4Model = { value: false }
		);
	
	
	
	
	this.getEncoderInputs();
	
	//this.getGeneralSettings();  //preloaded from welcome
	
	
	
	
	//Get data
	if(this.programObject.recordId){
		//if we were given a object that has a recording
		this.getExistingRecord();
	} else {
		//load up defaults
		this.getDefaultRule();
	}
	
};

SetupRecordingAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

SetupRecordingAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SetupRecordingAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

SetupRecordingAssistant.prototype.handleCommand = function(event) {

  if(event.type == Mojo.Event.command) {
  	myCommand = event.command
	Mojo.Log.error("command: "+myCommand);

    switch(myCommand) {
      case 'do-save':					//save
		Mojo.Log.error("saving ...");
		
		this.buildRecordingRule('update');
		
       break;
      case 'do-create':					//save
		Mojo.Log.error("creating new rule ...");
		
		this.buildRecordingRule('create');
		
       break;
      case 'do-override-record':		//force recording
		Mojo.Log.error("creating new override to force record");
		
		this.buildRecordingRule('override-record');
		
       break;
      case 'do-override-dontrecord':			//force dont record
		Mojo.Log.error("creating new override to force don't record");
		
		this.buildRecordingRule('override-dontrecord');
		
       break;
      case 'do-override-neverrecord':			//never record
		Mojo.Log.error("faking old recording for never record");
		
		this.buildRecordingRule('never-record');
		
       break;
      case 'do-override-forgetold':			//forget old
		Mojo.Log.error("forgetting old recording");
		
		this.buildRecordingRule('forget-old');
		
       break;
      case 'do-override-toggle':			//toggle override type
		Mojo.Log.error("toggling override type");
		
		this.buildRecordingRule('toggle-override');
		
       break;
      case 'do-cancel-rule':			//cancel rule
		Mojo.Log.error("cancelling rule");
		
		this.buildRecordingRule('cancel-record');
		
       break;
	     
    }
	
  } else if(event.type == Mojo.Event.forward) {
	
		Mojo.Controller.stageController.pushScene({name: WebMyth.prefsCookieObject.currentRemoteScene, disableSceneScroller: true});
  }
  
};






SetupRecordingAssistant.prototype.toggleRuleTypeDrawer = function() {
	this.ruleTypeDrawer.mojo.setOpenState(!this.ruleTypeDrawer.mojo.getOpenState());
	
	if (this.programDetailsDrawer.mojo.getOpenState() == true){
		this.controller.get("ruleTypeArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("ruleTypeArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

SetupRecordingAssistant.prototype.toggleProgramDrawer = function() {
	this.programDrawer.mojo.setOpenState(!this.programDrawer.mojo.getOpenState());
	
	if (this.programDrawer.mojo.getOpenState() == true){
		this.controller.get("programArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("programArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

SetupRecordingAssistant.prototype.toggleProgramDetailsDrawer = function() {
	this.programDetailsDrawer.mojo.setOpenState(!this.programDetailsDrawer.mojo.getOpenState());
	
	if (this.programDetailsDrawer.mojo.getOpenState() == true){
		this.controller.get("programDetailsArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("programDetailsArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

SetupRecordingAssistant.prototype.toggleRecordingOptionsDrawer = function() {
	this.recordingOptionsDrawer.mojo.setOpenState(!this.recordingOptionsDrawer.mojo.getOpenState());
	
	if (this.recordingOptionsDrawer.mojo.getOpenState() == true){
		this.controller.get("recordingOptionsArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("recordingOptionsArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

SetupRecordingAssistant.prototype.toggleJobOptionsDrawer = function() {
	this.jobOptionsDrawer.mojo.setOpenState(!this.jobOptionsDrawer.mojo.getOpenState());
	
	if (this.programDetailsDrawer.mojo.getOpenState() == true){
		this.controller.get("jobOptionsArrow").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded")
	} else {
		this.controller.get("jobOptionsArrow").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed")
	}
};

SetupRecordingAssistant.prototype.setupOverrideMenu = function() {

    this.cmdMenuModel.items = [{},{},{label: $L('Override'), submenu:'override-menu', width: 110},{},{}];
 
	this.overrideMenuModel = { label: $L('Override'), items: [
			{"label": $L('Force record'), "command": "do-override-toggle"},
			{"label": $L("Never record"), "command": "do-override-neverrecord"},
			{"label": $L("Schedule normally"), "command": "do-cancel-rule"}
			]};
			
	if(this.recordRule.type == 7) {
		this.overrideMenuModel.items[0].label = "Force don't record";
	};
	
	if((this.programObject.recStatus == 11)||(this.programObject.recStatus == 2)) {
		//Says 'never record' or 'previously recorded'
		this.overrideMenuModel.items[1].label = "Forget old";
		this.overrideMenuModel.items[1].command = "do-override-forgetold";
		
	}
	
	
	this.controller.modelChanged(this.cmdMenuModel, this);
	this.controller.setupWidget('override-menu', '', this.overrideMenuModel);
	
};

SetupRecordingAssistant.prototype.setupForgetOldMenu = function() {

	this.moreMenuModel.items[2].label = "Forget old";
	this.moreMenuModel.items[2].command = "do-override-forgetold";
	
	this.controller.modelChanged(this.moreMenuModel, this);
	this.controller.setupWidget('more-menu', '', this.moreMenuModel);
	
};

SetupRecordingAssistant.prototype.setupCreateMenu = function() {

    this.cmdMenuModel.items = [{},{},{label: $L('Create'), command:'do-create', width: 110},{},{}];	
	
	this.controller.modelChanged(this.cmdMenuModel, this);
	
};


SetupRecordingAssistant.prototype.getEncoderInputs = function() {

	//Get the exisiting recording
	Mojo.Log.info('Starting getting encoder inputs');
		
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=getSQL";				
	requestUrl += "&table=cardinput";				
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.readInputsSuccess.bind(this),
            onFailure: this.readInputsFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

};

SetupRecordingAssistant.prototype.readInputsFail = function(event) {
	
	Mojo.Log.error('Failed to get available inputs');

};

SetupRecordingAssistant.prototype.readInputsSuccess = function(response) {

    //Mojo.Log.info('Got all encoder inputs: %j', response.responseJSON);
	
	this.inputs = cleanInputs(response.responseJSON).sort(double_sort_by('value', 'label', false));
	
    //Mojo.Log.info('Cleaned inputs is: %j', this.inputs);
	
	
	this.finishedGettingInputs = true;
		
	if(this.finishedGettingRule == true) {
		this.updateInputs();
	}
	
};

SetupRecordingAssistant.prototype.getExistingRecord = function() {

	//Get the exisiting recording
	Mojo.Log.info('Starting getting existing recording info');
		
	
	this.controller.sceneScroller.mojo.revealTop();
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=getRecord";				
	requestUrl += "&recordId="+this.programObject.recordId;				
	
	
	//Mojo.Log.info('Record details URL is '+requestUrl);
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.readRecordingRuleSuccess.bind(this),
            onFailure: this.readRecordingRuleFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

};

SetupRecordingAssistant.prototype.readRecordingRuleFail = function(event) {
	
	Mojo.Log.error('Failed to get existing recording rule response');
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()	
	
};

SetupRecordingAssistant.prototype.readRecordingRuleSuccess = function(response) {

    //Mojo.Log.info('Got Ajax responseText: ' + response.responseText);
	
	Mojo.Log.info('Got existing recording rule responseJSON: %j', response.responseJSON[0]);
	
	this.recordRule = response.responseJSON[0];
	
	
	
	//Fill in data values
	$('header-title').innerHTML = "Edit recording rule #"+this.recordRule.recordid;

		//rule type
	if((this.recordRule.type == 7)||(this.recordRule.type == 8)) {		
		//if manual override types		
		this.ruleTypeListAttributes.choices.push({label: "Force  record", value: 7});
		this.ruleTypeListAttributes.choices.push({label: "Force don't record", value: 8});
		
		this.ruleTypeListModel.disabled = true;
		this.ruleTypeListModel.value = this.recordRule.type;
		
		this.controller.modelChanged(this.ruleTypeListModel, this);
		
		this.setupOverrideMenu();
			
	} else {
		this.ruleTypeListModel.value = this.recordRule.type;
			this.controller.modelChanged(this.ruleTypeListModel, this);
				
		if((this.programObject.recStatus == 11)||(this.programObject.recStatus == 2)) {
			//Says 'never record' or previously recorded
			this.setupForgetOldMenu();
		}
	}
	
		//program
/*	$('title-title').innerHTML = this.recordRule.title;
	$('subtitle-title').innerHTML = this.recordRule.subtitle;
	$('starttime-title').innerHTML = this.recordRule.startdate+" "+this.recordRule.starttime;
	$('station-title').innerHTML = this.recordRule.station;			*/
	$('title-title').innerHTML = this.programObject.title;
	$('subtitle-title').innerHTML = this.programObject.subTitle;
	$('starttime-title').innerHTML = this.programObject.startTime.replace("T"," ");
	$('recstatus-title').innerHTML = recStatusDecode(this.programObject.recStatus);			
	$('station-title').innerHTML = this.programObject.callSign;			
	
		//program details
/*	$('description-title').innerHTML = this.recordRule.description;
	$('category-title').innerHTML = this.recordRule.category;
	$('seriesid-title').innerHTML = this.recordRule.seriesid;
	$('programid-title').innerHTML = this.recordRule.programid;
	$('endtime-title').innerHTML = this.recordRule.enddate+" "+this.recordRule.endtime;
	$('chanid-title').innerHTML = this.recordRule.chanid;			*/
	$('description-title').innerHTML = this.programObject.description;
	$('category-title').innerHTML = this.programObject.category;
	$('seriesid-title').innerHTML = this.programObject.seriesId;
	$('programid-title').innerHTML = this.programObject.programId;
	$('endtime-title').innerHTML = this.programObject.endTime.replace("T"," ");
	$('chanid-title').innerHTML = this.programObject.chanId;
	
		//recording options
	this.profileModel.value = this.recordRule.profile;
		this.controller.modelChanged(this.profileModel, this);
	this.transcoderModel.value = this.recordRule.transcoder;
		this.controller.modelChanged(this.transcoderModel, this);
	this.recgroupModel.value = this.recordRule.recgroup;
		this.controller.modelChanged(this.recgroupModel, this);
	this.storagegroupModel.value = this.recordRule.storagegroup;
		this.controller.modelChanged(this.storagegroupModel, this);
	this.playgroupModel.value = this.recordRule.playgroup;
		this.controller.modelChanged(this.playgroupModel, this); 
	this.recpriorityModel.value = this.recordRule.recpriority;
		this.controller.modelChanged(this.recpriorityModel, this);
	this.dupmethodListModel.value = this.recordRule.dupmethod;
		this.controller.modelChanged(this.dupmethodListModel, this); 
	this.dupinListModel.value = splitDupin(this.recordRule.dupin).dupin1;
		this.controller.modelChanged(this.dupinListModel, this); 
	this.filterListModel.value = splitDupin(this.recordRule.dupin).dupin2;
		this.controller.modelChanged(this.filterListModel, this);
/*	this.prefinputListModel.value = this.recordRule.prefinput;
		this.controller.modelChanged(this.prefinputListModel, this);	*/
	this.inactiveModel.value = intToBool(this.recordRule.inactive);
		this.controller.modelChanged(this.inactiveModel, this);
	this.autoexpireModel.value = intToBool(this.recordRule.autoexpire);
		this.controller.modelChanged(this.autoexpireModel, this);
	this.maxnewestModel.value = intToBool(this.recordRule.maxnewest);
		this.controller.modelChanged(this.maxnewestModel, this);
	this.maxepisodesModel.value = this.recordRule.maxepisodes;
		this.controller.modelChanged(this.maxepisodesModel, this);
	this.startoffsetModel.value = this.recordRule.startoffset;
		this.controller.modelChanged(this.startoffsetModel, this);
	this.endoffsetModel.value = this.recordRule.endoffset;
		this.controller.modelChanged(this.endoffsetModel, this);
	
	
		//job options
	this.autocommflagModel.value = intToBool(this.recordRule.autocommflag);
		this.controller.modelChanged(this.autocommflagModel, this);
	this.autotranscodeModel.value = intToBool(this.recordRule.autotranscode);
		this.controller.modelChanged(this.autotranscodeModel, this);
	this.autouserjob1Model.value = intToBool(this.recordRule.autouserjob1);
		this.controller.modelChanged(this.autouserjob1Model, this);
	this.autouserjob2Model.value = intToBool(this.recordRule.autouserjob2);
		this.controller.modelChanged(this.autouserjob2Model, this);
	this.autouserjob3Model.value = intToBool(this.recordRule.autouserjob3);
		this.controller.modelChanged(this.autouserjob3Model, this);
	this.autouserjob4Model.value = intToBool(this.recordRule.autouserjob4);
		this.controller.modelChanged(this.autouserjob4Model, this);
	
	
	
	this.controller.sceneScroller.mojo.revealTop();
	
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()
	
	
	this.finishedGettingRule = true;
	
	if(this.finishedGettingInputs == true) {
		this.updateInputs();
	} 
	
	if(this.finishedGettingDefaults == true) {
		this.updateDefaults();
	} 
	

};

SetupRecordingAssistant.prototype.getDefaultRule = function() {
	
	Mojo.Log.info('Building default rule');
	
	//Fill in data values
	$('header-title').innerHTML = "Create new recording rule";

/*		//rule type
	if((this.recordRule.type == 7)||(this.recordRule.type == 8)) {		
		//if manual override types		
		this.ruleTypeListAttributes.choices.push({label: "Force  record", value: 7});
		this.ruleTypeListAttributes.choices.push({label: "Force don't record", value: 8});
		
		this.ruleTypeListModel.disabled = true;
		this.ruleTypeListModel.value = this.recordRule.type;
		
		this.controller.modelChanged(this.ruleTypeListModel, this);
		
		this.setupOverrideMenu();
			
	} else {
		this.ruleTypeListModel.value = this.recordRule.type;
			this.controller.modelChanged(this.ruleTypeListModel, this);
				
		if((this.programObject.recStatus == 11)||(this.programObject.recStatus == 2)) {
			//Says 'never record' or previously recorded
			this.setupForgetOldMenu();
		}
	}		*/
	
		//program
	$('title-title').innerHTML = this.programObject.title;
	$('subtitle-title').innerHTML = this.programObject.subTitle;
	$('starttime-title').innerHTML = this.programObject.startTime.replace("T"," ");
	$('recstatus-title').innerHTML = recStatusDecode(this.programObject.recStatus);			
	$('station-title').innerHTML = this.programObject.callSign;			
	
		//program details
	$('description-title').innerHTML = this.programObject.description;
	$('category-title').innerHTML = this.programObject.category;
	$('seriesid-title').innerHTML = this.programObject.seriesId;
	$('programid-title').innerHTML = this.programObject.programId;
	$('endtime-title').innerHTML = this.programObject.endTime.replace("T"," ");
	$('chanid-title').innerHTML = this.programObject.chanId;
	
		//recording options
/*	this.profileModel.value = this.recordRule.profile;
		this.controller.modelChanged(this.profileModel, this);
	this.transcoderModel.value = this.recordRule.transcoder;
		this.controller.modelChanged(this.transcoderModel, this);
	this.recgroupModel.value = this.recordRule.recgroup;
		this.controller.modelChanged(this.recgroupModel, this);
	this.storagegroupModel.value = this.recordRule.storagegroup;
		this.controller.modelChanged(this.storagegroupModel, this);
	this.playgroupModel.value = this.recordRule.playgroup;
		this.controller.modelChanged(this.playgroupModel, this); 
	this.recpriorityModel.value = this.recordRule.recpriority;
		this.controller.modelChanged(this.recpriorityModel, this);
	this.dupmethodListModel.value = this.recordRule.dupmethod;
		this.controller.modelChanged(this.dupmethodListModel, this); 
	this.dupinListModel.value = splitDupin(this.recordRule.dupin).dupin1;
		this.controller.modelChanged(this.dupinListModel, this); 
	this.filterListModel.value = splitDupin(this.recordRule.dupin).dupin2;
		this.controller.modelChanged(this.filterListModel, this);
	this.inactiveModel.value = intToBool(this.recordRule.inactive);
		this.controller.modelChanged(this.inactiveModel, this);
	this.autoexpireModel.value = intToBool(this.recordRule.autoexpire);
		this.controller.modelChanged(this.autoexpireModel, this);
	this.maxnewestModel.value = intToBool(this.recordRule.maxnewest);
		this.controller.modelChanged(this.maxnewestModel, this);
	this.maxepisodesModel.value = this.recordRule.maxepisodes;
		this.controller.modelChanged(this.maxepisodesModel, this);
	this.startoffsetModel.value = this.recordRule.startoffset;
		this.controller.modelChanged(this.startoffsetModel, this);
	this.endoffsetModel.value = this.recordRule.endoffset;
		this.controller.modelChanged(this.endoffsetModel, this);
	
	
		//job options
	this.autocommflagModel.value = intToBool(this.recordRule.autocommflag);
		this.controller.modelChanged(this.autocommflagModel, this);
	this.autotranscodeModel.value = intToBool(this.recordRule.autotranscode);
		this.controller.modelChanged(this.autotranscodeModel, this);
	this.autouserjob1Model.value = intToBool(this.recordRule.autouserjob1);
		this.controller.modelChanged(this.autouserjob1Model, this);
	this.autouserjob2Model.value = intToBool(this.recordRule.autouserjob2);
		this.controller.modelChanged(this.autouserjob2Model, this);
	this.autouserjob3Model.value = intToBool(this.recordRule.autouserjob3);
		this.controller.modelChanged(this.autouserjob3Model, this);
	this.autouserjob4Model.value = intToBool(this.recordRule.autouserjob4);
		this.controller.modelChanged(this.autouserjob4Model, this);
	
	*/
	
	
	this.controller.sceneScroller.mojo.revealTop();
	
	this.setupCreateMenu();
	
	//Stop spinner and hide
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel, this);
	$('myScrim').hide()
	
	
	
	
	//Setup some defaults for creating new rule
	this.recordRule = { recordid: "-1", last_record: "0000-00-00 00:00:00", last_delete: "0000-00-00 00:00:00", prefinput: "0" };
	
	this.finishedGettingRule = true;
	
	
	if(this.finishedGettingInputs == true) {
		this.updateInputs();
	} 
	
	if(this.finishedGettingDefaults == true) {
		this.updateDefaults();
	} 
	

};

SetupRecordingAssistant.prototype.getGeneralSettings = function() {

	//Get the exisiting recording
	Mojo.Log.info('Starting getting general settings');
	
	
	var query = "SELECT * FROM `settings`  WHERE `hostname` IS NULL ;";
	
	
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQLwithResponse";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'true',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
			onSuccess: this.readSettingsSuccess.bind(this),
            onFailure: this.readSettingsFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

};

SetupRecordingAssistant.prototype.readSettingsFail = function(event) {
	
	Mojo.Log.error('Failed to get general settings');

};

SetupRecordingAssistant.prototype.readSettingsSuccess = function(response) {

	//Mojo.Log.info('Got settings table rule responseJSON: %j', response.responseJSON);
	
	WebMyth.settings = cleanSettings(response.responseJSON);
	
	Mojo.Log.info("Cleaned settings is %j",WebMyth.settings);
	
	
	
	this.finishedGettingDefaults = true;
		
	if(this.finishedGettingRule == true) {
		this.updateDefaults();
	}
	
};

SetupRecordingAssistant.prototype.updateInputs = function() {

    Mojo.Log.info("Updating input lists");
	
	
	this.prefinputListAttributes.choices.clear();
	
	Object.extend(this.prefinputListAttributes.choices,this.inputs);
	
	
	this.prefinputListModel.value = this.recordRule.prefinput;
		this.controller.modelChanged(this.prefinputListModel, this);


	this.controller.sceneScroller.mojo.revealTop();		

};

SetupRecordingAssistant.prototype.updateDefaults = function() {

    Mojo.Log.info("Updating default settings");
	
		
	$('UserJobDesc1Id').innerHTML = WebMyth.settings.UserJobDesc1;
	$('UserJobDesc2Id').innerHTML = WebMyth.settings.UserJobDesc2;
	$('UserJobDesc3Id').innerHTML = WebMyth.settings.UserJobDesc3;
	$('UserJobDesc4Id').innerHTML = WebMyth.settings.UserJobDesc4;
	

	if(this.programObject.recordId){
		//if we were given a object, don't update settings to defaults
	} else {
		//load up defaults


		//recording options
/*	this.profileModel.value = this.recordRule.profile;
		this.controller.modelChanged(this.profileModel, this);
	this.transcoderModel.value = this.recordRule.transcoder;
		this.controller.modelChanged(this.transcoderModel, this);
	this.recgroupModel.value = this.recordRule.recgroup;
		this.controller.modelChanged(this.recgroupModel, this);
	this.storagegroupModel.value = this.recordRule.storagegroup;
		this.controller.modelChanged(this.storagegroupModel, this);
	this.playgroupModel.value = this.recordRule.playgroup;
		this.controller.modelChanged(this.playgroupModel, this); 
	this.recpriorityModel.value = this.recordRule.recpriority;
		this.controller.modelChanged(this.recpriorityModel, this);
	this.dupmethodListModel.value = this.recordRule.dupmethod;
		this.controller.modelChanged(this.dupmethodListModel, this); 
	this.dupinListModel.value = splitDupin(this.recordRule.dupin).dupin1;
		this.controller.modelChanged(this.dupinListModel, this); 
	this.filterListModel.value = splitDupin(this.recordRule.dupin).dupin2;
		this.controller.modelChanged(this.filterListModel, this);
	this.inactiveModel.value = intToBool(this.recordRule.inactive);
		this.controller.modelChanged(this.inactiveModel, this);
	this.autoexpireModel.value = intToBool(this.recordRule.autoexpire);
		this.controller.modelChanged(this.autoexpireModel, this);
	this.maxnewestModel.value = intToBool(this.recordRule.maxnewest);
		this.controller.modelChanged(this.maxnewestModel, this);
	this.maxepisodesModel.value = this.recordRule.maxepisodes;
		this.controller.modelChanged(this.maxepisodesModel, this);		*/
		
	this.startoffsetModel.value = WebMyth.settings.DefaultStartOffset;
		this.controller.modelChanged(this.startoffsetModel, this);
	this.endoffsetModel.value = WebMyth.settings.DefaultEndOffset;
		this.controller.modelChanged(this.endoffsetModel, this);
	
	
	
		//job options
	this.autocommflagModel.value = intToBool(WebMyth.settings.AutoCommercialFlag);
		this.controller.modelChanged(this.autocommflagModel, this);
	this.autotranscodeModel.value = intToBool(WebMyth.settings.AutoTranscode);
		this.controller.modelChanged(this.autotranscodeModel, this);
	this.autouserjob1Model.value = intToBool(WebMyth.settings.AutoRunUserJob1);
		this.controller.modelChanged(this.autouserjob1Model, this);
	this.autouserjob2Model.value = intToBool(WebMyth.settings.AutoRunUserJob2);
		this.controller.modelChanged(this.autouserjob2Model, this);
	this.autouserjob3Model.value = intToBool(WebMyth.settings.AutoRunUserJob3);
		this.controller.modelChanged(this.autouserjob3Model, this);
	this.autouserjob4Model.value = intToBool(WebMyth.settings.AutoRunUserJob4);
		this.controller.modelChanged(this.autouserjob4Model, this);
	
	}
	
	this.controller.sceneScroller.mojo.revealTop();

};

SetupRecordingAssistant.prototype.buildRecordingRule = function(saveType) {

	//Show and start the animated spinner
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel, this);
	$('spinner-text').innerHTML = "Saving changes...";
	$('myScrim').show()
	
	
    Mojo.Log.info("Building updated recording rule for "+saveType);
	
	
	this.newRule = {};
	
	
	this.newRule.recordid = this.recordRule.recordid;
	
	this.newRule.type = this.ruleTypeListModel.value;
	
	this.newRule.title = this.programObject.title;
	this.newRule.subtitle = this.programObject.subTitle;
	this.newRule.startdate = $('starttime-title').innerHTML.split(" ")[0];
	this.newRule.starttime = $('starttime-title').innerHTML.split(" ")[1];
	this.newRule.station = $('station-title').innerHTML;
	
	this.newRule.description = $('description-title').innerHTML;
	this.newRule.category = $('category-title').innerHTML;
	this.newRule.seriesid = $('seriesid-title').innerHTML;
	this.newRule.programid = $('programid-title').innerHTML;
	this.newRule.chanid = $('chanid-title').innerHTML;
	this.newRule.enddate = $('endtime-title').innerHTML.split(" ")[0];
	this.newRule.endtime = $('endtime-title').innerHTML.split(" ")[1];
	
	this.newRule.profile = this.profileModel.value;
	this.newRule.transcoder = this.transcoderModel.value;
	this.newRule.recgroup = this.recgroupModel.value;
	this.newRule.storagegroup = this.storagegroupModel.value;
	this.newRule.playgroup = this.playgroupModel.value;
	this.newRule.recpriority = this.recpriorityModel.value;
	this.newRule.dupmethod = this.dupmethodListModel.value;
	this.newRule.dupin = this.dupinListModel.value*1 + this.filterListModel.value*1;
	this.newRule.prefinput = this.prefinputListModel.value;
	this.newRule.inactive = boolToInt(this.inactiveModel.value);
	this.newRule.autoexpire = boolToInt(this.inactiveModel.value);
	this.newRule.maxnewest = boolToInt(this.maxnewestModel.value);
	this.newRule.maxepisodes = this.maxepisodesModel.value;
	this.newRule.startoffset = this.startoffsetModel.value;
	this.newRule.endoffset = this.endoffsetModel.value;
	
	this.newRule.autocommflag = boolToInt(this.autocommflagModel.value);
	this.newRule.autotranscode = boolToInt(this.autotranscodeModel.value);
	this.newRule.autouserjob1 = boolToInt(this.autouserjob1Model.value);
	this.newRule.autouserjob2 = boolToInt(this.autouserjob2Model.value);
	this.newRule.autouserjob3 = boolToInt(this.autouserjob3Model.value);
	this.newRule.autouserjob4 = boolToInt(this.autouserjob4Model.value);
	
	this.newRule.search = 0;
	this.newRule.avg_delay = 100;
	this.newRule.parentid = 0;
	
	this.newRule.last_record = this.recordRule.last_record;
	this.newRule.last_delete = this.recordRule.last_delete;
	
	var myDate = new Date(this.newRule.startdate.split("-")[0],this.newRule.startdate.split("-")[1],this.newRule.startdate.split("-")[2]);
	//,this.newRule.starttime.split(":")[0],this.newRule.starttime.split(":")[1],this.newRule.starttime.split(":")[2]);
	
	
	this.newRule.findtime = this.newRule.starttime;
	this.newRule.findday = dateDayAdjust(myDate.getDay());
	this.newRule.findid = myDate.getTime()/86400000+719464;		//(UNIX_TIMESTAMP(program.starttime)/60/60/24)+719528 - off by 74?
	
	
	
	
	Mojo.Log.error("New job is %j", this.newRule);
	
	switch(saveType) {
		case 'update':
			this.updateRule();
		  break;
		  
		case 'create':
			this.createRule();
		  break;
		
		case 'override-record':
			this.overrideRecord();
		  break;
		  
		case 'override-dontrecord':
			this.overrideDontRecord();
		  break;
		  
		case 'never-record':
			this.neverRecord();
		  break;
		  
		case 'forget-old':
			this.forgetOld();
		  break;
		  
		case 'toggle-override':
			this.toggleOverride();
		  break;
		  
		  
		case 'cancel-record':
			this.cancelRecord();
		  break;
	}

};

SetupRecordingAssistant.prototype.updateRule = function() {
	
	var query = 'UPDATE `record` SET `type` = "'+this.newRule.type+'", `title` = "'+this.newRule.title+'", `subtitle` = "'+this.newRule.subtitle;
	query += '", startdate = "'+this.newRule.startdate+'", starttime = "'+this.newRule.starttime+'", station = "'+this.newRule.station;
	query += '", description = "'+this.newRule.description+'", category = "'+this.newRule.category+'", seriesid = "'+this.newRule.seriesid;
	query += '", programid = "'+this.newRule.programid+'", chanid = "'+this.newRule.chanid+'", endtime = "'+this.newRule.endtime;
	query += '", enddate = "'+this.newRule.enddate+'", profile = "'+this.newRule.profile+'", transcoder = "'+this.newRule.transcoder;
	query += '", recgroup = "'+this.newRule.recgroup+'", storagegroup = "'+this.newRule.storagegroup+'", playgroup = "'+this.newRule.playgroup;
	query += '", recpriority = "'+this.newRule.recpriority+'", dupmethod = "'+this.newRule.dupmethod;
	query += '", dupin = "'+this.newRule.dupin+'", prefinput = "'+this.newRule.prefinput+'", inactive = "'+this.newRule.inactive;
	query += '", autoexpire = "'+this.newRule.autoexpire+'", maxnewest = "'+this.newRule.maxnewest+'", maxepisodes = "'+this.newRule.maxepisodes;
	query += '", startoffset = "'+this.newRule.startoffset+'", endoffset = "'+this.newRule.endoffset+'", autocommflag = "'+this.newRule.autocommflag;
	query += '", autotranscode = "'+this.newRule.autotranscode+'", autouserjob1 = "'+this.newRule.autouserjob1+'", autouserjob2 = "'+this.newRule.autouserjob2;
	query += '", autouserjob3 = "'+this.newRule.autouserjob3+'", autouserjob4 = "'+this.newRule.autouserjob4;
	query += '" WHERE `recordid` = '+this.newRule.recordid+' LIMIT 1;';
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

SetupRecordingAssistant.prototype.createRule = function() {
	
	if(this.newRule.type == "None") {
	
		this.controller.showAlertDialog({
			onChoose: function(value) {},
			title: "WebMyth - v" + Mojo.Controller.appInfo.version,
			message:  "You must select a recording rule type in order to create a new recording rule", 
			choices: [
                    {label: "OK", value: false}
					],
			allowHTMLMessage: true
		});
		
		
		//Show and start the animated spinner
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel, this);
		$('myScrim').hide();
		
	} else {
		var query = 'INSERT INTO `record` SET `type` = "'+this.newRule.type+'", `title` = "'+this.newRule.title+'", `subtitle` = "'+this.newRule.subtitle;
		query += '", startdate = "'+this.newRule.startdate+'", starttime = "'+this.newRule.starttime+'", station = "'+this.newRule.station;
		query += '", description = "'+this.newRule.description+'", category = "'+this.newRule.category+'", seriesid = "'+this.newRule.seriesid;
		query += '", programid = "'+this.newRule.programid+'", chanid = "'+this.newRule.chanid+'", endtime = "'+this.newRule.endtime;
		query += '", enddate = "'+this.newRule.enddate+'", profile = "'+this.newRule.profile+'", transcoder = "'+this.newRule.transcoder;
		query += '", recgroup = "'+this.newRule.recgroup+'", storagegroup = "'+this.newRule.storagegroup+'", playgroup = "'+this.newRule.playgroup;
		query += '", recpriority = "'+this.newRule.recpriority+'", dupmethod = "'+this.newRule.dupmethod;
		query += '", dupin = "'+this.newRule.dupin+'", prefinput = "'+this.newRule.prefinput+'", inactive = "'+this.newRule.inactive;
		query += '", autoexpire = "'+this.newRule.autoexpire+'", maxnewest = "'+this.newRule.maxnewest+'", maxepisodes = "'+this.newRule.maxepisodes;
		query += '", startoffset = "'+this.newRule.startoffset+'", endoffset = "'+this.newRule.endoffset+'", autocommflag = "'+this.newRule.autocommflag;
		query += '", autotranscode = "'+this.newRule.autotranscode+'", autouserjob1 = "'+this.newRule.autouserjob1+'", autouserjob2 = "'+this.newRule.autouserjob2;
		query += '", autouserjob3 = "'+this.newRule.autouserjob3+'", autouserjob4 = "'+this.newRule.autouserjob4;
		query += '", last_record = "'+this.newRule.last_record+'", last_delete = "'+this.newRule.last_delete;
		query += '" ;';
		
		
		this.newRule.recordid = -1;				//so that we reschedule all
		
		
		
	Mojo.Log.error("query is "+query);
		
		var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
		requestUrl += "?op=executeSQL";				
		requestUrl += "&query64=";		
		requestUrl += Base64.encode(query);	
		
		
		
		try {
			var request = new Ajax.Request(requestUrl,{
				method: 'get',
				evalJSON: 'false',
				requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
				onSuccess: this.executeSqlSuccess.bind(this),
				onFailure: this.executeSqlFail.bind(this)  
			});
		}
		catch(e) {
			Mojo.Log.error(e);
		}
		
	}
	
};

SetupRecordingAssistant.prototype.overrideRecord = function() {
	
	var query = 'INSERT INTO `record` SET `type` = "7", `title` = "'+this.newRule.title+'", `subtitle` = "'+this.newRule.subtitle;
	query += '", startdate = "'+this.newRule.startdate+'", starttime = "'+this.newRule.starttime+'", station = "'+this.newRule.station;
	query += '", description = "'+this.newRule.description+'", category = "'+this.newRule.category+'", seriesid = "'+this.newRule.seriesid;
	query += '", programid = "'+this.newRule.programid+'", chanid = "'+this.newRule.chanid+'", endtime = "'+this.newRule.endtime;
	query += '", enddate = "'+this.newRule.enddate+'", profile = "'+this.newRule.profile+'", transcoder = "'+this.newRule.transcoder;
	query += '", recgroup = "'+this.newRule.recgroup+'", storagegroup = "'+this.newRule.storagegroup+'", playgroup = "'+this.newRule.playgroup;
	query += '", recpriority = "'+this.newRule.recpriority+'", dupmethod = "'+this.newRule.dupmethod;
	query += '", dupin = "'+this.newRule.dupin+'", prefinput = "'+this.newRule.prefinput+'", inactive = "'+this.newRule.inactive;
	query += '", autoexpire = "'+this.newRule.autoexpire+'", maxnewest = "'+this.newRule.maxnewest+'", maxepisodes = "'+this.newRule.maxepisodes;
	query += '", startoffset = "'+this.newRule.startoffset+'", endoffset = "'+this.newRule.endoffset+'", autocommflag = "'+this.newRule.autocommflag;
	query += '", autotranscode = "'+this.newRule.autotranscode+'", autouserjob1 = "'+this.newRule.autouserjob1+"', autouserjob2 = '"+this.newRule.autouserjob2;
	query += '", autouserjob3 = "'+this.newRule.autouserjob3+'", autouserjob4 = "'+this.newRule.autouserjob4;  //+"', parentid = '"+this.newRule.recordid;
	query += '", findtime = "'+this.newRule.starttime+'", findday = "'+this.newRule.findday+'", findid = "'+this.newRule.findid;
	query += '", last_record = "'+this.newRule.last_record+'", last_delete = "'+this.newRule.last_delete;
	query += '" ;';
	
	
	Mojo.Log.error("query is "+query);
	
	this.newRule.recordid = -1;				//so that we reschedule all
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

SetupRecordingAssistant.prototype.overrideDontRecord = function() {
	
	var query = 'INSERT INTO `record` SET `type` = "8", `title` = "'+this.newRule.title+'", `subtitle` = "'+this.newRule.subtitle;
	query += '", startdate = "'+this.newRule.startdate+'", starttime = "'+this.newRule.starttime+'", station = "'+this.newRule.station;
	query += '", description = "'+this.newRule.description+'", category = "'+this.newRule.category+'", seriesid = "'+this.newRule.seriesid;
	query += '", programid = "'+this.newRule.programid+'", chanid = "'+this.newRule.chanid+'", endtime = "'+this.newRule.endtime;
	query += '", enddate = "'+this.newRule.enddate+'", profile = "'+this.newRule.profile+'", transcoder = "'+this.newRule.transcoder;
	query += '", recgroup = "'+this.newRule.recgroup+'", storagegroup = "'+this.newRule.storagegroup+'", playgroup = "'+this.newRule.playgroup;
	query += '", recpriority = "'+this.newRule.recpriority+'", dupmethod = "'+this.newRule.dupmethod;
	query += '", dupin = "'+this.newRule.dupin+'", prefinput = "'+this.newRule.prefinput+'", inactive = "'+this.newRule.inactive;
	query += '", autoexpire = "'+this.newRule.autoexpire+'", maxnewest = "'+this.newRule.maxnewest+'", maxepisodes = "'+this.newRule.maxepisodes;
	query += '", startoffset = "'+this.newRule.startoffset+'", endoffset = "'+this.newRule.endoffset+'", autocommflag = "'+this.newRule.autocommflag;
	query += '", autotranscode = "'+this.newRule.autotranscode+'", autouserjob1 = "'+this.newRule.autouserjob1+'", autouserjob2 = "'+this.newRule.autouserjob2;
	query += '", autouserjob3 = "'+this.newRule.autouserjob3+'", autouserjob4 = "'+this.newRule.autouserjob4;  //+"', parentid = '"+this.newRule.recordid;
	query += '", findtime = "'+this.newRule.starttime+'", findday = "'+this.newRule.findday+'", findid = "'+this.newRule.findid;
	query += '", last_record = "'+this.newRule.last_record+'", last_delete = "'+this.newRule.last_delete;
	query += '" ;';
	
	
	this.newRule.recordid = -1;				//so that we reschedule all
	
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

SetupRecordingAssistant.prototype.neverRecord = function() {
	
	var query = 'REPLACE INTO oldrecorded (chanid,starttime,endtime,title,';
	query += 'subtitle,description,category,seriesid,programid,';
	query += 'recordid,station,rectype,recstatus,duplicate) VALUES ("';
	query += this.newRule.chanid+'","'+this.newRule.starttime+'","'+this.newRule.endtime+'","'+this.newRule.title+'","';
	query += this.newRule.subtitle+'","'+this.newRule.description+'","'+this.newRule.category+'","'+this.newRule.seriesid+'","'+this.newRule.programid+'","';
	query += this.newRule.recordid+'","'+this.newRule.station+'","'+this.newRule.type+'",11,1);';
	
	
	//this.newRule.recordid = -1;				//so that we reschedule all
	
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

	
};

SetupRecordingAssistant.prototype.forgetOld = function() {
	
	var query = 'DELETE FROM `oldrecorded` WHERE ';
	query += '`title` = "'+this.newRule.title;
	query += '" AND `subtitle` = "'+this.newRule.subtitle;
	query += '" AND `description` = "'+this.newRule.description;
	query += '"';
	
	
	//this.newRule.recordid = -1;				//so that we reschedule all
	
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }

	
};

SetupRecordingAssistant.prototype.toggleOverride = function() {

	if(this.newRule.type == 7) {
		Mojo.Log.error("changing from force record to force dont");
		var query = 'UPDATE `record` SET `type` = "8" WHERE `recordid` = '+this.newRule.recordid+' LIMIT 1';
	} else if(this.newRule.type == 8) { 
		Mojo.Log.error("changing from force dont record to force record");
		var query = 'UPDATE `record` SET `type` = "7" WHERE `recordid` = '+this.newRule.recordid+' LIMIT 1';
	} else {
		Mojo.Log.error("unknown toggle type");
		var query = "";
	}
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

SetupRecordingAssistant.prototype.cancelRecord = function() {

	var query = "DELETE FROM `record` ";
	query += " WHERE `recordid` = "+this.newRule.recordid+" LIMIT 1;";
	
	
	Mojo.Log.error("query is "+query);
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=executeSQL";				
	requestUrl += "&query64=";		
	requestUrl += Base64.encode(query);	
	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.executeSqlSuccess.bind(this),
            onFailure: this.executeSqlFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

SetupRecordingAssistant.prototype.executeSqlFail = function(event) {
	
	Mojo.Log.error('Failed to get exexcute SQL');
	
	$('spinner-text').innerHTML = "---ERROR---";
	
	this.controller.showAlertDialog({
			onChoose: function(value) {
				switch(value) {
					case 'mythweb':
					
						//Open recording in mythweb
						this.openMythweb();
						
						this.closeScene();
						 
					break;
					case 'cancel':
									
						//Cancel and close
						this.closeScene();
									
					break;
					}
				},
			title: "WebMyth - v" + Mojo.Controller.appInfo.version,
			message:  "Error with saving recording rule", 
			choices: [
					{label: "Try MythWeb", value: 'mythweb'},
                    {label: "Cancel", value: 'cancel'}
					],
			allowHTMLMessage: true
		});


};

SetupRecordingAssistant.prototype.openMythweb = function() {
		
	var dateJS = new Date(isoSpaceToJS($('starttime-title').innerHTML));
	var dateUTC = dateJS.getTime()/1000;				//don't need 59 second offset?
			
	Mojo.Log.info("Selected time is: '%j'", dateUTC);
			
	
	var mythwebUrl = "http://";
	mythwebUrl += WebMyth.prefsCookieObject.webserverName;
	mythwebUrl += "/mythweb/tv/detail/";
	mythwebUrl += this.newRule.chanid + "/";
	mythwebUrl += dateUTC;
	//mythwebUrl += "?RESET_TMPL=true";
			
	Mojo.Log.info("mythweb url is "+mythwebUrl);
	
	//Mojo.Controller.stageController.pushScene("webview", mythwebUrl, "Edit Upcoming Recording");
	
	
			
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters:  {
			id: 'com.palm.app.browser',
			params: {
				target: mythwebUrl
			}
		}
	}); 
	
};

SetupRecordingAssistant.prototype.executeSqlSuccess = function(response) {

    Mojo.Log.info('Got execute SQL response : ' + response.responseText);
	
	this.reschedule();
	
};

SetupRecordingAssistant.prototype.reschedule = function() {
	
	var requestUrl = "http://"+WebMyth.prefsCookieObject.webserverName+"/"+WebMyth.prefsCookieObject.webmythPythonFile;
	requestUrl += "?op=reschedule";				
	requestUrl += "&recordId=";		
	requestUrl += this.newRule.recordid;	
	
	
    try {
        var request = new Ajax.Request(requestUrl,{
            method: 'get',
            evalJSON: 'false',
			requestHeaders: {Authorization: 'Basic ' + Base64.encode(WebMyth.prefsCookieObject.webserverUsername + ":" + WebMyth.prefsCookieObject.webserverPassword)},
            onSuccess: this.rescheduleSuccess.bind(this),
            onFailure: this.rescheduleFail.bind(this)  
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
	
};

SetupRecordingAssistant.prototype.rescheduleFail = function(event) {
	
	Mojo.Log.error('Failed to trigger reschedule');
	
};

SetupRecordingAssistant.prototype.rescheduleSuccess = function(response) {

    Mojo.Log.info('Got reschedule response : ' + response.responseText);
	
	//Delay 4 seconds to allow scheduler to run
	this.controller.window.setTimeout(this.closeScene.bind(this), 4000);
	
	
};

SetupRecordingAssistant.prototype.closeScene = function(response) {

	Mojo.Controller.stageController.popScene();
	
};