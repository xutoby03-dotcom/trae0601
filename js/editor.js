let editor = {
    canvas: null,
    ctx: null,
    tileMap: [],
    width: 50,
    height: 18,
    selectedTile: 1,
    mouseDown: false,
    cameraX: 0,
    enemies: [],
    collectibles: []
};

const EDITOR_TILES = [
    { id: 0, name: '空', emoji: '⬜', color: '#87ceeb' },
    { id: 1, name: '地面', emoji: '🟫', color: '#8b4513' },
    { id: 2, name: '砖块', emoji: '🧱', color: '#cd853f' },
    { id: 3, name: '问号', emoji: '❓', color: '#ffd700' },
    { id: 4, name: '水管', emoji: '🌿', color: '#228b22' }
];

const EDITOR_ITEMS = [
    { type: 'enemy', subtype: 'turtle', name: '乌龟', emoji: '🐢' },
    { type: 'enemy', subtype: 'bat', name: '蝙蝠', emoji: '🦇' },
    { type: 'enemy', subtype: 'spike', name: '尖刺', emoji: '🔺' },
    { type: 'collectible', subtype: 'coin', name: '金币', emoji: '🪙' },
    { type: 'collectible', subtype: 'gem', name: '宝石', emoji: '💎' },
    { type: 'collectible', subtype: 'mushroom', name: '蘑菇', emoji: '🍄' },
    { type: 'collectible', subtype: 'flower', name: '花朵', emoji: '🌸' }
];

function initEditor() {
    editor.canvas = document.getElementById('editorCanvas');
    editor.ctx = editor.canvas.getContext('2d');
    editor.canvas.width = 700;
    editor.canvas.height = 480;
    
    createTilePalette();
    
    for (let y = 0; y < editor.height; y++) {
        editor.tileMap[y] = [];
        for (let x = 0; x < editor.width; x++) {
            if (y >= editor.height - 2) {
                editor.tileMap[y][x] = 1;
            } else {
                editor.tileMap[y][x] = 0;
            }
        }
    }
    
    editor.enemies = [];
    editor.collectibles = [];
    editor.cameraX = 0;
    
    editor.canvas.addEventListener('mousedown', handleEditorMouseDown);
    editor.canvas.addEventListener('mouseup', handleEditorMouseUp);
    editor.canvas.addEventListener('mousemove', handleEditorMouseMove);
    editor.canvas.addEventListener('wheel', handleEditorWheel);
    
    document.addEventListener('keydown', handleEditorKeyDown);
    
    renderEditor();
}

function createTilePalette() {
    const palette = document.getElementById('tile-palette');
    palette.innerHTML = '';
    
    for (const tile of EDITOR_TILES) {
        const btn = document.createElement('button');
        btn.className = 'tile-btn';
        btn.textContent = tile.emoji;
        btn.style.background = tile.color;
        btn.title = tile.name;
        btn.onclick = () => selectTile(tile.id);
        if (tile.id === editor.selectedTile) {
            btn.classList.add('selected');
        }
        palette.appendChild(btn);
    }
    
    const separator = document.createElement('div');
    separator.style.gridColumn = 'span 4';
    separator.style.height = '10px';
    palette.appendChild(separator);
    
    for (const item of EDITOR_ITEMS) {
        const btn = document.createElement('button');
        btn.className = 'tile-btn';
        btn.textContent = item.emoji;
        btn.title = item.name;
        btn.style.background = '#333';
        btn.onclick = () => selectItem(item);
        palette.appendChild(btn);
    }
}

function selectTile(tileId) {
    editor.selectedTile = tileId;
    editor.selectedItem = null;
    createTilePalette();
}

function selectItem(item) {
    editor.selectedItem = item;
    editor.selectedTile = -1;
    createTilePalette();
}

function handleEditorMouseDown(e) {
    editor.mouseDown = true;
    handleEditorClick(e);
}

function handleEditorMouseUp() {
    editor.mouseDown = false;
}

function handleEditorMouseMove(e) {
    if (editor.mouseDown) {
        handleEditorClick(e);
    }
}

function handleEditorClick(e) {
    const rect = editor.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + editor.cameraX;
    const y = e.clientY - rect.top;
    
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX >= 0 && tileX < editor.width && tileY >= 0 && tileY < editor.height) {
        if (editor.selectedItem) {
            placeItem(tileX, tileY);
        } else if (e.button === 2) {
            editor.tileMap[tileY][tileX] = 0;
        } else {
            editor.tileMap[tileY][tileX] = editor.selectedTile;
        }
    }
    
    renderEditor();
}

function handleEditorWheel(e) {
    e.preventDefault();
    const scrollSpeed = 5 * TILE_SIZE;
    
    if (e.deltaY > 0) {
        editor.cameraX = Math.min(editor.cameraX + scrollSpeed, (editor.width * TILE_SIZE) - editor.canvas.width);
    } else {
        editor.cameraX = Math.max(0, editor.cameraX - scrollSpeed);
    }
    
    renderEditor();
}

