const PET_ASCII = {
    cat: {
        normal: `
    /\\_/\\  
   ( o.o ) 
    > ^ <
   /|   |\\
  (_|   |_)
`,
        happy: `
    /\\_/\\  
   ( ^.^ ) 
    > ^ <
   /|   |\\
  (_|   |_)
`,
        sad: `
    /\\_/\\  
   ( T.T ) 
    > _ <
   /|   |\\
  (_|   |_)
`,
        sleeping: `
    /\\_/\\  
   ( -.- ) 
    > _ <
   /|   |\\
  (_|   |_)
     z z
`,
        eating: `
    /\\_/\\  
   ( o.o ) 
    > ω <
   /|   |\\
  (_|   |_)
   🍖
`,
        dead: `
    /\\_/\\  
   ( X.X ) 
    > _ <
   /|   |\\
  (_|   |_)
   R.I.P
`
    },
    dog: {
        normal: `
     / \\__
    (    @\\___
    /         O
   /   (_____/
  /_____/   U
`,
        happy: `
     / \\__
    (    ^\\___
    /         O
   /   (_____/
  /_____/   U
   汪!
`,
        sad: `
     / \\__
    (    T\\___
    /         O
   /   (_____/
  /_____/   U
`,
        sleeping: `
     / \\__
    (    -\\___
    /         O
   /   (_____/
  /_____/   U
   z z
`,
        eating: `
     / \\__
    (    o\\___
    /         O
   /   (_____/
  /_____/   U
   🦴
`,
        dead: `
     / \\__
    (    X\\___
    /         O
   /   (_____/
  /_____/   U
   R.I.P
`
    },
    bird: {
        normal: `
      ___
     /   \\
    |  o  |
    \\  ^  /
     |||||
     |||||
`,
        happy: `
      ___
     /   \\
    |  ^  |
    \\  ^  /
     |||||
    啾啾!
`,
        sad: `
      ___
     /   \\
    |  T  |
    \\  _  /
     |||||
     |||||
`,
        sleeping: `
      ___
     /   \\
    |  -  |
    \\  _  /
     |||||
     z z
`,
        eating: `
      ___
     /   \\
    |  o  |
    \\  ω  /
     |||||
    🐛
`,
        dead: `
      ___
     /   \\
    |  X  |
    \\  _  /
     |||||
   R.I.P
`
    },
    rabbit: {
        normal: `
    (\\ /)
    ( . .)
    c(\")(\")
   /|   |\\
  (_|   |_)
`,
        happy: `
    (\\ /)
    ( ^.^)
    c(\")(\")
   /|   |\\
  (_|   |_)
`,
        sad: `
    (\\ /)
    ( T.T)
    c(\")(\")
   /|   |\\
  (_|   |_)
`,
        sleeping: `
    (\\ /)
    ( -.-)
    c(\")(\")
   /|   |\\
  (_|   |_)
    z z
`,
        eating: `
    (\\ /)
    ( o.o)
    c(\")(\")
   /|   |\\
  (_|   |_)
   🥕
`,
        dead: `
    (\\ /)
    ( X.X)
    c(\")(\")
   /|   |\\
  (_|   |_)
   R.I.P
`
    }
};

const FOODS = [
    { id: 'rice', name: '米饭', emoji: '🍚', hunger: 25, happiness: 5, health: 5, energy: 10 },
    { id: 'fish', name: '鱼肉', emoji: '🐟', hunger: 30, happiness: 15, health: 10, energy: 15 },
    { id: 'cake', name: '蛋糕', emoji: '🎂', hunger: 15, happiness: 25, health: -5, energy: 20 },
    { id: 'chocolate', name: '巧克力', emoji: '🍫', hunger: 10, happiness: 30, health: -10, energy: 25 },
    { id: 'apple', name: '苹果', emoji: '🍎', hunger: 15, happiness: 10, health: 15, energy: 10 },
    { id: 'carrot', name: '胡萝卜', emoji: '🥕', hunger: 20, happiness: 5, health: 20, energy: 10 },
    { id: 'meat', name: '烤肉', emoji: '🍖', hunger: 35, happiness: 10, health: 5, energy: 20 },
    { id: 'bread', name: '面包', emoji: '🍞', hunger: 20, happiness: 5, health: 5, energy: 15 },
    { id: 'milk', name: '牛奶', emoji: '🥛', hunger: 15, happiness: 10, health: 15, energy: 10 },
    { id: 'candy', name: '糖果', emoji: '🍬', hunger: 5, happiness: 20, health: -5, energy: 15 }
];

