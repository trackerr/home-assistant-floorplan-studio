/**
 * Your own 3D models (furniture): read a .glb / .gltf (embedded) or .obj into plain triangles
 * { pos, nor, col } (Float32Arrays, three numbers per corner) with the bounding box.
 * Colours come from the material colour, vertex colours, or the texture (sampled per corner),
 * so a textured model still looks like itself without a texture pipeline in the walk.
 */
const MAX_TRIS = 50000;
const MAX_MODEL_BYTES = 12 * 1024 * 1024;
const MAX_BUFFER_BYTES = 12 * 1024 * 1024;
const MAX_DECODED_ELEMENTS = 2500000;
const MAX_NODES = 4096;
const MAX_NODE_DEPTH = 256;
const MAX_TEXTURE_BYTES = 8 * 1024 * 1024;
const MAX_TEXTURE_SOURCE_PIXELS = 4096 * 4096;
const MAX_TEXTURE_SAMPLE_PIXELS = 4194304;
const MAX_OBJ_VERTICES = 250000;
const MAX_OBJ_NORMALS = 250000;
const MAX_OBJ_LINE_CHARS = 4 * 1024 * 1024;
const MAX_PRIMITIVES = 4096;

function limitError(message) {
  const error = new Error(message);
  error.modelLimit = true;
  return error;
}

async function readBounded(resp) {
  const declared = Number(resp.headers?.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_MODEL_BYTES) throw limitError('Model is larger than the 12 MiB limit');
  if (resp.body?.getReader) {
    const reader = resp.body.getReader(), chunks = [];
    let size = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > MAX_MODEL_BYTES) {
          await reader.cancel().catch(() => {});
          throw limitError('Model is larger than the 12 MiB limit');
        }
        chunks.push(part.value);
      }
    } finally {
      try { reader.releaseLock(); } catch { /* the stream may already be cancelled */ }
    }
    const bytes = new Uint8Array(size);
    let off = 0;
    for (const chunk of chunks) { bytes.set(chunk, off); off += chunk.byteLength; }
    return bytes.buffer;
  }
  const buf = await resp.arrayBuffer();
  if (buf.byteLength > MAX_MODEL_BYTES) throw limitError('Model is larger than the 12 MiB limit');
  return buf;
}

export async function loadModel(url) {
  const resp = await fetch(url, { credentials: 'same-origin' });
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
  const buf = await readBounded(resp);
  const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase();
  const head = new Uint8Array(buf, 0, Math.min(4, buf.byteLength));
  if (ext === 'obj') return finish(parseObj(new TextDecoder().decode(buf)));
  if (head[0] === 0x67 && head[1] === 0x6c && head[2] === 0x54 && head[3] === 0x46) return finish(await parseGlb(buf));
  return finish(await parseGltf(JSON.parse(new TextDecoder().decode(buf)), []));
}

/* ---------------------------------------------------------------- glTF */
async function parseGlb(buf) {
  if (buf.byteLength < 12) throw new Error('Invalid GLB header');
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('Invalid GLB magic');
  if (dv.getUint32(4, true) !== 2) throw new Error('glTF 2 only');
  if (dv.getUint32(8, true) !== buf.byteLength) throw new Error('Invalid GLB length');
  let off = 12, json = null, chunkCount = 0;
  const bins = [];
  while (off + 8 <= buf.byteLength) {
    if (++chunkCount > MAX_NODES) throw limitError('The GLB model has too many chunks');
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true), start = off + 8;
    if (len > buf.byteLength - start) throw new Error('Invalid GLB chunk length');
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, start, len)));
    else if (type === 0x004e4942) bins.push(buf.slice(start, start + len));
    off = start + len + ((4 - (len % 4)) % 4);
  }
  if (off !== buf.byteLength) throw new Error('Invalid GLB chunk alignment');
  if (!json) throw new Error('no glTF data');
  return parseGltf(json, bins);
}

const COMP = { 5120: [Int8Array, 1], 5121: [Uint8Array, 1], 5122: [Int16Array, 2], 5123: [Uint16Array, 2], 5125: [Uint32Array, 4], 5126: [Float32Array, 4] };
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const NORM = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };

