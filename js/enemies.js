function createTurtle(x, y) {
    return {
        type: 'turtle',
        x: x,
        y: y,
        width: 28,
        height: 26,
        vx: -1.5,
        vy: 0,
        alive: true,
        squashed: false,
        animFrame: 0,
        animTimer: 0
    };
}

function createBat(x, y) {
    return {
        type: 'bat',
        x: x,
        y: y,
        width: 28,
        height: 20,
        vx: 2,
        vy: 0,
        alive: true,
        baseY: y,
        flyTimer: Math.random() * Math.PI * 2,
        animFrame: 0,
        animTimer: 0
    };
}

function createSpike(x, y) {
    return {
        type: 'spike',
        x: x,
        y: y,
        width: 32,
        height: 20,
        alive: true
    };
}

function updateEnemies() {
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        
        if (!enemy.alive) {
            if (enemy.squashed) {
                enemy.squashTimer--;
                if (enemy.squashTimer <= 0) {
                    game.enemies.splice(i, 1);
                }
            } else {
                game.enemies.splice(i, 1);
            }
            continue;
        }
        
        switch (enemy.type) {
            case 'turtle':
                updateTurtle(enemy);
                break;
            case 'bat':
                updateBat(enemy);
                break;
            case 'spike':
                break;
        }
    }
}

function updateTurtle(enemy) {
    enemy.vy += GRAVITY;
    if (enemy.vy > MAX_FALL_SPEED) enemy.vy = MAX_FALL_SPEED;
    
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    
    const tileY = Math.floor((enemy.y + enemy.height) / TILE_SIZE);
    const tileX1 = Math.floor(enemy.x / TILE_SIZE);
    const tileX2 = Math.floor((enemy.x + enemy.width) / TILE_SIZE);
    
    let onGround = false;
    for (let tx = tileX1; tx <= tileX2; tx++) {
        if (game.tileMap[tileY]?.[tx] && game.tileMap[tileY][tx] !== TILES.EMPTY) {
            enemy.y = tileY * TILE_SIZE - enemy.height;
            enemy.vy = 0;
            onGround = true;
            break;
        }
    }
    
    const frontX = enemy.vx > 0 ? enemy.x + enemy.width : enemy.x;
    const wallTileX = Math.floor(frontX / TILE_SIZE);
    const wallTileY = Math.floor((enemy.y + enemy.height / 2) / TILE_SIZE);
    
    if (game.tileMap[wallTileY]?.[wallTileX] && game.tileMap[wallTileY][wallTileX] !== TILES.EMPTY) {
        enemy.vx *= -1;
    }
    
    const edgeCheckX = enemy.vx > 0 ? enemy.x + enemy.width + 5 : enemy.x - 5;
    const edgeTileX = Math.floor(edgeCheckX / TILE_SIZE);
    const edgeTileY = Math.floor((enemy.y + enemy.height + 5) / TILE_SIZE);
    
    if (onGround && (!game.tileMap[edgeTileY]?.[edgeTileX] || game.tileMap[edgeTileY][edgeTileX] === TILES.EMPTY)) {
        enemy.vx *= -1;
    }
    
    enemy.animTimer++;
    if (enemy.animTimer > 15) {
        enemy.animTimer = 0;
        enemy.animFrame = (enemy.animFrame + 1) % 2;
    }
}

function updateBat(enemy) {
    enemy.flyTimer += 0.05;
    enemy.y = enemy.baseY + Math.sin(enemy.flyTimer) * 30;
    
    enemy.x += enemy.vx;
    
    const tileX = enemy.vx > 0 ? Math.floor((enemy.x + enemy.width) / TILE_SIZE) : Math.floor(enemy.x / TILE_SIZE);
    const tileY = Math.floor((enemy.y + enemy.height / 2) / TILE_SIZE);
    
    if (game.tileMap[tileY]?.[tileX] && game.tileMap[tileY][tileX] !== TILES.EMPTY) {
        enemy.vx *= -1;
    }
    
    if (enemy.x < 0 || enemy.x > game.levelWidth * TILE_SIZE - enemy.width) {
        enemy.vx *= -1;
    }
    
    enemy.animTimer++;
    if (enemy.animTimer > 8) {
        enemy.animTimer = 0;
        enemy.animFrame = (enemy.animFrame + 1) % 2;
    }
}

