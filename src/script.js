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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png');

/**
 * Particles
 */
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    //color: new THREE.Color('#ff88cc'),
    alphaMap: particleTexture,
    transparent: true,
    sizeAttenuation: true,
});
const count = 5000;

// an array split like [0, 1, 2][3, 4, 5][6, 7, 8]... we need 3 items in the array (x, y, z) for each particles
/**
 * Generate positions and points
 */
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3); // [r,g,b][r,g,b]

// generate random positioning
for (let i = 0; i < count * 3; i++) {
    // keep # from -0.5 - 0.5, multiply by 10 to increase distance;
    positions[i] = (Math.random() - 0.5) * 10;
    // Generate random colors
    colors[i] = Math.random();
}

// set custom position property on particles
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3), // 3 values for each vertix
);

particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3),
);;

/**
 *   Alpha pixel bug fix
 *   Sometimes the alpha map isn't good enough, it will have alpha z-index issues, causing semi-transparent boxes/borders around the shape.
 *
 * To fix this, we have a couple solutions:
 */

/**
 * 1. alphaTest
 * This says to change the value for the alpha test from 0 (completely black) to 0.001 (99.999% black)
 */
// particlesMaterial.alphaTest = 0.001;

/**
 * 2. depthTest
 *
 * draw pixels no matter their z
 * - fix for alpha clipping bug, this will cause a bug if there are other objects in the scene w/ different color though
 */
//particlesMaterial.depthTest = false;

/**
 * 3. depthWrite
 *
 * The depth of what is being drawn is stored in a Depth Buffer
 * Instead of not testing if the particle is closer than whats in the depth buffer, we can tell the WebGL not to write the particles in that depth buffer with `depthTest`
 * - says not to draw particles that are in the depth buffer
 */
// particlesMaterial.depthWrite = false;

/**
 * 4. Additive Blending
 *
 * When we have multiple particles in th same pixel, the color gets really bright. The colors get combined - combinging red, blue and green creates a white color.
 *
 * Creates cool illuminating effect
 */
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;
particlesMaterial.vertexColors = true;

/**
 * Alpha Testing Cube
 * Create cube to see bug effect w/ multiple colors/meshes
 */
const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshBasicMaterial()
);
scene.add(cube);

// Create particles
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

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
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Animate particles
    for (let i=0; i < count; i++) {
        // take each item in the array by 3 [x,y,z]
        const i3 = i * 3;

        // move particles with a sin() for x, y, and z
        const x = particles.geometry.attributes.position.array[i3];
        const y = particles.geometry.attributes.position.array[i3 + 1];
        const z = particles.geometry.attributes.position.array[i3 + 2];

        // animate y
        // this position has POOR performance
        // Best to use a custom shader by creating my own Points material
        particles.geometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);


        // Tell ThreeJS the positions have changed
        particles.geometry.attributes.position.needsUpdate = true;
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