function imageSize(bytes) {
  const ascii = (off, value) => value.split('').every((c, i) => bytes[off + i] === c.charCodeAt(0));
  const u16 = (off) => (bytes[off] << 8) | bytes[off + 1];
  const u24le = (off) => bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16);
  if (bytes.length >= 24 && bytes[0] === 137 && ascii(1, 'PNG') && ascii(12, 'IHDR')) {
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: v.getUint32(16, false), height: v.getUint32(20, false) };
  }
  if (bytes.length >= 10 && ascii(0, 'GIF8')) return { width: bytes[6] | (bytes[7] << 8), height: bytes[8] | (bytes[9] << 8) };
  if (bytes.length >= 26 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: Math.abs(v.getInt32(18, true)), height: Math.abs(v.getInt32(22, true)) };
  }
  if (bytes.length >= 30 && ascii(0, 'RIFF') && ascii(8, 'WEBP')) {
    if (ascii(12, 'VP8X')) return { width: u24le(24) + 1, height: u24le(27) + 1 };
    if (ascii(12, 'VP8 ') && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      return { width: ((bytes[27] & 0x3f) << 8) | bytes[26], height: ((bytes[29] & 0x3f) << 8) | bytes[28] };
    }
    if (ascii(12, 'VP8L') && bytes[20] === 0x2f) {
      const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let off = 2;
    while (off + 4 <= bytes.length) {
      if (bytes[off] !== 0xff) { off++; continue; }
      while (off < bytes.length && bytes[off] === 0xff) off++;
      if (off >= bytes.length) break;
      const marker = bytes[off++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (off + 2 > bytes.length) break;
      const len = u16(off);
      if (len < 2 || off + len > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && len >= 7) {
        return { height: u16(off + 3), width: u16(off + 5) };
      }
      off += len;
    }
  }
  return null;
}

async function parseGltf(g, bins) {
  if (!g || typeof g !== 'object' || Array.isArray(g)) throw new Error('Invalid glTF document');
  const used = new Set(g.extensionsRequired || []);
  if (used.has('KHR_draco_mesh_compression') || used.has('EXT_meshopt_compression')) throw new Error('compressed (Draco/meshopt): export without compression');
  const integer = (v) => Number.isSafeInteger(v) && v >= 0;
  const gltfArray = (value, name) => {
    if (value == null) return [];
    if (!Array.isArray(value)) throw new Error(`Invalid glTF ${name}`);
    if (value.length > MAX_NODES) throw limitError(`The glTF model has too many ${name}`);
    return value;
  };
  const bufferDefs = gltfArray(g.buffers, 'buffers');
  let bufferBytes = 0;
  const buffers = bufferDefs.map((b, i) => {
    if (!b || typeof b !== 'object') throw new Error('Invalid glTF buffer');
    let buf;
    if (b.uri == null) buf = bins[i] ?? (bins.length === 1 ? bins[0] : null);
    else if (typeof b.uri === 'string' && b.uri.startsWith('data:')) {
      const comma = b.uri.indexOf(',');
      if (comma < 0 || b.uri.length - comma > MAX_MODEL_BYTES * 2) throw new Error('Invalid embedded glTF buffer');
      const encoded = b.uri.slice(comma + 1);
      if (encoded.length > MAX_BUFFER_BYTES * 4 / 3 + 8) throw limitError('Embedded glTF buffers exceed the 12 MiB decoded limit');
      const s = atob(encoded), a = new Uint8Array(s.length);
      for (let k = 0; k < s.length; k++) a[k] = s.charCodeAt(k);
      buf = a.buffer;
    } else throw new Error('External .bin files are not supported; use .glb');
    if (!(buf instanceof ArrayBuffer)) throw new Error('Missing glTF buffer data; use an embedded .glb or data URI');
    if (!integer(b.byteLength) || b.byteLength > buf.byteLength) throw new Error('Invalid glTF buffer length');
    bufferBytes += buf.byteLength;
    if (bufferBytes > MAX_BUFFER_BYTES) throw limitError('Decoded glTF buffers exceed the 12 MiB limit');
    return buf;
  });
  const bufferViews = gltfArray(g.bufferViews, 'bufferViews');
  const viewBytes = (vi) => {
    if (!integer(vi) || !bufferViews[vi]) throw new Error('Invalid glTF bufferView reference');
    const v = bufferViews[vi], buf = buffers[v.buffer], off = v.byteOffset == null ? 0 : v.byteOffset, len = v.byteLength;
    if (!integer(v.buffer) || !(buf instanceof ArrayBuffer) || !integer(off) || !integer(len) || off + len > buf.byteLength) throw new Error('glTF bufferView is outside its buffer');
    const stride = v.byteStride == null ? 0 : v.byteStride;
    if (stride && (!integer(stride) || stride < 4 || stride > 252 || stride % 4 !== 0)) throw new Error('Invalid glTF bufferView stride');
    return { buf, off, len, stride };
  };
  const accessors = gltfArray(g.accessors, 'accessors');
  const accessorMeta = (ai) => {
    if (!integer(ai) || !accessors[ai] || typeof accessors[ai] !== 'object') throw new Error('Invalid glTF accessor reference');
    const a = accessors[ai], n = NCOMP[a.type], component = COMP[a.componentType];
    if (!n || !component) throw new Error('Unsupported glTF accessor type or component type');
    if (!integer(a.count) || a.count === 0) throw new Error('Invalid glTF accessor count');
    const elements = a.count * n;
    if (!Number.isSafeInteger(elements) || elements > MAX_DECODED_ELEMENTS) throw limitError('A glTF accessor exceeds the decoded data limit');
    if (a.sparse) throw new Error('Sparse glTF accessors are not supported');
    const [Type, size] = component;
    if (a.bufferView == null) {
      if (a.byteOffset != null && a.byteOffset !== 0) throw new Error('Invalid glTF accessor byte offset');
      return { a, n, Type, size, elements, view: null, base: 0, stride: n * size };
    }
    const view = viewBytes(a.bufferView), byteOffset = a.byteOffset == null ? 0 : a.byteOffset;
    if (!integer(byteOffset) || byteOffset % size !== 0) throw new Error('Invalid glTF accessor byte offset');
    const stride = view.stride || n * size;
    if (stride < n * size || stride % size !== 0) throw new Error('glTF accessor does not fit its bufferView stride');
    const base = view.off + byteOffset, end = a.count === 0 ? base : base + (a.count - 1) * stride + n * size;
    if (!Number.isSafeInteger(end) || end > view.off + view.len || end > view.buf.byteLength) throw new Error('glTF accessor is outside its bufferView');
    return { a, n, Type, size, elements, view, base, stride };
  };
  const accessorCache = new Map();
  let decodedElements = 0;
  // an accessor as a flat array of numbers (normalised integers become 0..1)
  const acc = (ai) => {
    if (accessorCache.has(ai)) return accessorCache.get(ai);
    const meta = accessorMeta(ai), { a, n, size, elements, view, base, stride } = meta;
    if (decodedElements + elements > MAX_DECODED_ELEMENTS) throw limitError('The glTF model exceeds the decoded data limit');
    decodedElements += elements;
    const out = new Float32Array(elements);
    if (!view) { accessorCache.set(ai, out); return out; }
    const dv = new DataView(view.buf);
    const rd = { 5120: (o) => dv.getInt8(o), 5121: (o) => dv.getUint8(o), 5122: (o) => dv.getInt16(o, true), 5123: (o) => dv.getUint16(o, true), 5125: (o) => dv.getUint32(o, true), 5126: (o) => dv.getFloat32(o, true) }[a.componentType];
    const k = a.normalized && NORM[a.componentType] ? 1 / NORM[a.componentType] : 1;
    for (let i = 0; i < a.count; i++) for (let c = 0; c < n; c++) out[i * n + c] = rd(base + i * stride + c * size) * k;
    accessorCache.set(ai, out);
    return out;
  };
  // Decode only bounded images, then retain the same 256px colour-sampling grid.
  const texCache = new Map(), imageCache = new Map();
  let textureBytes = 0, textureSamplePixels = 0;
  const texture = async (ti) => {
    if (texCache.has(ti)) return texCache.get(ti);
    const textureDef = g.textures?.[ti], imageIndex = textureDef?.source;
    if (!integer(ti) || !textureDef || !integer(imageIndex) || !g.images?.[imageIndex]) return null;
    if (imageCache.has(imageIndex)) { const cached = imageCache.get(imageIndex); texCache.set(ti, cached); return cached; }
    const p = (async () => {
      let bmp;
      try {
        const src = g.images?.[imageIndex];
        if (!src) return null;
        let blob;
        if (src.bufferView != null) {
          const v = viewBytes(src.bufferView);
          if (v.len > MAX_TEXTURE_BYTES || textureBytes + v.len > MAX_TEXTURE_BYTES) throw limitError('Embedded textures exceed the 8 MiB image-data limit');
          blob = new Blob([new Uint8Array(v.buf, v.off, v.len)], { type: src.mimeType || 'image/png' });
        }
        else if (typeof src.uri === 'string' && src.uri.startsWith('data:')) {
          const comma = src.uri.indexOf(',');
          if (comma < 0 || src.uri.length - comma > MAX_MODEL_BYTES * 2) throw new Error('Invalid embedded texture data');
          const encoded = src.uri.slice(comma + 1);
          if (encoded.length > MAX_TEXTURE_BYTES * 4 / 3 + 8) throw limitError('Embedded textures exceed the 8 MiB image-data limit');
          blob = await (await fetch(src.uri)).blob();
          if (blob.size > MAX_TEXTURE_BYTES || textureBytes + blob.size > MAX_TEXTURE_BYTES) throw limitError('Embedded textures exceed the 8 MiB image-data limit');
        }
        else return null;
        if (blob.size > MAX_TEXTURE_BYTES || textureBytes + blob.size > MAX_TEXTURE_BYTES) throw limitError('Embedded textures exceed the 8 MiB image-data limit');
        const bytes = new Uint8Array(await blob.arrayBuffer());
        if (bytes.byteLength > MAX_TEXTURE_BYTES || textureBytes + bytes.byteLength > MAX_TEXTURE_BYTES) throw limitError('Embedded textures exceed the 8 MiB image-data limit');
        const dimensions = imageSize(bytes);
        if (!dimensions || !Number.isSafeInteger(dimensions.width) || !Number.isSafeInteger(dimensions.height) || dimensions.width < 1 || dimensions.height < 1) return null;
        const sourcePixels = dimensions.width * dimensions.height;
        if (!Number.isSafeInteger(sourcePixels) || dimensions.width > 4096 || dimensions.height > 4096 || sourcePixels > MAX_TEXTURE_SOURCE_PIXELS) {
          throw limitError('Texture images must be no larger than 4096 × 4096 pixels');
        }
        const W = Math.min(256, dimensions.width), H = Math.min(256, dimensions.height), samplePixels = W * H;
        if (textureSamplePixels + samplePixels > MAX_TEXTURE_SAMPLE_PIXELS) throw limitError('Textures exceed the decoded sampling limit');
        textureBytes += bytes.byteLength;
        textureSamplePixels += samplePixels;
        try { bmp = await createImageBitmap(blob, { resizeWidth: W, resizeHeight: H, resizeQuality: 'high' }); }
        catch { return null; }
        if (bmp.width !== W || bmp.height !== H) { bmp.close?.(); bmp = null; return null; }
        const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
        const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0, W, H);
        const decoded = { W, H, px: cx.getImageData(0, 0, W, H).data };
        imageCache.set(imageIndex, decoded);
        return decoded;
      } catch (err) {
        if (err?.modelLimit) throw err;
        return null;
      } finally { bmp?.close?.(); }
    })();
    texCache.set(ti, p);
    imageCache.set(imageIndex, p);
    return p;
  };
  const srgb = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const materialDefs = gltfArray(g.materials, 'materials');
  gltfArray(g.images, 'images');
  gltfArray(g.textures, 'textures');
  const mats = await Promise.all(materialDefs.map(async (m) => {
    if (!m || typeof m !== 'object') throw new Error('Invalid glTF material');
    const pbr = m.pbrMetallicRoughness || {};
    if (typeof pbr !== 'object' || Array.isArray(pbr)) throw new Error('Invalid glTF PBR material');
    const f = pbr.baseColorFactor || [1, 1, 1, 1];
    if (!Array.isArray(f) || f.length !== 4 || !f.every(Number.isFinite)) throw new Error('Invalid glTF base color factor');
    const info = pbr.baseColorTexture;
    const uv = info?.texCoord == null ? 0 : info.texCoord;
    if (!integer(uv)) throw new Error('Invalid glTF texture coordinate set');
    const tex = info ? await texture(info.index) : null;
    return { f, tex, uv };
  }));

  const meshes = gltfArray(g.meshes, 'meshes');
  const nodes = gltfArray(g.nodes, 'nodes');
  let primitiveCount = 0;
  for (const mesh of meshes) {
    if (!mesh || typeof mesh !== 'object') throw new Error('Invalid glTF mesh');
    const primitives = Array.isArray(mesh.primitives) ? mesh.primitives : [];
    primitiveCount += primitives.length;
    if (primitiveCount > MAX_PRIMITIVES) throw limitError('The glTF model has too many mesh primitives');
  }

  const out = { pos: [], nor: [], col: [] };
  const mul = (a, b) => { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; };
  const trs = (n) => {
    const values = (value, length, fallback, label) => {
      if (value == null) return fallback;
      if (!Array.isArray(value) || value.length !== length || !value.every(Number.isFinite)) throw new Error(`Invalid glTF node ${label}`);
      return value;
    };
    if (n.matrix != null) return values(n.matrix, 16, null, 'matrix');
    const [x, y, z, w] = values(n.rotation, 4, [0, 0, 0, 1], 'rotation'), [sx, sy, sz] = values(n.scale, 3, [1, 1, 1], 'scale'), [tx, ty, tz] = values(n.translation, 3, [0, 0, 0], 'translation');
    return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
      2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
      2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, tx, ty, tz, 1];
  };
  let tris = 0;
  const addMesh = (mi, M) => {
    if (!integer(mi) || !meshes[mi]) throw new Error('Invalid glTF node mesh reference');
    for (const pr of (Array.isArray(meshes[mi].primitives) ? meshes[mi].primitives : [])) {
      if (!pr || typeof pr !== 'object') throw new Error('Invalid glTF mesh primitive');
      const mode = pr.mode ?? 4, attrs = pr.attributes;
      if (![4, 5, 6].includes(mode) || !attrs || typeof attrs !== 'object' || attrs.POSITION == null) continue;
      const positionMeta = accessorMeta(attrs.POSITION);
      if (positionMeta.a.type !== 'VEC3') throw new Error('glTF POSITION must use VEC3 values');
      const indexMeta = pr.indices != null ? accessorMeta(pr.indices) : null;
      if (indexMeta && (indexMeta.a.type !== 'SCALAR' || ![5121, 5123, 5125].includes(indexMeta.a.componentType) || indexMeta.a.normalized)) {
        throw new Error('glTF indices must use unsigned scalar values');
      }
      const indexCount = indexMeta ? indexMeta.a.count : positionMeta.a.count;
      const primitiveTris = mode === 4 ? Math.floor(indexCount / 3) : Math.max(0, indexCount - 2);
      if (!primitiveTris) continue;
      if (tris + primitiveTris > MAX_TRIS) throw limitError('The model exceeds the 50,000 triangle limit');
      tris += primitiveTris;

      const P = acc(attrs.POSITION);
      if (P.some((value) => !Number.isFinite(value))) throw new Error('glTF positions contain invalid numbers');
      const normalMeta = attrs.NORMAL != null ? accessorMeta(attrs.NORMAL) : null;
      if (normalMeta && (normalMeta.a.type !== 'VEC3' || normalMeta.a.count !== positionMeta.a.count)) throw new Error('glTF NORMAL must be VEC3 and match POSITION count');
      const N = normalMeta ? acc(attrs.NORMAL) : null;
      if (N?.some((value) => !Number.isFinite(value))) throw new Error('glTF normals contain invalid numbers');
      const matIndex = pr.material == null ? -1 : pr.material;
      if (matIndex !== -1 && (!integer(matIndex) || !mats[matIndex])) throw new Error('Invalid glTF material reference');
      const mat = mats[matIndex] || { f: [0.8, 0.8, 0.8, 1], tex: null, uv: 0 };
      const uvMeta = mat.tex && attrs[`TEXCOORD_${mat.uv}`] != null ? accessorMeta(attrs[`TEXCOORD_${mat.uv}`]) : null;
      if (uvMeta && (uvMeta.a.type !== 'VEC2' || uvMeta.a.count !== positionMeta.a.count)) throw new Error('glTF texture coordinates must be VEC2 and match POSITION count');
      const UV = uvMeta ? acc(attrs[`TEXCOORD_${mat.uv}`]) : null;
      if (UV?.some((value) => !Number.isFinite(value))) throw new Error('glTF texture coordinates contain invalid numbers');
      const colorMeta = attrs.COLOR_0 != null ? accessorMeta(attrs.COLOR_0) : null;
      if (colorMeta && (!['VEC3', 'VEC4'].includes(colorMeta.a.type) || colorMeta.a.count !== positionMeta.a.count)) throw new Error('glTF vertex colors must be VEC3 or VEC4 and match POSITION count');
      const C = colorMeta ? acc(attrs.COLOR_0) : null, cn = colorMeta ? NCOMP[colorMeta.a.type] : 0;
      if (C?.some((value) => !Number.isFinite(value))) throw new Error('glTF vertex colors contain invalid numbers');
      const indices = indexMeta ? acc(pr.indices) : null;
      const indexAt = (i) => indices ? indices[i] : i;
      const triangleAt = (i) => {
        if (mode === 4) return [indexAt(i), indexAt(i + 1), indexAt(i + 2)];
        if (mode === 5) return i % 2 ? [indexAt(i + 1), indexAt(i), indexAt(i + 2)] : [indexAt(i), indexAt(i + 1), indexAt(i + 2)];
        return [indexAt(0), indexAt(i + 1), indexAt(i + 2)];
      };
      const tp = (i) => { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; return [M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]]; };
      const tn = (i) => { const x = N[i * 3], y = N[i * 3 + 1], z = N[i * 3 + 2]; const v = [M[0] * x + M[4] * y + M[8] * z, M[1] * x + M[5] * y + M[9] * z, M[2] * x + M[6] * y + M[10] * z]; const l = Math.hypot(...v) || 1; return v.map((c) => c / l); };
      const colOf = (i) => {
        let c = [mat.f[0], mat.f[1], mat.f[2]];
        if (mat.tex && UV) {
          const t = mat.tex, u = UV[i * 2] - Math.floor(UV[i * 2]), v = UV[i * 2 + 1] - Math.floor(UV[i * 2 + 1]);
          const px = Math.min(t.W - 1, Math.floor(u * t.W)), py = Math.min(t.H - 1, Math.floor(v * t.H)), o = (py * t.W + px) * 4;
          c = [c[0] * srgb(t.px[o] / 255), c[1] * srgb(t.px[o + 1] / 255), c[2] * srgb(t.px[o + 2] / 255)];
        }
        if (C) c = [c[0] * C[i * cn], c[1] * C[i * cn + 1], c[2] * C[i * cn + 2]];
        return c;
      };
      const triangleCount = mode === 4 ? primitiveTris : indexCount - 2;
      for (let t = 0; t < triangleCount; t++) {
        const sourceOffset = mode === 4 ? t * 3 : t;
        const ids = triangleAt(sourceOffset);
        if (ids.some((id) => !Number.isSafeInteger(id) || id < 0 || id >= positionMeta.a.count)) throw new Error('glTF index is outside the POSITION accessor');
        const ps = ids.map(tp);
        if (ps.some((p) => p.some((value) => !Number.isFinite(value)))) throw new Error('glTF node transform produces invalid positions');
        let ns;
        if (N) ns = ids.map(tn);
        else { const fn = faceNormal(ps[0], ps[1], ps[2]); ns = [fn, fn, fn]; }
        for (let k = 0; k < 3; k++) { out.pos.push(...ps[k]); out.nor.push(...ns[k]); out.col.push(...colOf(ids[k])); }
      }
    }
  };
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const scenes = gltfArray(g.scenes, 'scenes');
  if (scenes.length) {
    const sceneIndex = g.scene == null ? 0 : g.scene;
    if (!integer(sceneIndex) || !scenes[sceneIndex] || !Array.isArray(scenes[sceneIndex].nodes || [])) throw new Error('Invalid glTF scene reference');
    const roots = scenes[sceneIndex].nodes || [];
    if (roots.length > MAX_NODES) throw limitError('The glTF scene has too many nodes');
    const stack = [];
    let scheduled = 0, visited = 0;
    for (let i = roots.length - 1; i >= 0; i--) stack.push({ ni: roots[i], parent: I, depth: 1, exit: false });
    scheduled = roots.length;
    const active = new Set();
    while (stack.length) {
      const item = stack.pop();
      if (item.exit) { active.delete(item.ni); continue; }
      if (!integer(item.ni) || !nodes[item.ni] || typeof nodes[item.ni] !== 'object') throw new Error('Invalid glTF node reference');
      if (active.has(item.ni)) throw new Error('Cyclic glTF node hierarchy');
      if (item.depth > MAX_NODE_DEPTH) throw limitError('The glTF node hierarchy exceeds the 256 level limit');
      if (++visited > MAX_NODES) throw limitError('The glTF scene has too many nodes');
      const n = nodes[item.ni], M = mul(item.parent, trs(n));
      active.add(item.ni);
      stack.push({ ni: item.ni, exit: true });
      if (n.mesh != null) addMesh(n.mesh, M);
      const children = n.children == null ? [] : n.children;
      if (!Array.isArray(children)) throw new Error('Invalid glTF node children');
      if (scheduled + children.length > MAX_NODES) throw limitError('The glTF scene has too many node references');
      scheduled += children.length;
      for (let i = children.length - 1; i >= 0; i--) stack.push({ ni: children[i], parent: M, depth: item.depth + 1, exit: false });
    }
  } else meshes.forEach((_, mi) => addMesh(mi, I));
  return out;
}

