const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ==================== INPUT ====================
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.code] = false; e.preventDefault(); });

function isLeft() { return keys['ArrowLeft'] || keys['KeyA']; }
function isRight() { return keys['ArrowRight'] || keys['KeyD']; }
function isJump() { return keys['ArrowUp'] || keys['KeyW'] || keys['Space']; }

// ==================== GAME STATE ====================
const STATE = { MENU: 0, PLAYING: 1, DEAD: 2, LEVEL_COMPLETE: 3, VICTORY: 4, BOSS_INTRO: 5 };
let gameState = STATE.MENU;
let currentLevel = 0;
let score = 0;
let lives = 3;
let stateTimer = 0;
let cameraX = 0;
let particles = [];
let screenShake = 0;
let bossIntroTimer = 0;

// ==================== COLORS / THEME ====================
const THEMES = [
    { bg1: '#1a1a2e', bg2: '#16213e', ground: '#2d6a4f', groundDark: '#1b4332', platform: '#40916c', accent: '#52b788', sky: '#0f4c75', name: 'Grüne Wiesen' },
    { bg1: '#1a1a2e', bg2: '#0d1b2a', ground: '#4a4e69', groundDark: '#22223b', platform: '#6c757d', accent: '#9a8c98', sky: '#1b263b', name: 'Dunkle Höhle' },
    { bg1: '#ffbe0b', bg2: '#fb5607', ground: '#3a86ff', groundDark: '#2667cc', platform: '#8338ec', accent: '#ff006e', sky: '#ffbe0b', name: 'Himmelsfestung' },
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
                { x: 2850, y: 465, w: 50 },
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
                { x: 100, y: 465, w: 40 },  // auf Plattform (x=0-200)
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
                e.alive = false;
                player.vy = -8;
                score += 100;
                spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#ff4444', 10, 5);
                screenShake = 5;
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
            spawnParticles(c.x, c.y, '#ffd700', 8, 4);
        }
    });

    // Goal
    if (level.goal && rectCollide(player, level.goal)) {
        gameState = STATE.LEVEL_COMPLETE;
        stateTimer = 120;
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
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff0000', 10, 6);
    if (lives <= 0) {
        gameState = STATE.DEAD;
        stateTimer = 120;
    }
}

function playerDie() {
    lives--;
    screenShake = 10;
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff0000', 15, 8);
    if (lives <= 0) {
        gameState = STATE.DEAD;
        stateTimer = 120;
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
            spawnParticles(boss.x + boss.w / 2, boss.y, '#ff00ff', 10, 6);
            if (boss.hp <= 0) {
                gameState = STATE.VICTORY;
                stateTimer = 180;
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

    // Parallax mountains/shapes
    ctx.fillStyle = theme.bg2 + '88';
    for (let i = 0; i < 8; i++) {
        const mx = i * 200 - (cameraX * 0.2) % 200;
        const mh = 80 + (i * 47) % 60;
        ctx.beginPath();
        ctx.moveTo(mx, H - 60);
        ctx.lineTo(mx + 100, H - 60 - mh);
        ctx.lineTo(mx + 200, H - 60);
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
        if (!e.alive) return;
        const ex = e.x - cameraX;
        if (ex + e.w < -50 || ex > W + 50) return;

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

    // Glow
    ctx.fillStyle = 'rgba(0, 230, 118, 0.1)';
    ctx.beginPath();
    ctx.arc(gx + 20, g.y + 30, 30 + Math.sin(Date.now() / 300) * 5, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.fillStyle = '#e040fb';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW RUNNER', W / 2, 160);

    ctx.fillStyle = '#7c4dff';
    ctx.font = 'bold 58px monospace';
    ctx.fillText('SHADOW RUNNER', W / 2 + 2, 162);

    // Subtitle
    ctx.fillStyle = '#aaa';
    ctx.font = '18px monospace';
    ctx.fillText('Ein Jump & Run Abenteuer', W / 2, 200);

    // Instructions
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    const blink = Math.sin(Date.now() / 300) > 0;
    if (blink) ctx.fillText('Drücke ENTER zum Starten', W / 2, 320);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('Pfeiltasten / WASD: Bewegen', W / 2, 380);
    ctx.fillText('Leertaste / W / Up: Springen', W / 2, 405);
    ctx.fillText('Besiege den Schattenlord im finalen Bosskampf!', W / 2, 440);

    // Player preview
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(W / 2 - 14, 250, 28, 36);
    ctx.fillStyle = '#42a5f5';
    ctx.fillRect(W / 2 - 10, 242, 20, 12);
    ctx.fillStyle = '#fff';
    ctx.fillRect(W / 2 + 2, 245, 5, 5);

    ctx.textAlign = 'left';
}

function drawDeadScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 40);

    ctx.fillStyle = '#ffd700';
    ctx.font = '20px monospace';
    ctx.fillText('Punkte: ' + score, W / 2, H / 2 + 10);

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
            if (keys['Enter'] || keys['Space']) {
                gameState = STATE.PLAYING;
                currentLevel = 0;
                score = 0;
                lives = 3;
                loadLevel(0);
                keys['Enter'] = false;
                keys['Space'] = false;
            }
            break;

        case STATE.PLAYING:
            updatePlayer();
            updateEnemies();
            if (level.boss) updateBoss();
            updateParticles();
            if (screenShake > 0) screenShake--;
            break;

        case STATE.BOSS_INTRO:
            bossIntroTimer--;
            if (bossIntroTimer <= 0) {
                gameState = STATE.PLAYING;
            }
            break;

        case STATE.DEAD:
            stateTimer--;
            updateParticles();
            if ((keys['KeyR'] || stateTimer <= 0) && keys['KeyR']) {
                gameState = STATE.MENU;
                keys['KeyR'] = false;
            }
            break;

        case STATE.LEVEL_COMPLETE:
            stateTimer--;
            updateParticles();
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

    // Screen shake
    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake * 2, (Math.random() - 0.5) * screenShake * 2);
    }

    switch (gameState) {
        case STATE.MENU:
            drawMenu();
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
