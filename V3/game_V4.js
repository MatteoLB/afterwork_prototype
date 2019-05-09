const canvas = document.getElementById("gameCanvas"); // récupère le canvas sur lequel est affiché le jeu
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById("gameContainer");

const fireImg = document.getElementById('fire');
const horrorCatImg = document.getElementById('horrorcat');
const candyImg = document.getElementById('candy');
const pillImg = document.getElementById('pill');
const syringeImg = document.getElementById('syringe');
const waterImg = document.getElementById('water');

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
let minFramesBetweenObstacles = 50;

let bonusAppearingChance = 200;

let score = 0;	// (pas encore utilisé)
let gameStatus = 1; // statut actuel du jeu, 1 pour en cours, 0 pour game over

let startingLineWidth = 10; // largeur de la ligne d'horizon sur laquelle apparaissent les obstacles
let startingLineX = canvas.width/2 - startingLineWidth/2; // startingLine -> 20 pixels de large ?
let startingLineY = canvas.height/10 * 6; // placée à X/10 en partant du haut, modifier la valeur change l'angle de vue

let totalSteps = 50; // nombre total d'étapes pour que l'obstacle parcoure la map
let obstaclesSteps = []; // tableau d'objets qui stockera toutes les étapes de tous les obstacles
let obstacles = []; // tableau d'objets qui contiendra tous les obstacles
let elements = [];

let allBonus = [];
let activeBonus = [];
let collectedBonus = [];



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
	let newObstacle;

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

	if (getRandomInt(2) == 1) 
	{
		newObstacle = new Sprite(fireImg, // image
						  obstaclesSteps[0].size, // renderWidth
						  obstaclesSteps[0].size, // renderHeight
						  308, // width
						  308, // height
						  4, // numberOfFrames
						  newObstacleX, // x
						  newObstacleY, // y
						  newObstacleLane, // lane
						  totalSteps); // totalSteps
	}
	else
	{
		newObstacle = new Sprite(horrorCatImg, // image
						  obstaclesSteps[0].size, // renderWidth
						  obstaclesSteps[0].size, // renderHeight
						  100, // width
						  100, // height
						  8, // numberOfFrames
						  newObstacleX, // x
						  newObstacleY, // y
						  newObstacleLane, // lane
						  totalSteps); // totalSteps
	}

	obstacles.push(newObstacle);
	elements.unshift(newObstacle);
	return newObstacleLane;
}

function handleNewObstacles()
{
	//console.log('current count ' + currentObstacleCount);
	//console.log('maxObstacleCount ' + maxObstacleCount);
	if (currentObstacleCount < maxObstacleCount) 
	{
		if ((getRandomInt(obstacleAppearingChance) == 1 || currentObstacleCount <= 1) && framesSinceLastObstacle > minFramesBetweenObstacles) 
		{
			newObstacle();
			framesSinceLastObstacle = 0;
			return true;
		}
	}
	return false;
}

function createAllBonus()
{
	let candy = new Bonus(candyImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												380, // width
												380, // height
												1, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												50, // bonus points
												0, // bonus life
												100); // appearing chance

	let pill = new Bonus(pillImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												250, // width
												250, // height
												1, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												30, // bonus points
												0, // bonus life
												50); // appearing chance

		let syringe = new Bonus(syringeImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												114, // width
												114, // height
												1, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												30, // bonus points
												0, // bonus life
												50); // appearing chance

		let water = new Bonus(waterImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												400, // width
												400, // height
												6, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												30, // bonus points
												0, // bonus life
												50); // appearing chance

	allBonus = [candy, pill, syringe, water];
}

function handleNewBonus(allBonus)
{
	for (let i = 0; i < allBonus.length; i++) 
	{
		let currentElement = allBonus[i];
		
		if (currentElement.x == 0 && getRandomInt(currentElement.appearingChance) == 1) 
		{
			currentElement.addBonus(obstaclesSteps);
			activeBonus.push(currentElement);
			elements.unshift(currentElement);
			return;
		}
	}
}

