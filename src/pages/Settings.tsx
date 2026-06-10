import { useState } from 'react';
import {
  Bell, Save, RotateCcw, AlertTriangle, Info, Download,
  Upload, Trash2
} from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentIcon } from '@/components/DocumentIcon';
import {
  DOCUMENT_TYPE_LABELS, DEFAULT_REMINDER_SETTINGS
} from '@/types';
import type { DocumentType } from '@/types';

export default function Settings() {
  const {
    reminderSettings,
    updateReminderSetting,
    getReminderDays,
    documents,
    materials
  } = useDocumentStore();

  const [localSettings, setLocalSettings] = useState(
    Object.fromEntries(
      DEFAULT_REMINDER_SETTINGS.map(s => [s.documentType, getReminderDays(s.documentType)])
    ) as Record<DocumentType, number>
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDaysChange = (type: DocumentType, value: string) => {
    const days = Math.max(1, Math.min(365, parseInt(value) || 1));
    setLocalSettings(prev => ({ ...prev, [type]: days }));
  };

  const handleSave = () => {
    Object.entries(localSettings).forEach(([type, days]) => {
      updateReminderSetting(type as DocumentType, days);
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    const defaults = Object.fromEntries(
      DEFAULT_REMINDER_SETTINGS.map(s => [s.documentType, s.defaultDays])
    ) as Record<DocumentType, number>;
    setLocalSettings(defaults);
    setShowResetConfirm(false);
  };

  const handleExport = () => {
    const data = {
      documents,
      materials,
      reminderSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `证件管家备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.documents && Array.isArray(data.documents)) {
          if (confirm('导入将覆盖现有数据，确定继续吗？')) {
            localStorage.setItem('document-manager-storage', JSON.stringify({
              state: {
                documents: data.documents,
                materials: data.materials || [],
                reminderSettings: data.reminderSettings || DEFAULT_REMINDER_SETTINGS,
              }
            }));
            window.location.reload();
          }
        } else {
          alert('无效的备份文件格式');
        }
      } catch {
        alert('文件解析失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    localStorage.removeItem('document-manager-storage');
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">设置</h1>
        <p className="text-slate-500">配置提醒规则和数据管理</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Bell className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">默认提醒设置</h2>
                <p className="text-sm text-slate-500">
                  设置各类型证件的默认提前提醒天数
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {DEFAULT_REMINDER_SETTINGS.map((setting, idx) => (
              <div
                key={setting.documentType}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <DocumentIcon type={setting.documentType} className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-slate-800">
                      {DOCUMENT_TYPE_LABELS[setting.documentType]}
                    </p>
                    <p className="text-xs text-slate-500">
                      默认 {setting.defaultDays} 天
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={localSettings[setting.documentType]}
                    onChange={(e) => handleDaysChange(setting.documentType, e.target.value)}
                    className="w-20 px-3 py-2 text-center border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                  <span className="text-sm text-slate-500 w-8">天</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              恢复默认
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveSuccess ? '已保存！' : '保存设置'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">说明</h2>
              <p className="text-sm text-slate-500">
                关于提醒功能的说明
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">浏览器提醒</p>
                <p className="text-amber-700">
                  本应用数据保存在本地浏览器，打开应用时会显示即将到期的证件。
                  建议每周至少打开一次检查证件状态。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
              <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">提醒图标</p>
                <p className="text-blue-700">
                  当证件到期时间小于设置的提醒天数时，卡片上会显示铃铛图标，
                  表示需要开始准备换证。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">数据管理</h2>
              <p className="text-sm text-slate-500">
                导出或导入您的证件数据
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-800">导出备份</p>
                  <p className="text-sm text-slate-500">
                    将所有数据导出为 JSON 文件备份
                  </p>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <label className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-800">导入备份</p>
                  <p className="text-sm text-slate-500">
                    从备份文件恢复数据（将覆盖现有数据）
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <span className="text-slate-400">→</span>
            </label>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-red-700">清空所有数据</p>
                  <p className="text-sm text-red-500">
                    删除所有证件和材料记录（不可恢复）
                  </p>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </button>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <h3 className="font-semibold text-slate-800 mb-2">恢复默认设置</h3>
            <p className="text-slate-600 mb-6">
              确定要将所有提醒天数恢复为默认值吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                恢复
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">确认清空</h3>
                <p className="text-sm text-slate-500">此操作不可撤销</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              确定要删除所有数据吗？包括所有证件记录和材料清单。
              建议先导出备份。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