/* ---------------------------------------------------------------- OBJ */
function parseObj(text) {
  const v = [], vn = [], vc = [], out = { pos: [], nor: [], col: [] };
  let col = [0.8, 0.8, 0.8], tris = 0;
  // a material name that says a colour (wood, white, black...) gives a hint, as the .mtl file is not there
  const HINT = [[/wood|hout|oak|eik/i, [0.55, 0.4, 0.28]], [/black|zwart|dark/i, [0.12, 0.12, 0.13]], [/white|wit/i, [0.92, 0.92, 0.9]], [/glass|glas/i, [0.6, 0.75, 0.8]], [/metal|steel|chrome|staal/i, [0.75, 0.76, 0.78]], [/green|groen|leaf|plant/i, [0.25, 0.5, 0.25]], [/red|rood/i, [0.7, 0.15, 0.12]], [/fabric|stof|cloth/i, [0.46, 0.52, 0.6]]];
  const readTokens = (line, start, max, rejectExtra = true) => {
    const result = [];
    let i = start;
    while (i < line.length) {
      while (i < line.length && /\s/.test(line[i])) i++;
      if (i >= line.length) break;
      let end = i;
      while (end < line.length && !/\s/.test(line[end])) end++;
      if (result.length >= max) {
        if (rejectExtra) throw limitError('An OBJ line contains too many values');
        break;
      }
      result.push(line.slice(i, end));
      i = end;
    }
    return result;
  };
  let start = 0;
  while (start < text.length) {
    let end = text.indexOf('\n', start);
    if (end < 0) end = text.length;
    if (end - start > MAX_OBJ_LINE_CHARS) throw limitError('An OBJ line exceeds the 4 MiB line limit');
    const line = text.slice(start, end).trim();
    start = end + 1;
    if (!line || line[0] === '#') continue;
    let keyEnd = 0;
    while (keyEnd < line.length && !/\s/.test(line[keyEnd])) keyEnd++;
    const key = line.slice(0, keyEnd);
    let argStart = keyEnd;
    while (argStart < line.length && /\s/.test(line[argStart])) argStart++;
    if (key === 'v') {
      const p = readTokens(line, argStart, 6, false);
      if (p.length < 3 || !p.slice(0, 3).every((n) => Number.isFinite(Number(n)))) throw new Error('Invalid OBJ vertex');
      if (v.length >= MAX_OBJ_VERTICES) throw limitError('The OBJ model exceeds the 250,000 vertex limit');
      const hasColor = p.length >= 6 && p.slice(3, 6).every((n) => Number.isFinite(Number(n)));
      v.push([+p[0], +p[1], +p[2]]);
      vc.push(hasColor ? [+p[3], +p[4], +p[5]] : null);
    } else if (key === 'vn') {
      const p = readTokens(line, argStart, 3, false);
      if (p.length < 3 || !p.every((n) => Number.isFinite(Number(n)))) throw new Error('Invalid OBJ normal');
      if (vn.length >= MAX_OBJ_NORMALS) throw limitError('The OBJ model exceeds the 250,000 normal limit');
      vn.push([+p[0], +p[1], +p[2]]);
    } else if (key === 'usemtl') {
      const name = line.slice(argStart), h = HINT.find(([re]) => re.test(name));
      col = h ? h[1] : [0.8, 0.8, 0.8];
    } else if (key === 'f') {
      const fv = [];
      let i = argStart;
      while (i < line.length) {
        while (i < line.length && /\s/.test(line[i])) i++;
        if (i >= line.length) break;
        let tokenEnd = i;
        while (tokenEnd < line.length && !/\s/.test(line[tokenEnd])) tokenEnd++;
        if (fv.length >= MAX_TRIS - tris + 2) throw limitError('The OBJ model exceeds the 50,000 triangle limit');
        const parts = line.slice(i, tokenEnd).split('/'), ai = Number(parts[0]), ci = parts[2] ? Number(parts[2]) : 0;
        if (!Number.isSafeInteger(ai) || ai === 0 || !Number.isSafeInteger(ci)) throw new Error('Invalid OBJ face index');
        fv.push([ai < 0 ? v.length + ai : ai - 1, ci ? (ci < 0 ? vn.length + ci : ci - 1) : -1]);
        i = tokenEnd;
      }
      const faceTris = Math.max(0, fv.length - 2);
      if (tris + faceTris > MAX_TRIS) throw limitError('The OBJ model exceeds the 50,000 triangle limit');
      for (let i = 1; i + 1 < fv.length; i++) {
        tris++;
        const tri = [fv[0], fv[i], fv[i + 1]], ps = tri.map(([a]) => v[a]);
        if (ps.some((p) => !p)) continue;
        const fn = faceNormal(ps[0], ps[1], ps[2]);
        tri.forEach(([a, n], k2) => { out.pos.push(...ps[k2]); out.nor.push(...(n >= 0 && vn[n] ? vn[n] : fn)); out.col.push(...(vc[a] || col)); });
      }
    }
  }
  return out;
}

