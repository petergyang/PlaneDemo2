import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Airplane from './js/models/airplane.js';
import Environment from './js/models/environment.js';
import PlaneControls from './js/controls/planeControls.js';
import FlightUI from './js/ui/flightUI.js';

// Scene setup
const scene = new THREE.Scene();
const container = document.getElementById('game-container');
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB); // Sky blue background
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
// Set up shadow properties
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
scene.add(directionalLight);

// Create and add the environment (city)
const environment = new Environment();
scene.add(environment.getObjects());

// Create and add the airplane
const airplane = new Airplane();
scene.add(airplane.getObject());

// Position the airplane for initial approach
airplane.getObject().position.set(-80, 50, -80);
airplane.getObject().rotation.y = Math.PI / 4; // 45 degrees, pointing toward the city
airplane.getObject().rotation.x = -Math.PI / 30; // Slight nose-down attitude

// Create plane controls
const planeControls = new PlaneControls(airplane);

// Create UI
const ui = new FlightUI(planeControls);

// Camera settings
const cameraOffset = new THREE.Vector3(0, 7, -20); // Behind and above the plane
let cameraAttached = true;
let currentCameraPosition = new THREE.Vector3();
let currentCameraLookAt = new THREE.Vector3();
const cameraSmoothness = 0.1; // Lower values make the camera follow more smoothly

// Add orbit controls for free camera mode
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;
orbitControls.enabled = !cameraAttached; // Disable when camera is attached to plane

// Initialize camera position
updateCameraPosition();

// Toggle camera mode with 'C' key
window.addEventListener('keydown', (event) => {
    if (event.key === 'c' || event.key === 'C') {
        cameraAttached = !cameraAttached;
        orbitControls.enabled = !cameraAttached;
        
        if (cameraAttached) {
            // Smoothly transition back to follow camera
            updateCameraPosition();
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});

// Update camera position based on plane position and rotation
function updateCameraPosition() {
    if (!cameraAttached) return;
    
    // Calculate target camera position
    const targetPosition = new THREE.Vector3();
    
    // Apply the aircraft's quaternion to the offset
    targetPosition.copy(cameraOffset).applyQuaternion(airplane.getObject().quaternion);
    
    // Add the aircraft's position
    targetPosition.add(airplane.getObject().position);
    
    // Smoothly interpolate current camera position
    currentCameraPosition.lerp(targetPosition, cameraSmoothness);
    
    // Update camera position
    camera.position.copy(currentCameraPosition);
    
    // Update camera look-at target
    currentCameraLookAt.lerp(airplane.getObject().position, cameraSmoothness);
    camera.lookAt(currentCameraLookAt);
}

// Clock for delta time calculation
const clock = new THREE.Clock();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Calculate delta time
    const deltaTime = clock.getDelta();
    
    // Update plane controls
    planeControls.update(deltaTime);
    
    // Update camera
    updateCameraPosition();
    
    // Update orbit controls if in free camera mode
    if (!cameraAttached) {
        orbitControls.update();
    }
    
    // Update UI
    ui.update();
    
    // Render
    renderer.render(scene, camera);
}

// Start the animation loop
animate(); 