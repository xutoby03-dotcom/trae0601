import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Plane,
  Hotel,
  StickyNote,
  Users,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { generateId } from '@/utils/dateUtils';

const AVATAR_OPTIONS = ['👨', '👩', '👧', '🧑', '👴', '👵', '🧒', '👦', '👱', '🧔'];

export default function TripEditor() {
  const navigate = useNavigate();
  const { trip, persons, updateTrip, addPerson, updatePerson, removePerson } =
    useTripStore();

  const [formData, setFormData] = useState({
    destination: trip.destination,
    departureTime: trip.departureTime,
    transport: trip.transport,
    accommodation: trip.accommodation,
    notes: trip.notes,
  });

  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonAvatar, setNewPersonAvatar] = useState(AVATAR_OPTIONS[0]);
  const [showAddPerson, setShowAddPerson] = useState(false);

  const handleSave = () => {
    updateTrip(formData);
    navigate('/');
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    addPerson({
      name: newPersonName.trim(),
      avatar: newPersonAvatar,
      emergencyContact: '',
      notes: '',
    });
    setNewPersonName('');
    setShowAddPerson(false);
  };

  const handleRemovePerson = (id: string) => {
    if (confirm('确定要删除这个人吗？相关的证件信息也会被删除。')) {
      removePerson(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">编辑行程</h1>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-slate-600" />
            行程基本信息
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                目的地
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                placeholder="例如：东京、巴黎、北京"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  出发时间
                </span>
              </label>
              <input
                type="date"
                value={formData.departureTime}
                onChange={(e) =>
                  setFormData({ ...formData, departureTime: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Plane size={14} />
                  交通方式
                </span>
              </label>
              <input
                type="text"
                value={formData.transport}
                onChange={(e) =>
                  setFormData({ ...formData, transport: e.target.value })
                }
                placeholder="例如：飞机 · 东京成田机场"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Hotel size={14} />
                  住宿地址
                </span>
              </label>
              <input
                type="text"
                value={formData.accommodation}
                onChange={(e) =>
                  setFormData({ ...formData, accommodation: e.target.value })
                }
                placeholder="例如：新宿华盛顿酒店"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <StickyNote size={14} />
                  备注
                </span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="行程备注信息"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* 参与人 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-slate-600" />
              参与人
              <span className="text-sm font-normal text-gray-400">
                ({persons.length}人)
              </span>
            </h2>
            <button
              onClick={() => setShowAddPerson(!showAddPerson)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Plus size={16} />
              添加
            </button>
          </div>

          {/* 添加参与人 */}
          {showAddPerson && (
            <div className="p-4 bg-gray-50 rounded-xl mb-4">
              <p className="text-sm text-gray-600 mb-3">选择头像：</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setNewPersonAvatar(avatar)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                      newPersonAvatar === avatar
                        ? 'bg-slate-200 ring-2 ring-slate-400 scale-110'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="输入姓名"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none text-sm"
                />
                <button
                  onClick={handleAddPerson}
                  disabled={!newPersonName.trim()}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确定
                </button>
              </div>
            </div>
          )}

          {/* 参与人列表 */}
          <div className="space-y-2">
            {persons.length === 0 ? (
              <p className="text-gray-400 text-center py-6">暂无参与人，请添加</p>
            ) : (
              persons.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                      {person.avatar || <User size={20} className="text-gray-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{person.name}</p>
                      <p className="text-xs text-gray-400">
                        {person.emergencyContact || '未设置紧急联系人'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/person/${person.id}`)}
                      className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      管理证件
                    </button>
                    <button
                      onClick={() => handleRemovePerson(person.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
          >
            保存行程
          </button>
        </div>
      </main>
    </div>
  );
}
