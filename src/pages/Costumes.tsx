import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { STATUS_COLORS, ACCESSORY_LABELS, COSTUME_SIZES } from '../../shared/types';

export default function Costumes() {
  const navigate = useNavigate();
  const { costumes, fetchCostumes, deleteCostume, loading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);

  useEffect(() => {
    fetchCostumes();
  }, [fetchCostumes]);

  const filteredCostumes = costumes.filter(c => {
    const matchSearch = searchTerm === '' || 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.includes(searchTerm) ||
      c.size.includes(searchTerm);
    const matchSize = filterSize === '' || c.size === filterSize;
    const matchStatus = filterStatus === '' || c.status === filterStatus;
    return matchSearch && matchSize && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这套服装吗？')) {
      await deleteCostume(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">服装档案管理</h1>
          <p className="text-gray-500 mt-1">管理所有毕业照服装档案信息</p>
        </div>
        <button
          onClick={() => navigate('/costumes/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增服装
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索服装ID、类型、尺码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="">全部尺码</option>
              {COSTUME_SIZES.map(size => (
                <option key={size} value={size}>{size} 码</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="">全部状态</option>
              <option value="在库">在库</option>
              <option value="已预约">已预约</option>
              <option value="借出中">借出中</option>
              <option value="待清洗">待清洗</option>
              <option value="清洗中">清洗中</option>
              <option value="已报废">已报废</option>
            </select>
            <button
              onClick={() => fetchCostumes()}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>服装照片</th>
                  <th>ID</th>
                  <th>类型</th>
                  <th>尺码</th>
                  <th>颜色</th>
                  <th>配件</th>
                  <th>状态</th>
                  <th>清洗状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCostumes.map((costume) => (
                  <tr key={costume.id}>
                    <td>
                      <img
                        src={costume.photoUrl}
                        alt={costume.type}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Cpath d="M20.38 3.46 16 2l-4 4-4-4-4.38 1.46a2 2 0 0 0-1.22 2.62l2.7 6.81a2 2 0 0 0 1.85 1.27h6.1a2 2 0 0 0 1.85-1.27l2.7-6.81a2 2 0 0 0-1.22-2.62Z"/%3E%3Cpath d="M12 14v8"/%3E%3Cpath d="M8 22h8"/%3E%3C/svg%3E';
                        }}
                      />
                    </td>
                    <td className="font-mono text-xs">{costume.id}</td>
                    <td>{costume.type}</td>
                    <td>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-100 text-primary-700 text-sm font-medium">
                        {costume.size}
                      </span>
                    </td>
                    <td>{costume.color}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(costume.accessories).map(([key, value]) => (
                          value && (
                            <span
                              key={key}
                              className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded"
                            >
                              {ACCESSORY_LABELS[key as keyof typeof ACCESSORY_LABELS]}
                            </span>
                          )
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_COLORS[costume.status]}`}>
                        {costume.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_COLORS[costume.cleaningStatus]}`}>
                        {costume.cleaningStatus}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedCostume(costume)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => navigate(`/costumes/${costume.id}`)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(costume.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCostumes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                暂无服装数据
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCostume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-serif text-xl font-semibold text-gray-800">服装详情</h3>
                <button
                  onClick={() => setSelectedCostume(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={selectedCostume.photoUrl}
                    alt={selectedCostume.type}
                    className="w-48 h-48 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Cpath d="M20.38 3.46 16 2l-4 4-4-4-4.38 1.46a2 2 0 0 0-1.22 2.62l2.7 6.81a2 2 0 0 0 1.85 1.27h6.1a2 2 0 0 0 1.85-1.27l2.7-6.81a2 2 0 0 0-1.22-2.62Z"/%3E%3Cpath d="M12 14v8"/%3E%3Cpath d="M8 22h8"/%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-mono">{selectedCostume.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">类型</p>
                    <p className="font-medium">{selectedCostume.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">尺码</p>
                    <p className="font-medium">{selectedCostume.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">颜色</p>
                    <p className="font-medium">{selectedCostume.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">状态</p>
                    <span className={`status-badge ${STATUS_COLORS[selectedCostume.status]}`}>
                      {selectedCostume.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">清洗状态</p>
                    <span className={`status-badge ${STATUS_COLORS[selectedCostume.cleaningStatus]}`}>
                      {selectedCostume.cleaningStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">配件清单</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedCostume.accessories).map(([key, value]) => (
                      <span
                        key={key}
                        className={`text-sm px-3 py-1 rounded-lg ${
                          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ACCESSORY_LABELS[key as keyof typeof ACCESSORY_LABELS]}: {value ? '有' : '无'}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedCostume.remark && (
                  <div>
                    <p className="text-sm text-gray-500">备注</p>
                    <p>{selectedCostume.remark}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setSelectedCostume(null)} className="btn-secondary">
                  关闭
                </button>
                <button
                  onClick={() => {
                    navigate(`/costumes/${selectedCostume.id}`);
                    setSelectedCostume(null);
                  }}
                  className="btn-primary"
                >
                  编辑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
