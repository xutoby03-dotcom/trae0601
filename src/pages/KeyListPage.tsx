import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Key,
  User,
  MapPin,
  Calendar,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  cn,
  getStatusBadgeClass,
  getStatusBarClass,
  getStatusText,
  formatDateCN,
  daysFromToday,
} from '../utils/helpers';
import type { KeyStatus } from '../types';

type FilterStatus = 'all' | KeyStatus;

const KeyListPage = () => {
  const keyArchives = useStore((s) => s.keyArchives);
  const trustees = useStore((s) => s.trustees);
  const borrowRecords = useStore((s) => s.borrowRecords);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [trusteeFilter, setTrusteeFilter] = useState<string>('all');

  const archivesWithMeta = useMemo(() => {
    return keyArchives.map((k) => {
      const trustee = trustees.find((t) => t.id === k.trusteeId);
      const activeBorrow = borrowRecords.find(
        (r) => r.keyArchiveId === k.id && !r.isReturned
      );
      const computedStatus: KeyStatus = activeBorrow
        ? 'borrowed'
        : k.status === 'borrowed'
          ? 'available'
          : k.status;
      return {
        ...k,
        trustee,
        activeBorrow,
        computedStatus,
        unverifiedDays: daysFromToday(k.lastVerifiedDate),
      };
    });
  }, [keyArchives, trustees, borrowRecords]);

  const filtered = useMemo(() => {
    return archivesWithMeta.filter((k) => {
      if (statusFilter !== 'all' && k.computedStatus !== statusFilter) return false;
      if (trusteeFilter !== 'all' && k.trusteeId !== trusteeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          k.lockName.toLowerCase().includes(s) ||
          k.lockLocation.toLowerCase().includes(s) ||
          k.storageLocation.toLowerCase().includes(s) ||
          k.trustee?.name.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [archivesWithMeta, search, statusFilter, trusteeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-800">
            🔑 钥匙档案
          </h2>
          <p className="text-navy-500 text-sm mt-1">
            共 {keyArchives.length} 组钥匙档案，{filtered.length} 条符合筛选
          </p>
        </div>
        <Link to="/keys/new" className="btn-accent btn-lg shrink-0 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          新增钥匙档案
        </Link>
      </div>

      <div className="card p-4 md:p-5 animate-fade-in-up stagger-1">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索门锁名称、托管人、存放位置..."
              className="input pl-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="appearance-none input pl-9 pr-9 cursor-pointer h-[52px] min-w-[120px]"
              >
                <option value="all">全部状态</option>
                <option value="available">可借用</option>
                <option value="borrowed">借用中</option>
                <option value="inactive">已停用</option>
              </select>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <select
                value={trusteeFilter}
                onChange={(e) => setTrusteeFilter(e.target.value)}
                className="appearance-none input pl-9 pr-9 cursor-pointer h-[52px] min-w-[140px]"
              >
                <option value="all">全部托管人</option>
                {trustees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-12 text-center animate-fade-in-up">
            <div className="w-20 h-20 mx-auto rounded-full bg-cream-200 flex items-center justify-center text-4xl mb-4">
              🔍
            </div>
            <p className="text-navy-600 font-medium">没有找到匹配的钥匙档案</p>
            <p className="text-navy-400 text-sm mt-1">试试调整筛选条件或新增一组档案</p>
            <Link to="/keys/new" className="btn-secondary mt-4">
              <Plus className="w-4 h-4" /> 新增钥匙档案
            </Link>
          </div>
        ) : (
          filtered.map((k, i) => {
            const delay = `stagger-${(i % 6) + 1}`;
            return (
              <Link
                key={k.id}
                to={`/keys/${k.id}`}
                className={cn(
                  'card card-hover relative overflow-hidden animate-fade-in-up group',
                  delay
                )}
              >
                <div className={getStatusBarClass(k.computedStatus)} />
                <div className="p-5 pl-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-lg font-bold text-navy-800 truncate">
                          {k.lockName}
                        </h3>
                        <span
                          className={cn(
                            'badge !px-1.5 !py-0.5',
                            getStatusBadgeClass(k.computedStatus)
                          )}
                        >
                          {getStatusText(k.computedStatus)}
                        </span>
                        {k.coreReplacedDate && !k.oldKeysRecovered && (
                          <span className="badge bg-navy-100 text-navy-700 !px-1.5 !py-0.5">
                            🔒 换锁未回收
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy-400 mt-1">{k.lockLocation}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                      <Key className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-navy-500">
                      <User className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span className="truncate">
                        {k.trustee?.name || '未知托管人'}
                        <span className="text-navy-300 ml-1">· {k.trustee?.relation}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-navy-500">
                      <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span className="truncate">{k.storageLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-navy-500">
                      <Package className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span>共 {k.totalQuantity} 把钥匙</span>
                    </div>
                    <div className="flex items-center gap-2 text-navy-500">
                      <Calendar className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span>
                        上次核对：{formatDateCN(k.lastVerifiedDate)}
                        {k.unverifiedDays > 60 && (
                          <span
                            className={cn(
                              'ml-2 text-xs font-medium',
                              k.unverifiedDays > 90 ? 'text-coral-600' : 'text-amber-600'
                            )}
                          >
                            ({k.unverifiedDays}天前
                            {k.unverifiedDays > 90 && ' ⚠️'}）
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {k.activeBorrow && (
                    <div className="mt-4 p-3 rounded-xl bg-coral-50 border border-coral-100">
                      <p className="text-xs font-medium text-coral-700 mb-1">
                        🔴 当前借用中
                      </p>
                      <p className="text-sm text-coral-800">
                        <span className="font-semibold">{k.activeBorrow.borrowerName}</span>
                        <span className="text-coral-500"> · </span>
                        {k.activeBorrow.reason}
                      </p>
                      <p className="text-xs text-coral-600 mt-1">
                        借出：{formatDateCN(k.activeBorrow.borrowDate)} · 预计归还：
                        {formatDateCN(k.activeBorrow.expectedReturnDate)}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between">
                    <span className="text-xs text-navy-400">
                      交付：{formatDateCN(k.deliveryDate)}
                    </span>
                    <span className="text-sm font-medium text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      查看详情
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default KeyListPage;
