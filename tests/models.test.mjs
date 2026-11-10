// node tests/models.test.mjs – bounded OBJ/glTF model loading.
import assert from 'node:assert/strict';
import { loadModel } from '../custom_components/floorplan_studio/frontend/fps-model.js';

const originalFetch = globalThis.fetch;
async function loadText(url, body, headers = {}) {
  globalThis.fetch = async () => new Response(body, { status: 200, headers });
  try { return await loadModel(url); }
  finally { globalThis.fetch = originalFetch; }
}

const obj = await loadText('chair.obj', 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n');
assert.equal(obj.tris, 1, 'a small OBJ mesh still loads');

const tooManyCorners = `v 0 0 0\nf ${Array(50004).fill('1').join(' ')}\n`;
await assert.rejects(loadText('oversized.obj', tooManyCorners), /50,000 triangle limit/);

const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
const bytes = new Uint8Array(positions.buffer);
const gltf = (viewLength = bytes.length) => JSON.stringify({
  asset: { version: '2.0' },
  buffers: [{ byteLength: bytes.length, uri: `data:application/octet-stream;base64,${Buffer.from(bytes).toString('base64')}` }],
  bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: viewLength }],
  accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
});
assert.equal((await loadText('chair.gltf', gltf())).tris, 1, 'an embedded glTF mesh still loads');
await assert.rejects(loadText('bad-accessor.gltf', gltf(35)), /outside its bufferView/);

await assert.rejects(
  loadText('oversized.obj', '', { 'content-length': String(12 * 1024 * 1024 + 1) }),
  /larger than the 12 MiB limit/,
);

console.log('model limits ok');
