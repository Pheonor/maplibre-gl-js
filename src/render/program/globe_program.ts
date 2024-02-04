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
    'u_ele_delta': Uniform1f;
    'u_tile_matrix': UniformMatrix4f;
    'u_globe_matrix': UniformMatrix4f;
    'u_tile_coords': Uniform3f;
};

export type GlobeDepthUniformsType = {
    'u_matrix': UniformMatrix4f;
    'u_tile_matrix': UniformMatrix4f;
    'u_globe_matrix': UniformMatrix4f;
    'u_tile_coords': Uniform3f;
    'u_ele_delta': Uniform1f;
};

export type GlobeCoordsUniformsType = {
    'u_matrix': UniformMatrix4f;
    'u_tile_matrix': UniformMatrix4f;
    'u_globe_matrix': UniformMatrix4f;
    'u_tile_coords': Uniform3f;
    'u_texture': Uniform1i;
    'u_terrain_coords_id': Uniform1f;
    'u_ele_delta': Uniform1f;
};

const globeUniforms = (context: Context, locations: UniformLocations): GlobeUniformsType => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_texture': new Uniform1i(context, locations.u_texture),
    'u_ele_delta': new Uniform1f(context, locations.u_ele_delta),
    'u_tile_matrix': new UniformMatrix4f(context, locations.u_tile_matrix),
    'u_globe_matrix': new UniformMatrix4f(context, locations.u_globe_matrix),
    'u_tile_coords': new Uniform3f(context, locations.u_tile_coords)
});

const globeDepthUniforms = (context: Context, locations: UniformLocations): GlobeDepthUniformsType => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_tile_matrix': new UniformMatrix4f(context, locations.u_tile_matrix),
    'u_globe_matrix': new UniformMatrix4f(context, locations.u_globe_matrix),
    'u_tile_coords': new Uniform3f(context, locations.u_tile_coords),
    'u_ele_delta': new Uniform1f(context, locations.u_ele_delta)
});

const globeCoordsUniforms = (context: Context, locations: UniformLocations): GlobeCoordsUniformsType => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_tile_matrix': new UniformMatrix4f(context, locations.u_tile_matrix),
    'u_globe_matrix': new UniformMatrix4f(context, locations.u_globe_matrix),
    'u_tile_coords': new Uniform3f(context, locations.u_tile_coords),
    'u_texture': new Uniform1i(context, locations.u_texture),
    'u_terrain_coords_id': new Uniform1f(context, locations.u_terrain_coords_id),
    'u_ele_delta': new Uniform1f(context, locations.u_ele_delta)
});

const globeUniformValues = (
    matrix: mat4,
    eleDelta: number,
    tileMatrix: mat4,
    globeMatrix: mat4,
    tileCoords: vec3
): UniformValues<GlobeUniformsType> => ({
    'u_matrix': matrix,
    'u_texture': 0,
    'u_ele_delta': eleDelta,
    'u_tile_matrix': tileMatrix,
    'u_globe_matrix': globeMatrix,
    'u_tile_coords': tileCoords,
});

const globeDepthUniformValues = (
    matrix: mat4,
    tileMatrix: mat4,
    globeMatrix: mat4,
    tileCoords: vec3,
    eleDelta: number
): UniformValues<GlobeDepthUniformsType> => ({
    'u_matrix': matrix,
    'u_tile_matrix': tileMatrix,
    'u_globe_matrix': globeMatrix,
    'u_tile_coords': tileCoords,
    'u_ele_delta': eleDelta
});

const globeCoordsUniformValues = (
    matrix: mat4,
    tileMatrix: mat4,
    globeMatrix: mat4,
    tileCoords: vec3,
    coordsId: number,
    eleDelta: number
): UniformValues<GlobeCoordsUniformsType> => ({
    'u_matrix': matrix,
    'u_tile_matrix': tileMatrix,
    'u_globe_matrix': globeMatrix,
    'u_tile_coords': tileCoords,
    'u_terrain_coords_id': coordsId / 255,
    'u_texture': 0,
    'u_ele_delta': eleDelta
});

export {globeUniforms, globeDepthUniforms, globeCoordsUniforms, globeUniformValues, globeDepthUniformValues, globeCoordsUniformValues};
