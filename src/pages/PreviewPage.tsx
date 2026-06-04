import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { loadPublishedForm } from '../hooks/useLocalStorage';
import { FormRenderer } from '../components/preview/FormRenderer';
import type { FormData } from '../types/form';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const formData = id ? (loadPublishedForm(id) as FormData | null) : null;

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">表单不存在</h2>
          <p className="text-gray-500 mb-6">该表单链接无效或已过期</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft size={18} />
            返回编辑器
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">返回编辑器</span>
        </Link>
      </div>
      <FormRenderer formData={formData} />
    </div>
  );
}
