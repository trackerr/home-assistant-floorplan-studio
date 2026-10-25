// Floorplan Studio – walk through your own home (first person, WebGL).
// Walls, doors and windows come from the plan; lamps that are on light up their room.
import {
  computeWalls, roomAt, norm, planScale, safeNumber, furnModel, furnHeight, FURN_HEIGHT, furnAt, itemHeight, isCeilingLamp, ceilingMount, lampStyle, deviceHeight, ownHeight,
  lightColor, isOn, friendly, roomSummary, sunFactor, esc, entityArea, stripPath, pathLength, pathMid, savePlan, curtainFor, curtainPanels, isSpot, FURN_TYPES, placeCandidates, isAircon, airconMode, tvLinks, ringClock, ringClockLeds, spotDir, mediaKind, MEDIA_ICON,
} from './fps-core.js?v=1.4.0b25';

const H = 2.6, DOOR_H = 2.1, SILL = 0.9, WIN_TOP = 2.15, EYE = 1.62, R_PLAYER = 0.22, MAX_LIGHTS = 16;
const FURN_NAME = {
  en: { sofa: 'Sofa', bed: 'Bed', table: 'Table', round: 'Round table', desk: 'Desk', counter: 'Kitchen counter', cabinet: 'Cupboard', bath: 'Bath', shower: 'Shower', toilet: 'Toilet', stairs: 'Stairs', tv: 'TV', plant: 'Plant', hob: 'Hob', sink: 'Sink', stove: 'Cooker', fridge: 'Fridge', island: 'Kitchen island', wallcab: 'Wall cupboard' },
  nl: { sofa: 'Bank', bed: 'Bed', table: 'Tafel', round: 'Ronde tafel', desk: 'Bureau', counter: 'Aanrecht', cabinet: 'Kast', bath: 'Bad', shower: 'Douche', toilet: 'Wc', stairs: 'Trap', tv: 'Tv', plant: 'Plant', hob: 'Kookplaat', sink: 'Gootsteen', stove: 'Fornuis', fridge: 'Koelkast', island: 'Kookeiland', wallcab: 'Bovenkast' },
};
const TXT = {
  en: { tour: 'Tour', pause: 'Pause', play: 'Continue', close: 'Close', hint: 'Drag to look around · click to stop · tap the floor to walk there · arrow keys or WASD to walk · Ctrl + scroll wheel to zoom', done: 'Tour done – feel free to look around', nogl: 'This browser cannot show 3D (WebGL).', lamps: (n) => `${n} ${n === 1 ? 'light' : 'lights'} on`, fwd: 'Walk', back: 'Back', edit: 'Edit', save: 'Save', cancel: 'Cancel', saved: 'Saved', height: 'Height', strip: 'Draw LED strip', strip_icon: 'Back to icon', strip_hint: 'Tap the wall or furniture point by point where the strip runs; it is placed at this height. Then Done', done: 'Done', rotate: 'Turn', remove: 'Remove', add_dev: 'Add a device', add_furn: 'Add furniture', add_open: 'Window / door', open_hint: 'Click on a wall where the window or door goes', remove_dev: 'Remove from the plan', none_left: 'Every device of this room is on the plan.', width: 'Width', depth: 'Depth', kind: 'Kind', window: 'Window', door: 'Door', passage: 'Opening', back2: 'Back', aim: 'Aim', aim_hint: 'Click where the spot should shine (wall, floor or furniture)', edit_hint: 'Drag a device sideways to slide it along the floor, or up/down to change its height (one direction per drag) · drag furniture over the floor · tap to pick one', unsaved: 'Not saved – close again to throw the changes away', save_err: 'Could not save', power: 'On/off', vol: 'Volume', target: 'Set to', now: 'now', open: 'Open', stop: 'Stop', closeit: 'Close', modes: { cool: 'cooling', heat: 'heating', dry: 'drying', fan: 'fan' } },
  nl: { tour: 'Rondleiding', pause: 'Pauze', play: 'Verder', close: 'Sluiten', hint: 'Slepen = rondkijken · klik = stoppen · tik op de vloer = daarheen lopen · pijltjes of WASD = lopen · Ctrl + scrollwiel = zoomen', done: 'Rondleiding klaar – kijk gerust verder rond', nogl: 'Deze browser kan geen 3D tonen (WebGL).', lamps: (n) => `${n} ${n === 1 ? 'lamp' : 'lampen'} aan`, fwd: 'Lopen', back: 'Terug', edit: 'Bewerken', save: 'Opslaan', cancel: 'Annuleren', saved: 'Opgeslagen', height: 'Hoogte', strip: 'Ledstrip tekenen', strip_icon: 'Terug naar icoon', strip_hint: 'Tik punt voor punt op de muur of het meubel waar de strip loopt; hij komt op deze hoogte. Dan Klaar', done: 'Klaar', rotate: 'Draaien', remove: 'Weghalen', add_dev: 'Apparaat toevoegen', add_furn: 'Meubel toevoegen', add_open: 'Raam / deur', open_hint: 'Klik op de muur waar het raam of de deur komt', remove_dev: 'Van de kaart halen', none_left: 'Alle apparaten van deze ruimte staan al op de kaart.', width: 'Breedte', depth: 'Diepte', kind: 'Soort', window: 'Raam', door: 'Deur', passage: 'Doorgang', back2: 'Terug', aim: 'Richten', aim_hint: 'Klik waar de spot op moet schijnen (muur, vloer of meubel)', edit_hint: 'Sleep een apparaat opzij om het over de vloer te schuiven, of omhoog/omlaag voor de hoogte (één richting per keer) · sleep meubels over de vloer · tik om er één te kiezen', unsaved: 'Niet opgeslagen – nog een keer sluiten gooit de wijzigingen weg', save_err: 'Opslaan lukte niet', power: 'Aan/uit', vol: 'Volume', target: 'Ingesteld', now: 'nu', open: 'Open', stop: 'Stop', closeit: 'Dicht', modes: { cool: 'koelt', heat: 'verwarmt', dry: 'droogt', fan: 'ventileert' } },
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
  soft: [0.46, 0.52, 0.6], dark: [0.16, 0.16, 0.18], pot: [0.62, 0.36, 0.26], plant: [0.26, 0.5, 0.27], woodF: [0.55, 0.4, 0.28], white: [0.94, 0.94, 0.93], metal: [0.84, 0.85, 0.87],
};
const FURN_COL = { table: 'woodF', round: 'woodF', desk: 'woodF', bed: 'woodF', cabinet: 'woodF', wallcab: 'white', counter: 'white', island: 'white', sink: 'white', hob: 'white', stove: 'metal', fridge: 'metal', bath: 'white', shower: 'white', toilet: 'white', stairs: 'woodF', tv: 'dark', sofa: 'soft', plant: 'plant' };

