import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Phone, 
  PawPrint,
  Star,
  Send,
  CheckCircle2,
  PartyPopper
} from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import { MapView } from '@/components/MapView';
import { ClueCard } from '@/components/ClueCard';
import { StatusBadge } from '@/components/StatusBadge';
import { SafetyAlert } from '@/components/SafetyAlert';
import { PhotoUpload } from '@/components/PhotoUpload';
import { formatDateTime, formatDuration, getDurationHours } from '@/utils/time';
import { cn } from '@/lib/utils';

const sizeLabels = { small: '小型', medium: '中型', large: '大型' };
const speciesLabels = { cat: '🐱 猫', dog: '🐕 狗' };

export function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getPetById = usePetStore((state) => state.getPetById);
  const getCluesByMissingId = usePetStore((state) => state.getCluesByMissingId);
  const addClue = usePetStore((state) => state.addClue);

  const pet = id ? getPetById(id) : undefined;
  const clues = id ? getCluesByMissingId(id) : [];

  const [showClueForm, setShowClueForm] = useState(false);
  const [cluePhoto, setCluePhoto] = useState<string[]>([]);
  const [clueData, setClueData] = useState({
    seenTime: new Date().toISOString().slice(0, 16),
    location: '',
    lat: pet?.lat || 39.9042,
    lng: pet?.lng || 116.4074,
    confidence: 3,
    description: '',
    contact: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!pet) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <PawPrint className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到协寻信息</h2>
        <p className="text-gray-500 mb-6">该协寻可能已被删除或不存在</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  const handleSubmitClue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueData.location.trim() || !clueData.description.trim()) {
      return;
    }

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addClue({
      missingId: pet.id,
      seenTime: new Date(clueData.seenTime).toISOString(),
      location: clueData.location,
      lat: clueData.lat,
      lng: clueData.lng,
      photo: cluePhoto[0],
      confidence: clueData.confidence,
      description: clueData.description,
      contact: clueData.contact || undefined,
    });

    setSubmitting(false);
    setShowClueForm(false);
    setCluePhoto([]);
    setClueData({
      seenTime: new Date().toISOString().slice(0, 16),
      location: '',
      lat: pet.lat,
      lng: pet.lng,
      confidence: 3,
      description: '',
      contact: '',
    });
  };

  const renderStars = (confidence: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setClueData({ ...clueData, confidence: i + 1 })}
        className="p-1 transition-transform hover:scale-110"
      >
        <Star
          className={cn(
            "w-6 h-6 transition-colors",
            i < confidence ? "text-amber-400 fill-amber-400" : "text-gray-300"
          )}
        />
      </button>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{pet.petName}</h1>
            <StatusBadge status={pet.status} urgent={pet.urgent} />
          </div>
          <p className="text-sm text-gray-500">
            {speciesLabels[pet.species]} · {pet.breed}
          </p>
        </div>
        {pet.status !== 'found' && (
          <Link
            to={`/found/${pet.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">已找回</span>
          </Link>
        )}
      </div>

      <SafetyAlert />

      {pet.status === 'found' && pet.foundTime && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-800 mb-2">🎉 已平安回家！</h3>
              <p className="text-green-700 mb-3">
                走失时长：{formatDuration(getDurationHours(pet.lostTime, pet.foundTime))}
              </p>
              {pet.foundProcess && (
                <div className="bg-white/60 rounded-xl p-4 mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">找回过程：</span>
                    {pet.foundProcess}
                  </p>
                </div>
              )}
              {pet.thankYou && (
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">感谢信息：</span>
                    {pet.thankYou}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="relative aspect-video bg-gray-100">
          <img
            src={pet.photos[currentPhotoIndex]}
            alt={pet.petName}
            className="w-full h-full object-cover"
          />
          {pet.photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhotoIndex((prev) => prev === 0 ? pet.photos.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentPhotoIndex((prev) => (prev + 1) % pet.photos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {pet.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhotoIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentPhotoIndex ? "bg-white w-6" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-orange-500" />
            宠物信息
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-20">品种</span>
              <span className="text-gray-900">{pet.breed}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-20">颜色</span>
              <span className="text-gray-900">{pet.color}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-20">体型</span>
              <span className="text-gray-900">{sizeLabels[pet.size]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-20">走失时间</span>
              <span className="text-gray-900">{formatDateTime(pet.lostTime)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-gray-900">{pet.lastLocation}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-gray-900">{pet.contact}</span>
            </div>
          </div>
          {pet.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                {pet.description}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            位置地图
          </h2>
          <MapView pet={pet} clues={clues} />
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span>走失点</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span>线索点</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>时间越久颜色越淡</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">👀</span>
            线索列表
            {clues.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({clues.length} 条)
              </span>
            )}
          </h2>
          {pet.status !== 'found' && !showClueForm && (
            <button
              onClick={() => setShowClueForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
              提供线索
            </button>
          )}
        </div>

        {showClueForm && (
          <form onSubmit={handleSubmitClue} className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
            <h3 className="font-medium text-gray-900 mb-4">提供线索</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">看到时间 *</label>
                <input
                  type="datetime-local"
                  value={clueData.seenTime}
                  onChange={(e) => setClueData({ ...clueData, seenTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">可信度</label>
                <div className="flex items-center gap-2">
                  {renderStars(clueData.confidence)}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">看到位置 *</label>
              <input
                type="text"
                value={clueData.location}
                onChange={(e) => setClueData({ ...clueData, location: e.target.value })}
                placeholder="请输入看到的具体位置"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:outline-none bg-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">线索照片</label>
              <PhotoUpload photos={cluePhoto} onChange={setCluePhoto} maxPhotos={1} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">详细描述 *</label>
              <textarea
                value={clueData.description}
                onChange={(e) => setClueData({ ...clueData, description: e.target.value })}
                placeholder="请描述看到的情况，宠物状态等..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:outline-none bg-white resize-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">您的联系方式（可选）</label>
              <input
                type="text"
                value={clueData.contact}
                onChange={(e) => setClueData({ ...clueData, contact: e.target.value })}
                placeholder="方便主人联系您表示感谢"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:outline-none bg-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "flex-1 py-3 rounded-lg font-medium text-white transition-all",
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {submitting ? "提交中..." : "提交线索"}
              </button>
              <button
                type="button"
                onClick={() => setShowClueForm(false)}
                className="px-6 py-3 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        )}

        {clues.length > 0 ? (
          <div className="space-y-2">
            {clues.map((clue, index) => (
              <ClueCard key={clue.id} clue={clue} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👀</span>
            </div>
            <p className="text-gray-500">暂无线索</p>
            <p className="text-sm text-gray-400 mt-1">
              {pet.status === 'found'
                ? '这只宠物已经回家啦~'
                : '如果您看到过它，请提供线索帮助它回家'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
