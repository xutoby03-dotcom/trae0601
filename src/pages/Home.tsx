import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, Package, ShieldAlert, Plus, ClipboardList, Pill, ChevronRight, Thermometer, UtensilsCrossed, Bandage, Shield } from 'lucide-react';
import { useMedicineStore } from '@/store/medicineStore';
import { CATEGORY_LABELS, ESSENTIAL_CATEGORIES, MedicineCategory } from '@/types';
import { getMissingCategories } from '@/utils/medicine';
import StatCard from '@/components/StatCard';
import MedicineCard from '@/components/MedicineCard';
import { getMedicineStatus } from '@/utils/medicine';

export default function Home() {
  const { 
    medicines, 
    familyMembers,
    getExpiringMedicines, 
    getExpiredMedicines, 
    getLowStockMedicines,
    getContraindicatedMedicines
  } = useMedicineStore();

  const expiringMedicines = getExpiringMedicines();
  const expiredMedicines = getExpiredMedicines();
  const lowStockMedicines = getLowStockMedicines();
  
  const totalContraindicated = familyMembers.reduce(
    (sum, member) => sum + getContraindicatedMedicines(member.id).length,
    0
  );

  const missingCategories = getMissingCategories(medicines);

  const recentMedicines = [...medicines]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const categoryIcons: Record<MedicineCategory, typeof Thermometer> = {
    [MedicineCategory.COLD_FEVER]: Thermometer,
    [MedicineCategory.GASTROINTESTINAL]: UtensilsCrossed,
    [MedicineCategory.TRAUMA]: Bandage,
    [MedicineCategory.ALLERGY]: Shield,
    [MedicineCategory.CHRONIC]: Pill,
    [MedicineCategory.OTHER]: Pill,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-xl shadow-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">欢迎回来 👋</h2>
            <p className="text-primary-100 text-sm">
              共登记 {medicines.length} 种药品，让我们一起守护家人健康
            </p>
          </div>
          <div className="hidden sm:block">
            <Pill className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="临期药品"
          value={expiringMedicines.length}
          icon={Clock}
          color="orange"
          description="30天内到期"
        />
        <StatCard
          title="已过期"
          value={expiredMedicines.length}
          icon={AlertTriangle}
          color="red"
          description="请及时清理"
        />
        <StatCard
          title="库存不足"
          value={lowStockMedicines.length}
          icon={Package}
          color="warning"
          description="剩余≤2份"
        />
        <StatCard
          title="禁忌提醒"
          value={totalContraindicated}
          icon={ShieldAlert}
          color="blue"
          description="家庭成员禁忌"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {expiredMedicines.length > 0 && (
            <div className="bg-danger-50 border border-danger-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-danger-600" />
                <h3 className="font-semibold text-danger-800">已过期药品</h3>
              </div>
              <div className="space-y-2">
                {expiredMedicines.slice(0, 2).map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
                {expiredMedicines.length > 2 && (
                  <Link
                    to="/medicines"
                    className="flex items-center justify-center gap-1 text-sm text-danger-600 hover:text-danger-700 font-medium"
                  >
                    查看全部 {expiredMedicines.length} 种过期药品
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {expiringMedicines.length > 0 && expiredMedicines.length === 0 && (
            <div className="bg-warning-50 border border-warning-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-warning-600" />
                <h3 className="font-semibold text-warning-800">即将过期</h3>
              </div>
              <div className="space-y-2">
                {expiringMedicines.slice(0, 2).map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            </div>
          )}

          {missingCategories.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800">关键类别缺少药品</h3>
              </div>
              <p className="text-sm text-amber-700 mb-3">
                以下应急类别还没有备用药品，建议及时补充：
              </p>
              <div className="flex flex-wrap gap-2">
                {missingCategories.map((category) => {
                  const Icon = categoryIcons[category];
                  return (
                    <Link
                      key={category}
                      to={`/medicines/add?category=${category}`}
                      className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">
                        + 补充{CATEGORY_LABELS[category]}类
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {recentMedicines.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">最近更新</h3>
                <Link
                  to="/medicines"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentMedicines.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} showDetails />
                ))}
              </div>
            </div>
          )}

          {medicines.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">药箱还是空的</h3>
              <p className="text-gray-500 mb-4">
                点击下方按钮开始登记您的第一种药品
              </p>
              <Link
                to="/medicines/add"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transition-all"
              >
                <Plus className="w-5 h-5" />
                立即登记
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">快捷操作</h3>
            <div className="space-y-3">
              <Link
                to="/medicines/add"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl hover:from-primary-100 hover:to-primary-200 transition-colors group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">登记新药品</p>
                  <p className="text-xs text-gray-500">添加药品信息和照片</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>

              <Link
                to="/records/add"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-colors group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">记录用药</p>
                  <p className="text-xs text-gray-500">记录家人用药情况</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">药品分类</h3>
            <div className="grid grid-cols-2 gap-2">
              {ESSENTIAL_CATEGORIES.map((category) => {
                const Icon = categoryIcons[category];
                const count = medicines.filter(m => m.category === category).length;
                const isMissing = missingCategories.includes(category);
                return (
                  <Link
                    key={category}
                    to={`/medicines?category=${category}`}
                    className={`p-3 rounded-xl border transition-all ${
                      isMissing 
                        ? 'bg-amber-50 border-amber-200 hover:border-amber-400' 
                        : 'bg-gray-50 border-gray-100 hover:border-primary-200 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isMissing ? 'text-amber-600' : 'text-primary-600'}`} />
                      <span className="text-xs font-medium text-gray-700">{CATEGORY_LABELS[category]}</span>
                    </div>
                    <p className={`text-lg font-bold ${isMissing ? 'text-amber-600' : 'text-gray-800'}`}>
                      {count}
                      {isMissing && <span className="text-xs font-normal ml-1">待补充</span>}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
