import { useGameStore } from '@/store/gameStore';

const MenuPanel = () => {
  const { menu, updateMenuPrice, unlockMenuItem, bankMoney } = useGameStore();

  const coffees = menu.filter(m => m.type === 'coffee');
  const desserts = menu.filter(m => m.type === 'dessert');

  const getProfit = (item: typeof menu[0]) => {
    return item.currentPrice - item.cost;
  };

  const getProfitPercent = (item: typeof menu[0]) => {
    return Math.round((getProfit(item) / item.cost) * 100);
  };

  const getPriceLevel = (item: typeof menu[0]) => {
    const ratio = item.currentPrice / item.basePrice;
    if (ratio <= 0.8) return { text: '超低价', color: '#38a169', desc: '非常好卖，但利润低' };
    if (ratio <= 0.95) return { text: '优惠价', color: '#38a169', desc: '销量不错，利润一般' };
    if (ratio <= 1.1) return { text: '正常价', color: '#ed8936', desc: '销量稳定，利润适中' };
    if (ratio <= 1.3) return { text: '稍贵', color: '#dd6b20', desc: '销量减少，利润较高' };
    return { text: '高价', color: '#e53e3e', desc: '销量很低，但利润极高' };
  };

  return (
    <div>
      <h3>☕ 咖啡菜单</h3>
      <div style={{ marginBottom: '12px' }}>
        {coffees.map(item => {
          const priceLevel = getPriceLevel(item);
          return (
            <div key={item.id} className={`menu-item ${!item.unlocked ? 'locked' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <span className="emoji" style={{ fontSize: '28px' }}>{item.emoji}</span>
                <div className="info" style={{ flex: 1 }}>
                  <div className="name">{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>
                    成本: ¥{item.cost} | 建议价: ¥{item.basePrice}
                  </div>
                </div>
                {item.unlocked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: getProfit(item) > 0 ? '#38a169' : '#e53e3e' }}>
                      +¥{getProfit(item)} ({getProfitPercent(item)}%)
                    </span>
                    <input
                      type="number"
                      className="price-input"
                      value={item.currentPrice}
                      min={item.cost}
                      onChange={(e) => updateMenuPrice(item.id, parseInt(e.target.value) || item.cost)}
                    />
                  </div>
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
              {item.unlocked && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: priceLevel.color, fontWeight: 600 }}>
                  {priceLevel.text} - {priceLevel.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ marginTop: '16px', marginBottom: '12px' }}>🍰 甜点菜单</h3>
      <div>
        {desserts.map(item => {
          const priceLevel = getPriceLevel(item);
          return (
            <div key={item.id} className={`menu-item ${!item.unlocked ? 'locked' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <span className="emoji" style={{ fontSize: '28px' }}>{item.emoji}</span>
                <div className="info" style={{ flex: 1 }}>
                  <div className="name">{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>
                    成本: ¥{item.cost} | 建议价: ¥{item.basePrice}
                  </div>
                </div>
                {item.unlocked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: getProfit(item) > 0 ? '#38a169' : '#e53e3e' }}>
                      +¥{getProfit(item)} ({getProfitPercent(item)}%)
                    </span>
                    <input
                      type="number"
                      className="price-input"
                      value={item.currentPrice}
                      min={item.cost}
                      onChange={(e) => updateMenuPrice(item.id, parseInt(e.target.value) || item.cost)}
                    />
                  </div>
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
              {item.unlocked && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: priceLevel.color, fontWeight: 600 }}>
                  {priceLevel.text} - {priceLevel.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="hint" style={{ marginTop: '16px' }}>
        💡 定价越低销量越高，定价越高利润越大，找到最佳平衡点！
      </p>
    </div>
  );
};

export default MenuPanel;
