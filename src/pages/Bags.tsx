import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { StatusTag } from '@/components/StatusTag';
import { formatCurrency, formatDate, getDefaultBagPhoto } from '@/utils/helpers';
import type { Bag, BagFormData, BagStatus, InsulationStatus } from '@/types';

const statusFilters: Array<{ value: BagStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '可借' },
  { value: 'borrowed', label: '借出中' },
  { value: 'damaged', label: '损坏' },
  { value: 'lost', label: '丢失' },
];

const colorOptions = ['橙色', '绿色', '蓝色', '紫色', '黄色', '红色', '青色', '深灰'];
const capacityOptions = [22, 32, 48, 60];
const insulationOptions: Array<{ value: InsulationStatus; label: string }> = [
  { value: 'excellent', label: '优秀' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' },
  { value: 'poor', label: '较差' },
];

export function Bags() {
  const { bags, addBag, updateBag, deleteBag } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BagStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [selectedBag, setSelectedBag] = useState<Bag | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const filteredBags = useMemo(() => {
    return bags.filter(bag => {
      const matchesSearch = bag.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bag.color.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || bag.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bags, searchQuery, statusFilter]);
  
  const handleAdd = () => {
    setEditingBag(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (bag: Bag) => {
    setEditingBag(bag);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个保温袋吗？')) {
      deleteBag(id);
    }
  };
  
  const handleViewDetail = (bag: Bag) => {
    setSelectedBag(bag);
    setIsDetailOpen(true);
  };
  
  const handleSubmit = (data: BagFormData) => {
    if (editingBag) {
      updateBag(editingBag.id, data);
    } else {
      addBag(data);
    }
    setIsModalOpen(false);
    setEditingBag(null);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">保温袋档案</h2>
          <p className="text-sm text-gray-500 mt-1">共 {bags.length} 个保温袋</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-warm-sm hover:shadow-warm-md"
        >
          <Plus className="w-5 h-5" />
          新增袋子
        </button>
      </div>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索编号或颜色..."
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
      
      <div className="grid grid-cols-4 gap-5">
        {filteredBags.map((bag) => (
          <BagCard
            key={bag.id}
            bag={bag}
            onEdit={() => handleEdit(bag)}
            onDelete={() => handleDelete(bag.id)}
            onView={() => handleViewDetail(bag)}
          />
        ))}
      </div>
      
      {filteredBags.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500">没有找到匹配的保温袋</p>
        </div>
      )}
      
      <BagFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBag(null); }}
        onSubmit={handleSubmit}
        editingBag={editingBag}
      />
      
      {selectedBag && (
        <BagDetailDrawer
          isOpen={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedBag(null); }}
          bag={selectedBag}
        />
      )}
    </div>
  );
}

function BagCard({
  bag,
  onEdit,
  onDelete,
  onView,
}: {
  bag: Bag;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-50 group">
      <div className="relative h-40 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
        {bag.photo ? (
          <img src={bag.photo} alt={bag.code} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/40 flex items-center justify-center">
              <span className="text-3xl">🧊</span>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusTag type="bag" status={bag.status} />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={onView}
            className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50 transition-colors"
          >
            查看详情
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">{bag.code}</h3>
          <span className="text-sm text-primary-600 font-medium">{bag.capacity}L</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: bag.color }}
          />
          <span className="text-sm text-gray-500">{bag.color}</span>
          <span className="text-gray-300">·</span>
          <StatusTag type="insulation" status={bag.insulationStatus} size="sm" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-700">
            押金 {formatCurrency(bag.deposit)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
          <span>周转 {bag.turnoverCount} 次</span>
          <span>损坏 {bag.damageCount} 次</span>
        </div>
      </div>
    </div>
  );
}

function BagFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingBag,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BagFormData) => void;
  editingBag: Bag | null;
}) {
  const [formData, setFormData] = useState<BagFormData>({
    code: editingBag?.code || '',
    capacity: editingBag?.capacity || 32,
    color: editingBag?.color || '橙色',
    insulationStatus: editingBag?.insulationStatus || 'good',
    deposit: editingBag?.deposit || 80,
    photo: editingBag?.photo || '',
  });
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, photo: event.target?.result as string || '' }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photo) {
      formData.photo = getDefaultBagPhoto(formData.color);
    }
    onSubmit(formData);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBag ? '编辑保温袋' : '新增保温袋'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              袋子编号
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="如 BWD-001"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              容量 (L)
            </label>
            <select
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {capacityOptions.map(cap => (
                <option key={cap} value={cap}>{cap}L</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    formData.color === color
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              保温层状态
            </label>
            <div className="flex gap-2">
              {insulationOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, insulationStatus: opt.value }))}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm transition-all ${
                    formData.insulationStatus === opt.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            押金金额 (元)
          </label>
          <input
            type="number"
            value={formData.deposit}
            onChange={(e) => setFormData(prev => ({ ...prev, deposit: Number(e.target.value) }))}
            min="0"
            step="10"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            照片
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200">
              {formData.photo ? (
                <img src={formData.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📷</span>
              )}
            </div>
            <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors text-sm">
              上传照片
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
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
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            {editingBag ? '保存修改' : '确认添加'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BagDetailDrawer({
  isOpen,
  onClose,
  bag,
}: {
  isOpen: boolean;
  onClose: () => void;
  bag: Bag;
}) {
  const records = useAppStore(state => 
    state.records.filter(r => r.bagId === bag.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5)
  );
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-96 bg-white h-full shadow-2xl animate-slide-right overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">袋子详情</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden mb-6">
            {bag.photo ? (
              <img src={bag.photo} alt={bag.code} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🧊</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{bag.code}</h2>
              <StatusTag type="bag" status={bag.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="容量" value={`${bag.capacity}L`} />
              <InfoItem label="颜色" value={bag.color} />
              <InfoItem label="押金" value={formatCurrency(bag.deposit)} />
              <InfoItem label="保温层" value={
                bag.insulationStatus === 'excellent' ? '优秀' :
                bag.insulationStatus === 'good' ? '良好' :
                bag.insulationStatus === 'fair' ? '一般' : '较差'
              } />
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3">使用统计</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary-600">{bag.turnoverCount}</p>
                  <p className="text-xs text-gray-500 mt-1">周转次数</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{bag.damageCount}</p>
                  <p className="text-xs text-gray-500 mt-1">损坏次数</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3">最近记录</h4>
              {records.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">暂无记录</p>
              ) : (
                <div className="space-y-2">
                  {records.map(record => (
                    <div key={record.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{record.riderName}</p>
                        <p className="text-xs text-gray-400">{formatDate(record.borrowTime)}</p>
                      </div>
                      <StatusTag type="borrow" status={record.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
              <p>入库时间：{formatDate(bag.createdAt)}</p>
              <p>更新时间：{formatDate(bag.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-medium text-gray-700">{value}</p>
    </div>
  );
}
