import * as THREE from 'three';
import { positionLocal, texture } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let container;

let camera, scene, renderer, options, material, assetPath;

init();

function init( ) {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 2500 );
	camera.position.set( 0.0, 1, 4 );

	//

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x444488 );

	//

	renderer = new THREE.WebGPURenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( render );
	container.appendChild( renderer.domElement );

	//

	//content

	const ambient = new THREE.HemisphereLight( 0xaaaaaa, 0x333333 );
	const light = new THREE.DirectionalLight( 0xFFFFFF, 3 );
	light.position.set( 3, 3, 1 );
	scene.add( ambient );
	scene.add( light );

	// eslint-disable-next-line no-unused-vars
	const controls = new OrbitControls( camera, renderer.domElement );

	assetPath = 'https://niksfiles.s3.eu-west-2.amazonaws.com';

	tsl();

	window.addEventListener( 'resize', onWindowResize );

}

function tsl() {

	const geometry = new THREE.SphereGeometry( );
	material = new THREE.MeshStandardNodeMaterial( { color: 0xFF0000 } );

	material.colorNode = positionLocal;

	const mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	const tex = new THREE.TextureLoader().load( `${assetPath}/uv_grid.jpg` );

	options = {
		mode: 'positionLocal'
	};

	const gui = new GUI();
	gui.add( options, 'mode', [ 'positionLocal', 'texture' ] )
		.onChange( value => {

			switch ( value ) {

		  case 'positionLocal':
			  material.colorNode = positionLocal;
					break;
				case 'texture':
			  material.colorNode = texture( tex );
					break;

			}

			material.needsUpdate = true;

		} );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function render() {

	renderer.render( scene, camera );

}
