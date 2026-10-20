import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { miniaturaFoto } from './miniatura-foto.util.js';

describe('miniaturaFoto', () => {
  it('reduce la foto a un JPG de 160×160 y la reutiliza', async () => {
    const ruta = join(mkdtempSync(join(tmpdir(), 'miniatura-')), 'foto.png');
    writeFileSync(ruta, await sharp({ create: { width: 1200, height: 1600, channels: 3, background: '#808080' } }).png().toBuffer());

    const jpg = await miniaturaFoto(ruta);
    const { width, height, format } = await sharp(jpg).metadata();

    expect({ width, height, format }).toEqual({ width: 160, height: 160, format: 'jpeg' });
    expect(await miniaturaFoto(ruta)).toBe(jpg); // la segunda vez, la misma de memoria
  });
});
