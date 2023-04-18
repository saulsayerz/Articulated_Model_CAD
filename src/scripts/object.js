import { centerpoint, degToRad } from "./helper.js";
import mat4 from "./matrix.js";

class Object {
  constructor(name, vertices, colors, normals, child, sibling) {
    this.name = name;
    this.vertices = vertices;
    this.colors = colors;
    this.normals = normals;
    this.child = child;
    this.sibling = sibling;
    
    this.translation = [0, 0, 0];
    this.rotation = [degToRad(0), degToRad(0), degToRad(0)];
    this.scale = [1, 1, 1];
    this.center = centerpoint(this)
  }

  draw(gl, params, retValue, canvasNum) {
    gl.useProgram(params.program);
    var modelLocation = gl.getUniformLocation(params.program, "u_modelMatrix");
    var viewLocation = gl.getUniformLocation(params.program, "u_viewMatrix");
    var projLocation = gl.getUniformLocation(params.program, "u_projMatrix");
    var normalLocation = gl.getUniformLocation(params.program, "u_normal");
    var shadingBool = gl.getUniformLocation(params.program, "u_shading");
    var fudgeLocation = gl.getUniformLocation(params.program, "u_fudgeFactor");
    var uImage = gl.getUniformLocation(params.program, "u_image");
    var uEnvironment = gl.getUniformLocation(params.program, "u_environment");
    var uBump = gl.getUniformLocation(params.program, "u_bump");
    var uDiffuseColorLocation = gl.getUniformLocation(params.program, "u_diffuseColor");
    var textureMode = gl.getUniformLocation(params.program, "u_texture");  

    gl.uniform1i(textureMode, parseInt(params.texture, 10));

    gl.uniform1i(uImage, 1);
    gl.uniform1i(uEnvironment, 2);
    gl.uniform1i(uBump, 3);

    gl.uniform3fv(uDiffuseColorLocation, [0, 1, 1]);

    var projMatrix = mat4.ortho(
      -gl.canvas.clientWidth / 2,
      gl.canvas.clientWidth / 2,
      gl.canvas.clientHeight / 2,
      -gl.canvas.clientHeight / 2,
      800,
      -800
    );
    if (params.projType == "perspective") {
      gl.uniform1f(fudgeLocation, params.fudgeFactor);
    } else {
      gl.uniform1f(fudgeLocation, 0);
    }

    if (params.projType == "oblique") {
      projMatrix = mat4.multiply(
        projMatrix,
        mat4.oblique(degToRad(75), degToRad(75))
      );
    }

    var modelMatrix = mat4.translate(
      this.translation[0],
      this.translation[1],
      this.translation[2]
    );
    modelMatrix = mat4.multiply(
      modelMatrix,
      mat4.translate(this.center[0], this.center[1], this.center[2])
    );
    modelMatrix = mat4.multiply(modelMatrix, mat4.xRotate(this.rotation[0]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.yRotate(this.rotation[1]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.zRotate(this.rotation[2]));
    modelMatrix = mat4.multiply(
      modelMatrix,
      mat4.scale(
        this.scale[0] * params.zoom,
        this.scale[1] * params.zoom,
        this.scale[2] * params.zoom
      )
    );
    modelMatrix = mat4.multiply(
      modelMatrix,
      mat4.translate(-this.center[0], -this.center[1], -this.center[2])
    );

    var eye = [0, 0, params.cameraRadius];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    var viewMatrix = mat4.identity();
    viewMatrix = mat4.multiply(
      viewMatrix,
      mat4.yRotate(params.cameraAngleRadians)
    );
    viewMatrix = mat4.multiply(viewMatrix, mat4.translate(...eye));

    var camPos = [viewMatrix[12], viewMatrix[13], viewMatrix[14]];

    var cameraMatrix = mat4.lookAt(camPos, target, up);
    viewMatrix = mat4.inverse(cameraMatrix);

    var modelViewMatrix = mat4.multiply(viewMatrix, modelMatrix);

    var normalMatrix = mat4.inverse(modelViewMatrix);
    normalMatrix = mat4.transpose(normalMatrix);
    normalMatrix = mat4.multiply(
      normalMatrix,
      mat4.yRotate(params.cameraAngleRadians)
    );

    gl.uniformMatrix4fv(projLocation, false, projMatrix);
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
    gl.uniformMatrix4fv(normalLocation, false, normalMatrix);
    gl.uniform1i(shadingBool, params.shading);

    const positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW
    );

    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.colors),
      gl.STATIC_DRAW
    );

    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normals),
      gl.STATIC_DRAW
    );

    const positionAttributeLocation = gl.getAttribLocation(
      params.program,
      "a_position"
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const colorAttributeLocation = gl.getAttribLocation(
      params.program,
      "a_color"
    );
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, true, 0, 0);

    const normalAttributeLocation = gl.getAttribLocation(
      params.program,
      "a_normal"
    );
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);

    retValue[this.name] = modelMatrix

    if (this.child !== "") {
      params.modelObject[this.child].draw(gl, params, retValue, canvasNum);
    }

    if (this.sibling !== "" && canvasNum == 1) {
      params.modelObject[this.sibling].draw(gl, params, retValue, canvasNum);
    }
  }

  reset() {
    this.translation = [0, 0, 0];
    this.rotation = [degToRad(0), degToRad(0), degToRad(0)];
    this.scale = [1, 1, 1];
    this.center = centerpoint(this);
  }
}

export default Object;
