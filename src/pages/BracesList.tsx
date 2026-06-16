import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, User, Palette, Droplets } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDisplayDate } from '../utils/storage';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';

const BracesList: React.FC = () => {
  const navigate = useNavigate();
  const { braces, init, initialized, deleteBraces, inventories } = useStore();

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [init, initialized]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除"${name}"吗？相关的记录和提醒也会被删除。`)) {
      deleteBraces(id);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      '第一阶段': 'bg-accent-coral/10 text-accent-coral',
      '第二阶段': 'bg-accent-yellow/10 text-accent-yellow',
      '保持器': 'bg-accent-sky/10 text-accent-sky',
    };
    return colors[stage] || 'bg-gray-100 text-gray-600';
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-primary text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-warm-dark">牙套档案 🦷</h1>
          <p className="text-gray-500 mt-1">管理您的牙套和保持器信息</p>
        </div>
        <button
          onClick={() => navigate('/braces/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          添加
        </button>
      </div>

      {braces.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">😁</div>
            <h3 className="text-xl font-bold font-display mb-2">还没有牙套档案</h3>
            <p className="text-gray-500 mb-6">添加您的第一个牙套或保持器档案</p>
            <button
              onClick={() => navigate('/braces/new')}
              className="btn-primary"
            >
              添加牙套档案
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {braces.map((brace) => {
            const inventory = inventories.find(i => i.bracesId === brace.id);
            return (
              <Card
                key={brace.id}
                className="animate-slide-up"
                onClick={() => navigate(`/braces/${brace.id}/edit`)}
              >
                <CardContent>
                  <div className="flex gap-4">
                    {brace.photo ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={brace.photo}
                          alt={brace.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-warm-gray flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">🦷</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold font-display text-warm-dark">{brace.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/braces/${brace.id}/edit`);
                            }}
                            className="p-2 rounded-lg hover:bg-warm-gray transition-colors"
                          >
                            <Edit2 size={18} className="text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(brace.id, brace.name);
                            }}
                            className="p-2 rounded-lg hover:bg-accent-coral/10 transition-colors"
                          >
                            <Trash2 size={18} className="text-accent-coral" />
                          </button>
                        </div>
                      </div>
                      <span className={`badge ${getStageColor(brace.stage)} mt-2`}>
                        {brace.stage}
                      </span>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <User size={14} />
                          <span>{brace.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={14} />
                          <span>{formatDisplayDate(brace.receiveDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Palette size={14} />
                          <span className="flex items-center gap-1">
                            <span
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: brace.boxColor }}
                            />
                            盒子
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Droplets size={14} />
                          <span>每{brace.cleanCycle}天清洁</span>
                        </div>
                      </div>
                      {inventory && (
                        <div className="mt-3 pt-3 border-t border-warm-gray">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">清洁片库存</span>
                            <span className={`font-medium ${
                              inventory.currentStock <= inventory.lowStockThreshold
                                ? 'text-accent-coral'
                                : 'text-primary'
                            }`}>
                              {inventory.currentStock} 片
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BracesList;
