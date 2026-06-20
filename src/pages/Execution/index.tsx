import { useState, useMemo, useRef } from 'react';
import {
  Camera,
  Check,
  MapPin,
  Package,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  Upload,
  RefreshCw,
  Clock,
  Image,
  History,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Empty from '../../components/Empty';
import { usePostingStore } from '../../store/usePostingStore';
import { useApplicationStore } from '../../store/useApplicationStore';
import { usePosterStore } from '../../store/usePosterStore';
import { useBulletinBoardStore } from '../../store/useBulletinBoardStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { formatDateTime } from '../../utils/date';
import { EXCEPTION_TYPES } from '../../types';
import type {
  PostingItem,
  Application,
  Poster,
  BulletinBoard,
  ExceptionType,
} from '../../types';

interface PostingGroup {
  application: Application;
  poster: Poster | undefined;
  items: PostingItem[];
  totalQuantity: number;
  pendingCount: number;
  postedCount: number;
}

interface PhotoModalProps {
  item: PostingItem;
  board: BulletinBoard | undefined;
  poster: Poster | undefined;
  onClose: () => void;
  onConfirm: (photoUrl: string) => void;
}

function PhotoModal({ item, board, poster, onClose, onConfirm }: PhotoModalProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGeneratePhoto = async () => {
    setIsGenerating(true);
    const location = board?.location || board?.name || 'bulletin board';
    const activity = poster?.activityName || 'poster';
    const prompt = encodeURIComponent(
      `realistic photo of ${location} with ${activity} poster posted on wall, school campus, natural lighting, clear view`
    );
    const generatedUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=landscape_4_3`;
    
    setTimeout(() => {
      setPhotoUrl(generatedUrl);
      setIsGenerating(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (photoUrl) {
      onConfirm(photoUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">张贴确认</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <p className="text-sm font-medium text-gray-500 mb-2">海报图片</p>
              {poster && (
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={poster.imageUrl}
                    alt={poster.activityName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-1">
                  {poster?.activityName || '未知活动'}
                </h4>
                <p className="text-sm text-gray-500">{poster?.club || '未知社团'}</p>
                <p className="text-xs text-primary-600 font-mono mt-1">
                  {poster?.approvalNumber || ''}
                </p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <p className="text-sm font-medium text-gray-500 mb-2">张贴详情</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{board?.name || '未知公告栏'}</p>
                    <p className="text-sm text-gray-500">{board?.location || '未知位置'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">张贴数量</p>
                      <p className="font-bold text-gray-900 text-xl">{item.quantity} 张</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">置顶位置</p>
                      <p className="font-bold text-gray-900 text-xl">
                        {item.needTop ? '是' : '否'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-gray-700">现场照片</p>
            {photoUrl ? (
              <div className="relative group">
              <img
                src={photoUrl}
                alt="现场照片"
                className="w-full h-64 object-cover rounded-xl shadow"
              />
              <button
                onClick={() => setPhotoUrl('')}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">请上传或生成现场照片</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    上传照片
                  </button>
                  <button
                    onClick={handleGeneratePhoto}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        模拟拍照
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!photoUrl}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              确认张贴完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PhotoPreviewModalProps {
  photoUrl: string;
  onClose: () => void;
}

function PhotoPreviewModal({ photoUrl, onClose }: PhotoPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full animate-scale-in">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={photoUrl}
          alt="张贴现场照片"
          className="w-full rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}

interface ExceptionReportModalProps {
  board: BulletinBoard | undefined;
  poster: Poster | undefined;
  onClose: () => void;
  onSubmit: (data: { type: ExceptionType; description: string; reporter: string }) => void;
}

function ExceptionReportModal({ board, poster, onClose, onSubmit }: ExceptionReportModalProps) {
  const [selectedType, setSelectedType] = useState<ExceptionType>('damaged');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('');

  const handleSubmit = () => {
    if (!reporter.trim()) {
      alert('请填写上报人姓名');
      return;
    }
    onSubmit({
      type: selectedType,
      description: description.trim() || EXCEPTION_TYPES.find(t => t.value === selectedType)?.label || '',
      reporter: reporter.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            异常上报
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            {poster && (
              <img
                src={poster.imageUrl}
                alt={poster.activityName}
                className="w-14 h-18 object-cover rounded-lg shadow flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{poster?.activityName || '未知活动'}</p>
              <p className="text-sm text-gray-500">{poster?.club || ''}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <MapPin className="w-3 h-3" />
                {board?.name || '未知'} · {board?.location || ''}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              异常类型 <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {EXCEPTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    selectedType === type.value
                      ? 'border-danger bg-red-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                    selectedType === type.value ? 'text-danger' : 'text-gray-400'
                  }`} />
                  <span className="font-medium text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              补充描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请描述异常情况..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上报人 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="请填写上报人姓名"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-danger text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            提交上报
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Execution() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [photoModalItem, setPhotoModalItem] = useState<{
    item: PostingItem;
    board: BulletinBoard | undefined;
    poster: Poster | undefined;
  } | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [exceptionModalItem, setExceptionModalItem] = useState<{
    item: PostingItem;
    board: BulletinBoard | undefined;
    poster: Poster | undefined;
  } | null>(null);

  const { postingItems, confirmPosting } = usePostingStore();
  const applications = useApplicationStore((state) => state.applications);
  const posters = usePosterStore((state) => state.posters);
  const updateStatus = usePosterStore((state) => state.updateStatus);
  const bulletinBoards = useBulletinBoardStore((state) => state.bulletinBoards);
  const addException = useExceptionStore((state) => state.addException);

  const getApplicationById = (id: string) => applications.find(a => a.id === id);
  const getPosterById = (id: string) => posters.find(p => p.id === id);
  const getBulletinBoardById = (id: string) => bulletinBoards.find(b => b.id === id);

  const pendingGroups = useMemo<PostingGroup[]>(() => {
    const approvedApplications = applications.filter(
      (app) => app.status === 'approved'
    );

    return approvedApplications
      .map((application) => {
        const items = postingItems.filter(
          (item) =>
            item.applicationId === application.id && item.status === 'pending'
        );

        if (items.length === 0) return null;

        const poster = getPosterById(application.posterId);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
          application,
          poster,
          items,
          totalQuantity,
          pendingCount: items.length,
          postedCount: 0,
        };
      })
      .filter((group): group is PostingGroup => group !== null);
  }, [applications, postingItems, posters]);

  const historyGroups = useMemo<PostingGroup[]>(() => {
    const approvedApplications = applications.filter(
      (app) => app.status === 'approved'
    );

    return approvedApplications
      .map((application) => {
        const items = postingItems.filter(
          (item) =>
            item.applicationId === application.id && item.status === 'posted'
        );

        if (items.length === 0) return null;

        const poster = getPosterById(application.posterId);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
          application,
          poster,
          items,
          totalQuantity,
          pendingCount: 0,
          postedCount: items.length,
        };
      })
      .filter((group): group is PostingGroup => group !== null);
  }, [applications, postingItems, posters]);

  const currentGroups = activeTab === 'pending' ? pendingGroups : historyGroups;

  const toggleGroup = (applicationId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }
      return next;
    });
  };

  const handleOpenPhotoModal = (item: PostingItem) => {
    const application = getApplicationById(item.applicationId);
    if (!application) return;

    const poster = getPosterById(application.posterId);
    const board = getBulletinBoardById(item.bulletinBoardId);

    setPhotoModalItem({ item, board, poster });
  };

  const handleConfirmPosting = (photoUrl: string) => {
    if (!photoModalItem) return;

    confirmPosting(photoModalItem.item.id, photoUrl);

    const application = getApplicationById(photoModalItem.item.applicationId);
    if (application) {
      updateStatus(application.posterId, 'posted');
    }

    setPhotoModalItem(null);
  };

  const handleOpenExceptionModal = (item: PostingItem) => {
    const application = getApplicationById(item.applicationId);
    if (!application) return;

    const poster = getPosterById(application.posterId);
    const board = getBulletinBoardById(item.bulletinBoardId);

    setExceptionModalItem({ item, board, poster });
  };

  const handleExceptionSubmit = (data: { type: ExceptionType; description: string; reporter: string }) => {
    if (!exceptionModalItem) return;

    const { item, board, poster } = exceptionModalItem;
    const location = board ? `${board.name} - ${board.location}` : '未知位置';

    addException({
      type: data.type,
      description: data.description,
      location,
      reporter: data.reporter,
      relatedPosterId: poster?.id,
      photoUrl: item.photoUrl,
    });

    setExceptionModalItem(null);
  };

  const pendingTotal = pendingGroups.reduce(
    (sum, g) => sum + g.pendingCount,
    0
  );
  const postedTotal = historyGroups.reduce(
    (sum, g) => sum + g.postedCount,
    0
  );

  return (
    <div>
      <PageHeader
      title="张贴执行"
      description="现场执行海报张贴任务，拍照确认并更新状态"
    />

      <div className="bg-white rounded-2xl shadow-card p-4 mb-6 animate-fade-in">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'pending'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            待张贴
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'pending'
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-100 text-primary-600'
              }`}
            >
              {pendingTotal}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <History className="w-5 h-5" />
            已张贴
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'history'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {postedTotal}
            </span>
          </button>
        </div>
      </div>

      {currentGroups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card animate-fade-in">
          <Empty
            icon={
              activeTab === 'pending' ? (
                <ClipboardList className="w-16 h-16 text-gray-300" />
              ) : (
                <History className="w-16 h-16 text-gray-300" />
              )
            }
            title={
              activeTab === 'pending'
                ? '暂无待张贴任务'
                : '暂无已张贴记录'
            }
            description={
              activeTab === 'pending'
                ? '所有张贴任务已完成'
                : '还没有完成任何张贴任务'
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {currentGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.has(group.application.id);

            return (
              <div
                key={group.application.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden animate-slide-up"
                style={{ animationDelay: `${groupIndex * 0.1}s` }}
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup(group.application.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {group.poster && (
                        <img
                          src={group.poster.imageUrl}
                          alt={group.poster.activityName}
                          className="w-16 h-20 object-cover rounded-lg shadow flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {group.poster?.activityName || '未知活动'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {group.poster?.club || '未知社团'} · 申请人:{' '}
                          {group.application.applicant} ·{' '}
                          {group.poster?.approvalNumber || ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            <Package className="w-3 h-3" />
                            共 {group.totalQuantity} 张
                          </span>
                          {group.pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                              待张贴 {group.pendingCount}
                            </span>
                          )}
                          {group.postedCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                              已张贴 {group.postedCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-gray-400">
                        {group.items.length} 个张贴点
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              海报图片
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              公告栏位置
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              数量
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              置顶
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              状态
                            </th>
                            {activeTab === 'history' && (
                              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                张贴时间
                              </th>
                            )}
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {group.items.map((item, itemIndex) => {
                            const board = getBulletinBoardById(item.bulletinBoardId);
                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors"
                                style={{
                                  animationDelay: `${itemIndex * 0.05}s`,
                                }}
                              >
                                <td className="px-6 py-4">
                                  {group.poster && (
                                    <img
                                      src={group.poster.imageUrl}
                                      alt={group.poster.activityName}
                                      className="w-12 h-16 object-cover rounded shadow"
                                    />
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {board?.name || '未知'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-6">
                                      {board?.location || '未知'}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-50 text-primary-600 rounded-full text-sm font-bold">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {item.needTop ? (
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto" />
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <StatusBadge status={item.status} type="posting" />
                                </td>
                                {activeTab === 'history' && (
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                      <Clock className="w-4 h-4 text-gray-400" />
                                      {item.postedAt
                                        ? formatDateTime(item.postedAt)
                                        : '-'}
                                    </div>
                                  </td>
                                )}
                                <td className="px-6 py-4 text-center">
                                  {activeTab === 'pending' ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenPhotoModal(item);
                                      }}
                                      className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 hover:shadow-md"
                                    >
                                      <Camera className="w-4 h-4" />
                                      拍照确认
                                    </button>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2">
                                      {item.photoUrl && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewPhotoUrl(item.photoUrl!);
                                          }}
                                          className="inline-flex items-center gap-1 px-3 py-2 text-sm text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                          <Eye className="w-4 h-4" />
                                          照片
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenExceptionModal(item);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                        异常上报
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {photoModalItem && (
        <PhotoModal
          item={photoModalItem.item}
          board={photoModalItem.board}
          poster={photoModalItem.poster}
          onClose={() => setPhotoModalItem(null)}
          onConfirm={handleConfirmPosting}
        />
      )}

      {previewPhotoUrl && (
        <PhotoPreviewModal
          photoUrl={previewPhotoUrl}
          onClose={() => setPreviewPhotoUrl(null)}
        />
      )}

      {exceptionModalItem && (
        <ExceptionReportModal
          board={exceptionModalItem.board}
          poster={exceptionModalItem.poster}
          onClose={() => setExceptionModalItem(null)}
          onSubmit={handleExceptionSubmit}
        />
      )}
    </div>
  );
}
