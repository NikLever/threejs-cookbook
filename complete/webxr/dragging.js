import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

let container;
let camera, scene, renderer;
let controllers;

let raycaster;

const intersected = [];
const tempMatrix = new THREE.Matrix4();

let controls, group;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x808080 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );

    controls = new OrbitControls( camera, container );
    controls.target.set( 0, 1.6, 0 );
    controls.update();

    const floorGeometry = new THREE.PlaneGeometry( 6, 6 );
    const floorMaterial = new THREE.ShadowMaterial( { opacity: 0.25, blending: THREE.CustomBlending, transparent: false } );
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add( floor );

    scene.add( new THREE.HemisphereLight( 0xbcbcbc, 0xa5a5a5, 3 ) );

    const light = new THREE.DirectionalLight( 0xffffff, 3 );
    light.position.set( 0, 6, 0 );
    light.castShadow = true;
    light.shadow.camera.top = 3;
    light.shadow.camera.bottom = - 3;
    light.shadow.camera.right = 3;
    light.shadow.camera.left = - 3;
    light.shadow.mapSize.set( 4096, 4096 );
    scene.add( light );

    group = new THREE.Group();
    scene.add( group );

    const geometries = [
        new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
        new THREE.ConeGeometry( 0.2, 0.2, 64 ),
        new THREE.CylinderGeometry( 0.2, 0.2, 0.2, 64 ),
        new THREE.IcosahedronGeometry( 0.2, 8 ),
        new THREE.TorusGeometry( 0.2, 0.04, 64, 32 )
    ];

    for ( let i = 0; i < 50; i ++ ) {

        const geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
        const material = new THREE.MeshStandardMaterial( {
            color: Math.random() * 0xffffff,
            roughness: 0.7,
            metalness: 0.0
        } );

        const object = new THREE.Mesh( geometry, material );

        object.position.x = Math.random() * 4 - 2;
        object.position.y = Math.random() * 2;
        object.position.z = Math.random() * 4 - 2;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.setScalar( Math.random() + 0.5 );

        object.castShadow = true;
        object.receiveShadow = true;

        group.add( object );

    }

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    document.body.appendChild( XRButton.createButton( renderer ) );

    createControllers();
    
    raycaster = new THREE.Raycaster();

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function createControllers(){

    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    controllers = [];// controller1, controller2 ];

    const controllerModelFactory = new XRControllerModelFactory();
    let index = 0;

    for( let i=0; i<=1; i++){
        const controller = renderer.xr.getController( i );
        controller.addEventListener( 'selectstart', onSelectStart );
        controller.addEventListener( 'selectend', onSelectEnd );
        scene.add( controller );

        const controllerGrip = renderer.xr.getControllerGrip( i );
        controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
        scene.add( controllerGrip );

        controller.add( line.clone() );

        controllers.push( controller );
    };
}

function onSelectStart( event ) {

    const controller = event.target;

    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

        const intersection = intersections[ 0 ];

        const object = intersection.object;
        object.material.emissive.b = 1;
        controller.attach( object );

        controller.userData.selected = object;

    }

    controller.userData.targetRayMode = event.data.targetRayMode;

}

function onSelectEnd( event ) {

    const controller = event.target;

    if ( controller.userData.selected !== undefined ) {

        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        group.attach( object );

        controller.userData.selected = undefined;

    }

}

function getIntersections( controller ) {

    controller.updateMatrixWorld();

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return raycaster.intersectObjects( group.children, false );

}

function intersectObjects( controller ) {
    if (controller == undefined) return;

    // Do not highlight in mobile-ar

    if ( controller.userData.targetRayMode === 'screen' ) return;

    // Do not highlight when already selected

    if ( controller.userData.selected !== undefined ) return;

    const line = controller.getObjectByName( 'line' );
    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

        const intersection = intersections[ 0 ];

        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push( object );

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while ( intersected.length ) {

        const object = intersected.pop();
        object.material.emissive.r = 0;

    }

}

//

function animate() {

    renderer.setAnimationLoop( render );

}

function render() {

    cleanIntersected();

    controllers.forEach( controller => intersectObjects( controller ) );

    renderer.render( scene, camera );

}