function faceNormal(a, b, c) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], l = Math.hypot(...n) || 1;
  return n.map((x) => x / l);
}

function finish(o) {
  if (!o.pos.length) throw new Error('no triangles found');
  const pos = new Float32Array(o.pos), min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], pos[i + c]); max[c] = Math.max(max[c], pos[i + c]); }
  return { pos, nor: new Float32Array(o.nor), col: new Float32Array(o.col), min, max, tris: pos.length / 9 };
}

/**
 * The model placed as a piece of furniture: upright (f.up: 'y' as glTF, 'z' for Z-up exports), fitted into its
 * footprint (w × h, and the height f.z when set) keeping its proportions, standing on the floor, turned by f.rot.
 * Calls emit(x, y, z, nx, ny, nz, r, g, b) for every corner, in metres.
 */
export function placeModel(model, f, S, emit) {
  const up = orient(f.up, +f.pitch || 0);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], P = model.pos;
  for (let i = 0; i < P.length; i += 3) { const q = up(P[i], P[i + 1], P[i + 2]); for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], q[c]); max[c] = Math.max(max[c], q[c]); } }
  const w = Math.max(0.05, (+f.w || 60) / S), d = Math.max(0.05, (+f.h || 60) / S), sx = max[0] - min[0] || 1, sy = max[1] - min[1] || 1, sz = max[2] - min[2] || 1;
  // it fills its width and depth exactly (so the size fields and handles always do something); its height is f.z,
  // or in proportion to the width and depth
  const kx = w / sx, kz = d / sz, ky = +f.z > 0 ? +f.z / sy : Math.sqrt(kx * kz);
  const cx = (min[0] + max[0]) / 2, cz = (min[2] + max[2]) / 2, r = ((+f.rot || 0) * Math.PI) / 180, cr = Math.cos(r), sr = Math.sin(r), fx = (+f.x || 0) / S, fz = (+f.y || 0) / S;
  const N = model.nor, C = model.col, base = Math.max(0, +f.elev || 0);
  for (let i = 0; i < P.length; i += 3) {
    const q = up(P[i], P[i + 1], P[i + 2]), n0 = up(N[i], N[i + 1], N[i + 2]);
    const x = (q[0] - cx) * kx, z = (q[2] - cz) * kz, y = (q[1] - min[1]) * ky + base;
    // a stretched shape: its normals lean the other way
    let nx = n0[0] / kx, ny = n0[1] / ky, nz = n0[2] / kz; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    emit(fx + x * cr - z * sr, y, fz + x * sr + z * cr, nx * cr - nz * sr, ny, nx * sr + nz * cr, C[i], C[i + 1], C[i + 2]);
  }
  return { height: sy * ky + base };
}

/** The model's own proportions (upright as f.up says): width, depth and height in its own units. */
/** Upright (up: 'y' as glTF, 'z' / '-z' for Z-up exports), then tipped forward by pitch (radians, about the model's left-right axis). */
function orient(up, pitch) {
  const base = up === 'z' ? (x, y, z) => [x, z, -y] : up === '-z' ? (x, y, z) => [x, -z, y] : (x, y, z) => [x, y, z];
  if (!pitch) return base;
  const c = Math.cos(pitch), sn = Math.sin(pitch);
  return (x, y, z) => { const q = base(x, y, z); return [q[0], q[1] * c - q[2] * sn, q[1] * sn + q[2] * c]; };
}
export function modelSize(model, up = '', pitch = 0) {
  const tf = orient(up, pitch);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], P = model.pos;
  for (let i = 0; i < P.length; i += 3) { const q = tf(P[i], P[i + 1], P[i + 2]); for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], q[c]); max[c] = Math.max(max[c], q[c]); } }
  return { w: max[0] - min[0], h: max[1] - min[1], d: max[2] - min[2] };
}
