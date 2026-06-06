import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-glass card-shadow border-gold border hover:shadow-lg transition-all"
      aria-label="切换主题"
    >
      {theme === 'dark' ? (
        <Sun className="w-6 h-6 text-gold" />
      ) : (
        <Moon className="w-6 h-6 text-gold" />
      )}
    </motion.button>
  );
}
