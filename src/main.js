import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { InputManager } from './input/InputManager';
import { PlaneController } from './controllers/PlaneController';
import { UFOController } from './controllers/UFOController';
import { GameUI } from './ui/GameUI';

// Audio setup
let backgroundMusic;
let gameActive = false;
let activeUFOsCount = 0;

function setupBackgroundMusic() {
    console.log('Setting up background music...');
    // Create an audio listener
    const listener = new THREE.AudioListener();
    camera.add(listener);
    
    // Create the audio source
    backgroundMusic = new THREE.Audio(listener);
    
    // Load the sound file
    const audioLoader = new THREE.AudioLoader();
    console.log('Loading audio file: /audio/battle.mp3');
    audioLoader.load(
        '/audio/battle.mp3',
        function(buffer) {
            console.log('Audio loaded successfully!');
            backgroundMusic.setBuffer(buffer);
            backgroundMusic.setLoop(true);
            backgroundMusic.setVolume(0.5);
            console.log('Playing background music...');
            backgroundMusic.play();
            
            // Setup audio controls in the UI
            gameUI.setupAudioControl(backgroundMusic);
        },
        function(xhr) {
            console.log('Loading progress: ' + (xhr.loaded / xhr.total * 100) + '%');
        },
        function(err) {
            console.error('Error loading audio:', err);
        }
    );
}

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

// Create UFO model
function createUFO() {
    const ufoGroup = new THREE.Group();

    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc0000, // Changed to red
        metalness: 0.8,
        roughness: 0.2
    });
    
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4444, // Lighter red for windows
        emissive: 0xaa2222, // Red glow
        metalness: 0.9,
        roughness: 0.1
    });

    // Main body - saucer shape
    const bodyGeometry = new THREE.CapsuleGeometry(1.5, 0.5, 16, 8);
    bodyGeometry.rotateZ(Math.PI / 2); // Rotate to make it horizontal
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 0.4, 1); // Flatten it to make it more saucer-like
    ufoGroup.add(body);

    // Dome on top
    const domeGeometry = new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeometry, windowMaterial);
    dome.position.set(0, 0.2, 0);
    ufoGroup.add(dome);

    // Bottom part
    const bottomGeometry = new THREE.CylinderGeometry(0.5, 0.8, 0.3, 16);
    const bottom = new THREE.Mesh(bottomGeometry, bodyMaterial);
    bottom.position.set(0, -0.3, 0);
    ufoGroup.add(bottom);

    // Add lights around the saucer
    const lightCount = 8;
    for (let i = 0; i < lightCount; i++) {
        const angle = (i / lightCount) * Math.PI * 2;
        const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3300, // Orange-red lights
            emissive: 0xff3300,
            emissiveIntensity: 0.7 // Increased intensity
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        
        // Position lights around the edge of the saucer
        light.position.set(
            Math.cos(angle) * 1.4,
            -0.1,
            Math.sin(angle) * 1.4
        );
        ufoGroup.add(light);
    }

    return ufoGroup;
}

// Create plane and add to scene
const plane = createPlane();
plane.position.set(0, 30, 100);  // Start further back from the city
plane.scale.set(2, 2, 2);
scene.add(plane);

// Create and add UFOs
const ufoCount = 10;
const ufos = [];
const ufoControllers = [];
activeUFOsCount = ufoCount;

for (let i = 0; i < ufoCount; i++) {
    const ufo = createUFO();
    
    // Position UFOs randomly above the city but closer
    const randomX = (Math.random() - 0.5) * 100;
    const randomY = Math.random() * 20 + 30;
    const randomZ = (Math.random() - 0.5) * 100;
    
    const initialPosition = new THREE.Vector3(randomX, randomY, randomZ);
    
    // Scale UFO - increased size from 1.5 to 2.5
    ufo.scale.set(2.5, 2.5, 2.5);
    
    // Add to scene and arrays
    scene.add(ufo);
    ufos.push(ufo);
    
    // Create controller with plane reference for targeting
    const ufoController = new UFOController(ufo, initialPosition, plane, scene);
    
    // Override the takeDamage method to track destroyed UFOs
    const originalTakeDamage = ufoController.takeDamage;
    ufoController.takeDamage = function(damage) {
        originalTakeDamage.call(this, damage);
        
        // If this UFO was just destroyed, update the counter
        if (this.isDestroyed && this.health <= 0) {
            activeUFOsCount--;
            gameUI.updateUFOCount(activeUFOsCount);
        }
    };
    
    ufoControllers.push(ufoController);
}

