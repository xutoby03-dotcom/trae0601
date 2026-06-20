import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Package } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { equipmentTypeLabels } from '../../utils/helpers';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';
import type { MissionFormData, MissionEquipment } from '../../types';

export function MissionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { missions, createMission, updateMission, addEquipmentToMission } = useMissionStore();
  const { equipment, users } = useEquipmentStore();

  const mission = isEdit ? missions.find(m => m.id === id) : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MissionFormData>({
    defaultValues: isEdit && mission ? {
      name: mission.name,
      location: mission.location,
      startDate: mission.startDate,
      endDate: mission.endDate,
      leaderId: mission.leaderId,
      notes: mission.notes,
      status: mission.status,
    } : {
      status: 'draft',
    },
  });

  const selectedEquipment = watch('equipmentIds') || mission?.equipmentList.map(e => e.equipmentId) || [];

  const onSubmit = (data: MissionFormData) => {
    if (isEdit && mission) {
      updateMission(mission.id, {
        name: data.name,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        leaderId: data.leaderId,
        notes: data.notes,
        status: data.status,
      });

      const existingIds = mission.equipmentList.map(e => e.equipmentId);
      const newIds = (data.equipmentIds || []).filter(id => !existingIds.includes(id));
      newIds.forEach(equipmentId => {
        addEquipmentToMission(mission.id, equipmentId);
      });
    } else {
      const newMission = createMission({
        name: data.name,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        leaderId: data.leaderId,
        notes: data.notes,
        status: data.status || 'draft',
        equipmentList: [],
      });

      (data.equipmentIds || []).forEach(equipmentId => {
        addEquipmentToMission(newMission.id, equipmentId);
      });
    }

    navigate('/missions');
  };

  const toggleEquipment = (equipmentId: string) => {
    const current = selectedEquipment;
    if (current.includes(equipmentId)) {
      setValue('equipmentIds', current.filter(id => id !== equipmentId));
    } else {
      setValue('equipmentIds', [...current, equipmentId]);
    }
  };

  const availableEquipment = equipment.filter(e =>
    !['lost', 'damaged'].includes(e.status)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/missions')}
          className="p-2 rounded-lg bg-background-lighter hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-neutral-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? '编辑任务' : '创建任务'}
          </h1>
          <p className="text-neutral-400">填写任务信息并分配器材</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">基本信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">任务名称 *</label>
              <input
                {...register('name', { required: '请输入任务名称' })}
                className={`input ${errors.name ? 'border-danger' : ''}`}
                placeholder="如：张伟婚礼、三亚旅行"
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">拍摄地点 *</label>
              <input
                {...register('location', { required: '请输入拍摄地点' })}
                className={`input ${errors.location ? 'border-danger' : ''}`}
                placeholder="如：北京朝阳公园"
              />
              {errors.location && <span className="form-error">{errors.location.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">开始日期 *</label>
              <input
                type="date"
                {...register('startDate', { required: '请选择开始日期' })}
                className={`input ${errors.startDate ? 'border-danger' : ''}`}
              />
              {errors.startDate && <span className="form-error">{errors.startDate.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">结束日期 *</label>
              <input
                type="date"
                {...register('endDate', { required: '请选择结束日期' })}
                className={`input ${errors.endDate ? 'border-danger' : ''}`}
              />
              {errors.endDate && <span className="form-error">{errors.endDate.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">负责人 *</label>
              <select
                {...register('leaderId', { required: '请选择负责人' })}
                className={`input ${errors.leaderId ? 'border-danger' : ''}`}
              >
                <option value="">请选择</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              {errors.leaderId && <span className="form-error">{errors.leaderId.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">任务状态</label>
              <select
                {...register('status')}
                className="input"
                defaultValue="draft"
              >
                <option value="draft">草稿</option>
                <option value="packing">待打包</option>
                <option value="shooting">拍摄中</option>
                <option value="returning">待归还</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">任务备注</label>
            <textarea
              {...register('notes')}
              className="input min-h-[100px]"
              placeholder="记录拍摄要求、注意事项等..."
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              选择器材
              {selectedEquipment.length > 0 && (
                <span className="ml-2 text-sm font-normal text-primary">
                  已选择 {selectedEquipment.length} 件
                </span>
              )}
            </h2>
          </div>

          {availableEquipment.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              暂无可用器材
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableEquipment.map((eq, idx) => {
                const isSelected = selectedEquipment.includes(eq.id);
                const eqUser = users.find(u => u.id === eq.ownerId);
                return (
                  <div
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all animate-slide-up ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-background-lighter hover:border-neutral-700'
                    }`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary' : 'bg-neutral-800'
                      }`}>
                        <EquipmentTypeIcon
                          type={eq.type}
                          size={20}
                          className={isSelected ? 'text-white' : 'text-primary'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white truncate">
                            {eq.brand} {eq.model}
                          </h4>
                          {isSelected && <Plus size={14} className="text-primary rotate-45" />}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {equipmentTypeLabels[eq.type]} · {eqUser?.name || '未知'}
                        </p>
                        {eq.batteries && eq.batteries.length > 0 && (
                          <p className="text-xs text-neutral-500">
                            {eq.batteries.length} 块电池
                          </p>
                        )}
                        {eq.memoryCards && eq.memoryCards.length > 0 && (
                          <p className="text-xs text-neutral-500">
                            {eq.memoryCards.length} 张存储卡
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/missions')}
            className="btn-secondary"
          >
            取消
          </button>
          <button type="submit" className="btn-primary">
            {isEdit ? '保存修改' : '创建任务'}
          </button>
        </div>
      </form>
    </div>
  );
}
