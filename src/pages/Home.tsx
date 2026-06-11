import { useState, useMemo } from 'react';
import { AlertTriangle, PackageMinus, Star, ShieldAlert, Search, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import MedicineCard from '@/components/MedicineCard';
import UseMedicineModal from '@/components/UseMedicineModal';
import RestockModal from '@/components/RestockModal';
import FloatingAddButton from '@/components/FloatingAddButton';
import { daysUntil, isExpired, isExpiringSoon } from '@/utils/dateUtils';
import type { Medicine } from '@/types';
import { Link } from 'react-router-dom';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  badgeCls: string;
  accentCls: string;
  medicines: Medicine[];
  onUse: (m: Medicine) => void;
  onRestock: (m: Medicine) => void;
  viewAllLink?: string;
  emptyText: string;
}

function Section({ title, icon, badgeCls, accentCls, medicines, onUse, onRestock, viewAllLink, emptyText }: SectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${accentCls} flex items-center justify-center`}>
            {icon}
          </div>
          <h2 className="font-display text-xl text-gray-800">{title}</h2>
          <span className={`${badgeCls}`}>{medicines.length}</span>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {medicines.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <p className="text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 fade-in-stagger">
          {medicines.map((m) => (
            <MedicineCard
              key={m.id}
              medicine={m}
              onUse={onUse}
              onRestock={onRestock}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const medicines = useStore((s) => s.medicines);
  const [search, setSearch] = useState('');
  const [useTarget, setUseTarget] = useState<Medicine | null>(null);
  const [restockTarget, setRestockTarget] = useState<Medicine | null>(null);

  const available = useMemo(
    () => medicines.filter((m) => !isExpired(m.expiryDate) && !m.disposed),
    [medicines]
  );

  const expiringSoon = useMemo(
    () =>
      available
        .filter((m) => isExpiringSoon(m.expiryDate))
        .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)),
    [available]
  );

  const lowStock = useMemo(
    () => available.filter((m) => m.quantity <= m.lowStockThreshold),
    [available]
  );

  const common = useMemo(
    () => available.filter((m) => m.isCommon),
    [available]
  );

  const childWarning = useMemo(
    () => available.filter((m) => m.childWarning),
    [available]
  );

  const filtered = (list: Medicine[]) =>
    search.trim()
      ? list.filter((m) => m.name.includes(search) || m.category.includes(search))
      : list;

  return (
    <div className="pb-24 md:pb-8">
      <div className="card p-5 mb-6 bg-gradient-to-br from-white via-primary-50/50 to-accent-50/50">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-display text-2xl text-gray-800 mb-1">
              你好 👋 家庭药箱状态一览
            </h2>
            <p className="text-sm text-gray-500">
              常备药品 <span className="font-semibold text-primary-600">{available.length}</span> 种 · 
              快过期 <span className="font-semibold text-warning-600">{expiringSoon.length}</span> 种 · 
              库存低 <span className="font-semibold text-danger-600">{lowStock.length}</span> 种
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索药品名称、品类..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      <Section
        title="快过期 · 30天内"
        icon={<AlertTriangle className="w-5 h-5 text-warning-600" />}
        badgeCls="badge-warning"
        accentCls="bg-warning-100"
        medicines={filtered(expiringSoon)}
        onUse={(m) => setUseTarget(m)}
        onRestock={(m) => setRestockTarget(m)}
        viewAllLink="/pending"
        emptyText="✨ 近期没有药品快过期，状态良好！"
      />

      <Section
        title="库存低 · 需补货"
        icon={<PackageMinus className="w-5 h-5 text-danger-600" />}
        badgeCls="badge-danger"
        accentCls="bg-danger-100"
        medicines={filtered(lowStock)}
        onUse={(m) => setUseTarget(m)}
        onRestock={(m) => setRestockTarget(m)}
        viewAllLink="/medicines"
        emptyText="✅ 所有药品库存充足！"
      />

      <Section
        title="常用药"
        icon={<Star className="w-5 h-5 text-accent-600" />}
        badgeCls="badge bg-accent-100 text-accent-700"
        accentCls="bg-accent-100"
        medicines={filtered(common)}
        onUse={(m) => setUseTarget(m)}
        onRestock={(m) => setRestockTarget(m)}
        emptyText="还没有标记常用药品，点击药品卡片添加常用吧~"
      />

      <Section
        title="儿童慎用"
        icon={<ShieldAlert className="w-5 h-5 text-danger-600" />}
        badgeCls="badge-danger"
        accentCls="bg-red-50"
        medicines={filtered(childWarning)}
        onUse={(m) => setUseTarget(m)}
        onRestock={(m) => setRestockTarget(m)}
        emptyText="暂无儿童慎用药品"
      />

      <UseMedicineModal medicine={useTarget} onClose={() => setUseTarget(null)} />
      <RestockModal medicine={restockTarget} onClose={() => setRestockTarget(null)} />
      <FloatingAddButton />
    </div>
  );
}
