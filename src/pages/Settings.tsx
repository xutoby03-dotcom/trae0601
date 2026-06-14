import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Download,
  Database,
  RefreshCw,
  Cat,
  Users,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { cn } from '../lib/utils';
import { FamilyMember, Cat as CatType } from '../types';

const MEMBER_AVATARS = ['👨', '👩', '🧑', '👧', '👦', '🧓', '👵', '🐱', '🧔', '🧕'];
const MEMBER_COLORS = ['#6B8E7A', '#C48E9F', '#8BA4B8', '#D4A373', '#A8C5A0', '#E8C4C4'];
const CAT_AVATARS = ['🐱', '😺', '😸', '😻', '🙀', '😼', '😽', '🐈', '🐈‍⬛', '😹', '😾', '🙈'];

const Settings: React.FC = () => {
  const {
    members,
    cats,
    records,
    addMember,
    updateMember,
    removeMember,
    addCat,
    updateCat,
    removeCat,
    clearData,
    resetData,
  } = useAppStore();

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [memberFormName, setMemberFormName] = useState('');
  const [memberFormAvatar, setMemberFormAvatar] = useState(MEMBER_AVATARS[0]);
  const [memberFormColor, setMemberFormColor] = useState(MEMBER_COLORS[0]);
  const [memberDeleteConfirm, setMemberDeleteConfirm] = useState<string | null>(null);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CatType | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormAvatar, setCatFormAvatar] = useState(CAT_AVATARS[0]);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<string | null>(null);

  const [clearDataConfirm, setClearDataConfirm] = useState(false);
  const [resetDataConfirm, setResetDataConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const memberStats = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      map.set(r.memberId, (map.get(r.memberId) || 0) + 1);
    });
    return map;
  }, [records]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberFormName('');
    setMemberFormAvatar(MEMBER_AVATARS[0]);
    setMemberFormColor(MEMBER_COLORS[0]);
    setMemberModalOpen(true);
  };

  const openEditMemberModal = (member: FamilyMember) => {
    setEditingMember(member);
    setMemberFormName(member.name);
    setMemberFormAvatar(member.avatar);
    setMemberFormColor(member.color);
    setMemberModalOpen(true);
  };

  const handleSubmitMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormName.trim()) return;

    if (editingMember) {
      updateMember(editingMember.id, {
        name: memberFormName.trim(),
        avatar: memberFormAvatar,
        color: memberFormColor,
      });
      showToast('成员已更新');
    } else {
      addMember({
        name: memberFormName.trim(),
        avatar: memberFormAvatar,
        color: memberFormColor,
      });
      showToast('成员已添加');
    }
    setMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    removeMember(id);
    setMemberDeleteConfirm(null);
    showToast('成员已删除');
  };

  const openAddCatModal = () => {
    setEditingCat(null);
    setCatFormName('');
    setCatFormAvatar(CAT_AVATARS[0]);
    setCatModalOpen(true);
  };

  const openEditCatModal = (cat: CatType) => {
    setEditingCat(cat);
    setCatFormName(cat.name);
    setCatFormAvatar(cat.avatar);
    setCatModalOpen(true);
  };

  const handleSubmitCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) return;

    if (editingCat) {
      updateCat(editingCat.id, {
        name: catFormName.trim(),
        avatar: catFormAvatar,
      });
      showToast('猫咪档案已更新');
    } else {
      addCat({
        name: catFormName.trim(),
        avatar: catFormAvatar,
      });
      showToast('猫咪已添加');
    }
    setCatModalOpen(false);
  };

  const handleDeleteCat = (id: string) => {
    removeCat(id);
    setCatDeleteConfirm(null);
    showToast('猫咪档案已删除');
  };

  const handleExportData = () => {
    const state = useAppStore.getState();
    const data = {
      members: state.members,
      cats: state.cats,
      litterBoxes: state.litterBoxes,
      records: state.records,
      currentMemberId: state.currentMemberId,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cat-litter-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('数据已导出');
  };

  const handleClearData = () => {
    clearData();
    setClearDataConfirm(false);
    showToast('所有数据已清空');
  };

  const handleResetData = () => {
    resetData();
    setResetDataConfirm(false);
    showToast('已重置为示例数据');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] px-8 py-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-2 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-[#5C4A3A]" style={{ fontFamily: "'LXGW WenKai', system-ui, serif" }}>
            设置 ⚙️
          </h1>
          <p className="text-[#8B7E6B]">管理家庭成员、猫咪档案和数据</p>
        </div>

        <section className="space-y-5 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#A8C5A0]/15">
                <Users size={20} className="text-[#6B8E7A]" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold text-[#5C4A3A]">家庭成员</h2>
            </div>
            <button
              onClick={openAddMemberModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6B8E7A] text-white text-sm font-medium transition-all duration-300 hover:bg-[#5A7A68] hover:shadow-md active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              添加成员
            </button>
          </div>

          {members.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E8DFD2] shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#FAF6F0] flex items-center justify-center">
                <Users size={32} className="text-[#C4B9A8]" strokeWidth={1.5} />
              </div>
              <p className="text-[#8B7E6B]">暂无家庭成员</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="relative group bg-white rounded-3xl p-6 border border-[#E8DFD2] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fadeInUp"
                  style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1">
                    <button
                      onClick={() => openEditMemberModal(member)}
                      className="p-2 rounded-xl bg-[#FAF6F0] text-[#8B7E6B] hover:bg-[#F0E8DB] hover:text-[#5C4A3A] transition-all"
                      title="编辑"
                    >
                      <Edit3 size={14} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setMemberDeleteConfirm(member.id)}
                      className="p-2 rounded-xl bg-[#FAF6F0] text-[#D4896A] hover:bg-[#FDE8DC] transition-all"
                      title="删除"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-inner"
                      style={{ backgroundColor: `${member.color}18` }}
                    >
                      {member.avatar}
                    </div>
                    <h3 className="text-lg font-semibold text-[#5C4A3A] mb-2">{member.name}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-lg shadow-sm"
                        style={{ backgroundColor: member.color }}
                      />
                      <span className="text-xs text-[#A09484]">主题色</span>
                    </div>
                    <div className="w-full py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F0E8DB]">
                      <span className="text-sm text-[#8B7E6B]">累计清理 </span>
                      <span className="text-lg font-bold text-[#6B8E7A]">
                        {memberStats.get(member.id) || 0}
                      </span>
                      <span className="text-sm text-[#8B7E6B]"> 次</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#C48E9F]/15">
                <Cat size={20} className="text-[#A46B80]" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold text-[#5C4A3A]">猫咪档案</h2>
            </div>
            <button
              onClick={openAddCatModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#C48E9F] text-white text-sm font-medium transition-all duration-300 hover:bg-[#B47A8E] hover:shadow-md active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              添加猫咪
            </button>
          </div>

          {cats.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E8DFD2] shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#FAF6F0] flex items-center justify-center">
                <Cat size={32} className="text-[#C4B9A8]" strokeWidth={1.5} />
              </div>
              <p className="text-[#8B7E6B]">暂无猫咪档案</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8DFD2] shadow-sm divide-y divide-[#F0E8DB] overflow-hidden">
              {cats.map((cat, index) => (
                <div
                  key={cat.id}
                  className="relative group flex items-center gap-5 p-5 transition-all duration-300 hover:bg-[#FAF6F0] animate-slideIn"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#C48E9F]/10 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                    {cat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#5C4A3A] truncate">{cat.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => openEditCatModal(cat)}
                      className="p-2.5 rounded-xl bg-white border border-[#E8DFD2] text-[#8B7E6B] hover:bg-[#F0E8DB] hover:text-[#5C4A3A] transition-all"
                      title="编辑"
                    >
                      <Edit3 size={16} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setCatDeleteConfirm(cat.id)}
                      className="p-2.5 rounded-xl bg-white border border-[#E8DFD2] text-[#D4896A] hover:bg-[#FDE8DC] transition-all"
                      title="删除"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#8BA4B8]/15">
              <Database size={20} className="text-[#6B8698]" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-semibold text-[#5C4A3A]">数据管理</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8DFD2] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#8BA4B8]/8 border border-[#8BA4B8]/20">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#8BA4B8]/15 flex-shrink-0">
                  <Download size={18} className="text-[#6B8698]" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#5C4A3A]">导出数据</h4>
                  <p className="text-sm text-[#8B7E6B] mt-0.5">
                    将所有数据导出为 JSON 文件，可用于备份或迁移
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8BA4B8] text-white text-sm font-medium transition-all duration-300 hover:bg-[#7A94A8] hover:shadow-md active:scale-95 whitespace-nowrap"
              >
                <Download size={16} strokeWidth={2} />
                导出数据
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#D4A373]/8 border border-[#D4A373]/20">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#D4A373]/15 flex-shrink-0">
                  <RefreshCw size={18} className="text-[#B88852]" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#5C4A3A]">重置示例数据</h4>
                  <p className="text-sm text-[#8B7E6B] mt-0.5">
                    将所有数据重置为初始示例数据，当前数据将被覆盖
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetDataConfirm(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#D4A373] text-white text-sm font-medium transition-all duration-300 hover:bg-[#C49363] hover:shadow-md active:scale-95 whitespace-nowrap"
              >
                <RefreshCw size={16} strokeWidth={2} />
                重置示例数据
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#D4896A]/8 border border-[#D4896A]/20">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#D4896A]/15 flex-shrink-0">
                  <Trash2 size={18} className="text-[#D4896A]" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#D4896A]">清空所有数据</h4>
                  <p className="text-sm text-[#8B7E6B] mt-0.5">
                    清空所有成员、猫咪、猫砂盆和记录数据，此操作不可恢复
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClearDataConfirm(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#D4896A] text-white text-sm font-medium transition-all duration-300 hover:bg-[#C47A5B] hover:shadow-md active:scale-95 whitespace-nowrap"
              >
                <Trash2 size={16} strokeWidth={2} />
                清空数据
              </button>
            </div>
          </div>
        </section>
      </div>

      {memberModalOpen && (
        <ModalShell onClose={() => setMemberModalOpen(false)}>
          <form onSubmit={handleSubmitMember} className="p-6 space-y-5">
            <ModalHeader
              title={editingMember ? '编辑成员' : '添加家庭成员'}
              subtitle={editingMember ? '修改成员信息' : '添加一位新的家庭成员'}
              color="from-[#6B8E7A] to-[#A8C5A0]"
              onClose={() => setMemberModalOpen(false)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5C4A3A]">姓名</label>
              <input
                type="text"
                value={memberFormName}
                onChange={(e) => setMemberFormName(e.target.value)}
                placeholder="请输入成员姓名"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8DFD2] text-[#5C4A3A] text-sm placeholder:text-[#C4B9A8] focus:outline-none focus:ring-2 focus:ring-[#6B8E7A]/40 focus:border-[#6B8E7A] transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-[#5C4A3A]">选择头像</label>
              <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD2]">
                {MEMBER_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMemberFormAvatar(emoji)}
                    className={cn(
                      'w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200',
                      memberFormAvatar === emoji
                        ? 'bg-white shadow-md scale-110 ring-2 ring-[#6B8E7A]'
                        : 'hover:bg-white/70 active:scale-95'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-[#5C4A3A]">选择主题色</label>
              <div className="flex flex-wrap gap-3 p-3 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD2]">
                {MEMBER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setMemberFormColor(color)}
                    className={cn(
                      'w-11 h-11 rounded-xl transition-all duration-200 shadow-sm',
                      memberFormColor === color
                        ? 'ring-2 ring-offset-2 ring-[#5C4A3A]/30 scale-110'
                        : 'hover:scale-105 active:scale-95'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <ModalActions
              onCancel={() => setMemberModalOpen(false)}
              confirmText={editingMember ? '保存修改' : '添加成员'}
              disabled={!memberFormName.trim()}
              confirmClass="bg-[#6B8E7A] hover:bg-[#5A7A68]"
            />
          </form>
        </ModalShell>
      )}

      {memberDeleteConfirm && (
        <ModalShell onClose={() => setMemberDeleteConfirm(null)}>
          <ConfirmDialog
            icon={<AlertTriangle size={28} className="text-[#D4896A]" />}
            title="确认删除成员？"
            message="删除后该成员的所有清理记录仍会保留，但成员信息将无法恢复。"
            confirmText="删除成员"
            onConfirm={() => handleDeleteMember(memberDeleteConfirm)}
            onCancel={() => setMemberDeleteConfirm(null)}
            danger
          />
        </ModalShell>
      )}

      {catModalOpen && (
        <ModalShell onClose={() => setCatModalOpen(false)}>
          <form onSubmit={handleSubmitCat} className="p-6 space-y-5">
            <ModalHeader
              title={editingCat ? '编辑猫咪档案' : '添加猫咪'}
              subtitle={editingCat ? '修改猫咪信息' : '添加一位新的家庭成员喵~'}
              color="from-[#C48E9F] to-[#E8C4C4]"
              onClose={() => setCatModalOpen(false)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5C4A3A]">猫咪名字</label>
              <input
                type="text"
                value={catFormName}
                onChange={(e) => setCatFormName(e.target.value)}
                placeholder="请输入猫咪名字"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8DFD2] text-[#5C4A3A] text-sm placeholder:text-[#C4B9A8] focus:outline-none focus:ring-2 focus:ring-[#C48E9F]/40 focus:border-[#C48E9F] transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-[#5C4A3A]">选择头像</label>
              <div className="grid grid-cols-6 gap-2 p-3 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD2]">
                {CAT_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCatFormAvatar(emoji)}
                    className={cn(
                      'w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200',
                      catFormAvatar === emoji
                        ? 'bg-white shadow-md scale-110 ring-2 ring-[#C48E9F]'
                        : 'hover:bg-white/70 active:scale-95'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <ModalActions
              onCancel={() => setCatModalOpen(false)}
              confirmText={editingCat ? '保存修改' : '添加猫咪'}
              disabled={!catFormName.trim()}
              confirmClass="bg-[#C48E9F] hover:bg-[#B47A8E]"
            />
          </form>
        </ModalShell>
      )}

      {catDeleteConfirm && (
        <ModalShell onClose={() => setCatDeleteConfirm(null)}>
          <ConfirmDialog
            icon={<AlertTriangle size={28} className="text-[#D4896A]" />}
            title="确认删除猫咪档案？"
            message="猫咪档案删除后将无法恢复，相关的关联信息也会被移除。"
            confirmText="删除档案"
            onConfirm={() => handleDeleteCat(catDeleteConfirm)}
            onCancel={() => setCatDeleteConfirm(null)}
            danger
          />
        </ModalShell>
      )}

      {clearDataConfirm && (
        <ModalShell onClose={() => setClearDataConfirm(false)}>
          <ConfirmDialog
            icon={<AlertTriangle size={32} className="text-[#D4896A]" />}
            title="确定要清空所有数据吗？"
            message="此操作将清空所有家庭成员、猫咪档案、猫砂盆和清理记录，且无法恢复。建议先导出数据备份。"
            confirmText="确认清空"
            onConfirm={handleClearData}
            onCancel={() => setClearDataConfirm(false)}
            danger
          />
        </ModalShell>
      )}

      {resetDataConfirm && (
        <ModalShell onClose={() => setResetDataConfirm(false)}>
          <ConfirmDialog
            icon={<RefreshCw size={28} className="text-[#D4A373]" />}
            title="重置为示例数据？"
            message="当前所有数据将被替换为初始示例数据，此操作无法撤销。"
            confirmText="确认重置"
            onConfirm={handleResetData}
            onCancel={() => setResetDataConfirm(false)}
          />
        </ModalShell>
      )}

      {toast && (
        <div
          className={cn(
            'fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fadeInUp',
            toast.type === 'success'
              ? 'bg-[#6B8E7A] text-white'
              : 'bg-[#D4896A] text-white'
          )}
        >
          <CheckCircle2 size={18} strokeWidth={2.5} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

interface ModalShellProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalShell: React.FC<ModalShellProps> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <div
      className="relative bg-[#FAF6F0] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modalIn"
    >
      {children}
    </div>
  </div>
);

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  color: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, color, onClose }) => (
  <div className={cn('bg-gradient-to-r p-6 text-white -mx-6 -mt-6 mb-2', color)}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-2xl bg-white/15 transition-colors hover:bg-white/25"
      >
        <X size={18} strokeWidth={2} />
      </button>
    </div>
  </div>
);

interface ModalActionsProps {
  onCancel: () => void;
  confirmText: string;
  disabled?: boolean;
  confirmClass?: string;
}

const ModalActions: React.FC<ModalActionsProps> = ({ onCancel, confirmText, disabled, confirmClass }) => (
  <div className="flex gap-3 pt-2">
    <button
      type="button"
      onClick={onCancel}
      className="flex-1 py-3 rounded-2xl bg-white border border-[#E8DFD2] text-[#8B7E6B] font-medium transition-all hover:bg-[#FAF0E6]"
    >
      取消
    </button>
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        'flex-1 py-3 rounded-2xl text-white font-medium transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        confirmClass || 'bg-[#D4896A] hover:bg-[#C47A5B]'
      )}
    >
      {confirmText}
    </button>
  </div>
);

interface ConfirmDialogProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  icon,
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  danger,
}) => (
  <div className="p-6 space-y-5">
    <div className="flex flex-col items-center text-center space-y-3 pt-2">
      <div
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center',
          danger ? 'bg-[#D4896A]/12' : 'bg-[#D4A373]/12'
        )}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#5C4A3A]">{title}</h3>
      <p className="text-sm text-[#8B7E6B] leading-relaxed px-2">{message}</p>
    </div>
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-3 rounded-2xl bg-white border border-[#E8DFD2] text-[#8B7E6B] font-medium transition-all hover:bg-[#FAF0E6]"
      >
        取消
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={cn(
          'flex-1 py-3 rounded-2xl text-white font-medium transition-all hover:shadow-lg active:scale-95',
          danger ? 'bg-[#D4896A] hover:bg-[#C47A5B]' : 'bg-[#D4A373] hover:bg-[#C49363]'
        )}
      >
        {confirmText}
      </button>
    </div>
  </div>
);

export default Settings;
