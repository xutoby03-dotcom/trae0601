import FilterBar from '@/components/Records/FilterBar';
import RecordsTable from '@/components/Records/RecordsTable';
import CalibrationAlert from '@/components/Dashboard/CalibrationAlert';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Records() {
  return (
    <div className="animate-fade-in-up">
      <CalibrationAlert />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-coffee-800 mb-1">参数记录表</h1>
          <p className="text-coffee-500">所有手冲参数记录，支持多条件筛选</p>
        </div>
        <Link to="/records/new" className="btn btn-matcha flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          新增记录
        </Link>
      </div>

      <FilterBar />
      <RecordsTable />
    </div>
  );
}
