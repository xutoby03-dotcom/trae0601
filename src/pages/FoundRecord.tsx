import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  CheckCircle2, 
  PartyPopper,
  Heart,
  FileText,
  Send
} from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import { formatDateTime } from '@/utils/time';
import { cn } from '@/lib/utils';

export function FoundRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getPetById = usePetStore((state) => state.getPetById);
  const markAsFound = usePetStore((state) => state.markAsFound);

  const pet = id ? getPetById(id) : undefined;

  const [formData, setFormData] = useState({
    foundProcess: '',
    thankYou: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!pet) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到协寻信息</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (pet.status === 'found') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">找回记录</h1>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 {pet.petName} 已平安回家！</h2>
          <p className="text-green-700 mb-4">
            找回时间：{formatDateTime(pet.foundTime || '')}
          </p>
          <Link
            to={`/detail/${pet.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            查看详情
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foundProcess.trim() || !formData.thankYou.trim()) {
      return;
    }

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    markAsFound(pet.id, formData.foundProcess, formData.thankYou);
    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      navigate(`/detail/${pet.id}`);
    }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">记录已提交！</h2>
        <p className="text-gray-500">感谢您的反馈，正在跳转...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">标记找回</h1>
          <p className="text-sm text-gray-500">恭喜 {pet.petName} 平安回家！</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={pet.photos[0]}
            alt={pet.petName}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-bold text-gray-900">{pet.petName}</h3>
            <p className="text-sm text-gray-600">{pet.breed} · {pet.color}</p>
            <p className="text-xs text-gray-500 mt-1">
              走失时间：{formatDateTime(pet.lostTime)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FileText className="w-4 h-4 text-green-500" />
              找回过程
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.foundProcess}
              onChange={(e) => setFormData({ ...formData, foundProcess: e.target.value })}
              placeholder="请描述找回的过程，在哪里找到的、通过什么线索找到的等等..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all bg-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              您的分享可以帮助其他宠物主人更好地寻找走失的宠物
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Heart className="w-4 h-4 text-red-500" />
              感谢信息
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.thankYou}
              onChange={(e) => setFormData({ ...formData, thankYou: e.target.value })}
              placeholder="感谢帮助过您的人，分享您的心情..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all bg-white resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.foundProcess.trim() || !formData.thankYou.trim()}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2",
            submitting || !formData.foundProcess.trim() || !formData.thankYou.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-200 hover:shadow-xl"
          )}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              提交找回记录
            </>
          )}
        </button>
      </form>
    </div>
  );
}
