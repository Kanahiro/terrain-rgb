import * as tilebelt from './tilebelt';
import axios from 'axios';
import PNG from 'png-ts';

const gsiTerrainDecoder = function (r: number, g: number, b: number): number {
    // GSI-TERRAIN-SPECIFICATION
    // https://maps.gsi.go.jp/development/demtile.html
    // r,g,b = [128, 0, 0] means no-data-value in GSI-Terrain-Spec
    // then set minimum height
    let gsiOffset = 0;
    if (r === 128 && g === 0 && b === 0) {
        r = 0;
    } else if (r >= 128) {
        gsiOffset = -16777216; // 2^24
    }

    // RGB-to-height conversion
    const rScaler = 65536;
    const gScaler = 256;
    const bScaler = 1;

    return (r * rScaler + g * gScaler + b * bScaler + gsiOffset) / 100;
};

class GsiTerrainRGB {
    private url: string;
    private tileSize: number;

    /**
     * Constructor
     * @param url URL for terrain RGB raster tilesets
     */
    constructor(url: string) {
        this.url = url;
        this.tileSize = 256;
    }

    async getElevation(
        lnglat: [number, number],
        z: number,
    ): Promise<number | Error> {
        const tile = tilebelt.pointToTile(
            lnglat[0],
            lnglat[1],
            Math.round(Math.max(5, Math.min(z, 15))),
        );

        const url: string = this.url
            .replace('{x}', tile[0].toString())
            .replace('{y}', tile[1].toString())
            .replace('{z}', tile[2].toString());
        console.log(url);
        return await axios
            .get(url, {
                responseType: 'arraybuffer',
            })
            .then((res) => {
                const pngImage = PNG.load(Buffer.from(res.data, 'binary'));
                const pixels = pngImage.decodePixels();
                const bbox = tilebelt.tileToBBOX(tile);
                const pixPos = this.getPixelPosition(lnglat, bbox);
                const pos = (pixPos[0] + pixPos[1] * this.tileSize) * 3;
                const rgba = [pixels[pos], pixels[pos + 1], pixels[pos + 2]];
                return gsiTerrainDecoder(rgba[0], rgba[1], rgba[2]);
            })
            .catch((err) => err);
    }

    getPixelPosition(
        lnglat: [number, number],
        bbox: number[],
    ): [number, number] {
        const pixelWidth = this.tileSize;
        const pixelHeight = this.tileSize;
        const bboxWidth = bbox[2] - bbox[0];
        const bboxHeight = bbox[3] - bbox[1];

        const widthPct = (lnglat[0] - bbox[0]) / bboxWidth;
        const heightPct = (lnglat[1] - bbox[1]) / bboxHeight;
        const xPx = Math.floor(pixelWidth * widthPct);
        const yPx = Math.floor(pixelHeight * (1 - heightPct));
        return [xPx, yPx];
    }
}

export { GsiTerrainRGB };
