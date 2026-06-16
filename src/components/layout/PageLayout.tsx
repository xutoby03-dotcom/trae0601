import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageLayout({ children, title, subtitle, actions }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {(title || actions) && (
          <header className="bg-white/70 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-10">
            <div className="px-8 py-5 flex items-center justify-between">
              <div>
                {title && (
                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-2xl font-bold text-forest-800"
                  >
                    {title}
                  </motion.h1>
                )}
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-gray-500 mt-1"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
              {actions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  {actions}
                </motion.div>
              )}
            </div>
          </header>
        )}
        <div className="flex-1 overflow-auto scrollbar-thin">
          <div className="px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
