export class GameUI {
    constructor() {
        this.createUI();
    }

    createUI() {
        // Create container
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '20px';
        this.container.style.left = '20px';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        document.body.appendChild(this.container);

        // Create controls overlay
        this.controlsText = document.createElement('div');
        this.controlsText.style.marginBottom = '20px';
        this.controlsText.innerHTML = `
            <div>Controls:</div>
            <div>W/S - Pitch</div>
            <div>A/D - Turn</div>
            <div>Q/E - Speed</div>
        `;
        this.container.appendChild(this.controlsText);

        // Create speed indicator
        this.speedContainer = document.createElement('div');
        this.speedContainer.style.marginTop = '20px';
        this.speedContainer.innerHTML = `
            <div>Speed: <span id="speedValue">0</span>%</div>
            <div style="width: 200px; height: 10px; background: rgba(255,255,255,0.2);">
                <div id="speedBar" style="width: 0%; height: 100%; background: white;"></div>
            </div>
        `;
        this.container.appendChild(this.speedContainer);

        // Get references to speed elements
        this.speedValue = document.getElementById('speedValue');
        this.speedBar = document.getElementById('speedBar');
    }

    updateSpeed(speedPercentage) {
        const speedValue = Math.round(speedPercentage * 100);
        this.speedValue.textContent = speedValue;
        this.speedBar.style.width = `${speedValue}%`;
    }
} 