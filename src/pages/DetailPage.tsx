import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Droplets, Edit, MapPin, Sun, Trash2 } from 'lucide-react';
import { usePerfumeStore } from '@/store/usePerfumeStore';
import { Timeline } from '@/components/Timeline';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { SceneTags } from '@/components/SceneTags';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const perfume = usePerfumeStore((state) => state.getPerfumeById(id || ''));
  const deletePerfume = usePerfumeStore((state) => state.deletePerfume);

  if (!perfume) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-stone-600">未找到该香水记录</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deletePerfume(perfume.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-600 transition-colors hover:text-stone-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回列表</span>
          </Link>
          
          <div className="flex gap-2">
            <Link
              to={`/edit/${perfume.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm ring-1 ring-stone-200 transition-colors hover:bg-stone-50"
            >
              <Edit className="h-4 w-4" />
              <span>编辑</span>
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm ring-1 ring-rose-200 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>删除</span>
            </button>
          </div>
        </div>
        
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 p-8">
          <div className="text-center">
            <p className="text-sm font-medium text-amber-700">{perfume.brand}</p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-stone-800 sm:text-5xl">
              {perfume.name}
            </h1>
            <p className="mt-3 inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm text-stone-600 shadow-sm backdrop-blur-sm">
              {perfume.scentFamily}
            </p>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/60 p-4 text-center backdrop-blur-sm">
              <MapPin className="mx-auto mb-1.5 h-5 w-5 text-amber-600" />
              <p className="text-xs text-stone-500">喷洒位置</p>
              <p className="mt-0.5 text-sm font-medium text-stone-700">
                {perfume.sprayLocation}
              </p>
            </div>
            
            <div className="rounded-2xl bg-white/60 p-4 text-center backdrop-blur-sm">
              <Sun className="mx-auto mb-1.5 h-5 w-5 text-amber-600" />
              <p className="text-xs text-stone-500">天气</p>
              <p className="mt-0.5 text-sm font-medium text-stone-700">
                {perfume.weather}
              </p>
            </div>
            
            <div className="rounded-2xl bg-white/60 p-4 text-center backdrop-blur-sm">
              <Droplets className="mx-auto mb-1.5 h-5 w-5 text-sky-600" />
              <p className="text-xs text-stone-500">湿度</p>
              <p className="mt-0.5 text-sm font-medium text-stone-700">
                {perfume.humidity}%
              </p>
            </div>
            
            <div className="rounded-2xl bg-white/60 p-4 text-center backdrop-blur-sm">
              <Calendar className="mx-auto mb-1.5 h-5 w-5 text-violet-600" />
              <p className="text-xs text-stone-500">记录日期</p>
              <p className="mt-0.5 text-sm font-medium text-stone-700">
                {perfume.createdAt}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <SceneTags scenes={perfume.scenes} size="md" />
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 font-serif text-2xl font-bold text-stone-800">
            留香时间线
          </h2>
          <Timeline timeline={perfume.timeline} />
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 font-serif text-2xl font-bold text-stone-800">
            综合评分
          </h2>
          <ScoreDisplay skinScore={perfume.skinScore} clothScore={perfume.clothScore} />
        </div>
      </div>
    </div>
  );
}
