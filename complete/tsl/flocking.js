import * as THREE from 'three';
import {
	positionLocal,
	normalize,
	modelWorldMatrix,
	cameraProjectionMatrix,
	cameraViewMatrix,
	mix,
	attributeArray,
	time,
	mx_noise_float,
	Fn,
	uint,
	float,
	cross,
	If,
	Continue,
	length,
	attribute,
	exp,
	mat3,
	vec3,
	select,
	Loop,
	instanceIndex,
	uniform
} from 'three/tsl';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

class FlockGeometry extends THREE.BufferGeometry {

	constructor( geo ) {

		super();

		//const scale = 0.2;
		//geo.scale( scale, scale, scale );
		const geometry = geo;//.toNonIndexed();

		const srcPosAttr = geometry.getAttribute( 'position' );
		const srcNormAttr = geometry.getAttribute( 'normal' );
		const srcUVAttr = geometry.getAttribute( 'uv' );

		const count = srcPosAttr.count;
		const total = count * BOIDS;

		const posAttr = new THREE.BufferAttribute( new Float32Array( total * 3 ), 3 );
		const normAttr = new THREE.BufferAttribute( new Float32Array( total * 3 ), 3 );
		const uvAttr = new THREE.BufferAttribute( new Float32Array( total * 2 ), 2 );
		const instanceIDAttr = new THREE.BufferAttribute( new Uint32Array( total ), 1 );
		const vertexIDAttr = new THREE.BufferAttribute( new Uint32Array( total ), 1 );

		this.setAttribute( 'instanceID', instanceIDAttr );
		this.setAttribute( 'vertexID', vertexIDAttr );
		this.setAttribute( 'position', posAttr );
		this.setAttribute( 'normal', normAttr );
		this.setAttribute( 'uv', uvAttr );


		for ( let b = 0; b < BOIDS; b ++ ) {

			let offset = b * count * 3;
			for ( let i = 0; i < count * 3; i ++ ) {

				posAttr.array[ offset + i ] = srcPosAttr.array[ i ];
				normAttr.array[ offset + i ] = srcNormAttr.array[ i ];

			}

			offset = b * count * 2;
			for ( let i = 0; i < count * 2; i ++ ) {

				uvAttr.array[ offset + i ] = srcUVAttr.array[ i ];

			}

			offset = b * count;
			for ( let i = 0; i < count; i ++ ) {

				instanceIDAttr.array[ offset + i ] = b;
				vertexIDAttr.array[ offset + i ] = i;

			}

		}

	}

}

let container;

let camera,
	scene,
	renderer,
	assetPath,
	clock,
	boid,
	flock,
	mixer,
	animInfo,
	deltaTime,
	computeVelocity,
	computePosition,
	computeTime;

const BOIDS = 2000;
const BOUNDS = 20,
	BOUNDS_HALF = BOUNDS / 2;

init();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		1,
		100
	);
	camera.position.set( 0.0, 1, 12 );

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
	light.position.set( 3, 3, 1 );
	scene.add( ambient );
	scene.add( light );
	assetPath = '../../assets/';

	loadSkybox();

	clock = new THREE.Clock();

	loadGLB( 'sparrow' );

	window.addEventListener( 'resize', onWindowResize );

}

function loadSkybox() {

	scene.background = new THREE.CubeTextureLoader()

		// eslint-disable-next-line quotes
		.setPath( `${assetPath}skybox4/` )
		.load( [
			'px.jpg',
			'nx.jpg',
			'py.jpg',
			'ny.jpg',
			'pz.jpg',
			'nz.jpg'
		], ( tex ) => {

			scene.environment = tex;

		} );

}


function loadGLB( name ) {

	const loader = new GLTFLoader().setPath( assetPath );
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath(
		'https://cdn.jsdelivr.net/npm/three@v0.170.0/examples/jsm/libs/draco/gltf/'
	);
	loader.setDRACOLoader( dracoLoader );

	loader.load( `${name}.glb`, ( gltf ) => {

		boid = gltf;

		tsl();

	} );

}

