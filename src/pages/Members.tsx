import { useState } from 'react';
import { Plus, Users, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import MemberCard from '@/components/MemberCard';
import MemberForm from '@/components/MemberForm';
import Modal from '@/components/Modal';
import type { Member } from '@/types';

export default function Members() {
  const members = useAppStore((s) => s.members);
  const removeMember = useAppStore((s) => s.removeMember);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const confirmedCount = members.filter((m) => m.confirmed).length;
  const avgStrength =
    members.length > 0
      ? (members.reduce((s, m) => s + m.strengthLevel, 0) / members.length).toFixed(1)
      : '0';

  const handleEdit = (member: Member) => {
    setEditing(member);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除此队员？相关分配记录也会被移除。')) {
      removeMember(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="section-title mb-1">
            <Users size={24} />
            队员档案
          </h3>
          <p className="text-sm text-earth-600">
            共 {members.length} 人 · 已确认 {confirmedCount} 人 · 平均体力 {avgStrength}★
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <UserPlus size={18} />
          添加队员
        </button>
      </div>

      {members.length === 0 ? (
        <div className="card p-16 text-center">
          <Users size={48} className="mx-auto text-forest-300 mb-4" />
          <h4 className="font-display text-lg font-bold text-forest-800 mb-1">暂无队员</h4>
          <p className="text-sm text-earth-600 mb-4">添加队员档案后可以开始分配物资</p>
          <button onClick={handleAdd} className="btn-primary">
            <Plus size={18} />
            添加第一个队员
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((member, i) => (
            <div
              key={member.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-fade-up opacity-0"
            >
              <MemberCard
                member={member}
                onEdit={() => handleEdit(member)}
                onDelete={() => handleDelete(member.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? '编辑队员' : '添加队员'}
      >
        <MemberForm
          member={editing}
          onSubmit={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}
