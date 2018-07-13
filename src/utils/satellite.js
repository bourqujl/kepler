// Authors: Josh Bourquin

import * as satellite from 'satellite.js'
import {DateTime} from 'luxon'

let degrees = 180 / Math.PI

// Python modulo function
function mod(m, n) {
    return m - (Math.floor(m/n) * n);
}

// Check if we crossed the 180th parallel
// going from l0 and l1
function antiMeridian(l0, l1) {
    let l0_mod = mod(l0, 360)
    let l1_mod = mod(l1, 360)
    if (Math.abs(l1_mod - l0_mod) >= 180) {
        return false
    } else {
        return Math.abs(180-l0_mod) + Math.abs(180-l1_mod) === Math.abs(l1_mod - l0_mod)
    }
}

// Use the secant method to find the root
function findRoot(stateVectors, t1, t0, maxIter=10) {
    
    function f(x) {
        let d = DateTime.fromMillis(x).toJSDate()
        let sv = stateVectors(d)
        return mod(sv.longitude, 360) - 180
    }

    f = f.bind(this)

    let x0 = t0.toMillis()
    let x1 = t1.toMillis()
    let x2 = 0
    let i = 0

    while (i < maxIter) {
        x2 = (x0*f(x1)-x1*f(x0))/(f(x1) - f(x0))
        
        if (!isFinite(x2)) {
            x2 = x1
            break
        } else if (Math.abs(x2-x1) < 1) {
            break
        }
        
        x0 = x1
        x1 = x2
        i++
    }

    return DateTime.fromMillis(x2)
}

// <--------------------------------------------------------------------------->

export class Satellite {
    constructor(name, tle) {
        this.name = name
        this.satrec = satellite.twoline2satrec(tle[0], tle[1])
        this.id = this.satrec.satnum
    }

    stateVectors(time) {
        let positionAndVelocity = satellite.propagate(this.satrec, time)  
        let positionGd = satellite.eciToGeodetic(
            positionAndVelocity.position, 
            satellite.gstime(time)
        )
        return {
            longitude: positionGd.longitude*degrees,
            latitude: positionGd.latitude*degrees,
            position: positionAndVelocity.position,
            postionGd: positionGd,
            velocity: positionAndVelocity.velocity
        }
    }

    generateGroundTrack(time, timeDelta=15) {
        let track = {
            type: 'Feature',
            geometry: {
                type: 'LineString', 
                coordinates: [],
            },
            properties: {}
        }
        
        // Calcuate where the satellite has been
        let t0 = DateTime.fromJSDate(time)
        let sv0 = this.stateVectors(t0.toJSDate())
        
        while (true) {
            track.geometry.coordinates.unshift([sv0.longitude, sv0.latitude])
            let t1 = t0.minus({seconds: timeDelta})
            let sv1 = this.stateVectors(t1.toJSDate())
            
            if (antiMeridian(sv0.longitude, sv1.longitude)) {
                let startTime = findRoot(this.stateVectors.bind(this), t1, t0)
                let startState = this.stateVectors(startTime.toJSDate())
                track.geometry.coordinates.unshift([startState.longitude, startState.latitude])
                track.properties['startTime'] = startTime.toJSDate()
                break
            }

            t0 = t1
            sv0 = sv1
        }

        // Calculate where the satellite is going
        t0 = DateTime.fromJSDate(time)
        sv0 = this.stateVectors(t0.toJSDate())
        
        while (true) {
            track.geometry.coordinates.push([sv0.longitude, sv0.latitude])
            let t1 = t0.plus({seconds: timeDelta})
            let sv1 = this.stateVectors(t1.toJSDate())
            
            if (antiMeridian(sv0.longitude, sv1.longitude)) {
                let endTime = findRoot(this.stateVectors.bind(this), t1, t0)
                let endState = this.stateVectors(endTime.toJSDate())
                track.geometry.coordinates.push([endState.longitude, endState.latitude])
                track.properties['endTime'] = endTime.toJSDate()
                break
            }

            t0 = t1
            sv0 = sv1
        }

        return track
    }
}

