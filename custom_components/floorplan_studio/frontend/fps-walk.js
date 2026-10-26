// Floorplan Studio – walk through your own home (first person, WebGL).
// Walls, doors and windows come from the plan; lamps that are on light up their room.
import {
  VERSION,
  computeWalls, climateTarget, roomAt, norm, planScale, safeNumber, furnModel, furnHeight, FURN_HEIGHT, furnAt, itemHeight, isCeilingLamp, ceilingMount, lampStyle, deviceHeight, ownHeight,
  lightColor, isOn, friendly, roomSummary, sunFactor, esc, entityArea, stripPath, pathLength, pathMid, savePlan, curtainFor, curtainPanels, isSpot, FURN_TYPES, placeCandidates, isAircon, airconMode, tvLinks, ringClock, ringClockLeds, spotDir, mediaKind, MEDIA_ICON, deviceKind, KIND_ICON, tvScreen, furnStretch, tvOnWall, tvBase, lampShape, ambilightTv, speakerBoxes, applianceKind, wledLive, ambilightSides, stripTop, radiatorLinks, isHeating, applianceEntity, applianceRunning, applianceAbsorbs, camPic, camStream, deviceImage, deviceSibling, screenDown, videoWallCams, videoWallSpan, tableChairs, roundChairs, sofaParts,
} from './fps-core.js?v=1.4.0b77';

/** Things recognised by name and make (see applianceKind in fps-core), drawn by drawThing. */
const THINGS = new Set(['smoke', 'leak', 'irhub', 'alarmhub', 'fingerbot', 'siren', '3dprinter', 'holofan', 'tree', 'syncbox', 'hood', 'kettle', 'coffee', 'dishwasher', 'washer', 'dryer', 'powerstrip', 'inverter', 'nas', 'router', 'printer', 'screen', 'thermo', 'doorbell', 'pixeldisplay']);
const H = 2.6, DOOR_H = 2.1, SILL = 0.9, WIN_TOP = 2.15, EYE = 1.62, R_PLAYER = 0.22, MAX_LIGHTS = 16;
const FURN_NAME = {
  en: { sofa: 'Sofa', bed: 'Bed', table: 'Table', round: 'Round table', coffee: 'Coffee table', radiator: 'Radiator', speakerbox: 'Speaker / box', videowall: 'Camera wall', dishwasher: 'Dishwasher', washer: 'Washing machine', dryer: 'Dryer', desk: 'Desk', counter: 'Kitchen counter', cabinet: 'Cupboard', bath: 'Bath', shower: 'Shower', toilet: 'Toilet', stairs: 'Stairs', tv: 'TV', plant: 'Plant', mirror: 'Mirror', model: '3D model', hob: 'Hob', sink: 'Sink', stove: 'Cooker', fridge: 'Fridge', island: 'Kitchen island', wallcab: 'Wall cupboard' },
  nl: { sofa: 'Bank', bed: 'Bed', table: 'Tafel', round: 'Ronde tafel', coffee: 'Salontafel', radiator: 'Radiator', speakerbox: 'Speaker / box', videowall: 'Camerawand', dishwasher: 'Vaatwasser', washer: 'Wasmachine', dryer: 'Droger', desk: 'Bureau', counter: 'Aanrecht', cabinet: 'Kast', bath: 'Bad', shower: 'Douche', toilet: 'Wc', stairs: 'Trap', tv: 'Tv', plant: 'Plant', mirror: 'Spiegel', model: '3D-model', hob: 'Kookplaat', sink: 'Gootsteen', stove: 'Fornuis', fridge: 'Koelkast', island: 'Kookeiland', wallcab: 'Bovenkast' },
};
const TXT = {
  en: { tour: 'Tour', pause: 'Pause', play: 'Continue', close: 'Close', hint: 'Drag to look around · click to stop · tap a device = on/off or info · tap the floor to walk there · arrow keys or WASD to walk · scroll wheel or + / − to zoom', done: 'Tour done – feel free to look around', nogl: 'This browser cannot show 3D (WebGL).', lamps: (n) => `${n} ${n === 1 ? 'light' : 'lights'} on`, fwd: 'Walk', back: 'Back', edit: 'Edit', save: 'Save', cancel: 'Cancel', saved: 'Saved', height: 'Height', strip: 'Draw LED strip', strip_icon: 'Back to icon', strip_hint: 'Tap the wall or furniture point by point where the strip runs; it is placed at this height. Then Done', done: 'Done', rotate: 'Turn', remove: 'Remove', add_dev: 'Add a device', add_furn: 'Add furniture', add_open: 'Window / door', open_hint: 'Click on a wall where the window or door goes', remove_dev: 'Remove from the plan', none_left: 'Every device of this room is on the plan.', width: 'Width', depth: 'Depth', kind: 'Kind', window: 'Window', door: 'Door', passage: 'Opening', back2: 'Back', aim: 'Aim', aim_hint: 'Click where the spot should shine (wall, floor or furniture)', edit_hint: 'Drag a device sideways to slide it along the floor, or up/down to change its height (one direction per drag) · drag furniture over the floor · tap to pick one', unsaved: 'Not saved – close again to throw the changes away', save_err: 'Could not save', power: 'On/off', vol: 'Volume', target: 'Set to', now: 'now', open: 'Open', stop: 'Stop', closeit: 'Close', vstart: 'Clean', chairs: 'Chairs', legs: 'Legs', vw_bot: 'Bottom', vw_top: 'Top', strip_dir: 'Direction', strip_flat: 'Lying', strip_up: 'Standing', strip_frame: 'Frame', strip_frame3: 'Open frame', strip_to: 'Top', sofa_shape: 'Shape', sofa_straight: 'Straight', sofa_left: 'Corner, left', sofa_right: 'Corner, right', tv_wall: 'On the wall', tv_stand: 'On its stand (tap: on the wall)', tv_wall_h: 'Height = bottom of the screen', vdock: 'Dock', lockit: 'Lock', unlockit: 'Unlock', modes: { cool: 'cooling', heat: 'heating', dry: 'drying', fan: 'fan' }, app_run: 'Running', clip: 'Clip', cam_idle: 'idle', cam_motion: 'motion', app_idle: 'Not running', bri: 'Brightness', colour: 'Colour', ctemp: 'White', effect: 'Effect', mode: 'Mode', fanm: 'Fan', preset: 'Preset', source: 'Source', speed: 'Speed', pos: 'Position', choose: 'Choice' },
  nl: { tour: 'Rondleiding', pause: 'Pauze', play: 'Verder', close: 'Sluiten', hint: 'Slepen = rondkijken · klik = stoppen · tik op een apparaat = aan/uit of info · tik op de vloer = daarheen lopen · pijltjes of WASD = lopen · scrollwiel of + / − = zoomen', done: 'Rondleiding klaar – kijk gerust verder rond', nogl: 'Deze browser kan geen 3D tonen (WebGL).', lamps: (n) => `${n} ${n === 1 ? 'lamp' : 'lampen'} aan`, fwd: 'Lopen', back: 'Terug', edit: 'Bewerken', save: 'Opslaan', cancel: 'Annuleren', saved: 'Opgeslagen', height: 'Hoogte', strip: 'Ledstrip tekenen', strip_icon: 'Terug naar icoon', strip_hint: 'Tik punt voor punt op de muur of het meubel waar de strip loopt; hij komt op deze hoogte. Dan Klaar', done: 'Klaar', rotate: 'Draaien', remove: 'Weghalen', add_dev: 'Apparaat toevoegen', add_furn: 'Meubel toevoegen', add_open: 'Raam / deur', open_hint: 'Klik op de muur waar het raam of de deur komt', remove_dev: 'Van de kaart halen', none_left: 'Alle apparaten van deze ruimte staan al op de kaart.', width: 'Breedte', depth: 'Diepte', kind: 'Soort', window: 'Raam', door: 'Deur', passage: 'Doorgang', back2: 'Terug', aim: 'Richten', aim_hint: 'Klik waar de spot op moet schijnen (muur, vloer of meubel)', edit_hint: 'Sleep een apparaat opzij om het over de vloer te schuiven, of omhoog/omlaag voor de hoogte (één richting per keer) · sleep meubels over de vloer · tik om er één te kiezen', unsaved: 'Niet opgeslagen – nog een keer sluiten gooit de wijzigingen weg', save_err: 'Opslaan lukte niet', power: 'Aan/uit', vol: 'Volume', target: 'Ingesteld', now: 'nu', open: 'Open', stop: 'Stop', closeit: 'Dicht', vstart: 'Zuigen', chairs: 'Stoelen', legs: 'Pootjes', vw_bot: 'Onder', vw_top: 'Boven', strip_dir: 'Richting', strip_flat: 'Liggend', strip_up: 'Staand', strip_frame: 'Kader', strip_frame3: 'Kader open', strip_to: 'Bovenkant', sofa_shape: 'Vorm', sofa_straight: 'Recht', sofa_left: 'Hoek links', sofa_right: 'Hoek rechts', tv_wall: 'Aan de muur', tv_stand: 'Op voet (tik: aan de muur)', tv_wall_h: 'Hoogte = onderkant scherm', vdock: 'Naar dock', lockit: 'Op slot', unlockit: 'Open', modes: { cool: 'koelt', heat: 'verwarmt', dry: 'droogt', fan: 'ventileert' }, app_run: 'Draait', clip: 'Clip', cam_idle: 'rust', cam_motion: 'beweging', app_idle: 'Draait niet', bri: 'Helderheid', colour: 'Kleur', ctemp: 'Wit', effect: 'Effect', mode: 'Modus', fanm: 'Ventilator', preset: 'Voorkeur', source: 'Bron', speed: 'Snelheid', pos: 'Stand', choose: 'Keuze' },
};

/* ------------------------------------------------------------ small maths */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function lookAt(eye, at, up) {
  const z = nrm(sub(eye, at)), x = nrm(cross(up, z)), y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]), -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]), -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]), 1];
}
function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}
const angDiff = (a, b) => { let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };
const rgb = (s, k = 1) => (s ? s.split(',').map((v) => (+v / 255) * k) : null);

/** Does the line a→b (plan, metres) cross the box? */
function segHitsBox(ax, az, bx, bz, q) {
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dz = bz - az;
  for (const [p, d, lo, hi] of [[ax, dx, q[0], q[2]], [az, dz, q[1], q[3]]]) {
    if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) return false; continue; }
    let u0 = (lo - p) / d, u1 = (hi - p) / d;
    if (u0 > u1) [u0, u1] = [u1, u0];
    t0 = Math.max(t0, u0); t1 = Math.min(t1, u1);
    if (t0 > t1) return false;
  }
  return true;
}

/* -------------------------------------------------------------- the world */
const COL = {
  wall: [0.93, 0.91, 0.87], ceil: [0.97, 0.97, 0.96], frame: [0.97, 0.97, 0.97], glass: [0.72, 0.86, 1.0], door: [0.88, 0.86, 0.82],
  floor: [0.66, 0.62, 0.56], wood: [0.62, 0.46, 0.32], tiles: [0.78, 0.78, 0.76], grass: [0.27, 0.38, 0.22],
  soft: [0.46, 0.52, 0.6], dark: [0.16, 0.16, 0.18], pot: [0.62, 0.36, 0.26], plant: [0.26, 0.5, 0.27], woodF: [0.55, 0.4, 0.28], white: [0.94, 0.94, 0.93], metal: [0.84, 0.85, 0.87], mirror: [0.8, 0.87, 0.92],
};
const FURN_COL = { dishwasher: 'white', washer: 'white', dryer: 'white', radiator: 'white', speakerbox: 'dark', coffee: 'woodF', table: 'woodF', round: 'woodF', desk: 'woodF', bed: 'woodF', cabinet: 'woodF', wallcab: 'white', counter: 'white', island: 'white', sink: 'white', hob: 'white', stove: 'metal', fridge: 'metal', bath: 'white', shower: 'white', toilet: 'white', stairs: 'woodF', tv: 'dark', sofa: 'soft', plant: 'plant' };

class Mesh {
  constructor() { this.v = []; }
  tri(a, b, c, n, col, m) { for (const p of [a, b, c]) this.v.push(p[0], p[1], p[2], n[0], n[1], n[2], col[0], col[1], col[2], m); }
  quad(a, b, c, d, col, m = 0) { const n = nrm(cross(sub(b, a), sub(d, a))); this.tri(a, b, c, n, col, m); this.tri(a, c, d, n, col, m); }
  /** An upright prism on a floor outline (x, z in metres) from y0 to y1. */
  prism(poly, y0, y1, col, m = 0, { top = true, bottom = true, skip = null } = {}) {
    const n = poly.length;
    if (y1 > y0) for (let i = 0; i < n; i++) { if (skip?.includes(i)) continue; const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % n]; this.quad([ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az], col, m); }
    if (top) for (let i = 1; i < n - 1; i++) this.tri([poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]], [0, 1, 0], col, m);
    if (bottom && y0 > 0.01) for (let i = 1; i < n - 1; i++) this.tri([poly[0][0], y0, poly[0][1]], [poly[i][0], y0, poly[i][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [0, -1, 0], col, m);
  }
  box(x0, z0, x1, z1, y0, y1, col, m = 0) { this.prism([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y0, y1, col, m); }
  floorRect(x0, z0, x1, z1, y, col, m) { this.quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], col, m); }
}

/** Your own 3D models, loaded once per page: url -> { state: 'loading' | 'ok' | 'error', model, error }. */
const MODELS = new Map();
let modelsChanged = null;
function modelFor(url) {
  if (!url) return null;
  if (!MODELS.has(url)) {
    MODELS.set(url, { state: 'loading' });
    import(`./fps-model.js?v=${VERSION}`).then((m) => m.loadModel(url))
      .then((model) => { MODELS.set(url, { state: 'ok', model }); modelsChanged?.(); })
      .catch((e) => { MODELS.set(url, { state: 'error', error: e?.message || String(e) }); console.warn('Floorplan Studio: 3D model', url, e); modelsChanged?.(); });
  }
  return MODELS.get(url);
}
let placeModelFn = null;
let modelSizeFn = null;
import(`./fps-model.js?v=${VERSION}`).then((m) => { placeModelFn = m.placeModel; modelSizeFn = m.modelSize; }).catch(() => {});

/** Furniture against a wall (a cupboard, a camera wall, a radiator) that you drew a little into it: in 3D it stands just in front
 *  of the wall face instead (the two faces would flicker into each other). Only straight pieces, at most a wall's thickness. */
const WALLS_OF = new WeakMap();
function wallSnap(plan, f) {
  const x = safeNumber(f.x), y = safeNumber(f.y), rot = ((Math.round(safeNumber(f.rot)) % 360) + 360) % 360;
  if (rot % 90 || f.type === 'model') return [x, y];
  const S = planScale(plan) || 70, rooms = plan.rooms || [];
  if (!WALLS_OF.has(rooms)) WALLS_OF.set(rooms, computeWalls(rooms));
  const sw = rot % 180 === 0, hx = Math.max(10, safeNumber(f.w, 100)) / 2, hy = Math.max(6, safeNumber(f.h, 60)) / 2;
  const ex = sw ? hx : hy, ey = sw ? hy : hx;   // half sizes along x and y of the plan
  let dx = 0, dy = 0;
  for (const w of WALLS_OF.get(rooms)) {
    const hor = w.y1 === w.y2, at = hor ? w.y1 : w.x1, t = (w.kind === 'outer' ? 0.24 : 0.12) * S, gap = 0.003 * S;
    const [c, e, a, ea] = hor ? [y, ey, x, ex] : [x, ex, y, ey];   // across the wall / along it
    const a0 = hor ? Math.min(w.x1, w.x2) : Math.min(w.y1, w.y2), a1 = hor ? Math.max(w.x1, w.x2) : Math.max(w.y1, w.y2);
    if (a + ea <= a0 + 1 || a - ea >= a1 - 1) continue;
    let mv = 0;
    if (c < at) { const p = c + e - (at - t / 2 - gap); if (p > 0 && p <= t + 2 * e) mv = -p; }
    else { const p = (at + t / 2 + gap) - (c - e); if (p > 0 && p <= t + 2 * e) mv = p; }
    if (!mv || Math.abs(mv) > t) continue;
    if (hor) { if (Math.abs(mv) > Math.abs(dy)) dy = mv; } else if (Math.abs(mv) > Math.abs(dx)) dx = mv;
  }
  return [x + dx, y + dy];
}

