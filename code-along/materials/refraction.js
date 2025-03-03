import * as THREE from "three"
  import { OrbitControls } from "three/addons/controls/OrbitControls.js"
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
  import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
  import { GUI } from "three/addons/libs/lil-gui.module.min.js"

  let scene, camera, renderer, renderTarget, controls, envMap, material, diamond, options;

  init();

  function init(){
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set(0, 0, -4);
    
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    scene.add(ambient);
    
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set( 1, 10, 6);
    scene.add(light);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener( 'resize', resize, false);

    setEnvironment();
    loadDiamond();
  }

  function setEnvironment(){
    const loader = new RGBELoader().setPath( '../../assets/' )
	loader.load( 'hdr/venice_sunset_1k.hdr', ( texture ) => {

		texture.mapping = THREE.EquirectangularReflectionMapping;
		envMap = texture;
		
    scene.environment = envMap;
    scene.background = envMap;

	} );
  }

  function loadDiamond(){
    const loader = new GLTFLoader( ).setPath('../../assets/');
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '../../libs/three/examples/jsm/libs/draco/' );
    loader.setDRACOLoader( dracoLoader );
        
    // Load a glTF resource
    loader.load(
        // resource URL
        'diamond.glb',
        // called when the resource is loaded
        gltf => {
            diamond = gltf.scene;
        
            scene.add( diamond );
        
            update(); 
        },
        // called while loading is progressing
        xhr => {
            console.log(`Diamond ${xhr.loaded/xhr.total} loaded`);        
        },
        // called when loading has errors
        err => {

            console.error( err );

        }
    );
  }

  function update(){
    requestAnimationFrame( update );

    if (diamond) diamond.rotateY( 0.001 );
    
    renderer.render( scene, camera );  
  }

  function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }