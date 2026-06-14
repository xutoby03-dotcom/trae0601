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
} from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/utils/date';
import { Inspection } from '@/types';
import { cn } from '@/utils/helpers';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop';

export default function Recheck() {
  const { inspections, addRecheckRecord, markAsCleaned, addNotification } = useInspectionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [recheckResult, setRecheckResult] = useState('');
  const [needsSecondNotice, setNeedsSecondNotice] = useState(true);
  const [remark, setRemark] = useState('');
  const [showCleanupPhotoModal, setShowCleanupPhotoModal] = useState(false);
  const [cleanupPhotoUrl, setCleanupPhotoUrl] = useState('');
  const cleanupFileInputRef = useRef<HTMLInputElement>(null);
  const [cleanupPreviewError, setCleanupPreviewError] = useState(false);

  const overdueInspections = useMemo(() => {
    return inspections.filter((i) => i.status === 'overdue' || i.status === 'recheck');
  }, [inspections]);

  const filteredList = useMemo(() => {
    return overdueInspections.filter((i) => {
      if (buildingFilter !== 'all' && i.building !== buildingFilter) return false;
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
  }, [overdueInspections, buildingFilter, searchQuery]);

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
                超过通知期限未清理的记录
              </p>
            </div>
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
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="all">全部楼栋</option>
              {['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-300" />
              <p className="text-lg font-medium text-gray-700">太棒了！</p>
              <p className="text-sm text-gray-500 mt-1">暂无超期未清理的记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map((inspection) => (
                <div
                  key={inspection.id}
                  className={cn(
                    'border rounded-xl p-5 transition-all',
                    inspection.isFireExit
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-amber-200 bg-amber-50/30'
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img
                      src={inspection.photo}
                      alt={inspection.location}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {inspection.building} {inspection.floor} {inspection.location}
                        </h4>
                        {inspection.isFireExit && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            <Flame className="w-3 h-3" />
                            消防通道
                          </span>
                        )}
                        <StatusBadge type="inspection" status={inspection.status} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{inspection.itemType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{inspection.suspectedResident}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(inspection.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <RotateCcw className="w-4 h-4 text-gray-400" />
                          <span>已复查 {inspection.recheckCount || 0} 次</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
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
              ))}
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
                  src={selectedInspection.photo}
                  alt={selectedInspection.location}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
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
    </div>
  );
}
