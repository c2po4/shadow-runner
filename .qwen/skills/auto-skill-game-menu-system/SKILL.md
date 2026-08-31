---
name: game-menu-system
description: Build a hierarchical menu system with navigation between main menu, pause menu, and settings submenus
source: auto-skill
extracted_at: '2026-08-31T17:19:44.049Z'
---

# Game Menu System Architecture

## Overview
Create a hierarchical menu system with multiple states (main menu, pause menu, settings) and smooth navigation between them.

## State Management

Define all menu states in your game state enum:
```javascript
const STATE = { 
    MENU: 0, 
    PLAYING: 1, 
    DEAD: 2, 
    LEVEL_COMPLETE: 3, 
    VICTORY: 4, 
    BOSS_INTRO: 5, 
    SOUND_SETTINGS: 6, 
    PAUSE: 7 
};
```

## Navigation Variables

Track menu selections and navigation history:
```javascript
let mainMenuSelection = 0;      // Current selection in main menu
let pauseMenuSelection = 0;     // Current selection in pause menu
let soundMenuSelection = 0;     // Current selection in sound settings
let previousState = STATE.MENU; // Where to return from settings
```

## Main Menu Structure

```javascript
function drawMenu() {
    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);
    
    // Title
    ctx.fillStyle = '#0d47a1';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME TITLE', W / 2, 140);
    
    // Menu items
    const menuItems = ['Spielen', 'Soundeinstellungen'];
    ctx.font = 'bold 24px monospace';
    menuItems.forEach((item, i) => {
        const y = 260 + i * 50;
        if (i === mainMenuSelection) {
            ctx.fillStyle = '#e040fb';
            ctx.fillText('> ' + item + ' <', W / 2, y);
        } else {
            ctx.fillStyle = '#888';
            ctx.fillText(item, W / 2, y);
        }
    });
    
    // Instructions
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.fillText('ENTER / E / LEERTASTE: Auswählen', W / 2, 420);
}
```

## Main Menu Input Handling

```javascript
case STATE.MENU:
    // Navigation
    if (keys['ArrowUp'] || keys['KeyW']) {
        mainMenuSelection = Math.max(0, mainMenuSelection - 1);
        SoundManager.play('menuSelect');
        keys['ArrowUp'] = false;
        keys['KeyW'] = false;
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        mainMenuSelection = Math.min(1, mainMenuSelection + 1);
        SoundManager.play('menuSelect');
        keys['ArrowDown'] = false;
        keys['KeyS'] = false;
    }
    
    // Selection
    if (keys['Enter'] || keys['Space'] || keys['KeyE']) {
        if (mainMenuSelection === 0) {
            // Start game
            gameState = STATE.PLAYING;
            loadLevel(0);
            SoundManager.play('menuSelect');
        } else if (mainMenuSelection === 1) {
            // Open settings
            previousState = STATE.MENU;
            gameState = STATE.SOUND_SETTINGS;
            soundMenuSelection = 0;
            SoundManager.play('menuSelect');
        }
        keys['Enter'] = false;
        keys['Space'] = false;
        keys['KeyE'] = false;
    }
    break;
```

## Pause Menu

Draw pause menu as overlay on top of game:
```javascript
function drawPauseMenu() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    
    // Title
    ctx.fillStyle = '#0d47a1';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSE', W / 2, 150);
    
    // Menu options
    const menuItems = ['Weiterspielen', 'Soundeinstellungen', 'Zum Hauptmenü'];
    ctx.font = 'bold 24px monospace';
    menuItems.forEach((item, i) => {
        const y = 250 + i * 60;
        if (i === pauseMenuSelection) {
            ctx.fillStyle = '#e040fb';
            ctx.fillText('> ' + item + ' <', W / 2, y);
        } else {
            ctx.fillStyle = '#888';
            ctx.fillText(item, W / 2, y);
        }
    });
}
```

## Pause Menu Input

```javascript
case STATE.PAUSE:
    // Navigation
    if (keys['ArrowUp'] || keys['KeyW']) {
        pauseMenuSelection = Math.max(0, pauseMenuSelection - 1);
        SoundManager.play('menuSelect');
        keys['ArrowUp'] = false;
        keys['KeyW'] = false;
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        pauseMenuSelection = Math.min(2, pauseMenuSelection + 1);
        SoundManager.play('menuSelect');
        keys['ArrowDown'] = false;
        keys['KeyS'] = false;
    }
    
    // Selection
    if (keys['Enter'] || keys['Space'] || keys['KeyE']) {
        if (pauseMenuSelection === 0) {
            // Resume game
            gameState = STATE.PLAYING;
            SoundManager.play('menuSelect');
        } else if (pauseMenuSelection === 1) {
            // Open settings (remember we came from pause)
            previousState = STATE.PAUSE;
            gameState = STATE.SOUND_SETTINGS;
            soundMenuSelection = 0;
            SoundManager.play('menuSelect');
        } else if (pauseMenuSelection === 2) {
            // Return to main menu
            gameState = STATE.MENU;
            mainMenuSelection = 0;
            SoundManager.play('menuSelect');
        }
        keys['Enter'] = false;
        keys['Space'] = false;
        keys['KeyE'] = false;
    }
    
    // Quick resume with ESC
    if (keys['Escape']) {
        gameState = STATE.PLAYING;
        SoundManager.play('menuSelect');
        keys['Escape'] = false;
    }
    break;
```

