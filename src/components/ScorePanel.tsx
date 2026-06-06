import React, { useState, useEffect, useRef } from 'react';

interface ScorePanelProps {
  score: number;
  combo: number;
  highScore: number | null;
  scoreGain: number | null;
  scoreGainCombo: number;
}

interface FloatScore {
  id: number;
  value: number;
  combo: number;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({ score, combo, highScore, scoreGain, scoreGainCombo }) => {
  const [floatScores, setFloatScores] = useState<FloatScore[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    if (scoreGain !== null && scoreGain > 0) {
      const id = nextIdRef.current++;
      setFloatScores((prev) => [...prev, { id, value: scoreGain, combo: scoreGainCombo }]);

      setTimeout(() => {
        setFloatScores((prev) => prev.filter((s) => s.id !== id));
      }, 800);
    }
  }, [scoreGain, scoreGainCombo]);

  const isHighCombo = combo > 1;

  return (
    <div
      className="score-panel"
      style={{
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          className="score-item"
          style={{
            textAlign: 'center',
            position: 'relative',
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

        {floatScores.map((fs) => (
          <div
            key={fs.id}
            className="score-float-text"
            style={{
              fontSize: fs.combo > 1 ? 28 : 20,
              color: fs.combo > 1 ? '#FFD700' : 'var(--accent-color)',
              left: '50%',
              top: '50%',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            +{fs.value.toLocaleString()}
          </div>
        ))}
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
              color: isHighCombo ? '#FFD700' : 'var(--accent-color)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            连击
          </div>
          <div
            style={{
              fontSize: isHighCombo ? 42 : 32,
              fontWeight: 'bold',
              color: isHighCombo ? '#FFD700' : 'var(--accent-color)',
              textShadow: isHighCombo ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            x{combo}
          </div>
        </div>
      )}

      <div
        className="highscore-item"
        style={{
          textAlign: 'center',
          paddingLeft: 16,
          borderLeft: '1px solid var(--border-color)',
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
          最高分
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: highScore !== null ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {highScore !== null ? highScore.toLocaleString() : '破纪录中'}
        </div>
      </div>
    </div>
  );
};
