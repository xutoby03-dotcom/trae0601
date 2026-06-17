import { ReactNode } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  showAdd?: boolean;
  addAction?: () => void;
  searchAction?: () => void;
  hideBottomNav?: boolean;
}

export default function Layout({ 
  children, 
  title, 
  showBack, 
  showSearch, 
  showAdd, 
  addAction,
  searchAction,
  hideBottomNav 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      <Navbar 
        title={title} 
        showBack={showBack} 
        showSearch={showSearch}
        showAdd={showAdd}
        addAction={addAction}
        searchAction={searchAction}
      />
      <main className="max-w-lg mx-auto px-4 py-4">
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
