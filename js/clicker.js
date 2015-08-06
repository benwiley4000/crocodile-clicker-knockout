/* BEGIN MODEL */

var crocQueue = [
	{
		name: "Janet",
		url: "janet.jpg",
		source: "https://www.flickr.com/photos/montuschi/6011766251/"
	},
	{
		name: "Harry",
		url: "harry.jpg",
		source: "http://01.gatag.net/0002156-free-photo/"
	},
	{
		name: "Belinda",
		url: "belinda.jpg",
		source: "https://commons.wikimedia.org/wiki/File:American_Alligator_eating_Blue_Crab_2.JPG"
	},
	{
		name: "Freddy",
		url: "freddy.jpg",
		source: "https://www.flickr.com/photos/eirikl/10208820093"
	},
	{
		name: "Steve",
		url: "steve.jpg",
		source: "https://www.flickr.com/photos/bootbearwdc/19788289"
	}
];

var initModel = function() {
	// creates local click storage object if not there already

	if(!localStorage.clicks) {
		localStorage.clicks = JSON.stringify({});
	}
};

var trackClicks = function(clickCounter, key) {
	// takes a given KO observable for a croc's click counter, and ensures that data is stored locally on each click

	// throws error if function is used incorrectly
	if(!ko.isObservable(clickCounter)) {
		throw "Can only track changes on observable items!";
	}
	
	// stores click count locally when it changes
	clickCounter.subscribe(function(newValue) {
		var clicks = JSON.parse(localStorage.clicks);
		clicks[key()] = newValue;
		localStorage.clicks = JSON.stringify(clicks);
	});

	// parses stored clicks to JS object
	var clicks = JSON.parse(localStorage.clicks);
	
	// changes clickCounter to the stored value, if it exists. it is then stored automatically.
	clickCounter(clicks[key()] || clickCounter());
};

var Croc = function(data) {
	// initializes croc from given data

	this.click = function() {
		// increments this croc's click counter

		this.clickCounter(this.clickCounter() + 1);
	};

	this.reset = function() {
		// resets click counter to 0

		this.clickCounter(0);
	};

	this.name = ko.observable(data.name);
	this.url = ko.observable('images/' + data.url);
	this.source = ko.observable(data.source);

	// initializes clickCounter at 0 and tracks increments for storage
	this.clickCounter = ko.observable(0);
	trackClicks(this.clickCounter, this.name);
};

var LEVEL_BASE = 7;
var SELECT_AUDIO = new Audio('audio/crocodile.ogg');

/* END MODEL */


/* BEGIN VIEWMODEL */

var ViewModel = function() {

	/* BEGIN INIT */

	// initializes local storage if needed
	initModel();

	// initializes and populates crocs list
	this.crocs = [];
	for(var i = 0; i < crocQueue.length; i++) {
		this.crocs.push(new Croc(crocQueue[i]));
	}

	// sets current croc reference to first in list
	this.currIndex = ko.observable(0);

	// initializes the highest level unlocked at 0
	this.levelRecord = ko.observable(0);

	/* END INIT */


	/* BEGIN FUNCTIONS */

	var self = this;

	this.reset = function() {
		// resets game info to initial

		for(var i = 0; i < self.crocs.length; i++) {
			self.crocs[i].reset();
		}
		self.currIndex(0);
		self.levelRecord(0);
	};

	this.setCurrent = function(index) {
		// sets current croc to specified index

		self.currIndex(index);
	};

	this.currentCroc = ko.computed(function() {
		// returns the currently featured croc

		return this.crocs[this.currIndex()];
	}, self);

	this.totalClicks = ko.computed(function() {
		// computes and returns the total number of clicks

		var total = 0;
		for(var i = 0; i < this.crocs.length; i++) {
			total += this.crocs[i].clickCounter();
		}
		return total;
	}, self);

	this.currLevel = ko.computed(function() {
		// returns the number of the current level

		return this.currIndex() + 1;
	}, self);

	this.levelsUnlocked = ko.computed(function() {
		// returns the number of levels that have been unlocked

		var ceil = LEVEL_BASE;
		var levels = 1;
		while(ceil <= this.totalClicks()) {
			ceil *= LEVEL_BASE;
			levels++;
		}
		if(levels > this.crocs.length) {
			levels = this.crocs.length;
		}
		
		// if this is the most levels that have been unlocked, plays croc roar
		if(levels > this.levelRecord()) {
			SELECT_AUDIO.play();
			this.levelRecord(levels);
		}

		return levels;
	}, self);

	this.clicksToUnlock = ko.computed(function() {
		// returns number of clicks needed to unlock next croc

		return Math.pow(LEVEL_BASE, this.levelsUnlocked()) - this.totalClicks();
	}, self);

	this.allUnlocked = ko.computed(function() {
		// determines true or false: are all levels unlocked?
		
		return this.levelsUnlocked() === this.crocs.length;	
	}, self);

	this.headerText = ko.computed(function() {
		// returns text for croc header

		return "Level " + this.currLevel() + ": " + this.currentCroc().name();
	}, self);
	
	/* END FUNCTIONS */
};

/* END VIEWMODEL */


/* INITIALIZE APP */

var vm = new ViewModel();
ko.applyBindings(vm);

/* END INITIALIZE APP */