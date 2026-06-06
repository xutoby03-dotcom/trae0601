import React, { useState } from 'react';
import { Modal } from './Modal';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  isNewRecord: boolean;
  onPlayAgain: () => void;
  onSaveScore: (name: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  isNewRecord,
  onPlayAgain,
  onSaveScore,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (playerName.trim()) {
      onSaveScore(playerName.trim());
      setSaved(true);
    }
  };

  const handlePlayAgain = () => {
    setPlayerName('');
    setSaved(false);
    onPlayAgain();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="游戏结束">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        {isNewRecord && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              border: '2px solid #FFD700',
              borderRadius: 12,
              color: '#FFD700',
              fontWeight: 'bold',
              fontSize: 16,
              animation: 'pulse 0.6s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
            }}
          >
            🏆 恭喜！新纪录！
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            最终得分
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: isNewRecord ? '#FFD700' : 'var(--accent-color)',
              textShadow: isNewRecord ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {score.toLocaleString()}
          </div>
        </div>

        {!saved ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="输入你的名字"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={12}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: 16,
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-color)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
            />
            <button
              onClick={handleSave}
              disabled={!playerName.trim()}
              style={{
                padding: '14px 24px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: playerName.trim() ? 'var(--accent-color)' : 'var(--border-color)',
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              保存分数
            </button>
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', padding: '12px 0' }}>✓ 分数已保存</div>
        )}

        <button
          onClick={handlePlayAgain}
          style={{
            padding: '14px 48px',
            borderRadius: 8,
            border: '2px solid var(--accent-color)',
            backgroundColor: 'transparent',
            color: 'var(--accent-color)',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-color)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--accent-color)';
          }}
        >
          再来一局
        </button>
      </div>
    </Modal>
  );
};
