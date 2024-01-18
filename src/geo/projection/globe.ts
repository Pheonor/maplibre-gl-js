import {LngLat} from '../lng_lat';
import {latFromMercatorY, lngFromMercatorX, mercatorXfromLng, mercatorYfromLat} from '../mercator_coordinate';
import {ProjectedPoint, Projection} from '../projection';

/**
 * A `Globe` projection represents a 3D projection system on an ellipsoid.
 * To simplify usages in MapLibre GL JS, the globe use `mercator`coordinate as well
 * as the default coordinate system.
 *
 * @group Projection
 */
export class Globe extends Projection {
    constructor() {
        super('globe');
    }

    isGlobe(_zoom: number): boolean {
        return true;
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
