import * as THREE from "three";
import {
  positionGeometry,
  normalGeometry,
  mix,
  Fn,
  select,
  uniform
} from "three/tsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let container;

let camera, scene, renderer, options, material, assetPath;

init();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    2500
  );
  camera.position.set(0.0, 1, 4);

  //

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x444488);

  //

  renderer = new THREE.WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);
  container.appendChild(renderer.domElement);

  //

  //content

  const ambient = new THREE.HemisphereLight(0xaaaaaa, 0x333333);
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 3, 1);
  scene.add(ambient);
  scene.add(light);

  const controls = new OrbitControls(camera, renderer.domElement);

  assetPath = "https://niksfiles.s3.eu-west-2.amazonaws.com";

  tsl();

  window.addEventListener("resize", onWindowResize);
}

function tsl() {
  const geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
  material = new THREE.MeshStandardNodeMaterial({
    color: 0xff0000,
    wireframe: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  options = {
    delta: 0
  };

  const deltaUniform = uniform(0);

  const spherize = Fn(({ outputNormal }) => {
    const sphereNormal = positionGeometry.normalize();
    const pos = mix(positionGeometry, sphereNormal.mul(0.6), deltaUniform);
    const norm = mix(normalGeometry, sphereNormal, deltaUniform);

    return select(outputNormal, norm, pos);
  });

  material.positionNode = spherize({
    outputNormal: false
  });

  material.normalNode = spherize({
    outputNormal: true
  });

  const gui = new GUI();
  gui.add(options, "delta", 0, 1).onChange((value) => {
    deltaUniform.value = value;
  });
  gui.add(material, "wireframe");
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function render() {
  renderer.render(scene, camera);
}