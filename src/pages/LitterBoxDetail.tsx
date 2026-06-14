import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, Sparkles, X, Plus } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import StatusBadge from '../components/common/StatusBadge';
import StarRating from '../components/common/StarRating';
import { getBoxStatus } from '../utils/alerts';
import { formatDate, formatRelativeTime, formatDateTime } from '../utils/date';
import { cn } from '../lib/utils';
import { LitterBox, LitterType } from '../types';

const LITTER_TYPES: LitterType[] = ['膨润土', '豆腐砂', '混合砂', '水晶砂', '松木砂', '纸砂'];

interface FormState {
  name: string;
  location: string;
  litterType: LitterType;
  capacity: number;
  cleanIntervalHours: number;
  fullChangeIntervalDays: number;
  catIds: string[];
  photo: string;
}

export default function LitterBoxDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { litterBoxes, cats, records, members, updateLitterBox, addRecord, currentMemberId } = useAppStore();

  const box = litterBoxes.find((b) => b.id === id);
  const statusInfo = box ? getBoxStatus(box, records) : null;
  const boxCats = box ? cats.filter((c) => box.catIds.includes(c.id)) : [];
  const boxRecords = box
    ? records
        .filter((r) => r.litterBoxId === box.id)
        .sort((a, b) => new Date(b.cleanTime).getTime() - new Date(a.cleanTime).getTime())
        .slice(0, 10)
    : [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    location: '',
    litterType: '膨润土',
    capacity: 10,
    cleanIntervalHours: 12,
    fullChangeIntervalDays: 14,
    catIds: [],
    photo: '',
  });

  const openEditModal = () => {
    if (!box) return;
    setFormData({
      name: box.name,
      location: box.location,
      litterType: box.litterType,
      capacity: box.capacity,
      cleanIntervalHours: box.cleanIntervalHours,
      fullChangeIntervalDays: box.fullChangeIntervalDays,
      catIds: box.catIds,
      photo: box.photo,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = () => {
    if (!box || !formData.name.trim()) return;
    updateLitterBox(box.id, formData);
    closeEditModal();
  };

  const handleFullChange = () => {
    if (!box) return;
    addRecord({
      litterBoxId: box.id,
      memberId: currentMemberId,
      cleanTime: new Date().toISOString(),
      smellLevel: 1,
      clumpLevel: '少',
      addedLitter: true,
      addedAmount: box.capacity,
      note: '整盆换砂',
      isFullChange: true,
    });
  };

  const toggleCat = (catId: string) => {
    setFormData((prev) => ({
      ...prev,
      catIds: prev.catIds.includes(catId)
        ? prev.catIds.filter((cid) => cid !== catId)
        : [...prev.catIds, catId],
    }));
  };

  const getMember = (memberId: string) => members.find((m) => m.id === memberId);

  if (!box) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            to="/litter-boxes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-medium mb-8 transition-all hover:opacity-80"
            style={{ backgroundColor: '#F5EDE0', color: '#8B7355' }}
          >
            <ArrowLeft size={18} />
            返回列表
          </Link>
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl" style={{ backgroundColor: '#FDF8F3' }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F5EDE0' }}>
              <Sparkles size={40} style={{ color: '#C48E6B' }} />
            </div>
            <p className="text-lg font-medium mb-2" style={{ color: '#5D4E37' }}>
              找不到这个猫砂盆
            </p>
            <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
              它可能已被删除
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          to="/litter-boxes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-medium mb-6 transition-all hover:opacity-80"
          style={{ backgroundColor: '#F5EDE0', color: '#8B7355' }}
        >
          <ArrowLeft size={18} />
          返回列表
        </Link>

        <div className="rounded-3xl overflow-hidden shadow-xl mb-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="relative h-72" style={{ backgroundColor: '#F5EDE0' }}>
            {box.photo ? (
              <img src={box.photo} alt={box.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles size={80} style={{ color: '#D4B896' }} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <div className="mb-3">
                  <StatusBadge status={statusInfo?.status || 'normal'} size="md" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">{box.name}</h1>
                <p className="text-white/80 text-sm">📍 {box.location}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFullChange}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                  style={{ backgroundColor: '#6B8E6B' }}
                >
                  <Sparkles size={18} />
                  记录整盆换砂
                </button>
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                  style={{ backgroundColor: '#C48E6B' }}
                >
                  <Edit3 size={18} />
                  编辑
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="rounded-3xl shadow-md p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#5D4E37' }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FDF0E6' }}>
                <Sparkles size={16} style={{ color: '#C48E6B' }} />
              </span>
              基本信息
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#F5EDE0' }}>
                <span className="text-sm" style={{ color: '#8B7355' }}>位置</span>
                <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>{box.location || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#F5EDE0' }}>
                <span className="text-sm" style={{ color: '#8B7355' }}>砂种</span>
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium" style={{ backgroundColor: '#E8DDD0', color: '#5D4E37' }}>
                  {box.litterType}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#F5EDE0' }}>
                <span className="text-sm" style={{ color: '#8B7355' }}>容量</span>
                <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>{box.capacity} L</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#F5EDE0' }}>
                <span className="text-sm" style={{ color: '#8B7355' }}>上次整盆换砂</span>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: '#5D4E37' }}>{formatDate(box.lastFullChange)}</div>
                  <div className="text-xs" style={{ color: '#A89880' }}>{formatRelativeTime(box.lastFullChange)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#F5EDE0' }}>
                <span className="text-sm" style={{ color: '#8B7355' }}>清洁间隔</span>
                <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>每 {box.cleanIntervalHours} 小时</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm" style={{ color: '#8B7355' }}>整换间隔</span>
                <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>每 {box.fullChangeIntervalDays} 天</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl shadow-md p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#5D4E37' }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F0E5' }}>
                <Sparkles size={16} style={{ color: '#6B8E6B' }} />
              </span>
              使用猫咪
            </h2>
            {boxCats.length === 0 ? (
              <div className="py-10 text-center rounded-2xl" style={{ backgroundColor: '#FAF6F0' }}>
                <p className="text-sm" style={{ color: '#A89880' }}>暂无关联猫咪</p>
              </div>
            ) : (
              <div className="space-y-3">
                {boxCats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:shadow-md"
                    style={{ backgroundColor: '#FAF6F0' }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5EDE0' }}>
                      {cat.avatar ? (
                        <img src={cat.avatar} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold" style={{ color: '#8B7355' }}>
                          {cat.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: '#5D4E37' }}>{cat.name}</p>
                      <p className="text-xs" style={{ color: '#A89880' }}>已关联</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl shadow-md p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#5D4E37' }}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FDF0E6' }}>
              <Sparkles size={16} style={{ color: '#C48E6B' }} />
            </span>
            最近清洁历史
          </h2>
          {boxRecords.length === 0 ? (
            <div className="py-12 text-center rounded-2xl" style={{ backgroundColor: '#FAF6F0' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5EDE0' }}>
                <Sparkles size={28} style={{ color: '#D4B896' }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: '#5D4E37' }}>暂无清洁记录</p>
              <p className="text-xs" style={{ color: '#A89880' }}>清理猫砂盆后会在这里显示记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: '#F5EDE0' }}>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#A89880' }}>
                      时间
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#A89880' }}>
                      负责人
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#A89880' }}>
                      异味
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#A89880' }}>
                      结团
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#A89880' }}>
                      补砂
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {boxRecords.map((record, idx) => {
                    const member = getMember(record.memberId);
                    const isLast = idx === boxRecords.length - 1;
                    return (
                      <tr
                        key={record.id}
                        className={cn(
                          'transition-colors hover:bg-gray-50',
                          !isLast && 'border-b'
                        )}
                        style={{ borderColor: '#F5EDE0' }}
                      >
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium" style={{ color: '#5D4E37' }}>
                            {record.isFullChange && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2" style={{ backgroundColor: '#F0E8F5', color: '#9B7FB8' }}>
                                整盆换砂
                              </span>
                            )}
                            {formatDateTime(record.cleanTime)}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#A89880' }}>
                            {formatRelativeTime(record.cleanTime)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: member?.color || '#C48E6B' }}
                            >
                              {member?.avatar ? (
                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                member?.name.charAt(0) || '?'
                              )}
                            </div>
                            <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>
                              {member?.name || '未知成员'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StarRating value={record.smellLevel} size="sm" showLabel={false} />
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium'
                            )}
                            style={{
                              backgroundColor:
                                record.clumpLevel === '少'
                                  ? '#E8F0E5'
                                  : record.clumpLevel === '中'
                                  ? '#FDF6E3'
                                  : '#FDF0E6',
                              color:
                                record.clumpLevel === '少'
                                  ? '#6B8E6B'
                                  : record.clumpLevel === '中'
                                  ? '#B8955A'
                                  : '#D4896A',
                            }}
                          >
                            {record.clumpLevel}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {record.addedLitter ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#6B8E6B' }}>
                              ✓ {record.addedAmount}L
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: '#A89880' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#F5EDE0', backgroundColor: '#FFFFFF' }}>
              <h2 className="text-xl font-bold" style={{ color: '#5D4E37' }}>
                编辑猫砂盆
              </h2>
              <button
                onClick={closeEditModal}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#8B7355' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                  名称 <span style={{ color: '#D4896A' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                  位置
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    砂种
                  </label>
                  <select
                    value={formData.litterType}
                    onChange={(e) => setFormData({ ...formData, litterType: e.target.value as LitterType })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all appearance-none cursor-pointer"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  >
                    {LITTER_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    容量 (L)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    清洁间隔 (小时)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.cleanIntervalHours}
                    onChange={(e) => setFormData({ ...formData, cleanIntervalHours: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    整换间隔 (天)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.fullChangeIntervalDays}
                    onChange={(e) => setFormData({ ...formData, fullChangeIntervalDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#5D4E37' }}>
                  使用猫咪
                </label>
                {cats.length === 0 ? (
                  <p className="text-sm px-4 py-3 rounded-2xl" style={{ backgroundColor: '#FAF6F0', color: '#A89880' }}>
                    暂无猫咪档案
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {cats.map((cat) => (
                      <label
                        key={cat.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all'
                        )}
                        style={{
                          backgroundColor: formData.catIds.includes(cat.id) ? '#FDF0E6' : '#FAF6F0',
                          borderColor: formData.catIds.includes(cat.id) ? '#C48E6B' : '#F5EDE0',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.catIds.includes(cat.id)}
                          onChange={() => toggleCat(cat.id)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: '#C48E6B' }}
                        />
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5EDE0' }}>
                          {cat.avatar ? (
                            <img src={cat.avatar} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium" style={{ color: '#8B7355' }}>
                              {cat.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium truncate" style={{ color: '#5D4E37' }}>
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                  照片 URL
                </label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-5 border-t" style={{ borderColor: '#F5EDE0', backgroundColor: '#FFFFFF' }}>
              <button
                onClick={closeEditModal}
                className="px-6 py-2.5 rounded-2xl font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#F5EDE0', color: '#8B7355' }}
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!formData.name.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C48E6B' }}
              >
                <Save size={18} />
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
