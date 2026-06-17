import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/context/authStore';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if ((username === 'admin' && password === 'admin123') || 
        (username === 'registrar' && password === 'registrar123')) {
      login(username === 'admin' ? 'admin' : 'registrar');
      navigate('/admin');
    } else {
      setError('用户名或密码错误');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A90D9] to-[#5DA3E5] p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'ZCOOL XiaoWei, serif' }}>
              管理后台登录
            </h1>
            <p className="text-white/80 text-sm">雨伞招领墙管理系统</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Input
              label="用户名"
              icon={<User className="w-5 h-5" />}
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            <Input
              label="密码"
              icon={<Lock className="w-5 h-5" />}
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button className="w-full" size="lg" type="submit" isLoading={isLoading}>
              登录
            </Button>

            <div className="text-center text-sm text-gray-400 space-y-1">
              <p>管理员：admin / admin123</p>
              <p>登记员：registrar / registrar123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
