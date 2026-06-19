import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ArrowLeftRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '看板首页', icon: LayoutDashboard },
  { path: '/boxes', label: '纸箱档案', icon: Package },
  { path: '/borrow', label: '借还管理', icon: ArrowLeftRight },
  { path: '/friends', label: '朋友管理', icon: Users },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="hidden md:flex h-screen w-64 bg-card border-r border-border flex-col fixed left-0 top-0 z-40"
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">📦 纸箱回收系统</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2026 纸箱回收分配系统
        </p>
      </div>
    </motion.aside>
  );
}
