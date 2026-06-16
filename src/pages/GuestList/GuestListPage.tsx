import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Star, Edit2, Trash2, Phone, UserPlus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { SOURCES, RELATIONSHIPS, STATUS_LABELS } from '../../../shared/constants';
import type { Guest } from '../../../shared/types';
import { formatPhone } from '../../utils/format';

export default function GuestListPage() {
  const { 
    guests, 
    sessions, 
    loading, 
    fetchGuests, 
    fetchSessions, 
    addGuest, 
    updateGuest, 
    deleteGuest,
    confirmGuest
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    source: SOURCES[0],
    relationship: RELATIONSHIPS[0],
    sessionId: '',
    headcount: 1,
    dietaryRestrictions: '无',
    phone: '',
    isVIP: false,
    notes: '',
  });

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchGuests({
      sessionId: selectedSession || undefined,
      status: selectedStatus || undefined,
      search: searchQuery || undefined,
    });
  }, [fetchGuests, selectedSession, selectedStatus, searchQuery]);

  const handleOpenModal = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      setFormData({
        name: guest.name,
        source: guest.source,
        relationship: guest.relationship,
        sessionId: guest.sessionId,
        headcount: guest.headcount,
        dietaryRestrictions: guest.dietaryRestrictions,
        phone: guest.phone,
        isVIP: guest.isVIP,
        notes: guest.notes || '',
      });
    } else {
      setEditingGuest(null);
      setFormData({
        name: '',
        source: SOURCES[0],
        relationship: RELATIONSHIPS[0],
        sessionId: sessions[0]?.id || '',
        headcount: 1,
        dietaryRestrictions: '无',
        phone: '',
        isVIP: false,
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, formData);
      } else {
        await addGuest(formData as Omit<Guest, 'id' | 'createdAt'>);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save guest:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个邀约人吗？')) {
      try {
        await deleteGuest(id);
      } catch (error) {
        console.error('Failed to delete guest:', error);
      }
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await confirmGuest(id);
    } catch (error) {
      console.error('Failed to confirm guest:', error);
    }
  };

  const getSessionName = (sessionId: string) => {
    return sessions.find(s => s.id === sessionId)?.name || '未知场次';
  };

  const vipGuests = guests.filter(g => g.isVIP).length;

  return (
    <div className="space-y-6">
      {/* 筛选区域 */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" size={20} />
              <input
                type="text"
                placeholder="搜索姓名或电话..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-warm-500" />
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="input-field w-44"
            >
              <option value="">全部场次</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>{session.name}</option>
              ))}
            </select>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field w-36"
          >
            <option value="">全部状态</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            添加邀约
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">总邀约人数</p>
              <p className="text-2xl font-semibold text-brown-800 mt-1">{guests.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <UserPlus className="text-primary-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">已确认</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                {guests.filter(g => g.isConfirmed).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Star className="text-green-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">待确认</p>
              <p className="text-2xl font-semibold text-amber-600 mt-1">
                {guests.filter(g => !g.isConfirmed && g.status === 'invited').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="text-amber-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">重点客户</p>
              <p className="text-2xl font-semibold text-primary-600 mt-1">{vipGuests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <Star className="text-primary-500" size={24} fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      {/* 名单列表 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-brown-800 mb-4">邀约名单</h3>
        
        {loading ? (
          <div className="py-12 text-center text-brown-500">加载中...</div>
        ) : guests.length === 0 ? (
          <div className="py-12 text-center text-brown-500">
            <UserPlus size={48} className="mx-auto mb-3 text-warm-300" />
            <p>暂无邀约人</p>
            <button 
              onClick={() => handleOpenModal()}
              className="text-primary-500 hover:text-primary-600 mt-2"
            >
              添加第一个邀约人
            </button>
          </div>
        ) : (
          <div className="divide-y divide-warm-100 -mx-6">
            {guests.map((guest) => (
              <div 
                key={guest.id} 
                className="px-6 py-4 flex items-center gap-4 hover:bg-warm-50/50 transition-colors"
              >
                <Avatar name={guest.name} size="lg" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-brown-800 truncate">{guest.name}</h4>
                    {guest.isVIP && (
                      <span className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        <Star size={12} fill="currentColor" />
                        VIP
                      </span>
                    )}
                    <StatusBadge status={guest.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-brown-500">
                    <span>{getSessionName(guest.sessionId)}</span>
                    <span>·</span>
                    <span>{guest.source}</span>
                    <span>·</span>
                    <span>{guest.relationship}</span>
                    <span>·</span>
                    <span>{guest.headcount}人</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-brown-600">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-warm-400" />
                    <span>{formatPhone(guest.phone)}</span>
                  </div>
                  
                  {guest.dietaryRestrictions && guest.dietaryRestrictions !== '无' && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                      {guest.dietaryRestrictions}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1">
                    {guest.status === 'invited' && (
                      <button
                        onClick={() => handleConfirm(guest.id)}
                        className="p-2 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                        title="确认参加"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(guest)}
                      className="p-2 rounded-lg text-brown-500 hover:bg-warm-100 transition-colors"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加/编辑弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? '编辑邀约人' : '添加邀约人'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="请输入姓名"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="请输入手机号"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">来源</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="input-field"
              >
                {SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">关系</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="input-field"
              >
                {RELATIONSHIPS.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">
                邀约场次 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sessionId}
                onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                className="input-field"
                required
              >
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>{session.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">
                人数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.headcount}
                onChange={(e) => setFormData({ ...formData, headcount: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">忌口</label>
            <input
              type="text"
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              className="input-field"
              placeholder="如：不吃辣、海鲜过敏等"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="备注信息..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isVIP"
              checked={formData.isVIP}
              onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
              className="w-4 h-4 text-primary-500 rounded border-warm-300 focus:ring-primary-500"
            />
            <label htmlFor="isVIP" className="text-sm text-brown-700">
              标记为重点客户
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              {editingGuest ? '保存修改' : '添加邀约'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Clock({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function Check({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
