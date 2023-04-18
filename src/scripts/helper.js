export function radToDeg(r) {
  return r * 180 / Math.PI;
}

export function degToRad(d) {
  return d * Math.PI / 180;
}

export function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}
