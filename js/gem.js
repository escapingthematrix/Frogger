// Contains the constructor and all the
// methods for the Gem class.

// Gem class constructor.
var Gem =  function(sprite, type, value) {
    // Sets a width and height for the gem such
    // that it will fit nicely within a block.
    this.width = 51;
    this.height = 86;

    // Places the gem in a cell outside the canvas.
    this.row = 0;
    this.col = -1;

    // Sets the sprite, value, and type of gem.
    this.sprite = sprite;
    this.value = value;
    this.type = type;

    // Make sure the shown flag is not set.
    this.shown = false;

    // Starts the gem timer which controls
    // how ofter gems appear and how long
    // it stays visible.
    this.resetTimer();
};

// Gets the x and y position.
Gem.prototype.getPosition = function() {
    return {
        x: this.col * game.settings.cellDims.width + (game.settings.cellDims.width - this.width) / 2,
        y: this.row * game.settings.cellDims.height + game.settings.gemOffset
    };
};
// Decreases the timer every tick of the game engine and
// toggles the visibility of the gem when timer reaches 0.
Gem.prototype.update = function() {
    if (!game.pause) {
        if (this.timer > 0) {
            this.timer--;
        } else {
            this.shown ? this.hideGem() : this.showGem();
        }
    }
};

// Renders the gem every tick of the game engine.
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.getPosition().x, this.getPosition().y, this.width, this.height);
};

// Resets the gem timer.
Gem.prototype.resetTimer = function() {
    if (this.shown) {
        // Waits one third of the gems value in seconds
        // until the gem is shown again.  The effect is
        // that more valuable gems show up less often.
        this.timer = (this.value / 3) * game.settings.fps;
    } else {
        // Stays visible for 5 seconds.
        this.timer = 5 * game.settings.fps;
    }

    this.shown = !this.shown;
};

// Resets gem timer and moves the gem to a random cell
// within the canvas so it is shown.
Gem.prototype.showGem = function() {
    this.resetTimer();
    this.col = game.getRandomVal(4);
    this.row = game.getRandomVal(3) + 1;
};

// Resets gem timer and moves the gem out of
// the canvas so it is hidden.
Gem.prototype.hideGem = function() {
    this.resetTimer();
    this.col = -1;
};

// Processes a capture gem by displaying a message
// to the user, moving the gem out of sight, adding
// points to the score, and putting the gem in the
// bag if appropriate.
Gem.prototype.captured = function() {
    game.showMessage('+' + this.value + ' pts!', 1);
    this.col = -1;
    game.pointsToAdd += this.value;

    // Checks that the type of gem is not already
    // in the bag before adding it.
    if (player.bag.gems.indexOf(this.type) === -1) {
        if (this.type === 'heart') {
            player.lives++;
            game.updateLife();
        } else {
            player.bag.gems.push(this.type);

            // Checks if all gems have been captured and
            // exchanges them for a bomb.
            if (player.bag.gems.length === 3) {
                player.bag.gems = [];
                player.bag.bombs++;
                game.showMessage('3 gems traded for 1 bomb!', 1);
            }
        }
    }

    // Updates bag contents in status bar.
    game.updateBag();
};