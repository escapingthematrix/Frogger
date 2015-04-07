// Contains the constructor and all the
// methods for the Game class.

// Game class constructor.
var Game = function() {
    // Holds a series of values that are used by
    // different classes so they can be adjusted
    // in a single place.
    this.settings = {
        fps: 60,
        gameDims: {
            width: 505,
            height: 606,
            cols: 5,
            rows: 6
        },
        cellDims: {
            height: 83,
            width: 101
        },
        numLanes: 4,
        enemyXRange: 3600,
        playerInitialPosition: {
            x: 0,
            y: 403
        },
        enemyOffset: -21,
        playerOffset: -12,
        gemOffset: 32,
        playerPadding: 20,
        pointsPerEnemy: 20,
        pointsPerSecond: 10,
        scoreIncrement: 5
    };

    this.level = 1;
    this.score = 0;

    // Holds points that should be added to the score
    this.pointsToAdd = 0;

    // Resets different timers
    this.resetLevelTimer();
    this.resetMessageTimer();
    this.resetExplosionTimer();

    // Holds all the gems.
    this.allGems = [];

    // Keeps track of the enemies killed.
    this.killed = 0;

    // Indicates an explosion is taking place.
    this.explosion = false;

    // Indicates a messages is being shown.
    this.messageShown = false;

    // Indicates sound is audible.
    this.sound = false;

    // Indicates the game has been pause.
    this.pause = true;

    //Indicates when the game is over.
    this.over = false;
};

// Checks for collisions, updates timers and scores
// every tick of the game engine.
Game.prototype.update = function() {
    // Updates the explosion timer and stops the shaking
    // effect when it reaches 0.
    this.explosionTimer > 0 ? this.explosionTimer-- : this.stopShake();

    // Checks for collisions.
    this.checkCollisions();

    // Updates message timer and hide message when it reaches 0.
    if (this.messageShown && !this.pause) {
        this.messageTimer > 0 ? this.messageTimer-- : this.hideMessage();
    }

    // Updates score if there are pointsToAdd.
    this.pointsToAdd > 0 ? this.addPoints() : this.pointsToAdd = 0;

    // Updates level timer and display time left.  Loses a life
    // if timer reaches 0.
    if (player.available && !this.pause) {
        this.levelTimer > 0 ? this.levelTimer-- : player.loseLife('timeout');
        this.updateTime(Math.floor(this.levelTimer / this.settings.fps));
    }
};

// Starts the game
Game.prototype.start = function() {
    // Ensures the game over flag is not set.
    game.over = false;
    
    // Instantiates the Player.
    player = new Player();

    // Instantiates several Enemy and store them in and array.
    for (var i = 0; i < 16; i++) {
        allEnemies.push(new Enemy(i));
    }

    // Instantiates one gem of each color and push it into the array.
    allGems.push(new Gem('images/heart.png', 'heart', 225));
    allGems.push(new Gem('images/gem-blue.png', 'blue', 75));
    allGems.push(new Gem('images/gem-green.png', 'green', 45));
    allGems.push(new Gem('images/gem-orange.png', 'orange', 18));


    // Starts the timer.
    this.resetLevelTimer();

    // Updates status bar.
    this.updateBag();
    this.updateLevel();
    this.updateLife();
    this.updateScore();
    this.updateTime(30);

    // Makes sound audible.
    this.toggleSound();
};

// Checks for collisions and handles them appropriately.
Game.prototype.checkCollisions = function() {
    if (player.available) {
        // Checks each enemy for collision with the player.
        for (var i = 0; i < allEnemies.length; i++) {
            if (player.row === allEnemies[i].row) {
                if (Math.abs(player.getPosition().x - allEnemies[i].x) < this.settings.cellDims.width - this.settings.playerPadding) {
                    // Plays collision sound effect.
                    assetLoader.sounds.collision.play();

                    // Stops the enemy from moving and disappears it.
                    allEnemies[i].speed = 0;
                    allEnemies[i].x = this.settings.gameDims.width + 1;

                    // Loses a live.
                    player.loseLife('collision');
                    return;
                }
            }
        }

        // Checks each gem for collision with player.
        for (var i = 0; i < allGems.length; i++) {
            if (player.row === allGems[i].row && player.col === allGems[i].col) {
                    allGems[i].captured();
            }
        }
    }
};

