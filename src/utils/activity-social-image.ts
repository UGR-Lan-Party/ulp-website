import QRCode from 'qrcode';
import sharp, { type OverlayOptions } from 'sharp';
import { resolve } from 'node:path';
import {
  CompetitionsCards,
  type CompetitionData,
} from '../data/competitions-data';
import { getActivitySocial } from './activity-social';
export const socialFormats = {
  x: { label: 'Post de X', width: 1200, height: 630 },
  historia: { label: 'Historia de Instagram', width: 1080, height: 1920 },
  publicacion: { label: 'Publicación de Instagram', width: 1080, height: 1350 },
} as const;
export type SocialFormat = keyof typeof socialFormats;
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!,
  );
function publicAsset(source: string) {
  const asset = resolve('public', '.' + source);
  if (
    !asset.startsWith(resolve('public') + '/') &&
    !asset.startsWith(resolve('public') + '\\')
  )
    throw Error('Invalid artwork path');
  return asset;
}
const smoothstep = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
async function softenArtwork(
  input: Buffer,
  width: number,
  height: number,
  softenSides: boolean,
) {
  const [original, blurred] = await Promise.all([
    sharp(input).ensureAlpha().raw().toBuffer(),
    sharp(input).blur(9).ensureAlpha().raw().toBuffer(),
  ]);
  const output = Buffer.alloc(original.length);
  for (let y = 0; y < height; y++) {
    const blend = smoothstep((y / height - 0.65) / 0.35);
    const fade = 1 - smoothstep((y / height - 0.78) / 0.22);
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const a = (original[offset + 3] / 255) * (1 - blend);
      const b = (blurred[offset + 3] / 255) * blend;
      const alpha = a + b;
      for (let channel = 0; channel < 3; channel++)
        output[offset + channel] = alpha
          ? Math.round(
              (original[offset + channel] * a + blurred[offset + channel] * b) /
                alpha,
            )
          : 0;
      const sides = softenSides
        ? smoothstep(x / width / 0.09) * smoothstep((1 - x / width) / 0.09)
        : 1;
      output[offset + 3] = Math.round(alpha * fade * sides * 255);
    }
  }
  return sharp(output, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}
