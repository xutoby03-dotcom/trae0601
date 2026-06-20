import { useState } from 'react';
import { Droplets, Check, X, User, AlertCircle, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';

export default function SealCheck() {
  const { bags, members, itemChecks, sealChecks, confirmSealCheck } = useStore();
  const [checkerName, setCheckerName] = useState('领队');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const getOwnerName = (ownerId: string) => {
    return members.find(m => m.id === ownerId)?.name || '未知';
  };

  const getSealCheck = (bagId: string) => {
    return sealChecks.find(sc => sc.bagId === bagId);
  };

  const getItemCheck = (bagId: string) => {
    return itemChecks.find(ic => ic.bagId === bagId);
  };

  const isItemCheckCompleted = (bagId: string) => {
    return !!getItemCheck(bagId)?.checkedAt;
  };

  const handleConfirm = (bagId: string, sealed: boolean) => {
    if (!checkerName.trim()) {
      alert('请输入检查人姓名');
      return;
    }
    confirmSealCheck(bagId, sealed, checkerName.trim(), notes[bagId] || '');
  };

  const getCheckedCount = () => sealChecks.filter(sc => sc.checkedAt).length;
  const totalCount = bags.length;
  const pendingBags = bags.filter(b => !isItemCheckCompleted(b.id));

  return (
    <div className="animate-fade-in-up">
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center shadow-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-800">入水前密封确认</h2>
              <p className="text-sm text-gray-500">请逐包检查密封状态，确保防水安全</p>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl">
            <span className="text-3xl font-bold text-cyan-600">{getCheckedCount()}</span>
            <span className="text-gray-400">/</span>
            <span className="text-xl text-gray-500">{totalCount}</span>
            <span className="text-sm text-gray-500 ml-1">已确认</span>
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
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                还有 {pendingBags.length} 个防水包未完成出发前清点，请先完成清点再确认密封
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bags.map((bag, index) => {
          const sealCheck = getSealCheck(bag.id);
          const isChecked = !!sealCheck?.checkedAt;
          const itemCheckCompleted = isItemCheckCompleted(bag.id);
          
          return (
            <div
              key={bag.id}
              className={`glass-card rounded-2xl overflow-hidden animate-fade-in-up ${
                isChecked && sealCheck?.sealed ? 'ring-2 ring-green-400' :
                isChecked && !sealCheck?.sealed ? 'ring-2 ring-red-400' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center shadow-lg">
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
                
                {isChecked && sealCheck ? (
                  <div className={`p-4 rounded-xl ${
                    sealCheck.sealed ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {sealCheck.sealed ? (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className={`font-semibold ${
                          sealCheck.sealed ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {sealCheck.sealed ? '密封完好，已确认' : '密封有问题，未通过'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4" />
                          {new Date(sealCheck.checkedAt!).toLocaleString('zh-CN')}
                          <span className="mx-1">·</span>
                          <span>{sealCheck.checkedBy}</span>
                        </div>
                      </div>
                    </div>
                    {sealCheck.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-white/50 p-3 rounded-lg">
                        <span className="font-medium">备注：</span>{sealCheck.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">检查备注</label>
                      <textarea
                        className="input-field min-h-[60px] resize-none"
                        value={notes[bag.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [bag.id]: e.target.value })}
                        placeholder="密封检查情况说明..."
                        disabled={!itemCheckCompleted}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleConfirm(bag.id, false)}
                        disabled={!itemCheckCompleted}
                        className="flex-1 btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        密封有问题
                      </button>
                      <button
                        onClick={() => handleConfirm(bag.id, true)}
                        disabled={!itemCheckCompleted}
                        className="flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        确认密封完好
                      </button>
                    </div>
                    
                    {!itemCheckCompleted && (
                      <p className="text-center text-sm text-amber-600">
                        请先完成出发前物品清点
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
