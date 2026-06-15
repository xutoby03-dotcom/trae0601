import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAppStore } from '../store';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Layout() {
  const { loading, error, setError } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <Navbar />
      
      {loading && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          <span className="text-slate-600">处理中...</span>
        </div>
      )}
      
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