## Opening Pause Menu

```javascript
case STATE.PLAYING:
    if (keys['Escape']) {
        gameState = STATE.PAUSE;
        pauseMenuSelection = 0;
        SoundManager.play('menuSelect');
        keys['Escape'] = false;
    } else {
        // Normal game update
        updatePlayer();
        updateEnemies();
        updateParticles();
    }
    break;
```

## Settings Menu with Return Navigation

```javascript
case STATE.SOUND_SETTINGS:
    const soundKeys = ['sfx', 'jump', 'coin', 'combat', 'damage'];
    
    // Navigate between settings
    if (keys['ArrowUp'] || keys['KeyW']) {
        soundMenuSelection = Math.max(0, soundMenuSelection - 1);
        SoundManager.play('menuSelect');
        keys['ArrowUp'] = false;
        keys['KeyW'] = false;
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        soundMenuSelection = Math.min(4, soundMenuSelection + 1);
        SoundManager.play('menuSelect');
        keys['ArrowDown'] = false;
        keys['KeyS'] = false;
    }
    
    // Adjust values with left/right
    if (keys['ArrowRight'] || keys['KeyD']) {
        soundSettings[soundKeys[soundMenuSelection]] = 
            Math.min(1, soundSettings[soundKeys[soundMenuSelection]] + 0.1);
        keys['ArrowRight'] = false;
        keys['KeyD'] = false;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        soundSettings[soundKeys[soundMenuSelection]] = 
            Math.max(0, soundSettings[soundKeys[soundMenuSelection]] - 0.1);
        keys['ArrowLeft'] = false;
        keys['KeyA'] = false;
    }
    
    // Return to previous state (main menu or pause menu)
    if (keys['Escape']) {
        gameState = previousState;
        SoundManager.play('menuSelect');
        keys['Escape'] = false;
    }
    break;
```

## Drawing Pause State

Render game in background with pause overlay:
```javascript
case STATE.PAUSE:
    // Draw game in background
    const pauseTheme = THEMES[currentLevel];
    drawBackground(pauseTheme);
    drawPlatforms(pauseTheme);
    drawEnemies();
    drawPlayer();
    drawHUD();
    
    // Draw pause menu on top
    drawPauseMenu();
    break;
```

## Code Input Menu

For special codes/easter eggs, create a text input menu:

```javascript
const STATE = {
    // ... other states
    CODE_MENU: 8
};

let codeInput = '';

function drawCodeMenu() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#0d47a1';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CODE EINGABE', W / 2, 120);

    // Input field
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - 200, 220, 400, 60);
    ctx.strokeStyle = '#e040fb';
    ctx.lineWidth = 3;
    ctx.strokeRect(W / 2 - 200, 220, 400, 60);
    
    // Input text with blinking cursor
    ctx.fillStyle = '#fff';
    ctx.font = '28px monospace';
    ctx.fillText(codeInput + (Math.sin(Date.now() / 200) > 0 ? '|' : ''), W / 2, 258);
}

// Handle text input in keydown event
window.addEventListener('keydown', e => {
    if (gameState === STATE.CODE_MENU) {
        if (e.code === 'Backspace') {
            codeInput = codeInput.slice(0, -1);
            e.preventDefault();
            return;
        }
        if (e.key.length === 1) {
            codeInput += e.key.toLowerCase();
            e.preventDefault();
            return;
        }
    }
    keys[e.code] = true;
    e.preventDefault();
});

// Process code on ENTER
case STATE.CODE_MENU:
    if (keys['Enter']) {
        if (codeInput === '4867/boss') {
            // Unlock boss level
            currentLevel = 3;
            loadLevel(3);
            gameState = STATE.BOSS_INTRO;
        } else if (codeInput === '_5646') {
            // Easter egg
            footballMode = true;
            SoundManager.play('ronaldo');
            codeInput = 'SIUUU!';
        } else {
            codeInput = '';
        }
        keys['Enter'] = false;
    }
    if (keys['Escape']) {
        gameState = previousState;
        codeInput = '';
        keys['Escape'] = false;
    }
    break;
```

## Key Patterns

1. **previousState tracking** - Remember where the player came from so settings can return to the right place
2. **Multiple input methods** - Support ENTER, E, and SPACE for selection
3. **Visual feedback** - Highlight selected item with different color and arrows
4. **Sound feedback** - Play menu select sound on navigation and selection
5. **Reset selections** - Reset menu selection to 0 when entering a menu
6. **Quick actions** - ESC to quickly resume from pause
7. **Overlay rendering** - Draw pause menu on top of frozen game state
8. **Text input menus** - For codes/easter eggs, use separate state with keyboard input handling

## Benefits

- Clean separation of menu states
- Easy to add new menu options
- Consistent navigation pattern
- Player always knows how to return (ESC)
- Settings accessible from multiple places