/** Everything that stays put: floors, ceilings, walls with their doors and windows, furniture. */
function buildWorld(plan, hass, selFurn = null) {
  const S = planScale(plan) || 70, M = (v) => v / S;
  const solid = new Mesh(), glass = new Mesh(), blockers = [], seeThrough = [];
  const rooms = plan.rooms || [];
  for (const room of rooms) {
    // the floor you chose in the editor; otherwise tiles in wet rooms and the hall, wood elsewhere
    const kind = ['wood', 'tiles'].includes(room.floor) ? room.floor : /bad|douche|toilet|wc|keuken|kitchen|bath|shower|hal\b|entree|entrance|hall|berging|storage|utility|wasruimte|laundry/i.test(room.name || '') ? 'tiles' : 'wood';
    const mat = kind === 'wood' ? 1 : 2, col = kind === 'wood' ? COL.wood : COL.tiles;
    // rects of one room overlap a few millimetres where they meet (no hairline cracks to the sky or the grass);
    // the ceiling is one colour everywhere, so it may overlap all round
    const qs = room.rects.map(norm), ge = 0.006 * S;
    const touches = (q, k) => qs.some((r) => r !== q && (k === 0 ? r[2] === q[0] : k === 2 ? r[0] === q[2] : k === 1 ? r[3] === q[1] : r[1] === q[3])
      && (k % 2 === 0 ? r[1] < q[3] && r[3] > q[1] : r[0] < q[2] && r[2] > q[0]));
    for (const q of qs) {
      const g = [0, 1, 2, 3].map((k) => (touches(q, k) ? ge : 0));
      solid.floorRect(M(q[0] - g[0]), M(q[1] - g[1]), M(q[2] + g[2]), M(q[3] + g[3]), 0, col, mat);
      solid.floorRect(M(q[0] - ge), M(q[1] - ge), M(q[2] + ge), M(q[3] + ge), H, COL.ceil, 0);
    }
  }
  // the garden around the house
  const W = M(safeNumber(plan.width, 1000)), D = M(safeNumber(plan.height, 700));
  solid.floorRect(-60, -60, W + 60, D + 60, -0.02, COL.grass, 3);

  const openings = (plan.openings || []).map((o) => ({ ...o, x1: safeNumber(o.x1), y1: safeNumber(o.y1), x2: safeNumber(o.x2), y2: safeNumber(o.y2) }));
  const walls = computeWalls(rooms);
  // wall colours: a room's own (step 2), else your colour for all walls (step 5), else the usual
  const hex3 = (v) => (/^#[0-9a-f]{6}$/i.test(v || '') ? [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16) / 255) : null);
  const WALL_ALL = hex3(plan.settings?.wall_color) || COL.wall;
  const wallOf = (room) => hex3(room?.wall_color) || WALL_ALL;
  // how far a wall end reaches: into the wall across it (just short of its far face, so no two faces lie in one plane),
  // and only a hair where the same wall line simply goes on (another room beside it)
  const WL = walls.map((w) => { const hor = w.y1 === w.y2; return { hor, at: hor ? w.y1 : w.x1, a0: hor ? Math.min(w.x1, w.x2) : Math.min(w.y1, w.y2), a1: hor ? Math.max(w.x1, w.x2) : Math.max(w.y1, w.y2), t: (w.kind === 'outer' ? 0.24 : 0.12) * S }; });
  const reach = (me, p) => {
    if (WL.some((v) => v !== me && v.hor === me.hor && v.at === me.at && (v.a1 === p || v.a0 === p))) return 0;
    const across = WL.filter((v) => v.hor !== me.hor && v.at === p && v.a0 <= me.at && v.a1 >= me.at);
    if (!across.length) return me.t / 2;
    const ta = Math.max(...across.map((v) => v.t)) / 2;
    // the wall across goes on past this end (a T): stay just inside it
    if (across.some((v) => v.a0 < me.at) && across.some((v) => v.a1 > me.at)) return ta - 0.02 * S;
    // a corner: both stay just inside the other (a 1 cm inset on the outer edge you don't see, nothing lies in one plane)
    return ta - 0.01 * S;
  };
  const TOP = H + 0.01;   // walls reach just into the ceiling: a clean line where they meet
  // every wall is cut at the same heights (sill, window top, door top), so neighbouring parts share their edges exactly
  const LV = [...new Set([0, SILL, DOOR_H, WIN_TOP, TOP])].sort((p, q) => p - q);
  // does the part next to this one close this height band (so no end face is drawn there)?
  const shut = (q, y0, y1) => q.kind === 'solid' || (q.kind === 'door' && y0 >= DOOR_H - 1e-6) || (q.kind === 'window' && (y1 <= SILL + 1e-6 || y0 >= WIN_TOP - 1e-6));
  // an end of a wall line: an end face, unless the same line simply goes on with a wall at least as thick
  const endFace = (me, p) => !WL.some((v) => v !== me && v.hor === me.hor && v.at === me.at && (v.a1 === p || v.a0 === p) && v.t >= me.t);
  for (const [wi, w] of walls.entries()) {
    const hor = w.y1 === w.y2, at = hor ? w.y1 : w.x1, t = (w.kind === 'outer' ? 0.24 : 0.12) * S;
    const a0 = hor ? Math.min(w.x1, w.x2) : Math.min(w.y1, w.y2), a1 = hor ? Math.max(w.x1, w.x2) : Math.max(w.y1, w.y2);
    const r0 = reach(WL[wi], a0), r1 = reach(WL[wi], a1);
    const cuts = openings.filter((o) => (hor ? o.y1 === o.y2 && Math.abs(o.y1 - at) < 3 : o.x1 === o.x2 && Math.abs(o.x1 - at) < 3))
      .map((o) => ({ o, lo: Math.max(a0, hor ? Math.min(o.x1, o.x2) : Math.min(o.y1, o.y2)), hi: Math.min(a1, hor ? Math.max(o.x1, o.x2) : Math.max(o.y1, o.y2)) }))
      .filter((c) => c.hi > c.lo).sort((p, q) => p.lo - q.lo);
    const pieces = [];
    let pos = a0;
    for (const c of cuts) {
      if (c.lo > pos) pieces.push({ lo: pos, hi: c.lo, kind: 'solid' });
      pieces.push({ lo: Math.max(pos, c.lo), hi: c.hi, kind: c.o.type === 'window' ? 'window' : c.o.type === 'door' ? 'door' : 'gap', o: c.o });
      pos = Math.max(pos, c.hi);
    }
    if (pos < a1) pieces.push({ lo: pos, hi: a1, kind: 'solid' });
    // a box along the wall, in metres (frames and sills)
    const span = (lo, hi, y0, y1, col, grow = 0) => {
      const [x0, z0, x1, z1] = hor ? [lo, at - t / 2 - grow, hi, at + t / 2 + grow] : [at - t / 2 - grow, lo, at + t / 2 + grow, hi];
      solid.box(M(x0), M(z0), M(x1), M(z1), y0, y1, col);
      return [M(x0), M(z0), M(x1), M(z1)];
    };
    // the wall itself, from y0 to y1: in bands at the shared heights, each half in the colour of the room on that side
    // (outside: your wall colour), and only the faces you can see — no faces inside the wall whose edges would flicker on its surface
    const E = hor ? { lo: 3, hi: 1, a: 0, b: 2 } : { lo: 0, hi: 2, a: 3, b: 1 };
    const wallPart = (k, lo, hi, y0, y1) => {
      const [x0, z0, x1, z1] = hor ? [lo, at - t / 2, hi, at + t / 2] : [at - t / 2, lo, at + t / 2, hi];
      const mid = (lo + hi) / 2, rA = hor ? roomAt(rooms, mid, at - t / 2 - 3) : roomAt(rooms, at - t / 2 - 3, mid), rB = hor ? roomAt(rooms, mid, at + t / 2 + 3) : roomAt(rooms, at + t / 2 + 3, mid);
      const cA = wallOf(rA), cB = wallOf(rB);
      const lv = LV.filter((v) => v > y0 + 1e-6 && v < y1 - 1e-6), ys = [y0, ...lv, y1];
      for (let j = 0; j < ys.length - 1; j++) {
        const b0 = ys[j], b1 = ys[j + 1];
        const capLo = k === 0 ? endFace(WL[wi], a0) : !shut(pieces[k - 1], b0, b1), capHi = k === pieces.length - 1 ? endFace(WL[wi], a1) : !shut(pieces[k + 1], b0, b1);
        const skip = [...(capLo ? [] : [E.lo]), ...(capHi ? [] : [E.hi])], opt = { top: j === ys.length - 2, bottom: j === 0 };
        if (cA === cB) { solid.prism([[M(x0), M(z0)], [M(x1), M(z0)], [M(x1), M(z1)], [M(x0), M(z1)]], b0, b1, cA, 0, { ...opt, skip }); continue; }
        const [ax1, az1, bx0, bz0] = hor ? [x1, at, x0, at] : [at, z1, at, z0];
        solid.prism([[M(x0), M(z0)], [M(ax1), M(z0)], [M(ax1), M(az1)], [M(x0), M(az1)]], b0, b1, cA, 0, { ...opt, skip: [...skip, E.b] });
        solid.prism([[M(bx0), M(bz0)], [M(x1), M(bz0)], [M(x1), M(z1)], [M(bx0), M(z1)]], b0, b1, cB, 0, { ...opt, skip: [...skip, E.a] });
      }
      return hor ? [M(lo), M(at - t / 2), M(hi), M(at + t / 2)] : [M(at - t / 2), M(lo), M(at + t / 2), M(hi)];
    };
    for (const [k, pc] of pieces.entries()) {
      // the ends of a wall reach into the wall across, so corners close
      const lo = pc.lo === a0 && pc.kind === 'solid' ? pc.lo - r0 : pc.lo, hi = pc.hi === a1 && pc.kind === 'solid' ? pc.hi + r1 : pc.hi;
      if (pc.kind === 'solid') { blockers.push(wallPart(k, lo, hi, 0, TOP)); continue; }
      if (pc.kind === 'gap') continue;
      const f = 0.05 * S;   // frame width
      if (pc.kind === 'door') {
        wallPart(k, lo, hi, DOOR_H, TOP);
        span(lo, lo + f, 0, DOOR_H, COL.frame, 0.01 * S); span(hi - f, hi, 0, DOOR_H, COL.frame, 0.01 * S); span(lo, hi, DOOR_H - 0.05, DOOR_H, COL.frame, 0.01 * S);
        // a door with a sensor: closed or (swung) open, as it really is
        if (pc.o.entity) {
          const st = hass?.states[pc.o.entity], open = isOn(st), L = M(hi - lo - 2 * f), th = 0.04, side = hor ? (roomAt(rooms, (lo + hi) / 2, at - 6) ? -1 : 1) : (roomAt(rooms, at - 6, (lo + hi) / 2) ? -1 : 1);
          const hx = M(lo + f), ang = open ? 1.45 : 0, ca = Math.cos(ang), sa = Math.sin(ang) * side;
          const pts = [[0, -th / 2], [L, -th / 2], [L, th / 2], [0, th / 2]].map(([u, v]) => [u * ca - v * sa, u * sa + v * ca]);
          solid.prism(pts.map(([u, v]) => (hor ? [hx + u, M(at) + v] : [M(at) + v, hx + u])), 0.01, DOOR_H - 0.06, COL.door);
          if (!open) blockers.push(hor ? [M(lo), M(at) - 0.03, M(hi), M(at) + 0.03] : [M(at) - 0.03, M(lo), M(at) + 0.03, M(hi)]);
        }
      } else {   // window: wall under the sill and above the window, a frame, and glass
        blockers.push(wallPart(k, lo, hi, 0, SILL));
        wallPart(k, lo, hi, WIN_TOP, TOP);
        seeThrough.push(hor ? [M(lo), M(at - t / 2), M(hi), M(at + t / 2)] : [M(at - t / 2), M(lo), M(at + t / 2), M(hi)]);
        span(lo, hi, SILL - 0.03, SILL + 0.02, COL.frame, 0.03 * S);                     // window sill
        span(lo, lo + f, SILL, WIN_TOP, COL.frame, -t * 0.25); span(hi - f, hi, SILL, WIN_TOP, COL.frame, -t * 0.25);
        span(lo, hi, WIN_TOP - 0.05, WIN_TOP, COL.frame, -t * 0.25);
        if (M(hi - lo) > 1.3) { const mid = (lo + hi) / 2; span(mid - f / 2, mid + f / 2, SILL, WIN_TOP, COL.frame, -t * 0.3); }
        const g = (hor ? [[M(lo), M(at)], [M(hi), M(at)]] : [[M(at), M(lo)], [M(at), M(hi)]]);
        glass.quad([g[0][0], SILL, g[0][1]], [g[1][0], SILL, g[1][1]], [g[1][0], WIN_TOP, g[1][1]], [g[0][0], WIN_TOP, g[0][1]], COL.glass, 0);
      }
    }
  }

  for (const f of plan.furniture || []) {
    const fh = furnHeight(f);
    if (!(fh > 0)) continue;
    const r = (safeNumber(f.rot) * Math.PI) / 180, cr = Math.cos(r), sr = Math.sin(r), [fx, fy] = wallSnap(plan, f);
    // your own 3D model: its triangles (until it is loaded, or if it can't be read: a box)
    if (f.type === 'model' && f.model) {
      const mm = modelFor(f.model);
      if (mm?.state === 'ok' && placeModelFn) {
        const hi = f.id === selFurn;
        placeModelFn(mm.model, f, S, (x, y, z, nx, ny, nz, r, g, b) => solid.v.push(x, y, z, nx, ny, nz, hi ? r * 0.45 + 0.55 : r, hi ? g * 0.45 + 0.4 : g, hi ? b * 0.45 + 0.19 : b, 0));
        continue;
      }
    }
    const zs = furnStretch(f), zb = tvBase(plan, f);   // a TV on a cabinet stands on top of it
    const support = ['hob', 'sink'].includes(f.type) ? (plan.furniture || []).find((g) => g !== f && ['counter', 'island', 'sink', 'stove'].includes(g.type) && furnAt({ furniture: [g] }, fx, fy)) : null;
    for (const pr of furnModel(f, 0, !!support || (f.type === 'tv' && zb > 0), S)) {
      const poly = pr.poly.map(([x, y]) => [M(fx + x * cr - y * sr), M(fy + x * sr + y * cr)]);
      const y0 = pr.z0 * zs + zb, y1 = Math.max(pr.z1 * zs + zb, y0 + 0.004);
      if (pr.cls === 'glass') { glass.prism(poly, y0, y1, COL.glass); continue; }
      let col = COL[pr.cls === 'soft' ? 'soft' : pr.cls === 'dark' ? 'dark' : pr.cls === 'pot' ? 'pot' : pr.cls === 'plant' ? 'plant' : pr.cls === 'mirror' ? 'mirror' : FURN_COL[f.type] || 'woodF'];
      if (f.id === selFurn) col = col.map((v, i) => v * 0.45 + [1, 0.72, 0.35][i] * 0.55);   // picked while editing
      solid.prism(poly, y0, y1, col);
    }
  }
  return { solid, glass, blockers, seeThrough, S, walls };
}

/* ------------------------------------------------------- finding your way */
function buildGraph(plan, S) {
  const rooms = plan.rooms || [], M = (v) => v / S, edges = [];
  let entrance = null;
  for (const o of plan.openings || []) {
    if (o.type === 'window') continue;
    const x1 = safeNumber(o.x1), y1 = safeNumber(o.y1), x2 = safeNumber(o.x2), y2 = safeNumber(o.y2), hor = y1 === y2, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, k = 0.6 * S;
    const A = hor ? roomAt(rooms, mx, my - 6) : roomAt(rooms, mx - 6, my), B = hor ? roomAt(rooms, mx, my + 6) : roomAt(rooms, mx + 6, my);
    const pa = hor ? [M(mx), M(my - k)] : [M(mx - k), M(my)], pb = hor ? [M(mx), M(my + k)] : [M(mx + k), M(my)];
    if (A && B && A.id !== B.id) edges.push({ a: A.id, b: B.id, pa, pb, door: o.type === 'door' });
    else if ((A || B) && !(A && B) && !entrance) entrance = { room: (A || B).id, inside: A ? pa : pb, outside: A ? pb : pa };
  }
  // rooms that touch but have no door drawn between them: connect them through the middle of their longest shared wall
  const parent = new Map(rooms.map((r) => [r.id, r.id]));
  const find = (x) => { while (parent.get(x) !== x) x = parent.get(x); return x; };
  for (const e of edges) parent.set(find(e.a), find(e.b));
  const inner = computeWalls(rooms).filter((w) => w.kind === 'inner' && w.rooms.length === 2).sort((p, q) => Math.hypot(q.x2 - q.x1, q.y2 - q.y1) - Math.hypot(p.x2 - p.x1, p.y2 - p.y1));
  for (const w of inner) {
    const [a, b] = w.rooms;
    if (find(a) === find(b)) continue;
    parent.set(find(a), find(b));
    const hor = w.y1 === w.y2, mx = (w.x1 + w.x2) / 2, my = (w.y1 + w.y2) / 2, k = 0.6 * S;
    const A = hor ? roomAt(rooms, mx, my - 6) : roomAt(rooms, mx - 6, my);
    const p1 = hor ? [M(mx), M(my - k)] : [M(mx - k), M(my)], p2 = hor ? [M(mx), M(my + k)] : [M(mx + k), M(my)];
    edges.push(A?.id === a ? { a, b, pa: p1, pb: p2, ghost: true } : { a, b, pa: p2, pb: p1, ghost: true });
  }
  // a good spot to stand in each room: near the middle of its biggest part, not inside furniture
  const spot = new Map();
  for (const r of rooms) {
    const q = r.rects.map(norm).sort((p, s) => (s[2] - s[0]) * (s[3] - s[1]) - (p[2] - p[0]) * (p[3] - p[1]))[0];
    const cx = (q[0] + q[2]) / 2, cy = (q[1] + q[3]) / 2;
    let best = [cx, cy], bd = Infinity;
    for (let i = 1; i < 8; i++) for (let j = 1; j < 8; j++) {
      const x = q[0] + ((q[2] - q[0]) * i) / 8, y = q[1] + ((q[3] - q[1]) * j) / 8;
      if (furnAt(plan, x, y) || roomAt(rooms, x, y)?.id !== r.id) continue;
      const d = Math.hypot(x - cx, y - cy);
      if (d < bd) { bd = d; best = [x, y]; }
    }
    spot.set(r.id, [M(best[0]), M(best[1])]);
  }
  return { edges, entrance, spot };
}

/**
 * A fine grid over the house for walking: walls, closed doors and furniture are in the way.
 * find() gives a short path of points around them (A* on the grid, then straightened).
 */
function buildNav(plan, world, S, extra = []) {
  const g = 0.15, rooms = plan.rooms || [];
  const qs = rooms.flatMap((r) => r.rects.map(norm));
  if (!qs.length) return null;
  const x0 = Math.min(...qs.map((q) => q[0])) / S - 0.3, z0 = Math.min(...qs.map((q) => q[1])) / S - 0.3;
  const nx = Math.ceil((Math.max(...qs.map((q) => q[2])) / S + 0.3 - x0) / g), nz = Math.ceil((Math.max(...qs.map((q) => q[3])) / S + 0.3 - z0) / g);
  const N = nx * nz, wall = new Uint8Array(N), blocked = new Uint8Array(N), tall = new Uint8Array(N), room = new Int16Array(N).fill(-1);
  const cx = (i) => x0 + (i + 0.5) * g, cz = (j) => z0 + (j + 0.5) * g;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const r = roomAt(rooms, cx(i) * S, cz(j) * S);
    if (!r) { wall[j * nx + i] = 1; continue; }
    room[j * nx + i] = rooms.indexOf(r);
  }
  const mark = (arr, q, pad) => {
    const i0 = Math.max(0, Math.floor((q[0] - pad - x0) / g)), i1 = Math.min(nx - 1, Math.floor((q[2] + pad - x0) / g));
    const j0 = Math.max(0, Math.floor((q[1] - pad - z0) / g)), j1 = Math.min(nz - 1, Math.floor((q[3] + pad - z0) / g));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) arr[j * nx + i] = 1;
  };
  for (const q of world.blockers) mark(wall, q, 0.16);
  blocked.set(wall);
  for (const f of plan.furniture || []) {
    if (!(furnHeight(f) > 0.25) || f.type === 'wallcab') continue;
    const r = (safeNumber(f.rot) * Math.PI) / 180, w = safeNumber(f.w, 100) / 2, h = safeNumber(f.h, 60) / 2, fx = safeNumber(f.x), fy = safeNumber(f.y);
    const pts = [[-w, -h], [w, -h], [w, h], [-w, h]].map(([x, y]) => [(fx + x * Math.cos(r) - y * Math.sin(r)) / S, (fy + x * Math.sin(r) + y * Math.cos(r)) / S]);
    const pad = 0.12, cr = Math.cos(-r), sr = Math.sin(-r), sp = sofaParts(f);
    const i0 = Math.max(0, Math.floor((Math.min(...pts.map((p) => p[0])) - pad - x0) / g)), i1 = Math.min(nx - 1, Math.floor((Math.max(...pts.map((p) => p[0])) + pad - x0) / g));
    const j0 = Math.max(0, Math.floor((Math.min(...pts.map((p) => p[1])) - pad - z0) / g)), j1 = Math.min(nz - 1, Math.floor((Math.max(...pts.map((p) => p[1])) + pad - z0) / g));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dx = cx(i) - fx / S, dz = cz(j) - fy / S, lx = dx * cr - dz * sr, lz = dx * sr + dz * cr;
      if (sp && !sp.some(([a0, b0, a1, b1]) => lx * S + w >= a0 - pad * S && lx * S + w <= a1 + pad * S && lz * S + h >= b0 - pad * S && lz * S + h <= b1 + pad * S)) continue;   // the open corner of a corner sofa
      if (Math.abs(lx) <= w / S + pad && Math.abs(lz) <= h / S + pad) { blocked[j * nx + i] = 1; if (furnHeight(f) > 1.4 && Math.abs(lx) <= w / S && Math.abs(lz) <= h / S) tall[j * nx + i] = 1; }
    }
  }
  // standing lamps and the like: round things on the floor (x, z, radius in metres)
  for (const [ex, ez, er] of extra) {
    for (let j = Math.max(0, Math.floor((ez - er - 0.12 - z0) / g)); j <= Math.min(nz - 1, Math.floor((ez + er + 0.12 - z0) / g)); j++)
      for (let i = Math.max(0, Math.floor((ex - er - 0.12 - x0) / g)); i <= Math.min(nx - 1, Math.floor((ex + er + 0.12 - x0) / g)); i++)
        if (Math.hypot(cx(i) - ex, cz(j) - ez) <= er + 0.12) blocked[j * nx + i] = 1;
  }
  // how far every free cell is from the nearest obstacle (for good places to stand)
  const clear = new Float32Array(N).fill(1e9), q0 = [];
  for (let k = 0; k < N; k++) if (blocked[k]) { clear[k] = 0; q0.push(k); }
  for (let h = 0; h < q0.length; h++) {
    const k = q0[h], i = k % nx, j = (k - i) / nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
      const n = jj * nx + ii;
      if (clear[n] > clear[k] + 1) { clear[n] = clear[k] + 1; q0.push(n); }
    }
  }
  const comfy = new Uint8Array(N);
  for (let k = 0; k < N; k++) comfy[k] = clear[k] < 1.5 ? 1 : 0;
  const cellOf = (x, z) => [Math.max(0, Math.min(nx - 1, Math.floor((x - x0) / g))), Math.max(0, Math.min(nz - 1, Math.floor((z - z0) / g)))];
  const free = (k, arr = blocked) => k >= 0 && k < N && !arr[k];
  /** The nearest free cell to a point. */
  const nearestFree = (x, z, arr = blocked) => {
    const [i, j] = cellOf(x, z);
    if (free(j * nx + i, arr)) return j * nx + i;
    for (let r = 1; r < 30; r++) {
      let best = -1, bd = Infinity;
      for (let jj = j - r; jj <= j + r; jj++) for (let ii = i - r; ii <= i + r; ii++) {
        if (ii < 0 || jj < 0 || ii >= nx || jj >= nz || !free(jj * nx + ii, arr)) continue;
        const d = (ii - i) ** 2 + (jj - j) ** 2;
        if (d < bd) { bd = d; best = jj * nx + ii; }
      }
      if (best >= 0) return best;
    }
    return -1;
  };
  const lineFree = (ax, az, bx, bz, arr) => {
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) / (g * 0.4));
    for (let s = 1; s < n; s++) { const [i, j] = cellOf(ax + ((bx - ax) * s) / n, az + ((bz - az) * s) / n); if (arr[j * nx + i]) return false; }
    return true;
  };
  function search(ax, az, bx, bz, arr) {
    const s0 = nearestFree(ax, az, arr), t0 = nearestFree(bx, bz, arr);
    if (s0 < 0 || t0 < 0) return null;
    const ti = t0 % nx, tj = (t0 - ti) / nx, H = (k) => { const i = k % nx, j = (k - i) / nx; return Math.hypot(i - ti, j - tj); };
    const gs = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), done = new Uint8Array(N);
    const heap = [[H(s0), s0]];
    gs[s0] = 0;
    const push = (e) => { heap.push(e); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
    const pop = () => { const top = heap[0], end = heap.pop(); if (heap.length) { heap[0] = end; let c = 0; for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
    while (heap.length) {
      const [, k] = pop();
      if (done[k]) continue;
      done[k] = 1;
      if (k === t0) break;
      const i = k % nx, j = (k - i) / nx;
      for (const [di, dj, c] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
        const n = jj * nx + ii;
        if (arr[n] || (di && dj && (arr[j * nx + ii] || arr[jj * nx + i]))) continue;
        // keep a little away from walls and furniture where there is room
        const cost = gs[k] + c * (1 + 2 / (1 + Math.min(clear[n], 6)));
        if (cost < gs[n]) { gs[n] = cost; from[n] = k; push([cost + H(n), n]); }
      }
    }
    if (from[t0] < 0 && t0 !== s0) return null;
    const cells = [];
    for (let k = t0; k >= 0; k = from[k]) { cells.unshift(k); if (k === s0) break; }
    const pts = cells.map((k) => { const i = k % nx, j = (k - i) / nx; return [cx(i), cz(j)]; });
    { const [bi, bj] = cellOf(bx, bz); if (bj * nx + bi === t0) pts[pts.length - 1] = [bx, bz]; }   // a spot in the way: stop at the nearest free one
    // straighten: from each point, jump to the furthest one you can walk to in a straight line
    const out = [];
    let cur = [ax, az], idx = 0;
    while (idx < pts.length - 1) {
      let best = idx + 1;
      // prefer straight stretches that keep some room from walls and furniture; in tight spots, whatever fits
      for (let k = pts.length - 1; k > idx + 1; k--) if (lineFree(cur[0], cur[1], pts[k][0], pts[k][1], comfy)) { best = k; break; }
      if (best === idx + 1) for (let k = pts.length - 1; k > idx + 1; k--) if (lineFree(cur[0], cur[1], pts[k][0], pts[k][1], arr)) { best = k; break; }
      out.push({ x: pts[best][0], z: pts[best][1] });
      cur = pts[best]; idx = best;
    }
    if (!out.length) out.push({ x: pts[pts.length - 1][0], z: pts[pts.length - 1][1] });
    return out;
  }
  return {
    /** Path around walls and furniture; if furniture closes the way, at least around the walls. */
    find(ax, az, bx, bz) { return search(ax, az, bx, bz, blocked) || search(ax, az, bx, bz, wall); },
    /** A good place to stand in a room: open space, near its middle, and the direction with the most to see. */
    spot(r) {
      const ri = rooms.indexOf(r), q = r.rects.map(norm).sort((p, s2) => (s2[2] - s2[0]) * (s2[3] - s2[1]) - (p[2] - p[0]) * (p[3] - p[1]))[0];
      const mx = (q[0] + q[2]) / 2 / S, mz = (q[1] + q[3]) / 2 / S;
      // how far you can see from a spot, and the best direction (walls and tall furniture block the view)
      const view = (x, z, step = 2) => {
        let look = 0, far = -1;
        for (let a = 0; a < 24; a += step) {
          const ang = (a / 24) * 2 * Math.PI, dx = Math.sin(ang), dz = Math.cos(ang);
          let d = 0;
          for (; d < 12; d += g) { const [ii, jj] = cellOf(x + dx * d, z + dz * d); if (wall[jj * nx + ii] || tall[jj * nx + ii]) break; }
          if (d > far) { far = d; look = ang; }
        }
        return { look, far };
      };
      // stand where you overlook the room (near a side, looking across it) - that feels much roomier than the middle -
      // with a bit of space around you
      let best = -1, bs = -Infinity;
      for (let k = 0; k < N; k++) {
        if (room[k] !== ri || blocked[k] || clear[k] < 3) continue;
        const i = k % nx, j = (k - i) / nx;
        if ((i + j) % 2) continue;   // every other cell is plenty
        const sc = view(cx(i), cz(j), 3).far + 0.1 * Math.min(clear[k], 5) - 0.02 * Math.hypot(cx(i) - mx, cz(j) - mz);
        if (sc > bs) { bs = sc; best = k; }
      }
      if (best < 0) for (let k = 0; k < N; k++) {
        if (room[k] !== ri || blocked[k]) continue;
        const i = k % nx, j = (k - i) / nx, sc = Math.min(clear[k], 7) - 0.12 * Math.hypot(cx(i) - mx, cz(j) - mz) / g;
        if (sc > bs) { bs = sc; best = k; }
      }
      const i = best >= 0 ? best % nx : 0, j = best >= 0 ? (best - i) / nx : 0, x = best >= 0 ? cx(i) : mx, z = best >= 0 ? cz(j) : mz;
      return { x, z, look: view(x, z, 1).look };
    },
  };
}

/* -------------------------------------------------------------- shaders */
const VS = `attribute vec3 aP; attribute vec3 aN; attribute vec3 aC; attribute float aM;
uniform mat4 uVP; varying vec3 vP; varying vec3 vN; varying vec3 vC; varying float vM;
void main(){ vP=aP; vN=aN; vC=aC; vM=aM; gl_Position=uVP*vec4(aP,1.0); }`;
const FS = (N) => `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vP; varying vec3 vN; varying vec3 vC; varying float vM;
uniform vec3 uEye; uniform vec3 uSky; uniform float uAmb; uniform float uSun; uniform vec3 uSunDir;
uniform int uNL; uniform vec4 uLP[${N}]; uniform vec3 uLC[${N}]; uniform vec4 uLB[${N}]; uniform vec4 uLB2[${N}]; uniform vec4 uLB3[${N}]; uniform vec4 uLD[${N}];
uniform float uAlpha; uniform float uEmis; uniform vec3 uTint;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  if (uEmis > 1.5) { gl_FragColor = vec4(vC, 1.0); return; }
  if (uEmis > 0.5) { gl_FragColor = vec4(uTint, 1.0); return; }
  vec3 col = vC;
  if (vM > 0.5 && vM < 1.5) {
    float pw = 0.16; float row = floor(vP.z / pw); float off = hash(vec2(row, 3.1)) * 2.0;
    float u = (vP.x + off) / 1.4; col *= 0.86 + 0.22 * hash(vec2(row, floor(u)));
    float e = min(fract(vP.z / pw), 1.0 - fract(vP.z / pw)); col *= mix(0.74, 1.0, smoothstep(0.0, 0.05, e));
    float e2 = min(fract(u), 1.0 - fract(u)); col *= mix(0.8, 1.0, smoothstep(0.0, 0.006, e2));
  } else if (vM > 1.5 && vM < 2.5) {
    vec2 g = fract(vP.xz / 0.6); float e = min(min(g.x, 1.0 - g.x), min(g.y, 1.0 - g.y));
    col *= mix(0.8, 1.0, smoothstep(0.0, 0.025, e)); col *= 0.95 + 0.08 * hash(floor(vP.xz / 0.6));
  } else if (vM > 2.5) {
    col *= 0.82 + 0.3 * hash(floor(vP.xz * 3.0));
  }
  vec3 N = normalize(vN); vec3 V = uEye - vP; if (dot(N, V) < 0.0) N = -N;
  vec3 light = vec3(uAmb) * (0.8 + 0.2 * N.y * N.y) + uSun * max(dot(N, uSunDir), 0.0) * vec3(1.0, 0.96, 0.9);
  vec3 fill = vec3(0.0);
  for (int i = 0; i < ${N}; i++) {
    if (i >= uNL) break;
    vec4 b = uLB[i]; vec4 b2 = uLB2[i]; vec4 b3 = uLB3[i];
    float inside = max(max(step(b.x, vP.x) * step(vP.x, b.z) * step(b.y, vP.z) * step(vP.z, b.w), step(b2.x, vP.x) * step(vP.x, b2.z) * step(b2.y, vP.z) * step(vP.z, b2.w)), step(b3.x, vP.x) * step(vP.x, b3.z) * step(b3.y, vP.z) * step(vP.z, b3.w));
    if (inside < 0.5) continue;   // another room: nothing to work out (keeps the GPU light)
    vec3 L = uLP[i].xyz - vP; float d = length(L); vec3 l = L / max(d, 0.001);
    float cone = 1.0;
    if (uLD[i].w > 0.0) cone = smoothstep(uLD[i].w, uLD[i].w + 0.06, dot(-l, uLD[i].xyz));   // a spot: only inside its beam
    else if (uLD[i].w < 0.0) cone = 0.22 + 1.15 * smoothstep(0.3, 0.92, dot(-l, uLD[i].xyz));   // a lamp over a table: mostly down onto it, a little all round
    light += uLC[i] * (uLP[i].w / (1.0 + 0.8 * d * d)) * inside * cone * max(dot(N, l), 0.0);
    fill += uLC[i] * uLP[i].w * 0.25;   // light bouncing off walls and ceiling: the whole room gets a share, also far from the lamp
  }
  light += 0.4 * (vec3(1.0) - exp(-fill * 1.2));   // (that share levels off: ten lamps don't make a room ten times as bright)
  light = 1.25 * (vec3(1.0) - exp(-light * 1.1));   // bright spots near a lamp don't blow out
  vec3 c = col * light;
  float fog = 1.0 - exp(-length(V) * 0.03);
  gl_FragColor = vec4(mix(c, uSky, fog * 0.55), uAlpha);
}`;

/* -------------------------------------------------------------- the view */
const CSS = `
:host { all: initial; }
.wk { position: fixed; inset: 0; z-index: 9000; background: #0b0e13; font: 14px/1.35 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #fff; user-select: none; -webkit-user-select: none; touch-action: none; overflow: hidden; }
canvas.gl { position: absolute; inset: 0; width: 100%; height: 100%; display: block; cursor: grab; }
canvas.gl:active { cursor: grabbing; }
.icons { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.cs { position: absolute; left: 0; top: 0; width: 320px; height: 180px; transform-origin: 0 0; pointer-events: auto; cursor: pointer; background: #050a12; overflow: hidden; box-shadow: 0 0 30px rgba(90,160,255,.35); }
.cs img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(.9) contrast(1.05); }
.cs span { position: absolute; left: 6px; bottom: 5px; font: 600 13px/1 system-ui, sans-serif; color: #9fd0ff; text-shadow: 0 0 6px #000; letter-spacing: .04em; text-transform: uppercase; }
.cs.holo { border-radius: 50%; background: transparent; box-shadow: none; mix-blend-mode: screen; }
.cs.holo img { object-fit: fill; filter: saturate(1.15) brightness(1.1); }
.cs.holo::after { display: none; }
.cs.holo.off { opacity: .45; }
.cs.holo.off img { filter: grayscale(.4) brightness(.7); }
.cs .mo { position: absolute; left: 6px; top: 5px; font: 600 11px/1 system-ui, sans-serif; color: #5be08a; text-shadow: 0 0 6px #000; letter-spacing: .05em; text-transform: uppercase; }
.cs .mo::before { content: '● '; }
.cs .mo.on { color: #ff4646; font-size: 19px; font-weight: 800; animation: mo-blink 1s steps(2) infinite; }
@keyframes mo-blink { 50% { opacity: .55; } }
.cs::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 1px, transparent 1px 3px); pointer-events: none; }
.wi { position: absolute; left: 0; top: 0; width: 0; height: 0; transform-origin: 0 0; will-change: transform; }
.wi .b { position: absolute; left: -22px; top: -22px; pointer-events: auto; cursor: pointer; width: 44px; height: 44px; box-sizing: border-box; border-radius: 50%; display: grid; place-items: center; background: rgba(20,24,32,.72); border: 1.5px solid rgba(255,255,255,.35); color: #e8edf3; backdrop-filter: blur(4px); box-shadow: 0 2px 10px rgba(0,0,0,.35); }
.wi.off .b { opacity: .5; }
.wi.on .b { background: rgb(var(--c, 255, 190, 110)); color: #151a20; border-color: rgba(255,255,255,.9); box-shadow: 0 0 18px rgba(var(--c, 255, 190, 110), .85); }
.wi .b ha-icon, .wi .b ha-state-icon { --mdc-icon-size: 24px; }
.wi .b.txt { font-size: 12px; font-weight: 600; }
.wi .n { position: absolute; top: 26px; left: 0; transform: translateX(-50%); pointer-events: none; padding: 2px 8px; border-radius: 8px; background: rgba(0,0,0,.55); font-size: 12px; white-space: nowrap; opacity: 0; transition: opacity .2s; }
.wi.near .n, .wi.hov .n, .wi:hover .n, .wi .b:hover + .n { opacity: 1; }
.wi.hov .b { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.25), 0 2px 10px rgba(0,0,0,.35); }
.top { position: absolute; left: 12px; right: 12px; top: 12px; display: flex; gap: 8px; align-items: center; pointer-events: none;  z-index: 20;}
.top > * { pointer-events: auto; }
button.x, .bar button { border: 0; border-radius: 22px; background: rgba(15,18,24,.72); color: #fff; height: 44px; min-width: 44px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; font: inherit; font-weight: 600; cursor: pointer; backdrop-filter: blur(6px); }
button.x { padding: 0; justify-content: center; }
button ha-icon { --mdc-icon-size: 22px; }
.bar button.active { background: rgba(255,180,90,.95); color: #1a1208; }
.room { margin-left: 4px; padding: 8px 14px; border-radius: 14px; background: rgba(15,18,24,.62); backdrop-filter: blur(6px); opacity: 0; transform: translateY(-6px); transition: opacity .35s, transform .35s; }
.room.show { opacity: 1; transform: none; }
.room b { font-size: 17px; letter-spacing: .02em; } .room small { display: block; opacity: .8; }
.map { position: absolute; right: 12px; top: 12px; border-radius: 12px; background: rgba(10,12,16,.62); backdrop-filter: blur(6px); cursor: pointer;  z-index: 20;}
.bar { position: absolute; left: 0; right: 0; bottom: 14px; display: flex; justify-content: center; gap: 8px; pointer-events: none;  z-index: 20;}
.bar > * { pointer-events: auto; }
.hint { position: absolute; left: 50%; bottom: 70px; transform: translateX(-50%); max-width: calc(100% - 32px); text-align: center; padding: 6px 12px; border-radius: 10px; background: rgba(0,0,0,.5); font-size: 13px; transition: opacity 1s;  z-index: 25;}
.sheet img.cam { display: block; width: 100%; border-radius: 10px; margin-top: 8px; cursor: zoom-out; }
.sheet.camsh { width: min(840px, calc(100% - 24px)); bottom: 64px; cursor: zoom-out; }
.sheet img.cam.holo { width: min(260px, 70%); aspect-ratio: 1; object-fit: cover; border-radius: 50%; margin: 8px auto 0; background: #000; cursor: default; }
.sheet.camsh img.cam { max-height: calc(100vh - 200px); object-fit: contain; background: #000; }
.sheet { position: absolute; left: 50%; bottom: 70px; transform: translateX(-50%); width: min(420px, calc(100% - 24px)); box-sizing: border-box; padding: 12px 14px; border-radius: 16px; background: rgba(15,18,24,.85); backdrop-filter: blur(8px); display: none;  z-index: 40;}
.sheet.show { display: block; }
.sheet b { display: block; font-size: 15px; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sheet .row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 6px; }
.sheet .row span { min-width: 64px; opacity: .85; }
.sheet button { border: 0; border-radius: 12px; background: rgba(255,255,255,.12); color: #fff; height: 36px; min-width: 36px; padding: 0 12px; font: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.sheet button.pri { background: rgba(255,180,90,.95); color: #1a1208; font-weight: 600; }
.sheet small { display: block; margin-top: 6px; opacity: .75; }
.sheet button.sw { min-width: 26px; width: 26px; height: 26px; padding: 0; border-radius: 50%; border: 2px solid rgba(255,255,255,.5); }
.sheet input[type=range] { flex: 1; min-width: 140px; accent-color: #ffb45a; }
.sheet input[type=color] { width: 34px; height: 30px; border: 0; padding: 0; background: none; cursor: pointer; }
.sheet select { flex: 1; min-width: 140px; height: 34px; border-radius: 10px; border: 0; background: rgba(255,255,255,.12); color: #fff; font: inherit; padding: 0 8px; }
.sheet select option { color: #111; }
.sheet .x2 { position: absolute; right: 8px; top: 8px; min-width: 30px; height: 30px; padding: 0; justify-content: center; background: none; font-size: 20px; }
.editing canvas.gl { cursor: default; }
.editing .wi .b { cursor: grab; outline: 2px dashed rgba(255,190,110,.8); outline-offset: 3px; }
.wi.sel .b { outline: 3px solid #ffbe6e; outline-offset: 3px; }
.wi[data-axis] .b::after { position: absolute; left: 50%; top: -30px; transform: translateX(-50%); font-size: 20px; font-weight: 700; color: #ffbe6e; text-shadow: 0 1px 4px #000; }
.wi[data-axis="h"] .b::after { content: '⟷'; } .wi[data-axis="v"] .b::after { content: '↕'; top: -34px; }
.badge { padding: 6px 12px; border-radius: 12px; background: rgba(255,180,90,.95); color: #1a1208; font-weight: 700; display: none; }
.editing .badge { display: inline-block; }
.msg { position: absolute; inset: 0; display: grid; place-items: center; font-size: 16px; }
.touch .bar .tw { display: inline-flex; } .bar .tw { display: none; }
@media (max-width: 560px) { .map { width: 120px !important; height: auto !important; } .room b { font-size: 15px; } }
`;

/**
 * Open the walk-through on top of the page. host = the card (for more-info and toggling).
 * Returns { setHass, close }.
 */
export function openWalk(host, { plan: original, hass, onClose, canEdit = false, loop = false, tour = false }) {
  let plan = JSON.parse(JSON.stringify(original));   // changes stay here until you press Save
  const lang = ((hass?.locale?.language || hass?.language || 'en').slice(0, 2) === 'nl') ? 'nl' : 'en', T = TXT[lang];
  const wrap = document.createElement('div');
  wrap.className = 'fps-walk-host';
  const root = wrap.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${CSS}</style><div class="wk${matchMedia('(pointer: coarse)').matches ? ' touch' : ''}">
    <canvas class="gl"></canvas><div class="icons"></div>
    <div class="top"><button class="x" id="close" title="${T.close}"><ha-icon icon="mdi:close"></ha-icon></button><div class="room"><b></b><small></small></div><span class="badge">${T.edit}</span></div>
    <canvas class="map"></canvas>
    <div class="hint">${T.hint}</div><div class="sheet"></div>
    <div class="bar"><button class="tw" id="back"><ha-icon icon="mdi:arrow-down"></ha-icon></button><button id="tour" class="active"><ha-icon icon="mdi:pause"></ha-icon><span>${T.pause}</span></button><button class="tw" id="fwd"><ha-icon icon="mdi:arrow-up"></ha-icon>${T.fwd}</button>${canEdit ? `<button id="edit"><ha-icon icon="mdi:pencil"></ha-icon><span>${T.edit}</span></button><button id="ecancel" style="display:none">${T.cancel}</button><button id="esave" class="active" style="display:none"><ha-icon icon="mdi:content-save"></ha-icon>${T.save}</button>` : ''}</div>
  </div>`;
  document.body.appendChild(wrap);
  const $ = (s) => root.querySelector(s);
  const canvas = $('canvas.gl'), iconsEl = $('.icons'), mapEl = $('canvas.map'), roomEl = $('.room');
  let closed = false, raf = 0;
  let dirtyEdit = false, warnedClose = false;
  const close = () => {
    if (closed) return;
    if (dirtyEdit && !warnedClose) { warnedClose = true; showRoom(null, T.unsaved); return; }
    closed = true; cancelAnimationFrame(raf); ro.disconnect(); liveSub?.stop();
    window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKeyUp, true);
    wrap.remove(); onClose?.();
  };
  $('#close').addEventListener('click', close);

  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, depth: true });
  if (!gl) { root.querySelector('.wk').insertAdjacentHTML('beforeend', `<div class="msg">${T.nogl}</div>`); return { setHass() {}, close }; }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('fps-walk', gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  // as many lamps at once as the graphics chip allows (32, or 16 on very old ones): no lamps dropping out while you walk
  const NL = (gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 0) >= 240 ? 32 : MAX_LIGHTS;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS(NL))); gl.linkProgram(prog); gl.useProgram(prog);
  const A = Object.fromEntries(['aP', 'aN', 'aC', 'aM'].map((n) => [n, gl.getAttribLocation(prog, n)]));
  const U = Object.fromEntries(['uVP', 'uEye', 'uSky', 'uAmb', 'uSun', 'uSunDir', 'uNL', 'uLP', 'uLC', 'uLB', 'uLB2', 'uLB3', 'uLD', 'uAlpha', 'uEmis', 'uTint'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  const upload = (mesh) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.v), gl.STATIC_DRAW); return { b, n: mesh.v.length / 10 }; };
  const bind = ({ b }) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    [['aP', 3, 0], ['aN', 3, 12], ['aC', 3, 24], ['aM', 1, 36]].forEach(([n, k, off]) => { gl.enableVertexAttribArray(A[n]); gl.vertexAttribPointer(A[n], k, gl.FLOAT, false, 40, off); });
  };

  let editing = false, sel = null, stripDraft = null, stripY = 1, aimFor = null, menu = null, openMode = null;
  let lastVP = null;
  let camWalls = [];   // camera walls: their screens (3D corners) and the picture elements laid over them
  let obstacles = [], clocks = [], tvFurn = new Map(), clockBuf = null, clockSec = -1;
  let world, graph, nav, buf = {}, lamps = [], spills = [], items = [], doorSig = '';
  // which rooms you can look into from each room: through an open passage (no door)
  const openNext = new Map();
  for (const o of plan.openings || []) {
    if (!['open', 'passage'].includes(o.type)) continue;
    const x1 = safeNumber(o.x1), y1 = safeNumber(o.y1), x2 = safeNumber(o.x2), y2 = safeNumber(o.y2), len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const A = roomAt(plan.rooms, mx + nx * 8, my + ny * 8), B = roomAt(plan.rooms, mx - nx * 8, my - ny * 8);
    if (!A || !B || A === B) continue;
    if (!openNext.has(A.id)) openNext.set(A.id, new Set());
    if (!openNext.has(B.id)) openNext.set(B.id, new Set());
    openNext.get(A.id).add(B.id); openNext.get(B.id).add(A.id);
  }
  let itemsDirty = false;
  modelsChanged = () => { worldDirty = true; itemsDirty = true; };   // a 3D model of yours finished loading: draw it (furniture and devices)
  const S = planScale(plan) || 70, M = (v) => v / S;
  const sigOf = (h) => (plan.openings || []).filter((o) => o.entity).map((o) => `${o.entity}=${h?.states[o.entity]?.state}`).join('|');

  /** The room a device is in: where you put it on the plan; on a wall: its Home Assistant area, or the room most of its icon is in. */
  function itemRoom(it) {
    const here = roomAt(plan.rooms, safeNumber(it.x), safeNumber(it.y));
    const area = entityArea(hass, it.entity_id);
    // a device always stays in its own Home Assistant room (drawn just over the line or further: the nearest spot inside it)
    // - except well inside a drawn room that has no Home Assistant area (a dining corner drawn apart from the kitchen it belongs to)
    if (area && here && !here.area_id) {
      const x = safeNumber(it.x), y = safeNumber(it.y), m = 0.3 * S;
      if (here.rects.map(norm).some((q) => x > q[0] + m && x < q[2] - m && y > q[1] + m && y < q[3] - m)) return here;
    }
    if (area) { const r = plan.rooms.find((x) => x.area_id === area); if (r) return r; }
    if (here) return here;
    if (area) { const r = plan.rooms.find((x) => x.area_id === area); if (r) return r; }
    const x = safeNumber(it.x), y = safeNumber(it.y), half = 0.25 * S;
    let best = roomAt(plan.rooms, x, y), most = 0;
    for (const r of plan.rooms) {
      let a = 0;
      for (const q of r.rects.map(norm)) a += Math.max(0, Math.min(q[2], x + half) - Math.max(q[0], x - half)) * Math.max(0, Math.min(q[3], y + half) - Math.max(q[1], y - half));
      if (a > most) { most = a; best = r; }
    }
    return best;
  }
  /** A point on a wall line, moved just inside whichever room is nearest (for LED strips along walls). */
  function nearestInside(x, z, inset) {
    let best = [x, z], bd = Infinity;
    for (const r of plan.rooms || []) for (const q of r.rects.map(norm)) {
      const x0 = M(q[0]) + inset, z0 = M(q[1]) + inset, x1 = M(q[2]) - inset, z1 = M(q[3]) - inset;
      if (x1 < x0 || z1 < z0) continue;
      const cx = Math.max(x0, Math.min(x, x1)), cz = Math.max(z0, Math.min(z, z1)), dd = Math.hypot(cx - x, cz - z);
      if (dd < bd) { bd = dd; best = [cx, cz]; }
    }
    return bd < 0.5 ? best : [x, z];
  }
  /** The wall nearest to a point in its room: where it is and which way it runs (for things hanging on a wall). */
  function wallFrame(room, x, z) {
    let best = null;
    for (const q of (room?.rects || []).map(norm)) {
      const x0 = M(q[0]), z0 = M(q[1]), x1 = M(q[2]), z1 = M(q[3]);
      for (const [d, ux, uz, nx, nz, cx, cz] of [[Math.abs(z - z0), 1, 0, 0, 1, x, z0], [Math.abs(z1 - z), 1, 0, 0, -1, x, z1], [Math.abs(x - x0), 0, 1, 1, 0, x0, z], [Math.abs(x1 - x), 0, 1, -1, 0, x1, z]]) {
        if (!best || d < best.d) best = { d, ux, uz, nx, nz, cx: Math.max(x0, Math.min(x1, cx)), cz: Math.max(z0, Math.min(z1, cz)) };
      }
    }
    if (!best || best.d >= 0.9) return { d: 0, ux: 1, uz: 0, nx: 0, nz: 1, cx: x, cz: z, free: true };
    // the wall's surface, not its middle line: half an outer wall (24 cm) or inner wall (12 cm) into the room
    const ht = roomAt(plan.rooms, (best.cx - best.nx * 0.1) * S, (best.cz - best.nz * 0.1) * S) ? 0.06 : 0.12;
    return { ...best, cx: best.cx + best.nx * ht, cz: best.cz + best.nz * ht, ht };
  }
  /** The nearest point inside a room, at least `inset` metres from its walls. */
  function insideRoom(room, x, z, inset) {
    let best = [x, z], bd = Infinity;
    for (const q of room.rects.map(norm)) {
      const x0 = M(q[0]) + inset, z0 = M(q[1]) + inset, x1 = M(q[2]) - inset, z1 = M(q[3]) - inset;
      if (x1 < x0 || z1 < z0) continue;
      const cx = Math.max(x0, Math.min(x, x1)), cz = Math.max(z0, Math.min(z, z1)), dd = Math.hypot(cx - x, cz - z);
      if (dd < bd) { bd = dd; best = [cx, cz]; }
    }
    // only pull devices that sit on or right next to a wall; a device in the room stays exactly where it is
    return bd < 0.2 ? best : [x, z];
  }

  /** Lamps (their spot, the room their light stays in, and a small fixture to draw) and the icons. */
  function buildItems() {
    lamps = []; items = []; obstacles = []; clocks = []; tvFurn = new Map(); iconsEl.innerHTML = '';
    const tvl = tvLinks(plan, hass), rads = radiatorLinks(plan, hass);
    // what a lamp may light: exactly its own room (its walls' inner sides are inside the room's rectangle, the other
    // side of a wall is not), in up to two parts for an L-shaped room
    const lampBox = (room) => {
      if (!room) return [-1e9, -1e9, 1e9, 1e9, -1e9, -1e9, 1e9, 1e9];
      const zone = lightZone.get(room.id);
      if (zone) return zone;
      const qs = room.rects.map(norm).sort((p, q) => (q[2] - q[0]) * (q[3] - q[1]) - (p[2] - p[0]) * (p[3] - p[1])), e = 0.02;
      const box = (list) => [M(Math.min(...list.map((q) => q[0]))) - e, M(Math.min(...list.map((q) => q[1]))) - e, M(Math.max(...list.map((q) => q[2]))) + e, M(Math.max(...list.map((q) => q[3]))) + e];
      const b1 = box([qs[0]]);
      return [...b1, ...(qs.length > 1 ? box(qs.slice(1)) : b1)];
    };
    // rooms joined by a fully open passage (the wall between them is gone) light as one room: their rectangles,
    // merged where they line up, at most three boxes
    const lightZone = new Map();
    {
      const parent = new Map((plan.rooms || []).map((r) => [r.id, r.id]));
      const find = (x) => { while (parent.get(x) !== x) x = parent.get(x); return x; };
      const walls = computeWalls(plan.rooms || []);
      for (const o of plan.openings || []) {
        if (!['open', 'passage'].includes(o.type)) continue;
        const x1 = safeNumber(o.x1), y1 = safeNumber(o.y1), x2 = safeNumber(o.x2), y2 = safeNumber(o.y2), len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const A = roomAt(plan.rooms, mx + nx * 8, my + ny * 8), B = roomAt(plan.rooms, mx - nx * 8, my - ny * 8);
        if (!A || !B || A === B) continue;
        // how long the wall between them is: the opening must take (nearly) all of it
        const hor = Math.abs(y1 - y2) < Math.abs(x1 - x2), at = hor ? my : mx;
        const shared = walls.filter((w) => w.rooms?.includes(A.id) && w.rooms?.includes(B.id) && (hor ? w.y1 === w.y2 && Math.abs(w.y1 - at) < 3 : w.x1 === w.x2 && Math.abs(w.x1 - at) < 3)).reduce((t, w) => t + Math.hypot(w.x2 - w.x1, w.y2 - w.y1), 0);
        if (shared && len >= shared * 0.75) parent.set(find(A.id), find(B.id));
      }
      const groups = new Map();
      for (const r of plan.rooms || []) { const k = find(r.id); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
      for (const rs of groups.values()) {
        if (rs.length < 2) continue;
        let qs = rs.flatMap((r) => r.rects.map(norm)).map((q) => [...q]);
        // merge two rectangles that share a whole side, until nothing merges
        for (let again = true; again;) {
          again = false;
          outer: for (let i = 0; i < qs.length; i++) for (let j = i + 1; j < qs.length; j++) {
            const a = qs[i], b2 = qs[j], e = 2;
            const sameY = Math.abs(a[1] - b2[1]) < e && Math.abs(a[3] - b2[3]) < e && (Math.abs(a[2] - b2[0]) < e || Math.abs(b2[2] - a[0]) < e);
            const sameX = Math.abs(a[0] - b2[0]) < e && Math.abs(a[2] - b2[2]) < e && (Math.abs(a[3] - b2[1]) < e || Math.abs(b2[3] - a[1]) < e);
            if (sameY || sameX) { qs[i] = [Math.min(a[0], b2[0]), Math.min(a[1], b2[1]), Math.max(a[2], b2[2]), Math.max(a[3], b2[3])]; qs.splice(j, 1); again = true; break outer; }
          }
        }
        qs = qs.sort((p, q) => (q[2] - q[0]) * (q[3] - q[1]) - (p[2] - p[0]) * (p[3] - p[1])).slice(0, 3);
        const e2 = 0.02, box = (q) => [M(q[0]) - e2, M(q[1]) - e2, M(q[2]) + e2, M(q[3]) + e2];
        const bb = qs.flatMap(box);
        while (bb.length < 12) bb.push(...bb.slice(0, 4));
        for (const r of rs) lightZone.set(r.id, bb);
      }
    }
    const markers = new Mesh(), fixtures = new Mesh();
    const circle = (cx, cz, r, k = 14) => Array.from({ length: k }, (_, i) => [cx + r * Math.cos((i / k) * 2 * Math.PI), cz + r * Math.sin((i / k) * 2 * Math.PI)]);
    const DARK = [0.2, 0.2, 0.22];
    // camera walls (control room): a grid of screens with the camera pictures laid over them
    camWalls = [];
    for (const f of plan.furniture || []) {
      if (f.type !== 'videowall') continue;
      const cams = videoWallCams(f, hass);
      if (!cams.length) continue;
      const [b0, b1] = videoWallSpan(f), r0 = (safeNumber(f.rot) * Math.PI) / 180, ux = Math.cos(r0), uz = Math.sin(r0), W = M(safeNumber(f.w, 280)), D = M(safeNumber(f.h, 8)) / 2;
      const [sx, sy] = wallSnap(plan, f), tx = M(sx), tz = M(sy);
      let nx = -uz, nz = ux;   // the front: towards the middle of the room
      const rq = roomOf(tx, tz)?.rects?.map(norm)[0];
      if (rq) { const mx = M((rq[0] + rq[2]) / 2) - tx, mz = M((rq[1] + rq[3]) / 2) - tz; if (mx * nx + mz * nz < 0) { nx = -nx; nz = -nz; } }
      // as you look at it: left to right
      const sg = ux * nz - uz * nx > 0 ? 1 : -1, rx = ux * sg, rz = uz * sg;
      // the biggest 16:9 screens that fit, in a grid
      const gap = 0.035, Hh = b1 - b0, n = cams.length;
      let best = { c: 1, size: 0 };
      for (let c = 1; c <= n; c++) { const rr = Math.ceil(n / c), sw = (W - (c + 1) * gap) / c, sh = (Hh - (rr + 1) * gap) / rr, size = Math.min(sw, (sh * 16) / 9); if (size > best.size) best = { c, size }; }
      const cols = best.c, rows = Math.ceil(n / cols), sw = best.size, sh = (sw * 9) / 16;
      const gw = cols * sw + (cols - 1) * gap, gh = rows * sh + (rows - 1) * gap, d = D + 0.006;
      const P3 = (a, y) => [tx + rx * a + nx * d, y, tz + rz * a + nz * d];
      const screens = cams.map((id, i) => {
        const c = i % cols, r = Math.floor(i / cols), a0 = -gw / 2 + c * (sw + gap), y1 = b0 + Hh / 2 + gh / 2 - r * (sh + gap);
        const corners = [P3(a0, y1), P3(a0 + sw, y1), P3(a0 + sw, y1 - sh), P3(a0, y1 - sh)];
        // the screen itself glows faintly (also before its picture is there)
        const start = markers.v.length / 10, q = (aa, bb2) => [[tx + rx * aa + nx * (d - 0.002), tz + rz * aa + nz * (d - 0.002)], [tx + rx * bb2 + nx * (d - 0.002), tz + rz * bb2 + nz * (d - 0.002)], [tx + rx * bb2 + nx * (d + 0.001), tz + rz * bb2 + nz * (d + 0.001)], [tx + rx * aa + nx * (d + 0.001), tz + rz * aa + nz * (d + 0.001)]];
        markers.prism(q(a0, a0 + sw), y1 - sh, y1, [1, 1, 1]);
        lamps.push({ it: { entity_id: id }, screen: true, P: [tx + nx * 0.6, y1 - sh / 2, tz + nz * 0.6], bb: lampBox(roomOf(tx, tz)), start, count: markers.v.length / 10 - start, share: 0.6 / Math.sqrt(n) });
        const el = document.createElement('div');
        el.className = 'cs';
        // above the picture: what the camera sees (its motion / person sensor, when it has one): idle in green, motion big and red
        const motion = deviceSibling(hass, id, 'binary_sensor', /(^|_)motion($|_)|beweging/i) || deviceSibling(hass, id, 'binary_sensor', /motion/i) || deviceSibling(hass, id, 'binary_sensor', /person/i) || deviceSibling(hass, id, 'binary_sensor', /all_occupancy|occupancy/i);
        el.innerHTML = `<img alt=""><span>${esc(friendly(hass, id))}</span>${motion ? '<b class="mo"></b>' : ''}`;
        el.addEventListener('click', (ev) => { ev.stopPropagation(); if (editing || stopIfWalking()) return; const sh = $('.sheet'); if (infoIt?.entity_id === id && sh?.classList.contains('show')) hideSheet(); else showInfo({ entity_id: id }); });
        iconsEl.appendChild(el);
        return { id, corners, el, img: el.firstChild, t: 0, motion, mo: el.querySelector('.mo') };
      });
      camWalls.push({ f, screens, c: [tx + nx * d, b0 + Hh / 2, tz + nz * d] });
    }
    // appliances you drew (dishwasher, washer, dryer) linked to their entity: a status light that glows while it runs, tap = status
    const appEnt = applianceAbsorbs(plan, hass);
    for (const f of plan.furniture || []) {
      if (!['dishwasher', 'washer', 'dryer'].includes(f.type)) continue;
      const id = applianceEntity(plan, f, hass);
      if (!id) continue;
      const r0 = (safeNumber(f.rot) * Math.PI) / 180, cr = Math.cos(r0), sr = Math.sin(r0), fw = safeNumber(f.w, 42) / 2, fd = safeNumber(f.h, 42) / 2;
      const P2 = (u, v) => [M(safeNumber(f.x) + u * cr - v * sr), M(safeNumber(f.y) + u * sr + v * cr)];
      const start = markers.v.length / 10;
      markers.prism([P2(fw * 0.45, fd), P2(fw * 0.7, fd), P2(fw * 0.7, fd + 0.8), P2(fw * 0.45, fd + 0.8)], 0.77, 0.79, [1, 1, 1]);
      const pf = P2(0, fd + 6);
      lamps.push({ it: { entity_id: id }, app: f, P: [pf[0], 0.6, pf[1]], bb: lampBox(roomOf(M(safeNumber(f.x)), M(safeNumber(f.y)))), start, count: markers.v.length / 10 - start, share: 0.12 });
      tvFurn.set(f.id, { entity_id: id, app: f });
    }
    // speaker boxes linked to a player (f.media): tap = the player's buttons, a soft glow while it plays
    const boxMedia = new Set();
    for (const f of plan.furniture || []) {
      if (f.type !== 'speakerbox' || !f.media || !hass.states[f.media]) continue;
      boxMedia.add(f.media);
      if (!tvFurn.has(f.id)) tvFurn.set(f.id, { entity_id: f.media });
      lamps.push({ it: { entity_id: f.media }, boxplay: true, P: [M(safeNumber(f.x)), 0.8, M(safeNumber(f.y))], bb: lampBox(roomOf(M(safeNumber(f.x)), M(safeNumber(f.y)))), start: 0, count: 0, share: 0.15 });
    }
    // radiators linked to their thermostat: a warm glow along the top while heating, tap = temperature and buttons
    for (const f of plan.furniture || []) {
      const id = rads.byFurn.get(f.id);
      if (!id) continue;
      const r0 = (safeNumber(f.rot) * Math.PI) / 180, cr = Math.cos(r0), sr = Math.sin(r0), fw = safeNumber(f.w, 80) / 2, fd = safeNumber(f.h, 10) / 2, top = furnHeight(f) * (furnHeight(f) / (FURN_HEIGHT.radiator || 0.65) > 0 ? 1 : 1);
      const pts = [[-fw, -fd], [fw, -fd], [fw, fd], [-fw, fd]].map(([u, v]) => [M(safeNumber(f.x) + u * cr - v * sr), M(safeNumber(f.y) + u * sr + v * cr)]);
      const start = markers.v.length / 10;
      markers.prism(pts, top, top + 0.012, [1, 1, 1]);
      lamps.push({ it: { entity_id: id }, rad: true, P: [M(safeNumber(f.x)), top - 0.2, M(safeNumber(f.y))], bb: lampBox(roomOf(M(safeNumber(f.x)), M(safeNumber(f.y)))), start, count: markers.v.length / 10 - start, share: 0.3 });
      tvFurn.set(f.id, { entity_id: id });
    }
    for (const it of plan.items || []) {
      const st = hass.states[it.entity_id], d = it.entity_id.split('.')[0];
      const x = safeNumber(it.x), y = safeNumber(it.y), room = itemRoom(it);
      const lampKind = it.kind !== 'device' && (d === 'light' || it.kind === 'lamp');
      const under = furnAt(plan, x, y), own = ownHeight(it) != null;
      const ceil = lampKind && isCeilingLamp(it, st);
      // where it really is: a device drawn on a wall hangs just in front of it, in its own room
      let [px, pz] = [M(x), M(y)];
      if (room) [px, pz] = insideRoom(room, px, pz, 0.13);
      const strip = lampKind ? stripPath(it) : null;
      // kind of lamp and height: the same rule as the 2.5D view, so both always agree
      const lampType = lampKind ? lampStyle(plan, it, st) || 'other' : null;
      const h = Math.min(Math.max(deviceHeight(plan, it, st, hass), 0.05), H - 0.08);
      let P = [px, h, pz];
      const isClock = !!ringClock(it, hass);
      let hit = null;   // where the device itself can be tapped (then it needs no icon)
      // your own 3D model for this device (step 4, More options): drawn instead of the built-in one, sized for what it is
      let ownModel = false;
      const mm = it.model ? modelFor(it.model) : null;
      if (mm?.state === 'ok' && placeModelFn && modelSizeFn) {
        ownModel = true;
        const kind = lampKind ? `lamp:${lampType}` : deviceKind(it, st, hass) || mediaKind(it, hass) || d;
        // how tall such a thing usually is, and where it is: hanging from the ceiling, on the wall, or standing (on furniture or the floor)
        const DEF_H = { 'lamp:floor': 1.6, 'lamp:table': 0.5, 'lamp:pendant': 0.45, 'lamp:ceiling': 0.25, 'lamp:wall': 0.35, 'lamp:spot': 0.15, 'lamp:other': 0.45, '3dprinter': 0.5, printer: 0.4, router: 0.2, nas: 0.25, tv: 0.8, speaker: 0.3, mini: 0.12, player: 0.1, voice: 0.12, camera: 0.15, vacuum: 0.1, fan: 1.0, purifier: 0.6, thermostat: 0.12, thermo: 0.1, doorbell: 0.15, kettle: 0.25, coffee: 0.35, holofan: 0.6, tree: 1.8, plug: 0.1 };
        const mh = +it.model_h > 0 ? +it.model_h : DEF_H[kind] || 0.4;
        // standing: floor and table lamps, and devices that are usually low; anything else up high (a spot, a lamp or device
        // given a height) hangs at its height, like the built-in one
        const standing = ['lamp:floor', 'lamp:table'].includes(kind) || (!lampKind && h < 1.0 && !['camera', 'thermostat', 'thermo', 'doorbell', 'screen', 'pixeldisplay'].includes(kind));
        const hangs = ['lamp:ceiling', 'lamp:pendant'].includes(kind), onWall = !standing && !hangs;
        const base = hangs ? (kind === 'lamp:ceiling' ? H - mh : Math.max(0, Math.min(H - mh, h - mh * 0.5))) : onWall ? Math.max(0, h - mh / 2) : under ? furnHeight(under) : 0;   // standing: on the furniture under it, else the floor
        // a spot: the model turns and tips towards where its light points (a model that points down, or forward)
        let yaw = +it.rot || 0, pitch = 0;
        if (lampType === 'spot' && it.model_aim !== 'off') {
          const dv = spotDir(plan, it, h), hl = Math.hypot(dv[0], dv[2]);
          if (hl > 0.02) yaw += (Math.atan2(-dv[0] / hl, dv[2] / hl) * 180) / Math.PI;
          pitch = it.model_aim === 'forward' ? Math.asin(Math.max(-1, Math.min(1, -dv[1]))) : -Math.acos(Math.max(-1, Math.min(1, -dv[1])));
        }
        const sz = modelSizeFn(mm.model, it.up, pitch), k = mh / (sz.h || 1);
        const ff = { x: px * S, y: pz * S, rot: yaw, pitch, w: Math.max(0.02, sz.w * k) * S, h: Math.max(0.02, sz.d * k) * S, z: mh, elev: base, up: it.up };
        const mv0 = fixtures.v.length;
        placeModelFn(mm.model, ff, S, (vx, vy, vz, nx, ny, nz, r, g, b2) => fixtures.v.push(vx, vy, vz, nx, ny, nz, r, g, b2, 0));
        const mv1 = fixtures.v.length;
        hit = { c: [px, base + mh / 2, pz], r: Math.max(0.15, Math.min(0.8, Math.max(mh, sz.w * k, sz.d * k) / 2)) };
        P = [px, base + mh + 0.15, pz];
        if (lampKind) {
          // where its light comes out: a spot at the front of its head (towards its aim), others at the shade / bulb;
          // a small glowing lens there takes the lamp's real colour (and is dark when it is off)
          const sdir = lampType === 'spot' ? spotDir(plan, it, h) : null;
          // the side the light leaves by: a spot towards its aim, a ceiling lamp or pendant downwards
          const out = sdir || (hangs ? [0, -1, 0] : null);
          const g0 = markers.v.length / 10;
          let LP;
          if (out) {
            // the model's own front face on that side: the corners furthest that way, their middle and size = the lens
            const V = fixtures.v, cx0 = px, cy0 = base + mh / 2, cz0 = pz;
            let tmax = -Infinity;
            for (let i = mv0; i < mv1; i += 10) tmax = Math.max(tmax, (V[i] - cx0) * out[0] + (V[i + 1] - cy0) * out[1] + (V[i + 2] - cz0) * out[2]);
            const eps = Math.max(0.004, mh * 0.04), cap = [];
            for (let i = mv0; i < mv1; i += 10) if ((V[i] - cx0) * out[0] + (V[i + 1] - cy0) * out[1] + (V[i + 2] - cz0) * out[2] > tmax - eps) cap.push([V[i], V[i + 1], V[i + 2]]);
            const C = cap.reduce((acc, q) => [acc[0] + q[0], acc[1] + q[1], acc[2] + q[2]], [0, 0, 0]).map((v) => v / Math.max(1, cap.length));
            const lr = Math.max(0.01, Math.min(0.08, Math.max(...cap.map((q) => Math.hypot(q[0] - C[0], q[1] - C[1], q[2] - C[2])), 0) * 0.85));
            // a flat disc facing out, just in front of that face
            const n0 = nrm(out), t1 = nrm(Math.abs(n0[1]) < 0.9 ? cross(n0, [0, 1, 0]) : cross(n0, [1, 0, 0])), t2 = cross(n0, t1);
            const c0 = [C[0] + n0[0] * 0.002, C[1] + n0[1] * 0.002, C[2] + n0[2] * 0.002], K = 16;
            const rim = Array.from({ length: K }, (_, k) => { const a2 = (k / K) * 2 * Math.PI, ca = Math.cos(a2) * lr, sa = Math.sin(a2) * lr; return [c0[0] + t1[0] * ca + t2[0] * sa, c0[1] + t1[1] * ca + t2[1] * sa, c0[2] + t1[2] * ca + t2[2] * sa]; });
            for (let k = 0; k < K; k++) markers.tri(c0, rim[k], rim[(k + 1) % K], n0, [1, 1, 1], 0);
            LP = [c0[0] + n0[0] * 0.03, c0[1] + n0[1] * 0.03, c0[2] + n0[2] * 0.03];
          } else {
            LP = [px, onWall ? base + mh / 2 : base + mh * 0.8, pz];
            const lr = Math.max(0.018, Math.min(0.06, mh * 0.18));
            markers.prism(circle(LP[0], LP[2], lr, 12), LP[1] - lr * 0.4, LP[1] + lr * 0.4, [1, 1, 1]);
          }
          lamps.push({ it, P: LP, bb: lampBox(room), start: g0, count: markers.v.length / 10 - g0, share: 1, down: hangs && lampType === 'pendant', dir: sdir || undefined });
        }
        if (!['lamp:floor', 'lamp:table'].includes(kind) && !hangs && !onWall && !under) obstacles.push([px, pz, Math.max(sz.w, sz.d) * k * 0.5 + 0.1]);
      }
      /**
       * Things recognised by name and make (applianceKind): drawn as what they are. lit = it is a lamp (its
       * glowing parts light up with it). Returns where its light is.
       */
      const drawThing = (k, lit) => {
        const fr = wallFrame(room, px, pz), near = !fr.free && fr.d < 0.45, u = near ? [fr.ux, fr.uz] : [1, 0], n = near ? [fr.nx, fr.nz] : [0, 1];
        // turned yourself (it.rot, degrees): the whole thing turns about its own middle
        if (+it.rot) { const r0 = (+it.rot * Math.PI) / 180, c0 = Math.cos(r0), s0 = Math.sin(r0); [u[0], u[1]] = [u[0] * c0 - u[1] * s0, u[0] * s0 + u[1] * c0]; [n[0], n[1]] = [n[0] * c0 - n[1] * s0, n[0] * s0 + n[1] * c0]; }
        const kh = { irhub: 0.03, alarmhub: 0.05, '3dprinter': 0.25, syncbox: 0.03, kettle: 0.12, coffee: 0.18, nas: 0.1, router: 0.04, printer: 0.15, dishwasher: 0.42, washer: 0.43, dryer: 0.43, powerstrip: 0.03, tree: 0.9 }[k];
        let base = kh != null ? Math.max(0, h - kh) : 0; const glow = lit ? markers : fixtures, GLW = lit ? [1, 1, 1] : [0.85, 0.85, 0.8];
        // an upright box: centre (cx, cz), a0..a1 along the wall, d0..d1 out from it
        const ob = (cx, cz, a0, a1, d0, d1, y0, y1, col, mesh = fixtures) => mesh.prism([[cx + u[0] * a0 + n[0] * d0, cz + u[1] * a0 + n[1] * d0], [cx + u[0] * a1 + n[0] * d0, cz + u[1] * a1 + n[1] * d0], [cx + u[0] * a1 + n[0] * d1, cz + u[1] * a1 + n[1] * d1], [cx + u[0] * a0 + n[0] * d1, cz + u[1] * a0 + n[1] * d1]], y0, y1, col);
        // a flat round thing facing into the room (a door, a fan disc), as thin rows
        const disc = (cx, cz, yc, r, d0, d1, col, mesh = fixtures, hole = 0) => { for (let y = -r; y < r; y += 0.025) { const yy = y + 0.0125, w = Math.sqrt(Math.max(0, r * r - yy * yy)), wi = hole > Math.abs(yy) ? Math.sqrt(hole * hole - yy * yy) : 0; if (wi) { ob(cx, cz, -w, -wi, d0, d1, yc + y, yc + y + 0.025, col, mesh); ob(cx, cz, wi, w, d0, d1, yc + y, yc + y + 0.025, col, mesh); } else ob(cx, cz, -w, w, d0, d1, yc + y, yc + y + 0.025, col, mesh); } };
        // where it stands: against its wall (depth D) or where it was put
        const at = (D) => (near ? [fr.cx + n[0] * (D / 2 + 0.01), fr.cz + n[1] * (D / 2 + 0.01)] : [px, pz]);
        const wallP = [fr.free ? px : fr.cx, fr.free ? pz : fr.cz];
        const WH = [0.94, 0.94, 0.93], GR = [0.62, 0.63, 0.65], DK = [0.16, 0.16, 0.17], ST = [0.72, 0.73, 0.75];
        const set = (c, r, iconY) => { hit = { c, r }; P = [c[0] + n[0] * 0.05, iconY, c[2] + n[1] * 0.05]; };
        if (k === '3dprinter') {
          const big = /h2d|h2s|x1e|core ?one/i.test(`${it.entity_id} ${st?.attributes?.friendly_name || ''}`), W = big ? 0.25 : 0.2, D = big ? 0.5 : 0.42, Hh = big ? 0.6 : 0.46, [cx, cz] = at(D);
          const F = [0.2, 0.2, 0.21];
          for (const [a0, d0] of [[-W, -D / 2], [W - 0.03, -D / 2], [-W, D / 2 - 0.03], [W - 0.03, D / 2 - 0.03]]) ob(cx, cz, a0, a0 + 0.03, d0, d0 + 0.03, base, base + Hh, F);
          ob(cx, cz, -W, W, -D / 2, D / 2, base, base + 0.08, F); ob(cx, cz, -W, W, -D / 2, D / 2, base + Hh - 0.04, base + Hh, F);
          ob(cx, cz, -W, W, -D / 2, -D / 2 + 0.02, base + 0.08, base + Hh - 0.04, F);                      // back
          ob(cx, cz, -W + 0.03, W - 0.03, D / 2 - 0.012, D / 2 - 0.004, base + 0.08, base + Hh - 0.04, [0.32, 0.35, 0.4]);   // glass door
          ob(cx, cz, -W + 0.05, W - 0.05, -D / 2 + 0.06, D / 2 - 0.06, base + 0.12, base + 0.13, [0.25, 0.25, 0.27]);       // bed
          ob(cx, cz, -W + 0.04, W - 0.04, -D / 2 + 0.05, -D / 2 + 0.07, base + Hh - 0.08, base + Hh - 0.05, GLW, glow);   // chamber light
          set([cx, base + Hh / 2, cz], Math.max(W, D / 2) + 0.05, base + Hh + 0.2);
          return [cx, base + Hh - 0.1, cz];
        }
        if (k === 'holofan') {
          const [cx, cz] = [wallP[0] + n[0] * 0.06, wallP[1] + n[1] * 0.06];
          ob(cx, cz, -0.03, 0.03, -0.06, 0.0, h - 0.03, h + 0.03, DK);
          disc(cx, cz, h, 0.3, 0.0, 0.006, GLW, glow, 0.04);
          set([cx, h, cz], 0.32, h + 0.45);
          // what it shows (its image entity: the clip playing now, or the last one) as the picture on the spinning disc
          const imgId = deviceImage(hass, it.entity_id);
          if (imgId) {
            const rg = [n[1], -n[0]], R0 = 0.3, C3 = [cx + n[0] * 0.012, h, cz + n[1] * 0.012];
            const P3 = (a, y) => [C3[0] + rg[0] * a, y, C3[2] + rg[1] * a];
            const el = document.createElement('div');
            el.className = 'cs holo';
            el.innerHTML = '<img alt="">';
            el.addEventListener('click', (ev) => { ev.stopPropagation(); if (!editing && !stopIfWalking()) showInfo(it); });
            iconsEl.appendChild(el);
            camWalls.push({ f: null, c: C3, screens: [{ id: imgId, holo: it.entity_id, corners: [P3(-R0, h + R0), P3(R0, h + R0), P3(R0, h - R0), P3(-R0, h - R0)], el, img: el.firstChild, t: 0 }] });
          }
          return [cx + n[0] * 0.1, h, cz + n[1] * 0.1];
        }
        if (k === 'tree') {
          const G = [0.12, 0.34, 0.17], tall = Math.max(1.2, Math.min(2.4, h * 1.6));
          base = under && !own ? furnHeight(under) : 0;
          fixtures.box(px - 0.15, pz - 0.15, px + 0.15, pz + 0.15, base, base + 0.25, [0.45, 0.3, 0.2]);
          const layers = 5;
          for (let i = 0; i < layers; i++) {
            const y0 = base + 0.25 + ((tall - 0.35) * i) / layers, r0 = 0.55 * (1 - i / layers) + 0.08;
            fixtures.prism(circle(px, pz, r0, 16), y0, y0 + 0.12, G); fixtures.prism(circle(px, pz, r0 * 0.75, 14), y0 + 0.12, y0 + (tall - 0.35) / layers + 0.04, G);
            for (let j = 0; j < 6; j++) { const an = j * 1.05 + i * 0.5, lx = px + Math.cos(an) * (r0 + 0.01), lz = pz + Math.sin(an) * (r0 + 0.01); glow.prism(circle(lx, lz, 0.02, 6), y0 + 0.1, y0 + 0.14, GLW); }
          }
          glow.prism(circle(px, pz, 0.05, 5), base + tall - 0.1, base + tall, lit ? GLW : [0.85, 0.7, 0.2]);
          obstacles.push([px, pz, 0.6]);
          set([px, base + tall / 2, pz], 0.6, base + tall + 0.15);
          return [px, base + tall * 0.55, pz];
        }
        if (k === 'hood') {
          // above the hob or cooker in this room, else against the wall
          const hob = (plan.furniture || []).filter((f) => ['hob', 'stove'].includes(f.type) && roomOf(M(safeNumber(f.x)), M(safeNumber(f.y))) === room).sort((a, b) => Math.hypot(M(safeNumber(a.x)) - px, M(safeNumber(a.y)) - pz) - Math.hypot(M(safeNumber(b.x)) - px, M(safeNumber(b.y)) - pz))[0];
          let cx = wallP[0] + n[0] * 0.26, cz = wallP[1] + n[1] * 0.26;
          if (hob) { const hx = M(safeNumber(hob.x)), hz = M(safeNumber(hob.y)), f2 = wallFrame(room, hx, hz); cx = hx; cz = hz; if (!f2.free && f2.d < 0.8) { u[0] = f2.ux; u[1] = f2.uz; n[0] = f2.nx; n[1] = f2.nz; } }
          ob(cx, cz, -0.3, 0.3, -0.25, 0.25, 1.62, 1.72, ST); ob(cx, cz, -0.13, 0.13, -0.25, -0.03, 1.72, H, ST);
          set([cx, 1.67, cz], 0.35, 1.95);
          return [cx, 1.6, cz];
        }
        if (k === 'kettle') { fixtures.prism(circle(px, pz, 0.085, 14), base, base + 0.02, DK); fixtures.prism(circle(px, pz, 0.075, 14), base + 0.02, base + 0.24, WH); fixtures.box(px + 0.07, pz - 0.012, px + 0.1, pz + 0.012, base + 0.06, base + 0.2, DK); set([px, base + 0.12, pz], 0.15, base + 0.45); return [px, base + 0.15, pz]; }
        if (k === 'coffee') { const [cx, cz] = at(0.36); ob(cx, cz, -0.12, 0.12, -0.18, 0.18, base, base + 0.36, DK); ob(cx, cz, -0.06, 0.06, 0.18, 0.2, base + 0.12, base + 0.2, GR); set([cx, base + 0.18, cz], 0.22, base + 0.55); return [cx, base + 0.2, cz]; }
        if (k === 'dishwasher' || k === 'washer' || k === 'dryer') {
          const [cx, cz] = at(0.6), Hh = k === 'dishwasher' ? 0.82 : 0.85;
          ob(cx, cz, -0.3, 0.3, -0.3, 0.3, base, base + Hh, WH);
          if (k !== 'dishwasher') { disc(cx, cz, base + 0.48, 0.18, 0.3, 0.312, GR, fixtures, 0.13); disc(cx, cz, base + 0.48, 0.13, 0.3, 0.306, [0.3, 0.33, 0.38]); ob(cx, cz, -0.27, 0.27, 0.3, 0.31, base + Hh - 0.12, base + Hh - 0.03, [0.85, 0.86, 0.87]); }
          else ob(cx, cz, -0.27, 0.27, 0.3, 0.31, base + Hh - 0.1, base + Hh - 0.03, GR);
          obstacles.push([cx, cz, 0.38]);
          set([cx, base + Hh / 2, cz], 0.42, base + Hh + 0.25);
          return [cx, base + Hh, cz];
        }
        if (k === 'powerstrip') { const [cx, cz] = at(0.06); ob(cx, cz, -0.16, 0.16, -0.03, 0.03, base, base + 0.04, WH); for (let i = -2; i <= 2; i++) ob(cx, cz, i * 0.055 - 0.015, i * 0.055 + 0.015, -0.02, 0.02, base + 0.04, base + 0.042, DK); set([cx, base + 0.03, cz], 0.18, base + 0.3); return [cx, base, cz]; }
        if (k === 'inverter') { const [cx, cz] = [wallP[0], wallP[1]]; ob(cx, cz, -0.23, 0.23, 0, 0.18, h - 0.28, h + 0.28, [0.82, 0.83, 0.84]); ob(cx, cz, -0.06, 0.06, 0.18, 0.185, h + 0.08, h + 0.15, DK); set([cx + n[0] * 0.1, h, cz + n[1] * 0.1], 0.32, h + 0.5); return [cx, h, cz]; }
        if (k === 'nas') { const [cx, cz] = at(0.23); ob(cx, cz, -0.05, 0.05, -0.115, 0.115, base, base + 0.17, DK); for (let i = 0; i < 3; i++) ob(cx, cz, -0.035 + i * 0.03, -0.025 + i * 0.03, 0.115, 0.118, base + 0.13, base + 0.14, [0.3, 0.75, 0.4]); set([cx, base + 0.09, cz], 0.15, base + 0.35); return [cx, base, cz]; }
        if (k === 'router') { const [cx, cz] = at(0.16); ob(cx, cz, -0.12, 0.12, -0.08, 0.08, base, base + 0.035, WH); for (const a0 of [-0.1, -0.035, 0.035, 0.1]) ob(cx, cz, a0 - 0.006, a0 + 0.006, -0.085, -0.075, base + 0.035, base + 0.2, DK); set([cx, base + 0.08, cz], 0.18, base + 0.4); return [cx, base, cz]; }
        if (k === 'printer') { const [cx, cz] = at(0.4); ob(cx, cz, -0.22, 0.22, -0.2, 0.2, base, base + 0.3, [0.3, 0.3, 0.32]); ob(cx, cz, -0.18, 0.18, 0.2, 0.32, base + 0.08, base + 0.1, [0.85, 0.85, 0.86]); set([cx, base + 0.15, cz], 0.3, base + 0.5); return [cx, base, cz]; }
        // a smoke / gas detector: a white disc on the ceiling with a small light (red when it goes off)
        if (k === 'smoke') { const alarm = st?.state === 'on'; fixtures.prism(circle(px, pz, 0.06, 16), H - 0.045, H - 0.002, WH); (alarm ? markers : fixtures).prism(circle(px, pz, 0.008, 8), H - 0.05, H - 0.045, alarm ? [1, 0.2, 0.15] : [0.3, 0.75, 0.35]); set([px, H - 0.03, pz], 0.12, H - 0.25); return [px, H - 0.05, pz]; }
        // a water leak sensor: a small white puck on the floor (blue light when it is wet)
        if (k === 'leak') { const wet = st?.state === 'on'; fixtures.prism(circle(px, pz, 0.035, 12), 0, 0.02, WH); (wet ? markers : fixtures).prism(circle(px, pz, 0.006, 6), 0.02, 0.022, wet ? [0.3, 0.6, 1] : [0.6, 0.6, 0.62]); set([px, 0.02, pz], 0.1, 0.25); return [px, 0.02, pz]; }
        // a universal remote / IR hub (Harmony, Broadlink): a small dark puck with a blue light
        if (k === 'irhub') { const [cx, cz] = at(0.12); fixtures.prism(circle(cx, cz, 0.055, 14), base, base + 0.03, DK); glow.prism(circle(cx, cz, 0.012, 8), base + 0.03, base + 0.033, [0.4, 0.6, 1]); set([cx, base + 0.02, cz], 0.12, base + 0.25); return [cx, base + 0.03, cz]; }
        // an alarm base station (Eufy HomeBase, Ajax hub...): a white box with a light ring on top
        if (k === 'alarmhub') { const [cx, cz] = at(0.14); ob(cx, cz, -0.07, 0.07, -0.07, 0.07, base, base + 0.05, WH); glow.prism(circle(cx, cz, 0.04, 14), base + 0.05, base + 0.054, lit ? [1, 1, 1] : [0.35, 0.75, 0.45]); set([cx, base + 0.03, cz], 0.13, base + 0.28); return [cx, base + 0.05, cz]; }
        // a button pusher (Fingerbot, SwitchBot Bot): a little box on the wall switch
        if (k === 'fingerbot') { const [cx, cz] = [wallP[0], wallP[1]]; ob(cx, cz, -0.022, 0.022, 0, 0.03, h - 0.02, h + 0.02, WH); ob(cx, cz, -0.008, 0.008, 0.03, 0.036, h - 0.012, h + 0.004, DK); set([cx + n[0] * 0.03, h, cz + n[1] * 0.03], 0.08, h + 0.2); return [cx, h, cz]; }
        // a siren: a red dome on the wall, glowing while it sounds
        if (k === 'siren') { const [cx, cz] = [wallP[0], wallP[1]], on = st?.state === 'on'; ob(cx, cz, -0.06, 0.06, 0, 0.02, h - 0.06, h + 0.06, WH); for (let i = 0; i < 4; i++) ob(cx, cz, -0.045 + i * 0.008, 0.045 - i * 0.008, 0.02 + i * 0.012, 0.032 + i * 0.012, h - 0.045 + i * 0.008, h + 0.045 - i * 0.008, on ? [1, 0.25, 0.2] : [0.7, 0.12, 0.1], on ? markers : fixtures); set([cx + n[0] * 0.05, h, cz + n[1] * 0.05], 0.1, h + 0.25); return [cx, h, cz]; }
        if (k === 'syncbox') { fixtures.box(px - 0.08, pz - 0.05, px + 0.08, pz + 0.05, base, base + 0.03, DK); set([px, base + 0.02, pz], 0.12, base + 0.25); return [px, base, pz]; }
        if (k === 'screen') {
          const [cx, cz] = [wallP[0], wallP[1]], down = screenDown(it, st), W = 0.9;
          ob(cx, cz, -W - 0.06, W + 0.06, 0.02, 0.1, H - 0.1, H - 0.02, WH);
          if (down > 0.02) ob(cx, cz, -W, W, 0.055, 0.06, H - 0.1 - 1.5 * down, H - 0.1, [0.97, 0.97, 0.96]);
          set([cx + n[0] * 0.06, H - 0.1 - 0.75 * Math.max(down, 0.1), cz + n[1] * 0.06], 0.45, H - 0.15);
          return [cx, H - 0.5, cz];
        }
        if (k === 'pixeldisplay') { const [cx, cz] = [wallP[0], wallP[1]]; ob(cx, cz, -0.17, 0.17, 0, 0.03, h - 0.1, h + 0.1, DK); for (let i = 0; i < 16; i++) ob(cx, cz, -0.16 + i * 0.02, -0.145 + i * 0.02, 0.03, 0.033, h - 0.06 + (i % 3) * 0.03, h - 0.045 + (i % 3) * 0.03, [[0.9, 0.3, 0.3], [0.3, 0.8, 0.4], [0.3, 0.5, 0.95]][i % 3]); set([cx + n[0] * 0.03, h, cz + n[1] * 0.03], 0.2, h + 0.3); return [cx, h, cz]; }
        if (k === 'thermo') { const [cx, cz] = [wallP[0], wallP[1]]; ob(cx, cz, -0.045, 0.045, 0, 0.022, h - 0.045, h + 0.045, WH); ob(cx, cz, -0.032, 0.032, 0.022, 0.025, h - 0.02, h + 0.03, [0.55, 0.62, 0.58]); set([cx + n[0] * 0.03, h, cz + n[1] * 0.03], 0.13, h + 0.3); return [cx, h, cz]; }
        if (k === 'doorbell') { const [cx, cz] = [wallP[0], wallP[1]]; ob(cx, cz, -0.025, 0.025, 0, 0.025, h - 0.075, h + 0.075, DK); ob(cx, cz, -0.012, 0.012, 0.025, 0.03, h - 0.05, h - 0.026, [0.3, 0.6, 0.9]); set([cx + n[0] * 0.03, h, cz + n[1] * 0.03], 0.14, h + 0.3); return [cx, h, cz]; }
        return null;
      };
      if (lampKind && !isClock && !ownModel) {   // a ring clock is drawn as its ring, not as a lamp
        let bb = lampBox(room);
        const start = markers.v.length / 10, livePieces = [];
        let lightY = h, lampPushed = false;
        if (lampType === 'strip') {
          // an LED strip: a thin glowing band along the drawn line, lighting the room at a few points along it
          // a strip drawn on a wall line runs just in front of that wall, inside its own room
          // (per point the nearest room: a strip along the wall of two rooms stays whole)
          let pts = strip.map(([sx, sy]) => nearestInside(M(sx), M(sy), 0.13));
          const tw = 0.014;
          // a frame: only its width counts (first to last point) - a U drawn on the plan for "left, top, right" gives the same frame
          if (['frame', 'frame3'].includes(it.strip_dir) && pts.length > 2) pts = [pts[0], pts[pts.length - 1]];
          // a frame that is nearly straight stands straight (along the wall, not a little askew)
          if (['frame', 'frame3'].includes(it.strip_dir)) {
            const [p0, p1] = [pts[0], pts[pts.length - 1]], dx = p1[0] - p0[0], dz = p1[1] - p0[1];
            if (Math.abs(dz) < Math.abs(dx) * 0.3) { const z = (p0[1] + p1[1]) / 2; pts = [[p0[0], z], [p1[0], z]]; }
            else if (Math.abs(dx) < Math.abs(dz) * 0.3) { const x = (p0[0] + p1[0]) / 2; pts = [[x, p0[1]], [x, p1[1]]]; }
          }
          // the strip in 3D: lying along the line at its height, standing upright at each point, or a frame all round
          const dir = it.strip_dir, top = Math.max(h + 0.05, Math.min(H - 0.02, stripTop(it)));
          const segs3 = dir === 'up' ? pts.map(([x, z]) => [[x, h, z], [x, top, z]])
            : dir === 'frame' || dir === 'frame3' ? [[[pts[0][0], h, pts[0][1]], [pts[0][0], top, pts[0][1]]], ...pts.slice(1).map((q, k) => [[pts[k][0], top, pts[k][1]], [q[0], top, q[1]]]),
              [[pts[pts.length - 1][0], top, pts[pts.length - 1][1]], [pts[pts.length - 1][0], h, pts[pts.length - 1][1]]], ...(dir === 'frame' ? pts.slice(1).map((q, k) => [[q[0], h, q[1]], [pts[k][0], h, pts[k][1]]]).reverse() : [])]
            : pts.slice(1).map((q, k) => [[pts[k][0], h, pts[k][1]], [q[0], h, q[1]]]);
          // a frame: which side each part is (left, top, right, bottom), so WLED segments can each light their own side
          const nTop = pts.length - 1, sideOf = (si) => (si === 0 ? 0 : si <= nTop ? 1 : si === nTop + 1 ? 2 : 3);
          // one piece of glowing band from a to b (lying: a flat band; standing: a thin upright bar)
          const band = (a, b) => {
            if (Math.abs(a[1] - b[1]) < 1e-6) { const L = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1, nx = (-(b[2] - a[2]) / L) * tw, nz = ((b[0] - a[0]) / L) * tw; markers.prism([[a[0] + nx, a[2] + nz], [b[0] + nx, b[2] + nz], [b[0] - nx, b[2] - nz], [a[0] - nx, a[2] - nz]], a[1] - 0.012, a[1] + 0.012, [1, 1, 1]); }
            else markers.prism([[a[0] - tw, a[2] - tw], [a[0] + tw, a[2] - tw], [a[0] + tw, a[2] + tw], [a[0] - tw, a[2] + tw]], Math.min(a[1], b[1]), Math.max(a[1], b[1]), [1, 1, 1]);
          };
          const lens3 = segs3.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])), tot3 = lens3.reduce((a, b) => a + b, 0) || 1;
          if (isWled(it)) {
            // a WLED strip: small pieces, each shows the colour of its own LEDs live (in the order of the strip)
            const K = Math.max(2, Math.min(96, Math.round(tot3 / 0.04))), framed = dir === 'frame' || dir === 'frame3';
            // a frame with as many WLED segments as sides: every side shows its own segment; else spread by length
            const nSides = dir === 'frame' ? 4 : 3, segLens = (liveSegs.get(it.entity_id) || []).filter((n) => n > 0);
            const sideLen = [0, 0, 0, 0]; segs3.forEach((_, si) => { sideLen[sideOf(si)] += lens3[si]; });
            const sideFr = framed && segLens.length === nSides ? (() => { const t = segLens.reduce((a, b) => a + b, 0); let c = 0; return segLens.map((n) => { const r = [c / t, (c + n) / t]; c += n; return r; }); })() : null;
            const doneInSide = [0, 0, 0, 0];
            let acc = 0;
            segs3.forEach(([a, b], si) => {
              const k = Math.max(1, Math.round((K * lens3[si]) / tot3)), sd = sideOf(si);
              for (let j2 = 0; j2 < k; j2++) {
                const t0 = j2 / k, t1 = (j2 + 1) / k, A = a.map((v, c) => v + (b[c] - v) * t0), B = a.map((v, c) => v + (b[c] - v) * t1), p0 = markers.v.length / 10;
                band(A, B);
                const along = acc + lens3[si] * ((j2 + 0.5) / k);
                const f = sideFr ? sideFr[sd][0] + (sideFr[sd][1] - sideFr[sd][0]) * ((doneInSide[sd] + lens3[si] * ((j2 + 0.5) / k)) / (sideLen[sd] || 1)) : along / tot3;
                livePieces.push({ start: p0, count: markers.v.length / 10 - p0, f, full: framed });
              }
              doneInSide[sd] += lens3[si];
              acc += lens3[si];
            });
          } else segs3.forEach(([a, b]) => band(a, b));
          const total = pathLength(pts), n = Math.max(1, Math.min(4, Math.round(total / 1.2)));
          for (let k = 1; k < n; k++) {
            let left = (total * k) / n, q = pts[0];
            for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d >= left) { q = [pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * left) / d, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * left) / d]; break; } left -= d; }
            lamps.push({ it, P: [q[0], dir ? (h + top) / 2 : h, q[1]], bb, start: 0, count: 0, share: 1 / Math.sqrt(n) });
          }
          const mid = pathMid(pts), ym = dir ? (h + top) / 2 : h;
          lightY = ym; P = [mid[0], dir ? top + 0.12 : h, mid[1]];
          hit = { line: pts.length > 1 ? pts : [pts[0], pts[0]], y: ym, r: 0.14, ry: dir ? Math.max(0.14, (top - h) / 2 + 0.05) : 0.14 };
          px = mid[0]; pz = mid[1];
        } else if (lampType === 'spot') {
          // a spot: a small housing, its lens facing where it is aimed, and a beam of light that way
          const dir = spotDir(plan, it, h);
          fixtures.prism(circle(px, pz, 0.06, 10), h - 0.02, Math.min(H - 0.005, h + 0.1), [0.15, 0.15, 0.16]);
          const lx = px + dir[0] * 0.07, ly = h + dir[1] * 0.07, lz = pz + dir[2] * 0.07;
          markers.prism(circle(lx, lz, 0.045, 10), ly - 0.015, ly + 0.015, [1, 1, 1]);
          lightY = ly; P = [px, h, pz];
          lamps.push({ it, P: [lx, ly, lz], bb, start, count: markers.v.length / 10 - start, dir });
          hit = { c: [px, h + 0.03, pz], r: 0.2 };
          lampPushed = true;
        } else {
          // every other lamp looks like its icon (and name): see lampShape
          const shape = lampShape(plan, it, st, hass), W1 = [0.93, 0.93, 0.92], WOOD = [0.55, 0.4, 0.28], GL = [1, 1, 1];
          const fr = wallFrame(room, px, pz), wx = fr.free ? px : fr.cx, wz = fr.free ? pz : fr.cz;
          // on the wall: a..b along it, d0..d1 out into the room
          const wq = (a, b, d0, d1) => [[wx + fr.ux * a + fr.nx * d0, wz + fr.uz * a + fr.nz * d0], [wx + fr.ux * b + fr.nx * d0, wz + fr.uz * b + fr.nz * d0], [wx + fr.ux * b + fr.nx * d1, wz + fr.uz * b + fr.nz * d1], [wx + fr.ux * a + fr.nx * d1, wz + fr.uz * a + fr.nz * d1]];
          const wallAt = (dd, y, r) => { hit = { c: [wx + fr.nx * dd, y, wz + fr.nz * dd], r }; P = [wx + fr.nx * (dd + 0.12), y + r + 0.1, wz + fr.nz * (dd + 0.12)]; lightY = y; lx0 = wx + fr.nx * (dd + 0.25); lz0 = wz + fr.nz * (dd + 0.25); };
          // a lamp that stands somewhere with nothing drawn under it gets a small side table
          const standOn = (base) => { if (base > 0.12 && !under) { fixtures.prism(circle(px, pz, 0.2, 18), base - 0.025, base, WOOD); fixtures.box(px - 0.02, pz - 0.02, px + 0.02, pz + 0.02, 0, base - 0.025, WOOD); fixtures.prism(circle(px, pz, 0.14, 14), 0, 0.02, WOOD); obstacles.push([px, pz, 0.22]); } };
          let lx0 = px, lz0 = pz;
          const thing = THINGS.has(shape) ? drawThing(shape, true) : null;
          if (thing) { lightY = thing[1]; lx0 = thing[0]; lz0 = thing[2]; }
          else if (shape === 'boxglow') {
            // light in speaker boxes: a glowing band at the bottom and the top of their fronts
            let cx = 0, cz = 0, ty = 0;
            const boxes = speakerBoxes(plan, it, st);
            for (const f of boxes) {
              const r0 = (safeNumber(f.rot) * Math.PI) / 180, cr = Math.cos(r0), sr = Math.sin(r0), fw = safeNumber(f.w, 22) / 2, fd = safeNumber(f.h, 26) / 2, top = furnHeight(f);
              const q = (v0, v1) => [[-fw + 1, v0], [fw - 1, v0], [fw - 1, v1], [-fw + 1, v1]].map(([u, v]) => [M(safeNumber(f.x) + u * cr - v * sr), M(safeNumber(f.y) + u * sr + v * cr)]);
              markers.prism(q(fd, fd + 0.6), 0.03, 0.06, GL); markers.prism(q(fd, fd + 0.6), top - 0.05, top - 0.02, GL);
              cx += M(safeNumber(f.x)); cz += M(safeNumber(f.y)); ty = top;
            }
            cx /= boxes.length; cz /= boxes.length;
            lightY = ty / 2; lx0 = cx; lz0 = cz;
            hit = { c: [M(safeNumber(boxes[0].x)), ty / 2, M(safeNumber(boxes[0].y))], r: 0.3 }; P = [cx, ty + 0.3, cz];
          }
          else if (shape === 'ambilight') {
            // a glowing frame on the back of the TV it belongs to
            const tf = ambilightTv(plan, it, st), r0 = (safeNumber(tf.rot) * Math.PI) / 180, cr = Math.cos(r0), sr = Math.sin(r0), fw = M(safeNumber(tf.w, 100)) / 2, [s0, s1] = tvScreen(tf, S, plan);
            const tx = M(safeNumber(tf.x)), tz = M(safeNumber(tf.y)), ux = cr, uz = sr;
            let nx = -sr, nz = cr;
            const rq = (room || roomOf(tx, tz))?.rects?.map(norm)[0];
            if (rq) { const mx = M((rq[0] + rq[2]) / 2) - tx, mz = M((rq[1] + rq[3]) / 2) - tz; if (mx * nx + mz * nz > 0) { nx = -nx; nz = -nz; } }   // n = the back, away from the room
            const q = (a0, a1, d0, d1) => [[tx + ux * a0 + nx * d0, tz + uz * a0 + nz * d0], [tx + ux * a1 + nx * d0, tz + uz * a1 + nz * d0], [tx + ux * a1 + nx * d1, tz + uz * a1 + nz * d1], [tx + ux * a0 + nx * d1, tz + uz * a0 + nz * d1]];
            // around the edge of the screen, just in front of it (a TV against the wall would hide a frame behind it)
            const e = 0.045, d0 = -0.032, d1 = -0.024;
            if (isWled(it)) {
              // WLED ambilight: the frame in small pieces that each show their own LEDs live; the order goes round as you
              // look at the TV: up the left side, along the top, down the right side, back along the bottom
              const rx = -nz, rz = nx, lsgn = ux * rx + uz * rz > 0 ? -1 : 1;   // which end of the TV is on the viewer's left
              const sides = ambilightSides(liveSegs.get(it.entity_id), 2 * fw, s1 - s0), K = [10, 18, 10, 18];
              const piece = (k, f) => { const p0 = markers.v.length / 10; k(); livePieces.push({ start: p0, count: markers.v.length / 10 - p0, f, amb: true }); };
              const L0 = lsgn * (fw + e / 2), R0 = -L0;
              for (let side = 0; side < 4; side++) {
                const [fa, fb] = sides[side], n = K[side];
                for (let i = 0; i < n; i++) {
                  const t0 = i / n, t1 = (i + 1) / n, f = fa + (fb - fa) * ((i + 0.5) / n);
                  if (side === 0) piece(() => markers.prism(q(Math.min(L0 - e / 2, L0 + e / 2), Math.max(L0 - e / 2, L0 + e / 2), d0, d1), s0 + (s1 - s0) * t0, s0 + (s1 - s0) * t1, GL), f);
                  else if (side === 2) piece(() => markers.prism(q(Math.min(R0 - e / 2, R0 + e / 2), Math.max(R0 - e / 2, R0 + e / 2), d0, d1), s1 - (s1 - s0) * t1, s1 - (s1 - s0) * t0, GL), f);
                  else {
                    // top: from the viewer's left to right; bottom: back from right to left
                    const a0 = side === 1 ? L0 + (R0 - L0) * t0 : R0 + (L0 - R0) * t0, a1 = side === 1 ? L0 + (R0 - L0) * t1 : R0 + (L0 - R0) * t1;
                    piece(() => markers.prism(q(Math.min(a0, a1), Math.max(a0, a1), d0, d1), side === 1 ? s1 : s0 - e, side === 1 ? s1 + e : s0, GL), f);
                  }
                }
              }
            } else {
              markers.prism(q(-fw - e, fw + e, d0, d1), s1, s1 + e, GL); markers.prism(q(-fw - e, fw + e, d0, d1), s0 - e, s0, GL);
              markers.prism(q(-fw - e, -fw, d0, d1), s0, s1, GL); markers.prism(q(fw, fw + e, d0, d1), s0, s1, GL);
            }
            lightY = (s0 + s1) / 2; lx0 = tx - nx * 0.15; lz0 = tz - nz * 0.15;
            hit = { line: [[tx - ux * fw + nx * 0.04, tz - uz * fw + nz * 0.04], [tx + ux * fw + nx * 0.04, tz + uz * fw + nz * 0.04]], y: s1 + 0.04, r: 0.07 };
            P = [tx, s1 + 0.2, tz];
          }
          else if (shape === 'ceiling') { markers.prism(circle(px, pz, 0.17), H - 0.07, H - 0.005, GL); lightY = H - 0.25; P = [px, H - 0.12, pz]; }
          else if (shape === 'downlight') { fixtures.prism(circle(px, pz, 0.06, 14), H - 0.012, H - 0.002, W1); markers.prism(circle(px, pz, 0.045, 12), H - 0.016, H - 0.011, GL); lightY = H - 0.3; P = [px, H - 0.12, pz]; hit = { c: [px, H - 0.05, pz], r: 0.18 }; }
          else if (shape === 'chandelier') {
            fixtures.box(px - 0.006, pz - 0.006, px + 0.006, pz + 0.006, h + 0.1, H, DARK);
            fixtures.prism(circle(px, pz, 0.04, 10), h - 0.05, h + 0.1, [0.75, 0.62, 0.3]);
            for (let k = 0; k < 6; k++) {
              const an = (k * Math.PI) / 3, c = Math.cos(an), sn = Math.sin(an), tx = px + c * 0.3, tz = pz + sn * 0.3;
              fixtures.prism([[px - sn * 0.008, pz + c * 0.008], [tx - sn * 0.008, tz + c * 0.008], [tx + sn * 0.008, tz - c * 0.008], [px + sn * 0.008, pz - c * 0.008]], h - 0.02, h, [0.75, 0.62, 0.3]);
              fixtures.prism(circle(tx, tz, 0.022, 8), h, h + 0.02, [0.75, 0.62, 0.3]);
              markers.prism(circle(tx, tz, 0.016, 8), h + 0.02, h + 0.09, GL);
            }
            lightY = h; P = [px, h + 0.25, pz]; hit = { c: [px, h + 0.03, pz], r: 0.36 };
          } else if (shape === 'pendant') {
            fixtures.box(px - 0.006, pz - 0.006, px + 0.006, pz + 0.006, h + 0.12, H, DARK);                 // cord
            markers.prism(circle(px, pz, 0.16), h - 0.04, h + 0.12, GL); lightY = h - 0.1; P = [px, h, pz];
          } else if (shape === 'floor' || shape === 'torchiere') {
            fixtures.prism(circle(px, pz, 0.14, 12), 0, 0.025, DARK);                                                 // foot
            obstacles.push([px, pz, 0.2]);
            fixtures.box(px - 0.012, pz - 0.012, px + 0.012, pz + 0.012, 0.025, h - 0.05, DARK);                       // pole
            if (shape === 'torchiere') {
              // an uplighter: an open bowl on top that lights the ceiling
              fixtures.prism(circle(px, pz, 0.08, 14), h - 0.06, h - 0.03, DARK); fixtures.prism(circle(px, pz, 0.2, 18), h - 0.03, h + 0.05, [0.85, 0.84, 0.8]);
              markers.prism(circle(px, pz, 0.18, 18), h + 0.05, h + 0.055, GL); lightY = h + 0.4; P = [px, h + 0.2, pz];
            } else { markers.prism(circle(px, pz, 0.19), h - 0.05, h + 0.2, GL); lightY = h + 0.05; P = [px, h, pz]; }
          } else if (shape === 'desk') {
            // a desk lamp: foot, an arm up and over, and a little shade shining down
            const base = h - 0.42; standOn(base);
            const ax = -fr.ux * 0.1, az = -fr.uz * 0.1;   // the foot stands a bit to the side, the head reaches over
            fixtures.prism(circle(px + ax, pz + az, 0.075, 14), base, base + 0.02, DARK);
            for (let k = 0; k < 6; k++) { const t0 = k / 6, yy = base + 0.02 + t0 * 0.3, xx = px + ax * (1 - t0 * 0.3), zz = pz + az * (1 - t0 * 0.3); fixtures.box(xx - 0.008, zz - 0.008, xx + 0.008, zz + 0.008, yy, yy + 0.055, DARK); }
            for (let k = 0; k < 5; k++) { const t0 = k / 5, xx = px + ax * 0.7 * (1 - t0), zz = pz + az * 0.7 * (1 - t0), yy = base + 0.32 + t0 * 0.06; fixtures.box(xx - 0.008, zz - 0.008, xx + 0.008, zz + 0.008, yy, yy + 0.02, DARK); }
            fixtures.prism(circle(px, pz, 0.06, 14), h - 0.04, h + 0.02, DARK); fixtures.prism(circle(px, pz, 0.03, 10), h + 0.02, h + 0.04, DARK);
            markers.prism(circle(px, pz, 0.05, 14), h - 0.045, h - 0.038, GL);
            lightY = h - 0.12; P = [px, h + 0.2, pz]; hit = { c: [px, h - 0.15, pz], r: 0.22 };
          } else if (shape === 'lava') {
            const base = h - 0.36; standOn(base);
            fixtures.prism(circle(px, pz, 0.06, 14), base, base + 0.1, [0.55, 0.56, 0.6]);
            markers.prism(circle(px, pz, 0.045, 14), base + 0.1, base + 0.32, GL);
            fixtures.prism(circle(px, pz, 0.03, 12), base + 0.32, base + 0.36, [0.55, 0.56, 0.6]);
            lightY = base + 0.2; P = [px, h + 0.15, pz]; hit = { c: [px, base + 0.18, pz], r: 0.18 };
          } else if (shape === 'table') {
            const base = h - 0.3; standOn(base);
            fixtures.prism(circle(px, pz, 0.06, 10), base, base + 0.02, DARK);
            fixtures.box(px - 0.008, pz - 0.008, px + 0.008, pz + 0.008, base + 0.02, h - 0.06, DARK);
            markers.prism(circle(px, pz, 0.11), h - 0.06, h + 0.08, GL); lightY = h; P = [px, h + 0.15, pz]; hit = { c: [px, h - 0.05, pz], r: 0.2 };
          } else if (shape === 'sconce') {
            fixtures.prism(wq(-0.04, 0.04, 0, 0.02), h - 0.07, h + 0.07, DARK);
            fixtures.prism(wq(-0.008, 0.008, 0.02, 0.09), h - 0.012, h + 0.004, DARK);
            markers.prism(circle(wx + fr.nx * 0.12, wz + fr.nz * 0.12, 0.06, 12), h - 0.06, h + 0.1, GL);
            wallAt(0.1, h, 0.18);
          } else if (shape === 'flat') {
            fixtures.prism(wq(-0.13, 0.13, 0, 0.015), h - 0.07, h + 0.07, W1);
            markers.prism(wq(-0.11, 0.11, 0.015, 0.045), h - 0.055, h + 0.055, GL);
            wallAt(0.04, h, 0.18);
          } else if (shape === 'mirror') {
            // a mirror with its light bar above it
            fixtures.prism(wq(-0.32, 0.32, 0, 0.015), h - 0.9, h - 0.06, [0.4, 0.4, 0.42]);
            fixtures.prism(wq(-0.3, 0.3, 0.015, 0.02), h - 0.88, h - 0.08, [0.72, 0.78, 0.84]);
            markers.prism(wq(-0.26, 0.26, 0.01, 0.06), h - 0.04, h + 0.01, GL);
            wallAt(0.04, h - 0.3, 0.32);
          } else if (shape === 'lantern') {
            fixtures.prism(wq(-0.03, 0.03, 0, 0.02), h - 0.1, h + 0.1, DARK);
            fixtures.prism(wq(-0.01, 0.01, 0.02, 0.1), h + 0.08, h + 0.1, DARK);
            fixtures.prism(wq(-0.07, 0.07, 0.07, 0.21), h + 0.1, h + 0.14, DARK);
            fixtures.prism(wq(-0.06, 0.06, 0.08, 0.2), h - 0.14, h - 0.12, DARK);
            markers.prism(wq(-0.05, 0.05, 0.09, 0.19), h - 0.12, h + 0.1, GL);
            wallAt(0.14, h, 0.2);
          } else if (shape === 'fireplace') {
            // a fireplace against the wall; its fire is the light
            const top = Math.max(0.75, Math.min(1.15, h + 0.25)), stone = [0.32, 0.3, 0.29];
            fixtures.prism(wq(-0.5, -0.33, 0, 0.32), 0, top, stone); fixtures.prism(wq(0.33, 0.5, 0, 0.32), 0, top, stone);
            fixtures.prism(wq(-0.55, 0.55, 0, 0.36), top, top + 0.06, stone); fixtures.prism(wq(-0.33, 0.33, 0, 0.32), top - 0.14, top, stone);
            fixtures.prism(wq(-0.55, 0.55, 0, 0.4), 0, 0.05, stone);
            markers.prism(wq(-0.33, 0.33, 0.02, 0.05), 0.05, top - 0.14, GL);
            for (let k = -2; k <= 2; k++) markers.prism(wq(k * 0.1 - 0.035, k * 0.1 + 0.035, 0.1, 0.2), 0.05, 0.12 + (2 - Math.abs(k)) * 0.07, GL);
            obstacles.push([wx + fr.nx * 0.2, wz + fr.nz * 0.2, 0.45]);
            wallAt(0.2, Math.min(0.4, top / 2), 0.4); P[1] = top + 0.25;
          } else if (shape === 'matrix') {
            // an LED matrix / pixel display on the wall: a square panel that lights up
            const n = Math.round(Math.sqrt(+hass.states[it.entity_id.replace('light.', 'sensor.') + '_led_count']?.state || 0));
            const half = /pixoo|divoom/i.test(`${it.entity_id} ${st?.attributes?.friendly_name || ''}`) ? 0.11 : n >= 8 && n <= 64 ? (n * 0.01) / 2 + 0.01 : 0.16;
            fixtures.prism(wq(-half - 0.01, half + 0.01, 0, 0.02), h - half - 0.01, h + half + 0.01, [0.1, 0.1, 0.11]);
            if (isWled(it) && n >= 4 && n <= 32) {
              // a WLED matrix: its pixels, live (row by row from the top left, as you look at it)
              const px2 = (2 * half) / n;
              for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) {
                const p0 = markers.v.length / 10, a0 = -half + col * px2, y1 = h + half - row * px2;
                markers.prism(wq(a0 + px2 * 0.08, a0 + px2 * 0.92, 0.02, 0.026), y1 - px2 * 0.92, y1 - px2 * 0.08, GL);
                livePieces.push({ start: p0, count: markers.v.length / 10 - p0, cell: [col, row, n] });
              }
            } else markers.prism(wq(-half, half, 0.02, 0.026), h - half, h + half, GL);
            wallAt(0.03, h, half + 0.06); P[1] = h - half - 0.3;   // its icon below the panel (a clock often hangs above)
          } else if (shape === 'panel') {
            fixtures.prism(wq(-0.28, 0.28, 0, 0.03), h - 0.36, h + 0.36, [0.3, 0.3, 0.32]);
            markers.prism(wq(-0.25, 0.25, 0.03, 0.035), h - 0.33, h + 0.33, GL);
            for (const a0 of [-0.09, 0.09]) fixtures.prism(wq(a0 - 0.006, a0 + 0.006, 0.034, 0.04), h - 0.33, h + 0.33, [0.25, 0.25, 0.27]);
            fixtures.prism(wq(-0.25, 0.25, 0.034, 0.04), h - 0.006, h + 0.006, [0.25, 0.25, 0.27]);
            wallAt(0.04, h, 0.4);
          } else if (shape === 'bar') {
            markers.prism(wq(-0.22, 0.22, 0.005, 0.02), h - 0.008, h + 0.008, GL);
            wallAt(0.02, h, 0.2);
          } else {
            // a bulb: socket and a round glowing bulb
            fixtures.prism(circle(px, pz, 0.018, 10), h + 0.03, h + 0.07, DARK);
            for (const [r0, y0, y1] of [[0.022, -0.045, -0.025], [0.036, -0.025, 0.02], [0.026, 0.02, 0.035]]) markers.prism(circle(px, pz, r0, 12), h + y0, h + y1, GL);
            P = [px, h + 0.15, pz]; hit = { c: [px, h, pz], r: 0.15 };
          }
          if (lx0 !== px || lz0 !== pz) { px = lx0; pz = lz0; }   // a wall lamp lights the room from just in front of the wall
        }
        P[1] = Math.min(P[1], H - 0.1);
        if (!hit) hit = { c: lampType === 'ceiling' ? [px, H - 0.05, pz] : [px, lightY, pz], r: lampType === 'floor' ? 0.3 : lampType === 'ceiling' || lampType === 'pendant' ? 0.26 : 0.2 };
        // a ceiling lamp or pendant over a table, island or desk shines down onto it (what it is there for)
        const overT = ['ceiling', 'pendant', 'other'].includes(lampType) && lightY > 1.5 && (plan.furniture || []).some((f) => ['table', 'round', 'island', 'desk', 'coffee'].includes(f.type) && furnAt({ furniture: [{ ...f, w: safeNumber(f.w, 100) + 0.3 * S, h: safeNumber(f.h, 60) + 0.3 * S }] }, safeNumber(it.x), safeNumber(it.y)));
        if (!lampPushed) lamps.push({ it, down: overT, pieces: livePieces.length ? livePieces : null, P: [px, lightY, pz], bb, start, count: markers.v.length / 10 - start, share: overT ? 1.25 : lampType === 'strip' ? 1 / Math.sqrt(Math.max(1, Math.min(4, Math.round(pathLength(strip.map(([sx, sy]) => [M(sx), M(sy)])) / 1.2)))) : 1 });
      }
      const tvf = tvl.get(it.entity_id);
      if (tvf && !tvl.secondary?.has(it.entity_id) && !ownModel) {
        // a TV on the TV furniture: its screen lights up (and lights the room a little) when it is on
        const r0 = (safeNumber(tvf.rot) * Math.PI) / 180, cr = Math.cos(r0), sr = Math.sin(r0), fw = safeNumber(tvf.w, 100) / 2, [sy0, sy1] = tvScreen(tvf, S, plan);
        const pts = [[-fw, -3], [fw, -3], [fw, 3], [-fw, 3]].map(([u, v]) => [M(safeNumber(tvf.x) + u * cr - v * sr), M(safeNumber(tvf.y) + u * sr + v * cr)]);
        const start = markers.v.length / 10;
        markers.prism(pts, sy0 + 0.02, sy1 - 0.02, [1, 1, 1]);
        lamps.push({ it, tv: true, P: [M(safeNumber(tvf.x)), (sy0 + sy1) / 2, M(safeNumber(tvf.y))], bb: lampBox(room), start, count: markers.v.length / 10 - start, share: 0.6 });
        tvFurn.set(tvf.id, it);
      }
      if (isAircon(it, st) && !ownModel) {
        // an air conditioner: a white unit on the wall; its air slot glows blue (cooling) or orange (heating)
        const fr = wallFrame(room, px, pz), cx = fr.cx + fr.nx * 0.12, cz = fr.cz + fr.nz * 0.12, hw = 0.42, hd = 0.11;
        const box = (a, b, y0, y1, d0, d1) => [[cx + fr.ux * a + fr.nx * d0, cz + fr.uz * a + fr.nz * d0], [cx + fr.ux * b + fr.nx * d0, cz + fr.uz * b + fr.nz * d0], [cx + fr.ux * b + fr.nx * d1, cz + fr.uz * b + fr.nz * d1], [cx + fr.ux * a + fr.nx * d1, cz + fr.uz * a + fr.nz * d1]];
        fixtures.prism(box(-hw, hw, h - 0.14, h + 0.14, -hd, hd), h - 0.14, h + 0.14, [0.95, 0.95, 0.94]);
        const start = markers.v.length / 10;
        markers.prism(box(-hw + 0.05, hw - 0.05, 0, 0, hd - 0.02, hd + 0.005), h - 0.12, h - 0.085, [1, 1, 1]);
        lamps.push({ it, ac: true, P: [cx + fr.nx * 0.3, h - 0.2, cz + fr.nz * 0.3], bb: lampBox(room), start, count: markers.v.length / 10 - start, share: 0.5 });
        hit = { c: [cx, h, cz], r: 0.45 };
        P = [cx, h + 0.3, cz];
      }
      const mk = !tvf ? mediaKind(it, hass) : null;
      if (mk && !['tv', 'group'].includes(mk) && !ownModel) {
        // a speaker, smart display or player as the thing it is, standing where it stands; its light shows when it plays
        const top = { mini: 0.03, speaker: 0.1, hub: 0.09, soundbar: 0.05, player: 0.03, voice: 0.03 }[mk], base = Math.max(0, h - top);
        const fabric = [0.55, 0.56, 0.58], dark = [0.12, 0.12, 0.13], start0 = markers.v.length / 10;
        let topY = base + 0.05;
        if (mk === 'mini') { fixtures.prism(circle(px, pz, 0.05, 16), base, base + 0.04, fabric); markers.prism(circle(px, pz, 0.022, 10), base + 0.04, base + 0.042, [1, 1, 1]); topY = base + 0.04; }
        else if (mk === 'speaker') { fixtures.prism(circle(px, pz, 0.06, 16), base, base + 0.17, fabric); markers.prism(circle(px, pz, 0.03, 10), base + 0.17, base + 0.172, [1, 1, 1]); topY = base + 0.17; }
        else if (mk === 'voice') { fixtures.box(px - 0.012, pz - 0.012, px + 0.012, pz + 0.012, base, base + 0.025, dark); markers.prism(circle(px, pz, 0.008, 8), base + 0.025, base + 0.027, [1, 1, 1]); topY = base + 0.03; }
        else if (mk === 'player') { fixtures.prism(circle(px, pz, 0.04, 14), base, base + 0.015, dark); markers.prism(circle(px, pz, 0.006, 8), base + 0.015, base + 0.017, [1, 1, 1]); topY = base + 0.02; }
        else {
          const fr = wallFrame(room, px, pz), box = (a, b, d0, d1) => [[px + fr.ux * a + fr.nx * d0, pz + fr.uz * a + fr.nz * d0], [px + fr.ux * b + fr.nx * d0, pz + fr.uz * b + fr.nz * d0], [px + fr.ux * b + fr.nx * d1, pz + fr.uz * b + fr.nz * d1], [px + fr.ux * a + fr.nx * d1, pz + fr.uz * a + fr.nz * d1]];
          if (mk === 'soundbar') { fixtures.prism(box(-0.45, 0.45, -0.045, 0.045), base, base + 0.08, dark); markers.prism(box(-0.05, 0.05, 0.044, 0.047), base + 0.03, base + 0.05, [1, 1, 1]); topY = base + 0.08; }
          else { fixtures.prism(box(-0.09, 0.09, -0.04, 0.04), base, base + 0.03, [0.85, 0.85, 0.84]); markers.prism(box(-0.085, 0.085, 0.0, 0.012), base + 0.03, base + 0.14, [1, 1, 1]); topY = base + 0.14; }
        }
        lamps.push({ it, media: mk, P: [px, topY + 0.05, pz], bb: lampBox(room), start: start0, count: markers.v.length / 10 - start0, share: 0.25 });
        hit = { c: [px, (base + topY) / 2, pz], r: mk === 'soundbar' ? 0.45 : 0.16 };
        P = [px, topY + 0.12, pz];
      }
      // other devices recognised by what they are: drawn as that thing (vacuum, camera, radiator valve...)
      const dk = !ownModel && !lampKind && !tvf && !mk && !rads.byEntity.has(it.entity_id) ? deviceKind(it, st, hass) : null;
      if (dk) {
        const W1 = [0.94, 0.94, 0.93], G = [0.62, 0.63, 0.65], D2 = [0.16, 0.16, 0.17];
        const fr = wallFrame(room, px, pz), wx = fr.free ? px : fr.cx, wz = fr.free ? pz : fr.cz;
        // a box on the wall: a..b along it, d0..d1 out into the room, y0..y1 high
        const wbox = (a, b, d0, d1, y0, y1, col) => fixtures.prism([[wx + fr.ux * a + fr.nx * d0, wz + fr.uz * a + fr.nz * d0], [wx + fr.ux * b + fr.nx * d0, wz + fr.uz * b + fr.nz * d0], [wx + fr.ux * b + fr.nx * d1, wz + fr.uz * b + fr.nz * d1], [wx + fr.ux * a + fr.nx * d1, wz + fr.uz * a + fr.nz * d1]], y0, y1, col);
        const out = (dd, y, r) => { hit = { c: [wx + fr.nx * dd, y, wz + fr.nz * dd], r }; P = [wx + fr.nx * (dd + 0.1), y + r + 0.12, wz + fr.nz * (dd + 0.1)]; };
        const top = under && !own ? furnHeight(under) : 0;
        if (THINGS.has(dk)) drawThing(dk, false);
        else if (dk === 'vacuum') {
          fixtures.prism(circle(px, pz, 0.17, 20), top, top + 0.085, [0.24, 0.24, 0.26]);
          fixtures.prism(circle(px, pz, 0.045, 12), top + 0.085, top + 0.11, D2);
          hit = { c: [px, top + 0.06, pz], r: 0.22 }; P = [px, top + 0.4, pz];
        } else if (dk === 'camera') {
          wbox(-0.025, 0.025, 0, 0.03, h - 0.04, h + 0.04, W1);
          wbox(-0.035, 0.035, 0.03, 0.15, h - 0.035, h + 0.035, W1);
          wbox(-0.02, 0.02, 0.15, 0.158, h - 0.02, h + 0.02, D2);
          out(0.09, h, 0.14);
        } else if (dk === 'lock') {
          // a lock near a door sits on the door frame, beside the opening (not floating in it)
          let ox = 0;
          for (const o of plan.openings || []) {
            if (o.type !== 'door' && o.type !== 'passage' && o.type) continue;
            for (const [ex, ez, fx, fz] of [[o.x1, o.y1, o.x2, o.y2], [o.x2, o.y2, o.x1, o.y1]]) {
              const E = [M(safeNumber(ex)), M(safeNumber(ez))], F = [M(safeNumber(fx)), M(safeNumber(fz))], L = Math.hypot(F[0] - E[0], F[1] - E[1]) || 1;
              const t = ((wx - E[0]) * (F[0] - E[0]) + (wz - E[1]) * (F[1] - E[1])) / L;
              if (Math.hypot(wx - (E[0] + ((F[0] - E[0]) * t) / L), wz - (E[1] + ((F[1] - E[1]) * t) / L)) < 0.3 && t > -0.6 && t < L + 0.6) {
                // along the wall: the frame edge E, 6 cm outside the opening
                const along = (E[0] - wx) * fr.ux + (E[1] - wz) * fr.uz, away = -Math.sign((F[0] - E[0]) * fr.ux + (F[1] - E[1]) * fr.uz) || 1;
                if (Math.abs(along) < Math.abs(ox) || !ox) ox = along + away * 0.07;
              }
            }
          }
          wbox(ox - 0.03, ox + 0.03, 0, 0.025, h - 0.11, h + 0.11, [0.3, 0.3, 0.32]);
          wbox(ox - 0.012, ox + 0.012, 0.025, 0.06, h - 0.02, h + 0.02, G);
          hit = { c: [wx + fr.ux * ox + fr.nx * 0.03, h, wz + fr.uz * ox + fr.nz * 0.03], r: 0.15 }; P = [hit.c[0] + fr.nx * 0.1, h + 0.3, hit.c[2] + fr.nz * 0.1];
        } else if (dk === 'radiator') {
          const y0 = 0.15, y1 = Math.max(0.5, Math.min(0.9, h + 0.3));
          for (let k = -6; k < 6; k++) wbox(k * 0.07 + 0.005, k * 0.07 + 0.065, 0.03, 0.11, y0, y1, W1);
          wbox(0.43, 0.47, 0.04, 0.1, y0, y0 + 0.08, G);
          wbox(0.425, 0.475, 0.035, 0.105, y0 + 0.08, y0 + 0.2, [0.9, 0.9, 0.9]);
          hit = { line: [[wx - fr.ux * 0.42 + fr.nx * 0.07, wz - fr.uz * 0.42 + fr.nz * 0.07], [wx + fr.ux * 0.48 + fr.nx * 0.07, wz + fr.uz * 0.48 + fr.nz * 0.07]], y: (y0 + y1) / 2, r: Math.max(0.2, (y1 - y0) / 2) };
          P = [wx + fr.nx * 0.2, y1 + 0.25, wz + fr.nz * 0.2];
        } else if (dk === 'thermostat') {
          wbox(-0.045, 0.045, 0, 0.022, h - 0.045, h + 0.045, W1);
          wbox(-0.028, 0.028, 0.022, 0.025, h - 0.015, h + 0.025, D2);
          out(0.02, h, 0.13);
        } else if (dk === 'ceiling_fan') {
          const y = Math.min(h, H - 0.2);
          fixtures.prism(circle(px, pz, 0.02, 8), y, H, G);
          fixtures.prism(circle(px, pz, 0.09, 14), y - 0.08, y + 0.02, W1);
          for (let k = 0; k < 4; k++) {
            const an = (k * Math.PI) / 2 + 0.3, c = Math.cos(an), sn = Math.sin(an), w = 0.055;
            fixtures.prism([[px + c * 0.08 - sn * w, pz + sn * 0.08 + c * w], [px + c * 0.6 - sn * w, pz + sn * 0.6 + c * w], [px + c * 0.6 + sn * w, pz + sn * 0.6 - c * w], [px + c * 0.08 + sn * w, pz + sn * 0.08 - c * w]], y - 0.05, y - 0.035, [0.55, 0.42, 0.3]);
          }
          hit = { c: [px, y - 0.04, pz], r: 0.5 }; P = [px, y - 0.4, pz];
        } else if (dk === 'fan') {
          const tall = top ? 0.35 : 1.05, base = top;
          fixtures.prism(circle(px, pz, 0.15, 16), base, base + 0.03, G);
          fixtures.box(px - 0.012, pz - 0.012, px + 0.012, pz + 0.012, base + 0.03, base + tall - 0.18, G);
          fixtures.prism(circle(px, pz, 0.08, 12), base + tall - 0.36, base + tall, [0.85, 0.86, 0.88]);
          hit = { c: [px, base + tall - 0.18, pz], r: 0.25 }; P = [px, base + tall + 0.2, pz];
        } else if (dk === 'purifier') {
          const base = top;
          fixtures.box(px - 0.13, pz - 0.13, px + 0.13, pz + 0.13, base, base + 0.58, W1);
          fixtures.prism(circle(px, pz, 0.1, 14), base + 0.58, base + 0.6, D2);
          hit = { c: [px, base + 0.3, pz], r: 0.3 }; P = [px, base + 0.8, pz];
        } else if (dk === 'plug') {
          wbox(-0.04, 0.04, 0, 0.012, h - 0.04, h + 0.04, W1);
          wbox(-0.03, 0.03, 0.012, 0.055, h - 0.03, h + 0.03, W1);
          out(0.03, h, 0.12);
        } else if (dk === 'motion') {
          wbox(-0.035, 0.035, 0, 0.04, h - 0.035, h + 0.035, W1);
          wbox(-0.02, 0.02, 0.04, 0.05, h - 0.02, h + 0.02, [0.8, 0.8, 0.82]);
          out(0.03, h, 0.13);
        }
      }
      const ringN = ownModel ? 0 : ringClock(it, hass);
      if (ringN) { const fr = wallFrame(room, px, pz), off = fr.free ? 0 : 0.03; hit = { c: [fr.cx + fr.nx * off, h, fr.cz + fr.nz * off], r: 0.2 }; clocks.push({ it, n: ringN, h, fr: { ...fr, cx: fr.cx + fr.nx * off, cz: fr.cz + fr.nz * off } }); P = [fr.cx + fr.nx * off, h - 0.28, fr.cz + fr.nz * off]; }
      // the icon you can tap
      const el = document.createElement('div');
      el.className = 'wi';
      const isSensor = (d === 'sensor') && !it.icon_only;
      el.innerHTML = `<div class="b${isSensor ? ' txt' : ''}"></div><div class="n">${esc(it.name || friendly(hass, it.entity_id))}</div>`;
      const b = el.querySelector('.b');
      if (!isSensor) {
        const tk = dk || (lampKind ? applianceKind(it, st, hass) : null), ic = it.icon || (tk && KIND_ICON[tk] && (!st?.attributes?.icon || lampKind) && !['lock', 'motion'].includes(tk) ? KIND_ICON[tk] : mk && MEDIA_ICON[mk] && !st?.attributes?.icon ? MEDIA_ICON[mk] : ceil && !st?.attributes?.icon ? 'mdi:ceiling-light' : it.kind === 'lamp' && d !== 'light' ? 'mdi:lightbulb' : '');
        const icon = document.createElement(ic ? 'ha-icon' : 'ha-state-icon');
        if (ic) icon.icon = ic; else { icon.hass = hass; icon.stateObj = st; }
        b.appendChild(icon);
      }
      const cinfo = d === 'cover' ? curtainFor(plan, it, st) : null;
      if (cinfo && !hit) {
        const cp = curtainPanels(plan, it, cinfo, 0), A = [M(cp.a[0]) + cp.n[0] * 0.16, M(cp.a[1]) + cp.n[1] * 0.16], B = [A[0] + cp.u[0] * M(cp.L), A[1] + cp.u[1] * M(cp.L)];
        hit = { line: [A, B], y: 1.25, r: 0.3, ry: 1.05 };
      }
      const rec = { it, el, P, d, isSensor, icon: b.firstChild, room: room?.id || null, h, hit, modelled: !!hit && !isSensor };
      let lpT = 0, lpDone = false;
      el.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        if (ev.button === 2) return;
        if (editing) { startItemDrag(ev, rec); return; }
        lpDone = false; clearTimeout(lpT);
        lpT = setTimeout(() => { lpDone = true; showInfo(it, false, true); }, 550);
      });
      for (const e2 of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(e2, () => clearTimeout(lpT));
      el.addEventListener('contextmenu', (ev) => ev.preventDefault());
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (editing || ev.button === 2) return;
        if (lpDone) { lpDone = false; return; }   // that was a long press: its menu is open
        const dd = it.via ? 'switch' : d;
        if (['light', 'switch', 'fan', 'input_boolean'].includes(dd) && !ringClock(it, hass) && !['thermo', 'holofan'].includes(applianceKind(it, st, hass))) { hass.callService('homeassistant', 'toggle', { entity_id: it.via || it.entity_id }); return; }
        // anything else (TV, speaker, climate, curtain, sensor...): what it is doing, and its buttons
        showInfo(it);
      });
      iconsEl.appendChild(el);
      if (sel?.type === 'item' && sel.id === it.entity_id) el.classList.add('sel');
      if (tvf) rec.hidden = true;   // the TV furniture itself is the TV
      if (rads.byEntity.has(it.entity_id)) rec.hidden = true;   // the radiator you drew is this thermostat
      if (appEnt.has(it.entity_id)) rec.hidden = true;   // the appliance you drew is this (plug, sensor...)
      if (boxMedia.has(it.entity_id)) rec.hidden = true;   // the speaker box you drew is this player
      if (ringN) rec.hideWalk = true;   // the clock on the wall is the clock (its icon only shows while editing)
      items.push(rec);
    }
    for (const [k, m] of [['markers', markers], ['fixtures', fixtures]]) { if (buf[k]) gl.deleteBuffer(buf[k].b); buf[k] = m.v.length ? upload(m) : null; }
    // light travels through open passages (and a little through doors): a lamp lights the room next door from the opening,
    // as strong as what reaches that opening - so a dining corner open to the kitchen and living room shares their light
    spills = [];
    const ops = (plan.openings || []).filter((o) => ['open', 'passage', 'door', undefined, ''].includes(o.type));
    for (const o of ops) {
      const x1 = safeNumber(o.x1), y1 = safeNumber(o.y1), x2 = safeNumber(o.x2), y2 = safeNumber(o.y2), len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 5) continue;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      const A = roomAt(plan.rooms, mx + nx * 8, my + ny * 8), B = roomAt(plan.rooms, mx - nx * 8, my - ny * 8);
      if (!A || !B || A === B) continue;
      if (lightZone.has(A.id) && lightZone.get(A.id) === lightZone.get(B.id)) continue;   // one light zone: the light is already shared
      const door = !['open', 'passage'].includes(o.type), wf = Math.min(1.4, M(len) / 1.2) * (door ? 0.3 : 1), cx = M(mx), cz = M(my);
      for (const L of lamps) {
        if (L.app || L.media || L.ac || L.rad || L.screen || L.tv) continue;
        const lr = roomOf(L.P[0], L.P[2]), to = lr === A ? B : lr === B ? A : null;
        if (!to) continue;
        const sgn = to === A ? 1 : -1;
        // the nearest point of the opening, and how much light gets there
        const ux = (x2 - x1) / len, uy = (y2 - y1) / len, t = Math.max(0, Math.min(M(len), (L.P[0] - M(x1)) * ux + (L.P[2] - M(y1)) * uy));
        const qx = M(x1) + ux * t, qz = M(y1) + uy * t, d = Math.hypot(L.P[0] - qx, L.P[2] - qz, L.P[1] - 1.4);
        const k = (L.share ?? 1) * wf * 1.8 / (1 + 0.8 * d * d);
        if (k < 0.05) continue;
        // a wide opening: the light comes in along it, centred towards where the lamp is
        const px = (qx + cx) / 2 + nx * sgn * 0.3, pz = (qz + cz) / 2 + ny * sgn * 0.3;
        spills.push({ parent: L, P: [px, Math.min(Math.max(L.P[1], 1.2), 2.1), pz], bb: lampBox(to), share: Math.min(1, k), start: 0, count: 0 });
      }
    }
    spills = spills.sort((p, q) => q.share - p.share).slice(0, 16);
    refreshStates();
  }
  // live WLED colours on drawn strips and matrices (fetched by the integration from WLED's /json/live)
  const isWled = (it) => hass?.entities?.[it.entity_id]?.platform === 'wled';
  const liveLeds = new Map();
  let liveSub = null;
  const liveSegs = new Map();
  function liveSync() {
    const amb = lamps.filter((l) => l.pieces?.some((pc) => pc.amb || pc.full)).map((l) => l.it.entity_id);
    const ids = lamps.filter((l) => l.pieces && !amb.includes(l.it.entity_id)).map((l) => l.it.entity_id);
    const key = `${[...new Set(ids)].sort().join(',')}|${[...new Set(amb)].sort().join(',')}`;
    if (liveSub?.key === key) return;
    liveSub?.stop(); liveSub = null;
    if (key === '|') return;
    liveSub = wledLive(hass, ids, (m) => {
      // the segment lengths of an ambilight decide where each side of the frame is: rebuild once they are known
      let rebuild = false;
      for (const [id, lens] of Object.entries(m.segments || {})) { const old = liveSegs.get(id); if (String(old) !== String(lens)) { liveSegs.set(id, lens); rebuild = true; } }
      if (rebuild) { buildItems(); refreshStates(); }
      for (const [id, leds] of Object.entries(m.leds || {})) {
        liveLeds.set(id, { leds, w: m.matrix?.[id]?.[0], h: m.matrix?.[id]?.[1] });
        // the room is lit in the average colour of its LEDs
        let r = 0, g = 0, b = 0;
        for (const hx of leds) { const v = parseInt(hx, 16); r += (v >> 16) & 255; g += (v >> 8) & 255; b += v & 255; }
        const n = leds.length || 1, L = lamps.find((l) => l.it.entity_id === id && l.pieces);
        if (L) { const mx = Math.max(r, g, b) / n; L.liveCol = mx > 2 ? [r / n / mx, g / n / mx, b / n / mx] : null; L.liveK = Math.min(1, mx / 160); L.liveT = Date.now(); if (L.on && L.liveCol) L.col = L.liveCol; }
      }
    }, amb);
  }
  function buildAll() {
    world = buildWorld(plan, hass, sel?.type === 'furn' ? sel.id : null);
    graph = buildGraph(plan, S);
    for (const k of ['solid', 'glass']) { if (buf[k]) gl.deleteBuffer(buf[k].b); buf[k] = world[k].v.length ? upload(world[k]) : null; }
    doorSig = sigOf(hass);
    buildItems();
    nav = buildNav(plan, world, S, obstacles);
    liveSync();
  }

  const lampOn = (it) => {
    const st = hass.states[it.entity_id], vs = it.via ? hass.states[it.via] : null;
    return vs ? vs.state === 'on' && (!st || isOn(st) || ['unavailable', 'unknown'].includes(st.state)) : isOn(st);
  };
  /* curtains and blinds: they slide (or roll) to their real position */
  const curt = new Map();
  let curtDirty = true;
  function refreshCurtains() {
    const seen = new Set();
    for (const it of plan.items || []) {
      const info = curtainFor(plan, it, hass.states[it.entity_id]);
      if (!info) continue;
      seen.add(it.entity_id);
      const r = curt.get(it.entity_id) || { c: info.closed };
      r.it = it; r.info = info; r.target = info.closed;
      curt.set(it.entity_id, r);
    }
    for (const id of [...curt.keys()]) if (!seen.has(id)) curt.delete(id);
    curtDirty = true;
  }
  function buildCurtains() {
    const m = new Mesh(), fabric = [0.84, 0.78, 0.68], fold = [0.74, 0.68, 0.58];
    for (const r of curt.values()) {
      const { panels, a, u, n } = curtainPanels(plan, r.it, r.info, r.c);
      const roller = r.info.style === 'roller', d0 = roller ? 0.135 : 0.16, d1 = d0 + 0.03;
      const at = (sv, dv) => [M(a[0] + u[0] * sv) + n[0] * dv, M(a[1] + u[1] * sv) + n[1] * dv];
      for (const pn of panels) {
        const y0 = roller ? 2.15 - r.c * (2.15 - Math.max(r.info.bottom, 0.88)) : r.info.bottom, y1 = roller ? 2.15 : 2.42;
        if (y1 - y0 < 0.02) continue;
        if (roller) { m.prism([at(pn.a0, d0), at(pn.a1, d0), at(pn.a1, d1), at(pn.a0, d1)], y0, y1, fabric); continue; }
        // pleats: the panel as narrow strips that go in and out a little
        const k = Math.max(2, Math.round(M(pn.a1 - pn.a0) / 0.07));
        for (let i = 0; i < k; i++) {
          const s0 = pn.a0 + ((pn.a1 - pn.a0) * i) / k, s1 = pn.a0 + ((pn.a1 - pn.a0) * (i + 1)) / k, dd = i % 2 ? 0.025 : 0;
          m.prism([at(s0, d0 + dd), at(s1, d0 + dd), at(s1, d1 + dd), at(s0, d1 + dd)], y0, y1, i % 2 ? fold : fabric);
        }
      }
    }
    if (buf.curtains) gl.deleteBuffer(buf.curtains.b);
    buf.curtains = m.v.length ? upload(m) : null;
    curtDirty = false;
  }
  function refreshStates() {
    refreshCurtains();
    // camera wall: motion or idle above each screen
    for (const w of camWalls) for (const sc of w.screens) {
      if (!sc.mo) continue;
      const on = hass.states[sc.motion]?.state === 'on';
      sc.mo.textContent = on ? T.cam_motion : T.cam_idle;
      sc.mo.classList.toggle('on', on);
    }
    for (const L of lamps) {
      const st = hass.states[L.it.entity_id], on = lampOn(L.it);
      const fixed = L.it.color && /^#[0-9a-f]{6}$/i.test(L.it.color) ? [1, 3, 5].map((i) => parseInt(L.it.color.slice(i, i + 2), 16)).join(',') : null;
      const c = fixed || lightColor(st) || '255,196,128', br = st?.attributes?.brightness;
      L.on = on; L.col = rgb(c); L.k = on ? (br != null ? Math.max(0.15, br / 255) : 1) : 0;
      if (L.tv) { L.on = !!st && ['on', 'playing', 'paused', 'idle', 'buffering'].includes(st.state); L.col = [0.35, 0.55, 1]; L.k = L.on ? 0.7 : 0; }
      if (L.media) { L.on = !!st && ['playing', 'on', 'buffering'].includes(st.state) && (L.media !== 'hub' || st.state !== 'off'); L.col = L.media === 'hub' ? [0.55, 0.7, 1] : [0.9, 0.95, 1]; L.k = L.on ? (L.media === 'hub' ? 0.25 : 0.12) : 0; }
      if (L.pieces && L.liveCol && Date.now() - (L.liveT || 0) < 5000) L.col = L.liveCol;   // a WLED showing live colours: its light is those colours
      if (L.boxplay) { L.on = st?.state === 'playing'; L.col = [0.55, 0.65, 1]; L.k = L.on ? 0.25 : 0; }
      if (L.app) { L.on = applianceRunning(hass, L.app, L.it.entity_id); L.col = [0.3, 1, 0.5]; L.k = L.on ? 0.2 : 0; }
      if (L.screen) { L.on = true; L.col = [0.55, 0.7, 1]; L.k = 0.35; }
      if (L.rad) { L.on = isHeating(st); L.col = [1, 0.5, 0.2]; L.k = L.on ? 0.25 : 0; }
      if (L.ac) { const m = airconMode(st); L.on = !!m; L.col = m === 'cool' ? [0.4, 0.7, 1] : m === 'heat' ? [1, 0.55, 0.25] : [0.85, 0.9, 0.95]; L.k = L.on ? 0.35 : 0; }
    }
    if (infoIt) showInfo(infoIt, true);
    for (const I of items) {
      const st = hass.states[I.it.entity_id];
      const on = I.it.kind === 'lamp' || I.d === 'light' ? lampOn(I.it) : isOn(st);
      I.el.classList.toggle('on', on);
      I.el.classList.toggle('off', !on && ['off', 'standby'].includes(st?.state));   // off: half see-through
      const L = lamps.find((l) => l.it === I.it);
      if (L && on) I.el.style.setProperty('--c', L.col.map((v) => Math.round(v * 255)).join(','));
      if (I.isSensor) I.el.querySelector('.b').textContent = st ? `${st.state}${st.attributes.unit_of_measurement ? ` ${st.attributes.unit_of_measurement}` : ''}`.slice(0, 7) : '';
      else if (I.icon?.tagName === 'HA-STATE-ICON' && st) { I.icon.hass = hass; I.icon.stateObj = st; }
      I.el.style.opacity = st || I.it.via ? '' : '.4';
    }
  }

  /* ------------------------------------------------------------ the walker */
  const cam = { x: 0, z: 0, yaw: 0, pitch: -0.06 };
  let route = [], touring = true, tourDone = false, lastRoom = null, bob = 0, hold = 0;
  /** While walking by itself (the tour, or on the way somewhere) a click only stops it — no device is switched or opened. */
  const stopIfWalking = () => {
    if (!route.length && !touring) return false;
    if (touring) pausedTour = route;
    route = [];
    setTouring(false);
    return true;
  };
  function startTour() {
    const rooms = plan.rooms || [];
    if (!rooms.length) return;
    let ent = graph.entrance;
    // a room chosen to start in (step 5): enter it through its door (a real door first, else an opening)
    const want = plan.settings?.walk_start;
    if (want && rooms.some((r) => r.id === want) && ent?.room !== want) {
      const es = graph.edges.filter((e) => !e.ghost && (e.a === want || e.b === want)).sort((x, y) => (y.door ? 1 : 0) - (x.door ? 1 : 0));
      if (es.length) { const e = es[0]; ent = e.a === want ? { room: want, inside: e.pa, outside: e.pb } : { room: want, inside: e.pb, outside: e.pa }; }
    }
    const start = ent?.room || rooms.slice().sort((a, b) => area(b) - area(a))[0].id;
    // visit every room: go deeper first, and walk back through the doors when needed
    const order = [], seen = new Set();
    // from each room: first through open passages (the room flows on), then through doors, nearest first
    const centre = (id) => graph.spot.get(id) || [0, 0];
    const visit = (r) => {
      seen.add(r); order.push(r);
      const next = graph.edges.map((e) => ({ e, n: e.a === r ? e.b : e.b === r ? e.a : null })).filter((x) => x.n && !x.e.ghost)
        .sort((x, y) => (x.e.door ? 1 : 0) - (y.e.door ? 1 : 0) || Math.hypot(centre(x.n)[0] - centre(r)[0], centre(x.n)[1] - centre(r)[1]) - Math.hypot(centre(y.n)[0] - centre(r)[0], centre(y.n)[1] - centre(r)[1]));
      for (const { n } of next) if (!seen.has(n)) visit(n);
      for (const e of graph.edges) { const n = e.a === r ? e.b : e.b === r ? e.a : null; if (n && !seen.has(n)) visit(n); }   // rooms only joined by a shared wall
    };
    visit(start);
    for (const r of rooms) if (!seen.has(r.id)) visit(r.id);
    if (ent) { cam.x = ent.inside[0]; cam.z = ent.inside[1]; cam.yaw = Math.atan2(ent.inside[0] - ent.outside[0], ent.inside[1] - ent.outside[1]); }
    else { const sp = nav?.spot(rooms.find((r) => r.id === start)); if (sp) { cam.x = sp.x; cam.z = sp.z; cam.yaw = sp.look; } }
    route = [];
    let cur = start, px = cam.x, pz = cam.z;
    for (const id of order) {
      // the room you start in: look around where you came in (no walking to the back and turning round)
      if (id === start && ent) { route.push({ x: cam.x, z: cam.z, look: true, lookYaw: cam.yaw, room: id }); continue; }
      const r = rooms.find((x) => x.id === id), sp = nav?.spot(r) || { x: graph.spot.get(id)[0], z: graph.spot.get(id)[1], look: 0 };
      const way = pathTo(px, pz, sp.x, sp.z);
      if (!way) continue;   // no door into this room drawn: skip it rather than walk through a wall
      route.push(...way.slice(0, -1));
      route.push({ x: sp.x, z: sp.z, look: true, lookYaw: sp.look, room: id });
      cur = id; px = sp.x; pz = sp.z;
    }
    route.push({ done: true });
  }
  /** Points to walk from a to b: around walls and furniture, or (no way through) through the rooms in between. */
  function pathTo(ax, az, bx, bz) {
    // only real ways through doors and openings: never through a wall (no way = null)
    const p = nav?.find(ax, az, bx, bz);
    if (p) return p;
    const clear = !world.blockers.some((q) => segHitsBox(ax, az, bx, bz, [q[0] - 0.1, q[1] - 0.1, q[2] + 0.1, q[3] + 0.1]));
    // and never out of the house: every point on the way inside a room
    const inside = Array.from({ length: 12 }, (_, i) => roomOf(ax + ((bx - ax) * (i + 1)) / 12, az + ((bz - az) * (i + 1)) / 12)).every(Boolean);
    return clear && inside ? [{ x: bx, z: bz }] : null;
  }
  const area = (r) => r.rects.map(norm).reduce((s, q) => s + (q[2] - q[0]) * (q[3] - q[1]), 0);
  const roomOf = (x, z) => roomAt(plan.rooms, x * S, z * S);
  function walkTo(x, z) {
    const from = roomOf(cam.x, cam.z), to = roomOf(x, z);
    if (touring) pausedTour = route;
    // no way through (a room without a door): walk straight and stop at the wall
    route = pathTo(cam.x, cam.z, x, z) || [{ x, z, stopAtWall: true }];
    setTouring(false);
  }
  function setTouring(on) {
    touring = on;
    $('#tour').classList.toggle('active', on);
    $('#tour').innerHTML = `<ha-icon icon="${on ? 'mdi:pause' : 'mdi:play'}"></ha-icon><span>${on ? T.pause : tourDone ? T.tour : T.play}</span>`;
  }
  let pausedTour = null;
  $('#tour').addEventListener('click', () => {
    if (touring) { pausedTour = route; route = []; setTouring(false); return; }
    if (tourDone || !pausedTour?.length) { tourDone = false; startTour(); } else route = pausedTour;
    pausedTour = null; setTouring(true);
  });

  /** Push the walker out of walls (manual walking only; the tour follows its own path). */
  function collide(R = R_PLAYER) {
    for (let k = 0; k < 2; k++) for (const q of world.blockers) {
      const px = Math.max(q[0], Math.min(cam.x, q[2])), pz = Math.max(q[1], Math.min(cam.z, q[3]));
      const dx = cam.x - px, dz = cam.z - pz, d = Math.hypot(dx, dz);
      if (d < R) {
        if (d < 1e-6) {
          // right inside a wall (a door that just closed...): out on the side that is in a room
          const opts = [[q[0] - R, cam.z], [q[2] + R, cam.z], [cam.x, q[1] - R], [cam.x, q[3] + R]].sort((u, v) => Math.hypot(u[0] - cam.x, u[1] - cam.z) - Math.hypot(v[0] - cam.x, v[1] - cam.z));
          const o = opts.find((u) => roomOf(u[0], u[1])) || opts[0];
          cam.x = o[0]; cam.z = o[1]; continue;
        }
        cam.x = px + (dx / d) * R; cam.z = pz + (dz / d) * R;
      }
    }
  }

  const keys = new Set();
  const onKey = (ev) => {
    // Ctrl + / Ctrl − / Ctrl 0: zoom the 3D view itself, never the page (the buttons and icons stay their size)
    // + and − (with or without Ctrl, also on the number pad): zoom for those without a scroll wheel; Ctrl 0 = back to normal
    if (((ev.ctrlKey || ev.metaKey) && ['+', '=', '-', '_', '0'].includes(ev.key)) || (!ev.ctrlKey && !ev.metaKey && !ev.altKey && ['+', '-'].includes(ev.key) && !/^(INPUT|TEXTAREA|SELECT)$/.test(ev.composedPath()[0]?.tagName || ''))) {
      ev.preventDefault(); ev.stopPropagation();
      if (ev.key === '0') { hfov = ((+plan.settings?.walk_fov || 100) * Math.PI) / 180; setZoom(1); } else setZoom(['-', '_'].includes(ev.key) ? 1.12 : 1 / 1.12);
      return;
    }
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      if (stripDraft) { stripDraft = null; drawDraft(); showSheet(); return; }
      if (editing && sel) { sel = null; rebuildWorld(); buildItems(); showSheet(); return; }
      close(); return;
    }
    if (editing && sel?.type === 'furn' && (ev.key === 'Delete' || ev.key === 'Backspace')) { ev.preventDefault(); removeFurn(); return; }
    const k = ev.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(k)) {
      keys.add(k); ev.preventDefault(); ev.stopPropagation();
      if (touring) { pausedTour = route; setTouring(false); }
      route = route.filter(() => false);
    }
  };
  const onKeyUp = (ev) => keys.delete(ev.key.toLowerCase());
  window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKeyUp, true);

  // dragging looks around; a short tap on the floor walks there
  let drag = null;
  // the right mouse button does nothing here (no browser menu either): caught before anything in the walk sees it
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'auxclick']) root.addEventListener(t, (ev) => { if (ev.button === 2) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  root.addEventListener('contextmenu', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, true);
  /** Long press on a device (or a TV / appliance you drew): its full menu. */
  const longPress = (x, y) => {
    if (editing || route.length || touring) return false;   // (walking by itself: the click that follows stops it)
    const dev = pickDevice(x, y);
    if (dev) { showInfo(dev.it, false, true); return true; }
    const hf = pickFurniture(x, y);
    if (hf && tvFurn.has(hf.f.id)) { showInfo(tvFurn.get(hf.f.id), false, true); return true; }
    return false;
  };
  canvas.addEventListener('pointerdown', (ev) => {
    if (ev.button === 2) return;
    canvas.setPointerCapture(ev.pointerId);
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY, t: Date.now(), moved: false };
    const dr = drag;
    if (!editing) dr.lp = setTimeout(() => { if (drag === dr && !dr.moved && longPress(dr.x0, dr.y0)) dr.long = true; }, 550);
    // editing: grab a piece of furniture under the pointer and slide it over the floor
    if (editing && !stripDraft && !aimFor) {
      const hit = pickFurniture(ev.clientX, ev.clientY);
      if (hit) {
        if (sel?.type !== 'furn' || sel.id !== hit.f.id) { sel = { type: 'furn', id: hit.f.id }; rebuildWorld(); buildItems(); showSheet(); }
        drag.furn = { f: hit.f, y: hit.y, ox: safeNumber(hit.f.x), oz: safeNumber(hit.f.y), start: planeHit(ev.clientX, ev.clientY, hit.y) };
      }
    }
  });
  // hovering with the mouse over a device shows its icon (and name) for a moment
  let hoverIt = null, hoverXY = null, hoverT = 0;
  const hoverCheck = () => {
    hoverT = performance.now();
    const I = hoverXY ? pickDevice(hoverXY[0], hoverXY[1]) : null;
    if (I !== hoverIt) { hoverIt = I; canvas.style.cursor = I ? 'pointer' : ''; }
  };
  canvas.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse' || drag?.moved) return;
    hoverXY = [ev.clientX, ev.clientY];
    if (performance.now() - hoverT > 70) hoverCheck();
  });
  wrap.addEventListener('pointerleave', () => { hoverXY = null; hoverCheck(); });
  canvas.addEventListener('pointermove', (ev) => {
    if (!drag || ev.pointerId !== drag.id) return;
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    drag.x = ev.clientX; drag.y = ev.clientY;
    if (Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) > 6) {
      if (!drag.moved && touring) { pausedTour = route; route = []; setTouring(false); }
      drag.moved = true;
    }
    if (drag.furn) {
      const q = planeHit(ev.clientX, ev.clientY, drag.furn.y), st0 = drag.furn.start;
      if (q && st0 && drag.moved) { drag.furn.f.x = Math.round(drag.furn.ox + (q[0] - st0[0]) * S); drag.furn.f.y = Math.round(drag.furn.oz + (q[1] - st0[1]) * S); dirtyEdit = true; worldDirty = true; }
      return;
    }
    if (drag.moved) { cam.yaw -= dx * 0.0045; cam.pitch = Math.max(-1.1, Math.min(1.0, cam.pitch - dy * 0.0035)); }
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (!drag || ev.pointerId !== drag.id) return;
    clearTimeout(drag.lp);
    if (drag.long) { drag = null; return; }   // the long press opened its menu
    if (!editing && !drag.moved && Date.now() - drag.t >= 550) { const d0 = drag; drag = null; longPress(d0.x0, d0.y0); return; }   // (a busy page fired no timer)
    const tap = !drag.moved && Date.now() - drag.t < 450, wasFurn = drag.furn;
    drag = null;
    if (wasFurn) { if (worldDirty || dirtyEdit) { rebuildWorld(true); buildItems(); } return; }
    if (editing) {
      if (!tap) return;
      if (aimFor) {
        // aim the spot at what you clicked
        const q = aimHit(ev.clientX, ev.clientY);
        if (q) { aimFor.aim = { x: Math.round(q[0] * S), y: Math.round(q[1] * S), z: Math.round(q[2] * 100) / 100 }; aimFor.spot = aimFor.spot ?? true; dirtyEdit = true; buildItems(); }
        aimFor = null; showSheet(); return;
      }
      if (openMode) {
        // a window or door on the wall you clicked
        const q = aimHit(ev.clientX, ev.clientY);
        if (q) {
          const P = [q[0] * S, q[1] * S];
          let best = null, bd = 0.35 * S;
          for (const w of computeWalls(plan.rooms)) {
            const hor = w.y1 === w.y2, a0 = hor ? Math.min(w.x1, w.x2) : Math.min(w.y1, w.y2), a1 = hor ? Math.max(w.x1, w.x2) : Math.max(w.y1, w.y2), along = hor ? P[0] : P[1], dd = Math.abs(hor ? P[1] - w.y1 : P[0] - w.x1);
            if (along >= a0 && along <= a1 && dd < bd) { bd = dd; best = { w, hor, a0, a1, along }; }
          }
          if (best) {
            const len = Math.min((openMode === 'window' ? 1.2 : 0.85) * S, best.a1 - best.a0), c = Math.max(best.a0 + len / 2, Math.min(best.a1 - len / 2, best.along));
            const o = { id: 'o' + Math.random().toString(36).slice(2, 9), type: openMode, ...(best.hor ? { x1: Math.round(c - len / 2), y1: best.w.y1, x2: Math.round(c + len / 2), y2: best.w.y1 } : { x1: best.w.x1, y1: Math.round(c - len / 2), x2: best.w.x1, y2: Math.round(c + len / 2) }) };
            plan.openings = [...(plan.openings || []), o];
            sel = { type: 'opening', id: o.id }; dirtyEdit = true; rebuildWorld(true); buildItems();
          }
        }
        openMode = null; showSheet(); return;
      }
      if (stripDraft) { const q = surfaceHit(ev.clientX, ev.clientY) || planeHit(ev.clientX, ev.clientY, stripY); if (q) { stripDraft.push([Math.round(q[0] * 20) / 20, Math.round(q[1] * 20) / 20]); drawDraft(); showSheet(); } return; }
      // a window or door you clicked: pick it
      const q = aimHit(ev.clientX, ev.clientY);
      if (q) {
        const P = [q[0] * S, q[1] * S];
        const o = (plan.openings || []).find((x) => { const ax = safeNumber(x.x1), ay = safeNumber(x.y1), bx = safeNumber(x.x2), by = safeNumber(x.y2), L2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1, t = Math.max(0, Math.min(1, ((P[0] - ax) * (bx - ax) + (P[1] - ay) * (by - ay)) / L2)); return Math.hypot(P[0] - (ax + (bx - ax) * t), P[1] - (ay + (by - ay) * t)) < 0.22 * S; });
        if (o) { sel = { type: 'opening', id: o.id }; menu = null; rebuildWorld(); buildItems(); showSheet(); return; }
      }
      if (sel || menu) { sel = null; menu = null; rebuildWorld(); buildItems(); showSheet(); }
      return;
    }
    if (!tap) return;
    // walking (the tour, or on the way somewhere): a click only stops, right here — it never switches or opens a device
    if (stopIfWalking()) return;
    if (infoIt) { hideSheet(); return; }
    // a tap on a wall clock: the clock's own buttons
    for (const ck of lastVP ? clocks : []) {
      const r0 = canvas.getBoundingClientRect(), x = ck.fr.cx, y = ck.h, z = ck.fr.cz;
      const cxp = lastVP[0] * x + lastVP[4] * y + lastVP[8] * z + lastVP[12], cyp = lastVP[1] * x + lastVP[5] * y + lastVP[9] * z + lastVP[13], cw = lastVP[3] * x + lastVP[7] * y + lastVP[11] * z + lastVP[15];
      if (cw <= 0.1) continue;
      const sx = ((cxp / cw + 1) / 2) * r0.width + r0.left, sy = ((1 - cyp / cw) / 2) * r0.height + r0.top, rad = Math.max(24, (0.18 / cw) * r0.height);
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < rad) { showInfo(ck.it); return; }
    }
    const dev = pickDevice(ev.clientX, ev.clientY);
    if (dev) {
      // the device itself: a lamp or switch goes on/off, anything else shows what it does and its buttons
      const it = dev.it, dd = it.via ? 'switch' : dev.d;
      if (['light', 'switch', 'fan', 'input_boolean'].includes(dd) && !ringClock(it, hass) && !['thermo', 'holofan'].includes(applianceKind(it, hass.states[it.entity_id], hass))) hass.callService('homeassistant', 'toggle', { entity_id: it.via || it.entity_id });
      else showInfo(it);
      return;
    }
    const hitF = pickFurniture(ev.clientX, ev.clientY);
    if (hitF && tvFurn.has(hitF.f.id)) { showInfo(tvFurn.get(hitF.f.id)); return; }   // the TV: what it plays, and its buttons
    // standing still: a click on the floor walks there
    const r = canvas.getBoundingClientRect(), nx = ((ev.clientX - r.left) / r.width) * 2 - 1, ny = 1 - ((ev.clientY - r.top) / r.height) * 2;
    const f = fwd(), right = nrm(cross(f, [0, 1, 0])), up = cross(right, f), ty = Math.tan(fov / 2), tx = ty * (r.width / r.height);
    const dir = [f[0] + right[0] * nx * tx + up[0] * ny * ty, f[1] + right[1] * nx * tx + up[1] * ny * ty, f[2] + right[2] * nx * tx + up[2] * ny * ty];
    if (dir[1] > -0.02) return;
    const k = -eyeY() / dir[1];
    let x = cam.x + dir[0] * k, z = cam.z + dir[2] * k;
    // what you really tap: a wall, window or furniture in front of that floor spot means you walk up to it,
    // not to the floor behind it (in the next room, or outside)
    const hit = aimHit(ev.clientX, ev.clientY);
    if (hit && hit[2] > 0.03) {
      const hd = Math.hypot(hit[0] - cam.x, hit[1] - cam.z), back = Math.max(0, hd - 0.45);
      if (hd > 1e-3) { x = cam.x + ((hit[0] - cam.x) / hd) * back; z = cam.z + ((hit[1] - cam.z) / hd) * back; }
      if (back < 0.15) return;
    }
    if (roomOf(x, z)) walkTo(x, z);
  });
  canvas.addEventListener('pointercancel', () => { drag = null; });
  // phones: hold to walk forward or back
  for (const [id, sgn] of [['#fwd', 1], ['#back', -1]]) {
    const b = $(id);
    b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); hold = sgn; if (touring) { pausedTour = route; setTouring(false); } route = []; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((n) => b.addEventListener(n, () => { hold = 0; }));
  }
  // the little map: tap to walk there
  mapEl.addEventListener('click', (ev) => {
    const r = mapEl.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width) * mapBox.w + mapBox.x, z = ((ev.clientY - r.top) / r.height) * mapBox.h + mapBox.y;
    if (roomOf(x, z)) walkTo(x, z);
  });

  /* ------------------------------------------------------------- editing */
  let worldDirty = false, backup = null, draftBuf = null;
  /** The direction from your eye through a point on the screen. */
  function ray(cx, cy) {
    const r = canvas.getBoundingClientRect(), nx = ((cx - r.left) / r.width) * 2 - 1, ny = 1 - ((cy - r.top) / r.height) * 2;
    const f = fwd(), right = nrm(cross(f, [0, 1, 0])), up = cross(right, f), ty = Math.tan(fov / 2), tx = ty * (r.width / r.height);
    return [f[0] + right[0] * nx * tx + up[0] * ny * ty, f[1] + right[1] * nx * tx + up[1] * ny * ty, f[2] + right[2] * nx * tx + up[2] * ny * ty];
  }
  /** Where that line meets the level at height y (metres), as [x, z]. */
  function planeHit(cx, cy, y) {
    const d = ray(cx, cy), e = eyeY();
    if (Math.abs(d[1]) < 1e-4) return null;
    const k = (y - e) / d[1];
    if (k <= 0 || k > 40) return null;
    return [cam.x + d[0] * k, cam.z + d[2] * k];
  }
  /** The first thing you point at, with its height: [x, z, y]. */
  function aimHit(cx, cy) {
    const d = ray(cx, cy), e = eyeY();
    for (let t = 0.1; t < 14; t += 0.02) {
      const x = cam.x + d[0] * t, y = e + d[1] * t, z = cam.z + d[2] * t;
      if (y < 0 || y > H || world.blockers.some((q) => x >= q[0] && x <= q[2] && z >= q[1] && z <= q[3]) || (plan.furniture || []).some((f) => y <= furnHeight(f) && furnAt({ furniture: [f] }, x * S, z * S))) return [x, z, Math.max(0, Math.min(H, y))];
    }
    return null;
  }
  /** The first thing you point at (wall, furniture or floor), as [x, z] just in front of it. */
  function surfaceHit(cx, cy) {
    const d = ray(cx, cy), e = eyeY();
    for (let t = 0.1; t < 14; t += 0.02) {
      const x = cam.x + d[0] * t, y = e + d[1] * t, z = cam.z + d[2] * t;
      const hit = y < 0 || y > H || world.blockers.some((q) => x >= q[0] && x <= q[2] && z >= q[1] && z <= q[3])
        || (plan.furniture || []).some((f) => y <= furnHeight(f) && furnAt({ furniture: [f] }, x * S, z * S));
      if (hit) { const b = Math.max(0, t - 0.03); return [cam.x + d[0] * b, cam.z + d[2] * b]; }
    }
    return null;
  }
  /** The device you point at (its lamp, speaker, curtain...), nearest first, not through walls. */
  function pickDevice(cx, cy) {
    const d = nrm(ray(cx, cy)), e = [cam.x, eyeY(), cam.z], wall = aimHit(cx, cy), tw = wall ? Math.hypot(wall[0] - e[0], wall[2] - e[1], wall[1] - e[2]) + 0.15 : 99;
    // a ball (or, with ry, a tall egg: curtains, standing strips) around the device; also how far off its middle you point (0 = dead centre, 1 = the edge)
    let off = 1;
    const toSphere = (c, r, ry = r) => {
      const k = r / ry, v = [c[0] - e[0], (c[1] - e[1]) * k, c[2] - e[2]], dd = [d[0], d[1] * k, d[2]], L2 = dd[0] * dd[0] + dd[1] * dd[1] + dd[2] * dd[2];
      const t = (v[0] * dd[0] + v[1] * dd[1] + v[2] * dd[2]) / L2;
      if (t <= 0) return Infinity;
      const q = Math.hypot(dd[0] * t - v[0], dd[1] * t - v[1], dd[2] * t - v[2]);
      if (q > r) return Infinity;
      off = Math.min(off, q / r);
      return t;
    };
    const cands = [];
    for (const I of items) {
      const hh = I.hit;
      if (!hh || I.hidden) continue;   // a device that is part of furniture you drew: tap the furniture
      let t = Infinity;
      off = 1;
      if (hh.c) t = toSphere(hh.c, hh.r, hh.ry);
      else for (let i = 1; i < hh.line.length; i++) {
        const [ax, az] = hh.line[i - 1], [bx, bz] = hh.line[i];
        const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / (hh.r * 0.8)));
        for (let k = 0; k <= n; k++) t = Math.min(t, toSphere([ax + ((bx - ax) * k) / n, hh.y, az + ((bz - az) * k) / n], hh.r, hh.ry));
      }
      // in front of the wall behind it (a device on that wall itself still counts)
      if (t < Infinity && t <= tw + hh.r) cands.push({ I, t, off });
    }
    if (!cands.length) return null;
    // the nearest, but of things close together (a matrix on the wall beside a curtain) the one you point at the middle of
    const t0 = Math.min(...cands.map((c) => c.t));
    return cands.filter((c) => c.t < t0 + 0.6).sort((a, b) => a.off - b.off || a.t - b.t)[0].I;
  }
  /** The piece of furniture you point at (not through walls). */
  function pickFurniture(cx, cy) {
    const d = ray(cx, cy), e = eyeY();
    for (let t = 0.1; t < 14; t += 0.03) {
      const x = cam.x + d[0] * t, y = e + d[1] * t, z = cam.z + d[2] * t;
      if (y < 0 || y > H) return null;
      if (world.blockers.some((q) => x >= q[0] && x <= q[2] && z >= q[1] && z <= q[3])) return null;
      for (const f of plan.furniture || []) {
        if (y > Math.max(0.15, furnHeight(f)) || (f.type === 'wallcab' && y < 1.35)) continue;
        if (furnAt({ furniture: [f] }, x * S, z * S)) return { f, y };
      }
    }
    return null;
  }
  function rebuildWorld(withNav = false) {
    world = buildWorld(plan, hass, sel?.type === 'furn' ? sel.id : null);
    for (const k of ['solid', 'glass']) { if (buf[k]) gl.deleteBuffer(buf[k].b); buf[k] = world[k].v.length ? upload(world[k]) : null; }
    if (withNav) { nav = buildNav(plan, world, S, obstacles); graph = buildGraph(plan, S); }
    worldDirty = false;
  }
  /**
   * Drag a device: the first movement decides the direction and keeps it - sideways = along the floor
   * (left/right as you look), up/down = its height. One direction per drag, so nothing shifts by accident.
   */
  function startItemDrag(ev, rec) {
    ev.preventDefault();
    const it = rec.it;
    if (sel?.type !== 'item' || sel.id !== it.entity_id) {
      const wasFurn = sel?.type === 'furn';
      sel = { type: 'item', id: it.entity_id };
      items.forEach((I) => I.el.classList.toggle('sel', I === rec));
      if (wasFurn) rebuildWorld();
      showSheet();
    }
    const ox = safeNumber(it.x), oy = safeNumber(it.y), path0 = it.path ? it.path.map((q) => [...q]) : null, P0 = [...rec.P], h0 = rec.h;
    const L0 = lamps.filter((l) => l.it === it).map((l) => [l, [...l.P]]);
    const sx0 = ev.clientX, sy0 = ev.clientY, e0 = [cam.x, eyeY(), cam.z];
    // metres per screen pixel at the device's distance
    const dist = Math.max(0.3, Math.hypot(P0[0] - e0[0], P0[1] - e0[1], P0[2] - e0[2])), mpp = (dist * 2 * Math.tan(fov / 2)) / Math.max(1, canvas.clientHeight);
    const f = fwd(), right = nrm(cross(f, [0, 1, 0])), rl = Math.hypot(right[0], right[2]) || 1;
    let rx = right[0] / rl, rz = right[2] / rl, gain = 1;
    // a device on a wall slides along that wall (also when you look at the wall at an angle), never into it
    const room0 = itemRoom(it), mx0 = M(ox), mz0 = M(oy), fr = room0 ? wallFrame(room0, mx0, mz0) : null;
    const onWall = fr && !fr.free && fr.d < 0.4 && !path0;
    if (onWall) {
      const dot = fr.ux * rx + fr.uz * rz, sg = dot < 0 ? -1 : 1;
      rx = fr.ux * sg; rz = fr.uz * sg;
      gain = 1 / Math.max(0.35, Math.abs(dot));   // so it keeps up with the mouse
    }
    // the point that must stay in the device's own room (a bit into the room for a device on its wall)
    const inn = onWall ? [fr.nx * 0.12, fr.nz * 0.12] : [0, 0];
    const roomG = roomOf(mx0 + inn[0], mz0 + inn[1]);   // the room it really stands in (if it is in one at all)
    const stays = (dx, dz) => !roomG || roomOf(mx0 + dx + inn[0], mz0 + dz + inn[1]) === roomG;
    let last = [0, 0];
    const b = rec.el.querySelector('.b');
    b.setPointerCapture(ev.pointerId);
    let axis = null, dh = 0;
    const move = (e) => {
      const dxp = e.clientX - sx0, dyp = e.clientY - sy0;
      if (!axis) { if (Math.hypot(dxp, dyp) < 7) return; axis = Math.abs(dxp) >= Math.abs(dyp) ? 'h' : 'v'; rec.el.dataset.axis = axis; }
      if (axis === 'h') {
        const m = dxp * mpp * gain;
        let dx = rx * m, dz = rz * m;
        if (!stays(dx, dz)) { if (!stays(last[0], last[1])) return; [dx, dz] = last; }   // not through the wall into the next room or outside
        last = [dx, dz];
        it.x = Math.round(ox + dx * S); it.y = Math.round(oy + dz * S);
        if (path0) it.path = path0.map(([x, y]) => [Math.round(x + dx * S), Math.round(y + dz * S)]);
        rec.P[0] = P0[0] + dx; rec.P[2] = P0[2] + dz;
        for (const [l, lp] of L0) { l.P[0] = lp[0] + dx; l.P[2] = lp[2] + dz; }
      } else {
        dh = Math.max(-h0, Math.min(H - 0.05 - h0, -dyp * mpp));
        rec.P[1] = P0[1] + dh;
        for (const [l, lp] of L0) l.P[1] = lp[1] + dh;
      }
    };
    const up = () => {
      b.removeEventListener('pointermove', move); b.removeEventListener('pointerup', up); b.removeEventListener('pointercancel', up);
      delete rec.el.dataset.axis;
      if (!axis) return;
      if (axis === 'v') it.height = Math.round((h0 + dh) * 100) / 100;
      dirtyEdit = true; buildItems(); nav = buildNav(plan, world, S, obstacles); showSheet();
    };
    b.addEventListener('pointermove', move); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
  }
  function removeFurn() {
    if (sel?.type !== 'furn') return;
    plan.furniture = (plan.furniture || []).filter((f) => f.id !== sel.id);
    sel = null; dirtyEdit = true; rebuildWorld(true); buildItems(); showSheet();
  }
  /** The LED strip being drawn, as a glowing line. */
  function drawDraft() {
    if (draftBuf) { gl.deleteBuffer(draftBuf.b); draftBuf = null; }
    if (!stripDraft || stripDraft.length < 1) return;
    const m = new Mesh(), tw = 0.02;
    stripDraft.forEach(([x, z]) => m.prism([[x - 0.04, z - 0.04], [x + 0.04, z - 0.04], [x + 0.04, z + 0.04], [x - 0.04, z + 0.04]], stripY - 0.04, stripY + 0.04, [1, 1, 1]));
    for (let i = 1; i < stripDraft.length; i++) {
      const [ax, az] = stripDraft[i - 1], [bx, bz] = stripDraft[i], L = Math.hypot(bx - ax, bz - az) || 1, nx = (-(bz - az) / L) * tw, nz = ((bx - ax) / L) * tw;
      m.prism([[ax + nx, az + nz], [bx + nx, bz + nz], [bx - nx, bz - nz], [ax - nx, az - nz]], stripY - 0.015, stripY + 0.015, [1, 1, 1]);
    }
    draftBuf = upload(m);
  }
  const fmtM = (v) => `${v.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
  /** The panel for what you picked: height and LED strip for a device, turning and removing for furniture. */
  function showSheet() {
    const sh = $('.sheet');
    if (!editing) { hideSheet(); return; }
    sh.classList.remove('camsh'); sh.onclick = null;
    let html = '';
    if (stripDraft) {
      const len = pathLength(stripDraft);
      html = `<b>${T.strip}</b><small>${T.strip_hint}</small><div class="row"><span>${T.height}</span><button data-a="sy-">−</button><span>${fmtM(stripY)}</span><button data-a="sy+">+</button></div>
        <div class="row"><span>${stripDraft.length} · ${fmtM(len)}</span><button data-a="sundo">↶</button><button data-a="scancel">${T.cancel}</button><button class="pri" data-a="sdone">${T.done}</button></div>`;
    } else if (sel?.type === 'item') {
      const rec = items.find((I) => I.it.entity_id === sel.id);
      if (rec) {
        const it = rec.it, lampish = it.kind !== 'device' && (rec.d === 'light' || it.kind === 'lamp' || ['switch', 'input_boolean'].includes(rec.d));
        const h0 = rec.h;   // what you see (your own height, or the usual one)
        const turnable = THINGS.has(applianceKind(it, hass.states[it.entity_id], hass) || deviceKind(it, hass.states[it.entity_id], hass));   // a 3D printer, router, hub...: turn it on its spot
        html = `<b>${esc(it.name || friendly(hass, it.entity_id))}</b><div class="row"><span>${T.height}</span><button data-a="h-">−</button><span>${fmtM(h0)}</span><button data-a="h+">+</button><button data-a="idel"><ha-icon icon="mdi:delete-outline"></ha-icon>${T.remove_dev}</button></div>${turnable ? `<div class="row"><span>${T.rotate}</span><button data-a="ir-15">↺ 15°</button><button data-a="ir15">↻ 15°</button><button data-a="ir90">↻ 90°</button></div>` : ''}
          ${lampish && isSpot(it, hass.states[it.entity_id]) ? `<div class="row"><button data-a="aim" class="${aimFor === it ? 'pri' : ''}"><ha-icon icon="mdi:crosshairs-gps"></ha-icon>${T.aim}</button>${aimFor === it ? `<span>${T.aim_hint}</span>` : ''}</div>` : ''}
          ${lampish ? `<div class="row"><button data-a="strip"><ha-icon icon="mdi:vector-polyline"></ha-icon>${T.strip}</button>${it.shape === 'strip' ? `<button data-a="icon">${T.strip_icon}</button>${stripPath(it) ? `<span>${fmtM(pathLength(stripPath(it)) / S)}</span>` : ''}` : ''}</div>${stripPath(it) ? `<div class="row"><span>${T.strip_dir}</span>${[['', T.strip_flat], ['up', T.strip_up], ['frame3', T.strip_frame3], ['frame', T.strip_frame]].map(([k, t2]) => `<button data-a="sd:${k}" class="${(it.strip_dir || '') === k ? 'pri' : ''}">${t2}</button>`).join('')}</div>${it.strip_dir ? `<div class="row"><span>${T.strip_to}</span><button data-a="st-">−</button><span>${fmtM(stripTop(it))}</span><button data-a="st+">+</button></div>` : ''}` : ''}` : ''}`;
      }
    } else if (sel?.type === 'opening') {
      const o = (plan.openings || []).find((x) => x.id === sel.id);
      if (o) html = `<b>${o.type === 'window' ? T.window : o.type === 'door' ? T.door : T.passage}</b>
        <div class="row"><span>${T.kind}</span>${['window', 'door', 'open'].map((k) => `<button data-a="ot:${k}" class="${o.type === k ? 'pri' : ''}">${k === 'window' ? T.window : k === 'door' ? T.door : T.passage}</button>`).join('')}</div>
        <div class="row"><span>${T.width}</span><button data-a="ow-">−</button><span>${fmtM(Math.hypot(o.x2 - o.x1, o.y2 - o.y1) / S)}</span><button data-a="ow+">+</button><button data-a="odel"><ha-icon icon="mdi:delete-outline"></ha-icon>${T.remove}</button></div>`;
    } else if (sel?.type === 'furn') {
      const f = (plan.furniture || []).find((x) => x.id === sel.id);
      if (f) html = `<b>${esc(FURN_NAME[lang][f.type] || f.type)}</b>
        <div class="row"><span>${T.width}</span><button data-a="fw-">−</button><span>${fmtM(safeNumber(f.w) / S)}</span><button data-a="fw+">+</button><span>${T.depth}</span><button data-a="fd-">−</button><span>${fmtM(safeNumber(f.h) / S)}</span><button data-a="fd+">+</button></div>
        <div class="row"><span>${T.height}</span><button data-a="fz-">−</button><span>${fmtM(tvOnWall(f) ? tvScreen(f, S)[0] : furnHeight(f))}</span><button data-a="fz+">+</button><select data-sel="ftype">${Object.keys(FURN_TYPES).map((k) => `<option value="${k}" ${k === f.type ? 'selected' : ''}>${esc(FURN_NAME[lang][k] || k)}</option>`).join('')}</select></div>
        ${f.type === 'videowall' ? `<div class="row"><span>${T.vw_bot}</span><button data-a="vb-">−</button><span>${fmtM(videoWallSpan(f)[0])}</span><button data-a="vb+">+</button><span>${T.vw_top}</span><button data-a="vt-">−</button><span>${fmtM(videoWallSpan(f)[1])}</span><button data-a="vt+">+</button></div>` : ''}
        ${f.type === 'cabinet' ? `<div class="row"><span>${T.legs}</span><button data-a="fl-">−</button><span>${fmtM(safeNumber(f.legs, 0))}</span><button data-a="fl+">+</button></div>` : ''}
        ${f.type === 'sofa' ? `<div class="row"><span>${T.sofa_shape}</span>${['', 'left', 'right'].map((k) => `<button data-a="fs:${k}" class="${(f.shape || '') === k ? 'pri' : ''}">${T['sofa_' + (k || 'straight')]}</button>`).join('')}</div>` : ''}
        ${['table', 'round'].includes(f.type) ? `<div class="row"><span>${T.chairs}</span><button data-a="fc-">−</button><span>${f.type === 'round' ? roundChairs(f).length : tableChairs(f).length}</span><button data-a="fc+">+</button></div>` : ''}
        ${f.type === 'tv' ? `<div class="row"><button data-a="fwall" class="${tvOnWall(f) ? 'on' : ''}"><ha-icon icon="mdi:television-classic"></ha-icon>${tvOnWall(f) ? T.tv_wall : T.tv_stand}</button><small>${tvOnWall(f) ? T.tv_wall_h : ''}</small></div>` : ''}
        <div class="row"><span>${T.rotate}</span><button data-a="r-">⟲ 15°</button><button data-a="r+">⟳ 15°</button><button data-a="r90">90°</button></div><div class="row"><button data-a="del"><ha-icon icon="mdi:delete-outline"></ha-icon>${T.remove}</button></div>`;
    } else if (openMode) {
      html = `<b>${openMode === 'window' ? T.window : T.door}</b><small>${T.open_hint}</small><div class="row"><button data-a="ocancel">${T.cancel}</button></div>`;
    } else if (menu === 'dev') {
      // devices of the room you are in that are not on the plan yet
      const r = roomOf(cam.x, cam.z), placed = new Set(plan.items.map((i) => i.entity_id));
      const ids = r?.area_id ? placeCandidates(hass, r.area_id).filter((id) => !placed.has(id)) : [];
      html = `<b>${T.add_dev}${r ? ` – ${esc(r.name)}` : ''}</b>${ids.length ? `<div class="row">${ids.slice(0, 18).map((id) => `<button data-a="add:${esc(id)}">${esc(friendly(hass, id))}</button>`).join('')}</div>` : `<small>${T.none_left}</small>`}<div class="row"><button data-a="menu:">${T.back2}</button></div>`;
    } else if (menu === 'furn') {
      html = `<b>${T.add_furn}</b><div class="row">${Object.keys(FURN_TYPES).filter((k) => k !== 'model').map((k) => `<button data-a="addf:${k}"><ha-icon icon="${FURN_TYPES[k].icon}"></ha-icon>${esc(FURN_NAME[lang][k] || k)}</button>`).join('')}</div><div class="row"><button data-a="menu:">${T.back2}</button></div>`;
    } else html = `<small>${T.edit_hint}</small><div class="row"><button data-a="menu:dev"><ha-icon icon="mdi:plus-circle-outline"></ha-icon>${T.add_dev}</button><button data-a="menu:furn"><ha-icon icon="mdi:sofa-outline"></ha-icon>${T.add_furn}</button><button data-a="om:window"><ha-icon icon="mdi:window-closed-variant"></ha-icon>${T.window}</button><button data-a="om:door"><ha-icon icon="mdi:door"></ha-icon>${T.door}</button></div>`;
    sh.innerHTML = html;
    sh.classList.add('show');
    sh.querySelectorAll('[data-a]').forEach((bt) => bt.addEventListener('click', (ev) => { ev.stopPropagation(); sheetAction(bt.dataset.a); }));
    sh.querySelector('[data-sel="ftype"]')?.addEventListener('change', (ev) => { const f = (plan.furniture || []).find((x) => x.id === sel?.id); if (f) { f.type = ev.target.value; dirtyEdit = true; rebuildWorld(true); buildItems(); showSheet(); } });
  }
  function sheetAction(a) {
    const it = sel?.type === 'item' ? plan.items.find((i) => i.entity_id === sel.id) : null, f = sel?.type === 'furn' ? (plan.furniture || []).find((x) => x.id === sel.id) : null;
    if (a === 'h-' || a === 'h+') {
      const rec = items.find((I) => I.it === it), cur = rec?.h ?? ownHeight(it) ?? 1;
      it.height = Math.round(Math.max(0, Math.min(H - 0.05, cur + (a === 'h+' ? 0.1 : -0.1))) * 100) / 100;
      dirtyEdit = true; buildItems();
    } else if (a === 'strip') {
      const rec = items.find((I) => I.it === it);
      stripY = rec?.h ?? ownHeight(it) ?? 1; stripDraft = []; drawDraft();
    } else if (a === 'icon') { delete it.shape; dirtyEdit = true; buildItems(); }
    else if (it && a.startsWith('sd:')) { const k = a.slice(3); if (k) { it.strip_dir = k; if (it.top == null) it.top = Math.round(Math.min(H - 0.05, (ownHeight(it) ?? 1) + 0.6) * 100) / 100; } else { delete it.strip_dir; delete it.top; } dirtyEdit = true; buildItems(); }
    else if (it && (a === 'st-' || a === 'st+')) { it.top = Math.round(Math.max((ownHeight(it) ?? 0) + 0.05, Math.min(H - 0.02, stripTop(it) + (a === 'st+' ? 0.05 : -0.05))) * 100) / 100; dirtyEdit = true; buildItems(); }
    else if (a === 'aim') { aimFor = aimFor === it ? null : it; }
    else if (/^ir-?\d+$/.test(a) && it) { it.rot = ((((+it.rot || 0) + +a.slice(2)) % 360) + 360) % 360; if (!it.rot) delete it.rot; dirtyEdit = true; buildItems(); }
    else if (a === 'idel' && it) { plan.items = plan.items.filter((i) => i !== it); sel = null; dirtyEdit = true; buildItems(); nav = buildNav(plan, world, S, obstacles); }
    else if (a.startsWith('menu:')) { menu = a.slice(5) || null; }
    else if (a.startsWith('add:')) {
      // a device of this room: in front of you, at about 1.2 m
      const id = a.slice(4), x = cam.x + Math.sin(cam.yaw) * 1.2, z = cam.z + Math.cos(cam.yaw) * 1.2;
      plan.items.push({ entity_id: id, x: Math.round(x * S), y: Math.round(z * S) });
      sel = { type: 'item', id }; menu = null; dirtyEdit = true; buildItems();
    } else if (a.startsWith('addf:')) {
      // a piece of furniture: on the floor in front of you, turned the way you look
      const k = a.slice(5), d0 = FURN_TYPES[k], x = cam.x + Math.sin(cam.yaw) * 1.6, z = cam.z + Math.cos(cam.yaw) * 1.6;
      const f2 = { id: 'f' + Math.random().toString(36).slice(2, 9), type: k, x: Math.round(x * S), y: Math.round(z * S), w: Math.round((d0.w / 100) * S), h: Math.round((d0.h / 100) * S), rot: Math.round(((-cam.yaw * 180) / Math.PI + 360) % 360 / 15) * 15 % 360 };
      plan.furniture = [...(plan.furniture || []), f2];
      sel = { type: 'furn', id: f2.id }; menu = null; dirtyEdit = true; rebuildWorld(true); buildItems();
    } else if (f && /^v[bt][-+]$/.test(a)) {
      const [b0, b1] = videoWallSpan(f), dv = a.endsWith('+') ? 0.05 : -0.05;
      if (a[1] === 'b') f.elev = Math.round(Math.max(0, Math.min(b1 - 0.3, b0 + dv)) * 100) / 100; else f.top = Math.round(Math.max(b0 + 0.3, Math.min(H, b1 + dv)) * 100) / 100;
      dirtyEdit = true; rebuildWorld(true); buildItems();
    } else if (f && (a === 'fl-' || a === 'fl+')) {
      const v = Math.round(Math.max(0, Math.min(1, safeNumber(f.legs, 0) + (a === 'fl+' ? 0.05 : -0.05))) * 100) / 100;
      if (v > 0) f.legs = v; else delete f.legs;
      dirtyEdit = true; rebuildWorld(true); buildItems();
    } else if (f && a.startsWith('fs:')) {
      const k = a.slice(3);
      if (k) { f.shape = k; if (safeNumber(f.h) < safeNumber(f.w) * 0.6) f.h = Math.round(safeNumber(f.w) * 0.7); } else delete f.shape;
      dirtyEdit = true; rebuildWorld(true); buildItems(); nav = buildNav(plan, world, S, obstacles);
    } else if (f && (a === 'fc-' || a === 'fc+')) {
      const cur = f.type === 'round' ? roundChairs(f).length : tableChairs(f).length;
      f.chairs = Math.max(0, Math.min(20, cur + (a === 'fc+' ? 1 : -1)));
      dirtyEdit = true; rebuildWorld(true); buildItems();
    } else if (f && a === 'fwall') {
      if (tvOnWall(f)) { delete f.mount; delete f.elev; } else { f.mount = 'wall'; delete f.z; }
      dirtyEdit = true; rebuildWorld(true); buildItems();
    } else if (f && /^f[wdz][-+]$/.test(a)) {
      const up = a.endsWith('+');
      if (a[1] === 'w') f.w = Math.max(0.1 * S, safeNumber(f.w) + (up ? 0.05 : -0.05) * S);
      if (a[1] === 'd') f.h = Math.max(0.06 * S, safeNumber(f.h) + (up ? 0.05 : -0.05) * S);
      if (a[1] === 'z' && tvOnWall(f)) f.elev = Math.round(Math.max(0, Math.min(H - 0.4, tvScreen(f, S)[0] + (up ? 0.05 : -0.05))) * 100) / 100;
      else if (a[1] === 'z') f.z = Math.round(Math.max(0.05, Math.min(H, furnHeight(f) + (up ? 0.05 : -0.05))) * 100) / 100;
      f.w = Math.round(f.w); f.h = Math.round(f.h);
      dirtyEdit = true; rebuildWorld(true); buildItems();
    } else if (a.startsWith('om:')) { openMode = a.slice(3); sel = null; }
    else if (a === 'ocancel') openMode = null;
    else if (sel?.type === 'opening' && (a.startsWith('ot:') || a === 'ow-' || a === 'ow+' || a === 'odel')) {
      const o = plan.openings.find((x) => x.id === sel.id);
      if (o && a.startsWith('ot:')) o.type = a.slice(3);
      if (o && (a === 'ow-' || a === 'ow+')) {
        const hor = o.y1 === o.y2, c = hor ? (o.x1 + o.x2) / 2 : (o.y1 + o.y2) / 2, len = Math.max(0.3 * S, Math.hypot(o.x2 - o.x1, o.y2 - o.y1) + (a === 'ow+' ? 0.1 : -0.1) * S);
        if (hor) { o.x1 = Math.round(c - len / 2); o.x2 = Math.round(c + len / 2); } else { o.y1 = Math.round(c - len / 2); o.y2 = Math.round(c + len / 2); }
      }
      if (o && a === 'odel') { plan.openings = plan.openings.filter((x) => x !== o); sel = null; }
      dirtyEdit = true; rebuildWorld(true); buildItems();
    }
    else if (a === 'sy-' || a === 'sy+') { stripY = Math.round(Math.max(0.05, Math.min(H - 0.02, stripY + (a === 'sy+' ? 0.1 : -0.1))) * 100) / 100; drawDraft(); }
    else if (a === 'sundo') { stripDraft.pop(); drawDraft(); }
    else if (a === 'scancel') { stripDraft = null; drawDraft(); }
    else if (a === 'sdone') {
      if (stripDraft.length >= 2 && it) {
        it.shape = 'strip'; it.path = stripDraft.map(([x, z]) => [Math.round(x * S), Math.round(z * S)]); it.height = stripY;
        [it.x, it.y] = pathMid(it.path).map(Math.round); dirtyEdit = true;
      }
      stripDraft = null; drawDraft(); buildItems();
    } else if (f && (a === 'r-' || a === 'r+' || a === 'r90')) {
      f.rot = ((safeNumber(f.rot) + (a === 'r90' ? 90 : a === 'r+' ? 15 : -15)) % 360 + 360) % 360;
      dirtyEdit = true; rebuildWorld(true); buildItems();
    } else if (a === 'del') removeFurn();
    showSheet();
  }
  /* ------------------------------------------------------- info and buttons */
  let infoIt = null, infoFull = false, camTimer = 0;
  /** What a device is doing, with its buttons: TV/speaker, climate, curtain, or just its state. */
  /** Close the info window (and stop a camera picture that is still streaming). */
  function hideSheet() {
    const sh = $('.sheet');
    infoIt = null; clearInterval(camTimer);
    if (!sh) return;
    sh.classList.remove('show', 'camsh'); sh.onclick = null;
    if (sh.dataset.cam) { sh.dataset.cam = ''; const im = sh.querySelector('img.cam'); if (im) im.src = ''; }
  }
  function showInfo(it, refresh = false, full = false) {
    if (editing) return;
    const sh = $('.sheet'), st = hass.states[it.entity_id], d = it.entity_id.split('.')[0], a = st?.attributes || {};
    if (!refresh) { infoIt = it; infoFull = full; }
    if (!sh || infoIt !== it) return;
    if (refresh && sh.matches(':focus-within')) return;   // you are moving a slider or picking from a list: don't redraw under your finger
    if (infoFull) { fullMenu(it, sh, st, d, a); return; }
    const name = esc(it.name || friendly(hass, it.entity_id)), state = st ? esc(st.state) : '–';
    let body = '';
    if (d === 'media_player') {
      const title = [a.media_title, a.media_artist || a.media_series_title || a.app_name || a.source].filter(Boolean).map(esc).join(' – ');
      const vol = a.volume_level != null ? Math.round(a.volume_level * 100) : null;
      body = `<small>${state}${title ? ` · ${title}` : ''}</small>
        <div class="row"><button data-s="media_player.toggle"><ha-icon icon="mdi:power"></ha-icon>${T.power}</button><button data-s="media_player.media_previous_track"><ha-icon icon="mdi:skip-previous"></ha-icon></button><button data-s="media_player.media_play_pause"><ha-icon icon="mdi:play-pause"></ha-icon></button><button data-s="media_player.media_next_track"><ha-icon icon="mdi:skip-next"></ha-icon></button></div>
        <div class="row"><span>${T.vol}${vol != null ? ` ${vol}%` : ''}</span><button data-s="media_player.volume_down"><ha-icon icon="mdi:volume-minus"></ha-icon></button><button data-s="media_player.volume_up"><ha-icon icon="mdi:volume-plus"></ha-icon></button><button data-s="media_player.volume_mute" data-mute="1"><ha-icon icon="mdi:volume-mute"></ha-icon></button></div>`;
    } else if (d === 'climate') {
      const m = airconMode(st), cur = a.current_temperature, tgt = a.temperature;
      body = `<small>${state}${m ? ` · ${T.modes[m]}` : ''}${cur != null ? ` · ${T.now} ${cur}°` : ''}</small>
        <div class="row"><span>${T.target}${tgt != null ? ` ${tgt}°` : ''}</span><button data-t="-0.5">−</button><button data-t="0.5">+</button><button data-s="climate.toggle"><ha-icon icon="mdi:power"></ha-icon>${T.power}</button></div>`;
    } else if (d === 'cover') {
      body = `<small>${state}${a.current_position != null ? ` · ${a.current_position}%` : ''}</small>
        <div class="row"><button data-s="cover.open_cover"><ha-icon icon="mdi:arrow-up"></ha-icon>${T.open}</button><button data-s="cover.stop_cover"><ha-icon icon="mdi:stop"></ha-icon>${T.stop}</button><button data-s="cover.close_cover"><ha-icon icon="mdi:arrow-down"></ha-icon>${T.closeit}</button></div>`;
    } else if (d === 'vacuum') {
      body = `<small>${state}${a.battery_level != null ? ` · 🔋 ${a.battery_level}%` : ''}</small>
        <div class="row"><button data-s="vacuum.start"><ha-icon icon="mdi:play"></ha-icon>${T.vstart}</button><button data-s="vacuum.pause"><ha-icon icon="mdi:pause"></ha-icon></button><button data-s="vacuum.return_to_base"><ha-icon icon="mdi:home-import-outline"></ha-icon>${T.vdock}</button></div>`;
    } else if (d === 'lock') {
      body = `<small>${state}</small>
        <div class="row"><button data-s="lock.lock"><ha-icon icon="mdi:lock"></ha-icon>${T.lockit}</button><button data-s="lock.unlock"><ha-icon icon="mdi:lock-open-variant"></ha-icon>${T.unlockit}</button></div>`;
    } else if (d === 'camera') {
      // the live picture of its light stream; without a stream: a still, refreshed aside (no flashing)
      if (refresh && sh.dataset.cam === it.entity_id && sh.querySelector('img.cam')) return;
      const live = camStream(hass, it.entity_id), still = camPic(hass, it.entity_id, 900);
      body = `<small>${state}</small>${live || still ? `<img class="cam" src="${esc(live || still)}" alt="">` : ''}`;
    } else if (applianceKind(it, st, hass) === 'holofan') {
      // a hologram fan: what it shows (its picture), the clip playing, pick another clip, play/stop and on/off
      const img = deviceImage(hass, it.entity_id), pic = img && hass.states[img]?.attributes?.entity_picture;
      const playing = deviceSibling(hass, it.entity_id, 'sensor', /playing/), file = deviceSibling(hass, it.entity_id, 'select', /file/), play = deviceSibling(hass, it.entity_id, 'switch', /playing/);
      const fs = file ? hass.states[file] : null, ps = playing ? hass.states[playing]?.state : null;
      body = `<small>${state}${ps ? ` · ▶ ${esc(ps)}` : ''}</small>${pic ? `<img class="cam holo" src="${esc(pic)}${pic.includes('?') ? '&' : '?'}_=${encodeURIComponent(hass.states[img].state)}" alt="">` : ''}
        ${fs?.attributes?.options?.length ? `<div class="row"><span>${T.clip}</span><select data-file="${esc(file)}">${fs.attributes.options.map((o) => `<option ${o === fs.state ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>` : ''}
        <div class="row"><button data-s="homeassistant.toggle"><ha-icon icon="mdi:power"></ha-icon>${T.power}</button>${play ? `<button data-play="${esc(play)}" class="${hass.states[play]?.state === 'on' ? 'pri' : ''}"><ha-icon icon="mdi:${hass.states[play]?.state === 'on' ? 'pause' : 'play'}"></ha-icon></button>` : ''}</div>`;
    } else if (applianceKind(it, st, hass) === 'thermo') {
      // a thermometer: the temperature and humidity of its device (whatever entity is on the plan)
      const dev = hass.entities?.[it.entity_id]?.device_id, vals = Object.values(hass.entities || {}).filter((e) => dev ? e.device_id === dev : e.entity_id === it.entity_id).map((e) => hass.states[e.entity_id]).filter((x) => x && ['temperature', 'humidity', 'battery'].includes(x.attributes?.device_class));
      body = `<small>${vals.sort((x, y) => ['temperature', 'humidity', 'battery'].indexOf(x.attributes.device_class) - ['temperature', 'humidity', 'battery'].indexOf(y.attributes.device_class)).map((x) => `${{ temperature: '🌡', humidity: '💧', battery: '🔋' }[x.attributes.device_class]} ${esc(x.state)}${esc(x.attributes.unit_of_measurement || '')}`).join(' · ') || esc(state)}</small>`;
    } else {
      const v = (it.app ? `${applianceRunning(hass, it.app, it.entity_id) ? T.app_run : T.app_idle} · ` : '') + (st ? `${st.state}${a.unit_of_measurement ? ` ${a.unit_of_measurement}` : ''}` : '–');
      // what else its device tells (power, energy, status, time left...), for an appliance or plug
      const dev = hass.entities?.[it.entity_id]?.device_id;
      const more = dev ? Object.values(hass.entities || {}).filter((e) => e.device_id === dev && e.entity_id !== it.entity_id && !e.hidden && /^(sensor|binary_sensor)\./.test(e.entity_id) && hass.states[e.entity_id] && !['unavailable', 'unknown'].includes(hass.states[e.entity_id].state)).slice(0, 5) : [];
      if (more.length) body = `<small>${esc(v)}</small>${more.map((e) => { const s2 = hass.states[e.entity_id]; return `<small>${esc(friendly(hass, e.entity_id).replace(friendly(hass, it.entity_id), '').trim() || friendly(hass, e.entity_id))}: <b>${esc(s2.state)}${s2.attributes.unit_of_measurement ? ` ${esc(s2.attributes.unit_of_measurement)}` : ''}</b></small>`; }).join('')}`;
      else
      body = `<small>${esc(v)}</small>${['light', 'switch', 'fan', 'input_boolean', 'humidifier'].includes(d) ? `<div class="row"><button data-s="homeassistant.toggle"><ha-icon icon="mdi:power"></ha-icon>${T.power}</button></div>` : ''}`;
    }
    // a camera: twice as big, no cross - a click on the picture closes it
    const isCam = d === 'camera';
    if (sh.dataset.cam && sh.dataset.cam !== it.entity_id) { const im = sh.querySelector('img.cam'); if (im) im.src = ''; }
    const oldPic = sh.querySelector('img.cam.holo');
    sh.innerHTML = `<b>${name}</b>${body}${isCam ? '' : `<button class="x2" data-close="1" title="${T.close}">×</button>`}`;
    sh.classList.toggle('camsh', isCam);
    // the same picture as before: keep the loaded one (no flash on every update)
    const newPic = sh.querySelector('img.cam.holo');
    if (oldPic && newPic && oldPic.src === newPic.src) newPic.replaceWith(oldPic);
    sh.classList.add('show');
    sh.dataset.cam = isCam ? it.entity_id : '';
    sh.onclick = isCam ? (ev) => { ev.stopPropagation(); hideSheet(); } : null;
    clearInterval(camTimer);
    if (isCam) {
      const img = sh.querySelector('img.cam');
      const stillLoop = () => {
        clearInterval(camTimer);
        camTimer = setInterval(() => {
          if (sh.dataset.cam !== it.entity_id || !sh.classList.contains('show')) { clearInterval(camTimer); return; }
          const pic = camPic(hass, it.entity_id, 900);
          if (!pic) return;
          const im = new Image(), url = `${pic}&_=${Date.now()}`;
          im.onload = () => { if (img.isConnected) img.src = url; };
          im.src = url;
        }, 1500);
      };
      // a camera without a working stream: stills instead
      if (img) { img.onerror = () => { img.onerror = null; const pic = camPic(hass, it.entity_id, 900); if (pic) img.src = pic; stillLoop(); }; if (!img.src.includes('camera_proxy_stream')) stillLoop(); }
    }
    sh.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const [dom, svc] = b.dataset.s.split('.'), data = { entity_id: it.entity_id };
      if (b.dataset.mute) data.is_volume_muted = !a.is_volume_muted;
      hass.callService(dom, svc, data);
    }));
    sh.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); const d = climateTarget(hass.states[it.entity_id], Math.sign(+b.dataset.t)); if (d) hass.callService('climate', 'set_temperature', { entity_id: it.entity_id, ...d }); }));
    sh.querySelectorAll('[data-file]').forEach((el) => el.addEventListener('change', (ev) => { ev.stopPropagation(); hass.callService('select', 'select_option', { entity_id: el.dataset.file, option: el.value }); el.blur(); }));
    sh.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); hass.callService('switch', 'toggle', { entity_id: b.dataset.play }); }));
    sh.querySelector('[data-close]')?.addEventListener('click', (ev) => { ev.stopPropagation(); infoIt = null; sh.classList.remove('show'); });
  }
  /**
   * Long press on a device: its full menu - brightness, colour, white, effect for a light; mode, fan, preset for climate;
   * speed for a fan; source for a player; position for a curtain; the options of a select.
   */
  function fullMenu(it, sh, st, d, a) {
    const id = it.via || it.entity_id, name = esc(it.name || friendly(hass, it.entity_id)), dd = it.via ? 'switch' : d;
    const sel = (key, label, list, cur) => (Array.isArray(list) && list.length ? `<div class="row"><span>${label}</span><select data-m="${key}">${list.map((o) => `<option ${String(o) === String(cur) ? 'selected' : ''}>${esc(String(o))}</option>`).join('')}</select></div>` : '');
    const rng = (key, label, min, max, val, step = 1) => `<div class="row"><span>${label}</span><input type="range" data-m="${key}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
    let body = `<small>${st ? esc(st.state) : '–'}</small>`;
    if (['light', 'switch', 'fan', 'input_boolean', 'climate', 'media_player', 'humidifier'].includes(dd)) body += `<div class="row"><button data-m="toggle" class="${isOn(st) ? 'pri' : ''}"><ha-icon icon="mdi:power"></ha-icon>${T.power}</button></div>`;
    if (dd === 'light') {
      const modes = a.supported_color_modes || [], col = modes.some((m) => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(m)), ct = modes.includes('color_temp');
      if (modes.some((m) => m !== 'onoff')) body += rng('bri', T.bri, 1, 100, a.brightness != null ? Math.round((a.brightness / 255) * 100) : 100);
      if (col) {
        const cur = Array.isArray(a.rgb_color) ? '#' + a.rgb_color.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') : '#ffffff';
        body += `<div class="row"><span>${T.colour}</span>${['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#007aff', '#af52de', '#ff2d92', '#ffffff'].map((c) => `<button class="sw" data-rgb="${c}" style="background:${c}"></button>`).join('')}<input type="color" data-m="rgb" value="${cur}"></div>`;
      }
      if (ct) body += rng('ct', T.ctemp, a.min_color_temp_kelvin || 2000, a.max_color_temp_kelvin || 6500, a.color_temp_kelvin || 3000, 50);
      body += sel('effect', T.effect, a.effect_list, a.effect);
    } else if (dd === 'climate') {
      body += sel('hvac', T.mode, a.hvac_modes, st?.state) + sel('fanmode', T.fanm, a.fan_modes, a.fan_mode) + sel('preset', T.preset, a.preset_modes, a.preset_mode);
      if (a.temperature != null) body += `<div class="row"><span>${T.target} ${a.temperature}°</span><button data-t="-0.5">−</button><button data-t="0.5">+</button></div>`;
    } else if (dd === 'fan') {
      if (a.percentage != null) body += rng('pct', T.speed, 0, 100, a.percentage, a.percentage_step || 1);
      body += sel('preset', T.preset, a.preset_modes, a.preset_mode);
    } else if (dd === 'media_player') {
      if (a.volume_level != null) body += rng('vol', T.vol, 0, 100, Math.round(a.volume_level * 100));
      body += sel('source', T.source, a.source_list, a.source) + sel('sound', T.mode, a.sound_mode_list, a.sound_mode);
    } else if (dd === 'cover') {
      body += `<div class="row"><button data-s="cover.open_cover"><ha-icon icon="mdi:arrow-up"></ha-icon>${T.open}</button><button data-s="cover.stop_cover"><ha-icon icon="mdi:stop"></ha-icon>${T.stop}</button><button data-s="cover.close_cover"><ha-icon icon="mdi:arrow-down"></ha-icon>${T.closeit}</button></div>`;
      if (a.current_position != null) body += rng('pos', T.pos, 0, 100, a.current_position);
    } else if (['select', 'input_select'].includes(dd)) body += sel('option', T.choose, a.options, st?.state);
    else { showInfo(it, false, false); return; }
    sh.innerHTML = `<b>${name}</b>${body}<button class="x2" data-close="1" title="${T.close}">×</button>`;
    sh.classList.remove('camsh'); sh.onclick = null;
    sh.classList.add('show');
    const call = (dom, svc, data = {}) => hass.callService(dom, svc, { entity_id: id, ...data });
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    sh.querySelectorAll('[data-rgb]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); call('light', 'turn_on', { rgb_color: hex(b.dataset.rgb) }); }));
    sh.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); const [dom, svc] = b.dataset.s.split('.'); call(dom, svc); }));
    sh.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); const d = climateTarget(hass.states[id], Math.sign(+b.dataset.t)); if (d) call('climate', 'set_temperature', d); }));
    sh.querySelectorAll('[data-m]').forEach((el) => el.addEventListener(el.tagName === 'BUTTON' ? 'click' : 'change', (ev) => {
      ev.stopPropagation();
      const v = el.value, k = el.dataset.m;
      if (k === 'toggle') call('homeassistant', 'toggle');
      else if (k === 'bri') call('light', 'turn_on', { brightness_pct: +v });
      else if (k === 'rgb') call('light', 'turn_on', { rgb_color: hex(v) });
      else if (k === 'ct') call('light', 'turn_on', { color_temp_kelvin: +v });
      else if (k === 'effect') call('light', 'turn_on', { effect: v });
      else if (k === 'hvac') call('climate', 'set_hvac_mode', { hvac_mode: v });
      else if (k === 'fanmode') call('climate', 'set_fan_mode', { fan_mode: v });
      else if (k === 'preset') call(dd, 'set_preset_mode', { preset_mode: v });
      else if (k === 'pct') call('fan', 'set_percentage', { percentage: +v });
      else if (k === 'vol') call('media_player', 'volume_set', { volume_level: +v / 100 });
      else if (k === 'source') call('media_player', 'select_source', { source: v });
      else if (k === 'sound') call('media_player', 'select_sound_mode', { sound_mode: v });
      else if (k === 'pos') call('cover', 'set_cover_position', { position: +v });
      else if (k === 'option') call(dd, 'select_option', { option: v });
      el.blur();
    }));
    sh.querySelector('[data-close]')?.addEventListener('click', (ev) => { ev.stopPropagation(); infoIt = null; sh.classList.remove('show'); });
  }
  function setEditing(on) {
    editing = on;
    root.querySelector('.wk').classList.toggle('editing', on);
    if (on) {
      const hEl = $('.hint'); if (hEl) hEl.style.opacity = '0';
      backup = JSON.stringify(plan); infoIt = null;
      if (touring) { pausedTour = route; setTouring(false); }
      route = [];
    } else { sel = null; stripDraft = null; menu = null; openMode = null; aimFor = null; drawDraft(); }
    for (const [id, show] of [['#edit', !on], ['#ecancel', on], ['#esave', on], ['#tour', !on]]) { const el = $(id); if (el) el.style.display = show ? '' : 'none'; }
    rebuildWorld(); buildItems(); showSheet();
  }
  $('#edit')?.addEventListener('click', () => setEditing(true));
  $('#ecancel')?.addEventListener('click', () => {
    if (backup) plan = JSON.parse(backup);
    dirtyEdit = false; warnedClose = false; sel = null;
    rebuildWorld(true); setEditing(false);
  });
  $('#esave')?.addEventListener('click', async () => {
    const bt = $('#esave');
    bt.disabled = true;
    try {
      const saved = await savePlan(hass, plan);
      if (saved && typeof saved === 'object') plan = JSON.parse(JSON.stringify(saved));
      dirtyEdit = false; warnedClose = false;
      setEditing(false); rebuildWorld(true); buildItems();
      showRoom(null, T.saved);
    } catch (e) { showRoom(null, T.save_err, String(e?.message || e)); } finally { bt.disabled = false; }
  });

  // how wide you see: a fixed width (like in games), so a narrow screen or a small card still feels roomy;
  // the height follows the screen shape. Ctrl + scroll wheel / pinching zooms (narrower = closer).
  // how wide you see: what you last zoomed to in this browser, else the setting (step 5), else 100°
  let hfov0 = +plan.settings?.walk_fov || 100;
  try { const sv = JSON.parse(localStorage.getItem('fps_walk_fov') || 'null'); if (sv && sv.s === hfov0 && sv.v >= 30 && sv.v <= 120) hfov0 = sv.v; } catch (e) { /* no storage: the setting */ }   // (a new setting wins)
  let hfov = (Math.max(30, Math.min(120, hfov0)) * Math.PI) / 180, fov = (70 * Math.PI) / 180, fovSave = 0;
  const fitFov = () => {
    const r = canvas.getBoundingClientRect(), asp = r.width && r.height ? r.width / r.height : 1.6;
    fov = Math.max((20 * Math.PI) / 180, Math.min((105 * Math.PI) / 180, 2 * Math.atan(Math.tan(hfov / 2) / asp)));
  };
  // Ctrl + scroll wheel (or pinching a touchpad / two fingers) zooms the room itself, not the page or the icons
  const setZoom = (k) => {
    hfov = Math.max((30 * Math.PI) / 180, Math.min((120 * Math.PI) / 180, hfov * k)); fitFov();
    clearTimeout(fovSave); fovSave = setTimeout(() => { try { localStorage.setItem('fps_walk_fov', JSON.stringify({ v: Math.round((hfov * 180) / Math.PI), s: +plan.settings?.walk_fov || 100 })); } catch (e) { /* fine */ } }, 600);
  };
  // Ctrl + scroll wheel anywhere in the walk (also over an icon, a button or the info window): zoom the 3D view, not the page
  // the scroll wheel zooms the 3D view in and out (with or without Ctrl), anywhere in the walk - never the page;
  // a list in the info window still scrolls as usual
  wrap.addEventListener('wheel', (ev) => {
    if (!(ev.ctrlKey || ev.metaKey) && ev.composedPath().some((n) => n.classList?.contains?.('sheet') && n.scrollHeight > n.clientHeight + 2)) return;   // only an info window that really scrolls
    ev.preventDefault(); ev.stopPropagation();
    setZoom(Math.exp(Math.max(-120, Math.min(120, ev.deltaY)) * 0.0015));
  }, { passive: false, capture: true });
  // two fingers on a phone or tablet: pinch to zoom
  const touches = new Map();
  let pinch0 = null;
  canvas.addEventListener('pointerdown', (ev) => { if (ev.pointerType === 'touch') { touches.set(ev.pointerId, [ev.clientX, ev.clientY]); if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), hfov }; drag = null; } } });
  canvas.addEventListener('pointermove', (ev) => {
    if (!touches.has(ev.pointerId)) return;
    touches.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (pinch0 && touches.size === 2) { const [a, b] = [...touches.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); hfov = pinch0.hfov; setZoom(pinch0.d / Math.max(20, d)); }
  });
  const touchEnd = (ev) => { touches.delete(ev.pointerId); if (touches.size < 2) pinch0 = null; };
  canvas.addEventListener('pointerup', touchEnd); canvas.addEventListener('pointercancel', touchEnd);
  const fwd = () => [Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch)];
  const eyeY = () => EYE + Math.sin(bob) * 0.018;

  function step(dt) {
    let moving = false;
    if (route.length) {
      const wpt = route[0];
      if (wpt.done) {
        route = []; tourDone = true; setTouring(false); showRoom(null, T.done);
        // on a TV / kiosk (walk: tour): the tour starts again by itself
        if (loop) setTimeout(() => { if (!closed && tourDone && !route.length) { tourDone = false; startTour(); setTouring(true); } }, 5000);
      }
      else if (wpt.lookT != null || (wpt.look && Math.hypot(wpt.x - cam.x, wpt.z - cam.z) < 0.08)) {
        // standing in a room: look left, look right, then on
        if (wpt.lookT == null) { wpt.lookT = 0; wpt.y0 = cam.yaw; wpt.y1 = wpt.lookYaw ?? cam.yaw; }
        wpt.lookT += dt;
        // first turn to where there is most to see, then look left and right
        const tt = wpt.lookT, e = (v) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, v)));
        const a = tt < 1.4 ? 0 : tt < 3.2 ? -e((tt - 1.4) / 1.8) * 0.85 : tt < 6 ? -0.85 + e((tt - 3.2) / 2.8) * 1.7 : 0.85 - e((tt - 6) / 1.6) * 0.85;
        cam.yaw = wpt.y0 + angDiff(wpt.y0, wpt.y1) * e(tt / 1.4) + a;
        cam.pitch += (-0.06 - cam.pitch) * Math.min(1, dt * 2);
        if (tt > 7.6) route.shift();
      } else {
        const dx = wpt.x - cam.x, dz = wpt.z - cam.z, d = Math.hypot(dx, dz);
        if (d < 0.08) route.shift();
        else {
          // look a little ahead along the path (round corners instead of staring at the wall next to a door)
          let lx = cam.x, lz = cam.z, left = 1.1;
          for (const q of route) {
            if (q.done || q.x == null) break;
            const sd = Math.hypot(q.x - lx, q.z - lz);
            if (sd >= left) { lx += ((q.x - lx) * left) / sd; lz += ((q.z - lz) * left) / sd; left = 0; break; }
            left -= sd; lx = q.x; lz = q.z;
            if (q.look) break;
          }
          const want = Math.hypot(lx - cam.x, lz - cam.z) > 0.05 ? Math.atan2(lx - cam.x, lz - cam.z) : Math.atan2(dx, dz), err = angDiff(cam.yaw, want);
          cam.yaw += Math.sign(err) * Math.min(Math.abs(err), dt * 2.2);
          cam.pitch += (-0.06 - cam.pitch) * Math.min(1, dt * 1.5);
          const sp = 1.15 * Math.max(0.12, Math.cos(Math.min(Math.abs(err), Math.PI / 2))) * Math.min(1, d / 0.35 + 0.3);
          const k = Math.min(d, sp * dt) / d;
          const ox = cam.x, oz = cam.z;
          cam.x += dx * k; cam.z += dz * k; moving = true;
          collide(wpt.stopAtWall ? R_PLAYER : 0.13);   // never into a wall, also on a route
          if (!roomOf(cam.x, cam.z) && roomOf(ox, oz)) { cam.x = ox; cam.z = oz; }   // nor out of the house
          // really stuck (pushed back by a wall, not just turning or slowing down for a corner): find a new way from here
          // to where this stretch goes; only if there is none, skip this point
          const moved = Math.hypot(cam.x - ox, cam.z - oz), meant = Math.hypot(dx * k, dz * k);
          if (meant > 1e-4 && moved < meant * 0.35) wpt.since = (wpt.since || 0) + dt; else wpt.since = 0;
          if (wpt.since > 0.7) {
            wpt.since = 0;
            let end = 0;
            while (end < route.length - 1 && !route[end].look && !route[end].done && route[end].lookT == null) end++;
            const goal = route[end], again = (wpt.replans = (wpt.replans || 0) + 1) <= 2;
            const path = again && goal && goal.x != null && nav ? nav.find(cam.x, cam.z, goal.x, goal.z) : null;
            if (path && path.length) { const pts = path.slice(0, -1).map((q) => ({ ...q, replans: wpt.replans })); route.splice(0, end, ...pts); }
            else route.shift();
          }
        }
      }
    }
    // keys / buttons
    const run = keys.has('shift') ? 2.6 : 1.5;
    let f = (keys.has('arrowup') || keys.has('w') ? 1 : 0) - (keys.has('arrowdown') || keys.has('s') ? 1 : 0) + hold, side = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
    const turn = (keys.has('arrowleft') || keys.has('q') ? 1 : 0) - (keys.has('arrowright') || keys.has('e') ? 1 : 0);
    cam.yaw += turn * dt * 1.8;
    if (f || side) {
      const sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw), l = Math.hypot(f, side);
      f /= l; side /= l;
      const ox = cam.x, oz = cam.z;
      cam.x += (sy * f - cy * side) * run * dt; cam.z += (cy * f + sy * side) * run * dt;
      collide(); moving = true;
      // not out of the house (an outer door, a gap in the plan): stay inside
      if (!roomOf(cam.x, cam.z) && roomOf(ox, oz)) { cam.x = ox; cam.z = oz; }
    }
    bob = moving ? bob + dt * 8.5 : bob * Math.max(0, 1 - dt * 6);
    // which room am I in
    const r = roomOf(cam.x, cam.z);
    if (r && r.id !== lastRoom) { lastRoom = r.id; showRoom(r); }
  }

  let roomT = 0;
  function showRoom(r, text, sub = '') {
    clearTimeout(roomT);
    if (r) {
      const s = r.area_id ? roomSummary(hass, r) : null, bits = [];
      if (s?.temp) bits.push(`${(+s.temp.state).toLocaleString(lang, { maximumFractionDigits: 1 })}°`);
      if (s?.hum) bits.push(`${Math.round(+s.hum.state)}%`);
      if (s?.lights.length) bits.push(T.lamps(s.lit.length));
      roomEl.querySelector('b').textContent = r.name || '';
      roomEl.querySelector('small').textContent = bits.join(' · ');
    } else { roomEl.querySelector('b').textContent = text || ''; roomEl.querySelector('small').textContent = sub; }
    roomEl.classList.add('show');
    roomT = setTimeout(() => roomEl.classList.remove('show'), 4500);
  }

  /* ---------------------------------------------------------------- map */
  let mapBox = { x: 0, y: 0, w: 1, h: 1 };
  function drawMap() {
    const rooms = plan.rooms || [];
    if (!rooms.length) return;
    const qs = rooms.flatMap((r) => r.rects.map(norm));
    const x0 = M(Math.min(...qs.map((q) => q[0]))) - 0.5, y0 = M(Math.min(...qs.map((q) => q[1]))) - 0.5, x1 = M(Math.max(...qs.map((q) => q[2]))) + 0.5, y1 = M(Math.max(...qs.map((q) => q[3]))) + 0.5;
    mapBox = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    const cw = innerWidth < 560 ? 120 : 180, ch = Math.round((cw * mapBox.h) / mapBox.w), dpr = Math.min(2, devicePixelRatio || 1);
    if (mapEl.width !== cw * dpr) { mapEl.width = cw * dpr; mapEl.height = ch * dpr; mapEl.style.width = `${cw}px`; mapEl.style.height = `${ch}px`; }
    const g = mapEl.getContext('2d'), k = (cw * dpr) / mapBox.w, X = (x) => (x - x0) * k, Y = (z) => (z - y0) * k;
    g.clearRect(0, 0, mapEl.width, mapEl.height);
    for (const r of rooms) {
      g.fillStyle = r.id === lastRoom ? 'rgba(255,190,110,.28)' : 'rgba(255,255,255,.08)';
      for (const q of r.rects.map(norm)) g.fillRect(X(M(q[0])), Y(M(q[1])), (M(q[2]) - M(q[0])) * k, (M(q[3]) - M(q[1])) * k);
    }
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.5 * dpr;
    for (const q of world.blockers) g.strokeRect(X(q[0]), Y(q[1]), (q[2] - q[0]) * k, (q[3] - q[1]) * k);
    g.strokeStyle = 'rgba(140,200,255,.9)';
    for (const q of world.seeThrough) g.strokeRect(X(q[0]), Y(q[1]), (q[2] - q[0]) * k, (q[3] - q[1]) * k);
    // where you are and where you look
    const px = X(cam.x), pz = Y(cam.z), a = Math.atan2(Math.cos(cam.yaw), Math.sin(cam.yaw));
    g.fillStyle = 'rgba(255,190,110,.35)'; g.beginPath(); g.moveTo(px, pz); g.arc(px, pz, 26 * dpr, a - 0.55, a + 0.55); g.closePath(); g.fill();
    g.fillStyle = '#ffbe6e'; g.beginPath(); g.arc(px, pz, 4 * dpr, 0, 2 * Math.PI); g.fill();
  }

  /* -------------------------------------------------------------- render */
  // the drawing size: sharp, but never more than ~2 million pixels, and smaller by itself when the computer can't keep up
  // (a slow graphics chip otherwise makes the whole browser hang)
  let rscale = 1, ftAvg = 16, ftT = 0, lastLit = 0, lastIds = [];
  const sizeCanvas = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight, cap = Math.min(2, devicePixelRatio || 1, Math.sqrt(2.1e6 / Math.max(1, w * h)));
    const k = Math.max(0.35, cap * rscale), W = Math.max(1, Math.round(w * k)), Hh = Math.max(1, Math.round(h * k));
    if (canvas.width !== W || canvas.height !== Hh) { canvas.width = W; canvas.height = Hh; }
  };
  const ro = new ResizeObserver(sizeCanvas);
  ro.observe(canvas);
  let last = performance.now(), mapT = 0;
  function frame(now) {
    if (closed) return;
    raf = requestAnimationFrame(frame);
    ftAvg += (Math.min(400, now - last) - ftAvg) * 0.1;
    if (now - ftT > 700) {
      ftT = now;
      const r0 = rscale;
      if (ftAvg > 42 && rscale > 0.4) rscale = Math.max(0.4, rscale * 0.8);
      else if (ftAvg < 22 && rscale < 1) rscale = Math.min(1, rscale * 1.1);
      if (rscale !== r0) sizeCanvas();
    }
    if (hoverXY && now - hoverT > 250) hoverCheck();   // you walk or turn: what is under the mouse changes
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (worldDirty) rebuildWorld();
    if (itemsDirty) { itemsDirty = false; buildItems(); }
    for (const r of curt.values()) { const dd = r.target - r.c; if (Math.abs(dd) > 0.002) { r.c += Math.sign(dd) * Math.min(Math.abs(dd), dt * 0.7); curtDirty = true; } }
    if (curtDirty) buildCurtains();
    step(dt);
    const w = canvas.width, h = canvas.height;
    gl.viewport(0, 0, w, h);
    const day = sunFactor(hass.states['sun.sun']);
    const sky = [0.03 + 0.59 * day, 0.05 + 0.71 * day, 0.1 + 0.82 * day];
    gl.clearColor(sky[0], sky[1], sky[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const eye = [cam.x, eyeY(), cam.z], f = fwd();
    fitFov();
    const VP = mul(perspective(fov, w / h, 0.1, 150), lookAt(eye, [eye[0] + f[0], eye[1] + f[1], eye[2] + f[2]], [0, 1, 0]));
    gl.uniformMatrix4fv(U.uVP, false, new Float32Array(VP));
    lastVP = VP;
    gl.uniform3fv(U.uEye, eye); gl.uniform3fv(U.uSky, sky);
    gl.uniform1f(U.uAmb, 0.24 + 0.36 * day); gl.uniform1f(U.uSun, 0.38 * day); gl.uniform3fv(U.uSunDir, nrm([0.45, 0.8, 0.35]));
    // the lamps that are on, nearest first
    // the lamps: on/off, brightness and colour glide (a quarter of a second) so changes from Home Assistant show smoothly;
    // the ones that light what you see most are used, with a margin so the choice doesn't flip back and forth
    const ease = Math.min(1, dt * 7);
    for (const l of lamps) {
      const tk = l.on ? l.k : 0;
      l.kv = l.kv == null ? tk : l.kv + (tk - l.kv) * ease;
      l.cv = l.cv ? l.cv.map((v, c) => v + (l.col[c] - v) * ease) : [...l.col];
      const d2 = (l.P[0] - cam.x) ** 2 + (l.P[2] - cam.z) ** 2;
      l.score = l.kv * (l.share ?? 1) * (l.dir ? 2.2 : 1) / (1 + 0.04 * d2) * (l.sel ? 1.3 : 1);
    }
    // the light coming in through openings follows its lamp
    for (const l of spills) {
      l.kv = l.parent.kv; l.cv = l.parent.cv;
      const d2 = (l.P[0] - cam.x) ** 2 + (l.P[2] - cam.z) ** 2;
      l.score = 0.5 * l.kv * l.share / (1 + 0.04 * d2) * (l.sel ? 1.3 : 1);
    }
    const all = spills.length ? lamps.concat(spills) : lamps;
    const chosen = all.filter((l) => l.kv > 0.004).sort((a, b) => b.score - a.score).slice(0, NL);
    for (const l of all) { l.sel = chosen.includes(l); l.sw = (l.sw ?? (l.sel ? 1 : 0)) + ((l.sel ? 1 : 0) - (l.sw ?? 0)) * ease; }
    const lit = all.filter((l) => l.sw > 0.01 && l.kv > 0.004).sort((a, b) => b.score - a.score).slice(0, NL);
    const LP = new Float32Array(NL * 4), LC = new Float32Array(NL * 3), LB = new Float32Array(NL * 4), LB2 = new Float32Array(NL * 4), LB3 = new Float32Array(NL * 4), LD = new Float32Array(NL * 4);
    lit.forEach((l, i) => { LP.set([l.P[0], l.P[1], l.P[2], 1.5 * l.kv * l.sw * (l.share ?? 1) * (l.dir ? 2.2 : 1)], i * 4); LC.set(l.cv, i * 3); LB.set(l.bb.slice(0, 4), i * 4); LB2.set(l.bb.length > 4 ? l.bb.slice(4, 8) : l.bb.slice(0, 4), i * 4); LB3.set(l.bb.length > 8 ? l.bb.slice(8, 12) : l.bb.slice(0, 4), i * 4); if (l.dir) LD.set([...l.dir, 0.86], i * 4); else if (l.down) LD.set([0, -1, 0, -1], i * 4); });
    lastLit = lit.length; lastIds = lit.map((l) => (l.parent ? '>' + l.parent.it.entity_id : l.it.entity_id) + ':' + (l.score || 0).toFixed(3));
    gl.uniform1i(U.uNL, lit.length); gl.uniform4fv(U.uLP, LP); gl.uniform3fv(U.uLC, LC); gl.uniform4fv(U.uLB, LB); gl.uniform4fv(U.uLB2, LB2); gl.uniform4fv(U.uLB3, LB3); gl.uniform4fv(U.uLD, LD);
    gl.uniform1f(U.uEmis, 0); gl.uniform1f(U.uAlpha, 1);
    gl.disable(gl.BLEND); gl.depthMask(true);
    if (buf.solid) { bind(buf.solid); gl.drawArrays(gl.TRIANGLES, 0, buf.solid.n); }
    if (buf.fixtures) { bind(buf.fixtures); gl.drawArrays(gl.TRIANGLES, 0, buf.fixtures.n); }
    if (buf.curtains) { bind(buf.curtains); gl.drawArrays(gl.TRIANGLES, 0, buf.curtains.n); }
    if (clocks.length) {
      const nowD = new Date();
      if (nowD.getSeconds() !== clockSec || !clockBuf) {
        clockSec = nowD.getSeconds();
        const m = new Mesh();
        for (const ck of clocks) {
          const st = hass.states[ck.it.entity_id], on = isOn(st), col = rgb(lightColor(st) || '255,120,60'), { hour, minute, second } = ringClockLeds(ck.n, nowD), fr = ck.fr, R = 0.15;
          for (let i = 0; i < ck.n; i++) {
            const a = (i / ck.n) * 2 * Math.PI, ox = Math.sin(a) * R, oy = Math.cos(a) * R, big = on && (i === hour || i === minute), sz = big ? 0.011 : 0.006;
            const c = !on ? [0.18, 0.18, 0.2] : i === hour || i === minute ? col : i === second ? [1, 1, 1] : col.map((v) => v * 0.18);
            const x = fr.cx + fr.ux * ox, z = fr.cz + fr.uz * ox, y = ck.h + oy;
            m.prism([[x - fr.ux * sz, z - fr.uz * sz], [x + fr.ux * sz, z + fr.uz * sz], [x + fr.ux * sz + fr.nx * 0.01, z + fr.uz * sz + fr.nz * 0.01], [x - fr.ux * sz + fr.nx * 0.01, z - fr.uz * sz + fr.nz * 0.01]], y - sz, y + sz, c);
          }
        }
        if (clockBuf) gl.deleteBuffer(clockBuf.b);
        clockBuf = m.v.length ? upload(m) : null;
      }
      if (clockBuf) { bind(clockBuf); gl.uniform1f(U.uEmis, 2); gl.drawArrays(gl.TRIANGLES, 0, clockBuf.n); gl.uniform1f(U.uEmis, 0); }
    }
    if (buf.markers) {
      bind(buf.markers); gl.uniform1f(U.uEmis, 1);
      for (const l of lamps) {
        if (!l.count) continue;
        const lv = l.pieces && l.on ? liveLeds.get(l.it.entity_id) : null;
        if (lv?.leds?.length) {
          // live WLED colours, piece by piece
          for (const pc of l.pieces) {
            let hx;
            if (pc.cell) { const [c0, r0, n0] = pc.cell, w0 = lv.w || n0, h0 = lv.h || n0; hx = lv.leds[Math.floor((r0 * h0) / n0) * w0 + Math.floor((c0 * w0) / n0)]; }
            else hx = lv.leds[Math.min(lv.leds.length - 1, Math.floor(pc.f * lv.leds.length))];
            const v = parseInt(hx || '000000', 16), col = [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
            gl.uniform3fv(U.uTint, col.map((c) => (pc.cell ? 0.1 : 0.04) + (pc.cell ? 0.9 : 0.96) * c)); gl.drawArrays(gl.TRIANGLES, pc.start, pc.count);   // a matrix shows its unlit LEDs as a faint grid
          }
          continue;
        }
        {
          // the lamp itself glows in its colour; switching on or off fades (kv glides to its brightness)
          const off = l.tv || l.media === 'hub' ? [0.03, 0.035, 0.045] : l.media ? [0.2, 0.2, 0.22] : l.ac ? [0.3, 0.32, 0.35] : [0.72, 0.72, 0.7];
          const onC = (l.tv ? (l.cv || l.col).map((v) => 0.2 + 0.6 * v) : (l.cv || l.col).map((v) => 0.55 + 0.45 * v)), f = Math.max(0, Math.min(1, (l.kv ?? (l.on ? 1 : 0)) / Math.max(0.15, l.k || 0.15)));
          gl.uniform3fv(U.uTint, l.on || f > 0.02 ? onC.map((v, c) => off[c] + (v - off[c]) * f) : off); gl.drawArrays(gl.TRIANGLES, l.start, l.count);
        } }
      gl.uniform1f(U.uEmis, 0);
    }
    if (draftBuf) { bind(draftBuf); gl.uniform1f(U.uEmis, 1); gl.uniform3fv(U.uTint, [1, 0.85, 0.45]); gl.drawArrays(gl.TRIANGLES, 0, draftBuf.n); gl.uniform1f(U.uEmis, 0); }
    if (buf.glass) {
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.uniform1f(U.uAlpha, 0.2); bind(buf.glass); gl.drawArrays(gl.TRIANGLES, 0, buf.glass.n);
      gl.depthMask(true); gl.disable(gl.BLEND);
    }
    // camera walls: each picture is laid exactly over its screen (perspective), only when you can see it;
    // pictures refresh one by one (every couple of seconds each), so many cameras don't flood Home Assistant
    if (camWalls.length) {
      const cw0 = canvas.clientWidth, ch0 = canvas.clientHeight, BW = 320, BH = 180;
      const prj = (p) => { const x = VP[0] * p[0] + VP[4] * p[1] + VP[8] * p[2] + VP[12], y = VP[1] * p[0] + VP[5] * p[1] + VP[9] * p[2] + VP[13], w = VP[3] * p[0] + VP[7] * p[1] + VP[11] * p[2] + VP[15]; return w > 0.05 ? [((x / w + 1) / 2) * cw0, ((1 - y / w) / 2) * ch0] : null; };
      let oldest = null;
      for (const wall of camWalls) {
        const dist = Math.hypot(wall.c[0] - cam.x, wall.c[2] - cam.z), seen = dist < 12 && !world.blockers.some((q) => segHitsBox(cam.x, cam.z, wall.c[0], wall.c[2], q));
        for (const sc of wall.screens) {
          const pts = seen ? sc.corners.map(prj) : null;
          if (!pts || pts.some((q) => !q)) { if (sc.el.style.display !== 'none') sc.el.style.display = 'none'; continue; }
          const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = pts;
          const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3, den = dx1 * dy2 - dx2 * dy1 || 1e-9;
          const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
          const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
          sc.el.style.display = '';
          sc.el.style.transform = `matrix3d(${a / BW},${d / BW},0,${g / BW},${b / BH},${e / BH},0,${hh / BH},0,0,1,0,${x0},${y0},0,1)`;
          sc.el.style.pointerEvents = editing ? 'none' : '';
          if (sc.holo) {
            // a hologram fan: a new picture when its image entity changes; bright while it plays, dimmed when off
            const ist = hass.states[sc.id], pic = ist?.attributes?.entity_picture;
            if (pic && ist.state !== sc.last) {
              sc.last = ist.state;
              const im = new Image(), url = `${pic}${pic.includes('?') ? '&' : '?'}_=${encodeURIComponent(ist.state)}`, tgt = sc;
              im.onload = () => { tgt.img.src = url; };
              im.src = url;
            }
            const on = isOn(hass.states[sc.holo]) || hass.states[deviceSibling(hass, sc.holo, 'switch', /playing/) || '']?.state === 'on';
            sc.el.classList.toggle('off', !on);
            continue;
          }
          if (!oldest || sc.t < oldest.t) oldest = sc;
        }
      }
      if (oldest && now - oldest.t > 2200 && now - (camWalls.lastLoad || 0) > 180) {
        // a small still from the light stream, loaded aside and only then shown: no flashing
        const pic = camPic(hass, oldest.id, 400), sc = oldest;
        if (pic) {
          const im = new Image(), url = `${pic}&_=${Date.now()}`;
          im.onload = () => { sc.img.src = url; };
          im.src = url;
        }
        oldest.t = now; camWalls.lastLoad = now;
      }
    }
    // the icons on top, where their device is (hidden behind walls)
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    for (const I of items) {
      if (I.hidden || ((I.hideWalk || I.modelled) && !editing && I !== hoverIt)) { if (I.el.style.display !== 'none') I.el.style.display = 'none'; continue; }
      const [x, y, z] = I.P, dist = Math.hypot(x - cam.x, z - cam.z, y - eye[1]);
      const cx = VP[0] * x + VP[4] * y + VP[8] * z + VP[12], cy = VP[1] * x + VP[5] * y + VP[9] * z + VP[13], cwv = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
      // the room you are in, plus anything close by in the next room (keeps it calm)
      // the one under the mouse always shows (its name too): the pointing already looked past the walls
      const hov = I === hoverIt;
      // icons stay in their room: the room you are in, and a room you look into through an open passage (not through walls or doors)
      const same = I.room === lastRoom, nextDoor = !same && openNext.get(lastRoom)?.has(I.room);
      let show = cwv > 0.1 && (hov || (same && dist < 12) || (nextDoor && dist < 8));
      // looking into the next room: only what you can really see (walls a little thicker, so nothing peeks round a corner)
      if (show && !hov && !same) show = !world.blockers.some((q) => segHitsBox(cam.x, cam.z, x, z, [q[0] - 0.08, q[1] - 0.08, q[2] + 0.08, q[3] + 0.08]));
      if (!show) { if (I.el.style.display !== 'none') I.el.style.display = 'none'; continue; }
      const sx = ((cx / cwv + 1) / 2) * cw, sy = ((1 - cy / cwv) / 2) * ch, sc = Math.max(0.5, Math.min(1.25, 2.2 / Math.max(dist, 0.5)));
      if (sx < -60 || sx > cw + 60 || sy < -60 || sy > ch + 60) { I.el.style.display = 'none'; continue; }
      I.el.style.display = '';
      I.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      I.el.style.zIndex = String(1000 - Math.round(dist * 50));
      I.el.classList.toggle('near', dist < 2.6);
      I.el.classList.toggle('hov', hov);
    }
    if (now - mapT > 80) { mapT = now; drawMap(); }
  }

  buildAll();
  if (tour || loop) startTour();
  else {
    // just looking: stand in the start room (step 5, else the biggest) with a view over it, and stay there
    const rooms = plan.rooms || [], want = plan.settings?.walk_start, r = rooms.find((x) => x.id === want) || rooms.slice().sort((a, b) => area(b) - area(a))[0];
    const sp = r ? nav?.spot(r) : null;
    if (sp) { cam.x = sp.x; cam.z = sp.z; cam.yaw = sp.look; }
    route = []; tourDone = true; setTouring(false);
  }
  showRoom(roomOf(cam.x, cam.z));
  lastRoom = roomOf(cam.x, cam.z)?.id || null;
  setTimeout(() => { const hEl = $('.hint'); if (hEl) hEl.style.opacity = '0'; }, 7000);
  raf = requestAnimationFrame(frame);

  return {
    /** The plan changed elsewhere (editor, assistant, another screen): show it, unless you are editing here. */
    setPlan(p) {
      if (closed || !p || dirtyEdit || editing) return;
      plan = JSON.parse(JSON.stringify(p));
      buildAll();
    },
    setHass(h) {
      if (closed) return;
      hass = h;
      if (sigOf(h) !== doorSig) { world = buildWorld(plan, hass); for (const k of ['solid', 'glass']) { if (buf[k]) gl.deleteBuffer(buf[k].b); buf[k] = world[k].v.length ? upload(world[k]) : null; } doorSig = sigOf(h); }
      refreshStates();
    },
    close,
    /** For tests: move the walk on by this many seconds at once. */
    _advance(sec) { for (let t = 0; t < sec; t += 0.05) step(0.05); },
    _state() { return { cam: { ...cam }, next: route.slice(0, 3), room: lastRoom, fov: Math.round((fov * 180) / Math.PI) }; },
    _walkTo(x, z) { walkTo(x, z); },
    _hits() { return items.filter((I) => I.hit).map((I) => ({ id: I.it.entity_id, hit: I.hit, shown: I.el.style.display !== 'none' })); },
    _pick(x, y) { const d = pickDevice(x, y), f = pickFurniture(x, y); return { dev: d?.it?.entity_id, furn: f?.f?.id, tv: f ? tvFurn.has(f.f.id) : null }; },
    _perf() { return { ids: lastIds, lit: lastLit, spills: spills.length, lamps: lamps.length, w: canvas.width, h: canvas.height, ft: Math.round(ftAvg), rscale }; },
    _edges() { return graph.edges.map((e) => [e.a, e.b, !!e.door, !!e.ghost]); },
    _hover() { return hoverIt ? { id: hoverIt.it.entity_id, hidden: !!hoverIt.hidden, disp: hoverIt.el.style.display, P: hoverIt.P } : null; },
    _setCam(x, z, yaw, pitch = -0.06) { route = []; setTouring(false); Object.assign(cam, { x, z, yaw, pitch }); },
  };
}
