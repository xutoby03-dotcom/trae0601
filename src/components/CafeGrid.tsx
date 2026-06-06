import { useGameStore } from '@/store/gameStore';
import { GRID_SIZE } from '@/data/gameData';

const CafeGrid = () => {
  const { grid, customers, selectedFurniture, placeFurniture, removeFurniture, phase, orderQueue, preparingOrders, startDay, togglePause, isPaused, gameSpeed, setGameSpeed } = useGameStore();

  const handleCellClick = (x: number, y: number) => {
    if (phase !== 'planning') return;
    
    if (grid[y][x]) {
      removeFurniture(x, y);
    } else if (selectedFurniture) {
      placeFurniture(x, y);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: '#4a5568' }}>🏠 咖啡馆平面图</h3>
        {phase === 'planning' && (
          <button className="btn btn-success" onClick={startDay}>
            ▶️ 开始营业
          </button>
        )}
        {phase === 'running' && (
          <div className="controls-bar">
            <div className="speed-control">
              <button 
                className={`speed-btn ${gameSpeed === 1 ? 'active' : ''}`}
                onClick={() => setGameSpeed(1)}
              >
                1x
              </button>
              <button 
                className={`speed-btn ${gameSpeed === 2 ? 'active' : ''}`}
                onClick={() => setGameSpeed(2)}
              >
                2x
              </button>
              <button 
                className={`speed-btn ${gameSpeed === 3 ? 'active' : ''}`}
                onClick={() => setGameSpeed(3)}
              >
                3x
              </button>
            </div>
            <button className="btn btn-warning btn-sm" onClick={togglePause}>
              {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
            </button>
          </div>
        )}
      </div>

      {phase === 'running' && (
        <>
          <div className="customer-queue">
            {customers.filter(c => c.state === 'waiting_in_line' || c.state === 'entering').map(customer => (
              <div key={customer.id} className="customer-bubble">
                <span>{customer.emoji}</span>
                <div className="patience-bar">
                  <div 
                    className={`patience-fill ${customer.patience < 30 ? 'low' : ''}`}
                    style={{ width: `${customer.patience}%` }}
                  />
                </div>
              </div>
            ))}
            {customers.filter(c => c.state === 'waiting_in_line').length === 0 && (
              <span style={{ color: '#a0aec0', fontSize: '14px' }}>暂无客人排队</span>
            )}
          </div>

          <div className="order-queue">
            <h4>🍳 制作中</h4>
            {preparingOrders.map((order, idx) => {
              const customer = customers.find(c => c.id === order.customerId);
              return (
                <div key={idx} className="order-item">
                  <span>
                    {customer?.emoji} {order.items.map(i => i.emoji).join('')}
                  </span>
                  <span style={{ fontSize: '12px', color: '#718096' }}>
                    {Math.round(order.progress)}%
                  </span>
                </div>
              );
            })}
            {preparingOrders.length > 0 && (
              <div className="order-progress">
                <div 
                  className="order-progress-fill"
                  style={{ width: `${preparingOrders[0]?.progress || 0}%` }}
                />
              </div>
            )}
            {preparingOrders.length === 0 && orderQueue.length === 0 && (
              <span style={{ color: '#a0aec0', fontSize: '13px' }}>暂无订单</span>
            )}
          </div>
        </>
      )}

      <div className="grid-container">
        <div className="cafe-grid">
          {Array(GRID_SIZE).fill(null).map((_, y) => (
            Array(GRID_SIZE).fill(null).map((_, x) => {
              const furniture = grid[y][x];
              const customersInCell = customers.filter(c => 
                c.position.x === x && c.position.y === y && c.state !== 'entering'
              );
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`grid-cell ${furniture ? 'occupied' : ''} ${selectedFurniture && !furniture && phase === 'planning' ? 'can-place' : ''}`}
                  onClick={() => handleCellClick(x, y)}
                >
                  {furniture && <span>{furniture.emoji}</span>}
                  {customersInCell.map(c => (
                    <span key={c.id} className="customer-in-cell" style={{ top: '4px', right: '4px' }}>
                      {c.emoji}
                    </span>
                  ))}
                </div>
              );
            })
          ))}
        </div>
      </div>

      {phase === 'planning' && (
        <p className="hint">💡 从右侧选择家具，点击格子放置；点击已放置的家具可移除</p>
      )}
    </div>
  );
};

export default CafeGrid;
