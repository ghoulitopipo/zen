import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
// --- Initialisation de la scène ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// --- Lumière ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// --- Sol ---
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('resources/textures/img/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(20, 20);

const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

let playerModel;
let playerMixer;
let playerIdleAction, playerWalkAction;
let currentPlayerAction = null;

const gltfLoaderP = new GLTFLoader();
gltfLoaderP.load(
    'resources/models/Mage.glb',
    (gltf) => {
        playerModel = gltf.scene;
        playerModel.position.set(0, 0, 0);
        playerModel.scale.set(1, 1, 1);
        scene.add(playerModel);

        // Animation
        playerMixer = new THREE.AnimationMixer(playerModel);
        playerIdleAction = playerMixer.clipAction(gltf.animations[36]); // idle
        playerWalkAction = playerMixer.clipAction(gltf.animations[73]); // walk

        playerIdleAction.play();
        currentPlayerAction = playerIdleAction;
    },
    undefined,
    (error) => {
        console.error('Erreur lors du chargement du modèle GLB :', error);
    }
);

function setPlayerAction(newAction) {
    if (currentPlayerAction !== newAction) {
        if (currentPlayerAction) currentPlayerAction.fadeOut(0.2);
        newAction.reset().fadeIn(0.2).play();
        currentPlayerAction = newAction;
    }
}


let knightModel;
let knightMixer;
let knightIdleAction, knightWalkAction;
let currentKnightAction = null;
const gltfLoader = new GLTFLoader();
gltfLoader.load(
    'resources/models/Knight.glb',
    (gltf) => {
        knightModel = gltf.scene;
        knightModel.position.set(0, 0, 0);
        knightModel.scale.set(1, 1, 1);
        scene.add(knightModel);

        // Animation
        knightMixer = new THREE.AnimationMixer(knightModel);
        knightIdleAction = knightMixer.clipAction(gltf.animations[36]); // idle
        knightWalkAction = knightMixer.clipAction(gltf.animations[73]); // walk

        knightIdleAction.play();
        currentKnightAction = knightIdleAction;
    },
    undefined,
    (error) => {
        console.error('Erreur lors du chargement du modèle GLB :', error);
    }
);

function setKnightAction(newAction) {
    if (currentKnightAction !== newAction) {
        if (currentKnightAction) currentKnightAction.fadeOut(0.2);
        newAction.reset().fadeIn(0.2).play();
        currentKnightAction = newAction;
    }
}

function lerpAngle(a, b, t) {
    let delta = b - a;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return a + delta * t;
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
function updateCamera() {
    if (!playerModel) return;
    // Positionner la caméra derrière le joueur
    const offset = new THREE.Vector3(0, 4, 8);
    const playerPosition = playerModel.position.clone();
    const cameraPosition = playerPosition.add(offset);
    camera.position.copy(cameraPosition);
    camera.lookAt(playerModel.position);
}
updateCamera();

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, KeyW: false, KeyA: false, KeyS: false, KeyD: false };
window.addEventListener('keydown', (e) => { if (e.code in keys) keys[e.code] = true; });
window.addEventListener('keyup', (e) => { if (e.code in keys) keys[e.code] = false; });

const speed = 0.1;

function animate() {
    requestAnimationFrame(animate);

    if (knightMixer) {
        knightMixer.update(0.016); 
    }

    if (playerMixer) {
        playerMixer.update(0.016);
    }

// Mouvement du joueur
    let isMoving = false;
    if (playerModel) {
        let moveX = 0, moveZ = 0;
        if (keys.ArrowUp || keys.KeyW) moveZ -= 1;
        if (keys.ArrowDown || keys.KeyS) moveZ += 1;
        if (keys.ArrowLeft || keys.KeyA) moveX -= 1;
        if (keys.ArrowRight || keys.KeyD) moveX += 1;

        let length = Math.hypot(moveX, moveZ);
        if (length > 0) {
            isMoving = true;
            moveX = (moveX / length) * speed;
            moveZ = (moveZ / length) * speed;

            playerModel.position.x += moveX;
            playerModel.position.z += moveZ;

            const targetAngle = Math.atan2(moveX, moveZ);
            playerModel.rotation.y = lerpAngle(
                playerModel.rotation.y,
                targetAngle,
                0.15
            );
        }
    }

    // Animation idle/walk
    if (playerMixer && playerIdleAction && playerWalkAction) {
        if (isMoving) {
            setPlayerAction(playerWalkAction);
        } else {
            setPlayerAction(playerIdleAction);
        }
        playerMixer.update(0.016);
    }

    let knightIsMoving = false;
    if (playerModel && knightModel) {
        const dx = playerModel.position.x - knightModel.position.x;
        const dz = playerModel.position.z - knightModel.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const followSpeed = 0.1;

        if (distance > 2) {
            knightIsMoving = true;
            knightModel.position.x += (dx / distance) * followSpeed;
            knightModel.position.z += (dz / distance) * followSpeed;
            const angle = Math.atan2(dx, dz);
            knightModel.rotation.y = lerpAngle(knightModel.rotation.y, angle, 0.15);
        }
    }

    if (knightMixer && knightIdleAction && knightWalkAction) {
        if (knightIsMoving) {
            setKnightAction(knightWalkAction);
        } else {
            setKnightAction(knightIdleAction);
        }
        knightMixer.update(0.016);
    }


    updateCamera();
    renderer.render(scene, camera);
}
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});