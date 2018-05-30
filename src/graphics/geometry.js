// Authors: Josh Bourquin

/* 
    Creates a WGS84 spheroid
    Equiatorial radius: 6378137 m
    Polar radius: 6356752.3 m
    Flattening: 1/298.257223560

    Sections are defined using ranges specified in radians.
*/
export function WGS84Spheroid(u, v, vector) {
    const f = 1/298.257223560
    const a = 1
    const c = a - (f * a)
    u = 2*Math.PI * u
    v = Math.PI/4 * v + Math.PI/2
    let x = a * Math.sin(v) * Math.cos(u)
    let y = c * Math.cos(v)
    let z = a * Math.sin(v) * Math.sin(u)
    vector.fromArray([x, y, z])
}

/*
    Create a section of a WGS84 spheroid by specifying a start/stop theta and
    phi angle in degrees. Theta represents the horizontal rotation and phi 
    represents the vertical rotation.
*/
export function WGS84GridSection(theta0, theta1, phi0, phi1) {
    const f = 1/298.257223560
    const a = 1
    const c = a - (f * a)

    // Calculate the u|v value slope and intercept
    const du = radians(theta1 - theta0)
    const u0 = radians(theta0)
    const dv = radians(phi1 - phi0)
    const v0 = radians(phi0)

    return (u, v, vector) => {
        u = du * u + u0
        v = dv * v + v0
        let x = a * Math.sin(v) * Math.cos(u)
        let y = c * Math.cos(v)
        let z = a * Math.sin(v) * Math.sin(u)
        vector.fromArray([x, y, z])
    }
}

/*
    Convert degrees to radians
*/
export function radians(degrees) {
    return degrees * Math.PI/180
}