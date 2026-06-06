import { create } from 'zustand';
import {
  GameState,
  GameScreen,
  Player,
  BattleState,
  Enemy,
  SaveSlot,
  DialogueOption,
} from '../types';
import {
  createInitialPlayer,
  addItemToInventory,
  removeItemFromInventory,
  equipItem,
  calculateTotalStats,
  calculateDamage,
  checkLevelUp,
  loadSaves,
  saveSaves,
  hasItem,
} from '../utils/gameUtils';
import { ENEMIES } from '../data/enemies';
import { SKILLS } from '../data/skills';
import { STORY_NODES } from '../data/story';

interface GameStore extends GameState {
  startNewGame: () => void;
  goToNode: (nodeId: string) => void;
  selectOption: (option: DialogueOption) => void;
  setScreen: (screen: GameScreen) => void;
  addItem: (itemId: string) => void;
  useItem: (itemId: string) => boolean;
  equipItemAction: (itemId: string) => void;
  startBattle: (enemyId: string, nextNodeId?: string) => void;
  playerAttack: () => void;
  playerUseSkill: (skillId: string) => void;
  playerUseItemInBattle: (itemId: string) => void;
  playerFlee: () => void;
  enemyTurn: () => void;
  endBattle: (victory: boolean) => void;
  saveGame: (slotId: number) => void;
  loadGame: (slotId: number) => void;
  setMessage: (message: string | null) => void;
  healPlayer: () => void;
  restMp: () => void;
  setFlag: (flag: string, value: boolean) => void;
}

