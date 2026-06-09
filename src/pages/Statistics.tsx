import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatMoney } from '../utils';
import { ArrowLeft, Store, User, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Statistics() {
  const navigate = useNavigate();
  const { orders } = useStore();

  const stats = useMemo(() => {
    const restaurantMap = new Map<string, number>();
    const personMap = new Map<string, { spent: number; count: number; notes: Map<string, number> }>();
    const noteErrorMap = new Map<string, number>();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    orders.forEach(order => {
      if (order.createdAt < monthStart) return;

      restaurantMap.set(order.restaurant, (restaurantMap.get(order.restaurant) || 0) + 1);

      order.participants.forEach(p => {
        if (p.items.length === 0) return;

        const pShare = order.participants
          .filter(pp => pp.items.length > 0)
          .reduce((sum, pp) => {
            const itemsTotal = pp.items.reduce((s, i) => s + i.price * i.quantity, 0);
            return sum + itemsTotal;
          }, 0);

        const myItemsTotal = p.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const activeCount = order.participants.filter(pp => pp.items.length > 0).length || 1;
        const deliveryShare = order.deliveryFee / activeCount;
        const allItemsTotal = order.participants.reduce(
          (sum, pp) => sum + pp.items.reduce((s, i) => s + i.price * i.quantity, 0), 0
        );
        let discountShare = 0;
        if (allItemsTotal >= order.discountThreshold && order.discountAmount > 0) {
          discountShare = (myItemsTotal / allItemsTotal) * order.discountAmount;
        }
        const myShare = Math.max(0, myItemsTotal - discountShare + deliveryShare);

        if (!personMap.has(p.name)) {
          personMap.set(p.name, { spent: 0, count: 0, notes: new Map() });
        }
        const ps = personMap.get(p.name)!;
        ps.spent += myShare;
        ps.count += 1;

        p.items.forEach(item => {
          item.notes.forEach(note => {
            ps.notes.set(note, (ps.notes.get(note) || 0) + 1);
            if (item.status === 'wrong' || item.status === 'missing') {
              noteErrorMap.set(note, (noteErrorMap.get(note) || 0) + 1);
            }
          });
        });
      });
    });

    const frequentRestaurants = Array.from(restaurantMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const personStats = Array.from(personMap.entries())
      .map(([name, data]) => ({
        name,
        totalSpent: data.spent,
        orderCount: data.count,
        frequentNotes: Array.from(data.notes.entries())
          .map(([note, count]) => ({ note, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const errorProneNotes = Array.from(noteErrorMap.entries())
      .map(([note, count]) => ({ note, count }))
      .sort((a, b) => b.count - a.count);

    return { frequentRestaurants, personStats, errorProneNotes };
  }, [orders]);

  const monthLabel = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  return (
    <div className="stats-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>统计</h1>
      </header>

      <div className="stats-body">
        <div className="stats-month-label">
          <TrendingUp size={16} />
          {monthLabel}
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <p>暂无数据，先去拼一单吧</p>
          </div>
        ) : (
          <>
            <section className="stats-section">
              <h2 className="section-title">
                <Store size={16} />
                常点餐厅
              </h2>
              {stats.frequentRestaurants.length === 0 ? (
                <p className="stats-empty">本月暂无记录</p>
              ) : (
                <div className="stats-list">
                  {stats.frequentRestaurants.map((r, i) => (
                    <div key={r.name} className="stats-list-item">
                      <span className="stats-rank">#{i + 1}</span>
                      <span className="stats-name">{r.name}</span>
                      <span className="stats-count">{r.count}次</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="stats-section">
              <h2 className="section-title">
                <User size={16} />
                本月花费
              </h2>
              {stats.personStats.length === 0 ? (
                <p className="stats-empty">本月暂无记录</p>
              ) : (
                <div className="person-stats-list">
                  {stats.personStats.map(p => (
                    <div key={p.name} className="person-stats-card">
                      <div className="person-stats-top">
                        <span className="person-stats-name">{p.name}</span>
                        <span className="person-stats-spent">{formatMoney(p.totalSpent)}</span>
                      </div>
                      <div className="person-stats-meta">
                        参与 {p.orderCount} 次拼单 · 人均 {formatMoney(p.totalSpent / (p.orderCount || 1))}
                      </div>
                      {p.frequentNotes.length > 0 && (
                        <div className="person-stats-notes">
                          {p.frequentNotes.map(n => (
                            <span key={n.note} className="note-tag">
                              {n.note} ×{n.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="stats-section">
              <h2 className="section-title">
                <AlertTriangle size={16} />
                易出错备注
              </h2>
              {stats.errorProneNotes.length === 0 ? (
                <p className="stats-empty">暂无出错记录 👍</p>
              ) : (
                <div className="stats-list">
                  {stats.errorProneNotes.map(e => (
                    <div key={e.note} className="stats-list-item stats-list-item--error">
                      <span className="stats-name">{e.note}</span>
                      <span className="stats-count">出错 {e.count}次</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
