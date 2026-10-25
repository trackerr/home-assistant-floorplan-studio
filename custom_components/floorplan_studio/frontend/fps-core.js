// Floorplan Studio – shared helpers for the card and the editor panel.

export const VERSION = '1.4.0b10';

/* ------------------------------------------------------------------ i18n */
const STR = {
  en: {
    simple: 'Simple', all: 'All', move: 'Move icons', done: 'Done', back: 'Back', overview: 'Overview', zoom_reset: 'Whole plan', by_room: 'Room by room', whole_plan: 'Whole plan', rooms: 'Rooms', energy_now: 'Energy now', right_now: 'Right now', outside: 'outside', n_on: '{n} on', h_solar: 'Solar now', h_grid: 'From the grid', h_return: 'To the grid', h_price: 'Electricity price',
    lights_on: '{n} / {t} lights on', no_plan: 'No floorplan yet. Open “Floorplan” in the sidebar to draw your home.',
    loading: 'Loading floorplan…', unplaced: 'Also in this room', saved: 'Saved', learning: 'Simple mode is still learning ({d} days of data) – showing everything.',
    on: 'on', off: 'off', open: 'open', closed: 'closed', hum: 'humidity {v}%', theme: 'Theme', kiosk_tap: 'Tap to go full screen', in_room: 'In this room',
    present: 'Someone is here', temp_colors: 'Colour rooms by temperature', clean_room: 'Vacuum this room', cleaning_sent: 'Vacuum is on its way',
    clean_failed: 'The vacuum could not start: {e}', live_map: 'Live vacuum map',
    a_smoke: 'Smoke', a_gas: 'Gas', a_carbon_monoxide: 'Carbon monoxide', a_moisture: 'Water leak', a_heat: 'Heat', a_safety: 'Unsafe',
    e_solar: 'Solar', e_grid: 'Grid', e_price: 'Price',
    zoom_hint: 'Ctrl + scroll wheel to zoom', zoom_hint_mac: '⌘ + scroll to zoom', rotate: 'Turn', walk: 'Walk through your home', panel_min: 'Make small', panel_open: 'Show the room panel', lbl_move: 'Move', lbl_bigger: 'Bigger', lbl_smaller: 'Smaller', lbl_auto: 'Automatic place and size', lbl_hide: 'Hide', lbl_show: 'Show',
    a_door: 'Door open', a_window: 'Window open', a_garage_door: 'Garage door open', a_opening: 'Open',
  },
  nl: {
    simple: 'Eenvoudig', all: 'Alles', move: 'Iconen verplaatsen', done: 'Klaar', back: 'Terug', overview: 'Overzicht', zoom_reset: 'Hele plattegrond', by_room: 'Per ruimte', whole_plan: 'Hele plattegrond', rooms: 'Kamers', energy_now: 'Energie nu', right_now: 'Nu logisch', outside: 'buiten', n_on: '{n} aan', h_solar: 'Zon nu', h_grid: 'Van het net', h_return: 'Naar het net', h_price: 'Stroomprijs',
    lights_on: '{n} / {t} lampen aan', no_plan: 'Nog geen plattegrond. Open “Floorplan” in de zijbalk om je huis te tekenen.',
    loading: 'Plattegrond laden…', unplaced: 'Ook in deze ruimte', saved: 'Opgeslagen', learning: 'Eenvoudig leert nog ({d} dagen data) – alles wordt getoond.',
    on: 'aan', off: 'uit', open: 'open', closed: 'dicht', hum: 'vocht {v}%', theme: 'Thema', kiosk_tap: 'Tik voor volledig scherm', in_room: 'In deze ruimte',
    present: 'Er is iemand', temp_colors: 'Ruimtes kleuren op temperatuur', clean_room: 'Deze ruimte zuigen', cleaning_sent: 'De stofzuiger komt eraan',
    clean_failed: 'De stofzuiger kon niet starten: {e}', live_map: 'Live stofzuigerkaart',
    a_smoke: 'Rook', a_gas: 'Gas', a_carbon_monoxide: 'Koolmonoxide', a_moisture: 'Lekkage', a_heat: 'Hitte', a_safety: 'Onveilig',
    e_solar: 'Zon', e_grid: 'Net', e_price: 'Prijs',
    zoom_hint: 'Ctrl + scrollwiel om te zoomen', zoom_hint_mac: '⌘ + scrollen om te zoomen', rotate: 'Draaien', walk: 'Door je huis lopen', panel_min: 'Kleiner maken', panel_open: 'Paneel weer openen', lbl_move: 'Verplaatsen', lbl_bigger: 'Groter', lbl_smaller: 'Kleiner', lbl_auto: 'Automatische plek en grootte', lbl_hide: 'Verbergen', lbl_show: 'Tonen',
    a_door: 'Deur open', a_window: 'Raam open', a_garage_door: 'Garagedeur open', a_opening: 'Open',
  },
};
export function t(hass, key, vars = {}) {
  const lang = (hass && (hass.locale?.language || hass.language) || 'en').slice(0, 2);
  let s = (STR[lang] || STR.en)[key] || STR.en[key] || key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

/* ---------------------------------------------------------------- themes */
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=VT323&family=Oswald:wght@400;500;600;700&display=swap';
// T(bg, floor, wall, wallInner, accent, accentRgb, fg, muted, device, deviceRgb, chip, line, off, door, lampBorder, ring, tag, font, wallGlow)
const T = (label, v, extra = {}) => ({ label, vars: {
  '--fps-bg': v[0], '--fps-floor': v[1], '--fps-wall': v[2], '--fps-wall-inner': v[3], '--fps-accent': v[4], '--fps-accent-rgb': v[5],
  '--fps-fg': v[6], '--fps-muted': v[7], '--fps-device': v[8], '--fps-device-rgb': v[9], '--fps-chip': v[10], '--fps-line': v[11],
  '--fps-off': v[12], '--fps-door': v[13], '--fps-lamp-border': v[14], '--fps-ring': v[15], '--fps-tag': v[16],
  '--fps-font': v[17] || 'inherit', '--fps-wall-glow': v[18] || 'none' }, ...extra });

export const THEMES = {
  warm: T('Warm', ['#0d1116', '#151b24', '#9aa7b8', '#9aa7b8', '#f2a541', '242,165,65', '#eef0f3', '#8a94a3', '#7fb0d6', '127,176,214',
    'rgba(255,255,255,.06)', 'rgba(255,255,255,.10)', 'rgba(20,26,34,.95)', '#c6ccd5', 'rgba(255,255,255,.22)', 'rgba(255,255,255,.9)', 'rgba(12,15,20,.9)']),
  hightech: T('High-tech', ['#03060b', '#06101a', '#22e6ff', 'rgba(34,230,255,.6)', '#22e6ff', '34,230,255', '#dcfaff', '#4f8aa0', '#3a8dff', '58,141,255',
    'rgba(34,230,255,.06)', 'rgba(34,230,255,.28)', 'rgba(3,10,18,.95)', '#ff3bd4', 'rgba(34,230,255,.45)', '#22e6ff', 'rgba(2,8,14,.92)',
    '"Rajdhani", "Segoe UI", sans-serif', 'drop-shadow(0 0 3px #22e6ff)'], { font: true }),
  sun: T('Automatic (sun)', ['#ddd6ca', 'rgba(255,255,255,.35)', '#5f6773', '#5f6773', '#d9821f', '217,130,31', '#1d232b', '#6b7380', '#2f6fb0', '47,111,176',
    'rgba(0,0,0,.05)', 'rgba(0,0,0,.12)', '#ffffff', '#c27a2c', 'rgba(29,35,43,.45)', '#1d232b', 'rgba(255,255,255,.97)'], { daylight: true }),
  blueprint: T('Blueprint', ['#0b3a6e', '#0e4680', '#eaf3ff', 'rgba(234,243,255,.7)', '#ffd166', '255,209,102', '#f1f7ff', '#9dbbe0', '#7fd1ff', '127,209,255',
    'rgba(255,255,255,.06)', 'rgba(234,243,255,.28)', 'rgba(11,58,110,.96)', '#ffd166', 'rgba(234,243,255,.7)', '#ffffff', 'rgba(9,48,92,.95)',
    '"Share Tech Mono", Consolas, monospace'], { font: true }),
  glass: T('Glass', ['#120f2e', 'rgba(255,255,255,.06)', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.3)', '#ffb86b', '255,184,107', '#ffffff', '#b9bde6', '#9ad1ff', '154,209,255',
    'rgba(255,255,255,.08)', 'rgba(255,255,255,.18)', 'rgba(30,24,70,.72)', '#ffb86b', 'rgba(255,255,255,.5)', '#ffffff', 'rgba(30,24,70,.82)']),
  terminal: T('Terminal', ['#010801', '#021202', '#33ff66', 'rgba(51,255,102,.6)', '#33ff66', '51,255,102', '#b8ffc8', '#2f8a46', '#ffcc33', '255,204,51',
    'rgba(51,255,102,.05)', 'rgba(51,255,102,.25)', 'rgba(1,12,2,.96)', '#ffcc33', 'rgba(51,255,102,.6)', '#33ff66', 'rgba(1,12,2,.95)',
    '"VT323", "Share Tech Mono", monospace', 'drop-shadow(0 0 3px #33ff66)'], { font: true }),
  rock: T('Rock', ['#070606', '#151212', '#d9d9d9', 'rgba(217,217,217,.7)', '#e10600', '225,6,0', '#f4f4f4', '#8c8c8c', '#c9c9c9', '201,201,201',
    'rgba(255,255,255,.05)', 'rgba(225,6,0,.35)', 'rgba(20,16,16,.96)', '#e10600', 'rgba(220,220,220,.55)', '#e10600', 'rgba(10,8,8,.95)',
    '"Oswald", "Bebas Neue", Impact, sans-serif'], { font: true }),
  ha: T('Home Assistant', ['var(--primary-background-color, #111)', 'var(--card-background-color, #1c1c1c)', 'var(--secondary-text-color, #999)', 'var(--divider-color, #555)',
    'var(--state-light-active-color, var(--amber-color, #ffc107))', '255,193,7', 'var(--primary-text-color, #fff)', 'var(--secondary-text-color, #999)',
    'var(--primary-color, #03a9f4)', '3,169,244', 'var(--secondary-background-color, rgba(127,127,127,.12))', 'var(--divider-color, rgba(127,127,127,.2))',
    'var(--card-background-color, #1c1c1c)', 'var(--secondary-text-color, #999)', 'var(--divider-color, rgba(127,127,127,.4))', 'var(--primary-text-color, #fff)', 'rgba(0,0,0,.75)']),
};

/** Which theme is really shown for a configured name (resolves "auto"). */
export function resolveTheme(name) {
  if (name === 'auto' || name === 'daylight' || name === 'night') return 'sun';   // older names
  return THEMES[name] ? name : 'warm';
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
/**
 * 0 = night, 1 = full daylight, from today's sunrise and sunset (sun.sun):
 * it starts getting light 45 min before sunrise and is full day 75 min after; the reverse around sunset.
 */
export function sunFactor(sun, now = Date.now(), before = 45, ramp = 120) {
  if (!sun) return 1;
  const H = 3600e3, D = 24 * H;
  let rise = Date.parse(sun.attributes.next_rising), set = Date.parse(sun.attributes.next_setting);
  if (isNaN(rise) || isNaN(set)) return sun.state === 'above_horizon' ? 1 : 0;
  const today = new Date(now).toDateString();
  if (new Date(rise).toDateString() !== today) rise -= D;
  if (new Date(set).toDateString() !== today) set -= D;
  const b = (before / 60) * H, r = Math.max(10, ramp) / 60 * H;
  const up = (now - (rise - b)) / r;
  const down = (set + b - now) / r;
  return Math.max(0, Math.min(1, up, down));
}

/** Daylight theme: background follows the sun (black at night, warm dusk, muted daylight). */
export function daylightVars(hass, s = DEFAULT_SETTINGS) {
  let t = sunFactor(hass?.states['sun.sun'], Date.now(), s.sun_before, s.sun_ramp);
  t = t * t * (3 - 2 * t);
  const NIGHT = [6, 8, 11], DUSK = [70, 44, 34], DAY = [235, 230, 221];
  const c = t < 0.45 ? mix(NIGHT, DUSK, t / 0.45) : mix(DUSK, DAY, (t - 0.45) / 0.55);
  // keep text readable at every step: pick light or dark text by WCAG contrast and derive the greys from it
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (a) => 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]);
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const LIGHT_TEXT = [238, 240, 243], DARK_TEXT = [22, 27, 34];
  const dark = contrast(c, DARK_TEXT) >= contrast(c, LIGHT_TEXT);
  const fg = dark ? DARK_TEXT : LIGHT_TEXT;
  const base = dark ? THEMES.sun.vars : { ...THEMES.warm.vars, '--fps-floor': 'rgba(255,255,255,.06)', '--fps-wall': '#7d8794', '--fps-wall-inner': '#6b7480' };
  const rgb = (a) => `rgb(${a.join(',')})`;
  return { key: Math.round(t * 60), vars: { ...base, '--fps-bg': rgb(c), '--fps-fg': rgb(fg), '--fps-muted': rgb(mix(fg, c, 0.38)) } };
}