function handleEditorKeyDown(e) {
    if (!document.getElementById('editor-screen').classList.contains('active')) return;
    
    const scrollSpeed = 5 * TILE_SIZE;
    
    if (e.code === 'ArrowRight') {
        editor.cameraX = Math.min(editor.cameraX + scrollSpeed, (editor.width * TILE_SIZE) - editor.canvas.width);
    } else if (e.code === 'ArrowLeft') {
        editor.cameraX = Math.max(0, editor.cameraX - scrollSpeed);
    }
    
    renderEditor();
}

function placeItem(tileX, tileY) {
    const item = editor.selectedItem;
    const x = tileX * TILE_SIZE;
    const y = tileY * TILE_SIZE;
    
    if (item.type === 'enemy') {
        editor.enemies.push({
            type: item.subtype,
            x: x,
            y: y
        });
    } else if (item.type === 'collectible') {
        editor.collectibles.push({
            type: item.subtype,
            x: x,
            y: y
        });
    }
}

function renderEditor() {
    const ctx = editor.ctx;
    
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, editor.canvas.width, editor.canvas.height);
    
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    
    const startTile = Math.floor(editor.cameraX / TILE_SIZE);
    const endTile = Math.min(startTile + Math.ceil(editor.canvas.width / TILE_SIZE) + 1, editor.width);
    
    for (let x = startTile; x <= endTile; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE - editor.cameraX, 0);
        ctx.lineTo(x * TILE_SIZE - editor.cameraX, editor.canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < editor.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(editor.canvas.width, y * TILE_SIZE);
        ctx.stroke();
    }
    
    for (let y = 0; y < editor.height; y++) {
        for (let x = startTile; x < endTile; x++) {
            const tile = editor.tileMap[y]?.[x];
            if (tile && tile !== 0) {
                drawEditorTile(ctx, tile, x * TILE_SIZE - editor.cameraX, y * TILE_SIZE);
            }
        }
    }
    
    for (const enemy of editor.enemies) {
        const x = enemy.x - editor.cameraX;
        if (x > -TILE_SIZE && x < editor.canvas.width) {
            ctx.font = '24px Arial';
            const emoji = enemy.type === 'turtle' ? '🐢' : enemy.type === 'bat' ? '🦇' : '🔺';
            ctx.fillText(emoji, x, enemy.y + 24);
        }
    }
    
    for (const item of editor.collectibles) {
        const x = item.x - editor.cameraX;
        if (x > -TILE_SIZE && x < editor.canvas.width) {
            ctx.font = '20px Arial';
            const emoji = item.type === 'coin' ? '🪙' : item.type === 'gem' ? '💎' : item.type === 'mushroom' ? '🍄' : '🌸';
            ctx.fillText(emoji, x + 4, item.y + 20);
        }
    }
    
    const flagX = (editor.width - 3) * TILE_SIZE - editor.cameraX;
    if (flagX > -50 && flagX < editor.canvas.width + 50) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(flagX, 8 * TILE_SIZE, 6, 10 * TILE_SIZE);
        ctx.fillStyle = '#e52521';
        ctx.fillRect(flagX + 6, 8 * TILE_SIZE + 20, 40, 30);
    }
    
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(10, 10, 200, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`← → 或滚轮滚动 | 点击放置 | 右键删除`, 15, 30);
}

function drawEditorTile(ctx, tile, x, y) {
    switch (tile) {
        case 1:
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#228b22';
            ctx.fillRect(x, y, TILE_SIZE, 8);
            break;
            
        case 2:
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
            
        case 3:
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#b8860b';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', x + 16, y + 22);
            break;
            
        case 4:
            ctx.fillStyle = '#228b22';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#32cd32';
            ctx.fillRect(x - 2, y, TILE_SIZE + 4, 10);
            break;
    }
}

function clearLevel() {
    if (confirm('确定要清空关卡吗？')) {
        for (let y = 0; y < editor.height; y++) {
            for (let x = 0; x < editor.width; x++) {
                if (y >= editor.height - 2) {
                    editor.tileMap[y][x] = 1;
                } else {
                    editor.tileMap[y][x] = 0;
                }
            }
        }
        editor.enemies = [];
        editor.collectibles = [];
        editor.cameraX = 0;
        renderEditor();
    }
}

function getCurrentLevelData() {
    return {
        width: editor.width,
        height: editor.height,
        tileMap: editor.tileMap,
        enemies: editor.enemies,
        collectibles: editor.collectibles,
        createdAt: Date.now()
    };
}

