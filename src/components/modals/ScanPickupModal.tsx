import { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ScanLine, Search, UserCheck, AlertCircle } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import type { Member } from '../../types';
import { useMemberStore } from '../../store/memberStore';
import { usePickupPointStore } from '../../store/pickupPointStore';

interface ScanPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberFound: (member: Member) => void;
}

export function ScanPickupModal({ isOpen, onClose, onMemberFound }: ScanPickupModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [matchedMember, setMatchedMember] = useState<Member | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setCurrentPickupPoint, pickupPoints } = usePickupPointStore();
  const { members, startQueue } = useMemberStore();

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setMatchedMember(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearch = () => {
    if (!code.trim()) {
      setError('请输入手机号后四位或成员编号');
      return;
    }

    setError('');
    setMatchedMember(null);

    const trimmedCode = code.trim();

    const found = members.find((m) => {
      if (m.status !== 'pending') return false;

      if (trimmedCode.length === 4 && /^\d+$/.test(trimmedCode)) {
        return m.phoneLastFour === trimmedCode;
      }

      if (m.id.toLowerCase() === trimmedCode.toLowerCase()) {
        return true;
      }

      if (m.name.toLowerCase().includes(trimmedCode.toLowerCase())) {
        return true;
      }

      return false;
    });

    if (found) {
      const queueStart = new Date().toISOString();
      const memberWithFreshQueue = { ...found, queueStartTime: queueStart };
      setMatchedMember(memberWithFreshQueue);
      setCurrentPickupPoint(found.pickupPoint);
      startQueue(found.id);
    } else {
      setError('未找到匹配的待领取成员，请检查输入');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (matchedMember) {
        handleConfirm();
      } else {
        handleSearch();
      }
    }
  };

  const handleConfirm = () => {
    if (matchedMember) {
      onMemberFound(matchedMember);
      setCode('');
      setMatchedMember(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="扫码领取" size="md">
      <div className="space-y-5">
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center">
              <ScanLine className="w-12 h-12 text-primary-400" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-20 blur-md animate-pulse" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            输入手机号后四位 / 成员编号
          </label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
                setMatchedMember(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="例如：1234 或 member-1"
              className="flex-1 text-lg"
            />
            <Button variant="gradient" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-1.5" />
              搜索
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {matchedMember && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 animate-scale-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <UserCheck className="w-4 h-4" />
                找到成员
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar name={matchedMember.name} size="lg" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">{matchedMember.name}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Tag variant="purple">{matchedMember.seatSection}</Tag>
                  <Tag variant="gold">
                    {pickupPoints.find(p => p.id === matchedMember.pickupPoint)?.name}
                  </Tag>
                  <span className="text-sm text-gray-400">尾号 {matchedMember.phoneLastFour}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gradient">¥{matchedMember.amountDue}</p>
                <p className="text-xs text-gray-500">应付金额</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            取消
          </Button>
          <Button
            variant="gradient"
            fullWidth
            onClick={handleConfirm}
            disabled={!matchedMember}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            确认领取
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          提示：输入4位数字匹配手机号后四位，输入编号或姓名匹配对应成员
        </p>
      </div>
    </Modal>
  );
}
