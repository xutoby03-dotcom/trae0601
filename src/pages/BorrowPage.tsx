import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, MapPin, User, Phone, Wallet } from 'lucide-react';
import { useStore } from '@/store';
import { CanopyStatusBadge } from '@/components/StatusBadge';
import AccessoryChecklist from '@/components/AccessoryChecklist';
import type { BorrowItem } from '@/types';
import { addHours, formatDateTime } from '@/utils/date';

export default function BorrowPage() {
  const navigate = useNavigate();
  const { canopies, createBorrowRecord } = useStore();

  const availableCanopies = canopies.filter((c) => c.status === 'available');

  const [selectedCanopy, setSelectedCanopy] = useState<string | null>(
    availableCanopies[0]?.id || null
  );
  const [activityName, setActivityName] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [deposit, setDeposit] = useState(200);
  const [dueTime, setDueTime] = useState(
    addHours(new Date(), 4).toISOString().slice(0, 16)
  );
  const [items, setItems] = useState<BorrowItem>({ tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 });

  const canopy = canopies.find((c) => c.id === selectedCanopy);

  const handleCanopySelect = (id: string) => {
    setSelectedCanopy(id);
    const c = canopies.find((x) => x.id === id);
    if (c) {
      setItems({ ...c.accessories });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanopy || !activityName || !location || !contact) return;

    createBorrowRecord({
      canopyId: selectedCanopy,
      activityName,
      location,
      contact,
      deposit,
      borrowTime: new Date().toISOString(),
      dueTime: new Date(dueTime).toISOString(),
      borrowedItems: items,
    });

    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
        <ArrowLeft size={16} />
        返回今日借用
      </Link>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">选择雨棚</h3>
          {availableCanopies.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              暂无可借出的雨棚，请等待归还或维修完成
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableCanopies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCanopySelect(c.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCanopy === c.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{c.name}</span>
                    <CanopyStatusBadge status={c.status} />
                  </div>
                  <div className="text-xs text-gray-500">
                    篷布×{c.accessories.tarp} · 立柱×{c.accessories.pole} · 横杆×{c.accessories.bar} · 地钉×{c.accessories.stake}
                  </div>
                  {selectedCanopy === c.id && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary-700 font-medium">
                      <Check size={12} /> 已选择
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">借用单信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">
                <Calendar size={14} className="inline mr-1" />
                活动名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="例：社区端午节活动"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                <MapPin size={14} className="inline mr-1" />
                楼栋点位 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="例：3号楼前广场"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                <User size={14} className="inline mr-1" />
                <Phone size={14} className="inline ml-2 mr-1" />
                联系人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="例：张阿姨 13800138001"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                <Wallet size={14} className="inline mr-1" />
                押金（元）
              </label>
              <input
                type="number"
                className="input"
                value={deposit}
                onChange={(e) => setDeposit(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <label className="label">
                <Calendar size={14} className="inline mr-1" />
                应归还时间
              </label>
              <input
                type="datetime-local"
                className="input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
              <div className="text-xs text-gray-400 mt-1">
                默认4小时后：{formatDateTime(addHours(new Date(), 4))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-2">配件核对（借出）</h3>
          <p className="text-sm text-gray-500 mb-4">逐项清点并勾选借出的配件数量</p>
          {canopy ? (
            <AccessoryChecklist
              items={items}
              onChange={setItems}
              maxItems={canopy.accessories}
            />
          ) : (
            <div className="text-center text-gray-500 py-6">请先选择雨棚</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/" className="btn-secondary">
            取消
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={!selectedCanopy || !activityName || !location || !contact}
          >
            <Check size={16} />
            确认借出
          </button>
        </div>
      </form>
    </div>
  );
}
