import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Grid3X3, List } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import BoxCard from '@/components/shared/BoxCard';
import EmptyState from '@/components/ui/EmptyState';
import { useStore } from '@/store/useStore';

export default function BoxList() {
  const navigate = useNavigate();
  const boxes = useStore((state) => state.boxes);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredBoxes = boxes.filter(box =>
    box.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="收纳箱"
      showAdd
      addAction={() => navigate('/boxes/new')}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            type="text"
            placeholder="搜索箱子编号或位置..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-500">共 {filteredBoxes.length} 个箱子</span>
          <div className="flex items-center gap-1 bg-warm-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-sage-600' : 'text-warm-400'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-sage-600' : 'text-warm-400'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {filteredBoxes.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredBoxes.map((box, index) => (
                <div key={box.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <BoxCard box={box} variant="grid" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBoxes.map((box, index) => (
                <div key={box.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <BoxCard box={box} variant="list" />
                </div>
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon={Package}
            title={searchTerm ? '没有找到匹配的箱子' : '还没有收纳箱'}
            description={searchTerm ? '试试其他关键词' : '添加你的第一个收纳箱，开始有序收纳'}
            action={
              !searchTerm && (
                <button
                  onClick={() => navigate('/boxes/new')}
                  className="btn-primary text-sm"
                >
                  添加箱子
                </button>
              )
            }
          />
        )}
      </div>
    </Layout>
  );
}
