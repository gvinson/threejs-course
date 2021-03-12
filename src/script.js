import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 0.955
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
gui
    .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
    .onFinishChange(() =>
    {
        renderer.toneMapping = Number(renderer.toneMapping)
        updateAllMaterials()
    })
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();


/**
 * Lights
 */
const topLight = new THREE.RectAreaLight(0xffffff, 10, 20, 20);
topLight.position.set(0, 2, 0);
scene.add(topLight);

const sideLight = new THREE.RectAreaLight(0xffffff, 5, 10, 20);
sideLight.position.set(-5, 0, 5);
scene.add(sideLight);

gui.addFolder('lights');
gui.add(topLight.position, 'x').min(-5).max(10);
gui.add(topLight.position, 'y').min(-5).max(10);
gui.add(topLight.position, 'z').min(-5).max(10);
gui.add(topLight, 'intensity').min(0).max(100).step(0.01);
gui.add(sideLight.position, 'x').min(-5).max(10);
gui.add(sideLight.position, 'y').min(-5).max(10);
gui.add(sideLight.position, 'z').min(-5).max(10);
gui.add(sideLight, 'intensity').min(0).max(100).step(0.01);

// light.position.set(0, 0.8, 1.5);
// //light.castShadow = true
// light.shadow.camera.far = 15
// light.shadow.mapSize.set(1024, 1024)
// //light.shadow.normalBias = 0.05
// scene.add(light);
// gui.addFolder('lights');
// gui.add(light.position, 'x').min(-5).max(10);
// gui.add(light.position, 'y').min(-5).max(10);
// gui.add(light.position, 'z').min(-5).max(10);
// gui.add(light, 'intensity').min(0).max(100).step(0.01).name('lightIntensity');

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            //child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const newLoader = new RGBELoader();
let environmentMap = null;
newLoader.load( '/textures/3.hdr', function ( texture ) {
    const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();
    environmentMap = envMap;
});
debugObject.envMapIntensity = 0.305;
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)

/**
 * Models
 */
let mixer = null;
gltfLoader.load('/models/model.glb',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene);

        const visor = mixer.clipAction(gltf.animations[0]);
        visor.play();

        gltf.scene.position.y = 1;
        scene.add(gltf.scene)

        updateAllMaterials()
    },
)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    if (mixer) {
        mixer.update(deltaTime);
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