/** Theme chosen by a helper (input_select) so every screen in the house shows the same theme. */
// other names a helper may use for a theme (Dutch labels, short forms)
const THEME_ALIASES = { sun: ['automatisch (zon)', 'automatisch', 'zon', 'auto', 'sun', 'licht', 'light'], glass: ['glas'], hightech: ['high tech', 'hightech'], ha: ['home assistant'] };
/** Theme key for a helper option such as "Glas" or "Automatisch (zon)". */
export function themeKey(option) {
  const v = String(option ?? '').trim().toLowerCase();
  return Object.keys(THEMES).find((k) => k === v || THEMES[k].label.toLowerCase() === v || (THEME_ALIASES[k] || []).includes(v)) || null;
}
export function themeFromEntity(hass, s = DEFAULT_SETTINGS) {
  const st = s.theme_entity && hass?.states[s.theme_entity];
  return st ? themeKey(st.state) : null;
}

export function themeStyle(name, hass, s = DEFAULT_SETTINGS) {
  const real = resolveTheme(name, hass);
  const th = THEMES[real];
  if (th.font && !document.querySelector('link[data-fps-font]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_URL; l.dataset.fpsFont = '1';
    document.head.appendChild(l);
  }
  const vars = { ...(th.daylight ? daylightVars(hass, s).vars : th.vars),
    '--fps-icon-scale': (s.icon_size || 100) / 100, '--fps-lamp-scale': (s.lamp_size || 100) / 100, '--fps-dev-scale': (s.device_size || 100) / 100, '--fps-glow': (s.glow ?? 100) / 100, '--fps-turn-op': s.turn_ghost === false ? 1 : Math.max(0, Math.min(100, safeNumber(s.turn_ghost_pct, 10))) / 100 };
  return Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');
}

/* -------------------------------------------------------------- geometry */
export const norm = (q) => [Math.min(q[0], q[2]), Math.min(q[1], q[3]), Math.max(q[0], q[2]), Math.max(q[1], q[3])];

export function roomBBox(room) {
  const r = room.rects.map(norm);
  return [Math.min(...r.map((q) => q[0])), Math.min(...r.map((q) => q[1])), Math.max(...r.map((q) => q[2])), Math.max(...r.map((q) => q[3]))];
}

export function roomAt(rooms, x, y) {
  for (const room of rooms) for (const q of room.rects.map(norm)) if (x > q[0] && x < q[2] && y > q[1] && y < q[3]) return room;
  return null;
}

/**
 * Turn the room rectangles into wall segments.
 * Every rectangle edge is split at all other break points on the same line;
 * each piece gets the rooms on both sides: same room = no wall, one side
 * empty = outer wall, two different rooms = inner wall.
 */
export function computeWalls(rooms) {
  const lines = { h: new Map(), v: new Map() };
  const add = (dir, at, a, b) => {
    const m = lines[dir];
    if (!m.has(at)) m.set(at, []);
    m.get(at).push([Math.min(a, b), Math.max(a, b)]);
  };
  for (const room of rooms) {
    for (const q of room.rects.map(norm)) {
      add('h', q[1], q[0], q[2]); add('h', q[3], q[0], q[2]);
      add('v', q[0], q[1], q[3]); add('v', q[2], q[1], q[3]);
    }
  }
  const out = [];
  for (const dir of ['h', 'v']) {
    for (const [at, spans] of lines[dir]) {
      const pts = [...new Set(spans.flat())].sort((a, b) => a - b);
      let cur = null;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], mid = (a + b) / 2;
        if (!spans.some(([s, e]) => s <= a && e >= b)) { if (cur) { out.push(cur); cur = null; } continue; }
        const r1 = dir === 'h' ? roomAt(rooms, mid, at - 0.5) : roomAt(rooms, at - 0.5, mid);
        const r2 = dir === 'h' ? roomAt(rooms, mid, at + 0.5) : roomAt(rooms, at + 0.5, mid);
        if (r1 && r2 && r1.id === r2.id) { if (cur) { out.push(cur); cur = null; } continue; }
        const kind = r1 && r2 ? 'inner' : 'outer';
        const key = `${kind}|${r1?.id}|${r2?.id}`;
        if (cur && cur.key === key && cur.b === a) { cur.b = b; continue; }
        if (cur) out.push(cur);
        cur = { dir, at, a, b, kind, key, rooms: [r1?.id, r2?.id].filter(Boolean) };
      }
      if (cur) out.push(cur);
    }
  }
  return out.map((w) => ({
    kind: w.kind, rooms: w.rooms, dir: w.dir,
    x1: w.dir === 'h' ? w.a : w.at, y1: w.dir === 'h' ? w.at : w.a,
    x2: w.dir === 'h' ? w.b : w.at, y2: w.dir === 'h' ? w.at : w.b,
  }));
}

/** Nearest wall to a point (for placing doors). */
export function nearestWall(walls, x, y, maxDist = 25) {
  let best = null, bd = maxDist;
  for (const w of walls) {
    const d = w.dir === 'h'
      ? (x >= w.x1 - 2 && x <= w.x2 + 2 ? Math.abs(y - w.y1) : Infinity)
      : (y >= w.y1 - 2 && y <= w.y2 + 2 ? Math.abs(x - w.x1) : Infinity);
    if (d < bd) { bd = d; best = w; }
  }
  return best;
}

/* -------------------------------------------------------------- entities */
export const PLACE_DOMAINS = ['light', 'switch', 'fan', 'cover', 'climate', 'media_player', 'vacuum', 'lock', 'humidifier', 'water_heater', 'valve', 'lawn_mower', 'camera'];
export const LAMP_DOMAINS = ['light', 'switch', 'input_boolean', 'fan'];

export function entityArea(hass, entityId) {
  const e = hass.entities?.[entityId];
  if (!e) return null;
  if (e.area_id) return e.area_id;
  return e.device_id ? hass.devices?.[e.device_id]?.area_id || null : null;
}

export function areaEntities(hass, areaId, domains = null) {
  if (!areaId || !hass.entities) return [];
  return Object.keys(hass.entities).filter((id) => {
    const e = hass.entities[id];
    if (e.hidden || e.entity_category || !hass.states[id]) return false;
    if (domains && !domains.includes(id.split('.')[0])) return false;
    return entityArea(hass, id) === areaId;
  });
}

/**
 * Sensible defaults for "place everything automatically": one icon per
 * physical device (its main entity), not every switch/option it exposes.
 */
const PRIO = ['light', 'camera', 'climate', 'cover', 'media_player', 'fan', 'vacuum', 'lock', 'humidifier', 'water_heater', 'valve', 'lawn_mower', 'switch'];
export function placeCandidates(hass, areaId) {
  const ids = areaEntities(hass, areaId, PLACE_DOMAINS);
  const byDev = new Map(), loose = [];
  for (const id of ids) {
    const dev = hass.entities[id]?.device_id;
    if (dev) { if (!byDev.has(dev)) byDev.set(dev, []); byDev.get(dev).push(id); } else loose.push(id);
  }
  const out = [...loose];
  for (const [devId, list] of byDev) {
    const d = hass.devices?.[devId];
    const devName = (d?.name_by_user || d?.name || '').trim().toLowerCase();
    const primary = list.filter((id) => (friendly(hass, id) || '').trim().toLowerCase() === devName);
    if (primary.length) { out.push(primary[0]); continue; }
    const lights = list.filter((id) => id.startsWith('light.'));
    if (lights.length) { out.push(lights[0]); continue; }
    const best = [...list].sort((a, b) => PRIO.indexOf(a.split('.')[0]) - PRIO.indexOf(b.split('.')[0]))[0];
    if (best) out.push(best);
  }
  return [...new Set(out)];
}

export function isOn(st) {
  return !!st && ['on', 'open', 'opening', 'playing', 'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only', 'cleaning', 'unlocked'].includes(st.state);
}

export function friendly(hass, id) {
  const st = hass.states[id];
  return (st && st.attributes.friendly_name) || id;
}

export function lightColor(st) {
  const a = st?.attributes || {};
  if (Array.isArray(a.rgb_color)) return a.rgb_color.join(',');
  if (a.color_temp_kelvin) {
    const k = a.color_temp_kelvin;
    return k < 3000 ? '255,176,90' : k < 4500 ? '255,214,160' : '235,240,255';
  }
  return null;
}

export function shortState(hass, st) {
  if (!st) return '';
  const d = st.entity_id.split('.')[0];
  if (d === 'climate') {
    const tgt = st.attributes.temperature, cur = st.attributes.current_temperature;
    return [cur != null ? `${Math.round(cur * 10) / 10}°` : null, tgt != null ? `→${tgt}°` : null].filter(Boolean).join(' ') || st.state;
  }
  if (d === 'sensor' && !isNaN(parseFloat(st.state))) {
    return `${Math.round(parseFloat(st.state) * 10) / 10}${st.attributes.unit_of_measurement ? ' ' + st.attributes.unit_of_measurement : ''}`;
  }
  if (d === 'cover') return st.attributes.current_position != null ? `${st.attributes.current_position}%` : t(hass, st.state === 'open' ? 'open' : 'closed');
  if (hass.formatEntityState) { try { return hass.formatEntityState(st); } catch (e) { /* formatEntityState missing: fall back to the raw state */ } }
  return st.state;
}

/** Temperature / humidity / lights summary for a room, from its area. */
export function roomSummary(hass, room) {
  const ids = areaEntities(hass, room.area_id);
  const pick = (dc) => {
    if (room[dc]) return hass.states[room[dc]];
    const area = room.area_id && hass.areas?.[room.area_id];
    const areaSensor = area && area[`${dc}_entity_id`];
    if (areaSensor && hass.states[areaSensor]) return hass.states[areaSensor];
    return ids.map((id) => hass.states[id]).find((s) => s && s.entity_id.startsWith('sensor.') && s.attributes.device_class === dc && !isNaN(parseFloat(s.state)));
  };
  const lights = ids.filter((id) => id.startsWith('light.') && !hass.entities[id]?.platform?.includes('group'));
  const lit = lights.filter((id) => hass.states[id].state === 'on');
  const colors = lit.map((id) => lightColor(hass.states[id])).filter(Boolean);
  return { temp: pick('temperature'), hum: pick('humidity'), lights, lit, colors };
}

/* ------------------------------------------- temperature / presence / alerts */
/** Cold → comfortable → warm, as 'r,g,b'. */
export function tempColor(v, min = 17, max = 24) {
  const stops = [[0, [70, 140, 255]], [0.5, [80, 200, 150]], [0.75, [255, 200, 70]], [1, [255, 80, 50]]];
  const f = Math.max(0, Math.min(1, (v - min) / ((max - min) || 1)));
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i], [p0, c0] = stops[i - 1];
    if (f <= p1) { const k = (f - p0) / (p1 - p0); return c0.map((c, j) => Math.round(c + (c1[j] - c) * k)).join(','); }
  }
  return stops[stops.length - 1][1].join(',');
}

const PRESENCE_DC = ['occupancy', 'presence', 'motion'];
// camera object detectors (Frigate etc.) also report pets, cars… – those are not people
const NOT_PEOPLE = /(^|_)(car|cars|bicycle|bike|motorcycle|dog|cat|bird|horse|animal|vehicle|truck|bus|boat|package|face|license_plate)(_|$)/;
const norm2 = (v) => String(v ?? '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');

/** Is anyone in this room? Sensors in the room's area, plus people tracked to a room. */
export function roomPresence(hass, room, settings = DEFAULT_SETTINGS) {
  const sensors = areaEntities(hass, room.area_id, ['binary_sensor']).filter((id) => {
    const st = hass.states[id];
    return PRESENCE_DC.includes(st.attributes.device_class) && !NOT_PEOPLE.test(id.split('.')[1]);
  });
  const by = sensors.filter((id) => hass.states[id].state === 'on');
  const names = [room.name, room.area_id, room.area_id && hass.areas?.[room.area_id]?.name].filter(Boolean).map(norm2);
  const people = Object.entries(settings.people || {}).filter(([person, sensor]) => {
    const st = sensor && hass.states[sensor];
    return st && names.includes(norm2(st.state)) && hass.states[person]?.state !== 'not_home';
  }).map(([person]) => person);
  const occupied = by.length > 0 || people.length > 0;
  return { occupied, by, people, fade: occupied ? 0 : Math.max(0, ...sensors.map((id) => motionFade(hass.states[id], settings))) };
}

