import { useState, useMemo } from 'react';
import { Search, CheckCircle, Phone, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { StatusTag } from '@/components/StatusTag';
import { formatDateTime, formatCurrency, getDaysOverdue, getHoursRemaining } from '@/utils/helpers';
import type { ReturnFormData } from '@/types';

export function Return() {
  const { records, bags, returnBag, refreshOverdueStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const activeRecords = useMemo(() => {
    refreshOverdueStatus();
    return records
      .filter(r => r.status === 'active' || r.status === 'overdue')
      .filter(record => {
        const bag = bags.find(b => b.id === record.bagId);
        return (
          record.riderName.includes(searchQuery) ||
          record.orderNo.includes(searchQuery) ||
          record.phone.includes(searchQuery) ||
          bag?.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => {
        const aOverdue = getDaysOverdue(a.expectedReturnTime);
        const bOverdue = getDaysOverdue(b.expectedReturnTime);
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        return bOverdue - aOverdue;
      });
  }, [records, bags, searchQuery, refreshOverdueStatus]);
  
  const handleReturn = (recordId: string) => {
    setSelectedRecord(recordId);
    setIsModalOpen(true);
  };
  
  const handleSubmit = (data: ReturnFormData) => {
    if (selectedRecord) {
      returnBag(selectedRecord, data);
      setIsModalOpen(false);
      setSelectedRecord(null);
    }
  };
  
  const currentRecord = records.find(r => r.id === selectedRecord);
  const currentBag = currentRecord ? bags.find(b => b.id === currentRecord.bagId) : null;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">归还管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {activeRecords.length} 个待归还
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索骑手/订单号/袋子编号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </div>
      
      {activeRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-50">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">全部已归还</h3>
          <p className="text-gray-400">目前没有待归还的保温袋</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {activeRecords.map(record => {
            const bag = bags.find(b => b.id === record.bagId);
            const isOverdue = record.status === 'overdue';
            const daysOverdue = getDaysOverdue(record.expectedReturnTime);
            const hoursLeft = getHoursRemaining(record.expectedReturnTime);
            
            return (
              <div
                key={record.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                  isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {bag?.photo && (
                      <img src={bag.photo} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{record.riderName}</h3>
                      <StatusTag type="borrow" status={record.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-400">袋子：</span>
                        <span className="text-gray-700">{bag?.code}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">容量：</span>
                        <span className="text-gray-700">{bag?.capacity}L</span>
                      </div>
                      <div>
                        <span className="text-gray-400">平台：</span>
                        <StatusTag type="platform" status={record.platform} size="sm" />
                      </div>
                      <div>
                        <span className="text-gray-400">押金：</span>
                        <span className="text-primary-600 font-medium">
                          {formatCurrency(bag?.deposit || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Phone className="w-4 h-4" />
                      <span>{record.phone}</span>
                    </div>
                    
                    {isOverdue ? (
                      <div className="flex items-center gap-1 text-red-500 text-sm mb-3">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">已超时 {daysOverdue} 天</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mb-3">
                        剩余 {hoursLeft} 小时
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      借出：{formatDateTime(record.borrowTime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      预计归还：{formatDateTime(record.expectedReturnTime)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleReturn(record.id)}
                    className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                  >
                    确认归还
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {currentRecord && currentBag && (
        <ReturnModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedRecord(null); }}
          onSubmit={handleSubmit}
          bagCode={currentBag.code}
          riderName={currentRecord.riderName}
        />
      )}
    </div>
  );
}

function ReturnModal({
  isOpen,
  onClose,
  onSubmit,
  bagCode,
  riderName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReturnFormData) => void;
  bagCode: string;
  riderName: string;
}) {
  const [formData, setFormData] = useState<ReturnFormData>({
    hasStain: false,
    hasDamage: false,
    zipperOk: true,
    hasPad: true,
    damageNote: '',
    depositRefunded: true,
  });
  
  const hasIssue = formData.hasStain || formData.hasDamage || !formData.zipperOk || !formData.hasPad;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="归还检查"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            袋子：<span className="font-semibold text-gray-800">{bagCode}</span>
          </p>
          <p className="text-sm text-gray-600">
            骑手：<span className="font-semibold text-gray-800">{riderName}</span>
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            状态检查
          </label>
          <div className="grid grid-cols-2 gap-3">
            <CheckItem
              label="有污渍"
              checked={formData.hasStain}
              onChange={(v) => setFormData(prev => ({ ...prev, hasStain: v }))}
              type="negative"
            />
            <CheckItem
              label="有破损"
              checked={formData.hasDamage}
              onChange={(v) => setFormData(prev => ({ ...prev, hasDamage: v }))}
              type="negative"
            />
            <CheckItem
              label="拉链正常"
              checked={formData.zipperOk}
              onChange={(v) => setFormData(prev => ({ ...prev, zipperOk: v }))}
              type="positive"
            />
            <CheckItem
              label="垫板齐全"
              checked={formData.hasPad}
              onChange={(v) => setFormData(prev => ({ ...prev, hasPad: v }))}
              type="positive"
            />
          </div>
        </div>
        
        {hasIssue && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              损坏备注
            </label>
            <textarea
              value={formData.damageNote}
              onChange={(e) => setFormData(prev => ({ ...prev, damageNote: e.target.value }))}
              placeholder="请描述损坏情况..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            押金退还
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, depositRefunded: true }))}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                formData.depositRefunded
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              已退还
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, depositRefunded: false }))}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                !formData.depositRefunded
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              未退还
            </button>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            确认归还
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
  type,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  type: 'positive' | 'negative';
}) {
  const baseClasses = type === 'positive'
    ? checked
      ? 'bg-green-500 text-white border-green-500'
      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
    : checked
      ? 'bg-red-500 text-white border-red-500'
      : 'bg-white text-gray-600 border-gray-200 hover:border-red-300';
  
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${baseClasses}`}
    >
      {label}
      {checked ? ' ✓' : ''}
    </button>
  );
}
