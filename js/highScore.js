// Contains the constructor and all the
// methods for the HighScores class.

// My parse.com keys.  If you are reusing this code, please get your
// own application keys.  They are free and only take a minute to get.
Parse.initialize("P7TRGwPfCWtFcqu4ALcNvzFeHMDyX2j5VL0I0ClG", "qq0z99GlZP0mcGDkCfe1XWKt7VuSkHZurP9aI3DJ");

// HighScore class constructor.  It is a subclass of Parse.
var HighScore = Parse.Object.extend("HighScore");

// Stores high score information.
HighScore.prototype.store = function() {
    this.set('score', game.score);
    this.set('level', game.level);
    this.set('name', $('#player-name').val());
    this.set('town', $('#player-town').val());

    this.save(null, {
        success: function(highScore) {
            game.fromCanvas = true;
            highScore.list();
        }
    });
};

// Displays the top 15 scores.
HighScore.prototype.list = function() {
    var query = new Parse.Query(HighScore);
    query.limit(15);
    query.descending('score');
    query.find({
        success: function(scores) {
            var htmlContent = '';
            for (var i = 0; i < scores.length; i++) {
                var score = scores[i];
                htmlContent += '<div>' +
                '<div class="content">' + score.get('name').substring(0,13)  + '</div>' +
                '<div class="content">' + score.get('town').substring(0,13)  + '</div>' +
                '<div class="content">' + score.get('score')+ '</div>' +
                '<div class="content">' + score.get('level') + '</div>' +
                '</div>';
            }
            $('#scores').html(htmlContent);
            game.showElement($('#high-scores').show());
        }
    });
};

// Shows high-score-form if score qualifies.
HighScore.prototype.qualify = function() {
    var query = new Parse.Query(HighScore);
    query.limit(15);
    query.descending('score');
    query.find({
        success: function(scores) {
            if (scores.length < 15) {
                $('#high-score-form').show();
            } else {
                if (game.score > scores[14].get('score')) {
                    $('#high-score-form').show();
                } else {
                    game.showMessage('Game Over');
                }
            }
        }
    });
};