/**
 * How much of the "someone was just here" colour a motion sensor still has: 1 right after it went
 * quiet, sliding to 0 over `motion_fade` minutes. 0 while it is on (then it is simply "on").
 */
export function motionFade(st, settings = DEFAULT_SETTINGS, now = Date.now()) {
  const mins = +settings.motion_fade || 0;
  if (!st || st.state !== 'off' || mins <= 0) return 0;
  const ago = (now - new Date(st.last_changed).getTime()) / 60000;
  return ago >= 0 && ago < mins ? Math.round((1 - ago / mins) * 20) / 20 : 0;
}
export const isMotion = (st) => !!st && st.entity_id.startsWith('binary_sensor.') && PRESENCE_DC.includes(st.attributes.device_class);

/* --------------------------------------------------------- real-world size */
/** Plan units per metre, or null when the plan has not been measured yet. */
export const planScale = (plan) => (safeNumber(plan?.scale, 0) > 0 ? +plan.scale : null);
export function fmtMeters(units, scale, digits = 2) {
  return scale ? `${(units / scale).toFixed(digits).replace('.', ',')} m` : '';
}
/** Floor area of a room in m² (overlapping pieces counted once, on a 10 cm raster). */
export function roomArea(room, scale) {
  if (!scale) return null;
  const rects = room.rects.map(norm), step = scale / 10;
  const [x0, y0, x1, y1] = roomBBox(room);
  let n = 0;
  for (let y = y0 + step / 2; y < y1; y += step) for (let x = x0 + step / 2; x < x1; x += step) if (rects.some((q) => x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3])) n++;
  return n / 100;
}

/* ---------------------------------------------------------------- radar */
/**
 * mmWave radar entities on the same device as a presence sensor:
 * distance-only sensors (Tuya 24G, LD2410: "someone at 1.9 m") and x/y trackers (LD2450: dots).
 */
export function radarEntities(hass, entityId) {
  const dev = hass.entities?.[entityId]?.device_id;
  if (!dev) return null;
  const ids = Object.keys(hass.entities).filter((id) => hass.entities[id].device_id === dev && hass.states[id]);
  const pick = (re, dom) => ids.find((id) => id.startsWith(dom) && re.test(id.split('.')[1]));
  const xy = [];
  for (let n = 1; n <= 5; n++) {
    const x = pick(new RegExp(`target_?${n}_x$`), 'sensor.'), y = pick(new RegExp(`target_?${n}_y$`), 'sensor.');
    if (x && y) xy.push([x, y]);
  }
  const distance = pick(/(target_distance|moving_distance|detection_distance|distance)$/, 'sensor.');
  const range = pick(/(detection_range|max_distance|maximum_distance|max_range)$/, 'number.') || pick(/(detection_range|max_distance)$/, 'sensor.');
  if (!xy.length && !distance) return null;
  return { distance: distance || '', range: range || '', xy };
}
const toMeters = (st) => {
  if (!st) return NaN;
  const v = parseFloat(st.state), u = (st.attributes.unit_of_measurement || 'm').toLowerCase();
  return u === 'mm' ? v / 1000 : u === 'cm' ? v / 100 : v;
};
/** Where the radar sees people, in plan units: a ring (distance only) and/or dots (x/y). */
export function radarState(hass, it, scale) {
  const r = it.radar;
  if (!r || !scale) return null;
  const on = hass.states[it.entity_id]?.state === 'on';
  // a sensor on the ceiling measures at a slant down to you: take the part along the floor
  // (height of the sensor minus about 1.1 m, the middle of someone standing or sitting)
  const hEff = Math.max(0, safeNumber(r.height, 0) - 1.1);
  const flat = (m) => (hEff > 0 && Number.isFinite(m) ? Math.sqrt(Math.max(0, m * m - hEff * hEff)) : m);
  const rangeM = flat(r.range ? toMeters(hass.states[r.range]) : safeNumber(r.range_m, 0));
  const distM = flat(r.distance ? toMeters(hass.states[r.distance]) : NaN);
  const a = (safeNumber(r.angle, 0) * Math.PI) / 180;
  const dots = (r.xy || []).map(([xe, ye]) => [toMeters(hass.states[xe]) , toMeters(hass.states[ye])])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && (x !== 0 || y !== 0))
    // the sensor looks "down" the plan at angle 0; x is sideways, y is straight ahead
    .map(([x, y]) => [it.x + (x * Math.cos(a) - y * Math.sin(a)) * scale, it.y + (x * Math.sin(a) + y * Math.cos(a)) * scale]);
  return {
    on, x: it.x, y: it.y,
    range: rangeM > 0 ? rangeM * scale : 0,
    ring: on && distM > 0 && !(r.xy || []).length ? distM * scale : 0,
    meters: on && distM > 0 ? distM : 0,
    dots: on ? dots : [],
  };
}

/* ------------------------------------------------------------ furniture */
export const FURN_TYPES = {
  sofa: { icon: 'mdi:sofa-outline', w: 200, h: 90 },
  bed: { icon: 'mdi:bed-outline', w: 160, h: 200 },
  table: { icon: 'mdi:table-chair', w: 160, h: 90 },
  round: { icon: 'mdi:table-furniture', w: 110, h: 110 },
  desk: { icon: 'mdi:desk', w: 140, h: 70 },
  counter: { icon: 'mdi:countertop-outline', w: 240, h: 60 },
  sink: { icon: 'mdi:faucet', w: 80, h: 50 },
  hob: { icon: 'mdi:grid', w: 60, h: 52 },
  stove: { icon: 'mdi:stove', w: 60, h: 60 },
  fridge: { icon: 'mdi:fridge-outline', w: 60, h: 65 },
  island: { icon: 'mdi:countertop', w: 180, h: 90 },
  wallcab: { icon: 'mdi:wardrobe', w: 120, h: 35 },
  cabinet: { icon: 'mdi:wardrobe-outline', w: 120, h: 55 },
  bath: { icon: 'mdi:bathtub-outline', w: 170, h: 75 },
  shower: { icon: 'mdi:shower', w: 90, h: 90 },
  toilet: { icon: 'mdi:toilet', w: 40, h: 65 },
  stairs: { icon: 'mdi:stairs', w: 90, h: 260 },
  tv: { icon: 'mdi:television', w: 140, h: 12 },
  plant: { icon: 'mdi:flower-outline', w: 45, h: 45 },
};
/** One piece of furniture as SVG: f = {id, type, x, y (centre), w, h, rot (degrees)}. */
export function furnSVG(f, extra = '') {
  const w = Math.max(10, safeNumber(f.w, 100)), h = Math.max(6, safeNumber(f.h, 60)), x = -w / 2, y = -h / 2;
  const R = (a, b, c, d, r = 0, cls = '') => `<rect${cls ? ` class="${cls}"` : ''} x="${a}" y="${b}" width="${c}" height="${d}" rx="${r}"/>`;
  const L = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  let body = '';
  switch (f.type) {
    case 'sofa': {
      const arm = Math.min(w * 0.12, 22), back = Math.min(h * 0.28, 24);
      body = R(x, y, w, h, 8) + R(x + arm, y, w - 2 * arm, back, 5) + L(x + arm, y + back, x + arm, y + h) + L(x + w - arm, y + back, x + w - arm, y + h) + L(0, y + back, 0, y + h);
      break;
    }
    case 'bed': {
      const pw = w > 120 ? (w - 30) / 2 : w - 20, ph = Math.min(30, h * 0.16);
      body = R(x, y, w, h, 5) + (w > 120 ? R(x + 10, y + 8, pw, ph, 6) + R(x + 20 + pw, y + 8, pw, ph, 6) : R(x + 10, y + 8, pw, ph, 6)) + L(x, y + h * 0.38, x + w, y + h * 0.38);
      break;
    }
    case 'table': {
      const cw = Math.min(34, w / 4), cs = 14;
      const chairs = [];
      for (let i = 0; i < Math.max(1, Math.floor(w / 60)); i++) {
        const cx = x + ((i + 0.5) * w) / Math.max(1, Math.floor(w / 60)) - cw / 2;
        chairs.push(R(cx, y - cs - 4, cw, cs, 4, 'soft'), R(cx, y + h + 4, cw, cs, 4, 'soft'));
      }
      body = chairs.join('') + R(x, y, w, h, 6);
      break;
    }
    case 'round':
      body = [0, 1, 2, 3].map((i) => { const a = (i * Math.PI) / 2 + Math.PI / 4; return `<circle class="soft" cx="${Math.cos(a) * (w / 2 + 10)}" cy="${Math.sin(a) * (h / 2 + 10)}" r="11"/>`; }).join('') + `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}"/>`;
      break;
    case 'desk':
      body = R(x, y, w, h, 4) + `<circle class="soft" cx="0" cy="${y + h + 18}" r="15"/>`;
      break;
    case 'counter':
      // a plain worktop; put a hob or a sink on it
      body = R(x, y, w, h, 3) + L(x, y + h - 4, x + w, y + h - 4);
      break;
    case 'hob':
      body = R(x, y, w, h, 4) + [0, 1].map((i) => [0, 1].map((j) => `<circle cx="${x + w * (0.28 + i * 0.44)}" cy="${y + h * (0.28 + j * 0.44)}" r="${Math.min(w, h) * 0.15}"/>`).join('')).join('');
      break;
    case 'cabinet':
      body = R(x, y, w, h, 2) + L(x, y, x + w, y + h) + L(x + w, y, x, y + h);
      break;
    case 'sink':
      body = R(x, y, w, h, 3) + R(x + w * 0.15, y + h * 0.25, w * 0.7, h * 0.6, 8) + `<circle cx="0" cy="${y + h * 0.13}" r="3"/>`;
      break;
    case 'stove':
      body = R(x, y, w, h, 3) + [0, 1].map((i) => [0, 1].map((j) => `<circle cx="${x + w * (0.3 + i * 0.4)}" cy="${y + h * (0.3 + j * 0.4)}" r="${Math.min(w, h) * 0.12}"/>`).join('')).join('');
      break;
    case 'fridge':
      body = R(x, y, w, h, 3) + L(x, y + h * 0.3, x + w, y + h * 0.3) + L(x + w * 0.85, y + h * 0.4, x + w * 0.85, y + h * 0.75);
      break;
    case 'island':
      body = R(x, y, w, h, 4) + R(x + 6, y + 6, w - 12, h - 12, 3, 'soft');
      break;
    case 'wallcab':
      body = `<rect class="hang" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>` + L(x + w / 2, y, x + w / 2, y + h);
      break;
    case 'bath':
      body = R(x, y, w, h, 8) + R(x + 8, y + 8, w - 16, h - 16, Math.min(h, w) / 3) + `<circle cx="${x + w - 22}" cy="0" r="4"/>`;
      break;
    case 'shower':
      body = R(x, y, w, h, 3) + L(x, y, x + w, y + h) + L(x + w, y, x, y + h) + '<circle cx="0" cy="0" r="5"/>';
      break;
    case 'toilet':
      body = R(x, y, w, h * 0.3, 4) + `<ellipse cx="0" cy="${y + h * 0.3 + (h * 0.7) / 2}" rx="${w / 2 - 2}" ry="${(h * 0.7) / 2}"/>`;
      break;
    case 'stairs': {
      const n = Math.max(3, Math.round(h / 26)), lines = [];
      for (let i = 1; i < n; i++) lines.push(L(x, y + (i * h) / n, x + w, y + (i * h) / n));
      // arrow: up the stairs
      body = R(x, y, w, h, 2) + lines.join('') + `<path class="arrow" d="M0,${y + h - 10} V${y + 14} M-9,${y + 26} L0,${y + 14} L9,${y + 26}"/>`;
      break;
    }
    case 'tv':
      body = R(x, y, w, h, 2) + R(x + w * 0.3, y + h, w * 0.4, 4, 1, 'soft');
      break;
    case 'plant':
      body = [0, 1, 2, 3, 4].map((i) => { const a = (i * 2 * Math.PI) / 5; return `<ellipse cx="${(Math.cos(a) * w) / 4}" cy="${(Math.sin(a) * h) / 4}" rx="${w / 5}" ry="${h / 9}" transform="rotate(${(a * 180) / Math.PI} ${(Math.cos(a) * w) / 4} ${(Math.sin(a) * h) / 4})"/>`; }).join('') + `<circle cx="0" cy="0" r="${Math.min(w, h) / 7}"/>`;
      break;
    default:
      body = R(x, y, w, h, 4);
  }
  return `<g class="furn f-${esc(f.type || 'box')}"${extra} transform="translate(${safeNumber(f.x)} ${safeNumber(f.y)}) rotate(${safeNumber(f.rot)})">${body}</g>`;
}

