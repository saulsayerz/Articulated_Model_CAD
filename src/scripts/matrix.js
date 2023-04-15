var mat4 = {

  normalize: function(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    } else {
      return [0, 0, 0];
    }
  },
  
  cross: function(a, b) {
    return [a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]];
  },

  subtractVectors: function(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  },

  lookAt: function(eye, target, up) {
    var zAxis = mat4.normalize(
        mat4.subtractVectors(eye, target));
    var xAxis = mat4.normalize(mat4.cross(up, zAxis));
    var yAxis = mat4.normalize(mat4.cross(zAxis, xAxis));

    return [
       xAxis[0], xAxis[1], xAxis[2], 0,
       yAxis[0], yAxis[1], yAxis[2], 0,
       zAxis[0], zAxis[1], zAxis[2], 0,
       eye[0], eye[1], eye[2], 1,
    ];
  },

  projection: function(width, height, depth) {
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  ortho: function(left, right, bottom, top, near, far) {
    return [
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,
      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ];
  },

  oblique: function(theta, phi){     
    var cotTheta = 1 / Math.tan(theta);
    var cotPhi = 1 / Math.tan(phi);
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      cotTheta, cotPhi, 1, 0,
      0, 0, 0, 1,
    ];
  },

  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  },

  identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  translate: function(tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  },

  xRotate: function(angleInRadians) {
    var cosine = Math.cos(angleInRadians);
    var sin = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, cosine, sin, 0,
      0, -sin, cosine, 0,
      0, 0, 0, 1,
    ];
  },

  yRotate: function(angleInRadians) {
    var cosine = Math.cos(angleInRadians);
    var sin = Math.sin(angleInRadians);

    return [
      cosine, 0, -sin, 0,
      0, 1, 0, 0,
      sin, 0, cosine, 0,
      0, 0, 0, 1,
    ];
  },

  zRotate: function(angleInRadians) {
    var cosine = Math.cos(angleInRadians);
    var sin = Math.sin(angleInRadians);

    return [
      cosine, sin, 0, 0,
      -sin, cosine, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  scale: function(sx, sy, sz) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var result = mat4.identity();
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var sum = 0;
        for (var k = 0; k < 4; k++) {
          sum += b[i * 4 + k] * a[k * 4 + j];
        }
        result[i * 4 + j] = sum;
      }
    }
    return result;
  },

  transpose: function(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15],
    ];
  },

  getCofactor: function(m, r, cosine) {
    var result = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (i != r && j != cosine) {
          result.push(m[i * 4 + j]);
        }
      }
    }
    return result;
  },

  getMinor: function(m, r, cosine) {
    var cofactor = mat4.getCofactor(m, r, cosine);
    var result = 0;
    result += cofactor[0] * cofactor[4] * cofactor[8] + 
    cofactor[1] * cofactor[5] * cofactor[6] +
    cofactor[2] * cofactor[3] * cofactor[7];
    result -= cofactor[2] * cofactor[4] * cofactor[6] +
    cofactor[1] * cofactor[3] * cofactor[8] +
    cofactor[0] * cofactor[5] * cofactor[7];

    return result * Math.pow(-1, r + cosine);
  },

  determinant: function(m) {
    var result = 0;
    for (var i = 0; i < 4; i++) {
      result += m[i] * mat4.getMinor(m, 0, i);
    }
    return result;
  },

  adjoint: function(m) {
    var result = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        result.push(mat4.getMinor(m, j, i));
      }
    }
    return result;
  },

  inverse: function(m) {
    var det = mat4.determinant(m);
    if (det == 0) {
      return null;
    }
    var adj = mat4.adjoint(m);
    for (var i = 0; i < 16; i++) {
      adj[i] /= det;
    }
    return adj;
  },

  multiplyVector: function(m, v) {
    var result = [];
    for (var i = 0; i < 4; i++) {
      var sum = 0;
      for (var j = 0; j < 4; j++) {
        sum += v[j] * m[i + j * 4];
      }
      result.push(sum);
    }
    return result;
  }
};

export default mat4;