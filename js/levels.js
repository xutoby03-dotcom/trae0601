function loadLevel(levelNum) {
    game.levelCoins = 0;
    game.levelGems = 0;
    game.enemies = [];
    game.collectibles = [];
    game.particles = [];
    game.boss = null;
    game.camera.x = 0;
    
    const levelData = generateLevel(levelNum);
    
    game.levelWidth = levelData.width;
    game.levelHeight = levelData.height;
    game.tileMap = levelData.tileMap;
    
    game.player = createPlayer(100, 200);
    
    for (const enemy of levelData.enemies) {
        switch (enemy.type) {
            case 'turtle':
                game.enemies.push(createTurtle(enemy.x, enemy.y));
                break;
            case 'bat':
                game.enemies.push(createBat(enemy.x, enemy.y));
                break;
            case 'spike':
                game.enemies.push(createSpike(enemy.x, enemy.y));
                break;
        }
    }
    
    for (const item of levelData.collectibles) {
        spawnCollectible(item.x, item.y, item.type);
    }
    
    if (levelData.boss) {
        game.boss = createBoss(levelData.boss.x, levelData.boss.y, levelNum);
    }
    
    updateHUD();
}

function generateLevel(levelNum) {
    const width = 80 + levelNum * 10;
    const height = 18;
    const tileMap = [];
    
    for (let y = 0; y < height; y++) {
        tileMap[y] = [];
        for (let x = 0; x < width; x++) {
            tileMap[y][x] = 0;
        }
    }
    
    for (let x = 0; x < width; x++) {
        tileMap[height - 2][x] = TILES.GROUND;
        tileMap[height - 1][x] = TILES.GROUND;
    }
    
    const enemies = [];
    const collectibles = [];
    let bossData = null;
    
    switch (levelNum) {
        case 1:
            generateLevel1(tileMap, width, height, enemies, collectibles);
            break;
        case 2:
            generateLevel2(tileMap, width, height, enemies, collectibles);
            break;
        case 3:
            generateLevel3(tileMap, width, height, enemies, collectibles);
            break;
        case 4:
            generateLevel4(tileMap, width, height, enemies, collectibles);
            break;
        case 5:
            generateLevel5(tileMap, width, height, enemies, collectibles);
            bossData = { x: (width - 15) * TILE_SIZE, y: (height - 6) * TILE_SIZE };
            break;
        case 6:
            generateLevel6(tileMap, width, height, enemies, collectibles);
            break;
        case 7:
            generateLevel7(tileMap, width, height, enemies, collectibles);
            break;
        case 8:
            generateLevel8(tileMap, width, height, enemies, collectibles);
            break;
        case 9:
            generateLevel9(tileMap, width, height, enemies, collectibles);
            break;
        case 10:
            generateLevel10(tileMap, width, height, enemies, collectibles);
            bossData = { x: (width - 15) * TILE_SIZE, y: (height - 6) * TILE_SIZE };
            break;
    }
    
    addFlag(tileMap, width, height);
    
    return {
        width: width,
        height: height,
        tileMap: tileMap,
        enemies: enemies,
        collectibles: collectibles,
        boss: bossData
    };
}

function addFlag(tileMap, width, height) {
    for (let x = width - 8; x < width; x++) {
        for (let y = height - 6; y < height - 2; y++) {
            tileMap[y][x] = 0;
        }
    }
}

function generateLevel1(tileMap, width, height, enemies, collectibles) {
    for (let x = 15; x < 20; x++) {
        tileMap[height - 5][x] = TILES.BRICK;
    }
    
    for (let x = 25; x < 30; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    tileMap[height - 5][17] = TILES.QUESTION;
    tileMap[height - 7][27] = TILES.QUESTION;
    
    for (let x = 35; x < 40; x++) {
        tileMap[height - 4][x] = TILES.BRICK;
    }
    
    for (let x = 45; x < 48; x++) {
        tileMap[height - 6][x] = TILES.PIPE;
        tileMap[height - 5][x] = TILES.PIPE;
    }
    
    for (let x = 50; x < 55; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 60; x < 65; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 150 + i * 25, y: (height - 4) * TILE_SIZE - 50 - (i % 3) * 40, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 200 + i * 50, y: (height - 6) * TILE_SIZE - 30, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 300, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'turtle', x: 600, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'turtle', x: 900, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1200, y: (height - 3) * TILE_SIZE + 12 });
}

