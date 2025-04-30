import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

// --- Initialisation de la scène ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Bleu ciel

// --- Lumière ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// ...existing code...
// --- Sol (herbe) avec texture ---
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('resources/textures/img/grass.jpg'); // Mets le chemin vers ton image ici
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(20, 20); // Pour répéter la texture sur le sol

const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
// ...existing code...

// --- "Joueur" : un rectangle rouge ---
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff3333 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 1, 0); // Hauteur = moitié de la box
scene.add(player);

// --- Caméra 3ème personne ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
function updateCamera() {
    // Positionner la caméra derrière le joueur
    const offset = new THREE.Vector3(0, 4, 8);
    const playerPosition = player.position.clone();
    const cameraPosition = playerPosition.add(offset);
    camera.position.copy(cameraPosition);
    camera.lookAt(player.position);
}
updateCamera();

// --- Contrôles clavier ---
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, KeyW: false, KeyA: false, KeyS: false, KeyD: false };
window.addEventListener('keydown', (e) => { if (e.code in keys) keys[e.code] = true; });
window.addEventListener('keyup', (e) => { if (e.code in keys) keys[e.code] = false; });

const speed = 0.1;

// --- Animation ---
function animate() {
    requestAnimationFrame(animate);

    // Mouvement du joueur
    let moveX = 0, moveZ = 0;
    if (keys.ArrowUp || keys.KeyW) moveZ -= speed;
    if (keys.ArrowDown || keys.KeyS) moveZ += speed;
    if (keys.ArrowLeft || keys.KeyA) moveX -= speed;
    if (keys.ArrowRight || keys.KeyD) moveX += speed;

    // Déplacement relatif à la caméra (vue 3ème personne)
    if (moveX !== 0 || moveZ !== 0) {
        const angle = Math.atan2(camera.position.x - player.position.x, camera.position.z - player.position.z);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        player.position.x += moveX * cos - moveZ * sin;
        player.position.z += moveZ * cos + moveX * sin;
    }

    updateCamera();
    renderer.render(scene, camera);
}
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

animate();

// --- Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});