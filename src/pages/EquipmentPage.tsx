import { useMemo, useState } from 'react';
import { Plus, Disc3, Search, Target, CalendarDays, FileText } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Equipment, NewEquipment } from '../types';
import Modal from '../components/Modal';
import { ConfirmDelete, RowActions, EmptyState, useModalState } from '../components/UIHelpers';

const emptyForm: NewEquipment = {
  turntableModel: '',
  tonearmModel: '',
  cartridgeModel: '',
  targetForceMin: 1.8,
  targetForceMax: 2.2,
  installDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function EquipmentPage() {
  const equipments = useAppStore((s) => s.equipments);
  const calibrations = useAppStore((s) => s.calibrations);
  const listeningTests = useAppStore((s) => s.listeningTests);
  const addEquipment = useAppStore((s) => s.addEquipment);
  const updateEquipment = useAppStore((s) => s.updateEquipment);
  const deleteEquipment = useAppStore((s) => s.deleteEquipment);
  const getCalibrationsByEquipment = useAppStore((s) => s.getCalibrationsByEquipment);
  const getTestsByEquipment = useAppStore((s) => s.getTestsByEquipment);
  const generateAlerts = useAppStore((s) => s.generateAlerts);

  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<NewEquipment>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formModal = useModalState();
  const deleteModal = useModalState();
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);

  const filtered = useMemo(() => {
    const kw = search.toLowerCase();
    if (!kw) return equipments;
    return equipments.filter(
      (e) =>
        e.turntableModel.toLowerCase().includes(kw) ||
        e.tonearmModel.toLowerCase().includes(kw) ||
        e.cartridgeModel.toLowerCase().includes(kw)
    );
  }, [equipments, search]);

  const alertsByEquipment = useMemo(() => {
    const map: Record<string, { danger: number; warning: number }> = {};
    generateAlerts().forEach((a) => {
      if (!map[a.equipmentId]) map[a.equipmentId] = { danger: 0, warning: 0 };
      map[a.equipmentId][a.severity]++;
    });
    return map;
  }, [equipments, calibrations, listeningTests, generateAlerts]);

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    formModal.openModal();
  };

  const openEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setFormData({
      turntableModel: eq.turntableModel,
      tonearmModel: eq.tonearmModel,
      cartridgeModel: eq.cartridgeModel,
      targetForceMin: eq.targetForceMin,
      targetForceMax: eq.targetForceMax,
      installDate: eq.installDate,
      notes: eq.notes || '',
    });
    formModal.openModal();
  };

  const submit = () => {
    if (!formData.turntableModel || !formData.tonearmModel || !formData.cartridgeModel) {
      alert('请填写完整的设备型号信息');
      return;
    }
    if (editingId) {
      updateEquipment(editingId, formData);
    } else {
      addEquipment(formData);
    }
    formModal.closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-oak-400" />
          <input
            type="text"
            placeholder="搜索唱机/唱臂/唱头型号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-5 h-5" />
          新增设备组合
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Disc3 className="w-8 h-8" />}
            title="暂无设备记录"
            description="点击右上角按钮，录入第一台唱机/唱臂/唱头组合的基础信息和目标针压范围"
            action={
              <button onClick={openAdd} className="btn-primary">
                <Plus className="w-4 h-4" /> 新增设备
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filtered.map((eq) => {
            const alerts = alertsByEquipment[eq.id];
            const calCount = getCalibrationsByEquipment(eq.id).length;
            const testCount = getTestsByEquipment(eq.id).length;
            const statusBadge = alerts?.danger ? (
              <span className="badge badge-danger">需要维护</span>
            ) : alerts?.warning ? (
              <span className="badge badge-warning">建议检查</span>
            ) : (
              <span className="badge badge-success">状态正常</span>
            );

            return (
              <div key={eq.id} className="card hover:shadow-vinyl transition-shadow duration-300">
                <div className="card-header flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-oak-700 to-oak-800 flex items-center justify-center shadow-lg shrink-0">
                      <Disc3 className="w-8 h-8 text-brass-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-serif text-lg font-bold text-oak-800 truncate">
                          {eq.cartridgeModel}
                        </h3>
                        {statusBadge}
                      </div>
                      <p className="text-sm text-oak-600">
                        <span className="text-ink-400">唱机：</span>
                        {eq.turntableModel}
                      </p>
                      <p className="text-sm text-oak-600">
                        <span className="text-ink-400">唱臂：</span>
                        {eq.tonearmModel}
                      </p>
                    </div>
                  </div>
                  <RowActions onEdit={() => openEdit(eq)} onDelete={() => { setDeleteTarget(eq); deleteModal.openModal(); }} />
                </div>

                <div className="card-body">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-brass-50/50 border border-brass-100">
                      <div className="flex items-center gap-1 text-xs text-oak-500 mb-1">
                        <Target className="w-3.5 h-3.5" />
                        目标针压
                      </div>
                      <p className="font-bold text-oak-800">
                        {eq.targetForceMin} ~ {eq.targetForceMax}
                        <span className="text-xs font-normal text-ink-400 ml-1">mN</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-forest-50/50 border border-forest-100">
                      <div className="flex items-center gap-1 text-xs text-oak-500 mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        校准次数
                      </div>
                      <p className="font-bold text-oak-800">
                        {calCount}
                        <span className="text-xs font-normal text-ink-400 ml-1">次</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-oak-50 border border-oak-100">
                      <div className="flex items-center gap-1 text-xs text-oak-500 mb-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        安装日期
                      </div>
                      <p className="font-bold text-oak-800 text-sm">
                        {eq.installDate}
                      </p>
                    </div>
                  </div>

                  {eq.notes && (
                    <div className="p-3 rounded-xl bg-oak-50/50 border border-oak-100">
                      <p className="text-xs text-ink-400 mb-1">备注</p>
                      <p className="text-sm text-oak-700">{eq.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-oak-50 flex items-center justify-between text-sm">
                    <span className="text-ink-400">试听记录：{testCount} 次</span>
                    {(alerts?.danger || alerts?.warning) && (
                      <div className="flex gap-1.5">
                        {alerts.danger > 0 && (
                          <span className="badge badge-danger">严重 {alerts.danger}</span>
                        )}
                        {alerts.warning > 0 && (
                          <span className="badge badge-warning">注意 {alerts.warning}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={formModal.open}
        onClose={formModal.closeModal}
        title={editingId ? '编辑设备组合' : '新增设备组合'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">唱机型号 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：Technics SL-1200GR"
              value={formData.turntableModel}
              onChange={(e) => setFormData({ ...formData, turntableModel: e.target.value })}
            />
          </div>
          <div>
            <label className="label">唱臂型号 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：Technics S-shaped Tonearm"
              value={formData.tonearmModel}
              onChange={(e) => setFormData({ ...formData, tonearmModel: e.target.value })}
            />
          </div>
          <div>
            <label className="label">唱头型号 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：Ortofon 2M Blue"
              value={formData.cartridgeModel}
              onChange={(e) => setFormData({ ...formData, cartridgeModel: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">目标针压下限 (mN)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={formData.targetForceMin}
                onChange={(e) => setFormData({ ...formData, targetForceMin: +e.target.value })}
              />
            </div>
            <div>
              <label className="label">目标针压上限 (mN)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={formData.targetForceMax}
                onChange={(e) => setFormData({ ...formData, targetForceMax: +e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">安装日期</label>
            <input
              type="date"
              className="input-field"
              value={formData.installDate}
              onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="可选：设备特性、使用场景等..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={formModal.closeModal} className="btn-secondary">
              取消
            </button>
            <button onClick={submit} className="btn-primary">
              {editingId ? '保存修改' : '创建设备'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDelete
        open={deleteModal.open}
        onClose={deleteModal.closeModal}
        onConfirm={() => deleteTarget && deleteEquipment(deleteTarget.id)}
        title="删除设备组合"
        message={`确定要删除唱头「${deleteTarget?.cartridgeModel}」吗？关联的校准记录和试听数据也将一并删除，此操作不可撤销。`}
      />
    </div>
  );
}
