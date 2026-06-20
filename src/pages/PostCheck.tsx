import { useState } from 'react';
import { AlertTriangle, Check, X, User, Droplets, PackageSearch, Package, Sun } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import type { PostCheck } from '@/types';

export default function PostCheckPage() {
  const { bags, members, sealChecks, postChecks, submitPostCheck } = useStore();
  const [checkerName, setCheckerName] = useState('领队');
  const [formData, setFormData] = useState<Record<string, {
    waterIntrusion: boolean;
    lostItems: boolean;
    damaged: boolean;
    dryerId: string;
    notes: string;
  }>>({});

  const getOwnerName = (ownerId: string) => {
    return members.find(m => m.id === ownerId)?.name || '未知';
  };

  const getPostCheck = (bagId: string) => {
    return postChecks.find(pc => pc.bagId === bagId);
  };

  const getSealCheck = (bagId: string) => {
    return sealChecks.find(sc => sc.bagId === bagId);
  };

  const isSealConfirmed = (bagId: string) => {
    return !!getSealCheck(bagId)?.checkedAt;
  };

  const getFormData = (bagId: string) => {
    if (!formData[bagId]) {
      const pc = getPostCheck(bagId);
      return {
        waterIntrusion: pc?.waterIntrusion || false,
        lostItems: pc?.lostItems || false,
        damaged: pc?.damaged || false,
        dryerId: pc?.dryerId || '',
        notes: pc?.notes || '',
      };
    }
    return formData[bagId];
  };

  const handleFormChange = (bagId: string, field: keyof typeof formData[string], value: any) => {
    setFormData({
      ...formData,
      [bagId]: {
        ...getFormData(bagId),
        [field]: value,
      },
    });
  };

  const handleSubmit = (bagId: string) => {
    if (!checkerName.trim()) {
      alert('请输入检查人姓名');
      return;
    }
    const data = getFormData(bagId);
    submitPostCheck(bagId, {
      waterIntrusion: data.waterIntrusion,
      lostItems: data.lostItems,
      damaged: data.damaged,
      dryerId: data.dryerId || null,
      notes: data.notes,
    }, checkerName.trim());
  };

  const getCheckedCount = () => postChecks.filter(pc => pc.checkedAt).length;
  const totalCount = bags.length;
  const pendingBags = bags.filter(b => !isSealConfirmed(b.id));

  const checkItems = [
    { 
      key: 'waterIntrusion', 
      label: '进水检查', 
      icon: Droplets, 
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      bgSelected: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    { 
      key: 'lostItems', 
      label: '遗失检查', 
      icon: PackageSearch, 
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-50',
      bgSelected: 'bg-amber-500',
      textColor: 'text-amber-700'
    },
    { 
      key: 'damaged', 
      label: '破损检查', 
      icon: Package, 
      borderColor: 'border-rose-400',
      bgColor: 'bg-rose-50',
      bgSelected: 'bg-rose-500',
      textColor: 'text-rose-700'
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-800">返程后检查</h2>
              <p className="text-sm text-gray-500">检查防水包状态，登记问题并分配晾干责任人</p>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl">
            <span className="text-3xl font-bold text-rose-600">{getCheckedCount()}</span>
            <span className="text-gray-400">/</span>
            <span className="text-xl text-gray-500">{totalCount}</span>
            <span className="text-sm text-gray-500 ml-1">已检查</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">检查人：</span>
            <input
              type="text"
              className="input-field w-32"
              value={checkerName}
              onChange={(e) => setCheckerName(e.target.value)}
              placeholder="姓名"
            />
          </div>
        </div>
        
        {pendingBags.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                还有 {pendingBags.length} 个防水包未完成入水前密封确认
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {bags.map((bag, index) => {
          const postCheck = getPostCheck(bag.id);
          const isChecked = !!postCheck?.checkedAt;
          const sealConfirmed = isSealConfirmed(bag.id);
          const data = getFormData(bag.id);
          
          const hasIssue = data.waterIntrusion || data.lostItems || data.damaged;
          
          return (
            <div
              key={bag.id}
              className={`glass-card rounded-2xl overflow-hidden animate-fade-in-up ${
                isChecked && hasIssue ? 'ring-2 ring-red-400' :
                isChecked && !hasIssue ? 'ring-2 ring-green-400' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">#{bag.number}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {bag.color} {bag.capacity} 防水包
                    </h3>
                    <p className="text-sm text-gray-500">
                      拥有者：{getOwnerName(bag.ownerId)}
                    </p>
                  </div>
                  </div>
                  <StatusBadge status={bag.sealStatus} />
                </div>
                
                {isChecked && postCheck ? (
                  <div className={`p-4 rounded-xl mb-4 ${
                    hasIssue ? 'bg-red-50' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {hasIssue ? (
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className={`font-semibold ${
                          hasIssue ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {hasIssue ? '检查发现问题' : '状态良好，无问题'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          检查人：{postCheck.checkedBy} · {new Date(postCheck.checkedAt!).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {postCheck.waterIntrusion && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          <Droplets className="w-4 h-4 inline mr-1" />
                          进水
                        </span>
                      )}
                      {postCheck.lostItems && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                          <PackageSearch className="w-4 h-4 inline mr-1" />
                          物品遗失
                        </span>
                      )}
                      {postCheck.damaged && (
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                          <Package className="w-4 h-4 inline mr-1" />
                          包体破损
                        </span>
                      )}
                    </div>
                    
                    {postCheck.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-white/50 p-3 rounded-lg">
                        <span className="font-medium">备注：</span>{postCheck.notes}
                      </p>
                    )}
                    
                    {postCheck.dryerId && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-600">
                          晾干责任人：<span className="font-medium text-gray-800">{getOwnerName(postCheck.dryerId)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {checkItems.map((item) => {
                        const Icon = item.icon;
                        const isSelected = data[item.key as keyof typeof data];
                        return (
                          <button
                            key={item.key}
                            onClick={() => handleFormChange(bag.id, item.key as any, !isSelected)}
                            disabled={!sealConfirmed}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? `${item.borderColor} ${item.bgColor}`
                                : 'border-gray-200 bg-white/50 hover:border-gray-300'
                            } ${!sealConfirmed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isSelected ? `${item.bgSelected} text-white` : 'bg-gray-100 text-gray-400'
                              }`}>
                                {isSelected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                              </div>
                              <div>
                                <span className={`font-medium ${
                                  isSelected ? item.textColor : 'text-gray-700'
                                }`}>
                                  {item.label}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">晾干责任人</label>
                        <select
                          className="input-field"
                          value={data.dryerId}
                          onChange={(e) => handleFormChange(bag.id, 'dryerId', e.target.value)}
                          disabled={!sealConfirmed}
                        >
                          <option value="">请选择责任人</option>
                          {members.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">备注</label>
                        <input
                          type="text"
                          className="input-field"
                          value={data.notes}
                          onChange={(e) => handleFormChange(bag.id, 'notes', e.target.value)}
                          placeholder="问题描述..."
                          disabled={!sealConfirmed}
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSubmit(bag.id)}
                      disabled={!sealConfirmed}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-5 h-5 inline mr-2" />
                      确认检查结果
                    </button>
                    
                    {!sealConfirmed && (
                      <p className="text-center text-sm text-amber-600">
                        请先完成入水前密封确认
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
