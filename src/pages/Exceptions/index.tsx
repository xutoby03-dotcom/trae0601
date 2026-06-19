import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Eye,
  Upload,
  Image as ImageIcon,
  X,
  AlertTriangle,
  Layers,
  Ban,
  MapPin,
  Clock,
  CheckCircle,
  Loader,
  AlertCircle,
  FileWarning,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { useExceptionStore } from '../../store/useExceptionStore';
import { usePosterStore } from '../../store/usePosterStore';
import { formatDateTime } from '../../utils/date';
import type { Exception, ExceptionType, ExceptionStatus } from '../../types';
import {
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_TYPES,
} from '../../types';

const exceptionTypeIcons: Record<ExceptionType, React.ElementType> = {
  damaged: AlertTriangle,
  covered: Layers,
  unauthorized: Ban,
  wrong_position: MapPin,
  expired_not_removed: Clock,
};

const exceptionTypeColors: Record<ExceptionType, 'danger' | 'warning' | 'secondary' | 'info' | 'primary'> = {
  damaged: 'danger',
  covered: 'warning',
  unauthorized: 'secondary',
  wrong_position: 'info',
  expired_not_removed: 'danger',
};

export default function Exceptions() {
  const exceptions = useExceptionStore((state) => state.exceptions);
  const addException = useExceptionStore((state) => state.addException);
  const updateStatus = useExceptionStore((state) => state.updateStatus);
  const posters = usePosterStore((state) => state.posters);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ExceptionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ExceptionStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedException, setSelectedException] = useState<Exception | null>(null);

  const [formData, setFormData] = useState({
    type: 'damaged' as ExceptionType,
    description: '',
    location: '',
    photoUrl: '',
    reporter: '',
    relatedPosterId: '' as string | undefined,
  });

  const stats = useMemo(() => {
    const total = exceptions.length;
    const pending = exceptions.filter((e) => e.status === 'pending').length;
    const processing = exceptions.filter((e) => e.status === 'processing').length;
    const resolved = exceptions.filter((e) => e.status === 'resolved').length;

    const typeStats = EXCEPTION_TYPES.map(({ value }) => ({
      type: value,
      count: exceptions.filter((e) => e.type === value).length,
    }));

    return { total, pending, processing, resolved, typeStats };
  }, [exceptions]);

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exception) => {
      const matchesSearch =
        exception.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exception.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exception.reporter.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || exception.type === filterType;
      const matchesStatus = filterStatus === 'all' || exception.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [exceptions, searchTerm, filterType, filterStatus]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomImage = () => {
    const typeLabel = encodeURIComponent(EXCEPTION_TYPE_LABELS[formData.type]);
    const location = encodeURIComponent(formData.location || 'bulletin board');
    const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${typeLabel}%20${location}%20school%20poster%20problem&image_size=landscape_4_3`;
    setFormData((prev) => ({ ...prev, photoUrl: imageUrl }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.location || !formData.reporter) {
      alert('请填写所有必填项');
      return;
    }

    addException({
      type: formData.type,
      description: formData.description,
      location: formData.location,
      photoUrl: formData.photoUrl || undefined,
      reporter: formData.reporter,
      relatedPosterId: formData.relatedPosterId || undefined,
    });

    setShowAddModal(false);
    setFormData({
      type: 'damaged',
      description: '',
      location: '',
      photoUrl: '',
      reporter: '',
      relatedPosterId: '',
    });
  };

  const handleStatusUpdate = (id: string, status: ExceptionStatus) => {
    updateStatus(id, status);
    if (selectedException?.id === id) {
      setSelectedException((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleViewDetail = (exception: Exception) => {
    setSelectedException(exception);
    setShowDetailModal(true);
  };

  const getRelatedPoster = (posterId?: string) => {
    if (!posterId) return null;
    return posters.find((p) => p.id === posterId);
  };

  const resetForm = () => {
    setFormData({
      type: 'damaged',
      description: '',
      location: '',
      photoUrl: '',
      reporter: '',
      relatedPosterId: '',
    });
    setShowAddModal(false);
  };

  return (
    <div>
      <PageHeader
        title="异常管理"
        description="管理海报张贴异常记录，跟踪处理进度"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            上报异常
          </button>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="异常总数"
          value={stats.total}
          icon={FileWarning}
          color="primary"
        />
        <StatCard
          title="待处理"
          value={stats.pending}
          icon={AlertCircle}
          color="danger"
        />
        <StatCard
          title="处理中"
          value={stats.processing}
          icon={Loader}
          color="warning"
        />
        <StatCard
          title="已解决"
          value={stats.resolved}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* 各类型统计 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.typeStats.map(({ type, count }) => {
          const Icon = exceptionTypeIcons[type];
          return (
            <div
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`bg-white rounded-xl shadow-card p-4 cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${
                filterType === type ? 'ring-2 ring-primary-500 ring-offset-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    exceptionTypeColors[type] === 'danger'
                      ? 'bg-red-100'
                      : exceptionTypeColors[type] === 'warning'
                      ? 'bg-amber-100'
                      : exceptionTypeColors[type] === 'info'
                      ? 'bg-blue-100'
                      : 'bg-secondary-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      exceptionTypeColors[type] === 'danger'
                        ? 'text-red-600'
                        : exceptionTypeColors[type] === 'warning'
                        ? 'text-amber-600'
                        : exceptionTypeColors[type] === 'info'
                        ? 'text-blue-600'
                        : 'text-secondary-600'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{EXCEPTION_TYPE_LABELS[type]}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索描述、位置、上报人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ExceptionType | 'all')}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部类型</option>
            {EXCEPTION_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ExceptionStatus | 'all')}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            {Object.entries(EXCEPTION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 异常列表 */}
      <div className="space-y-4">
        {filteredExceptions.map((exception, index) => {
          const TypeIcon = exceptionTypeIcons[exception.type];
          const relatedPoster = getRelatedPoster(exception.relatedPosterId);

          return (
            <div
              key={exception.id}
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-scale-in group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      exceptionTypeColors[exception.type] === 'danger'
                        ? 'bg-red-100'
                        : exceptionTypeColors[exception.type] === 'warning'
                        ? 'bg-amber-100'
                        : exceptionTypeColors[exception.type] === 'info'
                        ? 'bg-blue-100'
                        : 'bg-secondary-100'
                    }`}
                  >
                    <TypeIcon
                      className={`w-6 h-6 ${
                        exceptionTypeColors[exception.type] === 'danger'
                          ? 'text-red-600'
                          : exceptionTypeColors[exception.type] === 'warning'
                          ? 'text-amber-600'
                          : exceptionTypeColors[exception.type] === 'info'
                          ? 'text-blue-600'
                          : 'text-secondary-600'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={exception.type} type="exceptionType" />
                      <StatusBadge status={exception.status} type="exception" />
                      {relatedPoster && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          关联: {relatedPoster.activityName}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-900 font-medium mb-2">{exception.description}</p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {exception.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 flex items-center justify-center text-xs">👤</span>
                        {exception.reporter}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(exception.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:gap-3">
                    <button
                      onClick={() => handleViewDetail(exception)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>

                    {exception.status !== 'resolved' && (
                      <div className="flex gap-2">
                        {exception.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(exception.id, 'processing')}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-medium transition-colors"
                          >
                            <Loader className="w-4 h-4" />
                            开始处理
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusUpdate(exception.id, 'resolved')}
                          className="flex items-center gap-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          标记解决
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExceptions.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg">没有找到匹配的异常记录</p>
          <p className="text-gray-400 text-sm mt-1">尝试调整搜索条件或筛选器</p>
        </div>
      )}

      {/* 新增异常模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">上报异常</h2>
              <button
                onClick={resetForm}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      异常类型 <span className="text-danger">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, type: e.target.value as ExceptionType }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      {EXCEPTION_TYPES.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      位置 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="如：一教公告栏A区第3栏"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述 <span className="text-danger">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="请详细描述异常情况..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      上报人 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.reporter}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, reporter: e.target.value }))
                      }
                      placeholder="请输入上报人姓名"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      关联海报（可选）
                    </label>
                    <select
                      value={formData.relatedPosterId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          relatedPosterId: e.target.value || undefined,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="">不关联海报</option>
                      {posters.map((poster) => (
                        <option key={poster.id} value={poster.id}>
                          {poster.activityName} - {poster.approvalNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      照片凭证
                    </label>
                    {formData.photoUrl ? (
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={formData.photoUrl}
                          alt="异常照片预览"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
                          className="absolute top-2 right-2 bg-danger text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:border-primary-400 transition-colors">
                        <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-400 text-sm">暂无照片</p>
                      </div>
                    )}

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700 font-medium">上传照片</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={generateRandomImage}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-600 rounded-xl transition-colors"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-medium">生成示例照片</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-3">
                      支持 JPG、PNG 格式，建议清晰拍摄异常部位
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  提交上报
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {showDetailModal && selectedException && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">异常详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <StatusBadge status={selectedException.type} type="exceptionType" />
                <StatusBadge status={selectedException.status} type="exception" />
              </div>

              {selectedException.photoUrl && (
                <div className="mb-6 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={selectedException.photoUrl}
                    alt="异常照片"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">异常描述</p>
                  <p className="text-gray-900">{selectedException.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">位置</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedException.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">上报人</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center text-xs">👤</span>
                      {selectedException.reporter}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">上报时间</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDateTime(selectedException.createdAt)}
                    </p>
                  </div>

                  {selectedException.resolvedAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">解决时间</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        {formatDateTime(selectedException.resolvedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedException.relatedPosterId && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-600 mb-1">关联海报</p>
                    {(() => {
                      const poster = getRelatedPoster(selectedException.relatedPosterId);
                      return poster ? (
                        <div>
                          <p className="font-medium text-blue-900">{poster.activityName}</p>
                          <p className="text-sm text-blue-700">
                            {poster.club} · {poster.approvalNumber}
                          </p>
                        </div>
                      ) : (
                        <p className="text-blue-700">海报ID: {selectedException.relatedPosterId}</p>
                      );
                    })()}
                  </div>
                )}
              </div>

              {selectedException.status !== 'resolved' && (
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  {selectedException.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedException.id, 'processing');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-colors"
                    >
                      <Loader className="w-5 h-5" />
                      开始处理
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedException.id, 'resolved');
                      setShowDetailModal(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-medium transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    标记已解决
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
