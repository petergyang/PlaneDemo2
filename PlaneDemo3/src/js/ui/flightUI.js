export default class FlightUI {
    constructor(controls) {
        this.controls = controls;
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        document.body.appendChild(this.container);
        
        // Create UI elements
        this.createControlsReference();
        this.createSpeedIndicator();
    }
    
    createControlsReference() {
        // Create container for controls reference
        this.controlsRef = document.createElement('div');
        this.controlsRef.style.position = 'absolute';
        this.controlsRef.style.bottom = '20px';
        this.controlsRef.style.left = '20px';
        this.controlsRef.style.padding = '15px';
        this.controlsRef.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.controlsRef.style.color = 'white';
        this.controlsRef.style.fontFamily = 'Arial, sans-serif';
        this.controlsRef.style.fontSize = '14px';
        this.controlsRef.style.borderRadius = '5px';
        this.controlsRef.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        
        // Add control instructions
        this.controlsRef.innerHTML = `
            <h3 style="margin-top: 0; margin-bottom: 10px;">Flight Controls</h3>
            <div style="display: grid; grid-template-columns: auto auto; gap: 5px;">
                <div>W/S:</div><div>Pitch Down/Up</div>
                <div>A/D:</div><div>Roll Left/Right</div>
                <div>Q/E:</div><div>Decrease/Increase Speed</div>
                <div>C:</div><div>Toggle Camera Mode</div>
            </div>
        `;
        
        this.container.appendChild(this.controlsRef);
    }
    
    createSpeedIndicator() {
        // Create container for speed indicator
        this.speedIndicator = document.createElement('div');
        this.speedIndicator.style.position = 'absolute';
        this.speedIndicator.style.top = '20px';
        this.speedIndicator.style.right = '20px';
        this.speedIndicator.style.padding = '10px';
        this.speedIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.speedIndicator.style.color = 'white';
        this.speedIndicator.style.fontFamily = 'Arial, sans-serif';
        this.speedIndicator.style.fontSize = '16px';
        this.speedIndicator.style.borderRadius = '5px';
        this.speedIndicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        this.speedIndicator.style.textAlign = 'center';
        
        // Speed value element
        this.speedValue = document.createElement('div');
        this.speedValue.style.fontSize = '24px';
        this.speedValue.style.fontWeight = 'bold';
        this.speedValue.style.marginBottom = '5px';
        this.speedIndicator.appendChild(this.speedValue);
        
        // Speed bar container
        this.speedBarContainer = document.createElement('div');
        this.speedBarContainer.style.width = '150px';
        this.speedBarContainer.style.height = '20px';
        this.speedBarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.speedBarContainer.style.borderRadius = '10px';
        this.speedBarContainer.style.overflow = 'hidden';
        this.speedIndicator.appendChild(this.speedBarContainer);
        
        // Speed bar indicator
        this.speedBar = document.createElement('div');
        this.speedBar.style.height = '100%';
        this.speedBar.style.width = '0%';
        this.speedBar.style.backgroundColor = '#4CAF50'; // Green
        this.speedBar.style.transition = 'width 0.2s, background-color 0.3s';
        this.speedBarContainer.appendChild(this.speedBar);
        
        // Speed labels
        const speedLabels = document.createElement('div');
        speedLabels.style.display = 'flex';
        speedLabels.style.justifyContent = 'space-between';
        speedLabels.style.marginTop = '5px';
        speedLabels.style.fontSize = '12px';
        speedLabels.style.opacity = '0.7';
        
        const minLabel = document.createElement('div');
        minLabel.textContent = `${this.controls.minSpeed}`;
        speedLabels.appendChild(minLabel);
        
        const maxLabel = document.createElement('div');
        maxLabel.textContent = `${this.controls.maxSpeed}`;
        speedLabels.appendChild(maxLabel);
        
        this.speedIndicator.appendChild(speedLabels);
        
        this.container.appendChild(this.speedIndicator);
    }
    
    update() {
        // Update speed indicator
        const speed = this.controls.getSpeed();
        const normalizedSpeed = this.controls.getNormalizedSpeed();
        
        // Update speed text
        this.speedValue.textContent = `${speed.toFixed(1)}`;
        
        // Update speed bar
        const widthPercent = normalizedSpeed * 100;
        this.speedBar.style.width = `${widthPercent}%`;
        
        // Update color based on speed
        if (normalizedSpeed < 0.3) {
            // Low speed - amber/yellow
            this.speedBar.style.backgroundColor = '#FFC107';
            this.speedValue.style.color = '#FFC107';
        } else if (normalizedSpeed > 0.85) {
            // High speed - red
            this.speedBar.style.backgroundColor = '#F44336';
            this.speedValue.style.color = '#F44336';
        } else {
            // Normal speed - green
            this.speedBar.style.backgroundColor = '#4CAF50';
            this.speedValue.style.color = '#4CAF50';
        }
    }
} 