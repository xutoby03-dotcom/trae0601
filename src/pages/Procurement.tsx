import { useStore } from '../store/useStore';
import { ProcurementItemCard } from '../components/ProcurementItemCard';
import { RiskBadge } from '../components/RiskBadge';
import { ShoppingCart, AlertTriangle, Download, Calendar, Shield, MapPin } from 'lucide-react';
import { getDaysSince, formatDate } from '../utils/dateUtils';

export const Procurement = () => {
  const { getProcurementList, getHighRiskBathrooms, bathrooms } = useStore();

  const procurementList = getProcurementList();
  const highRiskBathrooms = getHighRiskBathrooms();

  const totalItems = procurementList.reduce((sum, item) => sum + item.spec.quantity, 0);
  const highUrgencyCount = procurementList.filter((i) => i.urgency === 'high').length;

  const handleExport = () => {
    let content = '下月采购清单\n';
    content += '================\n\n';

    procurementList.forEach((item, index) => {
      content += `${index + 1}. ${item.spec.name}\n`;
      content += `   浴室: ${item.bathroomName}\n`;
      content += `   尺寸: ${item.spec.size}\n`;
      content += `   材质: ${item.spec.material}\n`;
      content += `   吸盘: ${item.spec.suctionCups}个\n`;
      content += `   厚度: ${item.spec.thickness}\n`;
      content += `   颜色: ${item.spec.color}\n`;
      content += `   数量: ${item.spec.quantity}件\n`;
      content += `   紧急程度: ${item.urgency === 'high' ? '紧急' : item.urgency === 'medium' ? '中等' : '低'}\n`;
      if (item.spec.notes) {
        content += `   备注: ${item.spec.notes}\n`;
      }
      content += '\n';
    });

    if (highRiskBathrooms.length > 0) {
      content += '高风险浴室提醒\n';
      content += '================\n\n';
      highRiskBathrooms.forEach((bathroom) => {
        content += `• ${bathroom.name} (${bathroom.location})\n`;
        content += `  风险等级: ${bathroom.riskLevel === 'danger' ? '高风险' : '需注意'}\n`;
        content += `  已使用: ${getDaysSince(bathroom.purchaseDate)}天\n`;
        content += `  上次检查: ${bathroom.lastInspectionDate ? formatDate(bathroom.lastInspectionDate) : '未检查'}\n`;
        content += '\n';
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `采购清单_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">采购清单与风险提醒</h2>
          <p className="text-gray-600">
            下月需要采购的物品及高风险浴室提醒
          </p>
        </div>
        {procurementList.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all duration-300 hover:shadow-lg"
          >
            <Download size={18} />
            导出清单
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-white" size={20} />
            </div>
            <span className="text-orange-700 font-medium">待采购物品</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{totalItems} 件</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <span className="text-red-700 font-medium">紧急采购</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{highUrgencyCount} 项</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <span className="text-amber-700 font-medium">高风险浴室</span>
          </div>
          <div className="text-3xl font-bold text-amber-600">{highRiskBathrooms.length} 个</div>
        </div>
      </div>

      {highRiskBathrooms.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900">高风险浴室提醒</h3>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <p className="text-red-700 mb-4 font-medium">
              以下浴室存在较高安全风险，请优先处理：
            </p>
            <div className="space-y-3">
              {highRiskBathrooms.map((bathroom) => (
                <div
                  key={bathroom.id}
                  className="bg-white rounded-xl p-4 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-red-500" size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{bathroom.name}</span>
                        <RiskBadge level={bathroom.riskLevel} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500">{bathroom.location}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          已使用 <span className="font-medium">{getDaysSince(bathroom.purchaseDate)}</span> 天
                        </span>
                        <span className="text-gray-600">
                          上次检查 <span className="font-medium">{bathroom.lastInspectionDate ? formatDate(bathroom.lastInspectionDate) : '未检查'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">建议措施</div>
                    <div className="text-sm text-red-600 font-medium">
                      {bathroom.moldStatus === 'severe' || bathroom.suctionStatus === 'poor'
                        ? '立即更换防滑垫'
                        : '尽快安排检查更换'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-orange-500" size={20} />
          <h3 className="text-lg font-bold text-gray-900">下月采购清单</h3>
        </div>

        {procurementList.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ShoppingCart size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">暂无采购需求</h3>
            <p className="text-gray-500">当前所有浴室状态良好，无需采购新的防滑垫</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {procurementList.map((item, index) => (
              <div key={item.spec.id} style={{ animationDelay: `${index * 100}ms` }}>
                <ProcurementItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
