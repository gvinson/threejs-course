import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Textures
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            //child.material.envMap = envMap; // commented because scene.environment = envMap;
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
};

const envMap = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg',
]);
// set encoding to set gamma properties to sRGBEncoding = makes materials match blender better
envMap.encoding = THREE.sRGBEncoding;
scene.background = envMap;
scene.environment = envMap;

debugObject.envMapIntensity = 5;
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials);

/**
 * Models
 */
gltfLoader.load('/models/hamburger.glb', (gltf) => {
    gltf.scene.scale.set(0.3, 0.3, 0.3)
    gltf.scene.position.set(0, -1, 0)

    // GUI
    const sceneFolder = gui.addFolder('Scene');
    sceneFolder.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001);
    scene.add(gltf.scene);

    updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(0.25, 3, -2.25);
// shadows
directionalLight.castShadow = true
// optimize shadows
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024,1024);
// fix shadowing artifcats
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);
scene.add(directionalLight.target);

const directionalLightFolder = gui.addFolder('Directional Light');
directionalLightFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.001);
directionalLightFolder.add(directionalLight.target.position,'x').min(-10).max(10).step(0.001);
directionalLightFolder.add(directionalLight.target.position,'y').min(-10).max(10).step(0.001);
directionalLightFolder.add(directionalLight.target.position,'z').min(-10).max(10).step(0.001);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 1, - 7);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// set properties to fix material colors
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
// enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const rendererFolder = gui.addFolder('Renderer');
rendererFolder.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACES: THREE.ACESFilmicToneMapping
}).onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping);
    updateAllMaterials();
});
rendererFolder.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);


/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