// Shakes the canvas by setting explosion to true.
Game.prototype.startShake = function() {
    this.explosion = true;
    this.resetExplosionTimer();
};

// Stops shake effect and adds points based on
// number of enemies killed.
Game.prototype.stopShake = function() {
    this.explosion = false;

    if (this.killed) {
        this.showMessage(this.killed + ' bugs killed!', 1);
        this.pointsToAdd = this.killed * this.settings.pointsPerEnemy;
        this.killed = 0;
    }
};

// Plays the background music.
Game.prototype.playMusic = function() {
    assetLoader.sounds.gameOver.pause();
    assetLoader.sounds.background.currentTime = 0;
    assetLoader.sounds.background.loop = true;
    assetLoader.sounds.background.play();
};

// Toggles the sound on/off and update the status bar.
Game.prototype.toggleSound = function() {
    this.sound = !this.sound;

    // Updates the icon in the status bar.
    this.sound ? $('#sound .title').html('<i class="fa fa-volume-up fa-lg">')
        : $('#sound .title').html('<i class="fa fa-volume-off fa-lg">');

    // Toggles the mute for all sound effects and music.
    for (var sound in assetLoader.sounds) {
        if (assetLoader.sounds.hasOwnProperty(sound)) {
            assetLoader.sounds[sound].muted = !this.sound;
        }
    }
};

// Toggles the pause / play state of the game.
Game.prototype.togglePause = function() {
    if (!this.over) {
        this.pause = !this.pause;

        this.pause ? assetLoader.sounds.background.pause() : assetLoader.sounds.background.play();

        // Updates the icon in the button.
        this.pause ? $('#pause-control').html('<i class="fa fa-play fa-lg"">')
            : $('#pause-control').html('<i class="fa fa-pause fa-lg"">');
    }
};

// Ups one level, displays appropriate message,
// updates the status bar.
Game.prototype.levelUp = function() {
    player.available = false;
    this.level++;
    this.pointsToAdd += this.settings.pointsPerSecond * (this.levelTimer / this.settings.fps) * (1 + this.level / 10);
    player.fadeout = !player.fadeout;
    this.showMessage('Well Done! Level ' + this.level, this.pointsToAdd / (this.settings.scoreIncrement * this.settings.fps));
    this.updateLevel();
};

// Adds point to the game score and updates status bar.
Game.prototype.addPoints = function() {
    // Plays sound effect.
    assetLoader.sounds.score.play();

    this.score += this.settings.scoreIncrement;
    this.pointsToAdd -= this.settings.scoreIncrement;
    this.updateScore();
};

// Stops the game.
Game.prototype.gameOver = function() {
    this.togglePause();
    this.over = true;

    // Stops background music and plays
    // game over sound effect.
    assetLoader.sounds.background.pause();
    assetLoader.sounds.gameOver.currentTime = 0;
    assetLoader.sounds.gameOver.play();

    // Check if the scores qualifies as a high score.
    highScore = new HighScore();
    highScore.qualify();
};

// Clears the allEnemies and allGems arrays
// prior to restarting the game.
Game.prototype.clear = function() {
    allEnemies = [];
    allGems = [];
};

// Updates the level displayed.
Game.prototype.updateLevel = function() {
    $('#level .title').text('Level ' + this.level);
};

// Updates the level timer displayed.
Game.prototype.updateTime = function(secs) {
    var time = '0:' + (secs.toString()[1] ? secs.toString() : '0' + secs.toString());
    $('#level .content-first').text(time);
};

// Updates the number of lives displayed.
Game.prototype.updateLife = function() {
    var firstLine = '';
    var secondLine = '';

    for (var i = 0; i < player.lives; i++) {
        i < 3 ? firstLine += '<i class="fa fa-heart outline"></i>' : secondLine += '<i class="fa fa-heart outline"></i>';
    }

    $('#live .content-first').html(firstLine);
    $('#live .content-second').html(secondLine || '|');
};

// Updates the bag displayed.
Game.prototype.updateBag = function() {
    var gems = '';
    for (var i = 0; i < player.bag.gems.length; i++) {
        gems += '<img src="images/gem-' +  player.bag.gems[i] + '-bag.png">';
    }

    $('#bombs').text(player.bag.bombs);
    $('#bag .content-second').html(gems || '|');

    player.bag.bombs > 0 ? $('#bomb-control').show() : $('#bomb-control').hide();
};

