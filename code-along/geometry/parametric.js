import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js"
import { GUI } from "three/addons/libs/lil-gui.module.min.js"

let scene, camera, renderer, mesh, scope = this;

init();

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
  
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0, 0, 100);
  
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    scene.add(ambient);
  
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set( 1, 10, 6);
    scene.add(light);
  
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
  
    const controls = new OrbitControls(camera, renderer.domElement);
  
    window.addEventListener( 'resize', resize, false);
  
    update();
}

function createMesh(func){

}

function update(){
    requestAnimationFrame( update );
	renderer.render( scene, camera );  
}

function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}