function generateLevel2(tileMap, width, height, enemies, collectibles) {
    for (let x = 10; x < 15; x++) {
        tileMap[height - 4][x] = TILES.BRICK;
    }
    
    for (let x = 20; x < 23; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 28; x < 32; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 35; x < 42; x++) {
        tileMap[height - 5][x] = TILES.BRICK;
    }
    
    tileMap[height - 5][21] = TILES.QUESTION;
    tileMap[height - 7][30] = TILES.QUESTION;
    
    for (let x = 45; x < 50; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 55; x < 60; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    for (let x = 65; x < 70; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 150 + i * 28, y: (height - 4) * TILE_SIZE - 60 - (i % 4) * 30, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 180 + i * 55, y: (height - 7) * TILE_SIZE - 20, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 350, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 500, y: (height - 8) * TILE_SIZE });
    enemies.push({ type: 'turtle', x: 800, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 1000, y: (height - 9) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1400, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 1600, y: (height - 3) * TILE_SIZE });
}

function generateLevel3(tileMap, width, height, enemies, collectibles) {
    for (let x = 8; x < 12; x++) {
        tileMap[height - 4][x] = TILES.BRICK;
    }
    
    for (let x = 15; x < 18; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 22; x < 26; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 30; x < 33; x++) {
        tileMap[height - 10][x] = TILES.BRICK;
    }
    
    for (let x = 38; x < 42; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    tileMap[height - 5][10] = TILES.QUESTION;
    tileMap[height - 7][16] = TILES.QUESTION;
    tileMap[height - 9][24] = TILES.QUESTION;
    
    for (let x = 48; x < 52; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 58; x < 62; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 68; x < 72; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 55; x < 60; x++) {
        tileMap[height - 9][x] = TILES.BRICK;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 120 + i * 26, y: (height - 5) * TILE_SIZE - 80 - (i % 5) * 25, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 150 + i * 60, y: (height - 8) * TILE_SIZE - 20, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 280, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 450, y: (height - 10) * TILE_SIZE });
    enemies.push({ type: 'turtle', x: 650, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 900, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'bat', x: 1100, y: (height - 11) * TILE_SIZE });
    enemies.push({ type: 'turtle', x: 1350, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1700, y: (height - 3) * TILE_SIZE + 12 });
}