class Mesh {
  constructor() { this.v = []; }
  tri(a, b, c, n, col, m) { for (const p of [a, b, c]) this.v.push(p[0], p[1], p[2], n[0], n[1], n[2], col[0], col[1], col[2], m); }
  quad(a, b, c, d, col, m = 0) { const n = nrm(cross(sub(b, a), sub(d, a))); this.tri(a, b, c, n, col, m); this.tri(a, c, d, n, col, m); }
  /** An upright prism on a floor outline (x, z in metres) from y0 to y1. */
  prism(poly, y0, y1, col, m = 0, { top = true, bottom = true } = {}) {
    const n = poly.length;
    if (y1 > y0) for (let i = 0; i < n; i++) { const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % n]; this.quad([ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az], col, m); }
    if (top) for (let i = 1; i < n - 1; i++) this.tri([poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]], [0, 1, 0], col, m);
    if (bottom && y0 > 0.01) for (let i = 1; i < n - 1; i++) this.tri([poly[0][0], y0, poly[0][1]], [poly[i][0], y0, poly[i][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [0, -1, 0], col, m);
  }
  box(x0, z0, x1, z1, y0, y1, col, m = 0) { this.prism([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y0, y1, col, m); }
  floorRect(x0, z0, x1, z1, y, col, m) { this.quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], col, m); }
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
    for (const q of room.rects.map(norm)) {
      solid.floorRect(M(q[0]), M(q[1]), M(q[2]), M(q[3]), 0, col, mat);
      solid.floorRect(M(q[0]), M(q[1]), M(q[2]), M(q[3]), H, COL.ceil, 0);
    }
  }
  // the garden around the house
  const W = M(safeNumber(plan.width, 1000)), D = M(safeNumber(plan.height, 700));
  solid.floorRect(-60, -60, W + 60, D + 60, -0.02, COL.grass, 3);

  const openings = (plan.openings || []).map((o) => ({ ...o, x1: safeNumber(o.x1), y1: safeNumber(o.y1), x2: safeNumber(o.x2), y2: safeNumber(o.y2) }));
  const walls = computeWalls(rooms);
  for (const w of walls) {
    const hor = w.y1 === w.y2, at = hor ? w.y1 : w.x1, t = (w.kind === 'outer' ? 0.24 : 0.12) * S;
    const a0 = hor ? Math.min(w.x1, w.x2) : Math.min(w.y1, w.y2), a1 = hor ? Math.max(w.x1, w.x2) : Math.max(w.y1, w.y2);
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
    // a box along the wall, in metres
    const span = (lo, hi, y0, y1, col = COL.wall, grow = 0) => {
      const [x0, z0, x1, z1] = hor ? [lo, at - t / 2 - grow, hi, at + t / 2 + grow] : [at - t / 2 - grow, lo, at + t / 2 + grow, hi];
      solid.box(M(x0), M(z0), M(x1), M(z1), y0, y1, col);
      return [M(x0), M(z0), M(x1), M(z1)];
    };
    for (const pc of pieces) {
      // the ends of a wall reach half a wall further, so corners close
      const lo = pc.lo === a0 && pc.kind === 'solid' ? pc.lo - t / 2 : pc.lo, hi = pc.hi === a1 && pc.kind === 'solid' ? pc.hi + t / 2 : pc.hi;
      if (pc.kind === 'solid') { blockers.push(span(lo, hi, 0, H)); continue; }
      if (pc.kind === 'gap') continue;
      const f = 0.05 * S;   // frame width
      if (pc.kind === 'door') {
        span(lo, hi, DOOR_H, H);
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
        blockers.push(span(lo, hi, 0, SILL));
        span(lo, hi, WIN_TOP, H);
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
    const r = (safeNumber(f.rot) * Math.PI) / 180, cr = Math.cos(r), sr = Math.sin(r), fx = safeNumber(f.x), fy = safeNumber(f.y);
    const zs = fh / (FURN_HEIGHT[f.type] || fh);
    const support = ['hob', 'sink'].includes(f.type) ? (plan.furniture || []).find((g) => g !== f && ['counter', 'island', 'sink', 'stove'].includes(g.type) && furnAt({ furniture: [g] }, fx, fy)) : null;
    for (const pr of furnModel(f, 0, !!support)) {
      const poly = pr.poly.map(([x, y]) => [M(fx + x * cr - y * sr), M(fy + x * sr + y * cr)]);
      const y0 = pr.z0 * zs, y1 = Math.max(pr.z1 * zs, y0 + 0.004);
      if (pr.cls === 'glass') { glass.prism(poly, y0, y1, COL.glass); continue; }
      let col = COL[pr.cls === 'soft' ? 'soft' : pr.cls === 'dark' ? 'dark' : pr.cls === 'pot' ? 'pot' : pr.cls === 'plant' ? 'plant' : FURN_COL[f.type] || 'woodF'];
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
    if (A && B && A.id !== B.id) edges.push({ a: A.id, b: B.id, pa, pb });
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
    const pad = 0.12, cr = Math.cos(-r), sr = Math.sin(-r);
    const i0 = Math.max(0, Math.floor((Math.min(...pts.map((p) => p[0])) - pad - x0) / g)), i1 = Math.min(nx - 1, Math.floor((Math.max(...pts.map((p) => p[0])) + pad - x0) / g));
    const j0 = Math.max(0, Math.floor((Math.min(...pts.map((p) => p[1])) - pad - z0) / g)), j1 = Math.min(nz - 1, Math.floor((Math.max(...pts.map((p) => p[1])) + pad - z0) / g));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dx = cx(i) - fx / S, dz = cz(j) - fy / S, lx = dx * cr - dz * sr, lz = dx * sr + dz * cr;
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
      let best = -1, bs = -Infinity;
      for (let k = 0; k < N; k++) {
        if (room[k] !== ri || blocked[k]) continue;
        const i = k % nx, j = (k - i) / nx, sc = Math.min(clear[k], 7) - 0.12 * Math.hypot(cx(i) - mx, cz(j) - mz) / g;
        if (sc > bs) { bs = sc; best = k; }
      }
      const i = best >= 0 ? best % nx : 0, j = best >= 0 ? (best - i) / nx : 0, x = best >= 0 ? cx(i) : mx, z = best >= 0 ? cz(j) : mz;
      let look = 0, far = -1;
      for (let a = 0; a < 24; a++) {
        const ang = (a / 24) * 2 * Math.PI, dx = Math.sin(ang), dz = Math.cos(ang);
        let d = 0;
        for (; d < 12; d += g) { const [ii, jj] = cellOf(x + dx * d, z + dz * d); if (wall[jj * nx + ii] || tall[jj * nx + ii]) break; }
        if (d > far) { far = d; look = ang; }
      }
      return { x, z, look };
    },
  };
}

/* -------------------------------------------------------------- shaders */
const VS = `attribute vec3 aP; attribute vec3 aN; attribute vec3 aC; attribute float aM;
uniform mat4 uVP; varying vec3 vP; varying vec3 vN; varying vec3 vC; varying float vM;
void main(){ vP=aP; vN=aN; vC=aC; vM=aM; gl_Position=uVP*vec4(aP,1.0); }`;
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vP; varying vec3 vN; varying vec3 vC; varying float vM;
uniform vec3 uEye; uniform vec3 uSky; uniform float uAmb; uniform float uSun; uniform vec3 uSunDir;
uniform int uNL; uniform vec4 uLP[${MAX_LIGHTS}]; uniform vec3 uLC[${MAX_LIGHTS}]; uniform vec4 uLB[${MAX_LIGHTS}]; uniform vec4 uLD[${MAX_LIGHTS}];
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
  for (int i = 0; i < ${MAX_LIGHTS}; i++) {
    if (i >= uNL) break;
    vec3 L = uLP[i].xyz - vP; float d = length(L); vec3 l = L / max(d, 0.001);
    vec4 b = uLB[i]; float inside = step(b.x, vP.x) * step(vP.x, b.z) * step(b.y, vP.z) * step(vP.z, b.w);
    float cone = 1.0;
    if (uLD[i].w > 0.0) cone = smoothstep(uLD[i].w, uLD[i].w + 0.06, dot(-l, uLD[i].xyz));   // a spot: only inside its beam
    light += uLC[i] * (uLP[i].w / (1.0 + 0.8 * d * d)) * inside * cone * max(dot(N, l), 0.0);
  }
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
.icons { position: absolute; inset: 0; pointer-events: none; }
.wi { position: absolute; left: 0; top: 0; width: 0; height: 0; transform-origin: 0 0; will-change: transform; }
.wi .b { position: absolute; left: -22px; top: -22px; pointer-events: auto; cursor: pointer; width: 44px; height: 44px; box-sizing: border-box; border-radius: 50%; display: grid; place-items: center; background: rgba(20,24,32,.72); border: 1.5px solid rgba(255,255,255,.35); color: #e8edf3; backdrop-filter: blur(4px); box-shadow: 0 2px 10px rgba(0,0,0,.35); }
.wi.on .b { background: rgb(var(--c, 255, 190, 110)); color: #151a20; border-color: rgba(255,255,255,.9); box-shadow: 0 0 18px rgba(var(--c, 255, 190, 110), .85); }
.wi .b ha-icon, .wi .b ha-state-icon { --mdc-icon-size: 24px; }
.wi .b.txt { font-size: 12px; font-weight: 600; }
.wi .n { position: absolute; top: 26px; left: 0; transform: translateX(-50%); pointer-events: none; padding: 2px 8px; border-radius: 8px; background: rgba(0,0,0,.55); font-size: 12px; white-space: nowrap; opacity: 0; transition: opacity .2s; }
.wi.near .n, .wi:hover .n, .wi .b:hover + .n { opacity: 1; }
.top { position: absolute; left: 12px; right: 12px; top: 12px; display: flex; gap: 8px; align-items: center; pointer-events: none; }
.top > * { pointer-events: auto; }
button.x, .bar button { border: 0; border-radius: 22px; background: rgba(15,18,24,.72); color: #fff; height: 44px; min-width: 44px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; font: inherit; font-weight: 600; cursor: pointer; backdrop-filter: blur(6px); }
button.x { padding: 0; justify-content: center; }
button ha-icon { --mdc-icon-size: 22px; }
.bar button.active { background: rgba(255,180,90,.95); color: #1a1208; }
.room { margin-left: 4px; padding: 8px 14px; border-radius: 14px; background: rgba(15,18,24,.62); backdrop-filter: blur(6px); opacity: 0; transform: translateY(-6px); transition: opacity .35s, transform .35s; }
.room.show { opacity: 1; transform: none; }
.room b { font-size: 17px; letter-spacing: .02em; } .room small { display: block; opacity: .8; }
.map { position: absolute; right: 12px; top: 12px; border-radius: 12px; background: rgba(10,12,16,.62); backdrop-filter: blur(6px); cursor: pointer; }
.bar { position: absolute; left: 0; right: 0; bottom: 14px; display: flex; justify-content: center; gap: 8px; pointer-events: none; }
.bar > * { pointer-events: auto; }
.hint { position: absolute; left: 50%; bottom: 70px; transform: translateX(-50%); max-width: calc(100% - 32px); text-align: center; padding: 6px 12px; border-radius: 10px; background: rgba(0,0,0,.5); font-size: 13px; transition: opacity 1s; }
.sheet { position: absolute; left: 50%; bottom: 70px; transform: translateX(-50%); width: min(420px, calc(100% - 24px)); box-sizing: border-box; padding: 12px 14px; border-radius: 16px; background: rgba(15,18,24,.85); backdrop-filter: blur(8px); display: none; }
.sheet.show { display: block; }
.sheet b { display: block; font-size: 15px; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sheet .row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 6px; }
.sheet .row span { min-width: 64px; opacity: .85; }
.sheet button { border: 0; border-radius: 12px; background: rgba(255,255,255,.12); color: #fff; height: 36px; min-width: 36px; padding: 0 12px; font: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.sheet button.pri { background: rgba(255,180,90,.95); color: #1a1208; font-weight: 600; }
.sheet small { display: block; margin-top: 6px; opacity: .75; }
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
export function openWalk(host, { plan: original, hass, onClose, canEdit = false }) {
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
    closed = true; cancelAnimationFrame(raf); ro.disconnect();
    window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKeyUp, true);
    wrap.remove(); onClose?.();
  };
  $('#close').addEventListener('click', close);

  const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) { root.querySelector('.wk').insertAdjacentHTML('beforeend', `<div class="msg">${T.nogl}</div>`); return { setHass() {}, close }; }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('fps-walk', gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  const A = Object.fromEntries(['aP', 'aN', 'aC', 'aM'].map((n) => [n, gl.getAttribLocation(prog, n)]));
  const U = Object.fromEntries(['uVP', 'uEye', 'uSky', 'uAmb', 'uSun', 'uSunDir', 'uNL', 'uLP', 'uLC', 'uLB', 'uLD', 'uAlpha', 'uEmis', 'uTint'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  const upload = (mesh) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.v), gl.STATIC_DRAW); return { b, n: mesh.v.length / 10 }; };
  const bind = ({ b }) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    [['aP', 3, 0], ['aN', 3, 12], ['aC', 3, 24], ['aM', 1, 36]].forEach(([n, k, off]) => { gl.enableVertexAttribArray(A[n]); gl.vertexAttribPointer(A[n], k, gl.FLOAT, false, 40, off); });
  };

  let editing = false, sel = null, stripDraft = null, stripY = 1, aimFor = null, menu = null, openMode = null;
  let lastVP = null;
  let obstacles = [], clocks = [], tvFurn = new Map(), clockBuf = null, clockSec = -1;
  let world, graph, nav, buf = {}, lamps = [], items = [], doorSig = '';
  const S = planScale(plan) || 70, M = (v) => v / S;
  const sigOf = (h) => (plan.openings || []).filter((o) => o.entity).map((o) => `${o.entity}=${h?.states[o.entity]?.state}`).join('|');

  /** The room a device is in: where you put it on the plan; on a wall: its Home Assistant area, or the room most of its icon is in. */
  function itemRoom(it) {
    const here = roomAt(plan.rooms, safeNumber(it.x), safeNumber(it.y));
    if (here) return here;
    const area = entityArea(hass, it.entity_id);
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
    return best && best.d < 0.9 ? best : { d: 0, ux: 1, uz: 0, nx: 0, nz: 1, cx: x, cz: z, free: true };
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
    const tvl = tvLinks(plan, hass);
    const lampBox = (room) => { if (!room) return [-1e9, -1e9, 1e9, 1e9]; const qs = room.rects.map(norm); return [M(Math.min(...qs.map((q) => q[0]))) - 0.15, M(Math.min(...qs.map((q) => q[1]))) - 0.15, M(Math.max(...qs.map((q) => q[2]))) + 0.15, M(Math.max(...qs.map((q) => q[3]))) + 0.15]; };
    const markers = new Mesh(), fixtures = new Mesh();
    const circle = (cx, cz, r, k = 14) => Array.from({ length: k }, (_, i) => [cx + r * Math.cos((i / k) * 2 * Math.PI), cz + r * Math.sin((i / k) * 2 * Math.PI)]);
    const DARK = [0.2, 0.2, 0.22];
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
      if (lampKind) {
        let bb = [-1e9, -1e9, 1e9, 1e9];
        if (room) { const qs = room.rects.map(norm); bb = [M(Math.min(...qs.map((q) => q[0]))) - 0.15, M(Math.min(...qs.map((q) => q[1]))) - 0.15, M(Math.max(...qs.map((q) => q[2]))) + 0.15, M(Math.max(...qs.map((q) => q[3]))) + 0.15]; }
        const start = markers.v.length / 10;
        let lightY = h, lampPushed = false;
        if (lampType === 'strip') {
          // an LED strip: a thin glowing band along the drawn line, lighting the room at a few points along it
          // a strip drawn on a wall line runs just in front of that wall, inside its own room
          // (per point the nearest room: a strip along the wall of two rooms stays whole)
          const pts = strip.map(([sx, sy]) => nearestInside(M(sx), M(sy), 0.13)), tw = 0.014;
          for (let i = 1; i < pts.length; i++) {
            const [ax, az] = pts[i - 1], [bx, bz] = pts[i], L = Math.hypot(bx - ax, bz - az) || 1, nx = (-(bz - az) / L) * tw, nz = ((bx - ax) / L) * tw;
            markers.prism([[ax + nx, az + nz], [bx + nx, bz + nz], [bx - nx, bz - nz], [ax - nx, az - nz]], h - 0.012, h + 0.012, [1, 1, 1]);
          }
          const total = pathLength(pts), n = Math.max(1, Math.min(4, Math.round(total / 1.2)));
          for (let k = 1; k < n; k++) {
            let left = (total * k) / n, q = pts[0];
            for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d >= left) { q = [pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * left) / d, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * left) / d]; break; } left -= d; }
            lamps.push({ it, P: [q[0], h, q[1]], bb, start: 0, count: 0, share: 1 / Math.sqrt(n) });
          }
          const mid = pathMid(pts);
          lightY = h; P = [mid[0], h, mid[1]];
          px = mid[0]; pz = mid[1];
        } else if (lampType === 'spot') {
          // a spot: a small housing, its lens facing where it is aimed, and a beam of light that way
          const dir = spotDir(plan, it, h);
          fixtures.prism(circle(px, pz, 0.06, 10), h - 0.02, Math.min(H - 0.005, h + 0.1), [0.15, 0.15, 0.16]);
          const lx = px + dir[0] * 0.07, ly = h + dir[1] * 0.07, lz = pz + dir[2] * 0.07;
          markers.prism(circle(lx, lz, 0.045, 10), ly - 0.015, ly + 0.015, [1, 1, 1]);
          lightY = ly; P = [px, h, pz];
          lamps.push({ it, P: [lx, ly, lz], bb, start, count: markers.v.length / 10 - start, dir });
          lampPushed = true;
        } else if (lampType === 'ceiling') { markers.prism(circle(px, pz, 0.17), H - 0.07, H - 0.005, [1, 1, 1]); lightY = H - 0.25; P = [px, H - 0.12, pz]; }
        else if (lampType === 'pendant') {
          fixtures.box(px - 0.006, pz - 0.006, px + 0.006, pz + 0.006, h + 0.12, H, DARK);                 // cord
          markers.prism(circle(px, pz, 0.16), h - 0.04, h + 0.12, [1, 1, 1]); lightY = h - 0.1; P = [px, h, pz];
        } else if (lampType === 'floor') {
          fixtures.prism(circle(px, pz, 0.14, 12), 0, 0.025, DARK);                                                 // foot
          obstacles.push([px, pz, 0.2]);
          fixtures.box(px - 0.012, pz - 0.012, px + 0.012, pz + 0.012, 0.025, h - 0.05, DARK);                       // pole
          markers.prism(circle(px, pz, 0.19), h - 0.05, h + 0.2, [1, 1, 1]); lightY = h + 0.05; P = [px, h, pz];
        } else if (lampType === 'table') {
          const base = h - 0.3;
          fixtures.prism(circle(px, pz, 0.06, 10), base, base + 0.02, DARK);
          fixtures.box(px - 0.008, pz - 0.008, px + 0.008, pz + 0.008, base + 0.02, h - 0.06, DARK);
          markers.prism(circle(px, pz, 0.11), h - 0.06, h + 0.08, [1, 1, 1]); lightY = h; P = [px, h, pz];
        } else { markers.prism(circle(px, pz, 0.05, 10), h - 0.03, h + 0.03, [1, 1, 1]); P = [px, h, pz]; }
        P[1] = Math.min(P[1], H - 0.1);
        if (!lampPushed) lamps.push({ it, P: [px, lightY, pz], bb, start, count: markers.v.length / 10 - start, share: lampType === 'strip' ? 1 / Math.sqrt(Math.max(1, Math.min(4, Math.round(pathLength(strip.map(([sx, sy]) => [M(sx), M(sy)])) / 1.2)))) : 1 });
      }
      const tvf = tvl.get(it.entity_id);
      if (tvf) {
        // a TV on the TV furniture: its screen lights up (and lights the room a little) when it is on
        const r0 = (safeNumber(tvf.rot) * Math.PI) / 180, cr = Math.cos(r0), sr = Math.sin(r0), fw = safeNumber(tvf.w, 100) / 2, zs = furnHeight(tvf) / (FURN_HEIGHT.tv || 1.15);
        const pts = [[-fw, -3], [fw, -3], [fw, 3], [-fw, 3]].map(([u, v]) => [M(safeNumber(tvf.x) + u * cr - v * sr), M(safeNumber(tvf.y) + u * sr + v * cr)]);
        const start = markers.v.length / 10;
        markers.prism(pts, 0.47 * zs, 1.13 * zs, [1, 1, 1]);
        lamps.push({ it, tv: true, P: [M(safeNumber(tvf.x)), 0.8 * zs, M(safeNumber(tvf.y))], bb: lampBox(room), start, count: markers.v.length / 10 - start, share: 0.6 });
        tvFurn.set(tvf.id, it);
      }
      if (isAircon(it, st)) {
        // an air conditioner: a white unit on the wall; its air slot glows blue (cooling) or orange (heating)
        const fr = wallFrame(room, px, pz), cx = fr.cx + fr.nx * 0.24, cz = fr.cz + fr.nz * 0.24, hw = 0.42, hd = 0.11;
        const box = (a, b, y0, y1, d0, d1) => [[cx + fr.ux * a + fr.nx * d0, cz + fr.uz * a + fr.nz * d0], [cx + fr.ux * b + fr.nx * d0, cz + fr.uz * b + fr.nz * d0], [cx + fr.ux * b + fr.nx * d1, cz + fr.uz * b + fr.nz * d1], [cx + fr.ux * a + fr.nx * d1, cz + fr.uz * a + fr.nz * d1]];
        fixtures.prism(box(-hw, hw, h - 0.14, h + 0.14, -hd, hd), h - 0.14, h + 0.14, [0.95, 0.95, 0.94]);
        const start = markers.v.length / 10;
        markers.prism(box(-hw + 0.05, hw - 0.05, 0, 0, hd - 0.02, hd + 0.005), h - 0.12, h - 0.085, [1, 1, 1]);
        lamps.push({ it, ac: true, P: [cx + fr.nx * 0.3, h - 0.2, cz + fr.nz * 0.3], bb: lampBox(room), start, count: markers.v.length / 10 - start, share: 0.5 });
        P = [cx, h + 0.3, cz];
      }
      const mk = !tvf ? mediaKind(it, hass) : null;
      if (mk && !['tv', 'group'].includes(mk)) {
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
        P = [px, topY + 0.12, pz];
      }
      const ringN = ringClock(it, hass);
      if (ringN) { const fr = wallFrame(room, px, pz); clocks.push({ it, n: ringN, h, fr: { ...fr, cx: fr.cx + fr.nx * 0.14, cz: fr.cz + fr.nz * 0.14 } }); P = [fr.cx + fr.nx * 0.14, h - 0.28, fr.cz + fr.nz * 0.14]; }
      // the icon you can tap
      const el = document.createElement('div');
      el.className = 'wi';
      const isSensor = (d === 'sensor') && !it.icon_only;
      el.innerHTML = `<div class="b${isSensor ? ' txt' : ''}"></div><div class="n">${esc(it.name || friendly(hass, it.entity_id))}</div>`;
      const b = el.querySelector('.b');
      if (!isSensor) {
        const ic = it.icon || (mk && MEDIA_ICON[mk] && !st?.attributes?.icon ? MEDIA_ICON[mk] : ceil && !st?.attributes?.icon ? 'mdi:ceiling-light' : it.kind === 'lamp' && d !== 'light' ? 'mdi:lightbulb' : '');
        const icon = document.createElement(ic ? 'ha-icon' : 'ha-state-icon');
        if (ic) icon.icon = ic; else { icon.hass = hass; icon.stateObj = st; }
        b.appendChild(icon);
      }
      const rec = { it, el, P, d, isSensor, icon: b.firstChild, room: room?.id || null, h };
      el.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); if (editing) startItemDrag(ev, rec); });
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (editing) return;
        const dd = it.via ? 'switch' : d;
        if (['light', 'switch', 'fan', 'input_boolean'].includes(dd) && !ringClock(it, hass)) { hass.callService('homeassistant', 'toggle', { entity_id: it.via || it.entity_id }); return; }
        // anything else (TV, speaker, climate, curtain, sensor...): what it is doing, and its buttons
        showInfo(it);
      });
      iconsEl.appendChild(el);
      if (sel?.type === 'item' && sel.id === it.entity_id) el.classList.add('sel');
      if (tvf) rec.hidden = true;   // the TV furniture itself is the TV
      if (ringN) rec.hideWalk = true;   // the clock on the wall is the clock (its icon only shows while editing)
      items.push(rec);
    }
    for (const [k, m] of [['markers', markers], ['fixtures', fixtures]]) { if (buf[k]) gl.deleteBuffer(buf[k].b); buf[k] = m.v.length ? upload(m) : null; }
    refreshStates();
  }
  function buildAll() {
    world = buildWorld(plan, hass, sel?.type === 'furn' ? sel.id : null);
    graph = buildGraph(plan, S);
    for (const k of ['solid', 'glass']) { if (buf[k]) gl.deleteBuffer(buf[k].b); buf[k] = world[k].v.length ? upload(world[k]) : null; }
    doorSig = sigOf(hass);
    buildItems();
    nav = buildNav(plan, world, S, obstacles);
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
        const y0 = roller ? 2.15 - r.c * 1.25 : 0.03, y1 = roller ? 2.15 : 2.42;
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
    for (const L of lamps) {
      const st = hass.states[L.it.entity_id], on = lampOn(L.it);
      const fixed = L.it.color && /^#[0-9a-f]{6}$/i.test(L.it.color) ? [1, 3, 5].map((i) => parseInt(L.it.color.slice(i, i + 2), 16)).join(',') : null;
      const c = fixed || lightColor(st) || '255,196,128', br = st?.attributes?.brightness;
      L.on = on; L.col = rgb(c); L.k = on ? (br != null ? Math.max(0.15, br / 255) : 1) : 0;
      if (L.tv) { L.on = !!st && ['on', 'playing', 'paused', 'idle', 'buffering'].includes(st.state); L.col = [0.35, 0.55, 1]; L.k = L.on ? 0.7 : 0; }
      if (L.media) { L.on = !!st && ['playing', 'on', 'buffering'].includes(st.state) && (L.media !== 'hub' || st.state !== 'off'); L.col = L.media === 'hub' ? [0.55, 0.7, 1] : [0.9, 0.95, 1]; L.k = L.on ? (L.media === 'hub' ? 0.25 : 0.12) : 0; }
      if (L.ac) { const m = airconMode(st); L.on = !!m; L.col = m === 'cool' ? [0.4, 0.7, 1] : m === 'heat' ? [1, 0.55, 0.25] : [0.85, 0.9, 0.95]; L.k = L.on ? 0.35 : 0; }
    }
    if (infoIt) showInfo(infoIt, true);
    for (const I of items) {
      const st = hass.states[I.it.entity_id];
      const on = I.it.kind === 'lamp' || I.d === 'light' ? lampOn(I.it) : isOn(st);
      I.el.classList.toggle('on', on);
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
  function startTour() {
    const rooms = plan.rooms || [];
    if (!rooms.length) return;
    const ent = graph.entrance, start = ent?.room || rooms.slice().sort((a, b) => area(b) - area(a))[0].id;
    // visit every room: go deeper first, and walk back through the doors when needed
    const order = [], seen = new Set();
    const visit = (r) => { seen.add(r); order.push(r); for (const e of graph.edges) { const n = e.a === r ? e.b : e.b === r ? e.a : null; if (n && !seen.has(n)) visit(n); } };
    visit(start);
    for (const r of rooms) if (!seen.has(r.id)) visit(r.id);
    if (ent) { cam.x = ent.inside[0]; cam.z = ent.inside[1]; cam.yaw = Math.atan2(ent.inside[0] - ent.outside[0], ent.inside[1] - ent.outside[1]); }
    else { const sp = nav?.spot(rooms.find((r) => r.id === start)); if (sp) { cam.x = sp.x; cam.z = sp.z; cam.yaw = sp.look; } }
    route = [];
    let cur = start, px = cam.x, pz = cam.z;
    for (const id of order) {
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
    return clear ? [{ x: bx, z: bz }] : null;
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
        if (d < 1e-6) { cam.x += R; continue; }
        cam.x = px + (dx / d) * R; cam.z = pz + (dz / d) * R;
      }
    }
  }

  const keys = new Set();
  const onKey = (ev) => {
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
  canvas.addEventListener('pointerdown', (ev) => {
    canvas.setPointerCapture(ev.pointerId);
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY, t: Date.now(), moved: false };
    // editing: grab a piece of furniture under the pointer and slide it over the floor
    if (editing && !stripDraft && !aimFor) {
      const hit = pickFurniture(ev.clientX, ev.clientY);
      if (hit) {
        if (sel?.type !== 'furn' || sel.id !== hit.f.id) { sel = { type: 'furn', id: hit.f.id }; rebuildWorld(); buildItems(); showSheet(); }
        drag.furn = { f: hit.f, y: hit.y, ox: safeNumber(hit.f.x), oz: safeNumber(hit.f.y), start: planeHit(ev.clientX, ev.clientY, hit.y) };
      }
    }
  });
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
    if (infoIt) { infoIt = null; $('.sheet').classList.remove('show'); return; }
    // a tap on a wall clock: the clock's own buttons
    for (const ck of lastVP ? clocks : []) {
      const r0 = canvas.getBoundingClientRect(), x = ck.fr.cx, y = ck.h, z = ck.fr.cz;
      const cxp = lastVP[0] * x + lastVP[4] * y + lastVP[8] * z + lastVP[12], cyp = lastVP[1] * x + lastVP[5] * y + lastVP[9] * z + lastVP[13], cw = lastVP[3] * x + lastVP[7] * y + lastVP[11] * z + lastVP[15];
      if (cw <= 0.1) continue;
      const sx = ((cxp / cw + 1) / 2) * r0.width + r0.left, sy = ((1 - cyp / cw) / 2) * r0.height + r0.top, rad = Math.max(24, (0.18 / cw) * r0.height);
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < rad) { showInfo(ck.it); return; }
    }
    const hitF = pickFurniture(ev.clientX, ev.clientY);
    if (hitF && tvFurn.has(hitF.f.id)) { showInfo(tvFurn.get(hitF.f.id)); return; }   // the TV: what it plays, and its buttons
    // walking (the tour, or on the way somewhere): a click stops right here; standing still: a click walks there
    if (route.length) {
      if (touring) pausedTour = route;
      route = [];
      setTouring(false);
      return;
    }
    const r = canvas.getBoundingClientRect(), nx = ((ev.clientX - r.left) / r.width) * 2 - 1, ny = 1 - ((ev.clientY - r.top) / r.height) * 2;
    const f = fwd(), right = nrm(cross(f, [0, 1, 0])), up = cross(right, f), ty = Math.tan(fov / 2), tx = ty * (r.width / r.height);
    const dir = [f[0] + right[0] * nx * tx + up[0] * ny * ty, f[1] + right[1] * nx * tx + up[1] * ny * ty, f[2] + right[2] * nx * tx + up[2] * ny * ty];
    if (dir[1] > -0.02) return;
    const k = -eyeY() / dir[1], x = cam.x + dir[0] * k, z = cam.z + dir[2] * k;
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
    const f = fwd(), right = nrm(cross(f, [0, 1, 0])), rl = Math.hypot(right[0], right[2]) || 1, rx = right[0] / rl, rz = right[2] / rl;
    const b = rec.el.querySelector('.b');
    b.setPointerCapture(ev.pointerId);
    let axis = null, dh = 0;
    const move = (e) => {
      const dxp = e.clientX - sx0, dyp = e.clientY - sy0;
      if (!axis) { if (Math.hypot(dxp, dyp) < 7) return; axis = Math.abs(dxp) >= Math.abs(dyp) ? 'h' : 'v'; rec.el.dataset.axis = axis; }
      if (axis === 'h') {
        const m = dxp * mpp, dx = rx * m, dz = rz * m;
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
    if (!editing) { sh.classList.remove('show'); return; }
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
        html = `<b>${esc(it.name || friendly(hass, it.entity_id))}</b><div class="row"><span>${T.height}</span><button data-a="h-">−</button><span>${fmtM(h0)}</span><button data-a="h+">+</button><button data-a="idel"><ha-icon icon="mdi:delete-outline"></ha-icon>${T.remove_dev}</button></div>
          ${lampish && isSpot(it, hass.states[it.entity_id]) ? `<div class="row"><button data-a="aim" class="${aimFor === it ? 'pri' : ''}"><ha-icon icon="mdi:crosshairs-gps"></ha-icon>${T.aim}</button>${aimFor === it ? `<span>${T.aim_hint}</span>` : ''}</div>` : ''}
          ${lampish ? `<div class="row"><button data-a="strip"><ha-icon icon="mdi:vector-polyline"></ha-icon>${T.strip}</button>${it.shape === 'strip' ? `<button data-a="icon">${T.strip_icon}</button>${stripPath(it) ? `<span>${fmtM(pathLength(stripPath(it)) / S)}</span>` : ''}` : ''}</div>` : ''}`;
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
        <div class="row"><span>${T.height}</span><button data-a="fz-">−</button><span>${fmtM(furnHeight(f))}</span><button data-a="fz+">+</button><select data-sel="ftype">${Object.keys(FURN_TYPES).map((k) => `<option value="${k}" ${k === f.type ? 'selected' : ''}>${esc(FURN_NAME[lang][k] || k)}</option>`).join('')}</select></div>
        <div class="row"><span>${T.rotate}</span><button data-a="r-">⟲ 15°</button><button data-a="r+">⟳ 15°</button><button data-a="r90">90°</button></div><div class="row"><button data-a="del"><ha-icon icon="mdi:delete-outline"></ha-icon>${T.remove}</button></div>`;
    } else if (openMode) {
      html = `<b>${openMode === 'window' ? T.window : T.door}</b><small>${T.open_hint}</small><div class="row"><button data-a="ocancel">${T.cancel}</button></div>`;
    } else if (menu === 'dev') {
      // devices of the room you are in that are not on the plan yet
      const r = roomOf(cam.x, cam.z), placed = new Set(plan.items.map((i) => i.entity_id));
      const ids = r?.area_id ? placeCandidates(hass, r.area_id).filter((id) => !placed.has(id)) : [];
      html = `<b>${T.add_dev}${r ? ` – ${esc(r.name)}` : ''}</b>${ids.length ? `<div class="row">${ids.slice(0, 18).map((id) => `<button data-a="add:${esc(id)}">${esc(friendly(hass, id))}</button>`).join('')}</div>` : `<small>${T.none_left}</small>`}<div class="row"><button data-a="menu:">${T.back2}</button></div>`;
    } else if (menu === 'furn') {
      html = `<b>${T.add_furn}</b><div class="row">${Object.keys(FURN_TYPES).map((k) => `<button data-a="addf:${k}"><ha-icon icon="${FURN_TYPES[k].icon}"></ha-icon>${esc(FURN_NAME[lang][k] || k)}</button>`).join('')}</div><div class="row"><button data-a="menu:">${T.back2}</button></div>`;
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
    else if (a === 'aim') { aimFor = aimFor === it ? null : it; }
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
    } else if (f && /^f[wdz][-+]$/.test(a)) {
      const up = a.endsWith('+');
      if (a[1] === 'w') f.w = Math.max(0.1 * S, safeNumber(f.w) + (up ? 0.05 : -0.05) * S);
      if (a[1] === 'd') f.h = Math.max(0.06 * S, safeNumber(f.h) + (up ? 0.05 : -0.05) * S);
      if (a[1] === 'z') f.z = Math.round(Math.max(0.05, Math.min(H, furnHeight(f) + (up ? 0.05 : -0.05))) * 100) / 100;
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
  let infoIt = null;
  /** What a device is doing, with its buttons: TV/speaker, climate, curtain, or just its state. */
  function showInfo(it, refresh = false) {
    if (editing) return;
    const sh = $('.sheet'), st = hass.states[it.entity_id], d = it.entity_id.split('.')[0], a = st?.attributes || {};
    if (!refresh) infoIt = it;
    if (!sh || infoIt !== it) return;
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
    } else {
      const v = st ? `${st.state}${a.unit_of_measurement ? ` ${a.unit_of_measurement}` : ''}` : '–';
      body = `<small>${esc(v)}</small>${['light', 'switch', 'fan', 'input_boolean', 'lock'].includes(d) ? `<div class="row"><button data-s="homeassistant.toggle"><ha-icon icon="mdi:power"></ha-icon>${T.power}</button></div>` : ''}`;
    }
    sh.innerHTML = `<b>${name}</b>${body}<button class="x2" data-close="1" title="${T.close}">×</button>`;
    sh.classList.add('show');
    sh.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const [dom, svc] = b.dataset.s.split('.'), data = { entity_id: it.entity_id };
      if (b.dataset.mute) data.is_volume_muted = !a.is_volume_muted;
      hass.callService(dom, svc, data);
    }));
    sh.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); const t = +(hass.states[it.entity_id]?.attributes?.temperature ?? 20) + +b.dataset.t; hass.callService('climate', 'set_temperature', { entity_id: it.entity_id, temperature: t }); }));
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

  let fov = (70 * Math.PI) / 180;
  // Ctrl + scroll wheel (or pinching a touchpad / two fingers) zooms the room itself, not the page or the icons
  const setZoom = (k) => { fov = Math.max((25 * Math.PI) / 180, Math.min((95 * Math.PI) / 180, fov * k)); };
  canvas.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    if (ev.ctrlKey || ev.metaKey) { setZoom(Math.exp(ev.deltaY * 0.0012)); return; }
    // plain scroll wheel: a small step forward or back
    const st = Math.max(-0.6, Math.min(0.6, -ev.deltaY * 0.004));
    cam.x += Math.sin(cam.yaw) * st; cam.z += Math.cos(cam.yaw) * st; collide();
    if (touring) { pausedTour = route; route = []; setTouring(false); }
  }, { passive: false });
  // two fingers on a phone or tablet: pinch to zoom
  const touches = new Map();
  let pinch0 = null;
  canvas.addEventListener('pointerdown', (ev) => { if (ev.pointerType === 'touch') { touches.set(ev.pointerId, [ev.clientX, ev.clientY]); if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), fov }; drag = null; } } });
  canvas.addEventListener('pointermove', (ev) => {
    if (!touches.has(ev.pointerId)) return;
    touches.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (pinch0 && touches.size === 2) { const [a, b] = [...touches.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); fov = pinch0.fov; setZoom(pinch0.d / Math.max(20, d)); }
  });
  const touchEnd = (ev) => { touches.delete(ev.pointerId); if (touches.size < 2) pinch0 = null; };
  canvas.addEventListener('pointerup', touchEnd); canvas.addEventListener('pointercancel', touchEnd);
  const fwd = () => [Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch)];
  const eyeY = () => EYE + Math.sin(bob) * 0.018;

  function step(dt) {
    let moving = false;
    if (route.length) {
      const wpt = route[0];
      if (wpt.done) { route = []; tourDone = true; setTouring(false); showRoom(null, T.done); }
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
          cam.x += dx * k; cam.z += dz * k; moving = true;
          collide(wpt.stopAtWall ? R_PLAYER : 0.13);   // never into a wall, also on a route
          // stuck (a wall in the way): give up on this point
          const rest = Math.hypot(wpt.x - cam.x, wpt.z - cam.z);
          if (wpt.best == null || rest < wpt.best - 0.02) { wpt.best = rest; wpt.since = 0; } else if ((wpt.since += dt) > 1.2) route.shift();
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
      cam.x += (sy * f - cy * side) * run * dt; cam.z += (cy * f + sy * side) * run * dt;
      collide(); moving = true;
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
  const ro = new ResizeObserver(() => {
    const dpr = Math.min(2, devicePixelRatio || 1), w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
  });
  ro.observe(canvas);
  let last = performance.now(), mapT = 0;
  function frame(now) {
    if (closed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (worldDirty) rebuildWorld();
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
    const VP = mul(perspective(fov, w / h, 0.05, 200), lookAt(eye, [eye[0] + f[0], eye[1] + f[1], eye[2] + f[2]], [0, 1, 0]));
    gl.uniformMatrix4fv(U.uVP, false, new Float32Array(VP));
    lastVP = VP;
    gl.uniform3fv(U.uEye, eye); gl.uniform3fv(U.uSky, sky);
    gl.uniform1f(U.uAmb, 0.24 + 0.36 * day); gl.uniform1f(U.uSun, 0.38 * day); gl.uniform3fv(U.uSunDir, nrm([0.45, 0.8, 0.35]));
    // the lamps that are on, nearest first
    const lit = lamps.filter((l) => l.on).sort((a, b) => Math.hypot(a.P[0] - cam.x, a.P[2] - cam.z) - Math.hypot(b.P[0] - cam.x, b.P[2] - cam.z)).slice(0, MAX_LIGHTS);
    const LP = new Float32Array(MAX_LIGHTS * 4), LC = new Float32Array(MAX_LIGHTS * 3), LB = new Float32Array(MAX_LIGHTS * 4), LD = new Float32Array(MAX_LIGHTS * 4);
    lit.forEach((l, i) => { LP.set([l.P[0], l.P[1], l.P[2], 1.5 * l.k * (l.share ?? 1) * (l.dir ? 2.2 : 1)], i * 4); LC.set(l.col, i * 3); LB.set(l.bb, i * 4); if (l.dir) LD.set([...l.dir, 0.86], i * 4); });
    gl.uniform1i(U.uNL, lit.length); gl.uniform4fv(U.uLP, LP); gl.uniform3fv(U.uLC, LC); gl.uniform4fv(U.uLB, LB); gl.uniform4fv(U.uLD, LD);
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
      for (const l of lamps) { if (!l.count) continue; gl.uniform3fv(U.uTint, l.on ? (l.tv ? l.col.map((v) => 0.2 + 0.6 * v) : l.col.map((v) => 0.55 + 0.45 * v)) : l.tv || l.media === 'hub' ? [0.03, 0.035, 0.045] : l.media ? [0.2, 0.2, 0.22] : l.ac ? [0.3, 0.32, 0.35] : [0.72, 0.72, 0.7]); gl.drawArrays(gl.TRIANGLES, l.start, l.count); }
      gl.uniform1f(U.uEmis, 0);
    }
    if (draftBuf) { bind(draftBuf); gl.uniform1f(U.uEmis, 1); gl.uniform3fv(U.uTint, [1, 0.85, 0.45]); gl.drawArrays(gl.TRIANGLES, 0, draftBuf.n); gl.uniform1f(U.uEmis, 0); }
    if (buf.glass) {
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.uniform1f(U.uAlpha, 0.2); bind(buf.glass); gl.drawArrays(gl.TRIANGLES, 0, buf.glass.n);
      gl.depthMask(true); gl.disable(gl.BLEND);
    }
    // the icons on top, where their device is (hidden behind walls)
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    for (const I of items) {
      if (I.hidden || (I.hideWalk && !editing)) { if (I.el.style.display !== 'none') I.el.style.display = 'none'; continue; }
      const [x, y, z] = I.P, dist = Math.hypot(x - cam.x, z - cam.z, y - eye[1]);
      const cx = VP[0] * x + VP[4] * y + VP[8] * z + VP[12], cy = VP[1] * x + VP[5] * y + VP[9] * z + VP[13], cwv = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
      // the room you are in, plus anything close by in the next room (keeps it calm)
      let show = cwv > 0.1 && (dist < (editing ? 7 : 3.5) || (dist < 10 && I.room === lastRoom));
      // hidden behind a wall (the wall it hangs on itself doesn't count)
      if (show) show = !world.blockers.some((q) => segHitsBox(cam.x, cam.z, x, z, q));
      if (!show) { if (I.el.style.display !== 'none') I.el.style.display = 'none'; continue; }
      const sx = ((cx / cwv + 1) / 2) * cw, sy = ((1 - cy / cwv) / 2) * ch, sc = Math.max(0.5, Math.min(1.25, 2.2 / Math.max(dist, 0.5)));
      if (sx < -60 || sx > cw + 60 || sy < -60 || sy > ch + 60) { I.el.style.display = 'none'; continue; }
      I.el.style.display = '';
      I.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      I.el.style.zIndex = String(1000 - Math.round(dist * 50));
      I.el.classList.toggle('near', dist < 2.6);
    }
    if (now - mapT > 80) { mapT = now; drawMap(); }
  }

  buildAll();
  startTour();
  showRoom(roomOf(cam.x, cam.z));
  lastRoom = roomOf(cam.x, cam.z)?.id || null;
  setTimeout(() => { const hEl = $('.hint'); if (hEl) hEl.style.opacity = '0'; }, 7000);
  raf = requestAnimationFrame(frame);

  return {
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
    _setCam(x, z, yaw, pitch = -0.06) { route = []; setTouring(false); Object.assign(cam, { x, z, yaw, pitch }); },
  };
}
