const Games = {
    SNAKE: 'snake',
    SPACE: 'space',
    MAZE: 'maze',
    SOKOBAN: 'sokoban',
    MATH: 'math'
};

const GameNames = {
    [Games.SNAKE]: '贪食蛇',
    [Games.SPACE]: '太空射击',
    [Games.MAZE]: '迷宫探险',
    [Games.SOKOBAN]: '推箱子',
    [Games.MATH]: '计算挑战'
};

const Themes = {
    GREEN: 'green',
    AMBER: 'amber',
    BLUE: 'blue'
};

let currentTheme = Themes.GREEN;
let currentGame = null;
let gameInterval = null;
let gameState = {};

const terminal = document.getElementById('terminal');
const output = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const gameContainer = document.getElementById('game-container');
const gameScreen = document.getElementById('game-screen');
const gameTitle = document.getElementById('game-title');
const gameScore = document.getElementById('game-score');
const gameStatus = document.getElementById('game-status');

function init() {
    document.body.className = `theme-${currentTheme}`;
    printWelcome();
    commandInput.focus();
    commandInput.addEventListener('keydown', handleCommandKey);
    document.addEventListener('keydown', handleGameKey);
    initDB();
}

function printWelcome() {
    const art = `
 █████╗ ███████╗ ██████╗██╗██╗    ████████╗███████╗██████╗ ███╗   ███╗
██╔══██╗██╔════╝██╔════╝██║██║    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
███████║███████╗██║     ██║██║       ██║   █████╗  ██████╔╝██╔████╔██║
██╔══██║╚════██║██║     ██║██║       ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
██║  ██║███████║╚██████╗██║███████╗  ██║   ███████╗██║  ██║██║ ╚═╝ ██║
╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚══════╝  ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
`;
    print(art, 'output-dim');
    print('');
    print('  欢迎来到 ASCII 终端游戏集合 v1.0');
    print('  输入 "help" 查看可用命令，输入 "menu" 显示游戏菜单');
    print('');
}

function print(text, className = 'output-line') {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function printHTML(html, className = 'output-line') {
    const line = document.createElement('div');
    line.className = className;
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function handleCommandKey(e) {
    if (e.key === 'Enter') {
        const cmd = commandInput.value.trim();
        commandInput.value = '';
        print(`> ${cmd}`, 'output-dim');
        executeCommand(cmd);
    }
}

function executeCommand(cmd) {
    const parts = cmd.toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
        case 'help':
            showHelp();
            break;
        case 'menu':
            showMenu();
            break;
        case 'play':
            if (args.length > 0) {
                startGame(args[0]);
            } else {
                print('请指定游戏: play <game_name>', 'output-error');
                print('可用游戏: snake, space, maze, sokoban, math', 'output-dim');
            }
            break;
        case 'score':
        case 'scores':
            showScores(args[0]);
            break;
        case 'cls':
        case 'clear':
            clearScreen();
            break;
        case 'theme':
            if (args.length > 0) {
                setTheme(args[0]);
            } else {
                print('当前主题: ' + currentTheme, 'output-line');
                print('可用主题: green, amber, blue', 'output-dim');
            }
            break;
        case 'exit':
        case 'quit':
            if (currentGame) {
                stopGame();
            }
            print('再见! 按 F5 重新开始。', 'output-line');
            break;
        default:
            if (command) {
                print(`未知命令: ${command}。输入 help 查看命令列表。`, 'output-error');
            }
    }
}

function showHelp() {
    print('');
    print('  ╔════════════════════════════════════════╗');
    print('  ║         可用命令列表                   ║');
    print('  ╠════════════════════════════════════════╣');
    print('  ║ help     - 显示此帮助信息              ║');
    print('  ║ menu     - 显示游戏菜单                ║');
    print('  ║ play     - 启动游戏                    ║');
    print('  ║            用法: play <game_name>      ║');
    print('  ║            例如: play snake            ║');
    print('  ║ score    - 查看高分榜                  ║');
    print('  ║            用法: score <game_name>     ║');
    print('  ║ cls      - 清屏                        ║');
    print('  ║ theme    - 切换主题                    ║');
    print('  ║            用法: theme <color>         ║');
    print('  ║            颜色: green, amber, blue    ║');
    print('  ║ exit     - 退出当前游戏                ║');
    print('  ╚════════════════════════════════════════╝');
    print('');
    print('  游戏控制:');
    print('    WASD 或 方向键 - 移动');
    print('    空格键        - 射击/确认');
    print('    ESC           - 返回菜单');
    print('');
}

function showMenu() {
    print('');
    print('  ╔════════════════════════════════════════╗');
    print('  ║          游戏菜单                      ║');
    print('  ╠════════════════════════════════════════╣');
    print('  ║  1. 贪食蛇      (play snake)           ║');
    print('  ║  2. 太空射击    (play space)           ║');
    print('  ║  3. 迷宫探险    (play maze)            ║');
    print('  ║  4. 推箱子      (play sokoban)         ║');
    print('  ║  5. 计算挑战    (play math)            ║');
    print('  ╚════════════════════════════════════════╝');
    print('');
    print('  输入 "play <游戏名>" 开始游戏');
    print('');
}

function clearScreen() {
    output.innerHTML = '';
}

function setTheme(theme) {
    if (Themes[theme.toUpperCase()]) {
        currentTheme = Themes[theme.toUpperCase()];
        document.body.className = `theme-${currentTheme}`;
        print(`主题已切换为: ${currentTheme}`, 'output-success');
    } else {
        print(`未知主题: ${theme}`, 'output-error');
        print('可用主题: green, amber, blue', 'output-dim');
    }
}

let db = null;

function initDB() {
    const request = indexedDB.open('GameScoresDB', 1);
    
    request.onerror = (e) => console.error('IndexedDB 错误:', e);
    
    request.onsuccess = (e) => {
        db = e.target.result;
    };
    
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        Object.values(Games).forEach(game => {
            if (!db.objectStoreNames.contains(game)) {
                const store = db.createObjectStore(game, { keyPath: 'id', autoIncrement: true });
                store.createIndex('score', 'score', { unique: false });
            }
        });
    };
}

