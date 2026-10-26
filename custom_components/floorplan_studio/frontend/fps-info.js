// Floorplan Studio – what the room text blocks and the side column show.
// Pure functions on `hass` (no DOM), so they are easy to test.
import { areaEntities, roomSummary, friendly, shortState, settingsOf, isOn } from './fps-core.js?v=1.4.0b69';

const NL = (hass) => (hass?.locale?.language || hass?.language || 'en').startsWith('nl');
const W = (hass, nl, en) => (NL(hass) ? nl : en);

/** 21.25 → "21,3" (Dutch) / "21.3" */
export function num(hass, v, digits = 1, minDigits = 0) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (isNaN(n)) return '';
  return n.toLocaleString(NL(hass) ? 'nl-NL' : 'en-US', { maximumFractionDigits: digits, minimumFractionDigits: minDigits });
}
/** Power in W → "1,6 kW" or "350 W". */
export function power(hass, st) {
  if (!st || isNaN(parseFloat(st.state))) return '–';
  let w = parseFloat(st.state);
  const u = (st.attributes.unit_of_measurement || 'W').toLowerCase();
  if (u === 'kw') w *= 1000;
  return Math.abs(w) >= 1000 ? `${num(hass, w / 1000, 1)} kW` : `${Math.round(w)} W`;
}
const watts = (st) => {
  if (!st || isNaN(parseFloat(st.state))) return null;
  const v = parseFloat(st.state);
  return (st.attributes.unit_of_measurement || 'W').toLowerCase() === 'kw' ? v * 1000 : v;
};

const ok = (st) => st && !['unavailable', 'unknown'].includes(st.state);

const COVER_WORD = {
  curtain: ['gordijnen', 'curtains'], shutter: ['rolluiken', 'shutters'], blind: ['jaloezieën', 'blinds'],
  awning: ['zonnescherm', 'awning'], shade: ['zonwering', 'shades'], garage: ['garagedeur', 'garage door'], window: ['ramen', 'windows'],
};
const HVAC = {
  heating: ['verwarmt', 'heating'], cooling: ['koelt', 'cooling'], drying: ['droogt', 'drying'], fan: ['ventileert', 'fan'],
  idle: ['stand-by', 'idle'], off: ['uit', 'off'], heat: ['verwarmt', 'heating'], cool: ['koelt', 'cooling'], dry: ['droogt', 'drying'],
  fan_only: ['ventileert', 'fan'], auto: ['auto', 'auto'], heat_cool: ['auto', 'auto'],
};

/**
 * The text block of a room: a headline (temperature, or any entity you pick) and short rows
 * with an icon, like "13 / 14 lampen aan", "366 ppm", "gordijnen open", "airco verwarmt · 21°".
 */