// Initialize controllers and UI
const inputManager = new InputManager();
const planeController = new PlaneController(plane);
const gameUI = new GameUI();

// Plane shooting parameters
const planeProjectiles = [];
const projectileSpeed = 50;
const projectileDamage = 25;
const shootingCooldown = 0.2; // 200ms between shots
let timeSinceLastShot = shootingCooldown;
let isShooting = false;

// Add space key event listeners for shooting
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        isShooting = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        isShooting = false;
    }
});

// Function to create projectile from plane
function shootFromPlane() {
    // Create muzzle flash
    const flashGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    
    // Position at front of plane
    flash.position.copy(plane.position);
    
    // Get forward direction of plane
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(plane.quaternion);
    
    // Move flash in front of the plane
    flash.position.add(direction.clone().multiplyScalar(3));
    
    // Add flash to scene
    scene.add(flash);
    
    // Animate and remove flash
    setTimeout(() => {
        scene.remove(flash);
    }, 50);
    
    // Create laser beam projectile instead of sphere
    const beamLength = 4; // Length of laser beam
    const projectileGeometry = new THREE.CylinderGeometry(0.1, 0.1, beamLength, 8);
    projectileGeometry.rotateX(Math.PI / 2); // Align with Z axis
    
    const projectileMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Cyan color
        transparent: true,
        opacity: 0.8,
        emissive: 0x00ffff,
        emissiveIntensity: 1.0
    });
    
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    // Position at front of plane
    projectile.position.copy(plane.position);
    projectile.position.add(direction.clone().multiplyScalar(3 + beamLength/2));
    
    // Set orientation to match plane direction
    projectile.quaternion.copy(plane.quaternion);
    
    // Create a point light attached to the projectile for glow effect
    const projectileLight = new THREE.PointLight(0x00ffff, 2, 5);
    projectile.add(projectileLight);
    
    // Add to scene and tracking array
    scene.add(projectile);
    planeProjectiles.push({
        mesh: projectile,
        direction: direction,
        lifetime: 2, // Shorter lifetime for laser beams
        light: projectileLight // Store light reference for cleanup
    });
    
    // Add sound effect (audio would be added here)
    
    // Add slight camera shake for impact
    const shakeIntensity = 0.05;
    const originalCameraPosition = camera.position.clone();
    camera.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity
    ));
    
    // Return camera to original position
    setTimeout(() => {
        camera.position.copy(originalCameraPosition);
    }, 50);
}

// Update and remove plane projectiles
function updatePlaneProjectiles(deltaTime) {
    // Update existing projectiles
    for (let i = planeProjectiles.length - 1; i >= 0; i--) {
        const projectile = planeProjectiles[i];
        
        // Move projectile
        projectile.mesh.position.addScaledVector(
            projectile.direction, 
            projectileSpeed * deltaTime
        );
        
        // Update lifetime
        projectile.lifetime -= deltaTime;
        
        // Create trailing effect with opacity
        const normalizedLifetime = projectile.lifetime / 2; // 2 seconds is max lifetime
        projectile.mesh.material.opacity = 0.8 * normalizedLifetime;
        
        // Check for UFO collisions
        checkUFOCollisions(projectile);
        
        // Remove if expired
        if (projectile.lifetime <= 0) {
            scene.remove(projectile.mesh);
            planeProjectiles.splice(i, 1);
        }
    }
}

// Check projectile collisions with UFOs
function checkUFOCollisions(projectile) {
    for (let i = 0; i < ufoControllers.length; i++) {
        const ufoController = ufoControllers[i];
        
        // Skip destroyed UFOs
        if (ufoController.isDestroyed) continue;
        
        const distance = projectile.mesh.position.distanceTo(ufoController.ufo.position);
        
        // Adjusted collision threshold based on larger UFO size
        if (distance < 4) {
            // Create hit effect
            createHitEffect(projectile.mesh.position, projectile.direction);
            
            // Apply damage to UFO
            ufoController.takeDamage(projectileDamage);
            
            // Remove projectile
            const index = planeProjectiles.indexOf(projectile);
            if (index > -1) {
                scene.remove(projectile.mesh);
                planeProjectiles.splice(index, 1);
            }
            
            break; // Don't check further UFOs for this projectile
        }
    }
}

