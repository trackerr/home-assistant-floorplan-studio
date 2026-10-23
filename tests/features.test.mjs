// node tests/features.test.mjs – temperature colours, presence, alerts, shared theme, generated dashboard
import assert from 'node:assert/strict';
import fs from 'node:fs';
globalThis.customElements = { get: (t) => (t === 'advanced-camera-card' ? class {} : undefined) };
const core = await import('../custom_components/floorplan_studio/frontend/fps-core.js');
const { buildDashboard } = await import('../custom_components/floorplan_studio/frontend/fps-dashboard.js');
const { tempColor, roomPresence, roomAlerts, themeFromEntity, roomPath, settingsOf, planVacuum } = core;

// fake hass in the shape HA gives the frontend (fictional data)
const S = (state, attributes = {}) => ({ state, attributes });
const st = {
  'binary_sensor.motion_keuken': S('on', { device_class: 'motion' }),
  'binary_sensor.keuken_dog_occupancy': S('on', { device_class: 'occupancy' }),
  'binary_sensor.rook_keuken': S('off', { device_class: 'smoke' }),
  'binary_sensor.achterdeur': S('on', { device_class: 'door' }),
  'binary_sensor.lek_bad': S('on', { device_class: 'moisture' }),
  'person.anna': S('home'), 'sensor.anna_room': S('Keuken'),
  'person.tom': S('not_home'), 'sensor.tom_room': S('keuken'),
  'input_select.thema': S('Rock', { options: ['Warm', 'Rock'] }),
  'vacuum.robby': S('docked'), 'weather.home': S('sunny'),
  'camera.tuin': S('streaming', { friendly_name: 'Tuin' }), 'media_player.tv': S('on'),
};
for (const id of Object.keys(st)) st[id].entity_id = id;
const area = (id) => ({ 'binary_sensor.motion_keuken': 'keuken', 'binary_sensor.keuken_dog_occupancy': 'keuken', 'binary_sensor.rook_keuken': 'keuken',
  'binary_sensor.achterdeur': 'keuken', 'binary_sensor.lek_bad': 'bad', 'camera.tuin': 'tuin' }[id] || null);
const hass = {
  states: st, entities: Object.fromEntries(Object.keys(st).map((id) => [id, { entity_id: id, area_id: area(id) }])),
  areas: { keuken: { area_id: 'keuken', name: 'Keuken' }, bad: { area_id: 'bad', name: 'Badkamer' }, tuin: { area_id: 'tuin', name: 'Tuin' } }, devices: {},
  connection: { sendMessagePromise: async () => { throw new Error('no energy'); } },
};
const keuken = { id: 'r1', name: 'Keuken', area_id: 'keuken', rects: [[0, 0, 100, 100]] };
const bad = { id: 'r2', name: 'Badkamer', area_id: 'bad', rects: [[100, 0, 200, 100]] };

// temperature colours: cold is blue, warm is red, clamped outside the range
assert.equal(tempColor(10, 17, 24), '70,140,255');
assert.equal(tempColor(30, 17, 24), '255,80,50');
const mid = tempColor(20.5, 17, 24).split(',').map(Number);
assert.ok(mid[1] > mid[0] && mid[1] > mid[2], 'comfortable is green-ish');

// presence: motion counts, a dog does not, people follow their room sensor unless away
const s = { ...settingsOf({}), people: { 'person.anna': 'sensor.anna_room', 'person.tom': 'sensor.tom_room' } };
const p = roomPresence(hass, keuken, s);
assert.deepEqual(p.by, ['binary_sensor.motion_keuken']);
assert.deepEqual(p.people, ['person.anna']);
assert.equal(p.occupied, true);
assert.equal(roomPresence(hass, bad, s).occupied, false);

// alerts: an open door is a warning, a leak is an alarm, both can be switched off
assert.equal(roomAlerts(hass, keuken, s).level, 'warn');
assert.equal(roomAlerts(hass, bad, s).level, 'alarm');
assert.equal(roomAlerts(hass, keuken, { ...s, alert_open: false }).level, null);
st['binary_sensor.rook_keuken'].state = 'on';
assert.equal(roomAlerts(hass, keuken, s).level, 'alarm');
assert.equal(roomAlerts(hass, bad, { ...s, alerts: false }).level, null);

// shared theme from a helper (by label or key)
assert.equal(themeFromEntity(hass, { theme_entity: 'input_select.thema' }), 'rock');
assert.equal(themeFromEntity(hass, { theme_entity: '' }), null);

