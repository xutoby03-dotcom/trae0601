import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { LeaderboardEntry, Difficulty, DIFFICULTY_CONFIG } from '../types';
import { getLeaderboard } from '../storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: Difficulty;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getLeaderboard(selectedDifficulty)
        .then(setEntries)
        .finally(() => setLoading(false));
    }
  }, [isOpen, selectedDifficulty]);

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="排行榜">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: 8,
                border: '2px solid',
                borderColor: selectedDifficulty === d ? 'var(--accent-color)' : 'var(--border-color)',
                backgroundColor: selectedDifficulty === d ? 'var(--accent-color)' : 'var(--bg-secondary)',
                color: selectedDifficulty === d ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
            加载中...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
            暂无记录
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map((entry, index) => (
              <div
                key={entry.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 8,
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor:
                      index === 0
                        ? '#FFD700'
                        : index === 1
                        ? '#C0C0C0'
                        : index === 2
                        ? '#CD7F32'
                        : 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: index < 3 ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{entry.date}</div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 18, color: 'var(--accent-color)' }}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
