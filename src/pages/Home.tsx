import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { getOrderStatusText, getTimeRemaining, isDeadlinePassed, formatMoney, calculateOrderTotal } from '../utils';
import { Clock, Plus, ChevronRight, UtensilsCrossed, BarChart3 } from 'lucide-react';

export default function Home() {
  const { orders } = useStore();
  const navigate = useNavigate();

  const activeOrders = orders.filter(o => o.status !== 'closed');
  const closedOrders = orders.filter(o => o.status === 'closed');

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-content">
          <h1>🍱 拼单饭局</h1>
          <p className="header-sub">办公室拼单，告别刷屏</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={() => navigate('/stats')} title="统计">
            <BarChart3 size={22} />
          </button>
        </div>
      </header>

      <div className="home-body">
        <button className="btn-primary btn-create" onClick={() => navigate('/create')}>
          <Plus size={20} />
          发起拼单
        </button>

        <section className="order-section">
          <h2 className="section-title">
            <Clock size={16} />
            进行中
          </h2>
          {activeOrders.length === 0 ? (
            <div className="empty-state">
              <UtensilsCrossed size={48} strokeWidth={1} />
              <p>还没有拼单，快来发起一个吧</p>
            </div>
          ) : (
            <div className="order-list">
              {activeOrders.map(order => {
                const deadlineInfo = getTimeRemaining(order.deadline);
                const passed = isDeadlinePassed(order.deadline);
                const total = calculateOrderTotal(order);
                return (
                  <div
                    key={order.id}
                    className={`order-card ${passed ? 'order-card--expired' : ''}`}
                    onClick={() => navigate(`/order/${order.id}`)}
                  >
                    <div className="order-card-top">
                      <span className="order-restaurant">{order.restaurant}</span>
                      <span className={`order-status order-status--${order.status}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </div>
                    <div className="order-card-mid">
                      <span className="order-organizer">📋 {order.organizerName} 发起</span>
                      <span className="order-total">{formatMoney(total)}</span>
                    </div>
                    <div className="order-card-bottom">
                      <span className={`order-deadline ${passed ? 'deadline-passed' : ''}`}>
                        <Clock size={12} />
                        {deadlineInfo}
                      </span>
                      <span className="order-participants">
                        {order.participants.length}人参与
                      </span>
                    </div>
                    <ChevronRight size={16} className="order-card-arrow" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {closedOrders.length > 0 && (
          <section className="order-section">
            <h2 className="section-title">📦 已关闭</h2>
            <div className="order-list">
              {closedOrders.map(order => (
                <div
                  key={order.id}
                  className="order-card order-card--closed"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="order-card-top">
                    <span className="order-restaurant">{order.restaurant}</span>
                    <span className="order-status order-status--closed">已关闭</span>
                  </div>
                  <div className="order-card-mid">
                    <span className="order-organizer">📋 {order.organizerName} 发起</span>
                  </div>
                  <ChevronRight size={16} className="order-card-arrow" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
