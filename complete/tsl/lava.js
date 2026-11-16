import * as THREE from 'three';
import {
	positionLocal,
	normalLocal,
	Fn,
	time,
	mix,
	pow,
	abs,
	Loop,
	float,
	vec2,
	vec3,
	texture,
	varying,
	mx_noise_float,
	uniform
} from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let container;

let camera, scene, renderer, options, material;

init();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		1,
		200
	);
	camera.position.set( 0, 1, - 4 );

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
	const light = new THREE.DirectionalLight( 0xffffff, 3 );
	light.position.set( 3, 3, - 10 );
	scene.add( ambient );
	scene.add( light );

	// eslint-disable-next-line no-unused-vars
	const controls = new OrbitControls( camera, renderer.domElement );

	tsl();

	window.addEventListener( 'resize', onWindowResize );

}

function tsl() {

	const geometry = new THREE.IcosahedronGeometry( 0.8, 6 );
	material = new THREE.MeshStandardNodeMaterial( {
		color: 0xff0000
	} );

	const tex = new THREE.TextureLoader()
		.setPath( '../../assets/' )
		.load( 'explosion.png' );

	const mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	options = {
		strength: 0.312,
		scale: 1.852,
		speed: 1,
		range: 1.3,
		offset: - 0.78,
		amplitude: 0.41,
		pivot: 1.25
	};

	const noiseStrength = uniform( options.strength );
	const noiseScale = uniform( options.scale );
	const noiseSpeed = uniform( options.speed );
	const uvRange = uniform( options.range );
	const uvOffset = uniform( options.offset );
	const uvAmplitude = uniform( options.amplitude );
	const uvPivot = uniform( options.pivot );

	const vNoise = varying( float() );
	const vPosition = varying( vec3() );

	const turbulenceFunc = /*#__PURE__*/ Fn( ( [ p_immutable ] ) => {

		const p = vec3( p_immutable ).toVar();
		const t = float( - 0.5 ).toVar();

		Loop(
			{ start: 1.0, end: 10.0, name: 'f', type: 'float', condition: '<=' },
			( { f } ) => {

				const power = float( pow( 2.0, f ) ).toVar();
				t.addAssign(
					abs( mx_noise_float( vec3( power.mul( p ) ), vec3( 1.0 ) ).div( power ) )
				);

			}
		);

		return t;

	} ).setLayout( {
		name: 'turbulenceFunc',
		type: 'float',
		inputs: [ { name: 'p', type: 'vec3' } ]
	} );

	const posFunc = Fn( () => {

		vNoise.assign( turbulenceFunc( normalLocal.mul( 0.5 ).add( time ) ) );

		const b = mx_noise_float(
			positionLocal.mul( noiseScale ).add( vec3( 2 ).mul( time.mul( noiseSpeed ) ) )
		).toVar();

		const displacement = vNoise.add( b ).toVar();

		vPosition.assign( positionLocal );

		const pos = positionLocal.add( normalLocal.mul( displacement ) ).toVar();

		vNoise.assign( vNoise.mul( noiseStrength ) );

		return mix( positionLocal, pos, noiseStrength );

	} );

	const fragFunc = Fn( () => {

		const r = mx_noise_float(
			vPosition.mul( 2 ).add( time.mul( 2 ) ).mul( 2 ),
			uvAmplitude,
			uvPivot
		).toVar();
		const uv0 = vec2( 0, vNoise.mul( uvRange ).add( uvOffset.add( r ) ) ).toVar();
		return texture( tex, uv0 );

	} );

	material.positionNode = posFunc();
	material.fragmentNode = fragFunc();

	const gui = new GUI();
	gui.add( options, 'strength', 0, 1 ).onChange( ( value ) => {

		noiseStrength.value = value;

	} );
	gui.add( options, 'scale', 1, 5 ).onChange( ( value ) => {

		noiseScale.value = value;

	} );
	gui.add( options, 'speed', 0.3, 5 ).onChange( ( value ) => {

		noiseSpeed.value = value;

	} );
	gui.add( options, 'range', 0.1, 2 ).onChange( ( value ) => {

		uvRange.value = value;

	} );
	gui.add( options, 'offset', - 5, 5 ).onChange( ( value ) => {

		uvOffset.value = value;

	} );
	gui.add( options, 'amplitude', 0, 1 ).onChange( ( value ) => {

		uvAmplitude.value = value;

	} );
	gui.add( options, 'pivot', 0, 5 ).onChange( ( value ) => {

		uvPivot.value = value;

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
