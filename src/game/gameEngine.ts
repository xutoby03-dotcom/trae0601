import {
  GameState,
  GameAction,
  Monster,
  Tower,
  Projectile,
  Effect,
  MonsterType,
} from '../types';
import {
  DIFFICULTY_CONFIGS,
  TOWER_CONFIGS,
  MONSTER_CONFIGS,
  WAVE_CONFIGS,
  TOTAL_WAVES,
  getTowerLevelConfig,
  getTowerUpgradeCost,
  getTowerSellValue,
} from '../configs';
import { generateId, distance, moveAlongPath, getAngle } from '../utils';

export const initialGameState: GameState = {
  status: 'menu',
  gold: 200,
  lives: 15,
  currentWave: 0,
  totalWaves: TOTAL_WAVES,
  waveInProgress: false,
  waveTimer: 0,
  spawnTimer: 0,
  spawnQueue: [],
  speed: 1,
  selectedTowerType: null,
  selectedTower: null,
  towers: [],
  monsters: [],
  projectiles: [],
  effects: [],
  map: null,
  difficulty: 'normal',
  levelIndex: 0,
  monstersKilled: 0,
  totalDamageDealt: 0,
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME': {
      const { map, difficulty, levelIndex } = action.payload;
      const diffConfig = DIFFICULTY_CONFIGS[difficulty];
      return {
        ...initialGameState,
        status: 'playing',
        gold: diffConfig.startingGold,
        lives: diffConfig.startingLives,
        map,
        difficulty,
        levelIndex,
        waveTimer: WAVE_CONFIGS[0].delay,
      };
    }

    case 'PAUSE_GAME':
      return { ...state, status: 'paused' };

    case 'RESUME_GAME':
      return { ...state, status: 'playing' };

    case 'SET_SPEED':
      return { ...state, speed: action.payload };

    case 'SELECT_TOWER_TYPE':
      return { ...state, selectedTowerType: action.payload, selectedTower: null };

    case 'SELECT_TOWER':
      return { ...state, selectedTower: action.payload, selectedTowerType: null };

    case 'BUILD_TOWER': {
      const { slotIndex, type } = action.payload;
      const towerConfig = TOWER_CONFIGS[type];
      const levelConfig = towerConfig.levels[0];

      if (state.gold < levelConfig.cost) return state;
      if (!state.map) return state;
      if (state.towers.some(t => t.slotIndex === slotIndex)) return state;

      const slot = state.map.towerSlots[slotIndex];
      const newTower: Tower = {
        id: generateId(),
        type,
        level: 0,
        x: slot.x,
        y: slot.y,
        slotIndex,
        fireCooldown: 0,
        angle: 0,
      };

      const buildEffect: Effect = {
        id: generateId(),
        type: 'build',
        x: slot.x,
        y: slot.y,
        duration: 500,
        elapsed: 0,
        radius: 40,
        color: towerConfig.color,
      };

      return {
        ...state,
        gold: state.gold - levelConfig.cost,
        towers: [...state.towers, newTower],
        effects: [...state.effects, buildEffect],
        selectedTowerType: null,
      };
    }

    case 'UPGRADE_TOWER': {
      const { towerId } = action.payload;
      const towerIndex = state.towers.findIndex(t => t.id === towerId);
      if (towerIndex === -1) return state;

      const tower = state.towers[towerIndex];
      const upgradeCost = getTowerUpgradeCost(tower.type, tower.level);
      if (upgradeCost === null || state.gold < upgradeCost) return state;

      const upgradedTower: Tower = {
        ...tower,
        level: tower.level + 1,
      };

      const newTowers = [...state.towers];
      newTowers[towerIndex] = upgradedTower;

      const upgradeEffect: Effect = {
        id: generateId(),
        type: 'build',
        x: tower.x,
        y: tower.y,
        duration: 500,
        elapsed: 0,
        radius: 50,
        color: TOWER_CONFIGS[tower.type].color,
      };

      return {
        ...state,
        gold: state.gold - upgradeCost,
        towers: newTowers,
        effects: [...state.effects, upgradeEffect],
        selectedTower: upgradedTower,
      };
    }

    case 'SELL_TOWER': {
      const { towerId } = action.payload;
      const tower = state.towers.find(t => t.id === towerId);
      if (!tower) return state;

      const sellValue = getTowerSellValue(tower.type, tower.level);

      return {
        ...state,
        gold: state.gold + sellValue,
        towers: state.towers.filter(t => t.id !== towerId),
        selectedTower: null,
      };
    }

    case 'RESET_GAME':
      return initialGameState;

    case 'GAME_OVER':
      return {
        ...state,
        status: action.payload.won ? 'won' : 'lost',
      };

    case 'TICK': {
      if (state.status !== 'playing' || !state.map) return state;
      return tickGame(state, action.payload.deltaTime);
    }

    default:
      return state;
  }
};

