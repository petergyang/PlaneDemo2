export class InputManager {
    constructor() {
        this.keys = {
            pitchUp: false,    // W
            pitchDown: false,  // S
            rollLeft: false,   // A
            rollRight: false,  // D
            speedUp: false,    // Q
            speedDown: false   // E
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'w': this.keys.pitchUp = true; break;
            case 's': this.keys.pitchDown = true; break;
            case 'a': this.keys.rollLeft = true; break;
            case 'd': this.keys.rollRight = true; break;
            case 'q': this.keys.speedUp = true; break;
            case 'e': this.keys.speedDown = true; break;
        }
    }

    handleKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'w': this.keys.pitchUp = false; break;
            case 's': this.keys.pitchDown = false; break;
            case 'a': this.keys.rollLeft = false; break;
            case 'd': this.keys.rollRight = false; break;
            case 'q': this.keys.speedUp = false; break;
            case 'e': this.keys.speedDown = false; break;
        }
    }

    getInput() {
        return {
            pitch: (this.keys.pitchUp ? 1 : 0) - (this.keys.pitchDown ? 1 : 0),
            roll: (this.keys.rollRight ? 1 : 0) - (this.keys.rollLeft ? 1 : 0),
            speed: (this.keys.speedUp ? 1 : 0) - (this.keys.speedDown ? 1 : 0)
        };
    }
} 