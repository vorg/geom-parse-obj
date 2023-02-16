import parseObj from "../index.js";

import createContext from "pex-context";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import { mat4 } from "pex-math";
import createGUI from "pex-gui";
import normals from "geom-normals";
import centerAndNormalize from "geom-center-and-normalize";

const State = {
  model: 0,
  models: [
    "bunny", // http://graphics.stanford.edu/data/3Dscanrep/
    "spot", // https://www.cs.cmu.edu/~kmcrane/Projects/ModelRepository/#spot
    "suzanne", // https://www.blender.org/
  ],
  mode: 0,
  shadings: ["normals", "standard derivative", "uvs"],
};
const ctx = createContext({
  element: document.querySelector("main"),
  pixelRatio: devicePixelRatio,
});
const camera = createCamera({
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  position: [0, 0, 1.5],
});
const orbiter = createOrbiter({ camera });

let cmdOptions = {};

const updateGeometry = async () => {
  const objString = await (
    await fetch(
      new URL(
        `assets/${State.models[State.model]}.obj`,
        import.meta.url
      ).toString()
    )
  ).text();

  const [geometry] = parseObj(objString);
  console.log("Parsed", geometry);
  if (!geometry.normals) {
    geometry.normals = normals(geometry.positions, geometry.cells);
  }
  if (!geometry.uvs) {
    const size = geometry.positions.length / 3;
    geometry.uvs = new Float32Array(size * 2).fill(1);
  }
  centerAndNormalize(geometry.positions);
  console.log("Enhanced", geometry);

  cmdOptions = {
    attributes: {
      aPosition: ctx.vertexBuffer(geometry.positions),
      aNormal: ctx.vertexBuffer(geometry.normals),
      aUv: ctx.vertexBuffer(geometry.uvs),
    },
    indices: ctx.indexBuffer(geometry.cells),
  };
};

updateGeometry();

const gui = createGUI(ctx);
gui.addColumn("Model");
gui.addRadioList(
  "Name",
  State,
  "model",
  State.models.map((name, value) => ({ name, value })),
  updateGeometry
);
gui.addColumn("Rendering");
gui.addRadioList(
  "Mode",
  State,
  "mode",
  State.shadings.map((name, value) => ({ name, value }))
);

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const drawGeom = {
  pipeline: ctx.pipeline({
    vert: /* glsl */ `#version 300 es
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

in vec3 aPosition;
in vec3 aNormal;
in vec2 aUv;

out vec3 vPositionWorld;
out vec3 vNormal;
out vec2 vUv;

void main () {
  vPositionWorld = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vNormal = aNormal;
  vUv = aUv;
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}`,
    frag: /* glsl */ `#version 300 es
precision highp float;

uniform float uMode;

in vec3 vPositionWorld;
in vec3 vNormal;
in vec2 vUv;

out vec4 fragColor;

void main () {
  if (uMode == 0.0) fragColor = vec4(vNormal * 0.5 + 0.5, 1.0);

  if (uMode == 1.0) {
    vec3 fdx = vec3(dFdx(vPositionWorld.x), dFdx(vPositionWorld.y), dFdx(vPositionWorld.z));
    vec3 fdy = vec3(dFdy(vPositionWorld.x), dFdy(vPositionWorld.y), dFdy(vPositionWorld.z));
    vec3 normal = normalize(cross(fdx, fdy));
    fragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }

  if (uMode == 2.0) fragColor = vec4(vUv.xy, 0.0, 1.0);
}`,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
};

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawGeom, {
    ...cmdOptions,
    uniforms: {
      uMode: State.mode,
    },
  });
  gui.draw();
});
