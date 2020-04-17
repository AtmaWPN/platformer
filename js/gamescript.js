//set up the canvas
var stage = document.getElementById("gameCanvas");
stage.width = STAGE_WIDTH;
stage.height = STAGE_HEIGHT;
var ctx = stage.getContext("2d");
ctx.fillStyle = "black";
ctx.font = GAME_FONTS;

var state = "menu";

var mouseX = 0;
var mouseY = 0;

var playerX = 0;
var playerY = 0;
var respawnX = 0;
var respawnY = 0;
var newX = 0;
var newY = 0;
var speedX = 0;
var speedY = 0;
var clearX = true;
var clearY = true;
var coyoteTime = 0;
var crouch = false;
var tallness = playerHeight;
var squished = false;
var dead = false;
var deathCam = 0;

var facing = 'right';
var camXSpeed = 0;
var camYspeed = 0;
var velocity = 0;
var n = 0;

var currentHeight = playerHeight;

var cameraX = stage.width / 2;
var cameraY = stage.height / 2;
var camTarget = stage.width / 2;

var levelHeight = 0;
var levelWidth = 0;

var testBool1 = false;
var testBool2 = false;
var testBool3 = false;
var testBool4 = false;
var testBool5 = false;

var packProgress = 0;
var levelPack1 = [L1_1, L1_2, L1_3, L1_4, L1_5];

var masterLevelArray = [];

var a1 = 0;
var a2 = 0;

var wait = false;
var jumpCount = 2;
var jumped = false;

var blocks = [[9, 18], [19, 13], [19, 14], [20, 14], [21, 12], [27, 4], [26, 4], [25, 4], [21, 19]];
var spikes = [[0, 0], [9, 18], [19, 13], [19, 14], [20, 14], [21, 12], [27, 4], [26, 4], [25, 4], [21, 19]];
var goal = [];

var touch = {
  left: false,
  right: false,
  floor: true,
  roof: false
}

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

var testPlan = `
.......................
...#........###........
...#...@...........#...
...#............^.E#...
...#################...
.......................`;

var loadLevel = function (plan) {
  masterLevelArray = plan.trim().split("\n");
  levelHeight = masterLevelArray.length;
  levelWidth = masterLevelArray[0].length;
  blocks = [];
  spikes = [];
  goal = [];
  for (i = 0; i < masterLevelArray.length; i++) {
    for (j = 0; j < masterLevelArray[0].length; j++) {
      if (masterLevelArray[i][j] == `#`) {
        blocks[blocks.length] = [j, i];
      } else if (masterLevelArray[i][j] == `@`) {
        playerX = j * grid;
        newX = playerX;
        playerY = i * grid;
        respawnX = j * grid;
        respawnY = i * grid;
      } else if (masterLevelArray[i][j] == `^`) {
        spikes[spikes.length] = [j, i];
      } else if (masterLevelArray[i][j] == `E`) {
        goal[goal.length] = j;
        goal[goal.length] = i;
      }
    }
  }
};