const tickGame = (state: GameState, deltaTime: number): GameState => {
  const dt = deltaTime * state.speed;
  let newState = { ...state };

  newState = updateWaveTimer(newState, dt);
  newState = spawnMonsters(newState, dt);
  newState = updateMonsters(newState, dt);
  newState = updateTowers(newState, dt);
  newState = updateProjectiles(newState, dt);
  newState = updateEffects(newState, dt);
  newState = checkGameEnd(newState);

  return newState;
};

const updateWaveTimer = (state: GameState, dt: number): GameState => {
  if (state.waveInProgress || state.currentWave >= state.totalWaves) return state;

  const newTimer = state.waveTimer - dt;
  if (newTimer <= 0) {
    const waveConfig = WAVE_CONFIGS[state.currentWave];
    const spawnQueue: { type: MonsterType; delay: number }[] = [];
    let currentDelay = 0;

    for (const monsterGroup of waveConfig.monsters) {
      for (let i = 0; i < monsterGroup.count; i++) {
        spawnQueue.push({ type: monsterGroup.type, delay: currentDelay });
        currentDelay += monsterGroup.interval;
      }
    }

    return {
      ...state,
      waveInProgress: true,
      waveTimer: 0,
      spawnQueue,
      spawnTimer: 0,
    };
  }

  return { ...state, waveTimer: newTimer };
};

const spawnMonsters = (state: GameState, dt: number): GameState => {
  if (!state.waveInProgress || state.spawnQueue.length === 0) return state;

  const newSpawnTimer = state.spawnTimer + dt;
  const newMonsters: Monster[] = [];
  const remainingQueue: { type: MonsterType; delay: number }[] = [];

  for (const spawn of state.spawnQueue) {
    if (spawn.delay <= newSpawnTimer) {
      const monster = createMonster(spawn.type, state);
      if (monster) newMonsters.push(monster);
    } else {
      remainingQueue.push(spawn);
    }
  }

  return {
    ...state,
    spawnTimer: newSpawnTimer,
    spawnQueue: remainingQueue,
    monsters: [...state.monsters, ...newMonsters],
  };
};

const createMonster = (type: MonsterType, state: GameState): Monster | null => {
  if (!state.map) return null;

  const config = MONSTER_CONFIGS[type];
  const diffConfig = DIFFICULTY_CONFIGS[state.difficulty];
  const startPoint = state.map.path[0];

  return {
    id: generateId(),
    type,
    x: startPoint.x,
    y: startPoint.y,
    hp: Math.floor(config.hp * diffConfig.monsterHpMultiplier),
    maxHp: Math.floor(config.hp * diffConfig.monsterHpMultiplier),
    baseSpeed: config.speed * diffConfig.monsterSpeedMultiplier,
    pathIndex: 0,
    progress: 0,
    slowTimer: 0,
    slowAmount: 0,
    reward: Math.floor(config.reward * diffConfig.goldMultiplier),
    armor: config.armor,
    isFlying: config.isFlying,
    size: config.size,
    color: config.color,
  };
};

