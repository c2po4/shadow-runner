---
name: easter-egg-system
description: Implement hidden codes that trigger special game modes with visual, audio, and gameplay changes
source: auto-skill
extracted_at: '2026-08-31T17:46:03.173Z'
---

# Easter Egg System with Special Game Modes

## Overview
Create hidden codes that players can enter to unlock special game modes. These modes can transform visuals, sounds, and gameplay elements while remaining reversible.

## Core Components

### 1. Mode State Variables
```javascript
let specialMode = false;        // Is the mode active?
let modeEffectTimer = 0;        // For timed visual effects
```

### 2. Code Input System
Create a dedicated menu for code entry:

```javascript
const STATE = { CODE_MENU: 8 };
let codeInput = '';

// In keydown handler
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

// In update loop
case STATE.CODE_MENU:
    if (keys['Enter']) {
        if (codeInput === 'secret_code') {
            specialMode = true;
            SoundManager.play('easter_egg_sound');
            codeInput = 'ACTIVATED!'; // Show confirmation
        } else {
            codeInput = ''; // Clear invalid codes
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

### 3. Visual Transformations
Check mode state in drawing functions:

```javascript
function drawEnemies() {
    activeEnemies.forEach(e => {
        if (!e.alive) return;
        const ex = e.x - cameraX;
        
        // Special mode: Transform appearance
        if (specialMode) {
            // Draw transformed version
            drawSpecialModeEnemy(e, ex);
            return;
        }
        
        // Normal drawing
        drawNormalEnemy(e, ex);
    });
}
```

### 4. Mode-Specific Drawing
Create realistic special mode visuals:

```javascript
function drawSpecialModeEnemy(e, ex) {
    const cx = ex + e.w / 2;
    const cy = e.y + e.h / 2;
    const radius = e.w / 2;
    
    // Draw special mode object (e.g., football)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add realistic details (pentagons, patterns, etc.)
    drawRealisticDetails(cx, cy, radius);
    
    // 3D effect with gradient
    const gradient = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, 0,
        cx, cy, radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
}
```

### 5. Perspective Drawing (3D Effect)
For side-view objects like goals:

```javascript
function drawPerspectiveGoal(gx, gy) {
    const depth = 20; // Depth offset for perspective
    
    // Front posts (larger)
    ctx.fillRect(gx, gy, 5, height);
    ctx.fillRect(gx + width, gy, 5, height);
    
    // Back posts (smaller, offset)
    ctx.fillRect(gx + depth, gy + 5, 4, height - 10);
    ctx.fillRect(gx + width - depth, gy + 5, 4, height - 10);
    
    // Connecting lines for 3D effect
    ctx.beginPath();
    ctx.moveTo(gx + 5, gy);
    ctx.lineTo(gx + depth, gy + 5);
    ctx.stroke();
    
    // Net with perspective
    for (let i = 1; i < 6; i++) {
        const frontX = gx + 5 + i * (width - 5) / 6;
        const backX = gx + depth + i * (width - depth * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(frontX, gy + 5);
        ctx.lineTo(backX, gy + 9);
        ctx.stroke();
    }
}
```

### 6. Mode-Specific Particle Effects
Change particle colors based on mode:

```javascript
if (specialMode) {
    // Alternating black and white particles
    for (let i = 0; i < 10; i++) {
        const color = i % 2 === 0 ? '#000' : '#fff';
        spawnParticles(x, y, color, 1, 5);
    }
} else {
    spawnParticles(x, y, '#ff4444', 10, 5);
}
```

### 7. Trigger Sound and Animation
When entering special areas:

```javascript
if (level.goal && rectCollide(player, level.goal)) {
    gameState = STATE.LEVEL_COMPLETE;
    SoundManager.play('levelComplete');
    
    if (specialMode) {
        SoundManager.play('special_mode_sound');
        modeEffectTimer = 90; // Show text for 90 frames
    }
}
```

### 8. Animated Text Overlay
Display mode-specific text with fade effect:

```javascript
function drawHUD() {
    // Normal HUD elements...
    
    // Special mode text
    if (modeEffectTimer > 0) {
        const alpha = Math.min(1, modeEffectTimer / 30);
        const scale = 1 + (90 - modeEffectTimer) * 0.02;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.font = `bold ${Math.floor(48 * scale)}px monospace`;
        ctx.textAlign = 'center';
        ctx.strokeText('MODE TEXT!', W / 2, H / 2 - 50);
        ctx.fillText('MODE TEXT!', W / 2, H / 2 - 50);
        ctx.restore();
        ctx.textAlign = 'left';
    }
}

// In update loop
if (modeEffectTimer > 0) modeEffectTimer--;
```

### 9. Mode Deactivation on Death
Reset mode when player dies:

```javascript
function playerDie() {
    lives--;
    if (lives <= 0) {
        gameState = STATE.DEAD;
        specialMode = false; // Deactivate special mode
        SoundManager.play('death');
    }
}
```

### 10. Custom Easter Egg Sound
Create unique sounds for easter eggs:

```javascript
case 'easter_egg_sound': {
    // "Siuuu" style ascending tone
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const gain2 = ctx.createGain();
    
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);
    
    // Main tone: ascending with vibrato
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.3);
    osc.frequency.linearRampToValueAtTime(350, now + 0.6);
    gain.gain.setValueAtTime(0.8 * soundSettings.sfx, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    // Harmony tone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(300, now);
    osc2.frequency.linearRampToValueAtTime(600, now + 0.3);
    gain2.gain.setValueAtTime(0.4 * soundSettings.sfx, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    osc.start(now);
    osc.stop(now + 0.8);
    osc2.start(now);
    osc2.stop(now + 0.8);
    break;
}
```

## Implementation Checklist

1. **State Variables**: Add mode flag and effect timer
2. **Code Menu**: Create dedicated input screen
3. **Code Validation**: Check for secret codes on Enter
4. **Visual Override**: Check mode in all draw functions
5. **Special Drawings**: Create mode-specific visuals
6. **Particle Changes**: Modify particle colors in mode
7. **Sound Triggers**: Play unique sounds when mode activates
8. **Text Animation**: Show mode-specific text overlays
9. **Deactivation**: Reset mode on death/game over
10. **Persistence**: Decide if mode persists across levels

## Best Practices

- **Realistic Visuals**: Use proper geometry (pentagons, gradients) instead of simple shapes
- **Perspective**: Add depth with offset elements for 3D effect
- **Smooth Transitions**: Use timers for fade effects
- **Clear Feedback**: Show confirmation text when code is entered
- **Reversible**: Allow mode to be deactivated (death, new game)
- **Consistent Theme**: All mode elements should match (colors, sounds, effects)
- **Performance**: Don't overload with too many special effects

## Example Codes

- `_5646` → Football Mode (enemies become footballs, goal becomes net)
- `4867/boss` → Skip to boss fight
- `rainbow` → Rainbow mode (colorful everything)
- `8bit` → Retro pixel art mode

## Tips

- Use memorable but not obvious codes
- Test all visual elements in the mode
- Ensure mode doesn't break gameplay
- Add subtle hints about code existence
- Consider making codes case-insensitive
- Document codes for future reference
