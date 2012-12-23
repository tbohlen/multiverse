var canvas;
var context
var drawFunction;
var loop;

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

/*
 * Function: draw
 * Draws the game.
 */
function draw() {
    context.fillStyle = "rgba(0, 0, 200, 0.5)";
    context.fillRect (30, 30, 55, 50);
}

$(document).ready(function() {
    // find everything, set variables
    canvas = $("#game")
    context = canvas[0].getContext("2d")

    // start the draw loop
    loop = window.setInterval(draw, 1000/60)
});
