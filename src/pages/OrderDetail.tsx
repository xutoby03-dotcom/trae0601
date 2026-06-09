import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  isDeadlinePassed,
  getTimeRemaining,
  calculateParticipantShare,
  hasDuplicateItem,
  createOrderItem,
  getItemStatusText,
  getOrderStatusText,
  formatMoney,
  generateId,
} from '../utils';
import { GroupOrder, Participant, MenuItem, ItemStatus } from '../types';
import {
  ArrowLeft,
  Plus,
  Clock,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  UserPlus,
  Flame,
  Leaf,
} from 'lucide-react';

const QUICK_NOTES = ['少辣', '不要葱', '不要蒜', '加饭', '少盐', '少油', '多加辣', '不要香菜'];

const ITEM_STATUS_FLOW: ItemStatus[] = ['ordered', 'paid', 'picked_up'];
const PROBLEM_STATUSES: ItemStatus[] = ['missing', 'wrong'];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, dispatch } = useStore();
  const order = orders.find(o => o.id === id);

  const [participantName, setParticipantName] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [needInvoice, setNeedInvoice] = useState(false);
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [showTasteStats, setShowTasteStats] = useState(false);
  const [soldOutIds, setSoldOutIds] = useState<Set<string>>(new Set());
  const [deadlineWarning, setDeadlineWarning] = useState('');

  const toggleNote = useCallback((note: string) => {
    setSelectedNotes(prev =>
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  }, []);

  useEffect(() => {
    if (!order) return;
    const update = () => {
      if (isDeadlinePassed(order!.deadline) && order!.status === 'collecting') {
        setDeadlineWarning('⚠️ 已过截止时间');
      } else {
        setDeadlineWarning('');
      }
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, [order]);

  if (!order) {
    return (
      <div className="detail-page">
        <header className="page-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1>拼单不存在</h1>
        </header>
        <div className="empty-state">
          <p>该拼单可能已被删除</p>
        </div>
      </div>
    );
  }

  const o: GroupOrder = order;

  const passed = isDeadlinePassed(o.deadline);
  const allItemsTotal = o.participants.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );
  const meetsDiscount = o.discountThreshold > 0 && allItemsTotal >= o.discountThreshold;

  function updateOrder(updated: GroupOrder) {
    dispatch({ type: 'UPDATE_ORDER', payload: updated });
  }

  function joinOrder() {
    if (!participantName.trim()) return;
    const newP: Participant = { id: generateId(), name: participantName.trim(), items: [] };
    updateOrder({ ...o, participants: [...o.participants, newP] });
    setParticipantName('');
    setShowJoinForm(false);
  }

  function addOrderItem(participantId: string, menuItem: MenuItem) {
    if (passed && o.status === 'collecting') {
      alert('已过截止时间，无法添加菜品');
      return;
    }
    const participant = o.participants.find(p => p.id === participantId);
    if (!participant) return;
    if (hasDuplicateItem(participant, menuItem.id)) {
      alert(`你已经点了「${menuItem.name}」，确认重复点单？`);
    }
    const notes = [...selectedNotes];
    if (customNote.trim()) notes.push(customNote.trim());
    const newItem = createOrderItem(menuItem.id, menuItem.name, menuItem.price, notes, needInvoice);
    const updatedParticipants = o.participants.map(p =>
      p.id === participantId ? { ...p, items: [...p.items, newItem] } : p
    );
    updateOrder({ ...o, participants: updatedParticipants });
    setSelectedNotes([]);
    setCustomNote('');
    setNeedInvoice(false);
    setShowAddItem(null);
  }

  function removeOrderItem(participantId: string, itemId: string) {
    const updatedParticipants = o.participants.map(p =>
      p.id === participantId ? { ...p, items: p.items.filter(i => i.id !== itemId) } : p
    );
    updateOrder({ ...o, participants: updatedParticipants });
  }

  function updateItemStatus(participantId: string, itemId: string, status: ItemStatus) {
    const updatedParticipants = o.participants.map(p =>
      p.id === participantId
        ? { ...p, items: p.items.map(i => (i.id === itemId ? { ...i, status } : i)) }
        : p
    );
    updateOrder({ ...o, participants: updatedParticipants });
  }

  function toggleSoldOut(menuItemId: string) {
    setSoldOutIds(prev => {
      const next = new Set(prev);
      if (next.has(menuItemId)) next.delete(menuItemId);
      else next.add(menuItemId);
      return next;
    });
  }

  function updateOrderStatus(status: GroupOrder['status']) {
    updateOrder({ ...o, status });
  }

  function removeParticipant(participantId: string) {
    const updatedParticipants = o.participants.filter(p => p.id !== participantId);
    updateOrder({ ...o, participants: updatedParticipants });
  }

  const tasteStats = (() => {
    const allItems = o.participants.flatMap(p => p.items);
    const menuMap = new Map(o.menu.map(m => [m.id, m]));
    let spicy = 0, veg = 0, meat = 0, staple = 0, drink = 0, other = 0;
    allItems.forEach(item => {
      const mi = menuMap.get(item.menuItemId);
      if (!mi) return;
      if (mi.spicyLevel >= 2) spicy++;
      switch (mi.category) {
        case '荤菜': meat++; break;
        case '素菜': veg++; break;
        case '主食': staple++; break;
        case '饮品': drink++; break;
        default: other++; break;
      }
    });
    const total = allItems.length || 1;
    return {
      spicy, veg, meat, staple, drink, other, total,
      spicyPct: Math.round(spicy / total * 100),
      vegPct: Math.round(veg / total * 100),
    };
  })();

  const isCollecting = o.status === 'collecting';
  const grandTotal = allItemsTotal - (meetsDiscount ? o.discountAmount : 0) + o.deliveryFee;

  return (
    <div className="detail-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>{o.restaurant}</h1>
      </header>

      <div className="detail-body">
        <div className="detail-info-bar">
          <div className="info-item">
            <Clock size={14} />
            <span className={passed ? 'deadline-passed' : ''}>
              {getTimeRemaining(o.deadline)}
            </span>
          </div>
          <div className="info-item">
            <ShoppingBag size={14} />
            {getOrderStatusText(o.status)}
          </div>
          {deadlineWarning && (
            <div className="info-item info-item--warning">
              <AlertTriangle size={14} />
              {deadlineWarning}
            </div>
          )}
        </div>

        <div className="detail-meta">
          <div className="meta-row">
            <span>📋 下单人: {o.organizerName}</span>
            <span>🚚 配送费: {formatMoney(o.deliveryFee)}</span>
          </div>
          <div className="meta-row">
            {o.discountThreshold > 0 && (
              <span className={meetsDiscount ? 'discount-met' : 'discount-unmet'}>
                满{o.discountThreshold}减{o.discountAmount}
                {meetsDiscount ? ' ✅' : ` (还差${formatMoney(o.discountThreshold - allItemsTotal)})`}
              </span>
            )}
          </div>
        </div>

        {isCollecting && (
          <div className="join-section">
            {showJoinForm ? (
              <div className="join-form">
                <input
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                  placeholder="你的名字"
                  onKeyDown={e => e.key === 'Enter' && joinOrder()}
                />
                <button className="btn-primary btn-sm" onClick={joinOrder}>加入</button>
                <button className="btn-ghost btn-sm" onClick={() => setShowJoinForm(false)}>取消</button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setShowJoinForm(true)}>
                <UserPlus size={16} />
                我要参与
              </button>
            )}
          </div>
        )}

        <section className="participants-section">
          <h2 className="section-title">
            参与者 ({o.participants.length}人)
          </h2>
          {o.participants.length === 0 ? (
            <div className="empty-state empty-state--small">
              <p>还没有人参与</p>
            </div>
          ) : (
            <div className="participant-list">
              {o.participants.map(p => {
                const share = calculateParticipantShare(order, p);
                const isExpanded = expandedParticipant === p.id;
                return (
                  <div key={p.id} className="participant-card">
                    <div
                      className="participant-header"
                      onClick={() => setExpandedParticipant(isExpanded ? null : p.id)}
                    >
                      <span className="participant-name">{p.name}</span>
                      <span className="participant-share">{formatMoney(share)}</span>
                      <span className="participant-items-count">{p.items.length}个菜</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {isExpanded && (
                      <div className="participant-detail">
                        {p.items.length > 0 && (
                          <div className="participant-items">
                            {p.items.map(item => (
                              <div key={item.id} className="ordered-item">
                                <div className="ordered-item-top">
                                  <span className="ordered-item-name">{item.menuItemName}</span>
                                  <span className="ordered-item-price">
                                    {formatMoney(item.price * item.quantity)}
                                  </span>
                                </div>
                                {item.notes.length > 0 && (
                                  <div className="ordered-item-notes">
                                    {item.notes.map((n, i) => (
                                      <span key={i} className="note-tag">{n}</span>
                                    ))}
                                  </div>
                                )}
                                {item.needInvoice && (
                                  <span className="note-tag note-tag--invoice">要发票</span>
                                )}
                                <div className="ordered-item-status">
                                  <div className="status-btns">
                                    {ITEM_STATUS_FLOW.map(s => (
                                      <button
                                        key={s}
                                        className={`status-btn ${item.status === s ? 'status-btn--active' : ''}`}
                                        onClick={() => updateItemStatus(p.id, item.id, s)}
                                      >
                                        {getItemStatusText(s)}
                                      </button>
                                    ))}
                                    {PROBLEM_STATUSES.map(s => (
                                      <button
                                        key={s}
                                        className={`status-btn status-btn--problem ${item.status === s ? 'status-btn--active' : ''}`}
                                        onClick={() => updateItemStatus(p.id, item.id, s)}
                                      >
                                        {getItemStatusText(s)}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    className="btn-icon btn-icon--danger btn-icon--sm"
                                    onClick={() => removeOrderItem(p.id, item.id)}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {isCollecting && (!passed || o.status !== 'collecting') && (
                          <>
                            {showAddItem === p.id ? (
                              <div className="add-item-panel">
                                <div className="add-item-header">
                                  <span>选择菜品</span>
                                  <button className="btn-ghost btn-sm" onClick={() => setShowAddItem(null)}>
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="menu-select-list">
                                  {o.menu.map(mi => {
                                    const isSoldOut = soldOutIds.has(mi.id);
                                    return (
                                      <div
                                        key={mi.id}
                                        className={`menu-select-item ${isSoldOut || !mi.available ? 'menu-select-item--soldout' : ''}`}
                                      >
                                        <div className="menu-select-info">
                                          <span className="menu-select-name">
                                            {mi.name}
                                            {'🌶️'.repeat(mi.spicyLevel)}
                                          </span>
                                          <span className="menu-select-price">
                                            {formatMoney(mi.price)}
                                          </span>
                                        </div>
                                        <div className="menu-select-actions">
                                          {isSoldOut && (
                                            <span className="soldout-badge">售罄</span>
                                          )}
                                          {!isSoldOut && mi.available && (
                                            <button
                                              className="btn-primary btn-sm"
                                              onClick={() => addOrderItem(p.id, mi)}
                                            >
                                              <Plus size={12} /> 加
                                            </button>
                                          )}
                                          <button
                                            className="btn-ghost btn-sm"
                                            onClick={() => toggleSoldOut(mi.id)}
                                          >
                                            {isSoldOut ? '恢复' : '售罄'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="notes-section">
                                  <div className="quick-notes">
                                    {QUICK_NOTES.map(note => (
                                      <button
                                        key={note}
                                        className={`quick-note-btn ${selectedNotes.includes(note) ? 'quick-note-btn--active' : ''}`}
                                        onClick={() => toggleNote(note)}
                                      >
                                        {note}
                                      </button>
                                    ))}
                                  </div>
                                  <input
                                    value={customNote}
                                    onChange={e => setCustomNote(e.target.value)}
                                    placeholder="自定义备注..."
                                    className="custom-note-input"
                                  />
                                  <label className="invoice-toggle">
                                    <input
                                      type="checkbox"
                                      checked={needInvoice}
                                      onChange={e => setNeedInvoice(e.target.checked)}
                                    />
                                    需要发票
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="btn-ghost btn-add-item"
                                onClick={() => setShowAddItem(p.id)}
                              >
                                <Plus size={14} /> 选菜
                              </button>
                            )}
                          </>
                        )}

                        <button
                          className="btn-ghost btn-ghost--danger btn-sm"
                          onClick={() => removeParticipant(p.id)}
                        >
                          移除此人
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="fee-summary">
          <h2 className="section-title">💰 费用明细</h2>
          <div className="fee-table">
            <div className="fee-row">
              <span>菜品总计</span>
              <span>{formatMoney(allItemsTotal)}</span>
            </div>
            {meetsDiscount && (
              <div className="fee-row fee-row--discount">
                <span>满减优惠 (按比例分摊)</span>
                <span>-{formatMoney(o.discountAmount)}</span>
              </div>
            )}
            {o.deliveryFee > 0 && (
              <div className="fee-row">
                <span>配送费 (均摊{o.participants.filter(p => p.items.length > 0).length}人)</span>
                <span>{formatMoney(o.deliveryFee)}</span>
              </div>
            )}
            <div className="fee-row fee-row--total">
              <span>实付总计</span>
              <span>{formatMoney(grandTotal)}</span>
            </div>
          </div>

          {o.participants.length > 0 && (
            <div className="per-person-breakdown">
              <h3>每人应付</h3>
              {o.participants.filter(p => p.items.length > 0).map(p => (
                <div key={p.id} className="breakdown-row">
                  <span>{p.name}</span>
                  <span>{formatMoney(calculateParticipantShare(order, p))}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="taste-section">
          <div className="taste-header" onClick={() => setShowTasteStats(!showTasteStats)}>
            <h2 className="section-title">
              <Flame size={16} />
              口味统计
            </h2>
            {showTasteStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {showTasteStats && (
            <div className="taste-stats">
              <div className="taste-stat-row">
                <span>🌶️ 辣菜占比</span>
                <div className="taste-bar">
                  <div className="taste-bar-fill taste-bar-fill--spicy" style={{ width: `${tasteStats.spicyPct}%` }} />
                </div>
                <span>{tasteStats.spicyPct}%</span>
              </div>
              <div className="taste-stat-row">
                <Leaf size={14} />
                <span>素菜占比</span>
                <div className="taste-bar">
                  <div className="taste-bar-fill taste-bar-fill--veg" style={{ width: `${tasteStats.vegPct}%` }} />
                </div>
                <span>{tasteStats.vegPct}%</span>
              </div>
              <div className="taste-category-grid">
                <div className="taste-cat-item">荤菜 {tasteStats.meat}</div>
                <div className="taste-cat-item">素菜 {tasteStats.veg}</div>
                <div className="taste-cat-item">主食 {tasteStats.staple}</div>
                <div className="taste-cat-item">饮品 {tasteStats.drink}</div>
              </div>
              {tasteStats.spicyPct > 60 && (
                <div className="taste-warning">
                  <AlertTriangle size={14} /> 辣菜偏多，建议搭配素菜
                </div>
              )}
              {tasteStats.vegPct < 15 && tasteStats.total > 2 && (
                <div className="taste-warning">
                  <AlertTriangle size={14} /> 素菜太少，注意均衡
                </div>
              )}
            </div>
          )}
        </section>

        <section className="order-actions">
          {o.status === 'collecting' && (
            <button className="btn-primary" onClick={() => updateOrderStatus('ordered')}>
              <Check size={16} /> 确认下单
            </button>
          )}
          {o.status === 'ordered' && (
            <button className="btn-primary" onClick={() => updateOrderStatus('delivered')}>
              <ShoppingBag size={16} /> 标记已送达
            </button>
          )}
          {o.status === 'delivered' && (
            <button className="btn-ghost" onClick={() => updateOrderStatus('closed')}>
              关闭拼单
            </button>
          )}
          {o.status !== 'closed' && (
            <button className="btn-ghost btn-ghost--danger" onClick={() => updateOrderStatus('closed')}>
              强制关闭
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
