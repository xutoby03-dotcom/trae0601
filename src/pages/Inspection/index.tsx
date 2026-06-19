import { useState } from 'react';
import { Thermometer, Droplets, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { useTeaStore } from '@/store/useTeaStore';
import type { AromaLevel, ColorLevel, SedimentLevel } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function InspectionPage() {
  const { teapots, batches, addInspection, checkBatchAbnormal, inspections, updateBatch } = useTeaStore();
  const [selectedTeapotId, setSelectedTeapotId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [temperature, setTemperature] = useState(80);
  const [aroma, setAroma] = useState<AromaLevel>('good');
  const [color, setColor] = useState<ColorLevel>('good');
  const [sediment, setSediment] = useState<SedimentLevel>('slight');
  const [waterAdded, setWaterAdded] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const activeBatches = batches.filter(
    (b) => b.status === 'active' && (!selectedTeapotId || b.teapotId === selectedTeapotId)
  );

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const selectedTeapot = teapots.find((t) => t.id === selectedBatch?.teapotId);

  const abnormal = selectedBatchId ? checkBatchAbnormal(selectedBatchId) : { isAbnormal: false, reason: '' };

  const isTempAbnormal = selectedTeapot && (
    temperature < selectedTeapot.targetTempMin || temperature > selectedTeapot.targetTempMax
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert('请选择批次');
      return;
    }

    const abnormalReasons: string[] = [];
    if (isTempAbnormal) {
      if (temperature < selectedTeapot!.targetTempMin) {
        abnormalReasons.push('温度低于保温目标');
      } else {
        abnormalReasons.push('温度高于保温目标');
      }
    }
    if (abnormal.isAbnormal) {
      abnormalReasons.push(abnormal.reason);
    }

    const isAbnormal = abnormalReasons.length > 0 || abnormal.isAbnormal;

    const shouldDiscard = isTempAbnormal && temperature < (selectedTeapot?.targetTempMin || 100) || abnormal.isAbnormal;

    addInspection({
      batchId: selectedBatchId,
      inspectTime: new Date().toISOString(),
      temperature,
      aroma,
      color,
      sediment,
      waterAdded,
      remainingAmount,
      isAbnormal,
      abnormalReason: abnormalReasons.length > 0 ? abnormalReasons.join('、') : undefined,
    });

    if (shouldDiscard) {
      updateBatch(selectedBatchId, { status: 'discarded' });
      alert('巡查记录已提交！该批次已异常报废！');
    } else {
      alert('巡查记录已提交！');
    }

    setSelectedBatchId('');
    setTemperature(80);
    setAroma('good');
    setColor('good');
    setSediment('slight');
    setWaterAdded(false);
    setRemainingAmount(0);
  };

  const aromaOptions: { value: AromaLevel; label: string; color: string }[] = [
    { value: 'excellent', label: '优秀', color: 'bg-matcha-500 text-white' },
    { value: 'good', label: '良好', color: 'bg-tea-500 text-white' },
    { value: 'fair', label: '一般', color: 'bg-amber-500 text-white' },
    { value: 'poor', label: '差', color: 'bg-danger-500 text-white' },
  ];

  const sedimentOptions: { value: SedimentLevel; label: string; color: string }[] = [
    { value: 'none', label: '无', color: 'bg-matcha-500 text-white' },
    { value: 'slight', label: '轻微', color: 'bg-tea-500 text-white' },
    { value: 'moderate', label: '中等', color: 'bg-amber-500 text-white' },
    { value: 'heavy', label: '严重', color: 'bg-danger-500 text-white' },
  ];

  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.inspectTime).getTime() - new Date(a.inspectTime).getTime())
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-tea p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-tea-800">巡查打卡</h2>
              <p className="text-sm text-tea-600 mt-1">记录茶汤温度和品质状态</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-tea-50 text-tea-600 rounded-xl hover:bg-tea-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showHistory ? '返回打卡' : '查看历史'}
            </button>
          </div>

          {showHistory ? (
            <div className="space-y-3">
              <h3 className="font-medium text-tea-700 mb-4">最近巡查记录</h3>
              {recentInspections.length === 0 ? (
                <p className="text-center text-tea-500 py-8">暂无巡查记录</p>
              ) : (
                recentInspections.map((inspection) => {
                  const batch = batches.find((b) => b.id === inspection.batchId);
                  const teapot = teapots.find((t) => t.id === batch?.teapotId);
                  return (
                    <div
                      key={inspection.id}
                      className={`p-4 rounded-xl border-2 ${
                        inspection.isAbnormal
                          ? 'border-danger-200 bg-danger-50'
                          : 'border-tea-100 bg-tea-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            inspection.isAbnormal ? 'bg-danger-100' : 'bg-matcha-100'
                          }`}>
                            {inspection.isAbnormal ? (
                              <AlertTriangle className="w-5 h-5 text-danger-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-matcha-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-tea-800">{teapot?.teaType}</p>
                            <p className="text-xs text-tea-500">
                              {format(new Date(inspection.inspectTime), 'M月d日 HH:mm', { locale: zhCN })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            inspection.isAbnormal ? 'text-danger-600' : 'text-tea-700'
                          }`}>
                            {inspection.temperature}°C
                          </p>
                          <p className="text-xs text-tea-500">
                            剩余 {inspection.remainingAmount}ml
                          </p>
                        </div>
                      </div>
                      {inspection.isAbnormal && inspection.abnormalReason && (
                        <p className="text-sm text-danger-600 mt-2 pl-13">
                          ⚠️ {inspection.abnormalReason}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    选择茶桶
                  </label>
                  <select
                    value={selectedTeapotId}
                    onChange={(e) => {
                      setSelectedTeapotId(e.target.value);
                      setSelectedBatchId('');
                    }}
                    className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">请选择茶桶</option>
                    {teapots.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.teaType}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    选择批次
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all bg-white"
                    disabled={!selectedTeapotId}
                  >
                    <option value="">请选择批次</option>
                    {activeBatches.map((b) => {
                      const batchAbnormal = checkBatchAbnormal(b.id);
                      return (
                        <option key={b.id} value={b.id}>
                          {format(new Date(b.brewTime), 'HH:mm')} 煮制
                          {batchAbnormal.isAbnormal ? ' ⚠️异常' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {selectedBatch && abnormal.isAbnormal && (
                <div className="flex items-center gap-3 p-4 bg-danger-50 border-2 border-danger-200 rounded-xl animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-danger-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-danger-700">⚠️ 批次异常</p>
                    <p className="text-sm text-danger-600">{abnormal.reason}</p>
                    <p className="text-xs text-danger-500 mt-1">请立即处理，禁止继续售卖！</p>
                  </div>
                </div>
              )}

              <div className={`p-6 rounded-2xl ${
                isTempAbnormal ? 'bg-danger-50' : 'bg-tea-50'
              }`}>
                <div className="text-center">
                  <p className="text-sm text-tea-600 mb-2">当前温度</p>
                  <div className={`text-6xl font-bold font-display mb-2 ${
                    isTempAbnormal ? 'text-danger-600' : 'text-tea-700'
                  }`}>
                    {temperature}°C
                  </div>
                  {selectedTeapot && (
                    <p className="text-sm text-tea-500">
                      目标范围: {selectedTeapot.targetTempMin}°C ~ {selectedTeapot.targetTempMax}°C
                    </p>
                  )}
                  {isTempAbnormal && (
                    <p className="text-sm text-danger-600 mt-2 font-medium">
                      ⚠️ 温度异常！
                    </p>
                  )}
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full mt-4 accent-tea-500"
                />
                <div className="flex justify-between text-xs text-tea-500 mt-1">
                  <span>50°C</span>
                  <span>100°C</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tea-700 mb-2">
                  香气评估
                </label>
                <div className="flex gap-2">
                  {aromaOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAroma(opt.value)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        aroma === opt.value
                          ? opt.color + ' shadow-lg scale-105'
                          : 'bg-tea-50 text-tea-600 hover:bg-tea-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tea-700 mb-2">
                  颜色评估
                </label>
                <div className="flex gap-2">
                  {aromaOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value as ColorLevel)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        color === opt.value
                          ? opt.color + ' shadow-lg scale-105'
                          : 'bg-tea-50 text-tea-600 hover:bg-tea-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tea-700 mb-2">
                  沉淀程度
                </label>
                <div className="flex gap-2">
                  {sedimentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSediment(opt.value)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        sediment === opt.value
                          ? opt.color + ' shadow-lg scale-105'
                          : 'bg-tea-50 text-tea-600 hover:bg-tea-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-3 p-4 bg-tea-50 rounded-xl cursor-pointer hover:bg-tea-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={waterAdded}
                      onChange={(e) => setWaterAdded(e.target.checked)}
                      className="w-5 h-5 accent-tea-500"
                    />
                    <Droplets className="w-5 h-5 text-tea-600" />
                    <span className="font-medium text-tea-700">已补水</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    剩余量 (ml)
                  </label>
                  <input
                    type="number"
                    value={remainingAmount || ''}
                    onChange={(e) => setRemainingAmount(Number(e.target.value))}
                    placeholder="请输入剩余量"
                    className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedBatchId}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  !selectedBatchId
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isTempAbnormal || abnormal.isAbnormal
                    ? 'bg-danger-500 text-white hover:bg-danger-600 shadow-danger/30 shadow-lg hover:shadow-xl'
                    : 'bg-matcha-500 text-white hover:bg-matcha-600 shadow-matcha/30 shadow-lg hover:shadow-xl'
                }`}
              >
                {(isTempAbnormal || abnormal.isAbnormal) ? '提交异常记录' : '提交巡查记录'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-tea p-6">
          <h3 className="font-display font-bold text-lg text-tea-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-tea-500" />
            今日概览
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-tea-50 rounded-xl">
              <span className="text-tea-600">在售批次</span>
              <span className="text-xl font-bold text-tea-800">
                {batches.filter((b) => b.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-danger-50 rounded-xl">
              <span className="text-danger-600">异常批次</span>
              <span className="text-xl font-bold text-danger-700">
                {batches.filter((b) => b.status === 'active' && checkBatchAbnormal(b.id).isAbnormal).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-matcha-50 rounded-xl">
              <span className="text-matcha-600">今日巡查</span>
              <span className="text-xl font-bold text-matcha-700">
                {inspections.filter((i) => {
                  const today = new Date().toDateString();
                  return new Date(i.inspectTime).toDateString() === today;
                }).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-tea p-6">
          <h3 className="font-display font-bold text-lg text-tea-800 mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-tea-500" />
            温度提醒
          </h3>
          <div className="space-y-2 text-sm text-tea-600">
            <p>• 温度低于目标范围：茶汤风味流失</p>
            <p>• 温度高于目标范围：茶叶苦涩</p>
            <p>• 超过售卖时限：茶汤变质风险</p>
            <p>• 出现异常请立即报废处理</p>
          </div>
        </div>
      </div>
    </div>
  );
}
