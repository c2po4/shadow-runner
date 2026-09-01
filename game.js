const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ==================== SOUND MANAGER ====================
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
            case 'jump': {
                // Bounce-Sound mit schnellem Pitch-Sweep
                const osc = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                const gain2 = ctx.createGain();
                osc.connect(gain);
                osc2.connect(gain2);
                gain.connect(ctx.destination);
                gain2.connect(ctx.destination);
                
                // Hauptton: schneller Sweep nach oben
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
                gain.gain.setValueAtTime(1 * soundSettings.sfx * soundSettings.jump, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                
                // Zweiter Ton: leiser "Pop" am Anfang
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(200, now);
                osc2.frequency.exponentialRampToValueAtTime(300, now + 0.03);
                gain2.gain.setValueAtTime(0.3 * soundSettings.sfx * soundSettings.jump, now);
                gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
                
                osc.start(now);
                osc.stop(now + 0.08);
                osc2.start(now);
                osc2.stop(now + 0.03);
                break;
            }
            case 'coin': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.4 * soundSettings.sfx * soundSettings.coin, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            }
            case 'enemyHit': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.5 * soundSettings.sfx * soundSettings.combat, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            }
            case 'playerHit': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
                gain.gain.setValueAtTime(0.6 * soundSettings.sfx * soundSettings.damage, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            }
            case 'death': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
                gain.gain.setValueAtTime(0.7 * soundSettings.sfx * soundSettings.damage, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            }
            case 'levelComplete': {
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
                break;
            }
            case 'victory': {
                [523, 659, 784, 1047, 1319].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(freq, now + i * 0.15);
                    gain.gain.setValueAtTime(0.6 * soundSettings.sfx, now + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
                    osc.start(now + i * 0.15);
                    osc.stop(now + i * 0.15 + 0.3);
                });
                break;
            }
            case 'menuSelect': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(600, now);
                gain.gain.setValueAtTime(0.4 * soundSettings.sfx, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            }
            case 'bossHit': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.6 * soundSettings.sfx * soundSettings.combat, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            }
            case 'bossAttack': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
                gain.gain.setValueAtTime(0.5 * soundSettings.sfx * soundSettings.combat, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            }
            case 'ronaldo': {
                // "Süü" Sound - tiefer, jubelnder Ton
                const osc = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                const gain2 = ctx.createGain();
                osc.connect(gain);
                osc2.connect(gain2);
                gain.connect(ctx.destination);
                gain2.connect(ctx.destination);
                
                // Hauptton: "Süü" - aufsteigend mit Vibrato
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(400, now + 0.3);
                osc.frequency.linearRampToValueAtTime(350, now + 0.6);
                gain.gain.setValueAtTime(0.8 * soundSettings.sfx, now);
                gain.gain.linearRampToValueAtTime(0.6 * soundSettings.sfx, now + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                
                // Zweiter Ton: Harmonie für "Süü"-Effekt
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(300, now);
                osc2.frequency.linearRampToValueAtTime(600, now + 0.3);
                osc2.frequency.linearRampToValueAtTime(525, now + 0.6);
                gain2.gain.setValueAtTime(0.4 * soundSettings.sfx, now);
                gain2.gain.linearRampToValueAtTime(0.3 * soundSettings.sfx, now + 0.3);
                gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                
                osc.start(now);
                osc.stop(now + 0.8);
                osc2.start(now);
                osc2.stop(now + 0.8);
                break;
            }
        }
    }
};

// ==================== INPUT ====================
const keys = {};
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
    keys[e.code] = true; e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; e.preventDefault(); });

function isLeft() { return keys['ArrowLeft'] || keys['KeyA']; }
function isRight() { return keys['ArrowRight'] || keys['KeyD']; }
function isJump() { return keys['ArrowUp'] || keys['KeyW'] || keys['Space']; }

// ==================== GAME STATE ====================
const STATE = { MENU: 0, PLAYING: 1, DEAD: 2, LEVEL_COMPLETE: 3, VICTORY: 4, BOSS_INTRO: 5, SOUND_SETTINGS: 6, PAUSE: 7, CODE_MENU: 8 };
let gameState = STATE.MENU;
let currentLevel = 0;
let score = 0;
let lives = 3;
let stateTimer = 0;
let cameraX = 0;
let particles = [];
let screenShake = 0;
let bossIntroTimer = 0;
let codeInput = '';
let footballMode = false;
let siuuTimer = 0;

// Fußball-Bild laden
const footballImage = new Image();
footballImage.src = 'Download.avif';
let soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {
    sfx: 0.5,
    jump: 0.5,
    coin: 0.5,
    combat: 0.5,
    damage: 0.5
};
let soundMenuSelection = 0;
let mainMenuSelection = 0;
let pauseMenuSelection = 0;
let previousState = STATE.MENU;

function saveSoundSettings() {
    localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
}

// ==================== COLORS / THEME ====================
const THEMES = [
    { bg1: '#87CEEB', bg2: '#E0F7FA', ground: '#4CAF50', groundDark: '#388E3C', platform: '#66BB6A', accent: '#81C784', sky: '#87CEEB', name: 'Grüne Wiesen' },
    { bg1: '#1a1a2e', bg2: '#0d1b2a', ground: '#4a4e69', groundDark: '#22223b', platform: '#6c757d', accent: '#9a8c98', sky: '#1b263b', name: 'Dunkle Höhle' },
    { bg1: '#ffbe0b', bg2: '#ff8c42', ground: '#3a86ff', groundDark: '#2667cc', platform: '#8338ec', accent: '#ff006e', sky: '#ffbe0b', name: 'Himmelsfestung' },
    { bg1: '#10002b', bg2: '#240046', ground: '#3c096c', groundDark: '#10002b', platform: '#5a189a', accent: '#e040fb', sky: '#1a0033', name: 'Schattenreich' }
];

// ==================== PLAYER ====================
const player = {
    x: 50, y: 300, w: 28, h: 36,
    vx: 0, vy: 0,
    speed: 4.5, jumpForce: -11, gravity: 0.55,
    onGround: false, jumping: false,
    facing: 1, frame: 0, frameTimer: 0,
    invincible: 0, dashCooldown: 0,
    trail: []
};

function resetPlayer() {
    player.x = 50; player.y = 300;
    player.vx = 0; player.vy = 0;
    player.onGround = false; player.jumping = false;
    player.invincible = 0; player.trail = [];
}

