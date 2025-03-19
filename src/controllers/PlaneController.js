import * as THREE from 'three';

export class PlaneController {
    constructor(plane) {
        this.plane = plane;
        
        // Physics properties
        this.velocity = new THREE.Vector3(0, 0, -20); // Initial forward velocity (negative Z is toward city)
        
        // Flight parameters
        this.maxSpeed = 50;
        this.minSpeed = 10;
        this.currentSpeed = 20;
        this.accelerationRate = 5;
        this.turnRate = 1.2;     // Turning sensitivity
        this.pitchRate = 1.0;    // Pitch sensitivity
        
        // Initialize orientation
        this.yaw = 0;            // Initial yaw (facing forward/-Z)
        this.pitch = 0;
        this.roll = 0;
        
        // Auto-leveling
        this.autoLevelRate = 0.1;
    }

    update(deltaTime) {
        // Apply rotation
        this.updateOrientation();
        
        // Update position based on velocity
        this.plane.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Natural auto-leveling
        if (Math.abs(this.roll) < 0.05) {
            this.roll *= 0.9; // Quickly settle to zero
        } else {
            this.roll *= (1 - this.autoLevelRate); // Gradually level out
        }
        
        // Dampen pitch if no input
        if (Math.abs(this.pitch) < 0.05) {
            this.pitch *= 0.9;
        }
    }

    updateOrientation() {
        // Create quaternion from Euler angles
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ'));
        
        // Apply to plane
        this.plane.quaternion.copy(quaternion);
        
        // Update velocity direction based on orientation
        const direction = new THREE.Vector3(0, 0, -1); // Forward is -Z
        direction.applyQuaternion(quaternion);
        direction.multiplyScalar(this.currentSpeed);
        this.velocity.copy(direction);
    }

    handleInput(input) {
        // Update speed
        this.currentSpeed = THREE.MathUtils.clamp(
            this.currentSpeed + input.speed * this.accelerationRate,
            this.minSpeed,
            this.maxSpeed
        );
        
        // Update pitch (W/S)
        if (input.pitch !== 0) {
            this.pitch -= input.pitch * this.pitchRate * 0.02;
            // Clamp pitch to prevent flipping
            this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI/3, Math.PI/3);
        }
        
        // Update yaw and roll together (A/D)
        if (input.roll !== 0) {
            // Turn (yaw) in the direction of roll
            this.yaw -= input.roll * this.turnRate * 0.02;
            
            // Roll the plane when turning (negative since we want to bank in opposite direction)
            const targetRoll = -input.roll * 0.5; // Max bank angle ~30 degrees
            this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, 0.1);
        }
    }

    getSpeedPercentage() {
        return (this.currentSpeed - this.minSpeed) / (this.maxSpeed - this.minSpeed);
    }
} 