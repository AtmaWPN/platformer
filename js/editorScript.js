//set up the canvas
var stage = document.getElementById("gameCanvas");
stage.width = 900;
stage.height = 600;
var ctx = stage.getContext("2d");

var state = 'editor';

var painting = false;
var mouseX = -69;
var mouseY = -69;
var cameraX = 450;
var cameraY = 300;
var XTarget = 450;
var YTarget = 300;
var velocity = 0;

var playerX = -69;
var playerY = -69;
var goal = [-69, -69];
var blocks = [];
var spikes = [];
var itemCursor = -2;

var defaultRow = '';
var levelName = "";
var levelArray = levelDefault.trim().split("\n");
var levelString = ``;
var levelWidth = 87;
var levelHeight = 87;
var leftmost = 87;
var rightmost = 0;
var upmost = 87;
var downmost = 0;

var lerp = function (target, current, scalar) {
  velocity = (target - current) * scalar;
  return Math.floor(velocity);
};

var cameraBounds = function () {
  if (cameraX < stage.width / 2) {
    cameraX = stage.width / 2;
  }
  if (cameraY < stage.height / 2) {
    cameraY = stage.height / 2;
  }
  if (cameraX > levelWidth * grid - stage.width / 2) {
    cameraX = levelWidth * grid - stage.width / 2;
  }
  if (cameraY > levelHeight * grid - stage.height / 2) {
    cameraY = levelHeight * grid - stage.height / 2;
  }
};

var targetBounds = function () {
  if (XTarget < stage.width / 2) {
    XTarget = stage.width / 2;
  }
  if (YTarget < stage.height / 2) {
    YTarget = stage.height / 2;
  }
  if (XTarget > levelWidth * grid - stage.width / 2) {
    XTarget = levelWidth * grid - stage.width / 2;
  }
  if (YTarget > levelHeight * grid - stage.height / 2) {
    YTarget = levelHeight * grid - stage.height / 2;
  }
};

// Function to change a specific character in a string (not mine)
function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
};

// Function to download data to a file (not mine)
function download (data, filename) {
  var file = new Blob([data], {type: 'text/plain'});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }
};

var drawWalls = function () {
  ctx.fillStyle = black;
  for (i = 0; i < blocks.length; i++) {
    //ctx.fillRect(blocks[i][0] * grid - cameraX + (stage.width / 2), blocks[i][1] * grid - cameraY + (stage.height / 2), grid, grid);
    if (blockReady) {
      ctx.drawImage(blockImage, blocks[i][0] * grid - cameraX + (stage.width / 2), blocks[i][1] * grid - cameraY + (stage.height / 2));
    }
  }
};

var drawSpikes = function () {
  for (i = 0; i < spikes.length; i++) {
    if (spikeReady) {
      ctx.drawImage(spikeImage, spikes[i][0] * grid - cameraX + (stage.width / 2), spikes[i][1] * grid - cameraY + (stage.height / 2));
    }
    //hitbox visualization
    /*ctx.fillStyle = red;
    ctx.fillRect(spikes[i][0] * grid + grid / 4 - cameraX + (stage.width / 2) - 1, spikes[i][1] * grid + grid / 4 - cameraY + (stage.height / 2) - 1, grid / 2 + 2, grid / 2 + 2);
    */
  }
};

