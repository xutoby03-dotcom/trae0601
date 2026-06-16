import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, Store } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardContent, useToast } from '@/components/ui';
import { useUserStore } from '@/stores/useUserStore';
import type { SelectOption } from '@/components/ui';
import type { UserRole } from '@/types';

const roleOptions: SelectOption[] = [
  { value: 'manager', label: '店长' },
  { value: 'staff', label: '店员' },
];

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login, loading, error, clearError } = useUserStore();

  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [usernameError, setUsernameError] = useState('');

  const validateForm = () => {
    let valid = true;
    if (!username.trim()) {
      setUsernameError('请输入用户名');
      valid = false;
    } else if (username.trim().length < 2) {
      setUsernameError('用户名至少2个字符');
      valid = false;
    } else {
      setUsernameError('');
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const user = await login(username.trim(), role);
    if (user) {
      showToast.success(`欢迎回来，${user.username}`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptLTYgNmgtdjRoNHY0em0wLTZoLTR2LTRoNHY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <Store className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">户外桌椅管理系统</h1>
          <p className="text-gray-500 mt-1">请登录以继续</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="h-4 w-4" />}
              error={usernameError}
              autoComplete="username"
            />

            <Select
              label="角色"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={roleOptions}
              placeholder="请选择角色"
            />

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              icon={<LogIn className="h-4 w-4" />}
              className="w-full"
            >
              登录
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            首次登录将自动创建账号
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
