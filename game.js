const canvas = document.getElementById("gameCanvas"); // récupère le canvas sur lequel est affiché le jeu
const ctx = canvas.getContext('2d');

const video = document.getElementById('video'); // récupère la balise vidéo

const laneNumber = 3;	// changer la condition dans getPlayerLocation en cas de modification du nombre de couloirs
const laneWidth = canvas.width/laneNumber; // établit le nombre de couloirs, leur largeur, la hauteur des lignes, et le nombre de lignes
const caseSize = 15;
const rowNumber = canvas.height/caseSize // nombre de lignes correspond à la taille de la zone de jeu divisée par la hauteur de chaque ligne

const empty = 0;	// valeurs contenues dans le tableau représentant la map du jeu
const obstacle = 1;
const player = 2;

let playerX;	// positions horizontales et verticales du joueur au début de la partie (couloir du milieu et un peu au dessus du bas)
let playerY = canvas.height - 90;

let playerWidth = laneWidth/3;

let currentObstacleCount = 0;	// nombre actuel d'obstacles générés
let maxObstacleCount = 8;		// nombre maximum d'obstacles présentes en même temps
let obstacleProba = 12 // probabilité par défaut de générer un nouvel obstacle (1 sur N), voir fonction newObstacle()
let framesSinceLastObstacle = 1; // nombre de frames depuis que le dernier obstacle a été généré (pour éviter des obstacles successifs impossibles à passer)

let score = 0;	// (pas encore utilisé)

let map = []; // tableau en 2d représentant la zone de jeu divisée en cases, 3 colonnes et le nombre de lignes correspondant à rowNumber
let gameStatus = 1; // statut actuel du jeu, 1 pour en cours, 0 pour game over

for (var i = 0; i < laneNumber; i++) // initialise le tableau de la map en mettant toutes les cases comme vides pour commencer
{
	map[i] = [];

	for (var j = 0; j < rowNumber; j++) 
	{
		map[i][j] = empty;
	}
}

// map[1][playerY/caseSize] = player; // place le joueur dans l'array de la map ***************************************************



function getRandomInt(max) // génère un entier aléatoire entre 0 et max (non inclus)
{
  return Math.floor(Math.random() * Math.floor(max));
}


function getPlayerLocation(handData) // récupère le couloir actuel du joueur selon la position des mains
{
	let handX = handData[0] + handData[2]/2; // les coordonnées récupérées correspondent au haut/gauche du carré bleu affiché autour de la main
	let handY = handData[1] + handData[3]/2; // récupère la position au centre de ce carré en ajoutant la moitié de la hauteur ou largeur du carré

	map[playerX/laneWidth][playerY/caseSize] = empty; // l'ancienne case du joueur devient vide

	if (handX < video.width/laneNumber) 
	{
		playerX = 0;
	}
	else if (handX < video.width/laneNumber*2) // modifie les coordonnées horizontales du joueur selon la position de la main
	{
		playerX = laneWidth;
	}
	else
	{
		playerX = laneWidth*2;
	}

	map[playerX/laneWidth][playerY/caseSize] = player; // replace le joueur dans l'array de la map

	drawPointer(handX, handY+100);
}


function getPlayerLocationV2(handData)
{
	// les coordonnées récupérées correspondent au haut/gauche du carré bleu affiché autour de la main
	// récupère la position au centre de ce carré en ajoutant la moitié de la hauteur ou largeur du carré
	playerX = handData[0] + handData[2]/2 - playerWidth/2; 

	// let pointerY = handData[1] + handData[3]/2; // position y n'est utilisé que pour le pointeur, à supprimer si on ne dessine plus le pointeur
	// drawPointer(playerX, pointerY+100);
}


function drawObstacle(x, y)						// dessine chaque obstacle selon ses coordonnées x et y
{
	ctx.beginPath();
	ctx.rect(x, y, laneWidth, caseSize);
	ctx.fillStyle = "black";
	ctx.fill();
	ctx.closePath();
}


function drawPointer(x, y) // dessine un pointeur indiquant la position de la main
{
	ctx.beginPath();
	ctx.rect(x, y, caseSize, caseSize);
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.fill();
	ctx.closePath();
}


/* A 1 chance sur N de générer un nouvel obstacle (sauf si il n'y a pas encore d'obstacle sur la map), à condition qu'un obstacle n'ait pas déjà
   été ajouté lors de la frame précédente (pour éviter d'avoir des obstacles successifs impossibles à passer */