function getSavedLevels() {
    const saved = localStorage.getItem('customLevels');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveLevelsList(levels) {
    localStorage.setItem('customLevels', JSON.stringify(levels));
}

function showSaveDialog() {
    document.getElementById('level-name-input').value = '';
    showScreen('save-dialog');
}

function confirmSave() {
    const nameInput = document.getElementById('level-name-input');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('请输入关卡名称！');
        return;
    }
    
    const levels = getSavedLevels();
    const levelData = getCurrentLevelData();
    levelData.name = name;
    levelData.id = Date.now();
    
    levels.push(levelData);
    saveLevelsList(levels);
    
    hideDialogs();
    alert('关卡已保存！');
}

function showLoadDialog() {
    const levels = getSavedLevels();
    const listContainer = document.getElementById('saved-levels-list');
    
    if (levels.length === 0) {
        listContainer.innerHTML = '<p style="color:#999;padding:20px;text-align:center;">暂无保存的关卡</p>';
    } else {
        listContainer.innerHTML = levels.map((level, index) => `
            <div class="saved-level-item">
                <span class="saved-level-name">${escapeHtml(level.name)}</span>
                <div class="saved-level-actions">
                    <button class="btn" onclick="loadSavedLevel(${index})">加载</button>
                    <button class="btn delete" onclick="deleteSavedLevel(${index})">删除</button>
                </div>
            </div>
        `).join('');
    }
    
    showScreen('load-dialog');
}

function loadSavedLevel(index) {
    const levels = getSavedLevels();
    if (levels[index]) {
        const levelData = levels[index];
        editor.width = levelData.width;
        editor.height = levelData.height;
        editor.tileMap = levelData.tileMap;
        editor.enemies = levelData.enemies || [];
        editor.collectibles = levelData.collectibles || [];
        editor.cameraX = 0;
        renderEditor();
        hideDialogs();
        alert(`已加载关卡：${levelData.name}`);
    }
}

function deleteSavedLevel(index) {
    const levels = getSavedLevels();
    if (levels[index] && confirm(`确定要删除关卡"${levels[index].name}"吗？`)) {
        levels.splice(index, 1);
        saveLevelsList(levels);
        showLoadDialog();
    }
}

function showShareDialog() {
    const levelData = getCurrentLevelData();
    const jsonStr = JSON.stringify(levelData);
    const base64 = btoa(encodeURIComponent(jsonStr));
    const shareUrl = `${window.location.origin}${window.location.pathname}?level=${base64}`;
    
    document.getElementById('share-link-output').value = shareUrl;
    showScreen('share-dialog');
}

function copyShareLink() {
    const textarea = document.getElementById('share-link-output');
    textarea.select();
    document.execCommand('copy');
    alert('链接已复制到剪贴板！');
}

function showImportDialog() {
    document.getElementById('import-link-input').value = '';
    showScreen('import-dialog');
}

function confirmImport() {
    const input = document.getElementById('import-link-input').value.trim();
    
    if (!input) {
        alert('请粘贴分享链接！');
        return;
    }
    
    try {
        let base64;
        if (input.includes('?level=')) {
            const urlParams = new URLSearchParams(input.split('?')[1]);
            base64 = urlParams.get('level');
        } else {
            base64 = input;
        }
        
        const jsonStr = decodeURIComponent(atob(base64));
        const levelData = JSON.parse(jsonStr);
        
        if (levelData.tileMap && levelData.width && levelData.height) {
            editor.width = levelData.width;
            editor.height = levelData.height;
            editor.tileMap = levelData.tileMap;
            editor.enemies = levelData.enemies || [];
            editor.collectibles = levelData.collectibles || [];
            editor.cameraX = 0;
            renderEditor();
            hideDialogs();
            alert('关卡导入成功！');
        } else {
            throw new Error('无效的关卡数据');
        }
    } catch (e) {
        alert('导入失败：无效的链接或数据格式！');
        console.error(e);
    }
}

function hideDialogs() {
    document.getElementById('save-dialog').classList.remove('active');
    document.getElementById('load-dialog').classList.remove('active');
    document.getElementById('share-dialog').classList.remove('active');
    document.getElementById('import-dialog').classList.remove('active');
    showScreen('editor-screen');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function testLevel() {
    game.levelCoins = 0;
    game.levelGems = 0;
    game.enemies = [];
    game.collectibles = [];
    game.particles = [];
    game.boss = null;
    game.camera.x = 0;
    
    game.levelWidth = editor.width;
    game.levelHeight = editor.height;
    game.tileMap = JSON.parse(JSON.stringify(editor.tileMap));
    
    game.spawnX = 100;
    game.spawnY = 200;
    game.player = createPlayer(game.spawnX, game.spawnY);
    
    for (const enemy of editor.enemies) {
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
    
    for (const item of editor.collectibles) {
        spawnCollectible(item.x, item.y, item.type);
    }
    
    updateHUD();
    showScreen('game-screen');
    game.running = true;
    game.paused = false;
    gameLoop();
}
