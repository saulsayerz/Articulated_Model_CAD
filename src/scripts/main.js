import { model_penyu } from "../default_model/model_example.js";
import { model_anjing } from "../default_model/model_anjing.js";
import { generateTree } from "./componentTree.js";
import { closeModal, modal, openModal } from "./help.js";
import { centerpoint, degToRad, radToDeg } from "./helper.js";
import mat4 from "./matrix.js";
import Object from "./object.js";
import {
  button,
  checkbox,
  radio,
  select,
  slider,
  value,
} from "./querySelector.js";
import { recPosition, recReset, recRotation, recScale } from "./recursive.js";
import { createProgram, drawCanvas } from "./script.js";
import {
  loadTextureCube,
  loadTexture2D,
} from "./texture.js";

const main = () => {
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#myCanvas");
  var canvas2 = document.querySelector("#myCanvas2");
  
  var gl = canvas.getContext("experimental-webgl");
  gl.getExtension('OES_standard_derivatives');

  if (!gl) {
    return;
  }
  var gl2 = canvas2.getContext("experimental-webgl");
  gl2.getExtension('OES_standard_derivatives');

  if (!gl2) {
    return;
  }
  var prog = createProgram(gl);
  var prog2 = createProgram(gl2);
  var defaultModel = {};
  for (let object of model_anjing.parts) {
    let newPart = new Object(
      object["name"],
      object["vertices"],
      object["colors"],
      object["normals"],
      object["child"],
      object["sibling"]
    );
    defaultModel[object.name] = newPart;
  }
  var root = model_anjing.root_name;
  generateTree(defaultModel, root, treeClicked);
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };

  var isSubTree = true;

  var params1 = {
    modelObject: defaultModel,
    globalRoot: root,
    root: root,
    translation: [0, 0, 0],
    rotation: [degToRad(0), degToRad(0), degToRad(0)],
    scale: [1,1,1],
    center: centerpoint(defaultModel[root]),
    program: prog,
    zoom: 1.0,
    cameraAngleRadians: degToRad(0),
    cameraRadius: 200.0,
    shading: false,
    fudgeFactor: 1,
    projType: "perspective",
    texture: model_anjing.texture_mode,
  };

  var params2 = {
    modelObject: defaultModel,
    globalRoot: root,
    root: root,
    program: prog2,
    zoom: 1.0,
    cameraAngleRadians: degToRad(0),
    cameraRadius: 200.0,
    shading: false,
    fudgeFactor: 1,
    projType: "perspective",
    texture: model_anjing.texture_mode,
  };

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
    texture: model_anjing.texture_mode,
  };

  // setup UI
  defaultSlider();
  defaultCheckbox();
  defaultSelect();
  slider.slider_transX.oninput = updatePosition(0, true);
  slider.slider_transY.oninput = updatePosition(1, true);
  slider.slider_transZ.oninput = updatePosition(2, true);
  slider.slider_angleX.oninput = updateRotation(0, true);
  slider.slider_angleY.oninput = updateRotation(1, true);
  slider.slider_angleZ.oninput = updateRotation(2, true);
  slider.slider_scaleX.oninput = updateScale(0, true);
  slider.slider_scaleY.oninput = updateScale(1, true);
  slider.slider_scaleZ.oninput = updateScale(2, true);
  slider.slider_zoom.oninput = updateZoom(1);
  slider.slider_camera.oninput = updateCameraAngle(1);
  slider.slider_cameraR.oninput = updateCameraRadius(1);
  slider.slider_fudgeFactor.oninput = updateFudgeFactor(1);

  slider.slider_component_transX.oninput = updatePosition(0, false);
  slider.slider_component_transY.oninput = updatePosition(1, false);
  slider.slider_component_transZ.oninput = updatePosition(2, false);
  slider.slider_component_angleX.oninput = updateRotation(0, false);
  slider.slider_component_angleY.oninput = updateRotation(1, false);
  slider.slider_component_angleZ.oninput = updateRotation(2, false);
  slider.slider_component_scaleX.oninput = updateScale(0, false);
  slider.slider_component_scaleY.oninput = updateScale(1, false);
  slider.slider_component_scaleZ.oninput = updateScale(2, false);
  slider.slider_component_zoom.oninput = updateZoom(2);
  slider.slider_component_camera.oninput = updateCameraAngle(2);
  slider.slider_component_cameraR.oninput = updateCameraRadius(2);
  slider.slider_component_fudgeFactor.oninput = updateFudgeFactor(2);

  checkbox.check_shading.oninput = updateShading(1);
  checkbox.check_component_shading.oninput = updateShading(2);

  button.button_reset.onclick = resetState(1);
  button.button_component_reset.onclick = resetState(2);

  select.select_texture.onchange = updateTexture(1);
  select.select_component_texture.onchange = updateTexture(2);

  button.button_save.onclick = save();
  button.input_file.onchange = load();
  button.button_help.onclick = openModal;

  radio.orthogonalRadio.onclick = updateProjection(1);
  radio.perspectiveRadio.onclick = updateProjection(1);
  radio.obliqueRadio.onclick = updateProjection(1);

  radio.orthogonal_component_Radio.onclick = updateProjection(2);
  radio.perspective_component_Radio.onclick = updateProjection(2);
  radio.oblique_component_Radio.onclick = updateProjection(2);
  var modelViewMatrix = drawBothScene();

  function load() {
    return function (event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function (event) {
        var contents = event.target.result;
        var data = JSON.parse(contents);
        for (let object of data.parts) {
          let newPart = new Object(
            object["name"],
            object["vertices"],
            object["colors"],
            object["normals"],
            object["child"],
            object["sibling"]
          );
          params1.modelObject[object.name] = newPart;
        }
        params1.root = data.root_name;
        reset();
        generateTree(params1.modelObject, params1.root);
      };
      reader.readAsText(file);
    };
  }

  function save() {
    return function (event) {
      var copyObj = JSON.parse(JSON.stringify(params1.modelObject));
      for (let i = 0; i < params1.modelObject.vertices.length; i += 3) {
        var res = mat4.multiplyVector(modelViewMatrix, [
          params1.modelObject.vertices[i],
          params1.modelObject.vertices[i + 1],
          params1.modelObject.vertices[i + 2],
          1,
        ]);
        copyObj.vertices[i] = res[0];
        copyObj.vertices[i + 1] = res[1];
        copyObj.vertices[i + 2] = res[2];
      }
      var data = JSON.stringify(copyObj);
      var blob = new Blob([data], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.download = "model.json";
      a.href = url;
      a.textContent = "Download model.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }

  function updatePosition(index, subTree) {
    return function (event) {
      if (subTree) {
        params1.translation[index] = event.target.value;

        if (index == 0)
          value.value_transX.innerHTML =
            params1.modelObject[params1.root].translation[index];
        else if (index == 1)
          value.value_transY.innerHTML =
            params1.modelObject[params1.root].translation[index];
        else
          value.value_transZ.innerHTML =
            params1.modelObject[params1.root].translation[index];
      } else {
        recPosition(
          index,
          event.target.value,
          params1.modelObject,
          params1.root,
          false
        );

        if (index == 0)
          value.value_component_transX.innerHTML =
            params2.modelObject[params2.root].translation[index];
        else if (index == 1)
          value.value_component_transY.innerHTML =
            params2.modelObject[params2.root].translation[index];
        else
          value.value_component_transZ.innerHTML =
            params2.modelObject[params2.root].translation[index];
      }

      isSubTree = subTree;
      modelViewMatrix = drawBothScene();
    };
  }

  function updateRotation(index, subTree) {
    return function (event) {
      var angleInDegrees = event.target.value;
      var angleInRadians = (angleInDegrees * Math.PI) / 180;

      if (subTree) {
        params1.rotation[index] = angleInRadians;

        if (index == 0) value.value_angleX.innerHTML = angleInDegrees;
        else if (index == 1) value.value_angleY.innerHTML = angleInDegrees;
        else value.value_angleZ.innerHTML = angleInDegrees;
      } else {
        recRotation(
          index,
          angleInRadians,
          params1.modelObject,
          params1.root,
          false
        );

        if (index == 0) value.value_component_angleX.innerHTML = angleInDegrees;
        else if (index == 1)
          value.value_component_angleY.innerHTML = angleInDegrees;
        else value.value_component_angleZ.innerHTML = angleInDegrees;
      }

      isSubTree = subTree;
      modelViewMatrix = drawBothScene();
    };
  }

  function updateScale(index, subTree) {
    return function (event) {
      if (subTree) {
        params1.scale[index] = event.target.value;

        if (index == 0)
          value.value_scaleX.innerHTML =
            params1.modelObject[params1.root].scale[index];
        else if (index == 1)
          value.value_scaleY.innerHTML =
            params1.modelObject[params1.root].scale[index];
        else
          value.value_scaleZ.innerHTML =
            params1.modelObject[params1.root].scale[index];
      } else {
        recScale(
          index,
          event.target.value,
          params1.modelObject,
          params1.root,
          false
        );

        if (index == 0)
          value.value_component_scaleX.innerHTML =
            params2.modelObject[params2.root].scale[index];
        else if (index == 1)
          value.value_component_scaleY.innerHTML =
            params2.modelObject[params2.root].scale[index];
        else
          value.value_component_scaleZ.innerHTML =
            params2.modelObject[params2.root].scale[index];
      }

      isSubTree = subTree
      modelViewMatrix = drawBothScene();
    };
  }

  function updateFudgeFactor(canvasNum) {
    return function (event) {
      if (canvasNum === 1) {
        params1.fudgeFactor = event.target.value;
        value.value_fudgeFactor.innerHTML = params1.fudgeFactor;
      } else {
        params2.fudgeFactor = event.target.value;
        value.value_component_fudgeFactor.innerHTML = params2.fudgeFactor;
      }

      modelViewMatrix = drawBothScene();
    };
  }

  function updateZoom(canvasNum) {
    return function (event) {
      if (canvasNum === 1) {
        params1.zoom = event.target.value;
        value.value_zoom.innerHTML = params1.zoom;
      } else {
        params2.zoom = event.target.value;
        value.value_component_zoom.innerHTML = params2.zoom;
      }

      modelViewMatrix = drawBothScene();
    };
  }

  function updateProjection(canvasNum) {
    return function (event) {
      if (canvasNum === 1) {
        params1.projType = event.target.value;
      } else {
        params2.projType = event.target.value;
      }

      modelViewMatrix = drawBothScene();
    };
  }

  function updateCameraAngle(canvasNum) {
    return function (event) {
      var angleInDegrees = event.target.value;
      var angleInRadians = (angleInDegrees * Math.PI) / 180;

      if (canvasNum === 1) {
        params1.cameraAngleRadians = angleInRadians;
        value.value_camera.innerHTML = angleInDegrees;
      } else {
        params2.cameraAngleRadians = angleInRadians;
        value.value_camera.innerHTML = angleInDegrees;
      }

      modelViewMatrix = drawBothScene();
    };
  }

  function updateCameraRadius(canvasNum) {
    return function (event) {
      if (canvasNum === 1) {
        params1.cameraRadius = event.target.value;
        value.value_cameraR.innerHTML = params1.cameraRadius;
      } else {
        params2.cameraRadius = event.target.value;
        value.value_component_cameraR.innerHTML = params2.cameraRadius;
      }

      modelViewMatrix = drawBothScene();
    };
  }

  function updateTexture(canvasNum) {
    return function (event) {
      if (canvasNum === 1) {
        params1.texture = event.target.value;
      } else {
        params2.texture = event.target.value;
      }

      modelViewMatrix = drawBothScene();
    };
  }

  function updateShading(canvasNum) {
    return function (event) {
      if (canvasNum === 1) {
        params1.shading = event.target.checked;
      } else {
        params2.shading = event.target.checked;
      }

      modelViewMatrix = drawBothScene();
    };
  }

  function defaultSlider(canvasNum) {
    // set default value innerHTML
    if (canvasNum === 1) {
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
    } else {
      value.value_component_transX.innerHTML = defParams.translation[0];
      value.value_component_transY.innerHTML = defParams.translation[1];
      value.value_component_transZ.innerHTML = defParams.translation[2];
      value.value_component_angleX.innerHTML = radToDeg(defParams.rotation[0]);
      value.value_component_angleY.innerHTML = radToDeg(defParams.rotation[1]);
      value.value_component_angleZ.innerHTML = radToDeg(defParams.rotation[2]);
      value.value_component_scaleX.innerHTML = defParams.scale[0];
      value.value_component_scaleY.innerHTML = defParams.scale[1];
      value.value_component_scaleZ.innerHTML = defParams.scale[2];
      value.value_component_zoom.innerHTML = defParams.zoom;
      value.value_component_camera.innerHTML = radToDeg(
        defParams.cameraAngleRadians
      );
      value.value_component_cameraR.innerHTML = defParams.cameraRadius;
      value.value_component_fudgeFactor.innerHTML = defParams.fudgeFactor;

      // set default value slider
      slider.slider_component_transX.value = defParams.translation[0];
      slider.slider_component_transY.value = defParams.translation[1];
      slider.slider_component_transZ.value = defParams.translation[2];
      slider.slider_component_angleX.value = radToDeg(defParams.rotation[0]);
      slider.slider_component_angleY.value = radToDeg(defParams.rotation[1]);
      slider.slider_component_angleZ.value = radToDeg(defParams.rotation[2]);
      slider.slider_component_scaleX.value = defParams.scale[0];
      slider.slider_component_scaleY.value = defParams.scale[1];
      slider.slider_component_scaleZ.value = defParams.scale[2];
      slider.slider_component_zoom.value = defParams.zoom;
      slider.slider_component_camera.value = radToDeg(
        defParams.cameraAngleRadians
      );
      slider.slider_component_cameraR.value = defParams.cameraRadius;
    }
  }

  function defaultCheckbox() {
    checkbox.check_shading.checked = false;
  }

  function defaultSelect() {
    select.select_texture.value = defParams.texture;
    select.select_component_texture.value = defParams.texture;
  }

  function resetTRS(canvasNum) {
    if (canvasNum === 1) {
      // recReset(params1.modelObject, params1.root, true);
      params1.translation= [0, 0, 0];
      params1.rotation= [degToRad(0), degToRad(0), degToRad(0)];
      params1.scale= [1,1,1];
    } else {
      recReset(params2.modelObject, params2.root, true);
    }
  }

  function resetState(canvasNum) {
    return function (event) {
      if (canvasNum === 1) {
        reset(1);
      } else {
        reset(2);
      }
    };
  }

  function reset(canvasNum) {
    if (canvasNum === 1) {
      params1.zoom = defParams.zoom;
      params1.cameraAngleRadians = defParams.cameraAngleRadians;
      params1.cameraRadius = defParams.cameraRadius;
      params1.shading = defParams.shading;
      params1.fudgeFactor = defParams.fudgeFactor;
      params1.projType = defParams.projType;
      params1.texture = defParams.texture;
      radio.perspectiveRadio.checked = true;
      resetTRS(1);
      defaultSlider(1);
      defaultCheckbox(1);
    } else {
      params2.zoom = defParams.zoom;
      params2.cameraAngleRadians = defParams.cameraAngleRadians;
      params2.cameraRadius = defParams.cameraRadius;
      params2.shading = defParams.shading;
      params2.fudgeFactor = defParams.fudgeFactor;
      params2.projType = defParams.projType;
      params2.texture = defParams.texture;
      radio.perspectiveRadio.checked = true;
      resetTRS(2);
      defaultSlider(2);
      defaultCheckbox(2);
    }

    defaultSelect();
    isSubTree = true;
    modelViewMatrix = drawBothScene();
  }

  function treeClicked(event) {
    console.log(event.target.name);
    params1.root = event.target.name;
    params2.root = event.target.name;
    drawBothScene();
  }

  function drawBothScene() {
    // drawScene(gl, params1);
    // drawScene(gl2, params1,false);
    const ret1 = drawCanvas(gl, params1, 1, isSubTree);
    const ret2 = drawCanvas(gl2, params2, 2, isSubTree);

    return ret1;
  }

  loadTexture2D(gl, prog, 'assets/custom/custom.jpg', 1)
  loadTextureCube(gl, prog);
  loadTexture2D(gl, prog, 'assets/bump/toy_box_normal.png', 3)
  loadTexture2D(gl, prog, 'assets/bump/woodtiles.jpg', 4)

  loadTexture2D(gl2, prog2, 'assets/custom/custom.jpg', 1)
  loadTextureCube(gl2, prog2);
  loadTexture2D(gl2, prog2, 'assets/bump/toy_box_normal.png', 3)
  loadTexture2D(gl2, prog2, 'assets/bump/woodtiles.jpg', 4)
};

window.onload = main;
