// node tests/walls.test.mjs
import assert from 'node:assert/strict';
import { computeWalls, nearestWall } from '../custom_components/floorplan_studio/frontend/fps-core.js';

const rooms = [
  { id: 'a', rects: [[0, 0, 100, 100]] },
  { id: 'b', rects: [[100, 0, 200, 100], [100, 100, 150, 150]] }, // L-shape
];
const w = computeWalls(rooms);
const inner = w.filter((x) => x.kind === 'inner');
assert.equal(inner.length, 1, 'one shared wall between a and b');
assert.deepEqual([inner[0].x1, inner[0].y1, inner[0].x2, inner[0].y2], [100, 0, 100, 100]);
// no wall inside room b between its two parts
assert.ok(!w.some((x) => x.dir === 'h' && x.y1 === 100 && x.x1 >= 100 && x.x2 <= 150), 'no wall between parts of the same room');
// outer walls exist around the L
assert.ok(w.some((x) => x.kind === 'outer' && x.dir === 'h' && x.y1 === 150 && x.x1 === 100 && x.x2 === 150));
assert.ok(w.some((x) => x.kind === 'outer' && x.dir === 'h' && x.y1 === 100 && x.x1 === 150 && x.x2 === 200));
assert.equal(nearestWall(w, 101, 50).kind, 'inner');
console.log('walls ok:', w.length, 'segments');

// sun factor: night / dusk / day
import { sunFactor } from '../custom_components/floorplan_studio/frontend/fps-core.js';
const day = new Date(); day.setHours(12, 0, 0, 0);
const at = (h, m = 0) => { const d = new Date(day); d.setHours(h, m); return d.getTime(); };
const sunNoon = { state: 'above_horizon', attributes: { next_rising: new Date(at(8) + 864e5).toISOString(), next_setting: new Date(at(18)).toISOString() } };
assert.equal(sunFactor(sunNoon, at(12)), 1, 'midday = full daylight');
const sunEvening = { state: 'below_horizon', attributes: { next_rising: new Date(at(8) + 864e5).toISOString(), next_setting: new Date(at(18) + 864e5).toISOString() } };
assert.ok(sunFactor(sunEvening, at(18, 15)) > 0.1 && sunFactor(sunEvening, at(18, 15)) < 0.9, 'just after sunset = dusk');
assert.equal(sunFactor(sunEvening, at(22)), 0, 'late evening = night');
const sunMorning = { state: 'below_horizon', attributes: { next_rising: new Date(at(8)).toISOString(), next_setting: new Date(at(18)).toISOString() } };
assert.equal(sunFactor(sunMorning, at(5)), 0, 'early morning = night');
assert.ok(sunFactor(sunMorning, at(8)) > 0.2, 'sunrise = getting light');
console.log('sun ok');
