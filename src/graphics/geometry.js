// Authors: Josh Bourquin

/* 
    Creates a gloabl grid section conforming to a WGS84 spheroid
    Equiatorial radius: 6378137 m
    Polar radius: 6356752.3 m
    Flattening: 1/298.257223560

    Sections are defined using ranges specified in radians.
*/
export function globeGridSectionGeometry(section) {
    const f = 1/298.257223560
    const a = 1
    const c = a - (f * a)
    let du, dv, v0

    switch (section) {
        case 'A1':
            du = Math.PI/2
            dv = -Math.PI/2
            v0 = 0
            break
        case 'A2':
            du = Math.PI/2
            dv = Math.PI/2
            v0 = Math.PI
            break
        case 'B1':
            du = -Math.PI/2
            dv = -Math.PI/2
            v0 = 0
            break
        case 'B2':
            du = -Math.PI/2
            dv = Math.PI/2
            v0 = Math.PI
            break
        case 'C1':
            du = Math.PI/2
            dv = Math.PI/2
            v0 = 0
            break
        case 'C2':
            du = Math.PI/2
            dv = -Math.PI/2
            v0 = Math.PI
            break
        case 'D1':
            du = -Math.PI/2
            dv = Math.PI/2
            v0 = 0
            break
        case 'D2':
            du = -Math.PI/2
            dv = -Math.PI/2
            v0 = Math.PI
            break
        default:
            throw `Invalid grid section: ${section}`
    }

    return (u, v, vector) => {
        u = du * u
        v = dv * v + v0
        let x = a * Math.sin(v) * Math.cos(u)
        let y = c * Math.cos(v)
        let z = a * Math.sin(v) * Math.sin(u)
        vector.fromArray([x, y, z])
    }
}





