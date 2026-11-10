import assert from 'node:assert/strict';
import { roomTransform, transformPoint4, transformDirection4, xrViewProjection, xrStickInput } from '../custom_components/floorplan_studio/frontend/fps-webxr.js';

const close = (actual, expected) => actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-5, `${v} != ${expected[i]}`));

const room = roomTransform(Math.PI / 2, 10, 20, 1.62);
close(transformPoint4(room.worldFromReference, [0, 0, 0]), [10, 1.62, 20]);
close(transformDirection4(room.worldFromReference, [0, 0, -1]), [-1, 0, 0]);
const worldPoint = [13, 2.1, 26];
close(transformPoint4(room.worldFromReference, transformPoint4(room.referenceFromWorld, worldPoint)), worldPoint);
close([...xrViewProjection(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]))], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

assert.deepEqual(xrStickInput([
  { handedness: 'left', gamepad: { axes: [0.18, -1] } },
  { handedness: 'right', gamepad: { axes: [0.59, 0] } },
]), { moveX: 0, moveY: -1, turnX: 0.5 });
assert.deepEqual(xrStickInput([]), { moveX: 0, moveY: 0, turnX: 0 });

console.log('WebXR transforms and controller controls ok');