// not 'heat' (boiler flame sensors use it) and not 'safety' (NAS / device health) – those would cry wolf
const ALARM_DC = ['smoke', 'gas', 'carbon_monoxide', 'moisture'];
const OPEN_DC = ['door', 'window', 'garage_door', 'opening'];
/** Alarms (red) and open doors/windows (orange) in the room's area. */
export function roomAlerts(hass, room, settings = DEFAULT_SETTINGS) {
  const out = [];
  for (const id of areaEntities(hass, room.area_id, ['binary_sensor'])) {
    const st = hass.states[id], dc = st.attributes.device_class;
    if (st.state !== 'on') continue;
    if (settings.alerts && ALARM_DC.includes(dc)) out.push({ id, dc, level: 'alarm' });
    else if (settings.alert_open && OPEN_DC.includes(dc)) out.push({ id, dc, level: 'warn' });
  }
  const level = out.some((a) => a.level === 'alarm') ? 'alarm' : out.length ? 'warn' : null;
  return { level, items: out };
}

/** Path of a room's own page in a generated dashboard. */
export function roomPath(room) {
  const slug = String(room.name || room.id || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ruimte';
  return `ruimte-${slug}`;
}
/** In-app navigation like HA's own links. */
export function navigate(path) {
  history.pushState(null, '', path);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
}

/* ---------------------------------------------------------------- vacuum */
export function planVacuum(hass, plan) {
  const s = settingsOf(plan);
  if (s.vacuum && hass.states[s.vacuum]) return s.vacuum;
  const it = (plan.items || []).find((i) => i.entity_id.startsWith('vacuum.') && hass.states[i.entity_id]);
  return it ? it.entity_id : null;
}
export function vacuumMapEntity(hass, plan) {
  const s = settingsOf(plan), id = s.vacuum_map || plan.background?.source;
  return id && hass.states[id] ? id : null;
}
export const VACUUM_BUSY = ['cleaning', 'returning', 'paused'];

/**
 * Turn / mirror an image the same way the editor turned the background, so a
 * live map lines up exactly with the background it was traced from.
 * ops: list of 'left' | 'right' | 'flip'.
 */
export function transformImage(img, ops = []) {
  let src = img;
  for (const how of ops) {
    const w = src.naturalWidth || src.width, h = src.naturalHeight || src.height, turn = how !== 'flip';
    const c = document.createElement('canvas');
    c.width = turn ? h : w; c.height = turn ? w : h;
    const g = c.getContext('2d');
    if (how === 'right') { g.translate(c.width, 0); g.rotate(Math.PI / 2); }
    else if (how === 'left') { g.translate(0, c.height); g.rotate(-Math.PI / 2); }
    else { g.translate(c.width, 0); g.scale(-1, 1); }
    g.drawImage(src, 0, 0);
    src = c;
  }
  return src;
}

/* --------------------------------------------------------- plan drawing */
/** Every user-adjustable setting with its default (stored per floorplan in plan.settings). */
export const DEFAULT_SETTINGS = {
  theme: 'warm',            // default theme of the card
  default_mode: 'all',      // simple | all
  usage_days: 14,           // Simple: show what was used in the last N days
  learning_days: 3,         // Simple shows everything until this much history exists
  compact: 'auto',          // small screens: auto = room by room below compact_width | on | off
  compact_width: 560,       // px; narrower than this shows the plan room by room
  plan_size: 100,           // % of the available width the plan uses (smaller = a more compact page)
  icon_size: 100,           // % of the normal icon size
  lamp_size: 100, device_size: 100,   // % extra for lamps and for other devices
  label_size: 100,          // % of the normal room-text size
  glow: 100,                // % strength of the room glow when lights are on
  show_temp: true, show_hum: true, show_lights: true,   // room text lines
  show_tags: true,          // small state label under devices (21°, open, …)
  tap_zoom: true,           // tap a room to zoom in
  hold_ms: 500,             // hold time before details open
  hold_action: 'quick',     // hold an icon: quick = small window with on/off and sliders | more-info = Home Assistant's own dialog
  sun_before: 45,           // Automatic (sun): minutes before sunrise it starts getting light
  sun_ramp: 120,            // Automatic (sun): minutes the transition takes
  auto_domains: ['light', 'switch', 'fan', 'cover', 'climate', 'media_player', 'vacuum', 'lock', 'camera'],   // "place automatically"
  temp_color: false,        // colour the rooms from cold (blue) to warm (red)
  temp_min: 17, temp_max: 24,
  presence: true,           // show who/where: motion, occupancy and presence sensors in the room's area
  motion_fade: 5,
  show_stalks: false,       // 2.5D: thin lines from the floor up to raised icons
  perspective: true,        // 2.5D: real perspective (nearer = a little bigger)
  height_25d: 80,           // 2.5D: 'real' = true height, or a % of it, for walls, furniture and raised icons
  turn_ghost: true,         // 2.5D: icons fade (ghosted) while you turn the house, so the shape is easier to follow
  turn_ghost_pct: 10,       // ... to this % visible
  people: {},               // person.x -> sensor whose state is the room/area the person is in (Bermuda, ESPresense, …)
  alerts: true,             // smoke, gas, CO, water leak: the room flashes red and a banner appears
  alert_open: true,         // open doors/windows: the room gets an orange edge
  vacuum: '',               // vacuum entity ('' = the first one on the plan)
  vacuum_live: 'cleaning',  // live vacuum map over the plan: cleaning | always | off
  vacuum_map: '',           // image/camera entity with the live map ('' = the one the background came from)
  vacuum_opacity: 0.6,
  vacuum_show: 'robot',     // robot: only the robot drives over your plan | map: the vacuum's own map | both
  theme_entity: '',
  room_tap: 'zoom',
  glow_style: 'lamp',       // lamp: a soft pool of light around each lamp | room: the whole room glows | off
  lamp_level: 'fixed',      // how bright a lamp is: fixed = "40%" under the lamp | hover = only when you point at it | off
  show_co2: true, show_covers: true, show_climate: true, show_media: true,   // extra rows in the room text
  info_rows: 5,             // at most this many rows under a room's name
  compass: null,            // north arrow: degrees (0 = up), empty = none
  greeting: true,           // "Good afternoon · Home: Anna & Tom" instead of the plan name
  side: {},                 // side column picks (weather, main, buttons, solar, grid, grid_return, price, solar_today, status)         // tap a room: zoom in on the card, or open the room's own page (generated dashboards)         // input_select whose option picks the theme on every screen at once
};
/** fixed | hover | off (true/false from older plans count as fixed/off) */
export const levelMode = (s) => (s.lamp_level === false || s.lamp_level === 'off' ? 'off' : s.lamp_level === 'hover' ? 'hover' : 'fixed');
export const settingsOf = (plan) => ({ ...DEFAULT_SETTINGS, ...(plan?.settings || {}) });

export function newPlan(name = 'Home') {
  return { id: '', name, width: 1000, height: 700, grid: 10, background: null, rooms: [], openings: [], items: [], furniture: [], settings: { ...DEFAULT_SETTINGS } };
}

/** Width of the widest part of a room (L-shaped rooms: the text has to fit in one part). */
export function roomTextWidth(room) {
  return Math.max(...room.rects.map(norm).map((q) => q[2] - q[0]));
}

/**
 * Where the room's text block goes: the free-est spot inside the room (fewest icons under it),
 * preferring the top-left. Rooms can still get a fixed `label: {x, y}`.
 */
export function labelSpot(plan, room, fs, rows = 2) {
  const name = String(room.name || '');
  const w = Math.max(name.length * fs * 0.84, fs * 9.5), h = fs * (3.9 + 1.5 * rows), r = plan.width * 0.016;
  const items = (plan.items || []).map((it) => [it.x, it.y]);
  let best = null;
  for (const pad of [14, 6]) {   // keep some room from the walls; only hug them when the room is small
  if (best) break;
  for (const q of room.rects.map(norm)) {
    if (q[2] - q[0] < w + pad * 2 || q[3] - q[1] < h + pad * 2) continue;
    for (let y = q[1] + pad; y <= q[3] - h - pad; y += 5) {
      for (let x = q[0] + pad; x <= q[2] - w - pad; x += 5) {
        let hits = 0;
        for (const [ix, iy] of items) if (ix > x - r && ix < x + w + r && iy > y - r && iy < y + h + r) hits++;
        const cost = hits * 1000 + (y - q[1]) * 0.6 + (x - q[0]) * 0.3;
        if (!best || cost < best.cost) best = { cost, x, y };
      }
    }
  }
  }
  if (best) return [best.x, best.y];
  const q = room.rects.map(norm).sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0];
  return [q[0] + 14, q[1] + 14];
}

/**
 * Static SVG for a plan. Colours come from CSS variables, so switching the
 * theme never needs a re-render. `glowIds` adds a glow layer per room that the
 * card fades in when lights in that room are on.
 */
/* ------------------------------------------------------------------ 2.5D */
/** The floor in 2.5D: rooms as exact polygons; textures and the vacuum map follow a close flat fit. */
function groundSVG(plan, proj, editor) {
  const { P, J } = proj, out = [];
  const W = safeNumber(plan.width, 1000), H = safeNumber(plan.height, 700);
  const poly = (q) => [[q[0], q[1]], [q[2], q[1]], [q[2], q[3]], [q[0], q[3]]].map(([x, y]) => P(x, y).map((v) => v.toFixed(1)).join(',')).join(' ');
  const mat = (mm) => `matrix(${mm.map((v) => +v.toFixed(5)).join(' ')})`;
  for (const room of plan.rooms) {
    const ref = safeSvgId(room.id), rects = room.rects.map(norm);
    out.push(`<clipPath id="cp-${ref}">${rects.map((q) => `<polygon points="${poly(q)}"/>`).join('')}</clipPath>`);
    for (const q of rects) out.push(`<polygon class="floor" data-room="${esc(room.id)}" points="${poly(q)}"/>`);
  }
  for (const room of plan.rooms) {
    if (!['tiles', 'wood'].includes(room.floor)) continue;
    const [x0, y0, x1, y1] = roomBBox(room), ref = safeSvgId(room.id);
    out.push(`<g clip-path="url(#cp-${ref})"><rect class="floortex" transform="${mat(J((x0 + x1) / 2, (y0 + y1) / 2))}" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#fps-${room.floor})"/></g>`);
  }
  for (const room of plan.rooms) {
    const ref = safeSvgId(room.id);
    out.push(`<polygon class="glow" data-room="${esc(room.id)}" id="glow-${ref}" clip-path="url(#cp-${ref})" points="${poly(roomBBox(room))}" fill="url(#g-${ref})"/>`);
  }
  if (!editor) {
    out.push(`<clipPath id="cp-all">${plan.rooms.flatMap((r) => r.rects.map(norm)).map((q) => `<polygon points="${poly(q)}"/>`).join('')}</clipPath>`);
    out.push('<g class="lampglows" clip-path="url(#cp-all)"><g filter="url(#fps-lampblur)"></g></g>');
    // vacuum map and trail: a close flat fit is plenty for these
    out.push(`<g class="ground" transform="${mat(proj.m)}">`);
    out.push(`<clipPath id="c-all">${plan.rooms.flatMap((r) => r.rects.map(norm)).map((q) => `<rect x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}"/>`).join('')}</clipPath>`);
    if (plan.background) {
      const b = plan.background;
      out.push(`<image class="livemap" clip-path="url(#c-all)" x="${safeNumber(b.x)}" y="${safeNumber(b.y)}" width="${safeNumber(b.w, W) || W}" height="${safeNumber(b.h, H) || H}" preserveAspectRatio="none"/>`);
    }
    out.push('<polyline class="vactrail" points=""/>');
    const flat = (plan.furniture || []).filter((f) => !(furnHeight(f) > 0));
    if (flat.length) out.push(`<g class="furniture">${flat.map((f) => furnSVG(f)).join('')}</g>`);
    out.push('</g>');
    out.push('<g class="radars"></g>');
  }
  return out.join('');
}