// Create hit effect at the impact point
function createHitEffect(position, direction) {
    // Create impact flash
    const impactGeometry = new THREE.SphereGeometry(1, 8, 8);
    const impactMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const impact = new THREE.Mesh(impactGeometry, impactMaterial);
    impact.position.copy(position);
    scene.add(impact);
    
    // Create sparks
    const sparkCount = 10;
    const sparks = [];
    
    for (let i = 0; i < sparkCount; i++) {
        const sparkGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const sparkMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        const spark = new THREE.Mesh(sparkGeom, sparkMat);
        spark.position.copy(position);
        
        // Calculate spark direction - mostly in the opposite direction of impact
        // with some randomness
        const sparkDir = direction.clone().negate();
        sparkDir.x += (Math.random() - 0.5) * 1.5;
        sparkDir.y += (Math.random() - 0.5) * 1.5;
        sparkDir.z += (Math.random() - 0.5) * 1.5;
        sparkDir.normalize();
        
        // Set velocity
        spark.velocity = sparkDir.multiplyScalar(5 + Math.random() * 5);
        spark.lifetime = 0.5 + Math.random() * 0.5; // 0.5-1 second lifetime
        
        scene.add(spark);
        sparks.push(spark);
    }
    
    // Add a point light for illumination
    const impactLight = new THREE.PointLight(0x00ffff, 3, 8);
    impactLight.position.copy(position);
    scene.add(impactLight);
    
    // Animate hit effect
    let elapsed = 0;
    const duration = 1.0;
    
    const animateHit = () => {
        elapsed += 1/60;
        const progress = elapsed / duration;
        
        // Expand and fade impact flash
        impact.scale.set(1 + progress * 2, 1 + progress * 2, 1 + progress * 2);
        impact.material.opacity = 0.8 * (1 - progress);
        
        // Update sparks
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];
            
            // Move spark
            spark.position.add(spark.velocity.clone().multiplyScalar(1/60));
            
            // Apply "gravity" to simulate downward arc
            spark.velocity.y -= 10 * (1/60);
            
            // Reduce velocity due to drag
            spark.velocity.multiplyScalar(0.95);
            
            // Update lifetime and opacity
            spark.lifetime -= 1/60;
            spark.material.opacity = 0.8 * (spark.lifetime / (0.5 + Math.random() * 0.5));
            
            // Remove expired sparks
            if (spark.lifetime <= 0) {
                scene.remove(spark);
                sparks.splice(i, 1);
            }
        }
        
        // Fade impact light
        impactLight.intensity = 3 * (1 - progress);
        
        if (elapsed < duration) {
            requestAnimationFrame(animateHit);
        } else {
            // Clean up
            scene.remove(impact);
            scene.remove(impactLight);
        }
    };
    
    // Start animation
    animateHit();
}

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
    
    // Don't update game state if game hasn't started yet
    if (!gameActive && gameUI.isGameStarted) {
        gameActive = true;
    }
    
    if (!gameActive) {
        // Just render the scene without updating game state
        renderer.render(scene, camera);
        return;
    }
    
    // Calculate delta time
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Update plane
    const input = inputManager.getInput();
    planeController.handleInput(input);
    planeController.update(deltaTime);
    
    // Update shooting cooldown
    timeSinceLastShot += deltaTime;
    
    // Handle shooting
    if (isShooting && timeSinceLastShot >= shootingCooldown) {
        shootFromPlane();
        timeSinceLastShot = 0;
    }
    
    // Update projectiles
    updatePlaneProjectiles(deltaTime);
    
    // Update UFOs
    for (const ufoController of ufoControllers) {
        ufoController.update(deltaTime);
    }
    
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

// Initialize game state
function initializeGame() {
    lastTime = 0;
    gameActive = true;
    
    // Set initial UFO count in UI
    gameUI.updateUFOCount(activeUFOsCount);
}

// Setup game start
gameUI.setupGameStart(initializeGame);

// Start animation loop (this will run even when game is not active)
animate(0);

// Setup background music
setupBackgroundMusic(); 