function handleAllNewElements()
{
	let newObstacle = handleNewObstacles();

	if (newObstacle === false && framesSinceLastObstacle > 10 && (minFramesBetweenObstacles - framesSinceLastObstacle) > 5) 
	{
		handleNewBonus(allBonus);
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
			//console.log('size ' + obstacles[i].renderWidth);
			obstacles.splice(i, 1);
			i--;
		}
		else
		{
			obstacles[i].render(ctx, false);
			obstacles[i].moveObstacle(obstaclesSteps, intervalCount);
			
			if (intervalCount % 10 == 0) 
			{
				obstacles[i].updateSprite();
			}

			currentObstacleCount++;
		}
	}
}

function updateActiveBonus(activeBonus, obstaclesSteps)
{
	for (let i = 0; i < activeBonus.length; i++) 
	{	
		if (activeBonus[i].currentStep == totalSteps+1) 
		{
			if (activeBonus[i].lane == playerSprite.lane) 
			{
				activeBonus[i].gainBonus(ctx); // remplacer 0 par life
				collectedBonus.push(activeBonus[i]);
			}
			else
			{
				activeBonus[i].x = 0;
			}
			activeBonus.splice(i, 1);
			i--;
		}
		else
		{
			activeBonus[i].render(ctx, true);
			activeBonus[i].moveObstacle(obstaclesSteps, intervalCount)

			if (intervalCount % 10 == 0) 
			{
				activeBonus[i].updateSprite();
			}
		}
	}
}

function updateElements(elements, obstaclesSteps, intervalCount)
{
	for (var i = 0; i < elements.length; i++) 
	{
		if (elements[i].currentStep == totalSteps+1) 
		{
			if (elements[i].appearingChance > 0) 
			{
				console.log('bonus det');
				if (elements[i].lane == playerSprite.lane) 
				{
					elements[i].gainBonus(ctx); // remplacer 0 par life
					collectedBonus.push(elements[i]);
				}
				else
				{
					elements[i].x = 0;
				}				
			}
			else
			{
				console.log('abc');
				if (elements[i].lane == playerSprite.lane) 
				{
					clearInterval(intervalId);
				}
			}
			//console.log('size ' + elements[i].renderWidth);
			elements.splice(i, 1);
			i--;
		}
		else
		{
			elements[i].render(ctx, false);
			elements[i].moveObstacle(obstaclesSteps, intervalCount);
			
			if (intervalCount % 10 == 0) 
			{
				elements[i].updateSprite();
			}

			if (!elements[i].appearingChance) 
			{
				currentObstacleCount++;
			}
		}
	}
}

function drawScore() 
{
    ctx.font = "60px Courier";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 15, 90);
}


window.addEventListener('keydown', handleKeyDown);
setObstaclesSteps();
createAllBonus();


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


// let obstacleTest = new Sprite(fireImg, // image
// 							  obstaclesSteps[0].size, // renderWidth
// 							  obstaclesSteps[0].size, // renderHeight
// 							  308, // width
// 							  308, // height
// 							  4, // numberOfFrames
// 							  obstaclesSteps[0].leftLaneX, // x
// 							  obstaclesSteps[0].leftLaneY, // y
// 							  leftLane, // lane
// 							  totalSteps); // totalSteps


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
	updateActiveBonus(activeBonus, obstaclesSteps);
	updateElements(elements, obstaclesSteps, intervalCount);
	handleAllNewElements();
	
	playerSprite.render(ctx, false);

	if (intervalCount % 10==0) 
	{
		playerSprite.updateSprite();
		score++;
		//console.log('score = ' + score);
	}
	
	if (collectedBonus.length > 0) 
	{
		for (let i = 0; i < collectedBonus.length; i++) 
		{
			collectedBonus[i].renderBonus(ctx);	

			if (collectedBonus[i].renderBonusFrame === 50) 
			{
				collectedBonus[i].renderBonusFrame = 0;
				collectedBonus[i].x = 0;
				collectedBonus.splice(i, 1);
				i--;
			}
		}
	}
	//document.body.style.backgroundPositionY = '-'+ intervalCount + 'px';
	//	console.log('frame : ' + performance.now());
}, 10);

/*drawStartingLine();
drawLanesLines();
playerSprite.render(ctx);

obstacleTest.render(ctx);*/