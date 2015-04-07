var assetLoader = (function() {
    // sounds dictionary
    this.sounds = {
        'background': 'sounds/background.mp3',
        'collision': 'sounds/bug-collision.wav',
        'score': 'sounds/score.wav',
        'explosion': 'sounds/explosion.mp3',
        'gameOver': 'sounds/game-over.mp3'
    };

    var assetsLoaded = 0;                                // how many assets have been loaded
    this.totalAssets = Object.keys(this.sounds).length;  // total number of sound assets

    /**
     * Ensure all assets are loaded before using them
     * @param {number} dic  - Dictionary name ('imgs', 'sounds', 'fonts')
     * @param {number} name - Asset name in the dictionary
     */
    function assetLoaded(dic, name) {
        // don't count assets that have already loaded
        if (this[dic][name].status !== 'loading') {
            return;
        }

        this[dic][name].status = 'loaded';
        assetsLoaded++;

        // progress callback
        if (typeof this.progress === 'function') {
            this.progress(assetsLoaded, this.totalAssets);
        }

        // finished callback
        if (assetsLoaded === this.totalAssets && typeof this.finished === 'function') {
            this.finished();
        }
    }

    /**
     * Check the ready state of an Audio file.
     * @param {object} sound - Name of the audio asset that was loaded.
     */
    function _checkAudioState(sound) {
        if (this.sounds[sound].status === 'loading' && this.sounds[sound].readyState === 4) {
            assetLoaded.call(this, 'sounds', sound);
        }
    }

    /**
     * Create assets, set callback for asset loading, set asset source
     */
    this.downloadAll = function() {
        var _this = this;
        var src;

        // load sounds
        for (var sound in this.sounds) {
            if (this.sounds.hasOwnProperty(sound)) {
                src = this.sounds[sound];

                // create a closure for event binding
                (function(_this, sound) {
                    _this.sounds[sound] = new Audio();
                    _this.sounds[sound].status = 'loading';
                    _this.sounds[sound].name = sound;
                    _this.sounds[sound].addEventListener('canplay', function() {
                        _checkAudioState.call(_this, sound);
                    });
                    _this.sounds[sound].src = src;
                    _this.sounds[sound].preload = 'auto';
                    _this.sounds[sound].load();
                })(_this, sound);
            }
        }
    };

    return {
        sounds: this.sounds,
        totalAssets: this.totalAssets,
        downloadAll: this.downloadAll
    };
})();

/**
 * I modified this code to work with jQuery which
 * is already being used for other purposes.
 */
assetLoader.progress = function(progress, total) {
    $('#percent-loaded').text(Math.floor(progress / total * 100).toString() + '%');
};

/**
 *  I modified this code to work with functions
 *  already defined in my game.
 */
assetLoader.finished = function() {
    game.showElement($('#main'));
};