export function roomInfo(hass, room, S = settingsOf(null)) {
  const s = roomSummary(hass, room);
  const ids = areaEntities(hass, room.area_id);
  const st = (id) => hass.states[id];
  const rows = [];
  // headline
  let headline = '';
  if (room.headline && st(room.headline)) {
    const h = st(room.headline), dc = h.attributes.device_class;
    headline = dc === 'power' ? power(hass, h) : shortState(hass, h);
  } else if (s.temp && S.show_temp && !isNaN(parseFloat(s.temp.state))) headline = `${num(hass, s.temp.state)}°`;
  // lights
  if (s.lights.length && S.show_lights) {
    rows.push({ icon: s.lights.length > 1 ? 'mdi:lightbulb-group' : 'mdi:lightbulb', on: s.lit.length > 0,
      text: s.lights.length > 1 ? W(hass, `${s.lit.length} / ${s.lights.length} lampen aan`, `${s.lit.length} / ${s.lights.length} lights on`)
        : W(hass, s.lit.length ? 'lamp aan' : 'lamp uit', s.lit.length ? 'light on' : 'light off') });
  }
  // CO2
  const co2 = ids.map(st).find((x) => x && x.attributes.device_class === 'carbon_dioxide' && !isNaN(parseFloat(x.state)));
  if (co2 && S.show_co2 !== false) {
    const v = Math.round(parseFloat(co2.state));
    rows.push({ icon: 'mdi:molecule-co2', on: v > 1000, warn: v > 1000, text: `${v} ppm${v > 1000 ? W(hass, ' · luchten', ' · ventilate') : ''}` });
  }
  // humidity
  if (s.hum && S.show_hum && !isNaN(parseFloat(s.hum.state))) rows.push({ icon: 'mdi:water-percent', text: W(hass, `${Math.round(parseFloat(s.hum.state))}% vocht`, `${Math.round(parseFloat(s.hum.state))}% humidity`) });
  // covers
  const covers = ids.filter((id) => id.startsWith('cover.')).map(st).filter((x) => x && !['unavailable', 'unknown'].includes(x.state));
  if (covers.length && S.show_covers !== false) {
    const dc = covers[0].attributes.device_class;
    const word = (COVER_WORD[dc] || [covers.length > 1 ? 'zonwering' : 'zonwering', 'covers'])[NL(hass) ? 0 : 1];
    const pos = covers.map((c) => c.attributes.current_position ?? (c.state === 'open' ? 100 : 0));
    const avg = Math.round(pos.reduce((a, b) => a + b, 0) / pos.length);
    const what = avg >= 90 ? W(hass, 'open', 'open') : avg <= 10 ? W(hass, 'dicht', 'closed') : `${avg}%`;
    rows.push({ icon: 'mdi:curtains', on: avg > 10, text: `${word} ${what}` });
  }
  // climate
  const clim = ids.filter((id) => id.startsWith('climate.')).map(st).filter((x) => x && x.state !== 'unavailable')[0];
  if (clim && S.show_climate !== false) {
    const a = clim.attributes, cool = (a.hvac_modes || []).includes('cool');
    const what = (HVAC[a.hvac_action] || HVAC[clim.state] || [clim.state, clim.state])[NL(hass) ? 0 : 1];
    const name = cool ? 'airco' : W(hass, 'verwarming', 'heating');
    rows.push({ icon: cool ? 'mdi:air-conditioner' : 'mdi:thermostat', on: clim.state !== 'off',
      text: `${name} ${what}${clim.state !== 'off' && a.temperature != null ? ` · ${num(hass, a.temperature)}°` : ''}` });
  }
  // something playing
  const playing = ids.filter((id) => id.startsWith('media_player.')).map(st).find((x) => x && x.state === 'playing');
  if (playing && S.show_media !== false) rows.push({ icon: 'mdi:play-circle', on: true, text: `${friendly(hass, playing.entity_id)} ${W(hass, 'speelt', 'playing')}` });
  // extra rows the user picked for this room
  for (const id of room.info || []) {
    const x = st(id);
    if (!ok(x)) continue;
    rows.push({ entity: id, on: isOn(x), text: `${room.info_names?.[id] || friendly(hass, id)} · ${x.attributes.device_class === 'power' ? power(hass, x) : shortState(hass, x)}` });
  }
  return { headline, rows: rows.slice(0, S.info_rows ?? 5) };
}

/* ------------------------------------------------------------ greeting */
export function greeting(hass, now = new Date()) {
  const h = now.getHours();
  const g = h < 6 ? W(hass, 'Goedenacht', 'Good night') : h < 12 ? W(hass, 'Goedemorgen', 'Good morning') : h < 18 ? W(hass, 'Goedemiddag', 'Good afternoon') : W(hass, 'Goedenavond', 'Good evening');
  const home = Object.keys(hass.states).filter((id) => id.startsWith('person.') && hass.states[id].state === 'home').map((id) => friendly(hass, id));
  const list = home.length > 1 ? `${home.slice(0, -1).join(', ')} ${W(hass, '&', '&')} ${home[home.length - 1]}` : home[0];
  return { title: g, sub: home.length ? `${W(hass, 'Thuis', 'Home')}: ${list}` : W(hass, 'Niemand thuis', 'Nobody home') };
}

/* ---------------------------------------------------------- side column */
const find = (hass, test) => Object.keys(hass.states).sort().find((id) => test(id, hass.states[id]));

/** Fill in what the side column shows: your picks from the editor, otherwise sensible guesses. */
export function sideConfig(hass, plan) {
  const s = settingsOf(plan).side || {};
  const pw = (re, not) => find(hass, (id, st) => id.startsWith('sensor.') && st.attributes.device_class === 'power' && re.test(id) && !(not && not.test(id)) && ok(st));
  const auto = {
    weather: find(hass, (id, st) => id.startsWith('weather.') && ok(st)),
    buttons: Object.keys(hass.states).filter((id) => id.startsWith('scene.')).slice(0, 3),
    solar: pw(/pv|solar|zon|inverter|omvormer/),
    grid: pw(/dsmr|grid|p1|net_|consumption|verbruik/, /return|export|terug|delivered_to|produc/),
    grid_return: pw(/return|export|terug|produc/, /pv|solar|zon/),
    price: find(hass, (id, st) => id.startsWith('sensor.') && /\/kwh/i.test(st.attributes.unit_of_measurement || '') && ok(st)),
    solar_today: find(hass, (id, st) => id.startsWith('sensor.') && st.attributes.device_class === 'energy' && /pv|solar|zon/.test(id) && /today|vandaag|daily|dag/.test(id) && ok(st)),
    status: [...(plan?.items || []).map((i) => i.entity_id).filter((id) => id.startsWith('vacuum.')).slice(0, 1),
      ...Object.keys(hass.states).filter((id) => id.startsWith('media_player.') && hass.states[id].attributes.device_class === 'tv').slice(0, 1)],
  };
  const pick = (k) => (s[k] === undefined || s[k] === '' ? auto[k] : s[k]);
  return {
    weather: pick('weather'), main: s.main || '', buttons: (s.buttons?.length ? s.buttons : auto.buttons).filter((id) => hass.states[id]),
    solar: pick('solar'), grid: pick('grid'), grid_return: pick('grid_return'), price: pick('price'), solar_today: pick('solar_today'),
    status: (s.status?.length ? s.status : auto.status).filter((id) => hass.states[id]),
    names: s.names || {}, smart: s.smart || [], smart_on: s.smart_on || '',
  };
}