function newObstacle(obstacleProba)
{									
	if ((getRandomInt(obstacleProba) == 1 || currentObstacleCount <= 1) && framesSinceLastObstacle > 3) 
	{
		let random = getRandomInt(laneNumber); // tire le couloir au sort, ajoute l'obstacle à l'array map et le dessine sur le canvas
		map[random][0] = obstacle;

		drawObstacle(random*laneWidth, 0);
		framesSinceLastObstacle = 0;
	}
}


function moveObstacles() // descend tous les obstacles d'un cran et les redessine à leur nouvelle position
{
	for (var i = 0; i < map.length; i++) // parcourt chaque couloir
	{
		for (var j = map[i].length - 1; j > 0; j--) // puis chaque case de chaque couloir, en partant de la fin
		{
			if (map[i][j-1] == obstacle) // si le prochain élément est un obstacle, on le déplace dans l'élément courant
			{
				if (map[i][j] == player) // si l'élément courant correspond au joueur, déplacer l'obstacle = collision, donc game over
				{
					gameStatus = 0;
				}
				else	// sinon on déplace l'obstacle
				{
					map[i][j] = obstacle;
					map[i][j-1] = empty;

					drawObstacle(i*laneWidth, j*caseSize);
					currentObstacleCount++; 	// compte le nombre d'obstacles actuellement présents sur la map
				} 

			} // fin if obstacle
		} // fin for (rows)
	} // fin for (lanes)
} // fin fonction


function moveObstaclesV2() // descend tous les obstacles d'un cran et les redessine à leur nouvelle position
{
	let collision = false;

	for (var i = 0; i < map.length; i++) // parcourt chaque couloir
	{
		for (var j = map[i].length - 1; j > 0; j--) // puis chaque case de chaque couloir, en partant de la fin
		{
			if (map[i][j-1] == obstacle) // si le prochain élément est un obstacle, on le déplace dans l'élément courant
			{
				collision = detectCollision(i*laneWidth, j*caseSize); // détecte si il y a collision entre l'élément courant et le joueur

				if (!collision) // si il n'y a pas de collision
				{
					map[i][j] = obstacle;
					map[i][j-1] = empty;

					drawObstacle(i*laneWidth, j*caseSize);
					currentObstacleCount++; 	// compte le nombre d'obstacles actuellement présents sur la map
				}

			} // fin if obstacle
		} // fin for (rows)
	} // fin for (lanes)
} // fin fonction


function detectCollision(x, y) // détecte une collision entre le joueur et un obstacle, prend x et y de l'obstacle vérifié en paramètres
{
	// si la position verticale est la même, et que la position x du côté gauche ou droite du joueur se trouve entre la position x gauche
	// ou droite de l'obstacle
	if (y == playerY && ((playerX >= x && playerX <= x + laneWidth) || (playerX + playerWidth >= x && playerX + playerWidth <= x + laneWidth)) ) 
	{
		gameStatus = 0; // game over
		return true; // collision vaudra vrai
	}
	return false; // sinon collision vaudra faux
}


function drawPlayer() // dessine un rectangle en guise de joueur
{
	ctx.beginPath();
	//ctx.rect(playerX+laneWidth/4, playerY, playerWidth, caseSize);
	ctx.rect(playerX, playerY, playerWidth, caseSize);
	ctx.fillStyle = "red";
	ctx.fill();
	ctx.closePath();
}


function gameOver()	// affiche game over
{
	ctx.beginPath();
	ctx.font = "32px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Game Over", 100, 200);
	ctx.closePath();
}


function mainGame(handData) // fonction principale, reçoit les coordonnées de la main en paramètre
{
	ctx.clearRect(0, 0, canvas.width, canvas.height); // efface tout le canvas

	currentObstacleCount = 0; // remet le compteur d'obstacles à 0 (ceux-ci sont comptés lorsqu'ils sont déplacés et dessinés)
	framesSinceLastObstacle++;	// incrémente le compteur de frames depuis le dernier obstacle

	getPlayerLocationV2(handData); // récupère la position du joueur
	moveObstaclesV2(); 			 // déplace les obstacles et les redessine

	if (currentObstacleCount < maxObstacleCount) // si le nombre actuel d'obstacles est inférieur au max
	{
		newObstacle(obstacleProba); // a une chance sur N de générer un nouvel obstacle
	}

	drawPlayer(); // dessine le joueur

	return gameStatus; // renvoie 0 si game over, 1, si la partie est toujours en cours
}