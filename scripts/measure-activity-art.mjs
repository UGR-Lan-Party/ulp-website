import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
const program = JSON.parse(
  await readFile('src/data/program-2026.json', 'utf8'),
);
const layouts = {};
const round = (value) => Math.round(value * 1000) / 1000;
for (const game of program.games) {
  const { data, info } = await sharp(`public${game.card.character}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rows = new Uint32Array(info.height);
  const columns = new Uint32Array(info.width);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] < 32) continue;
      rows[y]++;
      columns[x]++;
    }
  }
  const minColumn = Math.max(2, Math.floor(info.height * 0.003));
  const minRow = Math.max(2, Math.floor(info.width * 0.003));
  const left = columns.findIndex((count) => count >= minColumn);
  const right = columns.findLastIndex((count) => count >= minColumn);
  const top = rows.findIndex((count) => count >= minRow);
  const bottom = rows.findLastIndex((count) => count >= minRow);
  if (left < 0 || top < 0) throw new Error(`Ilustración vacía: ${game.id}`);
  const width = right - left + 1;
  const height = bottom - top + 1;
  const aspect = width / height;
  layouts[game.id] = {
    aspect: round(aspect),
    frameWidth: round(Math.min(80, (76 / 1.35) * aspect)),
    imageWidth: round((info.width / width) * 100),
    imageHeight: round((info.height / height) * 100),
    left: round((-left / width) * 100),
    top: round((-top / height) * 100),
  };
}
await writeFile(
  'src/data/activity-art-layout.json',
  JSON.stringify(layouts, null, 2) + '\n',
);
console.log(
  `Medido el contenido visible de ${Object.keys(layouts).length} ilustraciones.`,
);
