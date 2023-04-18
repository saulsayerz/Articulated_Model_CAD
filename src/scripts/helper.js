export function radToDeg(r) {
  return r * 180 / Math.PI;
}

export function degToRad(d) {
  return d * Math.PI / 180;
}

export function centerpoint(modelObject) {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < modelObject.vertices.length; i += 3) {
    x += modelObject.vertices[i];
    y += modelObject.vertices[i + 1];
    z += modelObject.vertices[i + 2];
  }
  x /= modelObject.vertices.length / 3;
  y /= modelObject.vertices.length / 3;
  z /= modelObject.vertices.length / 3;
  return [x, y, z];
}