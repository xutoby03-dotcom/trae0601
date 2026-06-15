import React from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Wallet, Calendar, User, EyeOff, Eye, StickyNote, RefreshCw } from 'lucide-react';
import { usePlanStore } from '../store/usePlanStore';
import { Task, TaskColumn, COLUMN_META } from '../types';
import { Avatar } from './Avatar';
import { generateCodeName } from '../utils';

interface Props {
  task?: Task;
  defaultColumn?: TaskColumn;
  onClose: () => void;
}

export const TaskModal: React.FC<Props> = ({ task, defaultColumn, onClose }) => {
  const participants = usePlanStore((s) => s.plan.participants);
  const planDate = usePlanStore((s) => s.plan.date);
  const addTask = usePlanStore((s) => s.addTask);
  const updateTask = usePlanStore((s) => s.updateTask);
  const revealSecrets = usePlanStore((s) => s.revealSecrets);
  const setRevealSecrets = usePlanStore((s) => s.setRevealSecrets);

  const isEdit = !!task;
  const initialColumn = task?.column || defaultColumn || 'same_day';

  const [title, setTitle] = React.useState(task?.title || '');
  const [column, setColumn] = React.useState<TaskColumn>(initialColumn);
  const [assigneeId, setAssigneeId] = React.useState<string | null>(task?.assigneeId || null);
  const [deadline, setDeadline] = React.useState(task?.deadline || planDate || '');
  const [budget, setBudget] = React.useState<string>(task?.budget?.toString() || '0');
  const [isPaid, setIsPaid] = React.useState(task?.isPaid || false);
  const [isSecret, setIsSecret] = React.useState(task?.isSecret || initialColumn === 'secret');
  const [codeName, setCodeName] = React.useState(task?.codeName || generateCodeName());
  const [notes, setNotes] = React.useState(task?.notes || '');
  const [photos, setPhotos] = React.useState<string[]>(task?.photoEvidence || []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB哦');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const payload = {
      title: title.trim() || '未命名任务',
      column,
      assigneeId,
      deadline,
      budget: Number(budget) || 0,
      isPaid,
      isSecret,
      codeName,
      notes: notes.trim(),
      photoEvidence: photos,
    };
    if (isEdit && task) {
      updateTask(task.id, payload);
    } else {
      addTask(column, payload);
    }
    onClose();
  };

  const regenerateCodeName = () => {
    setCodeName(generateCodeName());
  };

  const maskForView = isSecret && !revealSecrets;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate2-900/40 backdrop-blur-sm animate-scale-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${COLUMN_META[column].gradient} px-6 py-5 text-white relative`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{COLUMN_META[column].emoji}</span>
                <h3 className="font-display text-2xl tracking-wide">
                  {isEdit ? '编辑任务' : '新建任务'}
                </h3>
              </div>
              <p className="text-white/80 text-sm">把任务说清楚，分工不翻车 ✨</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title + Secret */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5">
                任务标题
                {isSecret && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    🔒 保密中
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={maskForView ? codeName : title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={maskForView}
                  placeholder="比如：订蛋糕"
                  className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors disabled:bg-purple-50 disabled:text-purple-700 disabled:border-purple-200 font-medium"
                />
                {maskForView && (
                  <button
                    onClick={() => setRevealSecrets(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    解锁
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5">
                分区
              </label>
              <select
                value={column}
                onChange={(e) => {
                  const nc = e.target.value as TaskColumn;
                  setColumn(nc);
                  if (nc === 'secret') setIsSecret(true);
                }}
                className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors bg-white font-medium"
              >
                {(Object.keys(COLUMN_META) as TaskColumn[]).map((k) => (
                  <option key={k} value={k}>
                    {COLUMN_META[k].emoji} {COLUMN_META[k].title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code name */}
          {isSecret && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-purple-800 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4" />
                  保密代号（对主角显示这个）
                </label>
                <button
                  onClick={regenerateCodeName}
                  className="text-xs px-2.5 py-1 bg-purple-200 hover:bg-purple-300 text-purple-800 rounded-lg transition-colors flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  换一个
                </button>
              </div>
              <input
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-purple-800 font-medium"
                placeholder="比如：神秘企鹅行动"
              />
              <p className="text-xs text-purple-600/70 mt-2">
                💡 主角看到的标题就是这个代号，取个好玩但不暴露的名字吧
              </p>
            </div>
          )}

          {/* Assignee + Deadline + Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                负责人
              </label>
              <div className="flex flex-wrap gap-2 p-2 border-2 border-slate2-200 rounded-xl min-h-[3.25rem]">
                {participants.length === 0 ? (
                  <span className="text-sm text-slate2-400 px-2">先添加参与人哦</span>
                ) : (
                  participants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAssigneeId(assigneeId === p.id ? null : p.id)}
                      className={`flex items-center gap-1.5 rounded-full pr-2 pl-0.5 py-0.5 border-2 transition-all ${
                        assigneeId === p.id
                          ? 'border-coral-400 bg-coral-50 scale-105 shadow-sm'
                          : 'border-transparent hover:bg-slate2-50'
                      }`}
                    >
                      <Avatar participant={p} size="sm" />
                      <span className="text-xs font-medium text-slate2-700">{p.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                截止日期
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                预算 (元)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate2-400">¥</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-3">
            <ToggleChip
              checked={isPaid}
              onChange={setIsPaid}
              label={isPaid ? '✓ 已垫付' : '未垫付'}
              color="mint"
            />
            <ToggleChip
              checked={isSecret}
              onChange={setIsSecret}
              label={isSecret ? '🔒 对主角保密' : '公开任务'}
              color="purple"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              照片证据
              <span className="text-xs font-normal text-slate2-400 ml-1">
                ({photos.length}/10，完成后上传凭证)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((ph, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate2-200 group">
                  <img src={ph} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-slate2-300 flex flex-col items-center justify-center text-slate2-400 hover:border-coral-400 hover:text-coral-500 transition-colors"
                  >
                    <Upload className="w-6 h-6 mb-0.5" />
                    <span className="text-[10px]">添加</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handlePhotos(e.target.files)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
              <StickyNote className="w-4 h-4" />
              备注
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="写点注意事项、具体要求之类的..."
              className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate2-100 bg-slate2-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-slate2-600 hover:bg-slate2-200 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-coral-500 to-orange-400 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {isEdit ? '保存修改' : '添加任务'} 🎉
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleChip: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  color: 'mint' | 'purple';
}> = ({ checked, onChange, label, color }) => {
  const styles = {
    mint: checked
      ? 'bg-mint-100 text-mint-700 border-mint-300'
      : 'bg-slate2-100 text-slate2-500 border-slate2-200 hover:bg-slate2-200',
    purple: checked
      ? 'bg-purple-100 text-purple-700 border-purple-300'
      : 'bg-slate2-100 text-slate2-500 border-slate2-200 hover:bg-slate2-200',
  };
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${styles[color]} ${
        checked ? 'scale-105 shadow-sm' : ''
      }`}
    >
      {label}
    </button>
  );
};
