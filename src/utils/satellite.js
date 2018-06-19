// Authors: Josh Bourquin

import * as satellite from 'satellite.js'
import {DateTime} from 'luxon'

let degrees = 180 / Math.PI;
let rootFinder = require('newton-raphson-method')

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

    groundTrackFeature(time) {
        let track = {
            type: 'Feature',
            geometry: {
                type: 'LineString', 
                coordinates: [],
            },
            properties: {}
        }

        let t0 = DateTime.fromJSDate(time)
        let sv0 = this.stateVectors(t0.toJSDate())
        
        while (true) {
            track.geometry.coordinates.push([sv0.longitude, sv0.latitude])

            if (sv0.longitude === 180 || sv0.longitude === -180) {
                break
            }

            let t1 = t0.plus({seconds: 10})
            let sv1 = this.stateVectors(t1.toJSDate())
            
            if (sv1.longitude === 180 || sv1.longitude === -180) {
                track.geometry.coordinates.push([sv1.longitude, sv1.latitude])
                break
            }

            let sv0_sign = Math.sign(sv0.longitude)
            let sv1_sign = Math.sign(sv1.longitude)

            if (sv1_sign !== sv0_sign && Math.abs(sv0.longitude) > 90) {
                const y0 = sv0.latitude + 90
                const y1 = sv1.latitude + 90
                const x0 = sv0.longitude + 180
                const x1 = sv1.longitude + 180
                const lat = y0 + (180-x0)*(y1-y0)/(x1-x0)
                track.geometry.coordinates.push([180, lat-90])
                break
            }
            
            t0 = t1
            sv0 = sv1
        }

        t0 = DateTime.fromJSDate(time)
        sv0 = this.stateVectors(t0.toJSDate())
        
        while (true) {
            track.geometry.coordinates.unshift([sv0.longitude, sv0.latitude])

            if (sv0.longitude === 180 || sv0.longitude === -180) {
                break
            }

            let t1 = t0.minus({seconds: 10})
            let sv1 = this.stateVectors(t1.toJSDate())
            
            if (sv1.longitude === 180 || sv1.longitude === -180) {
                track.geometry.coordinates.unshift([sv1.longitude, sv1.latitude])
                break
            }

            let sv0_sign = Math.sign(sv0.longitude)
            let sv1_sign = Math.sign(sv1.longitude)

            if (sv1_sign !== sv0_sign && Math.abs(sv0.longitude) > 90) {
                const y0 = sv0.latitude + 90
                const y1 = sv1.latitude + 90
                const x0 = sv0.longitude + 180
                const x1 = sv1.longitude + 180
                const lat = y0 + (180-x0)*(y1-y0)/(x1-x0)
                track.geometry.coordinates.unshift([180, lat-90])
                break
            }
            
            t0 = t1
            sv0 = sv1
        }
        
        return track
    }

}