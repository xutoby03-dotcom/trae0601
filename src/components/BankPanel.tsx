import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

const BankPanel = () => {
  const { money, bankMoney, depositMoney, withdrawMoney } = useGameStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleDeposit = () => {
    const amount = parseInt(depositAmount);
    if (amount > 0) {
      depositMoney(amount);
      setDepositAmount('');
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (amount > 0) {
      withdrawMoney(amount);
      setWithdrawAmount('');
    }
  };

  return (
    <div>
      <h3>🏦 银行</h3>
      
      <div className="stat-item" style={{ marginBottom: '16px' }}>
        <div className="label">银行存款</div>
        <div className="value money">¥{bankMoney}</div>
      </div>
      
      <div className="stat-item" style={{ marginBottom: '16px' }}>
        <div className="label">手头现金</div>
        <div className="value">¥{money}</div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '6px' }}>存入现金</div>
        <div className="bank-section">
          <input
            type="number"
            placeholder="输入金额"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button 
            className="btn btn-success btn-sm"
            onClick={handleDeposit}
            disabled={!depositAmount || parseInt(depositAmount) > money}
          >
            存入
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '6px' }}>取出存款</div>
        <div className="bank-section">
          <input
            type="number"
            placeholder="输入金额"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button 
            className="btn btn-warning btn-sm"
            onClick={handleWithdraw}
            disabled={!withdrawAmount || parseInt(withdrawAmount) > bankMoney}
          >
            取出
          </button>
        </div>
      </div>

      <p className="hint" style={{ marginTop: '16px' }}>
        💡 银行存款可用于解锁高级家具、菜单项
      </p>
    </div>
  );
};

export default BankPanel;
