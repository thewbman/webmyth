function ChannelPickerAssistant(channelList_in) {

	this.resultList = channelList_in;
	
	this.subset = [];				//Actually displayed list

}

ChannelPickerAssistant.prototype.setup = function() {

		//List of channels widget
		this.resultListAttribs = {
			itemTemplate: "dialogs/channelListItem",
			swipeToDelete: false,
			filterFunction: this.filterListFunction.bind(this),
			dividerTemplate: "channelPicker/channelPickerDivider",
			dividerFunction: this.dividerFunction.bind(this),
		};
		
		this.resultListModel = {            
			items: this.resultList
		};
		this.controller.setupWidget( "channelList" , this.resultListAttribs, this.resultListModel);
		
		
		
			
		//Tap a channel
		this.controller.listen(this.controller.get( "channelList" ), Mojo.Event.listTap,
			this.chooseChannel.bind(this));
			
};

ChannelPickerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

ChannelPickerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ChannelPickerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};






ChannelPickerAssistant.prototype.filterListFunction = function(filterString, listWidget, offset, count) {
	 
	//Filtering function
	//Mojo.Log.info("Filter string is "+filterString);
	
	var totalSubsetSize = 0;
 
	var i, s;
	var someList = [];  // someList will be the subset of this.myListData that contains the filterString...
 
	if (filterString !== '') {
 
		var len = this.resultList.length;
 
		//find the items that include the filterstring 
		for (i = 0; i < len; i++) {
			s = this.resultList[i];
			if (s.channelName.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
				//Mojo.Log.info("Found string in title", i);
				someList.push(s);
			}
			else if (s.chanNum.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in subtitle", i);
				someList.push(s);
			}
		}
	}
	else {

		var len = this.resultList.length;
 
		for (i = 0; i < len; i++) {
			s = this.resultList[i];
			someList.push(s);
		}
	}
 
	// pare down list results to the part requested by widget (starting at offset & thru count)
	var cursor = 0;
	this.subset.clear();
	
	while (true) {
		if (cursor >= someList.length) {
			break;
		}
		if (this.subset.length < count && totalSubsetSize >= offset) {
			this.subset.push(someList[cursor]);
		}
		totalSubsetSize ++;
		cursor ++;
	}
 
	// use noticeUpdatedItems to update the list
	// then update the list length 
	// and the FilterList widget's FilterField count (displayed in the upper right corner)
	listWidget.mojo.noticeUpdatedItems(offset, this.subset);
	listWidget.mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
	
	if(	(this.layoutStyle == "channel")&&
		(WebMyth.guideCookieObject.manualSort == false)&&
		(this.currentDayRange.EndTime == this.dayRange.EndTime)&&
		(this.currentTimeObject.hour > 2)
		) {
		
		this.controller.sceneScroller.mojo.revealElement(this.controller.get("Now Airing"));
		this.controller.sceneScroller.mojo.adjustBy(0,-300);
		
	} else {
		//Mojo.Log.info("Not adjusting sorting because hour is ",this.currentTimeObject.hour);
	}
	

};

ChannelPickerAssistant.prototype.chooseChannel = function(event) {

	Mojo.Log.info("Selected channel: %j",event.item);
	
	WebMyth.channelObject = event.item;
	
	
	Mojo.Controller.stageController.popScene();

};

ChannelPickerAssistant.prototype.dividerFunction = function(itemModel) {

	
	return itemModel.chanNum;

};

