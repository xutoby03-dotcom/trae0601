import { useNavigate } from 'react-router-dom';
import { Package, Shirt, Plus, Search, AlertTriangle, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import { useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { getGreeting, formatDate } from '@/utils/date';
import { getBoxOccupancyRate, getSeasonLabel } from '@/utils/helpers';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function Dashboard() {
  const navigate = useNavigate();
  const { boxes, clothes, reminders } = useStore();
  
  const unreadCount = useMemo(() => 
    reminders.filter(r => !r.isRead).length,
    [reminders]
  );

  const missingSizes = useMemo(() => {
    const owners = ['爸爸', '妈妈', '孩子'];
    const seasons = ['春季', '夏季', '秋季', '冬季'];
    const result: Array<{ owner: string; season: string; missing: string[] }> = [];

    owners.forEach(owner => {
      seasons.forEach(season => {
        const seasonKey = season === '春季' ? 'spring' : 
                          season === '夏季' ? 'summer' :
                          season === '秋季' ? 'autumn' : 'winter';
        
        const seasonClothes = clothes.filter(
          c => c.owner === owner && (c.season === seasonKey || c.season === 'all') && c.status !== 'pending'
        );
        
        const categories = ['外套', '上衣', '裤子'];
        const missing: string[] = [];
        
        categories.forEach(cat => {
          const catKey = cat === '外套' ? 'coat' : cat === '上衣' ? 'top' : 'pants';
          const count = seasonClothes.filter(c => c.category === catKey).length;
          if (count < 2) {
            missing.push(cat);
          }
        });
        
        if (missing.length > 0) {
          result.push({ owner, season, missing });
        }
      });
    });

    return result;
  }, [clothes]);

  const weekPickups = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const season = 
      month >= 2 && month <= 4 ? 'spring' :
      month >= 5 && month <= 7 ? 'summer' :
      month >= 8 && month <= 10 ? 'autumn' : 'winter';
    
    return clothes.filter(c => 
      c.status === 'in_box' && 
      (c.season === season || c.season === 'all')
    ).slice(0, 5);
  }, [clothes]);

  const totalClothes = useMemo(() => 
    clothes.filter(c => c.status === 'in_box').length,
    [clothes]
  );
  
  const pendingCount = useMemo(() => 
    clothes.filter(c => c.status === 'pending').length,
    [clothes]
  );

  const today = new Date();

  return (
    <Layout title="收纳管家">
      <div className="space-y-6 pb-4">
        <div className="opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-amber-500" />
            <h2 className="text-xl font-bold text-warm-800">{getGreeting()}！</h2>
          </div>
          <p className="text-warm-500 text-sm">
            今天是 {formatDate(today, 'M月d日 EEEE')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 opacity-0 animate-fade-in-up stagger-1">
          <div className="card p-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-sage-100 flex items-center justify-center mb-2">
              <Package size={20} className="text-sage-600" />
            </div>
            <div className="text-2xl font-bold text-warm-800">{boxes.length}</div>
            <div className="text-xs text-warm-500">收纳箱</div>
          </div>
          <div className="card p-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-sky-100 flex items-center justify-center mb-2">
              <Shirt size={20} className="text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-warm-800">{totalClothes}</div>
            <div className="text-xs text-warm-500">衣物</div>
          </div>
          <div className="card p-4 text-center cursor-pointer card-hover" onClick={() => navigate('/reminders')}>
            <div className="w-10 h-10 mx-auto rounded-full bg-coral-100 flex items-center justify-center mb-2 relative">
              <AlertTriangle size={20} className="text-coral-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-warm-800">{unreadCount}</div>
            <div className="text-xs text-warm-500">提醒</div>
          </div>
        </div>

        <div className="opacity-0 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-warm-800 flex items-center gap-2">
              <Package size={18} className="text-sage-500" />
              箱子占用率
            </h3>
            <button 
              onClick={() => navigate('/boxes')}
              className="text-sm text-sage-600 font-medium flex items-center gap-0.5 hover:text-sage-700"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          {boxes.length > 0 ? (
            <div className="space-y-3">
              {boxes.slice(0, 4).map((box, index) => {
                const boxClothes = clothes.filter(c => c.boxId === box.id && c.status === 'in_box');
                const rate = getBoxOccupancyRate(boxClothes.length, box.capacity);
                return (
                  <div
                    key={box.id}
                    onClick={() => navigate(`/boxes/${box.id}`)}
                    className={`card p-4 card-hover cursor-pointer stagger-${index + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: box.labelColor + '20' }}
                      >
                        <span className="text-xs font-bold" style={{ color: box.labelColor }}>
                          {box.code}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-medium text-warm-700 text-sm truncate">
                            {box.location}
                          </span>
                          <span 
                            className="text-sm font-semibold flex-shrink-0"
                            style={{ 
                              color: rate >= 80 ? '#E8998D' : rate >= 50 ? '#5FA3B6' : '#7E9566'
                            }}
                          >
                            {rate}%
                          </span>
                        </div>
                        <ProgressBar value={boxClothes.length} max={box.capacity} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="还没有收纳箱"
              description="添加你的第一个收纳箱，开始有序收纳"
              action={
                <button 
                  onClick={() => navigate('/boxes/new')}
                  className="btn-primary text-sm"
                >
                  添加箱子
                </button>
              }
            />
          )}
        </div>

        {pendingCount > 0 && (
          <div 
            className="card p-4 opacity-0 animate-fade-in-up stagger-3 cursor-pointer card-hover"
            onClick={() => navigate('/pending')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-warm-800">待处理衣物</h4>
                <p className="text-sm text-warm-500">{pendingCount} 件衣物需要清洗或处理</p>
              </div>
              <ChevronRight size={20} className="text-warm-300" />
            </div>
          </div>
        )}

        <div className="opacity-0 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-warm-800 flex items-center gap-2">
              <Calendar size={18} className="text-sky-500" />
              本周可取
            </h3>
            <button 
              onClick={() => navigate('/clothes')}
              className="text-sm text-sky-600 font-medium flex items-center gap-0.5 hover:text-sky-700"
            >
              浏览全部 <ChevronRight size={16} />
            </button>
          </div>
          {weekPickups.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {weekPickups.map((clothing, index) => (
                <div
                  key={clothing.id}
                  onClick={() => navigate(`/clothes/${clothing.id}`)}
                  className="flex-shrink-0 w-28 card p-2 card-hover cursor-pointer"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="aspect-square rounded-lg bg-warm-50 mb-2 overflow-hidden">
                    {clothing.photo ? (
                      <img src={clothing.photo} alt={clothing.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt size={24} className="text-warm-300" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-warm-700 truncate">{clothing.name}</div>
                  <div className="text-[10px] text-warm-400">{clothing.size}</div>
                  <Badge variant="default" size="sm" className="mt-1">
                    {getSeasonLabel(clothing.season)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="暂无推荐"
              description="系统会根据季节推荐适合取出的衣物"
            />
          )}
        </div>

        {missingSizes.length > 0 && (
          <div className="opacity-0 animate-fade-in-up stagger-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-warm-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-coral-500" />
                尺码缺失提醒
              </h3>
            </div>
            <div className="space-y-2">
              {missingSizes.slice(0, 3).map((item, index) => (
                <div key={`${item.owner}-${item.season}`} className="card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-warm-700 text-sm">{item.owner}</span>
                    <Badge variant="info" size="sm">{item.season}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.missing.map(m => (
                      <span key={m} className="text-xs px-2 py-1 rounded-md bg-coral-50 text-coral-600">
                        缺{m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 opacity-0 animate-fade-in-up stagger-6">
          <button
            onClick={() => navigate('/clothes/new')}
            className="card p-4 flex flex-col items-center justify-center gap-2 card-hover hover:bg-sage-50"
          >
            <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
              <Plus size={24} className="text-sage-600" />
            </div>
            <span className="font-medium text-warm-700">添加衣物</span>
          </button>
          <button
            onClick={() => navigate('/boxes/new')}
            className="card p-4 flex flex-col items-center justify-center gap-2 card-hover hover:bg-sky-50"
          >
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
              <Package size={24} className="text-sky-600" />
            </div>
            <span className="font-medium text-warm-700">新增箱子</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}
