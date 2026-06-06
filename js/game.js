const TILE_SIZE = 32;
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 590;
const GRAVITY = 0.6;
const MAX_FALL_SPEED = 15;

const TILES = {
    EMPTY: 0,
    GROUND: 1,
    BRICK: 2,
    QUESTION: 3,
    PIPE: 4,
    FLAG: 5,
    CASTLE: 6,
    CLOUD: 7,
    HILL: 8,
    BUSH: 9
};

let game = {
    canvas: null,
    ctx: null,
    running: false,
    paused: false,
    currentLevel: 1,
    score: 0,
    lives: 3,
    coins: 0,
    gems: 0,
    levelCoins: 0,
    levelGems: 0,
    camera: { x: 0, y: 0 },
    keys: {},
    player: null,
    enemies: [],
    collectibles: [],
    particles: [],
    boss: null,
    levelData: null,
    levelWidth: 0,
    levelHeight: 0,
    tileMap: [],
    spawnX: 100,
    spawnY: 200
};

function initGame() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = CANVAS_WIDTH;
    game.canvas.height = CANVAS_HEIGHT;
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    generateLevelButtons();
    checkUrlLevelData();
}

function checkUrlLevelData() {
    const urlParams = new URLSearchParams(window.location.search);
    const levelData = urlParams.get('level');
    if (levelData) {
        try {
            const jsonStr = decodeURIComponent(atob(levelData));
            const data = JSON.parse(jsonStr);
            if (data.tileMap && data.width && data.height) {
                setTimeout(() => {
                    if (confirm('检测到分享的关卡，是否导入到编辑器？')) {
                        showEditor();
                        editor.width = data.width;
                        editor.height = data.height;
                        editor.tileMap = data.tileMap;
                        editor.enemies = data.enemies || [];
                        editor.collectibles = data.collectibles || [];
                        editor.cameraX = 0;
                        renderEditor();
                    }
                }, 500);
            }
        } catch (e) {
            console.error('Failed to load level from URL:', e);
        }
    }
}

function handleKeyDown(e) {
    game.keys[e.code] = true;
    if (e.code === 'Space') {
        e.preventDefault();
        if (game.player && game.player.onGround && !game.player.jumpPressed) {
            game.player.jumpPressed = true;
            game.player.jumpHoldTime = 0;
            game.player.vy = -12;
            game.player.onGround = false;
            createParticles(game.player.x + game.player.width / 2, game.player.y + game.player.height, 5, '#fff');
        }
    }
    if (e.code === 'Escape') {
        togglePause();
    }
}

function handleKeyUp(e) {
    game.keys[e.code] = false;
    if (e.code === 'Space' && game.player) {
        game.player.jumpPressed = false;
        if (game.player.vy < -6 && game.player.hasFlower) {
            game.player.vy = -6;
        } else if (game.player.vy < -8) {
            game.player.vy = -8;
        }
    }
}

