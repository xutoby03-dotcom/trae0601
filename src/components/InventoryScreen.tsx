import { useGameStore } from '../store/gameStore';

export const InventoryScreen = () => {
  const { player, setScreen, useItem, equipItemAction, setMessage } = useGameStore();

  const handleUseItem = (itemId: string) => {
    const success = useItem(itemId);
    if (success) {
      setMessage('使用成功！');
      setTimeout(() => setMessage(null), 1500);
    }
  };

  const handleEquip = (itemId: string) => {
    equipItemAction(itemId);
    setMessage('装备成功！');
    setTimeout(() => setMessage(null), 1500);
  };

  return (
    <div className="inventory-screen">
      <div className="inventory-header">
        <h2>🎒 背包</h2>
        <button className="close-btn" onClick={() => setScreen('game')}>
          ✕ 关闭
        </button>
      </div>

      <div className="inventory-content">
        <div className="equipment-section">
          <h3>装备栏</h3>
          <div className="equipment-slots">
            <div className="equip-slot">
              <span className="slot-label">武器</span>
              <div className="slot-item">
                {player.equipment.weapon ? (
                  <>
                    <span className="item-icon">{player.equipment.weapon.icon}</span>
                    <span className="item-name">{player.equipment.weapon.name}</span>
                  </>
                ) : (
                  <span className="empty-slot">空</span>
                )}
              </div>
            </div>
            <div className="equip-slot">
              <span className="slot-label">护甲</span>
              <div className="slot-item">
                {player.equipment.armor ? (
                  <>
                    <span className="item-icon">{player.equipment.armor.icon}</span>
                    <span className="item-name">{player.equipment.armor.name}</span>
                  </>
                ) : (
                  <span className="empty-slot">空</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="items-section">
          <h3>物品</h3>
          <div className="items-grid">
            {player.inventory.length === 0 ? (
              <div className="empty-inventory">背包空空如也...</div>
            ) : (
              player.inventory.map((invItem) => (
                <div key={invItem.item.id} className="inventory-item">
                  <div className="item-info">
                    <span className="item-icon">{invItem.item.icon}</span>
                    <div className="item-details">
                      <span className="item-name">{invItem.item.name}</span>
                      <span className="item-desc">{invItem.item.description}</span>
                    </div>
                    <span className="item-quantity">x{invItem.quantity}</span>
                  </div>
                  <div className="item-actions">
                    {(invItem.item.type === 'weapon' || invItem.item.type === 'armor') && (
                      <button 
                        className="action-btn equip"
                        onClick={() => handleEquip(invItem.item.id)}
                      >
                        装备
                      </button>
                    )}
                    {invItem.item.type === 'consumable' && (
                      <button 
                        className="action-btn use"
                        onClick={() => handleUseItem(invItem.item.id)}
                      >
                        使用
                      </button>
                    )}
                    {invItem.item.type === 'key' && (
                      <span className="key-tag">重要道具</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