function saveScore(game, score, name = 'Player') {
    if (!db) return;
    
    const transaction = db.transaction([game], 'readwrite');
    const store = transaction.objectStore(game);
    const request = store.add({ name, score, date: new Date().toISOString() });
    
    request.onerror = (e) => console.error('保存分数失败:', e);
}

function getScores(game, callback) {
    if (!db) {
        callback([]);
        return;
    }
    
    const transaction = db.transaction([game], 'readonly');
    const store = transaction.objectStore(game);
    const index = store.index('score');
    const request = index.openCursor(null, 'prev');
    
    const scores = [];
    request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor && scores.length < 5) {
            scores.push(cursor.value);
            cursor.continue();
        } else {
            callback(scores);
        }
    };
    
    request.onerror = (e) => {
        console.error('获取分数失败:', e);
        callback([]);
    };
}

function showScores(game) {
    if (game && Games[game.toUpperCase()]) {
        const gameKey = Games[game.toUpperCase()];
        getScores(gameKey, (scores) => {
            print('');
            print(`  ╔═══════════════════════════════════╗`);
            print(`  ║  ${GameNames[gameKey]} 高分榜          ║`);
            print(`  ╠═══════════════════════════════════╣`);
            if (scores.length === 0) {
                print(`  ║     暂无记录                       ║`);
            } else {
                scores.forEach((s, i) => {
                    const rank = `${i + 1}.`;
                    const name = s.name.padEnd(10, ' ');
                    const score = String(s.score).padStart(8, ' ');
                    print(`  ║  ${rank} ${name} ${score}     ║`);
                });
            }
            print(`  ╚═══════════════════════════════════╝`);
            print('');
        });
    } else {
        print('请指定游戏: score <game_name>', 'output-error');
        print('可用游戏: snake, space, maze, sokoban, math', 'output-dim');
    }
}

function startGame(game) {
    const gameKey = Games[game.toUpperCase()];
    if (!gameKey) {
        print(`未知游戏: ${game}`, 'output-error');
        print('可用游戏: snake, space, maze, sokoban, math', 'output-dim');
        return;
    }
    
    currentGame = gameKey;
    terminal.style.display = 'none';
    gameContainer.style.display = 'flex';
    gameTitle.textContent = GameNames[gameKey];
    
    switch (gameKey) {
        case Games.SNAKE:
            startSnakeGame();
            break;
        case Games.SPACE:
            startSpaceGame();
            break;
        case Games.MAZE:
            startMazeGame();
            break;
        case Games.SOKOBAN:
            startSokobanGame();
            break;
        case Games.MATH:
            startMathGame();
            break;
    }
}

function stopGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    currentGame = null;
    gameState = {};
    gameContainer.style.display = 'none';
    terminal.style.display = 'block';
    commandInput.focus();
}

function updateScore(score) {
    gameScore.textContent = `SCORE: ${score}`;
}

function handleGameKey(e) {
    if (!currentGame) return;
    
    if (e.key === 'Escape') {
        stopGame();
        return;
    }
    
    switch (currentGame) {
        case Games.SNAKE:
            handleSnakeKey(e);
            break;
        case Games.SPACE:
            handleSpaceKey(e);
            break;
        case Games.MAZE:
            handleMazeKey(e);
            break;
        case Games.SOKOBAN:
            handleSokobanKey(e);
            break;
        case Games.MATH:
            handleMathKey(e);
            break;
    }
}

const SNAKE_WIDTH = 40;
const SNAKE_HEIGHT = 20;

function startSnakeGame() {
    gameState = {
        snake: [{ x: 20, y: 10 }],
        food: { x: 15, y: 10 },
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        score: 0,
        speed: 150,
        gameOver: false
    };
    
    spawnSnakeFood();
    updateScore(0);
    gameStatus.textContent = 'WASD/方向键移动 | 吃*得分 | 撞墙或自己结束';
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateSnakeGame, gameState.speed);
    drawSnakeGame();
}

function spawnSnakeFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * SNAKE_WIDTH),
            y: Math.floor(Math.random() * SNAKE_HEIGHT)
        };
    } while (gameState.snake.some(s => s.x === newFood.x && s.y === newFood.y));
    gameState.food = newFood;
}

function handleSnakeKey(e) {
    if (gameState.gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
            if (gameState.score > 0) {
                saveScore(Games.SNAKE, gameState.score);
            }
            startSnakeGame();
        }
        return;
    }
    
    const dir = gameState.direction;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dir.y !== 1) gameState.nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dir.y !== -1) gameState.nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dir.x !== 1) gameState.nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dir.x !== -1) gameState.nextDirection = { x: 1, y: 0 };
            break;
    }
}

function updateSnakeGame() {
    if (gameState.gameOver) return;
    
    gameState.direction = gameState.nextDirection;
    const head = { ...gameState.snake[0] };
    head.x += gameState.direction.x;
    head.y += gameState.direction.y;
    
    if (head.x < 0 || head.x >= SNAKE_WIDTH || head.y < 0 || head.y >= SNAKE_HEIGHT) {
        endSnakeGame();
        return;
    }
    
    if (gameState.snake.some(s => s.x === head.x && s.y === head.y)) {
        endSnakeGame();
        return;
    }
    
    gameState.snake.unshift(head);
    
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        updateScore(gameState.score);
        spawnSnakeFood();
        
        if (gameState.speed > 50) {
            gameState.speed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(updateSnakeGame, gameState.speed);
        }
    } else {
        gameState.snake.pop();
    }
    
    drawSnakeGame();
}

function endSnakeGame() {
    gameState.gameOver = true;
    clearInterval(gameInterval);
    if (gameState.score > 0) {
        saveScore(Games.SNAKE, gameState.score);
    }
    drawSnakeGame();
    gameStatus.textContent = '游戏结束! 按空格/回车重新开始 | ESC 返回';
}

function drawSnakeGame() {
    let screen = '';
    
    screen += '╔' + '═'.repeat(SNAKE_WIDTH) + '╗\n';
    
    for (let y = 0; y < SNAKE_HEIGHT; y++) {
        let line = '║';
        for (let x = 0; x < SNAKE_WIDTH; x++) {
            const isHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
            const isBody = gameState.snake.slice(1).some(s => s.x === x && s.y === y);
            const isFood = gameState.food.x === x && gameState.food.y === y;
            
            if (gameState.gameOver) {
                if (isHead) line += 'X';
                else if (isBody) line += 'x';
                else if (isFood) line += '*';
                else line += ' ';
            } else {
                if (isHead) line += '@';
                else if (isBody) line += 'O';
                else if (isFood) line += '*';
                else line += ' ';
            }
        }
        line += '║\n';
        screen += line;
    }
    
    screen += '╚' + '═'.repeat(SNAKE_WIDTH) + '╝\n';
    
    if (gameState.gameOver) {
        screen += '\n           GAME OVER!\n';
        screen += `        最终得分: ${gameState.score}\n`;
        screen += '    按 空格 或 回车 重新开始\n';
    }
    
    gameScreen.textContent = screen;
}

