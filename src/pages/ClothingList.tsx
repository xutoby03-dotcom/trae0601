import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shirt, Search, Filter, User, Calendar, Ruler } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ClothingCard from '@/components/shared/ClothingCard';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { searchClothes } from '@/utils/helpers';
import { OWNERS, SEASONS, SCENARIOS, type Season } from '@/types';

export default function ClothingList() {
  const navigate = useNavigate();
  const clothes = useStore((state) => state.clothes);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<Season | ''>('');

  const filteredClothes = searchClothes(clothes.filter(c => c.status !== 'pending'), {
    owner: selectedOwner || undefined,
    scenario: selectedScenario || undefined,
    size: selectedSize || undefined,
    keyword: searchTerm || undefined,
    season: selectedSeason || undefined,
  });

  const activeFilterCount = [selectedOwner, selectedScenario, selectedSize, selectedSeason].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedOwner('');
    setSelectedScenario('');
    setSelectedSize('');
    setSelectedSeason('');
  };

  return (
    <Layout
      title="衣物收纳"
      showAdd
      addAction={() => navigate('/clothes/new')}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              placeholder="搜索衣物名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-4 rounded-xl border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-sage-50 border-sage-200 text-sage-600'
                : 'bg-white border-warm-200 text-warm-500 hover:bg-warm-50'
            }`}
          >
            <Filter size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="card p-4 space-y-4 animate-fade-in-up">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <User size={14} className="text-sage-500" />
                归属人
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedOwner('')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    !selectedOwner
                      ? 'bg-sage-500 text-white'
                      : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                  }`}
                >
                  全部
                </button>
                {OWNERS.map((owner) => (
                  <button
                    key={owner}
                    onClick={() => setSelectedOwner(selectedOwner === owner ? '' : owner)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedOwner === owner
                        ? 'bg-sage-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >
                    {owner}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <Calendar size={14} className="text-sky-500" />
                场景
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedScenario('')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    !selectedScenario
                      ? 'bg-sky-500 text-white'
                      : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                  }`}
                >
                  全部
                </button>
                {SCENARIOS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedScenario(selectedScenario === s.value ? '' : s.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedScenario === s.value
                        ? 'bg-sky-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <Ruler size={14} className="text-coral-500" />
                季节
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSeason('')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    !selectedSeason
                      ? 'bg-coral-500 text-white'
                      : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                  }`}
                >
                  全部
                </button>
                {SEASONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedSeason(selectedSeason === s.value ? '' : s.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedSeason === s.value
                        ? 'bg-coral-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-warm-500 hover:text-warm-700"
              >
                重置筛选
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-500">共 {filteredClothes.length} 件衣物</span>
          <button
            onClick={() => navigate('/pending')}
            className="text-sm text-amber-600 font-medium flex items-center gap-1"
          >
            待处理区
            {clothes.filter(c => c.status === 'pending').length > 0 && (
              <Badge variant="warning" size="sm">
                {clothes.filter(c => c.status === 'pending').length}
              </Badge>
            )}
          </button>
        </div>

        {filteredClothes.length > 0 ? (
          <div className="space-y-3">
            {filteredClothes.map((clothing, index) => (
              <div key={clothing.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <ClothingCard clothing={clothing} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Shirt}
            title={searchTerm || activeFilterCount > 0 ? '没有找到匹配的衣物' : '还没有衣物'}
            description={searchTerm || activeFilterCount > 0 ? '试试其他搜索条件' : '添加你的第一件衣物吧'}
            action={
              !searchTerm && activeFilterCount === 0 && (
                <button
                  onClick={() => navigate('/clothes/new')}
                  className="btn-primary text-sm"
                >
                  添加衣物
                </button>
              )
            }
          />
        )}
      </div>
    </Layout>
  );
}