function gameLoop() {
    if (!game.running) return;
    
    if (!game.paused) {
        update();
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

function update() {
    if (!game.player || game.player.dead) return;
    
    updatePlayer();
    updateEnemies();
    updateCollectibles();
    updateParticles();
    
    if (game.boss) {
        updateBoss();
    }
    
    updateCamera();
    checkCollisions();
    checkWinCondition();
}

function updateCamera() {
    const targetX = game.player.x - CANVAS_WIDTH / 3;
    game.camera.x = Math.max(0, Math.min(targetX, game.levelWidth * TILE_SIZE - CANVAS_WIDTH));
}

function render() {
    const ctx = game.ctx;
    
    drawBackground();
    drawTileMap();
    drawCollectibles();
    drawEnemies();
    
    if (game.boss) {
        drawBoss();
    }
    
    drawPlayer();
    drawParticles();
    drawFlag();
}

function drawBackground() {
    const ctx = game.ctx;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#5c94fc');
    gradient.addColorStop(0.6, '#87ceeb');
    gradient.addColorStop(1, '#90ee90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 8; i++) {
        const cloudX = ((i * 300 - game.camera.x * 0.3) % (CANVAS_WIDTH + 200)) - 100;
        const cloudY = 50 + (i % 3) * 40;
        drawCloud(cloudX, cloudY);
    }
    
    ctx.fillStyle = '#3cb371';
    for (let i = 0; i < 5; i++) {
        const hillX = ((i * 400 - game.camera.x * 0.5) % (CANVAS_WIDTH + 300)) - 150;
        drawHill(hillX, CANVAS_HEIGHT - 100);
    }
}

function drawCloud(x, y) {
    const ctx = game.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 5, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawHill(x, y) {
    const ctx = game.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 100, y - 80, x + 200, y);
    ctx.fill();
}

function drawTileMap() {
    const ctx = game.ctx;
    const startTile = Math.floor(game.camera.x / TILE_SIZE);
    const endTile = Math.min(startTile + Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 1, game.levelWidth);
    
    for (let y = 0; y < game.levelHeight; y++) {
        for (let x = startTile; x < endTile; x++) {
            const tile = game.tileMap[y]?.[x];
            if (tile && tile !== TILES.EMPTY) {
                drawTile(tile, x * TILE_SIZE - game.camera.x, y * TILE_SIZE);
            }
        }
    }
}

function drawTile(tile, x, y) {
    const ctx = game.ctx;
    
    switch (tile) {
        case TILES.GROUND:
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#228b22';
            ctx.fillRect(x, y, TILE_SIZE, 8);
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + 4, y + 12, 4, 4);
            ctx.fillRect(x + 20, y + 20, 4, 4);
            break;
            
        case TILES.BRICK:
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.beginPath();
            ctx.moveTo(x, y + 16);
            ctx.lineTo(x + TILE_SIZE, y + 16);
            ctx.moveTo(x + 16, y);
            ctx.lineTo(x + 16, y + 16);
            ctx.moveTo(x + 8, y + 16);
            ctx.lineTo(x + 8, y + 32);
            ctx.moveTo(x + 24, y + 16);
            ctx.lineTo(x + 24, y + 32);
            ctx.stroke();
            break;
            
        case TILES.QUESTION:
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#b8860b';
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = '#b8860b';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', x + 16, y + 23);
            break;
            
        case TILES.PIPE:
            ctx.fillStyle = '#228b22';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#32cd32';
            ctx.fillRect(x - 4, y, TILE_SIZE + 8, 12);
            ctx.fillStyle = '#006400';
            ctx.fillRect(x + 4, y + 12, 4, TILE_SIZE - 12);
            break;
    }
}

function drawFlag() {
    const ctx = game.ctx;
    const flagX = (game.levelWidth - 3) * TILE_SIZE - game.camera.x;
    const flagY = 8 * TILE_SIZE;
    
    if (flagX > -100 && flagX < CANVAS_WIDTH + 100) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(flagX, flagY, 6, 12 * TILE_SIZE);
        
        ctx.fillStyle = '#e52521';
        ctx.beginPath();
        ctx.moveTo(flagX + 6, flagY + 20);
        ctx.lineTo(flagX + 50, flagY + 40);
        ctx.lineTo(flagX + 6, flagY + 60);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('★', flagX + 20, flagY + 45);
    }
}

function checkCollisions() {
    checkEnemyCollisions();
    checkCollectibleCollisions();
    checkTileCollisions();
    checkBossCollisions();
}

function checkTileCollisions() {
    const p = game.player;
    
    const left = Math.floor(p.x / TILE_SIZE);
    const right = Math.floor((p.x + p.width) / TILE_SIZE);
    const top = Math.floor(p.y / TILE_SIZE);
    const bottom = Math.floor((p.y + p.height) / TILE_SIZE);
    
    p.onGround = false;
    
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            const tile = game.tileMap[y]?.[x];
            if (tile && tile !== TILES.EMPTY) {
                const tileRect = {
                    x: x * TILE_SIZE,
                    y: y * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                };
                
                if (rectCollision(p, tileRect)) {
                    resolveCollision(p, tileRect, tile);
                }
            }
        }
    }
}

function rectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function resolveCollision(player, tile, tileType) {
    const overlapLeft = (player.x + player.width) - tile.x;
    const overlapRight = (tile.x + tile.width) - player.x;
    const overlapTop = (player.y + player.height) - tile.y;
    const overlapBottom = (tile.y + tile.height) - player.y;
    
    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);
    
    if (minOverlapY < minOverlapX) {
        if (overlapTop < overlapBottom) {
            player.y = tile.y - player.height;
            player.vy = 0;
            player.onGround = true;
        } else {
            player.y = tile.y + tile.height;
            player.vy = 0;
            
            if (tileType === TILES.QUESTION) {
                hitQuestionBlock(tile.x / TILE_SIZE, tile.y / TILE_SIZE);
            } else if (tileType === TILES.BRICK && player.big) {
                breakBrick(tile.x / TILE_SIZE, tile.y / TILE_SIZE);
            }
        }
    } else {
        if (overlapLeft < overlapRight) {
            player.x = tile.x - player.width;
        } else {
            player.x = tile.x + tile.width;
        }
        player.vx = 0;
    }
}

function hitQuestionBlock(x, y) {
    if (game.tileMap[y][x] !== TILES.QUESTION) return;
    
    game.tileMap[y][x] = TILES.BRICK;
    game.score += 100;
    updateHUD();
    
    const rand = Math.random();
    if (rand < 0.3) {
        spawnCollectible(x * TILE_SIZE, (y - 1) * TILE_SIZE, 'mushroom');
    } else if (rand < 0.5) {
        spawnCollectible(x * TILE_SIZE, (y - 1) * TILE_SIZE, 'flower');
    } else {
        spawnCollectible(x * TILE_SIZE, (y - 1) * TILE_SIZE, 'coin');
    }
    
    createParticles(x * TILE_SIZE + 16, y * TILE_SIZE, 10, '#ffd700');
}

