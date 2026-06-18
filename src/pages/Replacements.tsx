import { useState } from 'react';
import Header from '../components/Header';
import { SectionTitle, formatDate, DaysRemainingChip } from '../components/ui';
import { useAppStore } from '../store';
import {
  Wand2,
  FileText,
  Filter,
  User,
  Hash,
  CalendarDays,
  Plus,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Package,
} from 'lucide-react';
import dayjs from 'dayjs';

interface FormData {
  oldDays: number;
  batchNo: string;
  installer: string;
  note: string;
}

const TODAY = '2026-06-19';

export default function Replacements() {
  const devices = useAppStore((s) => s.devices);
  const batches = useAppStore((s) => s.batches);
  const replacements = useAppStore((s) => s.replacements);
  const thresholds = useAppStore((s) => s.thresholds);
  const getRemainingFilterDays = useAppStore((s) => s.getRemainingFilterDays);
  const getTotalStockBySpec = useAppStore((s) => s.getTotalStockBySpec);
  const addReplacement = useAppStore((s) => s.addReplacement);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [form, setForm] = useState<FormData>({
    oldDays: 0,
    batchNo: '',
    installer: '管理员',
    note: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const availableBatches = selectedDevice
    ? batches.filter((b) => b.spec === selectedDevice.filterSpec && b.quantity > 0)
    : [];
  const selectedBatch = batches.find((b) => b.batchNo === form.batchNo);

  const calcUsedDays = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return 0;
    return dayjs(TODAY).diff(device.currentFilterStartDate, 'day');
  };

  const handleSelectDevice = (id: string) => {
    setSelectedDeviceId(id);
    const used = calcUsedDays(id);
    const device = devices.find((d) => d.id === id);
    const avail = device
      ? batches.filter((b) => b.spec === device.filterSpec && b.quantity > 0)
      : [];
    setForm({
      oldDays: used,
      batchNo: avail.length > 0 ? avail[0].batchNo : '',
      installer: '管理员',
      note: '',
    });
  };

  const handleStep1Next = () => {
    if (!selectedDeviceId) return;
    setStep(2);
  };

  const handleStep2Prev = () => setStep(1);
  const handleStep2Next = () => {
    if (!form.batchNo || form.oldDays <= 0 || !form.installer) return;
    setStep(3);
  };

  const handleStep3Prev = () => setStep(2);
  const handleConfirm = () => {
    const ok = addReplacement(selectedDeviceId, form.oldDays, form.batchNo, form.installer, form.note);
    if (ok) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStep(1);
        setSelectedDeviceId('');
        setForm({ oldDays: 0, batchNo: '', installer: '管理员', note: '' });
      }, 3000);
    }
  };

  const remainingAfterDeduct = selectedDevice
    ? getTotalStockBySpec(selectedDevice.filterSpec) - 1
    : 0;
  const showStockWarn = remainingAfterDeduct <= thresholds.safeStockPerSpec;

  const sortedReplacements = [...replacements].sort((a, b) =>
    dayjs(b.date).diff(dayjs(a.date))
  );

  return (
    <div className="min-h-screen">
      <Header title="滤芯更换记录" subtitle="每次更换精准记录，全链路可追溯" />

      <div className="px-8 py-6 flex flex-col gap-8">
        <div className="base-card p-6 animate-fade-in-up stagger-1">
          <SectionTitle
            icon={Wand2}
            title="登记滤芯更换"
            desc="三步完成更换记录，自动扣减库存"
          />

          <div className="flex items-center mb-6">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step >= s
                        ? 'bg-btn-primary text-white shadow-btn-primary'
                        : 'bg-white border-2 border-surface-border text-brand-400'
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step >= s ? 'text-brand-700' : 'text-brand-400'
                    }`}
                  >
                    {s === 1 ? '选择设备' : s === 2 ? '填写信息' : '完成'}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all duration-300 ${
                      step > s ? 'bg-brand-400' : 'bg-surface-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {showSuccess && (
            <div className="mb-5 p-5 rounded-xl bg-air-excellent/10 border-2 border-air-excellent/40 flex items-center gap-3 animate-fade-in-up">
              <div className="w-12 h-12 rounded-full bg-air-excellent flex items-center justify-center shrink-0">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-air-excellent">登记成功！</p>
                <p className="text-sm text-brand-500">库存已扣减，设备滤芯日期已更新。3秒后重置向导…</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {devices.map((d) => {
                  const remaining = getRemainingFilterDays(d.id);
                  const selected = selectedDeviceId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDevice(d.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-surface-border hover:border-brand-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-lg font-bold text-brand-800">{d.room}</span>
                        {selected && (
                          <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-brand-500 mb-2">{d.model}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="tag bg-brand-100 text-brand-700">
                          <Filter className="w-3 h-3" />
                          {d.filterSpec}
                        </span>
                      </div>
                      <DaysRemainingChip days={remaining} />
                    </div>
                  );
                })}
              </div>
              <button
                className="primary-btn"
                disabled={!selectedDeviceId}
                onClick={handleStep1Next}
              >
                下一步 填写更换信息
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && selectedDevice && (
            <div>
              <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-100 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-base font-bold text-brand-800">
                      {selectedDevice.room} · {selectedDevice.model}
                    </p>
                    <p className="text-xs text-brand-500 mt-0.5">
                      滤芯规格：{selectedDevice.filterSpec}
                    </p>
                  </div>
                  <DaysRemainingChip days={getRemainingFilterDays(selectedDevice.id)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-sm">
                <div>
                  <label className="label-base">
                    <Hash className="w-3.5 h-3.5 inline mr-1" />
                    旧滤芯实际使用天数
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    value={form.oldDays}
                    min={1}
                    onChange={(e) =>
                      setForm({ ...form, oldDays: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="label-base">
                    <Package className="w-3.5 h-3.5 inline mr-1" />
                    新滤芯批次
                  </label>
                  <select
                    className="input-base"
                    value={form.batchNo}
                    onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                  >
                    <option value="">请选择批次</option>
                    {availableBatches.map((b) => (
                      <option key={b.batchNo} value={b.batchNo}>
                        {b.batchNo} · 剩{b.quantity}件 · {b.supplier || '未知供应商'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-base">
                    <User className="w-3.5 h-3.5 inline mr-1" />
                    安装人
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    value={form.installer}
                    onChange={(e) => setForm({ ...form, installer: e.target.value })}
                    placeholder="请输入安装人姓名"
                  />
                </div>

                <div>
                  <label className="label-base">
                    <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
                    更换日期
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="input-base bg-brand-50 cursor-not-allowed"
                    value={formatDate(TODAY)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-base">更换备注</label>
                  <textarea
                    className="input-base resize-none"
                    rows={1}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="可选：如更换原因、异常情况等"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button className="secondary-btn" onClick={handleStep2Prev}>
                  上一步
                </button>
                <button
                  className="primary-btn"
                  disabled={!form.batchNo || form.oldDays <= 0 || !form.installer}
                  onClick={handleStep2Next}
                >
                  下一步 确认扣减库存
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedDevice && selectedBatch && (
            <div>
              <div className="p-5 rounded-xl bg-brand-50 border border-brand-100 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
                  <span className="text-base font-black text-brand-800">请确认更换信息</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-brand-500 mb-1">设备</p>
                    <p className="font-bold text-brand-800">
                      {selectedDevice.room} · {selectedDevice.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-500 mb-1">滤芯规格</p>
                    <p className="font-bold text-brand-800">{selectedDevice.filterSpec}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-500 mb-1">旧滤芯实际天数</p>
                    <p className="font-bold text-brand-800 font-mono">
                      {form.oldDays} 天
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-500 mb-1">新滤芯批次</p>
                    <p className="font-bold font-mono text-brand-800">
                      {selectedBatch.batchNo}
                    </p>
                    <p className="text-xs text-brand-500">
                      {selectedBatch.supplier || '未知供应商'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-500 mb-1">安装人</p>
                    <p className="font-bold text-brand-800">{form.installer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-500 mb-1">更换日期</p>
                    <p className="font-bold text-brand-800">{formatDate(TODAY)}</p>
                  </div>
                  {form.note && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-brand-500 mb-1">备注</p>
                      <p className="font-medium text-brand-700">{form.note}</p>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl mb-5 flex items-start gap-3 ${
                  showStockWarn ? 'warn-card' : 'bg-brand-50 border border-brand-100'
                }`}
              >
                {showStockWarn ? (
                  <AlertTriangle className="w-5 h-5 text-warn-600 shrink-0 mt-0.5" />
                ) : (
                  <Package className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-bold ${
                      showStockWarn ? 'text-warn-700' : 'text-brand-800'
                    }`}
                  >
                    批次出库后，{selectedDevice.filterSpec} 剩余 {remainingAfterDeduct} 件
                  </p>
                  {showStockWarn && (
                    <p className="text-xs text-warn-600 mt-1">
                      已低于安全库存（{thresholds.safeStockPerSpec}件），建议尽快采购补货。
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button className="secondary-btn" onClick={handleStep3Prev}>
                  返回修改
                </button>
                <button className="primary-btn" onClick={handleConfirm}>
                  <CheckCircle className="w-4 h-4" />
                  确认登记更换
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="base-card overflow-hidden animate-fade-in-up stagger-3">
          <div className="p-6 pb-0">
            <SectionTitle
              icon={FileText}
              title="更换历史"
              desc="全部更换记录一览"
              action={
                <button className="ghost-btn">
                  <Filter className="w-4 h-4" />
                  筛选
                </button>
              }
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50/80 text-brand-700">
                  <th className="py-3 px-4 text-left font-bold">更换日期</th>
                  <th className="py-3 px-4 text-left font-bold">设备</th>
                  <th className="py-3 px-4 text-left font-bold">旧滤芯天数</th>
                  <th className="py-3 px-4 text-left font-bold">新批次</th>
                  <th className="py-3 px-4 text-left font-bold">安装人</th>
                  <th className="py-3 px-4 text-left font-bold">剩余库存</th>
                  <th className="py-3 px-4 text-left font-bold">备注</th>
                </tr>
              </thead>
              <tbody>
                {sortedReplacements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 px-4 text-center text-brand-400"
                    >
                      暂无更换记录
                    </td>
                  </tr>
                ) : (
                  sortedReplacements.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-surface-border hover:bg-brand-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-brand-700">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-800">
                        {r.deviceName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-brand-700">
                        {r.oldFilterDays}天
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-brand-800">
                          {r.newFilterBatch}
                        </p>
                        <p className="text-xs text-brand-500 mt-0.5">
                          {r.newFilterSpec}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-brand-700">
                        {r.installer}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-brand-700">
                        {r.remainingStock}件
                      </td>
                      <td className="py-3.5 px-4 text-brand-500 text-xs">
                        {r.note || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
