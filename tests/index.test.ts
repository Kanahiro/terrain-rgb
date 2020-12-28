import { TerrainRGB } from '../src/index';
import { GsiTerrainRGB } from '../src/gsiterrainrgb';

const url = 'https://wasac.github.io/rw-terrain/tiles/{z}/{x}/{y}.png';
const trgb = new TerrainRGB(url, 512);

describe('success case', (): void => {
    test('30.48535, -2.03089 ', async () => {
        const elevation = await trgb.getElevation([30.48535, -2.03089], 15);
        expect(elevation).toEqual(1347);
    });

    test('30.30905, -2.01723', async () => {
        const elevation = await trgb.getElevation([30.30905, -2.01723], 15);
        expect(elevation).toEqual(1586);
    });

    test('29.46279, -2.12171', async () => {
        const elevation = await trgb.getElevation([29.46279, -2.12171], 15);
        expect(elevation).toEqual(1997);
    });

    test('29.76760, -2.68676', async () => {
        const elevation = await trgb.getElevation([29.7676, -2.68676], 15);
        expect(elevation).toEqual(1710);
    });

    test('30.78230, -2.25379', async () => {
        const elevation = await trgb.getElevation([30.7823, -2.25379], 15);
        expect(elevation).toEqual(1392);
    });
});

const gsiUrl = 'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png';
const gsiTerrainRgb = new GsiTerrainRGB(gsiUrl);

describe('GSI success case', (): void => {
    test('139.80804,35.65240 ', async () => {
        const elevation = await gsiTerrainRgb.getElevation(
            [139.80804, 35.6524],
            14,
        );
        expect(elevation).toEqual(2);
    });
    test('Mt.Fuji ', async () => {
        const elevation = await gsiTerrainRgb.getElevation(
            [138.729675, 35.366481],
            14,
        );
        expect(elevation).toEqual(3751.29);
    });
    test('higher than [128, 0, 1] ', async () => {
        const elevation = await gsiTerrainRgb.getElevation(
            [141.02465, 37.526807],
            14,
        );
        expect(elevation).toEqual(-1.63);
    });
    test('No-data [128, 0, 0] == 0.00m', async () => {
        const elevation = await gsiTerrainRgb.getElevation(
            [139.815445, 35.637737],
            14,
        );
        expect(elevation).toEqual(0);
    });
});