function breakBrick(x, y) {
    game.tileMap[y][x] = TILES.EMPTY;
    game.score += 50;
    updateHUD();
    createParticles(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 15, '#cd853f');
}

function checkWinCondition() {
    const flagX = (game.levelWidth - 3) * TILE_SIZE;
    const flagY = 8 * TILE_SIZE;
    const flagWidth = 6;
    const flagHeight = 12 * TILE_SIZE;
    
    const flagRect = {
        x: flagX,
        y: flagY,
        width: flagWidth,
        height: flagHeight
    };
    
    if (rectCollision(game.player, flagRect)) {
        levelComplete();
    }
}

function levelComplete() {
    game.running = false;
    
    if (game.boss && game.boss.health > 0) {
        return;
    }
    
    document.getElementById('level-coins').textContent = game.levelCoins;
    document.getElementById('level-gems').textContent = game.levelGems;
    document.getElementById('level-score').textContent = game.score;
    
    const gemBonus = document.getElementById('gem-bonus');
    if (game.levelGems >= 30) {
        gemBonus.style.display = 'block';
        game.score += 1000;
    } else {
        gemBonus.style.display = 'none';
    }
    
    showScreen('level-complete');
}

function playerDie() {
    if (game.player.invincible) return;
    
    game.lives--;
    game.player.dead = true;
    game.player.vy = -10;
    
    createParticles(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2, 20, '#ff0000');
    
    setTimeout(() => {
        if (game.lives <= 0) {
            gameOver();
        } else {
            respawnPlayer();
        }
    }, 1500);
    
    updateHUD();
}

function respawnPlayer() {
    game.player.x = game.spawnX;
    game.player.y = game.spawnY;
    game.player.vx = 0;
    game.player.vy = 0;
    game.player.dead = false;
    game.player.big = false;
    game.player.hasFlower = false;
    game.player.width = 28;
    game.player.height = 32;
    game.player.invincible = true;
    
    setTimeout(() => {
        game.player.invincible = false;
    }, 2000);
    
    game.camera.x = 0;
}

function gameOver() {
    game.running = false;
    document.getElementById('final-score').textContent = game.score;
    showScreen('game-over');
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        game.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            life: 30,
            maxLife: 30,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function updateParticles() {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        
        if (p.life <= 0) {
            game.particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    const ctx = game.ctx;
    for (const p of game.particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - game.camera.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

function updateHUD() {
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('coins').textContent = game.levelCoins;
    document.getElementById('gems').textContent = game.levelGems;
    document.getElementById('level').textContent = game.currentLevel;
    document.getElementById('score').textContent = game.score;
}

function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen && screen.classList.contains('overlay')) {
        screen.classList.add('active');
    } else {
        document.querySelectorAll('.screen').forEach(s => {
            if (!s.classList.contains('overlay')) {
                s.classList.remove('active');
            }
        });
        document.querySelectorAll('.screen.overlay').forEach(s => s.classList.remove('active'));
        if (screen) {
            screen.classList.add('active');
        }
    }
}

function showMenu() {
    game.running = false;
    showScreen('main-menu');
}

function showLevelSelect() {
    generateLevelButtons();
    showScreen('level-select');
}

function showHelp() {
    showScreen('help-screen');
}

function showEditor() {
    initEditor();
    showScreen('editor-screen');
}

function startGame() {
    game.currentLevel = 1;
    game.score = 0;
    game.lives = 3;
    loadLevel(game.currentLevel);
    showScreen('game-screen');
    game.running = true;
    game.paused = false;
    gameLoop();
}

function startLevel(levelNum) {
    game.currentLevel = levelNum;
    loadLevel(levelNum);
    showScreen('game-screen');
    game.running = true;
    game.paused = false;
    gameLoop();
}

function togglePause() {
    if (!game.running) return;
    
    game.paused = !game.paused;
    const pauseMenu = document.getElementById('pause-menu');
    if (game.paused) {
        pauseMenu.classList.add('active');
    } else {
        pauseMenu.classList.remove('active');
    }
}

function restartLevel() {
    document.getElementById('pause-menu').classList.remove('active');
    loadLevel(game.currentLevel);
    game.paused = false;
}

function restartGame() {
    game.currentLevel = 1;
    game.score = 0;
    game.lives = 3;
    loadLevel(game.currentLevel);
    showScreen('game-screen');
    game.running = true;
    game.paused = false;
    gameLoop();
}

function nextLevel() {
    game.currentLevel++;
    if (game.currentLevel > 10) {
        alert('恭喜通关！最终分数: ' + game.score);
        showMenu();
        return;
    }
    loadLevel(game.currentLevel);
    showScreen('game-screen');
    game.running = true;
    game.paused = false;
    gameLoop();
}

function exitToMenu() {
    game.running = false;
    showScreen('main-menu');
}

function generateLevelButtons() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = i;
        
        if (i === 5 || i === 10) {
            btn.classList.add('boss');
        }
        
        btn.onclick = () => startLevel(i);
        grid.appendChild(btn);
    }
}

window.onload = initGame;
