import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { GameGrid } from './components/GameGrid';
import { BlockTray } from './components/BlockTray';
import { ScorePanel } from './components/ScorePanel';
import { SettingsModal } from './components/SettingsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameOverModal } from './components/GameOverModal';
import { getThemeConfig } from './theme';
import { addLeaderboardEntry } from './storage';
import { ThemeMode, Skin, Difficulty, DIFFICULTY_CONFIG } from './types';

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [skin, setSkin] = useState<Skin>('wood');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const {
    gameState,
    clearingCells,
    selectBlock,
    tryPlaceBlock,
    handleCellHover,
    canPlaceAtHover,
    getGhostCells,
    resetGame,
  } = useGame(difficulty);

  const theme = getThemeConfig(themeMode, skin);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', theme.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--bg-grid', theme.bgGrid);
    root.style.setProperty('--cell-bg', theme.bgCell);
    root.style.setProperty('--cell-filled', theme.bgCellFilled);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--accent-color', theme.accentColor);
  }, [theme]);

  const handleSaveScore = (name: string) => {
    addLeaderboardEntry({
      name,
      score: gameState.score,
      difficulty: gameState.difficulty,
      date: new Date().toLocaleDateString('zh-CN'),
    });
  };

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    resetGame(d);
    setShowSettings(false);
  };

  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <div
        className="game-wrapper"
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          className="header"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 'bold',
              color: 'var(--text-primary)',
            }}
          >
            🧩 木块消除
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowLeaderboard(true)}
              style={buttonStyle}
              title="排行榜"
            >
              🏆
            </button>
            <button
              onClick={() => setShowSettings(true)}
              style={buttonStyle}
              title="设置"
            >
              ⚙️
            </button>
          </div>
        </div>

        <div
          className="difficulty-badge"
          style={{
            padding: '6px 16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 20,
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}
        >
          {DIFFICULTY_CONFIG[difficulty].label}
        </div>

        <ScorePanel score={gameState.score} combo={gameState.combo} />

        <div
          className="grid-container"
          style={{
            backgroundColor: 'var(--bg-grid)',
            borderRadius: 16,
            padding: 4,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          <GameGrid
            grid={gameState.grid}
            ghostCells={getGhostCells()}
            clearingCells={clearingCells}
            canPlace={canPlaceAtHover()}
            skin={skin}
            onCellClick={tryPlaceBlock}
            onCellHover={handleCellHover}
          />
        </div>

        <div
          className="tray-container"
          style={{
            padding: 16,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 16,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            待放置方块
          </div>
          <BlockTray
            blocks={gameState.currentBlocks}
            selectedIndex={gameState.selectedBlockIndex}
            skin={skin}
            onSelectBlock={selectBlock}
          />
        </div>

        <button
          onClick={() => resetGame()}
          style={{
            padding: '12px 32px',
            borderRadius: 8,
            border: '2px solid var(--border-color)',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.color = 'var(--accent-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          🔄 重新开始
        </button>

        <div
          className="instructions"
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          点击下方方块选中，然后点击网格放置<br />
          填满一行、一列或 3×3 宫格即可消除得分
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        difficulty={difficulty}
        themeMode={themeMode}
        skin={skin}
        onDifficultyChange={handleDifficultyChange}
        onThemeModeChange={setThemeMode}
        onSkinChange={setSkin}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentDifficulty={difficulty}
      />

      <GameOverModal
        isOpen={gameState.gameOver}
        score={gameState.score}
        onPlayAgain={() => resetGame()}
        onSaveScore={handleSaveScore}
      />
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
};

export default App;
