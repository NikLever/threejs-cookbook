import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';

let camera, scene, renderer, baked;

init();

function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true, stencil: false } );
	renderer.setPixelRatio( Math.min( 2, window.devicePixelRatio ) );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 50 );
	camera.position.set( - 3.2, 3.3, 5.3 );

	const col = 0x201510;
	scene = new THREE.Scene();
	scene.background = new THREE.Color( col );

	window.addEventListener( 'resize', onWindowResize, false );

	const controls = new OrbitControls( camera, renderer.domElement );

	controls.addEventListener( 'change', () => {

		renderer.render( scene, camera );

	} );

	loadModel();

}

function loadModel() {

	const loader = new GLTFLoader( ).setPath( '../../assets/' );
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( '../../node_modules/three/examples/jsm/libs/draco/' );
	loader.setDRACOLoader( dracoLoader );

	const loadingBar = new LoadingBar();
	loadingBar.visible = true;

	// Load a glTF resource
	loader.load(
		// resource URL
		'baked.glb',
		// called when the resource is loaded
		gltf => {

			baked = gltf.scene;

			baked.traverse( child => {

				if ( child.isMesh ) {

					const material = new THREE.MeshBasicMaterial( { map: child.material.map } );
					child.material = material;

				}

			} );

			loadingBar.visible = false;

			scene.add( baked );

			renderer.render( scene, camera );

		},
		// called while loading is progressing
		xhr => {

			loadingBar.update( name, xhr.loaded, xhr.total );

		},
		// called when loading has errors
		err => {

			console.error( err );

		}
	);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

function render() {

	renderer.render( scene, camera );

}
