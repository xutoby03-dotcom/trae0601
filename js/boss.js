function createBoss(x, y, level) {
    const isFinalBoss = level === 10;
    return {
        x: x,
        y: y,
        width: isFinalBoss ? 80 : 64,
        height: isFinalBoss ? 96 : 80,
        vx: 0,
        vy: 0,
        health: 3,
        maxHealth: 3,
        phase: 1,
        level: level,
        isFinalBoss: isFinalBoss,
        state: 'idle',
        stateTimer: 0,
        attackCooldown: 0,
        hurtTimer: 0,
        direction: -1,
        animFrame: 0,
        animTimer: 0,
        projectiles: []
    };
}

function updateBoss() {
    const boss = game.boss;
    if (!boss || boss.health <= 0) return;
    
    if (boss.hurtTimer > 0) {
        boss.hurtTimer--;
        return;
    }
    
    boss.stateTimer++;
    boss.animTimer++;
    
    if (boss.animTimer > 10) {
        boss.animTimer = 0;
        boss.animFrame = (boss.animFrame + 1) % 4;
    }
    
    if (boss.attackCooldown > 0) {
        boss.attackCooldown--;
    }
    
    const playerDist = game.player.x - boss.x;
    boss.direction = playerDist > 0 ? 1 : -1;
    
    switch (boss.phase) {
        case 1:
            updateBossPhase1(boss, playerDist);
            break;
        case 2:
            updateBossPhase2(boss, playerDist);
            break;
        case 3:
            updateBossPhase3(boss, playerDist);
            break;
    }
    
    boss.vy += GRAVITY * 0.8;
    if (boss.vy > MAX_FALL_SPEED) boss.vy = MAX_FALL_SPEED;
    
    boss.x += boss.vx;
    boss.y += boss.vy;
    
    const groundY = (game.levelHeight - 4) * TILE_SIZE;
    if (boss.y + boss.height > groundY) {
        boss.y = groundY - boss.height;
        boss.vy = 0;
    }
    
    if (boss.x < (game.levelWidth - 35) * TILE_SIZE) {
        boss.x = (game.levelWidth - 35) * TILE_SIZE;
    }
    if (boss.x > (game.levelWidth - 10) * TILE_SIZE - boss.width) {
        boss.x = (game.levelWidth - 10) * TILE_SIZE - boss.width;
    }
    
    updateBossProjectiles(boss);
}

function updateBossPhase1(boss, playerDist) {
    boss.vx = boss.direction * 1.5;
    
    if (boss.stateTimer > 120 && boss.attackCooldown <= 0) {
        boss.stateTimer = 0;
        boss.attackCooldown = 90;
        
        if (Math.abs(playerDist) < 300) {
            bossJumpAttack(boss);
        }
    }
}

function updateBossPhase2(boss, playerDist) {
    boss.vx = boss.direction * 2.5;
    
    if (boss.stateTimer > 90 && boss.attackCooldown <= 0) {
        boss.stateTimer = 0;
        boss.attackCooldown = 60;
        
        const rand = Math.random();
        if (rand < 0.5) {
            bossJumpAttack(boss);
        } else {
            bossShootProjectile(boss);
        }
    }
}

function updateBossPhase3(boss, playerDist) {
    boss.vx = boss.direction * 3.5;
    
    if (boss.stateTimer > 60 && boss.attackCooldown <= 0) {
        boss.stateTimer = 0;
        boss.attackCooldown = 40;
        
        const rand = Math.random();
        if (rand < 0.3) {
            bossJumpAttack(boss);
        } else if (rand < 0.6) {
            bossShootProjectile(boss);
        } else {
            bossGroundPound(boss);
        }
    }
}

function bossJumpAttack(boss) {
    boss.vy = -15;
    boss.vx = boss.direction * 4;
    createParticles(boss.x + boss.width / 2, boss.y + boss.height, 10, '#888');
}

function bossShootProjectile(boss) {
    const projectileCount = boss.phase === 3 ? 3 : boss.phase === 2 ? 2 : 1;
    
    for (let i = 0; i < projectileCount; i++) {
        const angle = (i - (projectileCount - 1) / 2) * 0.3;
        boss.projectiles.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 3,
            vx: boss.direction * 5 + Math.sin(angle) * 2,
            vy: Math.sin(angle) * 3,
            width: 16,
            height: 16,
            life: 120
        });
    }
}

function bossGroundPound(boss) {
    boss.vy = -20;
    
    setTimeout(() => {
        if (game.boss && game.boss.health > 0) {
            boss.vy = 20;
            createParticles(boss.x + boss.width / 2, boss.y + boss.height, 30, '#888');
            
            setTimeout(() => {
                if (game.player && !game.player.dead && !game.player.invincible) {
                    const dist = Math.abs(game.player.x - boss.x);
                    if (dist < 200 && game.player.onGround) {
                        game.player.vy = -10;
                        playerDie();
                    }
                }
            }, 500);
        }
    }, 500);
}

function updateBossProjectiles(boss) {
    for (let i = boss.projectiles.length - 1; i >= 0; i--) {
        const p = boss.projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY * 0.3;
        p.life--;
        
        if (p.life <= 0) {
            boss.projectiles.splice(i, 1);
            continue;
        }
        
        if (rectCollision(game.player, p) && !game.player.invincible && !game.player.dead) {
            playerDie();
            boss.projectiles.splice(i, 1);
        }
    }
}

