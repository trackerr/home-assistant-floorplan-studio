/** Choose a safe starting quality from browser hints; measured frame time adapts it later. */
const LOW = Object.freeze({ name: 'low', pixels: 650_000, dpr: 1.15, fps: 30, lights: 8, matrix: 8 });
const BALANCED = Object.freeze({ name: 'balanced', pixels: 1_300_000, dpr: 1.6, fps: 60, lights: 16, matrix: 16 });
const MOBILE_HIGH = Object.freeze({ name: 'mobile-high', pixels: 2_100_000, dpr: 2, fps: 60, lights: 24, matrix: 24 });
const HIGH = Object.freeze({ name: 'high', pixels: 4_200_000, dpr: 3, fps: 60, lights: 32, matrix: 32 });

export function qualityForDevice({
  hardwareConcurrency = 0, deviceMemory = 0, userAgent = '', platform = '',
  finePointer = false, coarsePointer = false, touchPoints = 0,
} = {}) {
  const cores = Number(hardwareConcurrency) || 0;
  const memory = Number(deviceMemory) || 0;
  const ua = `${userAgent} ${platform}`;
  const isTv = /Android\s*TV|Google\s*TV|Smart[- ]?TV|Tizen|webOS|NetCast|\bAFT[A-Z0-9_-]*|BRAVIA|Viera|AppleTV/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isAndroidTouch = isAndroid && coarsePointer && Number(touchPoints) > 0;

  if (isTv || (cores > 0 && cores <= 4) || (memory > 0 && memory <= 2)) return LOW;
  if ((cores >= 8 && memory >= 6) || (cores >= 12 && memory === 0 && finePointer)) return HIGH;
  if (isAndroidTouch && cores >= 8 && memory === 0) return MOBILE_HIGH;
  return BALANCED;
}
