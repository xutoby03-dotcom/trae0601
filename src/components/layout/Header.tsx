import { Car, Plus, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarpoolStore } from '@/store/useCarpoolStore';

export const Header = () => {
  const navigate = useNavigate();
  const currentUser = useCarpoolStore((state) => state.currentUser);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">邻里拼车</h1>
              <p className="text-xs text-gray-500">阳光花园小区</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {currentUser.isOwner && (
              <button
                onClick={() => navigate('/routes/publish')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">发布路线</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full border-2 border-orange-200"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser.isOwner ? '车主' : '乘客'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
