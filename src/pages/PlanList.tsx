import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Camera, Anchor } from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import PlanCard from '@/components/PlanCard';
import Bubbles from '@/components/Bubbles';

export default function PlanList() {
  const navigate = useNavigate();
  const { plans, searchPlans, deletePlan, duplicatePlan } = usePlanStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredPlans = searchPlans(searchQuery);

  const handleDelete = (id: string) => {
    deletePlan(id);
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (id: string) => {
    const newPlan = duplicatePlan(id);
    navigate(`/edit/${newPlan.id}`, {
      state: { sourcePlanId: id },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative">
      <Bubbles />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <Anchor className="text-cyan-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                水下配重记录
              </h1>
              <p className="text-slate-400 mt-1">
                记录每一次下潜的配重方案，让镜头稳稳对准目标
              </p>
            </div>
          </div>
        </header>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="搜索方案名称、盐度、相机型号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 
                         rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 
                         focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center justify-center gap-2 px-6 py-3 
                       bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 
                       text-white font-medium rounded-xl transition-all duration-300 
                       hover:shadow-[0_4px_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5
                       active:translate-y-0"
          >
            <Plus size={20} />
            <span>新建方案</span>
          </button>
        </div>

        {/* Plan List */}
        {filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={(id) => navigate(`/detail/${id}`)}
                onEdit={(id) => navigate(`/edit/${id}`)}
                onDuplicate={handleDuplicate}
                onDelete={(id) => setShowDeleteConfirm(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl 
                            bg-slate-800/50 border border-slate-700/50 mb-6">
              <Camera className="text-slate-500" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {searchQuery ? '未找到匹配的方案' : '还没有配重方案'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery ? '试试其他关键词' : '记录你的第一个水下配重方案吧'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/new')}
                className="inline-flex items-center gap-2 px-6 py-3 
                           bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 
                           rounded-xl hover:bg-cyan-500/20 transition-colors"
              >
                <Plus size={20} />
                <span>创建第一个方案</span>
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        {plans.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-500 text-center">
              共 {plans.length} 个配重方案
              {searchQuery && ` · 匹配 ${filteredPlans.length} 个`}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full
                       shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
            <p className="text-slate-400 mb-6">
              删除后无法恢复，确定要删除这个配重方案吗？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-slate-300 hover:text-white 
                           hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30
                           hover:bg-red-500/20 rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
