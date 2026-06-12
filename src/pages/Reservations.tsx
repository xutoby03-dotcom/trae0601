import PageHeader from '@/components/layout/PageHeader';
import ReservationList from '@/components/reservation/ReservationList';
import { Plus } from 'lucide-react';

export default function Reservations() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="预留管理" 
        subtitle="管理所有预留订单，处理取花、取消和改期"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all shadow-md shadow-rose-200/50">
            <Plus className="w-4 h-4" />
            新建预留
          </button>
        }
      />
      
      <div className="flex-1 p-8 bg-cream-50">
        <ReservationList />
      </div>
    </div>
  );
}
