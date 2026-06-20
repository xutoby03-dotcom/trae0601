import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Mic, Volume2, Bluetooth, Cable, Package, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function ReturnPage() {
  const navigate = useNavigate();
  const { borrowRecords, headsets, addReturnTest } = useStore();
  
  const activeBorrows = borrowRecords.filter(r => r.status === 'borrowed' || r.status === 'overdue');
  
  const [selectedBorrowId, setSelectedBorrowId] = useState<string>('');
  const [tests, setTests] = useState({
    soundTest: true,
    noiseCancellation: true,
    bluetoothTest: true,
    wireControl: true,
    appearance: true,
  });
  const [notes, setNotes] = useState('');

  const selectedBorrow = borrowRecords.find(r => r.id === selectedBorrowId);
  const selectedHeadset = selectedBorrow ? headsets.find(h => h.id === selectedBorrow.headsetId) : undefined;

  const allTestsPassed = Object.values(tests).every(Boolean);

  const handleTestToggle = (testKey: keyof typeof tests) => {
    setTests(prev => ({
      ...prev,
      [testKey]: !prev[testKey]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBorrowId) {
      alert('请选择要归还的借用记录');
      return;
    }
    
    addReturnTest({
      borrowRecordId: selectedBorrowId,
      ...tests,
      notes: notes.trim() || undefined,
    });
    
    navigate('/');
  };

  const testItems = [
    {
      key: 'soundTest' as const,
      label: '收音测试',
      description: '测试麦克风收音是否清晰',
      icon: Mic,
    },
    {
      key: 'noiseCancellation' as const,
      label: '降噪测试',
      description: '测试降噪功能是否正常',
      icon: Volume2,
    },
    {
      key: 'bluetoothTest' as const,
      label: '蓝牙/连接测试',
      description: '测试蓝牙或有线连接是否稳定',
      icon: Bluetooth,
    },
    {
      key: 'wireControl' as const,
      label: '线控测试',
      description: '测试线控按钮是否正常',
      icon: Cable,
    },
    {
      key: 'appearance' as const,
      label: '外观检查',
      description: '检查外观是否有损坏',
      icon: Package,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="text-2xl font-bold text-slate-900">归还测试</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">选择归还的耳麦</h2>
          
          {activeBorrows.length === 0 ? (
            <p className="text-slate-500 text-center py-8">暂无待归还的耳麦</p>
          ) : (
            <div className="space-y-3">
              {activeBorrows.map(borrow => {
                const headset = headsets.find(h => h.id === borrow.headsetId);
                const isOverdue = borrow.status === 'overdue';
                
                return (
                  <label
                    key={borrow.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedBorrowId === borrow.id
                        ? 'border-primary-500 bg-primary-50'
                        : isOverdue
                        ? 'border-red-300 bg-red-50 hover:border-red-400'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="borrow"
                      value={borrow.id}
                      checked={selectedBorrowId === borrow.id}
                      onChange={(e) => setSelectedBorrowId(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    {headset && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={headset.photo}
                          alt={`${headset.brand} ${headset.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {headset?.brand} {headset?.model}
                        </p>
                        {isOverdue && (
                          <span className="badge badge-danger">逾期</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        借用人：{borrow.borrower} · {borrow.meetingRoom}
                      </p>
                      <p className="text-xs text-slate-400">
                        借用时间：{new Date(borrow.meetingTime).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        
        {selectedBorrow && selectedHeadset && (
          <>
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">设备测试</h2>
              
              <div className="space-y-3">
                {testItems.map((item) => {
                  const isPassed = tests[item.key];
                  const Icon = item.icon;
                  
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleTestToggle(item.key)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        isPassed
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-red-300 bg-red-50'
                      )}
                    >
                      <button
                        type="button"
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        )}
                      >
                        {isPassed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <XCircle className="w-6 h-6" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-slate-600" />
                          <p className={cn(
                            "font-medium",
                            isPassed ? 'text-emerald-700' : 'text-danger'
                          )}>
                            {item.label}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium",
                          isPassed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {isPassed ? '通过' : '异常'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="card">
              <label className="label">备注说明</label>
              <textarea
                className="input min-h-[100px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="如有异常情况请在此说明..."
              />
            </div>
            
            {!allTestsPassed && (
              <div className="card card-danger">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">检测到设备异常</p>
                    <p className="text-sm text-red-600">
                      系统将自动标记该设备为故障状态，并生成采购需求。请在备注中详细说明故障情况。
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                确认归还
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
