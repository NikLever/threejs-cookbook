import * as THREE from 'three';
import { positionLocal, Fn, uniform, step, If } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let container;

let camera,
	scene,
	renderer,
	clock,
	material,
	options,
	u_reveal,
	u_threshold,
	minY,
	revealTime,
	height,
	assetPath,
	barrel;

init();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		1,
		2500
	);
	camera.position.set( 0.0, 1, 4 );

	clock = new THREE.Clock();
	//

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xbbbbff );

	//

	renderer = new THREE.WebGPURenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( render );
	container.appendChild( renderer.domElement );

	//

	//content

	const ambient = new THREE.HemisphereLight( 0xaaaaaa, 0x333333 );
	const light = new THREE.DirectionalLight( 0xffffff, 3 );
	light.position.set( 3, 3, 1 );
	scene.add( ambient );
	scene.add( light );

	// eslint-disable-next-line no-unused-vars
	const controls = new OrbitControls( camera, renderer.domElement );

	assetPath = '../../assets/';

	tsl();

	const aabb = new THREE.Box3();

	options = {
		duration: 2,
		hide: true,
		reveal: () => {

			barrel.visible = true;
			options.hide = false;
			guiHide.updateDisplay();
			revealTime = 0;
			aabb.setFromObject( barrel );
			height = aabb.max.y - aabb.min.y;
			minY = aabb.min.y;
			u_reveal.value = 1;

		}
	};

	const gui = new GUI();
	gui.add( options, 'duration', 0.5, 4 );
	const guiHide = gui.add( options, 'hide' ).onChange( ( value ) => {

		barrel.visible = ! value;

	} );
	gui.add( options, 'reveal' );

	loadGLTF( 'barrel.glb' );

	window.addEventListener( 'resize', onWindowResize );

}

function loadGLTF( filename ) {

	const loader = new GLTFLoader();
	loader.setPath( assetPath );

	loader.load(
		filename,
		( gltf ) => {

			gltf.scene.rotateX( Math.PI / 2 );
			scene.add( gltf.scene );
			barrel = gltf.scene;
			barrel.visible = false;

			barrel.traverse( ( child ) => {

				if ( child.isMesh ) {

					material.map = child.material.map;
					child.material = material;

				}

			} );

		},
		null,
		( err ) => {

			console.log( err.message );

		}
	);

}

function tsl() {

	material = new THREE.MeshStandardNodeMaterial( { side: THREE.DoubleSide } );

	u_threshold = uniform( 0.0 );
	u_reveal = uniform( 0.0 );

	const alphaTestFunc = Fn( () => {

		const p = positionLocal.toVar();

		If( u_reveal.greaterThan( 0.0 ), () => {

			p.assign( step( u_threshold, p ).oneMinus() );

		} );

		return p.y;

	} );

	material.alphaTestNode = alphaTestFunc();
	material.needsUpdate = true;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function render() {

	const dt = clock.getDelta();
	if ( u_reveal && u_reveal.value > 0 ) {

		revealTime += dt;
		if ( revealTime > options.duration ) {

			u_reveal.value = 0;

		} else {

			u_threshold.value = minY + height * ( 1 - revealTime / options.duration );

		}

	}

	renderer.render( scene, camera );

}