var collideMaster = function () {
  //ceiling
  touch.roof = false;
  for (i = 0; i < blocks.length; i++) {
    if ((blocks[i][0] * grid) < (playerX + playerWidth) && (blocks[i][0] * grid) > (playerX - grid) && (playerY - (blocks[i][1] * grid + grid)) == 0) {
      touch.roof = true;
    } else if (playerY <= 0) {
      playerY = 0;
      touch.roof = true;
    }
  }
  //right wall
  touch.right = false;
  for (i = 0; i < blocks.length; i++) {
    if ((blocks[i][1] * grid) < (playerY + tallness) && (blocks[i][1] * grid) > (playerY - grid) && ((blocks[i][0] * grid) - (playerX + playerWidth)) == 0) {
      touch.right = true;
    } else if (playerX >= (levelWidth * grid - playerWidth)) {
      playerX = (levelWidth * grid - playerWidth);
      touch.right = true;
    }
  }
  //floor
  if (coyoteTime == coyoteFrames) {
    touch.floor = false;
  } else if (coyoteTime < coyoteFrames) {
    coyoteTime++;
  }
  for (i = 0; i < blocks.length; i++) {
    if ((blocks[i][0] * grid) < (playerX + playerWidth) && (blocks[i][0] * grid) > (playerX - grid) && (blocks[i][1] * grid - (playerY + tallness)) == 0) {
      touch.floor = true;
      coyoteTime = 0;
    } else if (playerY >= (levelHeight * grid - tallness)) {
      playerY = (levelHeight * grid - tallness);
      touch.floor = true;
      coyoteTime = 0;
    }
  }
  //left
  touch.left = false;
  for (i = 0; i < blocks.length; i++) {
    if ((blocks[i][1] * grid) < (playerY + tallness) && (blocks[i][1] * grid) > (playerY - grid) && (playerX - (blocks[i][0] * grid + grid)) == 0) {
      touch.left = true;
    } else if (playerX <= 0) {
      playerX = 0;
      touch.left = true;
    }
  }
  if (touch.floor == true) {
    if (speedY > 0) {
      speedY = 0;
    }
    jumpCount = 2;
  }
  if (touch.left == true) {
    speedX = 0;
    facing = 'right';
  }
  if (touch.right == true) {
    speedX = 0;
    facing = 'left';
  }
  if (touch.roof == true) {
    speedY = 0;
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
    /*ctx.fillStyle = white;
    ctx.beginPath();
    ctx.moveTo(spikes[i][0] * grid - cameraX + (stage.width / 2), spikes[i][1] * grid + grid - cameraY + (stage.height / 2));
    ctx.lineTo(spikes[i][0] * grid + grid - cameraX + (stage.width / 2), spikes[i][1] * grid + grid - cameraY + (stage.height / 2));
    ctx.lineTo(spikes[i][0] * grid + 3 * grid / 4 - cameraX + (stage.width / 2), spikes[i][1] * grid - cameraY + (stage.height / 2));
    ctx.lineTo(spikes[i][0] * grid + grid / 2 - cameraX + (stage.width / 2), spikes[i][1] * grid + grid - cameraY + (stage.height / 2));
    ctx.lineTo(spikes[i][0] * grid + grid / 4 - cameraX + (stage.width / 2), spikes[i][1] * grid - cameraY + (stage.height / 2));
    ctx.fill();*/
    if (spikeReady) {
      ctx.drawImage(spikeImage, spikes[i][0] * grid - cameraX + (stage.width / 2), spikes[i][1] * grid - cameraY + (stage.height / 2));
    }
    //hitbox visualization
    /*ctx.fillStyle = red;
    ctx.fillRect(spikes[i][0] * grid + grid / 4 - cameraX + (stage.width / 2) - 1, spikes[i][1] * grid + grid / 4 - cameraY + (stage.height / 2) - 1, grid / 2 + 2, grid / 2 + 2);
    */
  }
};

var canvasClick = function (event) {
	mouseX = event.clientX - stage.offsetLeft + document.body.scrollLeft;
	mouseY = event.clientY - stage.offsetTop + document.body.scrollTop;
};

var updateX = function () {
  clearX = true;
  for (i = 0; i < blocks.length; i++) {
    if (newX > playerX && (blocks[i][1] * grid) < (playerY + tallness) && (blocks[i][1] * grid) > (playerY - grid) && ((blocks[i][0] * grid) - (playerX + playerWidth)) >= 0 && ((blocks[i][0] * grid) - (playerX + playerWidth)) < (newX - playerX)) {
      playerX = (blocks[i][0] * grid) - playerWidth;
      newX = playerX;
      clearX = false;
      touch.right = true;
    } else if (newX < playerX && (blocks[i][1] * grid) < (playerY + tallness) && (blocks[i][1] * grid) > (playerY - grid) && (playerX - (blocks[i][0] * grid + grid)) >= 0 && (playerX - (blocks[i][0] * grid + grid)) < (playerX - newX)) {
      playerX = (blocks[i][0] * grid) + grid;
      newX = playerX;
      clearX = false;
      touch.left = true;
    }
  }
  //spike detection
  for (i = 0; i < spikes.length; i++) {
    if (newX > playerX && (spikes[i][1] * grid + grid / 4 - 1) < (playerY + tallness) && (spikes[i][1] * grid + grid / 4 - 1) > (playerY - grid / 2 + 2) && ((spikes[i][0] * grid + grid / 4 - 1) - (playerX + playerWidth)) >= 0 && ((spikes[i][0] * grid + grid / 4 - 1) - (playerX + playerWidth)) < (newX - playerX)) {
      dead = true;
      playerX = spikes[i][0] * grid + grid / 4;
    } else if (newX < playerX && (spikes[i][1] * grid + grid / 4 - 1) < (playerY + tallness) && (spikes[i][1] * grid + grid / 4 - 1) > (playerY - grid / 2 + 2) && (playerX - (spikes[i][0] * grid + grid / 4 - 1 + grid / 2 + 2)) >= 0 && (playerX - (spikes[i][0] * grid + grid / 4 - 1 + grid / 2 + 2)) < (playerX - newX)) {
      dead = true;
      playerX = spikes[i][0] * grid + grid / 4 + grid / 2;
    }
  }
  if (clearX == true) {
    playerX = newX;
  }
  if (speedX == 0) {
    if (playerX % 8 < 5) {
      playerX -= playerX % 8;
    } else if (playerX % 8 > 4) {
      playerX += (8 - playerX % 8);
    }
  }
  if (crouch == true && touch.right == false && touch.left == false && touch.floor && playerX % 8 == 0) {
    playerX++;
  }
};

