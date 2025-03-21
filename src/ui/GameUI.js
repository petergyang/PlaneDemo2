export class GameUI {
    constructor() {
        this.createUI();
        this.showStartScreen();
        this.isGameStarted = false;
        this.gameOver = false;
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
            <div>SPACE - Shoot</div>
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

        // Create audio controls
        this.audioButton = document.createElement('button');
        this.audioButton.textContent = '🔊 Music On';
        this.audioButton.style.marginTop = '20px';
        this.audioButton.style.padding = '5px 10px';
        this.audioButton.style.background = 'rgba(255,255,255,0.2)';
        this.audioButton.style.color = 'white';
        this.audioButton.style.border = 'none';
        this.audioButton.style.borderRadius = '4px';
        this.audioButton.style.cursor = 'pointer';
        this.container.appendChild(this.audioButton);

        // Create UFO counter display
        this.ufoCountDisplay = document.createElement('div');
        this.ufoCountDisplay.style.marginTop = '20px';
        this.ufoCountDisplay.innerHTML = 'UFOs Remaining: 10';
        this.container.appendChild(this.ufoCountDisplay);

        // Get references to speed elements
        this.speedValue = document.getElementById('speedValue');
        this.speedBar = document.getElementById('speedBar');
    }

    createStartScreen() {
        // Create overlay
        this.startScreen = document.createElement('div');
        this.startScreen.style.position = 'fixed';
        this.startScreen.style.top = '0';
        this.startScreen.style.left = '0';
        this.startScreen.style.width = '100%';
        this.startScreen.style.height = '100%';
        this.startScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.startScreen.style.display = 'flex';
        this.startScreen.style.flexDirection = 'column';
        this.startScreen.style.justifyContent = 'center';
        this.startScreen.style.alignItems = 'center';
        this.startScreen.style.zIndex = '1000';
        
        // Create title
        const title = document.createElement('h1');
        title.textContent = 'PLANE BATTLE';
        title.style.color = '#00FFFF';
        title.style.fontFamily = 'Arial, sans-serif';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        title.style.textShadow = '0 0 10px #00FFFF';
        this.startScreen.appendChild(title);
        
        // Create subtitle
        const subtitle = document.createElement('h2');
        subtitle.textContent = 'Destroy all UFOs to win!';
        subtitle.style.color = 'white';
        subtitle.style.fontFamily = 'Arial, sans-serif';
        subtitle.style.fontSize = '24px';
        subtitle.style.marginBottom = '40px';
        this.startScreen.appendChild(subtitle);
        
        // Create start button
        this.startButton = document.createElement('button');
        this.startButton.textContent = 'START GAME';
        this.startButton.style.padding = '15px 30px';
        this.startButton.style.fontSize = '20px';
        this.startButton.style.background = '#00FFFF';
        this.startButton.style.color = '#000';
        this.startButton.style.border = 'none';
        this.startButton.style.borderRadius = '5px';
        this.startButton.style.cursor = 'pointer';
        this.startButton.style.fontWeight = 'bold';
        this.startScreen.appendChild(this.startButton);
        
        document.body.appendChild(this.startScreen);
    }
    
    createVictoryScreen() {
        // Create overlay
        this.victoryScreen = document.createElement('div');
        this.victoryScreen.style.position = 'fixed';
        this.victoryScreen.style.top = '0';
        this.victoryScreen.style.left = '0';
        this.victoryScreen.style.width = '100%';
        this.victoryScreen.style.height = '100%';
        this.victoryScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.victoryScreen.style.display = 'flex';
        this.victoryScreen.style.flexDirection = 'column';
        this.victoryScreen.style.justifyContent = 'center';
        this.victoryScreen.style.alignItems = 'center';
        this.victoryScreen.style.zIndex = '1000';
        
        // Create victory text
        const victoryText = document.createElement('h1');
        victoryText.textContent = 'VICTORY!';
        victoryText.style.color = '#00FF00';
        victoryText.style.fontFamily = 'Arial, sans-serif';
        victoryText.style.fontSize = '64px';
        victoryText.style.marginBottom = '20px';
        victoryText.style.textShadow = '0 0 15px #00FF00';
        this.victoryScreen.appendChild(victoryText);
        
        // Create subtitle
        const subtitle = document.createElement('h2');
        subtitle.textContent = 'All UFOs destroyed!';
        subtitle.style.color = 'white';
        subtitle.style.fontFamily = 'Arial, sans-serif';
        subtitle.style.fontSize = '32px';
        subtitle.style.marginBottom = '40px';
        this.victoryScreen.appendChild(subtitle);
        
        // Create restart button
        this.restartButton = document.createElement('button');
        this.restartButton.textContent = 'PLAY AGAIN';
        this.restartButton.style.padding = '15px 30px';
        this.restartButton.style.fontSize = '20px';
        this.restartButton.style.background = '#00FF00';
        this.restartButton.style.color = '#000';
        this.restartButton.style.border = 'none';
        this.restartButton.style.borderRadius = '5px';
        this.restartButton.style.cursor = 'pointer';
        this.restartButton.style.fontWeight = 'bold';
        this.victoryScreen.appendChild(this.restartButton);
        
        document.body.appendChild(this.victoryScreen);
    }

    showStartScreen() {
        this.createStartScreen();
        this.container.style.display = 'none';
    }
    
    showVictoryScreen() {
        if (!this.gameOver) {
            this.gameOver = true;
            this.createVictoryScreen();
            this.container.style.display = 'none';
            
            // Add click event for restart button
            this.restartButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
    
    hideStartScreen() {
        if (this.startScreen) {
            document.body.removeChild(this.startScreen);
            this.startScreen = null;
            this.container.style.display = 'block';
            this.isGameStarted = true;
        }
    }

    setupGameStart(startCallback) {
        this.startButton.addEventListener('click', () => {
            this.hideStartScreen();
            startCallback();
        });
    }

    updateUFOCount(count) {
        this.ufoCountDisplay.innerHTML = `UFOs Remaining: ${count}`;
        if (count === 0) {
            this.showVictoryScreen();
        }
    }

    updateSpeed(speedPercentage) {
        const speedValue = Math.round(speedPercentage * 100);
        this.speedValue.textContent = speedValue;
        this.speedBar.style.width = `${speedValue}%`;
    }
    
    setupAudioControl(backgroundMusic) {
        let isMuted = false;
        this.audioButton.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                backgroundMusic.setVolume(0);
                this.audioButton.textContent = '🔇 Music Off';
            } else {
                backgroundMusic.setVolume(0.5);
                this.audioButton.textContent = '🔊 Music On';
            }
        });
    }
} 