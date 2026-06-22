import { useState } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import { Plus, Trash2, ChevronDown, ChevronRight, Settings, Package, Zap, FileText } from 'lucide-react';

export function PropertyPanel() {
  const store = useSandboxStore();
  const selectedPieceId = store.selectedPieceId;
  const pieces = store.getCurrentPieces();
  const roles = store.scene.roles;

  const selectedPiece = pieces.find((p) => p.id === selectedPieceId);
  const selectedRole = selectedPiece
    ? roles.find((r) => r.id === selectedPiece.roleId)
    : null;

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    resources: true,
    triggers: true,
    notes: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!selectedPiece || !selectedPieceId) {
    return (
      <div className="w-72 bg-slate-800/80 backdrop-blur-sm border-r border-slate-700/50 p-4 flex flex-col">
        <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Settings size={16} />
          属性面板
        </h2>
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          选择一个棋子查看属性
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-800/80 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Settings size={16} />
          属性面板
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-3">
          <button
            className="w-full flex items-center justify-between text-sm font-medium text-slate-200 hover:text-white"
            onClick={() => toggleSection('basic')}
          >
            <span className="flex items-center gap-2">
              <FileText size={14} />
              基础信息
            </span>
            {expandedSections.basic ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {expandedSections.basic && (
            <div className="space-y-3 pl-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  棋子名称
                </label>
                <input
                  type="text"
                  value={selectedPiece.name}
                  onChange={(e) =>
                    store.updatePiece(selectedPieceId, { name: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  角色
                </label>
                <select
                  value={selectedPiece.roleId}
                  onChange={(e) =>
                    store.updatePiece(selectedPieceId, {
                      roleId: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.symbol} {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRole && (
                <div className="p-2 bg-slate-900/30 rounded border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedRole.color }}
                    />
                    <span className="text-sm font-medium text-slate-200">
                      {selectedRole.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedRole.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    X 坐标
                  </label>
                  <input
                    type="number"
                    value={selectedPiece.x}
                    onChange={(e) =>
                      store.updatePiece(selectedPieceId, {
                        x: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Y 坐标
                  </label>
                  <input
                    type="number"
                    value={selectedPiece.y}
                    onChange={(e) =>
                      store.updatePiece(selectedPieceId, {
                        y: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            className="w-full flex items-center justify-between text-sm font-medium text-slate-200 hover:text-white"
            onClick={() => toggleSection('resources')}
          >
            <span className="flex items-center gap-2">
              <Package size={14} />
              资源数量
              <span className="text-xs text-slate-500">
                ({selectedPiece.resources.length})
              </span>
            </span>
            {expandedSections.resources ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {expandedSections.resources && (
            <div className="space-y-2 pl-4">
              {selectedPiece.resources.map((res) => (
                <div
                  key={res.id}
                  className="p-2 bg-slate-900/30 rounded border border-slate-700/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={res.name}
                      onChange={(e) =>
                        store.updatePieceResource(selectedPieceId, res.id, {
                          name: e.target.value,
                        })
                      }
                      className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        store.deletePieceResource(selectedPieceId, res.id)
                      }
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={res.amount}
                      onChange={(e) =>
                        store.updatePieceResource(selectedPieceId, res.id, {
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 bg-slate-800 border border-slate-600/50 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={res.unit}
                      onChange={(e) =>
                        store.updatePieceResource(selectedPieceId, res.id, {
                          unit: e.target.value,
                        })
                      }
                      placeholder="单位"
                      className="flex-1 bg-slate-800 border border-slate-600/50 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() =>
                  store.addPieceResource(selectedPieceId, {
                    name: '新资源',
                    amount: 0,
                    unit: '个',
                  })
                }
                className="w-full py-1.5 text-xs text-slate-400 hover:text-amber-400 border border-dashed border-slate-600/50 hover:border-amber-500/50 rounded flex items-center justify-center gap-1"
              >
                <Plus size={12} />
                添加资源
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            className="w-full flex items-center justify-between text-sm font-medium text-slate-200 hover:text-white"
            onClick={() => toggleSection('triggers')}
          >
            <span className="flex items-center gap-2">
              <Zap size={14} />
              触发条件
              <span className="text-xs text-slate-500">
                ({selectedPiece.triggers.length})
              </span>
            </span>
            {expandedSections.triggers ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {expandedSections.triggers && (
            <div className="space-y-2 pl-4">
              {selectedPiece.triggers.map((trig) => (
                <div
                  key={trig.id}
                  className="p-2 bg-slate-900/30 rounded border border-slate-700/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={trig.name}
                      onChange={(e) =>
                        store.updatePieceTrigger(selectedPieceId, trig.id, {
                          name: e.target.value,
                        })
                      }
                      className="flex-1 bg-transparent text-sm font-medium text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        store.deletePieceTrigger(selectedPieceId, trig.id)
                      }
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-start gap-1">
                      <span className="text-xs text-cyan-400 shrink-0">
                        条件:
                      </span>
                      <input
                        type="text"
                        value={trig.condition}
                        onChange={(e) =>
                          store.updatePieceTrigger(selectedPieceId, trig.id, {
                            condition: e.target.value,
                          })
                        }
                        className="flex-1 bg-slate-800 border border-slate-600/50 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-xs text-amber-400 shrink-0">
                        效果:
                      </span>
                      <input
                        type="text"
                        value={trig.effect}
                        onChange={(e) =>
                          store.updatePieceTrigger(selectedPieceId, trig.id, {
                            effect: e.target.value,
                          })
                        }
                        className="flex-1 bg-slate-800 border border-slate-600/50 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() =>
                  store.addPieceTrigger(selectedPieceId, {
                    name: '新触发',
                    condition: '',
                    effect: '',
                  })
                }
                className="w-full py-1.5 text-xs text-slate-400 hover:text-amber-400 border border-dashed border-slate-600/50 hover:border-amber-500/50 rounded flex items-center justify-center gap-1"
              >
                <Plus size={12} />
                添加触发条件
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            className="w-full flex items-center justify-between text-sm font-medium text-slate-200 hover:text-white"
            onClick={() => toggleSection('notes')}
          >
            <span className="flex items-center gap-2">
              <FileText size={14} />
              备注
            </span>
            {expandedSections.notes ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {expandedSections.notes && (
            <div className="pl-4">
              <textarea
                value={selectedPiece.notes}
                onChange={(e) =>
                  store.updatePiece(selectedPieceId, {
                    notes: e.target.value,
                  })
                }
                rows={4}
                placeholder="添加备注..."
                className="w-full bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <button
            onClick={() => {
              store.deletePiece(selectedPieceId);
            }}
            className="w-full py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 rounded flex items-center justify-center gap-2"
          >
            <Trash2 size={12} />
            删除棋子
          </button>
        </div>
      </div>
    </div>
  );
}
