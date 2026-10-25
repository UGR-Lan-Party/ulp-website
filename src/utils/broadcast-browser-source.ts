import interLicense from '@fontsource-variable/inter/LICENSE?raw';
import renderer from './broadcast-design.js?raw';
import {
  studioSettings,
  studioSize,
  studioScenes,
} from './broadcast-design.js';
import { overlayText, overlayScore } from './overlay-customizer.js';

export function browserScene(
  input: ReturnType<typeof studioSettings>,
  scene: string,
  assets: { logo: string; font: string },
  motion = true,
) {
  const settings = studioSettings(input),
    size = studioSize(settings);
  const configuration = JSON.stringify({
    settings,
    scene: studioScenes.includes(scene) ? scene : 'live',
    assets,
    motion,
  }).replace(
    /[<>&\u2028\u2029]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
  const engine = renderer
    .replace(/^import[\s\S]*?;\s*/, '')
    .replace(/^export /gm, '');
  const license = interLicense
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'"><title>ULP · Escena de emisión</title><style>@font-face{font-family:'Inter Variable';src:url('${assets.font}') format('woff2');font-weight:100 900}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}canvas{display:block;width:100%;height:100%;object-fit:contain}</style></head><body><template id="inter-font-license">${license}</template><canvas width="${size.w}" height="${size.h}" role="img" aria-label="Escena ULP"></canvas><script>
const overlayText = (${overlayText.toString()}); const overlayScore = (${overlayScore.toString()});
${engine}
const configuration = ${configuration};
const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d'), mark = new Image();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let started=0, timeout, ready=false;
function paint(){
  if(!ready)return;
  const elapsed=performance.now()-started, animated=configuration.motion&&!reduced.matches;
  canvas.dataset.motion=animated?'on':'off';
  const remaining=Math.max(0,configuration.settings.countdownMinutes*60000-elapsed);
  drawStudio(ctx,configuration.settings,configuration.scene,mark,{time:animated?elapsed:0,age:animated?elapsed:undefined,remaining});
  if(configuration.scene==='countdown') canvas.setAttribute('aria-label',countdownText(remaining));
  clearTimeout(timeout);
  if(!document.hidden&&(animated||(configuration.scene==='countdown'&&remaining>0))) timeout=setTimeout(paint,animated?50:1000);
}
mark.onload=async()=>{await document.fonts.load('650 32px "Inter Variable"');await document.fonts.ready;started=performance.now();ready=true;canvas.dataset.ready='true';paint();};
mark.src=configuration.assets.logo;
document.addEventListener('visibilitychange',()=>{clearTimeout(timeout);if(!document.hidden)paint();});
reduced.addEventListener('change',paint);
addEventListener('pagehide',()=>clearTimeout(timeout));
<\/script></body></html>`;
}
