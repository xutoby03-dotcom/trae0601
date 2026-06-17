import { useState } from 'react';
import { Phone, Clock, Car, Shield, ChevronRight, X } from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import MemberAvatar from '@/components/MemberAvatar';
import type { Member } from '@/types';

const roleOrder = ['伴郎', '伴娘', '总协调', '摄影师', '化妆师', '司机', '其他'];

export default function MembersPage() {
  const members = useWeddingStore(state => state.members);
  const getTasksByMemberId = useWeddingStore(state => state.getTasksByMemberId);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const sortedMembers = [...members].sort((a, b) => {
    const aIndex = roleOrder.indexOf(a.role);
    const bIndex = roleOrder.indexOf(b.role);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  const groupedMembers = sortedMembers.reduce((acc, member) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const roleLabels: Record<string, { label: string; color: string }> = {
    '伴郎': { label: '伴郎团', color: 'bg-blue-500' },
    '伴娘': { label: '伴娘团', color: 'bg-pink-500' },
    '总协调': { label: '协调组', color: 'bg-purple-500' },
    '摄影师': { label: '摄影组', color: 'bg-orange-500' },
    '化妆师': { label: '化妆组', color: 'bg-fuchsia-500' },
    '司机': { label: '司机组', color: 'bg-green-500' },
    '其他': { label: '其他人员', color: 'bg-gray-500' },
  };

  return (
    <div className="animate-fade-in" style={{ opacity: 0 }}>
      <div className="mb-8">
        <h2 className="font-display text-4xl font-bold text-gray-800 mb-2">
          成员管理
        </h2>
        <p className="text-gray-600">
          查看所有工作人员信息、联系方式和任务分配
        </p>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          {Object.entries(groupedMembers).map(([role, roleMembers]) => {
            const label = roleLabels[role];
            return (
              <div key={role} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1 h-6 ${label.color} rounded-full`} />
                  <h3 className="font-display text-xl font-semibold text-gray-800">
                    {label.label}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({roleMembers.length} 人)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {roleMembers.map((member, index) => {
                    const tasks = getTasksByMemberId(member.id);
                    const isSelected = selectedMember?.id === member.id;

                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`card p-5 cursor-pointer transition-all duration-300 animate-fade-in-up ${
                          isSelected ? 'ring-2 ring-rose-gold shadow-card-hover' : ''
                        }`}
                        style={{ opacity: 0, animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <MemberAvatar member={member} size="lg" showRole />
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">
                                {member.name}
                              </h4>
                              <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90 text-rose-gold' : 'text-gray-300'}`} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-champagne-gold" />
                            <span>到场：{member.arrivalTime}</span>
                          </div>
                          <a
                            href={`tel:${member.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-rose-gold hover:text-rose-gold/80 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{member.phone}</span>
                          </a>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.canDrive && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
                              <Car className="w-3 h-3" />
                              会开车
                            </span>
                          )}
                          {member.canKeepValuables && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                              <Shield className="w-3 h-3" />
                              可保管贵重物
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-rose-pale/50 text-rose-gold rounded-full">
                            {tasks.length} 项任务
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {selectedMember && (
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-8 card p-6 animate-slide-in" style={{ opacity: 0 }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <MemberAvatar member={selectedMember} size="lg" showRole />
                  <div>
                    <h3 className="font-display text-2xl font-bold text-gray-800">
                      {selectedMember.name}
                    </h3>
                    <p className="text-gray-600">{selectedMember.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-rose-pale/30 rounded-lg">
                  <span className="text-gray-600">联系电话</span>
                  <a
                    href={`tel:${selectedMember.phone}`}
                    className="font-medium text-rose-gold hover:underline"
                  >
                    {selectedMember.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 bg-champagne-pale/30 rounded-lg">
                  <span className="text-gray-600">到场时间</span>
                  <span className="font-medium text-champagne-gold">
                    {selectedMember.arrivalTime}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">驾驶能力</span>
                  <span className={`font-medium ${selectedMember.canDrive ? 'text-green-600' : 'text-gray-400'}`}>
                    {selectedMember.canDrive ? '是' : '否'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">可保管贵重物</span>
                  <span className={`font-medium ${selectedMember.canKeepValuables ? 'text-purple-600' : 'text-gray-400'}`}>
                    {selectedMember.canKeepValuables ? '是' : '否'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-display text-lg font-semibold text-gray-800 mb-4">
                  今日任务 ({getTasksByMemberId(selectedMember.id).length})
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                  {getTasksByMemberId(selectedMember.id).map((task, index) => {
                    const node = useWeddingStore.getState().timelineNodes.find(n => n.id === task.timelineNodeId);
                    const isResponsible = task.responsibleId === selectedMember.id;

                    return (
                      <div
                        key={task.id}
                        className="p-4 bg-white border border-gray-100 rounded-lg animate-fade-in-up"
                        style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{task.name}</h5>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isResponsible
                              ? 'bg-rose-gold/10 text-rose-gold'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isResponsible ? '负责' : '备用'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {node?.name} · {node?.time}
                        </p>
                        <p className="text-sm text-gray-600">{task.location}</p>
                      </div>
                    );
                  })}
                  {getTasksByMemberId(selectedMember.id).length === 0 && (
                    <p className="text-center text-gray-400 py-8">暂无任务分配</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
