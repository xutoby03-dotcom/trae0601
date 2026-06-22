import { useMemo, useState } from 'react';
import { Plus, Gauge, Search, Filter, User, Target, CircleDot } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Calibration, NewCalibration } from '../types';
import Modal from '../components/Modal';
import { ConfirmDelete, RowActions, EmptyState, useModalState } from '../components/UIHelpers';

const emptyForm: NewCalibration = {
  equipmentId: '',
  calibrationDate: new Date().toISOString().slice(0, 10),
  targetForce: 2.0,
  measuredForce: 2.0,
  antiSkate: 2.0,
  operator: '',
  notes: '',
};

export default function CalibrationPage() {
  const calibrations = useAppStore((s) => s.calibrations);
  const equipments = useAppStore((s) => s.equipments);
  const addCalibration = useAppStore((s) => s.addCalibration);
  const updateCalibration = useAppStore((s) => s.updateCalibration);
  const deleteCalibration = useAppStore((s) => s.deleteCalibration);
  const getEquipment = useAppStore((s) => s.getEquipment);
  const getEquipmentName = useAppStore((s) => s.getEquipmentName);

  const [search, setSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [formData, setFormData] = useState<NewCalibration>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formModal = useModalState();
  const deleteModal = useModalState();
  const [deleteTarget, setDeleteTarget] = useState<Calibration | null>(null);

  const filtered = useMemo(() => {
    let list = calibrations.slice().sort((a, b) => b.calibrationDate.localeCompare(a.calibrationDate));
    if (equipmentFilter !== 'all') {
      list = list.filter((c) => c.equipmentId === equipmentFilter);
    }
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter((c) => {
        const eqName = getEquipmentName(c.equipmentId).toLowerCase();
        return (
          eqName.includes(kw) ||
          c.operator.toLowerCase().includes(kw) ||
          c.notes?.toLowerCase().includes(kw)
        );
      });
    }
    return list;
  }, [calibrations, equipmentFilter, search, getEquipmentName]);

  const openAdd = () => {
    setEditingId(null);
    const defaultEq = equipments[0];
    setFormData({
      ...emptyForm,
      equipmentId: defaultEq?.id || '',
      targetForce: defaultEq ? (defaultEq.targetForceMin + defaultEq.targetForceMax) / 2 : 2.0,
    });
    formModal.openModal();
  };

  const openEdit = (c: Calibration) => {
    setEditingId(c.id);
    setFormData({
      equipmentId: c.equipmentId,
      calibrationDate: c.calibrationDate,
      targetForce: c.targetForce,
      measuredForce: c.measuredForce,
      antiSkate: c.antiSkate,
      operator: c.operator,
      notes: c.notes || '',
    });
    formModal.openModal();
  };

  const submit = () => {
    if (!formData.equipmentId) {
      alert('请选择设备');
      return;
    }
    if (editingId) {
      updateCalibration(editingId, formData);
    } else {
      addCalibration(formData);
    }
    formModal.closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-oak-400" />
            <input
              type="text"
              placeholder="搜索设备/校准人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-oak-400" />
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="select-field pl-11 pr-10 appearance-none min-w-[200px]"
            >
              <option value="all">全部设备</option>
              {equipments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.turntableModel} / {e.cartridgeModel}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary" disabled={equipments.length === 0}>
          <Plus className="w-5 h-5" />
          新增校准记录
        </button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Gauge className="w-8 h-8" />}
            title="暂无校准记录"
            description="请先录入设备组合，然后创建校准记录，记录目标针压、实测针压和防滑刻度"
            action={
              equipments.length === 0 ? null : (
                <button onClick={openAdd} className="btn-primary">
                  <Plus className="w-4 h-4" /> 新增校准
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>校准日期</th>
                  <th>设备组合</th>
                  <th>目标针压</th>
                  <th>实测针压</th>
                  <th>偏差</th>
                  <th>防滑刻度</th>
                  <th>校准人</th>
                  <th>备注</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const eq = getEquipment(c.equipmentId);
                  const deviation = c.measuredForce - c.targetForce;
                  const deviationAbs = Math.abs(deviation);
                  const outsideRange =
                    eq && (c.measuredForce < eq.targetForceMin - 0.3 || c.measuredForce > eq.targetForceMax + 0.3);
                  const devBadge =
                    outsideRange || deviationAbs > 0.5 ? (
                      <span className="badge badge-danger">
                        {deviation > 0 ? '+' : ''}
                        {deviation.toFixed(2)} mN
                      </span>
                    ) : deviationAbs > 0.3 ? (
                      <span className="badge badge-warning">
                        {deviation > 0 ? '+' : ''}
                        {deviation.toFixed(2)} mN
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        {deviation > 0 ? '+' : ''}
                        {deviation.toFixed(2)} mN
                      </span>
                    );

                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-oak-700">{c.calibrationDate}</td>
                      <td>
                        <div className="min-w-[220px]">
                          <p className="font-medium text-oak-800 truncate">
                            {getEquipmentName(c.equipmentId)}
                          </p>
                          {eq && (
                            <p className="text-xs text-ink-400">
                              目标范围 {eq.targetForceMin} ~ {eq.targetForceMax} mN
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-brass-500" />
                          <span className="font-mono font-semibold">{c.targetForce.toFixed(2)}</span>
                          <span className="text-xs text-ink-400">mN</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <CircleDot className="w-4 h-4 text-forest-500" />
                          <span className="font-mono font-semibold">{c.measuredForce.toFixed(2)}</span>
                          <span className="text-xs text-ink-400">mN</span>
                        </div>
                      </td>
                      <td>{devBadge}</td>
                      <td>
                        <span className="font-mono font-semibold text-oak-700">
                          {c.antiSkate.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-oak-400" />
                          <span>{c.operator || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="max-w-[200px] truncate text-ink-500" title={c.notes}>
                          {c.notes || '-'}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end">
                          <RowActions
                            onEdit={() => openEdit(c)}
                            onDelete={() => { setDeleteTarget(c); deleteModal.openModal(); }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={formModal.open}
        onClose={formModal.closeModal}
        title={editingId ? '编辑校准记录' : '新增校准记录'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">选择设备 *</label>
            <select
              className="select-field"
              value={formData.equipmentId}
              onChange={(e) => {
                const eq = equipments.find((x) => x.id === e.target.value);
                setFormData({
                  ...formData,
                  equipmentId: e.target.value,
                  targetForce: eq ? (eq.targetForceMin + eq.targetForceMax) / 2 : formData.targetForce,
                });
              }}
            >
              <option value="">-- 请选择设备组合 --</option>
              {equipments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.turntableModel} / {e.tonearmModel} / {e.cartridgeModel}
                  {' '}({e.targetForceMin}~{e.targetForceMax} mN)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">校准日期</label>
            <input
              type="date"
              className="input-field"
              value={formData.calibrationDate}
              onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">目标针压 (mN)</label>
              <input
                type="number"
                step="0.05"
                className="input-field"
                value={formData.targetForce}
                onChange={(e) => setFormData({ ...formData, targetForce: +e.target.value })}
              />
            </div>
            <div>
              <label className="label">实测针压 (mN)</label>
              <input
                type="number"
                step="0.05"
                className="input-field"
                value={formData.measuredForce}
                onChange={(e) => setFormData({ ...formData, measuredForce: +e.target.value })}
              />
            </div>
            <div>
              <label className="label">防滑刻度</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={formData.antiSkate}
                onChange={(e) => setFormData({ ...formData, antiSkate: +e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">校准人</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：张工"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
            />
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="校准情况说明..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={formModal.closeModal} className="btn-secondary">
              取消
            </button>
            <button onClick={submit} className="btn-primary">
              {editingId ? '保存修改' : '创建记录'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDelete
        open={deleteModal.open}
        onClose={deleteModal.closeModal}
        onConfirm={() => deleteTarget && deleteCalibration(deleteTarget.id)}
        title="删除校准记录"
        message="确定要删除此校准记录吗？关联的试听数据也将一并删除。"
      />
    </div>
  );
}