export async function renderActivitySocial(
  activity: CompetitionData,
  format: SocialFormat = 'x',
) {
  const social = getActivitySocial(activity.id, activity.name);
  const card = CompetitionsCards.find((card) => card.id === activity.id);
  const portrait = format !== 'x';
  const { width, height } = socialFormats[format];
  const story = format === 'historia';
  const baseSvg = portrait
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><radialGradient id="g"><stop stop-color="#007983"/><stop offset="1" stop-color="#004465"/></radialGradient></defs><rect width="${width}" height="${height}" fill="#f5f0e6"/><rect x="0" y="${story ? 570 : 430}" width="1080" height="${story ? 900 : 570}" fill="url(#g)"/><circle cx="540" cy="${story ? 1010 : 710}" r="${story ? 340 : 240}" fill="none" stroke="#f5f0e6" stroke-opacity=".2"/><rect x="30" y="${story ? 600 : 460}" width="1020" height="${story ? 840 : 510}" rx="26" fill="none" stroke="#f5f0e6" stroke-opacity=".2"/><path d="M64 ${story ? 1834 : 1294}H1016" stroke="#004465" stroke-opacity=".2"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><radialGradient id="g"><stop stop-color="#007983"/><stop offset="1" stop-color="#004465"/></radialGradient></defs><rect width="1200" height="630" fill="#f5f0e6"/><rect x="770" width="430" height="630" fill="url(#g)"/><path d="M40 110H726M40 598H726" stroke="#004465" stroke-opacity=".2"/><rect x="800" y="30" width="370" height="570" rx="24" fill="none" stroke="#f5f0e6" stroke-opacity=".25"/><circle cx="985" cy="300" r="160" fill="none" stroke="#f5f0e6" stroke-opacity=".15"/></svg>`;
  const mosaic = `<pattern id="granada-mosaic" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M32 0 41.4 9.4H54.6V22.6L64 32 54.6 41.4V54.6H41.4L32 64 22.6 54.6H9.4V41.4L0 32 9.4 22.6V9.4H22.6Z" fill="#006471"/></pattern>`;
  const base = Buffer.from(
    baseSvg
      .replace('</defs>', mosaic + '</defs>')
      .replace(
        '</svg>',
        `<rect width="${width}" height="${height}" fill="url(#granada-mosaic)" opacity=".035"/></svg>`,
      ),
  );
  const backgrounds: OverlayOptions[] = [];
  if (card?.card) {
    const panel = portrait
      ? {
          left: 0,
          top: story ? 570 : 430,
          width: 1080,
          height: story ? 900 : 570,
        }
      : { left: 770, top: 0, width: 430, height: 630 };
    const texture = await sharp(publicAsset(card.card))
      .resize(panel.width, panel.height, { fit: 'cover' })
      .modulate({ saturation: 0.65 })
      .blur(3)
      .ensureAlpha()
      .png()
      .toBuffer();
    const textureMask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${panel.width}" height="${panel.height}"><defs><linearGradient id="opacity" x1="0" y1="0" x2="0" y2="1"><stop stop-color="white" stop-opacity=".08"/><stop offset=".4" stop-color="white" stop-opacity=".24"/><stop offset="1" stop-color="white" stop-opacity=".06"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#opacity)"/></svg>`,
    );
    backgrounds.push({
      input: await sharp(texture)
        .composite([{ input: textureMask, blend: 'dest-in' }])
        .png()
        .toBuffer(),
      left: panel.left,
      top: panel.top,
    });
  }
  const fontfile = resolve('scripts/assets/Inter.ttf');
  const text = async (
    value: string,
    size: number,
    width: number,
    color = '#004465',
    height?: number,
    title = false,
  ) =>
    sharp({
      text: {
        text: `<span foreground="${color}"${title ? ' weight="bold" line_height="0.95"' : ''}>${escape(value)}</span>`,
        font: `Inter ${title ? 'Bold' : 'Semi-Bold'} ${size}`,
        fontfile,
        rgba: true,
        width,
        ...(height ? { height } : {}),
        wrap: 'word',
      },
    })
      .png()
      .toBuffer();
  const overlays: OverlayOptions[] = portrait
    ? [
        {
          input: await text('UGR LAN PARTY', 30, 950),
          left: 64,
          top: story ? 160 : 54,
        },
        {
          input: await text(
            `${activity.tag === 'competicion' ? 'COMPETICIÓN' : activity.tag === 'reto' ? 'RETO' : 'ACTIVIDAD'} / ${social.year}`,
            22,
            950,
          ),
          left: 64,
          top: story ? 235 : 115,
        },
        {
          input: await text(
            activity.name,
            82,
            950,
            '#004465',
            story ? 235 : 220,
            true,
          ),
          left: 60,
          top: story ? 302 : 178,
        },
        {
          input: await text(social.date, 32, 730),
          left: 64,
          top: story ? 1530 : 1054,
        },
        {
          input: await text(
            social.time
              ? `Desde las ${social.time} · ${social.location}`
              : social.location,
            27,
            730,
            '#004465',
            75,
          ),
          left: 64,
          top: story ? 1595 : 1113,
        },
        {
          input: await text('ulp.ugr.es', 24, 950),
          left: 64,
          top: story ? 1851 : 1311,
        },
      ]
    : [
        { input: await text('UGR LAN PARTY', 26, 600), left: 46, top: 48 },
        {
          input: await text(
            `${activity.tag === 'competicion' ? 'COMPETICIÓN' : activity.tag === 'reto' ? 'RETO' : 'ACTIVIDAD'} / ${social.year}`,
            18,
            650,
          ),
          left: 46,
          top: 140,
        },
        {
          input: await text(activity.name, 72, 660, '#004465', 190, true),
          left: 42,
          top: 194,
        },
        { input: await text(social.date, 26, 510), left: 46, top: 438 },
        {
          input: await text(
            social.time
              ? `Desde las ${social.time} · ${social.location}`
              : social.location,
            20,
            510,
          ),
          left: 46,
          top: 482,
        },
        { input: await text('ulp.ugr.es', 16, 500), left: 46, top: 604 },
      ];
  const italic = await sharp({
    text: {
      text: '<span foreground="#006471">Nos vemos en la ETSIIT</span>',
      font: `EB Garamond Italic ${portrait ? 28 : 24}`,
      fontfile: resolve('scripts/assets/EBGaramond-Italic.ttf'),
      rgba: true,
      width: portrait ? 700 : 500,
    },
  })
    .png()
    .toBuffer();
  overlays.push({
    input: italic,
    left: portrait ? 64 : 46,
    top: portrait ? (story ? 1775 : 1220) : 553,
  });
  overlays.push({
    input: await text('CUÁNDO / DÓNDE', portrait ? 15 : 12, 500),
    left: portrait ? 64 : 46,
    top: portrait ? (story ? 1495 : 1020) : 412,
  });
  const qrSize = portrait ? 154 : 128;
  const qr = await QRCode.toBuffer(
    `https://ulp.ugr.es/actividades/${encodeURIComponent(activity.id)}/`,
    {
      type: 'png',
      width: qrSize,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: { dark: '#004465', light: '#f5f0e6' },
    },
  );
  overlays.push({
    input: qr,
    left: portrait ? 862 : 598,
    top: portrait ? (story ? 1680 : 1140) : 470,
  });
  if (card?.character) {
    const artworkWidth = portrait ? 860 : 370;
    const artworkHeight = portrait ? (story ? 740 : 500) : 430;
    const artwork = await sharp(publicAsset(card.character))
      .resize(artworkWidth, artworkHeight, {
        fit: 'contain',
        background: '#00000000',
      })
      .png()
      .toBuffer();
    overlays.push({
      input: await softenArtwork(
        artwork,
        artworkWidth,
        artworkHeight,
        activity.id === 'futbolin',
      ),
      left: portrait ? 110 : 800,
      top: portrait ? (story ? 650 : 465) : 100,
    });
  }
  return sharp(base)
    .composite([...backgrounds, ...overlays])
    .png()
    .toBuffer();
}
