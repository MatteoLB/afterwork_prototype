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
		ctx.stroke();
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

	updateObstacleFrame(obstaclesSteps) // déplace l'obstacle
	{
		if (this.currentStep < this.totalSteps+1) // +1 pour qu'il atteigne bien le bas, sinon il s'arrête 1 étape avant
		{
			this.renderWidth = obstaclesSteps[this.currentStep].size;
			this.renderHeight = obstaclesSteps[this.currentStep].size;
			
			if (this.lane == -1) 
			{
				this.x = obstaclesSteps[this.currentStep].leftLaneX;
				this.y = obstaclesSteps[this.currentStep].leftLaneY;
			}
			else if (this.lane == 0) 
			{
				this.x = obstaclesSteps[this.currentStep].middleLaneX;
				this.y = obstaclesSteps[this.currentStep].middleLaneY;
			}
			else if (this.lane == 1) 
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

const leftLane = -1;
const middleLane = 0;
const rightLane = 1;

let playerCurrentLane = middleLane;

let currentObstacleCount = 0;	// nombre actuel d'obstacles générés
let maxObstacleCount = 8;		// nombre maximum d'obstacles présentes en même temps
let obstacleAppearingChance = 12 // probabilité par défaut de générer un nouvel obstacle (1 sur N), voir fonction newObstacle()
let framesSinceLastObstacle = 1; // nombre de frames depuis que le dernier obstacle a été généré (pour éviter des obstacles trop rapprochés)

let score = 0;	// (pas encore utilisé)
let gameStatus = 1; // statut actuel du jeu, 1 pour en cours, 0 pour game over

let startingLineWidth = 10; // largeur de la ligne d'horizon sur laquelle apparaissent les obstacles
let startingLineX = canvas.width/2 - startingLineWidth/2; // startingLine -> 20 pixels de large ?
let startingLineY = canvas.height/10 * 6; // placée à X/10 en partant du haut, modifier la valeur change l'angle de vue

let totalSteps = 100; // nombre total d'étapes pour que l'obstacle parcoure la map
let obstaclesSteps = []; // tableau d'objets qui stockera toutes les étapes de tous les obstacles
let obstacles = []; // tableau d'objets qui contiendra tous les obstacles

// let bounceValue = 0.1; // ???



function getRandomInt(max) // génère un entier aléatoire entre 0 et max (non inclus)
{
  return Math.floor(Math.random() * Math.floor(max));
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

/*drawStartingLine();
drawLanesLines();*/
setObstaclesSteps();

let playerSprite = new Sprite(document.getElementById('bisou_misa_jaune'), // image
							  200, // renderWidth, changer aussi le calcul dans x si on le change
							  122, // renderHeight
							  299, // width
							  188, // height
							  4, // numberOfFrames
							  laneWidth + (laneWidth - 200)/2, // x (200 = renderWidth)
							  canvas.height-122, // y
							  0, // lane
							  0); // totalSteps


let obstacleTest = new Sprite(fireImg, // image
							  obstaclesSteps[0].size, // renderWidth
							  obstaclesSteps[0].size, // renderHeight
							  420, // width
							  419, // height
							  4, // numberOfFrames
							  obstaclesSteps[0].leftLaneX, // x
							  obstaclesSteps[0].leftLaneY, // y
							  -1, // lane
							  totalSteps); // totalSteps

let intervalCount = 0;
let spriteFrequency = 40;

setInterval(function() {
	intervalCount++;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawStartingLine();
	drawLanesLines();


	obstacleTest.render(ctx);
	obstacleTest.updateSprite();
	obstacleTest.updateObstacleFrame(obstaclesSteps);


	playerSprite.render(ctx);
	playerSprite.updateSprite();
}, 80);

/*drawStartingLine();
drawLanesLines();
playerSprite.render(ctx);

obstacleTest.render(ctx);*/