class Sprite
{
	constructor(img, renderWidth, renderHeight, width, height, numberOfFrames, x, y, lane, totalSteps)
	{
		this.img = img;
		this.renderWidth = renderWidth;
		this.renderHeight = renderHeight;
		this.width = width;
		this.height = height;
		this.numberOfFrames = numberOfFrames;
		this.frameIndex = 0;
		this.x = x;
		this.y = y;
		this.lane = lane;
		this.jumping = false;
		this.currentStep = 0;
		this.totalSteps = totalSteps;
	}

	render(ctx) // affiche l'image
	{
		ctx.rect(this.x, this.y, this.renderWidth, this.renderHeight);
		//ctx.stroke();
		ctx.drawImage(this.img, this.width*this.frameIndex, 0, this.width, this.height, this.x, this.y, this.renderWidth, this.renderHeight);
	}

	updateSprite() // change l'image du sprite
	{
		if (this.frameIndex < this.numberOfFrames - 1) 
		{
			this.frameIndex++;
		}
		else
		{
			this.frameIndex = 0;
		}
	}

	moveObstacle(obstaclesSteps, intervalCount)
	{
		if (this.currentStep < 10 && intervalCount % 10 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-10');
		}
		else if (this.currentStep >= 10 && this.currentStep < 20 && intervalCount % 7 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-20');
		}
		else if (this.currentStep >= 20 && this.currentStep < 30 && intervalCount % 4 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-30');
		}
		else if (this.currentStep >= 30 && this.currentStep < 40 && intervalCount % 3 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-40');
		}
		else if (this.currentStep >= 40 && this.currentStep < 50 && intervalCount % 2 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-50');
		}
		else if (this.currentStep >= 50 && this.currentStep < 60 && intervalCount % 2 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-60');
		}
		else if (this.currentStep >= 60)
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-100');
		}
	}

	moveObstacleAncien(obstaclesSteps, intervalCount)
	{
		if (this.currentStep < 10 && intervalCount % 11 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-10');
		}
		else if (this.currentStep >= 10 && this.currentStep < 20 && intervalCount % 9 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-20');
		}
		else if (this.currentStep >= 20 && this.currentStep < 30 && intervalCount % 7 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-30');
		}
		else if (this.currentStep >= 30 && this.currentStep < 40 && intervalCount % 5 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-40');
		}
		else if (this.currentStep >= 40 && this.currentStep < 50 && intervalCount % 3 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-50');
		}
		else if (this.currentStep >= 50 && this.currentStep < 60 && intervalCount % 2 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-60');
		}
		else if (this.currentStep >= 60)
		{
			this.updateObstacleFrame(obstaclesSteps);
			console.log('-100');
		}
	}

	updateObstacleFrame(obstaclesSteps) // déplace l'obstacle
	{
		if (this.currentStep < this.totalSteps+1) // +1 pour qu'il atteigne bien le bas, sinon il s'arrête 1 étape avant
		{
			this.renderWidth = obstaclesSteps[this.currentStep].size;
			this.renderHeight = obstaclesSteps[this.currentStep].size;
			
			if (this.lane == leftLane) 
			{
				this.x = obstaclesSteps[this.currentStep].leftLaneX;
				this.y = obstaclesSteps[this.currentStep].leftLaneY;
			}
			else if (this.lane == middleLane) 
			{
				this.x = obstaclesSteps[this.currentStep].middleLaneX;
				this.y = obstaclesSteps[this.currentStep].middleLaneY;
			}
			else if (this.lane == rightLane) 
			{
				this.x = obstaclesSteps[this.currentStep].rightLaneX;
				this.y = obstaclesSteps[this.currentStep].rightLaneY;
			}

			this.currentStep++;
		}
	}
}


const canvas = document.getElementById("gameCanvas"); // récupère le canvas sur lequel est affiché le jeu
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById("gameContainer");
const fireImg = document.getElementById('fire');

canvas.width  = gameContainer.offsetWidth;
canvas.height = gameContainer.offsetHeight;	

const laneNumber = 3;	// changer la condition dans getPlayerLocation en cas de modification du nombre de couloirs
const laneWidth = canvas.width/laneNumber; // établit le nombre de couloirs, leur largeur, la hauteur des lignes, et le nombre de lignes

const leftLane = 0;
const middleLane = 1;
const rightLane = 2;

let playerCurrentLane = middleLane;

let currentObstacleCount = 0;	// nombre actuel d'obstacles générés
let maxObstacleCount = 7;		// nombre maximum d'obstacles présentes en même temps
let obstacleAppearingChance = 10; // probabilité par défaut de générer un nouvel obstacle (1 sur N), voir fonction newObstacle()
let framesSinceLastObstacle = 1; // nombre de frames depuis que le dernier obstacle a été généré (pour éviter des obstacles trop rapprochés)

