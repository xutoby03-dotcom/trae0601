import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../store/AppContext';
import { POSITION_LABELS } from '../types';
import dayjs from 'dayjs';

export default function StatsPage() {
  const navigate = useNavigate();
  const { state } = useAppState();

  const stats = useMemo(() => {
    const now = dayjs();
    const monthStart = now.startOf('month');
    const monthItems = state.items.filter((i) => dayjs(i.createdAt).isAfter(monthStart));

    const overtimeCount = monthItems.filter(
      (i) => dayjs(i.expectedEndTime).isBefore(dayjs(i.retrievedAt || now))
    ).length;

    const positionCount: Record<string, number> = {};
    monthItems.forEach((i) => {
      positionCount[i.position] = (positionCount[i.position] || 0) + 1;
    });

    const topPosition = Object.entries(positionCount).sort((a, b) => b[1] - a[1]);

    const ownerCount: Record<string, { total: number; overtime: number }> = {};
    monthItems.forEach((i) => {
      if (!ownerCount[i.owner]) ownerCount[i.owner] = { total: 0, overtime: 0 };
      ownerCount[i.owner].total++;
      if (dayjs(i.expectedEndTime).isBefore(dayjs(i.retrievedAt || now))) {
        ownerCount[i.owner].overtime++;
      }
    });

    const forgetfulOwners = Object.entries(ownerCount)
      .filter(([, v]) => v.overtime > 0)
      .sort((a, b) => b[1].overtime - a[1].overtime);

    const wetCount = monthItems.filter((i) => i.wasWet).length;
    const movedCount = monthItems.filter((i) => i.wasMoved).length;

    const activeCount = monthItems.filter((i) => i.status === 'active').length;
    const retrievedCount = monthItems.filter((i) => i.status === 'retrieved').length;

    return {
      total: monthItems.length,
      overtimeCount,
      activeCount,
      retrievedCount,
      wetCount,
      movedCount,
      topPosition,
      forgetfulOwners,
    };
  }, [state.items]);

  const maxPosCount = stats.topPosition.length > 0 ? stats.topPosition[0][1] : 1;

  return (
    <div className="page stats-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1>本月统计</h1>
      </div>

      <div className="stats-overview">
        <div className="stats-card">
          <div className="stats-card__value">{stats.total}</div>
          <div className="stats-card__label">总登记数</div>
        </div>
        <div className="stats-card stats-card--danger">
          <div className="stats-card__value">{stats.overtimeCount}</div>
          <div className="stats-card__label">超时次数</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__value">{stats.activeCount}</div>
          <div className="stats-card__label">晾晒中</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__value">{stats.retrievedCount}</div>
          <div className="stats-card__label">已收回</div>
        </div>
      </div>

      <div className="stats-section">
        <h2 className="stats-section__title">😢 不幸记录</h2>
        <div className="stats-incident">
          <div className="stats-incident__item">
            <span className="stats-incident__icon">💧</span>
            <span className="stats-incident__value">{stats.wetCount}</span>
            <span className="stats-incident__label">被淋湿</span>
          </div>
          <div className="stats-incident__item">
            <span className="stats-incident__icon">👆</span>
            <span className="stats-incident__value">{stats.movedCount}</span>
            <span className="stats-incident__label">被挪动</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2 className="stats-section__title">📍 位置占用排行</h2>
        {stats.topPosition.length === 0 && (
          <div className="stats-empty">本月暂无数据</div>
        )}
        <div className="stats-bar-list">
          {stats.topPosition.map(([pos, count]) => (
            <div key={pos} className="stats-bar-item">
              <span className="stats-bar-item__label">
                {POSITION_LABELS[pos as keyof typeof POSITION_LABELS] || pos}
              </span>
              <div className="stats-bar-item__bar">
                <div
                  className="stats-bar-item__fill"
                  style={{ width: `${(count / maxPosCount) * 100}%` }}
                />
              </div>
              <span className="stats-bar-item__value">{count}次</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h2 className="stats-section__title">⏰ 经常忘收的邻居</h2>
        {stats.forgetfulOwners.length === 0 && (
          <div className="stats-empty">大家都按时收了，太棒了！🎉</div>
        )}
        <div className="stats-rank-list">
          {stats.forgetfulOwners.map(([owner, data], index) => (
            <div key={owner} className="stats-rank-item">
              <span className="stats-rank-item__rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
              </span>
              <span className="stats-rank-item__name">{owner}</span>
              <span className="stats-rank-item__stat">
                超时 <strong>{data.overtime}</strong> / {data.total} 次
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
