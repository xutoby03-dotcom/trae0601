import { useGameStore } from '../store/gameStore';
import { STORY_NODES } from '../data/story';
import { hasItem } from '../utils/gameUtils';

export const SceneDisplay = () => {
  const { currentNodeId, selectOption, player } = useGameStore();
  const node = STORY_NODES[currentNodeId];

  if (!node) {
    return <div className="scene-display">场景加载失败...</div>;
  }

  const isOptionAvailable = (option: any) => {
    if (option.requiresItem && !hasItem(player.inventory, option.requiresItem)) {
      return false;
    }
    if (option.requiresFlag && !player.flags[option.requiresFlag]) {
      return false;
    }
    return true;
  };

  const getOptionText = (option: any) => {
    let text = option.text;
    if (option.requiresItem && !hasItem(player.inventory, option.requiresItem)) {
      const itemName = option.requiresItem;
      text += ` 🔒(需要道具)`;
    }
    return text;
  };

  const endingClass = node.isEnding ? `ending-${node.endingType}` : '';

  return (
    <div className={`scene-display ${endingClass}`}>
      <div className="scene-header">
        <h2 className="scene-title">{node.title}</h2>
      </div>

      <div className="scene-description">
        {node.description.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="scene-options">
        {node.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${!isOptionAvailable(option) ? 'disabled' : ''}`}
            onClick={() => isOptionAvailable(option) && selectOption(option)}
            disabled={!isOptionAvailable(option)}
          >
            {getOptionText(option)}
          </button>
        ))}
      </div>
    </div>
  );
};
