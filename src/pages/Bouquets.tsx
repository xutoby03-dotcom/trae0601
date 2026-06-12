import PageHeader from '@/components/layout/PageHeader';
import BouquetGrid from '@/components/bouquet/BouquetGrid';
import { Plus } from 'lucide-react';

export default function Bouquets() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="花束看板" 
        subtitle="浏览所有在售花束，快速创建预留"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all shadow-md shadow-rose-200/50">
            <Plus className="w-4 h-4" />
            新增花束
          </button>
        }
      />
      
      <div className="flex-1 p-8 bg-cream-50">
        <BouquetGrid />
      </div>
    </div>
  );
}