const SPACE_WIDTH = 40;
const SPACE_HEIGHT = 20;

function startSpaceGame() {
    gameState = {
        player: { x: 20, y: SPACE_HEIGHT - 2 },
        bullets: [],
        enemies: [],
        score: 0,
        lives: 3,
        enemyTimer: 0,
        gameOver: false,
        won: false
    };
    
    updateScore(0);
    gameStatus.textContent = 'WASD/方向键移动 | 空格射击 | 消灭敌人';
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateSpaceGame, 100);
    drawSpaceGame();
}

function handleSpaceKey(e) {
    if (gameState.gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
            if (gameState.score > 0) {
                saveScore(Games.SPACE, gameState.score);
            }
            startSpaceGame();
        }
        return;
    }
    
    const p = gameState.player;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (p.y > 1) p.y--;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (p.y < SPACE_HEIGHT - 2) p.y++;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (p.x > 1) p.x--;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (p.x < SPACE_WIDTH - 2) p.x++;
            break;
        case ' ':
            e.preventDefault();
            if (gameState.bullets.length < 5) {
                gameState.bullets.push({ x: p.x, y: p.y - 1 });
            }
            break;
    }
    drawSpaceGame();
}

function updateSpaceGame() {
    if (gameState.gameOver) return;
    
    gameState.bullets = gameState.bullets.filter(b => {
        b.y--;
        return b.y > 0;
    });
    
    gameState.enemyTimer++;
    if (gameState.enemyTimer >= 8) {
        gameState.enemyTimer = 0;
        gameState.enemies.push({
            x: Math.floor(Math.random() * (SPACE_WIDTH - 4)) + 2,
            y: 0
        });
    }
    
    gameState.enemies = gameState.enemies.filter(e => {
        e.y++;
        return e.y < SPACE_HEIGHT;
    });
    
    gameState.bullets.forEach(b => {
        const hitIndex = gameState.enemies.findIndex(e => 
            Math.abs(e.x - b.x) <= 1 && e.y === b.y
        );
        if (hitIndex !== -1) {
            gameState.enemies.splice(hitIndex, 1);
            b.y = -1;
            gameState.score += 25;
            updateScore(gameState.score);
        }
    });
    
    gameState.bullets = gameState.bullets.filter(b => b.y > 0);
    
    const hitPlayer = gameState.enemies.find(e => 
        Math.abs(e.x - gameState.player.x) <= 1 && 
        Math.abs(e.y - gameState.player.y) <= 1
    );
    
    if (hitPlayer) {
        gameState.lives--;
        gameState.enemies = gameState.enemies.filter(e => e !== hitPlayer);
        if (gameState.lives <= 0) {
            endSpaceGame();
            return;
        }
    }
    
    drawSpaceGame();
}

function endSpaceGame() {
    gameState.gameOver = true;
    clearInterval(gameInterval);
    if (gameState.score > 0) {
        saveScore(Games.SPACE, gameState.score);
    }
    drawSpaceGame();
    gameStatus.textContent = '游戏结束! 按空格/回车重新开始 | ESC 返回';
}

function drawSpaceGame() {
    let screen = '';
    
    screen += '╔' + '═'.repeat(SPACE_WIDTH) + '╗\n';
    
    for (let y = 0; y < SPACE_HEIGHT; y++) {
        let line = '║';
        for (let x = 0; x < SPACE_WIDTH; x++) {
            const isPlayer = gameState.player.x === x && gameState.player.y === y;
            const isBullet = gameState.bullets.some(b => b.x === x && b.y === y);
            const isEnemy = gameState.enemies.some(e => e.x === x && e.y === y);
            
            if (gameState.gameOver && isPlayer) {
                line += 'X';
            } else if (isPlayer) {
                line += 'V';
            } else if (isBullet) {
                line += '|';
            } else if (isEnemy) {
                line += 'M';
            } else if (Math.random() < 0.02) {
                line += '.';
            } else {
                line += ' ';
            }
        }
        line += '║\n';
        screen += line;
    }
    
    screen += '╚' + '═'.repeat(SPACE_WIDTH) + '╝\n';
    
    screen += `  生命: ${'❤'.repeat(gameState.lives)}${' '.repeat(5)}分数: ${gameState.score}\n`;
    
    if (gameState.gameOver) {
        screen += '\n           GAME OVER!\n';
        screen += `        最终得分: ${gameState.score}\n`;
        screen += '    按 空格 或 回车 重新开始\n';
    }
    
    gameScreen.textContent = screen;
}

