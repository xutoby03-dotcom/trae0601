import React, { useState, useEffect } from 'react';
import { useRouteStore, useHoldStore } from '@/store';
import type { Route, Grade, RouteStatus, Hold } from '@/types';
import { GRADE_COLORS, SETTERS, STATUS_LABELS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { WallMap } from './WallMap';

interface RouteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  route?: Route | null;
}

const COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316',
  '#06b6d4', '#ec4899', '#eab308', '#6366f1', '#14b8a6',
];

const GRADES: Grade[] = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8+'];

export const RouteEditor: React.FC<RouteEditorProps> = ({ isOpen, onClose, route }) => {
  const { addRoute, updateRoute, deleteRoute } = useRouteStore();
  const { holds, assignHoldToRoute, getHoldsByRoute } = useHoldStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [grade, setGrade] = useState<Grade>('V2');
  const [setter, setSetter] = useState(SETTERS[0]);
  const [setDate, setSetDate] = useState('');
  const [removeDate, setRemoveDate] = useState('');
  const [status, setStatus] = useState<RouteStatus>('active');
  const [selectedHoldIds, setSelectedHoldIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!route;

  useEffect(() => {
    if (route) {
      setName(route.name);
      setColor(route.color);
      setGrade(route.grade);
      setSetter(route.setter);
      setSetDate(route.setDate);
      setRemoveDate(route.removeDate);
      setStatus(route.status);
      const routeHolds = getHoldsByRoute(route.id);
      setSelectedHoldIds(routeHolds.map((h) => h.id));
    } else {
      const today = new Date();
      const twoMonths = new Date();
      twoMonths.setMonth(twoMonths.getMonth() + 2);
      setName('');
      setColor(COLORS[0]);
      setGrade('V2');
      setSetter(SETTERS[0]);
      setSetDate(today.toISOString().split('T')[0]);
      setRemoveDate(twoMonths.toISOString().split('T')[0]);
      setStatus('active');
      setSelectedHoldIds([]);
    }
  }, [route, isOpen]);

  const handleHoldClick = (hold: Hold) => {
    if (!selectMode) return;

    setSelectedHoldIds((prev) => {
      if (prev.includes(hold.id)) {
        return prev.filter((id) => id !== hold.id);
      }
      return [...prev, hold.id];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && route) {
      updateRoute(route.id, {
        name,
        color,
        grade,
        setter,
        setDate,
        removeDate,
        status,
        holdIds: selectedHoldIds,
      });
    } else {
      addRoute({
        name,
        color,
        grade,
        setter,
        setDate,
        removeDate,
        status,
        holdIds: selectedHoldIds,
      });
    }

    selectedHoldIds.forEach((holdId) => {
      if (isEditing && route) {
        assignHoldToRoute(holdId, route.id);
      }
    });

    holds.forEach((hold) => {
      if (!selectedHoldIds.includes(hold.id) && hold.routeId === (route?.id || null)) {
        assignHoldToRoute(hold.id, null);
      }
      if (selectedHoldIds.includes(hold.id)) {
        if (isEditing && route) {
          assignHoldToRoute(hold.id, route.id);
        }
      }
    });

    onClose();
  };

  const handleDelete = () => {
    if (route) {
      selectedHoldIds.forEach((holdId) => {
        assignHoldToRoute(holdId, null);
      });
      deleteRoute(route.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg shadow-lg"
              style={{ backgroundColor: color }}
            />
            <div>
              <h3 className="font-semibold text-white">
                {isEditing ? '编辑线路' : '新建线路'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? '修改线路信息和岩点' : '创建一条新的抱石线路'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  线路名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入线路名称"
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  线路颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-transform',
                        color === c ? 'ring-2 ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: c, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    难度等级
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as Grade)}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    开线人
                  </label>
                  <select
                    value={setter}
                    onChange={(e) => setSetter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  >
                    {SETTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    开线日期
                  </label>
                  <input
                    type="date"
                    value={setDate}
                    onChange={(e) => setSetDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    预计拆线日期
                  </label>
                  <input
                    type="date"
                    value={removeDate}
                    onChange={(e) => setRemoveDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  线路状态
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['active', 'pending_review', 'adjusting', 'retired'] as RouteStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        status === s
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700'
                      )}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    关联岩点 ({selectedHoldIds.length} 个)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectMode(!selectMode)}
                    className={cn(
                      'text-xs px-3 py-1 rounded-md font-medium transition-colors',
                      selectMode
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    )}
                  >
                    {selectMode ? '选择中...' : '点击选择岩点'}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  提示：在右侧墙面上点击岩点来关联到这条线路
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="h-80 lg:h-full min-h-[400px]">
                <WallMap
                  mode={selectMode ? 'select' : 'view'}
                  onHoldClick={handleHoldClick}
                  selectedHoldIds={selectedHoldIds}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={cn(
              'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2',
              name.trim()
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            )}
          >
            <Save size={18} />
            {isEditing ? '保存修改' : '创建线路'}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
              <h4 className="text-lg font-semibold text-white mb-2">确认删除线路？</h4>
              <p className="text-sm text-slate-400 mb-5">
                删除后所有关联的岩点将被释放，此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
