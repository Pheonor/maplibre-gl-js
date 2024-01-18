import {LngLat} from '../lng_lat';
import {latFromMercatorY, lngFromMercatorX, mercatorXfromLng, mercatorYfromLat} from '../mercator_coordinate';
import {ProjectedPoint, Projection} from '../projection';

/**
 * A `Mercator` projection represents the default 2D projection system.
 *
 * @group Projection
 */
export class Mercator extends Projection {
    constructor() {
        super('mercator');
    }

    isGlobe(_zoom: number): boolean {
        return false;
    }

    project(lng: number, lat: number, _zoom: number): ProjectedPoint {
        const x = mercatorXfromLng(lng);
        const y = mercatorYfromLat(lat);
        return {x, y, z: 0};
    }
    unproject(x: number, y: number, _zoom: number): LngLat {
        const lng = lngFromMercatorX(x);
        const lat = latFromMercatorY(y);
        return new LngLat(lng, lat);
    }
}
