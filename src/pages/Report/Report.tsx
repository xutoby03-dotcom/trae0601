import { useState } from 'react';
import { useTablewareStore } from '../../store/useTablewareStore';
import {
  Camera,
  MapPin,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Clock,
  ChevronRight,
  ImagePlus,
} from 'lucide-react';
import { windows, tablewareList, severityLabels } from '../../data/mockData';
import type { SeverityLevel } from '../../types';
import { formatDateTime, cn } from '../../utils/format';

const damageTypes = [
  { id: 'crack', label: '裂纹', icon: '📏' },
  { id: 'chip', label: '缺角', icon: '🔲' },
  { id: 'deformation', label: '变形', icon: '📐' },
  { id: 'oil', label: '油污残留', icon: '💧' },
  { id: 'other', label: '其他问题', icon: '❓' },
];

const Report = () => {
  const { addRepairReport, tablewareList: tablewares } = useTablewareStore();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [reportId, setReportId] = useState('');
  const [photo, setPhoto] = useState('');
  const [windowId, setWindowId] = useState('');
  const [tablewareId, setTablewareId] = useState('');
  const [damageType, setDamageType] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('moderate');
  const [remark, setRemark] = useState('');
  const [reporter, setReporter] = useState('');
  const [showWindowPicker, setShowWindowPicker] = useState(false);
  const [showDamagePicker, setShowDamagePicker] = useState(false);
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);
  const [showTablewarePicker, setShowTablewarePicker] = useState(false);

  const selectedWindow = windows.find((w) => w.id === windowId);
  const selectedTableware = tablewares.find((t) => t.id === tablewareId);
  const selectedDamageType = damageTypes.find((d) => d.id === damageType);

  const handlePhotoUpload = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
    ];
    setPhoto(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
  };

  const canSubmit = photo && windowId && damageType && tablewareId;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const newReport = {
      tablewareId,
      tablewareBatchNo: selectedTableware?.batchNo || '',
      windowId,
      windowName: selectedWindow?.name || '',
      photo,
      damageType: selectedDamageType?.label || '',
      severity,
      reporter: reporter || '匿名',
      reportTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remark,
    };

    addRepairReport(newReport);
    setReportId('RPT' + Date.now().toString().slice(-8));
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    setPhoto('');
    setWindowId('');
    setTablewareId('');
    setDamageType('');
    setSeverity('moderate');
    setRemark('');
    setReporter('');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-success-500/30 animate-bounce-in">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">提交成功</h1>
          <p className="text-gray-500 mb-8 text-center">
            感谢您的反馈，我们会尽快处理
          </p>

          <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">报修编号</span>
                <span className="font-mono font-semibold text-primary-600">
                  {reportId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">取餐窗口</span>
                <span className="font-medium text-gray-900">
                  {selectedWindow?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">问题类型</span>
                <span className="font-medium text-gray-900">
                  {selectedDamageType?.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">严重程度</span>
                <span
                  className={cn(
                    'font-medium',
                    severity === 'severe'
                      ? 'text-danger-500'
                      : severity === 'moderate'
                      ? 'text-warning-500'
                      : 'text-success-500'
                  )}
                >
                  {severityLabels[severity]}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-warning-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">预计24小时内处理完成</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={handleReset}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
            >
              继续报修
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">餐具破损报修</h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 overflow-auto">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">发现破损餐具？</h2>
                <p className="text-sm text-white/80 mt-1">
                  拍照上传，快速报修，我们将立即处理
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-500" />
              破损照片
            </h3>
            {photo ? (
              <div className="relative">
                <img
                  src={photo}
                  alt="破损照片"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={() => setPhoto('')}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={handlePhotoUpload}
                className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors bg-gray-50"
              >
                <ImagePlus className="w-10 h-10 mb-2" />
                <span className="text-sm">点击上传破损照片</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="font-medium text-gray-900 p-4 pb-0">选择餐具批次</h3>
            <button
              onClick={() => setShowTablewarePicker(true)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <span className="text-lg">🍽️</span>
                </div>
                <div className="text-left">
                  <p
                    className={cn(
                      'font-medium',
                      selectedTableware ? 'text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {selectedTableware?.batchNo || '请选择餐具批次'}
                  </p>
                  {selectedTableware && (
                    <p className="text-xs text-gray-500">
                      {selectedTableware.quantity}件 · {selectedTableware.material}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowWindowPicker(true)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-success-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-0.5">取餐窗口</p>
                  <p
                    className={cn(
                      'font-medium',
                      selectedWindow ? 'text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {selectedWindow?.name || '请选择取餐窗口'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowDamagePicker(true)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning-50 rounded-xl flex items-center justify-center">
                  <span className="text-lg">🔍</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-0.5">问题类型</p>
                  <p
                    className={cn(
                      'font-medium',
                      selectedDamageType ? 'text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {selectedDamageType?.label || '请选择问题类型'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowSeverityPicker(true)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-danger-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-0.5">严重程度</p>
                  <p className="font-medium text-gray-900">
                    {severityLabels[severity]}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              补充说明
            </h3>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              placeholder="请描述具体的破损情况（选填）"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none text-sm"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3">您的称呼（选填）</h3>
            <input
              type="text"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="方便我们联系您反馈处理结果"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'w-full py-3.5 font-medium rounded-xl transition-all',
              canSubmit
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/30'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            提交报修
          </button>
        </div>
      </div>

      {showWindowPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowWindowPicker(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              选择取餐窗口
            </h3>
            <div className="space-y-2">
              {windows.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setWindowId(w.id);
                    setShowWindowPicker(false);
                  }}
                  className={cn(
                    'w-full p-4 rounded-xl text-left flex items-center justify-between border-2 transition-colors',
                    windowId === w.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200'
                  )}
                >
                  <div>
                    <p className="font-medium text-gray-900">{w.name}</p>
                    <p className="text-sm text-gray-500">{w.location}</p>
                  </div>
                  {windowId === w.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTablewarePicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowTablewarePicker(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              选择餐具批次
            </h3>
            <div className="space-y-2">
              {tablewares
                .filter((t) => t.status !== 'scrapped')
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTablewareId(t.id);
                      setShowTablewarePicker(false);
                    }}
                    className={cn(
                      'w-full p-4 rounded-xl text-left flex items-center justify-between border-2 transition-colors',
                      tablewareId === t.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={t.photo}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{t.batchNo}</p>
                        <p className="text-sm text-gray-500">
                          {t.quantity}件 · {t.type}
                        </p>
                      </div>
                    </div>
                    {tablewareId === t.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {showDamagePicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowDamagePicker(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              选择问题类型
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {damageTypes.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDamageType(d.id);
                    setShowDamagePicker(false);
                  }}
                  className={cn(
                    'p-4 rounded-xl text-center border-2 transition-colors',
                    damageType === d.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200'
                  )}
                >
                  <span className="text-3xl mb-2 block">{d.icon}</span>
                  <p className="font-medium text-gray-900">{d.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSeverityPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowSeverityPicker(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              选择严重程度
            </h3>
            <div className="space-y-3">
              {(['minor', 'moderate', 'severe'] as SeverityLevel[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSeverity(s);
                    setShowSeverityPicker(false);
                  }}
                  className={cn(
                    'w-full p-4 rounded-xl text-left flex items-center justify-between border-2 transition-colors',
                    severity === s
                      ? s === 'severe'
                        ? 'border-danger-500 bg-danger-50'
                        : s === 'moderate'
                        ? 'border-warning-500 bg-warning-50'
                        : 'border-success-500 bg-success-50'
                      : 'border-gray-100 hover:border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        s === 'severe'
                          ? 'bg-danger-100'
                          : s === 'moderate'
                          ? 'bg-warning-100'
                          : 'bg-success-100'
                      )}
                    >
                      <AlertTriangle
                        className={cn(
                          'w-5 h-5',
                          s === 'severe'
                            ? 'text-danger-500'
                            : s === 'moderate'
                            ? 'text-warning-500'
                            : 'text-success-500'
                        )}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-medium',
                          s === 'severe'
                            ? 'text-danger-600'
                            : s === 'moderate'
                            ? 'text-warning-600'
                            : 'text-success-600'
                        )}
                      >
                        {severityLabels[s]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s === 'minor' && '小划痕，不影响使用'}
                        {s === 'moderate' && '有破损，仍可暂时使用'}
                        {s === 'severe' && '严重破损，不能使用'}
                      </p>
                    </div>
                  </div>
                  {severity === s && (
                    <CheckCircle2
                      className={cn(
                        'w-5 h-5',
                        s === 'severe'
                          ? 'text-danger-500'
                          : s === 'moderate'
                          ? 'text-warning-500'
                          : 'text-success-500'
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