const WEATHER = {
  'clear-night': ['mdi:weather-night', 'helder', 'clear'], cloudy: ['mdi:weather-cloudy', 'bewolkt', 'cloudy'], fog: ['mdi:weather-fog', 'mist', 'fog'],
  hail: ['mdi:weather-hail', 'hagel', 'hail'], lightning: ['mdi:weather-lightning', 'onweer', 'thunder'], 'lightning-rainy': ['mdi:weather-lightning-rainy', 'onweer en regen', 'thunderstorm'],
  partlycloudy: ['mdi:weather-partly-cloudy', 'half bewolkt', 'partly cloudy'], pouring: ['mdi:weather-pouring', 'stortregen', 'pouring'],
  rainy: ['mdi:weather-rainy', 'regen', 'rain'], snowy: ['mdi:weather-snowy', 'sneeuw', 'snow'], 'snowy-rainy': ['mdi:weather-snowy-rainy', 'natte sneeuw', 'sleet'],
  sunny: ['mdi:weather-sunny', 'zonnig', 'sunny'], windy: ['mdi:weather-windy', 'winderig', 'windy'], 'windy-variant': ['mdi:weather-windy-variant', 'winderig', 'windy'],
  exceptional: ['mdi:alert-circle-outline', 'bijzonder', 'exceptional'],
};
export function weatherInfo(hass, id) {
  const st = id && hass.states[id];
  if (!ok(st)) return null;
  const a = st.attributes, w = WEATHER[st.state] || ['mdi:weather-cloudy', st.state, st.state];
  const parts = [w[NL(hass) ? 1 : 2]];
  if (a.apparent_temperature != null) parts.push(`${W(hass, 'voelt als', 'feels like')} ${num(hass, a.apparent_temperature, 0)}°`);
  if (a.wind_speed != null) parts.push(`${W(hass, 'wind', 'wind')} ${num(hass, a.wind_speed, 0)} ${a.wind_speed_unit || 'km/h'}`);
  return { icon: w[0], temp: a.temperature != null ? `${num(hass, a.temperature, 0)}°` : '', text: parts.join(' · ') };
}

/**
 * Start of a smart-button time slot in minutes after midnight: "06:30", "sunrise", "sunset",
 * or with an offset like "sunset-30" / "sunrise+45".
 */
export function slotStart(hass, from) {
  const m = String(from || '').trim().toLowerCase().match(/^(\d{1,2})[:.](\d{2})$/);
  if (m) return (+m[1] % 24) * 60 + +m[2];
  const sm = String(from || '').trim().toLowerCase().match(/^(sunrise|sunset|zonsopkomst|zonsondergang)\s*([+-]\s*\d+)?$/);
  if (!sm) return null;
  const rise = /rise|opkomst/.test(sm[1]);
  const at = hass.states['sun.sun']?.attributes?.[rise ? 'next_rising' : 'next_setting'];
  const d = at ? new Date(at) : null;
  const base = d && !isNaN(d) ? d.getHours() * 60 + d.getMinutes() : (rise ? 7 * 60 : 19 * 60);
  return (base + (sm[2] ? parseInt(sm[2].replace(/\s/g, ''), 10) : 0) + 1440) % 1440;
}

const SLOT_ICON = (name, mins) => /bed|nacht|night|slaap|sleep/i.test(name) ? 'mdi:bed' : /morgen|morning|ochtend|wake/i.test(name) ? 'mdi:weather-sunset-up'
  : /thuis|home|welkom|welcome/i.test(name) ? 'mdi:home-heart' : /uit|off/i.test(name) ? 'mdi:power' : mins < 300 || mins >= 1320 ? 'mdi:bed' : mins < 660 ? 'mdi:weather-sunset-up' : 'mdi:sofa';
const callFor = (id) => { const d = id.split('.')[0]; return [d, ['scene', 'script', 'automation'].includes(d) ? (d === 'automation' ? 'trigger' : 'turn_on') : d === 'button' || d === 'input_button' ? 'press' : 'toggle', { entity_id: id }]; };

