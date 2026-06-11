import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Ticket, BarChart3, Music } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/plans', icon: Calendar, label: '演出计划' },
  { path: '/team', icon: Users, label: '分工管理' },
  { path: '/tickets', icon: Ticket, label: '抢票录入' },
  { path: '/stats', icon: BarChart3, label: '统计分析' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-cyber-black/80 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Music className="w-8 h-8 text-neon-pink" />
                <div className="absolute -inset-1 bg-neon-pink/20 rounded-full blur-md -z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-orbitron bg-clip-text text-transparent bg-neon-gradient">
                  抢票助手
                </h1>
                <p className="text-xs text-gray-400">Concert Ticket Coordination</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2',
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-pink"
                      />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-cyber-black/90 border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300',
                  isActive ? 'text-neon-pink' : 'text-gray-500'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-neon-pink"
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Padding */}
      <div className="md:hidden h-20" />
    </div>
  );
}
