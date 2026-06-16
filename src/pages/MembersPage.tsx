import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, UserCheck, UserX, Shield, Filter } from 'lucide-react';
import { MemberTable } from '../components/members/MemberTable';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/kanban/SearchBar';
import { Select } from '../components/ui/Input';
import { useMemberStore } from '../store/memberStore';
import { usePickupPointStore } from '../store/pickupPointStore';
import type { MemberStatus } from '../types';
import { MEMBER_STATUS_LABELS } from '../types';

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pickupPointFilter, setPickupPointFilter] = useState<string>('all');

  const { members, deleteMember } = useMemberStore();
  const { pickupPoints } = usePickupPointStore();

  const filteredMembers = useMemo(() => {
    let result = members;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.phoneLastFour.includes(query) ||
          m.seatSection.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (pickupPointFilter !== 'all') {
      result = result.filter((m) => m.pickupPoint === pickupPointFilter);
    }

    return result;
  }, [members, searchQuery, statusFilter, pickupPointFilter]);

  const totalMembers = members.length;
  const pickedCount = members.filter((m) => m.status === 'picked').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const canProxyCount = members.filter((m) => m.canProxy).length;

  const handleDelete = (member: { id: string }) => {
    if (confirm(`确定要删除成员 ${member.id} 吗？`)) {
      deleteMember(member.id);
    }
  };

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: MEMBER_STATUS_LABELS.pending },
    { value: 'picked', label: MEMBER_STATUS_LABELS.picked },
    { value: 'proxied', label: MEMBER_STATUS_LABELS.proxied },
  ];

  const pickupPointOptions = [
    { value: 'all', label: '全部取货点' },
    ...pickupPoints.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-display">成员管理</h1>
          <p className="text-gray-400 mt-1">管理演唱会参与成员信息</p>
        </div>
        <Button variant="gradient" size="md">
          <Plus className="w-4 h-4 mr-2" />
          添加成员
        </Button>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="总成员数"
          value={totalMembers}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="待领取"
          value={pendingCount}
          icon={<UserX className="w-6 h-6" />}
          color="pink"
          delay={0.2}
        />
        <StatCard
          title="已领取"
          value={pickedCount}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          delay={0.3}
        />
        <StatCard
          title="可代领"
          value={canProxyCount}
          icon={<Shield className="w-6 h-6" />}
          color="gold"
          delay={0.4}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="搜索成员姓名、手机号、座位..." />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-36"
          />
          <Select
            value={pickupPointFilter}
            onChange={(e) => setPickupPointFilter(e.target.value)}
            options={pickupPointOptions}
            className="w-40"
          />
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          共 {filteredMembers.length} 人
        </div>
      </div>

      <MemberTable members={filteredMembers} onDelete={handleDelete} />
    </div>
  );
}