const MAZE_LEVELS = [
    [
        '##########',
        '#P       #',
        '# #####  #',
        '#   #    #',
        '### # ####',
        '#   #    #',
        '# ### ## #',
        '#     ##E#',
        '##########'
    ],
    [
        '############',
        '#P   #     #',
        '# ## # ### #',
        '#  # # # # #',
        '## #   # # #',
        '#  ##### # #',
        '# ##      #',
        '#  ########',
        '##       E#',
        '############'
    ],
    [
        '##############',
        '#P           #',
        '# ########## #',
        '# #        # #',
        '# # ###### # #',
        '# # #    # # #',
        '# # # ## # # #',
        '# # #  # # # #',
        '# # #### # # #',
        '# #      #   #',
        '# ########## #',
        '#           E#',
        '##############'
    ]
];

function startMazeGame(level = 0) {
    const mazeData = MAZE_LEVELS[level % MAZE_LEVELS.length];
    const maze = mazeData.map(row => row.split(''));
    
    let playerPos = { x: 0, y: 0 };
    let exitPos = { x: 0, y: 0 };
    
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 'P') {
                playerPos = { x, y };
                maze[y][x] = ' ';
            }
            if (maze[y][x] === 'E') {
                exitPos = { x, y };
            }
        }
    }
    
    gameState = {
        maze,
        player: playerPos,
        exit: exitPos,
        level,
        score: (gameState.score || 0),
        moves: 0,
        won: false
    };
    
    updateScore(gameState.score);
    gameStatus.textContent = `第 ${level + 1} 关 | WASD/方向键移动 | 找到出口 E`;
    
    drawMazeGame();
}

function handleMazeKey(e) {
    if (gameState.won) {
        if (e.key === ' ' || e.key === 'Enter') {
            startMazeGame(gameState.level + 1);
        }
        return;
    }
    
    const p = gameState.player;
    let dx = 0, dy = 0;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            dy = -1;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            dy = 1;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            dx = -1;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            dx = 1;
            break;
        default:
            return;
    }
    
    e.preventDefault();
    const newX = p.x + dx;
    const newY = p.y + dy;
    
    if (newY >= 0 && newY < gameState.maze.length &&
        newX >= 0 && newX < gameState.maze[newY].length) {
        const cell = gameState.maze[newY][newX];
        if (cell !== '#') {
            gameState.player = { x: newX, y: newY };
            gameState.moves++;
            
            if (cell === 'E') {
                gameState.won = true;
                gameState.score += 100 + Math.max(0, 200 - gameState.moves * 2);
                updateScore(gameState.score);
                saveScore(Games.MAZE, gameState.score);
                gameStatus.textContent = '恭喜通关! 按空格进入下一关 | ESC 返回';
            }
        }
    }
    
    drawMazeGame();
}

function drawMazeGame() {
    let screen = '';
    const maze = gameState.maze;
    
    for (let y = 0; y < maze.length; y++) {
        let line = '';
        for (let x = 0; x < maze[y].length; x++) {
            const isPlayer = gameState.player.x === x && gameState.player.y === y;
            
            if (isPlayer) {
                line += '@';
            } else {
                line += maze[y][x];
            }
        }
        screen += line + '\n';
    }
    
    screen += `\n  第 ${gameState.level + 1} 关 | 步数: ${gameState.moves} | 总分: ${gameState.score}\n`;
    
    if (gameState.won) {
        screen += '\n         恭喜通关!\n';
        screen += '    按 空格 进入下一关\n';
    }
    
    gameScreen.textContent = screen;
}

const SOKOBAN_LEVELS = [
    [
        '#######',
        '#     #',
        '# $ . #',
        '#  @  #',
        '# $ . #',
        '#     #',
        '#######'
    ],
    [
        '########',
        '#   ####',
        '# $    #',
        '# .$@  #',
        '#  .$  #',
        '########'
    ],
    [
        '##########',
        '#   #    #',
        '# $ # $  #',
        '# . # . ##',
        '#   @    #',
        '# ###### #',
        '#        #',
        '##########'
    ]
];