var updateY = function () {
  clearY = true;
  for (i = 0; i < blocks.length; i++) {
    if (speedY > 0 && (blocks[i][0] * grid) < (playerX + playerWidth) && (blocks[i][0] * grid) > (playerX - grid) && (blocks[i][1] * grid - (playerY + tallness)) >= 0 && (blocks[i][1] * grid - (playerY + tallness)) < speedY) {
      playerY = (blocks[i][1] * grid) - tallness;
      speedY = 0;
      clearY = false;
    } else if (speedY < 0 && (blocks[i][0] * grid) < (playerX + playerWidth) && (blocks[i][0] * grid) > (playerX - grid) && (playerY - (blocks[i][1] * grid + grid)) >= 0 && (playerY - (blocks[i][1] * grid + grid)) < -speedY) {
      playerY = (blocks[i][1] * grid) + grid;
      speedY = 0;
      clearY = false;
    }
  }
  //spike detection
  for (i = 0; i < spikes.length; i++) {
    if (speedY > 0 && (spikes[i][0] * grid + grid / 4 - 1) < (playerX + playerWidth) && (spikes[i][0] * grid + grid / 4 + 1 + grid / 2) > playerX && ((spikes[i][1] * grid + grid / 4 - 1) - (playerY + tallness)) >= 0 && ((spikes[i][1] * grid + grid / 4 - 1) - (playerY + tallness)) < speedY) {
      dead = true;
      playerY = spikes[i][1] * grid + grid / 4 - tallness;
      speedY = 0;
    } else if (speedY < 0 && (spikes[i][0] * grid + grid / 4 - 1) < (playerX + playerWidth) && (spikes[i][0] * grid + grid / 4 + 1 + grid / 2) > playerX && (playerY - (spikes[i][1] * grid + grid / 4 - 1 + grid / 2 + 2)) >= 0 && (playerY - (spikes[i][1] * grid + grid / 4 - 1 + grid / 2 + 2)) < -speedY) {
      dead = true;
      playerY = spikes[i][1] * grid + grid / 4 + grid / 2;
      speedY = 0;
    }
  }
  if (clearY == true) {
    playerY += speedY;
  }
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

var lerp = function (target, current, scalar) {
  velocity += (.1 * (target - current) / 2 - velocity) * scalar;
  return velocity;
};

var clearanceCheck = function () {
  for (i = 0; i < blocks.length; i++) {
    if ((blocks[i][0] * grid) < (playerX + playerWidth) && (blocks[i][0] * grid) > (playerX - grid) && Math.abs(blocks[i][1] * grid + grid - playerY) < grid) {
      return true;
    }
  }
  if (playerY < grid) {
    return true;
  }
  return false;
};

var goalReached = function () {
  if (playerX <= goal[0] * grid + grid && playerX >= goal[0] * grid - playerWidth && playerY >= goal[1] * grid - playerHeight && playerY <= goal[1] * grid + grid * 2) {
    state = 'levelWon';
  }
};

var game = {
	update : function () {
  //player controls
    if (38 in keysDown && jumped == false && crouch == false && touch.floor == false && (touch.left == true || touch.right == true)) {
    //walljump
      speedY = jumpHeight - 2;
      if (touch.left == true) {
        speedX = 15;
      } else if (touch.right == true) {
        speedX = -15;
      }
      jumpCount = 1;
      jumped = true;
    } else if (38 in keysDown && crouch == false && jumpCount == 2 && jumped == false) {
    //jump
      speedY = jumpHeight;
      if (touch.floor == false) {
        jumpCount = 0;
      } else {
        jumpCount = 1;
      }
      jumped = true;
    } else if (38 in keysDown && crouch == false && jumpCount == 1 && jumped == false) {
    //double jump
      speedY = jumpHeight + 1;
      jumpCount = 0;
      jumped = true;
    }
    if (40 in keysDown) { // Player holding down
      tallness = crouchHeight;
      if (crouch == false) {
        playerY += (playerHeight - crouchHeight);
      }
      crouch = true;
    } else if (clearanceCheck() == false) {
      tallness = playerHeight;
      if (crouch == true) {
        playerY -= (playerHeight - crouchHeight);
      }
      crouch = false;
    }
    if (37 in keysDown) { // Player holding left
      newX -= speed;
      facing = 'left';
    }
    if (39 in keysDown) { // Player holding right
      newX += speed;
      facing = 'right';
    }
  //player movement
    speedY += gravityConst;
    newX += speedX;
    //where you get mid-execution values to display
    /*testBool1 = Boolean((spikes[0][1] * grid + grid / 4 - 1) < (playerY + tallness));
    testBool2 = Boolean((spikes[0][1] * grid + grid / 4 - 1) > (playerY - grid / 2 + 2));
    testBool3 = Boolean((spikes[0][0] * grid + grid / 4 - 1) - (playerX + playerWidth) >= 0);
    testBool4 = Boolean((spikes[0][0] * grid + grid / 4 - 1) - (playerX + playerWidth) < (newX - playerX));
    testBool5 = Boolean((playerX - (blocks[7][0] * grid + grid)) < (newX - playerX));*/
   //death handling
    if (dead == false) {
      updateX();
      updateY();
    } else if (deathCam >= deathFrames) {
      playerX = respawnX;
      playerY = respawnY;
      newX = playerX;
      deathCam = 0;
      dead = false;
    } else {
      deathCam++;
    }
  //decceleration
    if (speedX > 0) {
      speedX -= 1;
    } else if (speedX < 0) {
      speedX += 1;
    }
    if (speedY > 0 && (touch.right == true || touch.left == true)) { //wall slide
      speedY *= .8;
    }
   //collisions
    collideMaster();
    newX = playerX;
  //camera controls
    /*if (facing == 'right') {
      camTarget = playerX + 100;
    } else if (facing == 'left') {
      camTarget = playerX - 100;
    }
    if (Math.abs(velocity) > Math.abs((camTarget - cameraX) * 0.1)) {
      n = 0;
      velocity = (camTarget - cameraX) * 0.1;
    } else if (camTarget > cameraX && velocity < 10) {
      n++;
      velocity += .05 * n;
    } else if (camTarget < cameraX && velocity > -10) {
      n++;
      velocity -= .05 * n;
    }
    cameraX += velocity;*/
    if (playerX > cameraX + 100) {
      cameraX += speed + 2;
    } else if (playerX < cameraX - 100) {
      cameraX -= speed + 2;
    } else if (playerX > cameraX + 75) {
      cameraX += speed;
    } else if (playerX < cameraX - 75) {
      cameraX -= speed;
    }
    /*if (playerY > cameraY + 50) {
      cameraY += speedY;
    } else if (playerY < cameraY - 50) {
      cameraY -= speedY;
    }*/
    //cameraY = playerY;
    if (Math.abs(playerY - cameraY) > 50) {
      cameraY += lerp(playerY, cameraY, .3);
    }
    /*if (touch.right == true || touch.left == true || touch.floor == true) {
      if (cameraY > playerY) {
        cameraY -= speed;
      } else if (cameraY < playerY) {
        cameraY += speed;
      }
    }*/
    cameraBounds();
    goalReached();
	},
	render : function () {
	 //background
		//ctx.fillStyle = grey;
		//ctx.fillRect(0, 0, stage.width, stage.height);
    if (bgReady) {
      ctx.drawImage(bgImage, 0, 0);
    }
	 //Draw Player
    if (character1Ready && character2Ready) {
      if (facing == 'right') {
        ctx.drawImage(character1Image, playerX - cameraX + (stage.width / 2) - 4, playerY - cameraY + (stage.height / 2) - (64 - 58));
      } else if (facing == 'left') {
        ctx.drawImage(character2Image, playerX - cameraX + (stage.width / 2), playerY - cameraY + (stage.height / 2) - (64 - 58));
      }
    }
    drawWalls();
		/*ctx.fillStyle = blue;
		ctx.fillRect(playerX - cameraX + (stage.width / 2), playerY - cameraY + (stage.height / 2), playerWidth, tallness);
    ctx.fillStyle = red;
    //eyes
    if (facing == 'right') {
      ctx.fillRect(playerX - cameraX + (stage.width / 2) + 8, playerY - cameraY + (stage.height / 2) + 5, 10, 10);
      ctx.fillRect(playerX - cameraX + (stage.width / 2) + 27, playerY - cameraY + (stage.height / 2) + 5, 7, 10);
    } else if (facing == 'left') {
      ctx.fillRect(playerX - cameraX + (stage.width / 2) + 14, playerY - cameraY + (stage.height / 2) + 5, 10, 10);
      ctx.fillRect(playerX - cameraX + (stage.width / 2) - 3, playerY - cameraY + (stage.height / 2) + 5, 7, 10);
    }*/
   //draw level borders (only seen in small levels)
    ctx.fillStyle = black;
    ctx.fillRect(0, 0, stage.width, stage.height - levelHeight * grid);
    ctx.fillRect(0, 0, stage.width - levelWidth * grid, stage.height);
    drawSpikes();
    ctx.fillStyle = yellow;
    ctx.fillRect(goal[0] * grid - cameraX + (stage.width / 2), goal[1] * grid - cameraY + (stage.height / 2), grid, grid * 2);
	}
};

var menu = {
	update : function () {
    if (mouseX > ((stage.width / 2) - 58) && mouseX < ((stage.width / 2) + 58) && mouseY > ((stage.height / 2) - 18) && mouseY < ((stage.height / 2) + 18)) {
      state = 'game';
      loadLevel(levelPack1[packProgress]);
    }
	},
	render : function () {
    ctx.fillStyle = black;
    ctx.fillRect(0, 0, stage.width, stage.height);
    ctx.fillStyle = white;
    ctx.font = "69px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "center";
    ctx.fillText("GAME WITHOUT A NAME", stage.width / 2, 69);
    ctx.font = "36px Helvetica";
	  ctx.fillText("START", stage.width / 2, stage.height / 2 - 17);
    ctx.fillText("(yet)", stage.width / 2, 136);
	}
};

var pause = {
  update : function () {
    
  },
  render : function () {
    
  }
};

var levelWon = {
  update : function () {
    if (mouseX > 2 * stage.width / 3 - 75 && mouseX < 2 * stage.width / 3 + 75 && mouseY > stage.height - 100 && mouseY < stage.height - 50 || 32 in keysDown) {
      mouseX = 0;
      mouseY = 0;
      packProgress++;
      if (packProgress >= levelPack1.length) {
        state = 'menu';
        packProgress = 0;
      } else {
        state = 'game';
        loadLevel(levelPack1[packProgress]);
      }
    }
  },
  render : function () {
    ctx.fillStyle = greyOverlay;
    ctx.fillRect(stage.width / 5, 0, 3 * stage.width / 5, stage.height);
    /*next button clickbox
    ctx.fillStyle = black;
    ctx.fillRect(2 * stage.width / 3 - 75, stage.height - 100, 150, 50);*/
    ctx.fillStyle = white;
    ctx.font = "24px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "center";
    ctx.fillText('NEXT LEVEL', 2 * stage.width / 3, stage.height - 100);
    ctx.fillText('(SPACE)', 2 * stage.width / 3, stage.height - 76);
  }
};

var main = function () {
	switch(state) {
	  case 'game':
		game.update();
		game.render();
		break;
	  case 'menu':
		menu.update();
		menu.render();
		break;
    case 'pause':
		pause.update();
		pause.render();
		break;
    case 'levelWon':
		levelWon.update();
    game.render();
		levelWon.render();
		break;
	  default:
		alert('state not found')
	}
  //dev values
  ctx.fillStyle = white;
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	/*ctx.fillText('jumpCount = ' + jumpCount, 0, 0);
  ctx.fillText('left: ' + touch.left, 0, 12);
  ctx.fillText('playerY: ' + playerY, 0, 24);
  ctx.fillText('mouseX: ' + mouseX, 0, 36);
  ctx.fillText('mouseY: ' + mouseY, 0, 48);
  ctx.fillText('bool2: ' + testBool2, 0, 60);
  ctx.fillText('bool1: ' + testBool1, 0, 75);
  ctx.fillText('velocity: ' + velocity, 0, 90);
  ctx.fillText('cameraX: ' + cameraX, 0, 105);
  ctx.fillText('deathFrames: ' + deathCam, 0, 120);
  ctx.fillText('goal: ' + goal, 0, 135);
  
  ctx.fillText('dead?: ' + dead, 0, 150);
  ctx.fillText('n: ' + n, 0, 165);*/
  
	requestAnimationFrame(main);
};

var keysDown = {};

addEventListener("keydown", function (e) {
  keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
  delete keysDown[e.keyCode];
  if (38 in keysDown) {
    jumped = true;
  } else {
    jumped = false;
  }
  wait = false;
}, false);

addEventListener("click", canvasClick, false);

main();
