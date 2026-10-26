/**
 * Your own 3D models (furniture): read a .glb / .gltf (embedded) or .obj into plain triangles
 * { pos, nor, col } (Float32Arrays, three numbers per corner) with the bounding box.
 * Colours come from the material colour, vertex colours, or the texture (sampled per corner),
 * so a textured model still looks like itself without a texture pipeline in the walk.
 */
const MAX_TRIS = 250000;

export async function loadModel(url) {
  const resp = await fetch(url, { credentials: 'same-origin' });
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
  const buf = await resp.arrayBuffer();
  const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase();
  const head = new Uint8Array(buf, 0, Math.min(4, buf.byteLength));
  if (ext === 'obj') return finish(parseObj(new TextDecoder().decode(buf)));
  if (head[0] === 0x67 && head[1] === 0x6c && head[2] === 0x54 && head[3] === 0x46) return finish(await parseGlb(buf));
  return finish(await parseGltf(JSON.parse(new TextDecoder().decode(buf)), []));
}

/* ---------------------------------------------------------------- glTF */
async function parseGlb(buf) {
  const dv = new DataView(buf);
  if (dv.getUint32(4, true) !== 2) throw new Error('glTF 2 only');
  let off = 12, json = null;
  const bins = [];
  while (off + 8 <= buf.byteLength) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true), start = off + 8;
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, start, len)));
    else if (type === 0x004e4942) bins.push(buf.slice(start, start + len));
    off = start + len + ((4 - (len % 4)) % 4);
  }
  if (!json) throw new Error('no glTF data');
  return parseGltf(json, bins);
}

const COMP = { 5120: [Int8Array, 1], 5121: [Uint8Array, 1], 5122: [Int16Array, 2], 5123: [Uint16Array, 2], 5125: [Uint32Array, 4], 5126: [Float32Array, 4] };
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const NORM = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };

async function parseGltf(g, bins) {
  const used = new Set(g.extensionsRequired || []);
  if (used.has('KHR_draco_mesh_compression') || used.has('EXT_meshopt_compression')) throw new Error('compressed (Draco/meshopt): export without compression');
  const buffers = (g.buffers || []).map((b, i) => {
    if (b.uri == null) return bins[i] ?? bins[0];
    if (b.uri.startsWith('data:')) { const s = atob(b.uri.split(',')[1]); const a = new Uint8Array(s.length); for (let k = 0; k < s.length; k++) a[k] = s.charCodeAt(k); return a.buffer; }
    throw new Error('external .bin files: use .glb');
  });
  const viewBytes = (vi) => { const v = g.bufferViews[vi]; return { buf: buffers[v.buffer], off: v.byteOffset || 0, len: v.byteLength, stride: v.byteStride || 0 }; };
  // an accessor as a flat array of numbers (normalised integers become 0..1)
  const acc = (ai) => {
    const a = g.accessors[ai], n = NCOMP[a.type], [T, sz] = COMP[a.componentType], out = new Float32Array(a.count * n);
    if (a.bufferView == null) return out;
    const v = viewBytes(a.bufferView), stride = v.stride || n * sz, base = v.off + (a.byteOffset || 0), dv = new DataView(v.buf);
    const rd = { 5120: (o) => dv.getInt8(o), 5121: (o) => dv.getUint8(o), 5122: (o) => dv.getInt16(o, true), 5123: (o) => dv.getUint16(o, true), 5125: (o) => dv.getUint32(o, true), 5126: (o) => dv.getFloat32(o, true) }[a.componentType];
    const k = a.normalized && NORM[a.componentType] ? 1 / NORM[a.componentType] : 1;
    for (let i = 0; i < a.count; i++) for (let c = 0; c < n; c++) out[i * n + c] = rd(base + i * stride + c * sz) * k;
    void T;
    return out;
  };
  // textures: decoded small, so every corner can take its colour from the picture
  const texCache = new Map();
  const texture = async (ti) => {
    if (texCache.has(ti)) return texCache.get(ti);
    const p = (async () => {
      try {
        const src = g.images?.[g.textures?.[ti]?.source];
        if (!src) return null;
        let blob;
        if (src.bufferView != null) { const v = viewBytes(src.bufferView); blob = new Blob([new Uint8Array(v.buf, v.off, v.len)], { type: src.mimeType || 'image/png' }); }
        else if (src.uri?.startsWith('data:')) blob = await (await fetch(src.uri)).blob();
        else return null;
        const bmp = await createImageBitmap(blob), W = Math.min(256, bmp.width), H = Math.min(256, bmp.height);
        const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
        const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0, W, H);
        return { W, H, px: cx.getImageData(0, 0, W, H).data };
      } catch { return null; }
    })();
    texCache.set(ti, p);
    return p;
  };
  const srgb = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const mats = await Promise.all((g.materials || []).map(async (m) => {
    const pbr = m.pbrMetallicRoughness || {}, f = pbr.baseColorFactor || [1, 1, 1, 1];
    const tex = pbr.baseColorTexture ? await texture(pbr.baseColorTexture.index) : null;
    return { f, tex, uv: pbr.baseColorTexture?.texCoord || 0 };
  }));

  const out = { pos: [], nor: [], col: [] };
  const mul = (a, b) => { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; };
  const trs = (n) => {
    if (n.matrix) return n.matrix;
    const [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1], [tx, ty, tz] = n.translation || [0, 0, 0];
    return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
      2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
      2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, tx, ty, tz, 1];
  };
  let tris = 0;
  const addMesh = (mi, M) => {
    for (const pr of g.meshes[mi].primitives || []) {
      const mode = pr.mode ?? 4;
      if (![4, 5, 6].includes(mode) || pr.attributes?.POSITION == null) continue;
      const P = acc(pr.attributes.POSITION), N = pr.attributes.NORMAL != null ? acc(pr.attributes.NORMAL) : null;
      const mat = mats[pr.material] || { f: [0.8, 0.8, 0.8, 1], tex: null, uv: 0 };
      const UV = mat.tex && pr.attributes[`TEXCOORD_${mat.uv}`] != null ? acc(pr.attributes[`TEXCOORD_${mat.uv}`]) : null;
      const CA = pr.attributes.COLOR_0 != null ? g.accessors[pr.attributes.COLOR_0] : null, C = CA ? acc(pr.attributes.COLOR_0) : null, cn = CA ? NCOMP[CA.type] : 0;
      let idx = pr.indices != null ? acc(pr.indices) : Float32Array.from({ length: P.length / 3 }, (_, i) => i);
      if (mode === 5) { const t = []; for (let i = 2; i < idx.length; i++) (i % 2 ? t.push(idx[i - 1], idx[i - 2], idx[i]) : t.push(idx[i - 2], idx[i - 1], idx[i])); idx = t; }
      if (mode === 6) { const t = []; for (let i = 2; i < idx.length; i++) t.push(idx[0], idx[i - 1], idx[i]); idx = t; }
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
      for (let t = 0; t + 2 < idx.length; t += 3) {
        if (++tris > MAX_TRIS) return;
        const ids = [idx[t], idx[t + 1], idx[t + 2]], ps = ids.map(tp);
        let ns;
        if (N) ns = ids.map(tn);
        else { const fn = faceNormal(ps[0], ps[1], ps[2]); ns = [fn, fn, fn]; }
        for (let k = 0; k < 3; k++) { out.pos.push(...ps[k]); out.nor.push(...ns[k]); out.col.push(...colOf(ids[k])); }
      }
    }
  };
  const walk = (ni, parent) => {
    const n = g.nodes[ni], M = mul(parent, trs(n));
    if (n.mesh != null) addMesh(n.mesh, M);
    for (const c of n.children || []) walk(c, M);
  };
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const scene = g.scenes?.[g.scene ?? 0];
  if (scene) for (const ni of scene.nodes || []) walk(ni, I);
  else (g.meshes || []).forEach((_, mi) => addMesh(mi, I));
  return out;
}

