// Authors: Josh Bourquin

import * as satellite from 'satellite.js'

let degrees = 180 / Math.PI;

export class Satellite {
    constructor(name, tle) {
        this.name = name
        this.satrec = satellite.twoline2satrec(tle[0], tle[1])
        this.id = this.satrec.satnum
    }

    propagate(time) {
        let positionAndVelocity = satellite.propagate(this.satrec, time)
        let positionEci = positionAndVelocity.position
        let gmst = satellite.gstime(time)
        let positionGd    = satellite.eciToGeodetic(positionEci, gmst)
        this.position = [positionGd.longitude*degrees, positionGd.latitude*degrees]
        this.velocity = positionAndVelocity.velocity
    }
}