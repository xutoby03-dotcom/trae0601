import { useGameStore } from '@/store/gameStore';

interface SettlementModalProps {
  revenue: number;
  cost: number;
  served: number;
  lost: number;
}

const SettlementModal = ({ revenue, cost, served, lost }: SettlementModalProps) => {
  const { phase, day, startDay } = useGameStore();
  
  if (phase !== 'settlement') return null;

  const profit = revenue - cost;

  return (
    <div className="settlement-modal">
      <div className="settlement-content">
        <h2>📊 第 {day - 1} 天结算</h2>
        
        <div className="settlement-row">
          <span className="label">营业收入</span>
          <span className="value">¥{revenue}</span>
        </div>
        
        <div className="settlement-row">
          <span className="label">成本支出</span>
          <span className="value" style={{ color: '#e53e3e' }}>-¥{cost}</span>
        </div>
        
        <div className="settlement-row">
          <span className="label">服务客人</span>
          <span className="value">{served} 位</span>
        </div>
        
        <div className="settlement-row">
          <span className="label">流失客人</span>
          <span className="value" style={{ color: '#e53e3e' }}>{lost} 位</span>
        </div>
        
        <div className="settlement-row total">
          <span className="label">今日净利润</span>
          <span className={`value ${profit < 0 ? 'negative' : ''}`}>
            {profit >= 0 ? '+' : ''}¥{profit}
          </span>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: '12px 32px', fontSize: '16px' }}
            onClick={startDay}
          >
            开始第 {day} 天 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
