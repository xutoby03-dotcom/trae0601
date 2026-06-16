import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import { Search, UserPlus, Check } from 'lucide-react';
import type { Member } from '../../types';

interface ProxyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: Member | null;
  members: Member[];
  onConfirm: (proxyMemberId: string) => void;
}

export function ProxyPickerModal({
  isOpen,
  onClose,
  targetMember,
  members,
  onConfirm,
}: ProxyPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProxy, setSelectedProxy] = useState<string | null>(null);

  if (!targetMember) return null;

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.phoneLastFour.includes(query) ||
      m.seatSection.toLowerCase().includes(query)
    );
  });

  const handleConfirm = () => {
    if (selectedProxy) {
      onConfirm(selectedProxy);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="选择代领人" size="lg">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <p className="text-sm text-gray-300 mb-2">被代领人</p>
          <div className="flex items-center gap-3">
            <Avatar name={targetMember.name} size="md" />
            <div>
              <p className="font-semibold text-white">{targetMember.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Tag variant="purple" className="text-xs">
                  {targetMember.seatSection}
                </Tag>
                <span className="text-xs text-gray-500">尾号 {targetMember.phoneLastFour}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索代领人姓名、手机号、座位..."
            className="w-full pl-11 pr-4 py-3 rounded-xl input-glass text-sm"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">没有找到可代领的成员</p>
              <p className="text-xs mt-1">已领取且有代领权限的成员才能代领</p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = selectedProxy === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedProxy(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-600/30 to-accent-600/20 border border-primary-500/40'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{member.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{member.seatSection}</span>
                      <span className="text-xs text-gray-500">尾号 {member.phoneLastFour}</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500'
                      : 'bg-white/10 border border-white/20'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            取消
          </Button>
          <Button
            variant="gradient"
            fullWidth
            onClick={handleConfirm}
            disabled={!selectedProxy}
          >
            确认代领
          </Button>
        </div>
      </div>
    </Modal>
  );
}
