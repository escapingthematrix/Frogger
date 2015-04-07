// Contains the constructor and all the
// methods for the Enemy class.


// Enemy class constructor.  Upon game start, all the enemies
// (total of 16) are created and placed in an array.  The spread
// parameter is used to ensure that the enemies are evenly
// distributed in all four lanes and with a wide x range.
var Enemy = function(spread) {
    // Assigns each enemy to a lane.
    this.row = spread % game.settings.numLanes + 1;

    // Assigns random values for x position and speed.
    this.reset(0.65 * spread);
};

// Updates the enemies with every tick of the game engine.
// - updates enemy position.
// - kills visible enemies in the event of explosion.
// - resets x and speed of enemies that reach end of screen.
Enemy.prototype.update = function(dt) {
    if (!game.pause) {
        this.x += dt * game.settings.fps * this.speed;

        // Kill visible enemies if there is an explosion.
        if (this.x > -game.settings.cellDims.width && game.explosion) {
            game.killed++;
            this.x = game.settings.gameDims.width + 1;
        }

        // Assigns a new x position and speed to the enemy
        // when it goes out of sight (or are killed).
        if (this.x > game.settings.gameDims.width) {
            // Makes the spread depend on the level so
            // difficulty increases over time.  However,
            // sets a limit of 2 so the game does not
            // become impossible to play.
            var spread = (8 - game.level / 2) < 2 ? 2 : (8 - game.level / 2);
            this.reset(spread);
        }
    }
};

// Render the enemy with every tick of the game engine.
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get('images/enemy-bug.png'), this.x, this.getY());
};

// Sets a random x position and speed to the left of the canvas.
Enemy.prototype.reset = function(spread) {
    this.x = -(game.getRandomVal(game.settings.enemyXRange / (16 - spread)) * spread + game.settings.cellDims.width);
    this.speed = (1 + game.getRandomVal(20) / 100) * (1 + game.level / 10);
};

Enemy.prototype.getY = function() {
    return this.row * game.settings.cellDims.height +  game.settings.enemyOffset;
};
