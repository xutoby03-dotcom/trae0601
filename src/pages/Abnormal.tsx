import { useState } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw, Droplets, Settings, Camera, Check, ChevronDown, User } from 'lucide-react';
import { useCylinderStore } from '@/store/useCylinderStore';
import { AbnormalTypeBadge } from '@/components/StatusBadge';
import type { AbnormalType } from '@/types';
import { formatDateTime } from '@/utils/date';

const tabConfig = [
  { value: 'empty_return' as AbnormalType, label: '空瓶归还', icon: RotateCcw, color: 'text-slate-600' },
  { value: 'exchange' as AbnormalType, label: '换瓶', icon: RefreshCw, color: 'text-blue-600' },
  { value: 'leak' as AbnormalType, label: '漏气', icon: Droplets, color: 'text-red-600' },
  { value: 'valve' as AbnormalType, label: '阀门异常', icon: Settings, color: 'text-orange-600' },
];

const reporters = ['张师傅', '李师傅', '王师傅', '赵师傅'];

export default function Abnormal() {
  const { cylinders, abnormalRecords, addAbnormalRecord } = useCylinderStore();
  const [activeTab, setActiveTab] = useState<AbnormalType>('empty_return');
  const [cylinderId, setCylinderId] = useState('');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState(reporters[0]);
  const [showCylinderDropdown, setShowCylinderDropdown] = useState(false);
  const [showReporterDropdown, setShowReporterDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredRecords = abnormalRecords.filter((r) => r.type === activeTab);
  const selectedCylinder = cylinders.find((c) => c.id === cylinderId);

  const canSubmit = cylinderId && description.trim() && reporter;

  const handleSubmit = () => {
    if (!canSubmit) return;

    addAbnormalRecord({
      cylinderId,
      type: activeTab,
      description: description.trim(),
      reporter,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCylinderId('');
      setDescription('');
    }, 2000);
  };

  const activeConfig = tabConfig.find((t) => t.value === activeTab)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900">异常登记</h2>
        <p className="text-sm text-slate-500 mt-1">记录气瓶异常情况，及时处理安全隐患</p>
      </div>

      <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200">
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeTab === 'empty_return' ? 'bg-slate-100' :
                activeTab === 'exchange' ? 'bg-blue-100' :
                activeTab === 'leak' ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <ActiveIcon className={`w-6 h-6 ${activeConfig.color}`} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-900">{activeConfig.label}登记</h3>
                <p className="text-sm text-slate-500">
                  {activeTab === 'empty_return' && '记录归还的空瓶信息'}
                  {activeTab === 'exchange' && '记录气瓶更换情况'}
                  {activeTab === 'leak' && '记录漏气异常情况'}
                  {activeTab === 'valve' && '记录阀门异常情况'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择气瓶</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCylinderDropdown(!showCylinderDropdown)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-primary-300 transition-colors"
                  >
                    {selectedCylinder ? (
                      <div>
                        <p className="font-medium text-slate-900">{selectedCylinder.cylinderNo}</p>
                        <p className="text-sm text-slate-500">{selectedCylinder.location}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">请选择气瓶</span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCylinderDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCylinderDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {cylinders.map((cylinder) => (
                        <button
                          key={cylinder.id}
                          onClick={() => {
                            setCylinderId(cylinder.id);
                            setShowCylinderDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 ${
                            cylinderId === cylinder.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <p className="font-medium text-slate-900">{cylinder.cylinderNo}</p>
                          <p className="text-sm text-slate-500">
                            {cylinder.location} · {cylinder.pressure} MPa
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">异常描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请详细描述异常情况..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">现场照片（可选）</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">点击上传照片</p>
                  <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG 格式</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">登记人</label>
                <div className="relative">
                  <button
                    onClick={() => setShowReporterDropdown(!showReporterDropdown)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{reporter}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showReporterDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showReporterDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                      {reporters.map((rep) => (
                        <button
                          key={rep}
                          onClick={() => {
                            setReporter(rep);
                            setShowReporterDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-2 ${
                            reporter === rep ? 'bg-primary-50 text-primary-700' : ''
                          }`}
                        >
                          <User className="w-4 h-4" />
                          <span className="font-medium">{rep}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-4 rounded-xl font-display font-semibold text-white transition-all duration-200 ${
                  canSubmit
                    ? 'bg-accent-500 hover:bg-accent-600 shadow-lg hover:shadow-xl active:scale-[0.98]'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                提交登记
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                历史记录
                <span className="text-sm font-normal text-slate-400">({filteredRecords.length}条)</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const cylinder = cylinders.find((c) => c.id === record.cylinderId);
                  return (
                    <div key={record.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            record.type === 'empty_return' ? 'bg-slate-100' :
                            record.type === 'exchange' ? 'bg-blue-100' :
                            record.type === 'leak' ? 'bg-red-100' : 'bg-orange-100'
                          }`}>
                            <ActiveIcon className={`w-5 h-5 ${
                              record.type === 'empty_return' ? 'text-slate-600' :
                              record.type === 'exchange' ? 'text-blue-600' :
                              record.type === 'leak' ? 'text-red-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{cylinder?.cylinderNo || '未知气瓶'}</p>
                            <p className="text-sm text-slate-500">{formatDateTime(record.createdAt)}</p>
                          </div>
                        </div>
                        <AbnormalTypeBadge type={record.type} />
                      </div>
                      <p className="text-sm text-slate-600 mb-3 pl-13 ml-13">
                        {record.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 ml-13">
                        <span>登记人：{record.reporter}</span>
                        {record.photoUrl && (
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            有照片
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">暂无{activeConfig.label}记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">登记成功</h3>
            <p className="text-slate-500">异常记录已保存</p>
          </div>
        </div>
      )}
    </div>
  );
}
