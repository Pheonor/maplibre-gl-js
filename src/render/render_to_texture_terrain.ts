import {Painter} from './painter';
import {Tile} from '../source/tile';
import {drawTerrain} from './draw_terrain';
import {Style} from '../style/style';
import {Terrain} from './terrain';
import {Texture} from './texture';
import {LAYERS, RenderToTexture} from './render_to_texture';

/**
 * @internal
 * A helper class to help define what should be rendered to texture and how
 */
export class RenderToTextureTerrain extends RenderToTexture {
    terrain: Terrain;

    constructor(painter: Painter, terrain: Terrain) {
        super(painter, terrain.sourceCache.tileSize * terrain.qualityFactor);
        this.terrain = terrain;
    }

    destruct() {
    }

    draw(painter: Painter, tiles: Tile[]) {
        drawTerrain(painter, this.terrain, tiles);
    }

    prepareForRender(style: Style, zoom: number) {
        this._stacks = [];
        this._prevType = null;
        this._rttTiles = [];
        this._renderableTiles = this.terrain.sourceCache.getRenderableTiles();
        this._renderableLayerIds = style._order.filter(id => !style._layers[id].isHidden(zoom));

        this._coordsDescendingInv = {};
        for (const id in style.sourceCaches) {
            this._coordsDescendingInv[id] = {};
            const tileIDs = style.sourceCaches[id].getVisibleCoordinates();
            for (const tileID of tileIDs) {
                const keys = this.terrain.sourceCache.getTerrainCoords(tileID);
                for (const key in keys) {
                    if (!this._coordsDescendingInv[id][key]) this._coordsDescendingInv[id][key] = [];
                    this._coordsDescendingInv[id][key].push(keys[key]);
                }
            }
        }

        this._coordsDescendingInvStr = {};
        for (const id of style._order) {
            const layer = style._layers[id], source = layer.source;
            if (LAYERS[layer.type]) {
                if (!this._coordsDescendingInvStr[source]) {
                    this._coordsDescendingInvStr[source] = {};
                    for (const key in this._coordsDescendingInv[source])
                        this._coordsDescendingInvStr[source][key] = this._coordsDescendingInv[source][key].map(c => c.key).sort().join();
                }
            }
        }

        // check tiles to render
        for (const tile of this._renderableTiles) {
            for (const source in this._coordsDescendingInvStr) {
                // rerender if there are more coords to render than in the last rendering
                const coords = this._coordsDescendingInvStr[source][tile.tileID.key];
                if (coords && coords !== tile.rttCoords[source]) tile.rtt = [];
            }
        }
    }

}
