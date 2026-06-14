import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Clock, User, Car, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import type { Visit, TransportType, MaterialItem } from '@/types';

const transportOptions: TransportType[] = ['自驾', '公交', '打车', '地铁', '步行', '救护车'];

const defaultMaterials: Omit<MaterialItem, 'id'>[] = [
  { name: '片子/影像资料', prepared: false },
  { name: '医保卡', prepared: false },
  { name: '上次化验单', prepared: false },
];

const emptyVisit: Omit<Visit, 'id'> = {
  patientId: '',
  department: '',
  visitTime: '',
  checkItems: '',
  materials: defaultMaterials.map((m) => ({ ...m, id: Math.random().toString(36).slice(2, 9) })),
  companion: '',
  transport: '自驾',
  status: 'upcoming',
  confirmed: false,
};

export default function VisitList() {
  const { visits, patients, companions, addVisit, addCompanion } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Visit, 'id'>>(emptyVisit);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [newCompanion, setNewCompanion] = useState('');

  const filteredVisits = visits.filter((v) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return v.status !== 'completed' && v.status !== 'cancelled';
    if (filter === 'completed') return v.status === 'completed';
    return true;
  });

  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.name || '未知';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const dateStrFormatted = date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    const timeStr = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date: dateStrFormatted, time: timeStr, daysLeft: diffDays };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      alert('请选择就诊人');
      return;
    }
    if (formData.companion && !companions.includes(formData.companion)) {
      addCompanion(formData.companion);
    }
    addVisit(formData);
    setIsModalOpen(false);
    setFormData(emptyVisit);
  };

  const isUrgent = (visit: Visit) => {
    const days = Math.ceil((new Date(visit.visitTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 3 && visit.status !== 'completed';
  };

  const allMaterialsPrepared = (visit: Visit) => {
    return visit.materials.every((m) => m.prepared);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">复诊排班</h2>
          <p className="text-gray-500 mt-1">管理所有复诊安排和陪同分配</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white rounded-full border border-warm-200">
            {[
              { key: 'all', label: '全部' },
              { key: 'upcoming', label: '待就诊' },
              { key: 'completed', label: '已完成' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === item.key
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-warm-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加复诊
          </button>
        </div>
      </div>

      {filteredVisits.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-16 h-16 text-warm-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无复诊安排</h3>
          <p className="text-gray-500 mb-4">添加第一个复诊计划</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            添加复诊
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => {
            const { date, time, daysLeft } = formatDate(visit.visitTime);
            const urgent = isUrgent(visit);
            const prepared = allMaterialsPrepared(visit);

            return (
              <Link
                key={visit.id}
                to={`/visits/${visit.id}`}
                className={`card p-5 block transition-all ${
                  urgent && visit.status !== 'completed' ? 'ring-2 ring-primary-300 ring-offset-2' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${
                      visit.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : urgent
                        ? 'bg-primary-100 text-primary-600 animate-pulse-slow'
                        : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      <span className="text-xl font-bold">
                        {date.split('月')[1].replace('日', '')}
                      </span>
                      <span className="text-xs">{date.split('月')[0]}月</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{visit.department}</h3>
                        <StatusBadge status={visit.status} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {getPatientName(visit.patientId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>陪同：{visit.companion || '待分配'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span>{visit.transport}</span>
                    </div>
                    {visit.status !== 'completed' && (
                      <div className="flex items-center gap-2 text-sm">
                        {prepared ? (
                          <span className="text-green-600 flex items-center gap-1">
                            ✓ 材料齐全
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            材料未齐
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {urgent && visit.status !== 'completed' && (
                      <span className="tag bg-primary-100 text-primary-700">
                        {daysLeft > 0 ? `${daysLeft}天后` : '今天'}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="添加复诊计划"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">就诊人</label>
              <select
                className="input"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              >
                <option value="">请选择就诊人</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">科室</label>
              <input
                type="text"
                className="input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="如：心内科、内分泌科"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">就诊时间</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.visitTime}
              onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">检查项目</label>
            <input
              type="text"
              className="input"
              value={formData.checkItems}
              onChange={(e) => setFormData({ ...formData, checkItems: e.target.value })}
              placeholder="如：抽血、拍片、心电图"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">陪同人</label>
              <div className="relative">
                <input
                  type="text"
                  list="companions-list"
                  className="input pr-20"
                  value={formData.companion}
                  onChange={(e) => {
                    setFormData({ ...formData, companion: e.target.value });
                    setNewCompanion(e.target.value);
                  }}
                  placeholder="选择或输入陪同人"
                />
                <datalist id="companions-list">
                  {companions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {newCompanion && !companions.includes(newCompanion) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (newCompanion.trim()) {
                        addCompanion(newCompanion.trim());
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    添加
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="label">交通方式</label>
              <select
                className="input"
                value={formData.transport}
                onChange={(e) =>
                  setFormData({ ...formData, transport: e.target.value as TransportType })
                }
              >
                {transportOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">需携带材料</label>
            <div className="space-y-2">
              {formData.materials.map((material, index) => (
                <label
                  key={material.id}
                  className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl cursor-pointer hover:bg-warm-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={material.prepared}
                    onChange={(e) => {
                      const newMaterials = [...formData.materials];
                      newMaterials[index].prepared = e.target.checked;
                      setFormData({ ...formData, materials: newMaterials });
                    }}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => {
                      const newMaterials = [...formData.materials];
                      newMaterials[index].name = e.target.value;
                      setFormData({ ...formData, materials: newMaterials });
                    }}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    materials: [
                      ...formData.materials,
                      { id: Math.random().toString(36).slice(2, 9), name: '', prepared: false },
                    ],
                  })
                }
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加材料项
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-outline"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              添加
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