// ==================== LEVEL DATA ====================
function generateLevels() {
    return [
        // Level 1: Grüne Wiesen - Einfach, abwechslungsreiche Routen
        {
            width: 3200,
            platforms: [
                // Start-Bereich
                { x: 0, y: 480, w: 400, h: 60 },
                { x: 200, y: 400, w: 120, h: 20 },
                { x: 350, y: 330, w: 100, h: 20 },
                // Erste Lücke
                { x: 550, y: 480, w: 200, h: 60 },
                { x: 600, y: 410, w: 100, h: 20 },
                // Aufstiegs-Bereich
                { x: 800, y: 480, w: 300, h: 60 },
                { x: 850, y: 420, w: 80, h: 20 },
                { x: 950, y: 360, w: 80, h: 20 },
                { x: 1050, y: 300, w: 80, h: 20 },
                { x: 900, y: 240, w: 100, h: 20 },
                // Hohe Route
                { x: 1100, y: 260, w: 80, h: 20 },
                { x: 1250, y: 220, w: 100, h: 20 },
                // Abstieg
                { x: 1200, y: 480, w: 250, h: 60 },
                { x: 1400, y: 380, w: 100, h: 20 },
                // Zentraler Bereich
                { x: 1550, y: 480, w: 300, h: 60 },
                { x: 1600, y: 420, w: 80, h: 20 },
                { x: 1700, y: 350, w: 100, h: 20 },
                { x: 1800, y: 280, w: 80, h: 20 },
                { x: 1650, y: 230, w: 100, h: 20 },
                // Weiter rechts
                { x: 1950, y: 480, w: 200, h: 60 },
                { x: 2000, y: 400, w: 100, h: 20 },
                // Versetzte Plattformen
                { x: 2200, y: 480, w: 150, h: 60 },
                { x: 2250, y: 410, w: 80, h: 20 },
                { x: 2350, y: 340, w: 80, h: 20 },
                { x: 2450, y: 410, w: 80, h: 20 },
                { x: 2550, y: 350, w: 80, h: 20 },
                { x: 2650, y: 280, w: 100, h: 20 },
                // Ende
                { x: 2800, y: 480, w: 400, h: 60 },
            ],
            enemies: [
                { x: 600, y: 448, w: 30, h: 32, minX: 550, maxX: 720, speed: 1.5, type: 'walker' },
                { x: 900, y: 448, w: 30, h: 32, minX: 800, maxX: 1070, speed: 1.8, type: 'walker' },
                { x: 1650, y: 448, w: 30, h: 32, minX: 1550, maxX: 1820, speed: 1.5, type: 'walker' },
                { x: 2250, y: 448, w: 30, h: 32, minX: 2200, maxX: 2330, speed: 2, type: 'walker' },
                { x: 1100, y: 180, w: 32, h: 28, minX: 1000, maxX: 1300, speed: 1.3, type: 'flyer', flyHeight: 35 },
                { x: 2950, y: 448, w: 30, h: 32, minX: 2850, maxX: 3080, speed: 1.5, type: 'walker', rollsToGoal: true },
            ],
            coins: [
                { x: 250, y: 450 }, { x: 650, y: 380 }, { x: 2050, y: 370 },
                { x: 230, y: 370 }, { x: 880, y: 390 }, { x: 980, y: 330 },
                { x: 1430, y: 350 }, { x: 1630, y: 390 }, { x: 1730, y: 320 },
                { x: 2280, y: 380 }, { x: 2380, y: 310 }, { x: 2480, y: 380 },
                { x: 380, y: 300 }, { x: 930, y: 210 }, { x: 1130, y: 230 },
                { x: 1280, y: 190 }, { x: 1830, y: 250 }, { x: 1680, y: 200 },
                { x: 2580, y: 320 }, { x: 2680, y: 250 }, { x: 2900, y: 450 },
            ],
            spikes: [
                { x: 250, y: 465, w: 60 },
                { x: 850, y: 465, w: 50 },
                { x: 1650, y: 465, w: 50 },
            ],
            goal: { x: 3100, y: 420, w: 40, h: 60 },
            playerStart: { x: 50, y: 400 }
        },
        // Level 2: Dunkle Höhle - mehrere Routen (unten/mitte/oben)
        // Max 90px Höhendifferenz, Decke bei y=50-90
        {
            width: 3400,
            platforms: [
                // Höhlendecke
                { x: 0, y: 0, w: 3400, h: 50 },
                { x: 200, y: 50, w: 100, h: 30 },
                { x: 500, y: 50, w: 150, h: 40 },
                { x: 900, y: 50, w: 120, h: 35 },
                { x: 1300, y: 50, w: 100, h: 25 },
                { x: 1700, y: 50, w: 130, h: 40 },
                { x: 2100, y: 50, w: 110, h: 30 },
                { x: 2500, y: 50, w: 140, h: 35 },
                { x: 2900, y: 50, w: 100, h: 25 },
                // === Unterer Pfad (Boden) ===
                { x: 0, y: 480, w: 300, h: 60 },
                { x: 550, y: 480, w: 200, h: 60 },
                { x: 850, y: 480, w: 150, h: 60 },
                { x: 1150, y: 480, w: 200, h: 60 },
                { x: 1450, y: 480, w: 200, h: 60 },
                { x: 1750, y: 480, w: 200, h: 60 },
                { x: 2050, y: 480, w: 200, h: 60 },
                { x: 2350, y: 480, w: 200, h: 60 },
                { x: 2650, y: 480, w: 200, h: 60 },
                { x: 2950, y: 480, w: 450, h: 60 },
                // === Mittlerer Pfad (y=410-360) ===
                { x: 180, y: 410, w: 80, h: 16 },
                { x: 340, y: 360, w: 80, h: 16 },
                { x: 500, y: 410, w: 80, h: 16 },
                { x: 700, y: 420, w: 100, h: 16 },
                { x: 860, y: 360, w: 80, h: 16 },
                { x: 1020, y: 410, w: 100, h: 16 },
                { x: 1170, y: 360, w: 80, h: 16 },
                { x: 1330, y: 410, w: 100, h: 16 },
                { x: 1470, y: 360, w: 80, h: 16 },
                { x: 1620, y: 410, w: 100, h: 16 },
                { x: 1770, y: 360, w: 80, h: 16 },
                { x: 1920, y: 410, w: 100, h: 16 },
                { x: 2070, y: 360, w: 80, h: 16 },
                { x: 2220, y: 410, w: 100, h: 16 },
                { x: 2370, y: 360, w: 80, h: 16 },
                { x: 2520, y: 410, w: 100, h: 16 },
                { x: 2670, y: 360, w: 80, h: 16 },
                { x: 2820, y: 410, w: 100, h: 16 },
                // === Oberer Pfad (y=280-200), erreichbar vom mittleren Pfad ===
                { x: 300, y: 280, w: 80, h: 16 },   // von y=360 erreichbar (80px)
                { x: 460, y: 220, w: 80, h: 16 },   // von y=280 erreichbar (60px)
                { x: 820, y: 280, w: 80, h: 16 },   // von y=360 erreichbar
                { x: 980, y: 220, w: 80, h: 16 },   // höher
                { x: 1130, y: 280, w: 80, h: 16 },  // von y=360 erreichbar
                { x: 1290, y: 220, w: 80, h: 16 },  // höher
                { x: 1730, y: 280, w: 80, h: 16 },  // von y=360 erreichbar
                { x: 1890, y: 220, w: 80, h: 16 },  // höher
                { x: 2030, y: 280, w: 80, h: 16 },  // von y=360 erreichbar
                { x: 2330, y: 280, w: 80, h: 16 },  // von y=360 erreichbar
                { x: 2630, y: 280, w: 80, h: 16 },  // von y=360 erreichbar
                { x: 2790, y: 220, w: 80, h: 16 },  // höher
            ],
            enemies: [
                { x: 600, y: 448, w: 30, h: 32, minX: 550, maxX: 720, speed: 2, type: 'jumper', jumpForce: -10, jumpInterval: 60 },
                { x: 900, y: 448, w: 30, h: 32, minX: 850, maxX: 980, speed: 2.2, type: 'jumper', jumpForce: -10, jumpInterval: 50 },
                { x: 1200, y: 448, w: 30, h: 32, minX: 1150, maxX: 1320, speed: 2, type: 'jumper', jumpForce: -11, jumpInterval: 55 },
                { x: 1500, y: 448, w: 30, h: 32, minX: 1450, maxX: 1620, speed: 2.3, type: 'jumper', jumpForce: -10, jumpInterval: 45 },
                { x: 2100, y: 448, w: 30, h: 32, minX: 2050, maxX: 2220, speed: 2.5, type: 'jumper', jumpForce: -11, jumpInterval: 50 },
                { x: 2700, y: 448, w: 30, h: 32, minX: 2650, maxX: 2820, speed: 2.2, type: 'jumper', jumpForce: -10, jumpInterval: 55 },
                { x: 500, y: 180, w: 32, h: 28, minX: 400, maxX: 700, speed: 1.5, type: 'flyer', flyHeight: 30 },
                { x: 1800, y: 160, w: 32, h: 28, minX: 1700, maxX: 2000, speed: 1.8, type: 'flyer', flyHeight: 30 },
            ],
            coins: [
                // Unterer Pfad
                { x: 600, y: 450 }, { x: 900, y: 450 }, { x: 1500, y: 450 }, { x: 2400, y: 450 },
                // Mittlerer Pfad
                { x: 210, y: 380 }, { x: 370, y: 330 }, { x: 530, y: 380 },
                { x: 730, y: 390 }, { x: 890, y: 330 }, { x: 1050, y: 380 },
                { x: 1200, y: 330 }, { x: 1360, y: 380 }, { x: 1500, y: 330 },
                { x: 1650, y: 380 }, { x: 1800, y: 330 }, { x: 1950, y: 380 },
                { x: 2100, y: 330 }, { x: 2250, y: 380 }, { x: 2400, y: 330 },
                { x: 2550, y: 380 }, { x: 2700, y: 330 }, { x: 2850, y: 380 },
                // Oberer Pfad (Bonus-Coins)
                { x: 330, y: 250 }, { x: 490, y: 190 }, { x: 850, y: 250 },
                { x: 1010, y: 190 }, { x: 1160, y: 250 }, { x: 1320, y: 190 },
                { x: 1760, y: 250 }, { x: 1920, y: 190 }, { x: 2060, y: 250 },
                { x: 2360, y: 250 }, { x: 2660, y: 250 }, { x: 2820, y: 190 },
            ],
            spikes: [
                { x: 150, y: 465, w: 60 },   // auf Start-Plattform (x=0-300)
                { x: 620, y: 465, w: 50 },   // auf Plattform (x=550-750)
                { x: 900, y: 465, w: 50 },   // auf Plattform (x=850-1000)
                { x: 1520, y: 465, w: 50 },  // auf Plattform (x=1450-1650)
                { x: 2120, y: 465, w: 50 },  // auf Plattform (x=2050-2250)
            ],
            goal: { x: 3300, y: 420, w: 40, h: 60 },
            playerStart: { x: 50, y: 400 }
        },
        // Level 3: Himmelsfestung - kleine Plattformen, viele fliegende Gegner
        {
            width: 4200,
            platforms: [
                { x: 0, y: 480, w: 200, h: 60 },
                { x: 250, y: 420, w: 60, h: 14 },
                { x: 380, y: 360, w: 60, h: 14 },
                { x: 500, y: 300, w: 70, h: 14 },
                { x: 650, y: 360, w: 60, h: 14 },
                { x: 780, y: 420, w: 60, h: 14 },
                { x: 780, y: 480, w: 120, h: 60 },
                { x: 920, y: 360, w: 70, h: 14 },
                { x: 1060, y: 300, w: 60, h: 14 },
                { x: 1180, y: 240, w: 70, h: 14 },
                { x: 1320, y: 300, w: 60, h: 14 },
                { x: 1320, y: 480, w: 150, h: 60 },
                { x: 1460, y: 380, w: 60, h: 14 },
                { x: 1580, y: 320, w: 70, h: 14 },
                { x: 1720, y: 260, w: 60, h: 14 },
                { x: 1850, y: 320, w: 70, h: 14 },
                { x: 1850, y: 480, w: 150, h: 60 },
                { x: 2000, y: 400, w: 60, h: 14 },
                { x: 2120, y: 340, w: 70, h: 14 },
                { x: 2260, y: 280, w: 60, h: 14 },
                { x: 2380, y: 340, w: 70, h: 14 },
                { x: 2380, y: 480, w: 150, h: 60 },
                { x: 2530, y: 400, w: 60, h: 14 },
                { x: 2650, y: 340, w: 70, h: 14 },
                { x: 2790, y: 280, w: 60, h: 14 },
                { x: 2910, y: 340, w: 70, h: 14 },
                { x: 2910, y: 480, w: 150, h: 60 },
                { x: 3060, y: 400, w: 60, h: 14 },
                { x: 3180, y: 340, w: 70, h: 14 },
                { x: 3320, y: 280, w: 60, h: 14 },
                { x: 3440, y: 340, w: 70, h: 14 },
                { x: 3440, y: 480, w: 150, h: 60 },
                { x: 3600, y: 400, w: 80, h: 14 },
                { x: 3750, y: 340, w: 80, h: 14 },
                { x: 3900, y: 480, w: 300, h: 60 },
            ],
            enemies: [
                { x: 820, y: 448, w: 30, h: 32, minX: 780, maxX: 880, speed: 2.5, type: 'walker' },
                { x: 1380, y: 448, w: 30, h: 32, minX: 1320, maxX: 1450, speed: 2.8, type: 'walker' },
                { x: 1900, y: 448, w: 30, h: 32, minX: 1850, maxX: 1980, speed: 2.5, type: 'walker' },
                { x: 2430, y: 448, w: 30, h: 32, minX: 2380, maxX: 2510, speed: 3, type: 'walker' },
                { x: 2960, y: 448, w: 30, h: 32, minX: 2910, maxX: 3040, speed: 2.8, type: 'walker' },
                { x: 3490, y: 448, w: 30, h: 32, minX: 3440, maxX: 3570, speed: 3, type: 'walker' },
                { x: 400, y: 200, w: 32, h: 28, minX: 300, maxX: 600, speed: 2, type: 'flyer', flyHeight: 50 },
                { x: 1000, y: 180, w: 32, h: 28, minX: 900, maxX: 1200, speed: 2.2, type: 'flyer', flyHeight: 60 },
                { x: 1600, y: 160, w: 32, h: 28, minX: 1500, maxX: 1800, speed: 2.5, type: 'flyer', flyHeight: 55 },
                { x: 2200, y: 180, w: 32, h: 28, minX: 2100, maxX: 2400, speed: 2.3, type: 'flyer', flyHeight: 65 },
                { x: 2800, y: 170, w: 32, h: 28, minX: 2700, maxX: 3000, speed: 2.6, type: 'flyer', flyHeight: 50 },
                { x: 3400, y: 190, w: 32, h: 28, minX: 3300, maxX: 3600, speed: 2.4, type: 'flyer', flyHeight: 60 },
            ],
            coins: [
                { x: 280, y: 390 }, { x: 410, y: 330 }, { x: 530, y: 270 },
                { x: 680, y: 330 }, { x: 810, y: 390 }, { x: 950, y: 330 },
                { x: 1090, y: 270 }, { x: 1210, y: 210 }, { x: 1350, y: 270 },
                { x: 1490, y: 350 }, { x: 1610, y: 290 }, { x: 1750, y: 230 },
                { x: 1880, y: 290 }, { x: 2030, y: 370 }, { x: 2150, y: 310 },
                { x: 2290, y: 250 }, { x: 2410, y: 310 }, { x: 2560, y: 370 },
                { x: 2680, y: 310 }, { x: 2820, y: 250 }, { x: 2940, y: 310 },
            ],
            spikes: [
                { x: 80, y: 465, w: 60 },  // auf Plattform (x=0-200) - deutlicher
                { x: 820, y: 465, w: 40 },  // auf Plattform (x=780-900)
                { x: 1380, y: 465, w: 40 }, // auf Plattform (x=1320-1470)
                { x: 1900, y: 465, w: 40 }, // auf Plattform (x=1850-2000)
                { x: 2430, y: 465, w: 40 }, // auf Plattform (x=2380-2530)
                { x: 2960, y: 465, w: 40 }, // auf Plattform (x=2910-3060)
                { x: 3500, y: 465, w: 40 }, // auf Plattform (x=3440-3590)
            ],
            goal: { x: 4100, y: 420, w: 40, h: 60 },
            playerStart: { x: 50, y: 400 }
        },
        // Level 4: Boss-Level
        {
            width: 1200,
            platforms: [
                { x: 0, y: 480, w: 1200, h: 60 },
                { x: 100, y: 400, w: 120, h: 20 },
                { x: 400, y: 360, w: 120, h: 20 },
                { x: 700, y: 400, w: 120, h: 20 },
                { x: 950, y: 360, w: 120, h: 20 },
                { x: 250, y: 280, w: 100, h: 20 },
                { x: 550, y: 250, w: 100, h: 20 },
                { x: 850, y: 280, w: 100, h: 20 },
            ],
            enemies: [],
            coins: [],
            spikes: [],
            goal: null,
            boss: {
                x: 900, y: 340, w: 80, h: 140,
                hp: 15, maxHp: 15,
                phase: 1, attackTimer: 0, attackType: 0,
                vx: 0, vy: 0,
                projectiles: [],
                invincible: 0,
                shakeTimer: 0
            },
            playerStart: { x: 50, y: 400 }
        }
    ];
}

