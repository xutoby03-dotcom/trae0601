import { useGameStore } from '../store/gameStore';
import { STORY_NODES } from '../data/story';
import { hasItem } from '../utils/gameUtils';

export const SceneDisplay = () => {
  const { currentNodeId, selectOption, player } = useGameStore();
  const node = STORY_NODES[currentNodeId];

  if (!node) {
    return <div className="scene-display">场景加载失败...</div>;
  }

  const availableOptions = node.options.filter((option: any) => {
    if (option.requiresItem && !hasItem(player.inventory, option.requiresItem)) {
      return false;
    }
    if (option.requiresFlag && !player.flags[option.requiresFlag]) {
      return false;
    }
    return true;
  });

  const weaponName = player.equipment.weapon 
    ? `${player.equipment.weapon.icon} ${player.equipment.weapon.name}` 
    : '✊ 赤手空拳';
  
  const armorName = player.equipment.armor 
    ? `${player.equipment.armor.icon} ${player.equipment.armor.name}` 
    : '👕 布衣';

  const endingClass = node.isEnding ? `ending-${node.endingType}` : '';

  return (
    <div className={`scene-display ${endingClass}`}>
      <div className="equipment-overview">
        <span className="equip-item">🗡️ {weaponName}</span>
        <span className="equip-divider">|</span>
        <span className="equip-item">🛡️ {armorName}</span>
      </div>

      <div className="scene-header">
        <h2 className="scene-title">{node.title}</h2>
      </div>

      <div className="scene-description">
        {node.description.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="scene-options">
        {availableOptions.map((option, index) => (
          <button
            key={index}
            className="option-btn"
            onClick={() => selectOption(option)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};
