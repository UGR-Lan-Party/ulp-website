// Trace of the user-annotated footprint; the two existing buildings use venue-campus-trace.json.
export const modernCampusSharedWall = {
  top: { x: 640.53, y: 185.34 },
  bottom: { x: 603.93, y: 248.33 },
};
export const modernCampusRotation =
  (Math.atan2(
    modernCampusSharedWall.top.x - modernCampusSharedWall.bottom.x,
    modernCampusSharedWall.bottom.y - modernCampusSharedWall.top.y,
  ) *
    180) /
  Math.PI;
export const modernCampusScale = 417 / Math.hypot(467, 295);
export const modernCampusConnection = modernCampusSharedWall.top;
export const modernCampusTransform = `translate(${modernCampusConnection.x} ${modernCampusConnection.y}) rotate(${modernCampusRotation}) scale(${modernCampusScale}) translate(-527 -188)`;
export const modernCampusPaths = {
  third:
    'M527 188H628V204H652V180H756V264H698V312H756V432H784V518H756V558H784V644H756V804H676V644H648V558H676V518H648V432H676V320H652V296H628V320H527Z',
  gallery:
    'M608 320H628V296H652V320H676V432H648V518H676V558H648V644H676V656H608Z',
  galleryEdge: 'M608 320V656H676',
  partitions:
    'M527 256H548V276H628M628 204V296M628 188V156H668V180M668 180V264H698M668 264V312H698V432H706V518H698V558H706V758M706 432H756M706 518H756M706 558H756M706 644H756M726 644V758M676 682H706M676 720H706M726 682H756M726 720H756M676 758H756M756 264V312M706 276H722V302H706ZM722 290H756M706 770H744V792H706Z',
  stairs:
    'M548 209H584V247H548ZM548 218H584M548 227H584M548 236H584M714 276V302M706 284H714M714 294H722M680 770H700V792H680ZM686 770V792M693 770V792',
  access: 'M652 656V756H666V792H676',
  gardenPath: 'M580 340H592V638H580Z',
};

export function getModernCampusPoint(x: number, y: number) {
  const angle = (modernCampusRotation * Math.PI) / 180;
  const dx = x - 527;
  const dy = y - 188;
  return {
    x:
      modernCampusConnection.x +
      modernCampusScale * (dx * Math.cos(angle) - dy * Math.sin(angle)),
    y:
      modernCampusConnection.y +
      modernCampusScale * (dx * Math.sin(angle) + dy * Math.cos(angle)),
  };
}

export const modernCampusLectureRooms = [
  { x: 678, y: 192, width: 68, height: 60, rows: 9 },
  { x: 708, y: 324, width: 38, height: 96, rows: 11 },
  { x: 716, y: 444, width: 58, height: 62, rows: 8 },
  { x: 716, y: 570, width: 58, height: 62, rows: 8 },
];

const sharedWallEnd =
  188 +
  Math.hypot(
    modernCampusSharedWall.bottom.x - modernCampusSharedWall.top.x,
    modernCampusSharedWall.bottom.y - modernCampusSharedWall.top.y,
  ) /
    modernCampusScale;
// The original aulario draws the shared facade; only the exposed end is outlined here.
export const modernCampusOutline =
  modernCampusPaths.third.slice(0, -1) + `V${sharedWallEnd}`;

const wingEast = { x: 450, y: 476.63 };
const wingWest = { x: 380.54, y: 481.68 };
const wingRoof = getModernCampusPoint(574, 694);
const wingStep = getModernCampusPoint(597, 694);
const wingTip = getModernCampusPoint(599, 799);
const wingVertices = [wingEast, wingRoof, wingStep, wingTip, wingWest];
const wingOutline = wingVertices
  .map(({ x, y }, i) => `${i ? 'L' : 'M'}${x} ${y}`)
  .join('');
const wingDividerEnd = {
  x: wingStep.x + (wingTip.x - wingStep.x) * 0.6,
  y: wingStep.y + (wingTip.y - wingStep.y) * 0.6,
};
export const modernPrincipalWing = {
  east: wingEast,
  west: wingWest,
  fill: wingOutline + 'Z',
  outline: wingOutline,
  partition: `M421.16 493.19L${wingDividerEnd.x} ${wingDividerEnd.y}`,
};

export const modernCampusColumns = [
  [570, 188],
  [628, 188],
  [628, 204],
  [628, 276],
  [628, 296],
  [628, 320],
  [652, 180],
  [668, 180],
  [712, 180],
  [756, 180],
  [756, 222],
  [756, 264],
  [668, 264],
  [668, 312],
  [698, 264],
  [698, 312],
  [756, 312],
  [756, 372],
  [698, 372],
  [698, 432],
  [756, 432],
  [784, 432],
  [784, 475],
  [784, 518],
  [706, 518],
  [756, 518],
  [698, 558],
  [756, 558],
  [784, 558],
  [784, 601],
  [784, 644],
  [756, 644],
  [706, 644],
  [726, 644],
  [756, 682],
  [756, 720],
  [756, 758],
  [756, 804],
  [676, 804],
  [676, 758],
  [676, 720],
  [676, 682],
  [676, 644],
  [648, 644],
  [648, 601],
  [648, 558],
  [676, 558],
  [676, 518],
  [648, 518],
  [648, 475],
  [648, 432],
  [676, 432],
  [676, 376],
  [676, 320],
  [652, 320],
  [608, 320],
  [608, 432],
  [608, 558],
  [608, 656],
  [706, 682],
  [706, 720],
  [706, 758],
  [726, 682],
  [726, 720],
  [726, 758],
].map(([x, y]) => ({ x, y }));
