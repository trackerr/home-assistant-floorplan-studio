import assert from 'node:assert/strict';
import { qualityForDevice } from '../custom_components/floorplan_studio/frontend/fps-quality.js';

const s24 = {
  hardwareConcurrency: 8,
  deviceMemory: 0,
  userAgent: 'Mozilla/5.0 (Linux; Android 15; SM-S928B) Mobile Safari/537.36',
  platform: 'Android',
  coarsePointer: true,
  touchPoints: 10,
};

assert.equal(qualityForDevice({ hardwareConcurrency: 24, deviceMemory: 0, finePointer: true }).name, 'high');
assert.equal(qualityForDevice({ hardwareConcurrency: 8, deviceMemory: 0, finePointer: true }).name, 'balanced');
assert.deepEqual(qualityForDevice(s24), { name: 'mobile-high', pixels: 2_100_000, dpr: 2, fps: 60, lights: 24, matrix: 24 });
assert.equal(qualityForDevice({ ...s24, deviceMemory: 8 }).name, 'high');
assert.equal(qualityForDevice({ ...s24, deviceMemory: 4 }).name, 'balanced');
assert.equal(qualityForDevice({ ...s24, deviceMemory: 2 }).name, 'low');
assert.equal(qualityForDevice({ ...s24, userAgent: 'Mozilla/5.0 (Linux; Android 14; Android TV)', deviceMemory: 8 }).name, 'low');
assert.equal(qualityForDevice({ hardwareConcurrency: 8, userAgent: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.5)', deviceMemory: 8 }).name, 'low');

console.log('quality tiers ok');
