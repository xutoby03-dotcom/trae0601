import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Building2, Smartphone, Calendar, FileText, Info } from 'lucide-react';
import type { InterfaceType } from '@/types';
import { INTERFACE_TYPE_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { addHoursToNow, formatDateTime } from '@/utils/dateUtils';
import { StatusBadge } from '@/components/common/StatusBadge';

interface FormData {
  employeeName: string;
  employeeNo: string;
  department: string;
  device: string;
  expectedReturn: string;
  purpose: string;
}

const departments = ['研发部', '产品部', '设计部', '市场部', '行政部', '财务部', '人事部'];
const purposes = ['临时办公', '会议使用', '出差携带', '个人使用', '客户演示', '测试设备', '其他'];

export const BorrowForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCableById, borrowCable, employees, currentUser, borrowRecords } = useAppStore();
  
  const cable = id ? getCableById(id) : undefined;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: currentUser ? {
      employeeName: currentUser.name,
      employeeNo: currentUser.employeeNo,
      department: currentUser.department,
      device: '',
      expectedReturn: addHoursToNow(24).slice(0, 16),
      purpose: '',
    } : {
      employeeName: '',
      employeeNo: '',
      department: '',
      device: '',
      expectedReturn: addHoursToNow(24).slice(0, 16),
      purpose: '',
    },
  });

  const employeeNo = watch('employeeNo');

  const handleEmployeeChange = (value: string) => {
    const employee = employees.find(e => e.employeeNo === value);
    if (employee) {
      setValue('employeeName', employee.name);
      setValue('department', employee.department);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!cable || !id) return;

    const activeBorrows = borrowRecords.filter(
      r => r.employeeNo === data.employeeNo && r.status === 'borrowing'
    ).length;

    if (activeBorrows >= 2) {
      alert('您已有2条正在借用的线材，请先归还后再借用');
      return;
    }

    const result = borrowCable(id, {
      ...data,
      expectedReturn: new Date(data.expectedReturn).toISOString(),
    });

    if (result) {
      alert('借用成功！');
      navigate('/my-borrow');
    } else {
      alert('借用失败，请检查线材状态');
    }
  };

  if (!cable) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">线材不存在</h2>
        <button
          onClick={() => navigate('/borrow')}
          className="text-blue-600 hover:text-blue-700"
        >
          返回可借列表
        </button>
      </div>
    );
  }

  if (cable.status !== 'available') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">该线材当前不可借用</h2>
        <p className="text-gray-500 mb-4">
          当前状态：<StatusBadge status={cable.status} />
        </p>
        <button
          onClick={() => navigate('/borrow')}
          className="text-blue-600 hover:text-blue-700"
        >
          返回可借列表
        </button>
      </div>
    );
  }

  const interfaceColors: Record<string, string> = {
    'USB-C': 'bg-blue-100 text-blue-700',
    'Lightning': 'bg-purple-100 text-purple-700',
    'Micro-USB': 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/borrow')}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">借用申请</h1>
          <p className="text-sm text-gray-500">填写借用信息</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">借用线材</h2>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
            <img src={cable.photoUrl} alt={cable.code} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{cable.code}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${interfaceColors[cable.interfaceType]}`}>
                {INTERFACE_TYPE_LABELS[cable.interfaceType]}
              </span>
            </div>
            <p className="text-sm text-gray-500">{cable.power}W · {cable.length}m · {cable.defaultLocation}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">借用信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                工号 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('employeeNo', { 
                  required: '请选择工号',
                  onChange: (e) => handleEmployeeChange(e.target.value),
                })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">请选择工号</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.employeeNo}>
                    {emp.employeeNo} - {emp.name}
                  </option>
                ))}
              </select>
              {errors.employeeNo && (
                <p className="text-red-500 text-xs mt-1">{errors.employeeNo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                {...register('employeeName', { required: '请输入姓名' })}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                placeholder="选择工号后自动填充"
              />
              {errors.employeeName && (
                <p className="text-red-500 text-xs mt-1">{errors.employeeName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                部门
              </label>
              <input
                {...register('department')}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                placeholder="选择工号后自动填充"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                设备型号 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('device', { required: '请输入设备型号' })}
                placeholder="如: iPhone 15, MacBook Pro"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.device && (
                <p className="text-red-500 text-xs mt-1">{errors.device.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                预计归还时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('expectedReturn', { required: '请选择预计归还时间' })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.expectedReturn && (
                <p className="text-red-500 text-xs mt-1">{errors.expectedReturn.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                建议24小时内归还，逾期将收到提醒
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                用途 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {purposes.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setValue('purpose', p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      watch('purpose') === p
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                {...register('purpose', { required: '请选择或输入用途' })}
                placeholder="或手动输入用途..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.purpose && (
                <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/borrow')}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            确认借用
          </button>
        </div>
      </form>
    </div>
  );
};
