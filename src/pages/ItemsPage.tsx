import { useState } from 'react';
import {
  CircleDot,
  Wallet,
  FileText,
  ClipboardList,
  Flower2,
  Archive,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Plus,
  X,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import MemberAvatar from '@/components/MemberAvatar';
import StatusBadge from '@/components/StatusBadge';
import type { Item, Handover } from '@/types';

const iconMap: Record<string, typeof CircleDot> = {
  CircleDot,
  Wallet,
  FileText,
  ClipboardList,
  Flower2,
  Archive,
};

export default function ItemsPage() {
  const items = useWeddingStore(state => state.items);
  const members = useWeddingStore(state => state.members);
  const getMemberById = useWeddingStore(state => state.getMemberById);
  const getHandoversByItemId = useWeddingStore(state => state.getHandoversByItemId);
  const confirmHandoverFrom = useWeddingStore(state => state.confirmHandoverFrom);
  const confirmHandoverTo = useWeddingStore(state => state.confirmHandoverTo);
  const createHandover = useWeddingStore(state => state.createHandover);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newHandover, setNewHandover] = useState({
    toMemberId: '',
    location: '',
    note: '',
  });

  const handleConfirmFrom = (handoverId: string) => {
    confirmHandoverFrom(handoverId);
  };

  const handleConfirmTo = (handoverId: string) => {
    confirmHandoverTo(handoverId);
  };

  const handleCreateHandover = () => {
    if (!selectedItem || !newHandover.toMemberId) return;

    createHandover({
      itemId: selectedItem.id,
      fromMemberId: selectedItem.currentHolderId,
      toMemberId: newHandover.toMemberId,
      handoverTime: new Date().toISOString(),
      location: newHandover.location,
      note: newHandover.note,
      fromConfirmed: true,
      toConfirmed: false,
    });

    setNewHandover({ toMemberId: '', location: '', note: '' });
    setShowCreateModal(false);
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="animate-fade-in" style={{ opacity: 0 }}>
      <div className="mb-8">
        <h2 className="font-display text-4xl font-bold text-gray-800 mb-2">
          物品交接
        </h2>
        <p className="text-gray-600">
          管理戒指、红包、誓词卡等关键物品的交接记录
        </p>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold text-gray-800 mb-4">
            关键物品 ({items.length})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {items.map((item, index) => {
              const Icon = iconMap[item.icon] || Package;
              const currentHolder = getMemberById(item.currentHolderId);
              const handovers = getHandoversByItemId(item.id);
              const isSelected = selectedItem?.id === item.id;
              const hasUnconfirmed = handovers.some(h => !h.fromConfirmed || !h.toConfirmed);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`card p-5 cursor-pointer transition-all duration-300 animate-fade-in-up ${
                    isSelected ? 'ring-2 ring-champagne-gold shadow-card-hover' : ''
                  }`}
                  style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${
                      item.status === 'handedover' ? 'bg-forest/10' :
                      item.status === 'intransit' ? 'bg-champagne-gold/10' : 'bg-gray-100'
                    } flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${
                        item.status === 'handedover' ? 'text-forest' :
                        item.status === 'intransit' ? 'text-champagne-gold' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                        {hasUnconfirmed && (
                          <span className="w-2 h-2 rounded-full bg-wine animate-pulse-slow" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">当前持有人：</span>
                          <MemberAvatar member={currentHolder} size="sm" showName />
                        </div>
                        <StatusBadge status={item.status} type="item" size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedItem && (
          <div className="w-[480px] flex-shrink-0">
            <div className="sticky top-8 card p-6 animate-slide-in" style={{ opacity: 0 }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl ${
                    selectedItem.status === 'handedover' ? 'bg-forest/10' :
                    selectedItem.status === 'intransit' ? 'bg-champagne-gold/10' : 'bg-gray-100'
                  } flex items-center justify-center`}>
                    {(() => {
                      const Icon = iconMap[selectedItem.icon] || Package;
                      return <Icon className={`w-8 h-8 ${
                        selectedItem.status === 'handedover' ? 'text-forest' :
                        selectedItem.status === 'intransit' ? 'text-champagne-gold' : 'text-gray-500'
                      }`} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-gray-800">
                      {selectedItem.name}
                    </h3>
                    <StatusBadge status={selectedItem.status} type="item" />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">{selectedItem.description}</p>

              <div className="flex items-center justify-between p-4 bg-rose-pale/30 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-gold" />
                  <span className="text-gray-600">当前持有人</span>
                </div>
                <MemberAvatar
                  member={getMemberById(selectedItem.currentHolderId)}
                  size="md"
                  showName
                  showRole
                />
              </div>

              {selectedItem.status !== 'intransit' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full btn-gold mb-6 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  发起交接
                </button>
              )}

              <div>
                <h4 className="font-display text-lg font-semibold text-gray-800 mb-4">
                  交接记录
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                  {getHandoversByItemId(selectedItem.id).length > 0 ? (
                    getHandoversByItemId(selectedItem.id).map((handover, index) => (
                      <HandoverRecord
                        key={handover.id}
                        handover={handover}
                        index={index}
                        onConfirmFrom={handleConfirmFrom}
                        onConfirmTo={handleConfirmTo}
                        formatTime={formatTime}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无交接记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold text-gray-800">
                发起交接
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交接物品
                </label>
                <div className="p-3 bg-rose-pale/30 rounded-lg text-rose-gold font-medium">
                  {selectedItem.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交出人
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <MemberAvatar
                    member={getMemberById(selectedItem.currentHolderId)}
                    size="md"
                    showName
                    showRole
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  接收人 *
                </label>
                <select
                  value={newHandover.toMemberId}
                  onChange={(e) => setNewHandover(prev => ({ ...prev, toMemberId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">请选择接收人</option>
                  {members.filter(m => m.id !== selectedItem.currentHolderId).map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交接地点
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newHandover.location}
                    onChange={(e) => setNewHandover(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="请输入交接地点"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注说明
                </label>
                <textarea
                  value={newHandover.note}
                  onChange={(e) => setNewHandover(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="请输入交接备注"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <button
                onClick={handleCreateHandover}
                disabled={!newHandover.toMemberId}
                className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认发起交接
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Package(props: { className?: string }) {
  return <Archive {...props} />;
}

interface HandoverRecordProps {
  handover: Handover;
  index: number;
  onConfirmFrom: (id: string) => void;
  onConfirmTo: (id: string) => void;
  formatTime: (time: string) => string;
}

function HandoverRecord({ handover, index, onConfirmFrom, onConfirmTo, formatTime }: HandoverRecordProps) {
  const getMemberById = useWeddingStore(state => state.getMemberById);
  const fromMember = getMemberById(handover.fromMemberId);
  const toMember = getMemberById(handover.toMemberId);

  return (
    <div
      className="p-4 bg-gray-50 rounded-lg animate-fade-in-up"
      style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {formatTime(handover.handoverTime)}
        </div>
        <div className="flex items-center gap-2">
          {handover.fromConfirmed ? (
            <span className="text-xs text-forest flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              交出人已确认
            </span>
          ) : (
            <button
              onClick={() => onConfirmFrom(handover.id)}
              className="text-xs px-2 py-1 bg-champagne-gold/10 text-champagne-gold rounded-full hover:bg-champagne-gold/20 transition-colors"
            >
              确认交出
            </button>
          )}
          <span className="text-gray-300">|</span>
          {handover.toConfirmed ? (
            <span className="text-xs text-forest flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              接收人已确认
            </span>
          ) : (
            <button
              onClick={() => onConfirmTo(handover.id)}
              className="text-xs px-2 py-1 bg-rose-gold/10 text-rose-gold rounded-full hover:bg-rose-gold/20 transition-colors"
            >
              确认接收
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <MemberAvatar member={fromMember} size="sm" showName />
        <ArrowRight className="w-4 h-4 text-champagne-gold" />
        <MemberAvatar member={toMember} size="sm" showName />
      </div>

      {handover.location && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <MapPin className="w-3.5 h-3.5" />
          {handover.location}
        </div>
      )}

      {handover.note && (
        <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
          备注：{handover.note}
        </p>
      )}
    </div>
  );
}