const initialState: GameState = {
  screen: 'title',
  player: createInitialPlayer(),
  currentNodeId: 'title',
  battle: null,
  saves: [],
  message: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startNewGame: () => {
    const player = createInitialPlayer();
    set({
      player,
      currentNodeId: 'intro',
      screen: 'game',
      battle: null,
      message: null,
      saves: loadSaves(),
    });
  },

  goToNode: (nodeId: string) => {
    const node = STORY_NODES[nodeId];
    if (!node) return;

    if (node.giveItem) {
      get().addItem(node.giveItem);
    }
    if (node.setFlag) {
      get().setFlag(node.setFlag, true);
    }
    if (node.autoSave) {
      get().saveGame(0);
    }

    if (node.isEnding) {
    }

    set({ currentNodeId: nodeId });
  },

  selectOption: (option: DialogueOption) => {
    const state = get();

    if (option.requiresItem && !hasItem(state.player.inventory, option.requiresItem)) {
      get().setMessage(`需要道具：${option.requiresItem}`);
      return;
    }

    if (option.requiresFlag && !state.player.flags[option.requiresFlag]) {
      return;
    }

    if (option.givesItem) {
      get().addItem(option.givesItem);
    }
    if (option.setsFlag) {
      get().setFlag(option.setsFlag, true);
    }
    if (option.healsPlayer) {
      get().healPlayer();
    }
    if (option.restMp) {
      get().restMp();
    }

    if (option.startsBattle) {
      get().startBattle(option.startsBattle, option.nextNodeId);
    } else {
      get().goToNode(option.nextNodeId);
    }
  },

  setScreen: (screen) => set({ screen }),

  addItem: (itemId) => {
    set((state) => ({
      player: {
        ...state.player,
        inventory: addItemToInventory(state.player.inventory, itemId),
      },
    }));
  },

  useItem: (itemId) => {
    const state = get();
    const invItem = state.player.inventory.find((i) => i.item.id === itemId);
    if (!invItem || invItem.quantity <= 0) return false;

    const item = invItem.item;
    let newStats = { ...state.player.stats };

    if (item.healAmount) {
      newStats.hp = Math.min(newStats.maxHp, newStats.hp + item.healAmount);
    }
    if (item.mpRestore) {
      newStats.mp = Math.min(newStats.maxMp, newStats.mp + item.mpRestore);
    }

    set((state) => ({
      player: {
        ...state.player,
        stats: newStats,
        inventory: removeItemFromInventory(state.player.inventory, itemId),
      },
    }));

    return true;
  },

  equipItemAction: (itemId) => {
    const state = get();
    const invItem = state.player.inventory.find((i) => i.item.id === itemId);
    if (!invItem) return;

    const result = equipItem(state.player.equipment, invItem.item);
    let newInventory = removeItemFromInventory(state.player.inventory, itemId);

    if (result.oldItem) {
      newInventory = addItemToInventory(newInventory, result.oldItem.id);
    }

    set((state) => ({
      player: {
        ...state.player,
        equipment: result.equipment,
        inventory: newInventory,
      },
    }));
  },

  startBattle: (enemyId, nextNodeId) => {
    const enemy = { ...ENEMIES[enemyId] };
    if (!enemy) return;

    const state = get();
    const playerStats = calculateTotalStats(state.player.stats, state.player.equipment);

    const turn: 'player' | 'enemy' = playerStats.speed >= enemy.speed ? 'player' : 'enemy';

    const battle: BattleState = {
      enemy,
      turn,
      log: [`遭遇了 ${enemy.name}！`],
      isActive: true,
      nextNodeId,
    };

    set({ battle, screen: 'battle' });

    if (turn === 'enemy') {
      setTimeout(() => get().enemyTurn(), 1000);
    }
  },

  playerAttack: () => {
    const state = get();
    if (!state.battle || state.battle.turn !== 'player') return;

    const playerStats = calculateTotalStats(state.player.stats, state.player.equipment);
    const damage = calculateDamage(playerStats.attack, state.battle.enemy.defense);

    const newEnemy = {
      ...state.battle.enemy,
      hp: Math.max(0, state.battle.enemy.hp - damage),
    };

    const newLog = [...state.battle.log, `你攻击了 ${newEnemy.name}，造成 ${damage} 点伤害！`];

    if (newEnemy.hp <= 0) {
      set({
        battle: { ...state.battle, enemy: newEnemy, log: newLog },
      });
      setTimeout(() => get().endBattle(true), 1000);
      return;
    }

    set({
      battle: { ...state.battle, enemy: newEnemy, turn: 'enemy', log: newLog },
    });

    setTimeout(() => get().enemyTurn(), 1000);
  },

  playerUseSkill: (skillId) => {
    const state = get();
    if (!state.battle || state.battle.turn !== 'player') return;

    const skill = SKILLS.find((s) => s.id === skillId);
    if (!skill) return;

    if (state.player.stats.mp < skill.mpCost) {
      const newLog = [...state.battle.log, '魔力不足！'];
      set({ battle: { ...state.battle, log: newLog } });
      return;
    }

    const newPlayerStats = {
      ...state.player.stats,
      mp: state.player.stats.mp - skill.mpCost,
    };

    let newEnemy = { ...state.battle.enemy };
    let newLog = [...state.battle.log];

    if (skill.type === 'attack') {
      const damage = skill.damage;
      newEnemy.hp = Math.max(0, newEnemy.hp - damage);
      newLog.push(`你使用了 ${skill.name}，造成 ${damage} 点伤害！`);
    } else if (skill.type === 'heal') {
      newPlayerStats.hp = Math.min(newPlayerStats.maxHp, newPlayerStats.hp + skill.damage);
      newLog.push(`你使用了 ${skill.name}，恢复了 ${skill.damage} 点生命！`);
    }

    if (newEnemy.hp <= 0) {
      set({
        player: { ...state.player, stats: newPlayerStats },
        battle: { ...state.battle, enemy: newEnemy, log: newLog },
      });
      setTimeout(() => get().endBattle(true), 1000);
      return;
    }

    set({
      player: { ...state.player, stats: newPlayerStats },
      battle: { ...state.battle, enemy: newEnemy, turn: 'enemy', log: newLog },
    });

    setTimeout(() => get().enemyTurn(), 1000);
  },

  playerUseItemInBattle: (itemId) => {
    const state = get();
    if (!state.battle || state.battle.turn !== 'player') return;

    const invItem = state.player.inventory.find((i) => i.item.id === itemId);
    if (!invItem || invItem.quantity <= 0) return;

    const item = invItem.item;
    let newPlayerStats = { ...state.player.stats };
    let newEnemy = { ...state.battle.enemy };
    let newLog = [...state.battle.log];

    if (item.healAmount) {
      newPlayerStats.hp = Math.min(newPlayerStats.maxHp, newPlayerStats.hp + item.healAmount);
      newLog.push(`你使用了 ${item.name}，恢复了 ${item.healAmount} 点生命！`);
    }
    if (item.mpRestore) {
      newPlayerStats.mp = Math.min(newPlayerStats.maxMp, newPlayerStats.mp + item.mpRestore);
      newLog.push(`你使用了 ${item.name}，恢复了 ${item.mpRestore} 点魔力！`);
    }
    if (item.damage) {
      newEnemy.hp = Math.max(0, newEnemy.hp - item.damage);
      newLog.push(`你使用了 ${item.name}，造成 ${item.damage} 点伤害！`);
    }

    const newInventory = removeItemFromInventory(state.player.inventory, itemId);

    if (newEnemy.hp <= 0) {
      set({
        player: { ...state.player, stats: newPlayerStats, inventory: newInventory },
        battle: { ...state.battle, enemy: newEnemy, log: newLog },
      });
      setTimeout(() => get().endBattle(true), 1000);
      return;
    }

    set({
      player: { ...state.player, stats: newPlayerStats, inventory: newInventory },
      battle: { ...state.battle, enemy: newEnemy, turn: 'enemy', log: newLog },
    });

    setTimeout(() => get().enemyTurn(), 1000);
  },

  playerFlee: () => {
    const state = get();
    if (!state.battle || state.battle.turn !== 'player') return;

    if (state.battle.enemy.isBoss) {
      const newLog = [...state.battle.log, '无法从Boss战中逃跑！'];
      set({ battle: { ...state.battle, log: newLog } });
      return;
    }

    const success = Math.random() > 0.3;
    if (success) {
      const newLog = [...state.battle.log, '逃跑成功！'];
      set({
        battle: { ...state.battle, log: newLog, isActive: false },
      });
      setTimeout(() => {
        set({ battle: null, screen: 'game' });
      }, 1000);
    } else {
      const newLog = [...state.battle.log, '逃跑失败！'];
      set({
        battle: { ...state.battle, turn: 'enemy', log: newLog },
      });
      setTimeout(() => get().enemyTurn(), 1000);
    }
  },

  enemyTurn: () => {
    const state = get();
    if (!state.battle || !state.battle.isActive) return;

    const playerStats = calculateTotalStats(state.player.stats, state.player.equipment);
    const damage = calculateDamage(state.battle.enemy.attack, playerStats.defense);

    const newPlayerHp = Math.max(0, playerStats.hp - damage);
    const newLog = [...state.battle.log, `${state.battle.enemy.name} 攻击了你，造成 ${damage} 点伤害！`];

    if (newPlayerHp <= 0) {
      set({
        player: { ...state.player, stats: { ...state.player.stats, hp: 0 } },
        battle: { ...state.battle, log: newLog },
      });
      setTimeout(() => get().endBattle(false), 1000);
      return;
    }

    set({
      player: { ...state.player, stats: { ...state.player.stats, hp: newPlayerHp } },
      battle: { ...state.battle, turn: 'player', log: newLog },
    });
  },

  endBattle: (victory) => {
    const state = get();
    if (!state.battle) return;

    if (victory) {
      const enemy = state.battle.enemy;
      const nextNodeId = state.battle.nextNodeId;
      let newStats = {
        ...state.player.stats,
        exp: state.player.stats.exp + enemy.exp,
        gold: state.player.stats.gold + enemy.gold,
      };

      const { stats: leveledStats, leveledUp } = checkLevelUp(newStats);
      newStats = leveledStats;

      const newLog = [
        ...state.battle.log,
        `战斗胜利！获得 ${enemy.exp} 经验值，${enemy.gold} 金币！`,
      ];

      if (leveledUp) {
        newLog.push(`升级了！当前等级：${newStats.level}`);
      }

      set({
        player: { ...state.player, stats: newStats },
        battle: { ...state.battle, log: newLog, isActive: false, victory: true },
      });

      setTimeout(() => {
        if (nextNodeId) {
          set({ battle: null, screen: 'game' });
          get().goToNode(nextNodeId);
        } else {
          set({ battle: null, screen: 'game' });
        }
      }, 2000);
    } else {
      const newLog = [...state.battle.log, '你被击败了...'];
      set({
        battle: { ...state.battle, log: newLog, isActive: false, victory: false },
      });

      setTimeout(() => {
        set({ screen: 'gameover', battle: null });
      }, 2000);
    }
  },

  saveGame: (slotId) => {
    const state = get();
    const currentNode = STORY_NODES[state.currentNodeId];

    const saveSlot: SaveSlot = {
      id: slotId,
      player: JSON.parse(JSON.stringify(state.player)),
      currentNodeId: state.currentNodeId,
      timestamp: Date.now(),
      sceneTitle: currentNode?.title || '未知',
    };

    let saves = loadSaves();
    saves = saves.filter((s) => s.id !== slotId);
    saves.push(saveSlot);
    saves = saves.slice(0, 5);

    saveSaves(saves);
    set({ saves, message: '存档成功！' });
  },

  loadGame: (slotId) => {
    const saves = loadSaves();
    const save = saves.find((s) => s.id === slotId);
    if (!save) return;

    set({
      player: save.player,
      currentNodeId: save.currentNodeId,
      screen: 'game',
      battle: null,
      saves,
      message: '读档成功！',
    });
  },

  setMessage: (message) => set({ message }),

  healPlayer: () => {
    set((state) => ({
      player: {
        ...state.player,
        stats: {
          ...state.player.stats,
          hp: state.player.stats.maxHp,
        },
      },
    }));
  },

  restMp: () => {
    set((state) => ({
      player: {
        ...state.player,
        stats: {
          ...state.player.stats,
          mp: state.player.stats.maxMp,
        },
      },
    }));
  },

  setFlag: (flag, value) => {
    set((state) => ({
      player: {
        ...state.player,
        flags: { ...state.player.flags, [flag]: value },
      },
    }));
  },
}));
