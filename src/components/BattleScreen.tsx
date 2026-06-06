import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SKILLS } from '../data/skills';
import { calculateTotalStats } from '../utils/gameUtils';

type BattleMenu = 'main' | 'skill' | 'item';

export const BattleScreen = () => {
  const {
    battle,
    player,
    playerAttack,
    playerUseSkill,
    playerUseItemInBattle,
    playerFlee,
  } = useGameStore();

  const [menu, setMenu] = useState<BattleMenu>('main');

  if (!battle) return null;

  const totalStats = calculateTotalStats(player.stats, player.equipment);
  const enemyHpPercent = (battle.enemy.hp / battle.enemy.maxHp) * 100;
  const playerHpPercent = (player.stats.hp / player.stats.maxHp) * 100;
  const playerMpPercent = (player.stats.mp / player.stats.maxMp) * 100;

  const consumables = player.inventory.filter(
    (i) => i.item.type === 'consumable' && i.quantity > 0
  );

  const canAct = battle.isActive && battle.turn === 'player';

  return (
    <div className="battle-screen">
      <div className="battle-arena">
        <div className="enemy-area">
          <div className="enemy-sprite">
            {battle.enemy.isBoss ? '👹' : '👾'}
          </div>
          <div className="enemy-info">
            <div className="enemy-name">
              {battle.enemy.name}
              {battle.enemy.isBoss && <span className="boss-tag">BOSS</span>}
            </div>
            <div className="enemy-hp-bar">
              <div 
                className="enemy-hp-fill" 
                style={{ width: `${enemyHpPercent}%` }}
              />
            </div>
            <div className="enemy-hp-text">
              HP: {battle.enemy.hp}/{battle.enemy.maxHp}
            </div>
          </div>
        </div>

        <div className="battle-log">
          {battle.log.slice(-4).map((log, i) => (
            <div key={i} className="log-entry">{log}</div>
          ))}
        </div>

        <div className="player-area">
          <div className="player-sprite">🧙</div>
          <div className="player-battle-info">
            <div className="player-name">{player.name}</div>
            <div className="player-stats">
              <div className="mini-bar">
                <span>HP</span>
                <div className="mini-bar-bg">
                  <div className="mini-bar-fill hp" style={{ width: `${playerHpPercent}%` }} />
                </div>
                <span>{player.stats.hp}/{player.stats.maxHp}</span>
              </div>
              <div className="mini-bar">
                <span>MP</span>
                <div className="mini-bar-bg">
                  <div className="mini-bar-fill mp" style={{ width: `${playerMpPercent}%` }} />
                </div>
                <span>{player.stats.mp}/{player.stats.maxMp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="battle-menu">
        {menu === 'main' && (
          <div className="menu-grid">
            <button 
              className="battle-btn" 
              onClick={playerAttack}
              disabled={!canAct}
            >
              ⚔️ 攻击
            </button>
            <button 
              className="battle-btn" 
              onClick={() => setMenu('skill')}
              disabled={!canAct}
            >
              ✨ 技能
            </button>
            <button 
              className="battle-btn" 
              onClick={() => setMenu('item')}
              disabled={!canAct}
            >
              🎒 道具
            </button>
            <button 
              className="battle-btn" 
              onClick={playerFlee}
              disabled={!canAct}
            >
              🏃 逃跑
            </button>
          </div>
        )}

        {menu === 'skill' && (
          <div className="skill-list">
            <div className="list-header">
              <span>选择技能</span>
              <button className="back-btn" onClick={() => setMenu('main')}>返回</button>
            </div>
            <div className="skill-items">
              {SKILLS.map((skill) => (
                <button
                  key={skill.id}
                  className="skill-btn"
                  onClick={() => {
                    playerUseSkill(skill.id);
                    setMenu('main');
                  }}
                  disabled={!canAct || player.stats.mp < skill.mpCost}
                >
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-cost">MP: {skill.mpCost}</span>
                  <span className="skill-desc">{skill.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {menu === 'item' && (
          <div className="item-list">
            <div className="list-header">
              <span>选择道具</span>
              <button className="back-btn" onClick={() => setMenu('main')}>返回</button>
            </div>
            <div className="item-items">
              {consumables.length === 0 ? (
                <div className="empty-list">没有可用道具</div>
              ) : (
                consumables.map((invItem) => (
                  <button
                    key={invItem.item.id}
                    className="item-btn"
                    onClick={() => {
                      playerUseItemInBattle(invItem.item.id);
                      setMenu('main');
                    }}
                    disabled={!canAct}
                  >
                    <span className="item-icon">{invItem.item.icon}</span>
                    <span className="item-name">{invItem.item.name}</span>
                    <span className="item-quantity">x{invItem.quantity}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {battle.turn === 'enemy' && battle.isActive && (
          <div className="turn-indicator">敌人回合...</div>
        )}
      </div>
    </div>
  );
};
