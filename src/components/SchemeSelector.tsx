import { useState } from 'react';
import { CheckCircle, FileCheck, X, Archive } from 'lucide-react';
import type { Trial } from '@/types';
import { cn } from '@/lib/utils';

interface SchemeSelectorProps {
  trial: Trial;
  onSelect: (trialId: string) => void;
  onArchive: (trialId: string) => void;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SchemeSelector({ trial, onSelect, onArchive }: SchemeSelectorProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    onArchive(trial.id);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <div
        className={cn(
          'sticky bottom-0 z-40 border-t-2 shadow-scroll transition-colors duration-300',
          trial.isArchived
            ? 'bg-teal-500/10 border-teal-500/40'
            : 'bg-parchment-100 border-ink-700/20'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {trial.isArchived ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/15 rounded-lg border border-teal-500/40">
                  <div className="p-1.5 bg-teal-500 rounded-full">
                    <Archive className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-hei font-semibold text-teal-700">
                      修复方案已归档 · 版本 {trial.version}
                    </p>
                    <p className="text-xs text-teal-600/80">
                      归档时间：{formatDate(trial.archivedAt)}
                    </p>
                  </div>
                </div>
              ) : trial.isSelected ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-lg border border-teal-500/30">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-hei font-medium text-teal-600">
                      当前选中：版本 {trial.version}
                    </p>
                    <p className="text-sm text-ink-700">
                      已设为最优修复方案，可确认归档
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-parchment-200 rounded-lg border border-parchment-300">
                  <FileCheck className="w-5 h-5 text-ochre-500" />
                  <div>
                    <p className="font-hei font-medium text-ink-800">
                      当前版本：{trial.version}
                    </p>
                    <p className="text-sm text-ink-700">
                      点击右侧按钮将此版本设为最优方案
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {trial.isArchived ? (
                <div className="flex items-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-lg font-hei font-semibold shadow-card">
                  <CheckCircle className="w-5 h-5" />
                  <span>已纳入修复方案</span>
                </div>
              ) : !trial.isSelected ? (
                <button
                  type="button"
                  onClick={() => onSelect(trial.id)}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg font-hei font-medium hover:bg-teal-600 transition-all shadow-card hover:shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>设为最优方案</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmClick}
                  className="flex items-center gap-2 px-6 py-3 bg-ochre-500 text-white rounded-lg font-hei font-medium hover:bg-ochre-600 transition-all shadow-card hover:shadow-lg"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>确认加入修复方案</span>
                </button>
              )}
            </div>
          </div>
          {trial.isSelected && !trial.isArchived && (
            <div className="mt-3 flex items-center gap-2 text-sm text-teal-600 bg-teal-500/5 px-4 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span>入选提示：此方案已被选定为最优修复方案，确认后将正式加入修复档案并不可修改。</span>
            </div>
          )}
          {trial.isArchived && (
            <div className="mt-3 flex items-center gap-2 text-sm text-teal-700 bg-teal-500/10 px-4 py-2 rounded-lg">
              <Archive className="w-4 h-4" />
              <span>该版本已正式归档，作为本古籍修复方案的补纸标准配置保存。</span>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm">
          <div className="bg-parchment-100 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-parchment-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-ochre-500/10 rounded-lg">
                    <FileCheck className="w-6 h-6 text-ochre-500" />
                  </div>
                  <div>
                    <h3 className="font-song text-xl text-ink-900">确认加入修复方案</h3>
                    <p className="text-sm text-ink-700 mt-1">版本 {trial.version}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-1 hover:bg-parchment-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-ink-700" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-parchment-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <p className="text-ink-800 font-hei">
                    确认将版本 {trial.version} 正式加入修复方案档案？
                  </p>
                </div>
                <p className="text-sm text-ink-700 leading-relaxed">
                  此操作将把当前选定的试配方案作为最终修复方案记录归档。
                  归档后将被标记为"已纳入修复方案"状态，数据会持久保存。
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-lg font-hei font-medium transition-all',
                    'bg-parchment-200 text-ink-800 hover:bg-parchment-300'
                  )}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-lg font-hei font-medium transition-all',
                    'bg-ochre-500 text-white hover:bg-ochre-600 shadow-card'
                  )}
                >
                  确认归档
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
