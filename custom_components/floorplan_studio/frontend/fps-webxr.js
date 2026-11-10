/** Small, dependency-free helpers for WebXR room transforms and controller input. */
const multiply4 = (a, b) => {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  }
  return out;
};

/** Map the XR reference space into the floorplan's x/z world. */
export function roomTransform(yaw, x, z, floorY = 0) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const worldFromReference = new Float32Array([
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    x, floorY, z, 1,
  ]);
  const referenceFromWorld = new Float32Array([
    c, 0, s, 0,
    0, 1, 0, 0,
    -s, 0, c, 0,
    -c * x + s * z, -floorY, -s * x - c * z, 1,
  ]);
  return { worldFromReference, referenceFromWorld };
}

export function transformPoint4(matrix, point) {
  const [x, y, z] = point;
  const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  const k = w && w !== 1 ? 1 / w : 1;
  return [
    (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) * k,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) * k,
    (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) * k,
  ];
}

export function transformDirection4(matrix, direction) {
  const [x, y, z] = direction;
  const out = [
    matrix[0] * x + matrix[4] * y + matrix[8] * z,
    matrix[1] * x + matrix[5] * y + matrix[9] * z,
    matrix[2] * x + matrix[6] * y + matrix[10] * z,
  ];
  const length = Math.hypot(...out) || 1;
  return out.map((v) => v / length);
}

export function xrViewProjection(projection, viewFromReference, referenceFromWorld) {
  return multiply4(projection, multiply4(viewFromReference, referenceFromWorld));
}

const axis = (value) => {
  const v = Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
  const a = Math.abs(v);
  return a <= 0.18 ? 0 : Math.sign(v) * Math.min(1, (a - 0.18) / 0.82);
};

/** Map standard XR thumbsticks to normalized left/right stick values. */
export function xrStickInput(inputSources = []) {
  const controllers = [...inputSources].filter((source) => source?.gamepad);
  const left = controllers.find((source) => source.handedness === 'left') || controllers[0];
  const right = controllers.find((source) => source.handedness === 'right') || controllers.find((source) => source !== left);
  const read = (source) => {
    const axes = source?.gamepad?.axes;
    return axes && axes.length >= 2 ? [axis(axes[0]), axis(axes[1])] : [0, 0];
  };
  const [moveX, moveY] = read(left);
  const [turnX] = read(right);
  return { moveX, moveY, turnX };
}