function startSokobanGame(level = 0) {
    const levelData = SOKOBAN_LEVELS[level % SOKOBAN_LEVELS.length];
    const map = levelData.map(row => row.split(''));
    
    let player = { x: 0, y: 0 };
    const boxes = [];
    const targets = [];
    const walls = [];
    
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const cell = map[y][x];
            switch (cell) {
                case '@':
                    player = { x, y };
                    break;
                case '$':
                    boxes.push({ x, y });
                    break;
                case '.':
                    targets.push({ x, y });
                    break;
                case '#':
                    walls.push({ x, y });
                    break;
            }
        }
    }
    
    gameState = {
        level,
        player,
        boxes,
        targets,
        walls,
        mapWidth: Math.max(...map.map(r => r.length)),
        mapHeight: map.length,
        moves: 0,
        score: gameState.score || 0,
        won: false
    };
    
    updateScore(gameState.score);
    gameStatus.textContent = `第 ${level + 1} 关 | WASD/方向键推箱子 | 把箱子推到.上`;
    
    drawSokobanGame();
}

function isWall(x, y) {
    return gameState.walls.some(w => w.x === x && w.y === y);
}

function isBox(x, y) {
    return gameState.boxes.some(b => b.x === x && b.y === y);
}

function isTarget(x, y) {
    return gameState.targets.some(t => t.x === x && t.y === y);
}

function getBox(x, y) {
    return gameState.boxes.find(b => b.x === x && b.y === y);
}

function handleSokobanKey(e) {
    if (gameState.won) {
        if (e.key === ' ' || e.key === 'Enter') {
            startSokobanGame(gameState.level + 1);
        }
        return;
    }
    
    let dx = 0, dy = 0;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            dy = -1;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            dy = 1;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            dx = -1;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            dx = 1;
            break;
        default:
            return;
    }
    
    e.preventDefault();
    
    const p = gameState.player;
    const newX = p.x + dx;
    const newY = p.y + dy;
    
    if (isWall(newX, newY)) return;
    
    if (isBox(newX, newY)) {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;
        
        if (isWall(boxNewX, boxNewY) || isBox(boxNewX, boxNewY)) return;
        
        const box = getBox(newX, newY);
        box.x = boxNewX;
        box.y = boxNewY;
    }
    
    gameState.player = { x: newX, y: newY };
    gameState.moves++;
    
    const allOnTarget = gameState.boxes.every(b => isTarget(b.x, b.y));
    if (allOnTarget) {
        gameState.won = true;
        gameState.score += 150 + Math.max(0, 300 - gameState.moves * 3);
        updateScore(gameState.score);
        saveScore(Games.SOKOBAN, gameState.score);
        gameStatus.textContent = '恭喜通关! 按空格进入下一关 | ESC 返回';
    }
    
    drawSokobanGame();
}

function drawSokobanGame() {
    let screen = '';
    const w = gameState.mapWidth;
    const h = gameState.mapHeight;
    
    for (let y = 0; y < h; y++) {
        let line = '';
        for (let x = 0; x < w; x++) {
            const isPlayer = gameState.player.x === x && gameState.player.y === y;
            const box = getBox(x, y);
            const target = isTarget(x, y);
            const wall = isWall(x, y);
            
            if (isPlayer) {
                line += '@';
            } else if (box) {
                line += target ? '*' : '$';
            } else if (target) {
                line += '.';
            } else if (wall) {
                line += '#';
            } else {
                line += ' ';
            }
        }
        screen += line + '\n';
    }
    
    screen += `\n  第 ${gameState.level + 1} 关 | 步数: ${gameState.moves} | 总分: ${gameState.score}\n`;
    
    if (gameState.won) {
        screen += '\n         恭喜通关!\n';
        screen += '    按 空格 进入下一关\n';
    }
    
    gameScreen.textContent = screen;
}

function startMathGame() {
    gameState = {
        score: 0,
        round: 0,
        maxRounds: 10,
        currentProblem: null,
        answer: '',
        timeLeft: 30,
        gameOver: false,
        difficulty: 1
    };
    
    generateMathProblem();
    updateScore(0);
    gameStatus.textContent = '快速计算! 输入数字答案按回车 | 30秒时限';
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        if (gameState.gameOver) return;
        gameState.timeLeft--;
        if (gameState.timeLeft <= 0) {
            endMathGame();
        }
        drawMathGame();
    }, 1000);
    
    drawMathGame();
}