let levels = generateLevels();
let level = null;
let activeEnemies = [];
let activeCoins = [];

function loadLevel(idx) {
    levels = generateLevels();
    level = levels[idx];
    resetPlayer();
    player.x = level.playerStart.x;
    player.y = level.playerStart.y;
    cameraX = 0;
    particles = [];
    activeEnemies = level.enemies.map(e => ({
        ...e, origX: e.x, origY: e.y, vx: e.speed, alive: true, frame: 0,
        vy: 0, onGround: true, jumpTimer: e.jumpInterval || 60,
        flyTimer: Math.random() * Math.PI * 2
    }));
    activeCoins = level.coins.map(c => ({ ...c, collected: false, bobTimer: Math.random() * Math.PI * 2 }));
}

// ==================== PARTICLES ====================
function spawnParticles(x, y, color, count, spread) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * spread,
            vy: (Math.random() - 0.5) * spread - 2,
            life: 30 + Math.random() * 20,
            maxLife: 50,
            color,
            size: 2 + Math.random() * 4
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

// ==================== COLLISION ====================
function rectCollide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ==================== PLAYER UPDATE ====================
function updatePlayer() {
    if (player.invincible > 0) player.invincible--;

    // Horizontal movement
    if (isLeft()) { player.vx = -player.speed; player.facing = -1; }
    else if (isRight()) { player.vx = player.speed; player.facing = 1; }
    else { player.vx *= 0.7; if (Math.abs(player.vx) < 0.1) player.vx = 0; }

    // Jump
    if (isJump() && player.onGround && !player.jumping) {
        player.vy = player.jumpForce;
        player.onGround = false;
        player.jumping = true;
        SoundManager.play('jump');
        spawnParticles(player.x + player.w / 2, player.y + player.h, '#fff', 5, 3);
    }
    if (!isJump()) player.jumping = false;

    // Gravity
    player.vy += player.gravity;
    if (player.vy > 12) player.vy = 12;

    // Move X
    player.x += player.vx;
    player.onGround = false;

    // Platform collision X
    level.platforms.forEach(p => {
        if (rectCollide(player, p)) {
            if (player.vx > 0) player.x = p.x - player.w;
            else if (player.vx < 0) player.x = p.x + p.w;
            player.vx = 0;
        }
    });

    // Move Y
    player.y += player.vy;

    // Platform collision Y
    level.platforms.forEach(p => {
        if (rectCollide(player, p)) {
            if (player.vy > 0) {
                player.y = p.y - player.h;
                player.vy = 0;
                player.onGround = true;
            } else if (player.vy < 0) {
                player.y = p.y + p.h;
                player.vy = 0;
            }
        }
    });

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > level.width - player.w) player.x = level.width - player.w;

    // Fall death
    if (player.y > H + 50) {
        playerDie();
    }

    // Animation
    player.frameTimer++;
    if (player.frameTimer > 6) {
        player.frame = (player.frame + 1) % 4;
        player.frameTimer = 0;
    }

    // Trail
    if (Math.abs(player.vx) > 1 || !player.onGround) {
        player.trail.push({ x: player.x, y: player.y, alpha: 0.5 });
        if (player.trail.length > 8) player.trail.shift();
    } else {
        if (player.trail.length > 0) player.trail.shift();
    }
    player.trail.forEach(t => t.alpha -= 0.05);

    // Spike collision
    if (level.spikes) {
        level.spikes.forEach(s => {
            const spikeRect = { x: s.x, y: s.y, w: s.w, h: 15 };
            if (rectCollide(player, spikeRect) && player.invincible <= 0) {
                playerDie();
            }
        });
    }

    // Enemy collision
    activeEnemies.forEach(e => {
        if (!e.alive) return;
        if (rectCollide(player, e)) {
            if (player.vy > 0 && player.y + player.h - e.y < 15) {
                if (footballMode && e.rollsToGoal) {
                    // Im Football Mode: Dieser spezifische Gegner rollt als Fußball ins Tor
                    e.alive = false;
                    e.rollingFootball = true;
                    e.rollVx = 3; // Rollgeschwindigkeit
                    player.vy = -8;
                    score += 100;
                    SoundManager.play('enemyHit');
                    screenShake = 5;
                } else {
                    e.alive = false;
                    player.vy = -8;
                    score += 100;
                    SoundManager.play('enemyHit');
                    if (footballMode) {
                        // Schwarz-weiße Partikel im Football Mode
                        for (let i = 0; i < 10; i++) {
                            const color = i % 2 === 0 ? '#000' : '#fff';
                            spawnParticles(e.x + e.w / 2, e.y + e.h / 2, color, 1, 5);
                        }
                    } else {
                        spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#ff4444', 10, 5);
                    }
                    screenShake = 5;
                }
            } else if (player.invincible <= 0) {
                playerHit();
            }
        }
    });

    // Coin collection
    activeCoins.forEach(c => {
        if (c.collected) return;
        const coinRect = { x: c.x - 8, y: c.y - 8, w: 16, h: 16 };
        if (rectCollide(player, coinRect)) {
            c.collected = true;
            score += 50;
            SoundManager.play('coin');
            spawnParticles(c.x, c.y, '#ffd700', 8, 4);
        }
    });

    // Goal
    if (level.goal && rectCollide(player, level.goal)) {
        gameState = STATE.LEVEL_COMPLETE;
        stateTimer = 120;
        SoundManager.play('levelComplete');
        if (footballMode) {
            SoundManager.play('ronaldo');
            siuuTimer = 90;
        }
        spawnParticles(level.goal.x + 20, level.goal.y + 30, '#00ff88', 20, 8);
    }

    // Camera
    const targetCam = player.x - W / 3;
    cameraX += (targetCam - cameraX) * 0.08;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > level.width - W) cameraX = level.width - W;
}

