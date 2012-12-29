///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Time Stepper /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/*
 * Function: eulerStep
 * executes a single forward Euler integration step of size timeStep on the
 * provided particle system.
 */
function eulerStep(system, timeStep) {
    var currentState = system.copyState();
    var deriv = system.evalDeriv(currentState);
    var i;
    for (i = 0; i < currentState.length; i++) {
        var particle = currentState[i];

        currentState[i] = addVectors(particle, scale(deriv[i], timeStep));

        // test for dead particles
        if (particle[4] > system.getMaxAge() || particle[0] < 0 || particle[0] > window.game.width || particle[1] < 0 || particle[1] > window.game.height) {
            console.log("cull");
            currentState.splice(i, 1);
            i--;
        }
    }
    system.state = currentState;
}



///////////////////////////////////////////////////////////////////////////////
////////////////////////////// ParticleSystem /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: ParticleSystem
 * Builds a particle system without any particles. Those must be added through
 * the addParticles method.
 * 
 * The system stores state as a vector of vectors, where each vector represents
 * a particles x, y, velX, velY, and time.
 */
function ParticleSystem() {
    this.state = [];
    this.length = 30;
    this.width = 2;
    this.maxAge = 10;
}

/*
 * Method: addParticles
 * Adds new particles to the system. These particles' states are simply appended
 * to the existing state, so they must be formatted correctly (each state a
 * vector of x, y, velX, velY, and time).
 *
 * Parameters:
 * newStates - the states of the new particles to add to the particle system
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.addParticles = function(newStates) {
    var i;
    for (i = 0; i < newStates.length; i++) {
        this.state.push(newStates[i]);
    }
};

/*
 * Method: evalDeriv
 * Evaluates the derivative of the given system state. This does not use
 * "this.state"! It uses whatever state is passed to it. Make sure to pass in a
 * state of the correct length. Incorrect behavior would certainly result if
 * you didn't.
 *
 * This particular implementation simply continues the motions of the particles
 * in a straight line.
 *
 * Parameters:
 * state - the state at which to calculate the force
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.evalDeriv = function(state) {
    var i;
    var deriv = [];
    for (i = 0; i < state.length; i++) {
        var particle = state[i];
        deriv[i] = [particle[2], particle[3], -0.05 * particle[2], -0.05 * particle[3], 1];
    }
    return deriv;
};

/*
 * Method: copyState
 * Returns a copy of the state of the particle system.
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.copyState = function() {
    return $.extend(true, [], this.state);
};

/*
 * Method: getMaxAge
 * Returns the maximum age for a particle in this system.system.
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.getMaxAge = function() {
    return this.maxAge;
};

/*
 * Method: draw
 * Draws the particle system. This function can be replaced easily for
 * individual particle systems.
 *
 * Parameters:
 * ctx - the context to draw on.
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.draw = function(ctx) {
    var i;
    for (i = 0; i < this.state.length; i++) {
        var particle = this.state[i];
        var scaleNum = 1.0 - (particle[4]/this.maxAge);
        var color = scale([255.0, 255.0, 255.0], scaleNum);
        var length = this.length * scaleNum;
        var width = this.width/scaleNum;
        var angle = Math.atan(-particle[3]/particle[2]);
        var cosine = Math.cos(angle);
        var sine = Math.sin(angle);
        ctx.lineWidth = width;
        ctx.strokeStyle = "rgb(" + Math.floor(color[0]).toString() + ", " + Math.floor(color[1]).toString() + ", " + Math.floor(color[2]).toString() + ")";
        ctx.beginPath();
        ctx.moveTo(particle[0] - length * 0.5 * cosine, particle[1] + length * 0.5 * sine);
        ctx.lineTo(particle[0] + length * 0.5 * cosine, particle[1] - length * 0.5 * sine);
        ctx.closePath();
        ctx.stroke();
    }
};