let score = 0;	// (pas encore utilisé)
let gameStatus = 1; // statut actuel du jeu, 1 pour en cours, 0 pour game over

let startingLineWidth = 10; // largeur de la ligne d'horizon sur laquelle apparaissent les obstacles
let startingLineX = canvas.width/2 - startingLineWidth/2; // startingLine -> 20 pixels de large ?
let startingLineY = canvas.height/10 * 6; // placée à X/10 en partant du haut, modifier la valeur change l'angle de vue

let totalSteps = 50; // nombre total d'étapes pour que l'obstacle parcoure la map
let obstaclesSteps = []; // tableau d'objets qui stockera toutes les étapes de tous les obstacles
let obstacles = []; // tableau d'objets qui contiendra tous les obstacles

// let bounceValue = 0.1; // ???



function getRandomInt(max) // génère un entier aléatoire entre 0 et max (non inclus)
{
  return Math.floor(Math.random() * Math.floor(max));
}

function handleKeyDown(event)
{
	if (event.keyCode == 37) // left
	{
		if (playerSprite.lane == middleLane) 
		{
			playerSprite.lane = leftLane;
			playerSprite.x = (laneWidth - playerSprite.renderWidth)/2;
		}
		else if (playerSprite.lane == rightLane) 
		{
			playerSprite.lane = middleLane;
			playerSprite.x = laneWidth + (laneWidth - playerSprite.renderWidth)/2;
		}
	}
	else if (event.keyCode == 39) // right
	{
		if (playerSprite.lane == middleLane) 
		{
			playerSprite.lane = rightLane;
			playerSprite.x = laneWidth*2 + (laneWidth - playerSprite.renderWidth)/2;
		}
		else if (playerSprite.lane == leftLane) 
		{
			playerSprite.lane = middleLane;
			playerSprite.x = laneWidth + (laneWidth - playerSprite.renderWidth)/2;
		}
	}
}

function drawStartingLine() // dessine la ligne du fond, d'où les obstacles apparaissent
{
	ctx.beginPath();
	ctx.moveTo(startingLineX, startingLineY);
	ctx.lineTo(startingLineX+startingLineWidth, startingLineY);
	ctx.stroke();
	ctx.closePath();
}

function drawLanesLines() // dessine des lignes pour tracer les couloirs
{
	for (var i = 0; i < laneNumber+1; i++) 
	{
		ctx.beginPath()
		ctx.moveTo(laneWidth*i, canvas.height);
		ctx.lineTo(startingLineX+(startingLineWidth/laneNumber)*i, startingLineY);
		ctx.stroke();
		ctx.closePath();
	}
}

function setObstaclesSteps() // alimente un tableau d'objets qui contient toutes les coordonnées et la taille qu'auront les obstacles
{
	let distanceX = startingLineX+startingLineWidth/laneNumber - laneWidth;
	let distanceY = canvas.height - startingLineY;

	for (var i = 0; i < totalSteps+1; i++) 
	{
		let leftX = (startingLineX+startingLineWidth/laneNumber) - (distanceX/totalSteps)*i;
		let rightX = (startingLineX+startingLineWidth/laneNumber*2) + (distanceX/totalSteps)*i;
		let y = startingLineY + (distanceY/totalSteps)*i;

		let size = Math.abs(leftX - rightX);

		obstaclesSteps.push({
			leftLaneX: leftX - size,
			leftLaneY: y - size,
			middleLaneX: leftX,
			middleLaneY: y - size,
			rightLaneX: rightX,
			rightLaneY: y - size,
			size: size
		});

		ctx.rect(leftX, y, 1, 1);
		ctx.fillStyle = 'red';
		ctx.fill();
	}
}

function setObstaclesSteps2() // alimente un tableau d'objets qui contient toutes les coordonnées et la taille qu'auront les obstacles
{
	let distanceX = startingLineX+startingLineWidth/laneNumber - laneWidth;
	let distanceY = canvas.height - startingLineY;

	for (var i = 0; i < totalSteps+1; i++) 
	{
		let leftX;
		let rightX;
		let y;

		if (i < totalSteps/2) 
		{
			leftX = (startingLineX+startingLineWidth/laneNumber) - (distanceX/(totalSteps*2))*i;
			rightX = (startingLineX+startingLineWidth/laneNumber*2) + (distanceX/(totalSteps*2))*i;
			y = startingLineY + (distanceY/(totalSteps*2))*i;
		}
		else
		{
			leftX = (startingLineX+startingLineWidth/laneNumber) - (distanceX/(totalSteps/2))*i;
			rightX = (startingLineX+startingLineWidth/laneNumber*2) + (distanceX/(totalSteps/2))*i;
			y = startingLineY + (distanceY/(totalSteps/2))*i;
		}


		let size = Math.abs(leftX - rightX);

		obstaclesSteps.push({
			leftLaneX: leftX - size,
			leftLaneY: y - size,
			middleLaneX: leftX,
			middleLaneY: y - size,
			rightLaneX: rightX,
			rightLaneY: y - size,
			size: size
		});

		ctx.rect(leftX, y, 1, 1);
		ctx.fillStyle = 'red';
		ctx.fill();
	}
}

