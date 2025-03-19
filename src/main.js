import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { InputManager } from './input/InputManager';
import { PlaneController } from './controllers/PlaneController';
import { GameUI } from './ui/GameUI';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 20, 20);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Ground setup
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    return ground;
}

// Building generation
function createBuilding(x, z) {
    const height = Math.random() * 15 + 5; // Random height between 5 and 20
    const width = Math.random() * 3 + 2; // Random width between 2 and 5
    const depth = Math.random() * 3 + 2; // Random depth between 2 and 5
    
    const buildingGroup = new THREE.Group();
    
    // Main building structure
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(
            0.5 + Math.random() * 0.2,
            0.5 + Math.random() * 0.2,
            0.5 + Math.random() * 0.2
        ),
        roughness: 0.7,
        metalness: 0.2
    });
    
    const building = new THREE.Mesh(geometry, material);
    building.castShadow = true;
    building.receiveShadow = true;
    buildingGroup.add(building);

    // Add windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0x555555,
        metalness: 0.8,
        roughness: 0.2
    });

    // Calculate number of window rows and columns based on building size
    const windowRows = Math.floor(height / 2);
    const windowColsFront = Math.floor(width / 1.2);
    const windowColsSide = Math.floor(depth / 1.2);

    // Add windows to front and back
    for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowColsFront; col++) {
            const windowGeom = new THREE.BoxGeometry(0.4, 0.6, 0.1);
            const windowMesh = new THREE.Mesh(windowGeom, windowMaterial);
            
            // Position windows on front
            windowMesh.position.set(
                -width/2 + (col + 1) * (width/(windowColsFront + 1)),
                -height/2 + (row + 1) * (height/(windowRows + 1)),
                depth/2 + 0.1
            );
            buildingGroup.add(windowMesh);

            // Position windows on back
            const windowBack = windowMesh.clone();
            windowBack.position.z = -depth/2 - 0.1;
            buildingGroup.add(windowBack);
        }
    }

    // Add windows to sides
    for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowColsSide; col++) {
            const windowGeom = new THREE.BoxGeometry(0.1, 0.6, 0.4);
            const windowMesh = new THREE.Mesh(windowGeom, windowMaterial);
            
            // Position windows on right side
            windowMesh.position.set(
                width/2 + 0.1,
                -height/2 + (row + 1) * (height/(windowRows + 1)),
                -depth/2 + (col + 1) * (depth/(windowColsSide + 1))
            );
            buildingGroup.add(windowMesh);

            // Position windows on left side
            const windowLeft = windowMesh.clone();
            windowLeft.position.x = -width/2 - 0.1;
            buildingGroup.add(windowLeft);
        }
    }

    buildingGroup.position.set(x, height/2, z);
    return buildingGroup;
}

// City generation
function createCity() {
    const city = new THREE.Group();
    const gridSize = 10;
    const spacing = 8;
    
    for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
            if (Math.random() > 0.3) { // 70% chance to place a building
                const building = createBuilding(
                    x * spacing + (Math.random() - 0.5) * 2,
                    z * spacing + (Math.random() - 0.5) * 2
                );
                city.add(building);
            }
        }
    }
    return city;
}

// Create and add ground
const ground = createGround();
scene.add(ground);

// Create and add city
const city = createCity();
scene.add(city);

// Create plane model
function createPlane() {
    const planeGroup = new THREE.Group();

    // Materials
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0x4F5D4F, // Military green
        metalness: 0.3,
        roughness: 0.8
    });

    // Fuselage (main body)
    const fuselageGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const fuselage = new THREE.Mesh(fuselageGeometry, planeMaterial);
    
    // Rotate fuselage to point forward (along Z axis)
    fuselage.rotation.x = -Math.PI / 2;  // Changed to negative to flip direction
    planeGroup.add(fuselage);

    // Main wings
    const mainWingGeometry = new THREE.BoxGeometry(3, 0.05, 0.6);
    const mainWing = new THREE.Mesh(mainWingGeometry, planeMaterial);
    mainWing.position.set(0, 0, 0);
    planeGroup.add(mainWing);

    // Wing connectors
    const leftConnectorGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.2);
    const leftConnector = new THREE.Mesh(leftConnectorGeometry, planeMaterial);
    leftConnector.position.set(-0.8, 0, 0);
    planeGroup.add(leftConnector);

    const rightConnectorGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.2);
    const rightConnector = new THREE.Mesh(rightConnectorGeometry, planeMaterial);
    rightConnector.position.set(0.8, 0, 0);
    planeGroup.add(rightConnector);

    // Tail wing
    const tailWingGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.5);
    const tailWing = new THREE.Mesh(tailWingGeometry, planeMaterial);
    tailWing.position.set(0, 0.2, 0.9);  // Changed sign to flip direction
    planeGroup.add(tailWing);

    // Horizontal stabilizers
    const hStabGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.3);
    const hStabLeft = new THREE.Mesh(hStabGeometry, planeMaterial);
    hStabLeft.position.set(-0.2, 0, 0.8);  // Changed sign to flip direction
    planeGroup.add(hStabLeft);

    const hStabRight = new THREE.Mesh(hStabGeometry, planeMaterial);
    hStabRight.position.set(0.2, 0, 0.8);  // Changed sign to flip direction
    planeGroup.add(hStabRight);

    // Propeller hub
    const hubGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8);
    const hub = new THREE.Mesh(hubGeometry, planeMaterial);
    hub.position.set(0, 0, -1);  // Changed sign to flip direction
    hub.rotation.x = -Math.PI / 2;  // Changed to negative to flip direction
    planeGroup.add(hub);

    // Propeller blades
    const bladeGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.1);
    const blade1 = new THREE.Mesh(bladeGeometry, planeMaterial);
    blade1.position.set(0, 0, -1.05);  // Changed sign to flip direction
    planeGroup.add(blade1);

    const blade2 = new THREE.Mesh(bladeGeometry, planeMaterial);
    blade2.position.set(0, 0, -1.05);  // Changed sign to flip direction
    blade2.rotation.y = Math.PI / 2;
    planeGroup.add(blade2);

    return planeGroup;
}

// Create plane and add to scene
const plane = createPlane();
plane.position.set(0, 30, 100);  // Start further back from the city
plane.scale.set(2, 2, 2);
scene.add(plane);

// Initialize controllers and UI
const inputManager = new InputManager();
const planeController = new PlaneController(plane);
const gameUI = new GameUI();

// Camera following setup
function updateCamera() {
    // Camera offset directly behind and slightly above the plane
    const cameraOffset = new THREE.Vector3(0, 5, 15);  // Behind plane (positive Z)
    
    // Apply plane's rotation to camera offset
    cameraOffset.applyQuaternion(plane.quaternion);
    
    // Set camera position relative to plane
    camera.position.copy(plane.position).add(cameraOffset);
    
    // Look directly at the plane
    camera.lookAt(plane.position);
}

// Animation loop
let lastTime = 0;
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // Calculate delta time
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Update plane
    const input = inputManager.getInput();
    planeController.handleInput(input);
    planeController.update(deltaTime);
    
    // Update UI
    gameUI.updateSpeed(planeController.getSpeedPercentage());
    
    // Update camera
    updateCamera();
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop
animate(0); 