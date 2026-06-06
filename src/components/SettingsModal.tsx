import React from 'react';
import { Modal } from './Modal';
import { Difficulty, ThemeMode, Skin, DIFFICULTY_CONFIG } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  themeMode: ThemeMode;
  skin: Skin;
  onDifficultyChange: (d: Difficulty) => void;
  onThemeModeChange: (m: ThemeMode) => void;
  onSkinChange: (s: Skin) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  difficulty,
  themeMode,
  skin,
  onDifficultyChange,
  onThemeModeChange,
  onSkinChange,
}) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const themeModes: ThemeMode[] = ['light', 'dark'];
  const skins: Skin[] = ['wood', 'metal'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="游戏设置">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            难度选择
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: 8,
                  border: '2px solid',
                  borderColor: difficulty === d ? 'var(--accent-color)' : 'var(--border-color)',
                  backgroundColor: difficulty === d ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: difficulty === d ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {DIFFICULTY_CONFIG[d].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            主题模式
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {themeModes.map((m) => (
              <button
                key={m}
                onClick={() => onThemeModeChange(m)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: 8,
                  border: '2px solid',
                  borderColor: themeMode === m ? 'var(--accent-color)' : 'var(--border-color)',
                  backgroundColor: themeMode === m ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: themeMode === m ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {m === 'light' ? '☀️ 浅色' : '🌙 深色'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            皮肤风格
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {skins.map((s) => (
              <button
                key={s}
                onClick={() => onSkinChange(s)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: 8,
                  border: '2px solid',
                  borderColor: skin === s ? 'var(--accent-color)' : 'var(--border-color)',
                  backgroundColor: skin === s ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: skin === s ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {s === 'wood' ? '🪵 木质' : '⚙️ 金属'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
