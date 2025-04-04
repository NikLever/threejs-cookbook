import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';

let scene, camera, renderer, controls, physics, physicsHelper;

init();

async function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xbfd1e5 );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.set( 0, 3, 10 );

	const ambient = new THREE.HemisphereLight( 0x555555, 0xFFFFFF );
	scene.add( ambient );

	const light = new THREE.DirectionalLight( 0xffffff, 4 );
	light.position.set( 0, 12.5, 12.5 );
	light.castShadow = true;
	light.shadow.radius = 4;
	light.shadow.blurSamples = 8;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	const size = 10;
	light.shadow.camera.left = - size;
	light.shadow.camera.bottom = - size;
	light.shadow.camera.right = size;
	light.shadow.camera.top = size;
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 50;

	scene.add( light );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	document.body.appendChild( renderer.domElement );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3( 0, 2, 0 );
	controls.update();

	const geometry = new THREE.BoxGeometry( 10, 0.5, 10 );
	const material = new THREE.MeshStandardMaterial( { color: 0xFFFFFF } );
	new THREE.TextureLoader().load( '../../assets/grid.png', ( texture ) => {

  		texture.wrapS = THREE.RepeatWrapping;
  		texture.wrapT = THREE.RepeatWrapping;
  		texture.repeat.set( 20, 20 );
  		material.map = texture;
  		material.needsUpdate = true;

	} );

	const floor = new THREE.Mesh( geometry, material );
	floor.receiveShadow = true;

	floor.position.y = - 0.25;

	scene.add( floor );

	initPhysics();

	onWindowResize();

	window.addEventListener( 'resize', onWindowResize, false );

	renderer.setAnimationLoop( update );

}

function initPhysics() {

}

function addBody( ) {

}

function onWindowResize( ) {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function update() {

	//requestAnimationFrame( update );

	renderer.render( scene, camera );

}
