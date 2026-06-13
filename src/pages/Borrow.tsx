import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Phone, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { StatusTag } from '@/components/StatusTag';
import { formatDateTime, formatCurrency, getHoursRemaining, getDaysOverdue } from '@/utils/helpers';
import type { BorrowStatus, BorrowFormData, Platform } from '@/types';

const statusFilters: Array<{ value: BorrowStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'overdue', label: '已超时' },
  { value: 'returned', label: '已归还' },
  { value: 'lost', label: '已丢失' },
];

const platformOptions: Array<{ value: Platform; label: string }> = [
  { value: 'meituan', label: '美团' },
  { value: 'eleme', label: '饿了么' },
  { value: 'douyin', label: '抖音' },
  { value: 'other', label: '其他' },
];

export function Borrow() {
  const { records, bags, addBorrow, refreshOverdueStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    refreshOverdueStatus();
  }, [refreshOverdueStatus]);
  
  const availableBags = useMemo(() => 
    bags.filter(b => b.status === 'available'),
    [bags]
  );
  
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        const bag = bags.find(b => b.id === record.bagId);
        const matchesSearch = 
          record.riderName.includes(searchQuery) ||
          record.orderNo.includes(searchQuery) ||
          record.phone.includes(searchQuery) ||
          bag?.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [records, bags, searchQuery, statusFilter]);
  
  const handleSubmit = (data: BorrowFormData) => {
    addBorrow(data);
    setIsModalOpen(false);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">借出记录</h2>
          <p className="text-sm text-gray-500 mt-1">共 {records.length} 条记录</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={availableBags.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-warm-sm hover:shadow-warm-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          新增借出
        </button>
      </div>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索骑手/订单号/袋子编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === filter.value
                    ? 'bg-primary-500 text-white shadow-warm-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">袋子</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">骑手信息</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">平台</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">订单号</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">借出时间</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">预计归还</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">押金</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无记录</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const bag = bags.find(b => b.id === record.bagId);
                const isOverdue = record.status === 'overdue';
                const hoursLeft = getHoursRemaining(record.expectedReturnTime);
                const daysOverdue = getDaysOverdue(record.expectedReturnTime);
                
                return (
                  <tr key={record.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {bag?.photo && (
                            <img src={bag.photo} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{bag?.code}</p>
                          <p className="text-xs text-gray-400">{bag?.capacity}L</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{record.riderName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {record.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusTag type="platform" status={record.platform} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 font-mono">{record.orderNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDateTime(record.borrowTime)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm text-gray-600">{formatDateTime(record.expectedReturnTime)}</span>
                        {record.status === 'active' && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            剩余 {hoursLeft} 小时
                          </p>
                        )}
                        {isOverdue && (
                          <p className="text-xs text-red-500 mt-0.5 font-medium">
                            超时 {daysOverdue} 天
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(bag?.deposit || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusTag type="borrow" status={record.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <BorrowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        availableBags={availableBags}
      />
    </div>
  );
}

function BorrowModal({
  isOpen,
  onClose,
  onSubmit,
  availableBags,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BorrowFormData) => void;
  availableBags: Array<{ id: string; code: string; capacity: number; deposit: number; photo: string }>;
}) {
  const [formData, setFormData] = useState<BorrowFormData>({
    bagId: availableBags[0]?.id || '',
    riderName: '',
    platform: 'meituan',
    phone: '',
    orderNo: '',
    expectedReturnTime: '',
  });
  
  const selectedBag = availableBags.find(b => b.id === formData.bagId);
  
  const getDefaultReturnTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 4);
    return date.toISOString().slice(0, 16);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedTime = formData.expectedReturnTime 
      ? new Date(formData.expectedReturnTime).toISOString()
      : getDefaultReturnTime();
    onSubmit({
      ...formData,
      expectedReturnTime: expectedTime,
    });
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="新增借出"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择保温袋
          </label>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl">
            {availableBags.map(bag => (
              <button
                key={bag.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bagId: bag.id }))}
                className={`p-2 rounded-lg text-center transition-all ${
                  formData.bagId === bag.id
                    ? 'bg-primary-500 text-white shadow-warm-sm'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-1 bg-gray-100">
                  <img src={bag.photo} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium truncate">{bag.code}</p>
                <p className="text-xs opacity-70">{bag.capacity}L</p>
              </button>
            ))}
          </div>
          {selectedBag && (
            <p className="mt-2 text-sm text-gray-500">
              押金：<span className="font-medium text-primary-600">{formatCurrency(selectedBag.deposit)}</span>
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              骑手姓名
            </label>
            <input
              type="text"
              value={formData.riderName}
              onChange={(e) => setFormData(prev => ({ ...prev, riderName: e.target.value }))}
              placeholder="请输入姓名"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              手机号
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="请输入手机号"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            平台
          </label>
          <div className="flex gap-2">
            {platformOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, platform: opt.value }))}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  formData.platform === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            订单号
          </label>
          <input
            type="text"
            value={formData.orderNo}
            onChange={(e) => setFormData(prev => ({ ...prev, orderNo: e.target.value }))}
            placeholder="请输入订单号"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            预计归还时间
          </label>
          <input
            type="datetime-local"
            value={formData.expectedReturnTime}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnTime: e.target.value }))}
            defaultValue={getDefaultReturnTime()}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
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
            disabled={!formData.bagId}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            确认借出
          </button>
        </div>
      </form>
    </Modal>
  );
}
