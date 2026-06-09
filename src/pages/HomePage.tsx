import { useAppState } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { POSITION_LABELS, TYPE_LABELS, TYPE_ICONS } from '../types';
import type { DryingItem } from '../types';

function isRainingToday(): boolean {
  const hour = new Date().getHours();
  const seed = dayjs().format('YYYY-MM-DD');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const mightRain = Math.abs(hash % 10) < 3;
  if (mightRain && hour >= 10 && hour <= 18) return true;
  return false;
}

function classifyItems(items: DryingItem[], overtimeMinutes: number) {
  const active = items.filter((i) => i.status === 'active');
  const now = dayjs();
  const raining = isRainingToday();

  const overtime: DryingItem[] = [];
  const expiringSoon: DryingItem[] = [];
  const rainRisk: DryingItem[] = [];

  active.forEach((item) => {
    const end = dayjs(item.expectedEndTime);
    const diff = end.diff(now, 'minute');

    if (diff < 0) {
      overtime.push(item);
    } else if (diff <= overtimeMinutes) {
      expiringSoon.push(item);
    }

    if (raining && item.fearRain) {
      rainRisk.push(item);
    }
  });

  return { overtime, expiringSoon, rainRisk };
}

function ItemCard({ item, urgent }: { item: DryingItem; urgent?: boolean }) {
  const navigate = useNavigate();
  const now = dayjs();
  const end = dayjs(item.expectedEndTime);
  const diff = end.diff(now, 'minute');
  const isOvertime = diff < 0;

  return (
    <div
      className={`item-card ${urgent ? 'item-card--urgent' : ''} ${isOvertime ? 'item-card--overtime' : ''}`}
      onClick={() => navigate(`/detail/${item.id}`)}
    >
      <div className="item-card__header">
        <span className="item-card__icon">{TYPE_ICONS[item.type]}</span>
        <span className="item-card__type">{TYPE_LABELS[item.type]}</span>
        <span className="item-card__position">{POSITION_LABELS[item.position]}</span>
        {isOvertime && <span className="item-card__badge item-card__badge--danger">已超时</span>}
        {item.fearRain && <span className="item-card__badge item-card__badge--rain">怕雨</span>}
      </div>
      <div className="item-card__body">
        <div className="item-card__owner">
          <span className="item-card__label">晾晒人</span>
          <span>{item.owner}</span>
        </div>
        <div className="item-card__time">
          <span className="item-card__label">预计收回</span>
          <span>{dayjs(item.expectedEndTime).format('HH:mm')}</span>
          {isOvertime ? (
            <span className="item-card__overtime-text">
              已超时 {Math.abs(Math.ceil(diff / 60))} 小时
            </span>
          ) : (
            <span className="item-card__countdown">还剩 {diff} 分钟</span>
          )}
        </div>
        {item.messages.length > 0 && (
          <div className="item-card__messages">
            💬 {item.messages.length} 条留言
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { state } = useAppState();
  const { overtime, expiringSoon, rainRisk } = classifyItems(
    state.items,
    state.rules.overtimeWarningMinutes
  );

  return (
    <div className="page home-page">
      <div className="home-header">
        <h1>🌞 小区公共晾晒提醒</h1>
        <p className="home-subtitle">楼顶晒被子、晒鞋、晒衣服别忘了收</p>
      </div>

      {overtime.length === 0 && expiringSoon.length === 0 && rainRisk.length === 0 && (
        <div className="home-empty">
          <div className="home-empty__icon">☀️</div>
          <p>当前没有晾晒中的物品</p>
          <p className="home-empty__hint">点击底部"登记"添加晾晒物</p>
        </div>
      )}

      {overtime.length > 0 && (
        <section className="home-section home-section--danger">
          <h2 className="home-section__title">
            <span className="section-icon">🚨</span> 已超时
            <span className="section-count">{overtime.length}</span>
          </h2>
          <div className="home-section__list">
            {overtime.map((item) => (
              <ItemCard key={item.id} item={item} urgent />
            ))}
          </div>
        </section>
      )}

      {expiringSoon.length > 0 && (
        <section className="home-section home-section--warning">
          <h2 className="home-section__title">
            <span className="section-icon">⏰</span> 快到时间了
            <span className="section-count">{expiringSoon.length}</span>
          </h2>
          <div className="home-section__list">
            {expiringSoon.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {rainRisk.length > 0 && (
        <section className="home-section home-section--rain">
          <h2 className="home-section__title">
            <span className="section-icon">🌧️</span> 今天可能下雨
            <span className="section-count">{rainRisk.length}</span>
          </h2>
          <div className="home-section__list">
            {rainRisk.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
