import { useGameStore } from '@/store/gameStore';

const MenuPanel = () => {
  const { menu, updateMenuPrice, unlockMenuItem, bankMoney } = useGameStore();

  const coffees = menu.filter(m => m.type === 'coffee');
  const desserts = menu.filter(m => m.type === 'dessert');

  return (
    <div>
      <h3>📋 咖啡菜单</h3>
      <div className="menu-list">
        {coffees.map(item => (
          <div key={item.id} className={`menu-item ${!item.unlocked ? 'locked' : ''}`}>
            <span className="emoji">{item.emoji}</span>
            <div className="info">
              <div className="name">{item.name}</div>
              <div style={{ fontSize: '12px', color: '#718096' }}>
                成本: ¥{item.cost} | 建议价: ¥{item.basePrice}
              </div>
            </div>
            {item.unlocked ? (
              <input
                type="number"
                className="price-input"
                value={item.currentPrice}
                min={item.cost}
                onChange={(e) => updateMenuPrice(item.id, parseInt(e.target.value) || item.cost)}
              />
            ) : (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => unlockMenuItem(item.id)}
                disabled={bankMoney < item.unlockCost}
              >
                🔓 ¥{item.unlockCost}
              </button>
            )}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>🍰 甜点菜单</h3>
      <div className="menu-list">
        {desserts.map(item => (
          <div key={item.id} className={`menu-item ${!item.unlocked ? 'locked' : ''}`}>
            <span className="emoji">{item.emoji}</span>
            <div className="info">
              <div className="name">{item.name}</div>
              <div style={{ fontSize: '12px', color: '#718096' }}>
                成本: ¥{item.cost} | 建议价: ¥{item.basePrice}
              </div>
            </div>
            {item.unlocked ? (
              <input
                type="number"
                className="price-input"
                value={item.currentPrice}
                min={item.cost}
                onChange={(e) => updateMenuPrice(item.id, parseInt(e.target.value) || item.cost)}
              />
            ) : (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => unlockMenuItem(item.id)}
                disabled={bankMoney < item.unlockCost}
              >
                🔓 ¥{item.unlockCost}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="hint" style={{ marginTop: '16px' }}>
        💡 调整定价影响利润和客流，价格太高客人会减少
      </p>
    </div>
  );
};

export default MenuPanel;
