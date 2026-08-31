---
name: web-audio-sound-system
description: Create a procedural sound system using Web Audio API with hierarchical volume controls
source: auto-skill
extracted_at: '2026-08-31T17:19:44.049Z'
---

# Web Audio API Sound System

## Overview
Create a complete sound system without external audio files using the Web Audio API. Supports hierarchical volume controls (master volume × category volume).

## Sound Manager Structure

```javascript
const SoundManager = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    play(type) {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        switch(type) {
            case 'soundType': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                // Configure oscillator
                osc.type = 'sine'; // or 'square', 'sawtooth', 'triangle'
                osc.frequency.setValueAtTime(startFreq, now);
                osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
                
                // Configure volume with hierarchical control
                gain.gain.setValueAtTime(baseVolume * masterVolume * categoryVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                
                osc.start(now);
                osc.stop(now + duration);
                break;
            }
        }
    }
};
```

## Hierarchical Volume System

Create separate volume controls for different sound categories:

```javascript
let soundSettings = {
    sfx: 0.5,      // Master effects volume
    jump: 0.5,     // Jump sounds
    coin: 0.5,     // Coin collection
    combat: 0.5,   // Combat sounds
    damage: 0.5    // Damage/death sounds
};
```

Apply hierarchical volume in sound definitions:
```javascript
// Jump sound uses master × jump
gain.gain.setValueAtTime(0.7 * soundSettings.sfx * soundSettings.jump, now);

// Combat sound uses master × combat
gain.gain.setValueAtTime(0.5 * soundSettings.sfx * soundSettings.combat, now);
```

## Persisting Sound Settings with localStorage

Save and load sound settings so they persist across page reloads:

```javascript
// Load settings on startup (with fallback defaults)
let soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {
    sfx: 0.5,
    jump: 0.5,
    coin: 0.5,
    combat: 0.5,
    damage: 0.5
};

// Save function
function saveSoundSettings() {
    localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
}

// Call saveSoundSettings() whenever a setting changes
if (keys['ArrowRight'] || keys['KeyD']) {
    soundSettings[soundKeys[soundMenuSelection]] = 
        Math.min(1, soundSettings[soundKeys[soundMenuSelection]] + 0.1);
    saveSoundSettings();
    keys['ArrowRight'] = false;
    keys['KeyD'] = false;
}
```

This ensures players don't lose their volume preferences when they close or reload the page.

## Common Sound Patterns

### Jump Sound (ascending tone)
```javascript
osc.frequency.setValueAtTime(300, now);
osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
gain.gain.setValueAtTime(0.7 * soundSettings.sfx * soundSettings.jump, now);
```

### Coin Sound (high ping)
```javascript
osc.frequency.setValueAtTime(800, now);
osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
gain.gain.setValueAtTime(0.4 * soundSettings.sfx * soundSettings.coin, now);
```

### Enemy Hit (descending sawtooth)
```javascript
osc.type = 'sawtooth';
osc.frequency.setValueAtTime(200, now);
osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
gain.gain.setValueAtTime(0.5 * soundSettings.sfx * soundSettings.combat, now);
```

### Player Damage (low square wave)
```javascript
osc.type = 'square';
osc.frequency.setValueAtTime(150, now);
osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
gain.gain.setValueAtTime(0.6 * soundSettings.sfx * soundSettings.damage, now);
```

### Death (long descending sawtooth)
```javascript
osc.type = 'sawtooth';
osc.frequency.setValueAtTime(400, now);
osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
gain.gain.setValueAtTime(0.7 * soundSettings.sfx * soundSettings.damage, now);
```

### Level Complete (ascending melody)
```javascript
[523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(0.5 * soundSettings.sfx, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.2);
});
```

## Sound Settings UI

Create a menu with volume bars for each category:

```javascript
function drawSoundSettings() {
    const categories = [
        { key: 'sfx', name: 'Effekte (Gesamt)' },
        { key: 'jump', name: 'Springen' },
        { key: 'coin', name: 'Münzen' },
        { key: 'combat', name: 'Kampf' },
        { key: 'damage', name: 'Schaden' }
    ];
    
    categories.forEach((cat, i) => {
        const y = 160 + i * 60;
        const value = soundSettings[cat.key];
        
        // Draw category name
        ctx.fillText(cat.name, x, y);
        
        // Draw volume bar
        ctx.fillRect(barX, y - 15, 120, 20); // Background
        ctx.fillRect(barX, y - 15, 120 * value, 20); // Fill
        
        // Draw percentage
        ctx.fillText(Math.round(value * 100) + '%', percentX, y);
    });
}
```

## Integration with Game Events

Call sounds at appropriate game events:
```javascript
// Jump
if (isJump() && player.onGround) {
    player.vy = player.jumpForce;
    SoundManager.play('jump');
}

// Coin collection
if (rectCollide(player, coin)) {
    coin.collected = true;
    SoundManager.play('coin');
}

// Enemy defeated
if (player.vy > 0 && rectCollide(player, enemy)) {
    enemy.alive = false;
    SoundManager.play('enemyHit');
}

// Player takes damage
function playerHit() {
    SoundManager.play('playerHit');
    if (lives <= 0) {
        SoundManager.play('death');
    }
}
```

## Key Benefits

1. **No external files** - All sounds generated procedurally
2. **Small file size** - No audio assets needed
3. **Flexible control** - Hierarchical volume system
4. **Instant playback** - No loading delays
5. **Customizable** - Easy to adjust frequencies and durations

## Tips

- Use `exponentialRampToValueAtTime` for smooth frequency/volume transitions
- Keep sound durations short (0.1-0.5s) for responsive feedback
- Use different oscillator types for variety: sine (smooth), square (harsh), sawtooth (buzzy), triangle (soft)
- Test volume levels together to ensure balance
- Start with lower volumes and increase as needed
