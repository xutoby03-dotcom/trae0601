import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import CafeGrid from '@/components/CafeGrid';
import FurniturePanel from '@/components/FurniturePanel';
import StaffPanel from '@/components/StaffPanel';
import MenuPanel from '@/components/MenuPanel';
import SettlementModal from '@/components/SettlementModal';
import BankPanel from '@/components/BankPanel';

function App() {
  const { phase, day, money, bankMoney, satisfaction, customersServed, customersLost, dailyRevenue, dailyCost, tick, gameSpeed } = useGameStore();
  const [activeTab, setActiveTab] = useState<'furniture' | 'staff' | 'menu' | 'bank'>('furniture');

  useEffect(() => {
    if (phase !== 'running') return;
    
    const interval = setInterval(() => {
      tick();
    }, 100);
    
    return () => clearInterval(interval);
  }, [phase, tick, gameSpeed]);

  return (
    <div className="app">
      <div className="header">
        <h1>☕ 咖啡馆模拟器</h1>
        <div className="stats">
          <div className="stat-item">
            <div className="label">第几天</div>
            <div className="value">📅 第 {day} 天</div>
          </div>
          <div className="stat-item">
            <div className="label">现金</div>
            <div className="value money">💰 ¥{money}</div>
          </div>
          <div className="stat-item">
            <div className="label">银行存款</div>
            <div className="value money">🏦 ¥{bankMoney}</div>
          </div>
          <div className="stat-item">
            <div className="label">满意度</div>
            <div className="value satisfaction">😊 {Math.round(satisfaction)}%</div>
          </div>
          {phase === 'running' && (
            <>
              <div className="stat-item">
                <div className="label">已服务</div>
                <div className="value">✅ {customersServed}</div>
              </div>
              <div className="stat-item">
                <div className="label">流失</div>
                <div className="value" style={{ color: '#e53e3e' }}>😞 {customersLost}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="game-area">
          <CafeGrid />
        </div>
        
        <div>
          <div className="panel">
            <div className="tabs">
              <div 
                className={`tab ${activeTab === 'furniture' ? 'active' : ''}`}
                onClick={() => setActiveTab('furniture')}
              >
                🪑 家具
              </div>
              <div 
                className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveTab('staff')}
              >
                👥 员工
              </div>
              <div 
                className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                📋 菜单
              </div>
              <div 
                className={`tab ${activeTab === 'bank' ? 'active' : ''}`}
                onClick={() => setActiveTab('bank')}
              >
                🏦 银行
              </div>
            </div>
            
            {activeTab === 'furniture' && <FurniturePanel />}
            {activeTab === 'staff' && <StaffPanel />}
            {activeTab === 'menu' && <MenuPanel />}
            {activeTab === 'bank' && <BankPanel />}
          </div>
        </div>
      </div>

      {phase === 'settlement' && (
        <SettlementModal 
          revenue={dailyRevenue} 
          cost={dailyCost} 
          served={customersServed}
          lost={customersLost}
        />
      )}
    </div>
  );
}

export default App;