function drawBoss() {
    const boss = game.boss;
    if (!boss || boss.health <= 0) return;
    
    const ctx = game.ctx;
    const x = boss.x - game.camera.x;
    const y = boss.y;
    
    if (x < -100 || x > CANVAS_WIDTH + 100) return;
    
    if (boss.hurtTimer > 0 && Math.floor(boss.hurtTimer / 3) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    ctx.save();
    
    if (boss.direction < 0) {
        ctx.translate(x + boss.width, y);
        ctx.scale(-1, 1);
        drawBossBody(0, 0, boss);
    } else {
        drawBossBody(x, y, boss);
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
    
    drawBossHealthBar(boss);
    drawBossProjectiles(boss);
}

function drawBossBody(x, y, boss) {
    const ctx = game.ctx;
    const w = boss.width;
    const h = boss.height;
    
    const bodyColor = boss.isFinalBoss ? '#8b0000' : '#4a0080';
    const darkColor = boss.isFinalBoss ? '#5c0000' : '#2d004d';
    const eyeColor = boss.isFinalBoss ? '#ff0' : '#f0f';
    
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.6, w / 2, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.35, w * 0.35, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.35, y + h * 0.3, 10, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.65, y + h * 0.3, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(x + w * 0.38, y + h * 0.32, 5, 0, Math.PI * 2);
    ctx.arc(x + w * 0.68, y + h * 0.32, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + h * 0.5);
    ctx.lineTo(x + w * 0.5, y + h * 0.6);
    ctx.lineTo(x + w * 0.7, y + h * 0.5);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35 + i * 0.1 * w, y + h * 0.52);
        ctx.lineTo(x + w * 0.38 + i * 0.1 * w, y + h * 0.58);
        ctx.lineTo(x + w * 0.41 + i * 0.1 * w, y + h * 0.52);
        ctx.fill();
    }
    
    if (boss.phase >= 2) {
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y + h * 0.15);
        ctx.lineTo(x + w * 0.1, y - h * 0.1);
        ctx.lineTo(x + w * 0.3, y + h * 0.1);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.8, y + h * 0.15);
        ctx.lineTo(x + w * 0.9, y - h * 0.1);
        ctx.lineTo(x + w * 0.7, y + h * 0.1);
        ctx.fill();
    }
    
    if (boss.phase >= 3) {
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.15, y + h * 0.7, 12, 20, -0.3, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.85, y + h * 0.7, 12, 20, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const legOffset = Math.sin(boss.animFrame * Math.PI / 2) * 3;
    ctx.fillStyle = darkColor;
    ctx.fillRect(x + w * 0.2, y + h * 0.85 - legOffset, w * 0.2, h * 0.15);
    ctx.fillRect(x + w * 0.6, y + h * 0.85 + legOffset, w * 0.2, h * 0.15);
}

function drawBossHealthBar(boss) {
    const ctx = game.ctx;
    const barWidth = 200;
    const barHeight = 20;
    const x = CANVAS_WIDTH / 2 - barWidth / 2;
    const y = 70;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
    
    ctx.fillStyle = '#666';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    const healthPercent = boss.health / boss.maxHealth;
    const healthColor = healthPercent > 0.6 ? '#00ff00' : healthPercent > 0.3 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    const bossName = boss.isFinalBoss ? '最终BOSS' : 'BOSS';
    ctx.fillText(`${bossName} - 阶段 ${boss.phase}`, CANVAS_WIDTH / 2, y - 5);
}

function drawBossProjectiles(boss) {
    const ctx = game.ctx;
    
    for (const p of boss.projectiles) {
        const x = p.x - game.camera.x;
        const y = p.y;
        
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(x + p.width / 2, y + p.height / 2, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x + p.width / 2, y + p.height / 2, p.width / 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function checkBossCollisions() {
    if (!game.boss || game.boss.health <= 0) return;
    if (game.player.dead || game.player.invincible) return;
    
    const boss = game.boss;
    const p = game.player;
    
    if (rectCollision(p, boss)) {
        const playerBottom = p.y + p.height;
        const bossTop = boss.y;
        
        if (p.vy > 0 && playerBottom - bossTop < 30) {
            hitBoss();
            p.vy = -12;
        } else {
            playerDie();
        }
    }
    
    for (const proj of boss.projectiles) {
        if (rectCollision(p, proj) && !p.invincible && !p.dead) {
            playerDie();
            break;
        }
    }
}

function hitBoss() {
    const boss = game.boss;
    if (boss.hurtTimer > 0) return;
    
    boss.health--;
    boss.hurtTimer = 60;
    game.score += 500;
    
    createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 30, '#ff0000');
    
    if (boss.health <= 0) {
        defeatBoss();
    } else if (boss.health === 2 && boss.phase < 2) {
        boss.phase = 2;
        createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 50, '#ff00ff');
    } else if (boss.health === 1 && boss.phase < 3) {
        boss.phase = 3;
        createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 50, '#ff4500');
    }
    
    updateHUD();
}

function defeatBoss() {
    const boss = game.boss;
    game.score += 5000;
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createParticles(
                boss.x + boss.width / 2 + (Math.random() - 0.5) * boss.width,
                boss.y + boss.height / 2 + (Math.random() - 0.5) * boss.height,
                5,
                ['#ff0000', '#ff00ff', '#ffff00', '#00ff00'][Math.floor(Math.random() * 4)]
            );
        }, i * 20);
    }
    
    setTimeout(() => {
        game.boss = null;
    }, 2000);
    
    updateHUD();
}
