import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';

let scene, camera, renderer, controls, pivot, physics, physicsHelper;

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
	light.shadow.radius = 7;
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

	renderer.setAnimationLoop( update );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3( 0, 2, 0 );
	controls.update();

	const geometry = new THREE.SphereGeometry( 0.5 );
	const material = new THREE.MeshStandardMaterial( { color: 0xFF0000 } );

	pivot = new THREE.Mesh( geometry, material );

	pivot.position.y = 6;
	pivot.userData.physics = { mass: 0 };

	scene.add( pivot );

	initPhysics();

	onWindowResize();

	window.addEventListener( 'resize', onWindowResize, false );

}

async function initPhysics() {

	physics = await RapierPhysics();

	physics.addMesh( pivot, 0 );

	physicsHelper = new RapierHelper( physics.world );
	scene.add( physicsHelper );

	//Add links here

}

// eslint-disable-next-line no-unused-vars
function addLink( link, x ) {



}

function onWindowResize( ) {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function update() {

	if ( physicsHelper ) physicsHelper.update();

	renderer.render( scene, camera );

}
