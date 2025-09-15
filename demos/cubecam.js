import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// eslint-disable-next-line no-unused-vars
let scene, camera, renderer, controls, object;

init();

function init() {

  	scene = new THREE.Scene();
  	scene.background = new THREE.Color( 0xaaaaaa );

  	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
  	camera.position.set( 0, 0, 4 );

  	const ambient = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 0.3 );
  	scene.add( ambient );

  	const light = new THREE.DirectionalLight( 0xFFFFFF, 3 );
  	light.position.set( 0.2, 1, 1 );
  	scene.add( light );

  	renderer = new THREE.WebGLRenderer( { antialias: true } );
  	renderer.setSize( window.innerWidth, window.innerHeight );
  	document.body.appendChild( renderer.domElement );

  	controls = new OrbitControls( camera, renderer.domElement );

  	window.addEventListener( 'resize', resize, false );

	createCube();

  	update();

}

function createCube( ) {

  	object = new THREE.Group();

	const configs = [
		{ x: - 0.5, y: 0, z: 0, h: Math.PI / 2, p: 0, b: 0, map: 'nx' },
		{ x: 0.5, y: 0, z: 0, h: - Math.PI / 2, p: 0, b: 0, map: 'px' },
		{ x: 0, y: 0, z: - 0.5, h: Math.PI, p: 0, b: 0, map: 'nz' },
		{ x: 0, y: 0, z: 0.5, h: 0, p: 0, b: 0, map: 'pz' },
		{ x: 0, y: - 0.5, z: 0, h: 0, p: - Math.PI / 2, b: 0, map: 'ny' },
		{ x: - 0.5, y: 0, z: 0, h: 0, p: Math.PI / 2, b: 0, map: 'py' }
	];

	configs.forEach( config => {

	    const quad = new THREE.PlaneGeometry();
	    const material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
		material.map = new THREE.TextureLoader().load( `../assets/skybox3/${config.map}.jpg` );
		const mesh = new THREE.Mesh( quad, material );
		mesh.position.set( config.x, config.y, config.z );
		mesh.rotation.set( config.p, config.h, config.b );
		object.add( mesh );

	} );

  	scene.add( object );

}

function update() {

  	// eslint-disable-next-line compat/compat
  	requestAnimationFrame( update );

  	object.rotateY( 0.01 );

  	renderer.render( scene, camera );

}

function resize() {

  	camera.aspect = window.innerWidth / window.innerHeight;
  	camera.updateProjectionMatrix();
  	renderer.setSize( window.innerWidth, window.innerHeight );

}
