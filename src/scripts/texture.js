export function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [
        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,
        1, 1,

        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,
        1, 1,

        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,
        1, 1,

        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,
        1, 1,

        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,
        1, 1,

        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,
        1, 1,
      ]),
      gl.STATIC_DRAW);
}

function handleLoadedTexture2D(gl, program, texture) {
  gl.activeTexture( gl.TEXTURE0 + texture.unit );
  gl.bindTexture( gl.TEXTURE_2D, texture.obj );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  

  const texcoordLocation = gl.getAttribLocation(program, "aTexCoord");
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);

  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texcoordLocation);
}

export function loadTexture2D(gl, program, src, unit) {
  var texture = {}
  texture.obj = gl.createTexture();
  texture.unit = unit;
  texture.image = new Image();
  texture.image.setAttribute( "crossOrigin", "" );
  texture.image.onload = function() {
    handleLoadedTexture2D( gl, program, texture );
  }
  texture.image.src = src;
}

export function loadTextureCube(gl, program)
{
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
          url: 'assets/environment/nx.png',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
          url: 'assets/environment/ny.png',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
          url: 'assets/environment/nz.png',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
          url: 'assets/environment/px.png',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
          url: 'assets/environment/py.png',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
          url: 'assets/environment/pz.png',
        },
    ];
    
    faceInfos.forEach((faceInfo) => {
      const { target, url } = faceInfo;

      // Upload the canvas to the cubemap face.
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 256;
      const height = 256;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;

      // setup each face so it's immediately renderable
      gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

      // Asynchronously load an image
      const image = new Image();
      image.src = url;
      image.crossOrigin = "";   // ask for CORS permission
      image.addEventListener('load', function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    const texcoordLocation = gl.getAttribLocation(program, "aTexCoord");
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    setTexcoords(gl);

    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texcoordLocation);
}