function drawEnemies() {
    const ctx = game.ctx;
    
    for (const enemy of game.enemies) {
        const x = enemy.x - game.camera.x;
        const y = enemy.y;
        
        if (x < -50 || x > CANVAS_WIDTH + 50) continue;
        
        switch (enemy.type) {
            case 'turtle':
                drawTurtle(ctx, x, y, enemy);
                break;
            case 'bat':
                drawBat(ctx, x, y, enemy);
                break;
            case 'spike':
                drawSpike(ctx, x, y, enemy);
                break;
        }
    }
}

function drawTurtle(ctx, x, y, enemy) {
    if (enemy.squashed) {
        ctx.fillStyle = '#2e8b57';
        ctx.fillRect(x, y + 16, 28, 10);
        return;
    }
    
    ctx.fillStyle = '#2e8b57';
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 14, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#87ceeb';
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 16, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const headX = enemy.vx > 0 ? x + 24 : x - 4;
    ctx.fillStyle = '#90ee90';
    ctx.beginPath();
    ctx.arc(headX + 4, y + 14, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(headX + (enemy.vx > 0 ? 6 : 2), y + 12, 2, 0, Math.PI * 2);
    ctx.fill();
    
    const legOffset = enemy.animFrame * 2;
    ctx.fillStyle = '#90ee90';
    ctx.fillRect(x + 4, y + 22 + legOffset, 5, 4);
    ctx.fillRect(x + 19, y + 22 - legOffset, 5, 4);
}

function drawBat(ctx, x, y, enemy) {
    ctx.fillStyle = '#4b0082';
    
    const wingOffset = enemy.animFrame === 0 ? 0 : 5;
    
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x - 2, y + 5 - wingOffset);
    ctx.lineTo(x, y + 15);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x + 30, y + 5 - wingOffset);
    ctx.lineTo(x + 28, y + 15);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 12, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 6);
    ctx.lineTo(x + 5, y - 2);
    ctx.lineTo(x + 11, y + 4);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 6);
    ctx.lineTo(x + 23, y - 2);
    ctx.lineTo(x + 17, y + 4);
    ctx.fill();
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 2, 0, Math.PI * 2);
    ctx.arc(x + 18, y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x + 11, y + 15);
    ctx.lineTo(x + 13, y + 19);
    ctx.lineTo(x + 15, y + 15);
    ctx.fill();
}

function drawSpike(ctx, x, y, enemy) {
    ctx.fillStyle = '#808080';
    
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 8, y + 20);
        ctx.lineTo(x + i * 8 + 4, y);
        ctx.lineTo(x + i * 8 + 8, y + 20);
        ctx.fill();
    }
    
    ctx.fillStyle = '#a0a0a0';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 8, y + 20);
        ctx.lineTo(x + i * 8 + 4, y);
        ctx.lineTo(x + i * 8 + 4, y + 20);
        ctx.fill();
    }
}

function checkEnemyCollisions() {
    const p = game.player;
    
    if (p.dead || p.invincible) return;
    
    for (const enemy of game.enemies) {
        if (!enemy.alive) continue;
        
        if (rectCollision(p, enemy)) {
            const playerBottom = p.y + p.height;
            const enemyTop = enemy.y;
            
            if (p.vy > 0 && playerBottom - enemyTop < 15) {
                if (enemy.type === 'spike') {
                    enemy.alive = false;
                    game.score += 200;
                    updateHUD();
                    createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 15, '#808080');
                } else {
                    stompEnemy(enemy);
                }
                p.vy = -8;
                p.onGround = false;
            } else {
                playerDie();
                return;
            }
        }
    }
}

function stompEnemy(enemy) {
    game.score += 100;
    updateHUD();
    
    if (enemy.type === 'turtle') {
        enemy.squashed = true;
        enemy.squashTimer = 60;
        enemy.height = 10;
        enemy.y += 16;
        createParticles(enemy.x + enemy.width / 2, enemy.y, 10, '#2e8b57');
    } else {
        enemy.alive = false;
        createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 15, '#4b0082');
    }
}