function initStorage() {

	const positionArray = new Float32Array( BOIDS * 3 );
	const directionArray = new Float32Array( BOIDS * 3 );
	const noiseArray = new Float32Array( BOIDS );
	const timeArray = new Float32Array( BOIDS );

	const q = new THREE.Quaternion();
	const v = new THREE.Euler();

	for ( let i = 0; i < BOIDS; i ++ ) {

		const offset = i * 3;

		for ( let j = 0; j < 3; j ++ ) {

			positionArray[ offset + j ] = Math.random() * BOUNDS - BOUNDS_HALF;

		}

		q.random();
		v.setFromQuaternion( q );

		directionArray[ offset + 0 ] = v.x;
		directionArray[ offset + 1 ] = v.y;
		directionArray[ offset + 2 ] = v.z;

		noiseArray[ i ] = Math.random() * 1000.0;

		timeArray[ i ] = Math.random() * animInfo.duration;

	}

	const positionStorage = attributeArray( positionArray, 'vec3' ).label(
		'positionStorage'
	);
	const directionStorage = attributeArray( directionArray, 'vec3' ).label(
		'directionStorage'
	);
	const noiseStorage = attributeArray( noiseArray, 'float' ).label(
		'noiseStorage'
	);

	const timeStorage = attributeArray( timeArray, 'float' ).label(
		'timeStorage'
	);

	// The Pixel Buffer Object (PBO) is required to get the GPU computed data in the WebGL2 fallback.
	positionStorage.setPBO( true );
	directionStorage.setPBO( true );
	noiseStorage.setPBO( true );
	timeStorage.setPBO( true );

	return [ positionStorage, directionStorage, noiseStorage, timeStorage ];

}

function bakeAnimation( gltf ) {

	const skinnedMesh = gltf.scene.children[ 0 ].children[ 0 ];

	const geometry = skinnedMesh.geometry.toNonIndexed();
	skinnedMesh.geometry = geometry;

	gltf.scene.visible = false;
	scene.add( gltf.scene );

	mixer = new THREE.AnimationMixer( gltf.scene );
	const clip = gltf.animations[ 0 ];
	const action = mixer.clipAction( clip );
	action.play();
	const interval = 1 / 25;
	const frameCount = ~ ~ ( clip.duration / interval ) + 1;

	const posAttr = geometry.getAttribute( 'position' );
	const vertexCount = posAttr.count;
	const vertexArray = new Float32Array( vertexCount * frameCount * 3 );
	animInfo = { duration: clip.duration, interval, vertexCount, frameCount };

	const skinned = new THREE.Vector3();

	for ( let f = 0; f < frameCount; f ++ ) {

		mixer.setTime( f * interval );
		renderer.render( scene, camera );
		const offset = f * vertexCount * 3;
		for ( let i = 0; i < vertexCount; i ++ ) {

			skinned.set(
				posAttr.getX( i ),
				posAttr.getY( i ),
				posAttr.getZ( i )
			);
			skinnedMesh.applyBoneTransform( i, skinned );
			skinned.applyMatrix4( skinnedMesh.matrixWorld );
			skinned.multiplyScalar( 0.2 );
			vertexArray[ offset + i * 3 + 0 ] = skinned.x;
			vertexArray[ offset + i * 3 + 1 ] = skinned.y;
			vertexArray[ offset + i * 3 + 2 ] = skinned.z;

		}

	}

	scene.remove( gltf.scene );

	const vertexStorage = attributeArray( vertexArray, 'vec3' ).label(
		'vertexStorage'
	);
	vertexStorage.setPBO( true );

	return vertexStorage;

}

