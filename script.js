var drawLoopID;
var logicLoopID;
var LOGIC_LOOP_TIME = 5;
var DRAW_LOOP_TIME = 1000/30;



///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Game Object //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: Game
 * Constructs a new game object.
 */
function Game() {
    var offset;
    // find everything, set variables
    this.canvas = $("#game")
    this.context = this.canvas[0].getContext("2d")
    this.width = this.canvas.width();
    this.height = this.canvas.height();
    this.drawElements = {};
    this.logicElements = {};
    this.lastDrawIndex = -1;
    this.lastLogicIndex = -1;
    this.drawFrame = 0;
    this.logicFrame = 0;
}

/*
 * Method: finishLevel
 * Finishes the current level by removing the old level logic and replacing it
 * with the next level logic. The user is also notified (do not know how just
 * yet) and the response is difference depending on the win parameter.
 *
 * Parameters:
 * win - whether the level was won.
 *
 * Member Of: Game
 */
Game.prototype.finishLevel = function(win) {
    if (win) {
        this.context.fillStyle = "rgb(50, 50, 255)";
        this.context.fillText("Next Universe!", this.width/2, this.height/2);
    }
};

/*
 * Method: addSprite
 * Adds an object to the drawElements and logicElements, or just one of the two
 * lists.
 *
 * Parameters:
 * sprite - the object to add to the lists
 * draw - true if should be added to drawElements
 * logic - true if should be added to logicElements
 *
 * Member Of: Game
 */
Game.prototype.addSprite = function(sprite, draw, logic) {
    if (draw) {
        this.lastDrawIndex++;
        this.drawElements[this.lastDrawIndex] = sprite
        sprite.drawIndex = this.lastDrawIndex;
    }
    if (logic) {
        this.lastLogicIndex++;
        this.logicElements[this.lastLogicIndex] = sprite;
        sprite.logicIndex = this.lastLogicIndex;
    }
};

/*
 * Method: resize
 * Resizes the game to fill the entire screen
 *
 * Member Of: Game
 */
Game.prototype.resize = function() {
    this.canvas.height($(window).innerHeight());
    this.canvas.width($(window).innerWidth());
    this.height = this.canvas.height();
    this.width = this.canvas.width();
    this.canvas.attr("height", this.height);
    this.canvas.attr("width", this.width);
    offset = this.canvas.offset();
    this.offsetX = offset.left;
    this.offsetY = offset.top;
};



///////////////////////////////////////////////////////////////////////////////
////////////////////////////// BurstEmitter ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/*
 * Constructor: ParticleEmitter
 * Constructs the abstract particle emitter. We will need far more specific
 * emitters for every application.
 *
 * Parameters:
 * x - the x coord of the emitter
 * y - the y coord of the emitter
 */
function ParticleEmitter(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.burstRadius = 300;
    this.particleVelocity = 6;
    this.emitRate = 6;
    this.startFrame = 0;
    this.system = new ParticleSystem();
    this.maxAge = this.burstRadius/this.particleVelocity;
    this.dead = false;
    this.alive = false;
    this.logicIndex = -1;
    this.drawIndex = -1;
}

/*
 * Method: doLogic
 * Runs the logic of the emitter. Namely, Emitting new particles and updating
 * the system.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: ParticleEmitter
 */
ParticleEmitter.prototype.doLogic = function(game) {
    if (this.alive && !this.dead) {
        this.addParticles();
        // step forward the system
        trapezoidalStep(this.system, LOGIC_LOOP_TIME/DRAW_LOOP_TIME);
    }
};

/*
 * Method: addParticles
 * Adds more particles
 *
 * Member Of: ParticleEmitter
 */
ParticleEmitter.prototype.addParticles = function() {
    var i;
    var newParticles = []
    var newNum = Math.floor(Math.random() * this.emitRate);
    for (i = 0; i < newNum; i++) {
        var angle = 2 * Math.PI * (i + Math.random() - 0.5) / newNum;
        var velX = this.particleVelocity * (Math.cos(angle) - 0.3 + Math.random() * 0.6);
        var velY = this.particleVelocity * (Math.sin(angle) - 0.3 + Math.random() * 0.6);
        var particle = new Particle(this.x, this.y, velX, velY);
        particle.maxAge = this.maxAge;
        newParticles.push(particle);
    }
    this.system.addParticles(newParticles);
};

/*
 * Method: draw
 * Draws the particle emitter and all its particles
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: ParticleEmitter
 */
ParticleEmitter.prototype.draw = function(game) {
    if (!this.dead && !this.alive) {
        this.alive = true;
        this.startFrame = game.logicFrame;
        this.addParticles();
    }
    this.system.draw(game);
    game.context.fillStyle = "rgb(0, 0, 0)";
    drawCircle(this.x, this.y, this.radius, game.context);
    game.context.fill();
};

/*
 * Method: kill
 * Kills the particle emitter.
 *
 * Member Of: ParticleEmitter
 */
ParticleEmitter.prototype.kill = function(game) {
    this.alive = false;
    this.dead = true;
    delete game.drawElements[this.drawIndex];
    delete game.logicElements[this.logicIndex];
};



///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Blackhole ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: Blackhole
 * Builds a new blackhole object that can be moved around and displayed on
 * screen.
 *
 * Parameters:
 * x - the x coord of the center
 * y - the y coord of the center of the blackhole
 * radius - the radius of the collision area of the blackhole
 */
function Blackhole(x, y, radius) {
    this.timeStep = 0;
    this.centerX = x;
    this.centerY = y;
    this.radius = radius;
    this.height = radius;
    this.width = radius;
    this.x = this.centerX - this.radius/2
    this.y = this.centerY - this.radius/2;
    this.drawIndex = -1;
    this.logicIndex = -1;
    this.alive = false;
    this.dead = false;
    this.maxTimeSteps = 3000;
    this.emitter = new ParticleEmitter(this.centerX, this.centerY, this.radius);
}

