import { useState } from 'react';
import { Delivery } from '@/types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { defaultRooms } from '@/utils/helpers';
import { ImagePlus, X, PackageX } from 'lucide-react';

interface DeliveryFormProps {
  materialId: string;
  orderQuantity: number;
  receivedSoFar: number;
  onSubmit: (data: {
    delivery: Omit<Delivery, 'id' | 'createdAt'>;
    wrongDelivery: { isWrong: boolean; note: string };
  }) => void;
  onCancel: () => void;
}

const DeliveryForm = ({
  materialId,
  orderQuantity,
  receivedSoFar,
  onSubmit,
  onCancel,
}: DeliveryFormProps) => {
  const remaining = orderQuantity - receivedSoFar;

  const [formData, setFormData] = useState({
    deliveryDate: new Date().toISOString().split('T')[0],
    receivedQuantity: remaining > 0 ? Math.min(remaining, 10) : 0,
    damagedQuantity: 0,
    storageRoom: '',
    receiver: '',
    photo: '',
    remark: '',
    isWrongDelivery: false,
    wrongDeliveryNote: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'receivedQuantity' || name === 'damagedQuantity'
          ? Number(value)
          : value,
    }));

    if (name === 'wrongDeliveryNote') {
      if (value.trim()) {
        setError(null);
      }
    }
    if (name === 'isWrongDelivery') {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedNote = formData.wrongDeliveryNote.trim();

    if (formData.isWrongDelivery && !trimmedNote) {
      setError('请填写错发说明');
      return;
    }

    onSubmit({
      delivery: {
        materialId,
        deliveryDate: formData.deliveryDate,
        receivedQuantity: formData.receivedQuantity,
        damagedQuantity: formData.damagedQuantity,
        storageRoom: formData.storageRoom,
        receiver: formData.receiver,
        photo: formData.photo,
        remark: formData.remark,
      },
      wrongDelivery: {
        isWrong: formData.isWrongDelivery,
        note: trimmedNote,
      },
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photo: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-teal-50 rounded-lg">
        <p className="text-sm text-teal-700">
          已到货 <span className="font-semibold">{receivedSoFar}</span> /
          订购 <span className="font-semibold">{orderQuantity}</span>，
          还差 <span className="font-semibold">{Math.max(0, remaining)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="到货日期"
          name="deliveryDate"
          type="date"
          value={formData.deliveryDate}
          onChange={handleChange}
          required
        />

        <Input
          label="实收数量"
          name="receivedQuantity"
          type="number"
          min="0"
          value={formData.receivedQuantity}
          onChange={handleChange}
          required
        />

        <Input
          label="破损数量"
          name="damagedQuantity"
          type="number"
          min="0"
          value={formData.damagedQuantity}
          onChange={handleChange}
        />

        <div className="col-span-2">
          <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group">
            <input
              type="checkbox"
              name="isWrongDelivery"
              checked={formData.isWrongDelivery}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <PackageX className={`w-4 h-4 ${formData.isWrongDelivery ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${formData.isWrongDelivery ? 'text-purple-700' : 'text-gray-700'}`}>
                  送错型号/规格
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">勾选后将自动创建错发售后工单</p>
            </div>
          </label>
          <style>{`
            label:has(input[name="isWrongDelivery"]:checked) {
              border-color: rgb(168 85 247);
              background-color: rgb(250 245 255);
            }
            label:has(input[name="isWrongDelivery"]:not(:checked)) {
              border-color: rgb(229 231 235);
            }
            label:has(input[name="isWrongDelivery"]:not(:checked)):hover {
              border-color: rgb(168 85 247 / 0.5);
              background-color: rgb(250 245 255 / 0.5);
            }
          `}</style>
        </div>

        {formData.isWrongDelivery && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              错发说明 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="wrongDeliveryNote"
              value={formData.wrongDeliveryNote}
              onChange={handleChange}
              rows={2}
              placeholder="请说明送错的具体情况，如：订购800x800mm，实际送来600x600mm..."
              required
              className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-purple-50/30 ${
                error ? 'border-red-400' : 'border-purple-300'
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {error}
              </p>
            )}
          </div>
        )}

        <Select
          label="存放房间"
          name="storageRoom"
          value={formData.storageRoom}
          onChange={handleChange}
        >
          <option value="">请选择房间</option>
          {defaultRooms.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </Select>

        <Input
          label="签收人"
          name="receiver"
          value={formData.receiver}
          onChange={handleChange}
          placeholder="如：张师傅"
          className="col-span-2"
        />

        <div className="col-span-2">
          {formData.photo ? (
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={formData.photo}
                alt="到货照片"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
              <ImagePlus className="w-7 h-7 text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">上传到货照片</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            备注
          </label>
          <textarea
            name="remark"
            value={formData.remark}
            onChange={handleChange}
            rows={2}
            placeholder="填写到货备注..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {formData.damagedQuantity > 0 && (
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠️ 提示：有破损商品，建议提交后创建售后工单
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">确认到货</Button>
      </div>
    </form>
  );
};

export default DeliveryForm;