/** How tall furniture is, in metres (0 = stays flat on the floor). */
export const FURN_HEIGHT = { hob: 0.9, sink: 0.9, stove: 0.9, fridge: 1.85, island: 0.92, wallcab: 2.1, sofa: 0.85, bed: 0.95, table: 0.9, round: 0.76, desk: 0.76, counter: 0.9, cabinet: 2, bath: 0.58, shower: 2, toilet: 0.8, stairs: 2.4, tv: 1.15, plant: 0.9 };
const LIFT = 1;   // real proportions; setting height_25d: 'real' or a percentage of that
/** A piece of furniture's height in metres: its own (set in the editor) or the usual one for its kind. */
export const furnHeight = (f) => (f.z != null && f.z !== '' && Number.isFinite(+f.z) ? Math.max(0, +f.z) : (FURN_HEIGHT[f.type] || 0));
/** The piece of furniture under a point (its turned rectangle), or null. */
export function furnAt(plan, x, y) {
  for (const f of plan.furniture || []) {
    const r = (-safeNumber(f.rot) * Math.PI) / 180, dx = x - safeNumber(f.x), dy = y - safeNumber(f.y);
    const lx = dx * Math.cos(r) - dy * Math.sin(r), ly = dx * Math.sin(r) + dy * Math.cos(r);
    if (Math.abs(lx) <= safeNumber(f.w, 100) / 2 && Math.abs(ly) <= safeNumber(f.h, 60) / 2) return f;
  }
  return null;
}
/**
 * Your own height for a device in metres, or null. A number above 6 was meant in centimetres (100 = 1 m).
 */
export function ownHeight(it) {
  if (it?.height == null || it.height === '') return null;
  const v = +String(it.height).replace(',', '.');
  if (!Number.isFinite(v) || v < 0) return null;
  return v > 6 ? v / 100 : v;
}
/** A drawn LED strip: its points (plan units), or null when the lamp is just an icon. */
export const stripPath = (it) => (it?.shape === 'strip' && Array.isArray(it.path) && it.path.length >= 2 ? it.path.map(([x, y]) => [safeNumber(x), safeNumber(y)]) : null);
/** Length of a line through these points, and the point halfway along it. */
export function pathLength(path) { let L = 0; for (let i = 1; i < path.length; i++) L += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); return L; }
export function pathMid(path) {
  let half = pathLength(path) / 2;
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1], [bx, by] = path[i], d = Math.hypot(bx - ax, by - ay);
    if (d >= half) { const k = d ? half / d : 0; return [ax + (bx - ax) * k, ay + (by - ay) * k]; }
    half -= d;
  }
  return path[path.length - 1];
}

/**
 * Is this a ceiling lamp? Your own choice in step 4 wins; otherwise the name or Home Assistant's icon
 * gives it away (plafond, ceiling, spot, hanglamp, pendant, downlight, kroonluchter ...).
 */
const CEIL_RE = /plafond|ceiling|hanglamp|hanglight|pendant|spot|downlight|inbouw|kroonluchter|chandelier|lustre|deckenl|plafonnier/i;
export function isCeilingLamp(it, st) {
  if (it.ceiling === 'hanging') return true;
  if (it.ceiling === true || it.ceiling === false) return it.ceiling;
  const d = it.entity_id.split('.')[0];
  if (!(d === 'light' || it.kind === 'lamp')) return false;
  if (/ceiling/.test(it.icon || st?.attributes?.icon || '')) return true;
  return CEIL_RE.test(`${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`);
}
/** A ceiling lamp hanging on a cord (its own height) or flat against the ceiling: 'hanging', 'flush' or null. */
const HANG_RE = /hanglamp|hanglight|pendant|pendel|hanging|kroonluchter|chandelier/i;
export function ceilingMount(it, st) {
  if (it.ceiling === 'hanging') return 'hanging';
  if (!isCeilingLamp(it, st)) return null;
  if (it.ceiling === true) return 'flush';
  return HANG_RE.test(`${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`) ? 'hanging' : 'flush';
}
/**
 * How high a device sits, in metres, for the 2.5D view: its own height (step 4) or a sensible one
 * for its kind (ceiling lamp high, thermostat at chest height, vacuum on the floor).
 */
export function itemHeight(it, st) {
  if (ownHeight(it) != null) return ownHeight(it);
  if (it.radar?.height) return +it.radar.height;
  if (ceilingMount(it, st) === 'hanging') return 2.0;   // a lamp on a cord hangs lower than one against the ceiling
  const d = it.entity_id.split('.')[0], dc = st?.attributes?.device_class;
  if (d === 'binary_sensor' && ['motion', 'occupancy', 'presence'].includes(dc)) return 2.3;
  return { light: 2.2, fan: 2.3, cover: 2.0, camera: 2.3, climate: 1.5, sensor: 1.5, binary_sensor: 1.4, lock: 1.1, switch: 1.0, input_boolean: 1.0, media_player: 1.0, vacuum: 0, lawn_mower: 0 }[d] ?? 1.0;
}   // heights are drawn at 42% so the walls don't hide the rooms

/**
 * What kind of lamp and how high a device really hangs, in metres - one rule for 2.5D, the walk-through and the editor.
 * Your own height always wins. A lamp: against the ceiling, hanging (over the dining table: well above it),
 * a floor lamp (~1.5 m), a desk/table lamp (on the furniture under it) or an LED strip; anything over a table
 * or cupboard sits just above it.
 */
export const WALL_H = 2.6;
const FLOORLAMP_RE = /vloer|staand|floor|standing|stalamp/i, TABLELAMP_RE = /bureau|tafellamp|nacht|desk|bedside|leeslamp|reading/i;
export function lampStyle(plan, it, st) {
  const d = it.entity_id.split('.')[0];
  if (it.kind === 'device' || !(d === 'light' || it.kind === 'lamp')) return null;
  if (stripPath(it)) return 'strip';
  const own = ownHeight(it) != null;
  const mount = ceilingMount(it, st);
  if (mount === 'hanging') return 'pendant';
  // a lamp against the ceiling that you gave a lower height hangs on a cord
  if (mount === 'flush') return own && ownHeight(it) < WALL_H - 0.25 ? 'pendant' : 'ceiling';
  const label = `${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`;
  if (FLOORLAMP_RE.test(label)) return 'floor';
  const under = furnAt(plan, safeNumber(it.x), safeNumber(it.y));
  if (under && !own && ['table', 'round', 'island'].includes(under.type)) return 'pendant';
  if (TABLELAMP_RE.test(label) || (under && !own)) return 'table';
  return 'other';
}
export function deviceHeight(plan, it, st) {
  const own = ownHeight(it) != null;
  let h;
  if (own) h = ownHeight(it);
  else {
    const under = furnAt(plan, safeNumber(it.x), safeNumber(it.y)), style = lampStyle(plan, it, st);
    if (style === 'ceiling') h = WALL_H - 0.12;
    else if (style === 'pendant') h = under ? furnHeight(under) + 0.85 : 2.0;
    else if (style === 'floor') h = 1.5;
    else if (style === 'table') h = (under ? furnHeight(under) : 0.75) + 0.3;
    else h = under ? furnHeight(under) + 0.35 : itemHeight(it, st);
  }
  return Math.min(Math.max(h, 0), WALL_H - 0.05);
}

/**
 * The 2.5D view: the plan turned (rot, degrees) and tilted (tilt, degrees from top-down), then fitted
 * back into the plan's own box. P(x, y) gives where a floor point lands, dz(h) how far up a height goes.
 */
export function makeProj(plan, { rot = 0, tilt = 50, height = 100, persp = true } = {}) {
  const W = safeNumber(plan.width, 1000), H = safeNumber(plan.height, 700), cx = W / 2, cy = H / 2;
  const th = (rot * Math.PI) / 180, t = (tilt * Math.PI) / 180, co = Math.cos(th), si = Math.sin(th), ct = Math.cos(t), st = Math.sin(t);
  const lift = height === 'real' ? LIFT : LIFT * Math.max(0.3, Math.min(2, safeNumber(height, 80) / 100));
  const sc = planScale(plan) || 70, wallH = 2.6 * sc * lift;
  const corners = plan.rooms.flatMap((r) => r.rects.map(norm)).flatMap((q) => [[q[0], q[1]], [q[2], q[1]], [q[0], q[3]], [q[2], q[3]]]);
  // real perspective: what is nearer looks a little bigger (the camera stands about 3 house-widths away)
  const R0 = Math.max(1, ...corners.map(([x, y]) => Math.hypot(x - cx, y - cy)));
  const D = persp ? R0 * 3.2 : Infinity;
  const rawAt = (c, n) => (x, y, z = 0) => {
    const xr = c * (x - cx) - n * (y - cy), yr = n * (x - cx) + c * (y - cy);
    const k = Number.isFinite(D) ? D / Math.max(D * 0.2, D - (yr * st + z * ct)) : 1;
    return [xr * k, (yr * ct - z * st) * k];
  };
  const raw = rawAt(co, si);
  const box = (f) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of corners) for (const z of [0, wallH]) { const [a, b] = f(x, y, z); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b); }
    return Number.isFinite(x0) ? [x0, y0, x1, y1] : [-cx, -cy, cx, cy];
  };
  const pad = W * 0.03, fit = ([a0, b0, a1, b1]) => Math.min((W - 2 * pad) / Math.max(1, a1 - a0), (H - 2 * pad) / Math.max(1, b1 - b0));
  const [x0, y0, x1, y1] = box(raw);
  // the same size at every angle (the smallest fit over a full turn), so turning the house doesn't zoom in and out
  let s = Infinity;
  for (let d = 0; d < 180; d += 15) { const r = (d * Math.PI) / 180; s = Math.min(s, fit(box(rawAt(Math.cos(r), Math.sin(r))))); }
  const tx = W / 2 - (s * (x0 + x1)) / 2, ty = H / 2 - (s * (y0 + y1)) / 2;
  const P = (x, y, z = 0) => { const [a, b] = raw(x, y, z); return [s * a + tx, s * b + ty]; };
  // J: the plan around one point as a flat (affine) matrix — exact without perspective, a close fit with it
  const J = (x, y) => {
    const [ex, ey] = P(x, y), [ax, ay] = P(x + 1, y), [bx, by] = P(x, y + 1);
    const a = ax - ex, b = ay - ey, c = bx - ex, d = by - ey;
    return [a, b, c, d, ex - a * x - c * y, ey - b * x - d * y];
  };
  const m = J(cx, cy), [a, b, c, d, e, f] = m, det = a * d - b * c || 1;
  // inv: from a point on screen (plan box units) back to the floor (exact without perspective)
  const inv = (X, Y) => [(d * (X - e) - c * (Y - f)) / det, (-b * (X - e) + a * (Y - f)) / det];
  return { P, J, inv, m, dz: (h) => P(cx, cy, h)[1] - P(cx, cy)[1], s, sc, wallH, rot, tilt, si, co, lift, persp: Number.isFinite(D) };
}

