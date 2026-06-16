import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Phone,
  Smartphone,
  Home,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useElderStore } from '@/store/elderStore';
import { PHONE_SYSTEM_MAP } from '@/types';

export default function ElderList() {
  const { elders, searchElders, fetchElders } = useElderStore();
  const [keyword, setKeyword] = useState('');
  const [filterNeedHome, setFilterNeedHome] = useState(false);

  useEffect(() => {
    fetchElders();
  }, [fetchElders]);

  const filteredElders = searchElders(keyword).filter(
    elder => !filterNeedHome || elder.needHomeVisit
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">老人档案</h1>
        <Link to="/elders/new" className="btn-primary btn-lg">
          <Plus size={20} />
          新增老人
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="搜索姓名、电话、手机型号..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input pl-12"
            />
          </div>
          <button
            onClick={() => setFilterNeedHome(!filterNeedHome)}
            className={`btn ${filterNeedHome ? 'bg-primary-100 text-primary-600' : 'btn-secondary'}`}
          >
            <Filter size={18} />
            {filterNeedHome ? '显示全部' : '仅看需上门'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredElders.map((elder) => (
          <Link
            key={elder.id}
            to={`/elders/${elder.id}`}
            className="card p-5 card-hover group"
          >
            <div className="flex items-start gap-4">
              <img
                src={elder.avatar}
                alt={elder.name}
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-neutral-800">{elder.name}</h3>
                  <span className="text-sm text-neutral-500">{elder.age}岁</span>
                  {elder.needHomeVisit && (
                    <span className="tag bg-warning-100 text-warning-600 text-xs">
                      需上门
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-neutral-600 flex items-center gap-2">
                    <Phone size={14} className="text-neutral-400" />
                    {elder.phone}
                  </p>
                  <p className="text-sm text-neutral-600 flex items-center gap-2">
                    <Smartphone size={14} className="text-neutral-400" />
                    {elder.phoneModel}
                  </p>
                  <p className="text-sm text-neutral-600 flex items-center gap-2">
                    <Home size={14} className="text-neutral-400" />
                    {elder.address.slice(0, 12)}...
                  </p>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0"
              />
            </div>
          </Link>
        ))}
      </div>

      {filteredElders.length === 0 && (
        <div className="card p-12 text-center">
          <Search size={48} className="mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500">没有找到匹配的老人档案</p>
        </div>
      )}
    </div>
  );
}
