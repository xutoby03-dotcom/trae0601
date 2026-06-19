import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stamp, Plus, Search, User, ShieldAlert, Hash } from 'lucide-react';
import { useStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import type { RiskLevel, SealStatus } from '@/types';

export default function SealsIndex() {
  const navigate = useNavigate();
  const seals = useStore((s) => s.seals);
  const [keyword, setKeyword] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SealStatus | 'all'>('all');

  const filteredSeals = useMemo(() => {
    return seals.filter((seal) => {
      const matchKeyword =
        keyword === '' ||
        seal.type.toLowerCase().includes(keyword.toLowerCase()) ||
        seal.sealNumber.toLowerCase().includes(keyword.toLowerCase()) ||
        seal.custodian.toLowerCase().includes(keyword.toLowerCase());
      const matchRisk = riskFilter === 'all' || seal.riskLevel === riskFilter;
      const matchStatus = statusFilter === 'all' || seal.status === statusFilter;
      return matchKeyword && matchRisk && matchStatus;
    });
  }, [seals, keyword, riskFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-800">印章档案</h1>
          <p className="text-sm text-primary-500 mt-1">管理所有印章的基本信息与状态</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/seals/new')}>
          <Plus className="w-4 h-4" />
          新增印章
        </button>
      </div>

      <div className="card-seal p-5">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="搜索印章类型、编号或保管人..."
              className="input-seal pl-10"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-600 font-medium">风险等级：</span>
            <select
              className="input-seal w-32"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
            >
              <option value="all">全部</option>
              <option value="low">低风险</option>
              <option value="medium">中风险</option>
              <option value="high">高风险</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-600 font-medium">状态：</span>
            <select
              className="input-seal w-32"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SealStatus | 'all')}
            >
              <option value="all">全部</option>
              <option value="available">可用</option>
              <option value="in_use">使用中</option>
              <option value="maintenance">维护中</option>
            </select>
          </div>
        </div>
      </div>

      {filteredSeals.length === 0 ? (
        <div className="card-seal p-16 text-center">
          <Stamp className="w-16 h-16 mx-auto text-primary-200 mb-4" />
          <p className="text-primary-500">暂无符合条件的印章</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSeals.map((seal) => (
            <div
              key={seal.id}
              className="card-seal p-5 cursor-pointer hover:-translate-y-1"
              onClick={() => navigate(`/seals/${seal.id}`)}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-seal-paper border border-primary-100 flex-shrink-0">
                  <img
                    src={seal.photoUrl}
                    alt={seal.type}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg font-semibold text-primary-800 truncate">
                      {seal.type}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Hash className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-sm text-primary-600">{seal.sealNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <StatusBadge type="seal" status={seal.status} />
                    <StatusBadge type="risk" status={seal.riskLevel} />
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-50 flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-600">保管人：{seal.custodian}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
