import { useAppState } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { POSITION_LABELS, TYPE_LABELS, TYPE_ICONS } from '../types';
import type { DryingItem, CommunityRules } from '../types';

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

interface ClassifiedItems {
  criticalOvertime: DryingItem[];
  overtime: DryingItem[];
  expiringSoon: DryingItem[];
  overstay: DryingItem[];
  rainRisk: DryingItem[];
}

function classifyItems(items: DryingItem[], rules: CommunityRules): ClassifiedItems {
  const active = items.filter((i) => i.status === 'active');
  const now = dayjs();
  const raining = isRainingToday();

  const criticalOvertime: DryingItem[] = [];
  const overtime: DryingItem[] = [];
  const expiringSoon: DryingItem[] = [];
  const overstay: DryingItem[] = [];
  const rainRisk: DryingItem[] = [];

  active.forEach((item) => {
    const end = dayjs(item.expectedEndTime);
    const diff = end.diff(now, 'minute');
    const start = dayjs(item.startTime);
    const occupiedMinutes = now.diff(start, 'minute');
    const maxOccupancyMinutes = rules.maxOccupancyHours * 60;

    if (diff < 0) {
      if (Math.abs(diff) >= rules.overtimeCriticalMinutes) {
        criticalOvertime.push(item);
      } else {
        overtime.push(item);
      }
    } else if (diff <= rules.overtimeWarningMinutes) {
      expiringSoon.push(item);
    }

    if (occupiedMinutes > maxOccupancyMinutes && diff >= 0) {
      overstay.push(item);
    }

    if (rules.rainAutoRemind && raining && item.fearRain) {
      rainRisk.push(item);
    }
  });

  return { criticalOvertime, overtime, expiringSoon, overstay, rainRisk };
}

function ItemCard({ item, variant }: { item: DryingItem; variant?: 'critical' | 'overtime' | 'overstay' | 'normal' }) {
  const navigate = useNavigate();
  const now = dayjs();
  const end = dayjs(item.expectedEndTime);
  const start = dayjs(item.startTime);
  const diff = end.diff(now, 'minute');
  const occupiedHours = now.diff(start, 'minute') / 60;
  const isOvertime = diff < 0;

  const cardClass = [
    'item-card',
    variant === 'critical' ? 'item-card--critical' : '',
    variant === 'overtime' ? 'item-card--overtime' : '',
    variant === 'overstay' ? 'item-card--overstay' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} onClick={() => navigate(`/detail/${item.id}`)}>
      <div className="item-card__header">
        <span className="item-card__icon">{TYPE_ICONS[item.type]}</span>
        <span className="item-card__type">{TYPE_LABELS[item.type]}</span>
        <span className="item-card__position">{POSITION_LABELS[item.position]}</span>
        {variant === 'critical' && <span className="item-card__badge item-card__badge--critical">严重超时</span>}
        {variant === 'overtime' && <span className="item-card__badge item-card__badge--danger">已超时</span>}
        {variant === 'overstay' && <span className="item-card__badge item-card__badge--overstay">占用过久</span>}
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
          {variant === 'critical' ? (
            <span className="item-card__critical-text">
              严重超时 {Math.abs(Math.ceil(diff / 60))} 小时
            </span>
          ) : isOvertime ? (
            <span className="item-card__overtime-text">
              已超时 {Math.abs(Math.ceil(diff / 60))} 小时
            </span>
          ) : (
            <span className="item-card__countdown">还剩 {diff} 分钟</span>
          )}
        </div>
        {occupiedHours > 4 && (
          <div className="item-card__occupancy">
            <span className="item-card__label">已占用</span>
            <span className={variant === 'overstay' ? 'item-card__overstay-text' : ''}>
              {Math.floor(occupiedHours)} 小时 {Math.round((occupiedHours % 1) * 60)} 分钟
            </span>
          </div>
        )}
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
  const { criticalOvertime, overtime, expiringSoon, overstay, rainRisk } = classifyItems(
    state.items,
    state.rules
  );

  const hasAny = criticalOvertime.length > 0 || overtime.length > 0 || expiringSoon.length > 0 || overstay.length > 0 || rainRisk.length > 0;

  return (
    <div className="page home-page">
      <div className="home-header">
        <h1>🌞 小区公共晾晒提醒</h1>
        <p className="home-subtitle">楼顶晒被子、晒鞋、晒衣服别忘了收</p>
      </div>

      {!hasAny && (
        <div className="home-empty">
          <div className="home-empty__icon">☀️</div>
          <p>当前没有晾晒中的物品</p>
          <p className="home-empty__hint">点击底部"登记"添加晾晒物</p>
        </div>
      )}

      {criticalOvertime.length > 0 && (
        <section className="home-section home-section--critical">
          <h2 className="home-section__title">
            <span className="section-icon">🔴</span> 严重超时
            <span className="section-count">{criticalOvertime.length}</span>
          </h2>
          <div className="home-section__list">
            {criticalOvertime.map((item) => (
              <ItemCard key={item.id} item={item} variant="critical" />
            ))}
          </div>
        </section>
      )}

      {overtime.length > 0 && (
        <section className="home-section home-section--danger">
          <h2 className="home-section__title">
            <span className="section-icon">🚨</span> 已超时
            <span className="section-count">{overtime.length}</span>
          </h2>
          <div className="home-section__list">
            {overtime.map((item) => (
              <ItemCard key={item.id} item={item} variant="overtime" />
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
              <ItemCard key={item.id} item={item} variant="normal" />
            ))}
          </div>
        </section>
      )}

      {overstay.length > 0 && (
        <section className="home-section home-section--overstay">
          <h2 className="home-section__title">
            <span className="section-icon">🕐</span> 占用过久
            <span className="section-count">{overstay.length}</span>
          </h2>
          <div className="home-section__list">
            {overstay.map((item) => (
              <ItemCard key={item.id} item={item} variant="overstay" />
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
              <ItemCard key={item.id} item={item} variant="normal" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
