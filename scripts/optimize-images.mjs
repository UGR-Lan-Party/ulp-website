import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const directories = [
  'about',
  'activities',
  'blog',
  'competitions/medals',
  'competitions/cards',
  'competitions/logos',
  'competitions/characters',
  'participan',
];
const manifest = {};
await mkdir('public/assets/optimized', { recursive: true });
for (const directory of directories) {
  const base = `public/assets/${directory}`;
  const files = await readdir(base).catch(() => []);
  for (const file of files) {
    if (!/\.(png|jpe?g|webp|gif)$/i.test(file)) continue;
    const source = `${base}/${file}`;
    const image = sharp(source, { animated: false });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) continue;
    const limit = directory.includes('medals') ? 640 : 1280;
    const widths = [
      ...new Set(
        [360, 720, limit].map((width) =>
          Math.min(width, limit, metadata.width),
        ),
      ),
    ].sort((a, b) => a - b);
    const name = createHash('sha256')
      .update(`${directory}/${file}`)
      .digest('hex')
      .slice(0, 12);
    const sources = [];
    for (const width of widths) {
      const target = `/assets/optimized/${name}-${width}.webp`;
      await image
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(`public${target}`);
      sources.push({ src: target, width });
    }
    manifest[`/assets/${directory}/${file}`] = {
      width: metadata.width,
      height: metadata.height,
      sources,
    };
  }
}
await writeFile(
  'src/data/image-manifest.json',
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(
  `Generadas variantes de ${Object.keys(manifest).length} imágenes; originales conservados.`,
);
