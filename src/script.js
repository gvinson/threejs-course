import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui';
import * as CANNON from 'cannon-es';

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {};

debugObject.createSphere = () => {
    createSphere(Math.random() * 0.5, {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3 + 3,
        z:0
    });
}
gui.add(debugObject, 'createSphere');

debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        {
            x: (Math.random() - 0.5) * 3,
            y: (Math.random() - 0.5) * 3 + 3,
            z:0
        }
    );
}
gui.add(debugObject, 'createBox');

debugObject.reset = () => {
    for (const object of objectsToUpdate) {
        // Remove physics body
        object.body.removeEventListener('collide', playHitSound);
        world.removeBody(object.body);

        // Remove threeJS mesh
        scene.remove(object.mesh);
    }
};
gui.add(debugObject, 'reset');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
]);

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3');
const playHitSound = (collision) => {
    if (collision.contact.getImpactVelocityAlongNormal() > 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        setTimeout(() => {
            hitSound.play();
        }, 10);
    }
};

/**
 * Physics
 */
// World
const world = new CANNON.World();
// world.gravity is not a THREE.Vector3, it is a Vec3 from CannonJS - still same thing though
// -9.82 = earth gravity
world.gravity.set(0, -9.82, 0);
// set physics detection type for collision optimization
world.broadphase = new CANNON.SAPBroadphase(world);
// if items aren't moving, set them as asleep so the collision detection doesn't happen on them
world.allowSleep = true;

// Materials
const defaultMaterial = new CANNON.Material('default'); // name is whatever you want

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7,
    },
);
world.addContactMaterial(defaultContactMaterial);

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.position.set(0, 0, 0);
floorBody.material = defaultMaterial;
floorBody.addShape(floorShape);
// by default floorBody rotation is vertical, we need to rotate to horizontal
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
);
console.dir(world);
world.addBody(floorBody);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(-3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */
const objectsToUpdate = [];

// Sphere
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    castShadow: true,
});

const createSphere = (radius, position) => {
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial,
    );
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(position);
    scene.add(mesh);

    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape,
        material: defaultMaterial,
    });
    body.position.copy(position);
    world.addBody(body);

    body.addEventListener('collide', playHitSound);

    // Save in objectsToUpdate
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
};

createSphere(0.5, {x:0, y:3, z:0});

// Sphere
const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    castShadow: true,
});

const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(
        boxGeometry,
        boxMaterial,
    );
    mesh.scale.set(width, height, depth);
    mesh.position.copy(position);
    scene.add(mesh);

    const shape = new CANNON.Box(
        new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
    );
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape,
        material: defaultMaterial,
    });
    body.position.copy(position);
    world.addBody(body);

    // Play audio when collision happens
    body.addEventListener('collide', playHitSound);

    // Save in objectsToUpdate
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
};

createBox(1, 1.5, 0.5, {x:1, y:3, z:1});


/**
 * Animate
 */
const clock = new THREE.Clock()

let oldElapsedTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update mesh positions based on body position in physics world
    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }

    // Update physics world
    // @params = fixed time stamp (1/ 60 = 60fps)
    //           elapsed time from last step
    //           how many interactions the world can apply to catch up with potential delay
    world.step(1 / 60, deltaTime, 3);


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