/** Walls (cut low where they would block the view into a room) and furniture blocks, back to front. */
/** Furniture as a few solid pieces for 2.5D (local units around its centre; z in metres). */
export function furnModel(f, spin = 0, onTop = false) {
  const w = Math.max(10, safeNumber(f.w, 100)), h = Math.max(6, safeNumber(f.h, 60)), x0 = -w / 2, y0 = -h / 2;
  const R = (a, b, c, d, z0, z1, cls) => ({ poly: [[x0 + a, y0 + b], [x0 + c, y0 + b], [x0 + c, y0 + d], [x0 + a, y0 + d]], z0, z1, cls });
  // round shapes: smooth, with their corners kept still towards the viewer (spin), so turning the house doesn't make them twirl
  const C = (cx, cy, rx, ry, z0, z1, cls, k = 24) => ({ poly: Array.from({ length: k }, (_, i) => { const a = (i * 2 * Math.PI) / k + spin; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; }), z0, z1, cls });
  const legs = (z1, t = 4) => [[t, t], [w - 2 * t, t], [w - 2 * t, h - 2 * t], [t, h - 2 * t]].map(([a, b]) => R(a, b, a + t, b + t, 0, z1));
  const chair = (cx, cy, cw, cs, flip) => [R(cx - x0 - cw / 2, cy - y0 - cs / 2, cx - x0 + cw / 2, cy - y0 + cs / 2, 0, 0.46, 'soft'),
    flip ? R(cx - x0 - cw / 2, cy - y0 + cs / 2 - 3, cx - x0 + cw / 2, cy - y0 + cs / 2, 0.46, 0.9, 'soft') : R(cx - x0 - cw / 2, cy - y0 - cs / 2, cx - x0 + cw / 2, cy - y0 - cs / 2 + 3, 0.46, 0.9, 'soft')];
  switch (f.type) {
    case 'sofa': {
      const arm = Math.min(w * 0.12, 22), back = Math.min(h * 0.28, 24);
      return [R(arm, back, w - arm, h, 0, 0.42, 'soft'), R(0, 0, w, back, 0, 0.85, 'soft'), R(0, back, arm, h, 0, 0.62, 'soft'), R(w - arm, back, w, h, 0, 0.62, 'soft')];
    }
    case 'bed': {
      const pw = w > 120 ? (w - 30) / 2 : w - 20, ph = Math.min(30, h * 0.16);
      return [R(0, 0, w, h, 0, 0.42), R(0, 0, w, 6, 0, 0.95), R(0, h * 0.38, w, h, 0.42, 0.5, 'soft'),
        ...(w > 120 ? [R(10, 10, 10 + pw, 10 + ph, 0.42, 0.54, 'soft'), R(20 + pw, 10, 20 + 2 * pw, 10 + ph, 0.42, 0.54, 'soft')] : [R(10, 10, 10 + pw, 10 + ph, 0.42, 0.54, 'soft')])];
    }
    case 'table': {
      const cw = Math.min(34, w / 4), cs = 14, n = Math.max(1, Math.floor(w / 60)), out = [...legs(0.7), R(0, 0, w, h, 0.7, 0.76)];
      for (let i = 0; i < n; i++) { const cx = x0 + ((i + 0.5) * w) / n; out.push(...chair(cx, y0 - cs / 2 - 4, cw, cs, false), ...chair(cx, -y0 + cs / 2 + 4, cw, cs, true)); }
      return out;
    }
    case 'round': {
      const out = [C(0, 0, 5, 5, 0, 0.7), C(0, 0, w / 2, h / 2, 0.7, 0.76)];
      for (let i = 0; i < 4; i++) { const ang = (i * Math.PI) / 2 + Math.PI / 4; out.push(C(Math.cos(ang) * (w / 2 + 10), Math.sin(ang) * (h / 2 + 10), 11, 11, 0, 0.46, 'soft')); }
      return out;
    }
    case 'desk': return [...legs(0.72), R(0, 0, w, h, 0.72, 0.76), C(0, h / 2 + 18, 15, 15, 0, 0.48, 'soft')];
    case 'counter': return [R(0, 0, w, h, 0, 0.86), R(-2, -2, w + 2, h + 2, 0.86, 0.9)];
    case 'cabinet': return [R(0, 0, w, h, 0, 2), R(w / 2 - 0.5, h - 0.5, w / 2 + 0.5, h, 0.05, 1.95, 'dark')];
    case 'sink': return [...(onTop ? [] : [R(0, 0, w, h, 0, 0.86), R(-2, -2, w + 2, h + 2, 0.86, 0.9)]), R(w * 0.12, h * 0.25, w * 0.88, h * 0.88, 0.9, 0.902, 'dark'), C(0, y0 + h * 0.13, 3, 3, 0.9, 1.15, 'dark')];
    case 'hob': return [...(onTop ? [] : [R(0, 0, w, h, 0, 0.86), R(-2, -2, w + 2, h + 2, 0.86, 0.9)]), R(0, 0, w, h, 0.9, 0.912, 'dark'),
      ...[0, 1].flatMap((i) => [0, 1].map((j) => C(x0 + w * (0.28 + i * 0.44), y0 + h * (0.28 + j * 0.44), Math.min(w, h) * 0.15, Math.min(w, h) * 0.15, 0.912, 0.914, 'soft')))];
    case 'stove': return [R(0, 0, w, h, 0, 0.88), R(0, 0, w, h, 0.88, 0.9, 'dark'), ...[0, 1].flatMap((i) => [0, 1].map((j) => C(x0 + w * (0.3 + i * 0.4), y0 + h * (0.3 + j * 0.4), Math.min(w, h) * 0.12, Math.min(w, h) * 0.12, 0.9, 0.9, 'soft')))];
    case 'fridge': return [R(0, 0, w, h, 0, 1.85), R(0, h - 0.6, w, h, 1.2, 1.22, 'dark'), R(w * 0.85, h - 0.8, w * 0.88, h, 0.5, 1.1, 'dark')];
    case 'island': return [R(5, 5, w - 5, h - 5, 0, 0.88), R(0, 0, w, h, 0.88, 0.92)];
    case 'wallcab': return [R(0, 0, w, h, 1.4, 2.1), R(w / 2 - 0.5, h - 0.5, w / 2 + 0.5, h, 1.42, 2.08, 'dark')];
    case 'bath': return [R(0, 0, w, h, 0, 0.58), R(8, 8, w - 8, h - 8, 0.58, 0.58, 'dark')];
    case 'shower': return [R(0, 0, w, h, 0, 0.05), R(0, 0, w, 1.5, 0.05, 2, 'glass'), R(0, 0, 1.5, h, 0.05, 2, 'glass')];
    case 'toilet': return [R(0, 0, w, h * 0.3, 0, 0.8), C(0, y0 + h * 0.3 + (h * 0.7) / 2, w / 2 - 2, (h * 0.7) / 2, 0, 0.42, '')];
    case 'stairs': {
      const k = Math.max(3, Math.round(h / 26)), out = [];
      for (let i = 0; i < k; i++) out.push(R(0, (i * h) / k, w, ((i + 1) * h) / k, 0, (2.4 * (k - i)) / k));
      return out;
    }
    case 'tv': return [R(w * 0.35, 0, w * 0.65, h, 0, 0.45, 'dark'), R(0, h / 2 - 1.5, w, h / 2 + 1.5, 0.45, 1.15, 'dark')];
    case 'plant': return [C(0, 0, w / 4, h / 4, 0, 0.35, 'pot'), C(0, 0, w / 2, h / 2, 0.35, 0.9, 'plant')];
    default: return [R(0, 0, w, h, 0, FURN_HEIGHT[f.type] || 0.8)];
  }
}

export function raisedSVG(plan, walls, proj) {
  const { P, dz, s, sc, wallH } = proj, parts = [];
  const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  // which side of an outer wall the house is on: a wall with the rooms on the viewer's side is a back wall
  const inner = (x, y) => !!roomAt(plan.rooms, x, y);
  const openings = (plan.openings || []).map((o) => ({ ...o, x1: safeNumber(o.x1), y1: safeNumber(o.y1), x2: safeNumber(o.x2), y2: safeNumber(o.y2) }));
  for (const w of walls) {
    const hor = w.y1 === w.y2, mx = (w.x1 + w.x2) / 2, my = (w.y1 + w.y2) / 2;
    const [nx, ny] = hor ? [0, 1] : [1, 0];
    let full = false;
    if (w.kind === 'outer') {
      const sgn = inner(mx + nx * 6, my + ny * 6) ? 1 : -1;            // normal pointing into the house
      const ry = proj.si * nx * sgn + proj.co * ny * sgn;              // ... after turning: >0 = towards the viewer
      full = ry > 0.15;                                                // only walls with the rooms clearly in front of them stand; the rest is cut
    }
    const h = full ? wallH : wallH * 0.25;
    // split the wall where doors, windows and passages are
    const a0 = hor ? Math.min(w.x1, w.x2) : Math.min(w.y1, w.y2), a1 = hor ? Math.max(w.x1, w.x2) : Math.max(w.y1, w.y2);
    const cuts = openings.filter((o) => (hor ? o.y1 === o.y2 && Math.abs(o.y1 - w.y1) < 3 : o.x1 === o.x2 && Math.abs(o.x1 - w.x1) < 3))
      .map((o) => ({ o, lo: Math.max(a0, hor ? Math.min(o.x1, o.x2) : Math.min(o.y1, o.y2)), hi: Math.min(a1, hor ? Math.max(o.x1, o.x2) : Math.max(o.y1, o.y2)) }))
      .filter((c) => c.hi > c.lo).sort((p, q) => p.lo - q.lo);
    const pieces = [];
    let at = a0;
    for (const c of cuts) {
      if (c.lo > at) pieces.push({ lo: at, hi: c.lo });
      if (c.o.type === 'window') pieces.push({ lo: c.lo, hi: c.hi, win: true, ent: c.o.entity });
      else if (c.o.type === 'door' && c.o.entity) pieces.push({ lo: c.lo, hi: c.hi, door: true, ent: c.o.entity });
      at = Math.max(at, c.hi);
    }
    if (at < a1) pieces.push({ lo: at, hi: a1 });
    // short stretches, so each bit of wall is drawn at its own depth (a long wall running away from you
    // would otherwise be drawn over a cupboard standing in front of it)
    const bits = [];
    for (const pc of pieces) {
      const n = Math.max(1, Math.ceil((pc.hi - pc.lo) / 14));
      // each bit overlaps the next a little, so no thin seams show between them
      for (let i = 0; i < n; i++) bits.push({ ...pc, lo: pc.lo + ((pc.hi - pc.lo) * i) / n, hi: Math.min(pc.hi, pc.lo + ((pc.hi - pc.lo) * (i + 1)) / n + (pc.win ? 0 : 1.2)) });
    }
    for (const pc of bits) {
      const ph = pc.door ? wallH * 0.06 : h;
      const A = hor ? P(pc.lo, w.y1) : P(w.x1, pc.lo), B = hor ? P(pc.hi, w.y1) : P(w.x1, pc.hi);
      const A2 = hor ? P(pc.lo, w.y1, ph) : P(w.x1, pc.lo, ph), B2 = hor ? P(pc.hi, w.y1, ph) : P(w.x1, pc.hi, ph), key = Math.max(A[1], B[1]);
      const cls = pc.win ? 'w3 win3' : pc.door ? 'w3 door3' : `w3 ${w.kind}`;
      const ent = pc.ent ? ` data-entity="${esc(pc.ent)}"` : '';
      const top = Math.min(A2[1], B2[1]);
      parts.push({ key, wall: { hor, at: hor ? w.y1 : w.x1, lo: pc.lo, hi: pc.hi }, sb: [Math.min(A[0], B[0]) - 4, top - 4, Math.max(A[0], B[0]) + 4, key + 4], svg: `<g class="${pc.ent ? 'opening ' : ''}${cls}"${ent}><polygon class="w3face" points="${pts([A, B, B2, A2])}"/><line class="w3cap" x1="${A2[0].toFixed(1)}" y1="${A2[1].toFixed(1)}" x2="${B2[0].toFixed(1)}" y2="${B2[1].toFixed(1)}" style="stroke-width:${((w.kind === 'outer' ? 8 : 4) * s).toFixed(1)}"/></g>` });
    }
  }
  for (const f of plan.furniture || []) {
    const fh = furnHeight(f);
    if (!(fh > 0)) continue;
    const r = (safeNumber(f.rot) * Math.PI) / 180, cr = Math.cos(r), sr = Math.sin(r), fx = safeNumber(f.x), fy = safeNumber(f.y);
    const zs = fh / (FURN_HEIGHT[f.type] || fh);   // an own height stretches the whole piece
    const toP = ([x, y], z) => P(fx + x * cr - y * sr, fy + x * sr + y * cr, z * zs * sc * proj.lift);
    // a hob or sink on a worktop: just the top part, drawn right after the worktop under it
    const support = ['hob', 'sink'].includes(f.type) ? (plan.furniture || []).find((g) => g !== f && ['counter', 'island', 'sink', 'stove'].includes(g.type) && furnAt({ furniture: [g] }, fx, fy)) : null;
    const footKey = (g) => { const gr = (safeNumber(g.rot) * Math.PI) / 180, gw = safeNumber(g.w, 100) / 2, gh = safeNumber(g.h, 60) / 2; return Math.max(...[[-gw, -gh], [gw, -gh], [gw, gh], [-gw, gh]].map(([x, y]) => P(safeNumber(g.x) + x * Math.cos(gr) - y * Math.sin(gr), safeNumber(g.y) + x * Math.sin(gr) + y * Math.cos(gr))[1])); };
    const onKey = support ? footKey(support) + 0.05 : null;
    for (const pr of furnModel(f, -(r + (proj.rot * Math.PI) / 180), !!support)) {
      const base = pr.poly.map((q) => toP(q, pr.z0)), top = pr.poly.map((q) => toP(q, pr.z1));
      const n = base.length, ccx = base.reduce((acc, p) => acc + p[0], 0) / n, ccy = base.reduce((acc, p) => acc + p[1], 0) / n;
      const sides = [];
      if (pr.z1 > pr.z0) {
        for (let i = 0; i < n; i++) {
          const p = base[i], q = base[(i + 1) % n];
          let nxs = q[1] - p[1], nys = -(q[0] - p[0]);
          if (nxs * ((p[0] + q[0]) / 2 - ccx) + nys * ((p[1] + q[1]) / 2 - ccy) < 0) { nxs = -nxs; nys = -nys; }
          if (nys > 0) sides.push(`<polygon class="f3side" points="${pts([p, q, top[(i + 1) % n], top[i]])}"/>`);
        }
      }
      const allp = [...base, ...top];
      parts.push({
        key: onKey ?? Math.max(...base.map((p) => p[1])) + pr.z0 * 0.001, box: [fx, fy], ontop: !!support,
        sb: [Math.min(...allp.map((p) => p[0])), Math.min(...allp.map((p) => p[1])), Math.max(...allp.map((p) => p[0])), Math.max(...allp.map((p) => p[1]))],
        svg: `<g class="f3 ${pr.cls || ''}">${sides.join('')}<polygon class="f3top" points="${pts(top)}"/></g>`,
      });
    }
  }
  // a block against a wall: which side of that wall it stands on decides who is drawn first
  // (comparing only how far forward things are goes wrong for a desk right behind a low wall)
  const vx = proj.si, vy = proj.co;   // the direction towards the viewer, on the floor
  const walls3 = parts.filter((p) => p.wall);
  for (const b of parts.filter((p) => p.box && !p.ontop)) {
    let behind = -Infinity, front = Infinity;
    for (const w of walls3) {
      if (w.sb[0] > b.sb[2] || w.sb[2] < b.sb[0] || w.sb[1] > b.sb[3] || w.sb[3] < b.sb[1]) continue;   // not overlapping on screen
      const { hor, at } = w.wall, side = hor ? b.box[1] - at : b.box[0] - at, view = hor ? vy : vx;
      if (Math.abs(view) < 1e-3) continue;
      if (side * view > 0) behind = Math.max(behind, w.key); else front = Math.min(front, w.key);
    }
    let k = b.key;
    if (behind > -Infinity) k = Math.max(k, behind + 0.01);
    if (front < Infinity && k >= front && front - 0.01 > behind) k = front - 0.01;
    b.key = k;
  }
  parts.sort((p, q) => p.key - q.key);
  return `<g class="raised">${parts.map((p) => p.svg).join('')}</g>`;
}

