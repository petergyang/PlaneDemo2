import * as THREE from 'three';

export default class Airplane {
    constructor() {
        // Create a group to hold all airplane parts
        this.object = new THREE.Group();
        
        // Materials
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 }); // Dark gray for fuselage
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 }); // Slightly lighter gray for wings
        const propellerMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 }); // Dark color for propeller
        
        // Fuselage (main body)
        const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.2, 4, 8);
        fuselageGeometry.rotateX(Math.PI / 2); // Rotate to align with z-axis
        const fuselage = new THREE.Mesh(fuselageGeometry, bodyMaterial);
        this.object.add(fuselage);
        
        // Wings (rectangular)
        const wingGeometry = new THREE.BoxGeometry(7, 0.1, 1);
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0.1; // Slightly above the center of fuselage
        this.object.add(wings);
        
        // Tail vertical stabilizer
        const tailVerticalGeometry = new THREE.BoxGeometry(0.1, 1, 0.8);
        const tailVertical = new THREE.Mesh(tailVerticalGeometry, wingMaterial);
        tailVertical.position.set(0, 0.5, -1.8); // Position at the back
        this.object.add(tailVertical);
        
        // Horizontal stabilizers (tail wings)
        const tailHorizontalGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
        const tailHorizontal = new THREE.Mesh(tailHorizontalGeometry, wingMaterial);
        tailHorizontal.position.set(0, 0.1, -1.8); // Position at the back
        this.object.add(tailHorizontal);
        
        // Propeller base
        const propBaseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
        const propBase = new THREE.Mesh(propBaseGeometry, propellerMaterial);
        propBase.position.set(0, 0, 2.1); // Position at the front
        propBase.rotateX(Math.PI / 2); // Align with z-axis
        this.object.add(propBase);
        
        // Propeller blades
        this.propeller = new THREE.Group();
        this.propeller.position.set(0, 0, 2.3); // Slightly in front of the propeller base
        
        const bladeGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        // First blade (vertical)
        const blade1 = new THREE.Mesh(bladeGeometry, propellerMaterial);
        this.propeller.add(blade1);
        
        // Second blade (horizontal)
        const blade2 = new THREE.Mesh(bladeGeometry, propellerMaterial);
        blade2.rotation.z = Math.PI / 2; // Rotate 90 degrees
        this.propeller.add(blade2);
        
        this.object.add(this.propeller);

        // Cockpit (simple glass canopy)
        const cockpitGeometry = new THREE.SphereGeometry(0.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpitMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8888ff,
            transparent: true,
            opacity: 0.6
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.4, 0.5); // Position on top of fuselage, slightly forward
        cockpit.rotation.x = Math.PI; // Rotate to align with fuselage
        this.object.add(cockpit);
        
        // Set initial position and rotation
        this.object.position.set(0, 10, 0); // Higher position
        
        // Rotate the airplane to tilt it like in the reference image
        this.object.rotation.x = -Math.PI / 12; // Slight downward tilt
        this.object.rotation.z = Math.PI / 6; // Bank angle (roll) as in the reference
    }
    
    update() {
        // Animate the propeller by rotating it
        if (this.propeller) {
            this.propeller.rotation.z += 0.3; // Rotation speed
        }
    }

    getObject() {
        return this.object;
    }
} 