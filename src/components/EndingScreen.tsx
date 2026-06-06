import { useGameStore } from '../store/gameStore';
import { STORY_NODES } from '../data/story';

const endingConfig = {
  good: {
    title: '🏆 好结局达成！',
    borderColor: '#ffd700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    icon: '👑',
  },
  bad: {
    title: '💀 坏结局达成',
    borderColor: '#ff4757',
    bgColor: 'rgba(255, 71, 87, 0.1)',
    glowColor: 'rgba(255, 71, 87, 0.4)',
    icon: '☠️',
  },
  neutral: {
    title: '⚖️ 普通结局达成',
    borderColor: '#c0c0c0',
    bgColor: 'rgba(192, 192, 192, 0.1)',
    glowColor: 'rgba(192, 192, 192, 0.4)',
    icon: '🎭',
  },
  hidden: {
    title: '✨ 隐藏结局达成！',
    borderColor: '#a55eea',
    bgColor: 'rgba(165, 94, 234, 0.1)',
    glowColor: 'rgba(165, 94, 234, 0.4)',
    icon: '🌟',
  },
};

export const EndingScreen = () => {
  const { currentNodeId, currentEndingType, setScreen, startNewGame } = useGameStore();
  const node = STORY_NODES[currentNodeId];
  const config = currentEndingType ? endingConfig[currentEndingType] : endingConfig.neutral;

  if (!node) {
    return <div className="ending-screen">加载失败...</div>;
  }

  return (
    <div 
      className="ending-screen"
      style={{
        '--ending-border': config.borderColor,
        '--ending-bg': config.bgColor,
        '--ending-glow': config.glowColor,
      } as React.CSSProperties}
    >
      <div className="ending-container">
        <div className="ending-badge">
          <span className="ending-icon">{config.icon}</span>
          <h1 className="ending-type" style={{ color: config.borderColor }}>
            {config.title}
          </h1>
        </div>

        <h2 className="ending-title">{node.title}</h2>

        <div className="ending-description">
          {node.description.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="ending-stats">
          <div className="stat-row">
            <span>最终等级</span>
            <span className="stat-value">Lv.{useGameStore.getState().player.stats.level}</span>
          </div>
          <div className="stat-row">
            <span>收集金币</span>
            <span className="stat-value gold">{useGameStore.getState().player.stats.gold} 💰</span>
          </div>
        </div>

        <div className="ending-options">
          <button 
            className="ending-btn restart"
            onClick={() => startNewGame()}
          >
            🔄 重新开始
          </button>
          <button 
            className="ending-btn title"
            onClick={() => setScreen('title')}
          >
            🏠 返回标题
          </button>
        </div>
      </div>
    </div>
  );
};