// room pages and vacuum lookup
assert.equal(roomPath({ name: 'Kinder kamer 2' }), 'ruimte-kinder-kamer-2');
assert.equal(planVacuum(hass, { items: [{ entity_id: 'vacuum.robby' }] }), 'vacuum.robby');

// generated dashboard: home page, tabs, kiosk menu, a page per room, HACS card when present
const plan = JSON.parse(fs.readFileSync(new URL('../examples/voorbeeldhuis.json', import.meta.url)));
plan.rooms = [keuken, bad];
const d = await buildDashboard(hass, plan, true);
const paths = d.views.map((v) => v.path);
assert.deepEqual(paths.slice(0, 3), ['thuis', 'plan', 'kiosk']);
assert.ok(paths.includes('ruimte-keuken') && paths.includes('ruimte-badkamer'));
const roomView = d.views.find((v) => v.path === 'ruimte-keuken');
assert.equal(roomView.subview, true);
assert.equal(roomView.cards[0].room, 'r1');
assert.ok(d.views.find((v) => v.path === 'kiosk').cards[0].nav.some((n) => n.path === 'plan'));
assert.ok(d.views.find((v) => v.path === 'buiten').header.card.type === 'custom:floorplan-studio-nav');
assert.ok(JSON.stringify(d).includes('custom:advanced-camera-card'));
const noHome = await buildDashboard(hass, plan, true, { home: false });
assert.equal(noHome.views[0].path, 'plan');
console.log('features ok');
// a boiler flame ("heat") or NAS status ("safety") must never raise an alarm
st['binary_sensor.flame'] = { entity_id: 'binary_sensor.flame', state: 'on', attributes: { device_class: 'heat' } };
hass.entities['binary_sensor.flame'] = { entity_id: 'binary_sensor.flame', area_id: 'bad' };
st['binary_sensor.lek_bad'].state = 'off';
assert.equal(roomAlerts(hass, bad, s).level, null);
console.log('no false alarms ok');
// helper options in Dutch
assert.equal(core.themeKey('Automatisch (zon)'), 'sun');
assert.equal(core.themeKey('Glas'), 'glass');
assert.equal(core.themeKey('High-tech'), 'hightech');
console.log('theme aliases ok');