const updateMonsters = (state: GameState, dt: number): GameState => {
  if (!state.map) return state;

  const updatedMonsters: Monster[] = [];
  let livesLost = 0;
  const newEffects: Effect[] = [];

  for (const monster of state.monsters) {
    let newSlowTimer = Math.max(0, monster.slowTimer - dt);
    let newSlowAmount = newSlowTimer > 0 ? monster.slowAmount : 0;

    const speedMultiplier = 1 - newSlowAmount;
    const distanceToMove = (monster.baseSpeed * speedMultiplier * dt) / 1000;

    const result = moveAlongPath(
      state.map.path,
      monster.pathIndex,
      monster.progress,
      distanceToMove
    );

    if (result.finished) {
      livesLost++;
      newEffects.push({
        id: generateId(),
        type: 'explosion',
        x: result.x,
        y: result.y,
        duration: 300,
        elapsed: 0,
        radius: 30,
        color: '#ff4466',
      });
    } else {
      updatedMonsters.push({
        ...monster,
        x: result.x,
        y: result.y,
        pathIndex: result.newIndex,
        progress: result.newProgress,
        slowTimer: newSlowTimer,
        slowAmount: newSlowAmount,
      });
    }
  }

  const newLives = state.lives - livesLost;

  return {
    ...state,
    monsters: updatedMonsters,
    lives: newLives,
    effects: [...state.effects, ...newEffects],
  };
};

const updateTowers = (state: GameState, dt: number): GameState => {
  if (!state.map) return state;

  const newProjectiles: Projectile[] = [];
  const updatedTowers: Tower[] = [];

  for (const tower of state.towers) {
    const levelConfig = getTowerLevelConfig(tower.type, tower.level);
    const fireInterval = 1000 / levelConfig.fireRate;

    let newCooldown = Math.max(0, tower.fireCooldown - dt);

    let target: Monster | null = null;
    let minProgress = -1;

    for (const monster of state.monsters) {
      const dist = distance({ x: tower.x, y: tower.y }, { x: monster.x, y: monster.y });
      if (dist <= levelConfig.range) {
        const monsterProgress = monster.pathIndex + monster.progress;
        if (monsterProgress > minProgress) {
          minProgress = monsterProgress;
          target = monster;
        }
      }
    }

    let newAngle = tower.angle;
    if (target) {
      newAngle = getAngle({ x: tower.x, y: tower.y }, { x: target.x, y: target.y });

      if (newCooldown <= 0) {
        const projectile: Projectile = {
          id: generateId(),
          x: tower.x,
          y: tower.y,
          targetId: target.id,
          damage: levelConfig.damage,
          speed: levelConfig.projectileSpeed,
          type: tower.type,
          aoeRadius: levelConfig.aoeRadius,
          slowAmount: levelConfig.slowAmount,
          slowDuration: levelConfig.slowDuration,
          color: TOWER_CONFIGS[tower.type].color,
        };
        newProjectiles.push(projectile);

        updatedTowers.push({
          ...tower,
          fireCooldown: fireInterval,
          angle: newAngle,
        });
        continue;
      }
    }

    updatedTowers.push({
      ...tower,
      fireCooldown: newCooldown,
      angle: newAngle,
    });
  }

  return {
    ...state,
    towers: updatedTowers,
    projectiles: [...state.projectiles, ...newProjectiles],
  };
};