function playerHit() {
    lives--;
    player.invincible = 90;
    screenShake = 10;
    SoundManager.play('playerHit');
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff0000', 10, 6);
    if (lives <= 0) {
        gameState = STATE.DEAD;
        stateTimer = 120;
        SoundManager.play('death');
        footballMode = false;
    }
}

function playerDie() {
    lives--;
    screenShake = 10;
    SoundManager.play('playerHit');
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff0000', 15, 8);
    if (lives <= 0) {
        gameState = STATE.DEAD;
        stateTimer = 120;
        SoundManager.play('death');
        footballMode = false;
    } else {
        resetPlayer();
        player.x = level.playerStart.x;
        player.y = level.playerStart.y;
        player.invincible = 90;
    }
}

// ==================== ENEMIES ====================
function updateEnemies() {
    activeEnemies.forEach(e => {
        // Rollende Fußbälle im Football Mode
        if (e.rollingFootball) {
            e.x += e.rollVx;
            e.rollRotation = (e.rollRotation || 0) + 0.3;
            // Bleibt im Tor liegen
            if (level.goal && e.x >= level.goal.x) {
                e.rollingFootball = false;
                e.inGoal = true; // Ball liegt im Tor
                e.goalTimer = 90; // 1.5 Sekunden bei 60 FPS
                // SIUUU-Sound abspielen
                if (!e.goalSoundPlayed) {
                    SoundManager.play('ronaldo');
                    e.goalSoundPlayed = true;
                }
            } else if (e.x > level.width || e.x < -100) {
                e.rollingFootball = false;
            }
            return;
        }

        // Ball im Tor - Timer zählen
        if (e.inGoal) {
            if (e.goalTimer > 0) {
                e.goalTimer--;
                if (e.goalTimer <= 0) {
                    // Level geschafft!
                    gameState = STATE.LEVEL_COMPLETE;
                    stateTimer = 120;
                    SoundManager.play('levelComplete');
                    if (footballMode) {
                        SoundManager.play('ronaldo');
                        siuuTimer = 90;
                    }
                    spawnParticles(level.goal.x + 20, level.goal.y + 30, '#00ff88', 20, 8);
                }
            }
            return;
        }

        if (!e.alive) return;

        if (e.type === 'flyer') {
            // Fliegende Gegner: horizontale Bewegung + wellenförmige Vertikalbewegung
            e.x += e.vx;
            if (e.x <= e.minX || e.x + e.w >= e.maxX) e.vx *= -1;
            e.flyTimer += 0.04;
            e.y = e.origY + Math.sin(e.flyTimer) * (e.flyHeight || 50);
            e.frame = (e.frame + 0.1) % 2;
        } else if (e.type === 'jumper') {
            // Springende Gegner: horizontale Bewegung + regelmäßige Sprünge
            e.x += e.vx;
            if (e.x <= e.minX || e.x + e.w >= e.maxX) e.vx *= -1;

            // Schwerkraft
            e.vy += 0.5;
            e.y += e.vy;

            // Boden-Kollision (vereinfacht: bei origY bleiben)
            if (e.y >= e.origY) {
                e.y = e.origY;
                e.vy = 0;
                e.onGround = true;
            }

            // Spring-Timer
            if (e.onGround) {
                e.jumpTimer--;
                if (e.jumpTimer <= 0) {
                    e.vy = e.jumpForce || -10;
                    e.onGround = false;
                    e.jumpTimer = e.jumpInterval || 60;
                }
            }
            e.frame = (e.frame + 0.08) % 2;
        } else {
            // Walker: normale horizontale Bewegung
            e.x += e.vx;
            if (e.x <= e.minX || e.x + e.w >= e.maxX) e.vx *= -1;
            e.frame = (e.frame + 0.05) % 2;
        }
    });
}

