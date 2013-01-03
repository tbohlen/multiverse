window.gameLevels = [LevelOne, LevelTwo];
///////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Level One //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: LevelOne
 * A level represents all the logic behind a single level of the game.
 * Generally, this means it has a doLogic function that is called by the main
 * logic loop and displays various queues to the screen to help the player find
 * the blackhole before it appears.
 */
function LevelOne() {
    this.won = false;
    this.startFrame = 0;
    this.logicIndex = -1;

    this.showingBlackhole = false;
    this.timeouts = [];
}

/*
 * Method: show
 * Starts the level by adding it into the game.
 *
 * Parameters:
 * game - the game object
 *
 * Member Of: LevelOne
 */
LevelOne.prototype.show = function(game) {
    game.addSprite(this, false, true);
    this.startFrame = game.logicFrame;
};

/*
 * Method: doLogic
 * Runs the logic of the level. This creates and removes sprites from the game.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: LevelOne
 */
LevelOne.prototype.doLogic = function(game) {
    if (Math.random() > 0.95) {
        var burst = new BurstSystem(game.width * Math.random(), game.height * Math.random(), colors[1]);
        game.addSprite(burst, true, true);
    }

    if (Math.random() > 0.999 && !this.showingBlackhole) {
        this.showBlackhole()
    }
};

/*
 * Method: showBlackhole
 * Shows the pattern preceding the blackhole and the blackhole itself.
 *
 * Member Of: LevelOne
 */
LevelOne.prototype.showBlackhole = function() {
    this.showingBlackhole = true;
    var timing = 400; // milliseconds between bursts
    var spacing = 30; // pixel distance between bursts
    var numBursts = 5;
    var qW = game.width/4;
    var qH = game.height/4
    var loc = [boundedRand(qW, 3*qW), boundedRand(qH, 3*qH)];
    var angle = boundedRand(0, 2*Math.PI);
    var dir = [Math.cos(angle), Math.sin(angle)];
    var i;
    var makeBurst = function(number) {
        var burst = new BurstSystem(loc[0] + number*dir[0] * spacing, loc[1] + number*dir[1] * spacing, colors[1]);
        game.addSprite(burst, true, true);
    }
    for (i = 0; i < numBursts; i++) {
        this.timeouts.push(window.setTimeout(makeBurst, timing*i, i))
    }
    // blackhole
    var makeBlackhole = function() {
        var blackhole = new Blackhole(loc[0] + numBursts*dir[0] * spacing, loc[1] + numBursts*dir[1] * spacing, 20);
        blackhole.show(game);
    };
    this.timeouts.push(window.setTimeout(makeBlackhole, numBursts*timing))

    // push one last timeout function to clear the timeouts after they have
    // executed and to clearn showingBlackhole
    this.timeouts.push(window.setTimeout(
        function(level){
            level.array = [];
            level.showingBlackhole = false;
        }, (numBursts+0.1)*timing, this))
};

/*
 * Method: kill
 * Ends the level. Right now this does nothing.
 *
 * Parameters:
 * game - the game obj
 *
 * Member Of: LevelOne
 */
LevelOne.prototype.kill = function(game) {
    for(var timeout in this.timeouts) {
        window.clearTimeout(timeout)
    }
    this.timeouts = []
    delete game.logicElements[this.logicIndex];
};

/*
 * Method: isDead
 * Checks to see if the level is over and can be disposed of. If it has been
 * won, it can be disposed of.
 *
 * Member Of: LevelOne
 */
LevelOne.prototype.isDead = function() {
    return this.won;
};



///////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Level Two //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: LevelTwo
 * While level one had random noise, this has tricky noise to try and prevent
 * the user from recognizing the pattern.
 */
function LevelTwo() {
    LevelOne.call(this)
    this.won = false;
    this.startFrame = 0;
    this.logicIndex = -1;

    this.showingBlackhole = false;
    this.timeouts = [];
}

inherits(LevelTwo, LevelOne); // TODO: make an abstract level object

/*
 * Method: doLogic
 * Runs the logic of the level. This creates and removes sprites from the game.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: LevelTwo
 */
LevelTwo.prototype.doLogic = function(game) {
    if (Math.random() > 0.991) {
        this.showFakeBlackhole();
    }

    if (Math.random() > 0.995 && !this.showingBlackhole) {
        console.log("blackhole!");
        this.showBlackhole()
    }
};

/*
 * Method: showFakeBlackhole
 * Tries to trick the player by showing a fake blackhole signal.
 *
 * Member Of: LevelTwo
 */
LevelTwo.prototype.showFakeBlackhole = function() {
    var timing = 300; // milliseconds between bursts
    if (Math.random() > 0.5)  {
        timing += boundedRand(200, 300)
    }
    else {
        timing -= boundedRand(200, 300)
    }
    var spacing = 30; // pixel distance between bursts
    if (Math.random() > 0.5)  {
        spacing += boundedRand(20, 40)
    }
    else {
        spacing -= boundedRand(10, 20)
    }
    var numBursts = 5;
    var qW = game.width/4;
    var qH = game.height/4
    var loc = [boundedRand(qW, 3*qW), boundedRand(qH, 3*qH)];
    var angle = boundedRand(0, 2*Math.PI);
    var dir = [Math.cos(angle), Math.sin(angle)];
    var i;
    var makeBurst = function(number) {
        var burst = new BurstSystem(loc[0] + number*dir[0] * spacing, loc[1] + number*dir[1] * spacing, colors[1]);
        game.addSprite(burst, true, true);
    }
    for (i = 0; i < numBursts; i++) {
        this.timeouts.push(window.setTimeout(makeBurst, timing*i, i))
    }
};

/*
 * Method: showBlackhole
 * Shows the pattern preceding the blackhole and the blackhole itself.
 *
 * Member Of: LevelTwo
 */
LevelTwo.prototype.showBlackhole = function() {
    this.showingBlackhole = true;
    var timing = 300; // milliseconds between bursts
    var spacing = 30; // pixel distance between bursts
    var numBursts = 5;
    var qW = game.width/4;
    var qH = game.height/4
    var loc = [boundedRand(qW, 3*qW), boundedRand(qH, 3*qH)];
    var angle = boundedRand(0, 2*Math.PI);
    var dir = [Math.cos(angle), Math.sin(angle)];
    var i;
    var makeBurst = function(number) {
        var burst = new BurstSystem(loc[0] + number*dir[0] * spacing, loc[1] + number*dir[1] * spacing, colors[1]);
        game.addSprite(burst, true, true);
    }
    for (i = 0; i < numBursts; i++) {
        this.timeouts.push(window.setTimeout(makeBurst, timing*i, i))
    }
    // blackhole
    var makeBlackhole = function() {
        var blackhole = new Blackhole(loc[0] + numBursts*dir[0] * spacing, loc[1] + numBursts*dir[1] * spacing, 20);
        blackhole.show(game);
    };
    this.timeouts.push(window.setTimeout(makeBlackhole, numBursts*timing))
};

/*
 * Method: kill
 * Ends the level. Right now this does nothing.
 *
 * Parameters:
 * game - the game obj
 *
 * Member Of: LevelTwo
 */
LevelTwo.prototype.kill = function(game) {
    for(var timeout in this.timeouts) {
        window.clearTimeout(timeout)
    }
    this.timeouts = []
    delete game.logicElements[this.logicIndex];
};

/*
 * Method: isDead
 * Checks to see if the level is over and can be disposed of. If it has been
 * won, it can be disposed of.
 *
 * Member Of: LevelTwo
 */
LevelTwo.prototype.isDead = function() {
    return this.won;
};



