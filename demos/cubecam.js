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

  	const options = {
  		geometry: 'Box'
  	};
  	const gui = new GUI();
  	gui.add( options, 'geometry', [ 'Box', 'Sphere', 'Cone' ] ).onChange( value => {

  		createMesh( value );

	} );

  	createMesh( options.geometry );

  	update();

}

function createMesh( type ) {

  	let material, geometry;

  	if ( object ) {

  		scene.remove( object );
  		material = object.material;
  		object.geometry.dispose();

	} else {

  		material = new THREE.MeshStandardMaterial( { color: 0xFFFFFF } );
		material.map = new THREE.TextureLoader().load( '../assets/cubemap_skybox.png' );

	}

  	switch ( type ) {

  		case 'Box':
  			geometry = new THREE.BoxGeometry();
  			break;
  		case 'Sphere':
  			geometry = new THREE.SphereGeometry( 0.7 );
  			break;
  		case 'Cone':
  			geometry = new THREE.ConeGeometry( 0.7, 1.5 );
  			break;

	}

  	object = new THREE.Mesh( geometry, material );

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
