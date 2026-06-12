import { useState } from 'react';
import { Bouquet } from '@/types';
import { useBouquetStore } from '@/store/bouquetStore';
import BouquetCard from './BouquetCard';
import ReserveModal from './ReserveModal';
import EmptyState from '@/components/common/EmptyState';
import { Frown, Search } from 'lucide-react';

export default function BouquetGrid() {
  const { bouquets } = useBouquetStore();
  const [selectedBouquet, setSelectedBouquet] = useState<Bouquet | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const categories = ['全部', ...Array.from(new Set(bouquets.map(b => b.category)))];

  const filteredBouquets = bouquets.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.materials.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === '全部' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleReserve = (bouquet: Bouquet) => {
    setSelectedBouquet(bouquet);
    setIsReserveModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="relative w-full max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-forest-400" />
          <input
            type="text"
            placeholder="搜索花束名称或花材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-cream-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:border-rose-300 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md shadow-rose-200/50'
                  : 'bg-white text-forest-600 hover:bg-cream-100 border border-cream-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredBouquets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBouquets.map((bouquet, index) => (
            <div 
              key={bouquet.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="animate-fade-in-up"
            >
              <BouquetCard bouquet={bouquet} onReserve={handleReserve} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="没有找到花束"
          description="试试换个关键词或分类搜索吧"
          icon={<Frown className="w-10 h-10 text-rose-300" />}
        />
      )}

      {selectedBouquet && (
        <ReserveModal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          bouquet={selectedBouquet}
        />
      )}
    </div>
  );
}
