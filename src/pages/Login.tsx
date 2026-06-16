import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sofa, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useToast } from '../components/Toast';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      showToast('warning', '请输入工号');
      return;
    }

    setLoading(true);
    try {
      const result = await login(employeeId.trim());
      if (result.success) {
        showToast('success', '登录成功');
        navigate('/');
      } else {
        showToast('error', result.message || '登录失败');
      }
    } catch {
      showToast('error', '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-[fadeInUp_0.5s_ease-out]">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <Sofa className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">午休躺椅管理系统</h1>
          <p className="text-gray-500">请输入工号登录</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                工号
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="请输入工号，如 E001 或 ADMIN001"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30"
            >
              <LogIn className="w-5 h-5" />
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              测试账号：E001-E010（员工），ADMIN001（行政）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