const GAMES = [
    { id: 'ball', name: '抛球游戏', emoji: '⚽' },
    { id: 'dice', name: '叠骰子', emoji: '🎲' },
    { id: 'draw', name: '棒画图', emoji: '🎨' }
];

const PET_TYPES = {
    cat: { name: '猫咪', emoji: '🐱' },
    dog: { name: '狗狗', emoji: '🐶' },
    bird: { name: '小鸟', emoji: '🐦' },
    rabbit: { name: '兔子', emoji: '🐰' }
};

let gameState = {
    currentPetId: null,
    pets: []
};

class Pet {
    constructor(id, type, name) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.stats = {
            hunger: 80,
            happiness: 80,
            health: 100,
            cleanliness: 90,
            energy: 85
        };
        this.isAlive = true;
        this.isSleeping = false;
        this.createdAt = Date.now();
        this.lastUpdate = Date.now();
    }
}

class Database {
    constructor() {
        this.dbName = 'TamagotchiDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('pets')) {
                    const store = db.createObjectStore('pets', { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    async savePet(pet) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pets'], 'readwrite');
            const store = transaction.objectStore('pets');
            const request = store.put(pet);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllPets() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pets'], 'readonly');
            const store = transaction.objectStore('pets');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deletePet(petId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pets'], 'readwrite');
            const store = transaction.objectStore('pets');
            const request = store.delete(petId);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

const db = new Database();

function getCurrentPet() {
    return gameState.pets.find(p => p.id === gameState.currentPetId);
}

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function getPetAge(pet) {
    const ageMs = Date.now() - pet.createdAt;
    const ageMinutes = ageMs / (1000 * 60);
    const days = Math.floor(ageMinutes / (60 * 24));
    const hours = Math.floor((ageMinutes % (60 * 24)) / 60);
    return { days, hours, ageMinutes };
}

function updatePetStats() {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;

    const now = Date.now();
    const timeDiff = (now - pet.lastUpdate) / 1000;
    const decayRate = timeDiff / 60;
    const age = getPetAge(pet);
    const ageDecayMultiplier = (100 + age.days) / 100;

    if (!pet.isSleeping) {
        pet.stats.hunger = clamp(pet.stats.hunger - 2 * decayRate);
        pet.stats.happiness = clamp(pet.stats.happiness - 1.5 * decayRate);
        pet.stats.cleanliness = clamp(pet.stats.cleanliness - 1 * decayRate);
        pet.stats.energy = clamp(pet.stats.energy - 1 * decayRate * ageDecayMultiplier);
    } else {
        pet.stats.energy = clamp(pet.stats.energy + 3 * decayRate / ageDecayMultiplier);
        pet.stats.hunger = clamp(pet.stats.hunger - 0.5 * decayRate);
    }

    if (pet.stats.hunger < 20) {
        pet.stats.health = clamp(pet.stats.health - 2 * decayRate);
    }
    if (pet.stats.happiness < 20) {
        pet.stats.health = clamp(pet.stats.health - 1 * decayRate);
    }
    if (pet.stats.cleanliness < 20) {
        pet.stats.health = clamp(pet.stats.health - 1.5 * decayRate);
    }

    const allStatsZero = 
        pet.stats.hunger <= 0 && 
        pet.stats.happiness <= 0 && 
        pet.stats.health <= 0 && 
        pet.stats.cleanliness <= 0 && 
        pet.stats.energy <= 0;

    if (pet.stats.health <= 0 || allStatsZero) {
        pet.isAlive = false;
        showDeathModal();
    }

    pet.lastUpdate = now;
    updateUI();
    saveCurrentPet();
}

function getPetMood() {
    const pet = getCurrentPet();
    if (!pet) return 'normal';
    if (!pet.isAlive) return 'dead';
    if (pet.isSleeping) return 'sleeping';
    
    const avgStats = (pet.stats.hunger + pet.stats.happiness + pet.stats.health + pet.stats.cleanliness + pet.stats.energy) / 5;
    
    if (avgStats > 70) return 'happy';
    if (avgStats < 30) return 'sad';
    return 'normal';
}

function updateUI() {
    const pet = getCurrentPet();
    if (!pet) return;

    document.getElementById('petName').textContent = pet.name;
    document.getElementById('petType').textContent = PET_TYPES[pet.type].emoji;

    const age = getPetAge(pet);
    document.getElementById('ageDisplay').textContent = `🎂 活了 ${age.days} 天 ${age.hours} 小时`;

    const stats = ['hunger', 'happiness', 'health', 'cleanliness', 'energy'];
    stats.forEach(stat => {
        const value = Math.round(pet.stats[stat]);
        document.getElementById(`${stat}Value`).textContent = value;
        const bar = document.getElementById(`${stat}Bar`);
        bar.style.width = `${value}%`;
        
        bar.classList.remove('low', 'medium');
        if (value < 30) bar.classList.add('low');
        else if (value < 60) bar.classList.add('medium');
    });

    const mood = getPetMood();
    const petAscii = PET_ASCII[pet.type][mood] || PET_ASCII[pet.type].normal;
    document.getElementById('asciiPet').textContent = petAscii;

    const statusTexts = {
        happy: '好开心呀！',
        sad: '有点难过...',
        normal: pet.isSleeping ? '正在睡觉...' : '状态不错~',
        dead: '去了天堂...',
        sleeping: '正在睡觉...',
        eating: '好好吃！'
    };
    document.getElementById('petStatus').textContent = statusTexts[mood] || '状态不错~';
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showFoodMenu() {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;
    
    const grid = document.getElementById('foodGrid');
    grid.innerHTML = '';
    
    FOODS.forEach(food => {
        const item = document.createElement('div');
        item.className = 'food-item';
        item.innerHTML = `
            <span class="food-emoji">${food.emoji}</span>
            <span class="food-name">${food.name}</span>
            <div class="food-effect">
                饥饿+${food.hunger} 心情+${food.happiness}
            </div>
        `;
        item.onclick = () => feedPet(food);
        grid.appendChild(item);
    });
    
    showModal('foodModal');
}

function feedPet(food) {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;

    pet.stats.hunger = clamp(pet.stats.hunger + food.hunger);
    pet.stats.happiness = clamp(pet.stats.happiness + food.happiness);
    pet.stats.health = clamp(pet.stats.health + food.health);
    pet.stats.energy = clamp(pet.stats.energy + food.energy);
    pet.stats.cleanliness = clamp(pet.stats.cleanliness - 3);

    document.getElementById('asciiPet').textContent = PET_ASCII[pet.type].eating;
    document.getElementById('petStatus').textContent = `正在吃${food.name}...`;

    setTimeout(() => {
        updateUI();
    }, 1500);

    hideModal('foodModal');
    saveCurrentPet();
}

function showGameMenu() {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;
    
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';
    
    GAMES.forEach(game => {
        const item = document.createElement('div');
        item.className = 'game-item';
        item.innerHTML = `
            <span class="game-emoji">${game.emoji}</span>
            <span class="game-name">${game.name}</span>
        `;
        item.onclick = () => startMiniGame(game.id);
        grid.appendChild(item);
    });
    
    showModal('gameModal');
}

function startMiniGame(gameId) {
    hideModal('gameModal');
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;

    if (pet.stats.energy < 10) {
        alert('宠物太累了，需要休息一下！');
        return;
    }

    const titles = { ball: '⚽ 抛球游戏', dice: '🎲 叠骰子', draw: '🎨 棒画图' };
    document.getElementById('miniGameTitle').textContent = titles[gameId];
    showModal('miniGameModal');

    if (gameId === 'ball') startBallGame();
    else if (gameId === 'dice') startDiceGame();
    else if (gameId === 'draw') startDrawGame();
}

function startBallGame() {
    const area = document.getElementById('miniGameArea');
    let score = 0;
    let timeLeft = 15;

    area.innerHTML = `
        <div class="ball-game" id="ballGameArea">
            <div class="ball" id="ball"></div>
        </div>
    `;

    const ball = document.getElementById('ball');
    const gameArea = document.getElementById('ballGameArea');
    const scoreEl = document.getElementById('miniGameScore');
    
    function moveBall() {
        const x = Math.random() * (gameArea.offsetWidth - 30);
        const y = Math.random() * (gameArea.offsetHeight - 30);
        ball.style.left = x + 'px';
        ball.style.top = y + 'px';
    }

    ball.onclick = () => {
        score++;
        scoreEl.textContent = `得分: ${score} | 时间: ${timeLeft}s`;
        moveBall();
    };

    scoreEl.textContent = `得分: ${score} | 时间: ${timeLeft}s`;
    moveBall();

    const timer = setInterval(() => {
        timeLeft--;
        scoreEl.textContent = `得分: ${score} | 时间: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            finishMiniGame(score, 'ball');
        }
    }, 1000);
}

function startDiceGame() {
    const area = document.getElementById('miniGameArea');
    let score = 0;
    let rolls = 0;
    const maxRolls = 10;
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    area.innerHTML = `
        <div class="dice-game">
            <div class="dice" id="dice">🎲</div>
            <div>目标：投出最大的点数！</div>
            <button class="dice-btn" id="rollDice">投骰子</button>
        </div>
    `;

    const diceEl = document.getElementById('dice');
    const rollBtn = document.getElementById('rollDice');
    const scoreEl = document.getElementById('miniGameScore');
    
    scoreEl.textContent = `回合: ${rolls}/${maxRolls} | 总分: ${score}`;

    rollBtn.onclick = () => {
        if (rolls >= maxRolls) return;
        
        diceEl.style.animation = 'none';
        diceEl.offsetHeight;
        diceEl.style.animation = 'diceRoll 0.5s ease';
        
        setTimeout(() => {
            const result = Math.floor(Math.random() * 6) + 1;
            diceEl.textContent = diceEmojis[result - 1];
            score += result;
            rolls++;
            scoreEl.textContent = `回合: ${rolls}/${maxRolls} | 总分: ${score}`;
            
            if (rolls >= maxRolls) {
                rollBtn.disabled = true;
                setTimeout(() => finishMiniGame(score, 'dice'), 1000);
            }
        }, 500);
    };
}

function startDrawGame() {
    const area = document.getElementById('miniGameArea');
    const targets = ['爱心', '星星', '笑脸', '小花'];
    const target = targets[Math.floor(Math.random() * targets.length)];
    let score = 0;
    const maxPixels = 20;
    let filledPixels = 0;

    area.innerHTML = `
        <div class="draw-game">
            <div class="draw-target">请画出：${target}</div>
            <div class="draw-canvas" id="drawCanvas"></div>
            <div>点击像素来绘画 (${filledPixels}/${maxPixels})</div>
            <button class="dice-btn" id="finishDraw">完成</button>
        </div>
    `;

    const canvas = document.getElementById('drawCanvas');
    const scoreEl = document.getElementById('miniGameScore');
    
    for (let i = 0; i < 64; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'draw-pixel';
        pixel.onclick = () => {
            if (!pixel.classList.contains('active') && filledPixels < maxPixels) {
                pixel.classList.add('active');
                filledPixels++;
                score += 5;
                scoreEl.textContent = `得分: ${score} | 像素: ${filledPixels}/${maxPixels}`;
            } else if (pixel.classList.contains('active')) {
                pixel.classList.remove('active');
                filledPixels--;
                score -= 5;
                scoreEl.textContent = `得分: ${score} | 像素: ${filledPixels}/${maxPixels}`;
            }
        };
        canvas.appendChild(pixel);
    }

    scoreEl.textContent = `得分: ${score} | 像素: ${filledPixels}/${maxPixels}`;

    document.getElementById('finishDraw').onclick = () => {
        finishMiniGame(score, 'draw');
    };
}

function finishMiniGame(score, gameType) {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;

    const happinessGain = Math.min(30, Math.floor(score / 2) + 10);
    const energyCost = Math.floor(Math.random() * 10) + 10;
    
    pet.stats.happiness = clamp(pet.stats.happiness + happinessGain);
    pet.stats.energy = clamp(pet.stats.energy - energyCost);
    pet.stats.hunger = clamp(pet.stats.hunger - 5);

    setTimeout(() => {
        hideModal('miniGameModal');
        updateUI();
        saveCurrentPet();
        alert(`游戏结束！得分: ${score}\n心情 +${happinessGain}，体力 -${energyCost}`);
    }, 500);
}

function cleanPet() {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;

    pet.stats.cleanliness = clamp(pet.stats.cleanliness + 40);
    pet.stats.happiness = clamp(pet.stats.happiness + 10);
    pet.stats.energy = clamp(pet.stats.energy - 5);

    document.getElementById('petStatus').textContent = '洗得香香的~';
    updateUI();
    saveCurrentPet();
}

function sleepPet() {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;

    pet.isSleeping = !pet.isSleeping;
    
    if (pet.isSleeping) {
        document.getElementById('sleepBtn').textContent = '☀️ 叫醒';
        document.getElementById('petStatus').textContent = '开始睡觉...';
    } else {
        document.getElementById('sleepBtn').textContent = '😴 睡觉';
        document.getElementById('petStatus').textContent = '睡醒啦！';
    }
    
    updateUI();
    saveCurrentPet();
}

function studyPet() {
    const pet = getCurrentPet();
    if (!pet || !pet.isAlive) return;

    if (pet.stats.energy < 15) {
        alert('宠物太累了，学不动了！');
        return;
    }

    pet.stats.happiness = clamp(pet.stats.happiness - 10);
    pet.stats.energy = clamp(pet.stats.energy - 20);
    pet.stats.health = clamp(pet.stats.health + 5);
    pet.stats.hunger = clamp(pet.stats.hunger - 10);

    document.getElementById('petStatus').textContent = '努力学习中...';
    updateUI();
    saveCurrentPet();

    setTimeout(() => {
        document.getElementById('petStatus').textContent = '学会了新技能！';
        pet.stats.happiness = clamp(pet.stats.happiness + 15);
        updateUI();
        saveCurrentPet();
    }, 2000);
}

function showDeathModal() {
    showModal('deathModal');
}

function showPetSelectModal() {
    const grid = document.getElementById('petSelectGrid');
    grid.innerHTML = '';
    
    gameState.pets.forEach(pet => {
        const item = document.createElement('div');
        item.className = 'pet-select-item';
        const status = pet.isAlive ? (pet.isSleeping ? '😴' : '❤️') : '💀';
        item.innerHTML = `
            <div style="font-size: 24px;">${PET_TYPES[pet.type].emoji}</div>
            <div>${pet.name}</div>
            <div style="font-size: 10px;">${status} ${pet.isAlive ? '健康: ' + Math.round(pet.stats.health) : '已离世'}</div>
        `;
        item.onclick = () => {
            if (pet.isAlive) {
                gameState.currentPetId = pet.id;
                updateUI();
                hideModal('petSelectModal');
                localStorage.setItem('currentPetId', pet.id);
            } else {
                if (confirm(`${pet.name}已经离世了，要埋葬它吗？`)) {
                    buryPet(pet.id);
                }
            }
        };
        grid.appendChild(item);
    });

    const newPetItem = document.createElement('div');
    newPetItem.className = 'pet-select-item';
    newPetItem.innerHTML = `
        <div style="font-size: 24px;">➕</div>
        <div>领养新宠物</div>
    `;
    newPetItem.onclick = () => {
        hideModal('petSelectModal');
        showNewPetModal();
    };
    grid.appendChild(newPetItem);

    showModal('petSelectModal');
}

function showNewPetModal() {
    showModal('newPetModal');
}

function createNewPet(type) {
    const id = 'pet_' + Date.now();
    const names = {
        cat: ['小猫咪', '咪咪', '花花', '球球'],
        dog: ['小狗狗', '旺财', '大黄', '豆豆'],
        bird: ['小鸟儿', '啾啾', '花花', '飞飞'],
        rabbit: ['小兔子', '白白', '蹦蹦', '跳跳']
    };
    const name = names[type][Math.floor(Math.random() * names[type].length)];
    
    const pet = new Pet(id, type, name);
    gameState.pets.push(pet);
    gameState.currentPetId = id;
    
    hideModal('newPetModal');
    updateUI();
    saveCurrentPet();
    localStorage.setItem('currentPetId', id);
}

function buryPet(petId) {
    db.deletePet(petId).then(() => {
        gameState.pets = gameState.pets.filter(p => p.id !== petId);
        if (gameState.currentPetId === petId) {
            if (gameState.pets.length > 0) {
                const alivePets = gameState.pets.filter(p => p.isAlive);
                gameState.currentPetId = alivePets.length > 0 ? alivePets[0].id : gameState.pets[0].id;
            } else {
                showNewPetModal();
            }
        }
        showPetSelectModal();
        updateUI();
    });
}

function restartGame() {
    hideModal('deathModal');
    const pet = getCurrentPet();
    if (pet) {
        db.deletePet(pet.id).then(() => {
            gameState.pets = gameState.pets.filter(p => p.id !== pet.id);
            showNewPetModal();
        });
    } else {
        showNewPetModal();
    }
}

async function saveCurrentPet() {
    const pet = getCurrentPet();
    if (pet) {
        await db.savePet(pet);
    }
}

async function initGame() {
    await db.init();
    
    const savedPets = await db.getAllPets();
    gameState.pets = savedPets;
    
    const savedCurrentId = localStorage.getItem('currentPetId');
    const alivePets = gameState.pets.filter(p => p.isAlive);
    
    if (alivePets.length > 0) {
        if (savedCurrentId && alivePets.find(p => p.id === savedCurrentId)) {
            gameState.currentPetId = savedCurrentId;
        } else {
            gameState.currentPetId = alivePets[0].id;
        }
        updateUI();
    } else {
        showNewPetModal();
    }

    setInterval(updatePetStats, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();

    document.getElementById('feedBtn').onclick = showFoodMenu;
    document.getElementById('playBtn').onclick = showGameMenu;
    document.getElementById('cleanBtn').onclick = cleanPet;
    document.getElementById('sleepBtn').onclick = sleepPet;
    document.getElementById('studyBtn').onclick = studyPet;
    document.getElementById('switchBtn').onclick = showPetSelectModal;

    document.getElementById('closeFoodModal').onclick = () => hideModal('foodModal');
    document.getElementById('closeGameModal').onclick = () => hideModal('gameModal');
    document.getElementById('closeMiniGame').onclick = () => hideModal('miniGameModal');
    document.getElementById('closePetSelect').onclick = () => hideModal('petSelectModal');
    document.getElementById('restartBtn').onclick = restartGame;

    document.querySelectorAll('.pet-type-btn').forEach(btn => {
        btn.onclick = () => createNewPet(btn.dataset.type);
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };
    });
});
