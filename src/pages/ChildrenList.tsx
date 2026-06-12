import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ChildCard from '@/components/child/ChildCard';
import ChildFormModal from '@/components/child/ChildFormModal';
import type { Child } from '@/types';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChildrenList() {
  const initialize = useAppStore((s) => s.initialize);
  const children = useAppStore((s) => s.children);
  const addChild = useAppStore((s) => s.addChild);
  const updateChild = useAppStore((s) => s.updateChild);
  const deleteChild = useAppStore((s) => s.deleteChild);
  const getVaccinesByChildId = useAppStore((s) => s.getVaccinesByChildId);

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const filtered = children.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-slate-800 mb-1">孩子档案</h1>
          <p className="text-sm text-slate-500">共 {children.length} 位宝贝</p>
        </div>
        <button onClick={() => navigate('/children/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          新增档案
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索孩子姓名..."
          className="input pl-11"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="font-medium text-slate-700 mb-1">
            {search ? '未找到匹配的孩子档案' : '还没有孩子档案'}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {search ? '试试其他关键词' : '创建第一个孩子档案开始管理疫苗'}
          </p>
          {!search && (
            <button onClick={() => navigate('/children/new')} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              新增档案
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, idx) => {
            const cvs = getVaccinesByChildId(c.id);
            return (
              <div key={c.id} style={{ animationDelay: `${idx * 50}ms` }}>
                <ChildCard
                  child={c}
                  vaccineCount={cvs.length}
                  completedCount={cvs.filter((v) => v.status === 'completed').length}
                  onEdit={() => {
                    setEditingChild(c);
                    setShowModal(true);
                  }}
                />
                <div className="flex items-center gap-2 px-5 py-3 mt-0.5 justify-end">
                  <button
                    onClick={() => navigate(`/children/${c.id}/edit`)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    编辑
                  </button>
                  <span className="text-slate-200">|</span>
                  <button
                    onClick={() => {
                      if (confirm(`确定删除 ${c.name} 的档案？相关疫苗记录也会被删除。`)) {
                        deleteChild(c.id);
                      }
                    }}
                    className="text-xs text-danger-500 hover:text-danger-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ChildFormModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingChild(null);
        }}
        initialData={editingChild}
        onSubmit={(data) => {
          if (editingChild) {
            updateChild(editingChild.id, data);
          } else {
            addChild(data);
          }
        }}
      />
    </div>
  );
}
