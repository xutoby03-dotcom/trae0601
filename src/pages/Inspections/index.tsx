import { useState, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Bell, CheckCircle, Trash2, MapPin, User, Ruler, Calendar, Flame } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { BUILDINGS, ITEM_TYPES, STATUS_FILTER_OPTIONS } from '@/constants';
import { filterInspections } from '@/utils/helpers';
import { formatDate } from '@/utils/date';
import { Inspection, ItemType, InspectionStatus } from '@/types';
import { cn } from '@/utils/helpers';

export default function Inspections() {
  const { inspections, addInspection, deleteInspection, markAsCleaned } = useInspectionStore();
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fireExitOnly, setFireExitOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredInspections = useMemo(() => {
    return filterInspections(inspections, {
      building: buildingFilter,
      status: statusFilter as InspectionStatus | 'all',
      itemType: itemTypeFilter,
      search: searchQuery,
      isFireExit: fireExitOnly ? true : undefined,
    });
  }, [inspections, buildingFilter, statusFilter, itemTypeFilter, searchQuery, fireExitOnly]);

  const [formData, setFormData] = useState({
    building: '1号楼',
    floor: '1层',
    location: '',
    itemType: '纸箱' as ItemType,
    area: 1,
    photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
    suspectedResident: '',
    isFireExit: false,
  });

  const handleAddInspection = () => {
    if (!formData.location || !formData.suspectedResident) {
      alert('请填写完整信息');
      return;
    }
    addInspection(formData);
    setShowAddModal(false);
    setFormData({
      building: '1号楼',
      floor: '1层',
      location: '',
      itemType: '纸箱',
      area: 1,
      photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
      suspectedResident: '',
      isFireExit: false,
    });
  };

  const handleViewDetail = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setShowDetailModal(true);
  };

  const handleMarkCleaned = (id: string) => {
    if (confirm('确认标记为已清理？')) {
      markAsCleaned(id);
      setShowDetailModal(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确认删除此记录？')) {
      deleteInspection(id);
      setShowDetailModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">巡查记录</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                共 {filteredInspections.length} 条记录
              </p>
            </div>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              新增巡查
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索位置、住户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部楼栋</option>
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部物品</option>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={fireExitOnly}
                onChange={(e) => setFireExitOnly(e.target.checked)}
                className="rounded text-red-500 focus:ring-red-500"
              />
              <span className="text-gray-700">仅消防通道</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInspections.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-500">
                <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无符合条件的记录</p>
              </div>
            ) : (
              filteredInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className={cn(
                    'bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group',
                    inspection.isFireExit ? 'border-red-300' : 'border-gray-200'
                  )}
                  onClick={() => handleViewDetail(inspection)}
                >
                  <div className="relative">
                    <img
                      src={inspection.photo}
                      alt={inspection.location}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge type="inspection" status={inspection.status} size="sm" />
                    </div>
                    {inspection.isFireExit && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-md">
                        <Flame className="w-3 h-3" />
                        消防通道
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {inspection.building} {inspection.floor}
                      </h4>
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(inspection);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{inspection.location}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">物品：</span>
                        <span>{inspection.itemType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">面积：</span>
                        <span>{inspection.area} ㎡</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">疑似住户：</span>
                        <span>{inspection.suspectedResident}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">创建：</span>
                        <span>{formatDate(inspection.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增巡查记录"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleAddInspection}>提交</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">楼栋</label>
              <select
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">楼层</label>
              <select
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['1层', '2层', '3层', '4层', '5层', '6层', '7层', '8层', '9层', '10层'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">具体位置</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="例如：东楼道拐角、电梯口西侧"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">物品类型</label>
              <select
                value={formData.itemType}
                onChange={(e) => setFormData({ ...formData, itemType: e.target.value as ItemType })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">占用面积 (㎡)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">疑似住户</label>
            <input
              type="text"
              value={formData.suspectedResident}
              onChange={(e) => setFormData({ ...formData, suspectedResident: e.target.value })}
              placeholder="住户姓名或门牌号"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFireExit}
              onChange={(e) => setFormData({ ...formData, isFireExit: e.target.checked })}
              className="w-4 h-4 rounded text-red-500 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">是否在消防通道内</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">现场照片</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📷</span>
              </div>
              <p className="text-sm text-gray-500">点击或拖拽上传照片</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal && selectedInspection !== null}
        onClose={() => setShowDetailModal(false)}
        title="巡查详情"
        size="lg"
        footer={
          selectedInspection && selectedInspection.status !== 'cleaned' ? (
            <>
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>关闭</Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => selectedInspection && handleDelete(selectedInspection.id)}
              >
                删除
              </Button>
              <Button
                variant="outline"
                leftIcon={<Bell className="w-4 h-4" />}
              >
                发起通知
              </Button>
              <Button
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={() => selectedInspection && handleMarkCleaned(selectedInspection.id)}
              >
                标记已清理
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowDetailModal(false)}>关闭</Button>
          )
        }
      >
        {selectedInspection && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={selectedInspection.photo}
                alt={selectedInspection.location}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">位置</p>
                  <p className="font-medium text-gray-800">
                    {selectedInspection.building} {selectedInspection.floor} {selectedInspection.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge type="inspection" status={selectedInspection.status} />
                  {selectedInspection.isFireExit && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      <Flame className="w-3 h-3" />
                      消防通道
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">物品类型</p>
                  <p className="text-gray-800">{selectedInspection.itemType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">占用面积</p>
                  <p className="text-gray-800">{selectedInspection.area} 平方米</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">疑似住户</p>
                <p className="font-medium text-gray-800">{selectedInspection.suspectedResident}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">创建时间</p>
                <p className="font-medium text-gray-800">{formatDate(selectedInspection.createdAt, 'yyyy-MM-dd HH:mm')}</p>
              </div>
            </div>

            {selectedInspection.cleanedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">已清理</span>
                </div>
                <p className="text-sm text-green-700">
                  清理时间：{formatDate(selectedInspection.cleanedAt, 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
            )}

            {selectedInspection.recheckCount && selectedInspection.recheckCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700">
                  已复查 <span className="font-semibold">{selectedInspection.recheckCount}</span> 次
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