// room text rows, greeting and side column (fps-info.js)
const info = await import('../custom_components/floorplan_studio/frontend/fps-info.js');
const H2 = {
  states: {}, entities: {}, areas: { woon: { area_id: 'woon', name: 'Woonkamer' } }, devices: {}, locale: { language: 'nl' },
};
const add = (id, state, attributes = {}, area = null) => { H2.states[id] = { entity_id: id, state, attributes }; H2.entities[id] = { entity_id: id, area_id: area }; };
add('light.a', 'on', {}, 'woon'); add('light.b', 'off', {}, 'woon');
add('sensor.t', '21.26', { device_class: 'temperature' }, 'woon'); add('sensor.co2', '1200', { device_class: 'carbon_dioxide' }, 'woon');
add('cover.g', 'open', { device_class: 'curtain', current_position: 100 }, 'woon');
add('climate.ac', 'cool', { hvac_modes: ['off', 'cool'], hvac_action: 'cooling', temperature: 21 }, 'woon');
add('person.anna', 'home', { friendly_name: 'Anna' }); add('person.tom', 'home', { friendly_name: 'Tom' }); add('person.x', 'not_home', { friendly_name: 'X' });
add('weather.w', 'cloudy', { temperature: 15.2, apparent_temperature: 13, wind_speed: 29, wind_speed_unit: 'km/h' });
add('sensor.pv_power', '1600', { device_class: 'power', unit_of_measurement: 'W' });
add('sensor.dsmr_power_consumption', '0.49', { device_class: 'power', unit_of_measurement: 'kW' });
add('scene.avond', 'x', { friendly_name: 'Avond' });
const ri = info.roomInfo(H2, { id: 'r', name: 'Woonkamer', area_id: 'woon', rects: [[0, 0, 10, 10]] }, core.settingsOf({}));
assert.equal(ri.headline, '21,3°');
assert.deepEqual(ri.rows.map((r) => r.text), ['1 / 2 lampen aan', '1200 ppm · luchten', 'gordijnen open', 'airco koelt · 21°']);
assert.ok(ri.rows[1].warn);
assert.equal(info.greeting(H2, new Date(2026, 9, 23, 14)).title, 'Goedemiddag');
assert.equal(info.greeting(H2, new Date(2026, 9, 23, 14)).sub, 'Thuis: Anna & Tom');
const side = info.sideConfig(H2, { items: [], rooms: [], settings: {} });
assert.equal(side.weather, 'weather.w'); assert.equal(side.solar, 'sensor.pv_power'); assert.equal(side.grid, 'sensor.dsmr_power_consumption');
assert.deepEqual(side.buttons, ['scene.avond']);
const en = info.energyInfo(H2, side);
assert.equal(en.solar, '1,6 kW'); assert.equal(en.net, '490 W');
assert.equal(info.weatherInfo(H2, 'weather.w').text, 'bewolkt · voelt als 13° · wind 29 km/h');
const ma = info.mainAction(H2, { items: [{ entity_id: 'light.a' }], rooms: [{ name: 'Woonkamer', area_id: 'woon' }] }, side);
assert.equal(ma.title, 'Alles uit'); assert.deepEqual(ma.call, ['light', 'turn_off', { entity_id: ['light.a'] }]);
console.log('room info / side ok');
// a sensor without a value (just after a restart) leaves no "°" or "NaN"
H2.states['sensor.t'].state = 'unavailable';
add('sensor.h', 'unknown', { device_class: 'humidity' }, 'woon');
const ri2 = info.roomInfo(H2, { id: 'r', name: 'Woonkamer', area_id: 'woon', rects: [[0, 0, 10, 10]], humidity: 'sensor.h' }, core.settingsOf({}));
assert.equal(ri2.headline, '');
assert.ok(!ri2.rows.some((r) => /NaN/.test(r.text)));
console.log('no NaN ok');
// smart button: name and action per part of the day, another one while lights are on
add('sun.sun', 'above_horizon', { next_rising: '2026-10-24T08:12:00', next_setting: '2026-10-23T18:30:00' });
add('script.bed', 'off', { friendly_name: 'Bed' }); add('scene.morgen', 'x', { friendly_name: 'Morgen' }); add('scene.thuis', 'x', { friendly_name: 'Thuis' });
const smart = { smart: [
  { from: '05:00', name: 'Goedemorgen', action: 'scene.morgen', sub: 'Gordijnen open' },
  { from: 'sunset-30', name: 'Thuiskomen', action: 'scene.thuis', name_on: 'Alles uit' },
  { from: '22:00', name: 'Naar bed', action: 'script.bed' },
] };
const P = { items: [{ entity_id: 'light.a' }], rooms: [{ name: 'Woonkamer', area_id: 'woon' }] };
assert.equal(info.slotStart(H2, 'sunset-30'), 18 * 60);
assert.equal(info.slotStart(H2, '6.45'), 6 * 60 + 45);
H2.states['light.a'].state = 'off';
let m = info.mainAction(H2, P, smart, new Date(2026, 9, 23, 7, 0));
assert.equal(m.title, 'Goedemorgen'); assert.equal(m.sub, 'Gordijnen open'); assert.deepEqual(m.call, ['scene', 'turn_on', { entity_id: 'scene.morgen' }]);
m = info.mainAction(H2, P, smart, new Date(2026, 9, 23, 19, 0));
assert.equal(m.title, 'Thuiskomen'); assert.equal(m.icon, 'mdi:home-heart');
H2.states['light.a'].state = 'on';
m = info.mainAction(H2, P, smart, new Date(2026, 9, 23, 19, 0));
assert.equal(m.title, 'Alles uit'); assert.deepEqual(m.call, ['scene', 'turn_on', { entity_id: 'scene.thuis' }]);
m = info.mainAction(H2, P, smart, new Date(2026, 9, 23, 2, 0));          // after midnight = still yesterday's last slot
assert.equal(m.title, 'Naar bed'); assert.equal(m.icon, 'mdi:bed'); assert.deepEqual(m.call, ['script', 'turn_on', { entity_id: 'script.bed' }]);
const smart2 = { ...smart, smart: [{ from: '00:00', name: 'Slaap lekker', name_on: 'Alles uit' }] };   // no action = lights off
m = info.mainAction(H2, P, smart2, new Date(2026, 9, 23, 23, 0));
assert.deepEqual(m.call, ['light', 'turn_off', { entity_id: ['light.a'] }]);
console.log('smart button ok');
// every option of the user's theme helper maps to a theme (no "invalid option" when picking from the card)
for (const o of ['Automatisch (zon)', 'Warm', 'High-tech', 'Blueprint', 'Glas', 'Terminal', 'Rock']) assert.ok(core.themeKey(o), o);
console.log('theme helper options ok');
