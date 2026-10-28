// Floorplan Studio – shared helpers for the card and the editor panel.

export const VERSION = '1.4.0b88';

/* ------------------------------------------------------------------ i18n */
const STR = {
  en: {
    simple: 'Simple', all: 'All', none_mode: 'None', parcel: 'Parcel at the door', walk_tour: 'Tour through your home', move: 'Move icons', done: 'Done', back: 'Back', overview: 'Overview', zoom_reset: 'Whole plan', by_room: 'Room by room', whole_plan: 'Whole plan', rooms: 'Rooms', energy_now: 'Energy now', right_now: 'Right now', outside: 'outside', n_on: '{n} on', h_solar: 'Solar now', h_grid: 'From the grid', h_return: 'To the grid', h_price: 'Electricity price',
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
    simple: 'Eenvoudig', all: 'Alles', none_mode: 'Geen', parcel: 'Pakket bij de deur', walk_tour: 'Rondleiding door je huis', move: 'Iconen verplaatsen', done: 'Klaar', back: 'Terug', overview: 'Overzicht', zoom_reset: 'Hele plattegrond', by_room: 'Per ruimte', whole_plan: 'Hele plattegrond', rooms: 'Kamers', energy_now: 'Energie nu', right_now: 'Nu logisch', outside: 'buiten', n_on: '{n} aan', h_solar: 'Zon nu', h_grid: 'Van het net', h_return: 'Naar het net', h_price: 'Stroomprijs',
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
  // your own wall colour (step 5): the walls on the plan, in 2.5D and in the walk
  if (/^#[0-9a-f]{6}$/i.test(s.wall_color || '')) { vars['--fps-wall'] = s.wall_color; vars['--fps-wall-inner'] = s.wall_color; }
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

/** One step warmer (dir 1) or cooler (-1) for a thermostat or air conditioner, within what the device itself allows
 *  (its own min / max and step); the data for climate.set_temperature, or null when it can't go further. */
export function climateTarget(st, dir) {
  const a = st?.attributes || {}, step = +a.target_temp_step > 0 ? +a.target_temp_step : 0.5;
  const lo = Number.isFinite(+a.min_temp) && a.min_temp != null ? +a.min_temp : 7, hi = Number.isFinite(+a.max_temp) && a.max_temp != null ? +a.max_temp : 35;
  const go = (v) => Math.min(hi, Math.max(lo, +(Math.round((+v + dir * step) / step) * step).toFixed(2)));
  if (a.temperature != null && Number.isFinite(+a.temperature)) { const v = go(a.temperature); return v === +a.temperature ? null : { temperature: v }; }
  if (a.target_temp_low != null && a.target_temp_high != null) {
    const l = go(a.target_temp_low), h = go(a.target_temp_high);
    if (h - l < step || (l === +a.target_temp_low && h === +a.target_temp_high)) return null;
    return { target_temp_low: l, target_temp_high: h };
  }
  return null;
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
  coffee: { icon: 'mdi:table-furniture', w: 110, h: 60 },
  radiator: { icon: 'mdi:radiator', w: 80, h: 10 },
  speakerbox: { icon: 'mdi:speaker', w: 22, h: 26 },
  videowall: { icon: 'mdi:monitor-multiple', w: 280, h: 8 },
  dishwasher: { icon: 'mdi:dishwasher', w: 42, h: 42 },
  washer: { icon: 'mdi:washing-machine', w: 42, h: 42 },
  dryer: { icon: 'mdi:tumble-dryer', w: 42, h: 42 },
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
  mirror: { icon: 'mdi:mirror', w: 60, h: 4 },
  model: { icon: 'mdi:cube-outline', w: 70, h: 70 },   // your own 3D model (.glb / .obj, uploaded in the editor)
};
/**
 * Where the chairs of a table go: f.chairs (or as many as fit), on the long sides and, when the number is odd
 * or there are many, at the ends. Returns [{cx, cy, side}] in the table's own frame (centre 0,0; side = 'n','s','w','e').
 */
export function tableChairs(f) {
  const w = Math.max(10, safeNumber(f.w, 100)), h = Math.max(6, safeNumber(f.h, 60));
  const fit = Math.max(1, Math.floor(w / 60));
  const n = f.chairs != null && f.chairs !== '' && Number.isFinite(+f.chairs) ? Math.max(0, Math.min(20, Math.round(+f.chairs))) : fit * 2;
  const ends = n >= 8 && n % 2 === 0 && n / 2 > fit + 1 ? 2 : n % 2, side = (n - ends) / 2, out = [];
  for (let i = 0; i < side; i++) { const cx = -w / 2 + ((i + 0.5) * w) / side; out.push({ cx, cy: -h / 2, side: 'n' }, { cx, cy: h / 2, side: 's' }); }
  if (ends >= 1) out.push({ cx: w / 2, cy: 0, side: 'e' });
  if (ends >= 2) out.push({ cx: -w / 2, cy: 0, side: 'w' });
  return out;
}
/**
 * A corner sofa (f.shape 'left' or 'right': which side the long leg is on, seen from the front): the parts
 * in the sofa's own frame (0..w, 0..h, back at the top) as [x0, y0, x1, y1, kind] with kind back/seat/arm.
 * A straight sofa gives null.
 */
export function sofaParts(f) {
  if (f?.type !== 'sofa' || !['left', 'right'].includes(f.shape)) return null;
  const w = Math.max(10, safeNumber(f.w, 100)), h = Math.max(6, safeNumber(f.h, 60));
  const back = Math.min(24, w * 0.12, h * 0.18), arm = Math.min(22, w * 0.1), dm = Math.min(Math.max(h * 0.42, 40), h - 10, w * 0.6);
  const parts = [[0, 0, w, back, 'back'], [0, back, back, h, 'back'], [back, back, w - arm, dm, 'seat'], [back, dm, dm, h - arm, 'seat'], [w - arm, back, w, dm, 'arm'], [back, h - arm, dm, h, 'arm']];
  return f.shape === 'right' ? parts.map(([a, b2, c, d, k]) => [w - c, b2, w - a, d, k]) : parts;
}
/** Chairs around a round table: f.chairs (default 4), evenly round (angles). */
export const roundChairs = (f) => { const n = f.chairs != null && f.chairs !== '' && Number.isFinite(+f.chairs) ? Math.max(0, Math.min(16, Math.round(+f.chairs))) : 4; return Array.from({ length: n }, (_, i) => (i * 2 * Math.PI) / Math.max(1, n) + Math.PI / 4); };

/** One piece of furniture as SVG: f = {id, type, x, y (centre), w, h, rot (degrees)}. */
export function furnSVG(f, extra = '') {
  const w = Math.max(10, safeNumber(f.w, 100)), h = Math.max(6, safeNumber(f.h, 60)), x = -w / 2, y = -h / 2;
  const R = (a, b, c, d, r = 0, cls = '') => `<rect${cls ? ` class="${cls}"` : ''} x="${a}" y="${b}" width="${c}" height="${d}" rx="${r}"/>`;
  const L = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  let body = '';
  switch (f.type) {
    case 'sofa': {
      const sp = sofaParts(f);
      if (sp) {
        // a corner sofa: its L outline, the backs and the seat cushions
        const dmx = f.shape === 'right' ? sp[3][0] : sp[3][2], dm = sp[2][3];
        const pts = f.shape === 'right' ? [[0, 0], [w, 0], [w, h], [dmx, h], [dmx, dm], [0, dm]] : [[0, 0], [w, 0], [w, dm], [dmx, dm], [dmx, h], [0, h]];
        body = `<polygon points="${pts.map(([a, b2]) => `${(x + a).toFixed(1)},${(y + b2).toFixed(1)}`).join(' ')}"/>` + sp.filter((q) => q[4] !== 'seat').map(([a, b2, c, d]) => R(x + a, y + b2, c - a, d - b2, 4)).join('');
        break;
      }
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
      const list = tableChairs(f), side = list.filter((c) => c.side === 'n').length || 1, cw = Math.min(34, w / side - 6, 40), cs = 14, ew = Math.min(cw, h - 8);
      const chairs = list.map((c) => (c.side === 'n' ? R(c.cx - cw / 2, y - cs - 4, cw, cs, 4, 'soft') : c.side === 's' ? R(c.cx - cw / 2, y + h + 4, cw, cs, 4, 'soft')
        : c.side === 'e' ? R(x + w + 4, -ew / 2, cs, ew, 4, 'soft') : R(x - cs - 4, -ew / 2, cs, ew, 4, 'soft')));
      body = chairs.join('') + R(x, y, w, h, 6);
      break;
    }
    case 'dishwasher': case 'washer': case 'dryer':   // an appliance: a square, a round door for a washer or dryer
      body = R(x, y, w, h, 3) + (f.type === 'dishwasher' ? R(x + w * 0.15, y + h - 6, w * 0.7, 3, 1, 'soft') : `<circle class="soft" cx="0" cy="${(y + h * 0.55).toFixed(1)}" r="${(Math.min(w, h) * 0.3).toFixed(1)}"/>`);
      break;
    case 'videowall': {   // a camera wall: a long panel with a row of screens seen from above
      const k = Math.max(2, Math.round(w / 40));
      body = R(x, y, w, h, 2) + Array.from({ length: k }, (_, i) => R(x + (i * w) / k + 2, y + 1, w / k - 4, h - 2, 1, 'soft')).join('');
      break;
    }
    case 'speakerbox':   // a speaker box: the cabinet, with its woofer seen from above as a ring at the front
      body = R(x, y, w, h, 3) + `<circle class="soft" cx="0" cy="${(y + h * 0.62).toFixed(1)}" r="${(Math.min(w, h) * 0.28).toFixed(1)}"/>`;
      break;
    case 'radiator': {   // a radiator against the wall: a long narrow panel with fins
      const k = Math.max(2, Math.round(w / 9));
      body = R(x, y, w, h, 2) + Array.from({ length: k - 1 }, (_, i) => L(x + ((i + 1) * w) / k, y + 1, x + ((i + 1) * w) / k, y + h - 1)).join('');
      break;
    }
    case 'coffee':   // a low coffee table: a rounded top with a shelf line, no chairs
      body = R(x, y, w, h, Math.min(w, h) * 0.18) + `<rect class="soft" x="${x + w * 0.12}" y="${y + h * 0.2}" width="${w * 0.76}" height="${h * 0.6}" rx="${Math.min(w, h) * 0.1}" fill-opacity=".35"/>`;
      break;
    case 'round':
      body = roundChairs(f).map((a) => { return `<circle class="soft" cx="${Math.cos(a) * (w / 2 + 10)}" cy="${Math.sin(a) * (h / 2 + 10)}" r="11"/>`; }).join('') + `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}"/>`;
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
    case 'mirror':
      body = R(x, y, w, h, 1) + L(x + w * 0.2, y + h, x + w * 0.35, y);
      break;
    case 'parcel':
      // a parcel by the front door: a cardboard box with its tape
      body = R(x, y, w, h, 1.5, 'pkg') + L(x + w / 2, y, x + w / 2, y + h);
      break;
    case 'dev3dprinter': case 'dev3dprinterbig': case 'devprinter':
      // a (3D) printer you placed as a device: its body seen from above, with the build plate / paper tray
      body = R(x, y, w, h, 3) + R(x + w * 0.16, y + h * 0.16, w * 0.68, h * 0.68, 1.5, 'soft') + L(x + w * 0.2, y + h - 1.5, x + w * 0.8, y + h - 1.5);
      break;
    case 'model':
      // your own 3D model: a dashed box with a cube in it (the model itself shows in the walk)
      body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" stroke-dasharray="5 3"/>` + `<path d="M${-w * 0.18},${-h * 0.08} L0,${-h * 0.2} L${w * 0.18},${-h * 0.08} L${w * 0.18},${h * 0.14} L0,${h * 0.26} L${-w * 0.18},${h * 0.14} Z M${-w * 0.18},${-h * 0.08} L0,${h * 0.04} L${w * 0.18},${-h * 0.08} M0,${h * 0.04} L0,${h * 0.26}" fill="none"/>`;
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
/** A room's floor in one colour of your own (step 2: Floor → one colour): '#rrggbb', or null. */
export const floorColor = (room) => (room?.floor === 'color' && /^#[0-9a-f]{6}$/i.test(room.floor_color || '') ? room.floor_color : null);

/** Every user-adjustable setting with its default (stored per floorplan in plan.settings). */
export const DEFAULT_SETTINGS = {
  parcels: true,            // a parcel delivered today (PostNL, DHL, Mail and Packages…) shows as a box by the front door
  parcel_entities: [],      // your own parcel sensors (empty = found automatically)
  parcel_door: '',          // the front door (opening id; empty = found automatically)
  theme: 'warm',            // default theme of the card
  default_mode: 'all',      // simple | all | none (no icons)
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
  wall_color: '',           // walls in your own colour (#rrggbb), '' = the theme's; a room can have its own (room.wall_color, walk)
  walk_fov: 100,            // walk: how wide you see, in degrees across (Ctrl + scroll wheel changes it for the moment)
  walk_start: '',           // room the tour starts in (at its door); '' = at the front door
  walk_drag_invert: false,  // walk: dragging left/right turns the other way (you drag the room instead of your view)
  walk_edit: true,          // admins may edit (devices, furniture, windows, doors) inside the walk-through
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
    const fc = floorColor(room);
    if (fc) { for (const q of room.rects.map(norm)) out.push(`<polygon class="floortex" style="fill:${fc};fill-opacity:.6" points="${poly(q)}"/>`); continue; }
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
export const FURN_HEIGHT = { mirror: 1.9, model: 1, parcel: 0.3, dev3dprinter: 0.46, dev3dprinterbig: 0.6, devprinter: 0.3, dishwasher: 0.85, washer: 0.85, dryer: 0.85, videowall: 2.3, speakerbox: 1.0, radiator: 0.65, coffee: 0.42, hob: 0.9, sink: 0.9, stove: 0.9, fridge: 1.85, island: 0.92, wallcab: 2.1, sofa: 0.85, bed: 0.95, table: 0.9, round: 0.76, desk: 0.76, counter: 0.9, cabinet: 2, bath: 0.58, shower: 2, toilet: 0.8, stairs: 2.4, tv: 1.15, plant: 0.9 };
const LIFT = 1;   // real proportions; setting height_25d: 'real' or a percentage of that
/** A piece of furniture's height in metres: its own (set in the editor) or the usual one for its kind. */
export const furnHeight = (f) => (['videowall', 'mirror'].includes(f?.type) ? videoWallSpan(f)[1] : tvOnWall(f) ? tvScreen(f)[1] : f.z != null && f.z !== '' && Number.isFinite(+f.z) ? Math.max(0, +f.z) : (FURN_HEIGHT[f.type] || 0));
/** A TV hung on the wall (instead of on its stand or a cabinet). */
export const tvOnWall = (f) => f?.type === 'tv' && f.mount === 'wall';
/**
 * Where a TV's screen is, bottom and top in metres. On the wall: from its own height (elev, the bottom
 * of the screen, default 1 m), 16:9 to its width. On a stand: the usual screen, stretched with its height.
 */
export function tvScreen(f, S = 70, plan = null) {
  if (tvOnWall(f)) {
    const b = Number.isFinite(+f.elev) && f.elev !== '' && f.elev != null ? +f.elev : 1.0;
    const hs = Math.max(0.3, Math.min(1.4, (Math.max(10, safeNumber(f.w, 100)) / (S || 70)) * 0.5625));
    return [b, b + hs];
  }
  const zs = (f.z != null && f.z !== '' && Number.isFinite(+f.z) ? Math.max(0, +f.z) : 1.15) / 1.15, base = tvBase(plan, f);
  // on a cupboard or TV furniture: no stand, just the screen on little feet
  if (base > 0) return [base + 0.05, base + 0.05 + 0.66 * zs];
  return [base + 0.47 * zs, base + 1.13 * zs];
}
/** A TV on its stand that stands on a cabinet or table: the top of that furniture (else 0, the floor). */
export function tvBase(plan, f) {
  if (Number.isFinite(f?.base)) return f.base;   // a device body standing on furniture (deviceFurniture)
  if (!plan || f?.type !== 'tv' || tvOnWall(f)) return 0;
  const g = (plan.furniture || []).find((x) => x !== f && x.type !== 'tv' && furnAt({ furniture: [x] }, safeNumber(f.x), safeNumber(f.y)) && furnHeight(x) > 0.2 && furnHeight(x) < 1.6);
  return g ? furnHeight(g) : 0;
}
/** A height given to a TV that is linked to TV furniture goes to that furniture: it then hangs on the wall at that height. */
export function setLinkedTvHeight(plan, hass, it, h) {
  const f = tvLinks(plan, hass).get(it.entity_id);
  if (!f) return false;
  if (h == null) { delete f.mount; delete f.elev; } else { f.mount = 'wall'; f.elev = Math.round(h * 100) / 100; delete f.z; }
  delete it.height;
  return true;
}
/** A camera wall: from its bottom (f.elev, default 0.8 m) to its top (f.top, default 2.3 m). */
export function videoWallSpan(f) {
  // a camera wall or a mirror on the wall: bottom and top (f.elev / f.top) in metres
  const mir = f?.type === 'mirror';
  const b = Number.isFinite(+f.elev) && f.elev !== '' && f.elev != null ? Math.max(0, +f.elev) : mir ? 0.9 : 0.8;
  const t = Number.isFinite(+f.top) && f.top !== '' && f.top != null ? +f.top : mir ? 1.9 : 2.3;
  return [b, Math.max(b + (mir ? 0.15 : 0.3), Math.min(3.2, t))];
}
const ON_WALL_SPAN = ['videowall', 'mirror'];
/**
 * The cameras on a camera wall: f.cams = list of camera entities, or (empty) every camera that shows a picture
 * (no weather radar or vacuum maps), sorted by area and name.
 */
// a camera's second, lighter stream (ONVIF SubStream / Profile_1, Reolink fluent, ...): quicker and smoother to show
const LOWRES_RE = /sub ?stream|substream|profile_?1\b|\blow\b|fluent|\bsd\b|\blq\b|klein|mobile|_sub\b/i;
const isLow = (hass, id) => LOWRES_RE.test(`${id} ${hass?.states[id]?.attributes?.friendly_name || ''}`);
/** The picture a device shows (its image entity: a hologram fan's current clip, a printer's preview...), or null. */
export function deviceImage(hass, id) {
  const dev = hass?.entities?.[id]?.device_id;
  if (!dev) return null;
  const imgs = Object.values(hass.entities).filter((e) => e.device_id === dev && e.entity_id.startsWith('image.') && hass.states[e.entity_id] && !e.hidden);
  return (imgs.find((e) => /shown|current|now|playing|preview|cover/i.test(e.entity_id)) || imgs[0])?.entity_id || null;
}
/** The other entities of a device, by domain and a name pattern (first match). */
export function deviceSibling(hass, id, domain, re) {
  const dev = hass?.entities?.[id]?.device_id;
  if (!dev) return null;
  return Object.values(hass.entities).find((e) => e.device_id === dev && e.entity_id.startsWith(`${domain}.`) && re.test(e.entity_id) && hass.states[e.entity_id] && !['unavailable'].includes(hass.states[e.entity_id].state))?.entity_id || null;
}
/** The light stream of a camera (its sibling on the same device), or the camera itself. */
export function camLowRes(hass, id) {
  const dev = hass?.entities?.[id]?.device_id;
  if (!dev || isLow(hass, id)) return id;
  const low = Object.values(hass.entities).find((e) => e.device_id === dev && e.entity_id !== id && e.entity_id.startsWith('camera.') && hass.states[e.entity_id] && hass.states[e.entity_id].state !== 'unavailable' && isLow(hass, e.entity_id));
  return low ? low.entity_id : id;
}
/** A still of the camera, small (Home Assistant scales it to this width), from its light stream. */
export function camPic(hass, id, width = 480) {
  const pic = hass?.states[camLowRes(hass, id)]?.attributes?.entity_picture;
  return pic ? `${pic}${pic.includes('?') ? '&' : '?'}width=${width}` : null;
}
/** The live picture (MJPEG) of the camera's light stream. */
export function camStream(hass, id) {
  const pic = hass?.states[camLowRes(hass, id)]?.attributes?.entity_picture;
  return pic && pic.includes('/api/camera_proxy/') ? pic.replace('/api/camera_proxy/', '/api/camera_proxy_stream/') : null;
}
export function videoWallCams(f, hass) {
  const all = Object.keys(hass?.states || {}).filter((id) => id.startsWith('camera.') && !/buienradar|radar|_map\b|\bmap\b|roborock|vacuum|valetudo|xiaomi_cloud_map/i.test(id) && hass.states[id].state !== 'unavailable' && !hass.entities?.[id]?.hidden);
  if (Array.isArray(f.cams) && f.cams.length) return f.cams.filter((id) => hass?.states[id]);
  const area = (id) => hass.areas?.[entityArea(hass, id)]?.name || '~';
  // one screen per camera: its main and sub stream are the same camera (the screen shows the light one)
  const seen = new Set();
  const one = all.sort((a, b) => Number(isLow(hass, a)) - Number(isLow(hass, b))).filter((id) => { const dv = hass.entities?.[id]?.device_id; if (!dv) return true; if (seen.has(dv)) return false; seen.add(dv); return true; });
  return one.sort((a, b) => area(a).localeCompare(area(b)) || friendly(hass, a).localeCompare(friendly(hass, b)));
}
/** How much a piece of furniture is stretched upwards by its own height (a TV on the wall: not at all). */
export const furnStretch = (f) => (tvOnWall(f) || ['videowall', 'mirror'].includes(f?.type) ? 1 : furnHeight(f) / (FURN_HEIGHT[f.type] || furnHeight(f) || 1));
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
/** The top of a standing strip or a frame (it.strip_dir 'up' / 'frame'), in metres; the bottom is its height. */
export const stripTop = (it) => (Number.isFinite(+it?.top) && it.top !== '' && it.top != null ? Math.min(+it.top, WALL_H) : Math.min((ownHeight(it) ?? 1) + 0.6, WALL_H));
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
 * A curtain or blind that hangs at a window: the window, its style and how far it is closed (0 = open, 1 = closed).
 * Linked in the editor (step 4), or found automatically: a cover that is a curtain/blind (or is called that) near a window.
 * style: 'split' (two panels meeting in the middle), 'left' / 'right' (one panel), 'roller' (from the top down).
 */
const CURTAIN_RE = /gordijn|curtain|rolluik|rolgordijn|blind|jaloezie|vitrage|shade|shutter|screen/i;
const SCREEN_RE = /beamer|projector|projectie|projection|leinwand/i;
/** How far a projection screen is rolled down (0 = up, 1 = down): open = down, unless you set it the other way (it.screen_open = 'up'). */
export function screenDown(it, st) {
  const pos = +st?.attributes?.current_position;
  let down = Number.isFinite(pos) ? pos / 100 : st?.state === 'open' || st?.state === 'opening' ? 1 : 0;
  if (it?.screen_open === 'up') down = 1 - down;
  return Math.max(0, Math.min(1, down));
}
export const isScreenLabel = (t) => SCREEN_RE.test(t || '');
export function curtainFor(plan, it, st) {
  if (it.curtain === false) return null;
  const d = it.entity_id.split('.')[0], dc = st?.attributes?.device_class;
  const set = it.curtain && typeof it.curtain === 'object' ? it.curtain : null;
  if (!set) {
    if (d !== 'cover') return null;
    const label = `${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`;
    if (!(['curtain', 'blind', 'shade', 'shutter'].includes(dc) || CURTAIN_RE.test(label))) return null;
    if (SCREEN_RE.test(label)) return null;   // a projection screen is not a curtain
  }
  const wins = (plan.openings || []).filter((o) => o.type === 'window');
  let o = set?.window && set.window !== 'auto' ? wins.find((w) => w.id === set.window) : null;
  if (!o) {
    const x = safeNumber(it.x), y = safeNumber(it.y), lim = 2.2 * (planScale(plan) || 70), own = roomAt(plan.rooms, x, y);
    let bd = Infinity;
    for (const w of wins) {
      const ax = safeNumber(w.x1), ay = safeNumber(w.y1), bx = safeNumber(w.x2), by = safeNumber(w.y2), L2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1;
      // only a window of its own room (a cover in the room next door is not this window's curtain)
      if (own) { const L = Math.sqrt(L2), nx = -(by - ay) / L, ny = (bx - ax) / L, mx = (ax + bx) / 2, my = (ay + by) / 2; if (![roomAt(plan.rooms, mx + nx * 8, my + ny * 8), roomAt(plan.rooms, mx - nx * 8, my - ny * 8)].includes(own)) continue; }
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L2)), dd = Math.hypot(x - (ax + (bx - ax) * t), y - (ay + (by - ay) * t));
      if (dd < bd) { bd = dd; o = w; }
    }
    if (bd > lim) o = null;
  }
  if (!o) return null;
  const style = set?.style || (['blind', 'shade', 'shutter'].includes(dc) ? 'roller' : 'split');
  const pos = st?.attributes?.current_position;
  const closed = pos != null && Number.isFinite(+pos) ? 1 - +pos / 100 : st?.state === 'closed' ? 1 : st?.state === 'closing' ? 0.8 : st?.state === 'opening' ? 0.2 : 0;
  // how far down it hangs: to the floor, to the windowsill, or your own height (metres)
  const b = set?.bottom, bottom = b === 'sill' ? 0.88 : Number.isFinite(+b) && b !== '' && b != null ? Math.max(0, +b) : 0.03;
  return { o, style, closed: Math.max(0, Math.min(1, closed)), bottom };
}
/**
 * The pieces of a curtain to draw, in plan units along the window: [{a0, a1}] (from the window's first end),
 * plus the window's direction u, the way into the room n, and its length L. Open curtains stay bunched at the sides.
 */
export function curtainPanels(plan, it, info, c) {
  const o = info.o, ax = safeNumber(o.x1), ay = safeNumber(o.y1), bx = safeNumber(o.x2), by = safeNumber(o.y2);
  const L = Math.hypot(bx - ax, by - ay) || 1, u = [(bx - ax) / L, (by - ay) / L];
  let n = [-u[1], u[0]];
  const mx = (ax + bx) / 2, my = (ay + by) / 2, sx = safeNumber(it.x) - mx, sy = safeNumber(it.y) - my;
  if (Math.abs(sx * n[0] + sy * n[1]) > 2) { if (sx * n[0] + sy * n[1] < 0) n = [-n[0], -n[1]]; }
  else if (!roomAt(plan.rooms, mx + n[0] * 8, my + n[1] * 8)) n = [-n[0], -n[1]];
  const bunch = 0.12 * (planScale(plan) || 70);
  let panels;
  if (info.style === 'roller') panels = [{ a0: 0, a1: L }];
  else if (info.style === 'left') panels = [{ a0: 0, a1: Math.max(bunch, c * L) }];
  else if (info.style === 'right') panels = [{ a0: L - Math.max(bunch, c * L), a1: L }];
  else panels = [{ a0: 0, a1: Math.max(bunch, (c * L) / 2) }, { a0: L - Math.max(bunch, (c * L) / 2), a1: L }];
  return { panels, a: [ax, ay], u, n, L };
}

/* -------------------------------------------- devices recognised automatically */
/** An air conditioner (a climate entity that can cool or dry, or is called airco): a unit high on the wall. */
const AC_RE = /airco|aircon|air ?con|split ?unit|\bac\b|klimaat ?unit/i;
export function isAircon(it, st) {
  if (it.entity_id.split('.')[0] !== 'climate' || it.aircon === false) return false;
  if (it.aircon === true) return true;
  const modes = st?.attributes?.hvac_modes || [];
  return modes.includes('cool') || modes.includes('dry') || AC_RE.test(`${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`);
}
/** What an air conditioner is doing now: 'cool', 'heat', 'dry', 'fan' or null (off/idle). */
export function airconMode(st) {
  if (!st || ['off', 'unavailable', 'unknown'].includes(st.state)) return null;
  const a = st.attributes?.hvac_action;
  if (a === 'cooling' || (!a && st.state === 'cool')) return 'cool';
  if (a === 'heating' || (!a && st.state === 'heat')) return 'heat';
  if (a === 'drying' || st.state === 'dry') return 'dry';
  if (a === 'fan' || st.state === 'fan_only') return 'fan';
  if (a === 'idle') return null;
  return st.state === 'heat_cool' || st.state === 'auto' ? 'fan' : null;
}
/**
 * A TV (media player that is a TV) standing on a TV you drew in step 3: that piece of furniture is the TV,
 * so no separate icon is needed. Per TV furniture only the nearest TV entity takes it over.
 */
const TV_RE = /\btv\b|televisie|television|bravia|oled|qled/i;
export function tvLinks(plan, hass) {
  const out = new Map(), S = planScale(plan) || 70, best = new Map();
  for (const it of plan.items || []) {
    if (it.entity_id.split('.')[0] !== 'media_player' || it.tvlink === false) continue;
    const st = hass?.states[it.entity_id];
    if (!(st?.attributes?.device_class === 'tv' || TV_RE.test(`${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`))) continue;
    let f = typeof it.tvlink === 'string' ? (plan.furniture || []).find((x) => x.id === it.tvlink) : null, d = 0;
    if (!f) {
      let bd = Infinity;
      for (const x of plan.furniture || []) { if (x.type !== 'tv') continue; const dd = Math.hypot(safeNumber(x.x) - safeNumber(it.x), safeNumber(x.y) - safeNumber(it.y)); if (dd < bd) { bd = dd; f = x; } }
      if (!f || bd > 2.0 * S) continue;
      d = bd;
    }
    const cur = best.get(f.id);
    if (!cur || d < cur.d) best.set(f.id, { it, d });
  }
  for (const [fid, { it }] of best) out.set(it.entity_id, (plan.furniture || []).find((x) => x.id === fid));
  // more entities of the same TV (a Chromecast with Google TV shows up as cast + Android TV remote, a Sony as
  // Bravia + cast + DLNA...): the same device, the same device name, or a TV-like player close to that TV
  // furniture - those are that TV too, so they get no icon of their own
  out.secondary = new Set();
  const devOf = (id) => { const e = hass?.entities?.[id]; return e?.device_id ? hass?.devices?.[e.device_id] : null; };
  const dname = (dv) => (dv ? `${dv.name_by_user || dv.name || ''}`.trim().toLowerCase() : '');
  const linked = [...out.entries()].map(([id, f]) => ({ f, dev: devOf(id), name: dname(devOf(id)) }));
  for (const it of plan.items || []) {
    const id = it.entity_id;
    if (out.has(id) || id.split('.')[0] !== 'media_player' || it.tvlink === false) continue;
    const dv = devOf(id), nm = dname(dv), st = hass?.states[id];
    let f = linked.find((l) => (dv && l.dev && dv.id === l.dev.id) || (nm && nm === l.name))?.f;
    if (!f && (st?.attributes?.device_class === 'tv' || TV_RE.test(`${id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`))) {
      let bd = 2.0 * S;
      for (const l of linked) { const dd = Math.hypot(safeNumber(l.f.x) - safeNumber(it.x), safeNumber(l.f.y) - safeNumber(it.y)); if (dd < bd) { bd = dd; f = l.f; } }
    }
    if (f) { out.set(id, f); out.secondary.add(id); }
  }
  return out;
}
/**
 * What kind of media player it is, from its device (manufacturer, model) and name: 'tv', 'mini' (Nest Mini,
 * Echo Dot), 'speaker' (Nest Audio, Google Home, Sonos), 'hub' (Nest Hub, Echo Show), 'soundbar', 'player'
 * (Chromecast, Shield, Kodi box), 'voice' (small voice satellite), 'group' (a speaker group, no device) or null.
 */
export function mediaKind(it, hass) {
  if (it.entity_id.split('.')[0] !== 'media_player') return null;
  if (it.media) return it.media;
  const st = hass?.states[it.entity_id], ent = hass?.entities?.[it.entity_id], dev = ent?.device_id ? hass?.devices?.[ent.device_id] : null;
  const t = `${dev?.manufacturer || ''} ${dev?.model || ''} ${dev?.name || ''} ${it.name || ''} ${st?.attributes?.friendly_name || ''} ${it.entity_id}`;
  if (st?.attributes?.device_class === 'tv' || /bravia|\btv\b|televisie|television|oled|qled/i.test(t) && !/chromecast|cast group/i.test(t)) return 'tv';
  if (/cast group|speaker group|groep|\bgroup\b/i.test(t)) return 'group';
  if (/nest mini|home mini|echo dot|homepod mini|\bpuck\b/i.test(t)) return 'mini';
  if (/nest hub|echo show|home hub|smart display|\bhub\b/i.test(t)) return 'hub';
  if (/soundbar|sonos (beam|arc|ray)|playbar/i.test(t)) return 'soundbar';
  if (/atom echo|satellite|m5stack|voice ?pe|respeaker/i.test(t)) return 'voice';
  if (/nest audio|google home|homepod|\becho\b|sonos|speaker|luidspreker|audio/i.test(t)) return 'speaker';
  if (/chromecast|shield|apple ?tv|fire ?tv|android ?tv|google ?tv|kodi|mediabox|tv ?box/i.test(t)) return 'player';
  // what Home Assistant itself says it is
  const dc = st?.attributes?.device_class;
  if (dc === 'speaker') return 'speaker';
  if (dc === 'receiver') return 'player';
  return null;
}
/**
 * What a device physically is, recognised from its domain, device class, name and make, so the walk
 * (and the heights in 2.5D) can show it as the thing it is: 'vacuum', 'camera', 'lock', 'radiator'
 * (radiator valve), 'thermostat', 'ceiling_fan', 'fan', 'purifier', 'plug', 'motion' or null.
 * it.device_kind overrides it ('none' = just the icon).
 */
const TRV_RE = /\btrv\b|radiator|radiateur|thermostatic|thermostaatknop|thermostaatkraan|eurotronic|danfoss ally|popp|tado.*(valve|radiator)|smart radiator/i;
const PURIFIER_RE = /purifier|luchtreiniger|luchtzuiveraar|air ?purif|starkvind|levoit|dyson pure|philips air|humidifier|luchtbevochtiger|ontvochtiger|dehumidifier/i;
const CEILFAN_RE = /plafond ?ventilator|ceiling ?fan|plafondfan/i;
const PLUG_RE = /plug|stekker|stopcontact|outlet|socket|\bwcd\b|tasmota|shelly ?plug|blitzwolf|nous a1/i;
/**
 * Things in the house recognised from their name and make, whatever kind of entity is on the plan (a switch,
 * a plug, a light, a sensor): '3dprinter', 'holofan' (hologram fan), 'tree' (Christmas tree), 'hood'
 * (cooker hood), 'kettle', 'coffee', 'dishwasher', 'washer', 'dryer', 'powerstrip', 'inverter', 'nas',
 * 'router', 'printer', 'screen' (projection screen), 'thermo' (thermometer display), 'doorbell', 'syncbox'.
 */
const APPLIANCES = [
  ['fingerbot', /fingerbot|switchbot ?bot|button ?pusher|knopdrukker/i],
  ['irhub', /harmony|broadlink|ir ?blaster|ir.?hub|ir.?receiver|ir.?remote|smart ?ir\b|universal ?remote|sensibo/i],
  ['alarmhub', /homebase|home ?base|alarm ?hub|base ?station|ajax ?hub|ring ?alarm|t80[13]0/i],
  ['3dprinter', /bambu|prusa|creality|elegoo|anycubic|voron|(x1c|x1e|p1s|p1p|a1 ?mini|h2d)|3d.?print/i],
  ['holofan', /holoscope|hologram|pov.?fan|p56/i],
  ['tree', /kerstboom|christmas ?tree|xmas ?tree|weihnachtsbaum/i],
  ['syncbox', /sync ?box|hdmi ?sync|ambilight ?box|hue ?sync/i],   // only when there is no TV drawn to light (then it is that TV's ambilight)
  ['hood', /afzuigkap|dampkap|cooker ?hood|range ?hood|extractor ?hood|dunstabzug/i],
  ['kettle', /waterkoker|kettle|wasserkocher/i],
  ['coffee', /koffie|coffee|espresso|senseo|nespresso|dolce ?gusto|kaffee/i],
  ['dishwasher', /vaatwasser|afwasmachine|dishwasher|sp[üu]lmaschine/i],
  ['washer', /wasmachine|washing ?machine|washer|waschmaschine/i],
  ['dryer', /(?<!filament )droger|dryer|wasdroger|trockner/i],
  ['powerstrip', /stekkerdoos|stekkerblok|power ?strip|socket ?strip|steckdosenleiste/i],
  ['inverter', /omvormer|inverter|goodwe|growatt|solaredge|enphase|solis|wechselrichter/i],
  ['nas', /synology|diskstation|nas|qnap|truenas|unraid/i],
  ['router', /router|archer|fritz ?box|unifi|access ?point|mesh ?wifi/i],
  ['printer', /brother|epson|canon|laserjet|officejet|mfc|printer|drucker/i],
  ['doorbell', /deurbel|doorbell|t8210|klingel/i],
  ['pixeldisplay', /ipixel|pixoo|divoom|led ?matrix|matrix ?display|pixel ?display|ulanzi|awtrix/i],
];
/**
 * Radiators you drew, linked to what controls them: a radiator thermostat (TRV) on the plan close by in the
 * same room, or else the radiator thermostat / heating zone (Tado, Netatmo, Eurotronic, Danfoss, Aqara, Fritz!DECT,
 * Homematic, Wiser...) in that room's area in Home Assistant. Returns {byFurn: Map(id → entity_id), byEntity: Map(entity_id → [furniture])}.
 * f.climate on the radiator picks one yourself ('' / false = none).
 */
const TRV_PLATFORMS = ['tado', 'tado_x', 'netatmo', 'evohome', 'eq3btsmart', 'fritzbox', 'homematicip_cloud', 'homematic', 'wiser', 'hive', 'drayton_wiser', 'bosch_shc', 'plugwise', 'nest'];
const TRV_MAKE_RE = /tado|eurotronic|spirit|danfoss|\bally\b|popp|eq-?3|fritz.?dect ?30|hm-cc-rt|etrv|netatmo.*valve|aqara.*(e1|trv)|sonoff.*trv|bosch.*radiator|shelly.*trv|wiser.*radiator|hive.*trv|moes|\btrv\b|radiator|thermostatic/i;
export function isRadiatorValve(hass, id) {
  const st = hass?.states[id], e = hass?.entities?.[id], dev = e?.device_id ? hass?.devices?.[e.device_id] : null;
  if (!st || id.split('.')[0] !== 'climate' || isAircon({ entity_id: id }, st)) return false;
  return TRV_PLATFORMS.includes(e?.platform) || TRV_MAKE_RE.test(`${id} ${st.attributes?.friendly_name || ''} ${dev?.manufacturer || ''} ${dev?.model || ''} ${dev?.name || ''}`);
}
export function radiatorLinks(plan, hass) {
  const byFurn = new Map(), byEntity = new Map(), S = planScale(plan) || 70;
  for (const f of plan.furniture || []) {
    if (f.type !== 'radiator') continue;
    let id = null;
    if (f.climate === '' || f.climate === false) continue;
    if (typeof f.climate === 'string' && hass?.states[f.climate]) id = f.climate;
    const room = roomAt(plan.rooms, safeNumber(f.x), safeNumber(f.y));
    if (!id) {
      let bd = 2.0 * S;
      for (const it of plan.items || []) {
        if (!isRadiatorValve(hass, it.entity_id) || roomAt(plan.rooms, safeNumber(it.x), safeNumber(it.y)) !== room) continue;
        const dd = Math.hypot(safeNumber(it.x) - safeNumber(f.x), safeNumber(it.y) - safeNumber(f.y));
        if (dd < bd) { bd = dd; id = it.entity_id; }
      }
    }
    if (!id && room?.area_id) {
      const cl = areaEntities(hass, room.area_id, ['climate']);
      // a radiator valve or heating zone of this room, else the room's own thermostat (it heats the radiators via the boiler)
      id = cl.find((x) => isRadiatorValve(hass, x)) || cl.find((x) => !isAircon({ entity_id: x }, hass.states[x]) && (hass.states[x]?.attributes?.hvac_modes || []).includes('heat')) || null;
    }
    if (!id) continue;
    byFurn.set(f.id, id);
    if (!byEntity.has(id)) byEntity.set(id, []);
    byEntity.get(id).push(f);
  }
  return { byFurn, byEntity };
}
/**
 * A light inside or on speaker boxes ("TV Boxen", "LED box rechts"): the speaker boxes you drew within 2 m that it
 * lights (one when the name says left/right, else all of them close by), or [].
 */
const BOXLIGHT_RE = /\bbox(en|es)?\b|speaker|luidspreker|lautsprecher/i;
/** The furniture other lights were linked to by hand (step 4 "Belongs to", or from the furniture). */
function linkedFurniture(plan, self) {
  const out = new Set();
  for (const i of plan.items || []) { if (i === self || i.entity_id === self?.entity_id || !i.link || i.link === 'none') continue; for (const id of Array.isArray(i.link) ? i.link : [i.link]) out.add(id); }
  return out;
}
export function speakerBoxes(plan, it, st) {
  if (it.entity_id.split('.')[0] !== 'light' || stripPath(it) || it.boxlight === false) return [];
  // linked by hand (step 4: "Belongs to")
  if (it.link) { const ids = Array.isArray(it.link) ? it.link : [it.link]; return (plan.furniture || []).filter((x) => ids.includes(x.id) && x.type === 'speakerbox'); }   // one or more boxes
  const label = `${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`;
  if (/sync|hdmi|hue ?sync|ambilight/i.test(label)) return [];
  if (!(it.boxlight || BOXLIGHT_RE.test(label) || /speaker/.test(it.icon || st?.attributes?.icon || ''))) return [];
  const x = safeNumber(it.x), y = safeNumber(it.y), lim = 2.0 * (planScale(plan) || 70), room = roomAt(plan.rooms, x, y);
  const claimed = linkedFurniture(plan, it);   // boxes another light was linked to by hand are that light's
  const near = (plan.furniture || []).filter((f) => f.type === 'speakerbox' && !claimed.has(f.id) && (!room || roomAt(plan.rooms, safeNumber(f.x), safeNumber(f.y)) === room)).map((f) => [f, Math.hypot(safeNumber(f.x) - x, safeNumber(f.y) - y)]).filter(([, d]) => d < lim).sort((a, b) => a[1] - b[1]);
  if (!near.length) return [];
  return /links|rechts|left|right|\b[lr]\b/i.test(label) ? [near[0][0]] : near.map(([f]) => f);
}
/**
 * What an appliance you drew (dishwasher, washer, dryer) is linked to: f.entity, or else the best match in its room's
 * area (then anywhere) by name: a status or power sensor first, a switch last. Returns an entity id or null.
 */
const APPLIANCE_RE = { dishwasher: /vaatwasser|afwasmachine|dishwasher|sp[üu]lmaschine/i, washer: /(?<!af)wasmachine|washing ?machine|\bwasher\b|waschmaschine/i, dryer: /(?<!filament[ _])droger|\bdryer\b|wasdroger|trockner/i };
// the side features of a machine (child lock, remote start, firmware...): never the one that tells whether it runs
const APP_SIDE_RE = /child|kinder|lock|slot|remote|firmware|update|wrinkle|kreuk|bubble|detergent|zeep|temp|humid|calibrat|signal|rssi|battery|batterij|countdown|indicator|outage|energy|energie|saved|amps|volt|current/i;
/** The entity that tells whether a dishwasher / washer / dryer you drew is running: f.entity, or the best match (its room first). */
// the automatic choice only changes when entities come or go: remembered per entity list (cards redraw many times a second)
const APP_CACHE = new WeakMap();
export function applianceEntity(plan, f, hass) {
  if (f.entity === '' || f.entity === false) return null;
  if (f.entity && hass?.states[f.entity]) return f.entity;
  const re = APPLIANCE_RE[f.type];
  if (!re || !hass) return null;
  const ck = hass.entities || hass.states, key = `${f.type}|${Math.round(safeNumber(f.x))}|${Math.round(safeNumber(f.y))}|${plan.rooms?.length}`;
  let memo = APP_CACHE.get(ck);
  if (!memo) { memo = new Map(); APP_CACHE.set(ck, memo); }
  if (!memo.has(key)) memo.set(key, applianceFind(plan, f, hass, re));
  return memo.get(key);
}
function applianceFind(plan, f, hass, re) {
  const room = roomAt(plan.rooms, safeNumber(f.x), safeNumber(f.y));
  const score = (id) => {
    const st = hass.states[id], d = id.split('.')[0], dc = st?.attributes?.device_class, u = st?.attributes?.unit_of_measurement;
    const label = `${id} ${st?.attributes?.friendly_name || ''}`;
    if (!re.test(label) || APP_SIDE_RE.test(label) || dc === 'timestamp') return 0;
    const main = /status|state|toestand|running|actief|bezig|programm?a?|cycle/i.test(label);
    if (d === 'binary_sensor') return main ? 6 : 4;
    if (d === 'sensor' && (dc === 'enum' || isNaN(parseFloat(st.state)))) return main ? 6 : 2;
    if (d === 'sensor' && (dc === 'power' || /^k?W$/.test(u || ''))) return 3;
    if (d === 'switch' || d === 'input_boolean') return 1;
    return 0;
  };
  const ids = Object.keys(hass.states).filter((id) => score(id) > 0);
  const inRoom = room?.area_id ? ids.filter((id) => entityArea(hass, id) === room.area_id) : [];
  return [...(inRoom.length ? inRoom : ids)].sort((a, b) => score(b) - score(a))[0] || null;
}
/** The devices on the plan a drawn dishwasher / washer / dryer stands for (its linked entity, and its plug or sensors by name in the same room): they get no icon of their own. */
const ABS_CACHE = new WeakMap();
export function applianceAbsorbs(plan, hass) {
  const sig = (plan.furniture || []).filter((f) => APPLIANCE_RE[f.type]).map((f) => `${f.type}${f.x},${f.y},${f.entity}`).join('|') + `#${plan.items?.length}`;
  if (sig.startsWith('#')) return new Set();   // no appliances drawn
  const ck = hass?.entities || hass?.states || plan, hit = ABS_CACHE.get(ck);
  if (hit && hit.sig === sig) return hit.out;
  const out = new Set();
  ABS_CACHE.set(ck, { sig, out });
  for (const f of plan.furniture || []) {
    const re = APPLIANCE_RE[f.type];
    if (!re) continue;
    const id = applianceEntity(plan, f, hass);
    if (id) out.add(id);
    const room = roomAt(plan.rooms, safeNumber(f.x), safeNumber(f.y));
    for (const it of plan.items || []) {
      if (out.has(it.entity_id) || stripPath(it)) continue;
      if (re.test(`${it.entity_id} ${it.name || ''} ${hass?.states[it.entity_id]?.attributes?.friendly_name || ''}`) && roomAt(plan.rooms, safeNumber(it.x), safeNumber(it.y)) === room) out.add(it.entity_id);
    }
  }
  return out;
}
/** Is that appliance running? on/off: on; power (W/kW): above f.on_w (default 8 W); a text status: running, washing, bezig... */
export function applianceRunning(hass, f, id) {
  const st = hass?.states[id];
  if (!st || ['unavailable', 'unknown'].includes(st.state)) return false;
  const d = id.split('.')[0], u = st.attributes?.unit_of_measurement, v = parseFloat(st.state);
  if (['binary_sensor', 'switch', 'input_boolean'].includes(d)) return st.state === 'on';
  if (!isNaN(v) && /^k?W$/.test(u || '')) return v * (u === 'kW' ? 1000 : 1) > (Number.isFinite(+f.on_w) ? +f.on_w : 8);
  return /run|wash|dry|rins|spin|clean|bezig|aan\b|draait|wassen|drogen|spoel|centrifug|active|actief|on\b/i.test(st.state) && !/idle|off|standby|uit|klaar|done|finished|end/i.test(st.state);
}
/** Is a radiator thermostat / heating zone heating right now? */
export const isHeating = (st) => !!st && (st.attributes?.hvac_action === 'heating' || (st.attributes?.hvac_action == null && st.state === 'heat' && +st.attributes?.current_temperature < +st.attributes?.temperature));
/**
 * A light behind a TV (ambilight, a WLED strip called "TV"): the TV furniture it lights, or null.
 * Only when it is not drawn as its own line and stands within 2 m of a TV you drew (it.ambilight: false = never).
 */
const AMBI_RE = /\btv\b|ambilight|ambi|achter ?(de )?tv|tv ?back|bias ?light|hyperion|hyperhdr|sync ?box|hdmi ?sync|hue ?sync|gradient ?lightstrip/i;
export function ambilightTv(plan, it, st) {
  if (it.ambilight === false || it.entity_id.split('.')[0] !== 'light' || stripPath(it)) return null;
  if (it.link) { const ids = Array.isArray(it.link) ? it.link : [it.link]; return (plan.furniture || []).find((x) => ids.includes(x.id) && x.type === 'tv') || null; }
  const label = `${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`;
  if (!(it.ambilight === true || it.ambilight || (AMBI_RE.test(label) && !BOXLIGHT_RE.test(label)))) return null;
  if (typeof it.ambilight === 'string') return (plan.furniture || []).find((f) => f.id === it.ambilight) || null;
  const x = safeNumber(it.x), y = safeNumber(it.y), room = roomAt(plan.rooms, x, y);
  let best = null, bd = 2.0 * (planScale(plan) || 70);
  const claimed = linkedFurniture(plan, it);
  for (const f of plan.furniture || []) { if (f.type !== 'tv' || claimed.has(f.id) || (room && roomAt(plan.rooms, safeNumber(f.x), safeNumber(f.y)) !== room)) continue; const dd = Math.hypot(safeNumber(f.x) - x, safeNumber(f.y) - y); if (dd < bd) { bd = dd; best = f; } }
  return best;
}
export function applianceKind(it, st, hass) {
  if (it.device_kind) return it.device_kind === 'none' ? null : APPLIANCES.some(([k]) => k === it.device_kind) || ['screen', 'thermo'].includes(it.device_kind) ? it.device_kind : null;
  const d = it.entity_id.split('.')[0], a = st?.attributes || {};
  const ent = hass?.entities?.[it.entity_id], dev = ent?.device_id ? hass?.devices?.[ent.device_id] : null;
  const t = `${it.entity_id} ${it.name || ''} ${a.friendly_name || ''} ${dev?.manufacturer || ''} ${dev?.model || ''} ${dev?.name_by_user || dev?.name || ''}`;
  if (d === 'cover' && SCREEN_RE.test(t)) return 'screen';
  // a temperature/humidity device: the sensor itself, or a setting switch of it (e.g. "show smiley") that ended up on the plan
  if (d === 'sensor' && ['temperature', 'humidity'].includes(a.device_class) && !/koker|kettle|boiler|cpu|nvme|printer|bed|nozzle/i.test(t)) return 'thermo';
  if (d === 'switch' && /smiley|display|indicator|backlight|lcd|comfort/i.test(t) && ent?.device_id && Object.values(hass?.entities || {}).some((e) => e.device_id === ent.device_id && hass.states[e.entity_id]?.attributes?.device_class === 'temperature')) return 'thermo';
  if (['camera', 'binary_sensor', 'sensor', 'update', 'button'].includes(d) && !/doorbell|deurbel/i.test(t)) { const k = APPLIANCES.find(([k2, re]) => re.test(t) && ['3dprinter', 'printer', 'nas', 'router'].includes(k2)); return d === 'camera' ? null : k ? k[0] : null; }
  return APPLIANCES.find(([, re]) => re.test(t))?.[0] || null;
}
export function deviceKind(it, st, hass) {
  if (it.device_kind) return it.device_kind === 'none' ? null : it.device_kind;
  const d = it.entity_id.split('.')[0], a = st?.attributes || {};
  if (it.kind === 'lamp' || d === 'light') return null;
  const ak = applianceKind(it, st, hass);
  if (ak) return ak;
  const ent = hass?.entities?.[it.entity_id], dev = ent?.device_id ? hass?.devices?.[ent.device_id] : null;
  const t = `${it.entity_id} ${it.name || ''} ${a.friendly_name || ''} ${dev?.manufacturer || ''} ${dev?.model || ''} ${dev?.name || ''}`;
  if (d === 'vacuum' || d === 'lawn_mower') return d === 'vacuum' ? 'vacuum' : null;
  if (d === 'camera') return 'camera';
  if (d === 'lock') return 'lock';
  if (d === 'climate') {
    if (isAircon(it, st)) return null;
    return TRV_RE.test(t) ? 'radiator' : 'thermostat';
  }
  if (d === 'humidifier') return 'purifier';
  if (d === 'fan') return PURIFIER_RE.test(t) ? 'purifier' : CEILFAN_RE.test(t) ? 'ceiling_fan' : 'fan';
  if (d === 'switch' && (a.device_class === 'outlet' || PLUG_RE.test(t))) return 'plug';
  // what Home Assistant says it is (device class): smoke / gas / CO detector on the ceiling, a water leak sensor on the floor
  if (d === 'binary_sensor' && ['smoke', 'gas', 'carbon_monoxide'].includes(a.device_class)) return 'smoke';
  if (d === 'binary_sensor' && a.device_class === 'moisture') return 'leak';
  if (d === 'siren') return 'siren';
  if (d === 'alarm_control_panel') return 'alarmhub';
  if (d === 'remote') return 'irhub';
  // a bed sensor (pressure strip under the mattress): whether the bed is taken, not movement in the room
  if (d === 'binary_sensor' && ['occupancy', 'presence', 'pressure', 'motion'].includes(a.device_class) && /\bbed\b|bed[_ -]?(bezet|occup|sensor|presence)|\bfsr\b|matras|mattress/i.test(t)) return 'bedsensor';
  if (d === 'binary_sensor' && ['motion', 'occupancy', 'presence'].includes(a.device_class)) return 'motion';
  return null;
}
/** Where such a device usually is, in metres above the floor (when you did not give it a height). */
const KIND_H = { vacuum: 0.05, camera: 2.3, lock: 1.05, radiator: 0.45, thermostat: 1.5, ceiling_fan: 2.3, fan: 0.95, purifier: 0.55, plug: 0.3, motion: 2.3,
  '3dprinter': 0.25, holofan: 1.7, tree: 0.9, syncbox: 0.03, hood: 1.75, kettle: 0.12, coffee: 0.18, dishwasher: 0.42, washer: 0.43, dryer: 0.43, powerstrip: 0.03,
  inverter: 1.4, nas: 0.1, router: 0.04, printer: 0.15, screen: 2.45, thermo: 1.5, doorbell: 1.35, pixeldisplay: 1.6,
  fingerbot: 1.1, irhub: 0.03, alarmhub: 0.05, siren: 2.3, bedsensor: 0.5, smoke: 2.55, leak: 0.02 };
/** These stand on the furniture under them (the height above its top), the others are measured from the floor. */
const ON_TOP = ['3dprinter', 'syncbox', 'kettle', 'coffee', 'nas', 'router', 'printer', 'irhub', 'alarmhub'];
/* ------------------------------------------------------------- parcels */
const PARCEL_DATE_KEYS = ['delivery_date', 'delivered_at', 'delivery_time', 'delivered_date', 'date_delivered', 'status_date', 'last_update', 'date', 'timestamp'];
const PARCEL_DONE_RE = /bezorgd|afgeleverd|geleverd|delivered|zugestellt|livr[ée]/i;
const PARCEL_AWAY_RE = /service ?point|pick.?up|afhaal|parcel ?shop|locker|pakketautomaat|neighbou?r|buren/i;
const isToday = (t) => { const d = new Date(t), n = new Date(); return !isNaN(d) && d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate(); };
/** Sensors that tell about parcels: yours (step 5), else what Home Assistant has (PostNL, DHL, Mail and Packages, …). */
let PARCEL_CACHE = { t: 0, n: -1, ids: [] };
export function parcelEntities(plan, hass) {
  const own = settingsOf(plan).parcel_entities;
  if (Array.isArray(own) && own.length) return own.filter((id) => hass?.states?.[id]);
  // looking through every entity is not free: once a minute is plenty
  const n = Object.keys(hass?.states || {}).length;
  if (Date.now() - PARCEL_CACHE.t < 60000 && n === PARCEL_CACHE.n) return PARCEL_CACHE.ids;
  PARCEL_CACHE = { t: Date.now(), n, ids: [] };
  return (PARCEL_CACHE.ids = Object.values(hass?.states || {}).filter((st) => {
    const id = st.entity_id, a = st.attributes || {};
    if (id.startsWith('sensor.') && Object.values(a).some((v) => Array.isArray(v) && v.some((x) => x && typeof x === 'object' && PARCEL_DATE_KEYS.some((k) => k in x)))) return true;   // a list of parcels with their dates
    if (/^sensor\.mail_packages_delivered$/.test(id)) return true;   // Mail and Packages: delivered today
    return id.startsWith('binary_sensor.') && /parcel|package|pakket|pakje/i.test(`${id} ${a.friendly_name || ''}`);
  }).map((st) => st.entity_id));
}
/**
 * Parcels delivered at home today: { count, at (ms, the last one), names, entities } or null. A parcel taken to a
 * service point or a neighbour does not count; one the front door opened for after it came is taken in.
 */
export function parcelsToday(plan, hass) {
  const s = settingsOf(plan);
  if (s.parcels === false || !hass?.states) return null;
  let count = 0, at = 0;
  const names = [], ents = [];
  for (const id of parcelEntities(plan, hass)) {
    const st = hass.states[id], a = st?.attributes || {};
    if (!st || ['unavailable', 'unknown'].includes(st.state)) continue;
    let n = 0, t = 0;
    for (const v of Object.values(a)) {
      if (!Array.isArray(v)) continue;
      for (const x of v) {
        if (!x || typeof x !== 'object') continue;
        const k = PARCEL_DATE_KEYS.find((q) => x[q]), when = k ? x[k] : null;
        const done = x.delivered === true || PARCEL_DONE_RE.test(`${x.status || ''} ${x.status_message || ''} ${x.state || ''}`);
        if (!done || !when || !isToday(when) || PARCEL_AWAY_RE.test(`${x.delivery_address_type || ''} ${x.location || ''} ${x.status_message || ''}`)) continue;
        n++; t = Math.max(t, new Date(when).getTime());
        if (x.name || x.sender) names.push(String(x.sender || x.name));
      }
    }
    if (!n && id.startsWith('binary_sensor.') && st.state === 'on') { n = 1; t = new Date(st.last_changed).getTime(); }
    if (!n && /today|vandaag|mail_packages_delivered/i.test(id) && +st.state > 0) { n = +st.state; t = new Date(st.last_changed).getTime(); }
    if (n) { count += n; at = Math.max(at, t); ents.push(id); }
  }
  if (!count) return null;
  // the front door opened after the parcel came: someone took it in
  const door = frontDoor(plan), ds = door?.o?.entity ? hass.states[door.o.entity] : null;
  if (ds && !['unavailable', 'unknown'].includes(ds.state) && new Date(ds.last_changed).getTime() > at + 60000) return null;
  return { count, at, names: [...new Set(names)], entities: ents };
}
/** The front door: the one you chose (step 5), else an outside door called front door / in the hall, else the first outside door. */
export function frontDoor(plan) {
  const rooms = plan.rooms || [], walls = computeWalls(rooms);
  const outerDoor = (o) => {
    if (o.type !== 'door') return null;
    const hor = Math.abs(o.y1 - o.y2) < 1, mx = (o.x1 + o.x2) / 2, my = (o.y1 + o.y2) / 2;
    const w = walls.find((q) => q.kind === 'outer' && (hor ? q.y1 === q.y2 && Math.abs(q.y1 - my) < 3 && mx >= Math.min(q.x1, q.x2) && mx <= Math.max(q.x1, q.x2) : q.x1 === q.x2 && Math.abs(q.x1 - mx) < 3 && my >= Math.min(q.y1, q.y2) && my <= Math.max(q.y1, q.y2)));
    if (!w) return null;
    const a = hor ? roomAt(rooms, mx, my - 6) : roomAt(rooms, mx - 6, my), sgn = a ? 1 : -1;   // outside is where there is no room
    const room = a || (hor ? roomAt(rooms, mx, my + 6) : roomAt(rooms, mx + 6, my));
    return { o, x: mx, y: my, ox: hor ? 0 : sgn, oy: hor ? sgn : 0, ux: hor ? 1 : 0, uy: hor ? 0 : 1, len: Math.hypot(o.x2 - o.x1, o.y2 - o.y1), room };
  };
  const doors = (plan.openings || []).map(outerDoor).filter(Boolean);
  if (!doors.length) return null;
  const want = settingsOf(plan).parcel_door;
  return doors.find((d) => d.o.id === want)
    || doors.find((d) => /voordeur|front|hoofd|main/i.test(`${d.o.name || ''} ${d.o.entity || ''}`))
    || doors.find((d) => /\bhal\b|hall|entree|entr[ae]nce|gang|portaal|foyer/i.test(d.room?.name || ''))
    || doors[0];
}
/** Where a parcel stands: just outside the front door, beside the doorway. [x, y, rot] or null. */
export function parcelSpot(plan) {
  const d = frontDoor(plan), S = planScale(plan) || 70;
  if (!d) return null;
  const out = 0.12 * S + 0.32 * S, side = d.len / 2 + 0.3 * S;
  return [d.x + d.ox * out + d.ux * side, d.y + d.oy * out + d.uy * side, d.ux ? 0 : 90];
}

/**
 * Devices that are a thing you can see (a 3D printer, a printer): their body for the 2D and 2.5D drawing, standing where you
 * placed the device (on the furniture under it), turned like it (it.rot). The walk-through draws them itself.
 */
export function deviceFurniture(plan, hass) {
  const S = planScale(plan) || 70, out = [];
  // a parcel delivered today: a box by the front door
  const pk = parcelsToday(plan, hass), ps = pk && parcelSpot(plan);
  if (ps) out.push({ id: 'dev:parcel', type: 'parcel', x: ps[0], y: ps[1], w: 0.42 * S, h: 0.32 * S, rot: ps[2], parcel: pk });
  for (const it of plan.items || []) {
    const st = hass?.states?.[it.entity_id], k = deviceKind(it, st, hass) || applianceKind(it, st, hass);   // (a printer placed by its chamber light too)
    if (k !== '3dprinter' && k !== 'printer') continue;
    const big = k === '3dprinter' && /h2d|h2s|x1e|core ?one/i.test(`${it.entity_id} ${st?.attributes?.friendly_name || ''}`);
    const [w, d] = k === 'printer' ? [0.44, 0.4] : big ? [0.5, 0.5] : [0.4, 0.42];
    const x = safeNumber(it.x), y = safeNumber(it.y), under = furnAt(plan, x, y);
    out.push({ id: `dev:${it.entity_id}`, type: k === 'printer' ? 'devprinter' : big ? 'dev3dprinterbig' : 'dev3dprinter', x, y, w: w * S, h: d * S, rot: safeNumber(it.rot), base: under ? furnHeight(under) : 0, device: it.entity_id });
  }
  return out;
}

export const KIND_ICON = { smoke: 'mdi:smoke-detector', leak: 'mdi:water-alert', fingerbot: 'mdi:gesture-tap-button', irhub: 'mdi:remote', alarmhub: 'mdi:shield-home', siren: 'mdi:alarm-light', bedsensor: 'mdi:bed', '3dprinter': 'mdi:printer-3d', holofan: 'mdi:fan', tree: 'mdi:pine-tree', syncbox: 'mdi:television-ambient-light', hood: 'mdi:stove', kettle: 'mdi:kettle',
  coffee: 'mdi:coffee-maker', dishwasher: 'mdi:dishwasher', washer: 'mdi:washing-machine', dryer: 'mdi:tumble-dryer', powerstrip: 'mdi:power-socket-eu', inverter: 'mdi:solar-power',
  nas: 'mdi:nas', router: 'mdi:router-wireless', printer: 'mdi:printer', screen: 'mdi:projector-screen', thermo: 'mdi:thermometer', doorbell: 'mdi:doorbell-video', pixeldisplay: 'mdi:dots-grid',
  vacuum: 'mdi:robot-vacuum', camera: 'mdi:cctv', lock: 'mdi:lock', radiator: 'mdi:radiator', thermostat: 'mdi:thermostat', ceiling_fan: 'mdi:ceiling-fan', fan: 'mdi:fan', purifier: 'mdi:air-purifier', plug: 'mdi:power-socket-eu', motion: 'mdi:motion-sensor' };

export const MEDIA_ICON = { mini: 'mdi:speaker', speaker: 'mdi:speaker', hub: 'mdi:tablet', soundbar: 'mdi:soundbar', player: 'mdi:cast', voice: 'mdi:microphone', group: 'mdi:speaker-multiple' };

/**
 * Live LED colours of WLED lights (see websocket floorplan_studio/wled_live): cb({leds: {entity_id: ['rrggbb', ...]},
 * matrix: {entity_id: [w, h]}}). Returns a function that stops it. Only WLED lights are asked for.
 */
export function wledLive(hass, ids, cb, full = []) {
  const ok = (id) => hass?.entities?.[id]?.platform === 'wled';
  const list = [...new Set(ids)].filter(ok).sort(), whole = [...new Set(full)].filter(ok).sort();
  if ((!list.length && !whole.length) || !hass?.connection) return null;
  let unsub = null, stopped = false;
  hass.connection.subscribeMessage(cb, { type: 'floorplan_studio/wled_live', entity_ids: list, full: whole }).then((u) => { if (stopped) u(); else unsub = u; }).catch(() => {});
  return { key: `${list.join(',')}|${whole.join(',')}`, stop: () => { stopped = true; try { unsub?.(); } catch (e) { /* gone already */ } } };
}
/**
 * Where along a strip of LEDs each side of an ambilight frame is (fractions 0..1, in the order left, top, right,
 * bottom as you look at the TV): from the WLED segments when there are 4, else in proportion to the sides.
 */
export function ambilightSides(segLens, wM, hM) {
  const lens = (segLens || []).filter((n) => n > 0);
  const parts = lens.length === 4 ? lens : [hM, wM, hM, wM];
  const tot = parts.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return parts.map((n) => { const r = [acc / tot, (acc + n) / tot]; acc += n; return r; });
}
/**
 * An overview of the devices in Home Assistant and what Floorplan Studio makes of them: one row per physical
 * device {name, area, area_id, entity_id, placed, model, what}. model = drawn as the thing it is (3D model,
 * line, glow...); placed without model = just its icon; not placed = missing from the plan. Phones, services
 * and pure data (weather, prices, templates) are left out. lang 'nl' or 'en'.
 */
const IDX_TXT = {
  nl: { clock: 'WLED-klok (ledring met de tijd)', lamp: 'lamp', strip: 'ledstrip (lijn)', tv: 'tv, gekoppeld aan het tv-meubel', tvloose: 'tv (geen tv-meubel getekend)', media: 'mediaspeler', mediax: 'mediaspeler (soort onbekend)', ac: 'airco', curtain: 'gordijn/rolluik bij het raam', cover: 'cover (geen raam in de buurt)', presence: 'aanwezigheid (kleurt de ruimte)', door: 'deur/raam-sensor', doorlinked: 'deur/raam-sensor, gekoppeld aan de opening', alert: 'melding', roominfo: 'ruimte-info', switchlamp: 'schakelaar → lamp', icon: 'alleen icoon', radiator: 'radiator, gekoppeld', sensor: 'sensor' },
  en: { clock: 'WLED clock (LED ring showing the time)', lamp: 'lamp', strip: 'LED strip (line)', tv: 'TV, linked to the TV furniture', tvloose: 'TV (no TV furniture drawn)', media: 'media player', mediax: 'media player (unknown kind)', ac: 'air conditioner', curtain: 'curtain/blind at the window', cover: 'cover (no window nearby)', presence: 'presence (colours the room)', door: 'door/window sensor', doorlinked: 'door/window sensor, linked to the opening', alert: 'alert', roominfo: 'room info', switchlamp: 'switch → lamp', icon: 'icon only', radiator: 'radiator, linked', sensor: 'sensor' },
};
export function deviceIndex(plan, hass, lang = 'nl') {
  const T = IDX_TXT[lang] || IDX_TXT.en, ents = hass?.entities || {}, states = hass?.states || {};
  const onPlan = new Map((plan.items || []).map((i) => [i.entity_id, i]));
  const openingEnt = new Set((plan.openings || []).map((o) => o.entity).filter(Boolean));
  const roomRefs = new Set((plan.rooms || []).flatMap((r) => [r.temperature, r.humidity]).filter(Boolean));
  const tvl = tvLinks(plan, hass), rads = radiatorLinks(plan, hass);
  const DOM = ['light', 'switch', 'fan', 'cover', 'climate', 'media_player', 'vacuum', 'lock', 'camera', 'humidifier', 'binary_sensor', 'sensor', 'remote', 'siren', 'valve', 'water_heater', 'lawn_mower', 'alarm_control_panel'];
  const PRIO = ['light', 'camera', 'climate', 'cover', 'media_player', 'vacuum', 'fan', 'lock', 'humidifier', 'water_heater', 'valve', 'lawn_mower', 'switch', 'remote', 'siren', 'alarm_control_panel', 'binary_sensor', 'sensor'];
  const SKIP_PLATFORMS = ['mobile_app', 'buienradar', 'met', 'template', 'group', 'energy', 'energyzero', 'time_date', 'sun', 'forecast_solar', 'min_max', 'threshold', 'utility_meter', 'statistics', 'derivative', 'integration', 'battery_sim', 'proximity', 'multiscrape', 'postnl', 'seventeentrack', 'rdw', 'twentemilieu', 'nmap_tracker', 'spook', 'hacs', 'hassio', 'adguard', 'google', 'person', 'zone'];
  const byDev = new Map();
  // a washing machine or dryer often has only status/diagnostic entities: those count for it
  const APP_DEV = /vaatwasser|afwasmachine|dishwasher|sp[üu]lmaschine|(?<!af)wasmachine|washing ?machine|\bwasher\b|waschmaschine|(?<!filament )droger|\bdryer\b|trockner/i;
  const camDevs = new Set(Object.values(ents).filter((e) => e.entity_id.startsWith('camera.') && e.device_id).map((e) => e.device_id));
  for (const [id, e] of Object.entries(ents)) {
    if (!states[id] || e.hidden || !DOM.includes(id.split('.')[0])) continue;
    if (SKIP_PLATFORMS.includes(e.platform)) continue;
    const dev = e.device_id ? hass.devices?.[e.device_id] : null;
    if (e.entity_category && !APP_DEV.test(`${dev?.name_by_user || dev?.name || ''} ${id}`)) continue;
    if (dev?.entry_type === 'service') continue;
    // the system itself (the Zigbee or Z-Wave bridge), and Frigate's zones (detections of a camera, not a thing in the house)
    if (/zigbee2mqtt|z-?wave ?js|matter ?server|zha ?coordinator/i.test(`${dev?.manufacturer || ''} ${dev?.model || ''} ${dev?.name || ''}`) || /permit_join/.test(id)) continue;
    if (e.platform === 'frigate' && !camDevs.has(e.device_id)) continue;
    const k = e.device_id || `loose:${id}`;
    if (!byDev.has(k)) byDev.set(k, []);
    byDev.get(k).push(id);
  }
  // appliances you drew as furniture (dishwasher, washer, dryer): their linked entity's device is on the plan
  const drawnApp = applianceAbsorbs(plan, hass), drawnDev = new Set([...drawnApp].map((id) => ents[id]?.device_id).filter(Boolean));
  const rows = [];
  for (const [k, ids] of byDev) {
    const dev = hass.devices?.[k] || null;
    const placedIds = ids.filter((id) => onPlan.has(id) || openingEnt.has(id) || roomRefs.has(id) || rads.byEntity.has(id) || drawnApp.has(id) || drawnDev.has(k));
    const primary = placedIds.find((id) => onPlan.has(id)) || placedIds[0] || [...ids].sort((a, b) => PRIO.indexOf(a.split('.')[0]) - PRIO.indexOf(b.split('.')[0]))[0];
    const it = onPlan.get(primary) || { entity_id: primary, x: 0, y: 0 }, st = states[primary], dom = primary.split('.')[0], dc = st?.attributes?.device_class;
    let what = '', model = false;
    const lampKind = it.kind !== 'device' && (dom === 'light' || it.kind === 'lamp');
    if (rads.byEntity.has(primary)) { what = T.radiator; model = true; }
    else if (ringClock(it, hass)) { what = T.clock; model = true; }
    else if (lampKind) { const sh = lampShape(plan, it, st, hass); what = sh === 'strip' ? T.strip : `${T.lamp}: ${sh}`; model = true; }
    else if (dom === 'media_player') { const mk = mediaKind(it, hass); what = tvl.has(primary) ? T.tv : mk === 'tv' ? T.tvloose : mk ? `${T.media}: ${mk}` : T.mediax; model = tvl.has(primary) || (!!mk && !['tv', 'group'].includes(mk)); }
    else if (isAircon(it, st)) { what = T.ac; model = true; }
    else if (dom === 'cover' && curtainFor(plan, it, st)) { what = T.curtain; model = true; }
    else { const dk = deviceKind(it, st, hass); if (dk) { what = dk; model = true; } }
    if (!what) {
      if (dom === 'binary_sensor') { what = PRESENCE_DC.includes(dc) ? T.presence : ['door', 'window', 'opening', 'garage_door'].includes(dc) ? (openingEnt.has(primary) ? T.doorlinked : T.door) : ['smoke', 'moisture', 'gas', 'carbon_monoxide', 'heat', 'safety'].includes(dc) ? `${T.alert} (${dc})` : ''; model = PRESENCE_DC.includes(dc) || openingEnt.has(primary); }
      else if (dom === 'sensor') { what = ['temperature', 'humidity'].includes(dc) ? `${T.roominfo} (${dc})` : ''; }
      else if (dom === 'cover') what = T.cover;
      else if (dom === 'switch' && it.kind === 'lamp') { what = T.switchlamp; model = true; }
      else what = T.icon;
    }
    if (!what || /: group$/.test(what)) continue;   // data or a speaker group, not a thing in the house
    const areaId = dev?.area_id || ents[primary]?.area_id || null;
    rows.push({ name: (dev && (dev.name_by_user || dev.name)) || st?.attributes?.friendly_name || primary, area: hass.areas?.[areaId]?.name || '', area_id: areaId, entity_id: primary, placed: placedIds.length > 0, model, what });
  }
  // the same device seen by a second integration (Music Assistant next to Cast...), or a part of one ("Waterkoker 80"
  // next to "Waterkoker"): counts as placed when that one is
  const placedNames = rows.filter((r) => r.placed).map((r) => r.name.trim().toLowerCase());
  for (const r of rows) { const n = r.name.trim().toLowerCase(); if (!r.placed && placedNames.some((pn) => pn && (n === pn || n.startsWith(`${pn} `)))) { r.placed = true; r.dup = true; } }
  return rows.filter((r) => !r.dup).sort((a, b) => a.area.localeCompare(b.area) || a.name.localeCompare(b.name));
}
/** A WLED ring clock (a WLED light called klok/clock): drawn as its ring of LEDs showing the time. */
export function ringClock(it, hass) {
  if (it.entity_id.split('.')[0] !== 'light' || it.ringclock === false) return 0;
  const wled = hass?.entities?.[it.entity_id]?.platform === 'wled';
  if (!(it.ringclock === true || (wled && /klok|clock/i.test(`${it.entity_id} ${it.name || ''} ${hass?.states[it.entity_id]?.attributes?.friendly_name || ''}`)))) return 0;
  const n = +hass?.states[it.entity_id.replace('light.', 'sensor.') + '_led_count']?.state;
  return Number.isFinite(n) && n >= 12 && n <= 240 ? Math.round(n) : 60;
}
/** Which LEDs of a ring clock are lit now (index from the top, clockwise): hour, minute, second. */
export function ringClockLeds(n, now = new Date()) {
  const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours() % 12;
  const at = (f) => Math.round(f * n) % n;
  return { hour: at((h + m / 60) / 12), minute: at((m + s / 60) / 60), second: at(s / 60) };
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
  if (/ceiling|chandelier|light-recessed/.test(lampIcon(it, st))) return true;
  return CEIL_RE.test(`${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`);
}
/** A ceiling lamp hanging on a cord (its own height) or flat against the ceiling: 'hanging', 'flush' or null. */
const HANG_RE = /hanglamp|hanglight|pendant|pendel|hanging|kroonluchter|chandelier/i;
export function ceilingMount(it, st) {
  if (it.ceiling === 'hanging') return 'hanging';
  if (!isCeilingLamp(it, st)) return null;
  if (it.ceiling === true) return 'flush';
  return HANG_RE.test(`${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`) || /chandelier/.test(lampIcon(it, st)) ? 'hanging' : 'flush';
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
/** A spotlight (called spot, or set as one): it shines in a direction you can aim (step 4, or in the walk). */
const SPOT_RE = /\bspot|spotje|spotlight|richtspot/i;
export function isSpot(it, st) {
  if (it.spot === false) return false;
  return it.spot === true || !!it.aim || SPOT_RE.test(`${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`) || /spotlight|track-light/.test(lampIcon(it, st));
}
/** Where a spot shines: a unit vector in metres (x right, y up, z down the plan); straight down when not aimed. */
export function spotDir(plan, it, h) {
  const a = it.aim;
  if (!a || !Number.isFinite(+a.x) || !Number.isFinite(+a.y)) return [0, -1, 0];
  const S = planScale(plan) || 70, dx = (+a.x - safeNumber(it.x)) / S, dz = (+a.y - safeNumber(it.y)) / S, dy = (Number.isFinite(+a.z) ? +a.z : 0) - h;
  const L = Math.hypot(dx, dy, dz) || 1;
  return [dx / L, dy / L, dz / L];
}
const FLOORLAMP_RE = /vloer|staand|floor|standing|stalamp/i, TABLELAMP_RE = /bureau|tafellamp|nacht|desk|bedside|leeslamp|reading/i;
/** The icon a lamp shows (yours, else the one Home Assistant gives it), e.g. 'mdi:desk-lamp'. */
export const lampIcon = (it, st) => `${it.icon || st?.attributes?.icon || ''}`;
const WALLLAMP_RE = /wandlamp|wall ?lamp|sconce|spiegel|mirror|buitenlamp|lantaarn|lantern/i;
/**
 * The exact model of a lamp, so it looks like its icon (and name): within its kind (lampStyle) for example
 * 'desk' (bureaulamp), 'lava', 'torchiere', 'chandelier', 'downlight', 'sconce', 'flat' (flat wall light),
 * 'mirror' (light above a mirror), 'lantern', 'fireplace', 'matrix' (LED matrix/pixel display), 'panel'
 * (a lit panel, e.g. stained glass), 'bar' (a short LED bar) or 'bulb'. it.model overrides it.
 */
/** Lamp models you can pick per lamp (step 4), with how they hang or stand. */
export const LAMP_MODELS = {
  pendant: 'pendant', globe: 'pendant', dome: 'pendant', drum: 'pendant', cluster: 'pendant', bulb: 'pendant', chandelier: 'pendant',
  ceiling: 'ceiling', downlight: 'ceiling',
  floor: 'floor', torchiere: 'floor', arc: 'floor', tripod: 'floor',
  table: 'table', desk: 'table', cube: 'table', lava: 'table',
  sconce: 'wall', flat: 'wall', tube: 'wall', lantern: 'wall', mirror: 'wall',
};
/** Models that can be round or square. */
export const LAMP_ROUNDABLE = ['pendant', 'globe', 'dome', 'drum', 'cluster', 'ceiling', 'downlight', 'floor', 'torchiere', 'arc', 'tripod', 'table', 'desk', 'cube', 'sconce'];
export function lampShape(plan, it, st, hass = null) {
  if (it.model) return it.model;
  const style = lampStyle(plan, it, st), ic = lampIcon(it, st), label = `${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`;
  const ent = hass?.entities?.[it.entity_id], dev = ent?.device_id ? hass?.devices?.[ent.device_id] : null, make = `${dev?.manufacturer || ''} ${dev?.model || ''}`;
  if (style === 'strip' || style === 'spot') return style;
  if (LAMP_MODELS[it.lamp_model]) return it.lamp_model;   // the model you picked
  if (speakerBoxes(plan, it, st).length) return 'boxglow';
  if (ambilightTv(plan, it, st)) return 'ambilight';
  const ak = applianceKind(it, st, hass);
  if (ak && ak !== 'pixeldisplay') return ak;   // a light that is part of something else: the chamber light of a 3D printer, a Christmas tree, a hologram fan...
  if (/keukenblad|aanrecht|onderbouw|kastverlichting|plint|onder ?kast|cabinet ?light/i.test(label) || (/led ?controller|light controller|strip controller/i.test(make) && style !== 'ceiling')) return 'bar';
  if (style === 'pendant') return /chandelier/.test(ic) || /kroonluchter|chandelier/i.test(label) ? 'chandelier' : 'pendant';
  if (style === 'ceiling') return /light-recessed/.test(ic) || /inbouw|downlight|recessed/i.test(label) ? 'downlight' : 'ceiling';
  if (style === 'floor') return /torchiere/.test(ic) || /uplight|torchiere|deckenfluter/i.test(label) ? 'torchiere' : 'floor';
  // the icon decides first (that is what you see on the map), then the name and make
  const byIcon = [[/fireplace/, 'fireplace'], [/matrix|pixel/, 'matrix'], [/lava-lamp/, 'lava'], [/desk-lamp/, 'desk'], [/^mdi:lamp(-outline)?$/, 'table'],
    [/mirror|vanity/, 'mirror'], [/coach-lamp|outdoor-lamp|lantern/, 'lantern'], [/wall-sconce-flat/, 'flat'], [/wall-sconce/, 'sconce'],
    [/window|stained|glass/, 'panel'], [/led-strip|string-lights/, 'bar']].find(([re]) => re.test(ic));
  if (byIcon) return byIcon[1];
  if (/openhaard|haard|fireplace|kachel/i.test(label)) return 'fireplace';
  if (/matrix|pixoo|pixel|divoom/i.test(`${label} ${make}`)) return 'matrix';
  if (/lava/i.test(label)) return 'lava';
  if (/bureaulamp|desk ?lamp/i.test(label)) return 'desk';
  if (style === 'table') return 'table';
  if (/spiegel|mirror/i.test(label)) return 'mirror';
  if (/buitenlamp|lantaarn|lantern/i.test(label)) return 'lantern';
  if (WALLLAMP_RE.test(label)) return 'sconce';
  if (/glas in lood|glas-in-lood|stained|lichtbak|lightbox/i.test(label)) return 'panel';
  return 'bulb';
}
export function lampStyle(plan, it, st) {
  const d = it.entity_id.split('.')[0];
  if (it.kind === 'device' || !(d === 'light' || it.kind === 'lamp')) return null;
  if (stripPath(it)) return 'strip';
  if (isSpot(it, st)) return 'spot';
  if (LAMP_MODELS[it.lamp_model]) return LAMP_MODELS[it.lamp_model];   // the model you picked decides how it hangs or stands
  const own = ownHeight(it) != null;
  const mount = ceilingMount(it, st);
  if (mount === 'hanging') return 'pendant';
  // a lamp against the ceiling that you gave a lower height hangs on a cord
  if (mount === 'flush') return own && ownHeight(it) < WALL_H - 0.25 ? 'pendant' : 'ceiling';
  const label = `${it.entity_id} ${it.name || ''} ${st?.attributes?.friendly_name || ''}`, ic = lampIcon(it, st);
  if (/floor-lamp/.test(ic) || FLOORLAMP_RE.test(label)) return 'floor';
  if (/desk-lamp|^mdi:lamp(-outline)?$|lava-lamp/.test(ic)) return 'table';
  if (/wall-sconce|mirror|vanity|coach-lamp|outdoor-lamp/.test(ic) || WALLLAMP_RE.test(label)) return 'wall';
  const under = furnAt(plan, safeNumber(it.x), safeNumber(it.y));
  if (under && !own && ['table', 'round', 'island'].includes(under.type)) return 'pendant';
  if (TABLELAMP_RE.test(label) || (under && !own)) return 'table';
  return 'other';
}
export function deviceHeight(plan, it, st, hass = null) {
  const own = ownHeight(it) != null;
  let h;
  if (own) h = ownHeight(it);
  else {
    const under = furnAt(plan, safeNumber(it.x), safeNumber(it.y)), style = lampStyle(plan, it, st);
    const mk = hass ? mediaKind(it, hass) : null;
    if (mk && mk !== 'tv' && mk !== 'group') {
      // a speaker or player stands on the furniture under it (not floating above)
      const top = { mini: 0.03, speaker: 0.1, hub: 0.09, soundbar: 0.05, player: 0.03, voice: 0.03 }[mk];
      h = under ? furnHeight(under) + top : mk === 'soundbar' ? 0.55 : itemHeight(it, st);
    } else if (isAircon(it, st)) h = 2.2;   // an air conditioner hangs high on the wall
    else if (KIND_H[applianceKind(it, st, hass)] != null) {
      const k = applianceKind(it, st, hass);
      h = ON_TOP.includes(k) ? (under ? furnHeight(under) : k === 'kettle' || k === 'coffee' ? 0.9 : k === '3dprinter' || k === 'printer' ? 0.75 : 0) + KIND_H[k] : KIND_H[k];
    }
    else if (!style && KIND_H[deviceKind(it, st, hass)] != null) {
      // a recognised device: where it usually is (a plug or vacuum stays low even on a cupboard line)
      const k = deviceKind(it, st, hass);
      h = under && ['fan', 'purifier', 'plug'].includes(k) ? furnHeight(under) + (k === 'plug' ? 0.02 : 0.2) : KIND_H[k];
    }
    else if (style === 'spot') h = WALL_H - 0.15;
    else if (style === 'ceiling') h = WALL_H - 0.12;
    else if (style === 'pendant') h = under ? furnHeight(under) + 0.85 : 2.0;
    else if (style === 'floor') h = 1.5;
    else if (style === 'table') h = (under ? furnHeight(under) : 0.75) + 0.3;
    else if (style === 'wall') h = /mirror|vanity/.test(lampIcon(it, st)) || /spiegel|mirror/i.test(`${it.name || ''} ${st?.attributes?.friendly_name || ''}`) ? 1.95 : 1.8;
    else h = under ? furnHeight(under) + 0.35 : itemHeight(it, st);
  }
  return Math.min(Math.max(h, 0), WALL_H - 0.05);
}

/**
 * The 2.5D view: the plan turned (rot, degrees) and tilted (tilt, degrees from top-down), then fitted
 * back into the plan's own box. P(x, y) gives where a floor point lands, dz(h) how far up a height goes.
 */
export function makeProj(plan, { rot = 0, tilt = 50, height = 100, persp = true, snug = false, scale = null } = {}) {
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
  const pad = W * (snug ? 0.012 : 0.03), fit = ([a0, b0, a1, b1]) => Math.min((W - 2 * pad) / Math.max(1, a1 - a0), (H - 2 * pad) / Math.max(1, b1 - b0));
  const [x0, y0, x1, y1] = box(raw);
  // the same size at every angle (the smallest fit over a full turn), so turning the house doesn't zoom in and out;
  // snug (phones): as big as it fits at this angle (while turning by hand, the size it had when you started)
  let s = Infinity;
  if (Number.isFinite(scale) && scale > 0) s = scale;
  else if (snug) s = fit([x0, y0, x1, y1]);
  else for (let d = 0; d < 180; d += 15) { const r = (d * Math.PI) / 180; s = Math.min(s, fit(box(rawAt(Math.cos(r), Math.sin(r))))); }
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
export function furnModel(f, spin = 0, onTop = false, S = 70) {
  const w = Math.max(10, safeNumber(f.w, 100)), h = Math.max(6, safeNumber(f.h, 60)), x0 = -w / 2, y0 = -h / 2;
  const R = (a, b, c, d, z0, z1, cls) => ({ poly: [[x0 + a, y0 + b], [x0 + c, y0 + b], [x0 + c, y0 + d], [x0 + a, y0 + d]], z0, z1, cls });
  // round shapes: smooth, with their corners kept still towards the viewer (spin), so turning the house doesn't make them twirl
  const C = (cx, cy, rx, ry, z0, z1, cls, k = 24) => ({ poly: Array.from({ length: k }, (_, i) => { const a = (i * 2 * Math.PI) / k + spin; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; }), z0, z1, cls });
  const legs = (z1, t = 4) => [[t, t], [w - 2 * t, t], [w - 2 * t, h - 2 * t], [t, h - 2 * t]].map(([a, b]) => R(a, b, a + t, b + t, 0, z1));
  const chair = (cx, cy, cw, cs, flip) => [R(cx - x0 - cw / 2, cy - y0 - cs / 2, cx - x0 + cw / 2, cy - y0 + cs / 2, 0, 0.46, 'soft'),
    flip ? R(cx - x0 - cw / 2, cy - y0 + cs / 2 - 3, cx - x0 + cw / 2, cy - y0 + cs / 2, 0.46, 0.9, 'soft') : R(cx - x0 - cw / 2, cy - y0 - cs / 2, cx - x0 + cw / 2, cy - y0 - cs / 2 + 3, 0.46, 0.9, 'soft')];
  switch (f.type) {
    case 'sofa': {
      const sp = sofaParts(f);
      if (sp) return sp.map(([a, b2, c, d, k]) => R(a, b2, c, d, 0, k === 'back' ? 0.85 : k === 'arm' ? 0.62 : 0.42, 'soft'));
      const arm = Math.min(w * 0.12, 22), back = Math.min(h * 0.28, 24);
      return [R(arm, back, w - arm, h, 0, 0.42, 'soft'), R(0, 0, w, back, 0, 0.85, 'soft'), R(0, back, arm, h, 0, 0.62, 'soft'), R(w - arm, back, w, h, 0, 0.62, 'soft')];
    }
    case 'bed': {
      const pw = w > 120 ? (w - 30) / 2 : w - 20, ph = Math.min(30, h * 0.16);
      return [R(0, 0, w, h, 0, 0.42), R(0, 0, w, 6, 0, 0.95), R(0, h * 0.38, w, h, 0.42, 0.5, 'soft'),
        ...(w > 120 ? [R(10, 10, 10 + pw, 10 + ph, 0.42, 0.54, 'soft'), R(20 + pw, 10, 20 + 2 * pw, 10 + ph, 0.42, 0.54, 'soft')] : [R(10, 10, 10 + pw, 10 + ph, 0.42, 0.54, 'soft')])];
    }
    case 'table': {
      const list = tableChairs(f), side = list.filter((c) => c.side === 'n').length || 1, cw = Math.min(34, w / side - 6, 40), cs = 14, out = [...legs(0.7), R(0, 0, w, h, 0.7, 0.76)];
      for (const c of list) {
        if (c.side === 'n') out.push(...chair(c.cx, y0 - cs / 2 - 4, cw, cs, false));
        else if (c.side === 's') out.push(...chair(c.cx, -y0 + cs / 2 + 4, cw, cs, true));
        else {
          // a chair at the end: its seat, with the back on the outside
          const ex = c.side === 'e' ? w / 2 + cs / 2 + 4 : -w / 2 - cs / 2 - 4, ew = Math.min(cw, h - 8), bx = c.side === 'e' ? ex + cs / 2 - 3 : ex - cs / 2;
          out.push(R(ex - x0 - cs / 2, -ew / 2 - y0, ex - x0 + cs / 2, ew / 2 - y0, 0, 0.46, 'soft'), R(bx - x0, -ew / 2 - y0, bx - x0 + 3, ew / 2 - y0, 0.46, 0.9, 'soft'));
        }
      }
      return out;
    }
    case 'round': {
      const out = [C(0, 0, 5, 5, 0, 0.7), C(0, 0, w / 2, h / 2, 0.7, 0.76)];
      for (const ang of roundChairs(f)) { out.push(C(Math.cos(ang) * (w / 2 + 10), Math.sin(ang) * (h / 2 + 10), 11, 11, 0, 0.46, 'soft')); }
      return out;
    }
    case 'dishwasher': case 'washer': case 'dryer': {
      // the front is the "h" side; a control strip at the top, the door below it
      const out = [R(0, 0, w, h, 0, 0.85, 'white'), R(w * 0.06, h - 0.8, w * 0.94, h, 0.74, 0.82, 'soft')];
      if (f.type !== 'dishwasher') out.push(R(w * 0.22, h - 0.6, w * 0.78, h, 0.2, 0.62, 'dark'));
      return out;
    }
    case 'videowall': { const [b0, b1] = videoWallSpan(f); return [R(0, 0, w, h, b0 - 0.04, b1 + 0.04, 'dark')]; }
    case 'parcel': return [R(0, 0, w, h, 0, 0.3, 'pkg'), R(w / 2 - w * 0.07, -0.3, w / 2 + w * 0.07, h + 0.3, 0.3, 0.304, 'tape')];
    case 'dev3dprinter': case 'dev3dprinterbig': {
      // a 3D printer: dark frame with a glass door at the front
      const Hh = FURN_HEIGHT[f.type];
      return [R(0, 0, w, h - 1.2, 0, Hh, 'dark'), R(w * 0.1, h - 1.2, w * 0.9, h, 0.08, Hh - 0.04, 'glass')];
    }
    case 'devprinter': return [R(0, 0, w, h, 0, 0.3, 'dark'), R(w * 0.1, h * 0.55, w * 0.9, h, 0.08, 0.1, 'soft')];
    case 'mirror': {
      // a mirror on the wall: a thin frame with the glass in front of it
      const [b0, b1] = videoWallSpan(f), fr = Math.min(2.5, w * 0.06);
      return [R(0, 0, w, h * 0.5, b0, b1, 'dark'), R(fr, h * 0.5, w - fr, h, b0 + 0.03, b1 - 0.03, 'mirror')];
    }
    case 'speakerbox': return [R(0, 0, w, h, 0, 1, 'dark'), R(1.5, h - 1, w - 1.5, h, 0.08, 0.95, 'soft')];
    case 'radiator': {
      // panel radiator: fins from 15 cm up, little feet
      const k = Math.max(3, Math.round(w / 8)), out = [R(w * 0.06, h * 0.3, w * 0.1, h * 0.7, 0, 0.15, 'dark'), R(w * 0.9, h * 0.3, w * 0.94, h * 0.7, 0, 0.15, 'dark')];
      for (let i = 0; i < k; i++) out.push(R((i * w) / k + 0.6, 0, ((i + 1) * w) / k - 0.6, h, 0.15, 0.65, 'white'));
      return out;
    }
    case 'coffee': return [...legs(0.36, Math.min(5, Math.min(w, h) * 0.08)), R(0, 0, w, h, 0.36, 0.42), R(5, 5, w - 5, h - 5, 0.08, 0.11)];
    case 'desk': return [...legs(0.72), R(0, 0, w, h, 0.72, 0.76), C(0, h / 2 + 18, 15, 15, 0, 0.48, 'soft')];
    case 'counter': return [R(0, 0, w, h, 0, 0.86), R(-2, -2, w + 2, h + 2, 0.86, 0.9)];
    case 'cabinet': {
      // a cupboard, optionally on legs (f.legs in metres): the body starts above them
      // (the model is stretched to the cupboard's height afterwards, so the legs are given in model units)
      const lg = Math.max(0, Math.min(1.5, safeNumber(f.legs, 0))) / (furnStretch(f) || 1), t = Math.min(4, w * 0.1, h * 0.15);
      if (!lg) return [R(0, 0, w, h, 0, 2), R(w / 2 - 0.5, h - 0.5, w / 2 + 0.5, h, 0.05, 1.95, 'dark')];
      return [...[[t, t], [w - 2 * t, t], [w - 2 * t, h - 2 * t], [t, h - 2 * t]].map(([a, b2]) => R(a, b2, a + t, b2 + t, 0, lg, 'dark')), R(0, 0, w, h, lg, 2), R(w / 2 - 0.5, h - 0.5, w / 2 + 0.5, h, lg + 0.05, 1.95, 'dark')];
    }
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
    case 'tv': {
      if (tvOnWall(f)) {
        // on the wall: just the flat screen at its height, with a small bracket behind it
        const [b0, b1] = tvScreen(f, S);
        return [R(w * 0.4, 0, w * 0.6, h / 2 - 1.5, (b0 + b1) / 2 - 0.08, (b0 + b1) / 2 + 0.08, 'dark'), R(0, h / 2 - 1.5, w, h / 2 + 1.5, b0, b1, 'dark')];
      }
      if (onTop) return [R(w * 0.1, h / 2 - 2.5, w * 0.16, h / 2 + 2.5, 0, 0.05, 'dark'), R(w * 0.84, h / 2 - 2.5, w * 0.9, h / 2 + 2.5, 0, 0.05, 'dark'), R(0, h / 2 - 1.5, w, h / 2 + 1.5, 0.05, 0.71, 'dark')];
      return [R(w * 0.35, 0, w * 0.65, h, 0, 0.45, 'dark'), R(0, h / 2 - 1.5, w, h / 2 + 1.5, 0.45, 1.15, 'dark')];
    }
    case 'plant': {
      // a pot (tapered, with a rim and soil) and leaves that grow out of it and arch outwards: each leaf a blade
      // in a few steps, every step further out and higher, a little narrower (a spiral, so they don't overlap)
      const pr = Math.min(w, h) / 2, out = [C(0, 0, pr * 0.34, pr * 0.34, 0, 0.1, 'pot'), C(0, 0, pr * 0.4, pr * 0.4, 0.1, 0.26, 'pot'), C(0, 0, pr * 0.46, pr * 0.46, 0.26, 0.31, 'pot'), C(0, 0, pr * 0.4, pr * 0.4, 0.31, 0.315, 'dark')];
      const n = 16, blade = (a, r0, r1, wd, z0, z1) => { const c = Math.cos(a), sn = Math.sin(a), px = -sn * wd / 2, py = c * wd / 2; return { poly: [[c * r0 + px, sn * r0 + py], [c * r1 + px * 0.7, sn * r1 + py * 0.7], [c * r1 - px * 0.7, sn * r1 - py * 0.7], [c * r0 - px, sn * r0 - py]], z0, z1, cls: 'plant' }; };
      for (let i = 0; i < n; i++) {
        const a = i * 2.39996, inner = i < 5, L = pr * (inner ? 0.45 : 0.62 + 0.3 * ((i * 7) % 5) / 4), top = inner ? 0.95 : 0.62 + 0.25 * ((i * 3) % 4) / 3, steps = 7;
        for (let k = 0; k < steps; k++) {
          const t0 = k / steps, t1 = (k + 1) / steps, rise = (t) => 0.31 + (top - 0.31) * Math.sin((t * Math.PI) / 2) ** 0.8;
          out.push(blade(a, L * t0 * t0, L * t1 * t1 + 0.4, Math.max(1, pr * 0.13 * (1 - t0 * 0.7)), rise(t0) - 0.01, rise(t1) + 0.005));
        }
      }
      return out;
    }
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
    const zs = furnStretch(f);   // an own height stretches the whole piece
    const zb = tvBase(plan, f);   // a TV standing on a cabinet: on top of it
    const toP = ([x, y], z) => P(fx + x * cr - y * sr, fy + x * sr + y * cr, (z * zs + zb) * sc * proj.lift);
    // a hob or sink on a worktop: just the top part, drawn right after the worktop under it (a TV: after its cabinet)
    const support = ['hob', 'sink'].includes(f.type) ? (plan.furniture || []).find((g) => g !== f && ['counter', 'island', 'sink', 'stove'].includes(g.type) && furnAt({ furniture: [g] }, fx, fy))
      : zb ? (plan.furniture || []).find((g) => g !== f && g.type !== 'tv' && furnAt({ furniture: [g] }, fx, fy) && furnHeight(g) === zb) : null;
    const footKey = (g) => { const gr = (safeNumber(g.rot) * Math.PI) / 180, gw = safeNumber(g.w, 100) / 2, gh = safeNumber(g.h, 60) / 2; return Math.max(...[[-gw, -gh], [gw, -gh], [gw, gh], [-gw, gh]].map(([x, y]) => P(safeNumber(g.x) + x * Math.cos(gr) - y * Math.sin(gr), safeNumber(g.y) + x * Math.sin(gr) + y * Math.cos(gr))[1])); };
    const onKey = support ? footKey(support) + 0.05 : null;
    for (const pr of furnModel(f, -(r + (proj.rot * Math.PI) / 180), !!support || (f.type === 'tv' && zb > 0), planScale(plan) || 70)) {
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
    let sp = stripPath(it);
    if (!sp) continue;
    let pts = sp, w = 1;
    if (proj) {
      const z = Math.min(ownHeight(it) ?? itemHeight(it, null), WALL_H - 0.05) * proj.sc * proj.lift, zt = stripTop(it) * proj.sc * proj.lift;
      if (it.strip_dir === 'frame' || it.strip_dir === 'frame3') { const a = sp[0], b = sp[sp.length - 1]; sp = [a, b]; pts = [proj.P(a[0], a[1], z), proj.P(a[0], a[1], zt), ...sp.map(([x, y]) => proj.P(x, y, zt)), proj.P(b[0], b[1], zt), proj.P(b[0], b[1], z), ...(it.strip_dir === 'frame' ? sp.slice().reverse().map(([x, y]) => proj.P(x, y, z)) : [])]; }
      else if (it.strip_dir === 'up') {
        // standing strips: an upright line at every point (drawn as one line, there and back)
        pts = sp.flatMap(([x, y]) => [proj.P(x, y, z), proj.P(x, y, zt), proj.P(x, y, z)]);
      } else pts = sp.map(([x, y]) => proj.P(x, y, z));
      w = proj.s;
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
    const fc = floorColor(room);
    if (fc) { for (const q of room.rects.map(norm)) out.push(`<rect class="floortex" x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}" style="fill:${fc};fill-opacity:.6"/>`); continue; }
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
  .f3.pkg .f3top { fill: #c49a62; stroke: #8a6a3e; } .f3.pkg .f3side { fill: #a87f4c; stroke: #8a6a3e; } .f3.tape .f3top { fill: #e8d9b8; stroke: none; }
  .furn.f-parcel { fill: #c49a62; fill-opacity: .85; stroke: #8a6a3e; stroke-opacity: 1; } .furn.f-parcel line { stroke: #f0e2c0; stroke-width: 2.5; }
  .f3.glass .f3top, .f3.glass .f3side { fill: rgba(160, 210, 255, .12); stroke: rgba(170, 215, 255, .6); }
  .f3.plant .f3top { fill: rgba(70, 160, 90, .75); stroke: rgba(120, 200, 130, .7); } .f3.plant .f3side { fill: rgba(50, 120, 70, .75); stroke: rgba(120, 200, 130, .5); }
  .f3.pot .f3top, .f3.pot .f3side { fill: rgba(160, 100, 70, .7); }
  .stalks line { stroke: var(--fps-fg); stroke-opacity: .35; stroke-width: 1.2; stroke-dasharray: 2 3; pointer-events: none; }
  .stalks ellipse { fill: var(--fps-fg); fill-opacity: .3; pointer-events: none; }
  .stalks .cord { stroke: var(--fps-fg); stroke-opacity: .55; stroke-width: 1.4; stroke-dasharray: none; }
  .stalks .rose { fill: var(--fps-wall); fill-opacity: 1; stroke: var(--fps-fg); stroke-opacity: .6; stroke-width: 1.2; }
  .stalks .on .rose { stroke: var(--fps-accent); stroke-opacity: .9; }
  .beams polygon { fill: rgb(var(--c, 255, 200, 120)); opacity: .28; filter: url(#fps-stripblur); pointer-events: none; }
  .beams ellipse { fill: rgb(var(--c, 255, 200, 120)); opacity: .35; filter: url(#fps-stripblur); pointer-events: none; }
  .curtains polygon { fill: var(--fps-curtain, rgba(214, 196, 168, .92)); stroke: rgba(0, 0, 0, .35); stroke-width: .8; pointer-events: none; }
  .curtains line { stroke: rgba(0, 0, 0, .22); stroke-width: .8; pointer-events: none; }
  .curtains .roller { fill: var(--fps-curtain, rgba(214, 196, 168, .92)); }
  .strip polyline { fill: none; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
  .strip .sglow { stroke: rgb(var(--c, var(--fps-accent-rgb))); opacity: 0; filter: url(#fps-stripblur); transition: opacity .3s; }
  .strip.on .sglow { opacity: calc(.75 * var(--b, 1) * var(--fps-glow, 1)); }
  .strip .score { stroke: var(--fps-off, #6b7280); opacity: .85; transition: stroke .3s; }
  .strip.on .score { stroke: rgb(var(--c, var(--fps-accent-rgb))); opacity: 1; }
  .strip .slive { display: none; } .strip.live.on .slive { display: inline; } .strip.live.on .score { opacity: 0; }
  .strip .slive line { stroke-linecap: butt; pointer-events: none; }
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
