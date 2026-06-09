import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../store/AppContext';
import type { CommunityRules } from '../types';

export default function RulesPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  const [rules, setRules] = useState<CommunityRules>({ ...state.rules });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch({ type: 'UPDATE_RULES', payload: rules });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="page rules-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1>公共晾晒规则</h1>
      </div>

      <div className="rules-section">
        <h2 className="rules-section__title">⏱️ 超时提醒</h2>
        <div className="form-group">
          <label className="form-label">提前多少分钟预警提醒</label>
          <input
            type="number"
            className="form-input"
            value={rules.overtimeWarningMinutes}
            onChange={(e) =>
              setRules({ ...rules, overtimeWarningMinutes: Number(e.target.value) })
            }
            min={5}
            max={120}
          />
          <span className="form-hint">距离预计收回时间不足此分钟数时，显示"快到时间"提醒</span>
        </div>
        <div className="form-group">
          <label className="form-label">超时多少分钟标记为严重超时</label>
          <input
            type="number"
            className="form-input"
            value={rules.overtimeCriticalMinutes}
            onChange={(e) =>
              setRules({ ...rules, overtimeCriticalMinutes: Number(e.target.value) })
            }
            min={15}
            max={300}
          />
          <span className="form-hint">超过此时间后，提醒更加醒目</span>
        </div>
      </div>

      <div className="rules-section">
        <h2 className="rules-section__title">🌧️ 雨天自动提醒</h2>
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={rules.rainAutoRemind}
              onChange={(e) => setRules({ ...rules, rainAutoRemind: e.target.checked })}
            />
            <span>开启雨天自动提醒</span>
          </label>
          <span className="form-hint">
            当预报有雨时，自动提醒所有标记"怕雨"的晾晒物主人
          </span>
        </div>
      </div>

      <div className="rules-section">
        <h2 className="rules-section__title">📐 位置占用</h2>
        <div className="form-group">
          <label className="form-label">单个位置最长占用时间（小时）</label>
          <input
            type="number"
            className="form-input"
            value={rules.maxOccupancyHours}
            onChange={(e) =>
              setRules({ ...rules, maxOccupancyHours: Number(e.target.value) })
            }
            min={1}
            max={24}
          />
          <span className="form-hint">超过此时间未收回将显示超时提醒</span>
        </div>
      </div>

      <div className="rules-section">
        <h2 className="rules-section__title">📋 文明晾晒公约</h2>
        <div className="rules-covenant">
          <div className="rules-covenant__item">1. 晾晒前请先登记，注明位置和预计收回时间</div>
          <div className="rules-covenant__item">2. 按时收回，不要长时间占用公共位置</div>
          <div className="rules-covenant__item">3. 怕雨的物品请关注天气预报，及时收回</div>
          <div className="rules-covenant__item">4. 不要占用他人已登记的位置</div>
          <div className="rules-covenant__item">5. 遇到大风天气，请提前收回晾晒物</div>
          <div className="rules-covenant__item">6. 收回时请标记，方便邻居知道位置已空出</div>
        </div>
      </div>

      <button className="btn btn--primary btn--full" onClick={handleSave}>
        {saved ? '✅ 已保存' : '保存规则'}
      </button>
    </div>
  );
}
