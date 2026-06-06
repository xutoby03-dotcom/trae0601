function createPlayer(x, y) {
    return {
        x: x,
        y: y,
        width: 28,
        height: 32,
        vx: 0,
        vy: 0,
        speed: 4,
        onGround: false,
        jumpPressed: false,
        jumpHoldTime: 0,
        facingRight: true,
        big: false,
        hasFlower: false,
        dead: false,
        invincible: false,
        animFrame: 0,
        animTimer: 0
    };
}

function updatePlayer() {
    const p = game.player;
    
    if (p.dead) {
        p.vy += GRAVITY;
        p.y += p.vy;
        return;
    }
    
    if (game.keys['ArrowLeft'] || game.keys['KeyA']) {
        p.vx = -p.speed;
        p.facingRight = false;
    } else if (game.keys['ArrowRight'] || game.keys['KeyD']) {
        p.vx = p.speed;
        p.facingRight = true;
    } else {
        p.vx *= 0.8;
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }
    
    if (p.jumpPressed) {
        p.jumpHoldTime++;
        if (p.hasFlower && p.jumpHoldTime < 15) {
            p.vy -= 0.5;
        } else if (p.jumpHoldTime < 10) {
            p.vy -= 0.3;
        }
    }
    
    p.vy += GRAVITY;
    if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;
    
    p.x += p.vx;
    p.y += p.vy;
    
    if (p.x < 0) p.x = 0;
    if (p.x > game.levelWidth * TILE_SIZE - p.width) {
        p.x = game.levelWidth * TILE_SIZE - p.width;
    }
    
    if (p.y > game.levelHeight * TILE_SIZE) {
        playerDie();
    }
    
    p.animTimer++;
    if (p.animTimer > 8) {
        p.animTimer = 0;
        p.animFrame = (p.animFrame + 1) % 4;
    }
}

function drawPlayer() {
    const ctx = game.ctx;
    const p = game.player;
    const x = p.x - game.camera.x;
    const y = p.y;
    
    if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
        return;
    }
    
    ctx.save();
    
    if (!p.facingRight) {
        ctx.translate(x + p.width, y);
        ctx.scale(-1, 1);
        drawPlayerBody(0, 0, p);
    } else {
        drawPlayerBody(x, y, p);
    }
    
    ctx.restore();
}

function drawPlayerBody(x, y, p) {
    const ctx = game.ctx;
    const heightOffset = p.big ? -16 : 0;
    const bodyHeight = p.big ? 48 : 32;
    
    ctx.fillStyle = '#e52521';
    ctx.fillRect(x + 4, y + heightOffset + 8, 20, 10);
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 2, y + heightOffset + 14, 24, 4);
    
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(x + 6, y + heightOffset + 18, 16, 10);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 16, y + heightOffset + 21, 3, 3);
    
    ctx.fillStyle = '#4a2800';
    ctx.fillRect(x + 18, y + heightOffset + 26, 6, 3);
    
    if (p.big) {
        ctx.fillStyle = '#e52521';
        ctx.fillRect(x + 4, y + heightOffset + 28, 20, 12);
        
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(x + 4, y + heightOffset + 40, 20, 8);
        
        const legOffset = Math.abs(p.vx) > 0.5 ? Math.sin(p.animFrame * Math.PI / 2) * 3 : 0;
        
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(x + 4, y + heightOffset + 48 - legOffset, 8, 10);
        ctx.fillRect(x + 16, y + heightOffset + 48 + legOffset, 8, 10);
        
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + 2, y + heightOffset + 54 - legOffset, 12, 6);
        ctx.fillRect(x + 14, y + heightOffset + 54 + legOffset, 12, 6);
    } else {
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(x + 4, y + heightOffset + 28, 20, 10);
        
        const legOffset = Math.abs(p.vx) > 0.5 ? Math.sin(p.animFrame * Math.PI / 2) * 2 : 0;
        
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + 2, y + heightOffset + 36 - legOffset, 12, 6);
        ctx.fillRect(x + 14, y + heightOffset + 36 + legOffset, 12, 6);
    }
    
    if (p.hasFlower) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('✨', x + 22, y + heightOffset + 5);
    }
}

function powerUp(type) {
    const p = game.player;
    
    if (type === 'mushroom' && !p.big) {
        p.big = true;
        p.height = 48;
        p.y -= 16;
        createParticles(p.x + p.width / 2, p.y + p.height / 2, 15, '#ff6347');
    } else if (type === 'flower') {
        p.hasFlower = true;
        p.speed = 5;
        createParticles(p.x + p.width / 2, p.y + p.height / 2, 15, '#ff69b4');
    }
    
    game.score += 1000;
    updateHUD();
}
