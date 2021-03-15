import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper";
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light - good performance
// Light all sides of objects
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);

// // Directional Light = like sun - moderate performance
const directionalLight = new THREE.DirectionalLight(0xff0000, 0.5);
directionalLight.position.set(1, 0.25, 0);
scene.add(directionalLight);
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);

// // Hemisphere light - good performance
// // red light on top, blue light on bottom - illuminates like ambient light
const hemisphereLight = new THREE.HemisphereLight('red', 'blue', 0.5);
scene.add(hemisphereLight);
gui.add(hemisphereLight, 'intensity').min(0).max(1).step(0.001);

// // Point light - bad performance
// // distance & decay = distance until light doesnt work anymore
const pointLight = new THREE.PointLight(0xffffff, 0.5, 2);
pointLight.position.set(0, -0.5, 1);
scene.add(pointLight);

// // Rect Light - bad performance
// // Illuminates like photoshoot light
const rectAreaLight = new THREE.RectAreaLight(0xffffff, 1, 2, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
// orient light to center of screen
rectAreaLight.lookAt(new THREE.Vector3()); // empty Vector3 default 0,0,0 - center of scene
scene.add(rectAreaLight);

// Spotlight
// Like a flashlight, circlular light
const spotLight = new THREE.SpotLight(0xff6600, 0.8, 9, Math.PI * 0.1, 0.05, 1);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);
spotLight.target.position.x = -1;
scene.add(spotLight.target);

// Helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.5);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
scene.add(pointLightHelper);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

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
camera.position.x = 1
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

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // have to update helper to point to spotlight target
    spotLightHelper.update();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