function newObstacle()
{
	let newObstacleLane = getRandomInt(laneNumber);
	let newObstacleX;
	let newObstacleY;

	if (newObstacleLane == leftLane) 
	{
		newObstacleX = obstaclesSteps[0].leftLaneX;
		newObstacleY = obstaclesSteps[0].leftLaneY;
	}
	else if (newObstacleLane == middleLane) 
	{
		newObstacleX = obstaclesSteps[0].middleLaneX;
		newObstacleY = obstaclesSteps[0].middleLaneY;
	}
	else if (newObstacleLane == rightLane) 
	{
		newObstacleX = obstaclesSteps[0].rightLaneX;
		newObstacleY = obstaclesSteps[0].rightLaneY;
	}

	let newObstacle = new Sprite(fireImg, // image
							  obstaclesSteps[0].size, // renderWidth
							  obstaclesSteps[0].size, // renderHeight
							  420, // width
							  419, // height
							  4, // numberOfFrames
							  newObstacleX, // x
							  newObstacleY, // y
							  newObstacleLane, // lane
							  totalSteps); // totalSteps

	obstacles.push(newObstacle);
}

function handleNewObstacles()
{
	console.log('current count ' + currentObstacleCount);
	console.log('maxObstacleCount ' + maxObstacleCount);
	if (currentObstacleCount < maxObstacleCount) 
	{
		if ((getRandomInt(obstacleAppearingChance) == 1 || currentObstacleCount <= 1) && framesSinceLastObstacle > 50) 
		{
			newObstacle();
			framesSinceLastObstacle = 0;
		}
	}
}

function updateObstacles(obstacles, obstaclesSteps, intervalCount)
{
	for (var i = 0; i < obstacles.length; i++) 
	{
		if (obstacles[i].currentStep == totalSteps+1) 
		{
			if (obstacles[i].lane == playerSprite.lane) 
			{
				clearInterval(intervalId);
			}

			obstacles.splice(i, 1);
			i--;
		}
		else
		{
			obstacles[i].render(ctx);
			obstacles[i].moveObstacle(obstaclesSteps, intervalCount);
			
			if (intervalCount%10 == 0) 
			{
				obstacles[i].updateSprite();
			}

			currentObstacleCount++;
		}
	}
}

function drawScore() 
{
	score = intervalCount;
    ctx.font = "60px Courier";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 15, 90);
}


window.addEventListener('keydown', handleKeyDown);
setObstaclesSteps();

let playerSprite = new Sprite(document.getElementById('bisou_misa_jaune'), // image
							  180, // renderWidth, changer aussi le calcul dans x si on le change
							  110, // renderHeight
							  299, // width
							  188, // height
							  4, // numberOfFrames
							  laneWidth + (laneWidth - 180)/2, // x (200 = renderWidth)
							  canvas.height-110, // y
							  middleLane, // lane
							  0); // totalSteps


let obstacleTest = new Sprite(fireImg, // image
							  obstaclesSteps[0].size, // renderWidth
							  obstaclesSteps[0].size, // renderHeight
							  420, // width
							  419, // height
							  4, // numberOfFrames
							  obstaclesSteps[0].leftLaneX, // x
							  obstaclesSteps[0].leftLaneY, // y
							  leftLane, // lane
							  totalSteps); // totalSteps


let intervalCount = 0;
let intervalId = setInterval(function() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	currentObstacleCount = 0; // remet le compteur d'obstacles à 0 (ceux-ci sont comptés lorsqu'ils sont déplacés et dessinés)
	framesSinceLastObstacle++;	// incrémente le compteur de frames depuis le dernier obstacle
	intervalCount++;

	drawStartingLine();
	drawLanesLines();
	drawScore();
	
	updateObstacles(obstacles, obstaclesSteps, intervalCount);
	handleNewObstacles();

	//obstacleTest.render(ctx);
	//obstacleTest.moveObstacle(obstaclesSteps, intervalCount);
	//obstacleTest.updateSprite();
	
//	console.log('frame : ' + performance.now());

	playerSprite.render(ctx);

	if (intervalCount%10==0) 
	{
		playerSprite.updateSprite();
	}

}, 10);

/*drawStartingLine();
drawLanesLines();
playerSprite.render(ctx);

obstacleTest.render(ctx);*/