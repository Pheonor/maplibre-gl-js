import {LngLat} from './lng_lat';

/**
 * A `ProjectedPoint` represents a projected point.
 * It allows to store the 3D coordinates of any point.
 */
export class ProjectedPoint {
    x: number;
    y: number;
    z: number;
}

/**
 * A `Projection` abstract class to represent a projection coordinate system.
 * It could represent a 3D globe projection or any 2D projection.
 * It allows to project and unproject coordinate to and from the coordinate system.
 *
 * @group Geography and Geometry
 */
export abstract class Projection {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    abstract isGlobe(zoom: number): boolean;
    getFactor(_zoom: number): number { return 0.0; }
    abstract project(lng: number, lat: number, zoom: number) : ProjectedPoint;
    abstract unproject(x: number, y: number, zoom: number) : LngLat;
}
