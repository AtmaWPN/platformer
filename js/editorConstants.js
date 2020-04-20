//------------
//System Values
//------------
var grid = 32;
var STAGE_WIDTH = 900;
var STAGE_HEIGHT = 600;

var black = 'rgb(0 0 0)';
var	grey = 'rgb(128 128 128)';
var	white = 'rgb(255 255 255)';
var	red = 'rgb(255 0 0)';
var	green = 'rgb(0 255 0)';
var	blue = 'rgb(0 0 255)';
var	yellow = 'rgb(255 255 0)';
var	lblue = 'rgb(0 255 255)';
var	magenta = 'rgb(255 0 255)';
var greyOverlay = 'rgba(0, 0, 0, 0.5)';

var border = 4;

var levelDefault = `
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................
..........................`

//character image
var character1Ready = false;
var character1Image = new Image();
character1Image.onload = function () {
	character1Ready = true;
};
character1Image.src = "images/Character.png";
//character flipped image
var character2Ready = false;
var character2Image = new Image();
character2Image.onload = function () {
	character2Ready = true;
};
character2Image.src = "images/Character_flipped.png";
//goal image
var doorReady = false;
var doorImage = new Image();
doorImage.onload = function () {
	doorReady = true;
};
doorImage.src = "images/door.png";
//character icon
var charIconReady = false;
var charIconImage = new Image();
charIconImage.onload = function () {
	charIconReady = true;
};
charIconImage.src = "images/characterIcon.png";
//goal icon
var doorIconReady = false;
var doorIconImage = new Image();
doorIconImage.onload = function () {
	doorIconReady = true;
};
doorIconImage.src = "images/doorIcon.png";
//delete icon
var deleteReady = false;
var deleteImage = new Image();
deleteImage.onload = function () {
	deleteReady = true;
};
deleteImage.src = "images/delete.png";
//block image
var blockReady = false;
var blockImage = new Image();
blockImage.onload = function () {
	blockReady = true;
};
blockImage.src = "images/Lava_Brick_V2.png";
//spike image
var spikeReady = false;
var spikeImage = new Image();
spikeImage.onload = function () {
	spikeReady = true;
};
spikeImage.src = "images/Single_Spike_8x8.png";
//Lava BG image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/red_Lava_BG.png";
//Lava BG image
var camIconReady = false;
var camIconImage = new Image();
camIconImage.onload = function () {
	camIconReady = true;
};
camIconImage.src = "images/cameraIcon.png";


	
	