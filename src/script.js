import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Debug
 */
const gui = new dat.GUI();

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const colorTexture = textureLoader.load('/textures/door/color.jpg');
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const aoTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const heightTexture = textureLoader.load('/textures/door/height.jpg');
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const normalTexture = textureLoader.load('/textures/door/normal.jpg');
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('/textures/matcaps/8.png');
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

/**
 * Materials
 */
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// const material = new THREE.MeshDepthMaterial();
// material.map = colorTexture;

// const material = new THREE.MeshPhongMaterial(0xffffff, 0.5);
// material.shininess = 100;
// material.specular = new THREE.Color(0xff00ff);

// const material = new THREE.MeshToonMaterial();
// material.gradientMap = gradientTexture;

const material = new THREE.MeshStandardMaterial({
    map: colorTexture,
    aoMap: aoTexture,
    aoMapIntensity: 1,
    displacementMap: heightTexture,
    displacementScale: 0.05,
    metalnessMap: metalnessTexture,
    roughnessMap: roughnessTexture,
    normalMap: normalTexture,
    alphaMap: alphaTexture,
    transparent: true,
});
material.normalScale.set(0.5, 0.5);
const materialFolder = gui.addFolder('Material');
materialFolder.add(material, 'metalness').min(0).max(1).step(0.0001);
materialFolder.add(material, 'roughness').min(0).max(1).step(0.0001);
materialFolder.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001);
materialFolder.add(material, 'displacementScale').min(0).max(10).step(0.0001);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Objects
 */
const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1, 100, 100),
    material,
);
// set uv2 so we can set the correct position for the alpha map
plane.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
);
scene.add(plane);

const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 64, 64),
    material,
);
sphere.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
);
sphere.position.x = -1.75;
scene.add(sphere);
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
