function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
}

function resizeCanvasToDisplaySize(canvas) {
  var displayWidth = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

export function drawCanvas(gl, params, canvasNum, isSubTree) {
  resizeCanvasToDisplaySize(gl.canvas);
  gl.clearDepth(1.0);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.viewport(0.0, 0.0, gl.canvas.clientWidth, gl.canvas.clientHeight);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let retValue = {};
  if (canvasNum === 1) {
    params.modelObject[params.globalRoot].draw(
      gl,
      params,
      retValue,
      canvasNum,
      isSubTree
    );
  } else {
    params.modelObject[params.root].draw(
      gl,
      params,
      retValue,
      canvasNum,
      isSubTree
    );
  }

  return retValue;
}

export function createProgram(gl) {
  const program = gl.createProgram();

  const vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
  const fragmentShaderSource = document.querySelector(
    "#fragment-shader-3d"
  ).text;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