function tsl() {

	const vertexStorage = bakeAnimation( boid );
	const [ positionStorage, directionStorage, noiseStorage, timeStorage ] = initStorage();

	deltaTime = uniform( float() );
	const boidSpeed = uniform( 2 );
	const flockPosition = uniform( vec3() );
	const neighbourDistance = uniform( 4 );
	const rotationSpeed = uniform( 1 );
	const duration = uniform( animInfo.duration );
	const interval = uniform( animInfo.interval );
	const vertexCount = uniform( animInfo.vertexCount );
	const useStorage = uniform( uint( 1 ) );

	const flockVertexTSL = Fn( () => {

		const instanceID = attribute( 'instanceID' ).toVar();
		const vertexID = attribute( 'vertexID' ).toVar();
		const frameIndex = uint( timeStorage.element( instanceID ).div( interval ) ).toVar();
		vertexID.addAssign( vertexCount.mul( frameIndex ) );
		const dir = normalize( directionStorage.element( instanceID ) ).toVar();

		//Create matrix
		//float4x4 create_matrix(float3 pos, float3 dir, float3 up) {
		const zaxis = dir.negate().normalize().toVar();
		const xaxis = cross( vec3( 0, 1, 0 ), zaxis ).normalize().toVar();
		const yaxis = cross( zaxis, xaxis ).toVar();
		const mat = mat3(
			xaxis.x,
			yaxis.x,
			zaxis.x,
			xaxis.y,
			yaxis.y,
			zaxis.y,
			xaxis.z,
			yaxis.z,
			zaxis.z
		);

		const position = select( useStorage.greaterThan( 0 ), vertexStorage.element( vertexID ), positionLocal );

		const finalVert = modelWorldMatrix.mul( mat.mul( position ) ).add( positionStorage.element( instanceID ) );

		return cameraProjectionMatrix.mul( cameraViewMatrix ).mul( finalVert );

	} );

	computeVelocity = Fn( () => {

		const boid_pos = positionStorage.element( instanceIndex ).toVar();
		const boid_dir = directionStorage.element( instanceIndex ).toVar();

		const separation = vec3( 0 ).toVar();
		const alignment = vec3( 0 ).toVar();
		const cohesion = vec3( flockPosition ).toVar();

		const nearbyCount = uint( 1 ).toVar(); // Add self that is ignored in loop

		Loop(
			{ start: uint( 0 ), end: uint( BOIDS ), type: 'uint', condition: '<' },
			( { i } ) => {

				If( i == instanceIndex, () => {

					Continue();

				} );

				const tempBoid_pos = positionStorage.element( i ).toVar();
				const tempBoid_dir = directionStorage.element( i ).toVar();

				const offset = boid_pos.sub( tempBoid_pos ).toVar();
				const dist = length( offset ).toVar();

				If( dist.lessThan( neighbourDistance ), () => {

					If( dist.lessThan( 0.0001 ), () => {

						Continue();

					} );

					//separation += offset * (1.0/dist - 1.0/neighbourDistance);
					const s = offset.mul( float( 1.0 ).div( dist ).sub( float( 1.0 ).div( neighbourDistance ) ) ).toVar();
					separation.addAssign( s );
					alignment.addAssign( tempBoid_dir );
					cohesion.addAssign( tempBoid_pos );

					nearbyCount.addAssign( 1 );

				} ); //If

			} ); //Loop

		const avg = float( 1.0 ).div( nearbyCount ).toVar();
		alignment.mulAssign( avg );
		cohesion.mulAssign( avg );
		cohesion.assign( cohesion.normalize().sub( boid_pos ) );

		const direction = alignment.add( separation ).add( cohesion ).toVar();

		const ip = exp( rotationSpeed.mul( - 1 ).mul( deltaTime ) );
		boid_dir.assign( mix( direction, boid_dir.normalize(), ip ) );
		directionStorage.element( instanceIndex ).assign( boid_dir );

	} )().compute( BOIDS );

	computePosition = Fn( () => {

		const boid_pos = positionStorage.element( instanceIndex ).toVar();
		const boid_dir = directionStorage.element( instanceIndex ).toVar();
		const noise_offset = noiseStorage.element( instanceIndex ).toVar();
		const noise = mx_noise_float( boid_pos.mul( time.div( 100.0 ).add( noise_offset ) ) ).add( 1 ).div( 2.0 ).toVar();
		const velocity = boidSpeed.mul( float( 1.0 ).add( noise ) ).toVar();// * boidSpeedVariation);

		boid_pos.addAssign( boid_dir.mul( velocity ).mul( deltaTime ) );
		positionStorage.element( instanceIndex ).assign( boid_pos );

	} )().compute( BOIDS );


	computeTime = Fn( () => {

		const instanceTime = timeStorage.element( instanceIndex );
		const boid_pos = positionStorage.element( instanceIndex ).toVar();
		const noise_offset = noiseStorage.element( instanceIndex ).toVar();
		const noise = mx_noise_float( boid_pos.mul( time.div( 100.0 ).add( noise_offset ) ) ).add( 1 ).div( 2.0 ).toVar();
		const velocity = boidSpeed.mul( float( 1.0 ).add( noise ) ).toVar();
		const speed = length( velocity );
		instanceTime.addAssign( deltaTime.mul( speed ).mul( boidSpeed ).mul( 0.25 ) );
		If( instanceTime.greaterThan( duration ), () => {

			instanceTime.subAssign( duration );

		} );

	} )().compute( BOIDS );

	const geometry = new FlockGeometry( boid.scene.children[ 0 ].children[ 0 ].geometry );
	const material = new THREE.MeshStandardNodeMaterial( { map: boid.scene.children[ 0 ].children[ 0 ].material.map } );

	flock = new THREE.Mesh( geometry, material );
	scene.add( flock );

	material.vertexNode = flockVertexTSL();


	const gui = new GUI();
	gui.add( neighbourDistance, 'value', 1, 8 ).name( 'Neighbour Distance' );
	gui.add( boidSpeed, 'value', 0.5, 6 ).name( 'boid speed' );
	gui.add( rotationSpeed, 'value', 0.5, 6 ).name( 'rotation speed' );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function render() {

	if ( deltaTime && clock ) deltaTime.value = clock.getDelta();
	if ( computeTime ) renderer.compute( computeTime );
	if ( computeVelocity ) renderer.compute( computeVelocity );
	if ( computePosition ) renderer.compute( computePosition );
	renderer.render( scene, camera );

}