function generateMathProblem() {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    
    const diff = gameState.difficulty;
    
    switch (op) {
        case '+':
            a = Math.floor(Math.random() * (20 * diff)) + 1;
            b = Math.floor(Math.random() * (20 * diff)) + 1;
            answer = a + b;
            break;
        case '-':
            a = Math.floor(Math.random() * (20 * diff)) + 10;
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
            break;
        case '*':
            a = Math.floor(Math.random() * (5 + diff * 3)) + 2;
            b = Math.floor(Math.random() * (5 + diff * 3)) + 2;
            answer = a * b;
            break;
    }
    
    gameState.currentProblem = { a, b, op, answer };
    gameState.answer = '';
    gameState.round++;
    
    if (gameState.round % 3 === 0) {
        gameState.difficulty = Math.min(5, gameState.difficulty + 1);
    }
}

function handleMathKey(e) {
    if (gameState.gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
            if (gameState.score > 0) {
                saveScore(Games.MATH, gameState.score);
            }
            startMathGame();
        }
        return;
    }
    
    if (e.key >= '0' && e.key <= '9') {
        gameState.answer += e.key;
        drawMathGame();
    } else if (e.key === 'Backspace') {
        gameState.answer = gameState.answer.slice(0, -1);
        drawMathGame();
    } else if (e.key === '-') {
        if (gameState.answer.length === 0) {
            gameState.answer = '-';
            drawMathGame();
        }
    } else if (e.key === 'Enter') {
        if (gameState.answer !== '') {
            const userAnswer = parseInt(gameState.answer);
            if (userAnswer === gameState.currentProblem.answer) {
                gameState.score += 10 * gameState.difficulty;
                gameState.timeLeft = Math.min(30, gameState.timeLeft + 5);
                updateScore(gameState.score);
            } else {
                gameState.timeLeft = Math.max(0, gameState.timeLeft - 3);
            }
            
            if (gameState.round >= gameState.maxRounds) {
                endMathGame();
            } else {
                generateMathProblem();
                drawMathGame();
            }
        }
    }
}

function endMathGame() {
    gameState.gameOver = true;
    clearInterval(gameInterval);
    if (gameState.score > 0) {
        saveScore(Games.MATH, gameState.score);
    }
    drawMathGame();
    gameStatus.textContent = '游戏结束! 按空格/回车重新开始 | ESC 返回';
}

function drawMathGame() {
    let screen = '';
    
    screen += '╔' + '═'.repeat(40) + '╗\n';
    screen += '║' + ' 计算挑战 '.padStart(24, ' ').padEnd(40, ' ') + '║\n';
    screen += '╠' + '═'.repeat(40) + '╣\n';
    screen += '║' + `  第 ${String(gameState.round).padStart(2)} / ${gameState.maxRounds} 题`.padEnd(40, ' ') + '║\n';
    screen += '║' + `  难度: ${gameState.difficulty}`.padEnd(40, ' ') + '║\n';
    screen += '║' + `  分数: ${gameState.score}`.padEnd(40, ' ') + '║\n';
    screen += '║' + `  剩余: ${gameState.timeLeft} 秒`.padEnd(40, ' ') + '║\n';
    screen += '╠' + '═'.repeat(40) + '╣\n';
    screen += '║' + ' '.repeat(40) + '║\n';
    
    if (gameState.gameOver) {
        screen += '║' + '      游戏结束!'.padEnd(40, ' ') + '║\n';
        screen += '║' + `      最终得分: ${gameState.score}`.padEnd(40, ' ') + '║\n';
        screen += '║' + ' '.repeat(40) + '║\n';
        screen += '║' + '  按 空格 或 回车 重新开始'.padEnd(40, ' ') + '║\n';
    } else {
        const p = gameState.currentProblem;
        const problem = `${p.a} ${p.op} ${p.b} = `;
        screen += '║' + problem.padStart(25, ' ').padEnd(40, ' ') + '║\n';
        screen += '║' + ' '.repeat(40) + '║\n';
        const answerDisplay = gameState.answer || '_____';
        screen += '║' + `    答案: ${answerDisplay}`.padEnd(40, ' ') + '║\n';
        screen += '║' + ' '.repeat(40) + '║\n';
        screen += '║' + '  输入数字后按回车确认'.padEnd(40, ' ') + '║\n';
    }
    
    screen += '║' + ' '.repeat(40) + '║\n';
    screen += '╚' + '═'.repeat(40) + '╝\n';
    
    gameScreen.textContent = screen;
}

init();
