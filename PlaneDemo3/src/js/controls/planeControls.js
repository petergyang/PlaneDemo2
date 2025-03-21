import * as THREE from 'three';

export default class PlaneControls {
    constructor(airplane) {
        this.airplane = airplane;
        this.object = airplane.getObject();
        
        // Movement parameters
        this.speed = 30; // Initial speed (units per second)
        this.minSpeed = 10;
        this.maxSpeed = 50;
        
        // Control inputs (normalized -1 to 1)
        this.pitchInput = 0;
        this.rollInput = 0;
        this.speedInput = 0;
        
        // Control sensitivity
        this.pitchSensitivity = 0.8;
        this.rollSensitivity = 2.0;
        this.turnSensitivity = 1.5;
        
        // Current rotation values (radians)
        this.pitch = 0;
        this.roll = 0;
        this.yaw = 0;
        
        // Rotation limits
        this.maxPitch = THREE.MathUtils.degToRad(60); // 60 degrees in radians
        this.maxRoll = THREE.MathUtils.degToRad(45);  // 45 degrees in radians
        
        // Auto-centering parameters
        this.autoCenterSpeed = 0.5;
        this.autoLevelSpeed = 0.7;
        
        // Set up key states
        this.keys = {
            w: false, // Pitch down
            s: false, // Pitch up
            a: false, // Roll left
            d: false, // Roll right
            q: false, // Decrease speed
            e: false, // Increase speed
        };
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Key down event
        window.addEventListener('keydown', (event) => {
            switch(event.key.toLowerCase()) {
                case 'w': this.keys.w = true; break;
                case 's': this.keys.s = true; break;
                case 'a': this.keys.a = true; break;
                case 'd': this.keys.d = true; break;
                case 'q': this.keys.q = true; break;
                case 'e': this.keys.e = true; break;
            }
        });
        
        // Key up event
        window.addEventListener('keyup', (event) => {
            switch(event.key.toLowerCase()) {
                case 'w': this.keys.w = false; break;
                case 's': this.keys.s = false; break;
                case 'a': this.keys.a = false; break;
                case 'd': this.keys.d = false; break;
                case 'q': this.keys.q = false; break;
                case 'e': this.keys.e = false; break;
            }
        });
    }
    
    update(deltaTime) {
        // Calculate control inputs (normalized -1 to 1)
        this.pitchInput = (this.keys.s ? 1 : 0) - (this.keys.w ? 1 : 0);
        this.rollInput = (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0);
        this.speedInput = (this.keys.e ? 1 : 0) - (this.keys.q ? 1 : 0);
        
        // Update speed based on input
        this.speed += this.speedInput * 10 * deltaTime;
        this.speed = THREE.MathUtils.clamp(this.speed, this.minSpeed, this.maxSpeed);
        
        // Apply pitch control
        this.pitch += this.pitchInput * this.pitchSensitivity * deltaTime;
        this.pitch = THREE.MathUtils.clamp(this.pitch, -this.maxPitch, this.maxPitch);
        
        // Apply roll control
        this.roll += this.rollInput * this.rollSensitivity * deltaTime;
        this.roll = THREE.MathUtils.clamp(this.roll, -this.maxRoll, this.maxRoll);
        
        // Calculate yaw based on roll (bank-proportional turning with negative sign)
        this.yaw += -this.roll * this.turnSensitivity * deltaTime;
        
        // Auto-centering when no input is detected
        if (this.pitchInput === 0) {
            // Auto-center pitch
            if (Math.abs(this.pitch) > 0.01) {
                this.pitch -= Math.sign(this.pitch) * this.autoCenterSpeed * deltaTime;
            } else {
                this.pitch = 0;
            }
        }
        
        if (this.rollInput === 0) {
            // Auto-level roll
            if (Math.abs(this.roll) > 0.01) {
                this.roll -= Math.sign(this.roll) * this.autoLevelSpeed * deltaTime;
            } else {
                this.roll = 0;
            }
        }
        
        // Apply rotations using quaternions for proper aircraft physics
        const quaternion = new THREE.Quaternion();
        
        // Apply rotations in YXZ order (yaw, pitch, roll)
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
        const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.roll);
        
        // Combine rotations
        quaternion.multiply(yawQuat).multiply(pitchQuat).multiply(rollQuat);
        
        // Apply rotation to the airplane
        this.object.quaternion.copy(quaternion);
        
        // Move forward based on current orientation and speed
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.object.quaternion);
        direction.normalize();
        
        // Update position based on direction and speed
        this.object.position.add(direction.multiplyScalar(this.speed * deltaTime));
        
        // Update propeller animation
        this.airplane.update();
        
        // Return current state for UI updates
        return {
            speed: this.speed,
            pitch: this.pitch,
            roll: this.roll,
            yaw: this.yaw
        };
    }
    
    getSpeed() {
        return this.speed;
    }
    
    getNormalizedSpeed() {
        return (this.speed - this.minSpeed) / (this.maxSpeed - this.minSpeed);
    }
} 