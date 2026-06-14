import { useState, useMemo, useRef, ChangeEvent } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  FileText,
  Flame,
  Bell,
  Upload,
  X,
  CheckSquare,
  Square,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { formatDate, addDaysFromNow } from '@/utils/date';
import { Inspection, NotificationMethod } from '@/types';
import { BUILDINGS, NOTIFICATION_METHODS } from '@/constants';
import { cn } from '@/utils/helpers';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop';

export default function Recheck() {
  const { inspections, notifications, addRecheckRecord, markAsCleaned, addNotification } = useInspectionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [fireExitOnly, setFireExitOnly] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [recheckResult, setRecheckResult] = useState('');
  const [needsSecondNotice, setNeedsSecondNotice] = useState(true);
  const [remark, setRemark] = useState('');
  const [showCleanupPhotoModal, setShowCleanupPhotoModal] = useState(false);
  const [cleanupPhotoUrl, setCleanupPhotoUrl] = useState('');
  const cleanupFileInputRef = useRef<HTMLInputElement>(null);
  const [cleanupPreviewError, setCleanupPreviewError] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMethod, setBatchMethod] = useState<NotificationMethod>('告示');
  const [batchDeadlineDays, setBatchDeadlineDays] = useState(3);
  const [batchContact, setBatchContact] = useState('物业前台');
  const [batchPhone, setBatchPhone] = useState('');

  const getLatestNotification = (inspectionId: string) => {
    const related = notifications.filter((n) => n.inspectionId === inspectionId);
    if (related.length === 0) return null;
    return related.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  const overdueInspections = useMemo(() => {
    return inspections.filter((i) => i.status === 'overdue' || i.status === 'recheck');
  }, [inspections]);

  const filteredList = useMemo(() => {
    return overdueInspections.filter((i) => {
      if (buildingFilter !== 'all' && i.building !== buildingFilter) return false;
      if (fireExitOnly && !i.isFireExit) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          i.location.toLowerCase().includes(query) ||
          i.suspectedResident.toLowerCase().includes(query) ||
          i.building.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [overdueInspections, buildingFilter, fireExitOnly, searchQuery]);

  const allSelected = filteredList.length > 0 && filteredList.every((i) => selectedIds.has(i.id));
  const someSelected = filteredList.some((i) => selectedIds.has(i.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map((i) => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const openBatchModal = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要通知的记录');
      return;
    }
    setBatchMethod('告示');
    setBatchDeadlineDays(3);
    setBatchContact('物业前台');
    setBatchPhone('');
    setShowBatchModal(true);
  };

  const handleBatchSubmit = () => {
    if (!batchContact) {
      alert('请填写联系人');
      return;
    }
    const deadline = addDaysFromNow(batchDeadlineDays);
    const idArray = Array.from(selectedIds);
    idArray.forEach((id) => {
      addNotification(id, {
        method: batchMethod,
        deadline,
        contactPerson: batchContact,
        contactPhone: batchPhone,
      });
    });
    setShowBatchModal(false);
    setSelectedIds(new Set());
    alert(`已成功为 ${idArray.length} 条记录发起二次通知`);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

  const handleRecheck = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setRecheckResult('');
    setNeedsSecondNotice(true);
    setRemark('');
    setShowRecheckModal(true);
  };

  const handleSubmitRecheck = () => {
    if (!selectedInspection || !recheckResult) {
      alert('请填写复查结果');
      return;
    }
    addRecheckRecord(selectedInspection.id, {
      result: recheckResult,
      needsSecondNotice,
      remark,
    });
    setShowRecheckModal(false);
    setSelectedInspection(null);
  };

  const handleMarkCleaned = (inspection: Inspection) => {
    setSelectedInspection(inspection);
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
      setCleanupPhotoUrl('');
      setSelectedInspection(null);
    }
  };

  const stats = useMemo(() => ({
    total: overdueInspections.length,
    fireExit: overdueInspections.filter((i) => i.isFireExit).length,
    recheckMultiple: overdueInspections.filter((i) => (i.recheckCount || 0) >= 2).length,
  }), [overdueInspections]);

  const methodIcon = (method: NotificationMethod) => {
    switch (method) {
      case '电话': return <Phone className="w-3.5 h-3.5" />;
      case '微信': return <MessageSquare className="w-3.5 h-3.5" />;
      case '告示': return <Mail className="w-3.5 h-3.5" />;
      case '上门': return <User className="w-3.5 h-3.5" />;
      default: return <Bell className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">待复查总数</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">消防通道</p>
                <p className="text-2xl font-bold text-gray-800">{stats.fireExit}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">多次复查</p>
                <p className="text-2xl font-bold text-gray-800">{stats.recheckMultiple}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">复查列表</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                超过通知期限未清理的记录 · 共 {filteredList.length} 条
                {selectedIds.size > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">已选 {selectedIds.size} 条</span>
                )}
              </p>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  leftIcon={<Bell className="w-4 h-4" />}
                  onClick={openBatchModal}
                >
                  批量二次通知 ({selectedIds.size})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  取消选择
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索位置、住户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="all">全部楼栋</option>
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <label className={cn(
              'flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors',
              fireExitOnly
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            )}>
              <input
                type="checkbox"
                checked={fireExitOnly}
                onChange={(e) => setFireExitOnly(e.target.checked)}
                className="rounded text-red-500 focus:ring-red-500"
              />
              <Flame className="w-4 h-4" />
              <span>仅消防通道</span>
            </label>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                ) : someSelected ? (
                  <div className="w-4 h-4 border-2 border-blue-500 bg-blue-500 rounded-sm relative">
                    <div className="absolute inset-0.5 bg-white" style={{ clipPath: 'inset(0 0 50% 0)' }} />
                  </div>
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                <span>全选当前页</span>
              </button>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-300" />
              <p className="text-lg font-medium text-gray-700">太棒了！</p>
              <p className="text-sm text-gray-500 mt-1">暂无超期未清理的记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map((inspection) => {
                const latestNotice = getLatestNotification(inspection.id);
                const isSelected = selectedIds.has(inspection.id);

                return (
                  <div
                    key={inspection.id}
                    className={cn(
                      'border rounded-xl p-4 transition-all relative group',
                      isSelected
                        ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-200'
                        : inspection.isFireExit
                        ? 'border-red-300 bg-red-50/30 hover:border-red-400'
                        : 'border-amber-200 bg-amber-50/30 hover:border-amber-400'
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div
                        className="absolute top-3 left-3 z-10 cursor-pointer"
                        onClick={() => toggleSelect(inspection.id)}
                        title={isSelected ? '取消选择' : '选择'}
                      >
                        {isSelected ? (
                          <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-md bg-white/90 group-hover:border-blue-400 transition-colors" />
                        )}
                      </div>

                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={inspection.photo || DEFAULT_PHOTO}
                          alt={inspection.location}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PHOTO; }}
                        />
                        {inspection.isFireExit && (
                          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1 bg-red-600/90 text-white text-[10px] font-medium py-0.5 rounded">
                            <Flame className="w-3 h-3" />
                            消防通道
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 ml-0 md:ml-2">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-gray-800">
                            {inspection.building} {inspection.floor} {inspection.location}
                          </h4>
                          <StatusBadge type="inspection" status={inspection.status} size="sm" />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{inspection.itemType}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{inspection.suspectedResident}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <RotateCcw className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                            <span className="font-medium text-purple-700">
                              已复查 {inspection.recheckCount || 0} 次
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">创建 {formatDate(inspection.createdAt, 'MM-dd')}</span>
                          </div>
                        </div>

                        {latestNotice && (
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {methodIcon(latestNotice.method)}
                              <span className="font-medium">{latestNotice.method}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>最近通知：{formatDate(latestNotice.createdAt, 'MM-dd HH:mm')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <User className="w-3 h-3" />
                              <span>联系人：{latestNotice.contactPerson}</span>
                            </div>
                            <div className={cn(
                              'flex items-center gap-1 font-medium',
                              latestNotice.deadline && new Date(latestNotice.deadline) < new Date()
                                ? 'text-red-600'
                                : 'text-amber-600'
                            )}>
                              <AlertTriangle className="w-3 h-3" />
                              <span>
                                {latestNotice.deadline && new Date(latestNotice.deadline) < new Date()
                                  ? `已超期 (期限 ${formatDate(latestNotice.deadline, 'MM-dd')})`
                                  : `期限 ${formatDate(latestNotice.deadline || '', 'MM-dd')}`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 flex-shrink-0 md:flex-col md:items-stretch">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleMarkCleaned(inspection)}
                        >
                          已清理
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<FileText className="w-4 h-4" />}
                          onClick={() => handleRecheck(inspection)}
                        >
                          复查记录
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={showRecheckModal && selectedInspection !== null}
        onClose={() => setShowRecheckModal(false)}
        title="复查记录"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRecheckModal(false)}>取消</Button>
            <Button onClick={handleSubmitRecheck}>保存</Button>
          </>
        }
      >
        {selectedInspection && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedInspection.photo || DEFAULT_PHOTO}
                  alt={selectedInspection.location}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PHOTO; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800">
                    {selectedInspection.building} {selectedInspection.floor} {selectedInspection.location}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    物品：{selectedInspection.itemType} · {selectedInspection.area}㎡
                  </p>
                  <p className="text-sm text-gray-500">
                    疑似住户：{selectedInspection.suspectedResident}
                  </p>
                  <p className="text-sm text-gray-500">
                    已复查：{selectedInspection.recheckCount || 0} 次
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">复查结果</label>
              <textarea
                value={recheckResult}
                onChange={(e) => setRecheckResult(e.target.value)}
                placeholder="请描述复查现场情况..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsSecondNotice}
                onChange={(e) => setNeedsSecondNotice(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">需要发起二次通知</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="其他需要记录的信息..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
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

      <Modal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title="批量发起二次通知"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowBatchModal(false)}>取消</Button>
            <Button leftIcon={<Bell className="w-4 h-4" />} onClick={handleBatchSubmit}>
              确认通知 ({selectedIds.size} 条)
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              将为 <strong className="text-blue-900">{selectedIds.size}</strong> 条记录统一发起二次通知，
              通知方式和期限设置相同。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">通知方式</label>
            <div className="grid grid-cols-3 gap-2">
              {NOTIFICATION_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setBatchMethod(method as NotificationMethod)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm font-medium transition-all',
                    batchMethod === method
                      ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-200'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                  )}
                >
                  {methodIcon(method as NotificationMethod)}
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">清理期限</label>
            <div className="flex items-center gap-3">
              <select
                value={batchDeadlineDays}
                onChange={(e) => setBatchDeadlineDays(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={1}>1 天内</option>
                <option value={2}>2 天内</option>
                <option value={3}>3 天内</option>
                <option value={5}>5 天内</option>
                <option value={7}>7 天内</option>
              </select>
              <span className="text-sm text-gray-500">
                截止至 {formatDate(addDaysFromNow(batchDeadlineDays), 'MM月dd日')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">联系人</label>
              <input
                type="text"
                value={batchContact}
                onChange={(e) => setBatchContact(e.target.value)}
                placeholder="如：物业前台"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
              <input
                type="text"
                value={batchPhone}
                onChange={(e) => setBatchPhone(e.target.value)}
                placeholder="选填"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
