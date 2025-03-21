import * as THREE from 'three';

export class UFOController {
    constructor(ufo, initialPosition, plane, scene) {
        this.ufo = ufo;
        this.ufo.position.copy(initialPosition);
        this.plane = plane;
        this.scene = scene;
        
        // Movement parameters
        this.hoverSpeed = 0.5 + Math.random() * 0.3; // Randomize speed slightly
        this.hoverHeight = 0.5 + Math.random() * 0.5; // Randomize hover height
        this.rotationSpeed = 0.3 + Math.random() * 0.2; // Randomize rotation
        
        // Hover animation state
        this.hoverOffset = Math.random() * Math.PI * 2; // Random starting phase
        this.rotationOffset = Math.random() * Math.PI * 2; // Random starting rotation
        
        // Drift parameters
        this.driftRadius = 5 + Math.random() * 10; // Radius of drift motion
        this.driftSpeed = 0.1 + Math.random() * 0.1; // Speed of drift
        this.centerPosition = initialPosition.clone(); // Center of drift pattern
        this.driftOffset = Math.random() * Math.PI * 2; // Random starting point in drift
        
        // Health and destruction
        this.health = 100;
        this.isDestroyed = false;
    }

    update(deltaTime) {
        if (this.isDestroyed) return;
        
        // Hovering motion (up and down)
        const hoverY = Math.sin(this.hoverOffset) * this.hoverHeight;
        this.ufo.position.y = this.centerPosition.y + hoverY;
        this.hoverOffset += this.hoverSpeed * deltaTime;
        
        // Slow rotation
        this.ufo.rotation.y += this.rotationSpeed * deltaTime;
        
        // Circular drift motion in x-z plane
        const driftX = Math.cos(this.driftOffset) * this.driftRadius;
        const driftZ = Math.sin(this.driftOffset) * this.driftRadius;
        
        this.ufo.position.x = this.centerPosition.x + driftX;
        this.ufo.position.z = this.centerPosition.z + driftZ;
        
        this.driftOffset += this.driftSpeed * deltaTime;
        
        // Apply rotation to match movement direction
        const targetRotation = Math.atan2(-driftX, -driftZ) + Math.PI/2;
        this.ufo.rotation.y = this.ufo.rotation.y * 0.95 + targetRotation * 0.05; // Smooth rotation
    }
    
    takeDamage(amount) {
        if (this.isDestroyed) return;
        
        this.health -= amount;
        
        if (this.health <= 0 && !this.isDestroyed) {
            this.destroy();
            // Mark as destroyed
            this.isDestroyed = true;
            return true; // Indicate that this hit caused destruction
        }
        
        return false; // No destruction occurred
    }
    
    destroy() {
        this.isDestroyed = true;
        
        // Create a more elaborate explosion effect with multiple elements
        
        // Core explosion
        const explosionGeometry = new THREE.SphereGeometry(3, 16, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff5500,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(this.ufo.position);
        this.scene.add(explosion);
        
        // Create multiple debris particles
        const debrisCount = 15;
        const debris = [];
        
        for (let i = 0; i < debrisCount; i++) {
            const size = Math.random() * 0.5 + 0.2;
            const debrisGeom = new THREE.IcosahedronGeometry(size, 0);
            const debrisMat = new THREE.MeshBasicMaterial({
                color: 0xcc0000,
                transparent: true,
                opacity: 0.9
            });
            
            const particle = new THREE.Mesh(debrisGeom, debrisMat);
            particle.position.copy(this.ufo.position);
            
            // Random velocity for each debris piece
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() * 5) + 2,
                (Math.random() - 0.5) * 10
            );
            
            particle.rotationSpeed = {
                x: Math.random() * 0.2 - 0.1,
                y: Math.random() * 0.2 - 0.1,
                z: Math.random() * 0.2 - 0.1
            };
            
            this.scene.add(particle);
            debris.push(particle);
        }
        
        // Secondary fire rings
        const ringGeometry = new THREE.TorusGeometry(2, 0.5, 8, 24);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(this.ufo.position);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);
        
        // Hide the UFO
        this.ufo.visible = false;
        
        // Animate the explosion over time
        let timeElapsed = 0;
        const duration = 1.5; // longer duration for more dramatic effect
        
        const animateExplosion = () => {
            timeElapsed += 1/60; // Approximately 60fps
            
            // Scale up the main explosion and fade it out
            const progress = timeElapsed / duration;
            explosion.scale.set(1 + progress * 3, 1 + progress * 3, 1 + progress * 3);
            explosion.material.opacity = 0.8 * (1 - progress);
            
            // Scale up the ring and fade it out
            ring.scale.set(1 + progress * 4, 1 + progress * 4, 1 + progress * 4);
            ring.material.opacity = 0.7 * (1 - progress);
            
            // Update debris
            for (const particle of debris) {
                // Apply velocity
                particle.position.add(particle.velocity.clone().multiplyScalar(1/60));
                
                // Apply gravity
                particle.velocity.y -= 9.8 * (1/60);
                
                // Apply rotation
                particle.rotation.x += particle.rotationSpeed.x;
                particle.rotation.y += particle.rotationSpeed.y;
                particle.rotation.z += particle.rotationSpeed.z;
                
                // Fade out
                particle.material.opacity = 0.9 * (1 - progress);
            }
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animateExplosion);
            } else {
                // Clean up explosion objects
                this.scene.remove(explosion);
                this.scene.remove(ring);
                
                for (const particle of debris) {
                    this.scene.remove(particle);
                }
            }
        };
        
        // Start the animation
        animateExplosion();
    }
} 