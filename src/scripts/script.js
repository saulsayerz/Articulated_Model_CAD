import { degToRad } from './helper.js';
import mat4 from './matrix.js';

function drawGeometry(gl,program,model){
    const positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.positions), gl.STATIC_DRAW);

    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.STATIC_DRAW);

    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, true, 0, 0);

    const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, model.positions.length / 3);
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
}

function resizeCanvasToDisplaySize(canvas)  {
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
    
    if (canvas.width  !== displayWidth ||
        canvas.height !== displayHeight) {

        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}


export function drawScene(gl, params) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.clearDepth(1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.viewport(0.0, 0.0, gl.canvas.clientWidth, gl.canvas.clientHeight);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(params.program);
  
    var modelLocation = gl.getUniformLocation(params.program, "u_modelMatrix");
    var viewLocation = gl.getUniformLocation(params.program, "u_viewMatrix");
    var projLocation = gl.getUniformLocation(params.program, "u_projMatrix");
    var normalLocation = gl.getUniformLocation(params.program, "u_normal");
    var shadingBool = gl.getUniformLocation(params.program, "u_shading");
    var fudgeLocation = gl.getUniformLocation(params.program, "u_fudgeFactor");

    var projMatrix = mat4.ortho(-gl.canvas.clientWidth / 2, gl.canvas.clientWidth / 2, gl.canvas.clientHeight / 2, - gl.canvas.clientHeight / 2, 800, -800);
    if (params.projType == "perspective") {
        gl.uniform1f(fudgeLocation, params.fudgeFactor);
    }
    else{
        gl.uniform1f(fudgeLocation, 0);
    }

    if (params.projType == "oblique"){
        projMatrix = mat4.multiply(projMatrix, mat4.oblique(degToRad(75), degToRad(75)));
    }
    
    var modelMatrix = mat4.translate(params.translation[0], params.translation[1], params.translation[2]);
    modelMatrix = mat4.multiply(modelMatrix, mat4.translate(params.center[0], params.center[1], params.center[2]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.xRotate(params.rotation[0]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.yRotate(params.rotation[1]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.zRotate(params.rotation[2]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.scale(params.scale[0]*params.zoom, params.scale[1]*params.zoom, params.scale[2]*params.zoom));
    modelMatrix = mat4.multiply(modelMatrix, mat4.translate(-params.center[0], -params.center[1], -params.center[2]));

    var eye = [0, 0, params.cameraRadius];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    
    var viewMatrix = mat4.identity();
    viewMatrix = mat4.multiply(viewMatrix, mat4.yRotate(params.cameraAngleRadians));
    viewMatrix = mat4.multiply(viewMatrix, mat4.translate(...eye));

    var camPos = [
        viewMatrix[12],
        viewMatrix[13],
        viewMatrix[14]
    ]

    var cameraMatrix = mat4.lookAt(camPos, target, up);
    viewMatrix = mat4.inverse(cameraMatrix);

    var modelViewMatrix = mat4.multiply(viewMatrix, modelMatrix);

    var normalMatrix = mat4.inverse(modelViewMatrix);
    normalMatrix = mat4.transpose(normalMatrix);
    normalMatrix = mat4.multiply(normalMatrix, mat4.yRotate(params.cameraAngleRadians));

    gl.uniformMatrix4fv(projLocation, false, projMatrix);
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
    gl.uniformMatrix4fv(normalLocation, false, normalMatrix);
    gl.uniform1i(shadingBool, params.shading);

    drawGeometry(gl, params.program, params.hollowObject);

    return modelMatrix;
}

export function createProgram(gl) {
    const program = gl.createProgram();

    const vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
    const fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

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