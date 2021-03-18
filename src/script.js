import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = null; // witness variable to see the current intersected object

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
camera.position.z = 3
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
 * Mouse event listener
 */
window.addEventListener('mousemove', (e) => {
    // normalize x from -1 to 1 - left -> right
    mouse.x = ( e.clientX / sizes.width ) * 2 - 1;
    // normalize y - need to invert because we want +1 at top of screen, -1 at bottom
    mouse.y = -(e.clientY / sizes.height * 2 - 1);
});

window.addEventListener('click', (e) => {
    if (currentIntersect.object) {
        if (currentIntersect.object === object1) {
            console.log('click object 1');
        }
    }
});

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

    // Animate objects
    object1.position.y = Math.sin(elapsedTime * 0.2);
    object2.position.y = Math.sin(elapsedTime) * -1;
    object3.position.y = Math.sin(elapsedTime * 0.3) * 2;

    // See if mouse is over circle with raycaster
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [object1, object2, object3];
    const intersects = raycaster.intersectObjects(objectsToTest);
    // Change all to red
    for (const intersect of objectsToTest) {
        intersect.material.color.set('red');
    }
    // Change hovered ones to blue
    for(const intersect of intersects) {
        intersect.object.material.color.set('blue');
    }

    // something being hovered
    if (intersects.length > 0) {
        if (!currentIntersect) {
            console.log('mouse enter new object');
        }
        currentIntersect = intersects[0];
    }
    // nothing being hovered
    else {
        if (currentIntersect) {
            console.log("mouse leave");
        }
        currentIntersect = null;
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
