/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let scene, camera, renderer, controls, tube;

init();

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position.set( 0, 0, 15 );

	const ambient = new THREE.HemisphereLight( 0xffffbb, 0x080820 );
	scene.add( ambient );

	const light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
	light.position.set( 1, 10, 6 );
	scene.add( light );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( update );
	document.body.appendChild( renderer.domElement );

	controls = new FirstPersonControls( camera, renderer.domElement );
	controls.lookVertical = false;
	/*controls.lookSpeed = 0.4;
    controls.movementSpeed = 20;
    controls.noFly = true;
    controls.lookVertical = true;
    controls.constrainVertical = true;
    controls.verticalMin = 1.0;
    controls.verticalMax = 2.0;
    controls.lon = -150;
    controls.lat = 120;*/

	const geo1 = new THREE.SphereGeometry();
	const mat1 = new THREE.MeshStandardMaterial( { color: 0xFF0000 } );
	const sphere = new THREE.Mesh( geo1, mat1 );
	sphere.position.x = - 6;
	scene.add( sphere );

	const geo2 = new THREE.BoxGeometry();
	const mat2 = new THREE.MeshStandardMaterial( { color: 0x00FF00 } );
	const box = new THREE.Mesh( geo2, mat2 );
	box.position.x = 0;
	scene.add( box );

	const geo3 = new THREE.CylinderGeometry();
	const mat3 = new THREE.MeshStandardMaterial( { color: 0x0000FF } );
	const cylinder = new THREE.Mesh( geo3, mat3 );
	cylinder.position.x = 6;
	scene.add( cylinder );

	window.addEventListener( 'resize', resize, false );

	update();

}

function update() {

	controls.update( 0.2 );
	renderer.render( scene, camera );

}

function resize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}
