///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Time Stepper /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/*
 * Function: eulerStep
 * executes a single forward Euler integration step of size timeStep on the
 * provided particle system.
 */
function eulerStep(system, timeStep) {
    var currentState = system.getState();
    var deriv = system.evalDeriv(currentState);
    var key;
    for (key in currentState) {
        var particle = currentState[key];

        currentState[key] = addVectors(particle, scale(deriv[key], timeStep));

    }
    system.setState(currentState);
}

/*
 * Function: trapezoidalStep
 * Executes a single trapezoidal integration step forward of size timeStep.
 */
function trapezoidalStep(system, timeStep) {
    // find the next state, given a full euler step
    var currentState = system.getState();
    var deriv = system.evalDeriv(currentState);
    var nextState = {};
    var key;
    for (key in currentState) {
        var particle = currentState[key];

        nextState[key] = addVectors(particle, scale(deriv[key], timeStep));
    }

    // find the derivative at this next state
    var nextDeriv = system.evalDeriv(nextState);

    // use the two derivatives to find a better approximate state
    for (key in currentState) {
        var particle = currentState[key];

        currentState[key] = addVectors(particle, scale(addVectors(deriv[key], nextDeriv[key]), timeStep/2));
    }

    system.setState(currentState);
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
 *
 * Parameters:
 * x - the x coord of the system
 * y - the y coord of the system
 */
function ParticleSystem(x, y) {
    this.x = x;
    this.y = y;
    this.particles = {};
    this.lastIndex = -1;
    this.dead = false;
    this.logicIndex = -1;
    this.drawIndex = -1;

    this.burstRadius = 100;
    this.particleVelocity = 4;
    this.emitRate = 2;
    this.maxParticleAge = this.burstRadius/this.particleVelocity;
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
    var newNum = Math.floor(Math.random() * this.emitRate);
    for (i = 0; i < newNum; i++) {
        var angle = 2 * Math.PI * (i + Math.random() - 0.5) / newNum;
        var velX = this.particleVelocity * (Math.cos(angle) - 0.3 + Math.random() * 0.6);
        var velY = this.particleVelocity * (Math.sin(angle) - 0.3 + Math.random() * 0.6);
        var particle = new Particle(this.x, this.y, velX, velY);
        particle.maxAge = this.maxParticleAge;
        this.lastIndex++;
        this.particles[this.lastIndex] = particle;
    }
};

/*
 * Method: evalDeriv
 * Evaluates the derivative of the given system state. This does not use
 * "this.particles"! It uses whatever state is passed to it. Make sure to pass in a
 * state of the correct length. Incorrect behavior would certainly result if
 * you didn't.
 *
 * This particular implementation simply continues the motions of the particles
 * in a straight line with decreasing velocity.
 *
 * This function takes a state not a particle list.
 *
 * Parameters:
 * state - the state at which to calculate the force
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.evalDeriv = function(state) {
    var key;
    var deriv = {};
    for (key in state) {
        var particle = state[key];
        deriv[key] = [particle[2], particle[3], 0, 0, 1];
    }
    return deriv;
};

/*
 * Method: getState
 * Returns a copy of the state of the particle system.
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.getState = function() {
    var state = {};
    var key;
    for (key in this.particles) {
        state[key] = this.particles[key].state;
    }
    return state;
};

/*
 * Method: setState
 * Sets the state of each particle to the state mapped to the same key in the
 * newState array passed as an argument to this function.
 *
 * Parameters:
 * newState - the new state of the system.
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.setState = function(newState) {
    var key;
    for (key in this.particles) {
        this.particles[key].state = newState[key];
    }
};

/*
 * Method: doLogic
 * Runs the logic of the system. Namely, emitting new particles and updating
 * the system.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.doLogic = function(game) {
    this.addParticles();
    // step forward the system
    trapezoidalStep(this, LOGIC_LOOP_TIME/DRAW_LOOP_TIME);
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
ParticleSystem.prototype.draw = function(game) {
    var key;
    for (key in this.particles) {
        var particle = this.particles[key];
        if (particle.isDead()) {
            delete this.particles[key];
        }
        else {
            this.particles[key].draw(game);
        }
    }
};

/*
 * Method: isDead
 * Checks to see if the particle system is dead and can be removed.
 *
 * Member Of: ParticleSystem
 */
ParticleSystem.prototype.isDead = function() {
    return this.dead;
};



///////////////////////////////////////////////////////////////////////////////
/////////////////////// Basic Particles (and sprite) //////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: Particle
 * Builds a new generic particle.
 *
 * The particle must include all information the derivative evaluator in the
 * associated particle system might want in its state variable.
 *
 * Because there may be many of these particles, you most likely want to contain
 * any shared values in the prototype.
 */
function Particle(x, y, velX, velY) {
    this.state = [x, y, velX, velY, 0];
    this.maxAge = 10;
}

/*
 * Method: radius
 * Returns the radius of the particle
 *
 * Member Of: Particle
 */
Particle.prototype.radius = 2;

/*
 * Method: draw
 * Draws the particle.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: Particle
 */
Particle.prototype.draw = function(game) {
    var scaleNum = 1.0 - (this.state[4]/this.maxAge);
    var color = scale([255.0, 255.0, 255.0], scaleNum);
    var radius = this.radius/scaleNum;
    game.context.fillStyle = "rgb(" + Math.floor(color[0]).toString() + ", " + Math.floor(color[1]).toString() + ", " + Math.floor(color[2]).toString() + ")";
    drawCircle(this.state[0], this.state[1], this.radius, game.context);
    game.context.fill();
};

/*
 * Method: isDead
 * Returns true if the particle is dead and false otherwise. Dead particles are
 * removed and never shown again. This particles dies if it is moved off screen
 * or older than its maxAge attribute.
 *
 * Member Of: Particle
 */
Particle.prototype.isDead = function() {
    return this.state[4] > this.maxAge ||
        this.state[0] < -75 || this.state[0] > window.game.width + 75 ||
        this.state[1] < -75 || this.state[1] > window.game.height + 75;
};



///////////////////////////////////////////////////////////////////////////////
////////////////////////////// ColorParticles /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: ColorParticle
 * Builds a new color particle. It is essentially identical to the basic
 * particle, but it has a controllable color/
 */
function ColorParticle(x, y, velX, velY, color) {
    Particle.call(this, x, y, velX, velY, color);
    this.state = [x, y, velX, velY, 0];
    this.maxAge = 10;
    this.color = color;
}

inherits(ColorParticle, Particle);

/*
 * Method: radius
 * Returns the radius of the particle
 *
 * Member Of: Particle
 */
ColorParticle.prototype.radius = 2;

/*
 * Method: draw
 * Draws the particle.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: Particle
 */
ColorParticle.prototype.draw = function(game) {
    var scaleNum = 1.5 - 1.5*Math.pow((this.state[4]/this.maxAge), 2);
    var color = scale(this.color, scaleNum);
    var radius = this.radius/scaleNum;
    game.context.fillStyle = "rgb(" + Math.floor(color[0]).toString() + ", " + Math.floor(color[1]).toString() + ", " + Math.floor(color[2]).toString() + ")";
    drawCircle(this.state[0], this.state[1], this.radius, game.context);
    game.context.fill();
};



///////////////////////////////////////////////////////////////////////////////
////////////////////////// Burst Particles System /////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: BurstSystem
 * A particle system where the particles simply fly straight out and continue
 * for quite a while.
 *
 * Parameters:
 * x - the x pos
 * y - the y pos
 * radius - the radius of the burst
 * color - the color of the particles emitted
 */
function BurstSystem(x, y, radius, color) {
    ParticleSystem.call(this, x, y)

    this.burstRadius = 600;
    this.particleVelocity = 15;
    this.emitRate = 30;
    this.age = 0;
    this.color = color;
    this.maxEmittingAge = 15;
    this.maxParticleAge = this.burstRadius/this.particleVelocity;
    this.accel = -0.8;
    this.velVariance = 0.01;
}

inherits(BurstSystem, ParticleSystem);

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
BurstSystem.prototype.addParticles = function(newStates) {
    
    var newNum = Math.floor(Math.random() * this.emitRate);
    for (i = 0; i < newNum; i++) {
        var angle = 2 * Math.PI * (i + Math.random() - 0.5) / newNum;
        var velX = this.particleVelocity * (Math.cos(angle) - this.velVariance/2 + Math.random() * this.velVariance);
        var velY = this.particleVelocity * (Math.sin(angle) - this.velVariance/2 + Math.random() * this.velVariance);
        var particle = new ColorParticle(this.x, this.y, velX, velY, scale(this.color, (1.5 - 1.5*this.age/this.maxEmittingAge)));
        particle.maxAge = this.maxParticleAge;
        this.lastIndex++;
        this.particles[this.lastIndex] = particle;
    }
};

/*
 * Method: doLogic
 * Runs the logic of the system. Namely, emitting new particles and updating
 * the system.
 *
 * Parameters:
 * game - the game object.
 *
 * Member Of: ParticleSystem
 */
BurstSystem.prototype.doLogic = function(game) {
    if (this.age < this.maxEmittingAge) {
        this.addParticles();
        // step forward the system
    }
    trapezoidalStep(this, LOGIC_LOOP_TIME/DRAW_LOOP_TIME);
    this.age++;
};

/*
 * Method: evalDeriv
 * Evaluates the derivative of the given system state. This does not use
 * "this.particles"! It uses whatever state is passed to it. Make sure to pass in a
 * state of the correct length. Incorrect behavior would certainly result if
 * you didn't.
 *
 * This particular implementation simply continues the motions of the particles
 * in a straight line with decreasing velocity.
 *
 * This function takes a state not a particle list.
 *
 * Parameters:
 * state - the state at which to calculate the force
 *
 * Member Of: BurstSystem
 */
BurstSystem.prototype.evalDeriv = function(state) {
    var key;
    var deriv = {};
    for (key in state) {
        var particle = state[key];
        var cosine = 0.0;
        var sine = 0.0;
        if (particle[0] - this.x != 0) {
            var angle = Math.atan((particle[1] - this.y) / (particle[0] - this.x));
            if (particle[0] - this.x < 0) {
                angle = angle + Math.PI;
            }
            cosine = Math.cos(angle);
            sine = Math.sin(angle);
        }
        deriv[key] = [particle[2], particle[3], this.accel * cosine, this.accel * sine, 1];
    }
    return deriv;
};

/*
 * Method: isDead
 * Checks to see if the particle system is dead and can be removed. It is dead
 * when it has lived longer than some minimum and all its particles are dead.
 *
 * Member Of: BurstSystem
 */
BurstSystem.prototype.isDead = function() {
    return this.age > this.maxEmittingAge && Object.keys(this.particles).length == 0;
};

/*
 * Method: kill
 * Cleans up when dying.
 *
 * Parameters:
 * game - the game object
 *
 * Member Of: BurstSystem
 */
BurstSystem.prototype.kill = function(game) {
};



///////////////////////////////////////////////////////////////////////////////
///////////////////////// Wormhole Particles System ///////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: WormholeSystem
 * A particle system where all particles are accelerated towards the center.
 */
function WormholeSystem() {
    this.length = 30;
    this.width = 2;
}

inherits(WormholeSystem, ParticleSystem);

/*
 * Method: drawParticle
 * Draws the given particle to the screen.
 *
 * Parameters:
 * particle - the particle to draw
 *
 * Member Of: WormholeSystem
 */
WormholeSystem.prototype.drawParticle = function(particle) {
    var scaleNum = 1.0 - (this.age/this.maxAge);
    var color = scale([255.0, 255.0, 255.0], scaleNum);
    var length = this.length * scaleNum;
    var width = this.width/scaleNum;
    var angle = Math.atan(-this.velY/this.velX);
    var cosine = Math.cos(angle);
    var sine = Math.sin(angle);
    ctx.lineWidth = width;
    ctx.strokeStyle = "rgb(" + Math.floor(color[0]).toString() + ", " + Math.floor(color[1]).toString() + ", " + Math.floor(color[2]).toString() + ")";
    ctx.beginPath();
    ctx.moveTo(this.x - length * 0.5 * cosine, this.y + length * 0.5 * sine);
    ctx.lineTo(this.x + length * 0.5 * cosine, this.y - length * 0.5 * sine);
    ctx.closePath();
    ctx.stroke();
};
