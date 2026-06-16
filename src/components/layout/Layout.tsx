import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/store/useAppStore';
import { Loader2, Lock } from 'lucide-react';

interface LayoutProps {
  children?: ReactNode;
  requireAdmin?: boolean;
}

export const Layout = ({ children, requireAdmin = false }: LayoutProps) => {
  const { isLoading, currentUser, initApp } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && requireAdmin && (!currentUser || !currentUser.isAdmin)) {
      navigate('/admin-login', { state: { from: location.pathname } });
    }
  }, [isLoading, requireAdmin, currentUser, navigate, location.pathname]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">正在加载数据...</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && (!currentUser || !currentUser.isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">正在跳转登录页...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
