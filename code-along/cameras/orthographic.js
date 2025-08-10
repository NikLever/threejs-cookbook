import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let cameras, scene, renderer, envmap, mesh, col, mat;

init();

function init() {

	const container = document.createElement( 'div' );
	document.body.appendChild( container );

	// eslint-disable-next-line no-unused-vars
	const target = new THREE.Vector3( 0, 0, 0 );
	const dist = 8;

	const camera1 = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
	camera1.position.set( 0, 0, dist );

	cameras = [ camera1 ];
	cameras.forEach( camera => {

		camera.viewport = new THREE.Vector4();
		camera.updateMatrixWorld();

	} );

	scene = new THREE.Scene();

	new RGBELoader()
		.setPath( '../../assets/hdr/' )
		.load( 'venice_sunset_1k.hdr', texture => {

			texture.mapping = THREE.EquirectangularReflectionMapping;

			scene.background = texture;
			scene.environment = texture;

			envmap = texture;

			// model
			const material = new THREE.MeshStandardMaterial( { color: 0x049ef4 } );
			const geometry = new THREE.TorusKnotGeometry();
			mesh = new THREE.Mesh( geometry, material );

			scene.add( mesh );

			render();

		} );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setAnimationLoop( render );
	container.appendChild( renderer.domElement );

	const controls = new OrbitControls( camera1, renderer.domElement );
	//controls.addEventListener('change', render); // use if there is no animation loop
	controls.minDistance = 2;
	controls.maxDistance = 10;
	controls.target.set( 0, 0, 0 );
	controls.update();

	col = new THREE.Color( 0xAAAAAA );
	mat = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );

	window.addEventListener( 'resize', onWindowResize );

	onWindowResize();

}

function onWindowResize() {

	const AMOUNT = 2;
	const ASPECT_RATIO = window.innerWidth / window.innerHeight;
	const WIDTH = ( window.innerWidth / AMOUNT );
	const HEIGHT = ( window.innerHeight / AMOUNT );

	for ( let y = 0; y < AMOUNT; y ++ ) {

		for ( let x = 0; x < AMOUNT; x ++ ) {

			const index = AMOUNT * y + x;
			if ( index >= cameras.length ) break;

			const camera = cameras[ index ];

			camera.viewport.set(
				Math.floor( x * WIDTH ),
				Math.floor( y * HEIGHT ),
				Math.ceil( WIDTH ),
				Math.ceil( HEIGHT ) );

			if ( index == 0 ) {

				camera.aspect = ASPECT_RATIO;

			} else {
				//TO DO - set values for the OrthographicCameras
			}

			camera.updateProjectionMatrix();

		}

	}

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function render() {

	mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.005;

	renderer.setClearColor( col, 1 );
	renderer.clearColor();

	cameras.forEach( camera => {

		if ( camera.isOrthographicCamera ) {

			scene.overrideMaterial = mat;

		} else {

			scene.background = envmap;
			scene.overrideMaterial = null;

		}

		renderer.setViewport( camera.viewport );

		renderer.render( scene, camera );

	} );

}
