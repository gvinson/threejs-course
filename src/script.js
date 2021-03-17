import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import {MeshStandardMaterial} from "three";

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
const textureLoader = new THREE.TextureLoader();
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAOTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

const brickAOTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg');
const brickColorTexture = textureLoader.load('/textures/bricks/color.jpg');
const brickNormalTexture = textureLoader.load('/textures/bricks/normal.jpg');
const brickRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg');

const grassAOTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg');
const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg');
grassAOTexture.repeat.set(8,8);
grassColorTexture.repeat.set(8,8);
grassNormalTexture.repeat.set(8,8);
grassRoughnessTexture.repeat.set(8,8);
grassAOTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassAOTexture.wrapT = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;


/**
 * House
 */
var colorParams = {
    houseColor: "#7d7d7d",
    roofColor: "#454857",
    doorColor: "#595959",
    floorColor: '#4c704f',
    bushesColor: '#3c8742',
    gravesColor: '#b2b6b1',
};

const houseGroup = new THREE.Group();
scene.add(houseGroup);

const house = new THREE.Mesh(
    new THREE.BoxBufferGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: brickColorTexture,
        transparent: true,
        aoMap: brickAOTexture,
        normalMap: brickNormalTexture,
        roughnessMap: brickRoughnessTexture,
    })
);
house.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(house.geometry.attributes.uv.array, 2));
house.castShadow = true;
house.position.set(0,0.75,0);
houseGroup.add(house);

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({
        color: colorParams.roofColor,
        side: THREE.DoubleSide,
    })
);
roof.position.y = 2.5;
roof.rotation.y = Math.PI / 4;
houseGroup.add(roof);

// Door
const door = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.5, 1.75, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAOTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.05,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
    })
);
// set uv for ao
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2));
door.position.set(0, 0.8, 2.001);
houseGroup.add(door);

// House GUI
const houseFolder = gui.addFolder('House');
houseFolder.addColor(colorParams, 'roofColor')
    .name('Roof Color')
    .onChange(function() {
        roof.material.color.set(colorParams.roofColor);
    }
);
houseFolder.addColor(colorParams, 'houseColor')
    .name('Wall Color')
    .onChange(function() {
            house.material.color.set(colorParams.houseColor);
        }
    );
houseFolder.add(door.position, 'x').min(-10).max(10).step(0.001).name('Door X');
houseFolder.add(door.position, 'y').min(-10).max(10).step(0.001).name('Door Y');
houseFolder.add(door.position, 'z').min(-10).max(10).step(0.001).name('Door Z');
houseFolder.addColor(colorParams, 'doorColor')
    .name('Door Color')
    .onChange(function() {
            door.material.color.set(colorParams.doorColor);
        }
    );

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        transparent: true,
        aoMap: grassAOTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
    })
);
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2));
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
floor.receiveShadow = true;
houseGroup.add(floor)
const floorFolder = gui.addFolder('Floor');
floorFolder.addColor(colorParams, 'floorColor')
    .name('Floor Color')
    .onChange(function() {
            floor.material.color.set(colorParams.floorColor);
        }
    );

// Bushes
const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: colorParams.bushesColor });
const bush = new THREE.Mesh(bushGeometry, bushMaterial);
bush.scale.set(0.25, 0.25, 0.25);
bush.position.set(0.75, 0.1, 2.25);
bush.castShadow = true;
houseGroup.add(bush);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.125, 0.125, 0.125);
bush2.position.set(0.35, 0.075, 2.25);
bush2.castShadow = true;
houseGroup.add(bush2);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.125, 0.5, 0.125);
bush3.position.set(-0.75, 0.075, 2.125);
bush3.castShadow = true;
houseGroup.add(bush3);

const bushesFolder = gui.addFolder('Bushes');
bushesFolder.add(bush.position, 'x').min(-10).max(10).step(0.001).name('Position X');
bushesFolder.add(bush.position, 'y').min(-10).max(10).step(0.001).name('Position Y');
bushesFolder.add(bush.position, 'z').min(-10).max(10).step(0.001).name('Position Z');
bushesFolder.addColor(colorParams, 'bushesColor')
    .name('Bushes Color')
    .onChange(function() {
            bush.material.color.set(colorParams.bushesColor);
        }
    );

// Graves
const gravesGroup = new THREE.Group();
const graves = [];
const gravesGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.15);
const gravesMaterial = new THREE.MeshStandardMaterial({ color: colorParams.gravesColor });
scene.add(gravesGroup);

for (let i=0; i<50; i++) {
    const angel = Math.random() * Math.PI * 2;
    const radius = 3 + (Math.random() * 6); // from 3 -> 9 = 3 + (random number from 1-6);
    const position = {
        x: Math.sin(angel) * radius,
        z: Math.cos(angel) * radius,
    };
    const grave = new THREE.Mesh(gravesGeometry, gravesMaterial);
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4;
    grave.castShadow = true;
    grave.receiveShadow = true;
    scene.add(grave);
    grave.position.set(position.x, 0, position.z);
}

const graveFolder = gui.addFolder('Graves');
graveFolder.addColor(colorParams, 'gravesColor')
    .name('Grave Color')
    .onChange(function() {
            graves[0].material.color.set(colorParams.gravesColor);
        }
    );

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.2)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.2)
moonLight.position.set(5, 3.5, 1.5)
scene.add(moonLight)

// Door Light
const doorLight = new THREE.PointLight( '#ff7d46', 1, 6);
doorLight.position.set(0, 2.2, 2.7);
doorLight.shadow.camera.lookAt(floor.position);
houseGroup.add(doorLight);

const lightFolder = gui.addFolder('Lights');
lightFolder.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
lightFolder.add(moonLight, 'intensity').min(0).max(1).step(0.001)
lightFolder.add(moonLight.position, 'x').min(- 5).max(5).step(0.001).name('Directional X')
lightFolder.add(moonLight.position, 'y').min(- 5).max(5).step(0.001).name('Directional Y')
lightFolder.add(moonLight.position, 'z').min(- 5).max(5).step(0.001).name('Directional Z')

/**
 * Fog
 */
const fog = new THREE.Fog(0x262837, 1, 12);
scene.fog = fog;

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight(0xff0000, 2, 3);
scene.add(ghost1);
const ghost2 = new THREE.PointLight(0x00ff00, 2, 3);
scene.add(ghost2);
const ghost3 = new THREE.PointLight(0x0000ff, 2, 3);
scene.add(ghost3);

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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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
renderer.setClearColor(0x262837);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Shadows - enable & optimize
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 256;
moonLight.shadow.mapSize.height = 256;
moonLight.shadow.camera.far = 7;
doorLight.castShadow = true;
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;
ghost1.castShadow = true;
ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;
ghost2.castShadow = true;
ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;
ghost3.castShadow = true;
ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;
house.castShadow = true;

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Animate ghost
    const ghost1Angel = elapsedTime * 0.4;
    ghost1.position.x = Math.cos(ghost1Angel) * 4;
    ghost1.position.z = Math.sin(ghost1Angel) * 4;
    ghost1.position.y = Math.cos(ghost1Angel) * 3;

    const ghost2Angel = elapsedTime * 0.6;
    ghost2.position.x = Math.cos(ghost2Angel) * 5;
    ghost2.position.z = Math.sin(ghost2Angel) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.cos(elapsedTime * 2.5);

    const ghost3Angel = -1 * elapsedTime * 0.7;
    ghost3.position.x = Math.cos(ghost3Angel) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.z = Math.sin(ghost3Angel) * (7 + Math.sin(elapsedTime * 0.5));
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.cos(elapsedTime * 2.5);

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
