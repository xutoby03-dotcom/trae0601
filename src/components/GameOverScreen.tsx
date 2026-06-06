import { useGameStore } from '../store/gameStore';
import { loadSaves } from '../utils/gameUtils';

export const GameOverScreen = () => {
  const { setScreen, loadGame } = useGameStore();
  const saves = loadSaves();

  const latestSave = saves.length > 0 
    ? saves.reduce((a, b) => a.timestamp > b.timestamp ? a : b)
    : null;

  return (
    <div className="gameover-screen">
      <div className="gameover-container">
        <h1 className="gameover-title">💀 游戏结束 💀</h1>
        <p className="gameover-text">你倒在了冒险的路上...</p>
        <p className="gameover-hint">但勇者的故事不会就此结束！</p>

        <div className="gameover-options">
          {latestSave && (
            <button 
              className="gameover-btn continue"
              onClick={() => loadGame(latestSave.id)}
            >
              📖 从最近存档继续
            </button>
          )}
          <button 
            className="gameover-btn restart"
            onClick={() => {
              useGameStore.getState().startNewGame();
            }}
          >
            🔄 重新开始
          </button>
          <button 
            className="gameover-btn title"
            onClick={() => setScreen('title')}
          >
            🏠 返回标题
          </button>
        </div>
      </div>
    </div>
  );
};
