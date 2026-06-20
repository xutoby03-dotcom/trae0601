import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="card-base p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-baby-300 to-mint-300 flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据概览</h1>
          <p className="text-sm text-gray-500">欢迎使用玩具消毒管家</p>
        </div>
      </div>
      <div className="text-gray-500">仪表盘内容区域</div>
    </div>
  );
}