// ==================== BOSS ====================
function updateBoss() {
    const boss = level.boss;
    if (!boss || boss.hp <= 0) return;

    if (boss.invincible > 0) boss.invincible--;
    if (boss.shakeTimer > 0) boss.shakeTimer--;

    // Phase transitions
    if (boss.hp <= boss.maxHp * 0.3 && boss.phase < 3) {
        boss.phase = 3;
        screenShake = 15;
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ff00ff', 30, 10);
    } else if (boss.hp <= boss.maxHp * 0.6 && boss.phase < 2) {
        boss.phase = 2;
        screenShake = 10;
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ff4400', 20, 8);
    }

    // Boss AI
    boss.attackTimer++;
    const attackInterval = boss.phase === 3 ? 40 : boss.phase === 2 ? 60 : 80;

    if (boss.attackTimer >= attackInterval) {
        boss.attackTimer = 0;
        boss.attackType = (boss.attackType + 1) % 3;
        SoundManager.play('bossAttack');

        if (boss.attackType === 0) {
            // Shoot projectiles toward player
            const dx = player.x - boss.x;
            const dy = player.y - boss.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = 4 + boss.phase;
            boss.projectiles.push({
                x: boss.x + boss.w / 2, y: boss.y + boss.h / 2,
                vx: (dx / dist) * speed, vy: (dy / dist) * speed,
                size: 8, life: 120
            });
            if (boss.phase >= 2) {
                boss.projectiles.push({
                    x: boss.x + boss.w / 2, y: boss.y + boss.h / 2,
                    vx: (dx / dist) * speed * 0.8, vy: (dy / dist) * speed * 0.8 - 2,
                    size: 6, life: 120
                });
            }
        } else if (boss.attackType === 1) {
            // Jump attack
            boss.vy = -12;
            boss.vx = player.x > boss.x ? 4 : -4;
        } else {
            // Ground slam - multiple projectiles
            for (let i = 0; i < (boss.phase + 2); i++) {
                boss.projectiles.push({
                    x: boss.x + boss.w / 2, y: boss.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: -4 - Math.random() * 4,
                    size: 6, life: 90
                });
            }
        }
    }

    // Boss physics
    boss.vy += 0.5;
    boss.x += boss.vx;
    boss.y += boss.vy;
    boss.vx *= 0.95;

    // Ground collision
    if (boss.y + boss.h > 480) {
        boss.y = 480 - boss.h;
        boss.vy = 0;
        if (boss.phase >= 2 && Math.abs(boss.vx) > 1) {
            screenShake = 5;
            for (let i = 0; i < 5; i++) {
                boss.projectiles.push({
                    x: boss.x + Math.random() * boss.w, y: 470,
                    vx: (Math.random() - 0.5) * 4, vy: -3 - Math.random() * 3,
                    size: 5, life: 60
                });
            }
        }
    }

    // Boundaries
    if (boss.x < 20) { boss.x = 20; boss.vx = Math.abs(boss.vx); }
    if (boss.x + boss.w > level.width - 20) { boss.x = level.width - 20 - boss.w; boss.vx = -Math.abs(boss.vx); }

    // Update projectiles
    for (let i = boss.projectiles.length - 1; i >= 0; i--) {
        const p = boss.projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0 || p.y > H + 20 || p.x < -20 || p.x > level.width + 20) {
            boss.projectiles.splice(i, 1);
            continue;
        }
        // Hit player
        const pRect = { x: p.x - p.size / 2, y: p.y - p.size / 2, w: p.size, h: p.size };
        if (rectCollide(player, pRect) && player.invincible <= 0) {
            playerHit();
            boss.projectiles.splice(i, 1);
        }
    }

    // Player stomp on boss
    if (rectCollide(player, boss) && player.invincible <= 0) {
        if (player.vy > 0 && player.y + player.h - boss.y < 20 && boss.invincible <= 0) {
            boss.hp--;
            boss.invincible = 30;
            boss.shakeTimer = 10;
            player.vy = -10;
            score += 200;
            screenShake = 8;
            SoundManager.play('bossHit');
            spawnParticles(boss.x + boss.w / 2, boss.y, '#ff00ff', 10, 6);
            if (boss.hp <= 0) {
                gameState = STATE.VICTORY;
                stateTimer = 180;
                SoundManager.play('victory');
                spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ffd700', 40, 12);
                spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ff00ff', 30, 10);
                screenShake = 20;
            }
        } else {
            playerHit();
        }
    }
}

// ==================== DRAWING ====================
function drawBackground(theme) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, theme.bg1);
    grad.addColorStop(1, theme.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Parallax stars/particles
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 50; i++) {
        const sx = ((i * 137 + 50) % W + cameraX * 0.1) % W;
        const sy = (i * 97 + 30) % (H - 100);
        ctx.fillRect(sx, sy, 2, 2);
    }

    // Parallax hills
    ctx.fillStyle = theme.bg2 + '88';
    for (let i = 0; i < 8; i++) {
        const mx = i * 200 - (cameraX * 0.2) % 200;
        const mh = 80 + (i * 47) % 60;
        ctx.beginPath();
        ctx.arc(mx + 100, H - 60, mh, Math.PI, 0);
        ctx.fill();
    }
}

function drawPlatforms(theme) {
    level.platforms.forEach(p => {
        const px = p.x - cameraX;
        if (px + p.w < -50 || px > W + 50) return;

        // Main platform
        ctx.fillStyle = theme.platform;
        ctx.fillRect(px, p.y, p.w, p.h);

        // Top highlight
        ctx.fillStyle = theme.accent;
        ctx.fillRect(px, p.y, p.w, 3);

        // Texture lines
        ctx.fillStyle = theme.groundDark + '44';
        for (let i = 0; i < p.w; i += 20) {
            ctx.fillRect(px + i, p.y + 5, 1, p.h - 5);
        }
    });
}

function drawSpikes(theme) {
    if (!level.spikes) return;
    level.spikes.forEach(s => {
        const sx = s.x - cameraX;
        if (sx + s.w < -50 || sx > W + 50) return;
        ctx.fillStyle = '#ff4444';
        for (let i = 0; i < s.w; i += 12) {
            ctx.beginPath();
            ctx.moveTo(sx + i, s.y + 15);
            ctx.lineTo(sx + i + 6, s.y);
            ctx.lineTo(sx + i + 12, s.y + 15);
            ctx.fill();
        }
    });
}

function drawPlayer() {
    if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) return;

    const px = player.x - cameraX;
    const py = player.y;

    // Trail
    player.trail.forEach(t => {
        if (t.alpha > 0) {
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.fillStyle = '#4fc3f7';
            ctx.fillRect(t.x - cameraX + 4, t.y + 4, player.w - 8, player.h - 8);
        }
    });
    ctx.globalAlpha = 1;

    // Body
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(px + 4, py + 8, player.w - 8, player.h - 8);

    // Head
    ctx.fillStyle = '#42a5f5';
    ctx.fillRect(px + 6, py, player.w - 12, 12);

    // Eyes
    ctx.fillStyle = '#fff';
    const eyeX = player.facing > 0 ? px + 16 : px + 8;
    ctx.fillRect(eyeX, py + 3, 5, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(player.facing > 0 ? eyeX + 2 : eyeX, py + 4, 3, 3);

    // Legs animation
    const legOffset = player.onGround ? Math.sin(player.frame * Math.PI / 2) * 3 : 2;
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(px + 6, py + player.h - 6, 6, 6 + legOffset);
    ctx.fillRect(px + player.w - 12, py + player.h - 6, 6, 6 - legOffset);

    // Jump squash/stretch
    if (!player.onGround) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(px + 2, py - 2, player.w - 4, 4);
    }
}

