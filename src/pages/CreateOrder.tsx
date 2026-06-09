import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { generateId } from '../utils';
import { MenuItem, MenuCategory, SpicyLevel } from '../types';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const CATEGORIES: MenuCategory[] = ['荤菜', '素菜', '主食', '饮品', '其他'];
const SPICY_LABELS: Record<SpicyLevel, string> = { 0: '不辣', 1: '微辣', 2: '中辣', 3: '特辣' };

interface MenuForm {
  name: string;
  price: string;
  category: MenuCategory;
  spicyLevel: SpicyLevel;
}

const emptyMenuForm: MenuForm = { name: '', price: '', category: '荤菜', spicyLevel: 0 };

export default function CreateOrder() {
  const navigate = useNavigate();
  const { dispatch } = useStore();

  const [restaurant, setRestaurant] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [discountThreshold, setDiscountThreshold] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuForm, setMenuForm] = useState<MenuForm>(emptyMenuForm);

  function addMenuItem() {
    if (!menuForm.name.trim() || !menuForm.price) return;
    const item: MenuItem = {
      id: generateId(),
      name: menuForm.name.trim(),
      price: parseFloat(menuForm.price),
      category: menuForm.category,
      spicyLevel: menuForm.spicyLevel,
      available: true,
    };
    setMenuItems(prev => [...prev, item]);
    setMenuForm(emptyMenuForm);
  }

  function removeMenuItem(id: string) {
    setMenuItems(prev => prev.filter(i => i.id !== id));
  }

  function handleSubmit() {
    if (!restaurant.trim() || !deadline || !organizerName.trim() || menuItems.length === 0) {
      alert('请填写餐厅、截止时间、下单人并添加至少一个菜品');
      return;
    }
    const order = {
      id: generateId(),
      restaurant: restaurant.trim(),
      deadline,
      deliveryFee: parseFloat(deliveryFee) || 0,
      discountThreshold: parseFloat(discountThreshold) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      organizerName: organizerName.trim(),
      menu: menuItems,
      participants: [],
      status: 'collecting' as const,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ORDER', payload: order });
    navigate(`/order/${order.id}`);
  }

  return (
    <div className="create-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>发起拼单</h1>
      </header>

      <div className="create-body">
        <section className="form-section">
          <h2>基本信息</h2>
          <div className="form-group">
            <label>餐厅名称 *</label>
            <input value={restaurant} onChange={e => setRestaurant(e.target.value)} placeholder="例：麦当劳、湘菜馆" />
          </div>
          <div className="form-group">
            <label>下单人 *</label>
            <input value={organizerName} onChange={e => setOrganizerName(e.target.value)} placeholder="谁来下单" />
          </div>
          <div className="form-group">
            <label>截止时间 *</label>
            <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
        </section>

        <section className="form-section">
          <h2>费用规则</h2>
          <div className="form-row">
            <div className="form-group">
              <label>配送费</label>
              <input type="number" min="0" step="0.1" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>满减门槛</label>
              <input type="number" min="0" step="0.1" value={discountThreshold} onChange={e => setDiscountThreshold(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>满减金额</label>
              <input type="number" min="0" step="0.1" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} placeholder="0" />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>菜品列表</h2>
          <div className="menu-form">
            <div className="menu-form-row">
              <input
                value={menuForm.name}
                onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))}
                placeholder="菜品名"
                className="menu-name-input"
              />
              <input
                type="number"
                min="0"
                step="0.1"
                value={menuForm.price}
                onChange={e => setMenuForm(f => ({ ...f, price: e.target.value }))}
                placeholder="价格"
                className="menu-price-input"
              />
            </div>
            <div className="menu-form-row">
              <select
                value={menuForm.category}
                onChange={e => setMenuForm(f => ({ ...f, category: e.target.value as MenuCategory }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="spicy-selector">
                {([0, 1, 2, 3] as SpicyLevel[]).map(level => (
                  <button
                    key={level}
                    className={`spicy-btn ${menuForm.spicyLevel === level ? 'spicy-btn--active' : ''}`}
                    onClick={() => setMenuForm(f => ({ ...f, spicyLevel: level }))}
                    type="button"
                  >
                    {SPICY_LABELS[level]}
                  </button>
                ))}
              </div>
              <button className="btn-primary btn-sm" onClick={addMenuItem} type="button">
                <Plus size={14} /> 添加
              </button>
            </div>
          </div>

          {menuItems.length > 0 && (
            <div className="menu-list">
              {menuItems.map(item => (
                <div key={item.id} className="menu-item-row">
                  <span className="menu-item-cat">{item.category}</span>
                  <span className="menu-item-name">{item.name}</span>
                  <span className="menu-item-spicy">
                    {'🌶️'.repeat(item.spicyLevel) || '—'}
                  </span>
                  <span className="menu-item-price">¥{item.price.toFixed(2)}</span>
                  <button className="btn-icon btn-icon--danger" onClick={() => removeMenuItem(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <button className="btn-primary btn-submit" onClick={handleSubmit}>
          发起拼单
        </button>
      </div>
    </div>
  );
}