// Updates the score displayed.
Game.prototype.updateScore = function() {
    $('#score .content-first').text(this.score);
};

// Returns a randoms number between 0 and index.
Game.prototype.getRandomVal = function(index) {
    return Math.floor(Math.random() * index);
};

// Displays a message to the user.
Game.prototype.showMessage = function(message, secs) {
    $('#message').text(message);
    $('#feedback').show();
    this.resetMessageTimer(secs);
    this.messageShown = true;
    if (message === 'Game Over') {
        $('#restart').show();
        $('#exit').show();
    }
};

// Hides current message from the user.
Game.prototype.hideMessage = function() {
    $('#feedback').hide();
    this.messageShown = false;
};

// Sets the time a message is shown.
Game.prototype.resetMessageTimer = function(secs) {
    // Set the time a message is shown to 2 seconds.
    this.messageTimer = secs * this.settings.fps;
};

// Sets the level timer to 30 seconds.
Game.prototype.resetLevelTimer = function() {
    this.levelTimer = 30 * this.settings.fps;
};

// Sets the time an explosion lasts to 0.2 seconds;
Game.prototype.resetExplosionTimer = function() {
    this.explosionTimer = 0.2 * this.settings.fps;
};

// Shows one section of the page while hiding the other sections.
Game.prototype.showElement = function(elem) {
    elem.show();
    elem.siblings().hide();
};

// Adds event listeners.
Game.prototype.listen = function() {
    // Listens for click events on the characters.
    $('#main li.character').on('click', function (event) {
        // Marks only the current element as selected
        $(this).addClass('selected');
        $(this).siblings().removeClass('selected');

        // Assigns the selected character
        character = event.currentTarget.firstChild.innerText;

        if (character === 'Caro') {
            player.sprite = 'images/char-horn-girl.png';
        } else if (character === 'Xime') {
            player.sprite = 'images/char-cat-girl.png';
        }
    });

    // Listens for click events on the buttons.
    $('.button').on('click', function (event) {
        //Play button clicked.
        if ($(this).hasClass('play')) {
            // Unpauses the game and start the music.
            game.pause = false;
            game.playMusic();

            // Hides startup screen and shows canvas,
            // status bar, and pause button.
            game.showElement($('canvas'));
            $('#status-bar').show();
            $('#bottom-bar').show();
        }

        //High scores button clicked.
        if ($(this).hasClass('scores')) {
            highScore = new HighScore();
            highScore.list();
        }

        //High scores save button clicked.
        if ($(this).hasClass('save')) {
            highScore.store();
            $('#high-score-form').hide();
            game.showMessage('Game Over');
        }

        //How to play button clicked.
        if ($(this).hasClass('how')) {
            game.showElement($('#how').show());
        }

        //Credits button clicked.
        if ($(this).hasClass('credits')) {
            game.showElement($('#credits'));
        }

        //Back button clicked.
        if ($(this).hasClass('back')) {
            if (game.fromCanvas) {
                game.fromCanvas = false;
                game.showElement($('canvas'));
                $('#feedback').show();
                $('#status-bar').show();
                $('#bottom-bar').show();
                $('#restart').show();
                $('#exit').show();
            } else {
                game.showElement($('#main'));
            }
        }

        //Exit button clicked.
        if ($(this).hasClass('exit')) {
            game.clear();
            game = new Game();
            game.start();
            game.showElement($('#main'));
            $('#restart').hide();
            $('#exit').hide();
        }

        //Restart button clicked.
        if ($(this).hasClass('restart')) {
            game.clear();
            game = new Game();
            game.start();
            game.togglePause();
            game.playMusic();

            // Hides startup screen and shows canvas,
            // status bar, and pause button.
            game.showElement($('canvas'));
            $('#status-bar').show();
            $('#bottom-bar').show();
            $('#restart').hide();
            $('#exit').hide();
        }
    });

    // Listens for click on the icon buttons.
    $('.i-button').on('click', function (event) {
        if ($(this).hasClass('sound')) {
            game.toggleSound();
        }

        if ($(this).hasClass('pause')) {
            game.togglePause();
        }

        if ($(this).hasClass('bomb')) {
            player.handleInput('space');
        }
    });

    // Listens for key presses and sends the keys to the
    // Player.handleInput() method.
    document.addEventListener('keyup', function (e) {
        var allowedKeys = {
            32: 'space',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        player.handleInput(allowedKeys[e.keyCode]);
    });
};