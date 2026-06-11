import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  DollarSign,
  Save,
  CheckCircle2,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useAppStore } from '../store/useAppStore';
import { getToday, addDays, formatMoney } from '../utils';

export default function LoanNew() {
  const navigate = useNavigate();
  const { devices, customers, employees, addLoan } = useAppStore();

  const availableDevices = devices.filter((d) => d.status === 'available');

  const [formData, setFormData] = useState({
    deviceId: '',
    customerId: '',
    employeeId: 'emp-3',
    loanDate: getToday(),
    expectedReturnDate: addDays(getToday(), 7),
    deposit: 0,
    notes: '',
  });

  const [selectedAccessories, setSelectedAccessories] = useState<
    { accessoryId: string; name: string; quantity: number; checked: boolean }[]
  >([]);

  const selectedDevice = devices.find((d) => d.id === formData.deviceId);

  const handleDeviceChange = (deviceId: string) => {
    setFormData((prev) => ({ ...prev, deviceId }));
    const device = devices.find((d) => d.id === deviceId);
    if (device) {
      setSelectedAccessories(
        device.accessories.map((acc) => ({
          accessoryId: acc.id,
          name: acc.name,
          quantity: acc.quantity,
          checked: true,
        }))
      );
      setFormData((prev) => ({
        ...prev,
        deposit: Math.floor(Math.random() * 3000) + 1000,
      }));
    } else {
      setSelectedAccessories([]);
    }
  };

  const handleAccessoryToggle = (index: number) => {
    setSelectedAccessories((prev) =>
      prev.map((acc, i) => (i === index ? { ...acc, checked: !acc.checked } : acc))
    );
  };

  const handleSubmit = () => {
    if (!formData.deviceId || !formData.customerId) {
      alert('请选择样机和客户');
      return;
    }

    const accessories = selectedAccessories
      .filter((a) => a.checked)
      .map((a) => ({
        accessoryId: a.accessoryId,
        name: a.name,
        quantity: a.quantity,
      }));

    addLoan({
      deviceId: formData.deviceId,
      customerId: formData.customerId,
      employeeId: formData.employeeId,
      loanDate: formData.loanDate,
      expectedReturnDate: formData.expectedReturnDate,
      deposit: formData.deposit,
      notes: formData.notes,
      accessories,
    });

    navigate('/loans');
  };

  return (
    <PageContainer title="新建借出" subtitle="登记新的样机借出记录">
      <button
        onClick={() => navigate('/loans')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回借出列表
      </button>

      <div className="max-w-3xl">
        {/* 选择样机 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-600" />
            </div>
            选择样机
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {availableDevices.length === 0 ? (
              <p className="col-span-2 text-gray-400 text-center py-8">暂无可借出的样机</p>
            ) : (
              availableDevices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => handleDeviceChange(device.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.deviceId === device.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{device.name}</span>
                    {formData.deviceId === device.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{device.model}</p>
                  <p className="text-xs text-gray-400 mt-1">{device.deviceNo}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    配件: {device.accessories.length} 件
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 配件确认 */}
        {selectedDevice && selectedAccessories.length > 0 && (
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-600" />
              </div>
              配件清单确认
            </h3>

            <p className="text-sm text-gray-500 mb-4">请确认借出时附带的配件</p>

            <div className="space-y-2">
              {selectedAccessories.map((acc, index) => (
                <div
                  key={acc.accessoryId}
                  onClick={() => handleAccessoryToggle(index)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                    acc.checked
                      ? 'bg-success-50 border border-success-200'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        acc.checked
                          ? 'bg-success-500 border-success-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {acc.checked && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{acc.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">× {acc.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 客户信息 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            客户信息
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="label-base">客户 <span className="text-danger-500">*</span></label>
              <select
                value={formData.customerId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customerId: e.target.value }))
                }
                className="input-base"
              >
                <option value="">请选择客户</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.company}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 借出信息 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary-600" />
            </div>
            借出信息
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-base">借出日期</label>
              <input
                type="date"
                value={formData.loanDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, loanDate: e.target.value }))
                }
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">预计归还日期</label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expectedReturnDate: e.target.value }))
                }
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">押金金额</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deposit: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input-base pl-8"
                />
              </div>
            </div>

            <div>
              <label className="label-base">负责人</label>
              <select
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, employeeId: e.target.value }))
                }
                className="input-base"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="label-base">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="可选，填写借出用途等信息"
                rows={3}
                className="input-base resize-none"
              />
            </div>
          </div>
        </div>

        {/* 汇总信息 */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-6 mb-6">
          <h4 className="font-medium text-gray-800 mb-3">借出信息汇总</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">样机:</span>
              <span className="ml-2 font-medium text-gray-800">
                {selectedDevice?.name || '未选择'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">配件:</span>
              <span className="ml-2 font-medium text-gray-800">
                {selectedAccessories.filter((a) => a.checked).length} 件
              </span>
            </div>
            <div>
              <span className="text-gray-500">押金:</span>
              <span className="ml-2 font-medium text-primary-700">
                {formatMoney(formData.deposit)}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate('/loans')} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            确认借出
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
