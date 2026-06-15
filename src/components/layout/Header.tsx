import { NavLink, useNavigate } from 'react-router-dom';
import { Package, History, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onNewOrder?: () => void;
}

export default function Header({ onNewOrder }: HeaderProps) {
  const navigate = useNavigate();

  const handleNewOrder = () => {
    if (onNewOrder) {
      onNewOrder();
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="font-serif text-xl font-bold text-primary-800">海淘分摊助手</h1>
              <p className="text-xs text-neutral-500">轻松拆账，快乐海淘</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`
              }
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">订单列表</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`
              }
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">未结清</span>
            </NavLink>

            {onNewOrder && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewOrder}
                className="btn-primary flex items-center gap-2 ml-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">新建订单</span>
              </motion.button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
