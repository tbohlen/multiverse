function inherits(child, parent) {
    function f() {
        this.constructor = child;
    }
    f.prototype = parent.prototype;
    child.prototype = new f;
}

/*
 * Function: boundedRand
 * Returns a random value uniformly distributed between min and max.
 */
function boundedRand(min, max) {
    return min + Math.random() * (max - min);
}

/*
 * Function: distance
 * Returns the distance between two points specified by (x, y) and (x2, y2).
 *
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
}

/*
 * Function: addVectors
 * Adds two vectors and returns the result
 */
function addVectors(vec1, vec2) {
    var result = [];
    var i;
    for (i = 0; i < vec1.length;i++) {
        result[i] = vec1[i] + vec2[i];
    }
    return result;
}

/*
 * Function: scale
 * Scales a vector by a scalar.
 */
function scale(vec, scalar) {
    var result = [];
    var i;
    for (i = 0; i < vec.length;i++) {
        result[i] = vec[i] * scalar;
    }
    return result;
}

/*
 * Function: drawCircle
 * Draws a circular path and closes it. The caller must have specified the fill
 * and stroke and called fill and stroke.
 * 
 * Parameters:
 * x - the x coord of the center
 * y - the y coord of the center
 * radius - the radius of the circle
 * ctx - context to draw on
 */
function drawCircle(x, y, radius, ctx) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, true); 
    ctx.closePath();
}

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