function generateLevel4(tileMap, width, height, enemies, collectibles) {
    for (let x = 5; x < 10; x++) {
        tileMap[height - 4][x] = TILES.BRICK;
    }
    
    for (let x = 12; x < 16; x++) {
        tileMap[height - 5][x] = TILES.BRICK;
    }
    
    for (let x = 18; x < 22; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    for (let x = 25; x < 30; x++) {
        tileMap[height - 9][x] = TILES.BRICK;
    }
    
    for (let x = 33; x < 37; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 40; x < 45; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    tileMap[height - 5][7] = TILES.QUESTION;
    tileMap[height - 6][14] = TILES.QUESTION;
    tileMap[height - 8][20] = TILES.QUESTION;
    tileMap[height - 10][27] = TILES.QUESTION;
    
    for (let x = 50; x < 55; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 60; x < 65; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 70; x < 75; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 80; x < 85; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 100 + i * 24, y: (height - 5) * TILE_SIZE - 70 - (i % 6) * 20, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 130 + i * 58, y: (height - 9) * TILE_SIZE - 10, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 200, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 350, y: (height - 10) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 500, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 700, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 900, y: (height - 12) * TILE_SIZE });
    enemies.push({ type: 'turtle', x: 1100, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1400, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'bat', x: 1600, y: (height - 10) * TILE_SIZE });
    enemies.push({ type: 'turtle', x: 1900, y: (height - 3) * TILE_SIZE });
}

function generateLevel5(tileMap, width, height, enemies, collectibles) {
    for (let x = 5; x < 10; x++) {
        tileMap[height - 4][x] = TILES.BRICK;
    }
    
    for (let x = 15; x < 20; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 25; x < 30; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    tileMap[height - 5][7] = TILES.QUESTION;
    tileMap[height - 7][17] = TILES.QUESTION;
    tileMap[height - 9][27] = TILES.QUESTION;
    
    for (let x = 35; x < 40; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 45; x < 50; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = width - 20; x < width - 5; x++) {
        for (let y = height - 8; y < height - 2; y++) {
            tileMap[y][x] = 0;
        }
    }
    
    for (let x = width - 25; x < width - 5; x++) {
        tileMap[height - 3][x] = TILES.BRICK;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 100 + i * 22, y: (height - 5) * TILE_SIZE - 60 - (i % 5) * 25, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 120 + i * 55, y: (height - 8) * TILE_SIZE - 20, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 250, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 400, y: (height - 9) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 600, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 800, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 1000, y: (height - 11) * TILE_SIZE });
}

function generateLevel6(tileMap, width, height, enemies, collectibles) {
    for (let x = 8; x < 14; x++) {
        tileMap[height - 5][x] = TILES.BRICK;
    }
    
    for (let x = 18; x < 24; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    for (let x = 28; x < 34; x++) {
        tileMap[height - 9][x] = TILES.BRICK;
    }
    
    for (let x = 38; x < 44; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 48; x < 54; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 58; x < 64; x++) {
        tileMap[height - 10][x] = TILES.BRICK;
    }
    
    tileMap[height - 6][11] = TILES.QUESTION;
    tileMap[height - 8][21] = TILES.QUESTION;
    tileMap[height - 10][31] = TILES.QUESTION;
    tileMap[height - 7][41] = TILES.QUESTION;
    tileMap[height - 9][51] = TILES.QUESTION;
    
    for (let x = 70; x < 75; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 80; x < 85; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 90; x < 95; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 120 + i * 25, y: (height - 6) * TILE_SIZE - 80 - (i % 6) * 20, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 150 + i * 60, y: (height - 10) * TILE_SIZE - 10, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 300, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 500, y: (height - 11) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 700, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 950, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 1200, y: (height - 12) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1500, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 1800, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 2100, y: (height - 10) * TILE_SIZE });
}

function generateLevel7(tileMap, width, height, enemies, collectibles) {
    for (let x = 5; x < 12; x++) {
        tileMap[height - 4][x] = TILES.BRICK;
    }
    
    for (let x = 15; x < 20; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 22; x < 28; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 30; x < 36; x++) {
        tileMap[height - 10][x] = TILES.BRICK;
    }
    
    for (let x = 40; x < 46; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    for (let x = 50; x < 56; x++) {
        tileMap[height - 9][x] = TILES.BRICK;
    }
    
    for (let x = 60; x < 66; x++) {
        tileMap[height - 11][x] = TILES.BRICK;
    }
    
    tileMap[height - 5][8] = TILES.QUESTION;
    tileMap[height - 7][17] = TILES.QUESTION;
    tileMap[height - 9][25] = TILES.QUESTION;
    tileMap[height - 11][33] = TILES.QUESTION;
    
    for (let x = 70; x < 76; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 82; x < 88; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 94; x < 100; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 106; x < 112; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 100 + i * 23, y: (height - 6) * TILE_SIZE - 90 - (i % 7) * 18, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 130 + i * 58, y: (height - 11) * TILE_SIZE - 15, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 250, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 400, y: (height - 12) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 600, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 850, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 1100, y: (height - 13) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1400, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 1700, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 2000, y: (height - 11) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 2300, y: (height - 3) * TILE_SIZE + 12 });
}

function generateLevel8(tileMap, width, height, enemies, collectibles) {
    for (let x = 10; x < 18; x++) {
        tileMap[height - 5][x] = TILES.BRICK;
    }
    
    for (let x = 22; x < 28; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    for (let x = 32; x < 40; x++) {
        tileMap[height - 9][x] = TILES.BRICK;
    }
    
    for (let x = 44; x < 50; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 54; x < 62; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 66; x < 74; x++) {
        tileMap[height - 10][x] = TILES.BRICK;
    }
    
    for (let x = 78; x < 86; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    tileMap[height - 6][14] = TILES.QUESTION;
    tileMap[height - 8][25] = TILES.QUESTION;
    tileMap[height - 10][36] = TILES.QUESTION;
    tileMap[height - 7][47] = TILES.QUESTION;
    tileMap[height - 9][58] = TILES.QUESTION;
    tileMap[height - 11][70] = TILES.QUESTION;
    
    for (let x = 90; x < 96; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 102; x < 108; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 114; x < 120; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 126; x < 132; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 138; x < 144; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 150 + i * 28, y: (height - 6) * TILE_SIZE - 100 - (i % 8) * 15, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 180 + i * 65, y: (height - 11) * TILE_SIZE - 10, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 350, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 550, y: (height - 12) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 800, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 1100, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 1400, y: (height - 14) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1750, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 2100, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 2450, y: (height - 12) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 2800, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 3100, y: (height - 3) * TILE_SIZE });
}

function generateLevel9(tileMap, width, height, enemies, collectibles) {
    for (let x = 8; x < 16; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 20; x < 26; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 30; x < 38; x++) {
        tileMap[height - 10][x] = TILES.BRICK;
    }
    
    for (let x = 42; x < 50; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    for (let x = 54; x < 62; x++) {
        tileMap[height - 9][x] = TILES.BRICK;
    }
    
    for (let x = 66; x < 74; x++) {
        tileMap[height - 11][x] = TILES.BRICK;
    }
    
    for (let x = 78; x < 86; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 90; x < 98; x++) {
        tileMap[height - 10][x] = TILES.BRICK;
    }
    
    tileMap[height - 7][12] = TILES.QUESTION;
    tileMap[height - 9][23] = TILES.QUESTION;
    tileMap[height - 11][34] = TILES.QUESTION;
    tileMap[height - 8][46] = TILES.QUESTION;
    tileMap[height - 10][58] = TILES.QUESTION;
    tileMap[height - 12][70] = TILES.QUESTION;
    
    for (let x = 102; x < 108; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 114; x < 120; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 126; x < 132; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 138; x < 144; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 150; x < 156; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 162; x < 168; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 120 + i * 26, y: (height - 7) * TILE_SIZE - 110 - (i % 9) * 14, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 150 + i * 62, y: (height - 12) * TILE_SIZE - 10, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 300, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 500, y: (height - 13) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 750, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 1050, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 1350, y: (height - 15) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1700, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 2050, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 2400, y: (height - 13) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 2750, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 3100, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 3450, y: (height - 14) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 3800, y: (height - 3) * TILE_SIZE + 12 });
}

function generateLevel10(tileMap, width, height, enemies, collectibles) {
    for (let x = 10; x < 18; x++) {
        tileMap[height - 6][x] = TILES.BRICK;
    }
    
    for (let x = 22; x < 30; x++) {
        tileMap[height - 8][x] = TILES.BRICK;
    }
    
    for (let x = 34; x < 42; x++) {
        tileMap[height - 10][x] = TILES.BRICK;
    }
    
    for (let x = 46; x < 52; x++) {
        tileMap[height - 7][x] = TILES.BRICK;
    }
    
    for (let x = 56; x < 64; x++) {
        tileMap[height - 9][x] = TILES.BRICK;
    }
    
    for (let x = 68; x < 76; x++) {
        tileMap[height - 11][x] = TILES.BRICK;
    }
    
    tileMap[height - 7][14] = TILES.QUESTION;
    tileMap[height - 9][26] = TILES.QUESTION;
    tileMap[height - 11][38] = TILES.QUESTION;
    tileMap[height - 8][49] = TILES.QUESTION;
    tileMap[height - 10][60] = TILES.QUESTION;
    tileMap[height - 12][72] = TILES.QUESTION;
    
    for (let x = 80; x < 86; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 92; x < 98; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 104; x < 110; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = 116; x < 122; x++) {
        tileMap[height - 2][x] = 0;
        tileMap[height - 1][x] = 0;
    }
    
    for (let x = width - 30; x < width - 5; x++) {
        for (let y = height - 10; y < height - 2; y++) {
            tileMap[y][x] = 0;
        }
    }
    
    for (let x = width - 35; x < width - 5; x++) {
        tileMap[height - 3][x] = TILES.BRICK;
    }
    
    for (let i = 0; i < 100; i++) {
        collectibles.push({ x: 150 + i * 25, y: (height - 7) * TILE_SIZE - 100 - (i % 8) * 16, type: 'coin' });
    }
    
    for (let i = 0; i < 30; i++) {
        collectibles.push({ x: 180 + i * 60, y: (height - 12) * TILE_SIZE - 10, type: 'gem' });
    }
    
    enemies.push({ type: 'turtle', x: 350, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 550, y: (height - 14) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 850, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 1200, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 1550, y: (height - 16) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 1950, y: (height - 3) * TILE_SIZE + 12 });
    enemies.push({ type: 'turtle', x: 2350, y: (height - 3) * TILE_SIZE });
    enemies.push({ type: 'bat', x: 2750, y: (height - 14) * TILE_SIZE });
    enemies.push({ type: 'spike', x: 3150, y: (height - 3) * TILE_SIZE + 12 });
}
