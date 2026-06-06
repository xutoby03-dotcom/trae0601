import { useEffect, useRef, useReducer, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gameReducer, initialGameState, GameRenderer } from '../game';
import { MAP_CONFIGS, TOWER_CONFIGS, getTowerLevelConfig, getTowerUpgradeCost, getTowerSellValue, CANVAS_WIDTH, CANVAS_HEIGHT } from '../configs';
import { TowerType } from '../types';
import { distance } from '../utils';

export const GameScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const stateRef = useRef(state);
  stateRef.current = state;

  const { mapId, difficulty } = (location.state as { mapId?: string; difficulty?: string }) || {};

  useEffect(() => {
    const map = MAP_CONFIGS.find(m => m.id === mapId);
    if (!map || !difficulty) {
      navigate('/');
      return;
    }
    dispatch({ type: 'START_GAME', payload: { map, difficulty: difficulty as any } });
  }, [mapId, difficulty, navigate]);

  useEffect(() => {
    if (!canvasRef.current) return;
    rendererRef.current = new GameRenderer(canvasRef.current);
  }, []);

  useEffect(() => {
    if (state.status !== 'playing' && state.status !== 'paused') return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min(timestamp - lastTimeRef.current, 100);
      lastTimeRef.current = timestamp;

      if (stateRef.current.status === 'playing') {
        dispatch({ type: 'TICK', payload: { deltaTime } });
      }

      if (rendererRef.current) {
        rendererRef.current.render(stateRef.current);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'won' || state.status === 'lost') {
      navigate('/gameover', {
        state: {
          won: state.status === 'won',
          monstersKilled: state.monstersKilled,
          totalDamageDealt: state.totalDamageDealt,
          goldRemaining: state.gold,
          livesRemaining: state.lives,
        },
      });
    }
  }, [state.status, state.monstersKilled, state.totalDamageDealt, state.gold, state.lives, navigate]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || !state.map) return;

    const coords = rendererRef.current.getCanvasCoords(e);

    if (state.selectedTowerType) {
      let nearestSlotIndex = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < state.map.towerSlots.length; i++) {
        const slot = state.map.towerSlots[i];
        const dist = distance(coords, slot);
        if (dist < 40 && dist < nearestDist) {
          const hasTower = state.towers.some(t => t.slotIndex === i);
          if (!hasTower) {
            nearestDist = dist;
            nearestSlotIndex = i;
          }
        }
      }

      if (nearestSlotIndex !== -1) {
        dispatch({
          type: 'BUILD_TOWER',
          payload: { slotIndex: nearestSlotIndex, type: state.selectedTowerType },
        });
      }
      return;
    }

    let clickedTower = null;
    for (const tower of state.towers) {
      const dist = distance(coords, { x: tower.x, y: tower.y });
      if (dist < 30) {
        clickedTower = tower;
        break;
      }
    }

    dispatch({ type: 'SELECT_TOWER', payload: clickedTower });
  }, [state.selectedTowerType, state.map, state.towers]);

  const handleSelectTowerType = (type: TowerType | null) => {
    dispatch({ type: 'SELECT_TOWER_TYPE', payload: type });
  };

  const handleUpgradeTower = () => {
    if (!state.selectedTower) return;
    dispatch({ type: 'UPGRADE_TOWER', payload: { towerId: state.selectedTower.id } });
  };

  const handleSellTower = () => {
    if (!state.selectedTower) return;
    dispatch({ type: 'SELL_TOWER', payload: { towerId: state.selectedTower.id } });
  };

  const handlePauseResume = () => {
    if (state.status === 'playing') {
      dispatch({ type: 'PAUSE_GAME' });
    } else if (state.status === 'paused') {
      dispatch({ type: 'RESUME_GAME' });
    }
  };

  const handleSetSpeed = (speed: 1 | 2 | 3) => {
    dispatch({ type: 'SET_SPEED', payload: speed });
  };

  const handleBackToMenu = () => {
    dispatch({ type: 'RESET_GAME' });
    navigate('/');
  };

  const formatTime = (ms: number) => {
    return Math.ceil(ms / 1000).toString();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4">
      <div className="w-full max-w-[1200px] flex justify-between items-center panel-glass rounded-xl px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-yellow-400">{state.gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            <span className="text-xl font-bold text-red-400">{state.lives}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span className="text-xl font-bold text-blue-400">
              {state.currentWave}/{state.totalWaves}
            </span>
          </div>
        </div>

        <div className="text-center">
          {!state.waveInProgress && state.currentWave < state.totalWaves ? (
            <div className="text-lg">
              <span className="text-gray-400">下一波: </span>
              <span className="text-orange-400 font-bold animate-pulse">
                {formatTime(state.waveTimer)}秒
              </span>
            </div>
          ) : state.waveInProgress ? (
            <div className="text-lg text-red-400 font-bold animate-pulse">
              ⚔️ 战斗中...
            </div>
          ) : null}
        </div>

        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          onClick={handleBackToMenu}
        >
          🏠 返回菜单
        </button>
      </div>

      <div className="flex gap-4 items-start">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-xl glow-border cursor-pointer"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            onClick={handleCanvasClick}
          />
        </div>

        <div className="w-64 flex flex-col gap-4">
          <div className="panel-glass rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-200">
              🏗️ 建造防御塔
            </h3>
            <div className="flex flex-col gap-3">
              {(Object.keys(TOWER_CONFIGS) as TowerType[]).map((type) => {
                const config = TOWER_CONFIGS[type];
                const isSelected = state.selectedTowerType === type;
                const canAfford = state.gold >= config.baseCost;

                return (
                  <button
                    key={type}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-blue-400 bg-blue-500/20 scale-105'
                        : canAfford
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50'
                        : 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canAfford && handleSelectTowerType(isSelected ? null : type)}
                    disabled={!canAfford}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: config.color, backgroundColor: `${config.color}20` }}
                      >
                        {type === 'single' && (
                          <div className="w-4 h-4" style={{ backgroundColor: config.color }} />
                        )}
                        {type === 'aoe' && (
                          <div
                            className="w-0 h-0"
                            style={{
                              borderLeft: `8px solid ${config.color}`,
                              borderTop: '6px solid transparent',
                              borderBottom: '6px solid transparent',
                            }}
                          />
                        )}
                        {type === 'ice' && (
                          <div
                            className="w-6 h-1.5"
                            style={{ backgroundColor: config.color, transform: 'rotate(45deg)' }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: config.color }}>
                          {config.name}
                        </p>
                        <p className="text-xs text-gray-400">{config.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-yellow-400 font-semibold">
                      💰 {config.baseCost}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {state.selectedTower && (
            <div className="panel-glass rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3 text-center text-gray-200">
                📊 塔信息
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">类型:</span>
                  <span style={{ color: TOWER_CONFIGS[state.selectedTower.type].color }}>
                    {TOWER_CONFIGS[state.selectedTower.type].name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">等级:</span>
                  <span className="text-yellow-400">
                    {'⭐'.repeat(state.selectedTower.level + 1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">伤害:</span>
                  <span className="text-red-400">
                    {getTowerLevelConfig(state.selectedTower.type, state.selectedTower.level).damage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">射程:</span>
                  <span className="text-blue-400">
                    {getTowerLevelConfig(state.selectedTower.type, state.selectedTower.level).range}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {state.selectedTower.level < 2 && (
                  <button
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      state.gold >= (getTowerUpgradeCost(state.selectedTower.type, state.selectedTower.level) || 0)
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleUpgradeTower}
                    disabled={
                      state.gold < (getTowerUpgradeCost(state.selectedTower.type, state.selectedTower.level) || 0)
                    }
                  >
                    ⬆️ 升级 (💰 {getTowerUpgradeCost(state.selectedTower.type, state.selectedTower.level)})
                  </button>
                )}
                <button
                  className="w-full py-2 rounded-lg font-semibold bg-red-600/80 hover:bg-red-500 text-white transition-colors"
                  onClick={handleSellTower}
                >
                  💸 出售 (+💰 {getTowerSellValue(state.selectedTower.type, state.selectedTower.level)})
                </button>
              </div>
            </div>
          )}

          <div className="panel-glass rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-200">
              ⚡ 游戏速度
            </h3>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((speed) => (
                <button
                  key={speed}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    state.speed === speed
                      ? 'bg-blue-500 text-white scale-105'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  onClick={() => handleSetSpeed(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <button
              className={`w-full mt-2 py-2 rounded-lg font-semibold transition-colors ${
                state.status === 'paused'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-500 text-white'
              }`}
              onClick={handlePauseResume}
            >
              {state.status === 'paused' ? '▶️ 继续' : '⏸️ 暂停'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
