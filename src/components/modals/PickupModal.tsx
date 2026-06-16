import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import { Check, Clock, MapPin, Phone, Ticket } from 'lucide-react';
import type { Member } from '../../types';
import { useMaterialStore } from '../../store/materialStore';

interface PickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  mode: 'self' | 'proxy';
  onConfirm: () => void;
}

export function PickupModal({ isOpen, onClose, member, mode, onConfirm }: PickupModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { materials, decrementInventory } = useMaterialStore.getState();

  if (!member) return null;

  const handleConfirm = () => {
    setIsConfirming(true);
    
    materials.forEach((m) => {
      decrementInventory(m.id, 1);
    });
    
    setTimeout(() => {
      onConfirm();
      setIsConfirming(false);
    }, 800);
  };

  const formatTime = (time: string | null) => {
    if (!time) return '—';
    return new Date(time).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'self' ? '确认领取' : '确认代领'}
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20">
          <Avatar name={member.name} size="lg" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{member.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Tag variant="purple">{member.seatSection}</Tag>
              <Tag variant="gray">尾号 {member.phoneLastFour}</Tag>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gradient">¥{member.amountDue}</p>
            <p className="text-xs text-gray-500">应付金额</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">物料清单</h4>
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={material.image}
                    alt={material.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23334155"/><text x="20" y="25" text-anchor="middle" fill="%2364748b" font-size="12">📦</text></svg>';
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{material.name}</p>
                    <p className="text-xs text-gray-500">袋子: {material.bagNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">x1</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <MapPin className="w-5 h-5 text-primary-400" />
            <div>
              <p className="text-xs text-gray-500">取货点</p>
              <p className="text-sm font-medium text-white">{member.pickupPoint}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <Clock className="w-5 h-5 text-accent-400" />
            <div>
              <p className="text-xs text-gray-500">排队开始</p>
              <p className="text-sm font-medium text-white">{formatTime(member.queueStartTime)}</p>
            </div>
          </div>
        </div>

        {mode === 'proxy' && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <Ticket className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">代领说明</p>
                <p className="text-xs text-gray-400 mt-1">
                  代领人需出示本人有效证件，并签字确认。请核对被代领人信息无误后领取。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            取消
          </Button>
          <Button variant="gradient" fullWidth onClick={handleConfirm} isLoading={isConfirming}>
            <Check className="w-4 h-4 mr-2" />
            确认{mode === 'self' ? '领取' : '代领'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
