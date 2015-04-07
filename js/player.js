// Contains the constructor and all
// methods for the Player class.

// Player class constructor.
var Player = function() {
    // Sets the default sprite to the boy.
    this.sprite = 'images/char-boy.png';

    // Places the player in the first col, last row.
    this.col = 0;
    this.row = game.settings.gameDims.rows - 1;

    this.lives = 3;

    // Creates a bag object to hold items collected.
    this.bag = {
        gems: [],
        bombs: 0
    };

    // This flag is used to momentarily stop responding
    // to user input when leveling-up or losing a live.
    this.available = true;

    // These properties are used to fade-out and fade-in
    // the player avatar after leveling-up or losing a live.
    this.fadeout = false;
    this.alpha = 1;
};

// Gets the x and y position.
Player.prototype.getPosition = function() {
    return {
        x: this.col * game.settings.cellDims.width,
        y: this.row * game.settings.cellDims.height + game.settings.playerOffset
    };
};

// Checks if the player reached the other side and
// calls the levelUp method.
Player.prototype.update = function() {
    if (this.available && this.row == 0) {
        game.levelUp();
    }
};

// Renders the player every tick of the game engine.  If the fadeout flag
// is set, progressively decreases the player alpha until it is not
// visible, repositions the player avatar, and progressively increases
// the alpha back to 1.
Player.prototype.render = function() {
    // Saves the ctx so it can be restored before exiting the method.
    ctx.save();

    if (this.fadeout && game.pointsToAdd === 0) {
        this.alpha = this.alpha > 0.05 ?  this.alpha - 0.05 : 0;
        ctx.globalAlpha = this.alpha;

        // Moves player once completely faded-out and starts fade-in.
        if (this.alpha === 0) {
            this.toStart();
            this.fadeout = !this.fadeout;
        }
    } else if (this.alpha < 1) {
        this.alpha = this.alpha < 0.95 ?  this.alpha + 0.05 : 1;
        ctx.globalAlpha = this.alpha;
    }

    ctx.drawImage(Resources.get(this.sprite), this.getPosition().x, this.getPosition().y);

    // Restores the ctx so rendering of other objects is not affected.
    ctx.restore();
};

// Detonates a bomb.
Player.prototype.throwBomb = function() {
    if (this.bag.bombs > 0) {
        // Take one bomb out of the bag.
        this.bag.bombs--;
        game.updateBag();

        // Play sound effect.
        assetLoader.sounds.explosion.play();

        // Shake the canvas.
        game.startShake();
    }
};

// Handles keyboard and touch inputs to move
// the player and throw bombs.
Player.prototype.handleInput = function(key) {
    if (!game.pause && this.available) {
        if (key === 'left') {
            this.col === 0 ? this.col = 0 : this.col--;
        } else if (key === 'up') {
            this.row === 0 ? this.row = 0 : this.row--;
        } else if (key ==='right') {
            this.col === game.settings.gameDims.cols - 1 ? this.col = game.settings.gameDims.cols - 1 : this.col++;
        } else if (key === 'down') {
            this.row == game.settings.gameDims.rows - 1 ? this.row = game.settings.gameDims.rows - 1 : this.row++;
        } else if (key === 'space') {
            this.throwBomb();
        }
    }
};

// Handles touch events from tables and phones.
Player.prototype.handleTouch = function(x, y) {
    var touchCol = Math.floor(x / game.settings.cellDims.width);
    var touchRow = Math.floor(y / game.settings.cellDims.height);

    if (this.col === touchCol) {
        if (this.row > touchRow) {
            this.handleInput('up')
        }
        if (this.row < touchRow) {
            this.handleInput('down')
        }
    } else if (this.row === touchRow) {
        if (this.col > touchCol) {
            this.handleInput('left')
        }
        if (this.col < touchCol) {
            this.handleInput('right')
        }
    }
};

// Decreases the number of lives, shows appropriate message
// and fades-out player to initial position.
Player.prototype.loseLife = function(reason) {
    var message;

    // Stops handling inputs and checking for collisions
    this.available = false;

    // Sets the message to be displayed.
    reason === 'collision' ? message = 'Gross!' : message = 'Time\'s Up!';

    if (this.lives > 1) {
        // Takes one live and updates status bar.
        this.lives--;
        game.updateLife();

        // Gives feedback to user.
        game.showMessage(message, 1);

        //Fades player to initial position.
        player.fadeout = true;
    } else {
        // Terminates the game.
        game.gameOver();
    }
};

// Moves the player to the initial position.
Player.prototype.toStart = function() {
    // Moves player to startup position.
    this.row = game.settings.gameDims.rows - 1;
    this.col = 0;

    // Makes player available so keyboard input
    // is handled again.
    this.available = true;

    // Resets the level timer.
    game.resetLevelTimer();
};