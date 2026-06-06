import React from 'react';

interface ScorePanelProps {
  score: number;
  combo: number;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({ score, combo }) => {
  return (
    <div className="score-panel" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <div
        className="score-item"
        style={{
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          分数
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {score.toLocaleString()}
        </div>
      </div>
      {combo > 0 && (
        <div
          className="combo-item"
          style={{
            textAlign: 'center',
            animation: 'pulse 0.5s ease-in-out',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'var(--accent-color)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            连击
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: 'var(--accent-color)',
            }}
          >
            x{combo}
          </div>
        </div>
      )}
    </div>
  );
};
