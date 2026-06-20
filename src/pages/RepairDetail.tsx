import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  User,
  Clock,
  Wrench,
  CheckCircle,
  XCircle,
  Save,
  Plus,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import type { RepairMaterial } from '@/types';
import { getRepairStatusColorClass } from '@/utils/statusUtils';

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { repairs, updateRepair, resumeClassroom, classrooms } = useAppStore();
  
  const repair = repairs.find((r) => r.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    workerName: string;
    materials: RepairMaterial[];
    closeStartTime: string;
    closeEndTime: string;
    recheckNotes: string;
  }>({
    workerName: repair?.workerName || '',
    materials: repair?.materials?.length ? repair.materials : [{ name: '', quantity: 1, unit: '个' }],
    closeStartTime: repair?.closeStartTime?.slice(0, 16) || '',
    closeEndTime: repair?.closeEndTime?.slice(0, 16) || '',
    recheckNotes: repair?.recheckNotes || '',
  });

  if (!repair) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">维修工单不存在</p>
        <button
          onClick={() => navigate('/repairs')}
          className="mt-4 text-teal-600 font-medium"
        >
          返回列表
        </button>
      </div>
    );
  }

  const classroom = classrooms.find((c) => c.id === repair.classroomId);

  const handleSave = () => {
    const cleanedMaterials = editData.materials.filter((m) => m.name.trim() !== '');
    
    updateRepair(id, {
      workerName: editData.workerName,
      materials: cleanedMaterials,
      closeStartTime: editData.closeStartTime ? new Date(editData.closeStartTime).toISOString() : undefined,
      closeEndTime: editData.closeEndTime ? new Date(editData.closeEndTime).toISOString() : undefined,
      recheckNotes: editData.recheckNotes,
      status: editData.workerName ? 'in_progress' : 'pending',
    });
    setIsEditing(false);
  };

  const handleRecheckPass = () => {
    updateRepair(id, {
      recheckResult: 'passed',
      recheckDate: new Date().toISOString().split('T')[0],
      status: 'completed',
    });
    resumeClassroom(repair.classroomId);
  };

  const handleRecheckFail = () => {
    updateRepair(id, {
      recheckResult: 'failed',
      recheckDate: new Date().toISOString().split('T')[0],
      status: 'recheck_failed',
    });
  };

  const addMaterial = () => {
    setEditData({
      ...editData,
      materials: [...editData.materials, { name: '', quantity: 1, unit: '个' }],
    });
  };

  const removeMaterial = (index: number) => {
    const newMaterials = editData.materials.filter((_, i) => i !== index);
    setEditData({
      ...editData,
      materials: newMaterials.length > 0 ? newMaterials : [{ name: '', quantity: 1, unit: '个' }],
    });
  };

  const updateMaterial = (index: number, field: keyof RepairMaterial, value: string | number) => {
    const newMaterials = [...editData.materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setEditData({ ...editData, materials: newMaterials });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/repairs')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">返回维修列表</span>
      </button>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-slate-800">
                  {repair.classroomName}
                </h1>
                <StatusBadge status={repair.status} type="repair" />
              </div>
              <p className="text-slate-500 text-sm">
                维修工单 · 创建于 {formatDateTime(repair.createdAt)}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
              维修描述
            </h3>
            <p className="text-slate-700">
              {repair.description || '暂无描述'}
            </p>
          </div>

          {/* Worker info */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
              施工信息
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">施工人</label>
                  <input
                    type="text"
                    value={editData.workerName}
                    onChange={(e) => setEditData({ ...editData, workerName: e.target.value })}
                    placeholder="请输入施工人姓名"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">
                    {repair.workerName || '待分配'}
                  </p>
                  <p className="text-sm text-slate-400">施工人</p>
                </div>
              </div>
            )}
          </div>

          {/* Materials */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
              材料清单
            </h3>
            {isEditing ? (
              <div className="space-y-2">
                {editData.materials.map((material, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={material.name}
                      onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                      placeholder="材料名称"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <input
                      type="number"
                      min="1"
                      value={material.quantity}
                      onChange={(e) => updateMaterial(index, 'quantity', Number(e.target.value))}
                      className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={material.unit}
                      onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                      placeholder="单位"
                      className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    {editData.materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMaterial}
                  className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加材料
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl overflow-hidden">
                {repair.materials.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">暂无材料记录</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">
                          材料名称
                        </th>
                        <th className="text-center px-4 py-2 text-xs font-medium text-slate-500 w-24">
                          数量
                        </th>
                        <th className="text-center px-4 py-2 text-xs font-medium text-slate-500 w-20">
                          单位
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repair.materials.map((material, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-slate-700">{material.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-center">
                            {material.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 text-center">
                            {material.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Close time */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
              封闭时间
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">开始时间</label>
                  <input
                    type="datetime-local"
                    value={editData.closeStartTime}
                    onChange={(e) => setEditData({ ...editData, closeStartTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">结束时间</label>
                  <input
                    type="datetime-local"
                    value={editData.closeEndTime}
                    onChange={(e) => setEditData({ ...editData, closeEndTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">
                      {repair.closeStartTime
                        ? formatDateTime(repair.closeStartTime)
                        : '未设置'}
                    </p>
                    <p className="text-sm text-slate-400">封闭开始</p>
                  </div>
                </div>
                <div className="text-slate-300">→</div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">
                      {repair.closeEndTime
                        ? formatDateTime(repair.closeEndTime)
                        : '未设置'}
                    </p>
                    <p className="text-sm text-slate-400">封闭结束</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recheck result */}
          {repair.recheckResult && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                复查结果
              </h3>
              <div
                className={`p-4 rounded-xl border ${
                  repair.recheckResult === 'passed'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {repair.recheckResult === 'passed' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span
                    className={`font-medium ${
                      repair.recheckResult === 'passed'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {repair.recheckResult === 'passed' ? '复查通过' : '复查未通过'}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  复查日期：{repair.recheckDate && formatDate(repair.recheckDate)}
                </p>
                {repair.recheckNotes && (
                  <p className="text-sm text-slate-600 mt-2">{repair.recheckNotes}</p>
                )}
              </div>
            </div>
          )}

          {/* Recheck notes edit */}
          {isEditing && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                复查备注
              </h3>
              <textarea
                value={editData.recheckNotes}
                onChange={(e) => setEditData({ ...editData, recheckNotes: e.target.value })}
                placeholder="复查备注说明..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存修改
                </button>
              </>
            ) : (
              <>
                {repair.status !== 'completed' &&
                  repair.status !== 'recheck_failed' && (
                    <>
                      <button
                        onClick={handleRecheckFail}
                        className="px-5 py-2.5 border border-rose-200 text-rose-600 text-sm font-medium rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        复查不通过
                      </button>
                      <button
                        onClick={handleRecheckPass}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        复查通过
                      </button>
                    </>
                  )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Classroom info card */}
      {classroom && (
        <div
          onClick={() => navigate(`/classrooms/${classroom.id}`)}
          className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <img
              src={classroom.photos[0]}
              alt={classroom.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                {classroom.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {classroom.floor}楼 · {classroom.area}㎡ · {classroom.floorBrand}
              </p>
            </div>
            <StatusBadge status={classroom.status} type="classroom" />
          </div>
        </div>
      )}
    </div>
  );
}
