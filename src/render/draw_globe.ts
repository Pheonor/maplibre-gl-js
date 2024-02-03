import {StencilMode} from '../gl/stencil_mode';
import {DepthMode} from '../gl/depth_mode';
import {globeUniformValues} from './program/globe_program';
import type {Painter} from './painter';
import type {Tile} from '../source/tile';
import {CullFaceMode} from '../gl/cull_face_mode';
import {Terrain} from './terrain';
import {vec3} from 'gl-matrix';

/**
 * Draw the Globe
 * @param painter - the painter
 * @param globe - the globe
 * @param tiles   - Tile list
 */
function drawGlobe(painter: Painter, terrain: Terrain, tiles: Array<Tile>) {
    const context = painter.context;
    const gl = context.gl;
    const colorMode = painter.colorModeForRenderPass();
    const depthMode = new DepthMode(gl.LEQUAL, DepthMode.ReadWrite, painter.depthRangeFor3D);
    const program = painter.useProgram('globe');
    const mesh = terrain.getTerrainMesh();

    context.bindFramebuffer.set(null);
    context.viewport.set([0, 0, painter.width, painter.height]);

    for (const tile of tiles) {
        const texture = painter.renderToTexture.getTexture(tile);
        context.activeTexture.set(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);

        const globeMatrix = painter.transform.getGlobeMatrix();
        const tileMatrix = tile.tileID.getTileMatrix();
        const tileCoords = vec3.fromValues(Math.pow(2, tile.tileID.canonical.z), tile.tileID.canonical.x, tile.tileID.canonical.y);

        const uniformValues = globeUniformValues(painter.transform.projMatrix, tileMatrix, globeMatrix, tileCoords);
        program.draw(context, gl.TRIANGLES, depthMode, StencilMode.disabled, colorMode, CullFaceMode.backCCW, uniformValues, null, 'globe', mesh.vertexBuffer, mesh.indexBuffer, mesh.segments);
    }
}

export {
    drawGlobe
};
