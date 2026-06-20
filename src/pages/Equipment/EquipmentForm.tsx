import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useEquipmentStore } from '../../store/equipmentStore';
import type { Equipment, EquipmentType, EquipmentStatus } from '../../types';
import { equipmentTypeLabels, equipmentStatusLabels } from '../../types';

interface FormData {
  type: EquipmentType;
  brand: string;
  model: string;
  ownerId: string;
  firmwareVersion: string;
  purchaseDate: string;
  status: EquipmentStatus;
  notes: string;
  photo: string;
}

export function EquipmentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new';
  const { equipment, users, addEquipment, updateEquipment } = useEquipmentStore();

  const existingEquipment = isEdit ? equipment.find(e => e.id === id) : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: existingEquipment
      ? {
          type: existingEquipment.type,
          brand: existingEquipment.brand,
          model: existingEquipment.model,
          ownerId: existingEquipment.ownerId,
          firmwareVersion: existingEquipment.firmwareVersion || '',
          purchaseDate: existingEquipment.purchaseDate || '',
          status: existingEquipment.status,
          notes: existingEquipment.notes || '',
          photo: existingEquipment.photo || '',
        }
      : {
          type: 'camera',
          status: 'available',
        },
  });

  const onSubmit = (data: FormData) => {
    if (isEdit && existingEquipment) {
      updateEquipment(existingEquipment.id, data);
    } else {
      addEquipment(data as Omit<Equipment, 'id' | 'batteries' | 'memoryCards'>);
    }
    navigate('/equipment');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/equipment')}
          className="p-2 rounded-lg bg-background-lighter hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-neutral-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {isEdit ? '编辑器材' : '添加新器材'}
          </h1>
          <p className="text-neutral-400">
            {isEdit ? '更新器材信息' : '录入新的摄影器材'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">器材类型 *</label>
            <select {...register('type', { required: '请选择器材类型' })} className="input">
              {(Object.keys(equipmentTypeLabels) as EquipmentType[]).map((type) => (
                <option key={type} value={type}>
                  {equipmentTypeLabels[type]}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-xs text-danger mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label className="label">品牌 *</label>
            <input
              type="text"
              {...register('brand', { required: '请输入品牌' })}
              placeholder="例如: Sony, Canon, DJI"
              className="input"
            />
            {errors.brand && <p className="text-xs text-danger mt-1">{errors.brand.message}</p>}
          </div>

          <div>
            <label className="label">型号 *</label>
            <input
              type="text"
              {...register('model', { required: '请输入型号' })}
              placeholder="例如: A7 IV, EOS R6"
              className="input"
            />
            {errors.model && <p className="text-xs text-danger mt-1">{errors.model.message}</p>}
          </div>

          <div>
            <label className="label">拥有者 *</label>
            <select {...register('ownerId', { required: '请选择拥有者' })} className="input">
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {errors.ownerId && <p className="text-xs text-danger mt-1">{errors.ownerId.message}</p>}
          </div>

          <div>
            <label className="label">固件版本</label>
            <input
              type="text"
              {...register('firmwareVersion')}
              placeholder="例如: v2.00"
              className="input"
            />
          </div>

          <div>
            <label className="label">购买日期</label>
            <input
              type="date"
              {...register('purchaseDate')}
              className="input"
            />
          </div>

          <div>
            <label className="label">状态 *</label>
            <select {...register('status', { required: '请选择状态' })} className="input">
              {(Object.keys(equipmentStatusLabels) as EquipmentStatus[]).map((status) => (
                <option key={status} value={status}>
                  {equipmentStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">照片 URL</label>
            <input
              type="url"
              {...register('photo')}
              placeholder="https://..."
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">备注</label>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="添加器材相关的备注信息..."
            className="input resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700/50">
          <button
            type="button"
            onClick={() => navigate('/equipment')}
            className="btn-ghost"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {isEdit ? '保存修改' : '添加器材'}
          </button>
        </div>
      </form>
    </div>
  );
}
