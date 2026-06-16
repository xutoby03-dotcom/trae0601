import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, User, AlertCircle, Cable } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface LoginForm {
  employeeNo: string;
  password: string;
}

export default function AdminLogin() {
  const { login, currentUser, initApp, employees } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: {
      employeeNo: '',
      password: '',
    },
  });

  useEffect(() => {
    const init = async () => {
      await initApp();
      setIsLoading(false);
    };
    init();
  }, [initApp]);

  useEffect(() => {
    if (currentUser) {
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location.state]);

  const onSubmit = async (data: LoginForm) => {
    setError('');
    const user = await login(data.employeeNo, data.password);

    if (!user) {
      setError('工号或密码错误');
      return;
    }

    if (!user.isAdmin) {
      setError('该账号没有管理员权限');
      return;
    }

    const from = (location.state as { from?: string })?.from || '/statistics';
    navigate(from, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const adminEmployees = employees.filter(e => e.isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Cable className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">管理员登录</h1>
          <p className="text-gray-500 mt-2">共享充电线管理系统</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                员工工号
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('employeeNo', { required: '请输入员工工号' })}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-colors',
                    errors.employeeNo
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  )}
                  placeholder="请输入员工工号"
                />
              </div>
              {errors.employeeNo && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.employeeNo.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理员密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  {...register('password', { required: '请输入密码' })}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-colors',
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  )}
                  placeholder="请输入管理员密码"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
            >
              {isSubmitting ? '登录中...' : '登录'}
            </button>
          </form>

          {adminEmployees.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3">演示账号（管理员）：</p>
              <div className="space-y-2">
                {adminEmployees.map(emp => (
                  <div key={emp.id} className="bg-gray-50 rounded-lg px-3 py-2 text-xs">
                    <p className="font-medium text-gray-700">{emp.name} ({emp.department})</p>
                    <p className="text-gray-500">工号: {emp.employeeNo} | 密码: admin123</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              返回首页
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2025 共享充电线管理系统
        </p>
      </div>
    </div>
  );
}
