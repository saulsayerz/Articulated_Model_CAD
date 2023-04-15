import { drawScene, createProgram } from './script.js';
import { model_cube } from '../default_model/model_cube.js';
import { degToRad, radToDeg } from './helper.js';
import { value, slider, checkbox, button, radio } from './querySelector.js';
import { modal, openModal, closeModal } from './help.js';
import mat4 from './matrix.js';

const main = () => {
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#myCanvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  var prog = createProgram(gl);
  var defaultHollow= model_cube


window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}

  var params = {
    hollowObject: defaultHollow,
    program: prog,
    translation: [0, 0, 0],
    rotation: [degToRad(0), degToRad(0), degToRad(0)],
    scale: [1, 1, 1],
    zoom: 1.0,
    cameraAngleRadians: degToRad(0),
    cameraRadius: 200.0,
    shading: false,
    center: centerpoint(defaultHollow),
    fudgeFactor: 1,
    projType: "perspective",

  }

  var defParams = {
    translation: [0, 0, 0],
    rotation: [degToRad(0), degToRad(0), degToRad(0)],
    scale: [1, 1, 1],
    zoom: 1.0,
    cameraAngleRadians: degToRad(0),
    cameraRadius: 200.0,
    fudgeFactor: 1,
    projType: "perspective",
    shading: false,
  }

  // setup UI
  defaultSlider();
  defaultCheckbox();
  slider.slider_transX.oninput = updatePosition(0);
  slider.slider_transY.oninput = updatePosition(1);
  slider.slider_transZ.oninput = updatePosition(2);
  slider.slider_angleX.oninput = updateRotation(0);
  slider.slider_angleY.oninput = updateRotation(1);
  slider.slider_angleZ.oninput = updateRotation(2);
  slider.slider_scaleX.oninput = updateScale(0);
  slider.slider_scaleY.oninput = updateScale(1);
  slider.slider_scaleZ.oninput = updateScale(2);
  slider.slider_zoom.oninput = updateZoom();
  slider.slider_camera.oninput = updateCameraAngle();
  slider.slider_cameraR.oninput = updateCameraRadius();
  slider.slider_fudgeFactor.oninput = updateFudgeFactor();

  checkbox.check_shading.oninput = updateShading();

  button.button_reset.onclick = resetState();
  button.button_save.onclick = save();
  button.input_file.onchange = load();
  button.button_help.onclick = openModal;
  button.button_clear.onclick = clearCanvas();

  radio.orthogonalRadio.onclick = updateProjection();
  radio.perspectiveRadio.onclick = updateProjection();
  radio.obliqueRadio.onclick = updateProjection();

  var modelViewMatrix = drawScene(gl, params);

  function load() {
    return function(event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function(event) {
        var contents = event.target.result;
        var data = JSON.parse(contents);
        if (params.hollowObject.positions.length === 0) {
          params.hollowObject = data;
        } else {
          if (params.hollowObject.positions.length % 9 !== 0) {
            params.hollowObject.positions = data.positions.concat(params.hollowObject.positions);
            params.hollowObject.colors = data.colors.concat(params.hollowObject.colors);
            params.hollowObject.normals = data.normals.concat(params.hollowObject.normals);
          } else {
            params.hollowObject.positions = params.hollowObject.positions.concat(data.positions);
            params.hollowObject.colors = params.hollowObject.colors.concat(data.colors);
            params.hollowObject.normals = params.hollowObject.normals.concat(data.normals);
          }
        }
        params.center = centerpoint(params.hollowObject);
        reset();
      };
      reader.readAsText(file);
    };
  }

  function save() {
    return function(event) {
      var copyObj = JSON.parse(JSON.stringify(params.hollowObject));
      for (let i = 0; i < params.hollowObject.positions.length; i+=3) {
        var res = mat4.multiplyVector(modelViewMatrix, [params.hollowObject.positions[i], 
          params.hollowObject.positions[i+1], 
          params.hollowObject.positions[i+2], 
          1]
        );
        copyObj.positions[i] = res[0];
        copyObj.positions[i+1] = res[1];
        copyObj.positions[i+2] = res[2];
      }
      var data = JSON.stringify(copyObj);
      var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
      var url  = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.download    = "model.json";
      a.href        = url;
      a.textContent = "Download model.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }

  function updatePosition(index) {
    return function(event) {
      params.translation[index] = event.target.value;
      if (index == 0)
        value.value_transX.innerHTML = params.translation[index];
      else if (index == 1)
        value.value_transY.innerHTML = params.translation[index];
      else
        value.value_transZ.innerHTML = params.translation[index];
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function updateRotation(index) {
    return function(event) {
      var angleInDegrees = event.target.value;
      var angleInRadians = angleInDegrees * Math.PI / 180;
      params.rotation[index] = angleInRadians;
      if (index == 0)
        value.value_angleX.innerHTML = angleInDegrees;
      else if (index == 1)
        value.value_angleY.innerHTML = angleInDegrees;
      else
        value.value_angleZ.innerHTML = angleInDegrees;
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function updateScale(index) {
    return function(event) {
      params.scale[index] = event.target.value;
      if (index == 0)
        value.value_scaleX.innerHTML = params.scale[index];
      else if (index == 1)
        value.value_scaleY.innerHTML = params.scale[index];
      else
        value.value_scaleZ.innerHTML = params.scale[index];
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function updateFudgeFactor() {
    return function(event) {
      params.fudgeFactor = event.target.value;
      value.value_fudgeFactor.innerHTML = params.fudgeFactor;
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function updateZoom() {
    return function(event) {
      params.zoom = event.target.value;
      value.value_zoom.innerHTML = params.zoom;
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function updateProjection() {
    return function(event) {
      params.projType = event.target.value;
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function updateCameraAngle() {
    return function(event) {
      var angleInDegrees = event.target.value;
      var angleInRadians = angleInDegrees * Math.PI / 180;
      params.cameraAngleRadians = angleInRadians;
      value.value_camera.innerHTML = angleInDegrees;
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function updateCameraRadius() {
    return function(event) {
      params.cameraRadius = event.target.value;
      value.value_cameraR.innerHTML = params.cameraRadius;
      modelViewMatrix = drawScene(gl, params);
    }
  }

  function updateShading() {
    return function(event) {
      params.shading = event.target.checked;
      modelViewMatrix = drawScene(gl, params);
    };
  }

  function defaultSlider() {
    // set default value innerHTML
    value.value_transX.innerHTML = defParams.translation[0];
    value.value_transY.innerHTML = defParams.translation[1];
    value.value_transZ.innerHTML = defParams.translation[2];
    value.value_angleX.innerHTML = radToDeg(defParams.rotation[0]);
    value.value_angleY.innerHTML = radToDeg(defParams.rotation[1]);
    value.value_angleZ.innerHTML = radToDeg(defParams.rotation[2]);
    value.value_scaleX.innerHTML = defParams.scale[0];
    value.value_scaleY.innerHTML = defParams.scale[1];
    value.value_scaleZ.innerHTML = defParams.scale[2];
    value.value_zoom.innerHTML = defParams.zoom;
    value.value_camera.innerHTML = radToDeg(defParams.cameraAngleRadians);
    value.value_cameraR.innerHTML = defParams.cameraRadius;
    value.value_fudgeFactor.innerHTML = defParams.fudgeFactor;

    // set default value slider
    slider.slider_transX.value = defParams.translation[0];
    slider.slider_transY.value = defParams.translation[1];
    slider.slider_transZ.value = defParams.translation[2];
    slider.slider_angleX.value = radToDeg(defParams.rotation[0]);
    slider.slider_angleY.value = radToDeg(defParams.rotation[1]);
    slider.slider_angleZ.value = radToDeg(defParams.rotation[2]);
    slider.slider_scaleX.value = defParams.scale[0];
    slider.slider_scaleY.value = defParams.scale[1];
    slider.slider_scaleZ.value = defParams.scale[2];
    slider.slider_zoom.value = defParams.zoom;
    slider.slider_camera.value = radToDeg(defParams.cameraAngleRadians);
    slider.slider_cameraR.value = defParams.cameraRadius;
  }

  function defaultCheckbox() {
    checkbox.check_shading.checked = false;
  }

  function resetState() {
    return function(event) {
      reset();
    };
  }

  function clearCanvas() {
    return function(event) {
      params.hollowObject.positions = []
      params.hollowObject.colors = []
      params.hollowObject.normals = []
      drawScene(gl, params);
    };
  }

  function reset() {
    params.translation = [...defParams.translation];
    params.rotation = [...defParams.rotation];
    params.scale = [...defParams.scale];
    params.zoom = defParams.zoom;
    params.cameraAngleRadians = defParams.cameraAngleRadians;
    params.cameraRadius = defParams.cameraRadius;
    params.fudgeFactor = defParams.fudgeFactor;
    params.projType = defParams.projType;
    params.shading = defParams.shading;
    radio.perspectiveRadio.checked = true;
    defaultSlider();
    defaultCheckbox();
    modelViewMatrix = drawScene(gl, params);
  }

  function centerpoint(hollowObject) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let i = 0; i < hollowObject.positions.length; i+=3) {
      x += hollowObject.positions[i];
      y += hollowObject.positions[i+1];
      z += hollowObject.positions[i+2];
    }
    x /= hollowObject.positions.length/3;
    y /= hollowObject.positions.length/3;
    z /= hollowObject.positions.length/3;
    return [x, y, z];
  }
}

window.onload = main