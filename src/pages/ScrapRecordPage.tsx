import { useEffect, useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Frown,
  Meh,
  Smile,
  HelpCircle,
  UserCheck,
  Box,
  Save,
  Plus,
  History,
  Calendar,
  Clock,
  FileText,
  Inbox,
  Tag,
} from 'lucide-react';
import { ScrapReason, ScrapReasonLabel, ScrapRecord } from '@shared/types';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useAppStore } from '@/store';

const TYPES = ['面罩', '管路', '配件', '耗材', '药液', '消毒用品'];

const REASON_CONFIG = {
  [ScrapReason.DAMAGED]: {
    label: ScrapReasonLabel[ScrapReason.DAMAGED],
    icon: Frown,
    bg: 'bg-red-100',
    iconColor: 'text-red-600',
    borderActive: 'border-red-500',
    borderInactive: 'border-slate-200 hover:border-red-200',
    bgActive: 'bg-red-50',
    textColor: 'text-red-700',
  },
  [ScrapReason.YELLOWED]: {
    label: ScrapReasonLabel[ScrapReason.YELLOWED],
    icon: Meh,
    bg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderActive: 'border-amber-500',
    borderInactive: 'border-slate-200 hover:border-amber-200',
    bgActive: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  [ScrapReason.AGED]: {
    label: ScrapReasonLabel[ScrapReason.AGED],
    icon: AlertTriangle,
    bg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    borderActive: 'border-orange-500',
    borderInactive: 'border-slate-200 hover:border-orange-200',
    bgActive: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  [ScrapReason.OTHER]: {
    label: ScrapReasonLabel[ScrapReason.OTHER],
    icon: HelpCircle,
    bg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    borderActive: 'border-slate-500',
    borderInactive: 'border-slate-200 hover:border-slate-300',
    bgActive: 'bg-slate-50',
    textColor: 'text-slate-700',
  },
};

const NURSES = ['李护士', '王护士', '张护士', '刘护士'];

function ScrapRecordPage() {
  const {
    inventory,
    devices,
    fetchInventory,
    fetchDevices,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [records, setRecords] = useState<ScrapRecord[]>([]);

  const [itemType, setItemType] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<ScrapReason | ''>('');
  const [relatedDeviceId, setRelatedDeviceId] = useState('');
  const [operator, setOperator] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchDevices();
    if (activeTab === 'history') {
      loadRecords();
    }
  }, [activeTab, fetchInventory, fetchDevices]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await api.getScrapRecords({ pageSize: 100 });
      setRecords(result.data || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItemType('');
    setItemName('');
    setQuantity(1);
    setReason('');
    setRelatedDeviceId('');
    setOperator('');
    setRemark('');
  };

  const handleSubmit = async () => {
    if (!itemType) { alert('请选择配件类型'); return; }
    if (!itemName) { alert('请输入配件名称'); return; }
    if (!reason) { alert('请选择报废原因'); return; }
    if (!operator) { alert('请输入登记人'); return; }

    setSubmitting(true);
    try {
      const relatedDevice = devices.find((d) => d.id === relatedDeviceId);
      await api.createScrap({
        itemName,
        type: itemType,
        quantity,
        reason: reason as ScrapReason,
        relatedDeviceId: relatedDeviceId || undefined,
        relatedDeviceCode: relatedDevice?.code,
        operator,
        remark: remark || undefined,
      });
      alert('报废记录创建成功！');
      handleReset();
      setActiveTab('history');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getReasonBadgeClass = (r: ScrapReason) => {
    const config = REASON_CONFIG[r];
    return `bg-opacity-20 ${config.bg} ${config.textColor} border border-opacity-50`;
  };

  const inventoryForType = inventory.filter((i) => i.category === itemType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">报废管理</h1>
            <p className="text-sm text-slate-500">登记配件报废，查看历史记录</p>
          </div>
        </div>
      </div>

      <div className="card !p-0">
        <div className="flex border-b border-slate-200 px-6">
          <button
            onClick={() => setActiveTab('new')}
            className={activeTab === 'new' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <Plus className="w-4 h-4 inline mr-1.5" />
            新增报废
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={activeTab === 'history' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <History className="w-4 h-4 inline mr-1.5" />
            历史记录
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'new' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="card !p-0 !shadow-none !border-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="label">配件类型 <span className="text-red-500">*</span></label>
                    <select
                      className="select"
                      value={itemType}
                      onChange={(e) => {
                        setItemType(e.target.value);
                        setItemName('');
                      }}
                    >
                      <option value="">请选择类型</option>
                      {TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <Tag className="w-3.5 h-3.5 inline mr-1" />
                      配件名称 <span className="text-red-500">*</span>
                    </label>
                    {inventoryForType.length > 0 ? (
                      <select
                        className="select"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                      >
                        <option value="">请选择配件</option>
                        {inventoryForType.map((i) => (
                          <option key={i.id} value={i.name}>
                            {i.name}（库存: {i.currentStock}{i.unit}）
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text" className="input" placeholder="输入配件名称"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)} />
                    )}
                  </div>
                  <div>
                    <label className="label">
                      <Box className="w-3.5 h-3.5 inline mr-1" />
                      数量 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number" className="input text-center !py-2 flex-1"
                        min="1" value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="label mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                  报废原因 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(REASON_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = reason === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setReason(key as ScrapReason)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? `${config.borderActive} ${config.bgActive} shadow-md`
                            : `${config.borderInactive} bg-white hover:shadow-sm`
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`p-3 rounded-2xl mb-3 ${config.bg}`}>
                            <Icon className={`w-7 h-7 ${config.iconColor}`} />
                          </div>
                          <p className={`font-semibold ${isSelected ? config.textColor : 'text-slate-700'}`}>
                            {config.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">
                    <Box className="w-3.5 h-3.5 inline mr-1" />
                    关联设备 <span className="text-slate-400 text-xs font-normal">（选填）</span>
                  </label>
                  <select
                    className="select"
                    value={relatedDeviceId}
                    onChange={(e) => setRelatedDeviceId(e.target.value)}
                  >
                    <option value="">不关联设备</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>{d.code} - {d.clinicRoom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                    登记人 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="select"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  >
                    <option value="">请选择登记人</option>
                    {NURSES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  备注
                </label>
                <textarea
                  className="textarea h-28"
                  placeholder="描述报废的具体情况、发现问题的过程等..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button onClick={handleReset} className="btn-secondary px-8">
                  重置表单
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-danger px-8 !bg-red-600 hover:!bg-red-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? '提交中...' : '提交报废登记'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mr-3" />
                <span className="text-slate-400">加载中...</span>
              </div>
            ) : records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">配件名称</th>
                      <th className="table-th">类型</th>
                      <th className="table-th">数量</th>
                      <th className="table-th">报废原因</th>
                      <th className="table-th">关联设备</th>
                      <th className="table-th">登记人</th>
                      <th className="table-th">登记时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => {
                      const reasonConfig = REASON_CONFIG[record.reason];
                      const ReasonIcon = reasonConfig?.icon || AlertTriangle;
                      return (
                        <tr key={record.id} className="table-row-hover">
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-slate-100">
                                <Tag className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                              <span className="font-semibold text-slate-900">{record.itemName}</span>
                            </div>
                          </td>
                          <td className="table-td">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                              {record.type}
                            </span>
                          </td>
                          <td className="table-td">
                            <span className="text-red-600 font-bold text-lg">
                              ×{record.quantity}
                            </span>
                          </td>
                          <td className="table-td">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getReasonBadgeClass(record.reason)}`}>
                              <ReasonIcon className="w-3.5 h-3.5" />
                              {reasonConfig?.label || ScrapReasonLabel[record.reason]}
                            </span>
                          </td>
                          <td className="table-td">
                            {record.relatedDeviceCode ? (
                              <span className="text-sm text-slate-700 inline-flex items-center gap-1">
                                <Box className="w-3.5 h-3.5 text-slate-400" />
                                {record.relatedDeviceCode}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="table-td">
                            <span className="text-sm text-slate-700 inline-flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              {record.operator}
                            </span>
                          </td>
                          <td className="table-td">
                            <span className="text-sm text-slate-600 inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatDateTime(record.createdAt)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Inbox className="w-16 h-16 mb-4 text-slate-300" />
                <p className="font-medium text-lg">暂无报废记录</p>
                <p className="text-sm">点击"新增报废"标签页创建记录</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ScrapRecordPage;
