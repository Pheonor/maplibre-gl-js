import {Pos3dArray, TriangleIndexArray} from '../data/array_types.g';
import pos3dAttributes from '../data/pos3d_attributes';
import {SegmentVector} from '../data/segment';
import {VertexBuffer} from '../gl/vertex_buffer';
import {IndexBuffer} from '../gl/index_buffer';
import {Painter} from './painter';
import {EXTENT} from '../data/extent';
import {Texture} from './texture';
import {mat4} from 'gl-matrix';
import {OverscaledTileID} from '../source/tile_id';
import {TerrainData} from './terrain';
import {RGBAImage} from '../util/image';
import {TerrainSourceCache} from '../source/terrain_source_cache';

/**
 * @internal
 * A globe mesh object
 */
export type GlobeMesh = {
    indexBuffer: IndexBuffer;
    vertexBuffer: VertexBuffer;
    segments: SegmentVector;
}

export class Globe {
    /**
     * The style this globe corresponds to
     */
    painter: Painter;
    /**
     * the sourcecache this globe is based on
     */
    sourceCache: TerrainSourceCache;
    /**
     * define the meshSize per tile.
     */
    meshSize: number;
    /**
     * to not see pixels in the render-to-texture tiles it is good to render them bigger
     * this number is the multiplicator (must be a power of 2) for the current tileSize.
     * So to get good results with not too much memory footprint a value of 2 should be fine.
     */
    qualityFactor: number;
    /**
     * holds the framebuffer object in size of the screen to render the coords & depth into a texture.
     */
    _emptyDepthTexture: Texture;
    /**
     * GL Objects for the globe-mesh
     * The mesh is a regular mesh, which has the advantage that it can be reused for all tiles.
     */
    _mesh: GlobeMesh;
    /**
     * variables for an empty dem texture, which is used while the raster-dem tile is loading.
     */
    _emptyDemUnpack: number[];
    _emptyDemTexture: Texture;
    _emptyDemMatrix: mat4;

    constructor(painter: Painter) {
        this.sourceCache = new TerrainSourceCache();
        this.painter = painter;
        this.qualityFactor = 2;
        this.meshSize = 128;
    }

    /**
     * create a regular mesh which will be used by all terrain-tiles
     * @returns the created regular mesh
     */
    getTerrainMesh(): GlobeMesh {
        if (this._mesh) return this._mesh;
        const context = this.painter.context;
        const vertexArray = new Pos3dArray();
        const indexArray = new TriangleIndexArray();
        const meshSize = this.meshSize;
        const delta = EXTENT / meshSize;
        const meshSize2 = meshSize * meshSize;
        for (let y = 0; y <= meshSize; y++) for (let x = 0; x <= meshSize; x++)
            vertexArray.emplaceBack(x * delta, y * delta, 0);
        for (let y = 0; y < meshSize2; y += meshSize + 1) for (let x = 0; x < meshSize; x++) {
            indexArray.emplaceBack(x + y, meshSize + x + y + 1, meshSize + x + y + 2);
            indexArray.emplaceBack(x + y, meshSize + x + y + 2, x + y + 1);
        }
        // add an extra frame around the mesh to avoid stiching on tile boundaries with different zoomlevels
        // first code-block is for top-bottom frame and second for left-right frame
        const offsetTop = vertexArray.length, offsetBottom = offsetTop + (meshSize + 1) * 2;
        for (const y of [0, 1]) for (let x = 0; x <= meshSize; x++) for (const z of [0, 1])
            vertexArray.emplaceBack(x * delta, y * EXTENT, z);
        for (let x = 0; x < meshSize * 2; x += 2) {
            indexArray.emplaceBack(offsetBottom + x, offsetBottom + x + 1, offsetBottom + x + 3);
            indexArray.emplaceBack(offsetBottom + x, offsetBottom + x + 3, offsetBottom + x + 2);
            indexArray.emplaceBack(offsetTop + x, offsetTop + x + 3, offsetTop + x + 1);
            indexArray.emplaceBack(offsetTop + x, offsetTop + x + 2, offsetTop + x + 3);
        }
        const offsetLeft = vertexArray.length, offsetRight = offsetLeft + (meshSize + 1) * 2;
        for (const x of [0, 1]) for (let y = 0; y <= meshSize; y++) for (const z of [0, 1])
            vertexArray.emplaceBack(x * EXTENT, y * delta, z);
        for (let y = 0; y < meshSize * 2; y += 2) {
            indexArray.emplaceBack(offsetLeft + y, offsetLeft + y + 1, offsetLeft + y + 3);
            indexArray.emplaceBack(offsetLeft + y, offsetLeft + y + 3, offsetLeft + y + 2);
            indexArray.emplaceBack(offsetRight + y, offsetRight + y + 3, offsetRight + y + 1);
            indexArray.emplaceBack(offsetRight + y, offsetRight + y + 2, offsetRight + y + 3);
        }
        this._mesh = {
            indexBuffer: context.createIndexBuffer(indexArray),
            vertexBuffer: context.createVertexBuffer(vertexArray, pos3dAttributes.members),
            segments: SegmentVector.simpleSegment(0, 0, vertexArray.length, indexArray.length)
        };
        return this._mesh;
    }

    /**
     * returns a Terrain Object for a tile. Unless the tile corresponds to data (e.g. tile is loading), return a flat dem object
     * @param tileID - the tile to get the terrain for
     * @returns the terrain data to use in the program
     */
    getTerrainData(_tileID: OverscaledTileID): TerrainData {
        // create empty DEM Objects, which will used while raster-dem tiles are loading.
        // creates an empty depth-buffer texture which is needed, during the initialization process of the 3d mesh..
        if (!this._emptyDemTexture) {
            const context = this.painter.context;
            const image = new RGBAImage({width: 1, height: 1}, new Uint8Array(1 * 4));
            this._emptyDepthTexture = new Texture(context, image, context.gl.RGBA, {premultiply: false});
            this._emptyDemUnpack = [0, 0, 0, 0];
            this._emptyDemTexture = new Texture(context, new RGBAImage({width: 1, height: 1}), context.gl.RGBA, {premultiply: false});
            this._emptyDemTexture.bind(context.gl.NEAREST, context.gl.CLAMP_TO_EDGE);
            this._emptyDemMatrix = mat4.identity([] as any);
        }
        // return uniform values & textures
        return {
            'u_depth': 2,
            'u_terrain': 3,
            'u_terrain_dim': 1,
            'u_terrain_matrix': this._emptyDemMatrix,
            'u_terrain_unpack': this._emptyDemUnpack,
            'u_terrain_exaggeration': 1,
            texture: this._emptyDemTexture.texture,
            depthTexture: this._emptyDepthTexture.texture,
            tile: null
        };
    }
}
