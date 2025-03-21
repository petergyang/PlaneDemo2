import * as THREE from 'three';

export default class Environment {
    constructor() {
        this.objects = new THREE.Group();
        
        // Create ground plane
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8BC34A }); // Green color for ground
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = -2; // Position below the plane
        this.objects.add(ground);
        
        // Create roads
        this.createRoads();
        
        // Create city blocks
        this.createCity();
        
        // Create sky using a large sphere
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB, // Sky blue
            side: THREE.BackSide // Render on the inside
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.objects.add(sky);
    }
    
    createRoads() {
        const roadMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 }); // Dark gray for roads
        const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF }); // White for road lines
        
        const citySize = 80; // Should match the city size in createCity
        const blockSize = 10; // Should match the block size in createCity
        const gap = 3; // Street width, should match the gap in createCity
        
        // Create horizontal roads
        for (let z = -citySize / 2; z <= citySize / 2; z += blockSize + gap) {
            const roadGeometry = new THREE.PlaneGeometry(citySize, gap);
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            road.position.set(0, -1.99, z); // Slightly above the ground
            this.objects.add(road);
            
            // Add center line to the road
            if (z % 2 === 0) { // Only add lines to some roads for variety
                const lineGeometry = new THREE.PlaneGeometry(citySize, 0.2);
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.set(0, -1.98, z); // Slightly above the road
                this.objects.add(line);
            }
        }
        
        // Create vertical roads
        for (let x = -citySize / 2; x <= citySize / 2; x += blockSize + gap) {
            const roadGeometry = new THREE.PlaneGeometry(gap, citySize);
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            road.position.set(x, -1.99, 0); // Slightly above the ground
            this.objects.add(road);
            
            // Add center line to the road
            if (x % 2 === 0) { // Only add lines to some roads for variety
                const lineGeometry = new THREE.PlaneGeometry(0.2, citySize);
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.set(x, -1.98, 0); // Slightly above the road
                this.objects.add(line);
            }
        }
    }
    
    createCity() {
        // Materials for buildings
        const buildingMaterials = [
            new THREE.MeshPhongMaterial({ color: 0xCCCCCC }), // Light gray
            new THREE.MeshPhongMaterial({ color: 0xD3D3D3 }), // Lighter gray
            new THREE.MeshPhongMaterial({ color: 0xA9A9A9 }), // Dark gray
            new THREE.MeshPhongMaterial({ color: 0xE8E8E8 }), // Very light gray
            new THREE.MeshPhongMaterial({ color: 0x87CEFA, opacity: 0.8, transparent: true }), // Light blue glass
        ];
        
        // Material for windows
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            emissive: 0x555555
        });
        
        // Create city grid
        const citySize = 80; // Total city size
        const blockSize = 10; // Size of each city block
        const gap = 3; // Street width
        
        for (let x = -citySize / 2; x < citySize / 2; x += blockSize + gap) {
            for (let z = -citySize / 2; z < citySize / 2; z += blockSize + gap) {
                this.createCityBlock(x, z, blockSize, buildingMaterials, windowMaterial);
            }
        }
        
        // Add a few skyscrapers
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * citySize * 0.7;
            const z = (Math.random() - 0.5) * citySize * 0.7;
            this.createSkyscraper(x, z, buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)]);
        }
    }
    
    createCityBlock(x, z, blockSize, buildingMaterials, windowMaterial) {
        const buildingCount = Math.floor(Math.random() * 4) + 2; // 2-5 buildings per block
        
        for (let i = 0; i < buildingCount; i++) {
            // Random building size
            const width = Math.random() * 3 + 2;
            const depth = Math.random() * 3 + 2;
            const height = Math.random() * 6 + 3;
            
            // Random position within the block
            const posX = x + (Math.random() - 0.5) * (blockSize - width);
            const posZ = z + (Math.random() - 0.5) * (blockSize - depth);
            
            // Create building
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const material = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
            const building = new THREE.Mesh(buildingGeometry, material);
            
            building.position.set(posX, (height / 2) - 2, posZ);
            this.objects.add(building);
            
            // Add windows to the building
            this.addWindowsToBuilding(building, width, height, depth, windowMaterial);
        }
    }
    
    createSkyscraper(x, z, material) {
        // Base dimensions
        const baseWidth = Math.random() * 5 + 10;
        const baseDepth = Math.random() * 5 + 10;
        const height = Math.random() * 40 + 30; // Tall building
        
        // Create main tower
        const baseGeometry = new THREE.BoxGeometry(baseWidth, height, baseDepth);
        const skyscraper = new THREE.Mesh(baseGeometry, material);
        skyscraper.position.set(x, (height / 2) - 2, z);
        this.objects.add(skyscraper);
        
        // Create top section (could be narrower or differently shaped)
        if (Math.random() > 0.5) {
            const topHeight = height * 0.2;
            const topWidth = baseWidth * 0.6;
            const topDepth = baseDepth * 0.6;
            
            const topGeometry = new THREE.BoxGeometry(topWidth, topHeight, topDepth);
            const top = new THREE.Mesh(topGeometry, material);
            top.position.set(x, height - 2 + (topHeight / 2), z);
            this.objects.add(top);
            
            // Optional spire or antenna
            if (Math.random() > 0.6) {
                const spireHeight = height * 0.3;
                const spireGeometry = new THREE.CylinderGeometry(0.2, 0.5, spireHeight, 8);
                const spireMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
                const spire = new THREE.Mesh(spireGeometry, spireMaterial);
                spire.position.set(x, height - 2 + topHeight + (spireHeight / 2), z);
                this.objects.add(spire);
            }
        }
    }
    
    addWindowsToBuilding(building, width, height, depth, windowMaterial) {
        // Skip windows for smaller buildings
        if (height < 5) return;
        
        const windowSize = 0.3;
        const windowSpacing = 1;
        
        // Add windows to front and back
        for (let y = 1; y < height - 1; y += windowSpacing) {
            for (let x = -width/2 + 1; x < width/2 - 0.5; x += windowSpacing) {
                // Front windows
                const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, 0.1);
                const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
                windowFront.position.set(
                    building.position.x + x,
                    building.position.y + y - height/2,
                    building.position.z + depth/2 + 0.1
                );
                this.objects.add(windowFront);
                
                // Back windows
                const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
                windowBack.position.set(
                    building.position.x + x,
                    building.position.y + y - height/2,
                    building.position.z - depth/2 - 0.1
                );
                this.objects.add(windowBack);
            }
        }
        
        // Add windows to sides
        for (let y = 1; y < height - 1; y += windowSpacing) {
            for (let z = -depth/2 + 1; z < depth/2 - 0.5; z += windowSpacing) {
                // Left side windows
                const windowGeometry = new THREE.BoxGeometry(0.1, windowSize, windowSize);
                const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
                windowLeft.position.set(
                    building.position.x - width/2 - 0.1,
                    building.position.y + y - height/2,
                    building.position.z + z
                );
                this.objects.add(windowLeft);
                
                // Right side windows
                const windowRight = new THREE.Mesh(windowGeometry, windowMaterial);
                windowRight.position.set(
                    building.position.x + width/2 + 0.1,
                    building.position.y + y - height/2,
                    building.position.z + z
                );
                this.objects.add(windowRight);
            }
        }
    }
    
    getObjects() {
        return this.objects;
    }
} 