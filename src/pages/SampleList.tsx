import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SampleCard from '@/components/sample/SampleCard';
import SampleFilterBar from '@/components/sample/SampleFilterBar';
import Empty from '@/components/common/Empty';
import Button from '@/components/common/Button';
import { useStore } from '@/store';
import type { SizeCode, ProductionStatus } from '@/types';

export default function SampleList() {
  const navigate = useNavigate();
  const { samples } = useStore();

  const [searchText, setSearchText] = useState('');
  const [selectedSize, setSelectedSize] = useState<SizeCode | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProductionStatus | 'all'>('all');

  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      const matchSearch = sample.styleNo.toLowerCase().includes(searchText.toLowerCase());
      const matchSize = selectedSize === 'all' || sample.sizes.includes(selectedSize);
      const matchStatus = statusFilter === 'all' || sample.productionStatus === statusFilter;
      return matchSearch && matchSize && matchStatus;
    });
  }, [samples, searchText, selectedSize, statusFilter]);

  return (
    <Layout>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-800">样衣档案</h1>
          <p className="mt-1 text-sm text-charcoal-500">系统化记录每一次试穿反馈</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/sample/new')}
          icon={<Plus className="h-4 w-4" />}
        >
          新建样衣
        </Button>
      </div>

      <SampleFilterBar
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="mt-6">
        {filteredSamples.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSamples.map((sample) => (
              <SampleCard key={sample.id} sample={sample} />
            ))}
          </div>
        ) : (
          <Empty description="暂无符合条件的样衣档案，点击右上角按钮新建" />
        )}
      </div>
    </Layout>
  );
}
