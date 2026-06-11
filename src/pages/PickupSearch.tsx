import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { usePackageStore } from '@/store/usePackageStore';
import type { PackageItem } from '@/types';

export default function PickupSearch() {
  const packages = usePackageStore((s) => s.packages);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PackageItem[]>([]);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const found = packages.filter(
      (pkg) =>
        pkg.status !== 'picked_up' &&
        (pkg.recipientName.toLowerCase().includes(q) ||
          pkg.pickupCode.toLowerCase().includes(q) ||
          pkg.shelfLocation.toLowerCase().includes(q) ||
          pkg.recipientPhone.endsWith(q))
    );
    setResults(found);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-primary-800 mb-6">取件签收</h2>

      <div className="bg-white rounded-xl border border-warm-300/50 p-5 mb-6">
        <h3 className="text-sm font-semibold text-primary-700 mb-1">查找包裹</h3>
        <p className="text-xs text-warm-500 mb-4">输入收件人姓名、取件码、货架位置或手机号尾号搜索</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="姓名 / 取件码 / 货架 / 手机尾号"
              className="w-full pl-9 pr-3 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm placeholder:text-warm-400 focus:border-primary-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-warm-500">找到 {results.length} 个待取包裹</h3>
          {results.map((pkg) => (
            <Link
              key={pkg.id}
              to={`/pickup/${pkg.id}`}
              className="block bg-white rounded-xl border border-warm-300/50 p-4 hover:shadow-md hover:border-primary-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-primary-800 text-sm">{pkg.recipientName}</span>
                    <span className="text-xs text-warm-500">{pkg.department}</span>
                  </div>
                  <div className="text-xs text-warm-500 space-x-3">
                    <span>{pkg.courierCompany}</span>
                    <span className="font-mono text-primary-600">{pkg.pickupCode}</span>
                    <span>货架 {pkg.shelfLocation}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-warm-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-warm-200 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-warm-400" />
          </div>
          <p className="text-warm-500 text-sm">未找到匹配的待取包裹</p>
        </div>
      )}
    </div>
  );
}
