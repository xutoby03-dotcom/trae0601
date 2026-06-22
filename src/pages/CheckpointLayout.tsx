import { useEffect } from 'react';
import Header from '@/components/Header';
import CheckpointForm from '@/components/CheckpointForm';
import RouteDisplay from '@/components/RouteDisplay';
import CheckpointList from '@/components/CheckpointList';
import InspectionChecklist from '@/components/InspectionChecklist';
import { useCheckpointStore } from '@/store/useCheckpointStore';

export default function CheckpointLayout() {
  const { checkpoints, loadMockData } = useCheckpointStore();

  useEffect(() => {
    if (checkpoints.length === 0) {
      loadMockData();
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 space-y-6">
            <CheckpointForm />
            <CheckpointList />
          </div>

          <div className="space-y-6">
            <RouteDisplay />
            <InspectionChecklist />
          </div>
        </div>

        <footer className="mt-12 pb-8 text-center text-sm text-gray-400">
          <p>定向越野检查点布置管理系统 · 确保赛事筹备高效准确</p>
          <p className="text-xs mt-1">数据自动保存在本地浏览器中</p>
        </footer>
      </main>
      </div>
  );
}
