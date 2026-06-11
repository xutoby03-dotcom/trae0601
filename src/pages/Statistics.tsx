import { BarChart3, Users, Package, AlertTriangle, Banknote, TrendingUp, Minus } from 'lucide-react';
import { useRentalStore } from '../store/useStore';
import { calculatePersonCosts, getUnreturnedEquipments, getDepositDeductedRecords, formatCurrency, calculateRentalDays } from '../utils/costCalculator';
import { EQUIPMENT_TYPE_LABELS } from '../types';

export default function Statistics() {
  const { equipments, rentalRecords, persons } = useRentalStore();

  const personCosts = calculatePersonCosts(equipments, rentalRecords);
  const unreturnedItems = getUnreturnedEquipments(equipments, rentalRecords);
  const depositDeductedItems = getDepositDeductedRecords(equipments, rentalRecords);

  const totalRent = personCosts.reduce((sum, p) => sum + p.totalRent, 0);
  const totalDeposit = personCosts.reduce((sum, p) => sum + p.totalDeposit, 0);
  const totalDeducted = personCosts.reduce((sum, p) => sum + p.depositDeducted, 0);
  const totalNetPayable = personCosts.reduce((sum, p) => sum + p.netPayable, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-sky-100 text-sky-600',
      'bg-orange-100 text-orange-600',
      'bg-emerald-100 text-emerald-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-amber-100 text-amber-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">费用统计</h1>
            <p className="text-sm text-slate-500">查看每个人的费用和装备状态</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm">总租金</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalRent)}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm">总押金</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalDeposit)}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm">已扣押金</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalDeducted)}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <Minus className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm">应付总额</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalNetPayable)}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" />
            个人费用明细
          </h2>

          {personCosts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">暂无费用记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {personCosts.map((person) => (
                <div
                  key={person.personName}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(person.personName)}`}>
                    {person.personName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800">{person.personName}</h3>
                    <p className="text-xs text-slate-500 truncate">
                      装备：{person.equipmentNames.join('、')}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">租金</span>
                      <span className="font-medium text-sky-600 w-20 text-right">{formatCurrency(person.totalRent)}</span>
                    </div>
                    {person.depositDeducted > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-red-500">扣押金</span>
                        <span className="font-medium text-red-500 w-20 text-right">-{formatCurrency(person.depositDeducted)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
                      <span className="text-sm text-slate-700 font-medium">应付</span>
                      <span className="text-lg font-bold text-purple-600 w-20 text-right">
                        {formatCurrency(person.netPayable)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            未归还装备
            {unreturnedItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {unreturnedItems.length} 件
              </span>
            )}
          </h2>

          {unreturnedItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <p className="text-slate-400">所有装备均已归还</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unreturnedItems.map(({ equipment, record }) => {
                const days = calculateRentalDays(record.startDate, record.endDate);
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-3 border border-amber-200 bg-amber-50 rounded-xl"
                  >
                    <img
                      src={equipment.photo}
                      alt={equipment.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 truncate">{equipment.name}</h4>
                      <p className="text-sm text-slate-500">
                        {EQUIPMENT_TYPE_LABELS[equipment.type]} · {equipment.size}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(record.startDate)} ~ {formatDate(record.endDate)} · {days}天
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        使用中
                      </span>
                      <p className="text-xs text-slate-500 mt-1">使用人：{record.userName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            扣押金记录
            {depositDeductedItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                {depositDeductedItems.length} 条
              </span>
            )}
          </h2>

          {depositDeductedItems.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">暂无扣押金记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {depositDeductedItems.map(({ equipment, record, amount }) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-3 border border-red-200 bg-red-50 rounded-xl"
                >
                  <img
                    src={equipment.photo}
                    alt={equipment.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{equipment.name}</h4>
                    <p className="text-sm text-slate-500">使用人：{record.userName}</p>
                    {record.returnNote && (
                      <p className="text-xs text-red-600 mt-1">原因：{record.returnNote}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(amount)}</p>
                    <p className="text-xs text-slate-500">
                      {record.returnedAt ? formatDate(record.returnedAt) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100">
          <h3 className="font-semibold text-sky-800 text-sm mb-2">费用说明</h3>
          <ul className="text-xs text-sky-700 space-y-1">
            <li>• 租金 = 日租金 × 租赁天数 × 分摊比例</li>
            <li>• 押金在归还时如无损坏全额退还</li>
            <li>• 被扣押金会计入个人应付金额</li>
            <li>• 应付总额 = 租金 + 被扣押金</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