function drawEnemies() {
    activeEnemies.forEach(e => {
        // Ball im Tor zeichnen (liegt still)
        if (e.inGoal) {
            const ex = e.x - cameraX;
            if (ex + e.w < -50 || ex > W + 50) return;
            
            const cx = ex + e.w / 2;
            const cy = e.y + e.h / 2;
            const radius = e.w / 2;
            
            // Fußball-Bild zeichnen (ohne Rotation)
            if (footballImage.complete && footballImage.naturalWidth > 0) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(footballImage, -radius, -radius, radius * 2, radius * 2);
                ctx.restore();
            } else {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 3D-Effekt
            const shadowGradient = ctx.createRadialGradient(
                cx + radius * 0.5, cy + radius * 0.5, 0,
                cx, cy, radius
            );
            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
            shadowGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.3)');
            shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            
            const highlightGradient = ctx.createRadialGradient(
                cx - radius * 0.6, cy - radius * 0.6, 0,
                cx - radius * 0.6, cy - radius * 0.6, radius * 0.8
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            highlightGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = highlightGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            return;
        }

        // Rollende Fußbälle im Football Mode zeichnen
        if (e.rollingFootball) {
            const ex = e.x - cameraX;
            if (ex + e.w < -50 || ex > W + 50) return;
            
            const cx = ex + e.w / 2;
            const cy = e.y + e.h / 2;
            const radius = e.w / 2;
            
            // Fußball-Bild zeichnen (mit Rotation)
            if (footballImage.complete && footballImage.naturalWidth > 0) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(e.rollRotation || 0);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(footballImage, -radius, -radius, radius * 2, radius * 2);
                ctx.restore();
            } else {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 3D-Effekt
            const shadowGradient = ctx.createRadialGradient(
                cx + radius * 0.5, cy + radius * 0.5, 0,
                cx, cy, radius
            );
            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
            shadowGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.3)');
            shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            
            const highlightGradient = ctx.createRadialGradient(
                cx - radius * 0.6, cy - radius * 0.6, 0,
                cx - radius * 0.6, cy - radius * 0.6, radius * 0.8
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            highlightGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = highlightGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            
            return;
        }

        if (!e.alive) return;
        const ex = e.x - cameraX;
        if (ex + e.w < -50 || ex > W + 50) return;

        // Football Mode: Alle Gegner als 3D-Fußbälle zeichnen
        if (footballMode) {
            const cx = ex + e.w / 2;
            const cy = e.y + e.h / 2;
            const radius = e.w / 2;

            // Rotation für rollenden Effekt
            // Walker: immer rollen (langsamer)
            // Jumper: nur rollen wenn auf dem Boden
            // Flyer: nie rollen
            let rotation = 0;
            if (e.type === 'walker') {
                rotation = (Date.now() / 500 + e.x) % (Math.PI * 2);
            } else if (e.type === 'jumper' && e.onGround) {
                rotation = (Date.now() / 500 + e.x) % (Math.PI * 2);
            }
            
            // Fußball-Bild zeichnen (mit Kreis-Clip und Rotation)
            if (footballImage.complete && footballImage.naturalWidth > 0) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(rotation);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.clip();
                
                // Bild auf Ball-Größe zeichnen (zentriert)
                ctx.drawImage(footballImage, -radius, -radius, radius * 2, radius * 2);
                ctx.restore();
            } else {
                // Fallback: Weißer Kreis wenn Bild noch nicht geladen
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 3D-Kugel-Effekt mit starkem Licht/Schatten
            // Haupt-Schatten (dunkel unten rechts)
            const shadowGradient = ctx.createRadialGradient(
                cx + radius * 0.5, cy + radius * 0.5, 0,
                cx, cy, radius
            );
            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
            shadowGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.3)');
            shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Haupt-Highlight (sehr hell oben links)
            const highlightGradient = ctx.createRadialGradient(
                cx - radius * 0.6, cy - radius * 0.6, 0,
                cx - radius * 0.6, cy - radius * 0.6, radius * 0.8
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            highlightGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = highlightGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Sekundäres Highlight (kleiner, intensiver)
            const smallHighlight = ctx.createRadialGradient(
                cx - radius * 0.4, cy - radius * 0.4, 0,
                cx - radius * 0.4, cy - radius * 0.4, radius * 0.3
            );
            smallHighlight.addColorStop(0, 'rgba(255, 255, 255, 1)');
            smallHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = smallHighlight;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            
            return;
        }

        if (e.type === 'flyer') {
            // Fliegender Gegner: rund mit Flügeln
            const cx = ex + e.w / 2;
            const cy = e.y + e.h / 2;

            // Körper (rund)
            ctx.fillStyle = '#9c27b0';
            ctx.beginPath();
            ctx.arc(cx, cy, e.w / 2, 0, Math.PI * 2);
            ctx.fill();

            // Flügel
            const wingOffset = Math.sin(Date.now() / 80) * 6;
            ctx.fillStyle = '#ba68c8';
            ctx.beginPath();
            ctx.ellipse(cx - e.w / 2 - 4, cy - wingOffset, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + e.w / 2 + 4, cy - wingOffset, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Augen
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx - 5, cy - 2, 4, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy - 2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(cx - 4, cy - 1, 2, 0, Math.PI * 2);
            ctx.arc(cx + 6, cy - 1, 2, 0, Math.PI * 2);
            ctx.fill();

        } else if (e.type === 'jumper') {
            // Springender Gegner: gedrungen ohne Stacheln
            const squash = e.onGround ? 1 : (e.vy < 0 ? 0.85 : 1.15);
            const stretch = e.onGround ? 1 : (e.vy < 0 ? 1.2 : 0.85);

            ctx.save();
            ctx.translate(ex + e.w / 2, e.y + e.h);
            ctx.scale(squash, stretch);

            // Körper
            ctx.fillStyle = '#ff9800';
            ctx.fillRect(-e.w / 2 + 2, -e.h + 4, e.w - 4, e.h - 4);

            // Augen
            ctx.fillStyle = '#fff';
            ctx.fillRect(-e.w / 2 + 6, -e.h + 10, 6, 6);
            ctx.fillRect(e.w / 2 - 12, -e.h + 10, 6, 6);
            ctx.fillStyle = '#000';
            ctx.fillRect(-e.w / 2 + 8, -e.h + 12, 3, 3);
            ctx.fillRect(e.w / 2 - 10, -e.h + 12, 3, 3);

            // Beine (gedrungen wenn am Boden)
            if (e.onGround) {
                ctx.fillStyle = '#e65100';
                ctx.fillRect(-e.w / 2 + 4, -4, 8, 4);
                ctx.fillRect(e.w / 2 - 12, -4, 8, 4);
            }

            ctx.restore();

        } else {
            // Walker: Standard-Gegner ohne Stacheln
            // Body
            ctx.fillStyle = '#e53935';
            ctx.fillRect(ex + 2, e.y + 4, e.w - 4, e.h - 4);

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(ex + 6, e.y + 10, 6, 6);
            ctx.fillRect(ex + e.w - 12, e.y + 10, 6, 6);
            ctx.fillStyle = '#000';
            ctx.fillRect(ex + 8, e.y + 12, 3, 3);
            ctx.fillRect(ex + e.w - 10, e.y + 12, 3, 3);
        }
    });
}

function drawCoins() {
    activeCoins.forEach(c => {
        if (c.collected) return;
        const cx = c.x - cameraX;
        if (cx < -20 || cx > W + 20) return;
        c.bobTimer += 0.05;
        const bob = Math.sin(c.bobTimer) * 3;

        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx, c.y + bob, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(cx - 2, c.y + bob - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGoal() {
    if (!level.goal) return;
    const g = level.goal;
    const gx = g.x - cameraX;

    if (footballMode) {
        // Fußballtor von der Seite gesehen (wie Jugendtor)
        const goalHeight = 90;
        const goalX = gx + 10;
        const goalY = g.y + g.h - goalHeight;
        const depth = 45; // Tiefe des Tors
        const backHeight = goalHeight * 0.7; // Hintere Höhe ist niedriger

        // Torpfosten (silber/grau) - vorderer Pfosten
        const postGradient = ctx.createLinearGradient(goalX, 0, goalX + 8, 0);
        postGradient.addColorStop(0, '#c0c0c0');
        postGradient.addColorStop(0.5, '#e8e8e8');
        postGradient.addColorStop(1, '#a0a0a0');
        ctx.fillStyle = postGradient;
        ctx.fillRect(goalX, goalY, 8, goalHeight);
        
        // Hinterer Pfosten (kleiner, weiter hinten)
        const backPostX = goalX + depth - 6;
        ctx.fillRect(backPostX, goalY + (goalHeight - backHeight), 6, backHeight);
        
        // Obere Querlatte (verbindet vorne und hinten)
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(goalX + 4, goalY);
        ctx.lineTo(backPostX + 3, goalY + (goalHeight - backHeight));
        ctx.stroke();
        
        // Untere Querlatte
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(goalX + 4, goalY + goalHeight);
        ctx.lineTo(backPostX + 3, goalY + goalHeight);
        ctx.stroke();
        
        // Netz (weißes Gitter)
        ctx.strokeStyle = 'rgba(220, 220, 220, 0.8)';
        ctx.lineWidth = 1;
        
        // Vertikale Netzlinien (bleiben zwischen den Pfosten)
        const netLines = 10;
        for (let i = 1; i < netLines; i++) {
            const progress = i / netLines;
            const x = goalX + 8 + progress * (depth - 14);
            // Obere Grenze folgt der diagonalen Querlatte
            const topY = goalY + progress * (goalHeight - backHeight);
            const bottomY = goalY + goalHeight;
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.stroke();
        }
        
        // Horizontale Netzlinien (bleiben im Torrahmen)
        const horizontalLines = 7;
        for (let i = 1; i < horizontalLines; i++) {
            const progress = i / horizontalLines;
            // Starte unterhalb der diagonalen Querlatte
            const y = goalY + (goalHeight - backHeight) + progress * backHeight;
            const leftX = goalX + 8;
            const rightX = goalX + depth - 6;
            ctx.beginPath();
            ctx.moveTo(leftX, y);
            ctx.lineTo(rightX, y);
            ctx.stroke();
        }
        
        // Seitliches Netz (rechte Seite, bleibt im Rahmen)
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        for (let i = 1; i < 5; i++) {
            const progress = i / 5;
            const y = goalY + (goalHeight - backHeight) + progress * backHeight;
            ctx.beginPath();
            ctx.moveTo(goalX + depth - 6, y);
            ctx.lineTo(goalX + depth, y);
            ctx.stroke();
        }
    } else {
        // Normale Flagge
        // Flag pole
        ctx.fillStyle = '#888';
        ctx.fillRect(gx + 18, g.y, 4, g.h);

        // Flag
        const wave = Math.sin(Date.now() / 200) * 3;
        ctx.fillStyle = '#00e676';
        ctx.beginPath();
        ctx.moveTo(gx + 22, g.y + 5);
        ctx.lineTo(gx + 45 + wave, g.y + 15);
        ctx.lineTo(gx + 22, g.y + 25);
        ctx.fill();
    }
}

function drawBoss() {
    const boss = level.boss;
    if (!boss || boss.hp <= 0) return;

    const bx = boss.x - cameraX + (boss.shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0);
    const by = boss.y;

    // Aura
    const auraSize = 60 + Math.sin(Date.now() / 200) * 10;
    const auraColors = ['rgba(156, 39, 176, 0.15)', 'rgba(233, 30, 99, 0.1)', 'rgba(255, 0, 0, 0.05)'];
    auraColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(bx + boss.w / 2, by + boss.h / 2, auraSize + i * 15, 0, Math.PI * 2);
        ctx.fill();
    });

    // Body
    const bodyColor = boss.invincible > 0 && Math.floor(boss.invincible / 3) % 2 === 0 ? '#fff' :
        boss.phase === 3 ? '#d50000' : boss.phase === 2 ? '#e65100' : '#4a148c';
    ctx.fillStyle = bodyColor;
    ctx.fillRect(bx + 10, by + 20, boss.w - 20, boss.h - 20);

    // Head
    ctx.fillStyle = boss.phase === 3 ? '#ff1744' : boss.phase === 2 ? '#ff6d00' : '#7b1fa2';
    ctx.fillRect(bx + 5, by, boss.w - 10, 30);

    // Horns
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(bx + 5, by + 5);
    ctx.lineTo(bx - 10, by - 20);
    ctx.lineTo(bx + 15, by + 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + boss.w - 5, by + 5);
    ctx.lineTo(bx + boss.w + 10, by - 20);
    ctx.lineTo(bx + boss.w - 15, by + 5);
    ctx.fill();

    // Eyes
    ctx.fillStyle = boss.phase === 3 ? '#ff0000' : '#ffeb3b';
    ctx.fillRect(bx + 18, by + 8, 12, 10);
    ctx.fillRect(bx + boss.w - 30, by + 8, 12, 10);
    ctx.fillStyle = '#000';
    const eyeDir = player.x > boss.x ? 4 : 0;
    ctx.fillRect(bx + 18 + eyeDir, by + 10, 6, 6);
    ctx.fillRect(bx + boss.w - 30 + eyeDir, by + 10, 6, 6);

    // Mouth
    ctx.fillStyle = '#000';
    ctx.fillRect(bx + 25, by + 22, boss.w - 50, 5);
    if (boss.phase >= 2) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(bx + 28, by + 22, boss.w - 56, 3);
    }

    // HP Bar
    const hpBarW = 200;
    const hpBarH = 12;
    const hpBarX = W / 2 - hpBarW / 2;
    const hpBarY = 20;
    ctx.fillStyle = '#333';
    ctx.fillRect(hpBarX - 2, hpBarY - 2, hpBarW + 4, hpBarH + 4);
    ctx.fillStyle = '#600';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    const hpRatio = boss.hp / boss.maxHp;
    const hpColor = hpRatio > 0.5 ? '#e040fb' : hpRatio > 0.25 ? '#ff6d00' : '#ff1744';
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);

    // Boss name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCHATTENLORD', W / 2, hpBarY + hpBarH + 18);
    ctx.textAlign = 'left';

    // Projectiles
    boss.projectiles.forEach(p => {
        const px = p.x - cameraX;
        ctx.fillStyle = boss.phase === 3 ? '#ff1744' : '#e040fb';
        ctx.beginPath();
        ctx.arc(px, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawHUD() {
    // Lives
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Leben: ', 15, 30);
    for (let i = 0; i < lives; i++) {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(85 + i * 22, 18, 16, 16);
        ctx.fillStyle = '#ff8a80';
        ctx.fillRect(87 + i * 22, 20, 6, 6);
    }

    // Score
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Punkte: ' + score, 15, 55);

    // Level
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    const theme = THEMES[currentLevel];
    ctx.fillText('Level ' + (currentLevel + 1) + ' - ' + theme.name, W - 250, 30);

    // SIUUU! Text im Football Mode
    if (siuuTimer > 0) {
        const alpha = Math.min(1, siuuTimer / 30);
        const scale = 1 + (90 - siuuTimer) * 0.02;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.font = `bold ${Math.floor(48 * scale)}px monospace`;
        ctx.textAlign = 'center';
        ctx.strokeText('SIUUU!', W / 2, H / 2 - 50);
        ctx.fillText('SIUUU!', W / 2, H / 2 - 50);
        ctx.restore();
        ctx.textAlign = 'left';
    }
}

// ==================== SCREENS ====================
function drawMenu() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Animated background
    const t = Date.now() / 1000;
    for (let i = 0; i < 30; i++) {
        const x = (Math.sin(t + i * 0.5) * 0.5 + 0.5) * W;
        const y = (Math.cos(t * 0.7 + i * 0.3) * 0.5 + 0.5) * H;
        ctx.fillStyle = `rgba(100, 50, 200, ${0.05 + Math.sin(t + i) * 0.03})`;
        ctx.beginPath();
        ctx.arc(x, y, 30 + Math.sin(t + i) * 10, 0, Math.PI * 2);
        ctx.fill();
    }

    // Title
    ctx.fillStyle = '#0d47a1';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW RUNNER', W / 2, 140);

    // Subtitle
    ctx.fillStyle = '#aaa';
    ctx.font = '18px monospace';
    ctx.fillText('Ein Jump & Run Abenteuer', W / 2, 180);

    // Menu options
    const menuItems = ['Spielen', 'Soundeinstellungen', 'Code eingeben'];
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

    ctx.textAlign = 'left';
}

function drawSoundSettings() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#0d47a1';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SOUNDEINSTELLUNGEN', W / 2, 80);

    // Sound categories
    const categories = [
        { key: 'sfx', name: 'Effekte (Gesamt)' },
        { key: 'jump', name: 'Springen' },
        { key: 'coin', name: 'Münzen' },
        { key: 'combat', name: 'Kampf' },
        { key: 'damage', name: 'Schaden' }
    ];

    ctx.font = '20px monospace';
    categories.forEach((cat, i) => {
        const y = 160 + i * 60;
        const value = soundSettings[cat.key];

        // Selection highlight
        if (i === soundMenuSelection) {
            ctx.fillStyle = '#333';
            ctx.fillRect(W / 2 - 200, y - 25, 400, 45);
            ctx.fillStyle = '#e040fb';
        } else {
            ctx.fillStyle = '#aaa';
        }

        // Category name
        ctx.textAlign = 'left';
        ctx.fillText(cat.name, W / 2 - 180, y);

        // Volume bar
        ctx.fillStyle = '#444';
        ctx.fillRect(W / 2 + 60, y - 15, 120, 20);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(W / 2 + 60, y - 15, 120 * value, 20);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(W / 2 + 60, y - 15, 120, 20);

        // Percentage
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(value * 100) + '%', W / 2 + 220, y);
        ctx.font = '20px monospace';
    });

    // Instructions
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pfeiltasten: Auswählen | Links/Rechts: Lautstärke | ESC: Zurück', W / 2, 500);

    ctx.textAlign = 'left';
}

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

    // Instructions
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.fillText('Pfeiltasten: Auswählen | ENTER / E / LEERTASTE: Bestätigen | ESC: Zurück', W / 2, 480);

    ctx.textAlign = 'left';
}

function drawCodeMenu() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#0d47a1';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CODE EINGABE', W / 2, 120);

    // Code input field
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - 200, 220, 400, 60);
    ctx.strokeStyle = '#e040fb';
    ctx.lineWidth = 3;
    ctx.strokeRect(W / 2 - 200, 220, 400, 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = '28px monospace';
    ctx.fillText(codeInput + (Math.sin(Date.now() / 200) > 0 ? '|' : ''), W / 2, 258);

    // Instructions
    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.fillText('Tippe den Code ein und drücke ENTER', W / 2, 330);
    ctx.fillText('ESC: Zurück zum Hauptmenü', W / 2, 360);

    ctx.textAlign = 'left';
}

function drawDeadScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 40);
    ctx.restore();

    ctx.fillStyle = '#ffd700';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Punkte: ' + score, W / 2, H / 2 + 30);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    const blink = Math.sin(Date.now() / 300) > 0;
    if (blink) ctx.fillText('Drücke R für Neustart', W / 2, H / 2 + 60);
    ctx.textAlign = 'left';
}

function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL ' + (currentLevel + 1) + ' GESCHAFFT!', W / 2, H / 2 - 30);

    ctx.fillStyle = '#ffd700';
    ctx.font = '20px monospace';
    ctx.fillText('Punkte: ' + score, W / 2, H / 2 + 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    ctx.fillText('Nächstes Level startet...', W / 2, H / 2 + 60);
    ctx.textAlign = 'left';
}

function drawVictoryScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    const t = Date.now() / 1000;

    // Fireworks
    for (let i = 0; i < 10; i++) {
        const fx = (Math.sin(t * 2 + i * 1.5) * 0.5 + 0.5) * W;
        const fy = (Math.cos(t * 1.5 + i) * 0.3 + 0.3) * H;
        const colors = ['#ff1744', '#ffd700', '#00e676', '#2979ff', '#e040fb'];
        ctx.fillStyle = colors[i % colors.length];
        for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2 + t;
            const dist = 20 + Math.sin(t * 3 + i) * 10;
            ctx.beginPath();
            ctx.arc(fx + Math.cos(angle) * dist, fy + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SIEG!', W / 2, H / 2 - 60);

    ctx.fillStyle = '#e040fb';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('Der Schattenlord ist besiegt!', W / 2, H / 2 - 10);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText('Endpunkte: ' + score, W / 2, H / 2 + 40);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    const blink = Math.sin(Date.now() / 300) > 0;
    if (blink) ctx.fillText('Drücke R für Neustart', W / 2, H / 2 + 90);
    ctx.textAlign = 'left';
}

function drawBossIntro() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    const progress = 1 - (bossIntroTimer / 120);

    ctx.fillStyle = '#e040fb';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';

    if (progress < 0.3) {
        ctx.fillText('LEVEL 4 - DAS SCHATTENREICH', W / 2, H / 2 - 20);
    } else if (progress < 0.7) {
        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 48px monospace';
        ctx.fillText('BOSSKAMPF', W / 2, H / 2 - 20);
        ctx.fillStyle = '#e040fb';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('SCHATTENLORD', W / 2, H / 2 + 30);
    } else {
        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('Springe auf seinen Kopf!', W / 2, H / 2);
        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.fillText('Weiche seinen Angriffen aus!', W / 2, H / 2 + 35);
    }

    ctx.textAlign = 'left';
}