/*
 * Method: draw
 * Draws the blackhole on the screen.
 *
 * Parameters:
 * ctx - the drawing context
 *
 * Member Of: Blackhole
 */
Blackhole.prototype.draw = function(game) {
    if (!this.dead && !this.alive) {
        this.alive = true;
        game.addSprite(this.emitter, true, true);
    }
    this.timeStep++;
    if (this.timeStep > this.maxTimeSteps) {
        this.kill(game);
    }
};

/*
 * Method: contains
 * returns true if x, y is a point inside the blackhole shape.
 *
 * Parameters:
 * x - the x position to test
 * y - the y position to test
 *
 * Member Of: Blackhole
 */
Blackhole.prototype.contains = function(x, y) {
    return distance(this.centerX, this.centerY, x, y) <= this.radius;
};

/*
 * Method: doLogic
 * Runs the logic associated with the blackhole.
 *
 * Parameters:
 * game - the game object
 *
 * Member Of: Blackhole
 */
Blackhole.prototype.doLogic = function(game) {
    if (this.alive && !this.dead && this.contains(game.mouseX, game.mouseY)) {
        // if the mouse is within the shape and the blackhole is alive, go to
        // the next level
        game.finishLevel(true);
    }
};

/*
 * Method: kill
 * Kills the object by removing it from the drawElements list and setting alive to
 * false.
 *
 * Parameters:
 * Param - desc...
 *
 * Member Of: Blackhole
 */
Blackhole.prototype.kill = function(game) {
    this.alive = false;
    this.dead = true;
    delete game.drawElements[this.drawIndex];
    delete game.logicElements[this.logicIndex];
};



///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Level ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: Level
 * A level represents all the logic behind a single level of the game.
 * Generally, this means it has a doLogic function that is called by the main
 * logic loop and displays various queues to the screen to help the player find
 * the blackhole before it appears.
 */
function Level() {
    this.started = false;
    this.stopped = false;
    this.sprites = {};
    this.startFrame = 0;
}

/*
 * Method: doLogic
 * Runs the logic of the level. This creates and removes sprites from the game.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: Level
 */
Level.prototype.doLogic = function(game) {
    if (!this.started && !this.stopped) {
        this.started = true;
        this.startFrame = game.logicFrame;
    }
    if (Math.random() > 0.8) {
        var sprite = new Sprite();
        game.addSprite(sprite, true, true);
    }
};

/*
 * Method: end
 * Ends the level by removing all its sprites from the game.
 *
 * Parameters:
 * win - true if the player won, false otherwise
 *
 * Member Of: Level
 */
Level.prototype.end = function(win) {
    for (var key in this.sprites) {
        this.sprites[key].kill();
    }
};



///////////////////////////////////////////////////////////////////////////////
///////////////////////////// Main Drawing Loop ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Function: drawUpdate
 * Updates all variables necessary to draw.
 */
function drawUpdate(game) {
    game.drawFrame++;
}

/*
 * Function: logicUpdate
 * Updates all the necessary variables for the logic run.
 */
function logicUpdate(game) {
    game.logicFrame++;
}

/*
 * Function: clearScreen
 * Clears the drawing context entirely.
 *
 * Parameters:
 * color - the color to make the screen.
 */
var clearScreen = function(game, color) {
    game.context.clearRect(0, 0, game.width, game.height);
    if (color !== null && typeof(color) !== 'undefined') {
        game.context.fillStyle = color;
        game.context.fillRect(0, 0, game.width, game.height);
    }
};

/*
 * Function: drawLoop
 * Draws the game. And keeps the drawFrame up to date. The logic is handled
 * elsewhere.
 */
function drawLoop(game) {
    var i;
    // update all important variables
    drawUpdate(game);
    // clean the screen
    clearScreen(game, "rgb(0, 0, 0)");

    // draw all drawElements
    for (var key in game.drawElements) {
        if (game.drawElements.hasOwnProperty(key)) {
            game.drawElements[key].draw(game);
        }
    }
}

/*
 * Function: logicLoop
 * Executes the logic of the game, one logicElement at a time.
 */
function logicLoop(game) {
    var i;
    // update all important variables
    logicUpdate(game);

    // run all logicElements
    for (var key in game.drawElements) {
        if (game.logicElements.hasOwnProperty(key)) {
            game.logicElements[key].doLogic(game);
        }
    }
}

/*
 * Function: loadGame
 * Loads the game, including necesary images, waiting until they are all loaded
 * to continue.
 */
function loadGame(callback) {
    window.game = new Game();
    window.game.blackholeImage = new Image();
    console.log("Loading...");
    window.game.blackholeImage.onload = function() {
        callback(window.game);
    };
    window.game.blackholeImage.src = "images/blackhole.png";
}


$(document).ready(function() {

    // load the game. This should be used to show a loading bar in future.
    loadGame(function(game) {
        console.log("loaded");
        // size the game and add the canvas to the screen
        game.resize();

        var blackhole = new Blackhole(400, 200, 10);
        game.addSprite(blackhole, true, true);

        // start the loops
        drawLoopId = window.setInterval(drawLoop, DRAW_LOOP_TIME, game);
        logicLoopID = window.setInterval(logicLoop, LOGIC_LOOP_TIME, game); // 200 times per second

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Event Handlers //////////////////////////////
        ///////////////////////////////////////////////////////////////////////////

        game.canvas.on('mousemove', function(ev) {
            // when the mouse is moved, update the position
            game.mouseX = ev.pageX - game.offsetX;
            game.mouseY = ev.pageY - game.offsetY;
        });
    });
});
