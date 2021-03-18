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
camera.position.x = 3
camera.position.y = 3
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
 * Galaxy
 */
const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#f56b16',
    outsideColor: '#4b4be8',
};

// Set variables here so we can destroy/dispose of materials & points when changing values
let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {

    // Clear canvas for re-draw from GUI
    if (points) {
        geometry.dispose();
        scene.remove(points);
    }
    if (material) {
        material.dispose();
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);

    /**
     * Colors
     */
    const colors = new Float32Array(parameters.count * 3); // [r,g,b][r,g,b]...
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i=0; i<parameters.count; i++) {
        const i3 = i * 3;

        // Radius of galax
        // # from 0 -> 5 (or whatever radius is set to)
        const radius = Math.random() * parameters.radius;

        // Get what branch we want to place the point on
        // Branch shape =
        /*
                  / 0
                 /
                /------------ 0.33
                \
                 \
                  \ 0.66
         */
        // gets 0, 0.33, 0.66 = [x=0, y=0.33, z=0.66]
        const branchAngel = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        // Calculate spin angel
        const spinAngel = radius * parameters.spin;

        // Randomness for each position = Math.pow(x, # of x's) - (2, 3) = 2 * 2 * 2 = 8
        // we want to to do it for positive numbers though
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        // x, y & z positions for each geometry
        positions[i3] = Math.cos(branchAngel + spinAngel) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngel + spinAngel) * radius + randomZ;

        // colors
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    );

    /**
     * Materials
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    /**
     * Points
     */
    points = new THREE.Points(geometry, material);
    scene.add(points);

};
generateGalaxy();

/**
 * GUI
 */
gui.add(parameters, 'count').min(0).max(100000).step(100)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.01).max(20).step(0.001)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(1)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(1).step(0.01)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(0).max(10).step(0.5)
    .onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor')
    .onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor')
    .onFinishChange(generateGalaxy);

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