/** LED strips drawn as lines (the card colours them with the lamp and lights them up when on). */
function stripsSVG(plan, proj) {
  const out = [];
  for (const it of plan.items || []) {
    const sp = stripPath(it);
    if (!sp) continue;
    let pts = sp, w = 1;
    if (proj) {
      const z = Math.min(ownHeight(it) ?? itemHeight(it, null), WALL_H - 0.05) * proj.sc * proj.lift;
      pts = sp.map(([x, y]) => proj.P(x, y, z)); w = proj.s;
    }
    const pl = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    out.push(`<g class="strip" data-strip="${esc(it.entity_id)}"><polyline class="sglow" points="${pl}" style="stroke-width:${(16 * w).toFixed(1)}"/><polyline class="score" points="${pl}" style="stroke-width:${(4 * w).toFixed(1)}"/></g>`);
  }
  return out.length ? `<g class="strips">${out.join('')}</g>` : '';
}

export function planSVG(plan, { showBackground = false, editor = false, proj = null } = {}) {
  const W = safeNumber(plan.width, 1000), H = safeNumber(plan.height, 700), out = [];
  const grid = safeNumber(plan.grid, 10) || 10;
  const walls = computeWalls(plan.rooms);
  out.push(`<svg class="plan" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`);
  out.push(`<defs><pattern id="fps-grid" width="${grid * 4}" height="${grid * 4}" patternUnits="userSpaceOnUse"><path d="M${grid * 4} 0H0V${grid * 4}" fill="none" class="gridline"/></pattern>`);
  out.push(`<pattern id="fps-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="dot"/></pattern>`);
  out.push('<pattern id="fps-plate" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="4" y="14" width="18" height="5" rx="2.5" fill="#d0d0d0" fill-opacity=".11"/><rect x="21" y="-3" width="5" height="18" rx="2.5" fill="#d0d0d0" fill-opacity=".11"/></pattern>');
  out.push('<pattern id="fps-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" fill-opacity=".3"/></pattern>');
  out.push('<filter id="fps-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter>');
  out.push('<filter id="fps-stripblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>');
  out.push('<filter id="fps-lampblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>');
  // floor textures: tiles (bathroom, toilet) and wooden planks
  out.push('<pattern id="fps-tiles" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" class="tex"/></pattern>');
  out.push('<pattern id="fps-wood" width="60" height="12" patternUnits="userSpaceOnUse"><path d="M0 12H60M30 0V12" fill="none" class="tex"/></pattern>');
  for (const room of plan.rooms) {
    out.push(`<radialGradient id="g-${safeSvgId(room.id)}" cx="50%" cy="50%" r="60%"><stop offset="0" class="g0"/><stop offset=".55" class="g1"/><stop offset="1" class="g2"/></radialGradient>`);
  }
  out.push('</defs>');
  out.push(`<rect class="bg" width="${W}" height="${H}"/>`);
  out.push(`<g class="deco d-blobs">${[[0.2, 0.15, 0.35, '#6c3cff'], [0.75, 0.9, 0.4, '#00b3ff'], [0.95, 0.2, 0.3, '#ff4fa3'], [0.45, 0.6, 0.22, '#2fd1a5']]
    .map(([x, y, r, c]) => `<circle cx="${x * W}" cy="${y * H}" r="${r * W}" fill="${c}" fill-opacity=".38" filter="url(#fps-blur)"/>`).join('')}</g>`);
  out.push(`<g class="deco d-stage">${[0.1, 0.45, 0.85].map((x, i) => `<path d="M${x * W},-20 L${x * W - 160},${H} L${x * W + 160},${H} Z" fill="${i === 1 ? '#ff7a00' : '#e10600'}" fill-opacity=".08" filter="url(#fps-blur)"/>`).join('')}</g>`);
  out.push(`<rect class="deco d-grid" width="${W}" height="${H}" fill="url(#fps-grid)"/><rect class="deco d-dots" width="${W}" height="${H}" fill="url(#fps-dots)"/><rect class="deco d-plate" width="${W}" height="${H}" fill="url(#fps-plate)"/>`);
  if (showBackground && safeImageData(plan.background?.url)) {
    const b = plan.background;
    out.push(`<image href="${safeImageData(b.url)}" x="${safeNumber(b.x)}" y="${safeNumber(b.y)}" width="${safeNumber(b.w, W) || W}" height="${safeNumber(b.h, H) || H}" opacity="${safeNumber(b.opacity, 0.5)}" preserveAspectRatio="none"/>`);
  }
  // 2.5D: floors, textures and room glow drawn as their exact (turned, tilted, perspective) shapes
  if (proj) {
    out.push(groundSVG(plan, proj, editor));
    out.push(raisedSVG(plan, walls, proj));
    if (!editor) out.push(stripsSVG(plan, proj));
    if (!editor) out.push('<g class="stalks"></g>');   // thin lines from the floor up to raised icons (card fills it)
    out.push(`<rect class="deco d-scan" width="${W}" height="${H}" fill="url(#fps-scan)" style="pointer-events:none"/></svg>`);
    return out.join('');
  }
  for (const room of plan.rooms) {
    for (const q of room.rects.map(norm)) {
      out.push(`<rect class="floor" data-room="${esc(room.id)}" x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}"/>`);
    }
  }
  for (const room of plan.rooms) {
    if (!['tiles', 'wood'].includes(room.floor)) continue;
    for (const q of room.rects.map(norm)) out.push(`<rect class="floortex" x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}" fill="url(#fps-${room.floor})"/>`);
  }
  for (const room of plan.rooms) {
    const [x0, y0, x1, y1] = roomBBox(room);
    const ref = safeSvgId(room.id);
    // glow layer: one gradient over the room's bounding box, clipped to its rects
    out.push(`<clipPath id="c-${ref}">${room.rects.map(norm).map((q) => `<rect x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}"/>`).join('')}</clipPath>`);
    out.push(`<rect class="glow" data-room="${esc(room.id)}" id="glow-${ref}" clip-path="url(#c-${ref})" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#g-${ref})"/>`);
  }
  if (!editor) {
    out.push(`<clipPath id="c-all">${plan.rooms.flatMap((r) => r.rects.map(norm)).map((q) => `<rect x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}"/>`).join('')}</clipPath>`);
    // a soft pool of light around every lamp that is on (the card fills this in)
    out.push('<g class="lampglows" clip-path="url(#c-all)"><g filter="url(#fps-lampblur)"></g></g>');
  }
  if (!editor && plan.background) {
    // live vacuum map, lined up with the background it was traced from (shown by the card while cleaning)
    const b = plan.background;
    out.push(`<image class="livemap" clip-path="url(#c-all)" x="${safeNumber(b.x)}" y="${safeNumber(b.y)}" width="${safeNumber(b.w, W) || W}" height="${safeNumber(b.h, H) || H}" preserveAspectRatio="none"/>`);
  }
  if (!editor) out.push('<polyline class="vactrail" points=""/>');
  // furniture and stairs: light outlines, under the walls (in 2.5D only the flat ones; the rest become blocks)
  const flatFurn = (plan.furniture || []).filter((f) => !proj || !(furnHeight(f) > 0));
  const onTopLast = (a, b) => (['hob', 'sink'].includes(a.type) ? 1 : 0) - (['hob', 'sink'].includes(b.type) ? 1 : 0);
  if (flatFurn.length) out.push(`<g class="furniture">${[...flatFurn].sort(onTopLast).map((f) => furnSVG(f)).join('')}</g>`);
  // mmWave radars: range circle, distance ring or dots per person (filled in by the card)
  if (!editor) out.push('<g class="radars"></g>');
  out.push('<g class="walls">');
  for (const w of walls) out.push(`<line class="wall ${w.kind}" x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}"/>`);
  out.push('</g>');
  for (const o of plan.openings || []) {
    const x1 = safeNumber(o.x1), y1 = safeNumber(o.y1), x2 = safeNumber(o.x2), y2 = safeNumber(o.y2);
    const h = y1 === y2;
    // a door or window can follow a sensor: open = orange and dashed on the plan (the card toggles .isopen)
    const ent = (o.type === 'door' || o.type === 'window') && typeof o.entity === 'string' ? o.entity : '';
    out.push(`<g class="opening t-${o.type === 'window' ? 'window' : o.type === 'door' ? 'door' : 'open'}"${ent ? ` data-entity="${esc(ent)}"` : ''}>`);
    out.push(`<line class="gap" data-opening="${esc(o.id)}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    if (o.type === 'door') {
      for (const [x, y] of [[x1, y1], [x2, y2]]) {
        out.push(h ? `<line class="jamb" x1="${x}" y1="${y - 7}" x2="${x}" y2="${y + 7}"/>` : `<line class="jamb" x1="${x - 7}" y1="${y}" x2="${x + 7}" y2="${y}"/>`);
      }
    } else if (o.type === 'window') {
      // glass: two thin lines in the wall
      for (const d of [-2.2, 2.2]) out.push(h ? `<line class="win" x1="${x1}" y1="${y1 + d}" x2="${x2}" y2="${y2 + d}"/>` : `<line class="win" x1="${x1 + d}" y1="${y1}" x2="${x2 + d}" y2="${y2}"/>`);
    } else {
      out.push(`<line class="open-edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    }
    if (ent) out.push(`<line class="openmark" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    out.push('</g>');
  }
  // HUD corner brackets (only visible in the high-tech theme)
  out.push('<g class="deco d-brk">');
  for (const room of plan.rooms) {
    const [x0, y0, x1, y1] = roomBBox(room), q = Math.min(14, (x1 - x0) / 5, (y1 - y0) / 5), p = 6;
    for (const [px, py, sx, sy] of [[x0 + p, y0 + p, 1, 1], [x1 - p, y0 + p, -1, 1], [x0 + p, y1 - p, 1, -1], [x1 - p, y1 - p, -1, -1]]) {
      out.push(`<path class="bracket" d="M${px},${py + sy * q} V${py} H${px + sx * q}"/>`);
    }
  }
  out.push('</g>');
  if (!editor) out.push(stripsSVG(plan, null));
  const cmp = settingsOf(plan).compass;
  if (!editor && cmp !== null && cmp !== '' && cmp !== undefined && !isNaN(+cmp)) {
    // an empty spot (no rooms, no icons), searched from the bottom-right corner
    const free = (x0, y0) => !plan.rooms.some((r) => r.rects.map(norm).some((q) => q[0] < x0 + 64 && q[2] > x0 && q[1] < y0 + 74 && q[3] > y0))
      && !(plan.items || []).some((it) => it.x > x0 - 18 && it.x < x0 + 82 && it.y > y0 - 18 && it.y < y0 + 92);
    let spot = null;
    for (let y = H - 80; y >= 0 && !spot; y -= 10) for (let x = W - 70; x >= 0 && !spot; x -= 10) if (free(x, y)) spot = [x, y];
    const [fx, fy] = spot || [0, 0];
    const cx = fx + 32, cy = fy + 30;
    if (spot) out.push(`<g class="compass" transform="translate(${cx},${cy})"><circle r="17"/><g transform="rotate(${+cmp})"><path d="M0,-12 L5,5 L0,2 L-5,5 Z"/></g><text y="32" text-anchor="middle">N</text></g>`);
  }
  out.push(`<rect class="deco d-scan" width="${W}" height="${H}" fill="url(#fps-scan)" style="pointer-events:none"/>`);
  out.push('</svg>');
  return out.join('');
}

export const PLAN_CSS = `
  svg.plan { width: 100%; height: 100%; display: block; }
  .bg { fill: var(--fps-bg); }
  .gridline { stroke: var(--fps-accent); stroke-opacity: .07; stroke-width: 1; }
  .dot { fill: #fff; fill-opacity: .05; }
  .floor { fill: var(--fps-floor); }
  .w3face { fill: color-mix(in srgb, var(--fps-wall) 38%, var(--fps-bg)); stroke: color-mix(in srgb, var(--fps-wall) 38%, var(--fps-bg)); stroke-width: .5; }
  .w3.inner .w3face { fill: color-mix(in srgb, var(--fps-wall-inner) 30%, var(--fps-bg)); }
  .w3cap { stroke: var(--fps-wall); stroke-linecap: square; }
  .w3.inner .w3cap { stroke: var(--fps-wall-inner); }
  .w3.win3 .w3face { fill: rgba(120, 190, 255, .28); stroke: none; }
  .w3.win3 .w3cap { stroke: rgba(160, 210, 255, .9); stroke-width: 2 !important; }
  .w3.door3 .w3face { fill: var(--fps-door, #888); fill-opacity: .4; }
  .w3.door3 .w3cap { stroke: var(--fps-door, #888); stroke-width: 2 !important; }
  .opening.isopen .w3face { fill: rgba(255, 159, 28, .45); stroke: #ff9f1c; } .opening.isopen .w3cap { stroke: #ff9f1c; }
  .raised { pointer-events: none; filter: var(--fps-wall-glow); }
  .f3side { fill: color-mix(in srgb, var(--fps-muted) 30%, var(--fps-bg)); stroke: var(--fps-muted); stroke-opacity: .5; stroke-width: .8; }
  .f3top { fill: color-mix(in srgb, var(--fps-muted) 18%, var(--fps-floor)); stroke: var(--fps-muted); stroke-opacity: .6; stroke-width: .8; }
  .f3 .furn { fill: none; stroke-opacity: .5; }
  .f3.soft .f3top { fill: color-mix(in srgb, var(--fps-muted) 26%, var(--fps-floor)); } .f3.soft .f3side { fill: color-mix(in srgb, var(--fps-muted) 36%, var(--fps-bg)); }
  .f3.dark .f3top, .f3.dark .f3side { fill: color-mix(in srgb, var(--fps-bg) 80%, #000); }
  .f3.glass .f3top, .f3.glass .f3side { fill: rgba(160, 210, 255, .12); stroke: rgba(170, 215, 255, .6); }
  .f3.plant .f3top { fill: rgba(70, 160, 90, .75); stroke: rgba(120, 200, 130, .7); } .f3.plant .f3side { fill: rgba(50, 120, 70, .75); stroke: rgba(120, 200, 130, .5); }
  .f3.pot .f3top, .f3.pot .f3side { fill: rgba(160, 100, 70, .7); }
  .stalks line { stroke: var(--fps-fg); stroke-opacity: .35; stroke-width: 1.2; stroke-dasharray: 2 3; pointer-events: none; }
  .stalks ellipse { fill: var(--fps-fg); fill-opacity: .3; pointer-events: none; }
  .stalks .cord { stroke: var(--fps-fg); stroke-opacity: .55; stroke-width: 1.4; stroke-dasharray: none; }
  .stalks .rose { fill: var(--fps-wall); fill-opacity: 1; stroke: var(--fps-fg); stroke-opacity: .6; stroke-width: 1.2; }
  .stalks .on .rose { stroke: var(--fps-accent); stroke-opacity: .9; }
  .strip polyline { fill: none; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
  .strip .sglow { stroke: rgb(var(--c, var(--fps-accent-rgb))); opacity: 0; filter: url(#fps-stripblur); transition: opacity .3s; }
  .strip.on .sglow { opacity: calc(.75 * var(--b, 1) * var(--fps-glow, 1)); }
  .strip .score { stroke: var(--fps-off, #6b7280); opacity: .85; transition: stroke .3s; }
  .strip.on .score { stroke: rgb(var(--c, var(--fps-accent-rgb))); opacity: 1; }
  .stalks .cone { display: none; pointer-events: none; } .stalks .on .cone { display: inline; }
  .stalks .c0 { stop-color: rgb(var(--c, var(--fps-accent-rgb))); stop-opacity: calc(.32 * var(--b, 1) * var(--fps-glow, 1)); } .stalks .c1 { stop-color: rgb(var(--c, var(--fps-accent-rgb))); stop-opacity: 0; }
  .furn { fill: var(--fps-fg); fill-opacity: .035; stroke: var(--fps-muted); stroke-opacity: .55; stroke-width: 1.4; stroke-linejoin: round; pointer-events: none; }
  .furn .soft { stroke-opacity: .35; } .furn .hang { stroke-dasharray: 4 3; } .furn .arrow { fill: none; stroke-linecap: round; }
  .radar-range { fill: rgba(var(--fps-accent-rgb), .045); stroke: rgba(var(--fps-accent-rgb), .4); stroke-width: 1.3; stroke-dasharray: 5 6; pointer-events: none; }
  .radar-ring { fill: none; stroke: rgb(var(--fps-accent-rgb)); stroke-width: 3.5; stroke-opacity: .7; pointer-events: none; transition: r .8s ease; animation: fpsRing 2.2s ease-in-out infinite; }
  .radar-dot { fill: rgb(var(--fps-accent-rgb)); stroke: var(--fps-bg); stroke-width: 3; pointer-events: none; transition: cx .6s ease, cy .6s ease; filter: drop-shadow(0 0 6px rgba(var(--fps-accent-rgb), .9)); }
  @keyframes fpsRing { 0%, 100% { stroke-opacity: .75; } 50% { stroke-opacity: .35; } }
  .radar-label { fill: var(--fps-fg); font-size: 13px; font-weight: 600; paint-order: stroke; stroke: var(--fps-bg); stroke-width: 3px; pointer-events: none; }
  @media (prefers-reduced-motion: reduce) { .radar-ring { animation: none; } }
  .glow { opacity: 0; transition: opacity .8s ease; pointer-events: none; }
  .glow.on { opacity: var(--fps-glow, 1); }
  .g0 { stop-color: rgb(var(--glow, var(--fps-accent-rgb))); stop-opacity: .42; }
  .g1 { stop-color: rgb(var(--glow, var(--fps-accent-rgb))); stop-opacity: .14; }
  .g2 { stop-color: rgb(var(--glow, var(--fps-accent-rgb))); stop-opacity: 0; }
  .wall { stroke: var(--fps-wall); stroke-linecap: square; }
  .wall.outer { stroke-width: 8; }
  .wall.inner { stroke-width: 4; stroke: var(--fps-wall-inner); }
  .walls { filter: var(--fps-wall-glow); }
  .gap { stroke: var(--fps-floor); stroke-width: 10; stroke-linecap: butt; }
  .jamb { stroke: var(--fps-door); stroke-width: 2.5; }
  .win { stroke: var(--fps-wall); stroke-width: 1.4; opacity: .9; }
  .openmark { stroke: #ff9f1c; stroke-width: 5; stroke-dasharray: 6 5; stroke-linecap: round; opacity: 0; transition: opacity .3s; }
  .opening.isopen .openmark { opacity: 1; animation: fpsOpen 1.6s ease-in-out infinite; }
  .opening.isopen .jamb, .opening.isopen .win { stroke: #ff9f1c; }
  @keyframes fpsOpen { 50% { opacity: .45; } }
  .open-edge { stroke: var(--fps-wall); stroke-opacity: .25; stroke-width: 1; stroke-dasharray: 3 5; }
  .bracket { fill: none; stroke: var(--fps-accent); stroke-opacity: .55; stroke-width: 1.4; }
  .deco { display: none; pointer-events: none; }
  .t-warm .d-dots,
  .t-hightech .d-grid, .t-blueprint .d-grid, .t-terminal .d-grid, .t-sun .d-grid,
  .t-hightech .d-brk, .t-blueprint .d-brk, .t-terminal .d-brk,
  .t-hightech .d-scan, .t-terminal .d-scan,
  .t-rock .d-plate, .t-rock .d-stage, .t-glass .d-blobs { display: inline; }
  .t-blueprint .gridline { stroke: #ffffff; stroke-opacity: .12; }
  .t-sun .gridline { stroke: #8a929c; stroke-opacity: .14; }
  .t-rock .wall.outer { stroke-width: 9; }
  .floor { transition: fill 1s ease; }
  .floor.warn { animation: fpsWarn 2.4s ease-in-out infinite; }
  @keyframes fpsWarn { 0%, 100% { fill: rgba(255, 159, 28, .30); } 50% { fill: rgba(255, 159, 28, .08); } }
  .floor.alarm { animation: fpsAlarm 1s steps(2, jump-none) infinite; stroke: #ff2d2d; stroke-width: 4; }
  @keyframes fpsAlarm { 0% { fill: rgba(255, 45, 45, .55); } 100% { fill: rgba(255, 45, 45, .12); } }
  .livemap { display: none; pointer-events: none; }
  .tex { stroke: var(--fps-wall); stroke-opacity: .13; stroke-width: 1; }
  .floortex { pointer-events: none; }
  .lampglows > g { opacity: var(--fps-lampglow, .26); }
  .lampglows circle { transition: opacity .6s; }
  .compass { pointer-events: none; }
  .compass circle { fill: none; stroke: var(--fps-wall); stroke-opacity: .45; stroke-width: 1.5; }
  .compass path { fill: var(--fps-wall); fill-opacity: .5; }
  .compass text { fill: var(--fps-wall); fill-opacity: .6; font-size: 11px; letter-spacing: 3px; font-family: var(--fps-font); }
  .livemap.on { display: inline; }
  .vactrail { fill: none; stroke: var(--fps-device); stroke-width: 3; stroke-opacity: .55; stroke-dasharray: 1 7; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
`;

export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function safeImageData(value) {
  return typeof value === 'string' && /^data:image\/(?:png|jpeg);base64,[a-z\d+/]+={0,2}$/i.test(value) ? value : '';
}

export function safeSvgId(value) {
  return Array.from(String(value ?? ''), (c) => c.codePointAt(0).toString(16)).join('_') || 'room';
}

/* ------------------------------------------------------------ data api */
let plansCache = null;
// plans changed somewhere else (another screen, an AI assistant, the place_device action): reload the cards
let plansSub = null;
const ownSaves = new Set();
function watchPlans(hass) {
  if (plansSub || !hass?.connection?.subscribeMessage) return;
  plansSub = hass.connection.subscribeMessage((ev) => {
    if (ev?.updated != null && ownSaves.has(ev.updated)) return;   // our own save: already shown
    plansCache = null;
    window.__fpsPlansRev = (window.__fpsPlansRev || 0) + 1;
    window.dispatchEvent(new CustomEvent('fps-plans-changed', { detail: null }));
  }, { type: 'floorplan_studio/subscribe' }).catch(() => { plansSub = null; });
}
export async function loadPlans(hass, force = false) {
  watchPlans(hass);
  if (!plansCache || force) {
    plansCache = hass.connection.sendMessagePromise({ type: 'floorplan_studio/plans' }).then((r) => r.plans).catch((e) => { plansCache = null; throw e; });
  }
  return plansCache;
}
export async function savePlan(hass, plan) {
  const r = await hass.connection.sendMessagePromise({ type: 'floorplan_studio/plan/save', plan });
  if (r.plan?.updated != null) { ownSaves.add(r.plan.updated); if (ownSaves.size > 20) ownSaves.delete(ownSaves.values().next().value); }
  plansCache = null;
  window.__fpsPlansRev = (window.__fpsPlansRev || 0) + 1;   // cards that are not on screen now catch up when they come back
  window.dispatchEvent(new CustomEvent('fps-plans-changed', { detail: r.plan }));
  return r.plan;
}
export async function loadUsage(hass, days) {
  return hass.connection.sendMessagePromise({ type: 'floorplan_studio/usage', days });
}
export function fire(node, type, detail) {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}
