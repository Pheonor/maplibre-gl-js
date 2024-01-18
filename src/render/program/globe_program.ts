import {
    Uniform1i,
    Uniform1f,
    UniformMatrix4f,
    Uniform3f
} from '../uniform_binding';
import type {Context} from '../../gl/context';
import type {UniformValues, UniformLocations} from '../../render/uniform_binding';
import {mat4, vec3} from 'gl-matrix';

export type GlobeUniformsType = {
    'u_matrix': UniformMatrix4f;
    'u_texture': Uniform1i;
    'u_tile_matrix': UniformMatrix4f;
    'u_globe_matrix': UniformMatrix4f;
    'u_tile_coords': Uniform3f;
};

const globeUniforms = (context: Context, locations: UniformLocations): GlobeUniformsType => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_texture': new Uniform1i(context, locations.u_texture),
    'u_tile_matrix': new UniformMatrix4f(context, locations.u_tile_matrix),
    'u_globe_matrix': new UniformMatrix4f(context, locations.u_globe_matrix),
    'u_tile_coords': new Uniform3f(context, locations.u_tile_coords)
});

const globeUniformValues = (
    matrix: mat4,
    tileMatrix: mat4,
    globeMatrix: mat4,
    tileCoords: vec3
): UniformValues<GlobeUniformsType> => ({
    'u_matrix': matrix,
    'u_texture': 0,
    'u_tile_matrix': tileMatrix,
    'u_globe_matrix': globeMatrix,
    'u_tile_coords': tileCoords
});

export {globeUniforms, globeUniformValues};