// ==================== MAIN LOOP ====================
function update() {
    switch (gameState) {
        case STATE.MENU:
            if (keys['ArrowUp'] || keys['KeyW']) {
                mainMenuSelection = Math.max(0, mainMenuSelection - 1);
                SoundManager.play('menuSelect');
                keys['ArrowUp'] = false;
                keys['KeyW'] = false;
            }
            if (keys['ArrowDown'] || keys['KeyS']) {
                mainMenuSelection = Math.min(2, mainMenuSelection + 1);
                SoundManager.play('menuSelect');
                keys['ArrowDown'] = false;
                keys['KeyS'] = false;
            }
            if (keys['Enter'] || keys['Space'] || keys['KeyE']) {
                if (mainMenuSelection === 0) {
                    gameState = STATE.PLAYING;
                    currentLevel = 0;
                    score = 0;
                    lives = 3;
                    loadLevel(0);
                    SoundManager.play('menuSelect');
                } else if (mainMenuSelection === 1) {
                    previousState = STATE.MENU;
                    gameState = STATE.SOUND_SETTINGS;
                    soundMenuSelection = 0;
                    SoundManager.play('menuSelect');
                } else if (mainMenuSelection === 2) {
                    previousState = STATE.MENU;
                    gameState = STATE.CODE_MENU;
                    codeInput = '';
                    SoundManager.play('menuSelect');
                }
                keys['Enter'] = false;
                keys['Space'] = false;
                keys['KeyE'] = false;
            }
            break;

        case STATE.SOUND_SETTINGS:
            const soundKeys = ['sfx', 'jump', 'coin', 'combat', 'damage'];
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
            if (keys['ArrowRight'] || keys['KeyD']) {
                soundSettings[soundKeys[soundMenuSelection]] = Math.min(1, soundSettings[soundKeys[soundMenuSelection]] + 0.1);
                saveSoundSettings();
                keys['ArrowRight'] = false;
                keys['KeyD'] = false;
            }
            if (keys['ArrowLeft'] || keys['KeyA']) {
                soundSettings[soundKeys[soundMenuSelection]] = Math.max(0, soundSettings[soundKeys[soundMenuSelection]] - 0.1);
                saveSoundSettings();
                keys['ArrowLeft'] = false;
                keys['KeyA'] = false;
            }
            if (keys['Escape']) {
                gameState = previousState;
                SoundManager.play('menuSelect');
                keys['Escape'] = false;
            }
            break;

        case STATE.CODE_MENU:
            if (keys['Enter']) {
                if (codeInput === '4867/boss') {
                    currentLevel = 3;
                    score = 0;
                    lives = 3;
                    loadLevel(3);
                    gameState = STATE.BOSS_INTRO;
                    bossIntroTimer = 120;
                    SoundManager.play('menuSelect');
                } else if (codeInput === '4867/first') {
                    currentLevel = 0;
                    score = 0;
                    lives = 3;
                    loadLevel(0);
                    gameState = STATE.PLAYING;
                    SoundManager.play('menuSelect');
                } else if (codeInput === '4867/secound') {
                    currentLevel = 1;
                    score = 0;
                    lives = 3;
                    loadLevel(1);
                    gameState = STATE.PLAYING;
                    SoundManager.play('menuSelect');
                } else if (codeInput === '4867/third') {
                    currentLevel = 2;
                    score = 0;
                    lives = 3;
                    loadLevel(2);
                    gameState = STATE.PLAYING;
                    SoundManager.play('menuSelect');
                } else if (codeInput === '_5646') {
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
                SoundManager.play('menuSelect');
                keys['Escape'] = false;
            }
            break;

        case STATE.PAUSE:
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
            if (keys['Enter'] || keys['Space'] || keys['KeyE']) {
                if (pauseMenuSelection === 0) {
                    gameState = STATE.PLAYING;
                    SoundManager.play('menuSelect');
                } else if (pauseMenuSelection === 1) {
                    previousState = STATE.PAUSE;
                    gameState = STATE.SOUND_SETTINGS;
                    soundMenuSelection = 0;
                    SoundManager.play('menuSelect');
                } else if (pauseMenuSelection === 2) {
                    gameState = STATE.MENU;
                    mainMenuSelection = 0;
                    SoundManager.play('menuSelect');
                }
                keys['Enter'] = false;
                keys['Space'] = false;
                keys['KeyE'] = false;
            }
            if (keys['Escape']) {
                gameState = STATE.PLAYING;
                SoundManager.play('menuSelect');
                keys['Escape'] = false;
            }
            break;

        case STATE.PLAYING:
            if (keys['Escape']) {
                gameState = STATE.PAUSE;
                pauseMenuSelection = 0;
                SoundManager.play('menuSelect');
                keys['Escape'] = false;
            } else {
                updatePlayer();
                updateEnemies();
                if (level.boss) updateBoss();
                updateParticles();
                if (screenShake > 0) screenShake--;
                if (siuuTimer > 0) siuuTimer--;
            }
            break;

        case STATE.BOSS_INTRO:
            bossIntroTimer--;
            if (bossIntroTimer <= 0) {
                gameState = STATE.PLAYING;
            }
            break;

        case STATE.DEAD:
            stateTimer--;
            screenShake = 0;
            updateParticles();
            if ((keys['KeyR'] || stateTimer <= 0) && keys['KeyR']) {
                gameState = STATE.MENU;
                keys['KeyR'] = false;
            }
            break;

        case STATE.LEVEL_COMPLETE:
            stateTimer--;
            updateParticles();
            if (siuuTimer > 0) siuuTimer--;
            if (stateTimer <= 0) {
                currentLevel++;
                if (currentLevel >= levels.length) {
                    gameState = STATE.VICTORY;
                    stateTimer = 180;
                } else {
                    loadLevel(currentLevel);
                    if (currentLevel === 3) {
                        gameState = STATE.BOSS_INTRO;
                        bossIntroTimer = 120;
                    } else {
                        gameState = STATE.PLAYING;
                    }
                }
            }
            break;

        case STATE.VICTORY:
            updateParticles();
            if (keys['KeyR']) {
                gameState = STATE.MENU;
                keys['KeyR'] = false;
            }
            break;
    }
}

function draw() {
    ctx.save();

    // Glattere Textdarstellung
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Screen shake
    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake * 2, (Math.random() - 0.5) * screenShake * 2);
    }

    switch (gameState) {
        case STATE.MENU:
            drawMenu();
            break;

        case STATE.SOUND_SETTINGS:
            drawSoundSettings();
            break;

        case STATE.CODE_MENU:
            drawCodeMenu();
            break;

        case STATE.PLAYING:
        case STATE.BOSS_INTRO:
            const theme = THEMES[currentLevel];
            drawBackground(theme);
            drawPlatforms(theme);
            drawSpikes(theme);
            drawCoins();
            drawGoal();
            drawEnemies();
            drawPlayer();
            if (level.boss) drawBoss();
            drawParticles();
            drawHUD();
            if (gameState === STATE.BOSS_INTRO) drawBossIntro();
            break;

        case STATE.PAUSE:
            const pauseTheme = THEMES[currentLevel];
            drawBackground(pauseTheme);
            drawPlatforms(pauseTheme);
            drawSpikes(pauseTheme);
            drawCoins();
            drawGoal();
            drawEnemies();
            drawPlayer();
            if (level.boss) drawBoss();
            drawParticles();
            drawHUD();
            drawPauseMenu();
            break;

        case STATE.DEAD:
            const deadTheme = THEMES[currentLevel];
            drawBackground(deadTheme);
            drawPlatforms(deadTheme);
            drawParticles();
            drawDeadScreen();
            break;

        case STATE.LEVEL_COMPLETE:
            const lcTheme = THEMES[currentLevel];
            drawBackground(lcTheme);
            drawPlatforms(lcTheme);
            drawParticles();
            drawLevelComplete();
            break;

        case STATE.VICTORY:
            drawVictoryScreen();
            drawParticles();
            break;
    }

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
