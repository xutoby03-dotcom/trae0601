import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { loadSaves } from '../utils/gameUtils';

interface SaveLoadScreenProps {
  mode: 'save' | 'load';
}

export const SaveLoadScreen = ({ mode }: SaveLoadScreenProps) => {
  const { setScreen, saveGame, loadGame, saves, setMessage } = useGameStore();

  useEffect(() => {
    useGameStore.setState({ saves: loadSaves() });
  }, []);

  const handleSlotClick = (slotId: number) => {
    const existingSave = saves.find((s) => s.id === slotId);

    if (mode === 'save') {
      if (existingSave) {
        if (confirm('确定要覆盖这个存档吗？')) {
          saveGame(slotId);
        }
      } else {
        saveGame(slotId);
      }
    } else {
      if (existingSave) {
        loadGame(slotId);
      } else {
        setMessage('这个存档位是空的');
        setTimeout(() => setMessage(null), 1500);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="saveload-screen">
      <div className="saveload-header">
        <h2>{mode === 'save' ? '💾 存档' : '📖 读档'}</h2>
        <button className="close-btn" onClick={() => setScreen('game')}>
          ✕ 关闭
        </button>
      </div>

      <div className="save-slots">
        {[1, 2, 3, 4, 5].map((slotId) => {
          const save = saves.find((s) => s.id === slotId);
          return (
            <button
              key={slotId}
              className={`save-slot ${save ? 'has-save' : 'empty'}`}
              onClick={() => handleSlotClick(slotId)}
            >
              <div className="slot-number">存档 {slotId}</div>
              {save ? (
                <>
                  <div className="slot-title">{save.sceneTitle}</div>
                  <div className="slot-level">Lv.{save.player.stats.level}</div>
                  <div className="slot-date">{formatDate(save.timestamp)}</div>
                </>
              ) : (
                <div className="slot-empty">空</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
