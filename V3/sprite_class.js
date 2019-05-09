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

	render(ctx, shadow) // affiche l'image
	{
		ctx.rect(this.x, this.y, this.renderWidth, this.renderHeight);
		//ctx.stroke();

		if (shadow == true) 
		{
			// ctx.shadowOffsetY = 50;
			// ctx.shadowBlur = 20;
			// ctx.shadowColor = 'rgba(0,0,0,0.6)';
		}

		ctx.drawImage(this.img, this.width*this.frameIndex, 0, this.width, this.height, this.x, this.y, this.renderWidth, this.renderHeight);

		ctx.shadowColor = 'transparent';
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
			//console.log('-10');
		}
		else if (this.currentStep >= 10 && this.currentStep < 20 && intervalCount % 7 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			//console.log('-20');
		}
		else if (this.currentStep >= 20 && this.currentStep < 30 && intervalCount % 4 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			//console.log('-30');
		}
		else if (this.currentStep >= 30 && this.currentStep < 40 && intervalCount % 3 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			//console.log('-40');
		}
		else if (this.currentStep >= 40 && this.currentStep < 50 && intervalCount % 2 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			//console.log('-50');
		}
		else if (this.currentStep >= 50 && this.currentStep < 60 && intervalCount % 2 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
			//console.log('-60');
		}
		else if (this.currentStep >= 60)
		{
			this.updateObstacleFrame(obstaclesSteps);
			//console.log('-100');
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
} // fin class Sprite


class Bonus extends Sprite
{
	constructor(img, renderWidth, renderHeight, width, height, numberOfFrames, x, y, lane, totalSteps, bonusPoints, bonusLife, appearingChance)
	{
		super(img, renderWidth, renderHeight, width, height, numberOfFrames, x, y, lane, totalSteps);
		this.bonusPoints = bonusPoints;
		this.bonusLife = bonusLife;
		this.appearingChance = appearingChance;
		this.renderBonusFrame = 0;

		if (bonusPoints > 0) 
		{
			this.bonusText = '+'+bonusPoints+' points';
		}
		else if (bonusLife > 0) 
		{
			this.bonusText = '+'+bonusLife+' vie';
		}
	}

	gainBonus(ctx)
	{
		if (this.bonusPoints > 0) 
		{
			console.log('score = ' + score);
			score += this.bonusPoints;
			console.log('score af = ' + score + ' bonus points = ' + this.bonusPoints);
			this.renderBonus(ctx, 1);
		}
		else if (this.bonusLife)
		{
			lives += bonusLife;

			this.renderBonus(ctx);
		}
	}

	renderBonus(ctx)
	{	
		ctx.font = "25px Courier";
		ctx.fillStyle = "rgba(255,255,255,"+(1 - 0.01*this.renderBonusFrame)+')';
		ctx.fillText(this.bonusText, this.x, this.y - 30 - (1*this.renderBonusFrame));
		this.renderBonusFrame++;
	}

	addBonus(obstaclesSteps)
	{
		let newBonusLane = getRandomInt(laneNumber);
		let newBonusX;
		let newBonusY;

		if (newBonusLane == leftLane) 
		{
			newBonusX = obstaclesSteps[0].leftLaneX;
			newBonusY = obstaclesSteps[0].leftLaneY;
		}
		else if (newBonusLane == middleLane) 
		{
			newBonusX = obstaclesSteps[0].middleLaneX;
			newBonusY = obstaclesSteps[0].middleLaneY;
		}
		else if (newBonusLane == rightLane) 
		{
			newBonusX = obstaclesSteps[0].rightLaneX;
			newBonusY = obstaclesSteps[0].rightLaneY;
		}

		this.x = newBonusX;
		this.y = newBonusY;
		this.lane = newBonusLane;
		this.renderWidth = obstaclesSteps[0].size;
		this.renderHeight = obstaclesSteps[0].size;
		this.currentStep = 0;
	}
}