var editor = {
  update : function () {
    if (mouseX > stage.width - grid * 2 - border && mouseX < stage.width - border && mouseY > border && mouseY < border + grid * 18) {
      itemCursor = Math.floor((mouseY - border) / (grid * 2));
    }
    if (mouseX < stage.width - grid * 2 - border) {
      switch(itemCursor) {
        case 0:
          blocks[blocks.length] = [Math.floor((mouseX + cameraX - (stage.width / 2)) / grid), Math.floor((mouseY + cameraY - (stage.height / 2)) / grid)];
          mouseX = stage.width;
          break;
        case 1:
          spikes[spikes.length] = [Math.floor((mouseX + cameraX - (stage.width / 2)) / grid), Math.floor((mouseY + cameraY - (stage.height / 2)) / grid)];
          mouseX = stage.width;
          break;
        case 2:
          playerX = Math.floor((mouseX + cameraX - (stage.width / 2)) / grid) * grid;
          playerY = Math.floor((mouseY + cameraY - (stage.height / 2)) / grid) * grid;
          mouseX = stage.width;
          break;
        case 3:
          goal = [Math.floor((mouseX + cameraX - (stage.width / 2)) / grid), Math.floor((mouseY + cameraY - (stage.height / 2)) / grid)];
          mouseX = stage.width;
          break;
        case 7:
          XTarget = mouseX + cameraX - (stage.width / 2);
          YTarget = mouseY + cameraY - (stage.height / 2);
          mouseX = stage.width;
          break;
        case 8:
          for (i = 0; i < blocks.length; i++) {
            if (blocks[i][0] == Math.floor((mouseX + cameraX - (stage.width / 2)) / grid) && blocks[i][1] == Math.floor((mouseY + cameraY - (stage.height / 2)) / grid)) {
              blocks.splice(i, 1);
            }
          }
          for (i = 0; i < spikes.length; i++) {
            if (spikes[i][0] == Math.floor((mouseX + cameraX - (stage.width / 2)) / grid) && spikes[i][1] == Math.floor((mouseY + cameraY - (stage.height / 2)) / grid)) {
              spikes.splice(i, 1);
            }
          }
          break;
        default:
       //default code, if there ever is any
      }
    }
  },
  render : function () {
    ctx.fillStyle = grey;
    ctx.fillRect(0, 0, stage.width, stage.height);
   
    if (bgReady) {
      ctx.drawImage(bgImage, 0, 0);
    }
   //Camera Controls
    targetBounds();
    cameraX += lerp(XTarget, cameraX, 0.1);
    cameraY += lerp(YTarget, cameraY, 0.1);
    cameraBounds();
   //level element selection cursor
    ctx.strokeStyle = white;
    ctx.strokeRect(stage.width - border - grid * 2, 5 + grid * 2 * itemCursor, grid * 2, grid * 2);
   //draw placed level elements
    if (doorReady) {
      ctx.drawImage(doorImage, goal[0] * grid - cameraX + (stage.width / 2) - 4, goal[1] * grid - cameraY + (stage.height / 2) - 4);
    }
	 //Draw Player
    if (character1Ready) {
      ctx.drawImage(character1Image, playerX - cameraX + (stage.width / 2) - 4, playerY - cameraY + (stage.height / 2));
    }
    drawWalls();
    drawSpikes();
   //gridlines
    ctx.strokeStyle = greyOverlay;
    for (i = 0; i < (stage.width - grid * 2 + cameraX - (stage.width / 2)) / grid; i++) {
      ctx.strokeRect(i * grid - cameraX + (stage.width / 2), 0, 0, stage.height);
    }
    for (i = 0; i < (stage.height + cameraY - (stage.height / 2)) / grid; i++) {
      ctx.strokeRect(0, i * grid - cameraY + (stage.height / 2), stage.width - border - grid * 2, 0);
    }
   //level element palette
    ctx.fillStyle = greyOverlay;
    ctx.fillRect(stage.width - border - grid * 2, border, grid * 2, stage.height - border * 2);
    if (blockReady) {
      ctx.drawImage(blockImage, stage.width - border - 3 * grid / 2, border + grid / 2);
    }
    if (spikeReady) {
      ctx.drawImage(spikeImage, stage.width - border - 3 * grid / 2, border + 5 * grid / 2);
    }
    if (charIconReady) {
      ctx.drawImage(charIconImage, stage.width - border - 3 * grid / 2, border + 9 * grid / 2);
    }
    if (doorIconReady) {
      ctx.drawImage(doorIconImage, stage.width - border - 3 * grid / 2, border + 13 * grid / 2);
    }
    if (deleteReady) {
      ctx.drawImage(deleteImage, stage.width - border - 3 * grid / 2, border + 33 * grid / 2);
    }
    if (camIconReady) {
      ctx.drawImage(camIconImage, stage.width - border - 3 * grid / 2, border + 29 * grid / 2 - grid / 8);
    }
   //dev values
    ctx.fillStyle = white;
    ctx.font = "12px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText('playerX: ' + playerX, 0, 0);
    ctx.fillText('grid click x: ' + Math.floor(mouseX / grid), 0, 12);
    ctx.fillText('grid click y: ' + Math.floor(mouseY / grid), 0, 24);
    ctx.fillText('itemCursor: ' + itemCursor, 0, 36);
    ctx.fillText('goalX: ' + goal[0], 0, 48);
    ctx.fillText('cameraX: ' + cameraX, 0, 60);
    ctx.fillText('cameraY: ' + cameraY, 0, 72);
    ctx.fillText('velocity: ' + velocity, 0, 84);
    ctx.fillText('XTarget: ' + XTarget, 0, 96);
    ctx.fillText('YTarget: ' + YTarget, 0, 108);
    /*ctx.fillText('goal: ' + goal, 0, 120);*/
	}
};

