import { useGameStore } from '../store/gameStore';
import { calculateTotalStats } from '../utils/gameUtils';

export const PlayerHUD = () => {
  const { player, setScreen } = useGameStore();
  const totalStats = calculateTotalStats(player.stats, player.equipment);

  const hpPercent = (player.stats.hp / player.stats.maxHp) * 100;
  const mpPercent = (player.stats.mp / player.stats.maxMp) * 100;
  const expPercent = (player.stats.exp / player.stats.expToNext) * 100;

  return (
    <div className="player-hud">
      <div className="hud-row">
        <span className="hud-label">Lv.{player.stats.level}</span>
        <span className="hud-name">{player.name}</span>
        <span className="hud-gold">💰 {player.stats.gold}</span>
      </div>
      
      <div className="stat-bar">
        <span className="stat-label">HP</span>
        <div className="bar-container">
          <div 
            className="bar-fill hp-bar" 
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <span className="stat-value">{player.stats.hp}/{player.stats.maxHp}</span>
      </div>

      <div className="stat-bar">
        <span className="stat-label">MP</span>
        <div className="bar-container">
          <div 
            className="bar-fill mp-bar" 
            style={{ width: `${mpPercent}%` }}
          />
        </div>
        <span className="stat-value">{player.stats.mp}/{player.stats.maxMp}</span>
      </div>

      <div className="stat-bar">
        <span className="stat-label">EXP</span>
        <div className="bar-container">
          <div 
            className="bar-fill exp-bar" 
            style={{ width: `${expPercent}%` }}
          />
        </div>
        <span className="stat-value">{player.stats.exp}/{player.stats.expToNext}</span>
      </div>

      <div className="hud-stats">
        <span>⚔️ {totalStats.attack}</span>
        <span>🛡️ {totalStats.defense}</span>
        <span>⚡ {totalStats.speed}</span>
      </div>

      <div className="hud-buttons">
        <button className="hud-btn" onClick={() => setScreen('inventory')}>
          🎒 背包
        </button>
        <button className="hud-btn" onClick={() => setScreen('save')}>
          💾 存档
        </button>
      </div>
    </div>
  );
};
