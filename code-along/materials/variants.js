import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js"

let camera, scene, renderer, gui;

const state = { variant: 'Default' };

init();
render();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( 2.5, 1.5, 3.0 );

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set( 0, 0.8, 0 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize );

    setEnvironment();
    setBg();
    loadModel();

}

function setBg(){

    new THREE.TextureLoader()
        .setPath('../../assets/')
        .load( 'radial.jpg', 
                texture => {
                    texture.encoding = THREE.sRGBEncoding;
                    scene.background = texture;
                    render();
                }, null, 
                err => {
                    console.error( err );
                    console.log( err.message );
                });

}

function setEnvironment(){

    new RGBELoader()
        .setPath( '../../assets/hdr/' )
        .load( 'venice_sunset_1k.hdr', texture => {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.environment = texture;

            render();
        });
}

function loadModel(){

    const loader = new GLTFLoader().setPath( '../../assets/' );
    loader.load( 'chair.glb',  gltf => {

        gltf.scene.scale.set( 3.0, 3.0, 3.0 );

        scene.add( gltf.scene );

        // GUI
        

        render();

    } );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

//

function render() {

    renderer.render( scene, camera );

} 