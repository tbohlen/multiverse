var drawLoopID;
var logicLoopID;

/*
 * Constructor: Emitter
 * Simple event emitter
 */
function Emitter() {
    this.listeners = {};
}

/*
 * Method: attach
 * Attaches a listener to a given event.
 *
 * Parameters:
 * event- the name of the event
 * listener - the listening function. Takes a single parameter
 *
 * Member Of: Emitter
 */
Emitter.prototype.on = function(event, listener) {
    if (!(event in this.listeners)) {
        this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
};

/*
 * Method: emit
 * Emits an event to all listeners
 *
 * Parameters:
 * event - the name of the event
 *
 * Member Of: Emitter
 */
Emitter.prototype.emit = function(event) {
    var key
        , i
        , j
        , eventListeners
        , argsArray = [];
    for (j = 1; j < arguments.length; j++) {
        argsArray.push(arguments[j]);
    }
    if (event in this.listeners) {
        eventListeners = this.listeners[event];
        for (i = 0; i < eventListeners.length; i++) {
            eventListeners[i].apply(this, argsArray);
        }
    }
};



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
    offset = this.canvas.offset();
    this.offsetX = offset.left;
    this.offsetY = offset.top;
    this.drawElements = {};
    this.logicElements = {};
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



///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Blackhole ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: Blackhole
 * Builds a new blackhole object that can be moved around and displayed on
 * screen.
 */
function Blackhole(x, y, width, height, drawIndex, logicIndex) {
    this.timeStep = 0;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.drawIndex = drawIndex;
    this.logicIndex = logicIndex;
    this.alive = false;
    this.madeAlive = false;
    this.maxTimeSteps = 1000;
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
    if (!this.madeAlive) {
        this.madeAlive = true;
        this.alive = true;
    }
    game.context.fillStyle = "rgb(255, 255, 255)";
    game.context.fillRect(this.x, this.y, this.width, this.height);
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
    return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
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
    if (this.alive && this.contains(game.mouseX, game.mouseY)) {
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
    delete game.drawElements[this.drawIndex];
    delete game.logicElements[this.logicIndex];
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

$(document).ready(function() {
    var game = new Game();
    var blackhole = new Blackhole(10, 10, 10, 10, 0, 0);
    game.drawElements[0] = blackhole;
    game.logicElements[0] = blackhole;

    // start the loops
    drawLoopId = window.setInterval(drawLoop, 1000/60, game);
    logicLoopID = window.setInterval(logicLoop, 5, game); // 200 times per second

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Event Handlers //////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    game.canvas.on('mousemove', function(ev) {
        // when the mouse is moved, update the position
        game.mouseX = ev.pageX - game.offsetX;
        game.mouseY = ev.pageY - game.offsetY;
    });
});
