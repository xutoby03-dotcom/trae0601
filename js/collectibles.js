function spawnCollectible(x, y, type) {
    game.collectibles.push({
        type: type,
        x: x,
        y: y,
        width: 24,
        height: 24,
        vy: type === 'mushroom' || type === 'flower' ? -5 : 0,
        collected: false,
        animFrame: 0,
        animTimer: 0,
        bobOffset: 0
    });
}

function updateCollectibles() {
    for (let i = game.collectibles.length - 1; i >= 0; i--) {
        const c = game.collectibles[i];
        
        if (c.collected) {
            game.collectibles.splice(i, 1);
            continue;
        }
        
        if (c.type === 'mushroom' || c.type === 'flower') {
            c.vy += GRAVITY * 0.5;
            c.y += c.vy;
            
            const tileY = Math.floor((c.y + c.height) / TILE_SIZE);
            const tileX = Math.floor((c.x + c.width / 2) / TILE_SIZE);
            
            if (game.tileMap[tileY]?.[tileX] && game.tileMap[tileY][tileX] !== TILES.EMPTY) {
                c.y = tileY * TILE_SIZE - c.height;
                c.vy = 0;
            }
        }
        
        c.animTimer++;
        if (c.animTimer > 10) {
            c.animTimer = 0;
            c.animFrame = (c.animFrame + 1) % 4;
        }
        
        c.bobOffset = Math.sin(Date.now() / 200 + i) * 3;
    }
}

function drawCollectibles() {
    const ctx = game.ctx;
    
    for (const c of game.collectibles) {
        if (c.collected) continue;
        
        const x = c.x - game.camera.x;
        const y = c.y + c.bobOffset;
        
        if (x < -50 || x > CANVAS_WIDTH + 50) continue;
        
        switch (c.type) {
            case 'coin':
                drawCoin(ctx, x, y, c);
                break;
            case 'gem':
                drawGem(ctx, x, y, c);
                break;
            case 'mushroom':
                drawMushroom(ctx, x, y);
                break;
            case 'flower':
                drawFlower(ctx, x, y, c);
                break;
        }
    }
}

function drawCoin(ctx, x, y, c) {
    const stretch = Math.abs(Math.sin(c.animFrame * Math.PI / 2));
    
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 12, 10 * stretch + 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffed4a';
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 10, 4 * stretch + 1, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 12, 10 * stretch + 2, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGem(ctx, x, y, c) {
    const shine = Math.sin(Date.now() / 100) * 0.3 + 0.7;
    
    ctx.fillStyle = `rgba(138, 43, 226, ${shine})`;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 2);
    ctx.lineTo(x + 22, y + 12);
    ctx.lineTo(x + 12, y + 22);
    ctx.lineTo(x + 2, y + 12);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#dda0dd';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 4);
    ctx.lineTo(x + 18, y + 12);
    ctx.lineTo(x + 12, y + 14);
    ctx.lineTo(x + 6, y + 12);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#4b0082';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 2);
    ctx.lineTo(x + 22, y + 12);
    ctx.lineTo(x + 12, y + 22);
    ctx.lineTo(x + 2, y + 12);
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 8, y + 8, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawMushroom(ctx, x, y) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 14, 12, 10);
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 12, 12, 10, 0, Math.PI, 0);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 6, y + 8, 3, 0, Math.PI * 2);
    ctx.arc(x + 14, y + 6, 4, 0, Math.PI * 2);
    ctx.arc(x + 18, y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 8, y + 17, 2, 2);
    ctx.fillRect(x + 14, y + 17, 2, 2);
}

function drawFlower(ctx, x, y, c) {
    const petalColors = ['#ff69b4', '#ff1493', '#ff69b4', '#ff1493'];
    const petalAngle = c.animFrame * Math.PI / 2;
    
    for (let i = 0; i < 4; i++) {
        const angle = petalAngle + i * Math.PI / 2;
        const px = x + 12 + Math.cos(angle) * 6;
        const py = y + 12 + Math.sin(angle) * 6;
        
        ctx.fillStyle = petalColors[i];
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#228b22';
    ctx.fillRect(x + 10, y + 16, 4, 8);
    
    ctx.beginPath();
    ctx.ellipse(x + 6, y + 20, 4, 2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

function checkCollectibleCollisions() {
    const p = game.player;
    
    if (p.dead) return;
    
    for (const c of game.collectibles) {
        if (c.collected) continue;
        
        if (rectCollision(p, c)) {
            collectItem(c);
        }
    }
}

function collectItem(c) {
    c.collected = true;
    
    switch (c.type) {
        case 'coin':
            game.levelCoins++;
            game.coins++;
            game.score += 100;
            
            if (game.coins >= 100) {
                game.coins = 0;
                game.lives++;
            }
            break;
            
        case 'gem':
            game.levelGems++;
            game.gems++;
            game.score += 500;
            break;
            
        case 'mushroom':
            powerUp('mushroom');
            break;
            
        case 'flower':
            powerUp('flower');
            break;
    }
    
    createParticles(c.x + c.width / 2, c.y + c.height / 2, 10, getCollectibleColor(c.type));
    updateHUD();
}

function getCollectibleColor(type) {
    switch (type) {
        case 'coin': return '#ffd700';
        case 'gem': return '#8a2be2';
        case 'mushroom': return '#ff0000';
        case 'flower': return '#ff69b4';
        default: return '#fff';
    }
}
