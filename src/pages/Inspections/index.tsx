import { useState, useMemo, useRef, ChangeEvent } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Bell, CheckCircle, Trash2, MapPin, User, Ruler, Calendar, Flame, Upload, X, Image as ImageIcon } from 'lucide-react';
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

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop';

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
  const [showCleanupPhotoModal, setShowCleanupPhotoModal] = useState(false);
  const [cleanupPhotoUrl, setCleanupPhotoUrl] = useState('');
  const [cleanupPreviewError, setCleanupPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cleanupFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    building: '1号楼',
    floor: '1层',
    location: '',
    itemType: '纸箱' as ItemType,
    area: 1,
    photo: '',
    suspectedResident: '',
    isFireExit: false,
  });
  const [photoPreviewError, setPhotoPreviewError] = useState(false);

  const filteredInspections = useMemo(() => {
    return filterInspections(inspections, {
      building: buildingFilter,
      status: statusFilter as InspectionStatus | 'all',
      itemType: itemTypeFilter,
      search: searchQuery,
      isFireExit: fireExitOnly ? true : undefined,
    });
  }, [inspections, buildingFilter, statusFilter, itemTypeFilter, searchQuery, fireExitOnly]);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        setFormData({ ...formData, photo: dataUrl });
        setPhotoPreviewError(false);
      } catch {
        alert('读取图片失败，请重试');
      }
    }
  };

  const handleCleanupPhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        setCleanupPhotoUrl(dataUrl);
        setCleanupPreviewError(false);
      } catch {
        alert('读取图片失败，请重试');
      }
    }
  };

  const handleAddInspection = () => {
    if (!formData.location || !formData.suspectedResident) {
      alert('请填写完整信息');
      return;
    }
    if (!formData.photo) {
      alert('请上传现场照片');
      return;
    }
    addInspection(formData);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      building: '1号楼',
      floor: '1层',
      location: '',
      itemType: '纸箱',
      area: 1,
      photo: '',
      suspectedResident: '',
      isFireExit: false,
    });
    setPhotoPreviewError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleViewDetail = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setShowDetailModal(true);
  };

  const openCleanupPhotoModal = () => {
    setCleanupPhotoUrl('');
    setCleanupPreviewError(false);
    if (cleanupFileInputRef.current) cleanupFileInputRef.current.value = '';
    setShowCleanupPhotoModal(true);
  };

  const handleConfirmCleaned = () => {
    if (!cleanupPhotoUrl) {
      alert('请上传清理后的照片');
      return;
    }
    if (selectedInspection) {
      markAsCleaned(selectedInspection.id, cleanupPhotoUrl);
      setShowCleanupPhotoModal(false);
      setShowDetailModal(false);
      setCleanupPhotoUrl('');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确认删除此记录？')) {
      deleteInspection(id);
      setShowDetailModal(false);
    }
  };

  const displayPhoto = (photo: string, onErrorFlag: boolean) => {
    if (onErrorFlag) return DEFAULT_PHOTO;
    return photo || DEFAULT_PHOTO;
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
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { resetForm(); setShowAddModal(true); }}>
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
                      src={displayPhoto(inspection.photo, false)}
                      alt={inspection.location}
                      className="w-full h-40 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PHOTO; }}
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">现场照片 <span className="text-red-500">*</span></label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            {formData.photo ? (
              <div className="relative">
                <img
                  src={displayPhoto(formData.photo, photoPreviewError)}
                  alt="现场照片预览"
                  className="w-full h-56 object-cover rounded-lg border border-gray-200"
                  onError={() => setPhotoPreviewError(true)}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-md text-gray-600 hover:text-blue-600 transition-colors"
                    title="更换照片"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...formData, photo: '' }); setPhotoPreviewError(false); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-md text-gray-600 hover:text-red-600 transition-colors"
                    title="移除照片"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  已选择照片，可更换
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors">
                  <Upload className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">点击上传现场照片</p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
              </div>
            )}
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
                onClick={() => {
                  const w = window as any;
                  if (w.__navToNotifications && selectedInspection) {
                    w.__navToNotifications(selectedInspection.id);
                  } else {
                    window.location.hash = '#/notifications';
                  }
                }}
              >
                发起通知
              </Button>
              <Button
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={openCleanupPhotoModal}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  现场照片
                </p>
                <img
                  src={displayPhoto(selectedInspection.photo, false)}
                  alt={selectedInspection.location}
                  className="w-full h-56 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PHOTO; }}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">位置</p>
                  <p className="font-medium text-gray-800 text-lg">
                    {selectedInspection.building} {selectedInspection.floor} {selectedInspection.location}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge type="inspection" status={selectedInspection.status} />
                  {selectedInspection.isFireExit && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      <Flame className="w-3 h-3" />
                      消防通道
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">物品类型</p>
                    <p className="text-gray-800 font-medium">{selectedInspection.itemType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">占用面积</p>
                    <p className="text-gray-800 font-medium">{selectedInspection.area} 平方米</p>
                  </div>
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

            {selectedInspection.cleanedPhoto && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">已清理归档</span>
                  {selectedInspection.cleanedAt && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      {formatDate(selectedInspection.cleanedAt, 'yyyy-MM-dd HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-green-700 mb-2">清理后现场照片：</p>
                <img
                  src={selectedInspection.cleanedPhoto}
                  alt="清理后照片"
                  className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-green-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
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

      <Modal
        isOpen={showCleanupPhotoModal}
        onClose={() => setShowCleanupPhotoModal(false)}
        title="确认清理 - 上传清理后照片"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCleanupPhotoModal(false)}>取消</Button>
            <Button leftIcon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirmCleaned}>
              确认已清理
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>请确认：</strong>现场杂物已清理完毕，上传清理后的照片作为归档凭证。
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">清理后照片 <span className="text-red-500">*</span></label>
            <input
              ref={cleanupFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCleanupPhotoSelect}
            />
            {cleanupPhotoUrl ? (
              <div className="relative">
                <img
                  src={cleanupPreviewError ? DEFAULT_PHOTO : cleanupPhotoUrl}
                  alt="清理后照片预览"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  onError={() => setCleanupPreviewError(true)}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => cleanupFileInputRef.current?.click()}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-md text-gray-600 hover:text-blue-600 transition-colors"
                    title="更换照片"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCleanupPhotoUrl(''); setCleanupPreviewError(false); if (cleanupFileInputRef.current) cleanupFileInputRef.current.value = ''; }}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-md text-gray-600 hover:text-red-600 transition-colors"
                    title="移除照片"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => cleanupFileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-green-100 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors">
                  <Upload className="w-7 h-7 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 group-hover:text-green-600 font-medium">点击上传清理后照片</p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