/* ---------------------------------------------------------------- OBJ */
function parseObj(text) {
  const v = [], vn = [], vc = [], out = { pos: [], nor: [], col: [] };
  let col = [0.8, 0.8, 0.8], tris = 0;
  // a material name that says a colour (wood, white, black...) gives a hint, as the .mtl file is not there
  const HINT = [[/wood|hout|oak|eik/i, [0.55, 0.4, 0.28]], [/black|zwart|dark/i, [0.12, 0.12, 0.13]], [/white|wit/i, [0.92, 0.92, 0.9]], [/glass|glas/i, [0.6, 0.75, 0.8]], [/metal|steel|chrome|staal/i, [0.75, 0.76, 0.78]], [/green|groen|leaf|plant/i, [0.25, 0.5, 0.25]], [/red|rood/i, [0.7, 0.15, 0.12]], [/fabric|stof|cloth/i, [0.46, 0.52, 0.6]]];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line[0] === '#') continue;
    const parts = line.split(/\s+/), k = parts[0];
    if (k === 'v') { v.push([+parts[1], +parts[2], +parts[3]]); vc.push(parts.length >= 7 ? [+parts[4], +parts[5], +parts[6]] : null); }
    else if (k === 'vn') vn.push([+parts[1], +parts[2], +parts[3]]);
    else if (k === 'usemtl') { const h = HINT.find(([re]) => re.test(parts.slice(1).join(' '))); col = h ? h[1] : [0.8, 0.8, 0.8]; }
    else if (k === 'f') {
      const fv = parts.slice(1).map((p) => { const [a, , c] = p.split('/'); const ai = +a, ci = c ? +c : 0; return [ai < 0 ? v.length + ai : ai - 1, ci ? (ci < 0 ? vn.length + ci : ci - 1) : -1]; });
      for (let i = 1; i + 1 < fv.length; i++) {
        if (++tris > MAX_TRIS) return out;
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