/** The big button: "all lights off" (or your own script/scene) with what is on right now. */
export function mainAction(hass, plan, side, now = new Date()) {
  const lights = (plan.items || []).map((i) => i.entity_id).filter((id) => id.startsWith('light.') && hass.states[id]?.state === 'on');
  const rooms = [...new Set(plan.rooms.filter((r) => areaEntities(hass, r.area_id, ['light']).some((id) => hass.states[id].state === 'on')).map((r) => r.name))];
  const litText = rooms.length ? `${W(hass, 'Licht aan', 'Lights on')}: ${rooms.slice(0, 3).join(', ')}${rooms.length > 3 ? ' …' : ''}` : W(hass, 'Er brandt geen licht', 'No lights on');
  // smart button: a different name and action per part of the day, and another one while lights are on
  const slots = (side.smart || []).map((x) => ({ ...x, start: slotStart(hass, x.from) })).filter((x) => x.start !== null && (x.name || x.name_on));
  if (slots.length) {
    const mins = now.getHours() * 60 + now.getMinutes();
    slots.sort((a, b) => a.start - b.start);
    const slot = [...slots].reverse().find((x) => x.start <= mins) || slots[slots.length - 1];   // before the first slot = the last one of yesterday
    const onEnt = side.smart_on && hass.states[side.smart_on];
    const lit = onEnt ? isOn(onEnt) : lights.length > 0;
    const alt = lit && slot.name_on;
    const name = alt ? slot.name_on : slot.name || slot.name_on;
    const act = alt ? slot.action_on || slot.action : slot.action;
    const sub = (alt ? slot.sub_on : slot.sub) || (act && hass.states[act] ? friendly(hass, act) : litText);
    return { title: name, sub, on: lit, smart: true, icon: (alt ? slot.icon_on : slot.icon) || SLOT_ICON(name, slot.start),
      call: act && hass.states[act] ? callFor(act) : lights.length ? ['light', 'turn_off', { entity_id: lights }] : null };
  }
  if (side.main && hass.states[side.main]) {
    return { title: friendly(hass, side.main), sub: rooms.length ? `${W(hass, 'Licht aan', 'Lights on')}: ${rooms.slice(0, 3).join(', ')}` : W(hass, 'Alles is uit', 'Everything is off'),
      on: lights.length > 0, call: callFor(side.main) };
  }
  return { title: lights.length ? W(hass, 'Alles uit', 'All off') : W(hass, 'Alles is uit', 'All is off'),
    sub: rooms.length ? `${W(hass, 'Licht aan', 'Lights on')}: ${rooms.slice(0, 3).join(', ')}${rooms.length > 3 ? ' …' : ''}` : W(hass, 'Er brandt geen licht', 'No lights on'),
    on: lights.length > 0, call: lights.length ? ['light', 'turn_off', { entity_id: lights }] : null };
}

/** Solar / grid / price tile. */
export function energyInfo(hass, side) {
  const S = (id) => (id ? hass.states[id] : null);
  const sol = watts(S(side.solar)), imp = watts(S(side.grid)), exp = watts(S(side.grid_return));
  if (sol == null && imp == null) return null;
  const net = imp != null ? imp - (exp || 0) : null;
  const use = (sol || 0) + (net || 0);
  const pr = S(side.price), today = S(side.solar_today);
  const fmt = (w) => (w == null ? '–' : Math.abs(w) >= 1000 ? `${num(hass, w / 1000, 2)} kW` : `${Math.round(w)} W`);
  return {
    solar: sol != null ? fmt(sol) : null, net: fmt(net), exporting: net != null && net < 0,
    price: ok(pr) ? `€ ${num(hass, pr.state, 2, 2)}` : null,
    share: use > 0 && sol != null ? Math.max(0, Math.min(1, sol / use)) : null,
    today: ok(today) ? `${num(hass, today.state, 1)} kWh ${W(hass, 'zon vandaag', 'solar today')}` : '',
  };
}

const VAC = { docked: ['in dock', 'docked'], cleaning: ['zuigt', 'cleaning'], returning: ['terug naar dock', 'returning'], idle: ['wacht', 'idle'], paused: ['gepauzeerd', 'paused'], error: ['fout', 'error'] };
export function statusRow(hass, id, names = {}) {
  const st = hass.states[id];
  if (!st) return null;
  const d = id.split('.')[0];
  let v = shortState(hass, st);
  if (d === 'vacuum') v = (VAC[st.state] || [st.state, st.state])[NL(hass) ? 0 : 1];
  if (d === 'media_player') v = st.state === 'off' ? W(hass, 'uit', 'off') : st.state === 'playing' ? W(hass, 'speelt', 'playing') : v;
  if (!ok(st)) v = '–';
  return { id, name: names[id] || friendly(hass, id), value: v };
}
