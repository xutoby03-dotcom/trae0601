import { useMemo, useState } from 'react';
import { Plus, Headphones, Search, Filter, Disc, ArrowLeftRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ListeningTest, NewListeningTest } from '../types';
import Modal from '../components/Modal';
import {
  ConfirmDelete,
  RowActions,
  EmptyState,
  useModalState,
  JumpLevelPicker,
  SibilanceLevelPicker,
  LevelBadge,
} from '../components/UIHelpers';

const emptyForm: NewListeningTest = {
  equipmentId: '',
  calibrationId: '',
  testDate: new Date().toISOString().slice(0, 10),
  jumpLevel: 0,
  sibilanceLevel: 0,
  leftChannelDb: -3.0,
  rightChannelDb: -3.0,
  recordName: '',
  notes: '',
};

export default function ListeningPage() {
  const listeningTests = useAppStore((s) => s.listeningTests);
  const equipments = useAppStore((s) => s.equipments);
  const addListeningTest = useAppStore((s) => s.addListeningTest);
  const updateListeningTest = useAppStore((s) => s.updateListeningTest);
  const deleteListeningTest = useAppStore((s) => s.deleteListeningTest);
  const getEquipmentName = useAppStore((s) => s.getEquipmentName);
  const getCalibrationsByEquipment = useAppStore((s) => s.getCalibrationsByEquipment);

  const [search, setSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [formData, setFormData] = useState<NewListeningTest>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formModal = useModalState();
  const deleteModal = useModalState();
  const [deleteTarget, setDeleteTarget] = useState<ListeningTest | null>(null);

  const calibrationsForForm = useMemo(
    () => (formData.equipmentId ? getCalibrationsByEquipment(formData.equipmentId) : []),
    [formData.equipmentId, getCalibrationsByEquipment]
  );

  const filtered = useMemo(() => {
    let list = listeningTests.slice().sort((a, b) => b.testDate.localeCompare(a.testDate));
    if (equipmentFilter !== 'all') {
      list = list.filter((t) => t.equipmentId === equipmentFilter);
    }
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter((t) => {
        const eqName = getEquipmentName(t.equipmentId).toLowerCase();
        return (
          eqName.includes(kw) ||
          (t.recordName?.toLowerCase().includes(kw) ?? false) ||
          (t.notes?.toLowerCase().includes(kw) ?? false)
        );
      });
    }
    return list;
  }, [listeningTests, equipmentFilter, search, getEquipmentName]);

  const openAdd = () => {
    setEditingId(null);
    const defaultEq = equipments[0];
    const cals = defaultEq ? getCalibrationsByEquipment(defaultEq.id) : [];
    setFormData({
      ...emptyForm,
      equipmentId: defaultEq?.id || '',
      calibrationId: cals[0]?.id || '',
    });
    formModal.openModal();
  };

  const openEdit = (t: ListeningTest) => {
    setEditingId(t.id);
    setFormData({
      equipmentId: t.equipmentId,
      calibrationId: t.calibrationId,
      testDate: t.testDate,
      jumpLevel: t.jumpLevel,
      sibilanceLevel: t.sibilanceLevel,
      leftChannelDb: t.leftChannelDb,
      rightChannelDb: t.rightChannelDb,
      recordName: t.recordName || '',
      notes: t.notes || '',
    });
    formModal.openModal();
  };

  const submit = () => {
    if (!formData.equipmentId || !formData.calibrationId) {
      alert('请选择设备和关联的校准记录');
      return;
    }
    if (editingId) {
      updateListeningTest(editingId, formData);
    } else {
      addListeningTest(formData);
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
              placeholder="搜索设备/唱片/备注..."
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
        <button
          onClick={openAdd}
          className="btn-primary"
          disabled={equipments.length === 0 || listeningTests.length < 0}
        >
          <Plus className="w-5 h-5" />
          新增试听记录
        </button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Headphones className="w-8 h-8" />}
            title="暂无试听记录"
            description="试听后录入跳针、齿音和左右声道情况，用于跟踪设备状态"
            action={
              equipments.length === 0 ? null : (
                <button onClick={openAdd} className="btn-primary">
                  <Plus className="w-4 h-4" /> 新增试听
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>试听日期</th>
                  <th>设备组合</th>
                  <th>试听唱片</th>
                  <th>跳针</th>
                  <th>齿音</th>
                  <th>左声道</th>
                  <th>右声道</th>
                  <th>声道差</th>
                  <th>备注</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const channelDiff = Math.abs(t.leftChannelDb - t.rightChannelDb);
                  const channelBadge =
                    channelDiff > 3 ? (
                      <span className="badge badge-danger">{channelDiff.toFixed(1)} dB</span>
                    ) : channelDiff > 2 ? (
                      <span className="badge badge-warning">{channelDiff.toFixed(1)} dB</span>
                    ) : (
                      <span className="badge badge-success">{channelDiff.toFixed(1)} dB</span>
                    );
                  return (
                    <tr key={t.id}>
                      <td className="font-medium text-oak-700">{t.testDate}</td>
                      <td>
                        <p className="font-medium text-oak-800 truncate min-w-[180px]">
                          {getEquipmentName(t.equipmentId)}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Disc className="w-4 h-4 text-brass-500" />
                          <span className="truncate max-w-[160px]" title={t.recordName}>
                            {t.recordName || '-'}
                          </span>
                        </div>
                      </td>
                      <td><LevelBadge value={t.jumpLevel} type="jump" /></td>
                      <td><LevelBadge value={t.sibilanceLevel} type="sibilance" /></td>
                      <td className="font-mono text-oak-700">{t.leftChannelDb.toFixed(1)} dB</td>
                      <td className="font-mono text-oak-700">{t.rightChannelDb.toFixed(1)} dB</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <ArrowLeftRight className="w-3.5 h-3.5 text-ink-400" />
                          {channelBadge}
                        </div>
                      </td>
                      <td>
                        <div className="max-w-[180px] truncate text-ink-500" title={t.notes}>
                          {t.notes || '-'}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end">
                          <RowActions
                            onEdit={() => openEdit(t)}
                            onDelete={() => { setDeleteTarget(t); deleteModal.openModal(); }}
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
        title={editingId ? '编辑试听记录' : '新增试听记录'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">选择设备 *</label>
              <select
                className="select-field"
                value={formData.equipmentId}
                onChange={(e) => {
                  const cals = e.target.value ? getCalibrationsByEquipment(e.target.value) : [];
                  setFormData({
                    ...formData,
                    equipmentId: e.target.value,
                    calibrationId: cals[0]?.id || '',
                  });
                }}
              >
                <option value="">-- 请选择设备 --</option>
                {equipments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.turntableModel} / {e.cartridgeModel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">关联校准记录 *</label>
              <select
                className="select-field"
                value={formData.calibrationId}
                onChange={(e) => setFormData({ ...formData, calibrationId: e.target.value })}
                disabled={!formData.equipmentId}
              >
                <option value="">-- 请选择校准 --</option>
                {calibrationsForForm.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.calibrationDate} · 针压{c.measuredForce}mN · 防滑{c.antiSkate}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">试听日期</label>
              <input
                type="date"
                className="input-field"
                value={formData.testDate}
                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">试听唱片</label>
              <input
                type="text"
                className="input-field"
                placeholder="例如：爵士名盘 Kind of Blue"
                value={formData.recordName}
                onChange={(e) => setFormData({ ...formData, recordName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">
              跳针情况 <span className="text-xs text-ink-400 font-normal ml-1">（0=无，5=严重）</span>
            </label>
            <JumpLevelPicker
              value={formData.jumpLevel}
              onChange={(v) => setFormData({ ...formData, jumpLevel: v })}
            />
          </div>

          <div>
            <label className="label">
              齿音情况 <span className="text-xs text-ink-400 font-normal ml-1">（0=无，5=刺耳）</span>
            </label>
            <SibilanceLevelPicker
              value={formData.sibilanceLevel}
              onChange={(v) => setFormData({ ...formData, sibilanceLevel: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">左声道电平 (dB)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={formData.leftChannelDb}
                onChange={(e) => setFormData({ ...formData, leftChannelDb: +e.target.value })}
              />
            </div>
            <div>
              <label className="label">右声道电平 (dB)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={formData.rightChannelDb}
                onChange={(e) => setFormData({ ...formData, rightChannelDb: +e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">试听备注</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="记录具体听感、问题频段等..."
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
        onConfirm={() => deleteTarget && deleteListeningTest(deleteTarget.id)}
        title="删除试听记录"
        message="确定要删除此试听记录吗？"
      />
    </div>
  );
}
