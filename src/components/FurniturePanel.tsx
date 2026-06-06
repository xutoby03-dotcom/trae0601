import { useGameStore } from '@/store/gameStore';
import { FURNITURE_DATA } from '@/data/gameData';

const FurniturePanel = () => {
  const { furnitureInventory, selectedFurniture, selectFurniture, buyFurniture, phase, money, unlockFurniture, bankMoney } = useGameStore();

  const availableFurniture = furnitureInventory.filter(f => f.position === null);
  const placedFurniture = furnitureInventory.filter(f => f.position !== null);

  return (
    <div>
      <h3>🪑 家具库</h3>
      
      <div className="furniture-list">
        {availableFurniture.map(furniture => (
          <div
            key={furniture.id}
            className={`furniture-item ${selectedFurniture?.id === furniture.id ? 'selected' : ''}`}
            onClick={() => phase === 'planning' && selectFurniture(furniture)}
            draggable={phase === 'planning'}
            onDragStart={(e) => {
              if (phase === 'planning') {
                e.dataTransfer.setData('furnitureId', furniture.id);
                e.dataTransfer.effectAllowed = 'move';
              }
            }}
          >
            <span className="emoji">{furniture.emoji}</span>
            <div className="info">
              <div className="name">{furniture.name}</div>
              <div className="price">满意度 +{furniture.satisfactionBonus}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>🛒 购买家具</h3>
      <div className="furniture-list">
        {Object.entries(FURNITURE_DATA).map(([type, data]) => {
          const isUnlocked = furnitureInventory.some(f => f.type === type && f.unlocked);
          
          if (!isUnlocked) {
            return (
              <div key={type} className="furniture-item locked">
                <span className="emoji">{data.emoji}</span>
                <div className="info">
                  <div className="name">{data.name}</div>
                  <div className="price">解锁: ¥{data.unlockCost}</div>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  disabled={bankMoney < data.unlockCost}
                  onClick={(e) => {
                    e.stopPropagation();
                    unlockFurniture(type);
                  }}
                >
                  🔓 解锁
                </button>
              </div>
            );
          }
          
          return (
            <div key={type} className="furniture-item">
              <span className="emoji">{data.emoji}</span>
              <div className="info">
                <div className="name">{data.name}</div>
                <div className="price">¥{data.price}</div>
              </div>
              <button 
                className="btn btn-success btn-sm"
                disabled={money < data.price}
                onClick={(e) => {
                  e.stopPropagation();
                  const existing = furnitureInventory.find(f => f.type === type);
                  if (existing) buyFurniture(existing.id);
                }}
              >
                + 购买
              </button>
            </div>
          );
        })}
      </div>

      {placedFurniture.length > 0 && (
        <>
          <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>📍 已放置</h3>
          <div className="furniture-list">
            {placedFurniture.map(furniture => (
              <div key={furniture.id} className="furniture-item">
                <span className="emoji">{furniture.emoji}</span>
                <div className="info">
                  <div className="name">{furniture.name}</div>
                  <div className="price">
                    位置: ({furniture.position?.x}, {furniture.position?.y})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FurniturePanel;