var main = function () {
  switch(state) {
	  case 'editor':
		editor.update();
		editor.render();
		break;
	  default:
		alert('state not found');
	}
  requestAnimationFrame(main);
};

var levelBounds = function () {
  for (i = 0; i < blocks.length; i++) {
    if (blocks[i][0] > rightmost) {
      rightmost = blocks[i][0];
    }
    if (blocks[i][1] > downmost) {
      downmost = blocks[i][1];
    }
  }
  for (i = 0; i < spikes.length; i++) {
    if (spikes[i][0] > rightmost) {
      rightmost = spikes[i][0];
    }
    if (spikes[i][1] > downmost) {
      downmost = spikes[i][1];
    }
  }
  if (playerX / 32 > rightmost) {
    rightmost = playerX / 32;
  }
  if ((playerY / 32) + 1 > downmost) {
    downmost = (playerY / 32) + 1;
  }
  if (goal[0] > rightmost) {
    rightmost = goal[0];
  }
  if (goal[1] + 1 > downmost) {
    downmost = goal[1] + 1;
  }
};

var downloadLevel = function () {
  levelName = prompt("Enter Level Name: ", "L1_1");
  levelBounds();
  if (rightmost + 1 < 28) {
    levelWidth = 28;
  } else {
    levelWidth = rightmost + 1;
  }
  if (downmost + 1 < 19) {
    levelHeight = 19;
  } else {
    levelHeight = downmost + 1;
  }
 //default (blank) level generation
  for (; defaultRow.length < levelWidth;) {
    defaultRow = defaultRow.substring(0, defaultRow.length) + '.';
  }
  for (i = 0; i < levelHeight; i++) {
    levelArray[i] = defaultRow;
  }
 //fill in the blank level with level elements
  for (i = 0; i < blocks.length; i++) {
    levelArray[blocks[i][1]] = setCharAt(levelArray[blocks[i][1]], blocks[i][0], '#');
  }
  for (i = 0; i < spikes.length; i++) {
    levelArray[spikes[i][1]] = setCharAt(levelArray[spikes[i][1]], spikes[i][0], '^');
  }
  levelArray[playerY / grid] = setCharAt(levelArray[playerY / grid], playerX / grid, '@');
  levelArray[goal[1]] = setCharAt(levelArray[goal[1]], goal[0], 'E');
  levelString = levelArray.join("\n");
  download(levelString, levelName);
  levelHeight = 87;
  levelWidth = 87;
};

var mouseTrack = function (event) {
  mouseX = event.clientX - stage.offsetLeft + document.body.scrollLeft;
	mouseY = event.clientY - stage.offsetTop + document.body.scrollTop;
}

addEventListener('mousedown', e => {
  mouseTrack(e);
  painting = true;
});
addEventListener('mousemove', e => {
  if (painting == true) {
    mouseTrack(e);
  }
});
addEventListener('mouseup', e => {
  mouseX = stage.width;
  painting = false;
});

main();





















