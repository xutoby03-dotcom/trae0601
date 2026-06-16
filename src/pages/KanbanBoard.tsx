import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, ScanLine, Plus } from 'lucide-react';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { PickupPointTabs } from '../components/kanban/PickupPointTabs';
import { SearchBar } from '../components/kanban/SearchBar';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { useMemberStore } from '../store/memberStore';
import { usePickupPointStore } from '../store/pickupPointStore';
import type { Member } from '../types';
import { PickupModal } from '../components/modals/PickupModal';
import { ProxyPickerModal } from '../components/modals/ProxyPickerModal';

export default function KanbanBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [pickupMode, setPickupMode] = useState<'self' | 'proxy'>('self');

  const { pickupPoints, currentPickupPoint, setCurrentPickupPoint } = usePickupPointStore();
  const { members, searchMembers, confirmPickup, confirmProxyPickup, getMemberById } = useMemberStore();

  const filteredMembers = useMemo(() => {
    return searchMembers(searchQuery, currentPickupPoint);
  }, [searchQuery, currentPickupPoint, searchMembers]);

  const pendingMembers = filteredMembers.filter((m) => m.status === 'pending');
  const pickedMembers = filteredMembers.filter((m) => m.status === 'picked');
  const proxiedMembers = filteredMembers.filter((m) => m.status === 'proxied');

  const allMembers = useMemo(() => {
    return members.filter((m) => m.pickupPoint === currentPickupPoint);
  }, [members, currentPickupPoint]);

  const handlePickupClick = (member: Member) => {
    setSelectedMember(member);
    setPickupMode('self');
    setShowPickupModal(true);
  };

  const handleProxyClick = (member: Member) => {
    setSelectedMember(member);
    setShowProxyModal(true);
  };

  const handleConfirmPickup = () => {
    if (selectedMember) {
      if (pickupMode === 'self') {
        confirmPickup(selectedMember.id);
      }
      setShowPickupModal(false);
      setSelectedMember(null);
    }
  };

  const handleConfirmProxy = (proxyMemberId: string) => {
    if (selectedMember) {
      confirmProxyPickup(selectedMember.id, proxyMemberId);
      setShowProxyModal(false);
      setSelectedMember(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-display">领取看板</h1>
          <p className="text-gray-400 mt-1">管理现场应援物领取状态</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            <ScanLine className="w-4 h-4 mr-2" />
            扫码领取
          </Button>
          <Button variant="gradient" size="md">
            <Plus className="w-4 h-4 mr-2" />
            添加成员
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="总人数"
          value={allMembers.length}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="待领取"
          value={pendingMembers.length}
          icon={<UserX className="w-6 h-6" />}
          color="pink"
          delay={0.2}
        />
        <StatCard
          title="已领取"
          value={pickedMembers.length}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          delay={0.3}
        />
        <StatCard
          title="代领"
          value={proxiedMembers.length}
          icon={<Users className="w-6 h-6" />}
          color="gold"
          delay={0.4}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <PickupPointTabs
          pickupPoints={pickupPoints}
          currentPoint={currentPickupPoint}
          onChange={setCurrentPickupPoint}
        />
        <div className="flex-1 max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ height: 'calc(100vh - 340px)' }}>
        <KanbanColumn
          title="待领取"
          status="pending"
          members={pendingMembers}
          count={pendingMembers.length}
          color="bg-gray-400"
          onPickup={handlePickupClick}
          onProxy={handleProxyClick}
        />
        <KanbanColumn
          title="已领取"
          status="picked"
          members={pickedMembers}
          count={pickedMembers.length}
          color="bg-emerald-400"
        />
        <KanbanColumn
          title="代领"
          status="proxied"
          members={proxiedMembers}
          count={proxiedMembers.length}
          color="bg-amber-400"
        />
      </div>

      <PickupModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        member={selectedMember}
        mode={pickupMode}
        onConfirm={handleConfirmPickup}
      />

      <ProxyPickerModal
        isOpen={showProxyModal}
        onClose={() => setShowProxyModal(false)}
        targetMember={selectedMember}
        onConfirm={handleConfirmProxy}
        members={allMembers.filter((m) => m.canProxy && m.status === 'picked')}
      />
    </div>
  );
}
