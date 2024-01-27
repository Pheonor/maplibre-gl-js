import {Painter} from './painter';
import {Tile} from '../source/tile';
import {drawGlobe} from './draw_globe';
import {Style} from '../style/style';
import {Texture} from './texture';
import {Globe} from './globe';
import {LAYERS, RenderToTexture} from './render_to_texture';

/**
 * @internal
 * A helper class to help define what should be rendered to texture and how
 */
export class RenderToTextureGlobe extends RenderToTexture {
    globe: Globe;

    constructor(painter: Painter, globe: Globe) {
        super(painter, globe.sourceCache.tileSize * globe.qualityFactor);
        this.globe = globe;
    }

    destruct() {
    }

    draw(painter: Painter, tiles: Tile[]) {
        drawGlobe(painter, this.globe, tiles);
    }

    prepareForRender(style: Style, zoom: number) {
        this._stacks = [];
        this._prevType = null;
        this._rttTiles = [];
        this._renderableTiles = this.globe.sourceCache.getRenderableTiles();
        this._renderableLayerIds = style._order.filter(id => !style._layers[id].isHidden(zoom));

        this._coordsDescendingInv = {};
        for (const id in style.sourceCaches) {
            this._coordsDescendingInv[id] = {};
            const tileIDs = style.sourceCaches[id].getVisibleCoordinates();
            for (const tileID of tileIDs) {
                const keys = this.globe.sourceCache.getTerrainCoords(tileID);
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
