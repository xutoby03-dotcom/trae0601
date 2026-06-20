import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Filter, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeadsetCard from '@/components/HeadsetCard';
import { connectionTypeLabels, headsetStatusLabels } from '@/types';
import type { ConnectionType, HeadsetStatus } from '@/types';

export default function HeadsetsPage() {
  const { headsets, deleteHeadset, resetData } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);

  const filteredHeadsets = useMemo(() => {
    return headsets.filter(headset => {
      const matchesSearch = 
        headset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        headset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        headset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || headset.status === statusFilter;
      const matchesConnection = connectionFilter === 'all' || headset.connectionType === connectionFilter;
      const matchesIssues = !showIssuesOnly || headset.receiverLost || headset.microphoneIssue || headset.batteryLevel < 30;
      
      return matchesSearch && matchesStatus && matchesConnection && matchesIssues;
    });
  }, [headsets, searchQuery, statusFilter, connectionFilter, showIssuesOnly]);

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个耳麦档案吗？')) {
      deleteHeadset(id);
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？这将恢复到初始mock数据。')) {
      resetData();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">耳麦档案</h1>
          <p className="text-slate-500 mt-1">共 {headsets.length} 个耳麦 · 可用 {headsets.filter(h => h.status === 'available').length} 个</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置数据
          </button>
          <Link
            to="/headsets/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            新增耳麦
          </Link>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="搜索品牌、型号、编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              className="input w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              {Object.entries(headsetStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <select
              className="input w-auto"
              value={connectionFilter}
              onChange={(e) => setConnectionFilter(e.target.value)}
            >
              <option value="all">全部连接方式</option>
              {Object.entries(connectionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              checked={showIssuesOnly}
              onChange={(e) => setShowIssuesOnly(e.target.checked)}
            />
            <span className="text-sm text-slate-700">仅显示异常</span>
          </label>
        </div>
      </div>

      {filteredHeadsets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500">没有找到符合条件的耳麦</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHeadsets.map((headset, index) => (
            <div
              key={headset.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-slide-up"
            >
              <HeadsetCard
                headset={headset}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