const updateProjectiles = (state: GameState, dt: number): GameState => {
  const updatedProjectiles: Projectile[] = [];
  const updatedMonsters = [...state.monsters];
  const newEffects: Effect[] = [];
  let goldEarned = 0;
  let monstersKilled = 0;
  let totalDamageDealt = 0;

  for (const proj of state.projectiles) {
    const target = updatedMonsters.find(m => m.id === proj.targetId);

    if (!target) {
      continue;
    }

    const dist = distance({ x: proj.x, y: proj.y }, { x: target.x, y: target.y });
    const moveDist = (proj.speed * dt) / 1000;

    if (dist <= moveDist + target.size / 2) {
      if (proj.aoeRadius) {
        newEffects.push({
          id: generateId(),
          type: 'explosion',
          x: target.x,
          y: target.y,
          duration: 400,
          elapsed: 0,
          radius: proj.aoeRadius,
          color: proj.color,
        });

        for (let i = 0; i < updatedMonsters.length; i++) {
          const monster = updatedMonsters[i];
          const d = distance({ x: target.x, y: target.y }, { x: monster.x, y: monster.y });
          if (d <= proj.aoeRadius) {
            const actualDamage = proj.damage * (1 - monster.armor);
            totalDamageDealt += actualDamage;
            const newHp = monster.hp - actualDamage;
            if (newHp <= 0) {
              goldEarned += monster.reward;
              monstersKilled++;
              updatedMonsters.splice(i, 1);
              i--;
            } else {
              updatedMonsters[i] = { ...monster, hp: newHp };
            }
          }
        }
      } else {
        const actualDamage = proj.damage * (1 - target.armor);
        totalDamageDealt += actualDamage;
        const targetIndex = updatedMonsters.findIndex(m => m.id === target.id);

        if (proj.slowAmount && proj.slowDuration) {
          newEffects.push({
            id: generateId(),
            type: 'slow',
            x: target.x,
            y: target.y,
            duration: 300,
            elapsed: 0,
            radius: 25,
            color: '#44aaff',
          });
        } else {
          newEffects.push({
            id: generateId(),
            type: 'hit',
            x: target.x,
            y: target.y,
            duration: 200,
            elapsed: 0,
            radius: 15,
            color: proj.color,
          });
        }

        if (targetIndex !== -1) {
          const newHp = updatedMonsters[targetIndex].hp - actualDamage;
          if (newHp <= 0) {
            goldEarned += updatedMonsters[targetIndex].reward;
            monstersKilled++;
            updatedMonsters.splice(targetIndex, 1);
          } else {
            let slowAmount = updatedMonsters[targetIndex].slowAmount;
            let slowTimer = updatedMonsters[targetIndex].slowTimer;
            if (proj.slowAmount && proj.slowDuration) {
              slowAmount = Math.max(slowAmount, proj.slowAmount);
              slowTimer = Math.max(slowTimer, proj.slowDuration * 1000);
            }
            updatedMonsters[targetIndex] = {
              ...updatedMonsters[targetIndex],
              hp: newHp,
              slowAmount,
              slowTimer,
            };
          }
        }
      }
    } else {
      const angle = getAngle({ x: proj.x, y: proj.y }, { x: target.x, y: target.y });
      const newX = proj.x + Math.cos(angle) * moveDist;
      const newY = proj.y + Math.sin(angle) * moveDist;
      updatedProjectiles.push({ ...proj, x: newX, y: newY });
    }
  }

  let waveInProgress = state.waveInProgress;
  let currentWave = state.currentWave;
  let waveTimer = state.waveTimer;

  if (state.waveInProgress && state.spawnQueue.length === 0 && updatedMonsters.length === 0) {
    waveInProgress = false;
    currentWave = state.currentWave + 1;
    if (currentWave < state.totalWaves) {
      waveTimer = WAVE_CONFIGS[currentWave].delay;
    }
  }

  return {
    ...state,
    projectiles: updatedProjectiles,
    monsters: updatedMonsters,
    effects: [...state.effects, ...newEffects],
    gold: state.gold + goldEarned,
    monstersKilled: state.monstersKilled + monstersKilled,
    totalDamageDealt: state.totalDamageDealt + totalDamageDealt,
    waveInProgress,
    currentWave,
    waveTimer,
  };
};

const updateEffects = (state: GameState, dt: number): GameState => {
  const updatedEffects: Effect[] = [];

  for (const effect of state.effects) {
    const newElapsed = effect.elapsed + dt;
    if (newElapsed < effect.duration) {
      updatedEffects.push({ ...effect, elapsed: newElapsed });
    }
  }

  return { ...state, effects: updatedEffects };
};

const checkGameEnd = (state: GameState): GameState => {
  if (state.lives <= 0) {
    return { ...state, status: 'lost' };
  }

  if (
    state.currentWave >= state.totalWaves &&
    !state.waveInProgress &&
    state.monsters.length === 0
  ) {
    return { ...state, status: 'won' };
  }

  return state;
};
