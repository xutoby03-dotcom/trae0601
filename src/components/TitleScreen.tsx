import { useGameStore } from '../store/gameStore';
import { loadSaves } from '../utils/gameUtils';

export const TitleScreen = () => {
  const { startNewGame, setScreen, setMessage } = useGameStore();

  const handleLoad = () => {
    const saves = loadSaves();
    if (saves.length === 0) {
      setMessage('没有可用的存档');
      return;
    }
    setScreen('load');
  };

  return (
    <div className="title-screen">
      <div className="title-container">
        <h1 className="game-title">⚔️ 龙之传说 ⚔️</h1>
        <p className="subtitle">~ 古早文字冒险RPG ~</p>
        
        <div className="title-decoration">
          <span className="dragon-icon">🐉</span>
        </div>

        <div className="title-options">
          <button className="title-btn" onClick={startNewGame}>
            🎮 开始新游戏
          </button>
          <button className="title-btn" onClick={handleLoad}>
            📖 读取存档
          </button>
          <button className="title-btn" onClick={() => setScreen('game')}>
            ❓ 游戏说明
          </button>
        </div>

        <div className="title-footer">
          <p>一个勇者斗恶龙的故事</p>
          <p className="version">Version 1.0</p>
        </div>
      </div>
    </div>
  );
};
